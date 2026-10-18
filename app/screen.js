(()=>{
 const mode=document.documentElement.dataset.demoMode;
 const $=s=>document.querySelector(s);let dragging=false;
 const pets=[{id:1,petId:'1',name:'奥利奥 Oreo',species:'dog',breed:'金毛寻回犬',age:'3岁2个月',gender:'♂ 男孩',avatar:$('.pet-card img,.pl-avatar')?.src||''},{id:2,petId:'2',name:'布丁 Pudding',species:'cat',breed:'布偶猫',age:'2岁',gender:'♀ 女孩'}];
 window.PawMeetData={getCurrentUserId:()=> 'seed_oreo',getPets:()=>pets,getAccount:()=>({nickname:'家有二宝妈'}),getActivePet:()=>pets[0]};
 window.DemoAllow=e=>{
  if(dragging)return false;
  if(mode==='records'){const a=e.target.closest('[data-pl]')?.dataset.pl;return a!=='close'&&!(a==='back'&&$('#petLife .pl-head h1')?.textContent==='日常记录')}
  if(mode==='profile')return !!e.target.closest('.pet-card[data-pet-id]');
  if(mode==='explore')return !!e.target.closest('[data-explore-action]');
  if(mode==='circle')return !!e.target.closest('[data-open-post]');
  if(['hub','message','offline'].includes(mode))return false;
  if(mode==='post')return !!e.target.closest('#btnLike,#btnBookmark,#commentCountIcon,.comment-input-wrap,.comment-like-btn,[data-reply],#replyBoxOverlay');
  return !!e.target.closest('.topic-b1,[data-demo-quiz],.pm-hero-dot,.demo-external-quiz');
 };
 window.addEventListener('keydown',e=>{if(mode==='records'&&e.key==='Escape'&&$('#petLife .pl-head h1')?.textContent==='日常记录'&&!$('.pl-modal-shade')){e.preventDefault();e.stopImmediatePropagation()}},true);
 if(mode==='records'){
  const d=DemoLife.read('seed_oreo','1');d.seedVersion=1;
  d.dailyGoals=[{on:'2026-01-01',values:{water:{value:500,unit:'ml'},food:{value:150,unit:'g'},exercise:{value:40,unit:'分钟'}}}];
  for(let n=6;n>=0;n--){const date=new Date();date.setDate(date.getDate()-n);const day=new Date(date.getTime()-date.getTimezoneOffset()*60000).toISOString().slice(0,10);[['water',[280,450,500,380,420,320,320][6-n]],['food',120],['exercise',35]].forEach(([type,value])=>d.records.push({id:'demo-'+n+'-'+type,type,value,at:day+'T08:00',note:''}));}
  DemoLife.persist(d,'seed_oreo','1');
 }
 if(mode==='profile'){
  const states=[$('#view-profile').outerHTML,$('#cat-profile').innerHTML];
  function centerPet(smooth=true){const track=$('#view-profile #petCardsScroll'),card=track?.querySelector('.pet-card.active-pet');if(!card||!track.clientWidth)return;const gap=Math.max(0,(track.clientWidth-card.offsetWidth)/2);track.style.setProperty('--pet-center-gap',gap+'px');const left=card.offsetLeft-track.offsetLeft-(track.clientWidth-card.offsetWidth)/2;track.scrollTo({left,behavior:smooth&&!matchMedia('(prefers-reduced-motion:reduce)').matches?'smooth':'instant'});}
  document.addEventListener('click',e=>{const pet=e.target.closest('.pet-card[data-pet-id]');if(!pet)return;const index=String(pet.dataset.petId)==='2'?1:0,oldTrack=$('#view-profile #petCardsScroll'),left=oldTrack.scrollLeft,oldScroll=$('#view-profile #mainScroll')?.scrollTop||0;$('#view-profile').outerHTML=states[index];const track=$('#view-profile #petCardsScroll');track.scrollLeft=left;if($('#view-profile #mainScroll'))$('#view-profile #mainScroll').scrollTop=oldScroll;requestAnimationFrame(()=>centerPet(true));});
  new ResizeObserver(()=>centerPet(false)).observe(document.documentElement);requestAnimationFrame(()=>centerPet(false));
 }
 if(mode==='post'){
  const reply=$('#replyBoxOverlay'),input=$('#replyBoxInput');let replyId=null,replyAuthor='';
  const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function compose(id=null,author=''){replyId=id;replyAuthor=author;input.placeholder=id?'回复 '+author+'…':'说点什么…';reply.classList.add('active');input.focus()}
  document.addEventListener('click',e=>{
   const t=e.target;
   for(const [id,count,base,cls] of [['btnLike','detailLikesCount',369,'liked'],['btnBookmark','detailBookmarkCount',120,'saved']]){
    const b=t.closest('#'+id);if(b){const on=b.classList.toggle(cls);b.setAttribute('aria-pressed',String(on));$('#'+count).textContent=base+Number(on);return;}
   }
   if(t.closest('#commentCountIcon,.comment-input-wrap'))return compose();
   const like=t.closest('.comment-like-btn');if(like){const on=like.classList.toggle('liked');like.lastChild.textContent=' '+(34+Number(on));return;}
   const r=t.closest('[data-reply]');if(r)return compose(r.dataset.reply,r.dataset.author);
   if(t===reply){reply.classList.remove('active');return;}
   if(t.closest('[data-send]')){
    const value=input.value.trim();if(!value)return;
    const id='comment-'+Date.now(),html=`<div class="comment-item" data-new-comment><div class="demo-comment-avatar">🐶</div><div class="comment-right"><div class="comment-header"><div class="comment-name">家有二宝妈</div></div><div class="comment-text">${replyId?'<span class="demo-reply-name">回复 '+esc(replyAuthor)+'：</span>':''}${esc(value)}</div><div class="comment-meta">刚刚 <span class="reply-action" data-reply="${id}" data-author="家有二宝妈">回复</span></div><div class="sub-replies" id="sub-replies-${id}"></div></div></div>`;
    const list=replyId?document.getElementById('sub-replies-'+replyId):$('#commentsArea');
    (list||$('.comments-section')||$('.detail-content')).insertAdjacentHTML('beforeend',html);
    $('#detailCommentCount').textContent=Number($('#detailCommentCount').textContent)+1;$('#commentsCountSpan').textContent=$('#detailCommentCount').textContent;
    input.value='';reply.classList.remove('active');document.querySelector('[data-new-comment]:last-child')?.scrollIntoView({block:'nearest',behavior:'smooth'});
   }
  });
 }
 if(['recommend','online'].includes(mode)){
  const quizUrl='https://wwyarico.github.io/dog-personality/';
  function openQuiz(trigger){
   if($('.demo-external-quiz'))return;
   const panel=document.createElement('section');panel.className='demo-external-quiz';panel.setAttribute('role','dialog');panel.setAttribute('aria-modal','true');panel.setAttribute('aria-label','狗狗性格测试');
   panel.style.cssText='position:fixed;inset:0;z-index:99999;background:white;display:flex;flex-direction:column;overflow:hidden';
   panel.innerHTML='<header style="height:44px;flex:0 0 44px;display:flex;align-items:center;gap:18px;padding:0 12px;border-bottom:1px solid #eee9f8;background:#fff;font:600 14px/1.4 sans-serif;color:#302944"><button type="button" aria-label="返回活动展示" style="border:0;background:#f1edff;border-radius:10px;color:#6c52cf;padding:7px 11px;font:inherit;cursor:pointer">‹ 返回</button><span>狗狗性格测试</span></header>';
   // The remote page is cross-origin: clip only its scrollbar gutter, keeping scrolling enabled.
   const viewport=document.createElement('div');viewport.style.cssText='position:relative;flex:1;min-height:0;overflow:hidden';
   const frame=document.createElement('iframe');frame.title='狗狗性格测试官方网站';frame.src=quizUrl;frame.referrerPolicy='no-referrer';frame.style.cssText='display:block;border:0;width:calc(100% + 18px);height:100%;max-width:none;background:white';
   viewport.append(frame);panel.append(viewport);document.body.append(panel);
   const back=panel.querySelector('button');back.addEventListener('click',()=>{panel.remove();trigger.focus({preventScroll:true})});back.focus({preventScroll:true});
  }
  document.addEventListener('click',e=>{const trigger=e.target.closest('.topic-b1,[data-demo-quiz]');if(trigger){e.preventDefault();openQuiz(trigger)}});
  document.addEventListener('keydown',e=>{const trigger=e.target.closest('.topic-b1');if(trigger&&['Enter',' '].includes(e.key)){e.preventDefault();openQuiz(trigger)}});
 }
 document.querySelectorAll('input:not(#replyBoxInput),textarea').forEach(el=>{if(mode!=='records'&&mode!=='post')el.readOnly=true});
 document.querySelectorAll('.h-scroll-track,.carousel-track,#petCardsScroll').forEach(track=>{
  let start=null;
  track.querySelectorAll('img').forEach(im=>im.draggable=false);
  track.addEventListener('pointerdown',e=>{if(e.pointerType==='touch')return;start={x:e.clientX,left:track.scrollLeft,id:e.pointerId};});
  track.addEventListener('pointermove',e=>{if(!start)return;const d=e.clientX-start.x;if(Math.abs(d)>5){dragging=true;track.setPointerCapture(e.pointerId);track.style.scrollSnapType='none';track.style.scrollBehavior='auto';track.scrollLeft=start.left-d;e.preventDefault()}});
  const finish=()=>{start=null;track.style.scrollSnapType='';track.style.scrollBehavior='';setTimeout(()=>dragging=false,0)};
  track.addEventListener('pointerup',finish);track.addEventListener('pointercancel',finish);
 });
 if(mode==='circle'){
  const open=e=>{if(e.target.closest('[data-open-post]'))parent.postMessage({type:'pawmeet-open-post'},'*')};
  document.addEventListener('click',open);document.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target.closest('[data-open-post]'))open(e)});
 }
 if(mode==='explore'){
  const cards=[...document.querySelectorAll('[data-demo-card]')],feedback=$('.explore-feedback');let index=0,busy=false,start=null;
  function next(like){if(busy)return;busy=true;const card=cards[index],name=card.querySelector('.pet-name-l3').textContent;feedback.textContent=like?'已喜欢 '+name+' · 下次见面打个招呼':'看看下一位毛孩子';
   const done=()=>{card.hidden=true;card.style.transform='';index=(index+1)%cards.length;const fresh=cards[index];fresh.hidden=false;fresh.querySelector('.card-scroll-area-l3').scrollTop=0;if(!matchMedia('(prefers-reduced-motion: reduce)').matches)fresh.animate([{opacity:.5,transform:'scale(.95) translateY(9px)'},{opacity:1,transform:'none'}],{duration:340,easing:'cubic-bezier(.2,.8,.2,1)'});busy=false;};
   if(matchMedia('(prefers-reduced-motion: reduce)').matches)return done();card.animate([{transform:card.style.transform||'none',opacity:1},{transform:`translateX(${like?340:-340}px) rotate(${like?18:-18}deg)`,opacity:0}],{duration:320,easing:'cubic-bezier(.3,0,.7,.3)'}).finished.then(done);
  }
  document.addEventListener('click',e=>{const b=e.target.closest('[data-explore-action]');if(b)next(b.dataset.exploreAction==='like')});
  cards.forEach(c=>{c.querySelectorAll('img').forEach(im=>im.draggable=false);c.addEventListener('pointerdown',e=>{if(busy)return;start={x:e.clientX,y:e.clientY,id:e.pointerId,card:c};});c.addEventListener('pointermove',e=>{if(!start||start.card!==c)return;const dx=e.clientX-start.x,dy=e.clientY-start.y;if(Math.abs(dx)>16&&Math.abs(dx)>Math.abs(dy)*1.5){c.setPointerCapture(e.pointerId);c.style.transform=`translateX(${dx*.55}px) rotate(${dx/24}deg)`;}});c.addEventListener('pointerup',e=>{if(!start)return;const dx=e.clientX-start.x,dy=e.clientY-start.y;start=null;if(Math.abs(dx)>65&&Math.abs(dx)>Math.abs(dy)*1.4)next(dx>0);else c.style.transform='';});c.addEventListener('pointercancel',()=>{start=null;c.style.transform='';});});
 }
 document.body.dataset.ready='true';
})();
