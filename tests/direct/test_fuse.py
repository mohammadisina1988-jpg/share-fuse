import ast
import copy
import hashlib
import itertools
import json
import random
import re
from pathlib import Path
import pytest

ROOT = Path(__file__).resolve().parents[2]
FIELDS = json.loads((ROOT/'config/fields.json').read_text())
BODY = (ROOT/'policies/publication.json').read_bytes()
HASH = hashlib.sha256(BODY).hexdigest()
URL = 'https://raw.githubusercontent.com/mohammadisina1988-jpg/share-fuse/'+'a'*40+'/policies/publication.json'

def decisions():
    return [{'mask':m,'decision':'DENY' if m & 3 == 3 else 'UNKNOWN' if m & 12 == 12 else 'ALLOW','paragraph':2 if m & 3 == 3 else 3 if m & 12 == 12 else 1} for m in range(1,16)]

@pytest.fixture
def gate(direct_deploy):
    return direct_deploy(str(ROOT/'contracts/share_fuse.py'),URL,HASH,json.dumps(FIELDS))

def mock(vm, leader=None, own=None, audit=True, body=BODY):
    vm.clear_mocks()
    vm.mock_web(re.escape(URL),{'status':200,'body':body})
    vm.mock_llm(r'.*FUSE-LEADER.*',json.dumps({'decisions':decisions() if leader is None else leader}))
    vm.mock_llm(r'.*FUSE-VALIDATOR.*',json.dumps({'decisions':decisions() if own is None else own}))
    vm.mock_llm(r'.*FUSE-AUDIT.*',json.dumps({'valid':audit}))

def activate(gate,vm):
    mock(vm);gate.activate()

def test_policy_independently_validated_and_frozen(gate,direct_vm):
    activate(gate,direct_vm)
    assert direct_vm.run_validator() is True
    state=gate.get_state()
    assert state['compiled']['source']==json.loads(BODY)
    assert state['compiled']['decisions']==decisions()
    assert state['compiled']['lattice']['blockers']==[3,12]
    assert state['safe_frontier']==[5,6,9,10]
    with direct_vm.expect_revert('already immutable'):gate.activate()

def test_two_safe_singletons_become_forbidden_composition(gate,direct_vm):
    activate(gate,direct_vm)
    assert gate.quote(['codename'])['status']==gate.quote(['contact'])['status']=='ALLOW'
    gate.reserve(0,['codename'])
    before=gate.get_state()
    assert gate.quote(['contact'])=={'status':'DENY','current_mask':1,'requested_mask':2,'union_mask':3,'blockers':[{'mask':3,'decision':'DENY'}]}
    with direct_vm.expect_revert('Cumulative publication DENY'):gate.reserve(1,['contact'])
    assert gate.get_state()==before

def test_compare_and_swap_rejects_stale_preview(gate,direct_vm):
    activate(gate,direct_vm);gate.reserve(0,['codename'])
    before=gate.get_state()
    with direct_vm.expect_revert('Stale publication state'):gate.reserve(0,['location'])
    assert gate.get_state()==before
    gate.reserve(1,['location'])
    assert gate.get_state()['released_mask']==5
    assert gate.get_state()['safe_frontier']==[5]

def test_unknown_pair_blocks_cumulative_publication(gate,direct_vm):
    activate(gate,direct_vm);gate.reserve(0,['location'])
    assert gate.quote(['shift'])['status']=='UNKNOWN'
    before=gate.get_state()
    with direct_vm.expect_revert('Cumulative publication UNKNOWN'):gate.reserve(4,['shift'])
    assert gate.get_state()==before

def test_authorization_is_global_not_per_caller(gate,direct_vm,direct_bob):
    activate(gate,direct_vm);gate.reserve(0,['codename'])
    before=gate.get_state();direct_vm.sender=direct_bob
    assert gate.quote(['contact'])['status']=='DENY'
    with direct_vm.expect_revert('Only fixed controller'):gate.reserve(1,['location'])
    assert gate.get_state()==before

def test_activation_is_permissionless(gate,direct_vm,direct_bob):
    direct_vm.sender=direct_bob;activate(gate,direct_vm)
    assert gate.get_state()['compiled'] is not None
    with direct_vm.expect_revert('Only fixed controller'):gate.reserve(0,['location'])

