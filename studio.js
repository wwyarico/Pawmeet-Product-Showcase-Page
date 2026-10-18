(()=>{'use strict';
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)],chapters=$$('.chapter'),reduce=matchMedia('(prefers-reduced-motion: reduce)');
const names={explore:'探索',circle:'圈子',profile:'多宠身份',hub:'成长手账',records:'日常记录',post:'动态详情',message:'消息与群组',recommend:'附近推荐',online:'线上活动',offline:'同城活动'};
const details={explore:'喜欢就打个招呼，还想看看就换下一位。<br>从毛孩子的性格，找到合拍的朋友。',circle:'附近的生活、养宠的灵感，都在这里。<br>点开沙坡尾探店，看看一篇动态如何连接彼此。',profile:'一个家，多个小世界。<br>切换宠物，分享属于它的日常。',hub:'档案、测试结果和日常记录。<br>关于它的一切，放在同一本手账里。',records:'喝了多少水，走了多少路。<br>随手记一笔，陪伴就有了看得见的变化。',post:'一张照片，就是聊天的开始。<br>给这次探店点个赞，或者留下一句话。',message:'从一次聊天，到一群聊得来的朋友。<br>让分享之后的联系，继续发生。',recommend:'宠物友好咖啡馆、周末派对、好物与服务。<br>关于它的生活，在这里慢慢发现。',online:'聊共同话题，也认识它的另一面。<br>试试狗狗性格测试，发现更多相处灵感。',offline:'周末派对、领养日、养宠课堂。<br>把感兴趣的活动，加入下一次出门计划。'};
let active=0,raf=0,lock=0,wheelAt=0,wheelSum=0,expanded=null,returnFocus=null;
let brandIntroTimer=0;
let partyFrame=0,partyLast=0,partyStates=null,partyTime=0,partyGust=0,partyGustTarget=0,partyGustAt=0;
function finishBrandIntro(){clearTimeout(brandIntroTimer);document.body.classList.remove('brand-pending','brand-intro')}
history.scrollRestoration='manual';
const motion=(el,frames,options={})=>{if(reduce.matches)return null;return el.animate(frames,{duration:420,easing:'cubic-bezier(.22,.8,.2,1)',...options})};
function resizePhone(shell){const stage=shell.querySelector('.phone-stage'),scale=stage.clientWidth/330;if(!scale)return;shell.style.setProperty('--phone-scale',scale);shell.querySelectorAll('iframe').forEach(f=>f.style.height=Math.max(200,stage.clientHeight/scale-29)+'px')}
const resize=new ResizeObserver(entries=>entries.forEach(e=>resizePhone(e.target)));
function ensureScreen(chapter,mode){const shell=chapter.querySelector('.phone-shell')||(expanded?.chapter===chapter?expanded.shell:null);let screen=shell.querySelector('[data-screen="'+mode+'"]');if(screen)return screen;
screen=document.createElement('div');screen.className='screen';screen.dataset.screen=mode;screen.setAttribute('role','tabpanel');screen.setAttribute('aria-label',names[mode]);
screen.innerHTML=`<div class="screen-inner"><div class="statusbar"><span>9:41</span><svg viewBox="0 0 42 13" aria-hidden="true"><path d="M1 10V8m4 2V6m4 4V3m4 7V1M19 5q5-5 10 0m-8 2q3-3 6 0m-3 2v1"/><rect x="33" y="2" width="7" height="9" rx="1.5"/><path d="M35 4v5m2-5v5m5-4v3"/></svg></div><iframe title="${names[mode]}互动演示" sandbox="allow-scripts allow-same-origin allow-forms"></iframe></div>`;
shell.querySelector('.phone-stage').append(screen);const f=screen.querySelector('iframe');f.addEventListener('load',()=>{f.dataset.loaded='true';if(mode==='profile')syncPet(chapter,chapter.dataset.pet||'1')});
if(window.PawMeetScreens)f.srcdoc=window.PawMeetScreens[mode];else f.src='app/'+mode+'.html';resizePhone(shell);return screen;}
const dismissedGuides=new Set();
const cues={explore:['swipe','左右滑试试'],circle:['scroll','上下刷刷看'],message:['scroll','往下看看消息'],profile:['pet','换个身份试试'],records:['record','点这里，记一笔'],post:['react','点赞，也能留言'],recommend:['scroll','往下发现好去处'],online:['quiz','测测它的性格'],offline:['scroll','往下发现更多']};
function dismiss(chapter,gesture='click'){if(!chapter)return;const expected=cues[chapter.dataset.selected]?.[0];if(['swipe','scroll'].includes(expected)&&gesture!==expected)return;dismissedGuides.add(chapter.dataset.selected);chapter.querySelector('.gesture-guide')?.classList.add('is-dismissed')}
function showCue(chapter,mode){const el=chapter.querySelector('.gesture-guide'),cue=cues[mode];el.hidden=!cue;if(!cue)return;el.dataset.gesture=cue[0];el.classList.toggle('is-dismissed',dismissedGuides.has(mode));
const path=cue[0]==='scroll'?'M35 18 C26 49 40 82 30 119 M35 18 L24 28 M35 18 L42 31 M30 119 L21 106 M30 119 L39 109':'M131 17 C108 20 76 43 84 65 C98 91 121 60 94 53 C66 46 40 59 18 90 M18 90 L20 72 M18 90 L35 86';
el.innerHTML='<span>'+cue[1]+'</span><svg viewBox="0 0 150 135" aria-hidden="true"><path d="'+path+'"/></svg>';}

