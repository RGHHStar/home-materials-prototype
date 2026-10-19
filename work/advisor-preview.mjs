// Local-only preview server. Auth/email/admin APIs are deliberately not executed.
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {onRequest} from '../functions/api/advisor.js';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.jpg':'image/jpeg','.png':'image/png','.json':'application/json'};
http.createServer(async(req,res)=>{
  try {
    const url=new URL(req.url,'http://127.0.0.1:4173');
    if(url.pathname==='/api/advisor') {
      const chunks=[];let size=0;for await(const chunk of req){size+=chunk.length;if(size>42000){res.writeHead(413).end();return;}chunks.push(chunk);}
      const response=await onRequest({request:new Request(url,{method:req.method,headers:req.headers,...(req.method==='POST'?{body:Buffer.concat(chunks)}:{})}),env:{}});
      res.writeHead(response.status,Object.fromEntries(response.headers));res.end(await response.text());return;
    }
    if(url.pathname.startsWith('/api/')){res.writeHead(503,{'Content-Type':'application/json'}).end('{"error":"preview_only"}');return;}
    const relative=decodeURIComponent(url.pathname).replace(/^\/+/, '')||'index.html';
    const file=path.resolve(root,relative);
    if(!file.startsWith(root+path.sep)||relative.split(/[\\/]/).some(p=>p.startsWith('.'))||relative.startsWith('functions/')){res.writeHead(403).end();return;}
    const content=await fs.readFile(file);res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'}).end(content);
  }catch{res.writeHead(404).end();}
}).listen(4173,'127.0.0.1',()=>console.log('Advisor preview: http://127.0.0.1:4173'));