def test_denial_dominates_unknown_and_reports_witness(gate,direct_vm):
    rows=decisions()
    rows[0]={'mask':1,'decision':'UNKNOWN','paragraph':-1}
    mock(direct_vm,leader=rows);gate.activate()
    quote=gate.quote(['codename','contact'])
    assert quote['status']=='DENY'
    assert quote['blockers']==[{'mask':1,'decision':'UNKNOWN'},{'mask':3,'decision':'DENY'}]

def test_reservations_are_monotone_and_noops_rejected(gate,direct_vm):
    activate(gate,direct_vm);gate.reserve(0,['codename','location'])
    assert gate.get_state()['released_mask']==5
    assert len(gate.get_state()['history'])==1
    with direct_vm.expect_revert('No new fields'):gate.reserve(5,['codename'])
    assert len(gate.get_state()['history'])==1

@pytest.mark.parametrize('requested',[[],['codename','codename'],['wrong'],['codename','contact','location','shift','wrong']])
def test_invalid_field_requests_do_not_change_state(gate,direct_vm,requested):
    activate(gate,direct_vm);before=gate.get_state()
    with direct_vm.expect_revert('[EXPECTED]'):gate.reserve(0,requested)
    assert gate.get_state()==before

@pytest.mark.parametrize('method',['quote','reserve'])
def test_unactivated_gate_fails_closed(gate,direct_vm,method):
    with direct_vm.expect_revert('Policy is not active'):
        if method=='quote':gate.quote(['codename'])
        else:gate.reserve(0,['codename'])

@pytest.mark.parametrize('mask,new',[(1,'DENY'),(3,'ALLOW'),(12,'ALLOW'),(15,'UNKNOWN')])
def test_every_decision_requires_exact_independent_agreement(gate,direct_vm,mask,new):
    activate(gate,direct_vm)
    own=decisions();own[mask-1]={'mask':mask,'decision':new,'paragraph':-1 if new=='UNKNOWN' else 1}
    mock(direct_vm,own=own,audit=True)
    assert direct_vm.run_validator() is False

def test_equivalent_decisions_allow_different_material_anchors(gate,direct_vm):
    activate(gate,direct_vm)
    own=decisions();own[0]['paragraph']=0
    mock(direct_vm,own=own)
    assert direct_vm.run_validator() is True

def test_validator_refetches_policy(gate,direct_vm):
    activate(gate,direct_vm);mock(direct_vm,body=BODY+b' ')
    assert direct_vm.run_validator() is False

@pytest.mark.parametrize('audit',[False,1,'true',None])
def test_material_anchor_audit_is_strict(gate,direct_vm,audit):
    activate(gate,direct_vm);mock(direct_vm,audit=audit)
    assert direct_vm.run_validator() is False

@pytest.mark.parametrize('mutation',['missing','wrong-order','bool-mask','bool-anchor','irrelevant-index','unknown-anchor','bad-enum','extra-key'])
def test_malformed_model_output_cannot_activate(gate,direct_vm,mutation):
    rows=decisions()
    if mutation=='missing':rows.pop()
    if mutation=='wrong-order':rows[0],rows[1]=rows[1],rows[0]
    if mutation=='bool-mask':rows[0]['mask']=True
    if mutation=='bool-anchor':rows[0]['paragraph']=True
    if mutation=='irrelevant-index':rows[0]['paragraph']=99
    if mutation=='unknown-anchor':rows[11]['paragraph']=99
    if mutation=='bad-enum':rows[0]['decision']='SAFE'
    if mutation=='extra-key':rows[0]['confidence']=100
    mock(direct_vm,leader=rows)
    with direct_vm.expect_revert('[LLM_ERROR]'):gate.activate()
    assert gate.get_state()['compiled'] is None

