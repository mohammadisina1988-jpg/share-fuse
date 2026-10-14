const {assert,equal}=require('./transport.cjs');
const set=mask=>new Set([0,1,2,3].filter(i=>mask&(1<<i)));
const subset=(a,b)=>[...a].every(i=>b.has(i));
const expectedDecision=mask=>subset(set(3),set(mask))?'DENY':subset(set(12),set(mask))?'UNKNOWN':'ALLOW';
function checkState(state,metadata,current,historyLength,active=true){
  assert(state.policy_url===metadata.policy_url&&state.policy_sha256===metadata.policy_sha256&&equal(state.fields,metadata.fields),'Configuration binding');
  assert(state.released_mask===current&&state.history.length===historyLength,'Publication state mismatch');
  if(!active){assert(state.compiled===null&&equal(state.safe_frontier,[]),'Premature policy');return;}
  const c=state.compiled;assert(equal(c.source,metadata.policy),'Source binding');
  assert(c.decisions.length===15,'Incomplete decisions');
  for(let i=0;i<15;i++){
    const row=c.decisions[i],mask=i+1,label=expectedDecision(mask);
    assert(row.mask===mask&&row.decision===label,'Unexpected semantic policy decision');
    assert(Number.isInteger(row.paragraph)&&(label==='UNKNOWN'?row.paragraph===-1:row.paragraph>=0&&row.paragraph<c.source.paragraphs.length),'Anchor shape');
  }
  const labels=Array.from({length:16},(_,i)=>expectedDecision(i));
  assert(equal(c.lattice.effective,labels)&&equal(c.lattice.blockers,[3,12]),'Conservative lattice mismatch');
  const safe=Array.from({length:16},(_,i)=>i).filter(i=>subset(set(current),set(i))&&expectedDecision(i)==='ALLOW');
  const frontier=safe.filter(i=>!safe.some(j=>j!==i&&subset(set(i),set(j))));
  assert(equal(state.safe_frontier,frontier),'Safe frontier mismatch');
  let prior=0;
  for(const h of state.history){assert(h.current_mask===prior&&h.union_mask===(prior|h.requested_mask)&&h.union_mask!==prior&&expectedDecision(h.union_mask)==='ALLOW'&&h.status==='ALLOW'&&equal(h.blockers,[]),'Invalid authorization history');prior=h.union_mask;}
  assert(prior===current,'History union mismatch');
}
function checkQuote(q,current,requested){
  const union=current|requested,label=expectedDecision(union),blockers=[3,12].filter(m=>subset(set(m),set(union))).map(mask=>({mask,decision:expectedDecision(mask)}));
  assert(equal(q,{status:label,current_mask:current,requested_mask:requested,union_mask:union,blockers}),'Quote binding');
}
module.exports={expectedDecision,checkState,checkQuote};
