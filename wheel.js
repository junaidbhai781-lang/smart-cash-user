/* ---------- Super77Pro ---------- */
function wheel(gb){
 var R=RULES.wheel,SEG=R.seg,BX=R.box,N=SEG.length,A=360/N,hist=ST.h.wheel.slice(0,8),rot=0,bets=[0,0,0],busy=false,dead=false,t=10,rd=0,pend=null,tw=today.wheel||0;
 var KC={'🍉':['#4aaaf4','#4aaaf4'],'🥭':['#2b78d8','#2b78d8'],'7️⃣':['#b23ae8','#7a1fb8']},KN={'🍉':'melon','🥭':'mango','7️⃣':'seven'};
 var KI={'🍉':0,'🥭':1,'7️⃣':2};
 function pt(r,a){var d=a*Math.PI/180;return (r*Math.sin(d)).toFixed(2)+' '+(-r*Math.cos(d)).toFixed(2)}
 function wedge(i){var a0=i*A-A/2,a1=i*A+A/2,e=SEG[i],c=KC[e];
  return '<g class="wg" id="wg'+i+'"><path d="M0 0L'+pt(84,a0)+'A84 84 0 0 1 '+pt(84,a1)+'Z" fill="url(#wf'+KI[e]+(i%2)+')"/><g transform="rotate('+(i*A)+')"><use href="#i-'+IM[e]+'" x="-15" y="-76" width="30" height="30"/></g></g>'}
 var lights='';for(var k=0;k<18;k++){var lp=pt(91,k*20).split(' ');lights+='<circle class="lt" cx="'+lp[0]+'" cy="'+lp[1]+'" r="2.6" style="--d:'+(k%2)+'"/>'}
 var grads='';
 Object.keys(KC).forEach(function(k){[0,1].forEach(function(a){var c=KC[k][a];grads+='<radialGradient id="wf'+KI[k]+a+'" cx="0" cy="0" r="84" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="'+c+'" stop-opacity=".78"/><stop offset=".55" stop-color="'+c+'"/><stop offset="1" stop-color="'+c+'"/></radialGradient>'})});
 var svg='<svg viewBox="-100 -100 200 200" aria-hidden="true"><defs>'+grads+
  '<linearGradient id="wRim" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff6c0"/><stop offset=".22" stop-color="#f5c04a"/><stop offset=".5" stop-color="#8a5600"/><stop offset=".76" stop-color="#ffe28a"/><stop offset="1" stop-color="#b9770a"/></linearGradient>'+
  '<linearGradient id="wRim2" x1="1" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#fff0a8"/><stop offset=".5" stop-color="#c98a14"/><stop offset="1" stop-color="#ffe28a"/></linearGradient>'+
  '<radialGradient id="wVig" cx="0" cy="0" r="84" gradientUnits="userSpaceOnUse"><stop offset=".62" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".42"/></radialGradient></defs>'+
  '<circle r="99.500" fill="url(#wRim)"/><circle r="96.500" fill="#3a2200"/><circle r="95" fill="url(#wRim2)"/><circle r="93" fill="#160a24"/><circle r="88.500" fill="none" stroke="#f5c04a" stroke-opacity=".35" stroke-width=".6"/>'+
  SEG.map(function(_,i){return wedge(i)}).join('')+
  SEG.map(function(_,i){var a=i*A+A/2;return '<line x1="0" y1="0" x2="'+pt(84,a).split(' ')[0]+'" y2="'+pt(84,a).split(' ')[1]+'" class="dv"/>'}).join('')+
  '<circle r="84" fill="url(#wVig)"/><circle r="84" fill="none" stroke="url(#wRim)" stroke-width="2.600"/><circle r="30" fill="none" stroke="url(#wRim)" stroke-width="2"/>'+lights+'</svg>';
 gb.innerHTML='<div class="stat"><div><b id="tw">'+money(tw)+'</b><i>Today\'s win</i></div><div><b id="cd">10</b><i>Bet time (s)</i></div><div><b id="rd">1</b><i>Round</i></div></div><div class="tbar" aria-hidden="true"><i id="tbr"></i></div>'+
  '<div class="wr" id="wr"><div class="ptr" aria-hidden="true"></div><div class="wheel" id="wh">'+svg+'</div><div class="wgloss" aria-hidden="true"></div><div class="hub" id="hb" aria-live="off">10</div></div>'+
  '<div class="msg" id="mg" role="status" aria-live="polite">Pick a chip, then tap a box.</div>'+
  '<div class="hist"><em>Results</em><span id="hs">'+histHTML(hist)+'</span></div>'+
  '<div class="bets">'+BX.map(function(b,i){return '<button class="bx k-'+KN[b.k]+'" data-i="'+i+'" aria-label="Bet on '+NN[b.k]+', pays x'+b.m+'"><div class="e">'+ic(b.k)+'</div><b>x'+b.m+'</b><small>Your bet</small><div class="t">0</div></button>'}).join('')+'</div>'+
  '<div class="bsum"><span>Chip <b>₹<span id="cv">10</span></b></span><span>Total bet <b>₹<span id="tbt">0</span></b></span></div>'+chipsHTML();
 var cv=chipPick(gb),bxs=$$('.bx',gb),wr=$('#wr',gb);
 function tot(){return bets.reduce(function(a,b){return a+b},0)}
 function setT(n){$('#hb',gb).textContent=n;$('#cd',gb).textContent=n;$('#tbr',gb).style.transform='scaleX('+Math.max(0,n)/10+')'}
 bxs.forEach(function(b){b.onclick=function(){var i=+b.dataset.i,v=cv();if(busy)return toast('Betting is closed. Wait for the next round.');if(wallet<v)return toast('Insufficient balance','err');setW(wallet-v);txn('Bet','Super77Pro',v);FX.sfx.bet();FX.buzz(8);bets[i]+=v;$('.t',b).textContent=money(bets[i]);b.classList.add('has');$('#tbt',gb).textContent=money(tot())}});
 function round(){if(dead)return;busy=false;gb.classList.remove('busy');t=10;rd++;bets=[0,0,0];bxs.forEach(function(b){b.classList.remove('win','has');$('.t',b).textContent='0'});$$('.wg',gb).forEach(function(e){e.classList.remove('wn')});$('#tbt',gb).textContent='0';var m=$('#mg',gb);m.textContent='Place your bets';m.className='msg';$('#rd',gb).textContent=rd;setT(t);
  var iv=every(function(){t--;setT(t);if(t<=0){clearInterval(iv);go()}},1000)}
 function go(){busy=true;gb.classList.add('busy');wr.classList.add('spinning');$('#mg',gb).textContent='Spinning...';var i=rnd(N);pend={i:i,bets:bets.slice()};bets=[0,0,0];/* the round now owns these bets: closing the game must not refund them */var dl=1800+(((-i*A-rot)%360)+360)%360;rot+=dl;$('#wh',gb).style.transform='rotate('+rot+'deg)';FX.sfx.spin();
  var nt=Math.round(dl/A);for(var k=1;k<=nt;k++)(function(k){later(FX.sfx.tick,4200*(1-Math.pow(1-k/nt,.25)))})(k);
  later(settle,4400)}
 function settle(){
  if(!pend)return;var p=pend;pend=null;var r=SEG[p.i],win=R.pay(r,p.bets);reportRound('Super77Pro',p.bets,win);wr.classList.remove('spinning');
  bxs.forEach(function(b,k){if(BX[k].k==r&&p.bets[k])b.classList.add('win')});$('#wg'+p.i,gb).classList.add('wn');
  hist.unshift(r);hist=hist.slice(0,8);ST.h.wheel=hist;$('#hs',gb).innerHTML=histHTML(hist);$('#hb',gb).innerHTML=ic(r);
  var m=$('#mg',gb);
  if(win){setW(wallet+win);txn('Win','Super77Pro',win);FX.win(win,p.bets.reduce(function(a,b){return a+b},0),$('#hb',gb));tw+=win;today.wheel=tw;$('#tw',gb).textContent=money(tw);m.textContent='Result '+NN[r]+'. You won ₹'+money(win)+'!';m.className='msg win'}
  else{if(p.bets.some(Boolean))FX.sfx.lose();m.textContent='Result '+NN[r]+(p.bets.some(Boolean)?'. No win this round.':'');m.className='msg'+(p.bets.some(Boolean)?' lose':'')}
  save();if(!dead)later(round,3500)}
 cleanup=function(){dead=true;if(pend)settle();else{var s=tot();if(s){setW(wallet+s);txn('Refund','Super77Pro',s);bets=[0,0,0]}}};
 round();
}
