/* ===== DATA LAYER (swap these with API calls later) ===== */
/* ===== ADMIN TASK DATA (demo seed) =====
   The Admin Panel publishes tasks of this exact shape into localStorage 'smartcash_tasks'
   (see window.SmartCash at the bottom of the data bridge). When that key exists it replaces this demo seed.
   Task = {id,title,description,image,reward,instructions[],taskLink,proofType,active,createdAt,updatedAt} */
const mkImg=(a,b,g)=>'data:image/svg+xml;utf8,'+encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 360"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs><rect width="640" height="360" fill="url(#g)"/><circle cx="320" cy="180" r="84" fill="rgba(255,255,255,.2)"/><text x="320" y="216" font-size="96" text-anchor="middle">${g}</text></svg>`);
const IMGC=[['#6366f1','#22d3ee'],['#ef4444','#f59e0b'],['#0ea5e9','#6366f1'],['#ec4899','#8b5cf6'],['#10b981','#22d3ee'],['#f97316','#ef4444'],['#14b8a6','#6366f1']];
const DEMO_TASKS=[
 {id:'TASK_001',icon:'📱',title:'Install & try FitTrack',description:'Install the FitTrack app, open it and explore for 60 seconds.',reward:8,estimatedTime:'3 min',proofType:'screenshot',taskLink:'https://example.com/fittrack',instructions:['Open the task link','Download and install FitTrack (Android 8 or newer)','Open the application and keep it open for 60 seconds','Take a screenshot of the app home screen','Submit the screenshot as proof']},
 {id:'TASK_002',icon:'▶️',title:'Watch & subscribe: Tech Daily',description:'Watch the featured video and subscribe to the channel.',reward:6,estimatedTime:'4 min',proofType:'screenshot',taskLink:'https://example.com/techdaily',instructions:['Open the task link','Watch at least 2 minutes of the video','Subscribe to the channel','Take a screenshot showing the Subscribed button','Submit the screenshot as proof']},
 {id:'TASK_003',icon:'✈️',title:'Join Deal Hunters on Telegram',description:'Join the channel and stay for the review period.',reward:4,estimatedTime:'2 min',proofType:'username',taskLink:'https://example.com/dealhunters',instructions:['Open the task link','Join the Telegram channel','Stay a member during the review period','Enter your Telegram username as proof']},
 {id:'TASK_004',icon:'💬',title:'Follow @brightcrafts',description:'Follow the account and like the pinned post.',reward:3,estimatedTime:'1 min',proofType:'username',taskLink:'https://example.com/brightcrafts',instructions:['Open the task link','Follow the account (public profile)','Like the pinned post','Enter your username as proof']},
 {id:'TASK_005',icon:'🌐',title:'Read a 2-minute article',description:'Visit the page and scroll to the end.',reward:2.5,estimatedTime:'2 min',proofType:'url',taskLink:'https://example.com/article',instructions:['Open the task link','Stay on the page for 90 seconds','Scroll to the end of the article','Paste the page URL as proof']},
 {id:'TASK_006',icon:'🎮',title:'Try PlayQuest for 5 days',description:'Reach level 5 within five days of installing the game.',reward:25,estimatedTime:'5 days',proofType:'screenshot',taskLink:'https://example.com/playquest',instructions:['Open the task link and install PlayQuest (new install)','Open the app on at least 3 different days','Reach level 5','Take a screenshot of your level screen','Submit the screenshot as proof']},
 {id:'TASK_007',icon:'📝',title:'Product survey',description:'Answer ten short questions honestly.',reward:12,estimatedTime:'6 min',proofType:'text',taskLink:'',instructions:['Answer all ten questions honestly','Only one response per person','Write a short summary of your answers as proof']}
].map((x,i)=>({...x,image:mkImg(IMGC[i][0],IMGC[i][1],x.icon),active:true,createdAt:Date.now()-(i+1)*864e5,updatedAt:Date.now()-(i+1)*864e5}));

let TOFF=0;const now=()=>Date.now()+TOFF;
/* ===== APP STATE & STORAGE (swap load/save for backend later) ===== */
const normUrl=u=>{u=String(u||'').trim();if(!u)return'';{const m=u.match(/https?:\/\/[^\s<>"']+/i);if(m)u=m[0].replace(/[)\].,;!]+$/,'')}u=u.replace(/\s+/g,'');if(!u)return'';if(/^@[A-Za-z0-9_]{4,}$/.test(u))return'https://t.me/'+u.slice(1);if(/^https?:\/\/\S+$/i.test(u))return u;if(/^\/\/\S+$/.test(u))return'https:'+u;if(/^(www\.)?[a-z0-9-]+(\.[a-z0-9-]+)+([\/?#]\S*)?$/i.test(u))return'https://'+u;return''};
/* ---- smart link opener: Telegram / Play Store links open the real APP first (works even when t.me web is blocked or slow), then fall back to the web link ---- */
const tgDeep=u=>{const m=String(u).match(/^https?:\/\/(?:www\.)?(?:t|telegram)\.(?:me|dog)\/([^?#]+)(?:\?([^#]*))?/i);if(!m)return'';const p=m[1].replace(/\/+$/,''),q=m[2]?'&'+m[2]:'';let x;
 if(p.charAt(0)==='+')return'tg://join?invite='+encodeURIComponent(p.slice(1));
 if((x=p.match(/^joinchat\/([\w-]+)$/i)))return'tg://join?invite='+encodeURIComponent(x[1]);
 if((x=p.match(/^([A-Za-z][A-Za-z0-9_]{3,})\/(\d+)$/)))return'tg://resolve?domain='+x[1]+'&post='+x[2];
 if(/^(s|c|addstickers|share|proxy|socks|login|addtheme|setlanguage|bg|invoice|boost|addemoji|addlist)(\/|$)/i.test(p))return'';
 if(/^[A-Za-z][A-Za-z0-9_]{3,}$/.test(p))return'tg://resolve?domain='+p+q;return''};
const playDeep=u=>{const m=String(u).match(/^https?:\/\/play\.google\.com\/store\/apps\/details\?(?:[^#]*&)?id=([A-Za-z0-9_.]+)/i);return m?'market://details?id='+m[1]:''};
/* ---- universal app opener: ANY link the admin adds (YouTube, Instagram, Facebook, X, WhatsApp, LinkedIn, Snapchat, Reddit, Spotify, any website...) is sent to the phone's system via an Android intent, so the installed app (or default browser) opens it directly - not the in-app WebView ---- */
const APKG={'youtube.com':'com.google.android.youtube','youtu.be':'com.google.android.youtube','instagram.com':'com.instagram.android','facebook.com':'com.facebook.katana','fb.com':'com.facebook.katana','fb.watch':'com.facebook.katana','twitter.com':'com.twitter.android','x.com':'com.twitter.android','whatsapp.com':'com.whatsapp','wa.me':'com.whatsapp','linkedin.com':'com.linkedin.android','snapchat.com':'com.snapchat.android','reddit.com':'com.reddit.frontpage','spotify.com':'com.spotify.music','pinterest.com':'com.pinterest','threads.net':'com.instagram.barcelona'};
const intentDeep=u=>{try{const x=new URL(u);if(!/^https?:$/.test(x.protocol))return'';const pk=APKG[x.hostname.split('.').slice(-2).join('.')];return'intent://'+x.host+x.pathname.replace(/;/g,'%3B')+x.search.replace(/;/g,'%3B')+'#Intent;scheme='+x.protocol.slice(0,-1)+';action=android.intent.action.VIEW;category=android.intent.category.BROWSABLE;'+(pk?'package='+pk+';':'')+'end'}catch(e){return''}};
const openWeb=u=>{try{const a=document.createElement('a');a.href=u;a.target='_blank';a.rel='noopener noreferrer';a.style.display='none';document.body.appendChild(a);a.click();setTimeout(()=>a.remove(),0)}catch(e){try{location.href=u}catch(_){}}};
/* LINK_MODE: what to do if the phone app could NOT be opened.
   'popup' = show the Copy-link popup (safe for HopWeb-type builders that cannot open apps)
   'web'   = open the https link normally (use this with builders that have an 'open external links outside' option) */
const LINK_MODE='popup';
const openExt=u=>{u=normUrl(u);if(!u){showToast('⚠ Link not available');return false}
 const ua=navigator.userAgent||'',and=/Android/i.test(ua);
 try{if(window.cordova&&window.open){window.open(u,'_system');return true}}catch(e){}
 if(!and){openWeb(u);return true}
 const d1=tgDeep(u)||playDeep(u),d2=intentDeep(u),wv=/; wv\)|Version\/[\d.]+ Chrome/i.test(ua)||!/Chrome\//i.test(ua);
 let gone=false;const mark=()=>{gone=true},vis=()=>{if(document.hidden)mark()};
 document.addEventListener('visibilitychange',vis);addEventListener('pagehide',mark);addEventListener('blur',mark);
 const nav=x=>{const a=document.createElement('a');a.href=x;a.style.display='none';document.body.appendChild(a);a.click();setTimeout(()=>a.remove(),0)};
 const ifr=x=>{const f=document.createElement('iframe');f.style.cssText='display:none;width:0;height:0;border:0';f.src=x;document.body.appendChild(f);setTimeout(()=>f.remove(),2500)};
 /* try every way to hand the link to the phone's own app, one after another, until the app opens */
 const steps=[];
 if(wv){if(d1||d2)steps.push(()=>ifr(d1||d2));if(d2)steps.push(()=>nav(d2));else if(d1)steps.push(()=>nav(d1))}
 else{if(d1)steps.push(()=>nav(d1));if(d2)steps.push(()=>nav(d2))}
 if(!steps.length){openWeb(u);return true}
 steps.forEach((fn,i)=>setTimeout(()=>{if(!gone)try{fn()}catch(e){}},i*900));
 setTimeout(()=>{document.removeEventListener('visibilitychange',vis);removeEventListener('pagehide',mark);removeEventListener('blur',mark);if(gone)return;if(wv&&((typeof CFG!=='undefined'&&CFG&&CFG.linkMode)||LINK_MODE)!=='web'){const e=String(u).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;');openModal(`<h2>Open this link</h2><p class="muted sm" style="margin:8px 0 10px">Link app ke andar nahi khul paya. Neeche se copy karke YouTube / Browser / Play Store mein open karo, phir wapas aakar proof submit karo.</p><p class="sm" style="overflow-wrap:anywhere;margin-bottom:12px"><b>${e}</b></p><div class="col"><button class="btn p full" data-act="copy" data-p="${e}">Copy link</button><a class="btn full" href="${e}" target="_blank" rel="noopener noreferrer">Try opening here</a>${closeBtn('Close')}</div>`)}else openWeb(u)},steps.length*900+700);return true};
const appName=()=>{try{return String(window.SmartCash.getConfig().appName||'Smart Cash')}catch(e){return'Smart Cash'}};
let MIN_WD=50,REFERRAL_REWARD=2;const KEY='smartcash_v1',ACC='smartcash_accounts',LEVELS=['Bronze','Silver','Gold','Platinum','Diamond'];
let DAILY=[0.10,0.20,0.30,0.40,0.50,0.60,0.70];const DEMO_CODES=['WELCOME2','SMARTCASH'];
const TXI={'Task Reward':'🎯','Daily Check-in':'🎁','Referral Reward':'👥','Bonus':'⭐','Withdrawal':'💸','Adjustment':'🛠️','Refund':'↩️'};
const NI={welcome:'👋',task:'🎯',approved:'✅',rejected:'❌',checkin:'🎁',ref:'👥',wd:'💸',sec:'🔐',info:'🔔'};
const PL={screenshot:'Screenshot',text:'Your answer',url:'Page URL (https://…)',username:'Your username or handle'};
const T={en:{home:'Home',tasks:'Tasks',refer:'Refer',wallet:'Wallet',profile:'Profile',settings:'Settings',notifs:'Notifications',checkin:'Daily check-in',withdraw:'Withdraw',balance:'Available balance',tx:'Transactions',login:'Log in',register:'Create account',save:'Save',cancel:'Cancel',claim:'Claim',start:'Start task'},
hi:{home:'होम',tasks:'टास्क',refer:'रेफर',wallet:'वॉलेट',profile:'प्रोफ़ाइल',settings:'सेटिंग्स',notifs:'सूचनाएँ',checkin:'दैनिक चेक-इन',withdraw:'निकासी',balance:'उपलब्ध बैलेंस',tx:'लेनदेन',login:'लॉग इन',register:'खाता बनाएँ',save:'सहेजें',cancel:'रद्द करें',claim:'क्लेम करें',start:'टास्क शुरू करें'},
es:{home:'Inicio',tasks:'Tareas',refer:'Invitar',wallet:'Cartera',profile:'Perfil',settings:'Ajustes',notifs:'Notificaciones',checkin:'Registro diario',withdraw:'Retirar',balance:'Saldo disponible',tx:'Transacciones',login:'Iniciar sesión',register:'Crear cuenta',save:'Guardar',cancel:'Cancelar',claim:'Reclamar',start:'Iniciar tarea'}};
const LG={'English':'en','हिन्दी':'hi','Español':'es'};
const t=k=>((T[LG[S.set.lang]]||T.en)[k])||T.en[k]||k;
const ymd=(d=new Date(now()))=>{const x=new Date(d.getTime()+19800000);return x.getUTCFullYear()+'-'+String(x.getUTCMonth()+1).padStart(2,'0')+'-'+String(x.getUTCDate()).padStart(2,'0')};
const seed=()=>({onboarded:0,auth:0,remember:1,theme:'dark',user:{name:'',email:'',phone:'',id:'',since:'',createdAt:0,code:'',referredBy:'',refUsed:'',refDate:'',photo:''},
 bal:0,pendT:0,pendW:0,earned:0,wd:0,eTask:0,eCheck:0,eRef:0,eBonus:0,today:0,todayDate:ymd(),xp:0,done:0,
 ci:{currentDay:1,lastClaimDate:'',lastClaimedDay:0,streak:0,longestStreak:0,totalRewards:0,totalClaims:0,cycleNumber:1,claimedDays:[]},
 tasks:{},credited:[],bcSeen:[],applied:[],saved:[],tx:[],notifs:[],refs:[],acts:[],pay:[],tickets:[],reports:[],set:{push:1,remind:1,lang:'English'}});
/* merge saved data over defaults so missing/corrupt properties never crash the app */
const mg=(d,s)=>{if(s===null||typeof s!=='object'||Array.isArray(d)!==Array.isArray(s))return d;if(Array.isArray(d))return s;if(!Object.keys(d).length)return s;const o={...d};for(const k in d)if(k in s&&typeof d[k]===typeof s[k])o[k]=(d[k]&&typeof d[k]==='object')?mg(d[k],s[k]):s[k];return o};
const parse=k=>{try{return JSON.parse(localStorage.getItem(k))}catch(e){return null}};
/* ===== TASK DATA BRIDGE (replace the bodies of getTasks/setTasks with Firebase/API calls later) ===== */
const TASK_KEY='smartcash_tasks';
const LEGACY={1:'TASK_001',2:'TASK_002',3:'TASK_003',4:'TASK_004',5:'TASK_005',6:'TASK_006',7:'TASK_007'}; /* pre-Task-Center numeric ids */
const getTasks=()=>{const a=parse(TASK_KEY);return Array.isArray(a)?a:DEMO_TASKS};          /* raw admin task list */
const setTasks=a=>{try{localStorage.setItem(TASK_KEY,JSON.stringify(a))}catch(e){}};
const toList=v=>Array.isArray(v)?v.map(String).filter(Boolean):typeof v==='string'?v.split(/\r?\n/).map(s=>s.trim()).filter(Boolean):[];
const normTask=x=>{const proof=['screenshot','text','url','username'].includes(x.proofType||x.proof)?(x.proofType||x.proof):'screenshot',desc=String(x.description||x.desc||'');
 return{id:String(x.id),title:String(x.title),desc,description:desc,image:typeof x.image==='string'?x.image:'',icon:x.icon||'🎯',reward:+x.reward||0,instructions:toList(x.instructions&&x.instructions.length?x.instructions:x.req),taskLink:typeof x.taskLink==='string'?x.taskLink.trim():'',proof,proofType:proof,active:x.active!==false,createdAt:+x.createdAt||0,updatedAt:+x.updatedAt||0,dur:String(x.estimatedTime||x.dur||x.duration||'')}};
/* getAdminTasks(): every Admin-published task, normalised. Read fresh each call so Admin changes appear without a reload. */
const getAdminTasks=()=>{const seen={};return getTasks().filter(x=>x&&x.id!=null&&x.title&&!seen[x.id]&&(seen[x.id]=1)).map(normTask)};
const activeTasks=()=>getAdminTasks().filter(x=>x.active);
/* per-user task state lives in S.tasks (S is already per-account): {s,status,startedAt,submittedAt,reviewedAt,rewardCredited,proof,rejectionReason,...} */
const getUserTaskState=id=>S.tasks[id]||null;
const setUserTaskState=(id,patch)=>{const r={...(S.tasks[id]||{}),...patch};if(r.s)r.status=r.s;S.tasks[id]=r;return r};
const snapOf=k=>({id:k.id,title:k.title,description:k.desc,icon:k.icon,reward:k.reward,instructions:k.instructions,proofType:k.proof,taskLink:k.taskLink,estimatedTime:k.dur,image:k.image&&k.image.length<30000?k.image:''});
/* admin task, or (if the admin deleted it after the user submitted) the snapshot saved in the user's record so history never vanishes */
const findTask=id=>{const k=getAdminTasks().find(x=>x.id===String(id));if(k)return k;const r=S.tasks[id];return r&&r.snap?{...normTask(r.snap),active:false,removed:true}:null};
function normTasks(){const o={};for(const k in S.tasks){const r={...S.tasks[k]},id=(!r.status&&LEGACY[k])||k;if(r.s==='completed')r.s='successful';if(!r.s)continue;r.status=r.s;if(r.completedAt&&!r.reviewedAt)r.reviewedAt=r.completedAt;r.rewardCredited=!!r.rewardCredited;o[id]=r}S.tasks=o;if(!Array.isArray(S.credited))S.credited=[]}
const fmtDT=ts=>ts?new Date(ts).toLocaleString('en-GB',{day:'2-digit',month:'short',year:'numeric',hour:'numeric',minute:'2-digit',hour12:true}).replace(/\b(am|pm)\b/,m=>m.toUpperCase()):'';
/* Admin-panel hooks (also usable from the browser console) */
window.SmartCash={
 getTasks:getAdminTasks,
 setTasks:a=>{setTasks(a);refreshTasks()},
 getUserTaskState:id=>getUserTaskState(id),
 setUserTaskState:(id,p)=>{setUserTaskState(id,p);save();refreshTasks()},
 approveTask:(taskId,userId)=>reviewFor(userId,taskId,true),
 rejectTask:(taskId,userId,reason)=>reviewFor(userId,taskId,false,reason),
 pendingSubmissions:()=>accts().flatMap(a=>{const st=parse('smartcash_u_'+a.id);return st&&st.tasks?Object.entries(st.tasks).filter(([,r])=>r.s==='pending'||r.status==='pending').map(([taskId,r])=>({userId:a.id,taskId,submittedAt:r.submittedAt,proof:r.proof})):[]})
};
let S=mg(seed(),parse(KEY));normTasks();
const save=()=>{try{const j=JSON.stringify(S);localStorage.setItem(KEY,j);if(S.user.id)localStorage.setItem('smartcash_u_'+S.user.id,j)}catch(e){}if(window.FB&&FB.push)FB.push()};
const accts=()=>{const a=parse(ACC);return Array.isArray(a)?a:[]};
const setAccts=a=>{try{localStorage.setItem(ACC,JSON.stringify(a))}catch(e){}};
const hash=s=>{let h=5381;for(const c of s)h=((h<<5)+h+c.charCodeAt(0))|0;return 'h'+(h>>>0).toString(36)}; /* demo only, NOT secure */
function loadUser(id){S=mg(seed(),parse('smartcash_u_'+id));normTasks();applyTheme()}
function addTx(type,desc,amt,st='Completed'){S.tx.unshift({id:'TX'+now().toString(36).toUpperCase()+Math.floor(Math.random()*90+10),type,desc,amt,st,ts:now()})}
function addNotif(t,m,k='info'){S.notifs.unshift({id:'N'+now().toString(36)+Math.floor(Math.random()*9999),t,m,k,read:0,ts:now()})}
function addAct(x){S.acts.unshift({x,ts:now()});S.acts=S.acts.slice(0,10)}
function rollDay(){if(S.todayDate!==ymd()){S.todayDate=ymd();S.today=0}}
function ciTick(){const c=S.ci;if(c.lastClaimDate&&c.streak){const d=Math.round((new Date(ymd()+'T00:00:00')-new Date(c.lastClaimDate+'T00:00:00'))/864e5);if(d>1)c.streak=0}}
/* single entry point for every credit: balance, totals, today, XP, tx all stay in sync */
function earn(kind,amt,type,desc,xp,nt,nm,nk){rollDay();const r=n=>+n.toFixed(2);S.bal=r(S.bal+amt);S.earned=r(S.earned+amt);S.today=r(S.today+amt);S['e'+kind]=r(S['e'+kind]+amt);S.xp+=xp;addTx(type,desc,amt);if(nt)addNotif(nt,nm,nk);save()}
const earnedIn=d=>S.tx.filter(x=>x.amt>0&&x.st==='Completed'&&now()-x.ts<d*864e5).reduce((a,x)=>a+x.amt,0);
const initials=n=>{const w=String(n||'').trim().split(/\s+/).filter(Boolean);return(w.length>1?w[0][0]+w[w.length-1][0]:(w[0]||'U').slice(0,2)).toUpperCase()};
const avInner=()=>S.user.photo?`<img src="${esc(S.user.photo)}" alt="">`:esc(initials(S.user.name));
const av=(sz=46)=>`<div class="av" style="width:${sz}px;height:${sz}px;font-size:${sz/2.6}px" aria-label="Avatar">${avInner()}</div>`;
function strength(v){const s=(v.length>=8)+(/[a-z]/.test(v)&&/[A-Z]/.test(v))+/\d/.test(v)+/[^A-Za-z0-9]/.test(v);return v?(s<=1?['Weak',25,'var(--danger)']:s===2?['Medium',60,'var(--warning)']:['Strong',100,'var(--success)']):['',0,'']}
const codeOk=c=>/^[A-Z0-9]{4,12}$/.test(c)&&(DEMO_CODES.includes(c)||accts().some(a=>a.code===c));
function mkCode(un){const b=un.toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,6)||'USER';let c;do{c=b+Math.floor(10+Math.random()*90)}while(accts().some(a=>a.code===c)||DEMO_CODES.includes(c));return c}
function addRefTo(code,name){const r=accts().find(a=>a.code===code);if(!r)return;const st=mg(seed(),parse('smartcash_u_'+r.id));st.refs.unshift({n:name,st:'Registered',e:0,ts:now()});st.notifs.unshift({id:'N'+now().toString(36),t:'Referral update',m:name+' joined with your code.',k:'ref',read:0,ts:now()});try{localStorage.setItem('smartcash_u_'+r.id,JSON.stringify(st))}catch(e){}}
function loadDemo(){const T0=now(),y=new Date(now()-864e5);rollDay();
 Object.assign(S,{bal:245.8,earned:412.5,eTask:382.7,eCheck:.6,eRef:4,eBonus:25.2,wd:166.7,xp:1780,done:3,today:8});
 Object.assign(S.ci,{currentDay:4,lastClaimDate:ymd(y),lastClaimedDay:3,streak:3,longestStreak:5,totalRewards:.6,totalClaims:3,cycleNumber:1,claimedDays:[1,2,3]});
 S.tasks={TASK_003:{s:'successful',status:'successful',reward:4,rewardCredited:true,submittedAt:T0-5*36e5,reviewedAt:T0-36e5,snap:snapOf(findTask('TASK_003'))},TASK_004:{s:'successful',status:'successful',reward:3,rewardCredited:true,submittedAt:T0-30*36e5,reviewedAt:T0-26*36e5,snap:snapOf(findTask('TASK_004'))},TASK_005:{s:'successful',status:'successful',reward:2.5,rewardCredited:true,submittedAt:T0-52*36e5,reviewedAt:T0-50*36e5,snap:snapOf(findTask('TASK_005'))}};
 S.tx=[{id:'TXDEMO1',type:'Task Reward',desc:'Join Deal Hunters on Telegram',amt:4,st:'Completed',ts:T0-36e5},{id:'TXDEMO2',type:'Daily Check-in',desc:'Daily Check-in Reward · Day 3',amt:.3,st:'Completed',ts:T0-864e5},{id:'TXDEMO3',type:'Referral Reward',desc:'Referral qualified: Aman S.',amt:2,st:'Completed',ts:T0-2*864e5},{id:'TXDEMO4',type:'Withdrawal',desc:'Withdrawal to UPI',amt:-100,st:'Completed',ts:T0-5*864e5}];
 S.refs=[{n:'Aman S.',st:'Qualified',e:2,ts:T0-2*864e5},{n:'Priya V.',st:'Qualified',e:2,ts:T0-6*864e5},{n:'Rohan D.',st:'Registered',e:0,ts:T0-8*864e5}];
 S.acts=[{x:'Task approved: Join Deal Hunters on Telegram',ts:T0-36e5},{x:'Completed Daily Check-in Day 3',ts:T0-864e5},{x:'Account created',ts:T0-9*864e5}];
 save()}


/* ===== HELPERS ===== */
const $=s=>document.querySelector(s), money=n=>(n<0?'-':'')+'₹'+Math.abs(n).toFixed(2);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const ago=t=>{const m=Math.round((now()-t)/6e4);return m<1?'Just now':m<60?m+' min ago':m<1440?Math.round(m/60)+' h ago':new Date(t).toLocaleDateString()};
const unread=()=>S.notifs.filter(n=>!n.read).length;
const level=()=>Math.min(5,Math.floor(S.xp/1000)+1);
const tstatus=t=>(S.tasks[t.id]||{}).s||'available';
function showToast(m){const e=document.createElement('div');e.className='toast';e.textContent=m;$('#toasts').append(e);setTimeout(()=>e.remove(),2800)}
function openModal(h){$('#sheet').innerHTML=h;$('#modal').classList.add('show')}
function closeModal(){$('#modal').classList.remove('show')}
function updateStats(){const b=$('#nbadge');if(b){b.textContent=unread();b.hidden=!unread()}}
function countUp(el,to){if(!el)return;const t0=performance.now();(function f(t){const p=Math.min(1,(t-t0)/800);el.textContent=money(to*(1-Math.pow(1-p,3)));if(p<1)requestAnimationFrame(f)})(t0)}

/* ===== COMPONENTS ===== */
const ST={available:['Active','','Start Task'],started:['In progress','wa','Continue Task'],pending:['⏳ Pending Review','wa','View Status'],successful:['✅ Successful','ok','View Details'],rejected:['❌ Task Rejected','er','Review & Retry']};
const PLN={screenshot:'Screenshot',text:'Text answer',url:'Page URL',username:'Username / handle'};
const timg=(k,c='')=>`<div class="timg ${c}"><span aria-hidden="true">${esc(k.icon||'🎯')}</span>${k.image?`<img src="${esc(k.image)}" alt="${esc(k.title)}" loading="lazy" onerror="this.remove()">`:''}</div>`;
function renderTaskCard(k,mode='active'){const r=S.tasks[k.id]||{},s=tstatus(k),m=ST[s]||ST.available,rw=mode!=='active'&&r.reward!=null?+r.reward:k.reward,id=esc(k.id);
 let mid='',btn;
 if(mode==='active'){mid=(k.dur?`<div class="tmeta muted"><span>⏱ ${esc(k.dur)}</span></div>`:'');btn=`<button class="btn p full" style="margin-top:10px" data-act="openTask" data-p="${id}">${s==='started'?'Continue Task':'View Task'}</button>`}
 else if(mode==='pending'){mid=`<div class="tmeta muted"><span>Submitted:</span><b>${fmtDT(r.submittedAt)}</b></div>`;btn=`<button class="btn full" style="margin-top:10px" data-act="taskStatus" data-p="${id}">View Status</button>`}
 else if(mode==='successful'){mid=`<div class="tmeta"><span class="rw">Reward Credited: ₹${rw.toFixed(2)}</span></div><div class="tmeta muted"><span>Approved:</span><b>${fmtDT(r.reviewedAt)}</b></div>`;btn=`<button class="btn full" style="margin-top:10px" data-act="openTask" data-p="${id}">View Details</button>`}
 else{mid=`<div class="rsn"><b>Reason:</b> ${esc(r.rejectionReason||'Please review the task requirements.')}</div><div class="tmeta muted"><span>Rejected:</span><b>${fmtDT(r.reviewedAt)}</b></div>`;btn=`<button class="btn p full" style="margin-top:10px" data-act="openTask" data-p="${id}">Review &amp; Retry</button>`}
 const chip=mode==='active'?(s==='started'?'In progress':'Active'):m[0];
 return `<div class="card task tk" data-tid="${id}">${timg(k)}<div class="tb"><div class="row sp" style="align-items:flex-start;gap:8px"><h3>${esc(k.title)}</h3><span class="chip ${mode==='active'?(s==='started'?'wa':'ok'):m[1]}" style="white-space:nowrap">${chip}</span></div>${mode==='active'?`<p class="muted sm" style="margin:4px 0 8px">${esc(k.desc)}</p>`:''}<div class="row sp" style="margin-top:${mode==='active'?0:6}px"><span class="rw">${mode==='active'?'Reward ':'Reward: '}₹${rw.toFixed(2)}</span></div>${mid}${btn}</div></div>`}
/* Task Center data: counts + lists for the logged-in user */
function taskLists(){const L={active:[],pending:[],successful:[],rejected:[]},seen={},ts=k=>{const r=S.tasks[k.id]||{};return r.reviewedAt||r.submittedAt||0};
 getAdminTasks().forEach(k=>{seen[k.id]=1;const s=tstatus(k);if(s==='pending'||s==='successful'||s==='rejected'){L[s].push(k);if(s==='rejected'&&k.active)L.active.push(k)}else if(k.active)L.active.push(k)});
 for(const id in S.tasks){if(seen[id])continue;const s=S.tasks[id].s;if(s==='pending'||s==='successful'||s==='rejected'){const k=findTask(id);if(k)L[s].push(k)}}
 L.active.sort((a,b)=>b.createdAt-a.createdAt);['pending','successful','rejected'].forEach(s=>L[s].sort((a,b)=>ts(b)-ts(a)));
 /* history = sirf latest 10 (approved+rejected mila kar); purani apne aap hat jati hain */
 L.nS=L.successful.length;L.nR=L.rejected.length;{const keep=new Set([...L.successful,...L.rejected].sort((a,b)=>ts(b)-ts(a)).slice(0,10).map(k=>k.id));L.successful=L.successful.filter(k=>keep.has(k.id));L.rejected=L.rejected.filter(k=>keep.has(k.id))}
 return L}
const TCS=[['active','🎯','Active Tasks','Available tasks','var(--primary)'],['pending','⏳','Pending Tasks','Waiting for verification','var(--warning)'],['successful','✅','Successful Tasks','Approved & rewarded','var(--success)'],['rejected','❌','Rejected Tasks','Review and retry','var(--danger)']];
const tcCards=()=>{const L=taskLists();return TCS.map(([k,i,n,d,c])=>`<button class="tcs ${F.tab===k?'on':''}" style="--c:${c}" data-act="tab" data-p="${k}" aria-pressed="${F.tab===k}"><span class="ic" aria-hidden="true">${i}</span><span class="n">${L[k].length}</span><b>${n}</b><span class="muted">${d}</span></button>`).join('')};
const TEMPTY={active:['🎯','No active tasks','New earning opportunities will appear here.'],pending:['⏳','No pending tasks','Tasks waiting for verification will appear here.'],successful:['✅','No successful tasks yet','Complete your first task to see it here.'],rejected:['❌','No rejected tasks','Great! You currently have no rejected tasks.']};
function listTasks(){const q=F.q.trim().toLowerCase(),l=taskLists()[F.tab].filter(x=>!q||(x.title+' '+x.desc).toLowerCase().includes(q));
 $('#tl').innerHTML=l.length?`<div class="tasks">${l.map(x=>renderTaskCard(x,F.tab)).join('')}</div>`:(q?empty('🔎','No matching tasks','Try a different keyword.'):empty(...TEMPTY[F.tab]))}
const empty=(i,t,m)=>`<div class="empty"><b>${i}</b><h3>${t}</h3><p class="sm">${m}</p></div>`;
const tb=(t,back=1)=>`<div class="bar">${back?'<button class="ib" data-act="back" aria-label="Back">‹</button>':''}<h2>${t}</h2></div>`;
const sk=n=>Array(n).fill('<div class="sk"></div>').join('');

/* ===== ROUTER ===== */
const TABS=['home','tasks','refer','wallet','profile'], BARE=['splash','onboard','auth'];
let cur={n:'splash',p:null}, hist=[], loaded={}, F={tab:'active',q:''}, timers=[];
function navigateTo(n,p,noPush){timers.forEach(clearTimeout);timers=[];closeModal();if(!noPush&&cur.n!=='splash')hist.push(cur);if(TABS.includes(n))hist=[];const same=noPush&&cur.n===n&&cur.p===p;cur={n,p};
 document.body.classList.toggle('nonav',BARE.includes(n)||!S.auth);const root=$('#view');if(!same){root.style.animation='none';root.offsetWidth;root.style.animation=''}window.scrollTo(0,0);
 const heavy=['home','tasks','wallet','notifs'].includes(n)&&!loaded[n];
 if(heavy){root.innerHTML=sk(5);loaded[n]=1;timers.push(setTimeout(draw,380))}else draw();
 function draw(){root.innerHTML=SCREENS[n](p==null?undefined:p);if(AFTER[n])AFTER[n](p);buildNav();updateStats()}}
function back(){const h=hist.pop();navigateTo(h?h.n:'home',h?h.p:null,true)}
const NAV=[['home','🏠'],['tasks','🎯'],['refer','👥'],['wallet','💰'],['profile','👤']];
function buildNav(){const act=TABS.includes(cur.n)?cur.n:({task:'tasks',progress:'tasks',verify:'tasks',tx:'wallet',checkin:'home',notifs:'home',leaders:'profile',rewards:'profile'})[cur.n]||'';
 $('#nav').innerHTML=NAV.map(([k,i])=>`<button data-go="${k}" class="${k===act?'on':''} ${k==='refer'?'hero':''}" aria-label="${t(k)}"><i>${i}</i>${t(k)}</button>`).join('');
 $('#side').innerHTML=`<div class="row" style="margin:0 8px 18px"><div class="logo" style="width:42px;height:42px;font-size:22px;border-radius:13px;animation:none;box-shadow:none">🪙</div><h2>${esc(appName())}</h2></div>`+NAV.concat([['notifs','🔔'],['settings','⚙️']]).map(([k,i])=>`<button class="n ${k===act?'on':''}" data-go="${k}"><i>${i}</i>${t(k)}</button>`).join('')}

/* ===== SCREENS ===== */
const SCREENS={
splash:()=>`<div class="hero-s"><div class="logo">🪙</div><h1>${esc(appName())}</h1><p class="muted">Tasks that reward you</p><div class="prog" style="width:140px"><i style="width:0;animation:ld 1.6s forwards"></i></div></div><style>@keyframes ld{to{width:100%}}</style>`,
onboard:(i=0)=>{const s=[['🔎','Discover tasks','Browse fresh app, video and social tasks picked for you.'],['🎁','Complete tasks & earn rewards','Follow the steps, submit, and get rewarded after review.'],['💸','Withdraw your eligible balance','Once you reach the minimum, request a payout to your UPI ID.']][i];
 return `<div class="hero-s"><div class="logo" style="animation-duration:3s">${s[0]}</div><h1>${s[1]}</h1><p class="muted" style="max-width:300px">${s[2]}</p><div class="dots">${[0,1,2].map(k=>`<i class="${k===i?'on':''}"></i>`).join('')}</div><div class="row" style="width:100%;max-width:340px"><button class="btn" data-act="skipOb" style="flex:1">Skip</button><button class="btn p" data-act="nextOb" data-p="${i}" style="flex:2">${i===2?'Get started':'Next'}</button></div></div>`},
terms:()=>tb('Terms')+`<div class="card col sm muted"><p><b>Rewards.</b> Rewards are credited only after each submission is reviewed and approved.</p><p>Rewards in a live product depend on review of each submission and may be adjusted or declined.</p><p>Do not submit false completions or use multiple accounts.</p></div>`,
privacy:()=>tb('Privacy')+`<div class="card col sm muted"><p>Your account, wallet, tasks and payout details are stored securely online so you can use ${esc(appName())} on any device.</p><p>Payout details are used only to send your withdrawals. We do not sell your data.</p></div>`,
rewards:()=>{const lv=level();return tb('Levels & rewards')+`<div class="col">${LEVELS.map((n,i)=>`<div class="card row"><div class="ti">${['🥉','🥈','🥇','💠','💎'][i]}</div><div class="mid" style="flex:1"><b>Level ${i+1} · ${n}</b><div class="muted sm">${i*1000} XP${i+1>1?' · unlocks harder, higher-paying tasks':''}</div></div>${lv>i+1?'<span class="chip ok">Done</span>':lv===i+1?'<span class="chip wa">Current</span>':'<span class="chip">Locked</span>'}</div>`).join('')}</div><button class="btn full" style="margin-top:12px" data-go="leaders">View leaderboard</button>`},
};

/* ===== SMART CASH MODULES: screens ===== */
Object.assign(F,{sort:'rec',st:'all',df:'all'});
let PF='',TF='all',WD=null,LB='all',FP={step:1,email:'',code:''};
const fld=(id,l,ph,ty='text',x='')=>`<label for="${id}">${l}</label><input id="${id}" type="${ty}" placeholder="${ph}" ${x}><p class="fe" id="e_${id}"></p>`;
const pwf=(id,l,ph,str)=>`<label for="${id}">${l}</label><div class="row"><input id="${id}" type="password" placeholder="${ph}" autocomplete="${id==='pw'?'current-password':'new-password'}" ${str?'data-str="1"':''}><button class="ib" type="button" data-act="eye" data-p="${id}" aria-label="Show or hide password">👁</button></div>${str?'<div class="prog" style="height:6px;margin-top:6px"><i id="str" style="width:0"></i></div><p class="sm muted" id="strt" style="margin-top:2px"></p>':''}<p class="fe" id="e_${id}"></p>`;
const showErrs=(ids,E)=>ids.forEach(i=>{const e=$('#e_'+i);if(e)e.textContent=E[i]||''});
const stat=(a,b)=>`<div class="card c"><div class="b" style="font-size:17px">${b}</div><div class="muted sm">${a}</div></div>`;
const trk=(cur,mode)=>`<div class="card col" style="gap:8px">${['Task started','Instructions','Action completed','Proof submitted','Verification','Reward'].map((n,i)=>{const k=i+1,c=k===cur?(mode||'cur'):k<cur?'ok':'';return `<div class="trk ${c}"><i>${c==='ok'?'✓':c==='er'?'✕':k}</i><span>${n}</span></div>`}).join('')}</div>`;
const grp=(l,h)=>l.length?`<h3 class="sec">${h} (${l.length})</h3>`+l.map(n=>`<div class="card row ${n.read?'':'unread'}" style="margin-bottom:8px;align-items:flex-start"><span style="font-size:22px">${NI[n.k]||'🔔'}</span><div style="flex:1;min-width:0;overflow-wrap:anywhere"><b>${esc(n.t)}</b><div class="muted sm">${esc(n.m)}</div><div class="muted sm">${ago(n.ts)}</div></div><div class="col" style="gap:6px">${n.read?'':`<button class="btn s" data-act="readOne" data-p="${n.id}">Mark read</button>`}<button class="btn s" data-act="delNotif" data-p="${n.id}" aria-label="Delete notification">✕</button></div></div>`).join(''):'';
function renderTransaction(x){const cr=x.amt>0,cl=x.st==='Rejected'?'er':x.st==='Pending'?'wa':'ok',d=new Date(x.ts);return `<div class="li"><div class="ti" style="width:40px;height:40px;font-size:18px">${TXI[x.type]||'💳'}</div><div class="mid"><b>${esc(x.type)}</b><div class="muted sm">${esc(x.desc)}</div><div class="muted sm">${d.toLocaleDateString()} ${d.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})} · ${esc(String(x.id))}</div></div><div style="text-align:right"><div class="${cr?'cr':'dr'}">${cr?'+ ':'- '}${money(Math.abs(x.amt))}</div><span class="chip ${cl}">${x.st}</span></div></div>`}
const actList=n=>`<div class="card">${S.acts.slice(0,n).map(a=>`<div class="li"><span>📌</span><div class="mid">${esc(a.x)}<div class="muted sm">${ago(a.ts)}</div></div></div>`).join('')||empty('📭','No activity yet','Complete a task or claim your check-in.')}</div>`;
let WA='https://wa.me/919568153948?text='+encodeURIComponent('Hello Smart Cash Support, I need help with my account.');
let FAQ2=[['How can I earn?','Complete tasks, claim your Daily Check-in, and refer friends. Every credit appears in Wallet and Transactions.'],['How do tasks work?','Open a task, follow the steps, submit your proof, then wait for review.'],['When is reward credited?','After a task is approved. Until then it shows as a pending task reward.'],['What is Daily Check-in?','A 7-day reward cycle: ₹0.10 on Day 1 rising to ₹0.70 on Day 7, then it starts again at Day 1.'],['What happens if I miss a day?','Your streak resets, but your reward day stays the same. If you were on Day 4, your next claim is still Day 4.'],['Minimum withdrawal?','The minimum is ₹'+MIN_WD+'. Requests are reviewed and paid to your UPI or bank account.'],['How does referral work?','Share your code. You earn ₹'+REFERRAL_REWARD+' after your friend completes the qualifying action, not at signup.'],['Why is task pending?','Submitted proof is waiting for review. You will be notified once it is approved or rejected.']];
Object.assign(SCREENS,{
auth:(m='login')=>{const L=m==='login';return `<div class="hero-s" style="justify-content:flex-start;padding-top:6vh"><div class="logo" style="width:68px;height:68px;font-size:34px;border-radius:20px">🪙</div><h1>${L?'Welcome back':'Create your '+esc(appName())+' account'}</h1><p class="muted sm" style="max-width:340px">Secure sign-in. Your account and rewards are saved online.</p><div class="card" style="width:100%;max-width:400px;text-align:left">${L?fld('em','Email address','you@example.com','email','autocomplete="username"')+pwf('pw','Password','Your password',0)+`<div class="row sp sm"><label style="margin:0;display:flex;gap:6px;align-items:center"><input type="checkbox" id="rm" style="width:auto;min-height:0" checked>Remember me</label><button data-act="fgo" class="muted">Forgot password?</button></div><button class="btn p full" style="margin-top:14px" data-act="doLogin">${t('login')}</button>`:fld('fn','Full name','Your full name','text','autocomplete="name"')+fld('em','Email ID','you@example.com','email','autocomplete="email"')+fld('ph','Phone number','+91 98765 43210','tel','autocomplete="tel" inputmode="tel"')+pwf('pw','Password','At least 8 characters',1)+pwf('cp','Confirm password','Repeat password',0)+fld('rc','Referral code (optional)','Enter referral code (optional)','text','maxlength="12" style="text-transform:uppercase"')+`<p class="sm muted" style="margin-top:10px">By creating an account you agree to the <button type="button" class="b" style="color:var(--secondary)" data-act="showTerms">Terms & Privacy Policy</button>.</p><button class="btn p full" data-act="doReg">${t('register')}</button>`}</div><button class="muted" data-act="swAuth" data-p="${m}">${L?'New here? Create account':'Have an account? Log in'}</button></div>`},
forgot:()=>{const s=FP.step;return `<div class="hero-s" style="justify-content:flex-start;padding-top:8vh"><div class="logo" style="width:68px;height:68px;font-size:34px;border-radius:20px">🔑</div><h1>Reset password</h1><p class="muted sm">We will email you a link to reset your password.</p><div class="card" style="width:100%;max-width:400px;text-align:left">${s===1?fld('em','Email address','you@example.com','email')+'<button class="btn p full" data-act="fgSend">Send reset link</button>':s===2?`<p class="sm">Demo reset code for <b>${esc(FP.email)}</b>:</p><div class="big c" style="font-size:30px;letter-spacing:4px">${FP.code}</div>`+fld('fc','Enter the 6-digit code','123456','text','inputmode="numeric" maxlength="6"')+'<button class="btn p full" data-act="fgCode">Verify code</button>':s===3?pwf('np','New password','At least 8 characters',1)+pwf('cp','Confirm new password','Repeat password',0)+'<button class="btn p full" data-act="fgPw">Update password</button>':`<div class="c"><div class="ring ok">✓</div><h2 style="margin-top:10px">Password updated</h2><button class="btn p full" style="margin-top:14px" data-act="toLogin">${t('login')}</button></div>`}</div>${s<4?'<button class="muted" data-act="toLogin">Back to log in</button>':''}</div>`},
home:()=>{rollDay();ciTick();const h=new Date().getHours(),g=h<12?'Good morning':h<18?'Good afternoon':'Good evening',c=S.ci,got=c.lastClaimDate===ymd(),r=DAILY[c.currentDay-1],ft=taskLists().active.slice(0,3);
 return `<div class="row sp" style="margin-bottom:16px"><div class="row"><button data-go="profile" aria-label="Profile">${av()}</button><div><div class="muted sm">${g} 👋 · ${esc(appName())}</div><h2>${esc(S.user.name||'Friend')}</h2></div></div><button class="ib" data-go="notifs" aria-label="Notifications">🔔<span class="badge" id="nbadge" hidden></span></button></div>
 <div class="card bal"><div class="muted sm">${t('balance')}</div><div class="big" id="bal">${money(S.bal)}</div><div class="row" style="margin-top:12px"><button class="btn p" data-act="withdraw" style="flex:1">${t('withdraw')}</button><button class="btn" data-go="wallet" style="flex:1">View wallet</button></div></div>
 <button class="card row sp" style="width:100%;margin-top:10px;text-align:left" data-go="checkin"><div class="row"><span style="font-size:28px">🎁</span><div><b>${t('checkin')}</b><div class="muted sm">${got?'Claimed today · Next: Day '+c.currentDay+' · '+money(r):'Today: Day '+c.currentDay+' · '+money(r)}</div></div></div><span class="chip ${got?'ok':'wa'}">${got?'✓ Done':'Claim'}</span></button>
 <div class="grid4" style="margin-top:10px">${[["Today's earnings",money(S.today)],['Total earnings',money(S.earned)],['Tasks completed',S.done],['Referral earnings',money(S.eRef)]].map(([a,b])=>`<div class="card"><div class="muted sm">${a}</div><div class="b" style="font-size:18px">${b}</div></div>`).join('')}</div>
 <h2 class="sec">Quick actions</h2><div class="qa">${[['tasks','🎯',t('tasks')],['checkin','🎁','Check-in'],['refer','👥','Refer & Earn'],['wallet','💰',t('wallet')],['rewards','🏆','Rewards'],['tx','📊','Activity']].map(([g,i,l])=>`<button data-go="${g}"><b>${i}</b>${l}</button>`).join('')}</div>
 <div class="row sp sec"><h2>Featured tasks</h2><button class="muted sm" data-go="tasks">See all</button></div><div class="tasks">${ft.map(renderTaskCard).join('')||empty('🎉','No tasks available','Check again later.')}</div>
 <h2 class="sec">Recent activity</h2>${actList(4)}`},
tasks:()=>`<div class="tch"><h1>TASK CENTER</h1><p class="muted">Complete tasks and earn rewards</p></div><div class="tcg" id="tc">${tcCards()}</div><input id="q" type="search" placeholder="🔎 Search tasks..." value="${esc(F.q)}" aria-label="Search tasks" style="margin-bottom:12px"><div id="tl"></div>`,
task:id=>{const k=findTask(id);if(!k)return tb('Task details')+empty('🔍','Task not found','It may have been removed.');
 const s=tstatus(k),r=S.tasks[id]||{},m=ST[s]||ST.available,ins=k.instructions,rw=(s==='available'||s==='started'||r.reward==null)?k.reward:+r.reward,ok=k.active;
 const note=s==='rejected'?`<div class="card nb er"><b>❌ Task Rejected</b><p class="sm muted">Reason: ${esc(r.rejectionReason||'Please review the requirements.')}</p><p class="sm muted">Rejected: ${fmtDT(r.reviewedAt)}</p><p class="sm muted">No reward was credited. ${ok?'You can review the steps below and retry.':'This task is no longer available.'}</p></div>`
  :s==='pending'?`<div class="card nb wa"><b>⏳ Pending Review</b><p class="sm muted">Your task has been submitted successfully and is waiting for verification.</p><p class="sm muted">Submitted: ${fmtDT(r.submittedAt)}</p></div>`
  :s==='successful'?`<div class="card nb ok"><b>✅ Successful</b><p class="sm muted">Reward Credited: ₹${rw.toFixed(2)}</p><p class="sm muted">Approved: ${fmtDT(r.reviewedAt)}</p></div>`
  :s==='started'?`<div class="card nb wa"><b>In progress</b><p class="sm muted">Complete the steps below, then submit your proof.</p></div>`:'';
 const cta=s==='available'?`<button class="btn p full tcl" data-act="startTask" data-p="${esc(k.id)}" ${ok?'':'disabled'}>${ok?'Start Task':'Task unavailable'}</button>`
  :s==='started'?`<button class="btn p full tcl" data-act="startTask" data-p="${esc(k.id)}">Continue Task</button>`
  :s==='pending'?`<button class="btn p full tcl" data-act="taskStatus" data-p="${esc(k.id)}">View Status</button>`
  :s==='rejected'?`<button class="btn p full tcl" data-act="startTask" data-p="${esc(k.id)}" ${ok?'':'disabled'}>${ok?'Retry Task':'Task no longer available'}</button>`
  :`<button class="btn full tcl" data-go="wallet">View wallet</button>`;
 return tb('Task details')+`<div class="card" style="padding:0;overflow:hidden">${timg(k,'lg')}<div style="padding:14px"><div class="row sp" style="align-items:flex-start;gap:8px"><h1 style="font-size:clamp(20px,5vw,26px)">${esc(k.title)}</h1><span class="chip ${s==='available'?'ok':m[1]}" style="white-space:nowrap">${s==='available'?'Active':m[0]}</span></div><div class="rw big" style="font-size:28px;margin:6px 0">₹${rw.toFixed(2)} <span class="muted sm" style="font-weight:600">Reward</span></div><h3 style="margin-top:10px">Description</h3><p class="muted">${esc(k.desc)||'No description provided.'}</p>${k.dur?`<p class="sm muted" style="margin-top:8px">⏱ Estimated time: ${esc(k.dur)}</p>`:''}<p class="sm muted" style="margin-top:4px">Proof required: ${PLN[k.proof]}</p></div></div>
 ${note}
 ${ins.length?`<div class="card" style="margin-top:10px"><h3>HOW TO COMPLETE</h3><ol class="sm muted steps">${ins.map(x=>`<li>${esc(x)}</li>`).join('')}</ol></div>`:''}
 ${k.taskLink&&ok&&(s==='available'||s==='started'||s==='rejected')?`<button class="btn full" style="margin-top:10px" data-act="openLink" data-p="${esc(k.id)}">🔗 Open Task Link</button>`:''}
 ${cta}
 <div class="grid2" style="margin-top:10px"><button class="btn" data-act="gotab" data-p="${s==='available'||s==='started'?'active':s}">‹ Task Center</button><button class="btn" data-act="reportTask" data-p="${esc(k.id)}">⚑ Report task</button></div>`},
progress:id=>{const k=findTask(id),r=S.tasks[id]||{};if(!k)return tb('Task')+empty('🔍','Task not found','It may have been removed.');if(r.s!=='started')return SCREENS.task(id);const op=!!r.opened||!k.taskLink;PF='';
 const pic=o=>`<div class="pic" style="margin-top:8px"><div class="muted sm">${o?'📷 Photo (optional) — chaho to proof ke saath photo bhi laga sakte ho':'📷 Screenshot required — gallery se chuno, phir crop / adjust karo'}</div><label class="btn s" style="margin-top:6px;cursor:pointer"><input type="file" accept="image/*" data-f="proof" hidden aria-label="${o?'Choose optional photo':'Choose screenshot'}">🖼️ Gallery se chuno</label><div id="pv"></div><button class="btn s" id="rmv" data-act="rmProof" hidden style="margin-top:6px">Remove</button></div>`;
 const pf=k.proof==='screenshot'?pic(0):`<input id="pf" placeholder="${PL[k.proof]}" ${k.proof==='url'?'type="url"':''} maxlength="300" aria-label="${PL[k.proof]}">`+pic(1);
 return tb('Task in progress')+`<div class="card" style="padding:0;overflow:hidden">${timg(k)}</div><div class="card row" style="margin-top:10px"><div style="flex:1;min-width:0"><b style="overflow-wrap:anywhere">${esc(k.title)}</b><div class="rw">+₹${k.reward.toFixed(2)}</div></div></div><div style="margin-top:10px">${trk(op?4:2)}</div>
 ${k.instructions.length?`<details class="card" style="margin-top:10px"><summary><b>HOW TO COMPLETE</b></summary><ol class="sm muted steps">${k.instructions.map(x=>`<li>${esc(x)}</li>`).join('')}</ol></details>`:''}
 <div class="card col" style="margin-top:10px">${k.taskLink?`<div class="row"><div style="flex:1"><b>Open the task link</b><div class="muted sm">Complete the required action first.</div></div><button class="btn s" data-act="openLink" data-p="${esc(k.id)}">${op?'Open again':'Open'}</button></div>`:''}<div><b>Submit proof</b><div class="muted sm">${PL[k.proof]}</div></div>${pf}<button class="btn p full" data-act="submitTask" data-p="${esc(k.id)}" ${op?'':'disabled'}>Submit proof</button></div>`},
verify:id=>{const k=findTask(id),r=S.tasks[id]||{},s=r.s,rw=+(r.reward!=null?r.reward:(k?k.reward:0)),M={pending:['wa','⏳','Pending Review','Your task has been submitted successfully and is waiting for verification.'],successful:['ok','✓','Task Successful','+₹'+rw.toFixed(2)+' credited to your balance.'],rejected:['er','✕','Task Rejected',r.rejectionReason||'Please review the task requirements.']}[s];
 if(!M)return tb('Task status')+empty('📝','Nothing submitted yet','Start the task and submit your proof.')+`<button class="btn p full" data-act="gotab" data-p="active">Back to Task Center</button>`;
 const when=s==='pending'?'Submitted: '+fmtDT(r.submittedAt):(s==='successful'?'Approved: ':'Rejected: ')+fmtDT(r.reviewedAt);
 return tb('Task status')+(k?`<div class="card row" style="padding:10px;gap:12px"><div style="width:84px;flex:none;border-radius:12px;overflow:hidden">${timg(k)}</div><div style="flex:1;min-width:0"><b>${esc(k.title)}</b><div class="rw">₹${rw.toFixed(2)}</div></div></div>`:'')+`<div style="margin-top:10px">${trk(s==='successful'?7:5,s==='pending'?'wt':s==='rejected'?'er':'')}</div><div class="card c" style="margin-top:10px;padding:26px 16px"><div class="ring ${M[0]}">${M[1]}</div><h1 style="margin-top:12px">${M[2]}</h1><p class="muted">${s==='rejected'?'Reason: ':''}${esc(M[3])}</p><p class="sm muted" style="margin-top:6px">${when}</p><div class="col" style="margin-top:16px">${s==='rejected'&&k&&k.active?`<button class="btn p full" data-act="startTask" data-p="${esc(id)}">Retry Task</button><button class="btn full" data-act="openTask" data-p="${esc(id)}">Review requirements</button>`:''}<button class="btn ${s==='successful'?'p ':''}full" data-act="gotab" data-p="${s}">Back to Task Center</button>${s==='successful'?'<button class="btn full" data-go="wallet">View wallet</button>':''}</div></div>
 ${s==='pending'?`<div class="card" style="margin-top:10px"><h3>Demo testing · Admin simulation</h3><label for="rr">Rejection reason</label><select id="rr"><option>Proof unclear</option><option>Required action was not completed</option><option>Incorrect link</option><option>Task requirement not satisfied</option><option>Duplicate submission</option></select><div class="row" style="margin-top:10px"><button class="btn p s" data-act="simTask" data-p="${esc(id)}" data-r="ok" style="flex:1">Simulate approval</button><button class="btn s" data-act="simTask" data-p="${esc(id)}" data-r="no" style="flex:1">Simulate rejection</button></div></div>`:''}`},
checkin:()=>{ciTick();const c=S.ci,got=c.lastClaimDate===ymd(),d=c.currentDay,r=DAILY[d-1];
 return tb(t('checkin'))+`<div class="card bal c"><div class="muted sm">${got?'NEXT REWARD':'CURRENT DAY'}</div><div class="big">DAY ${d}</div><div class="muted sm">${got?'Next reward':"TODAY'S REWARD"}</div><div class="rw big" style="font-size:30px">${money(r)}</div></div>
 <div class="days" style="margin:12px 0">${DAILY.map((x,i)=>{const k=i+1,cl=c.claimedDays.includes(k),cu=k===d&&!got;return `<div class="day ${cl?'got':''} ${cu?'cur':''}"><span>DAY ${k}</span><b>${money(x)}</b><span>${cl?'✓ Claimed':cu?'🎁 Available':'🔒 Upcoming'}</span></div>`}).join('')}</div>
 <button class="btn p full" data-act="claim" ${got?'disabled':''}>${got?"✓ TODAY'S REWARD CLAIMED":'CLAIM '+money(r)}</button>${got?`<p class="c muted sm" style="margin-top:8px">Today's reward already claimed. Come back tomorrow.<br>Next reward: Day ${d} · ${money(r)}</p>`:''}
 <div class="grid4" style="margin-top:12px">${[['Current streak',c.streak+' days'],['Longest streak',c.longestStreak+' days'],['Total rewards',money(c.totalRewards)],['Current cycle','#'+c.cycleNumber]].map(([a,b])=>stat(a,b)).join('')}</div>
 <div class="card" style="margin-top:12px"><h3>Demo testing</h3><p class="sm muted" style="margin:4px 0 10px">Simulate calendar changes. A skipped day resets the streak but keeps your reward day.</p><div class="row"><button class="btn s" data-act="ciShift" data-p="1">Next day</button><button class="btn s" data-act="ciShift" data-p="2">Skip a day</button></div></div>`},
refer:()=>{const e=S.refs,u=S.user;return tb('Refer & Earn',0)+`<div class="card bal c"><div class="muted sm">Your referral code</div><div class="big" style="letter-spacing:3px;overflow-wrap:anywhere">${esc(u.code||'—')}</div><p class="sm muted">Earn ₹${REFERRAL_REWARD.toFixed(2)} when a friend completes the qualifying action.</p><div class="row" style="margin-top:12px;justify-content:center;flex-wrap:wrap"><button class="btn p s" data-act="copy" data-p="${esc(u.code)}">Copy code</button><button class="btn s" data-act="share">Share</button><button class="btn s" data-act="copy" data-p="${esc(shareInfo().link)}">Copy link</button></div><p class="sm muted" style="margin-top:8px;overflow-wrap:anywhere">Link: ${esc(shareInfo().link)}</p></div>
 <div class="grid4" style="margin-top:10px">${[['Referrals',e.length],['Pending',e.filter(x=>x.st!=='Qualified').length],['Qualified',e.filter(x=>x.st==='Qualified').length],['Earned',money(S.eRef)]].map(([a,b])=>stat(a,b)).join('')}</div>
 <div class="row sp sec"><h2>Referral history</h2><button class="btn s" data-act="simRef">Simulate friend</button></div><div class="card">${e.length?e.map((x,i)=>`<div class="li"><div class="av" style="width:38px;height:38px">${esc(x.n[0])}</div><div class="mid"><b>${esc(x.n)}</b><div class="muted sm">${ago(x.ts)}</div></div><div style="text-align:right"><div class="${x.e?'cr':'muted'}">${x.e?'+ '+money(x.e):'Pending'}</div>${x.st==='Qualified'?'<span class="chip ok">Qualified</span>':`<button class="btn s" data-act="qualRef" data-p="${i}">Simulate qualify</button>`}</div></div>`).join(''):empty('👥','No referrals yet','Share your code to start earning.')}</div>`},
wallet:()=>{rollDay();return `<h1 style="margin-bottom:12px">${t('wallet')}</h1><div class="card bal"><div class="muted sm">${t('balance')}</div><div class="big" id="bal">${money(S.bal)}</div><button class="btn p full" style="margin-top:12px" data-act="withdraw">${t('withdraw')}</button></div>
 <div class="grid2" style="margin-top:10px">${[['Pending task rewards',S.pendT],['Pending withdrawals',S.pendW],['Total earned',S.earned],['Total withdrawn',S.wd],["Today's earnings",S.today],['This week',earnedIn(7)],['This month',earnedIn(30)],['Task earnings',S.eTask],['Referral earnings',S.eRef],['Minimum withdrawal',MIN_WD]].map(([a,b])=>stat(a,money(b))).join('')}</div>
 <div class="grid2" style="margin-top:10px"><button class="btn" data-go="tx">${t('tx')}</button><button class="btn" data-act="payMethods">Payment methods</button></div><h2 class="sec">Recent transactions</h2><div class="card">${S.tx.length?S.tx.slice(0,4).map(renderTransaction).join(''):empty('🧾','No transactions yet','Complete your first task to see activity here.')}</div>`},
tx:()=>{const Fs=[['all','All'],['earn','Earnings'],['wd','Withdrawals'],['pend','Pending'],['done','Completed'],['rej','Rejected']],f={earn:x=>x.amt>0,wd:x=>x.type==='Withdrawal'||x.type==='Refund',pend:x=>x.st==='Pending',done:x=>x.st==='Completed',rej:x=>x.st==='Rejected'}[TF]||(()=>1),l=(c=>S.tx.filter(f).filter(x=>x.st==='Pending'||c++<10))(0),pw=S.tx.find(x=>x.type==='Withdrawal'&&x.st==='Pending');
 return tb(t('tx'))+`<div class="pills">${Fs.map(([k,n])=>`<button class="${TF===k?'on':''}" data-act="txf" data-p="${k}">${n}</button>`).join('')}</div><div class="card">${l.length?l.map(renderTransaction).join(''):empty('🧾','No transactions yet','Complete your first task to see activity here.')}</div>${pw?`<div class="card" style="margin-top:12px"><h3>Demo testing</h3><p class="sm muted" style="margin:4px 0 10px">Resolve the pending withdrawal.</p><div class="row"><button class="btn p s" data-act="wdDone" data-p="${pw.id}">Mark paid</button><button class="btn s" data-act="wdRej" data-p="${pw.id}">Reject &amp; refund</button></div></div>`:''}`},
notifs:()=>{const U=S.notifs.filter(n=>!n.read),R=S.notifs.filter(n=>n.read);return `<div class="bar"><button class="ib" data-act="back" aria-label="Back">‹</button><h2>${t('notifs')}</h2><button class="btn s" data-act="readAll" ${U.length?'':'disabled'}>Mark all read</button></div>${S.notifs.length?grp(U,'Unread')+grp(R,'Read')+'<button class="btn full" style="margin-top:8px" data-act="clearNotifs">Clear all</button>':empty('🔔','Nothing new','We will tell you about new tasks and rewards.')}`},
profile:()=>{const u=S.user,pm=S.pay.find(p=>p.def)||S.pay[0],row=(a,b)=>`<div class="li"><div style="min-width:0;flex:1"><div class="muted sm">${a}</div><b>${b}</b></div></div>`,nav=(a,i,l)=>`<button class="li" ${a}><span>${i}</span><span class="mid">${l}</span>›</button>`;
 return `<h1 style="margin-bottom:12px">${t('profile')}</h1><div class="card c"><div style="display:flex;justify-content:center;margin-bottom:8px">${av(76)}</div><h2>${esc(u.name)}</h2><div class="muted sm">Member since ${esc(u.since)}</div></div>
 <div class="card" style="margin-top:10px;padding:4px 14px">${row('Full Name',esc(u.name))}${row('Email',esc(u.email))}${row('Phone',esc(u.phone||'Not added'))}${row('Wallet Balance',money(S.bal))}${row('Referral Code',esc(u.code))}${row('Referral Earnings',money(S.eRef))}${row('Payment Method',pm?esc(pm.label):'Not added')}</div>
 <div class="grid2" style="margin-top:10px"><button class="btn" data-act="copy" data-p="${esc(u.code)}">Copy code</button><button class="btn" data-act="payMethods">Payment methods</button></div>
 <div class="card col" style="margin-top:10px;gap:0">${nav('data-act="editProfile"','✏️','Edit Profile')}${nav('data-go="settings"','⚙️','Settings')}${nav('data-go="help"','❓','Help & Support')}<button class="li dr" data-act="logout"><span>🚪</span><span class="mid">Logout</span></button></div>`},
settings:()=>{const s=S.set,sw=(k,l,i)=>`<button class="li" data-act="tog" data-p="${k}" role="switch" aria-checked="${s[k]?'true':'false'}"><span>${i}</span><span class="mid">${l}</span><span class="sw ${s[k]?'on':''}"></span></button>`,row=(a,i,l,sub)=>`<button class="li" ${a}><span>${i}</span><span class="mid">${l}${sub?`<div class="muted sm">${sub}</div>`:''}</span>›</button>`;
 return tb(t('settings'))+`<div class="card" style="padding:4px 14px"><h3 class="sec">Account</h3>${row('data-act="editProfile"','👤','Edit profile',esc(S.user.name))}${sw('push','Notifications','🔔')}${sw('remind','Check-in reminders','⏰')}${row('data-act="theme"','🎨','Theme',S.theme==='dark'?'Dark':'Light')}${row('data-act="lang"','🌐','Language',s.lang)}${row('data-act="security"','🛡️','Security')}
 <h3 class="sec">Payments</h3>${row('data-act="payMethods"','💳','Payment methods')}<h3 class="sec">Support</h3>${row('data-go="help"','❓','Help & support')}${row('data-go="help"','💬','FAQ')}${row('data-act="showTerms"','📄','Terms & Conditions')}${row('data-go="privacy"','🔒','Privacy Policy')}
 <h3 class="sec">About</h3>${row('data-go="about"','ℹ️','About '+esc(appName()))}${row('data-act="ver"','🏷️','App version','1.0.0')}<h3 class="sec">Demo tools</h3>${row('data-act="loadDemo"','🧪','Load demo data')}${row('data-act="reset"','♻️','Reset demo data')}<button class="li dr" data-act="logout"><span>🚪</span><span class="mid">Log out</span></button></div>`},
help:()=>tb('Help & Support')+`<h2 class="sec" style="margin-top:4px">FAQ</h2><div class="card" style="padding:4px 14px">${FAQ2.map(([q,a])=>`<div class="faq"><button data-act="faq" aria-expanded="false">${q}<span>›</span></button><div>${a}</div></div>`).join('')}</div>
 <h2 class="sec">Send Feedback</h2><div class="card"><label for="fcat">Category</label><select id="fcat"><option>Task Issue</option><option>Wallet / Withdrawal</option><option>Account</option><option>Suggestion</option><option>Other</option></select>${fld('fsub','Subject','Short summary')}<label for="fmsg">Message</label><textarea id="fmsg" rows="4" maxlength="500" placeholder="How can we help?" style="width:100%;padding:12px 14px;border-radius:13px;background:var(--surface-2);border:1px solid var(--border);outline:0;resize:vertical;color:inherit;font:inherit"></textarea><p class="fe" id="e_fmsg"></p><button class="btn p full" style="margin-top:8px" data-act="sendFb">Submit Feedback</button></div>
 <div class="grid2" style="margin-top:12px"><div class="card col"><b>💬 Live Chat</b><span class="muted sm">Chat with ${esc(appName())} Support</span><a class="btn p" href="${WA}" target="_blank" rel="noopener">Open WhatsApp</a></div><div class="card col"><b>🎧 Customer Support 24/7</b><span class="muted sm">Need assistance?</span><a class="btn" href="${WA}" target="_blank" rel="noopener">Contact Support</a></div></div>
 ${S.tickets.length?`<h2 class="sec">Your tickets</h2><div class="card">${S.tickets.map(x=>`<div class="li"><div class="mid"><b>${esc(x.subject||x.sub||'')}</b><div class="muted sm">${esc(x.category||x.cat||'')} · ${esc(x.id)} · ${ago(x.createdAt||x.ts)}</div></div><span class="chip wa">${esc(x.status||x.st||'open')}</span></div>`).join('')}</div>`:''}`,
about:()=>tb('About '+esc(appName()))+`<div class="card c"><div class="logo" style="margin:0 auto 12px">🪙</div><h1>${esc(appName())}</h1><p class="muted">Version 1.0.0</p></div><div class="card col sm muted" style="margin-top:10px"><p>${esc(appName())} lets you discover tasks, earn virtual rewards and track them in one place.</p><p>Tasks are reviewed by our team and approved rewards are paid to your chosen payout method.</p></div><div class="grid2" style="margin-top:10px"><button class="btn" data-act="showTerms">Terms</button><button class="btn" data-go="privacy">Privacy</button></div>`,
});
const AFTER={
splash:()=>timers.push(setTimeout(()=>(window.FBREADY||Promise.resolve()).then(()=>{const to=!S.onboarded?'onboard':!S.auth?'auth':'home';if(to==='home')loaded.home=1;navigateTo(to,null,true)}),1800)),
home:()=>countUp($('#bal'),S.bal),wallet:()=>countUp($('#bal'),S.bal),
tasks:()=>{listTasks();$('#q').oninput=e=>{F.q=e.target.value;listTasks()}}
};
/* single review entry point (Admin approve/reject). Reward is credited exactly once per submission. */
function reviewTask(id,ok,reason){const r=S.tasks[id];if(!r||r.s!=='pending')return false;
 const k=findTask(id),title=k?k.title:'Task',rw=+(r.reward!=null?r.reward:(k?k.reward:0));
 if(ok){if(r.rewardCredited||(r.submissionId&&S.credited.includes(r.submissionId)))return false;
  S.pendT=Math.max(0,+(S.pendT-rw).toFixed(2));setUserTaskState(id,{s:'successful',reviewedAt:now(),rewardCredited:true,rejectionReason:''});
  if(r.submissionId)S.credited.push(r.submissionId);S.done++;addAct('Task approved: '+title);addAct('Earned '+money(rw));
  earn('Task',rw,'Task Reward',title,Math.round(rw*20),'Task approved',money(rw)+' has been added to your balance.','approved')}
 else{S.pendT=Math.max(0,+(S.pendT-rw).toFixed(2));setUserTaskState(id,{s:'rejected',reviewedAt:now(),rejectionReason:reason||'Proof unclear',rewardCredited:false});
  addNotif('Task rejected','Your task was rejected. Check the reason and retry.','rejected');addAct('Task rejected: '+title);save()}
 return true}
function refreshTasks(){if(S.auth&&['tasks','home','task','verify','wallet','tx','notifs','profile','refer','checkin'].includes(cur.n)&&!$('#modal').classList.contains('show'))navigateTo(cur.n,cur.p,true)}
/* review a submission for ANY user account (used by the Admin Panel); other users' data is updated in storage only */
function reviewFor(userId,taskId,ok,reason){if(!userId||userId===S.user.id){const x=reviewTask(taskId,ok,reason);if(x)refreshTasks();return x}
 const raw=parse('smartcash_u_'+userId);if(!raw)return false;const bak=S;S=mg(seed(),raw);normTasks();let res=false;try{res=reviewTask(taskId,ok,reason)}finally{S=bak;save()}return res}

/* ===== TASK FLOW ===== */

/* ===== ACTIONS (delegated) ===== */
const A={
back,skipOb:()=>{S.onboarded=1;save();navigateTo('auth',null,true)},
nextOb:el=>{const i=+el.dataset.p;if(i>=2)return A.skipOb();$('#view').innerHTML=SCREENS.onboard(i+1)},
swAuth:el=>{$('#view').innerHTML=SCREENS.auth(el.dataset.p==='login'?'reg':'login')},
close:closeModal,
openTask:el=>navigateTo('task',el.dataset.p),
taskStatus:el=>navigateTo('verify',el.dataset.p),
tab:el=>{F.tab=el.dataset.p;$('#tc').innerHTML=tcCards();listTasks()},
gotab:el=>{F.tab=el.dataset.p;navigateTo('tasks')},
copy:el=>{const v=el.dataset.p;(navigator.clipboard?navigator.clipboard.writeText(v):Promise.reject()).catch(()=>{const i=document.createElement('input');i.value=v;document.body.append(i);i.select();try{document.execCommand('copy')}catch(e){}i.remove()}).finally(()=>showToast('✓ Copied'))},
share:()=>{const i=shareInfo(),d={title:i.name,text:i.text,url:i.link};navigator.share?navigator.share(d).catch(()=>{}):openModal(`<h2>Share your code</h2><p class="muted sm" style="margin:8px 0 14px">${esc(i.full)}</p><button class="btn p full" data-act="copy" data-p="${esc(i.full)}">Copy message</button>`)},
afterWd:()=>navigateTo('tx'),
faq:el=>{const f=el.parentElement,o=f.classList.toggle('open');el.setAttribute('aria-expanded',o)},
tog:el=>{const k=el.dataset.p;S.set[k]=S.set[k]?0:1;save();navigateTo('settings',null,true)},
theme:()=>{S.theme=S.theme==='dark'?'light':'dark';applyTheme();save();navigateTo('settings',null,true)},
logout:()=>openModal(`<h2>Log out?</h2><p class="muted sm" style="margin:8px 0 14px">Your demo data stays on this device.</p><div class="row"><button class="btn" data-act="close" style="flex:1">Cancel</button><button class="btn p" data-act="doLogout" style="flex:1">Log out</button></div>`),
doLogout:()=>{S.auth=0;save();navigateTo('auth',null,true)},
reset:()=>openModal(`<h2>Reset demo data?</h2><p class="muted sm" style="margin:8px 0 14px">This clears balance, tasks and settings.</p><div class="row"><button class="btn" data-act="close" style="flex:1">Cancel</button><button class="btn p" data-act="doReset" style="flex:1">Reset</button></div>`),
};
/* ===== SMART CASH MODULES: actions ===== */
const vv=id=>(($('#'+id)||{}).value||'');
const cropToast=m=>showToast('⚠ '+m);
const CROPS={dp:{name:'Profile photo',ratios:[['1:1',1]],w:192,h:192,q:.72,pv:'dp'},proof:{name:'Screenshot / photo',ratios:[['Original','orig'],['1:1',1],['4:3',4/3],['16:9',16/9]],area:520000,q:.64,pv:'free'}};
/* ---------- image cropper: gallery photo -> drag / zoom / rotate -> exact size ---------- */
function openCrop(file,cfg,done,cancel){
 const url=URL.createObjectURL(file),im=new Image();
 im.onerror=()=>{URL.revokeObjectURL(url);cropToast('Ye image khul nahi payi. JPG / PNG / WebP chuno');cancel&&cancel()};
 im.onload=()=>startCrop(im,cfg,done,cancel,url);
 im.src=url}
function startCrop(im,cfg,done,cancel,url){
 let src=im,sw=im.naturalWidth,sh=im.naturalHeight;
 if(!sw||!sh){URL.revokeObjectURL(url);cropToast('Image read nahi hui');cancel&&cancel();return}
 const RT=cfg.ratios,multi=RT.length>1;let ri=0;
 const ov=document.createElement('div');ov.id='crop';
 ov.innerHTML=`<div class="cbar"><b>✂️ ${cfg.name} crop karo</b><button type="button" class="cx" id="c_x" aria-label="Close">✕</button></div>
 <div class="cinfo" id="c_info"></div>
 <div class="cstage"><canvas id="c_cv"></canvas></div>
 <div class="cctl"><span>−</span><input type="range" id="c_z" min="0" max="100" value="0" step="0.5" aria-label="Zoom"><span>+</span></div>
 ${multi?`<div class="crow" id="c_rt">${RT.map((r,i)=>`<button type="button" class="btn s${i?'':' on'}" data-i="${i}">${r[0]}</button>`).join('')}</div>`:''}
 <div class="crow"><button type="button" class="btn s" id="c_rot">⟳ Rotate</button><button type="button" class="btn s" id="c_rs">⤢ Reset</button></div>
 <div class="cpv"><div><div class="cl">App mein aisa dikhega</div><canvas id="c_pv"></canvas></div><div id="c_q"></div></div>
 <div class="cact"><button type="button" class="btn" id="c_no">Cancel</button><button type="button" class="btn p" id="c_ok">✓ Use this image</button></div>`;
 document.body.append(ov);const bo=document.body.style.overflow;document.body.style.overflow='hidden';
 const cv=ov.querySelector('#c_cv'),ctx=cv.getContext('2d'),pv=ov.querySelector('#c_pv'),pc=pv.getContext('2d'),zr=ov.querySelector('#c_z'),dpr=Math.min(window.devicePixelRatio||1,3),ZM=6;
 let sW=0,sH=0,fw=0,fh=0,fx0=0,fy0=0,pw=0,ph=0,s=1,cx=0,cy=0,minS=1;
 const ratio=()=>{const r=RT[ri][1];return r==='orig'?Math.min(2.8,Math.max(.4,sw/sh)):r};
 const outSz=()=>{if(cfg.w)return[cfg.w,cfg.h];const r=ratio(),A=cfg.area||520000;let w=Math.round(Math.sqrt(A*r)),h=Math.round(Math.sqrt(A/r));const m=Math.max(w,h);if(m>1280){w=Math.round(w*1280/m);h=Math.round(h*1280/m)}return[w,h]};
 function layout(){const r=ratio();sW=Math.min(innerWidth-24,460);const maxFH=Math.max(140,innerHeight*.4);fw=sW-28;fh=fw/r;if(fh>maxFH){fh=maxFH;fw=fh*r}
  sH=Math.round(Math.max(fh+56,Math.min(innerHeight*.42,360)));fx0=(sW-fw)/2;fy0=(sH-fh)/2;
  cv.width=sW*dpr;cv.height=sH*dpr;cv.style.width=sW+'px';cv.style.height=sH+'px';
  if(cfg.pv==='dp'||cfg.pv==='sq'){pw=ph=76}else if(cfg.pv==='banner'){pw=Math.min(240,sW-150);ph=pw/r}else if(r>=1){pw=130;ph=130/r}else{ph=120;pw=120*r}
  pv.width=pw*dpr;pv.height=ph*dpr;pv.style.width=pw+'px';pv.style.height=ph+'px';pv.style.borderRadius=cfg.pv==='dp'?'50%':cfg.pv==='sq'?'18px':'10px'}
 const clamp=()=>{const hw=sw*s/2,hh=sh*s/2;cx=Math.min(fx0+hw,Math.max(fx0+fw-hw,cx));cy=Math.min(fy0+hh,Math.max(fy0+fh-hh,cy))};
 const reset=()=>{minS=Math.max(fw/sw,fh/sh);s=minS;cx=sW/2;cy=sH/2;zr.value=0;clamp();draw()};
 const setScale=(ns,mx,my)=>{ns=Math.min(minS*ZM,Math.max(minS,ns));cx=mx-(mx-cx)*ns/s;cy=my-(my-cy)*ns/s;s=ns;zr.value=Math.log(s/minS)/Math.log(ZM)*100;clamp();draw()};
 const region=(x,X,Y,W,H)=>x.drawImage(src,(fx0-(cx-sw*s/2))/s,(fy0-(cy-sh*s/2))/s,fw/s,fh/s,X,Y,W,H);
 function draw(){
  ctx.setTransform(dpr,0,0,dpr,0,0);ctx.fillStyle='#0b1418';ctx.fillRect(0,0,sW,sH);
  ctx.imageSmoothingQuality='high';ctx.drawImage(src,cx-sw*s/2,cy-sh*s/2,sw*s,sh*s);
  ctx.fillStyle='rgba(8,16,20,.62)';ctx.fillRect(0,0,sW,fy0);ctx.fillRect(0,fy0+fh,sW,sH-fy0-fh);ctx.fillRect(0,fy0,fx0,fh);ctx.fillRect(fx0+fw,fy0,sW-fx0-fw,fh);
  ctx.strokeStyle='rgba(255,255,255,.35)';ctx.lineWidth=1;ctx.beginPath();for(let i=1;i<3;i++){ctx.moveTo(fx0+fw*i/3,fy0);ctx.lineTo(fx0+fw*i/3,fy0+fh);ctx.moveTo(fx0,fy0+fh*i/3);ctx.lineTo(fx0+fw,fy0+fh*i/3)}ctx.stroke();
  ctx.strokeStyle='#2ec4a5';ctx.lineWidth=2;ctx.strokeRect(fx0,fy0,fw,fh);
  pc.setTransform(dpr,0,0,dpr,0,0);pc.clearRect(0,0,pw,ph);pc.imageSmoothingQuality='high';pc.fillStyle='#fff';pc.fillRect(0,0,pw,ph);region(pc,0,0,pw,ph);
  const vw=fw/s,vh=fh/s,pct=Math.round(vw*vh/(sw*sh)*100),o=outSz(),q=vw/o[0];
  ov.querySelector('#c_info').innerHTML=`Original: <b>${sw}×${sh}</b> px → Final: <b>${o[0]}×${o[1]}</b> px<br>Drag karke photo khiskao · 2 ungli / slider se zoom`;
  ov.querySelector('#c_q').innerHTML=(q>=1?'<b style="color:#5be3c2">✓ Bilkul fit — image sharp rahegi</b>':q>=.7?'<b style="color:#ffd166">👍 Theek hai — halki si soft ho sakti hai</b>':'<b style="color:#ff8b85">⚠ Zyada zoom / chhoti photo — dhundhli dikhegi. Zoom kam karo ya badi photo chuno</b>')+`<br><span style="color:#9fb6ba">Photo ka ~${pct}% hissa dikhega${pct<100?', baaki kat jayega':''}.</span>`}
 const close=()=>{document.removeEventListener('keydown',onKey);URL.revokeObjectURL(url);ov.remove();document.body.style.overflow=bo};
 const onKey=e=>{if(e.key==='Escape'){close();cancel&&cancel()}};document.addEventListener('keydown',onKey);
 const P=new Map(),pd=()=>{if(P.size!==2)return 0;const [a,b]=[...P.values()];return Math.hypot(a[0]-b[0],a[1]-b[1])};let d0=0;
 cv.addEventListener('pointerdown',e=>{try{cv.setPointerCapture(e.pointerId)}catch(_){}P.set(e.pointerId,[e.clientX,e.clientY]);d0=pd();cv.style.cursor='grabbing'});
 cv.addEventListener('pointermove',e=>{const o=P.get(e.pointerId);if(!o)return;const n=[e.clientX,e.clientY];
  if(P.size===1){cx+=n[0]-o[0];cy+=n[1]-o[1];clamp();draw()}
  P.set(e.pointerId,n);
  if(P.size===2){const d=pd(),r=cv.getBoundingClientRect(),[a,b]=[...P.values()];if(d0>0)setScale(s*d/d0,(a[0]+b[0])/2-r.left,(a[1]+b[1])/2-r.top);d0=d}});
 const up=e=>{P.delete(e.pointerId);d0=pd();if(!P.size)cv.style.cursor='grab'};
 cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',up);
 cv.addEventListener('wheel',e=>{e.preventDefault();const r=cv.getBoundingClientRect();setScale(s*(e.deltaY<0?1.1:1/1.1),e.clientX-r.left,e.clientY-r.top)},{passive:false});
 zr.addEventListener('input',()=>setScale(minS*Math.pow(ZM,zr.value/100),sW/2,sH/2));
 ov.querySelector('#c_rs').onclick=reset;
 ov.querySelector('#c_rot').onclick=()=>{const rc=document.createElement('canvas');rc.width=sh;rc.height=sw;const x=rc.getContext('2d');x.translate(sh,0);x.rotate(Math.PI/2);x.drawImage(src,0,0);src=rc;[sw,sh]=[sh,sw];layout();reset()};
 const rt=ov.querySelector('#c_rt');if(rt)rt.onclick=e=>{const b=e.target.closest('button');if(!b)return;ri=+b.dataset.i;rt.querySelectorAll('button').forEach(x=>x.classList.toggle('on',x===b));layout();reset()};
 ov.querySelector('#c_x').onclick=ov.querySelector('#c_no').onclick=()=>{close();cancel&&cancel()};
 ov.querySelector('#c_ok').onclick=()=>{const z=outSz(),o=document.createElement('canvas');o.width=z[0];o.height=z[1];const x=o.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,o.width,o.height);x.imageSmoothingQuality='high';region(x,0,0,o.width,o.height);let d;try{d=o.toDataURL('image/jpeg',cfg.q||.72)}catch(er){cropToast('Image process nahi hui');return}close();done(d)};
 layout();reset()}

const closeBtn=(l)=>`<button class="btn" data-act="close" style="flex:1">${l||t('cancel')}</button>`;
function rewardModal(r,day,c7){openModal(`<div class="c"><div class="coin">🪙</div><div class="pts">${[0,1,2,3,4,5,6,7].map(i=>`<i style="--a:${i*45}deg"></i>`).join('')}</div><div class="ring ok" style="width:70px;height:70px;font-size:32px">✓</div><div class="big rw" style="margin-top:8px">+ ${money(r)}</div><h3>Daily Check-in Reward</h3><p class="muted">Day ${day}</p><p class="sm muted">Added to your ${esc(appName())} balance.</p>${c7?`<p class="b" style="margin-top:8px">7-Day Cycle Completed 🎉</p><p class="sm muted">Next cycle starts at Day 1 — ${money(DAILY[0])}</p>`:''}<button class="btn p full" style="margin-top:14px" data-act="close">Continue</button></div>`)}
const finishAuth=()=>{try{sessionStorage.setItem('sc_s','1')}catch(e){}loaded={};hist=[]};
Object.assign(A,{
swAuth:el=>{$('#view').innerHTML=SCREENS.auth(el.dataset.p==='login'?'reg':'login')},
eye:el=>{const i=$('#'+el.dataset.p);if(i)i.type=i.type==='password'?'text':'password'},
showTerms:()=>openModal(`<h2>Terms & Conditions</h2><div class="sm muted col" style="margin:10px 0"><p>Rewards are credited only after review and approval.</p><p>In a live product, rewards depend on review and may be adjusted or declined. Do not submit false completions or use multiple accounts.</p><p>Privacy: your data is stored securely online and used only to run your account and payouts.</p></div><button class="btn p full" data-act="close">Close</button>`),
doReg:()=>{if(CFG.registrationOpen===false)return showToast('⚠ Registration is temporarily closed');const E={},fn=vv('fn').trim(),em=vv('em').trim().toLowerCase(),ph=vv('ph').replace(/[\s-]/g,''),pw=vv('pw'),cp=vv('cp'),rc=vv('rc').trim().toUpperCase(),Ac=accts();
 if(!fn)E.fn='Please enter your full name.';else if(fn.length<2)E.fn='Full name must contain at least 2 characters.';
 if(!em||!/^\S+@\S+\.\S+$/.test(em))E.em='Please enter a valid email address.';else if(Ac.some(a=>a.email===em))E.em='This email is already registered.';
 if(!ph)E.ph='Please enter your phone number.';else if(!/^\+?\d{8,13}$/.test(ph))E.ph='Enter a valid phone number (8–13 digits).';
 if(!pw)E.pw='Please enter a password.';else if(pw.length<8)E.pw='Password must be at least 8 characters.';
 if(!cp)E.cp='Please confirm your password.';else if(cp!==pw)E.cp='Passwords do not match.';
 if(rc&&!codeOk(rc))E.rc='Invalid referral code.';
 showErrs(['fn','em','ph','pw','cp','rc'],E);if(Object.keys(E).length)return showToast('⚠ Please fix the highlighted fields');
 const id='SC'+Math.floor(10000+Math.random()*89999),code=mkCode(fn),keep={theme:S.theme,lang:S.set.lang};Ac.push({id,email:em,pw:hash(pw),code});setAccts(Ac);
 S=seed();S.theme=keep.theme;S.set.lang=keep.lang;S.onboarded=1;S.auth=1;S.remember=1;Object.assign(S.user,{name:fn,email:em,phone:ph,id,code,createdAt:now(),since:new Date().toLocaleDateString('en',{month:'short',year:'numeric'})});
 if(rc){Object.assign(S.user,{referredBy:rc,refUsed:rc,refDate:ymd()});addRefTo(rc,fn)}
 addNotif('Welcome to '+appName(),'Your account is ready. Claim your first Daily Check-in or start a task.','welcome');addAct('Account created');save();finishAuth();navigateTo('home',null,true);
 openModal(`<div class="c"><div class="ring ok">✓</div><h2 style="margin-top:12px">Welcome to ${esc(appName())}! 🎉</h2><p class="muted sm">Your account is ready. Pick a task and start earning.</p><div class="col" style="margin-top:14px"><button class="btn p full" data-go="tasks">Browse tasks</button><button class="btn full" data-act="close">Continue</button></div></div>`)},
doLogin:()=>{const em=vv('em').trim().toLowerCase(),pw=vv('pw'),E={},a=accts().find(x=>x.email===em);if(!em)E.em='Please enter your email address.';else if(!/^\S+@\S+\.\S+$/.test(em))E.em='Please enter a valid email address.';if(!pw)E.pw='Please enter your password.';showErrs(['em','pw'],E);if(Object.keys(E).length)return;
 if(!a||a.pw!==hash(pw))return($('#e_pw').textContent='Incorrect email or password.');if(a.blocked)return($('#e_pw').textContent='This account is suspended. Please contact support.');const rm=$('#rm').checked?1:0;loadUser(a.id);S.auth=1;S.onboarded=1;S.remember=rm;save();finishAuth();showToast('✓ Welcome back, '+S.user.name);navigateTo('home',null,true)},
fgo:()=>{FP={step:1,email:'',code:''};navigateTo('forgot',null,true)},
toLogin:()=>{FP={step:1,email:'',code:''};navigateTo('auth',null,true)},
fgSend:()=>{const em=vv('em').trim().toLowerCase();if(!/^\S+@\S+\.\S+$/.test(em))return($('#e_em').textContent='Please enter a valid email address.');if(!accts().some(a=>a.email===em))return($('#e_em').textContent='No account found with this email.');FP={step:2,email:em,code:String(Math.floor(100000+Math.random()*900000))};$('#view').innerHTML=SCREENS.forgot()},
fgCode:()=>{if(vv('fc').trim()!==FP.code)return($('#e_fc').textContent='That code is not correct.');FP.step=3;$('#view').innerHTML=SCREENS.forgot()},
fgPw:()=>{const p=vv('np'),c=vv('cp'),E={};if(p.length<8)E.np='Password must be at least 8 characters.';if(c!==p)E.cp='Passwords do not match.';showErrs(['np','cp'],E);if(Object.keys(E).length)return;const Ac=accts(),a=Ac.find(x=>x.email===FP.email);if(a){a.pw=hash(p);setAccts(Ac)}FP.step=4;$('#view').innerHTML=SCREENS.forgot()},
/* daily check-in: reward day and streak are tracked separately */
claim:el=>{ciTick();const c=S.ci,td=ymd(),fromGift=!!(el&&el.dataset&&el.dataset.m==='gift');if(c.lastClaimDate>=td)return showToast("⚠ Today's reward already claimed");
 const day=c.currentDay,r=DAILY[day-1],y=new Date(now()-864e5);
 c.streak=c.lastClaimDate===ymd(y)?c.streak+1:1;c.longestStreak=Math.max(c.longestStreak,c.streak);
 if(day===1)c.claimedDays=[];c.claimedDays.push(day);c.lastClaimDate=td;c.lastClaimedDay=day;c.totalClaims++;c.totalRewards=+(c.totalRewards+r).toFixed(2);
 const c7=day===7;if(c7){c.cycleNumber++;c.currentDay=1}else c.currentDay=day+1;
 earn('Check',r,'Daily Check-in','Daily Check-in Reward · Day '+day,10,'Daily Check-in reward credited',money(r)+' added for Day '+day+'.','checkin');addAct('Completed Daily Check-in Day '+day);addAct('Earned '+money(r));save();
 if(fromGift)navigateTo(cur.n,cur.p,true);else navigateTo('checkin',null,true);rewardModal(r,day,c7)},
ciShift:el=>{const c=S.ci;if(!c.lastClaimDate)return showToast('⚠ Claim once first');const d=new Date(c.lastClaimDate+'T00:00:00');d.setDate(d.getDate()-(+el.dataset.p));c.lastClaimDate=ymd(d);ciTick();save();navigateTo('checkin',null,true);showToast('Demo: moved last claim back '+el.dataset.p+' day(s)')},
/* tasks */
startTask:el=>{const id=el.dataset.p,k=findTask(id);if(!k)return showToast('⚠ Task not found');const s=tstatus(k),r=S.tasks[id]||{};
 if(s==='pending')return navigateTo('verify',id);if(s==='successful')return showToast('Already completed');if(!k.active)return showToast('⚠ This task is no longer available');
 if(s!=='started'){setUserTaskState(id,{s:'started',startedAt:now(),submittedAt:0,reviewedAt:0,opened:false,proof:null,rewardCredited:false,rejectionReason:'',submissionId:'',reward:k.reward,snap:snapOf(k),attempts:(r.attempts||0)+(s==='rejected'?1:0)});addAct((s==='rejected'?'Task retried: ':'Task started: ')+k.title);save();showToast('✓ Task started')}navigateTo('progress',id)},
openLink:el=>{const id=el.dataset.p,k=findTask(id),u=k&&normUrl(k.taskLink);if(u)openExt(u);else showToast('⚠ No valid link provided');
 const r=S.tasks[id];if(r&&r.s==='started'&&u){setUserTaskState(id,{opened:true});save();navigateTo(cur.n,cur.p,true)}},
rmProof:()=>{PF='';$('#pv').innerHTML='';$('#rmv').hidden=true;const f=document.querySelector('input[data-f=proof]');if(f)f.value=''},
submitTask:el=>{const id=el.dataset.p,k=findTask(id),r=S.tasks[id]||{};if(!k)return showToast('⚠ Task not found');
 if(r.s==='pending'||r.rewardCredited)return showToast('⚠ Already submitted');if(r.s!=='started')return showToast('⚠ Start the task first');if(!k.active)return showToast('⚠ This task is no longer available');
 if(k.taskLink&&!r.opened)return showToast('⚠ Open the task link first');let v;
 if(k.proof==='screenshot'){if(!PF)return showToast('⚠ Choose a screenshot first');v=PF}else{v=vv('pf').trim();if(!v)return showToast('⚠ Add your proof first');if(k.proof==='url'&&!/^https?:\/\/\S+\.\S+/.test(v))return showToast('⚠ Enter a valid URL starting with https://');if(v.length<2)return showToast('⚠ Proof is too short')}
 setUserTaskState(id,{s:'pending',submittedAt:now(),reviewedAt:0,proof:k.proof==='screenshot'?{type:k.proof,value:v}:{type:k.proof,value:v,photo:PF||''},rejectionReason:'',rewardCredited:false,reward:k.reward,snap:snapOf(k),submissionId:'SUB_'+S.user.id+'_'+id+'_'+now()});
 S.pendT=+(S.pendT+k.reward).toFixed(2);addNotif('Task submitted','Your task is waiting for verification.','task');addAct('Task submitted: '+k.title);save();PF='';showToast('✓ Proof submitted');navigateTo('verify',id)},
simTask:el=>{const id=el.dataset.p,ok=el.dataset.r==='ok';if(reviewTask(id,ok,vv('rr')))showToast(ok?'✓ Reward added':'✕ Task rejected');navigateTo('verify',id,true)},
reportTask:el=>openModal(`<h2>Report task</h2><label for="rp">Reason</label><select id="rp"><option>Incorrect task</option><option>Broken link</option><option>Reward issue</option><option>Inappropriate content</option><option>Other</option></select><div class="row" style="margin-top:14px">${closeBtn()}<button class="btn p" data-act="sendReport" data-p="${el.dataset.p}" style="flex:2">Submit report</button></div>`),
sendReport:el=>{const k=findTask(el.dataset.p),why=vv('rp');S.reports.unshift({id:'report_'+now().toString(36),userId:S.user.id,taskId:k?k.id:null,reason:why,status:'open',createdAt:now()});addNotif('Task report received',(k?k.title:'Task')+': '+why,'info');addAct('Reported task: '+(k?k.title:''));save();closeModal();showToast('✓ Report submitted')},
txf:el=>{TF=el.dataset.p;navigateTo('tx',null,true)},
lb:el=>{LB=el.dataset.p;navigateTo('leaders',null,true)},
/* referral */
share:()=>{const i=shareInfo(),d={title:i.name,text:i.text,url:i.link};navigator.share?navigator.share(d).catch(()=>{}):openModal(`<h2>Share your code</h2><p class="muted sm" style="margin:8px 0 14px">${esc(i.full)}</p><button class="btn p full" data-act="copy" data-p="${esc(i.full)}">Copy message</button>`)},
simRef:()=>{const n=['Kabir N.','Zoya A.','Ishan G.','Neha B.'][S.refs.length%4];S.refs.unshift({n,st:'Registered',e:0,ts:now()});addNotif('Referral update',n+' joined with your code.','ref');addAct('Referral joined: '+n);save();showToast('✓ Friend registered (demo)');navigateTo('refer',null,true)},
qualRef:el=>{const r=S.refs[+el.dataset.p];if(!r||r.st==='Qualified')return;r.st='Qualified';r.e=REFERRAL_REWARD;earn('Ref',REFERRAL_REWARD,'Referral Reward','Referral qualified: '+r.n,25,'Referral reward credited','Referral reward of '+money(REFERRAL_REWARD)+' has been credited.','ref');addAct('Referral reward credited: '+r.n);showToast('✓ '+money(REFERRAL_REWARD)+' credited');navigateTo('refer',null,true)},
/* wallet */
withdraw:()=>{if(!S.pay.length)return openModal(`<h2>Add a payment method</h2><p class="muted sm" style="margin:8px 0 14px">Add a UPI ID or bank account before withdrawing.</p><button class="btn p full" data-act="payAdd" data-p="upi">Add UPI ID</button><button class="btn full" style="margin-top:8px" data-act="payAdd" data-p="bank">Add bank account</button>`);
 openModal(`<h2>${t('withdraw')}</h2><p class="muted sm">Available: <b>${money(S.bal)}</b> · Minimum ${money(MIN_WD)}</p><p class="muted sm">Requests are reviewed and paid to your selected payout method.</p><label for="wa">Amount (₹)</label><input id="wa" type="number" inputmode="decimal" step="0.01" placeholder="e.g. 100"><label for="wm">Payment method</label><select id="wm">${S.pay.map(p=>`<option value="${p.id}" ${p.def?'selected':''}>${esc(p.label)}</option>`).join('')}</select><p class="fe" id="we"></p><div class="row" style="margin-top:8px">${closeBtn()}<button class="btn p" data-act="wdNext" style="flex:2">Continue</button></div>`)},
wdNext:()=>{const raw=vv('wa'),v=Math.round(parseFloat(raw)*100)/100,e=$('#we'),p=S.pay.find(x=>x.id===vv('wm'));if(!raw)return(e.textContent='Enter an amount.');if(!isFinite(v)||v<=0)return(e.textContent='Enter a valid amount.');if(v<MIN_WD){showToast('⚠ Minimum withdrawal not reached');return(e.textContent='Minimum withdrawal is '+money(MIN_WD)+'.')}if(v>S.bal)return(e.textContent='Insufficient balance.');if(!p)return(e.textContent='Choose a payment method.');if(S.tx.some(x=>x.type==='Withdrawal'&&x.st==='Pending'))return(e.textContent='You already have a pending withdrawal.');
 WD={v,p};openModal(`<h2>Confirm withdrawal</h2><div class="card col" style="margin:12px 0"><div class="row sp"><span class="muted">Amount</span><b>${money(v)}</b></div><div class="row sp"><span class="muted">To</span><b style="overflow-wrap:anywhere">${esc(p.label)}</b></div></div><div class="row">${closeBtn('Back')}<button class="btn p" data-act="doWd" style="flex:2">Confirm withdrawal</button></div>`)},
doWd:()=>{if(!WD)return closeModal();const {v,p}=WD;WD=null;if(v>S.bal)return showToast('⚠ Insufficient balance');S.bal=+(S.bal-v).toFixed(2);S.pendW=+(S.pendW+v).toFixed(2);addTx('Withdrawal','Withdrawal to '+p.label,-v,'Pending');addNotif('Withdrawal pending',money(v)+' withdrawal request is pending.','wd');addAct('Withdrawal requested: '+money(v));save();
 openModal(`<div class="c"><div class="ring ok">✓</div><h2 style="margin-top:12px">Withdrawal request submitted.</h2><p class="muted sm">${money(v)} is pending review.</p><button class="btn p full" style="margin-top:14px" data-act="afterWd">View transactions</button></div>`)},
wdDone:el=>{const x=S.tx.find(y=>y.id===el.dataset.p);if(!x||x.st!=='Pending')return;const v=-x.amt;x.st='Completed';S.pendW=Math.max(0,+(S.pendW-v).toFixed(2));S.wd=+(S.wd+v).toFixed(2);addNotif('Withdrawal completed',money(v)+' was paid (demo).','wd');addAct('Withdrawal completed: '+money(v));save();showToast('✓ Marked as paid');navigateTo('tx',null,true)},
wdRej:el=>{const x=S.tx.find(y=>y.id===el.dataset.p);if(!x||x.st!=='Pending')return;const v=-x.amt;x.st='Rejected';S.pendW=Math.max(0,+(S.pendW-v).toFixed(2));S.bal=+(S.bal+v).toFixed(2);addTx('Refund','Refund for rejected withdrawal',v);addNotif('Withdrawal rejected',money(v)+' was returned to your balance.','wd');addAct('Withdrawal rejected and refunded');save();showToast('Refunded '+money(v));navigateTo('tx',null,true)},
payMethods:()=>openModal(`<h2>Payment methods</h2><div style="margin:8px 0">${S.pay.length?S.pay.map(p=>`<div class="li"><div class="mid"><b style="overflow-wrap:anywhere">${esc(p.label)}</b>${p.def?' <span class="chip ok">Default</span>':''}</div>${p.def?'':`<button class="btn s" data-act="payDef" data-p="${p.id}">Default</button>`}<button class="btn s" data-act="payDel" data-p="${p.id}" aria-label="Delete">✕</button></div>`).join(''):empty('💳','No payment methods','Add a UPI ID or bank account.')}</div><div class="grid2"><button class="btn p" data-act="payAdd" data-p="upi">Add UPI</button><button class="btn" data-act="payAdd" data-p="bank">Add bank</button></div><p class="sm muted" style="margin-top:10px">Your details are used only to send your payouts.</p><button class="btn full" style="margin-top:10px" data-act="close">Close</button>`),
payAdd:el=>{const b=el.dataset.p==='bank';openModal(`<h2>Add ${b?'bank account':'UPI ID'}</h2>`+(b?fld('pbh','Account holder name','Full name')+fld('pbn','Bank name','Bank name')+fld('pba','Account number','Digits only','text','inputmode="numeric"')+fld('pbc','Confirm account number','Repeat number','text','inputmode="numeric"')+fld('pbi','IFSC','e.g. HDFC0001234','text','maxlength="11" style="text-transform:uppercase"'):fld('pu','UPI ID','name@bank'))+`<div class="row">${closeBtn('Back').replace('data-act="close"','data-act="payMethods"')}<button class="btn p" data-act="paySave" data-p="${b?'bank':'upi'}" style="flex:2">${t('save')}</button></div>`)},
paySave:el=>{const E={};let label;if(el.dataset.p==='upi'){const u=vv('pu').trim();if(!/^[\w.\-]{2,}@[A-Za-z]{2,}$/.test(u))E.pu='Enter a valid UPI ID, like name@bank.';label='UPI · '+u.slice(0,2)+'•••@'+u.split('@')[1];showErrs(['pu'],E)}
 else{const h=vv('pbh').trim(),n=vv('pbn').trim(),a=vv('pba').trim(),c=vv('pbc').trim(),i=vv('pbi').trim().toUpperCase();if(h.length<2)E.pbh='Enter the account holder name.';if(n.length<2)E.pbn='Enter the bank name.';if(!/^\d{9,18}$/.test(a))E.pba='Account number must be 9–18 digits.';if(c!==a)E.pbc='Account numbers do not match.';if(!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(i))E.pbi='Enter a valid IFSC code.';label=n+' · ••••'+a.slice(-4);showErrs(['pbh','pbn','pba','pbc','pbi'],E)}
 if(Object.keys(E).length)return;S.pay.push({id:'PM'+now().toString(36),kind:el.dataset.p,label,def:!S.pay.length,d:el.dataset.p==='upi'?{upi:vv('pu').trim()}:{holder:vv('pbh').trim(),bank:vv('pbn').trim(),acc:vv('pba').trim(),ifsc:vv('pbi').trim().toUpperCase()}});addAct('Payment method added');save();showToast('✓ Payment method saved');A.payMethods()},
payDef:el=>{S.pay.forEach(p=>p.def=p.id===el.dataset.p);save();A.payMethods()},
payDel:el=>{const was=(S.pay.find(p=>p.id===el.dataset.p)||{}).def;S.pay=S.pay.filter(p=>p.id!==el.dataset.p);if(was&&S.pay[0])S.pay[0].def=true;save();A.payMethods()},
/* notifications */
readOne:el=>{const n=S.notifs.find(x=>x.id===el.dataset.p);if(n)n.read=1;save();navigateTo('notifs',null,true)},
readAll:()=>{S.notifs.forEach(n=>n.read=1);save();showToast('✓ All marked as read');navigateTo('notifs',null,true)},
delNotif:el=>{S.notifs=S.notifs.filter(x=>x.id!==el.dataset.p);save();navigateTo('notifs',null,true)},
clearNotifs:()=>{S.notifs=[];save();navigateTo('notifs',null,true)},
/* profile */
editProfile:()=>{const u=S.user;openModal(`<h2>Edit profile</h2><div class="row" style="margin:12px 0;gap:12px">${av(64)}<div class="col" style="gap:6px"><button class="btn s" data-act="editPhoto">📷 Change photo</button>${u.photo?'<button class="btn s" data-act="rmPhoto">Remove photo</button>':'<span class="muted sm">Gallery se photo chuno aur adjust karo</span>'}</div></div>`+fld('ef','Full name','','text','value="'+esc(u.name)+'"')+fld('ee','Email ID (cannot be changed)','','email','value="'+esc(u.email)+'" disabled readonly style="opacity:.65"')+fld('ep','Phone number (cannot be changed)','','tel','value="'+esc(u.phone)+'" disabled readonly style="opacity:.65"')+`<label>Referral code</label><input value="${esc(u.code)}" disabled><div class="row" style="margin-top:14px">${closeBtn()}<button class="btn p" data-act="saveProfile" style="flex:2">${t('save')}</button></div>`)},
saveProfile:()=>{const E={},n=vv('ef').replace(/\s+/g,' ').trim();
 if(n.length<2)E.ef='Enter your full name.';else if(n.length>40)E.ef='Name is too long (max 40 characters).';
 showErrs(['ef'],E);if(Object.keys(E).length)return;
 /* only the name is editable; email and phone stay locked to the registered values */
 S.user.name=n;addAct('Profile updated');save();closeModal();showToast('✓ Name updated');navigateTo(cur.n,cur.p,true)},
security:()=>openModal(`<h2>Security</h2><p class="sm muted" style="margin:6px 0">Use a strong password that you do not use anywhere else.</p>`+pwf('cu','Current password','Current password',0)+pwf('np','New password','At least 8 characters',1)+pwf('cp','Confirm password','Repeat password',0)+`<div class="row">${closeBtn()}<button class="btn p" data-act="chPw" style="flex:2">Change password</button></div><button class="btn full" style="margin-top:10px" data-act="doLogout">Log out of demo session</button>`),
chPw:()=>{const E={},Ac=accts(),me=Ac.find(a=>a.id===S.user.id),n=vv('np');if(!me||me.pw!==hash(vv('cu')))E.cu='Current password is incorrect.';if(n.length<8)E.np='Password must be at least 8 characters.';if(vv('cp')!==n)E.cp='Passwords do not match.';showErrs(['cu','np','cp'],E);if(Object.keys(E).length)return;me.pw=hash(n);setAccts(Ac);addNotif('Password changed','Your demo password was updated.','sec');save();closeModal();showToast('✓ Password updated')},
ver:()=>showToast(appName()+' v1.0.0'),
lang:()=>{const L=['English','हिन्दी','Español'];S.set.lang=L[(L.indexOf(S.set.lang)+1)%3];save();buildNav();showToast('✓ '+S.set.lang);navigateTo('settings',null,true)},
loadDemo:()=>{loadDemo();loaded={};showToast('✓ Demo data loaded');navigateTo('home',null,true)},
doReset:()=>{try{Object.keys(localStorage).filter(k=>k.startsWith('smartcash')).forEach(k=>localStorage.removeItem(k))}catch(e){}S=seed();loaded={};hist=[];applyTheme();showToast('✓ Demo reset');navigateTo('onboard',null,true)},
/* support */
sendFb:()=>{const E={},s=vv('fsub').trim(),m=vv('fmsg').trim();if(s.length<3)E.fsub='Enter a subject.';if(m.length<5)E.fmsg='Write at least 5 characters.';showErrs(['fsub','fmsg'],E);if(Object.keys(E).length)return;const id='ticket_'+now().toString(36);S.tickets.unshift({id,userId:S.user.id,category:vv('fcat'),subject:s,message:m,status:'open',createdAt:now()});addNotif('Support ticket created','Ticket '+id+': '+s,'info');addAct('Support ticket created');save();showToast('✓ Feedback submitted');navigateTo('help',null,true)}
});
document.addEventListener('input',e=>{const i=e.target;if(i.dataset&&i.dataset.str){const r=strength(i.value),b=$('#str');if(b){b.style.width=r[1]+'%';b.style.background=r[2];$('#strt').textContent=r[0]}}
 if(i.id==='rc'&&$('#e_rc')){const v=i.value.trim().toUpperCase(),e2=$('#e_rc');e2.style.color=v&&codeOk(v)?'var(--success)':'';e2.textContent=!v?'':codeOk(v)?'✓ Valid referral code':'Invalid referral code.'}});
document.addEventListener('change',e=>{const f=e.target;if(f.type!=='file'||!f.files[0])return;if(!/^image\//.test(f.files[0].type)){f.value='';return showToast('⚠ Choose an image file')}
 const file=f.files[0];
 if(f.dataset.f==='proof')openCrop(file,CROPS.proof,d=>{PF=d;const pv=$('#pv');if(pv)pv.innerHTML=`<img src="${d}" alt="Proof preview" style="max-width:100%;border-radius:12px;margin-top:8px">`;const rb=$('#rmv');if(rb)rb.hidden=false});
 else if(f.dataset.f==='dp')openCrop(file,CROPS.dp,d=>setPhoto(d));
 f.value=''});

function setPhoto(d){S.user.photo=d||'';addAct(d?'Profile photo updated':'Profile photo removed');save();closeModal();showToast(d?'✓ Photo updated':'Photo removed');navigateTo(cur.n,cur.p,true)}
Object.assign(A,{editPhoto:()=>{const i=$('#dpfile');if(i)i.click()},rmPhoto:()=>setPhoto('')});
function applyTheme(){document.documentElement.dataset.theme=S.theme;const m=document.querySelector('meta[name=theme-color]');if(m)m.content=S.theme==='dark'?'#0b1020':'#f1f4fb'}

document.addEventListener('click',e=>{const m=e.target.closest('#modal');if(e.target.id==='modal')return closeModal();
 const g=e.target.closest('[data-go]');if(g){if(!S.auth)return;return navigateTo(g.dataset.go)}
 const a=e.target.closest('[data-act]');if(a&&A[a.dataset.act])A[a.dataset.act](a)});
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal()});

/* live sync: Admin Panel / other tab writes */
window.addEventListener('storage',e=>{if(!e.key)return;if(e.key===TASK_KEY)refreshTasks();else if(S.user&&S.user.id&&e.key==='smartcash_u_'+S.user.id&&e.newValue){const au=S.auth;S=mg(seed(),parse(e.key));S.auth=au;normTasks();refreshTasks()}});

/* ===== BOOT ===== */
applyTheme();
if(!S.user.id)S.auth=0;
try{if(S.auth&&!S.remember&&!sessionStorage.getItem('sc_s'))S.auth=0}catch(e){}
rollDay();ciTick();

/* ===== TEAL 3D UI OVERRIDE ===== */
(function(){
const IC={home:'<svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="#fff" stroke-width="2" stroke-linejoin="round"><path d="M4 11l8-7 8 7v9a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1z"/></svg>',
earn:'<svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9.5"/><path d="M8 7.5h8M8 11h8M10 7.5c4 0 4 5 0 5l4 4.5"/></svg>',
refer:'<svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="4"/><path d="M2.5 20c.5-4 3.2-6 6.5-6 1.5 0 2.8.4 3.8 1M16 16h6m-2.5-2.5L22 16l-2.5 2.5"/></svg>',
wallet:'<svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="#fff" stroke-width="2" stroke-linejoin="round"><path d="M4 7a2 2 0 0 1 2-2h11v3M4 7v11a2 2 0 0 0 2 2h13a1 1 0 0 0 1-1v-3M4 7h14a2 2 0 0 1 2 2v2h-4a2 2 0 0 0 0 4h4v-4"/><circle cx="16.5" cy="13" r=".8" fill="#fff"/></svg>',
profile:'<svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="8" r="4"/><path d="M4.5 21c.6-4.5 3.7-6.5 7.5-6.5s6.9 2 7.5 6.5z"/></svg>'};
const NV=[['home','Home'],['tasks','Earn','earn'],['refer','Refer'],['wallet','Wallet'],['profile','Profile']];
const _bn=buildNav;
buildNav=function(){_bn();const act=TABS.includes(cur.n)?cur.n:({task:'tasks',progress:'tasks',verify:'tasks',tx:'wallet',checkin:'home',notifs:'home',leaders:'profile',rewards:'profile'})[cur.n]||'';
$('#nav').innerHTML=NV.map(([k,l,i])=>`<button data-go="${k}" class="${k===act?'on':''}" aria-label="${l}"><i>${IC[i||k]}</i><span>${l}</span></button>`).join('')};
const bl=()=>`<button class="bell" data-go="notifs" aria-label="Notifications">🔔<span class="badge" id="nbadge" hidden></span></button>`;
const gf=()=>`<button class="gift ${S.ci.lastClaimDate===ymd()?'':'new'}" data-act="gift" aria-label="Daily check-in reward">🎁</button>`;
const cp=()=>`<span class="cpill"><span class="coin">₹</span><span id="bal">${(+S.bal).toFixed(2)}</span></span>`;
const top=(title,back=1)=>`<div class="top">${back?'<button class="circ" data-act="back" aria-label="Back">←</button>':''}<h1>${title}</h1>${gf()}${cp()}</div>`;
const cn=(v)=>`<span class="coin">₹</span><span>${(+v).toFixed(2).replace(/\.00$/,'.00')}</span>`;
const row=(k,tag,cls='')=>{const r=S.tasks[k.id]||{},rw=r.reward!=null?+r.reward:k.reward;return `<button class="off ${cls}" data-act="openTask" data-p="${esc(k.id)}">${tag?`<span class="tag">${tag}</span>`:''}<span class="logo2"><span>${esc(k.icon||'🎯')}</span>${k.image?`<img src="${esc(k.image)}" alt="" loading="lazy" onerror="this.remove()">`:''}</span><span class="nm"><span>${esc(k.title)}</span></span><span class="amt">${cn(rw)}</span></button>`};
const none=(m)=>`<div class="emp">${m}</div>`;
window.OT=window.OT||'offers';window.WT=window.WT||'earn';
const A_=A;A_.ot=el=>{OT=el.dataset.p;navigateTo('tasks',null,true)};A_.wt=el=>{WT=el.dataset.p;navigateTo('wallet',null,true)};
A_.tg=()=>{const u=normUrl(CFG.telegramUrl);if(!u||/^https?:\/\/(t|telegram)\.me\/?$/i.test(u))return showToast('⚠ Telegram link is not set yet');openExt(u)};A_.wa=()=>{openExt('https://wa.me/?text='+encodeURIComponent(shareInfo().full))};
A_.rate=()=>{if(normUrl(CFG.appLink))openExt(CFG.appLink);else showToast('Thanks for rating!')};A_.soon=el=>showToast(el.dataset.p||'Coming soon');
/* ===== HERO BANNERS: Admin Panel publishes an array into localStorage 'smartcash_banners' =====
   Banner = {id,title,subtitle,buttonText,link,image,icon,bg:[c1,c2],active,order}
   link: 'https://…' opens a page | 'tasks' | 'refer' | 'wallet' | 'profile' | 'checkin' | 'gift' | 'tg' */
const BN_KEY='smartcash_banners';
const DEMO_BANNERS=[
 {id:'BN_1',title:'Join Telegram Channel & Get Rewards',subtitle:'Join our channel and get exclusive offers and rewards.',buttonText:'Join Now',link:'tg',icon:'✈️',bg:['#1d8fb0','#2ec4a5'],active:true,order:1},
 {id:'BN_2',title:'Invite Friends & Earn Rewards',subtitle:'Share your code and earn when a friend completes an offer.',buttonText:'Refer Now',link:'refer',icon:'💰',bg:['#6d5bd0','#2aa9c9'],active:true,order:2},
 {id:'BN_3',title:'Daily Check-in Bonus',subtitle:'Claim a reward every day for 7 days.',buttonText:'Claim Now',link:'gift',icon:'🎁',bg:['#f59e0b','#ef6c3c'],active:true,order:3}];
const getBanners=()=>{const a=parse(BN_KEY),l=Array.isArray(a)?a:DEMO_BANNERS;
 return l.filter(x=>x&&x.title&&x.active!==false).map((x,i)=>({id:String(x.id||('BN_'+i)),title:String(x.title),sub:String(x.subtitle||x.description||''),btn:String(x.buttonText||x.button||''),link:String(x.link||''),image:typeof x.image==='string'?x.image:'',icon:x.icon||'🎯',bg:Array.isArray(x.bg)&&x.bg.length>1?x.bg:['#1d8fb0','#2ec4a5'],order:+x.order||i+1})).sort((p,q)=>p.order-q.order).slice(0,5)};
const bnSlide=(b,i)=>`<div class="hbs"><div class="ban ${b.image?'hasimg clean':''}" data-act="bn" data-p="${i}" role="button" aria-label="${esc(b.title)}" style="cursor:pointer;background:linear-gradient(135deg,${esc(b.bg[0])},${esc(b.bg[1])})">${b.image?`<img class="bimg" src="${esc(b.image)}" alt="" onerror="var p=this.parentNode;p.classList.remove('hasimg','clean');this.remove()">`:''}<h2>${esc(b.title)}</h2>${b.sub?`<p>${esc(b.sub)}</p>`:''}${b.btn?`<button class="go" data-act="bn" data-p="${i}">${esc(b.btn)}</button>`:''}${b.image?'':`<div class="tg">${esc(b.icon)}</div>`}</div></div>`;
A_.bn=el=>{const b=getBanners()[+el.dataset.p];if(!b)return;const l=String(b.link||'').trim(),k=l.toLowerCase();
 if(k==='tg'||k==='telegram')A_.tg();else if(k==='gift')A_.gift();else if(['tasks','refer','wallet','profile','checkin','notifs'].includes(k))navigateTo(k);else if(l&&normUrl(l))openExt(l);else showToast('⚠ Banner link is not set')};
A_.gift=()=>{ciTick();const c=S.ci,got=c.lastClaimDate===ymd(),d=c.currentDay,r=DAILY[d-1],cd=(d===1&&!got)?[]:c.claimedDays;
 openModal(`<div class="c" style="margin-bottom:6px"><div class="gbig">🎁</div><h2>Daily Check-in</h2><p class="muted sm">Claim every day for 7 days. The reward grows each day!</p></div><div class="days">${DAILY.map((x,i)=>{const k=i+1,cl=cd.includes(k),cu=k===d&&!got;return `<div class="day ${cl?'got':''} ${cu?'cur':''}"><span>DAY ${k}</span><b>${money(x)}</b><span>${cl?'✓ Claimed':cu?'🎁 Today':'🔒 Locked'}</span></div>`}).join('')}</div><button class="btn p full" style="margin-top:16px" data-act="claim" data-m="gift" ${got?'disabled':''}>${got?"✓ Today's reward claimed":'CLAIM '+money(r)}</button><p class="c muted sm" style="margin-top:8px">${got?'Come back tomorrow for Day '+d+' · '+money(r):'Current streak: '+c.streak+' day(s)'}</p><button class="btn full" style="margin-top:8px" data-act="close">Close</button>`)};
SCREENS.home=()=>{rollDay();ciTick();const L=taskLists(),n=esc(S.user.name||'Friend').split(' ')[0],B=getBanners();
return `<div class="hm"><div class="top"><button data-go="profile" class="avp" aria-label="Profile">${avInner()}</button><div class="hi">Welcome back,<b>${n}</b></div>${bl()}${gf()}${cp()}</div>
${CFG.announcement&&CFG.announcement.active&&CFG.announcement.text?`<div class="ann">📢 ${esc(CFG.announcement.text)}</div>`:''}${B.length?`<div class="hm-hero"><div class="hbt" id="hbt">${B.map(bnSlide).join('')}</div>${B.length>1?`<div class="hbd" id="hbd">${B.map((x,i)=>`<i class="${i?'':'on'}"></i>`).join('')}</div>`:''}</div>`:''}
<div class="hm-scroll"><div class="pan"><button class="lbrow" data-go="leaders"><span>🏆 Leaderboard — Top 10 wallets</span>›</button><div class="row sp"><h2>Offers Wall</h2><button class="pbtn" data-go="tasks" style="white-space:nowrap">✦ Offer Status</button></div>${L.active.length?L.active.map(k=>row(k,'')).join(''):none('New offers will appear here.')}</div></div></div>`};
SCREENS.tasks=()=>{const L=taskLists(),st=[...L.pending,...L.successful,...L.rejected];
return top('Earn')+`<div class="stat3"><h2>Statistics</h2><div class="g"><div><b>${L.nS}</b>Total Approved</div><div><b>${L.pending.length}</b>Total Pending</div><div><b>${L.nR}</b>Total Rejected</div></div></div>
<div class="pan"><div class="seg"><button class="${OT==='offers'?'on':''}" data-act="ot" data-p="offers">Offers</button><button class="${OT==='status'?'on':''}" data-act="ot" data-p="status">Status</button></div>
${OT==='offers'?(L.active.length?L.active.map(k=>row(k,'')).join(''):none('No active offers right now.')):(st.length?st.map(k=>{const s=tstatus(k);return row(k,s==='successful'?'Success':s==='pending'?'Pending':'Rejected',s==='successful'?'ok':s==='pending'?'wait':'bad')}).join(''):none('No offer activity yet.'))}</div>`};
AFTER.tasks=()=>{};
AFTER.home=()=>{const tr=$('#hbt');if(!tr)return;const n=tr.children.length,dots=[...document.querySelectorAll('#hbd i')];let i=0,pause=0,rs=null;
 tr.addEventListener('scroll',()=>{i=Math.round(tr.scrollLeft/(tr.clientWidth||1));dots.forEach((d,j)=>d.classList.toggle('on',j===i))},{passive:true});
 const hold=()=>{pause=1;clearTimeout(rs)},free=()=>{clearTimeout(rs);rs=setTimeout(()=>pause=0,3500)};
 tr.addEventListener('touchstart',hold,{passive:true});tr.addEventListener('touchend',free,{passive:true});tr.addEventListener('mouseenter',hold);tr.addEventListener('mouseleave',free);
 if(n>1){const id=setInterval(()=>{if(!document.body.contains(tr))return clearInterval(id);if(pause)return;const k=(i+1)%n;tr.scrollTo({left:k*tr.clientWidth,behavior:'smooth'})},4000);timers.push(id)}};
/* keep the layout identical on every page: home gets the fixed-header layout, all other pages scroll normally */
const _nav2=navigateTo;navigateTo=function(n){if(CFG.maintenance&&CFG.maintenance.active&&S.auth&&!BARE.includes(n))return navigateTo('maint',null,true);mergeBc();document.body.classList.toggle('ishome',n==='home'&&!!S.auth);return _nav2.apply(this,arguments)};
window.addEventListener('storage',e=>{if(e.key===BN_KEY&&S.auth&&cur.n==='home')navigateTo('home',null,true)});
/* =====================================================================
   ADMIN-READY DATA CONTRACT  (everything below is controlled from the Admin Panel)
   localStorage key            -> later Firebase path          what it controls
   smartcash_tasks             -> /tasks                       offers: [{id,title,description,image,icon,reward,instructions[],taskLink,proofType,estimatedTime,active,createdAt}]
   smartcash_banners           -> /banners                     hero slider: [{id,title,subtitle,buttonText,link,image,icon,bg:[c1,c2],active,order}] (max 5)
   smartcash_config            -> /config                      {appName,telegramUrl,supportWhatsapp,dailyRewards[7],referralReward,minWithdrawal,
                                                                announcement:{active,text},maintenance:{active,message},faq:[{q,a}],registrationOpen,demoMode}
   smartcash_broadcasts        -> /broadcasts                  push notice to all users: [{id,title,message,ts}]
   smartcash_accounts          -> /users                       account list (+ blocked flag)
   smartcash_u_<userId>        -> /userData/<userId>           per-user wallet, tasks, tx, notifications
   To go live: replace DB.read / DB.write / DB.listen with Firebase get / set / onValue — nothing else changes. */
const CFG_KEY='smartcash_config',BC_KEY='smartcash_broadcasts';
const DB={read:k=>parse(k),write:(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}},listen:(fn)=>window.addEventListener('storage',e=>e.key&&fn(e.key,e))};
const CFG0={appName:'Smart Cash',appLink:'',telegramUrl:'https://t.me/',supportWhatsapp:'919568153948',dailyRewards:[.1,.2,.3,.4,.5,.6,.7],referralReward:2,minWithdrawal:50,announcement:{active:false,text:''},maintenance:{active:false,message:'We are making Smart Cash better. Please check back soon.'},faq:null,registrationOpen:true,demoMode:false};
let CFG={...CFG0};
/* Referral share info: the link users share is the app download link set by Admin (Settings -> App download link). Falls back to the web app link until Admin sets it. */
function shareInfo(){const al=String(CFG.appLink||'').trim(),has=/^https?:\/\/\S+$/i.test(al),code=S.user.code||'',nm=CFG.appName||'Smart Cash',
 link=has?al:(location.origin+location.pathname+'?ref='+code);
 return{has,link,name:nm,code,text:'Join '+nm+' and earn rewards by completing tasks. Use my referral code: '+code,full:'Join '+nm+' and earn rewards by completing tasks. Download the app: '+link+' — Use my referral code: '+code}}
const FAQ0=FAQ2.map(x=>x.slice());
function applyConfig(){const c=DB.read(CFG_KEY);CFG={...CFG0,...(c&&typeof c==='object'&&!Array.isArray(c)?c:{})};
 const d=Array.isArray(CFG.dailyRewards)&&CFG.dailyRewards.length===7?CFG.dailyRewards.map(Number):CFG0.dailyRewards;DAILY=d.every(x=>x>=0)?d:CFG0.dailyRewards;
 REFERRAL_REWARD=+CFG.referralReward>=0?+CFG.referralReward:2;MIN_WD=+CFG.minWithdrawal>0?+CFG.minWithdrawal:50;
 WA='https://wa.me/'+String(CFG.supportWhatsapp).replace(/\D/g,'')+'?text='+encodeURIComponent('Hello '+CFG.appName+' Support, I need help with my account.');
 FAQ2=Array.isArray(CFG.faq)&&CFG.faq.length?CFG.faq.map(x=>Array.isArray(x)?[String(x[0]),String(x[1])]:[String(x.q),String(x.a)]):FAQ0.map(([q,a])=>[q,a.replace(/₹0\.10 on Day 1 rising to ₹0\.70 on Day 7/,money(DAILY[0])+' on Day 1 rising to '+money(DAILY[6])+' on Day 7').replace('₹50',money(MIN_WD)).replace('You earn ₹2 ','You earn '+money(REFERRAL_REWARD)+' ')]);
 document.title=CFG.appName+' – Task & Reward'}
BARE.push('maint');
SCREENS.maint=()=>`<div class="hero-s"><div class="logo">🛠️</div><h1>Under maintenance</h1><p class="muted" style="max-width:320px">${esc(CFG.maintenance.message)}</p><button class="btn p" data-act="retry">Try again</button></div>`;
A_.retry=()=>navigateTo('home',null,true);
const soft=l=>{if(S.auth&&l.includes(cur.n)&&!$('#modal').classList.contains('show'))navigateTo(cur.n,cur.p,true)};
function cfgChanged(){applyConfig();if(!S.auth)return;if(cur.n==='maint'&&!CFG.maintenance.active)return navigateTo('home',null,true);if(CFG.maintenance.active&&cur.n!=='maint')return navigateTo('home');soft(['home','wallet','refer','help','checkin','tasks','settings'])}
function mergeBc(){const l=DB.read(BC_KEY);if(!Array.isArray(l)||!S.auth)return;let n=0,rm=0;const live=new Set(l.filter(b=>b&&b.id).map(b=>String(b.id)));const keep=S.notifs.filter(x=>{const i=String(x.id||'');return !(i.charAt(0)==='N'&&S.bcSeen.includes(i.slice(1))&&!live.has(i.slice(1)))});if(keep.length!==S.notifs.length){rm=S.notifs.length-keep.length;S.notifs=keep}l.forEach(b=>{if(b&&b.id&&b.title&&!S.bcSeen.includes(b.id)&&(+b.ts||0)>=(S.user.createdAt||0)-864e5){S.bcSeen.push(b.id);S.notifs.unshift({id:'N'+b.id,t:String(b.title),m:String(b.message||''),k:'info',read:0,ts:+b.ts||now()});n++}});if(rm){save();updateStats();soft(['notifs'])}if(n){save();updateStats();showToast('🔔 '+n+' new notification'+(n>1?'s':''))}}
DB.listen(k=>{if(k===CFG_KEY)cfgChanged();else if(k===BC_KEY){mergeBc();soft(['notifs'])}else if(k===BN_KEY||k===TASK_KEY){soft(['home','tasks'])}else if(k===ACC&&S.auth){const m=accts().find(a=>a.id===S.user.id);if(m&&m.blocked){S.auth=0;save();navigateTo('auth',null,true);showToast('⚠ Account suspended')}}});
/* hide demo/simulation tools unless demoMode is on (or ?demo=1) so users only see the real flow */
const DM=()=>!!CFG.demoMode;
['simTask','ciShift','wdDone','wdRej','loadDemo','doReset','simRef','qualRef'].forEach(k=>{const o=A[k];if(o)A[k]=function(){if(!DM())return;return o.apply(this,arguments)}});
new MutationObserver(()=>{if(DM())return;document.querySelectorAll('#view [data-act=simTask],#view [data-act=ciShift],#view [data-act=wdDone],#view [data-act=wdRej],#view [data-act=loadDemo],#view [data-act=reset]').forEach(e=>{const c=e.closest('.card,.li');if(c)c.remove()});document.querySelectorAll('#view [data-act=simRef],#view [data-act=qualRef]').forEach(e=>e.remove());document.querySelectorAll('#view h3.sec').forEach(h=>{if(h.textContent==='Demo tools')h.remove()})}).observe($('#view'),{childList:true,subtree:true});
/* run an action against ANY user's data (current user or stored account) */
const withUser=(id,fn)=>{if(!id||id===S.user.id){const r=fn();save();refreshTasks();return r}const raw=DB.read('smartcash_u_'+id);if(!raw)return false;const bak=S;S=mg(seed(),raw);normTasks();let r;try{r=fn();DB.write('smartcash_u_'+id,S)}finally{S=bak;save()}return r};
Object.assign(window.SmartCash,{
 getConfig:()=>({...CFG}),setConfig:p=>{DB.write(CFG_KEY,{...(DB.read(CFG_KEY)||{}),...p});cfgChanged()},
 broadcast:(title,message)=>{const l=DB.read(BC_KEY);DB.write(BC_KEY,[{id:'BC'+now().toString(36),title,message,ts:now()},...(Array.isArray(l)?l:[])].slice(0,50));mergeBc();soft(['notifs'])},
 users:()=>accts().map(a=>{const st=a.id===S.user.id?S:(DB.read('smartcash_u_'+a.id)||{});return{id:a.id,email:a.email,code:a.code,blocked:!!a.blocked,name:(st.user||{}).name,balance:st.bal,earned:st.earned,tasksDone:st.done}}),
 setBlocked:(id,b)=>{const A=accts(),a=A.find(x=>x.id===id);if(!a)return false;a.blocked=!!b;setAccts(A);if(id===S.user.id&&b){S.auth=0;save();navigateTo('auth',null,true)}return true},
 adjustBalance:(id,amt,note='Admin adjustment')=>{amt=+amt;if(!amt)return false;return withUser(id,()=>{if(amt>0)earn('Bonus',amt,'Bonus',note,0,'Bonus credited',money(amt)+' added: '+note,'info');else{S.bal=Math.max(0,+(S.bal+amt).toFixed(2));addTx('Adjustment',note,amt);addNotif('Balance adjusted',money(amt)+': '+note,'info');save()}return true})},
 pendingWithdrawals:()=>accts().flatMap(a=>{const st=a.id===S.user.id?S:DB.read('smartcash_u_'+a.id);return st&&st.tx?st.tx.filter(x=>x.type==='Withdrawal'&&x.st==='Pending').map(x=>({userId:a.id,name:st.user.name,txId:x.id,amount:-x.amt,method:x.desc,ts:x.ts})):[]}),
 resolveWithdrawal:(id,txId,ok)=>withUser(id,()=>{const x=S.tx.find(y=>y.id===txId);if(!x||x.type!=='Withdrawal'||x.st!=='Pending')return false;const v=-x.amt;S.pendW=Math.max(0,+(S.pendW-v).toFixed(2));if(ok){x.st='Completed';S.wd=+(S.wd+v).toFixed(2);addNotif('Withdrawal completed',money(v)+' has been paid to you.','wd');addAct('Withdrawal completed: '+money(v))}else{x.st='Rejected';S.bal=+(S.bal+v).toFixed(2);addTx('Refund','Refund for rejected withdrawal',v);addNotif('Withdrawal rejected',money(v)+' was returned to your balance.','wd');addAct('Withdrawal rejected and refunded')}save();return true}),
 qualifyReferral:(referrerId,name)=>withUser(referrerId,()=>{const r=S.refs.find(x=>x.n===name&&x.st!=='Qualified');if(!r)return false;r.st='Qualified';r.e=REFERRAL_REWARD;earn('Ref',REFERRAL_REWARD,'Referral Reward','Referral qualified: '+r.n,25,'Referral reward credited',money(REFERRAL_REWARD)+' credited.','ref');return true}),
 stats:()=>{const u=window.SmartCash.users();return{users:u.length,totalBalance:+u.reduce((a,x)=>a+(+x.balance||0),0).toFixed(2),pendingWithdrawals:window.SmartCash.pendingWithdrawals().length,pendingTasks:window.SmartCash.pendingSubmissions().length}}});
applyConfig();mergeBc();
Object.assign(window.SmartCash,{getBanners,setBanners:a=>{try{localStorage.setItem(BN_KEY,JSON.stringify(a))}catch(e){}if(S.auth&&cur.n==='home')navigateTo('home',null,true)}});
SCREENS.refer=()=>{const u=S.user,c=esc(u.code||'—');
return top('Refer &amp; Earn')+`<div class="bagw"><div class="bag">💰</div></div>
<div class="tk2 n" style="--ny:165px"><h2>Invite Friends &amp; Earn</h2><div class="sub">Copy referral code and share it with your friends</div>
<div class="cd"><b>${c}</b><button class="pbtn" data-act="copy" data-p="${c}">Copy</button></div>${shareInfo().has?`<div class="cd"><b style="font-size:12px;overflow-wrap:anywhere;letter-spacing:0">${esc(shareInfo().link)}</b><button class="pbtn" data-act="copy" data-p="${esc(shareInfo().link)}">Copy link</button></div>`:''}
<div class="how"><h3>How It Works ?</h3><ul><li>Share the link to your friends and family</li><li>Tell them to use your refer code</li><li>When the referred user completes 3 tasks you'll get ₹${REFERRAL_REWARD.toFixed(2)} reward</li></ul></div></div>
<div class="row2"><span class="ic">🔗</span>Total Referrals<span class="v">${S.refs.length}</span></div>
<div class="shr"><button class="rd" data-act="share" aria-label="Share">⤴</button><button class="wa" data-act="wa">📞 Share via WhatsApp</button></div>`};
const tx=x=>{const w=x.type==='Withdrawal',tg=w?(x.st==='Completed'?'Success':x.st==='Rejected'?'Rejected':'Pending'):'',cl=w?(x.st==='Completed'?'ok':x.st==='Rejected'?'bad':'wait'):'';return `<div class="off ${cl}" style="cursor:default">${tg?`<span class="tag">${tg}</span>`:''}<span class="logo2"><span>${x.amt>0?'🎯':'💸'}</span></span><span class="nm"><span>${esc(x.desc||x.type)}<br><small style="color:#5c6b73;font-weight:500;font-size:15px">${new Date(x.ts).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}${!w&&x.st&&x.st!=='Completed'?' · '+esc(x.st):''}</small></span></span><span class="amt">${cn(Math.abs(x.amt))}</span></div>`};
SCREENS.wallet=()=>{rollDay();let n10=0;const l=S.tx.filter(x=>WT==='earn'?x.amt>0:(x.type==='Withdrawal'||x.type==='Refund')).filter(x=>x.st==='Pending'||n10++<10);
return top('Wallet')+`<div class="bal3"><small>Total Balance</small><div class="v" id="bal2">${(+S.bal).toFixed(2)}</div><div class="bc">₹</div><button class="pbtn" data-act="withdraw">Withdraw</button></div>
<div class="pan" style="margin-top:22px"><div class="seg"><button class="${WT==='earn'?'on':''}" data-act="wt" data-p="earn">Earnings</button><button class="${WT==='red'?'on':''}" data-act="wt" data-p="red">My Redeems</button></div>${l.length?l.map(tx).join(''):none(WT==='earn'?'No earnings yet.':'No redeems yet.')}</div>`};
AFTER.wallet=()=>{};
SCREENS.profile=()=>{const u=S.user,sr=(a,i,l,x='')=>`<button class="sr" ${a}><span class="ic">${i}</span><span class="mid">${l}</span>${x||'<span class="ch">›</span>'}</button>`;
return top('Profile')+`<div class="pc"><div class="u"><div class="avw"><button class="avp" data-act="editPhoto" aria-label="Change photo" style="width:84px;height:84px;border-radius:24px;font-size:30px">${avInner()}</button><span class="cam">📷</span></div><div><b>${esc(u.name)}</b><span>${esc(u.email)}</span></div></div>
<div class="m"><div><b><span class="coin">₹</span>${(+S.earned).toFixed(1).replace(/\.0$/,'')}</b>Total Earned</div><div><b><span class="coin">₹</span>${(+S.wd).toFixed(0)}</b>Total Withdrawn</div></div></div>
<div class="sh">Settings</div>${sr('data-act="editProfile"','✏️','Edit Profile')}${sr('data-go="leaders"','🏆','Leaderboard')}${sr('data-act="rate"','⭐','Rate Us')}${sr('','🌍','Location','<span class="loc">India</span>')}${sr('data-go="help"','🎫','My Tickets')}${sr('data-act="tg"','✈️','Join Telegram')}${sr('data-go="help"','❓','Help &amp; Faq')}${sr('data-go="privacy"','🛡️','Privacy Policy')}${sr('data-go="terms"','📄','Terms of Service')}${sr('data-act="logout"','🚪','Logout')}`};
/* ===== LEADERBOARD: real users, Top 10, Top 3 podium ===== */
const LBC={t:0,rows:null,ph:{}};
const lbId=r=>esc(r.c||String(r.id).replace(/^adm_/,'').slice(-6).toUpperCase());
const lbPa=(r,me)=>{const p=me?S.user.photo:LBC.ph[r.id];return p?`<img src="${esc(p)}" alt="">`:esc(initials(r.n))};
const lbShort=n=>{const w=String(n||'').trim().split(/\s+/).filter(Boolean);return(w[0]||'User').slice(0,14)+(w[1]?' '+w[1][0].toUpperCase()+'.':'')};
const lbHTML=()=>{const me=(window.FB&&FB.uid&&FB.uid())||'',R0=(LBC.rows||[]).slice();
 if(me&&!R0.some(r=>r.id===me))R0.push({id:me,n:lbShort(S.user.name),c:String(S.user.code||''),ov:false,b:+S.bal||0,e:+S.earned||0,p:0,m:0});
 const R=R0.map(r=>r.id===me?{...r,n:lbShort(S.user.name),c:String(S.user.code||r.c||''),b:r.ov?r.b:(+S.bal||0)}:r).sort((x,y)=>y.b-x.b||y.e-x.e);if(!R.length)return none('Abhi koi user leaderboard me nahi hai.');
 const T=R.slice(0,10),my=R.findIndex(r=>r.id===me),pods=[1,0,2].filter(i=>T[i]);
 const pod=`<div class="pod">${pods.map(i=>{const r=T[i],m=r.id===me;return `<div class="p p${i+1}">${i===0?'<div class="crown">👑</div>':''}<div class="pa">${lbPa(r,m)}</div><div class="nm">${esc(r.n)}${m?' (You)':''}</div><div class="lid">ID: ${lbId(r)}</div><div class="am">${money(r.b)}</div><div class="bk">${i+1}</div></div>`}).join('')}</div>`;
 const rest=T.slice(3).map((r,j)=>{const m=r.id===me;return `<div class="lbr ${m?'me':''}"><span class="rk">${j+4}</span><span class="pa">${lbPa(r,m)}</span><span class="nm">${esc(r.n)}${m?' (You)':''}<small class="lid">ID: ${lbId(r)}</small></span><span class="am">${money(r.b)}</span></div>`}).join('');
 const mine=my>9?`<div class="sh" style="margin-top:14px">Your rank</div><div class="lbr me"><span class="rk">${my+1}</span><span class="pa">${lbPa(R[my],1)}</span><span class="nm">${esc(R[my].n)} (You)<small class="lid">ID: ${lbId(R[my])}</small></span><span class="am">${money(R[my].b)}</span></div>`:my<0?`<p class="sm muted c" style="margin-top:12px">Top 100 me abhi aapka naam nahi hai. Tasks complete karke upar aao! 🚀</p>`:'';
 return pod+rest+mine+`<p class="sm muted c" style="margin-top:12px">Wallet balance ke hisaab se Top 10 users. Balance badhne ya ghatne par rank apne aap badalta hai, aur naye users judte hi list me aate hain.</p>`};
SCREENS.leaders=()=>top('Leaderboard')+`<div class="pan" id="lbx" style="min-height:60vh">${LBC.rows?lbHTML():none('Loading leaderboard…')}</div>`;
AFTER.leaders=async()=>{const box=()=>$('#lbx'),paint=note=>{if(cur.n==='leaders'&&box())box().innerHTML=lbHTML()+(note?`<p class="sm c" style="margin-top:10px;color:#e0554f">${note}</p>`:'')};
 clearTimeout(LBC.tm);
 if(!(window.FB&&FB.lbWatch)){try{await Promise.race([window.FBREADY,new Promise(r=>setTimeout(r,7000))])}catch(e){}if(cur.n!=='leaders')return}
 if(!(window.FB&&FB.lbWatch)){LBC.rows=LBC.rows||[];paint('Server connect nahi hua. Internet check karke dobara kholo.');return}
 if(LBC.off){LBC.off();LBC.off=null}
 /* if the server is slow, still show the board (at least your own rank) after a few seconds */
 LBC.tm=setTimeout(()=>{if(cur.n==='leaders'&&!LBC.rows){LBC.rows=[];paint()}},6000);
 /* publish my own latest balance first so I am always on the board */
 try{await Promise.race([FB.lbPub(),new Promise(r=>setTimeout(r,3000))])}catch(e){}
 if(cur.n!=='leaders')return;
 LBC.off=FB.lbWatch(async R=>{if(cur.n!=='leaders'){if(LBC.off){LBC.off();LBC.off=null}return}
  if(R===null){clearTimeout(LBC.tm);LBC.rows=LBC.rows||[];paint('Leaderboard server se load nahi hua (permission). Admin Firebase Rules publish karein.');return}
  await Promise.all(R.slice(0,10).map(r=>r.p&&r.id!==FB.uid()&&!(r.id in LBC.ph)?FB.photo(r.id).then(v=>{LBC.ph[r.id]=v||''}).catch(()=>{LBC.ph[r.id]=''}):0));
  clearTimeout(LBC.tm);LBC.rows=R;LBC.t=now();paint()})};
})();
navigateTo('splash',null,true);

/* ===================== FIREBASE (Auth + Realtime Database) =====================
   users/<uid>/state   user wallet, tasks, tx   (written by the user app)
   inbox/<uid>/<id>    admin decisions applied once by the app: {type:'review',taskId,ok,reason} | {type:'withdrawal',txId,ok} | {type:'adjust',amount,note}
   referrals/<referrerUid>/<newUid> {name,ts,qualified}  (auto: friend's 3 approved tasks -> referrer is credited by the app, once; admin only views)
   submissions/<id>, withdrawals/<txId>   request queues the Admin Panel reads
   users/<uid>/blocked (admin)   config, tasks, banners, broadcasts (admin writes, everyone reads)   admins/<uid>:true */
window.FB={};window.FBREADY=new Promise(r=>{window.__fbOK=r;setTimeout(r,6000)});
(async()=>{try{
const CFGJ={apiKey:"AIzaSyBSU__zGVNKXRf_kM9mfDlywAlGKxHt2Sk",authDomain:"smart-loot-7a862.firebaseapp.com",databaseURL:"https://smart-loot-7a862-default-rtdb.firebaseio.com",projectId:"smart-loot-7a862",storageBucket:"smart-loot-7a862.firebasestorage.app",messagingSenderId:"294192416760",appId:"1:294192416760:web:3655d851dd9287d84af80d",measurementId:"G-PEXVXCM0ZD"};
/* ===== REST fallback: Firebase SDK (CDN) load na ho to Auth + Realtime Database seedha Google ke REST se chalte hain (CDN ki zarurat nahi) ===== */
function mkRest(CFG,SK){
const KEY=CFG.apiKey,DB=CFG.databaseURL.replace(/\/$/,'');
let ST='local';const gs=()=>{try{return ST==='local'?localStorage:sessionStorage}catch(e){return null}};
const LS={g:k=>{try{return localStorage.getItem(k)||sessionStorage.getItem(k)}catch(e){return null}},s:(k,v)=>{try{gs().setItem(k,v)}catch(e){}},d:k=>{try{localStorage.removeItem(k);sessionStorage.removeItem(k)}catch(e){}}};
const er=(code,msg)=>Object.assign(new Error(msg||code),{code});
const MAP={INVALID_LOGIN_CREDENTIALS:'auth/invalid-credential',INVALID_PASSWORD:'auth/wrong-password',EMAIL_NOT_FOUND:'auth/user-not-found',EMAIL_EXISTS:'auth/email-already-in-use',TOO_MANY_ATTEMPTS_TRY_LATER:'auth/too-many-requests',USER_DISABLED:'auth/user-disabled',INVALID_EMAIL:'auth/invalid-email',OPERATION_NOT_ALLOWED:'auth/operation-not-allowed',WEAK_PASSWORD:'auth/weak-password'};
const post=async(u,b,form)=>{let r;try{r=await fetch(u,{method:'POST',headers:{'Content-Type':form?'application/x-www-form-urlencoded':'application/json'},body:form?b:JSON.stringify(b)})}catch(e){throw er('auth/network-request-failed')}const j=await r.json().catch(()=>({}));if(!r.ok){const m=String((j.error&&j.error.message)||'').split(' ')[0];throw er(MAP[m]||'auth/internal-error',m)}return j};
const auth={currentUser:null},cbs=new Set();let T=null;
const fire=()=>cbs.forEach(f=>{try{f(auth.currentUser)}catch(e){console.error(e)}});
const setT=(j,em)=>{const uid=j.localId||j.user_id,email=j.email||em||(auth.currentUser&&auth.currentUser.email)||'',dn=j.displayName||(auth.currentUser&&auth.currentUser.uid===uid&&auth.currentUser.displayName)||'';T={idToken:j.idToken||j.id_token,refreshToken:j.refreshToken||j.refresh_token,exp:Date.now()+(+(j.expiresIn||j.expires_in)||3600)*1000};auth.currentUser={uid,email,displayName:dn};LS.s(SK,JSON.stringify({rt:T.refreshToken,uid,email,dn}))};
const tok=async()=>{if(!T)throw er('no-user');if(T.idToken&&T.exp-Date.now()>12e4)return T.idToken;const j=await post('https://securetoken.googleapis.com/v1/token?key='+KEY,'grant_type=refresh_token&refresh_token='+encodeURIComponent(T.refreshToken),1);setT(j);return T.idToken};
try{const st=JSON.parse(LS.g(SK)||'null');if(st&&st.rt){T={refreshToken:st.rt,idToken:'',exp:0};auth.currentUser={uid:st.uid,email:st.email,displayName:st.dn||''}}}catch(e){}
const AU={getAuth:()=>auth,setPersistence:async(a,p)=>{ST=p===AU.browserSessionPersistence?'session':'local'},browserLocalPersistence:{},browserSessionPersistence:{},
onAuthStateChanged:(a,cb)=>{cbs.add(cb);(async()=>{if(auth.currentUser&&T&&!T.idToken){try{await tok()}catch(e){if(e.code!=='auth/network-request-failed'){T=null;auth.currentUser=null;LS.d(SK)}}}cb(auth.currentUser)})();return()=>cbs.delete(cb)},
signInWithEmailAndPassword:async(a,em,pw)=>{const j=await post('https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key='+KEY,{email:em,password:pw,returnSecureToken:true});setT(j,em);fire();return{user:auth.currentUser}},
createUserWithEmailAndPassword:async(a,em,pw)=>{const j=await post('https://identitytoolkit.googleapis.com/v1/accounts:signUp?key='+KEY,{email:em,password:pw,returnSecureToken:true});setT(j,em);fire();return{user:auth.currentUser}},
signOut:async()=>{T=null;auth.currentUser=null;LS.d(SK);fire()},
updateProfile:async(u,o)=>{const t=await tok();const j=await post('https://identitytoolkit.googleapis.com/v1/accounts:update?key='+KEY,{idToken:t,displayName:o.displayName,returnSecureToken:true});if(j.idToken)setT(j);if(auth.currentUser)auth.currentUser.displayName=o.displayName||'';LS.s(SK,JSON.stringify({rt:T.refreshToken,uid:auth.currentUser.uid,email:auth.currentUser.email,dn:auth.currentUser.displayName}))},
updatePassword:async(u,pw)=>{const t=await tok();const j=await post('https://identitytoolkit.googleapis.com/v1/accounts:update?key='+KEY,{idToken:t,password:pw,returnSecureToken:true});if(j.idToken)setT(j)},
reauthenticateWithCredential:async(u,c)=>{await post('https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key='+KEY,{email:c.email,password:c.password,returnSecureToken:true})},
EmailAuthProvider:{credential:(email,password)=>({email,password})},
sendPasswordResetEmail:async(a,em)=>{await post('https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key='+KEY,{requestType:'PASSWORD_RESET',email:em})}};
const rq=async(m,p,b)=>{const t=await tok().catch(()=>'');let r;try{r=await fetch(DB+'/'+p+'.json'+(t?'?auth='+encodeURIComponent(t):''),{method:m,body:b===undefined?undefined:JSON.stringify(b)})}catch(e){throw er('net','Internet nahi hai')}if(!r.ok){const j=await r.json().catch(()=>({}));throw er(r.status===401||r.status===403?'PERMISSION_DENIED':'db/'+r.status,(j&&j.error)||('HTTP '+r.status))}return r.json()};
const PC='-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz';let lT=0,lR=[];
const pk=()=>{let n=Date.now();const dup=n===lT;lT=n;const ts=[];for(let i=7;i>=0;i--){ts[i]=PC[n%64];n=Math.floor(n/64)}if(!dup)lR=[...Array(12)].map(()=>Math.floor(Math.random()*64));else{let i=11;for(;i>=0&&lR[i]===63;i--)lR[i]=0;if(i>=0)lR[i]++}return ts.join('')+lR.map(i=>PC[i]).join('')};
const subs=new Set();let pt=0;
const snap=(v,p)=>({val:()=>v==null?null:v,exists:()=>v!=null,key:String(p).split('/').pop()||null});
const shape=(v,q)=>{if(q&&q.lim&&v&&typeof v==='object'){const e=Object.entries(v);if(e.length>q.lim){e.sort((a,b)=>((a[1]&&a[1][q.ob])-(b[1]&&b[1][q.ob]))||(a[0]<b[0]?-1:1));return Object.fromEntries(e.slice(-q.lim))}}return v};
const one=async o=>{if(o.busy||o.dead)return;o.busy=1;try{let v=shape(await rq('GET',o.r.path),o.r);if(v===undefined)v=null;const j=JSON.stringify(v);o.bad=0;if(j!==o.last){o.last=j;if(!o.dead)o.cb(snap(v,o.r.path))}}catch(e){if(e.code==='PERMISSION_DENIED'){if(!o.bad&&o.ecb&&!o.dead)o.ecb(e);o.bad=1}}o.busy=0};
const poke=()=>setTimeout(()=>subs.forEach(one),250);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)subs.forEach(one)});
const DBM={getDatabase:()=>({}),ref:(d,p)=>({path:String(p||'').replace(/^\/+|\/+$/g,'')}),query:(r,...c)=>Object.assign({},r,...c),orderByChild:k=>({ob:k}),limitToLast:n=>({lim:n}),
get:async r=>{let v=shape(await rq('GET',r.path),r);return snap(v===undefined?null:v,r.path)},
set:async(r,v)=>{await rq('PUT',r.path,v===undefined?null:v);poke()},update:async(r,o)=>{await rq('PATCH',r.path,o);poke()},remove:async r=>{await rq('DELETE',r.path);poke()},
push:r=>{const k=pk();return{path:(r.path?r.path+'/':'')+k,key:k}},
onDisconnect:()=>({set:async()=>{},cancel:async()=>{}}),serverTimestamp:()=>({'.sv':'timestamp'}),
onValue:(r,cb,ecb)=>{if(r.path==='.info/serverTimeOffset'){setTimeout(()=>cb(snap(0,r.path)),0);return()=>{}}if(r.path==='.info/connected'){setTimeout(()=>cb(snap(true,r.path)),0);return()=>{}}const o={r,cb,ecb,last:undefined,bad:0,busy:0,dead:0};subs.add(o);one(o);if(!pt)pt=setInterval(()=>{if(!document.hidden)subs.forEach(one)},3000);return()=>{o.dead=1;subs.delete(o)}}};
return{M:{initializeApp:()=>({})},AU,DBM}}
const V='10.14.1',PIN={app:'0.10.13',auth:'1.7.9',database:'1.0.8'},SRC=[n=>`https://www.gstatic.com/firebasejs/${V}/firebase-${n}.js`,n=>`https://cdn.jsdelivr.net/npm/@firebase/${n}/+esm`,n=>`https://cdn.jsdelivr.net/npm/@firebase/${n}@${PIN[n]}/+esm`,n=>`https://cdn.jsdelivr.net/npm/firebase@${V}/${n}/+esm`,n=>`https://esm.sh/firebase@${V}/${n}`];
let M,AU,D,imp;for(const f of SRC){try{const [m,u,d]=await Promise.race([Promise.all([import(f('app')),import(f('auth')),import(f('database'))]),new Promise((_,j)=>setTimeout(()=>j(new Error('timeout')),6000))]);/* source tabhi lo jab app+auth+database ek hi instance me chalein */const pa=m.initializeApp(CFGJ,'probe'+Math.random().toString(36).slice(2,7));d.getDatabase(pa);u.getAuth(pa);M=m;AU=u;D=d;imp=f;break}catch(e){console.warn('Firebase source failed, trying next:',f('app'))}}
if(!M){console.warn('Firebase SDK load nahi hua -> REST mode (CDN ke bina)');const R=mkRest(CFGJ,'sc_user_rest_auth');M=R.M;AU=R.AU;D=R.DBM;imp=()=>'data:text/javascript,throw 0'}
const {getDatabase,ref,set,get,remove,onValue,query,orderByChild,limitToLast}=D,{getAuth,onAuthStateChanged,createUserWithEmailAndPassword,signInWithEmailAndPassword,signOut,sendPasswordResetEmail,updateProfile,updatePassword,reauthenticateWithCredential,EmailAuthProvider,setPersistence,browserLocalPersistence,browserSessionPersistence}=AU;
const app=M.initializeApp(CFGJ),db=getDatabase(app),auth=getAuth(app);
onValue(ref(db,'.info/serverTimeOffset'),x=>{TOFF=+x.val()||0;try{rollDay()}catch(e){}});
import(imp('analytics')).then(m=>m.getAnalytics(app)).catch(()=>{});
const WID='w'+Math.random().toString(36).slice(2,9),emit=k=>window.dispatchEvent(new StorageEvent('storage',{key:k}));
let uid=null,dirty=0,tm=0,applying=0,regBusy=0,unsubs=[],lastPh,lastSt=null;
const dn=n=>{const w=String(n||'').trim().split(/\s+/).filter(Boolean);return(w[0]||'User').slice(0,14)+(w[1]?' '+w[1][0].toUpperCase()+'.':'')};
/* public leaderboard entry (first name + initial only) and DP mirror */
const LBW=()=>{if(!uid)return Promise.resolve();const o={n:dn(S.user.name),c:String(S.user.code||''),b:+(+S.bal||0).toFixed(2),e:+S.earned||0,p:S.user.photo?1:0,t:now()};
 const pr=D.update(ref(db,'lb/'+uid),o).catch(()=>D.update(ref(db,'lb/'+uid),{n:o.n,e:o.e,p:o.p,t:o.t}).catch(e=>console.warn('lb write blocked:',e.message)));
 if(S.user.photo!==lastPh){const ph=S.user.photo||'',old=lastPh;lastPh=S.user.photo;set(ref(db,'avatars/'+uid),ph||null).catch(()=>{lastPh=old})}
 return pr};
const toArr=v=>v==null?[]:Array.isArray(v)?v.filter(Boolean):Object.entries(v).map(([k,x])=>({id:k,...x}));
const ERR=e=>({'auth/invalid-credential':'Incorrect email or password.','auth/wrong-password':'Incorrect email or password.','auth/user-not-found':'Incorrect email or password.','auth/invalid-login-credentials':'Incorrect email or password.','auth/too-many-requests':'Too many attempts. Try again later.','auth/network-request-failed':'No internet connection.','auth/email-already-in-use':'This email is already registered.','auth/weak-password':'Password is too weak.','auth/operation-not-supported-in-this-environment':'Open the app from an https link, not a local file.','auth/unauthorized-domain':'This website is not authorised in Firebase (Authentication → Settings → Authorized domains).','auth/operation-not-allowed':'Email/Password sign-in is not enabled in Firebase.'})[e&&e.code]||'Something went wrong. Please try again.';
const cache=()=>{try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}};
/* ---- push user state (debounced) ---- */
const REF_NEED=3;let lastRD=-1,rUid='';const refTry=new Set();
async function syncRef(){try{if(!uid||!S.user.referredBy||S.user.referredBy===S.user.code)return;const d=+S.done||0;if(d===lastRD)return;if(!rUid){const n=await get(ref(db,'referralCodes/'+S.user.referredBy));if(!n.exists())return;rUid=n.val()}await D.update(ref(db,'referrals/'+rUid+'/'+uid),{done:d});lastRD=d}catch(e){console.warn('ref sync',e.message)}}
const flush=async()=>{if(!uid||!dirty)return;dirty=0;try{await set(ref(db,'users/'+uid+'/state'),{...JSON.parse(JSON.stringify(S)),_w:WID});lastSt=null;syncRef();D.update(ref(db,'usersIndex/'+uid),{name:S.user.name||'',email:S.user.email||'',phone:S.user.phone||'',code:S.user.code||'',referredBy:S.user.referredBy||'',bal:S.bal,earned:S.earned,wd:S.wd,done:S.done,pendT:S.pendT,pendW:S.pendW,createdAt:S.user.createdAt||0,lastSeen:now()}).catch(()=>{});LBW()}catch(e){console.warn('save failed',e.message);dirty=1}};
FB.push=()=>{if(!uid||applying)return;dirty=1;clearTimeout(tm);tm=setTimeout(flush,700)};
addEventListener('pagehide',flush);document.addEventListener('visibilitychange',()=>{if(document.hidden)flush()});
/* ---- live admin data -> same keys the app already reads ---- */
const first=(path,fn)=>new Promise(res=>{let f=1;onValue(ref(db,path),sn=>{fn(sn.val());if(f){f=0;res()}},er=>{console.warn(path,er.message);if(f){f=0;res()}})});
const wr=(k,v)=>{const j=JSON.stringify(v);try{if(localStorage.getItem(k)===j)return;localStorage.setItem(k,j)}catch(e){}emit(k)};
const pub=Promise.all([first('tasks',v=>wr('smartcash_tasks',toArr(v))),first('banners',v=>wr('smartcash_banners',toArr(v))),first('config',v=>wr('smartcash_config',v&&typeof v==='object'?v:{})),first('broadcasts',v=>wr('smartcash_broadcasts',toArr(v).map(b=>({...b,ts:+b.ts||0}))))]);
/* ---- apply admin decisions exactly once ---- */
function wdResolve(txId,ok){const x=S.tx.find(y=>y.id===txId);if(!x||x.type!=='Withdrawal'||x.st!=='Pending')return;const v=-x.amt;S.pendW=Math.max(0,+(S.pendW-v).toFixed(2));if(ok){x.st='Completed';S.wd=+(S.wd+v).toFixed(2);addNotif('Withdrawal completed',money(v)+' has been paid to you.','wd');addAct('Withdrawal completed: '+money(v))}else{x.st='Rejected';S.bal=+(S.bal+v).toFixed(2);addTx('Refund','Refund for rejected withdrawal',v);addNotif('Withdrawal rejected',money(v)+' was returned to your balance.','wd');addAct('Withdrawal rejected and refunded')}}
function applyInbox(k,m){if(!m||S.applied.includes(k))return 0;S.applied.push(k);if(S.applied.length>300)S.applied.shift();
 if(m.type==='review')reviewTask(String(m.taskId),!!m.ok,m.reason);else if(m.type==='withdrawal')wdResolve(String(m.txId),!!m.ok);
 else if(m.type==='notify')addNotif(String(m.title||'Notice'),String(m.message||''),'info');
 else if(m.type==='ticket'){const tk=S.tickets.find(x=>x.id===m.ticketId);if(tk){tk.status=m.status||'closed';if(m.reply)tk.reply=String(m.reply)}addNotif('Support update',String(m.reply||'Your ticket was updated.'),'info')}
 else if(m.type==='adjust'){const a=+m.amount,note=String(m.note||'Admin adjustment');if(!a)return 0;if(a>0)earn('Bonus',a,'Bonus',note,0,'Bonus credited',money(a)+' added: '+note,'info');else{S.bal=Math.max(0,+(S.bal+a).toFixed(2));addTx('Adjustment',note,a);addNotif('Balance adjusted',money(a)+': '+note,'info')}}
 return 1}
async function inboxH(sn){const v=sn.val();if(!v)return;let ch=0;const ks=Object.keys(v);ks.forEach(k=>{if(applyInbox(k,v[k]))ch=1});if(ch){save();refreshTasks();updateStats();await flush()}if(!dirty)ks.forEach(k=>remove(ref(db,'inbox/'+uid+'/'+k)).catch(()=>{}))}
function refH(sn){const v=sn.val()||{};let ch=0;const paidNow=[];Object.entries(v).forEach(([rid,r])=>{if(!r||typeof r!=='object')return;let x=S.refs.find(y=>y.rid===rid);if(!x){x={rid,n:r.name||'Friend',st:'Registered',e:0,np:0,ts:r.ts||now()};S.refs.unshift(x);addNotif('Referral update',x.n+' joined with your code.','ref');ch=1}
 /* AUTOMATIC referral (no admin approval): friend ke approved tasks 1/3, 2/3 par notification, 3/3 par reward auto-credit.
    Progress (x.np), status (x.st) aur S.credited 'REF_<id>' user state me save hote hain -> app band/open par bhi sahi chalta hai, reward sirf ek baar. */
 const d=Math.min(REF_NEED,Math.max(0,+r.done||0)),paidKey='REF_'+rid;
 if(typeof x.np!=='number'){x.np=x.st==='Qualified'?REF_NEED:0;ch=1}
 for(let n=x.np+1;n<REF_NEED&&n<=d;n++){x.np=n;addNotif('Referral progress',x.n+' completed '+n+'/'+REF_NEED+' tasks.','ref');ch=1}
 if(d>=REF_NEED&&x.st!=='Qualified'&&!S.credited.includes(paidKey)){
  S.credited.push(paidKey);x.st='Qualified';x.np=REF_NEED;ch=1;
  if(r.paid===true){x.e=+r.paidAmount||0}/* pehle hi paid (dusre device se) -> dobara credit nahi */
  else{const rw=+window.SmartCash.getConfig().referralReward||0;x.e=rw;earn('Ref',rw,'Referral Reward','Referral qualified: '+x.n,25,'Referral 3/3 tasks completed',x.n+' completed '+REF_NEED+'/'+REF_NEED+' tasks · Reward Credited: '+money(rw),'ref');if(!refTry.has(rid)){refTry.add(rid);paidNow.push([rid,rw])}}}
 else if(x.st==='Qualified'&&!r.paid&&!refTry.has(rid)){refTry.add(rid);paidNow.push([rid,+x.e||0])}});
 if(ch||paidNow.length){save();refreshTasks();updateStats();
  /* pehle state server par save, uske baad hi referral 'paid' mark (admin ko status dikhane ke liye) */
  if(paidNow.length){dirty=1;flush().then(()=>{paidNow.forEach(([rid,amt])=>{if(dirty){refTry.delete(rid);return}D.update(ref(db,'referrals/'+uid+'/'+rid),{paid:true,paidAt:now(),paidAmount:amt}).catch(()=>refTry.delete(rid))})})}}}
function remote(v){const{_w,...rest}=v,au=S.auth;applying=1;S=mg(seed(),rest);S.auth=au;normTasks();cache();applying=0;refreshTasks();updateStats()}
/* ---- account bootstrap ---- */
async function claimCode(name,id){for(let i=0;i<8;i++){const c=mkCode(name);try{await set(ref(db,'referralCodes/'+c),id);return c}catch(e){}}return mkCode(name)}
async function bootstrap(u,x){const keep={theme:S.theme,lang:S.set.lang};S=seed();S.theme=keep.theme;S.set.lang=keep.lang;S.onboarded=1;S.auth=1;
 const name=x.name||u.displayName||(u.email||'User').split('@')[0];uid=u.uid;const code=await claimCode(name,u.uid);
 Object.assign(S.user,{name,email:u.email,phone:x.phone||'',id:u.uid,code,createdAt:now(),since:new Date().toLocaleDateString('en',{month:'short',year:'numeric'})});
 if(x.rc){S.user.referredBy=S.user.refUsed=x.rc;S.user.refDate=ymd();if(x.ruid){const rv={name,ts:now(),qualified:false};await set(ref(db,'referrals/'+x.ruid+'/'+u.uid),rv).catch(()=>set(ref(db,'referrals/'+x.ruid+'/'+u.uid),rv)).catch(()=>{})}}
 addNotif('Welcome to '+appName(),'Your account is ready. Claim your first Daily Check-in or start a task.','welcome');addAct('Account created');dirty=1;await flush()}
const WELCOME_F=()=>`<div class="c"><div class="ring ok">✓</div><h2 style="margin-top:12px">Welcome to ${esc(appName())}! 🎉</h2><p class="muted sm">Your account is ready. Pick a task and start earning.</p><div class="col" style="margin-top:14px"><button class="btn p full" data-go="tasks">Browse tasks</button><button class="btn full" data-act="close">Continue</button></div></div>`;
async function attach(u,fresh){uid=u.uid;lastRD=-1;rUid='';unsubs.forEach(f=>f());unsubs=[];
 const bl=await get(ref(db,'users/'+uid+'/blocked')).catch(()=>null);if(bl&&bl.val()===true){uid=null;await signOut(auth);showToast('⚠ This account is suspended');return}
 const sn=await get(ref(db,'users/'+uid+'/state')).catch(()=>null);
 if(sn&&sn.exists()){const{_w,...r}=sn.val();lastSt=JSON.stringify(r);S=mg(seed(),r)}else await bootstrap(u,{});
 S.auth=1;S.onboarded=1;S.user.id=uid;S.user.email=u.email||S.user.email;normTasks();applyTheme();finishAuth();cache();try{LBW()}catch(e){}
 unsubs.push(onValue(ref(db,'users/'+uid+'/state'),n=>{const v=n.val();if(v&&v._w!==WID){const{_w,...q}=v,j=JSON.stringify(q);if(j===lastSt)return;lastSt=j;remote(v)}}),onValue(ref(db,'inbox/'+uid),inboxH),onValue(ref(db,'referrals/'+uid),refH),onValue(ref(db,'users/'+uid+'/blocked'),n=>{if(n.val()===true){showToast('⚠ Account suspended');A.doLogout()}}));
 resend();syncRef();pOn();if(fresh||['auth','forgot','onboard'].includes(cur.n)){navigateTo('home',null,true);if(fresh)openModal(WELCOME_F());else showToast('✓ Welcome back, '+S.user.name)}}
function resetLocal(){const ob=S.onboarded,th=S.theme;uid=null;unsubs.forEach(f=>f());unsubs=[];try{Object.keys(localStorage).filter(k=>k===KEY||k.startsWith('smartcash_u_')).forEach(k=>localStorage.removeItem(k))}catch(e){}S=seed();S.onboarded=ob;S.theme=th;applyTheme();loaded={};hist=[];if(!['splash','onboard','auth','forgot'].includes(cur.n))navigateTo('auth',null,true)}
/* ---- online / last seen -> presence/<uid> {online,lastSeen}  (Admin Panel > Users reads this; nothing else uses it) ---- */
let pUid=null,pConn=false;
const pRef=id=>ref(db,'presence/'+id);
const pOn=()=>{if(!uid||!pConn||document.hidden)return;const id=uid,r=pRef(id);pUid=id;D.onDisconnect(r).set({online:false,lastSeen:D.serverTimestamp()}).then(()=>D.set(r,{online:true,lastSeen:D.serverTimestamp()})).catch(e=>console.warn('presence',e.message))};
const pOff=()=>{if(!pUid)return Promise.resolve();return D.set(pRef(pUid),{online:false,lastSeen:D.serverTimestamp()}).catch(()=>{})};
const pStop=async()=>{const id=pUid;pUid=null;if(!id)return;try{await D.set(pRef(id),{online:false,lastSeen:D.serverTimestamp()});await D.onDisconnect(pRef(id)).cancel()}catch(e){}};
onValue(ref(db,'.info/connected'),x=>{pConn=x.val()===true;if(pConn)pOn()});
document.addEventListener('visibilitychange',()=>{if(document.hidden)pOff();else pOn()});
addEventListener('pagehide',pOff);addEventListener('pageshow',pOn);
setInterval(()=>{if(uid&&pUid&&pConn&&!document.hidden)D.update(pRef(pUid),{online:true,lastSeen:D.serverTimestamp()}).catch(()=>{})},45000);
const authDone=new Promise(res=>onAuthStateChanged(auth,async u=>{if(regBusy)return;try{if(u)await attach(u);else resetLocal()}catch(e){console.warn(e)}res()}));
const resend=()=>{Object.entries(S.tasks).forEach(([id,r])=>{if(r.s==='pending'&&r.submissionId&&r.proof&&(String(r.proof.value).length>200||String(r.proof.photo||'').length>200))set(ref(db,'submissions/'+r.submissionId),{uid,name:S.user.name,taskId:id,title:(findTask(id)||{}).title||'',reward:r.reward,proof:r.proof,submittedAt:r.submittedAt,status:'pending'}).then(()=>{const P=r.proof;if(String(P.value).length>200)P.value='(uploaded)';if(String(P.photo||'').length>200)P.photo='(uploaded)';save()}).catch(()=>{})});
S.tx.filter(x=>x.type==='Withdrawal'&&x.st==='Pending').forEach(x=>get(ref(db,'withdrawals/'+x.id)).then(n=>{if(n.exists())return;const q=S.pay.find(y=>x.desc==='Withdrawal to '+y.label);set(ref(db,'withdrawals/'+x.id),{uid,name:S.user.name,amount:-x.amt,method:x.desc,payTo:(q&&q.d)||null,email:S.user.email,phone:S.user.phone,ts:x.ts,status:'pending'})}).catch(()=>{}))};
/* ---- auth actions ---- */
A.doLogin=async()=>{const em=vv('em').trim().toLowerCase(),pw=vv('pw'),E={};if(!em)E.em='Please enter your email address.';else if(!/^\S+@\S+\.\S+$/.test(em))E.em='Please enter a valid email address.';if(!pw)E.pw='Please enter your password.';showErrs(['em','pw'],E);if(Object.keys(E).length)return;
 try{const rm=$('#rm').checked;await setPersistence(auth,rm?browserLocalPersistence:browserSessionPersistence);await signInWithEmailAndPassword(auth,em,pw)}catch(e){$('#e_pw').textContent=ERR(e)}};
A.doReg=async()=>{if(regBusy)return;if(window.SmartCash.getConfig().registrationOpen===false)return showToast('⚠ Registration is temporarily closed');
 const E={},fn=vv('fn').trim(),em=vv('em').trim().toLowerCase(),ph=vv('ph').replace(/[\s-]/g,''),pw=vv('pw'),cp=vv('cp'),rc=vv('rc').trim().toUpperCase();let ruid='';
 if(fn.length<2)E.fn='Please enter your full name.';if(!/^\S+@\S+\.\S+$/.test(em))E.em='Please enter a valid email address.';if(!/^\+?\d{8,13}$/.test(ph))E.ph='Enter a valid phone number (8–13 digits).';if(pw.length<8)E.pw='Password must be at least 8 characters.';if(cp!==pw)E.cp='Passwords do not match.';
 if(rc&&!DEMO_CODES.includes(rc)){const n=await get(ref(db,'referralCodes/'+rc)).catch(()=>null);if(n&&n.exists())ruid=n.val();else E.rc='Invalid referral code.'}
 showErrs(['fn','em','ph','pw','cp','rc'],E);if(Object.keys(E).length)return showToast('⚠ Please fix the highlighted fields');
 regBusy=1;try{const c=await createUserWithEmailAndPassword(auth,em,pw);await updateProfile(c.user,{displayName:fn}).catch(()=>{});await bootstrap(c.user,{name:fn,phone:ph,rc,ruid});regBusy=0;await attach(c.user,true)}catch(e){regBusy=0;E.em=ERR(e);showErrs(['em'],E);showToast('⚠ '+ERR(e))}};
A.fgSend=async()=>{const em=vv('em').trim().toLowerCase();if(!/^\S+@\S+\.\S+$/.test(em))return($('#e_em').textContent='Please enter a valid email address.');
 try{await sendPasswordResetEmail(auth,em)}catch(e){if(e.code==='auth/network-request-failed')return($('#e_em').textContent=ERR(e))}
 $('#view').innerHTML=`<div class="hero-s" style="justify-content:flex-start;padding-top:8vh"><div class="logo" style="width:68px;height:68px;font-size:34px;border-radius:20px">📧</div><h1>Check your email</h1><p class="muted sm" style="max-width:320px">If an account exists for <b>${esc(em)}</b>, we sent a link to reset your password.</p><button class="btn p" data-act="toLogin">Back to log in</button></div>`};
A.chPw=async()=>{const E={},n=vv('np'),u=auth.currentUser;if(!vv('cu'))E.cu='Enter your current password.';if(n.length<8)E.np='Password must be at least 8 characters.';if(vv('cp')!==n)E.cp='Passwords do not match.';showErrs(['cu','np','cp'],E);if(Object.keys(E).length||!u)return;
 try{await reauthenticateWithCredential(u,EmailAuthProvider.credential(u.email,vv('cu')));await updatePassword(u,n);addNotif('Password changed','Your password was updated.','sec');save();closeModal();showToast('✓ Password updated')}catch(e){E.cu=ERR(e);showErrs(['cu'],E)}};
A.doLogout=async()=>{await flush();await Promise.race([pStop(),new Promise(r=>setTimeout(r,1500))]);closeModal();try{await signOut(auth)}catch(e){}};
/* request queues for the Admin Panel */
{const o=A.submitTask;A.submitTask=el=>{o(el);const id=el.dataset.p,r=S.tasks[id];if(uid&&r&&r.s==='pending'&&r.submissionId)set(ref(db,'submissions/'+r.submissionId),{uid,name:S.user.name,taskId:id,title:(findTask(id)||{}).title||'',reward:r.reward,proof:r.proof,submittedAt:r.submittedAt,status:'pending'}).then(()=>{if(r.proof){const P=r.proof;let ch=0;if(P.type==='screenshot'&&String(P.value).length>200){P.value='(uploaded)';ch=1}if(String(P.photo||'').length>200){P.photo='(uploaded)';ch=1}if(ch)save()}}).catch(e=>{console.warn(e.message);showToast('⚠ Upload slow, will retry')})}}
{const o=A.doWd;A.doWd=()=>{const w=WD;o();const x=S.tx[0];if(uid&&x&&x.type==='Withdrawal'&&x.st==='Pending')set(ref(db,'withdrawals/'+x.id),{uid,name:S.user.name,amount:-x.amt,method:x.desc,payTo:(w&&w.p&&w.p.d)||null,email:S.user.email,phone:S.user.phone,ts:x.ts,status:'pending'}).catch(e=>console.warn(e.message))}}
{const o=A.sendFb;A.sendFb=()=>{const n=S.tickets.length;o();const x=S.tickets[0];if(uid&&x&&S.tickets.length>n)set(ref(db,'tickets/'+x.id),{...x,uid,name:S.user.name,email:S.user.email}).catch(e=>console.warn(e.message))}}
{const o=A.sendReport;A.sendReport=el=>{const n=S.reports.length;o(el);const x=S.reports[0];if(uid&&x&&S.reports.length>n)set(ref(db,'reports/'+x.id),{...x,uid,name:S.user.name}).catch(e=>console.warn(e.message))}}
const REFQ=(new URLSearchParams(location.search).get('ref')||'').toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,12);
const pre=()=>{const i=$('#rc');if(i&&REFQ&&!i.value){i.value=REFQ;i.dispatchEvent(new Event('input',{bubbles:true}))}};
AFTER.auth=pre;{const o=A.swAuth;A.swAuth=el=>{o(el);pre()}}
/* live referral-code check on the sign-up form */
window.REFCODES={};document.addEventListener('input',e=>{const i=e.target;if(i.id!=='rc')return;const c=i.value.trim().toUpperCase();if(!/^[A-Z0-9]{4,12}$/.test(c)||c in REFCODES)return;get(ref(db,'referralCodes/'+c)).then(n=>{REFCODES[c]=n.exists()?n.val():'';if(i.isConnected)i.dispatchEvent(new Event('input',{bubbles:true}))}).catch(()=>{})});
/* one-time demo content: open the app once with ?seed=1 while signed in as admin (or rules in test mode) */
FB.seed=async()=>{const o={};DEMO_TASKS.forEach(x=>o[x.id]={...x});await set(ref(db,'tasks'),o);await set(ref(db,'banners'),{BN_1:{title:'Join Telegram Channel & Get Rewards',subtitle:'Join our channel and get exclusive offers and rewards.',buttonText:'Join Now',link:'tg',icon:'✈️',bg:['#1d8fb0','#2ec4a5'],active:true,order:1},BN_2:{title:'Invite Friends & Earn Rewards',subtitle:'Share your code and earn when a friend completes an offer.',buttonText:'Refer Now',link:'refer',icon:'💰',bg:['#6d5bd0','#2aa9c9'],active:true,order:2}});await set(ref(db,'config'),window.SmartCash.getConfig());showToast('✓ Demo content added')};
Object.assign(FB,{db,auth,flush,lbPub:()=>LBW(),uid:()=>uid,
 lbWatch:cb=>{let A1={},A2={},hide={};
   const mk=(id,v)=>({id,n:String(v.n||'User'),c:String(v.c||''),ov:typeof v.a==='number',b:+(typeof v.a==='number'?v.a:(typeof v.b==='number'?v.b:(+v.e||0)))||0,e:+v.e||0,p:v.p?1:0,m:v.m?1:0}),
   rd=sn=>{const o={};sn.forEach(c=>{const v=c.val();if(v&&typeof v==='object')o[c.key]=mk(c.key,v)});return o},
   out=()=>cb(Object.values({...A1,...A2}).filter(r=>!hide[r.id]).sort((x,y)=>y.b-x.b||y.e-x.e));
   const u1=onValue(query(ref(db,'lb'),orderByChild('b'),limitToLast(100)),sn=>{A1=rd(sn);out()},e=>{console.warn('lb read blocked:',e.message);cb(null)}),
   u2=onValue(query(ref(db,'lb'),orderByChild('a'),limitToLast(50)),sn=>{A2=rd(sn);out()},()=>{}),
   u3=onValue(ref(db,'lbHide'),sn=>{hide=sn.val()||{};out()},()=>{});
   return()=>{u1();u2();u3()}},
  photo:async id=>{const v=(await get(ref(db,'avatars/'+id))).val();return typeof v==='string'&&v.startsWith('data:image/')?v:''}});
await Promise.race([Promise.all([authDone,pub]),new Promise(r=>setTimeout(r,5500))]);
if(/[?&]seed=1/.test(location.search))FB.seed().catch(e=>showToast('⚠ '+e.message));
}catch(e){console.warn('Firebase unavailable:',e);A.doLogin=A.doReg=A.fgSend=()=>showToast('⚠ Server not reachable. Check internet and reload.');setTimeout(()=>showToast('⚠ Online server not reachable. Check internet or open via https.'),2500)}finally{window.__fbOK()}})();
