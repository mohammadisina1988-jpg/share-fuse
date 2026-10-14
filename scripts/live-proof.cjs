const fs=require('node:fs'),path=require('node:path');
const {root,assert,equal,digest,sourceHash,delay,save,invoke,read,rpc,receipt}=require('./transport.cjs');
const {checkState,checkQuote}=require('./proof-checks.cjs');
const repo='mohammadisina1988-jpg/share-fuse';
async function main(){
  assert(await rpc('eth_chainId',[])==='0xf22f','StudioNet only');
  const revision=fs.readFileSync(path.join(root,'config/fixture-revision.txt'),'utf8').trim(),bytes=fs.readFileSync(path.join(root,'policies/publication.json'));
  const url=`https://raw.githubusercontent.com/${repo}/${revision}/policies/publication.json`,response=await fetch(url,{signal:AbortSignal.timeout(30000)});
  assert(response.ok&&bytes.equals(Buffer.from(await response.arrayBuffer())),'Published policy bytes differ');
  const fields=JSON.parse(fs.readFileSync(path.join(root,'config/fields.json'))),metadata={network:'studionet',chain_id:61999,source_sha256:sourceHash,fixture_revision:revision,policy_url:url,policy_sha256:digest(bytes),policy:JSON.parse(bytes),fields};
  const deployHash=await invoke('deployment',['deploy','--contract','contracts/share_fuse.py','--args',url,metadata.policy_sha256,JSON.stringify(fields)]);
  const deployed=await receipt('deployment',deployHash,true),address=deployed.to_address||deployed.recipient;
  assert(/^0x[0-9a-f]{40}$/i.test(address),'Missing contract address');
  assert(fs.readFileSync(path.join(root,'contracts/share_fuse.py')).equals(Buffer.from(await rpc('gen_getContractCode',[address]),'base64')),'Deployed source differs');
  Object.assign(metadata,{contract:address,transaction:deployHash,exact_source_match:true});save('deployment',metadata);
  const initial=await read('initial-state',['call',address,'get_state']);checkState(initial,metadata,0,0,false);save('initial-state',initial);
  const quotes=[];
  async function quoteAll(label,current){
    for(let mask=1;mask<16;mask++){
      const requested=fields.filter((_,i)=>mask&(1<<i)).map(f=>f.id);
      const q=await read(label+'-quote-'+mask,['call',address,'quote','--args',JSON.stringify(requested)]);
      checkQuote(q,current,mask);quotes.push({stage:label,current,requested,result:q});await delay(1100);
    }
    save('quotes',quotes);
  }
  const cases=[
    {name:'activate',method:'activate',args:[],success:true,mask:0,history:0},
    {name:'first-reservation',method:'reserve',args:['0',JSON.stringify(['codename'])],success:true,mask:1,history:1},
    {name:'stale-preview',method:'reserve',args:['0',JSON.stringify(['location'])],success:false,mask:1,history:1,reason:'Stale publication state'},
    {name:'forbidden-composition',method:'reserve',args:['1',JSON.stringify(['contact'])],success:false,mask:1,history:1,reason:'Cumulative publication DENY'},
    {name:'safe-extension',method:'reserve',args:['1',JSON.stringify(['location'])],success:true,mask:5,history:2},
    {name:'unknown-composition',method:'reserve',args:['5',JSON.stringify(['shift'])],success:false,mask:5,history:2,reason:'Cumulative publication UNKNOWN'},
    {name:'no-new-fields',method:'reserve',args:['5',JSON.stringify(['codename'])],success:false,mask:5,history:2,reason:'No new fields'},
    {name:'immutable-policy',method:'activate',args:[],success:false,mask:5,history:2,reason:'Policy already immutable and active'}
  ];
  save('cases',cases);
  for(const item of cases){
    const before=await read(item.name+'-before',['call',address,'get_state']);
    const hash=await invoke(item.name,['write',address,item.method,...(item.args.length?['--args',...item.args]:[])]);
    const r=await receipt(item.name,hash,item.success);assert((r.to_address||r.recipient).toLowerCase()===address.toLowerCase(),'Wrong write destination');
    const after=await read(item.name+'-after',['call',address,'get_state']);checkState(after,metadata,item.mask,item.history);
    let reasonVerified=null;
    if(!item.success){
      assert(equal(before,after),'Rejected call changed state');
      const decoded=await read(item.name+'-decoded',['receipt',hash,'--status','FINALIZED','--retries','2','--interval','3000']);save(item.name+'-decoded-receipt',decoded);
      reasonVerified=JSON.stringify(decoded).includes('[EXPECTED] '+item.reason);assert(reasonVerified,'Wrong rejection reason');
    }
    save(item.name,{contract:address,transaction:hash,...item,state_before:before,state:after,state_unchanged:equal(before,after),reason_verified:reasonVerified});
    if(['activate','first-reservation','safe-extension'].includes(item.name))await quoteAll(item.name,item.mask);
    console.log('VERIFIED',item.name);await delay(5000);
  }
}
main().catch(e=>{console.error(e.stack,e.cause?.message||'');process.exitCode=1;});
