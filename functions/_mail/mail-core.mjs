import {validEmail} from './smtp.mjs';
export const mailConfigured=env=>env.MAIL_ENABLED===true&&typeof env.sendMail==='function';
export async function mailSchemaReady(db){return !!(await db.query("SELECT name FROM sqlite_master WHERE type='table' AND name='feedback_mail'",[])).length}
export function acknowledgement(id,locale){
 return locale==='fr'?{subject:`EverDwell - Merci pour votre avis #${id}`,body:`Bonjour,\n\nMerci de nous avoir fait part de vos commentaires. Nous avons bien reçu votre avis (référence #${id}). Vos suggestions nous aident à améliorer EverDwell.\n\nNotre équipe examinera votre message. Si nécessaire, nous vous contacterons par courriel.\n\nCeci est un accusé de réception automatique. Merci de ne pas répondre à ce message.\n\nL’équipe EverDwell`}:{subject:`EverDwell - Thank you for your feedback #${id}`,body:`Hello,\n\nThank you for sharing your feedback. We have received your message (reference #${id}). Your suggestions help us improve EverDwell.\n\nOur team will review your message. If needed, we will contact you by email.\n\nThis is an automated acknowledgement. Please do not reply to this message.\n\nThe EverDwell team`};
}
export async function queueAcknowledgement(db,feedback,recipient){
 if(!validEmail(recipient))return null;
 const id='ack-'+feedback.id,mail=acknowledgement(feedback.id,feedback.locale);
 await db.query("INSERT INTO feedback_mail(id,feedback_id,kind,request_id,recipient,subject,body,status) VALUES(?,?,'ack','ack',?,?,?,'pending') ON CONFLICT(feedback_id,kind,request_id) DO NOTHING",[id,feedback.id,recipient,mail.subject,mail.body]);
 return id;
}
export async function publicMail(db,id){
 const rows=await db.query('SELECT id,feedback_id,kind,request_id,body,status,error_code,created_at,updated_at,attempts FROM feedback_mail WHERE id=?',[id]);
 if(!rows[0])return null;const row=rows[0];
 // Stale in-flight jobs have an uncertain outcome, never a safe automatic retry.
 if(row.status==='sending'&&row.updated_at<Math.floor(Date.now()/1000)-60)return {...row,status:'unknown'};
 return row;
}
export async function deliverMail(db,env,id){
 if(!mailConfigured(env))return publicMail(db,id);
 const claimed=await db.query("UPDATE feedback_mail SET status='sending',attempts=attempts+1,updated_at=unixepoch(),error_code=NULL WHERE id=? AND status='pending' RETURNING *",[id]);
 if(!claimed.length)return publicMail(db,id);
 const job=claimed[0];let status='accepted',errorCode=null;
 try{await env.sendMail(job)}catch(error){status=error.outcome==='unknown'?'unknown':'failed';errorCode=['smtp_auth_failed','smtp_rejected','invalid_message','mail_not_configured'].includes(error.code)?error.code:'smtp_unavailable'}
 // A trigger marks the feedback handled in this same transaction for accepted manual replies only.
 await db.query('UPDATE feedback_mail SET status=?,error_code=?,updated_at=unixepoch() WHERE id=? AND status=\'sending\'',[status,errorCode,id]);
 return publicMail(db,id);
}
export async function retryMail(db,env,id){
 const result=await db.query("UPDATE feedback_mail SET status='pending',updated_at=unixepoch() WHERE id=? AND status='failed' AND attempts<3 RETURNING id",[id]);
 const current=await publicMail(db,id);if(!current)return null;
 if(result.length||current.status==='pending')return deliverMail(db,env,id);
 return current;
}
