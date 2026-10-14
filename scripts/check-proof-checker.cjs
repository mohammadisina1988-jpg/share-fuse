// Authored offline states are verifier tests, not transaction receipts.
const fs=require('node:fs'),path=require('node:path');
const {root,assert}=require('./transport.cjs');
const {expectedDecision,checkState,checkQuote}=require('./proof-checks.cjs');
const fields=JSON.parse(fs.readFileSync(path.join(root,'config/fields.json'))),policy=JSON.parse(fs.readFileSync(path.join(root,'policies/publication.json')));
const metadata={fields,policy,policy_url:'fixture',policy_sha256:'fixture'};
const rows=Array.from({length:15},(_,i)=>({mask:i+1,decision:expectedDecision(i+1),paragraph:expectedDecision(i+1)==='UNKNOWN'?-1:1}));
const state={fields,policy_url:'fixture',policy_sha256:'fixture',released_mask:0,history:[],safe_frontier:[5,6,9,10],compiled:{source:policy,decisions:rows,lattice:{effective:Array.from({length:16},(_,i)=>expectedDecision(i)),blockers:[3,12]}}};
checkState(state,metadata,0,0);
let rejected=0;
for(const mutation of [x=>x.compiled.decisions[2].decision='ALLOW',x=>x.compiled.lattice.effective[12]='ALLOW',x=>x.safe_frontier.push(15),x=>x.released_mask=3,x=>x.compiled.source.id='FORGED']){
  const forged=JSON.parse(JSON.stringify(state));mutation(forged);
  try{checkState(forged,metadata,0,0);}catch{rejected++;}
}
assert(rejected===5,'Verifier accepted forged state');
checkQuote({status:'DENY',current_mask:1,requested_mask:2,union_mask:3,blockers:[{mask:3,decision:'DENY'}]},1,2);
try{checkQuote({status:'ALLOW',current_mask:1,requested_mask:2,union_mask:3,blockers:[]},1,2);throw Error('Accepted false authorization');}catch(e){assert(e.message!=='Accepted false authorization','Verifier accepted false authorization');}
console.log('Offline verifier: authored state/quote accepted; 6 forgeries rejected.');