@pytest.mark.parametrize('body',[b'\xff',b'{"id":"X","id":"Y","paragraphs":[]}',b'{"id":"X","paragraphs":[]}',b'{"id":"X","paragraphs":["x"]}',b'{}'])
def test_invalid_source_rejected(direct_deploy,direct_vm,body):
    gate=direct_deploy(str(ROOT/'contracts/share_fuse.py'),URL,hashlib.sha256(body).hexdigest(),json.dumps(FIELDS))
    mock(direct_vm,body=body)
    with direct_vm.expect_revert('[EXTERNAL]'):gate.activate()
    assert gate.get_state()['compiled'] is None

def test_commitment_mismatch_does_not_activate(gate,direct_vm):
    mock(direct_vm,body=BODY+b' ')
    with direct_vm.expect_revert('commitment mismatch'):gate.activate()
    assert gate.get_state()['compiled'] is None

def test_explicit_uncertainty_anchor_survives_independent_replay(gate,direct_vm):
    activate(gate,direct_vm)
    assert gate.get_state()['compiled']['decisions'][11]=={'mask':12,'decision':'UNKNOWN','paragraph':3}
    assert direct_vm.run_validator() is True

def test_existing_but_irrelevant_uncertainty_anchor_fails_audit(gate,direct_vm):
    rows=decisions();rows[11]['paragraph']=1
    mock(direct_vm,leader=rows,audit=False);gate.activate()
    assert direct_vm.run_validator() is False

@pytest.mark.parametrize('kind',['mutable-url','bad-hash','empty','oversize','duplicate','bad-meaning','double-json'])
def test_configuration_validation(direct_deploy,kind):
    url,digest,fields=URL,HASH,copy.deepcopy(FIELDS)
    if kind=='mutable-url':url=url.replace('a'*40,'main')
    if kind=='bad-hash':digest='0'*63
    if kind=='empty':fields=[]
    if kind=='oversize':fields.append({'id':'fifth','meaning':'Another field definition.'})
    if kind=='duplicate':fields[1]['id']=fields[0]['id']
    if kind=='bad-meaning':fields[0]['meaning']='short'
    encoded=json.dumps(json.dumps(fields)) if kind=='double-json' else json.dumps(fields)
    with pytest.raises(Exception,match=r'\[EXPECTED\]'):direct_deploy(str(ROOT/'contracts/share_fuse.py'),url,digest,encoded)

def pure_functions():
    tree=ast.parse((ROOT/'contracts/share_fuse.py').read_text())
    nodes=[n for n in tree.body if isinstance(n,ast.FunctionDef) and n.name in ('closure','frontier')]
    namespace={};exec(compile(ast.Module(body=nodes,type_ignores=[]),'<lattice>','exec'),namespace)
    return namespace['closure'],namespace['frontier']

def check_table(raw,n,close,front):
    # Independent oracle uses frozenset containment, not contract bit-mask loops.
    sets=[frozenset(i for i in range(n) if mask & (1<<i)) for mask in range(1<<n)]
    risks=[(sets[i+1],label) for i,label in enumerate(raw) if label!='ALLOW']
    expected=[]
    for subset in sets:
        applicable=[label for source,label in risks if source.issubset(subset)]
        expected.append('DENY' if 'DENY' in applicable else 'UNKNOWN' if applicable else 'ALLOW')
    result=close([{'mask':i+1,'decision':label} for i,label in enumerate(raw)],1<<n)
    assert result['effective']==expected
    minimal=[i for i,s in enumerate(sets) if expected[i]!='ALLOW' and not any(t<s and expected[j]!='ALLOW' for j,t in enumerate(sets))]
    assert result['blockers']==minimal
    for current,known in enumerate(sets):
        safe=[i for i,s in enumerate(sets) if known.issubset(s) and expected[i]=='ALLOW']
        maximal=[i for i in safe if not any(sets[i]<sets[j] for j in safe)]
        assert front(expected,current)==maximal
        if expected[current]!='ALLOW':assert maximal==[]

def test_exhaustive_2187_ternary_tables_and_128_four_field_samples():
    close,front=pure_functions()
    for raw in itertools.product(('ALLOW','DENY','UNKNOWN'),repeat=7):check_table(raw,3,close,front)
    rng=random.Random(912)
    for _ in range(128):check_table([rng.choice(('ALLOW','DENY','UNKNOWN')) for _ in range(15)],4,close,front)
