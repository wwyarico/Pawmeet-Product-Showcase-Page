
(function(){
  'use strict';
  var items=[
    {image:'./assets/1c990111112af425.webp',label:'线下活动',open:function(){}},
    {image:'./assets/1542517a1b45760c.webp',label:'购物',open:function(){}},
    {image:'./assets/8042d9a4350e66c3.webp',label:'线上活动',open:function(){}}
  ];
  window.PawMeetQuizRecommendationImage=items[2].image;
  var area=document.getElementById('recommendMainScrollArea');
  if(!area)return;
  function install(){
    var old=area.querySelector('.rf-city-banner');
    if(!old||old.dataset.pmCarousel==='auto-v1')return;
    var host=document.createElement('div');
    host.className='rf-city-banner pm-hero-carousel';
    host.dataset.pmCarousel='auto-v1';
    host.setAttribute('role','region');
    host.setAttribute('aria-roledescription','轮播图');
    host.setAttribute('aria-label','宠Go推荐');
    var viewport=document.createElement('div');viewport.className='pm-hero-viewport';
    var track=document.createElement('div');track.className='pm-hero-track';
    var order=[2,0,1,2,0];
    var index=0,position=1,moving=false,timer=null,settleTimer=null,start=null,suppressClickUntil=0;
    order.forEach(function(itemIndex){
      var item=items[itemIndex],slide=document.createElement('button');
      slide.type='button';slide.className='pm-hero-slide';if(itemIndex===2)slide.dataset.demoQuiz='1';
      slide.setAttribute('aria-label',item.label+'，点击进入');
      var img=document.createElement('img');img.src=item.image;img.alt=item.label+'推荐配图';img.draggable=false;
      slide.appendChild(img);
      slide.addEventListener('click',function(event){
        if(Date.now()<suppressClickUntil){event.preventDefault();event.stopPropagation();return;}
        item.open();
      });
      track.appendChild(slide);
    });
    viewport.appendChild(track);host.appendChild(viewport);
    var dots=document.createElement('div');dots.className='pm-hero-dots';dots.setAttribute('aria-label','选择推荐内容');
    var dotButtons=items.map(function(item,dotIndex){
      var dot=document.createElement('button');dot.type='button';dot.className='pm-hero-dot';
      dot.setAttribute('aria-label','第'+(dotIndex+1)+'张：'+item.label);
      dot.addEventListener('click',function(){select(dotIndex);});dots.appendChild(dot);return dot;
    });
    host.appendChild(dots);old.replaceWith(host);
    function refreshDots(){dotButtons.forEach(function(dot,i){dot.setAttribute('aria-current',String(i===index));});}
    function paint(animated){
      var reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      track.style.transition=animated&&!reduce?'transform 380ms ease':'none';
      track.style.transform='translate3d(-'+(position*100)+'%,0,0)';
      refreshDots();
      if(reduce&&animated)requestAnimationFrame(finish);
    }
    function finish(){
      if(!moving)return;
      clearTimeout(settleTimer);
      if(position===4)position=1;
      else if(position===0)position=3;
      moving=false;paint(false);
    }
    function visible(){
      var petgo=document.getElementById('view-petgo'),recommend=document.getElementById('view-recommend');
      if(window.frameElement){var rect=window.frameElement.getBoundingClientRect();if(!rect.width||rect.bottom<=0||rect.top>=parent.innerHeight)return false;}
      return host.isConnected&&document.visibilityState!=='hidden'&&
        (!petgo||getComputedStyle(petgo).display!=='none')&&
        (!recommend||getComputedStyle(recommend).display!=='none');
    }
    function restart(){
      clearTimeout(timer);
      timer=setTimeout(function tick(){
        if(visible()&&!moving)shift(1);
        else restart();
      },1500);
    }
    function shift(delta){
      if(moving)return;
      index=(index+delta+items.length)%items.length;
      position+=delta;moving=true;paint(true);
      settleTimer=setTimeout(finish,500);
      restart();
    }
    function select(target){
      if(target===index||moving)return;
      index=target;position=target+1;moving=true;paint(true);
      settleTimer=setTimeout(finish,500);
      restart();
    }
    track.addEventListener('transitionend',function(e){if(e.propertyName==='transform')finish();});
    host.addEventListener('touchstart',function(e){if(e.touches.length===1)start={x:e.touches[0].clientX,y:e.touches[0].clientY};},{passive:true});
    host.addEventListener('touchend',function(e){
      if(!start||!e.changedTouches.length)return;
      var dx=e.changedTouches[0].clientX-start.x,dy=e.changedTouches[0].clientY-start.y;start=null;
      if(Math.abs(dx)>35&&Math.abs(dx)>Math.abs(dy)*1.2){suppressClickUntil=Date.now()+450;shift(dx<0?1:-1);}
    },{passive:true});
    host.addEventListener('mousedown',function(e){if(e.button===0)start={x:e.clientX,y:e.clientY};});
    host.addEventListener('mouseup',function(e){
      if(!start)return;var dx=e.clientX-start.x,dy=e.clientY-start.y;start=null;
      if(Math.abs(dx)>35&&Math.abs(dx)>Math.abs(dy)*1.2){suppressClickUntil=Date.now()+450;shift(dx<0?1:-1);}
    });
    host.addEventListener('dragstart',function(e){e.preventDefault();});
    host.addEventListener('mouseenter',function(){clearTimeout(timer);});
    host.addEventListener('mouseleave',function(){start=null;restart();});
    host.addEventListener('keydown',function(e){if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();shift(e.key==='ArrowRight'?1:-1);}});
    document.addEventListener('visibilitychange',restart);
    paint(false);restart();
  }
  new MutationObserver(install).observe(area,{childList:true});
  install();
})();
