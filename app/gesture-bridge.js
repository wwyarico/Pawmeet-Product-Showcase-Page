(()=>{
 const mode=document.documentElement.dataset.demoMode;
 const tell=gesture=>parent.postMessage({type:'pawmeet-demo-gesture',gesture},'*');
 const positions=new WeakMap();let inputAt=-Infinity,start=null;
 function remember(e){
  inputAt=performance.now();
  for(let el=e.target;el instanceof Element;el=el.parentElement)positions.set(el,el.scrollTop);
  positions.set(document.scrollingElement,document.scrollingElement.scrollTop);
 }
 document.addEventListener('wheel',remember,{capture:true,passive:true});
 document.addEventListener('keydown',e=>{if(['ArrowDown','ArrowUp','PageDown','PageUp','Home','End',' '].includes(e.key))remember(e)},true);
 document.addEventListener('pointerdown',e=>{
  remember(e);
  start=mode==='explore'&&e.target.closest('#topCardL3,[data-demo-card]')?{x:e.clientX,y:e.clientY,id:e.pointerId}:null;
 },{capture:true,passive:true});
 document.addEventListener('pointermove',()=>{if(start)inputAt=performance.now()},{passive:true});
 document.addEventListener('touchmove',()=>{inputAt=performance.now()},{passive:true});
 document.addEventListener('pointerup',e=>{
  if(!start||start.id!==e.pointerId)return;
  const dx=e.clientX-start.x,dy=e.clientY-start.y;start=null;
  if(Math.abs(dx)>100&&Math.abs(dx)>Math.abs(dy)*1.4)tell('swipe');
 },{capture:true,passive:true});
 document.addEventListener('pointercancel',()=>{start=null},{passive:true});
 document.addEventListener('scroll',e=>{
  const el=e.target===document?document.scrollingElement:e.target;
  if(!(el instanceof Element))return;
  const before=positions.get(el)??el.scrollTop;
  if(performance.now()-inputAt<1600&&Math.abs(el.scrollTop-before)>12){tell('scroll');positions.set(el,el.scrollTop)}
 },{capture:true,passive:true});
})();
