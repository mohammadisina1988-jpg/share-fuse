const fs=require('node:fs'),path=require('node:path');
const {root,assert,equal,digest,read,rpc,receiptSummary,save}=require('./transport.cjs');
const {checkState,checkQuote}=require('./proof-checks.cjs');
const load=name=>JSON.parse(fs.readFileSync(path.join(root,'proofs',name+'.json')));
async function main(){
  const offline=process.argv.includes('--offline'),d=load('deployment'),cases=load('cases'),code=fs.readFileSync(path.join(root,'contracts/share_fuse.py'));
  assert(digest(code)===d.source_sha256&&d.exact_source_match,'Code binding');
  const bytes=fs.readFileSync(path.join(root,'policies/publication.json'));
  assert(digest(bytes)===d.policy_sha256&&equal(JSON.parse(bytes),d.policy),'Policy binding');
  checkState(load('initial-state'),d,0,0,false);
  assert(load('initial-state').controller.toLowerCase()===load('deployment-receipt').from_address.toLowerCase(),'Controller differs from deployer');
  async function verifyReceipt(name,hash,success){
    const saved=load(name+'-receipt'),r=offline?saved:await rpc('eth_getTransactionByHash',[hash]),s=receiptSummary(r);
    assert(s.hash===hash&&s.status==='FINALIZED'&&(r.to_address||r.recipient).toLowerCase()===d.contract.toLowerCase(),'Receipt binding');
    assert(equal(r.consensus_data.votes,saved.consensus_data.votes),'Votes changed');
    assert(s.result==='MAJORITY_AGREE'&&s.agree>(s.agree+s.disagree+s.idle)/2,'Consensus');
    assert(success?['SUCCESS','FINISHED_WITH_RETURN'].includes(s.execution):s.execution==='ERROR','Execution');return s;
  }
  const summary={network:'studionet',chain_id:61999,contract:d.contract,source_sha256:d.source_sha256,exact_source_match:true,verification_mode:offline?'offline-artifact':'fresh-rpc-and-state',verified_at:new Date().toISOString(),deployment:await verifyReceipt('deployment',d.transaction,true),cases:[]};
  let previous=load('initial-state');
  for(const item of cases){
    const proof=load(item.name);assert(proof.contract===d.contract&&equal(proof.state_before,previous),'State chain broken');
    checkState(proof.state,d,item.mask,item.history);
    if(!item.success){assert(equal(proof.state_before,proof.state)&&proof.state_unchanged&&proof.reason_verified,'Rejected mutation');assert(JSON.stringify(load(item.name+'-decoded-receipt')).includes('[EXPECTED] '+item.reason),'Rejection reason');}
    const receipt=await verifyReceipt(item.name,proof.transaction,item.success);
    summary.cases.push({name:item.name,success:item.success,released_mask:item.mask,...receipt});previous=proof.state;
  }
  const quotes=load('quotes');assert(quotes.length===45,'Missing quote proofs');
  for(const q of quotes){const requested=q.requested.reduce((m,id)=>m|(1<<d.fields.findIndex(f=>f.id===id)),0);checkQuote(q.result,q.current,requested);}
  if(!offline){
    assert(await rpc('eth_chainId',[])==='0xf22f','Wrong chain');
    assert(code.equals(Buffer.from(await rpc('gen_getContractCode',[d.contract]),'base64')),'Live source differs');
    assert(equal(await read('verified-live-state',['call',d.contract,'get_state']),previous),'Live state differs');
    const q=await read('verified-live-quote',['call',d.contract,'quote','--args',JSON.stringify(['shift'])]);checkQuote(q,5,8);
    summary.live_state_match=true;save('verification',summary);
  }
  console.log(JSON.stringify(summary,null,2));
}
main().catch(e=>{console.error(e.stack,e.cause?.message||'');process.exitCode=1;});
