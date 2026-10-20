/* FX: lightweight visual + audio effects (no libraries).
   - One canvas for coin / sparkle particles; the animation loop runs ONLY while particles exist.
   - Win banner with count-up.
   - Richer synthesized sound effects through the same Web Audio context as core.js (respects ST.snd).
   - Haptics via navigator.vibrate where supported.
   Everything is cosmetic: it never reads or writes wallet, bets or results. */
var FX=(function(){
 var cv=null,cx=null,P=[],raf=0,W=0,H=0,S=1,last=0,bn=null,bt=0,cu=0;
 var RM=false;try{RM=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches}catch(e){}
 var MAX=RM?30:140;

 function init(){
  if(cv)return true;var app=document.getElementById('app');if(!app)return false;
  cv=document.createElement('canvas');cv.id='fx';cv.setAttribute('aria-hidden','true');app.appendChild(cv);cx=cv.getContext('2d');return !!cx}
 function size(){var app=document.getElementById('app');S=Math.min(window.devicePixelRatio||1,1.5);W=app.clientWidth;H=app.clientHeight;
  if(cv.width!==Math.round(W*S)||cv.height!==Math.round(H*S)){cv.width=Math.round(W*S);cv.height=Math.round(H*S)}}
 function spawn(x,y,n,o){
  o=o||{};var i,a,v;n=Math.min(n,MAX-P.length);
  for(i=0;i<n;i++){a=(o.dir!=null?o.dir:-Math.PI/2)+(Math.random()-.5)*(o.spread||Math.PI*1.2);v=(o.v||7)*(.5+Math.random()*.7);
   P.push({x:x,y:y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,g:o.g||.28,r:(o.r||6)*(.7+Math.random()*.6),a:1,life:o.life||70+Math.random()*40,age:0,spin:Math.random()*6.28,vs:(Math.random()-.5)*.4,k:o.k||(Math.random()<.72?0:1)})}
  if(!raf&&P.length){last=0;raf=requestAnimationFrame(loop)}}
 function coin(p){
  var sx=Math.abs(Math.cos(p.spin));cx.save();cx.translate(p.x,p.y);cx.scale(Math.max(.15,sx),1);
  cx.fillStyle='#b8730a';cx.beginPath();cx.arc(0,0,p.r,0,6.283);cx.fill();
  cx.fillStyle='#ffd84d';cx.beginPath();cx.arc(0,0,p.r*.82,0,6.283);cx.fill();
  cx.fillStyle='#fff3b0';cx.beginPath();cx.arc(-p.r*.2,-p.r*.2,p.r*.35,0,6.283);cx.fill();cx.restore()}
 function star(p){
  var r=p.r*(.6+.4*Math.abs(Math.sin(p.spin*2)));cx.save();cx.translate(p.x,p.y);cx.rotate(p.spin);cx.fillStyle='#fff6c8';cx.beginPath();
  for(var i=0;i<4;i++){var a=i*Math.PI/2;cx.lineTo(Math.cos(a)*r*1.5,Math.sin(a)*r*1.5);cx.lineTo(Math.cos(a+Math.PI/4)*r*.4,Math.sin(a+Math.PI/4)*r*.4)}
  cx.closePath();cx.fill();cx.restore()}
 function loop(t){
  raf=0;if(!cv)return;var dt=last?Math.min(2.2,(t-last)/16.7):1;last=t;size();cx.setTransform(S,0,0,S,0,0);cx.clearRect(0,0,W,H);
  for(var i=P.length-1;i>=0;i--){var p=P[i];p.age+=dt;p.vy+=p.g*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vx*=.992;p.spin+=p.vs*dt;
   var f=p.age/p.life;if(f>=1||p.y>H+30){P.splice(i,1);continue}
   cx.globalAlpha=f>.7?(1-f)/.3:1;if(p.k)star(p);else coin(p)}
  cx.globalAlpha=1;
  if(P.length)raf=requestAnimationFrame(loop);else cx.clearRect(0,0,W,H)}
 function where(el){
  var a=document.getElementById('app').getBoundingClientRect();
  if(!el){return{x:a.width/2,y:a.height*.42}}
  var r=el.getBoundingClientRect();return{x:r.left-a.left+r.width/2,y:r.top-a.top+r.height/2}}

 /* tier by win / bet: 0 small, 1 nice (>=5x), 2 big (>=20x), 3 mega (>=60x) */
 function tier(win,bet){var m=bet>0?win/bet:1;return m>=60?3:m>=20?2:m>=5?1:0}
 function fmtN(n){return n.toLocaleString('en-IN')}
 function banner(win,t){
  if(!init())return;clearBanner();var app=document.getElementById('app');
  bn=document.createElement('div');bn.className='winb t'+t;bn.setAttribute('aria-hidden','true');
  bn.innerHTML='<div class="wb-ray"></div><div class="wb-in"><small>'+(['WIN','NICE WIN','BIG WIN','MEGA WIN'][t])+'</small><b><i class="coin" aria-hidden="true"></i><span>0</span></b></div>';
  app.appendChild(bn);var sp=bn.querySelector('span'),t0=0,dur=t>=2?1300:800;
  (function step(ts){if(!bn||!sp.isConnected)return;if(!t0)t0=ts;var f=Math.min(1,(ts-t0)/dur);sp.textContent=fmtN(Math.round(win*(1-Math.pow(1-f,3))));if(f<1)cu=requestAnimationFrame(step)})(performance.now());
  bt=setTimeout(clearBanner,t>=2?2600:1700)}
 function clearBanner(){clearTimeout(bt);cancelAnimationFrame(cu);if(bn&&bn.parentNode)bn.parentNode.removeChild(bn);bn=null}

 /* ---- sound ---- */
 function ctx(){try{if(!ST.snd)return null;AC=AC||new(window.AudioContext||window.webkitAudioContext)();if(AC.state==='suspended')AC.resume();return AC}catch(e){return null}}
 function tone(f,d,type,vol,when,slide){
  var c=ctx();if(!c)return;try{var t=c.currentTime+(when||0),o=c.createOscillator(),g=c.createGain();o.type=type||'sine';o.frequency.setValueAtTime(f,t);if(slide)o.frequency.exponentialRampToValueAtTime(slide,t+d);
   g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(vol||.08,t+.012);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(g);g.connect(c.destination);o.start(t);o.stop(t+d+.02)}catch(e){}}
 var sfx={
  click:function(){tone(520,.06,'triangle',.07)},
  chip:function(){tone(1500,.04,'square',.025);tone(900,.07,'triangle',.06,.012)},
  bet:function(){tone(300,.05,'square',.04);tone(640,.08,'triangle',.06,.03)},
  tick:function(){tone(1100,.025,'square',.03)},
  reelStop:function(i){tone(150+i*30,.09,'sine',.1,0,70);tone(700,.03,'square',.025)},
  spin:function(){tone(260,.35,'sawtooth',.03,0,520)},
  err:function(){tone(180,.14,'sawtooth',.05);tone(140,.18,'sawtooth',.05,.1)},
  lose:function(){tone(300,.18,'triangle',.05);tone(220,.26,'triangle',.05,.14)},
  win:function(t){var n=[523,659,784,1047,1319,1568],k=2+t*2,i;for(i=0;i<k&&i<n.length;i++)tone(n[i],.22,'triangle',.07,i*.075);
   if(t>=2){for(i=0;i<8;i++)tone(1800+Math.random()*900,.05,'square',.02,.4+i*.07)}}
 };
 function buzz(ms){try{if(ST.snd&&navigator.vibrate)navigator.vibrate(ms)}catch(e){}}

 return{
  sfx:sfx,buzz:buzz,
  /* press feedback for any button, once, globally */
  win:function(win,bet,el){
   var t=tier(win,bet);sfx.win(t);buzz(t>=2?[40,40,80]:30);
   if(!init())return;var o=where(el);size();
   spawn(o.x,o.y,[16,30,55,90][t],{v:[7,9,11,13][t],spread:Math.PI*(t>=2?1.7:1.1)});
   if(t>=1){spawn(W*.15,H*.6,t*10,{dir:-Math.PI/3,spread:.7,v:11});spawn(W*.85,H*.6,t*10,{dir:-Math.PI*2/3,spread:.7,v:11})}
   banner(win,t)},
  burst:function(el,n){if(!init())return;var o=where(el);size();spawn(o.x,o.y,n||8,{v:5,spread:Math.PI*2,k:1,r:5,g:.12,life:40})},
  clear:function(){P=[];clearBanner();if(raf){cancelAnimationFrame(raf);raf=0}if(cv&&cx){cx.setTransform(1,0,0,1,0,0);cx.clearRect(0,0,cv.width,cv.height)}},
  suspend:function(){try{if(AC&&AC.state==='running')AC.suspend()}catch(e){}}
 };
})();

/* Press feedback: soft click sound on every button (games add their own specific sounds). */
document.addEventListener('pointerdown',function(e){
 var b=e.target.closest&&e.target.closest('button');if(!b||b.disabled||b.getAttribute('aria-disabled')==='true')return;
 b.classList.add('pr');setTimeout(function(){b.classList.remove('pr')},160);
 if(b.matches('.nav button,.g,.x,.ban button,.plus,.sw,.btn:not(.spin):not(.big)'))FX.sfx.click()},{passive:true});

/* Leaving / returning to the app: silence audio and drop leftover particles; resume on return. */
document.addEventListener('visibilitychange',function(){
 if(document.hidden){FX.clear();FX.suspend()}
 else{try{if(AC&&ST.snd&&AC.state==='suspended')AC.resume()}catch(e){}}});
