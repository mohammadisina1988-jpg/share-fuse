// Disposable encrypted CLI account. No private key is extracted/exported.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),cp=require('node:child_process');
if(!process.env.GITHUB_ACTIONS||!process.env.GITHUB_ENV)throw Error('Disposable GitHub Actions runner only');
const password=crypto.randomBytes(24).toString('hex');console.log('::add-mask::'+password);
const cli=path.join(cp.execFileSync('npm',['root','-g'],{encoding:'utf8'}).trim(),'genlayer/dist/index.js');
cp.execFileSync(process.execPath,[cli,'account','create','--name','fuse-proof','--password',password],{windowsHide:true,stdio:['ignore','ignore','pipe']});
cp.execFileSync(process.execPath,[cli,'network','set','studionet'],{windowsHide:true,stdio:['ignore','ignore','pipe']});
fs.appendFileSync(process.env.GITHUB_ENV,`GENLAYER_CLI_PATH=${cli}\nFUSE_ACCOUNT=fuse-proof\nFUSE_PASSWORD=${password}\n`);
console.log('Encrypted ephemeral StudioNet account prepared');
