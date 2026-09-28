(() => {
  'use strict';
  const $=id=>document.getElementById(id);
  const demo=window.AdminSession?.demo===true;
  const copy={
    zh:{workspace:'工作空间',feedbackNav:'用户反馈',team:'EverDwell 团队',adminPreview:'管理员界面预览',console:'管理工作台',localPreview:'本地预览',title:'每一个建议，都值得回应。',subtitle:'在这里查看用户的声音，回复反馈，让更好的体验发生。',demoNotice:'当前为本地演示，使用示例数据。回复只保存在此浏览器，不会发送邮件，也不会修改线上反馈。',total:'全部反馈',totalNote:'每一份反馈，都让我们更进一步',pending:'未处理',done:'已处理',pendingNote:'等待你的关注与回应',doneNote:'包含回复后及手动标记的反馈',listTitle:'反馈收件箱',listNote:'回复后自动标记为已处理，你也可以随时手动更改。',reset:'重置演示',all:'全部',search:'搜索邮箱或反馈内容',user:'用户 / 时间',category:'类型',content:'反馈内容',reply:'回复',status:'状态',emptyTitle:'没有找到匹配的反馈',emptyNote:'试试其他关键词，或切换到“全部”。',sortNote:'按最新提交排序 ↓',teamWorkspace:'团队工作空间',previewFooter:'设计预览 · 未连接真实发信服务',replyEyebrow:'一份反馈，一次交流',replyTitle:'回复用户',to:'收件人',from:'发件人',publicMailbox:'EverDwell 公共邮箱',notConfigured:'待配置 · 不使用个人邮箱发送',original:'用户的反馈',yourReply:'你的回复',replyPlaceholder:'写下你想回复给用户的内容……',replyHelp:'将发送你填写的内容，不会自动生成或改写。',simulationNote:'演示模式：点击下方按钮仅模拟发送，并标记为已处理。',cancel:'取消',send:'模拟发送回复',sending:'正在模拟发送…',resetTitle:'恢复初始示例？',resetNote:'这会清除本浏览器内的模拟回复与状态更改。不会影响线上数据。',confirmReset:'恢复示例',close:'关闭',history:'模拟回复记录',replyCount:'{n} 条回复',results:'显示 {n} 条，共 {total} 条反馈',saved:'模拟回复已保存，状态已改为“已处理”。没有发送真实邮件。',statusSaved:'状态已更新为“{status}”（仅本地演示）。',resetSaved:'已恢复初始示例数据。',required:'请先填写回复内容。',storageError:'浏览器无法保存演示记录。当前更改仅在此页面有效，刷新后会丢失。',statusFor:'更改 {email} 的处理状态',replyFor:'回复 {email}',suggestion:'功能建议',issue:'使用问题',correction:'内容纠错',other:'其他反馈',general:'网站整体',assessment:'住宅评估',materials:'材料探索',design:'互动住宅设计',learning:'学习文章'},
    en:{workspace:'WORKSPACE',feedbackNav:'Feedback',team:'EverDwell team',adminPreview:'Admin interface preview',console:'Admin workspace',localPreview:'Local preview',title:'Every voice deserves a reply.',subtitle:'Listen to your community, reply thoughtfully, and make EverDwell better.',demoNotice:'Local demo with sample data. Replies stay in this browser. No emails are sent and no live feedback is changed.',total:'Total feedback',totalNote:'Every idea moves us forward',pending:'Pending',done:'Handled',pendingNote:'Ready for your attention',doneNote:'Replied to or marked manually',listTitle:'Feedback inbox',listNote:'Replying marks feedback as handled. You can also change its status manually.',reset:'Reset demo',all:'All',search:'Search email or feedback',user:'USER / DATE',category:'TYPE',content:'FEEDBACK',reply:'REPLY',status:'STATUS',emptyTitle:'No matching feedback',emptyNote:'Try another keyword or switch to All.',sortNote:'Newest submissions first ↓',teamWorkspace:'Team workspace',previewFooter:'Design preview · Email service not connected',replyEyebrow:'A LITTLE CONVERSATION GOES A LONG WAY',replyTitle:'Reply to feedback',to:'To',from:'From',publicMailbox:'EverDwell shared mailbox',notConfigured:'Not configured · Not your personal email',original:'Original feedback',yourReply:'Your reply',replyPlaceholder:'Write your reply to the user…',replyHelp:'Your words will be sent as written, without AI rewriting.',simulationNote:'Demo mode: the button simulates sending and marks this feedback as handled.',cancel:'Cancel',send:'Simulate sending',sending:'Simulating…',resetTitle:'Restore the sample data?',resetNote:'This clears simulated replies and status changes in this browser. Live data is not affected.',confirmReset:'Restore samples',close:'Close',history:'Simulated reply history',replyCount:'{n} replies',results:'Showing {n} of {total} submissions',saved:'Demo reply saved and marked as handled. No real email was sent.',statusSaved:'Status changed to “{status}” (local demo only).',resetSaved:'Original sample data restored.',required:'Please write a reply first.',storageError:'This browser could not save the demo. Changes only last until this page is refreshed.',statusFor:'Change status for {email}',replyFor:'Reply to {email}',suggestion:'Suggestion',issue:'Site issue',correction:'Correction',other:'Other',general:'General website',assessment:'Home assessment',materials:'Material explorer',design:'Home design',learning:'Learning articles'}
  };
  const seeds=[
    {id:106,email:'emma.chen@example.com',initials:'EC',category:'suggestion',section:'materials',date:'2026-09-28T14:42:00Z',status:'pending',message:{zh:'很喜欢材料对比功能！希望能同时比较三种保温材料，并增加适合加拿大寒冷地区的推荐。',en:'I love the material comparisons! Could we compare three insulation options at once, with recommendations for colder Canadian climates?'}},
    {id:105,email:'oliver.martin@example.com',initials:'OM',category:'issue',section:'assessment',date:'2026-09-28T13:15:00Z',status:'pending',message:{zh:'在手机上完成住宅评估后，返回上一页时之前选择的内容消失了。可以保留填写进度吗？',en:'After completing the assessment on my phone, going back clears my choices. Could my progress be preserved?'}},
    {id:104,email:'sophie.tremblay@example.com',initials:'ST',category:'correction',section:'learning',date:'2026-09-27T20:06:00Z',status:'pending',message:{zh:'可持续住宅文章中，一处法文的材料名称似乎没有翻译完整。谢谢你们提供双语内容。',en:'One material name in the French sustainable housing article seems only partly translated. Thank you for making the site bilingual!'}},
    {id:103,email:'liam.wilson@example.com',initials:'LW',category:'suggestion',section:'design',date:'2026-09-27T16:30:00Z',status:'done',message:{zh:'希望在设计住宅后，可以把选好的材料清单导出为 PDF，方便和家人一起讨论。',en:'Could we export our selected materials as a PDF after designing a home? It would help when discussing ideas with family.'},replies:[{date:'2026-09-27T18:00:00Z',sample:{zh:'谢谢你的建议！我们已经记录了导出材料清单的需求，会在规划后续功能时考虑。',en:'Thanks for the suggestion! We have noted the request to export a materials list and will consider it when planning future features.'}}]},
    {id:102,email:'ava.patel@example.com',initials:'AP',category:'other',section:'general',date:'2026-09-26T19:20:00Z',status:'done',message:{zh:'页面很清晰，终于能用比较容易理解的方式了解不同住宅材料的区别了。期待后续更新！',en:'The pages are really clear. I can finally understand the differences between housing materials. Looking forward to the updates!'}},
    {id:101,email:'noah.lee@example.com',initials:'NL',category:'suggestion',section:'materials',date:'2026-09-26T14:10:00Z',status:'pending',message:{zh:'能否增加材料维护周期的信息？除了购买价格，我也想了解长期使用和维护的成本。',en:'Could you add information about material maintenance schedules? I would like to understand long-term upkeep as well as the purchase price.'}}
  ];
  const KEY='everdwell-admin-local-demo-v1',LANG='everdwell-admin-demo-language';
  const fresh=()=>structuredClone(seeds).map(row=>({...row,replies:row.replies||[]}));
  let rows=demo?fresh():[],lang='zh',filter='all',activeId=null,busy=false,returnButton=null,toastTimer,nextCursor=null,loading=false,dataRevision=0,stateReady=false,dataError='';
  if(!demo){
    Object.assign(copy.zh,{demoNotice:'在线管理后台 · 读取真实反馈需完成后端授权。官方邮箱尚未连接，暂不发送邮件。',localPreview:'在线管理后台',reset:'刷新反馈',totalNote:'当前已加载的反馈',pendingNote:'当前已加载的待处理反馈',doneNote:'当前已加载的已处理反馈',adminPreview:'受保护的管理后台',previewFooter:'真实登录 · 发信服务待配置',notConfigured:'everdwellsupport@gmail.com · 尚未授权发信',publicMailbox:'EverDwell 官方邮箱',history:'回复记录',send:'发送回复（暂未启用）',simulationNote:'真实发信服务尚未配置。现在不会发送邮件，也不会自动标记处理。',statusSaved:'处理状态已保存到数据库。',listNote:'状态由两位管理员共享。真实邮件回复将在发信服务连接后启用。',emptyTitle:'暂无可显示的反馈',emptyNote:'请查看上方连接提示，或尝试其他筛选条件。'});
    Object.assign(copy.en,{demoNotice:'Online admin · Backend authorization is required to read live feedback. The shared mailbox is not connected; sending is disabled.',localPreview:'Online admin',reset:'Refresh feedback',totalNote:'Feedback loaded so far',pendingNote:'Pending in the loaded feedback',doneNote:'Handled in the loaded feedback',adminPreview:'Protected admin workspace',previewFooter:'Real sign-in · Email setup pending',notConfigured:'everdwellsupport@gmail.com · Sending not authorized yet',publicMailbox:'EverDwell official mailbox',history:'Reply history',send:'Send reply (not enabled)',simulationNote:'Email sending is not configured. No email will be sent and no status will be changed automatically.',statusSaved:'Status saved to the database.',listNote:'Both administrators share these statuses. Replies will be enabled after the email service is connected.',emptyTitle:'No feedback to display',emptyNote:'Check the connection notice above or try other filters.'});
  }
  Object.assign(copy.zh,{loading:'正在加载真实反馈和用户邮箱…',database_not_configured:'登录验证成功。还需要配置 Cloudflare 数据库访问授权，才能读取真实反馈。',directory_not_configured:'还需要配置 Supabase 后端授权，才能查询反馈对应的用户邮箱。',data_unavailable:'暂时无法读取数据。请检查后端授权或网络，点击“刷新反馈”重试。',writes_disabled:'当前只读。完成数据库状态表配置后，才能保存状态。',status_conflict:'另一位管理员刚修改了这条反馈，请刷新后再操作。',missingUser:'用户不存在或邮箱不可用',readOnly:'已连接真实反馈；状态编辑暂未启用，邮件发送尚未配置。',ready:'真实反馈已加载。状态更改会保存到数据库；邮件发送尚未配置。',loadMore:'加载更多',sign_in_required:'请重新登录。',admin_required:'此账号没有管理员权限。'});
  Object.assign(copy.en,{loading:'Loading live feedback and user emails…',database_not_configured:'Sign-in verified. Cloudflare database authorization is still needed to load live feedback.',directory_not_configured:'Supabase server authorization is needed to resolve user emails.',data_unavailable:'Data could not be loaded. Check server credentials or the network, then refresh.',writes_disabled:'Read-only. Configure the status table before saving status changes.',status_conflict:'The other administrator just changed this item. Refresh before trying again.',missingUser:'User or email unavailable',readOnly:'Live feedback connected. Status editing and email sending are not enabled yet.',ready:'Live feedback loaded. Status changes are saved to the database; email sending is not configured.',loadMore:'Load more',sign_in_required:'Please sign in again.',admin_required:'This account is not an administrator.'});
  const drafts=new Map();
  try{
    lang=localStorage.getItem(LANG)==='en'?'en':'zh';
    const saved=demo?JSON.parse(localStorage.getItem(KEY)||'null'):null;
    if(Array.isArray(saved)) for(const row of rows){const state=saved.find(x=>x && x.id===row.id);if(!state)continue;
      if(['pending','done'].includes(state.status))row.status=state.status;
      if(Array.isArray(state.replies))row.replies=state.replies.filter(r=>r && typeof r.date==='string' && Number.isFinite(Date.parse(r.date)) && ((typeof r.text==='string' && r.text.length<=5000)||(r.sample && typeof r.sample.zh==='string' && typeof r.sample.en==='string'))).slice(-100);
    }
  }catch{}
  const t=(key,vars={})=>Object.entries(vars).reduce((text,[key,value])=>text.replaceAll('{'+key+'}',String(value)),copy[lang][key]||key);
  function node(tag,className,text){const n=document.createElement(tag);if(className)n.className=className;if(text!==undefined)n.textContent=text;return n;}
  const date=value=>new Intl.DateTimeFormat(lang==='zh'?'zh-CN':'en-CA',{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'}).format(new Date(value));
  function persist(){try{localStorage.setItem(KEY,JSON.stringify(rows.map(({id,status,replies})=>({id,status,replies}))));return true}catch{return false}}
  async function loadFeedback(append=false){
    if(demo||loading||!window.AdminSession.current())return;
    const revision=dataRevision;loading=true;dataError='loading';renderDataStatus();
    try{
      const data=await window.AdminSession.api('feedback'+(append&&nextCursor?'?before='+encodeURIComponent(nextCursor):''));if(revision!==dataRevision)return;
      const incoming=data.items.map(row=>({id:row.id,email:row.email||'',initials:row.email?row.email.slice(0,2).toUpperCase():'?',category:row.category,section:row.section,date:new Date(row.created_at*1000).toISOString(),status:row.status,version:row.version,message:{zh:row.message,en:row.message},replies:[]}));
      rows=append?[...rows,...incoming]:incoming;nextCursor=data.nextCursor;stateReady=data.stateReady;dataError=stateReady&&window.AdminSession.current()?.remoteWrites?'ready':'readOnly';renderRows();
    }catch(e){if(revision!==dataRevision)return;dataError=copy.zh[e.error]?e.error:'data_unavailable'}finally{loading=false;renderDataStatus()}
  }
  function renderDataStatus(){if(demo)return;$('data-status').hidden=!dataError;$('data-status').textContent=t(dataError);$('reset').disabled=loading;$('load-more').hidden=!nextCursor;$('load-more').disabled=loading;$('load-more').textContent=t('loadMore')}
  function toast(key,vars){clearTimeout(toastTimer);$('toast').textContent=t(key,vars);$('toast').hidden=false;toastTimer=setTimeout(()=>$('toast').hidden=true,5500)}
  function renderRows(){
    const query=$('search').value.trim().toLowerCase();
    const shown=rows.filter(row=>(filter==='all'||row.status===filter)&&(!query||`${row.email} ${row.message.zh} ${row.message.en}`.toLowerCase().includes(query)));
    const body=$('feedback-rows');body.replaceChildren();
    for(const row of shown){
      const tr=node('tr');tr.dataset.id=row.id;
      const user=node('td'),wrap=node('div','user-cell'),details=node('div','user-details');
      wrap.append(node('span','user-avatar',row.initials));details.append(node('span','email',row.email||t('missingUser')),node('time','row-date',date(row.date)));details.lastChild.dateTime=row.date;wrap.append(details);user.append(wrap);
      const category=node('td');category.append(node('span','tag '+row.category,t(row.category)));
      const content=node('td');content.append(node('span','section-label',t(row.section)),node('p','feedback-message',row.message[lang]));
      const action=node('td'),reply=node('button','reply-button');reply.type='button';reply.setAttribute('aria-label',t('replyFor',{email:row.email}));reply.append(node('span','',t('reply')),node('span','','↗'));reply.lastChild.setAttribute('aria-hidden','true');reply.addEventListener('click',()=>openReply(row.id,reply));action.append(reply);
      if(row.replies.length)action.append(node('span','reply-number',t('replyCount',{n:row.replies.length})));
      const status=node('td'),select=node('select','status-select '+row.status);select.setAttribute('aria-label',t('statusFor',{email:row.email}));
      for(const value of ['pending','done']){const option=node('option','',t(value));option.value=value;select.append(option)}select.value=row.status;
      select.disabled=!demo&&(!stateReady||!window.AdminSession.current()?.remoteWrites);
      select.addEventListener('change',async()=>{
        const requested=select.value,revision=dataRevision;select.disabled=true;
        try{if(demo){row.status=requested;toast(persist()?'statusSaved':'storageError',{status:t(row.status)})}else{const saved=await window.AdminSession.api('status',{method:'PATCH',body:JSON.stringify({id:row.id,status:requested,version:row.version})});if(revision!==dataRevision)return;row.status=saved.status;row.version=saved.version;toast('statusSaved')}
        }catch(e){if(revision!==dataRevision)return;toast(copy.zh[e.error]?e.error:'data_unavailable')}
        finally{if(revision===dataRevision){renderRows();const next=$('feedback-rows').querySelector(`[data-id="${row.id}"] select`);(next||document.querySelector(`[data-filter="${filter}"]`)).focus()}}
      });status.append(select);
      tr.append(user,category,content,action,status);body.append(tr);
    }
    const pending=rows.filter(r=>r.status==='pending').length;
    $('total-count').textContent=rows.length;$('pending-count').textContent=pending;$('done-count').textContent=rows.length-pending;$('nav-count').textContent=pending;$('filter-total').textContent=rows.length;
    $('result-count').textContent=t('results',{n:shown.length,total:rows.length});$('empty').hidden=shown.length>0;
  }
  function renderDialog(){
    const row=rows.find(r=>r.id===activeId);if(!row)return;
    $('recipient').textContent=row.email||t('missingUser');$('original-message').textContent=row.message[lang];
    const history=$('history');history.replaceChildren();history.hidden=!row.replies.length;history.setAttribute('aria-label',t('history'));
    if(row.replies.length){history.append(node('h3','',t('history')));for(const reply of row.replies){const article=node('article');article.append(node('time','',date(reply.date)),node('p','',reply.text??reply.sample[lang]));history.append(article)}}
    $('send-reply').querySelector('[data-i18n]').textContent=t(busy?'sending':'send');
    if(!demo)$('send-reply').disabled=true;
  }
  function render(){
    document.documentElement.lang=lang==='zh'?'zh-CN':'en';document.title='EverDwell · '+t('feedbackNav');
    document.querySelectorAll('[data-i18n]').forEach(n=>n.textContent=t(n.dataset.i18n));
    document.querySelectorAll('[data-placeholder]').forEach(n=>n.placeholder=t(n.dataset.placeholder));$('search').setAttribute('aria-label',t('search'));$('close-reply').setAttribute('aria-label',t('close'));
    document.querySelectorAll('[data-lang]').forEach(n=>n.setAttribute('aria-pressed',String(n.dataset.lang===lang)));
    document.querySelectorAll('[data-filter]').forEach(n=>n.setAttribute('aria-pressed',String(n.dataset.filter===filter)));
    if(!$('reply-error').hidden)$('reply-error').textContent=t('required');renderRows();renderDialog();renderDataStatus();
  }
  function openReply(id,button){activeId=id;returnButton=button;$('reply-message').value=drafts.get(id)||'';$('reply-count').textContent=`${$('reply-message').value.length} / 5,000`;$('reply-error').hidden=true;$('reply-message').removeAttribute('aria-invalid');renderDialog();$('reply-dialog').showModal();$('reply-message').focus()}
  function closeReply(){if(!busy)$('reply-dialog').close()}
  $('close-reply').addEventListener('click',closeReply);$('cancel-reply').addEventListener('click',closeReply);
  $('reply-dialog').addEventListener('cancel',event=>{if(busy)event.preventDefault()});
  $('reply-dialog').addEventListener('close',()=>{if(activeId!==null)drafts.set(activeId,$('reply-message').value);const target=returnButton?.isConnected?returnButton:$('feedback-rows').querySelector(`[data-id="${activeId}"] button`);(target||document.querySelector(`[data-filter="${filter}"]`)).focus();activeId=null;returnButton=null});
  $('reply-message').addEventListener('input',()=>{drafts.set(activeId,$('reply-message').value);$('reply-count').textContent=`${$('reply-message').value.length} / 5,000`;$('reply-error').hidden=true;$('reply-message').removeAttribute('aria-invalid')});
  $('reply-form').addEventListener('submit',async event=>{
    event.preventDefault();if(!demo||busy||activeId===null)return;const text=$('reply-message').value;
    if(!text.trim()){$('reply-error').textContent=t('required');$('reply-error').hidden=false;$('reply-message').setAttribute('aria-invalid','true');$('reply-message').focus();return}
    busy=true;$('reply-form').setAttribute('aria-busy','true');['send-reply','cancel-reply','close-reply','reply-message'].forEach(id=>$(id).disabled=true);renderDialog();
    // LOCAL DEMO ONLY. No fetch, email, authentication credentials or live database access.
    await new Promise(resolve=>setTimeout(resolve,650));
    const row=rows.find(r=>r.id===activeId);row.replies.push({date:new Date().toISOString(),text});row.status='done';const stored=persist();
    drafts.delete(activeId);$('reply-message').value='';busy=false;$('reply-form').setAttribute('aria-busy','false');['send-reply','cancel-reply','close-reply','reply-message'].forEach(id=>$(id).disabled=false);
    renderRows();closeReply();toast(stored?'saved':'storageError');
  });
  document.querySelectorAll('[data-lang]').forEach(button=>button.addEventListener('click',()=>{lang=button.dataset.lang;try{localStorage.setItem(LANG,lang)}catch{}$('toast').hidden=true;render()}));
  document.querySelectorAll('[data-filter]').forEach(button=>button.addEventListener('click',()=>{filter=button.dataset.filter;render()}));
  $('search').addEventListener('input',renderRows);
  $('reset').addEventListener('click',()=>demo?$('reset-dialog').showModal():loadFeedback());$('cancel-reset').addEventListener('click',()=>$('reset-dialog').close());
  $('confirm-reset').addEventListener('click',()=>{if(!demo)return;rows=fresh();drafts.clear();const stored=persist();filter='all';$('search').value='';$('reset-dialog').close();render();toast(stored?'resetSaved':'storageError')});
  $('load-more').addEventListener('click',()=>loadFeedback(true));
  window.addEventListener('admin-session-change',event=>{
    if(demo)return;dataRevision++;rows=[];drafts.clear();nextCursor=null;stateReady=false;dataError='';$('search').value='';$('reply-message').value='';if($('reply-dialog').open)$('reply-dialog').close();renderRows();renderDataStatus();
    if(event.detail){loading=false;loadFeedback()}
  });
  render();
  if(!demo&&window.AdminSession.current())loadFeedback();
})();