function select(chapter,mode,animate=true){const old=chapter.dataset.selected;chapter.dataset.selected=mode;const scene=chapter.querySelector('.showcase'),screen=ensureScreen(chapter,mode),shell=screen.closest('.phone-shell');
shell.querySelectorAll('.screen').forEach(s=>{const on=s===screen;s.classList.toggle('is-selected',on);s.inert=!on});
chapter.querySelectorAll('[role=tab]').forEach(b=>{b.setAttribute('aria-selected',String(b.dataset.mode===mode));b.tabIndex=b.dataset.mode===mode?0:-1});
chapter.querySelector('.device-title').textContent=names[mode];chapter.querySelector('.feature-detail').innerHTML=details[mode];scene.dataset.current=mode;
showCue(chapter,mode);
if(animate&&old!==mode){scene.classList.add('scene-switching');motion(shell,[{transform:'translateX(16px) rotate(1.3deg) scale(.985)',opacity:.4},{transform:'translateX(-4px) rotate(-.4deg)',opacity:1,offset:.7},{transform:'none',opacity:1}],{duration:460});motion(chapter.querySelector('.feature-detail'),[{opacity:0,transform:'translateY(5px)'},{opacity:1,transform:'none'}],{duration:260});setTimeout(()=>scene.classList.remove('scene-switching'),400)}
if(expanded?.chapter===chapter)expanded.shell.querySelector('.dialog-toolbar span').textContent=names[mode];}
chapters.filter(ch=>ch.querySelector('.phone-dock')).forEach(ch=>{const dock=ch.querySelector('.phone-dock');dock.innerHTML='<dialog open class="phone-shell" aria-label="产品互动界面"><div class="dialog-toolbar"><span></span><button class="close-dialog" aria-label="关闭放大体验">×</button></div><div class="phone-stage"></div><p class="dialog-note">所有互动仅用于体验，刷新后重置。</p></dialog>';const shell=dock.querySelector('.phone-shell');resize.observe(shell);shell.querySelector('.close-dialog').addEventListener('click',e=>{e.stopPropagation();close()});shell.addEventListener('cancel',e=>{e.preventDefault();close()});shell.addEventListener('click',e=>{if(expanded&&e.target===shell){const r=shell.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)close()}});const hint=document.createElement('div');hint.className='gesture-guide';hint.setAttribute('aria-hidden','true');dock.append(hint);select(ch,dock.dataset.default,false);});
function setActive(i){if(i===active&&chapters[i].classList.contains('has-entered'))return;active=i;chapters.forEach((c,n)=>c.classList.toggle('is-active',n===i));$$('.chapters button').forEach((b,n)=>{if(n===i)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current')});$('.page-track i').style.transform=`translateY(${i*100}%)`;
const ch=chapters[i],first=!ch.classList.contains('has-entered'),title=ch.querySelector('h1,h2');
chapters.forEach((c,n)=>{c.inert=n!==i;if(n!==i){clearTimeout(c._confettiTimer);c.querySelector('.hero-confetti')?.replaceChildren();}});
syncCoverParty();
if(i!==0)finishBrandIntro();
if(ch.classList.contains('welcome')||ch.classList.contains('download')){
 ch.classList.add('has-entered');
 const intro=ch.classList.contains('welcome')&&first&&!reduce.matches;
 document.body.classList.remove('brand-pending');
 if(intro){document.body.classList.add('brand-intro');brandIntroTimer=setTimeout(finishBrandIntro,4450)}
 ch.querySelectorAll('.landing-copy > *, .home-start').forEach((el,n)=>{el.getAnimations().filter(a=>!a.animationName).forEach(a=>a.cancel());motion(el,[{opacity:0,transform:'translateY(9px)'},{opacity:1,transform:'none'}],{duration:1800,delay:(intro?4500:0)+n*150,easing:'ease-in-out',fill:'backwards'});});
 if(ch.classList.contains('welcome'))releaseCoverConfetti(ch,intro?4500:0);
 return;
}
ch.classList.add('has-entered');
clearTimeout(ch._inkTimer);title.classList.remove('is-writing');
ch.querySelectorAll('.story > *,.showcase').forEach(el=>el.getAnimations().filter(a=>!a.animationName).forEach(a=>a.cancel()));
if(first&&!reduce.matches){
 title.classList.add('is-writing');title.dataset.handwritingPlayed='true';
 const duration=Number(title.dataset.inkDuration);
 ch._inkTimer=setTimeout(()=>title.classList.remove('is-writing'),duration);
 ch.querySelectorAll('.story > *:not(h1):not(h2)').forEach((el,n)=>{if(el.classList.contains('is-dismissed'))return;motion(el,[{opacity:0,transform:'translateY(10px)'},{opacity:1,transform:'none'}],{duration:2200,easing:'ease-in-out',delay:duration+100+n*90,fill:'backwards'});});
 motion(ch.querySelector('.showcase'),[{opacity:0},{opacity:1}],{duration:2200,easing:'ease-in-out',delay:duration+100,fill:'backwards'});
}else{
 motion(ch.querySelector('.showcase'),[{opacity:0},{opacity:1}],{duration:2200,easing:'ease-in-out',fill:'backwards'});
 ch.querySelectorAll('.story > *').forEach(el=>{if(el.classList.contains('is-dismissed'))return;motion(el,[{opacity:0,transform:'translateY(10px)'},{opacity:1,transform:'none'}],{duration:2200,easing:'ease-in-out',fill:'backwards'});});
}

}

// Speed up the remaining strokes from their current position, without skipping them.
function accelerateWriting(){
 const ch=chapters[active],title=ch.querySelector('.is-writing'),intro=active===0&&document.body.classList.contains('brand-intro');
 if(reduce.matches||(!title&&!intro)||ch._inkAccelerated)return;
 ch._inkAccelerated=true;
 const animations=(intro?[...document.querySelector('.wordmark').getAnimations({subtree:true}),...ch.querySelector('.hero-art').getAnimations()]:title.getAnimations({subtree:true})).filter(a=>a.playState!=='finished');
 const remaining=Math.max(0,...animations.map(a=>Math.max(0,a.effect.getComputedTiming().endTime-Number(a.currentTime||0))));
 const wait=Math.min(900,remaining);
 const rate=Math.max(1,remaining/900);
 animations.forEach(a=>a.updatePlaybackRate(rate));
 const followers=intro?ch.querySelectorAll('.landing-copy > *, .home-start'):ch.querySelectorAll('.story > *:not(h1):not(h2),.showcase');
 followers.forEach((el,n)=>el.getAnimations().filter(a=>!a.animationName).forEach(a=>{
  const timing=a.effect.getTiming(),now=Number(a.currentTime||0);
  if(now<timing.delay)a.effect.updateTiming({delay:now+wait+60+n*60});
 }));
 if(intro){clearTimeout(brandIntroTimer);brandIntroTimer=setTimeout(finishBrandIntro,wait);releaseCoverConfetti(ch,wait+60)}
 else{clearTimeout(ch._inkTimer);ch._inkTimer=setTimeout(()=>title.classList.remove('is-writing'),wait)}
}
document.addEventListener('click',accelerateWriting,true);

function go(i){i=Math.max(0,Math.min(chapters.length-1,i));if(expanded)return;cancelAnimationFrame(raf);const from=scrollY,to=scrollY+chapters[i].getBoundingClientRect().top,t0=performance.now(),duration=reduce.matches?0:(active===0||i===0?1050:650);document.documentElement.classList.add('is-paging');lock=t0+duration+220;
function step(now){const t=duration?Math.min((now-t0)/duration,1):1;scrollTo({top:from+(to-from)*(1-Math.pow(1-t,4)),behavior:'instant'});syncBrand();if(t<1)raf=requestAnimationFrame(step);else{document.documentElement.classList.remove('is-paging');setActive(i)}}raf=requestAnimationFrame(step);}
function send(ch,type,extra={}){const shell=ch.querySelector('.phone-shell')||(expanded?.chapter===ch?expanded.shell:null),f=shell.querySelector('.screen.is-selected iframe');if(!f)return;const post=()=>f.contentWindow.postMessage({type:'pawmeet-studio',action:type,...extra},'*');if(f.dataset.loaded)post();else f.addEventListener('load',post,{once:true});}
function syncPet(ch,id){ch.dataset.pet=id;ch.querySelectorAll('[data-pet]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.pet===id)));const f=(ch.querySelector('.phone-shell')||expanded?.shell)?.querySelector('[data-screen=profile] iframe');if(f?.dataset.loaded)f.contentWindow.postMessage({type:'pawmeet-studio',action:'pet',id},'*');}
function burst(button){if(reduce.matches)return;const scene=button.closest('.showcase'),r=button.getBoundingClientRect(),sr=scene.getBoundingClientRect();for(let i=0;i<6;i++){const dot=document.createElement('span');dot.className='paw-particle';dot.textContent=i%2?'♡':'✦';dot.style.left=(r.left-sr.left+r.width/2)+'px';dot.style.top=(r.top-sr.top+10)+'px';scene.append(dot);const a=motion(dot,[{opacity:1,transform:'translate(0,0) scale(.5)'},{opacity:0,transform:`translate(${(i-2.5)*24}px,${-55-Math.abs(i-2.5)*14}px) rotate(${i*30}deg) scale(1.1)`}],{duration:700,easing:'cubic-bezier(.16,.7,.3,1)'});a?.finished.then(()=>dot.remove());}}
function expand(ch){if(expanded)return;returnFocus=document.activeElement;const shell=ch.querySelector('.phone-shell');expanded={shell,chapter:ch};shell.querySelector('.dialog-toolbar span').textContent=names[ch.dataset.selected];shell.close();shell.classList.add('is-expanded');document.documentElement.classList.add('dialog-open');shell.showModal();resizePhone(shell);motion(shell,[{opacity:0,scale:'.97'},{opacity:1,scale:'1'}],{duration:240});shell.querySelector('.close-dialog').focus();dismiss(ch)}
function close(){if(!expanded)return;const shell=expanded.shell;expanded=null;shell.close();shell.classList.remove('is-expanded');shell.show();resizePhone(shell);document.documentElement.classList.remove('dialog-open');returnFocus?.focus({preventScroll:true});}
document.addEventListener('click',e=>{const t=e.target,ch=t.closest('.chapter')||chapters[active];dismiss(ch);const tab=t.closest('[data-mode]');if(tab){ch.querySelector('.switch-guide')?.classList.add('is-dismissed');return select(ch,tab.dataset.mode);}const nav=t.closest('[data-go]');if(nav)return go(+nav.dataset.go);if(t.closest('.wordmark')){e.preventDefault();go(0);return}if(t.closest('[data-expand]'))return expand(ch);const pet=t.closest('[data-pet]');if(pet){select(ch,'profile');syncPet(ch,pet.dataset.pet);motion(pet.querySelector('img'),[{transform:'rotate(-10deg) scale(.9)'},{transform:'rotate(6deg) scale(1.1)',offset:.6},{transform:'none'}],{duration:360});return}const love=t.closest('[data-love]');if(love){select(ch,'post');send(ch,'like');love.classList.toggle('is-loved');love.querySelector('span').textContent=love.classList.contains('is-loved')?'喜欢已送达':'这份日常，我喜欢';if(love.classList.contains('is-loved'))burst(love);}});
addEventListener('message',e=>{const f=$$('iframe').find(f=>f.contentWindow===e.source);if(!f)return;const ch=f.closest('.chapter')||expanded?.chapter;if(e.data?.type==='pawmeet-open-post'&&ch?.querySelector('[data-mode=post]'))select(ch,'post');if(e.data?.type==='pawmeet-demo-interaction'){accelerateWriting();dismiss(ch)}if(e.data?.type==='pawmeet-demo-gesture'&&f.closest('.screen')?.classList.contains('is-selected'))dismiss(ch,e.data.gesture);if(e.data?.type==='pawmeet-pet-changed'&&ch){ch.dataset.pet=e.data.id;ch.querySelectorAll('[data-pet]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.pet===e.data.id)))}if(e.data?.type==='pawmeet-like-changed'){const b=$('[data-love]');b.classList.toggle('is-loved',!!e.data.liked);b.querySelector('span').textContent=e.data.liked?'喜欢已送达':'这份日常，我喜欢';}});
addEventListener('wheel',e=>{if(innerWidth<=900||expanded||e.ctrlKey||Math.abs(e.deltaX)>Math.abs(e.deltaY)||!e.deltaY)return;e.preventDefault();const now=performance.now();if(now<lock){lock=Math.max(lock,now+160);wheelAt=now;return}if(now-wheelAt>180||Math.sign(wheelSum)!==Math.sign(e.deltaY))wheelSum=0;wheelAt=now;wheelSum+=e.deltaY*(e.deltaMode===1?16:1);if(Math.abs(wheelSum)>5){go(active+Math.sign(wheelSum));wheelSum=0}},{passive:false});
document.addEventListener('keydown',e=>{if(expanded||e.target.closest('input,textarea,select'))return;const tab=e.target.closest('[role=tab]');if(tab&&['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();const tabs=[...tab.parentElement.children],n=e.key==='Home'?0:e.key==='End'?tabs.length-1:(tabs.indexOf(tab)+(e.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;tab.closest('.chapter').querySelector('.switch-guide')?.classList.add('is-dismissed');select(tab.closest('.chapter'),tabs[n].dataset.mode);tabs[n].focus();return}if(['PageDown','PageUp'].includes(e.key)){e.preventDefault();go(active+(e.key==='PageDown'?1:-1))}});
let pending=false;addEventListener('scroll',()=>{syncBrand();if(pending||document.documentElement.classList.contains('is-paging'))return;pending=true;requestAnimationFrame(()=>{let nearest=0;chapters.forEach((c,i)=>{if(c.getBoundingClientRect().top<=innerHeight*.4)nearest=i});setActive(nearest);pending=false})},{passive:true});
// The same supplied logo travels from its hero slot into the header.
// Geometry stays in layout coordinates; only the logo is transformed.
function releaseCoverConfetti(ch,delay){
 clearTimeout(ch._confettiTimer);
 const layer=ch.querySelector('.hero-confetti');if(!layer)return;
 layer.replaceChildren();if(reduce.matches)return;
 ch._confettiTimer=setTimeout(()=>{
  if(!ch.classList.contains('is-active'))return;
  const bounds=ch.getBoundingClientRect(),heading=ch.querySelector('h1').getBoundingClientRect();
  const center=heading.left-bounds.left+heading.width/2,top=heading.top-bounds.top+heading.height*.45;
  const colors=['#a98ce6','#efc267','#90cdb7','#e99fba','#8ebbe7','#c4b0eb'];
  for(let i=0;i<30;i++){
   const piece=document.createElement('i'),side=i%2?-1:1,phase=Math.random()*Math.PI*2;
   const startX=center+side*heading.width*.17,startY=top+(i%5-2)*5;
   const vx=side*(90+Math.random()*155),vy=-140-Math.random()*110,duration=3.3+Math.random()*.6;
   piece.style.cssText=`left:${startX}px;top:${startY}px;width:${4+i%3}px;height:${12+(i*7)%15}px;background:${colors[i%colors.length]}`;
   layer.append(piece);
   const frames=Array.from({length:49},(_,j)=>{
    const p=j/48,t=p*duration;
    const x=vx*(1-Math.exp(-1.1*t))/1.1+10*(Math.sin(3*t+phase)-Math.sin(phase));
    const y=vy*t+115*t*t;
    return {offset:p,transform:`translate3d(${x}px,${y}px,0) rotate(${phase*30+t*side*110}deg) rotateY(${t*240+phase*40}deg)`,opacity:p<.04?p/.04:p>.78?(1-p)/.22:1};
   });
   piece.animate(frames,{duration:duration*1000,delay:i%6*22,easing:'linear',fill:'both'}).finished.then(()=>piece.remove()).catch(()=>piece.remove());
  }
 },delay);
}
function syncCoverParty(){
 cancelAnimationFrame(partyFrame);partyFrame=0;partyLast=0;
 if(reduce.matches||document.hidden||!$('#welcome').classList.contains('is-active'))return;
 if(!partyStates)partyStates=$$('.cover-balloon,.cover-streamer').map(el=>({el,balloon:el.classList.contains('cover-balloon'),x:0,y:0,vx:0,vy:0,tail:0,angle:0,tx:0,ty:0,next:0,phase:Math.random()*Math.PI*2,frequency:.6+Math.random()*.65,amplitude:3+Math.random()*4,drag:1.7+Math.random()*.8,spring:.8+Math.random()*.6}));
 partyFrame=requestAnimationFrame(tickCoverParty);
}
function tickCoverParty(now){
 const dt=Math.min((now-(partyLast||now))/1000,.04);partyLast=now;partyTime+=dt;
 if(partyTime>partyGustAt){partyGustTarget=(Math.random()-.5)*7;partyGustAt=partyTime+2+Math.random()*4;}
 partyGust+=(partyGustTarget-partyGust)*Math.min(1,dt*.55);
 partyStates.forEach(s=>{
  if(s.el.dataset.popped)return;
  if(partyTime>s.next){s.tx=(Math.random()-.5)*9;s.ty=(Math.random()-.5)*10;s.next=partyTime+2.5+Math.random()*4;}
  const bob=Math.sin(partyTime*s.frequency+s.phase)*s.amplitude;
  s.vx+=(s.spring*(s.tx+partyGust-s.x)-s.drag*s.vx)*dt;
  s.vy+=(s.spring*(s.ty+bob-s.y)-s.drag*s.vy)*dt;
  s.x+=s.vx*dt;s.y+=s.vy*dt;
  s.angle+=((s.vx*1.2+partyGust*.5)-s.angle)*Math.min(1,dt*1.7);
  s.el.style.transform=`translate(${s.x.toFixed(2)}px,${s.y.toFixed(2)}px) rotate(${s.angle.toFixed(2)}deg)`;
  if(s.balloon){
   s.tail+=((partyGust*1.5-s.vx*3)-s.tail)*Math.min(1,dt*1.2);
   const sway=Math.sin(partyTime*s.frequency*.8+s.phase)*4;
   s.el.querySelector('.balloon-string').setAttribute('d',`M0 27 C${-s.tail*.35} 47 ${s.tail+sway} 62 ${s.tail*.6+sway} 86`);
  }else{
   const wave=partyTime*s.frequency*1.3+s.phase,a=8+s.amplitude+Math.abs(partyGust)*.4;
   s.el.querySelector('.flutter-band').setAttribute('d',`M0 0 C18 ${Math.sin(wave)*a} 34 ${Math.sin(wave-1.8)*a} 52 ${Math.sin(wave-2.6)*4} C70 ${Math.sin(wave-3.4)*a} 84 ${Math.sin(wave-4.2)*8} 100 ${Math.sin(wave-5)*7}`);
  }
 });
 partyFrame=requestAnimationFrame(tickCoverParty);
}
function popCoverBalloon(balloon){
 if(balloon.dataset.popped)return;
 const ch=$('#welcome'),layer=ch.querySelector('.hero-confetti'),body=balloon.querySelector('.balloon-envelope');
 const shape=body.getBoundingClientRect(),bounds=ch.getBoundingClientRect(),color=body.getAttribute('fill');
 const x=shape.left-bounds.left+shape.width/2,y=shape.top-bounds.top+shape.height/2;
 if(document.activeElement===body)body.blur();
 balloon.dataset.popped='true';balloon.style.visibility='hidden';balloon.setAttribute('aria-hidden','true');body.setAttribute('tabindex','-1');
 ch.querySelector('.party-announcement').textContent=`${balloon.dataset.balloonName}气球被戳破了`;
 if(reduce.matches)return;
 for(let i=0;i<18;i++){
  const piece=document.createElement('i'),angle=Math.random()*Math.PI*2,speed=75+Math.random()*150,vx=Math.cos(angle)*speed,vy=Math.sin(angle)*speed-65,duration=2.8+Math.random()*.6,spin=(Math.random()-.5)*500;
  piece.className='balloon-fragment';piece.style.cssText=`left:${x}px;top:${y}px;width:${5+Math.random()*10}px;height:${8+Math.random()*13}px;background:${color};clip-path:polygon(0 15%,75% 0,100% 65%,30% 100%)`;
  layer.append(piece);
  const frames=Array.from({length:49},(_,j)=>{const p=j/48,t=p*duration;return {offset:p,transform:`translate3d(${vx*(1-Math.exp(-t))}px,${vy*t+220*t*t}px,0) rotate(${spin*t}deg) rotateY(${t*240}deg)`,opacity:p>.96?(1-p)/.04:1}});
  piece.animate(frames,{duration:duration*1000,easing:'linear',fill:'both'}).finished.then(()=>piece.remove()).catch(()=>piece.remove());
 }
}
document.addEventListener('click',e=>{const balloon=e.target.closest('.cover-balloon');if(balloon)popCoverBalloon(balloon)});
document.addEventListener('keydown',e=>{const balloon=e.target.closest('.cover-balloon');if(balloon&&['Enter',' '].includes(e.key)){e.preventDefault();popCoverBalloon(balloon)}});
document.addEventListener('visibilitychange',syncCoverParty);reduce.addEventListener('change',syncCoverParty);
const brand=$('.wordmark'),hero=$('#welcome'),brandSlot=$('.hero-brand-slot');
function syncBrand(){
 const heroHeight=hero.offsetHeight,p=Math.max(0,Math.min(1,scrollY/heroHeight));
 if(p>.015)finishBrandIntro();
 const slot=brandSlot.getBoundingClientRect(),header=$('.site-header').getBoundingClientRect();
 const bx=header.left+brand.offsetLeft,by=header.top+brand.offsetTop;
 const size=brand.offsetWidth,scale=slot.width/size;
 const target=Number.parseFloat(getComputedStyle(brand).getPropertyValue('--brand-dock-width'))/size;
 const startX=slot.left+(slot.width-size*scale)/2-bx;
 const startY=slot.top+scrollY+(slot.height-brand.offsetHeight*scale)/2-by;
 const remaining=1-p,s=target+(scale-target)*remaining;
 const bend=reduce.matches?0:Math.sin(Math.PI*p);
 brand.style.transform=reduce.matches?`scale(${target})`:`translate(${startX*remaining}px,${startY*remaining*remaining}px) scale(${s*(1-.12*bend)},${s*(1+.07*bend)}) skewX(${-7*bend}deg)`;
 document.body.classList.toggle('at-home',p<.03);
 document.body.classList.toggle('brand-in-flight',p>0&&p<1);
 const navVisible=p>=.995;
 document.body.classList.toggle('show-chapter-nav',navVisible);
 $('.chapters').inert=!navVisible;
}
addEventListener('resize',syncBrand);reduce.addEventListener('change',syncBrand);
syncBrand();
const initial=chapters.findIndex(c=>'#'+c.id===location.hash);
function enterInitial(){if(initial>0){chapters[initial].scrollIntoView({behavior:'instant'});setActive(initial)}else{scrollTo({top:0,behavior:'instant'});setActive(0)}syncBrand();}
// Paint the actual watercolor before starting the one-time focus transition.
const coverImages=[$('.hero-art'),$('.cover-poster-image'),$('.cover-subtitle-image')].filter(Boolean);
if(initial<=0)Promise.all(coverImages.map(image=>image.decode?image.decode().catch(()=>{}):Promise.resolve())).then(enterInitial);else enterInitial();
// Preload the remaining small, extracted screens after the first frame has painted.
setTimeout(()=>chapters.filter(ch=>ch.querySelector('.phone-dock')).forEach(ch=>ch.querySelector('.phone-dock').dataset.modes.split(',').forEach(m=>{ensureScreen(ch,m);resizePhone(ch.querySelector('.phone-shell')||expanded?.shell)})),650);
})();
