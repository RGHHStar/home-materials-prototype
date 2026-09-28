// Small, fixed-destination SMTP submission client. Never logs server replies or credentials.
export const SENDER='everdwellsupport@gmail.com';
export const validEmail=value=>typeof value==='string'&&value.length<=254&&/^[A-Za-z0-9.!#$%&'*+\/=?^_`{|}~-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)+$/.test(value);
const utf8=value=>new TextEncoder().encode(value);
const base64=value=>btoa(Array.from(utf8(value),b=>String.fromCharCode(b)).join(''));
export class DeliveryError extends Error{
 constructor(outcome,code){super(code);this.outcome=outcome;this.code=code}
}
export function mimeMessage(job){
 if(!validEmail(job.recipient)||!/^[-A-Za-z0-9]+$/.test(job.id)||/[\r\n]/.test(job.subject))throw new DeliveryError('failed','invalid_message');
 const headers=[`From: EverDwell <${SENDER}>`,`To: <${job.recipient}>`,`Subject: ${job.subject}`,`Date: ${new Date().toUTCString()}`,`Message-ID: <${job.id}@home-materials-prototype.pages.dev>`,'MIME-Version: 1.0','Content-Type: text/plain; charset=UTF-8','Content-Transfer-Encoding: base64'];
 if(job.kind==='ack')headers.push('Auto-Submitted: auto-replied','X-Auto-Response-Suppress: All');
 else headers.push(`Reply-To: EverDwell <${SENDER}>`);
 return headers.join('\r\n')+'\r\n\r\n'+base64(job.body).match(/.{1,76}/g).join('\r\n')+'\r\n';
}
export async function sendGmail(connect,password,job,{timeoutMs=20000}={}){
 const key=String(password||'').replace(/\s/g,'');
 if(!/^[a-zA-Z]{16}$/.test(key))throw new DeliveryError('failed','mail_not_configured');
 const mime=mimeMessage(job);
 let socket,reader,writer,timer,uncertain=false,accepted=false;
 async function work(){
  socket=connect({hostname:'smtp.gmail.com',port:465},{secureTransport:'on'});
  socket.closed.catch(()=>{});await socket.opened;
  reader=socket.readable.getReader();writer=socket.writable.getWriter();
  let buffer='',readBytes=0;const decoder=new TextDecoder();
  async function line(){while(!buffer.includes('\r\n')){const part=await reader.read();if(part.done)throw new Error('smtp_disconnected');readBytes+=part.value.length;if(readBytes>65536)throw new Error('smtp_response_limit');buffer+=decoder.decode(part.value,{stream:true})}const end=buffer.indexOf('\r\n'),value=buffer.slice(0,end);buffer=buffer.slice(end+2);return value}
  async function expect(expected){let code;for(let i=0;i<100;i++){const value=await line(),match=/^(\d{3})([ -])/.exec(value);if(!match)throw new Error('smtp_protocol');if(code&&code!==Number(match[1]))throw new Error('smtp_protocol');code=Number(match[1]);if(match[2]===' '){if(!expected.includes(code)){if(code>=400&&code<=599)uncertain=false;throw new DeliveryError(uncertain?'unknown':'failed',code===535?'smtp_auth_failed':code>=400?'smtp_rejected':'smtp_protocol')}return}}throw new Error('smtp_protocol')}
  const command=async(value,codes)=>{await writer.write(utf8(value+'\r\n'));await expect(codes)};
  await expect([220]);await command('EHLO home-materials-prototype.pages.dev',[250]);
  await command('AUTH PLAIN '+base64('\0'+SENDER+'\0'+key),[235]);
  await command(`MAIL FROM:<${SENDER}>`,[250]);await command(`RCPT TO:<${job.recipient}>`,[250,251]);await command('DATA',[354]);
  // A timeout after DATA may mean Gmail accepted it. Do not automatically retry.
  uncertain=true;await writer.write(utf8(mime+'.\r\n'));await expect([250]);accepted=true;
  return {status:'accepted'};
 }
 try{return await Promise.race([work(),new Promise((_,reject)=>{timer=setTimeout(()=>reject(new Error('smtp_timeout')),timeoutMs)})])}
 catch(error){if(accepted)return {status:'accepted'};if(error instanceof DeliveryError)throw error;throw new DeliveryError(uncertain?'unknown':'failed','smtp_unavailable')}
 finally{clearTimeout(timer);try{reader?.releaseLock();writer?.releaseLock()}catch{}try{await socket?.close()}catch{}}
}
