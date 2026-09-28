import {connect} from 'cloudflare:sockets';
import {sendGmail} from './smtp.mjs';
export const gmailSender=password=>job=>sendGmail(connect,password,job);
