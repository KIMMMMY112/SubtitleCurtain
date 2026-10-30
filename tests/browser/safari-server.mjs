import {createServer} from 'node:http';import {readFile} from 'node:fs/promises';
const html=await readFile('tests/browser/safari-fixture.html');
const server=createServer((req,res)=>{if(req.url==='/favicon.ico'){res.writeHead(204);res.end();return;}res.writeHead(200,{'Content-Type':'text/html; charset=utf-8'});res.end(html);});
const port=Number(process.env.SC_FIXTURE_PORT || 8765);server.listen(port,'0.0.0.0',()=>console.log('Safari native acceptance fixture: http://127.0.0.1:'+port+'/'));
