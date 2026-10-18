(()=>{
 window.addEventListener('click',e=>{parent.postMessage({type:'pawmeet-demo-interaction'},'*');if(window.DemoAllow&&!window.DemoAllow(e)){e.preventDefault();e.stopImmediatePropagation()}},true);
 const memory=()=>{const m=new Map();return {get length(){return m.size},key:i=>[...m.keys()][i]??null,getItem:k=>m.get(String(k))??null,setItem:(k,v)=>m.set(String(k),String(v)),removeItem:k=>m.delete(String(k)),clear:()=>m.clear()}};
 Object.defineProperty(window,'localStorage',{value:memory()});
 Object.defineProperty(window,'sessionStorage',{value:memory()});
 window.fetch=()=>Promise.reject(new Error('演示模式不连接网络'));
 window.open=()=>null;
 window.PawMeetMobile={confirm:async()=>true};
 window.PawMeetProfileRecommendations={list:(kind,rows)=>rows,track:()=>{},refresh:async()=>{},isReady:()=>true};
 window.PawMeetCloudBusiness={escapeHtml:v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))};
 const lives=new Map();
 window.DemoLife={read(u,p){const k=u+':'+p;if(!lives.has(k))lives.set(k,{version:1,profile:{},records:[],reports:[],attempts:[],types:[],goals:{}});return structuredClone(lives.get(k))},async persist(v,u,p){lives.set(u+':'+p,structuredClone(v));return structuredClone(v)}};
 window.addEventListener('error',e=>{const el=document.createElement('div');el.hidden=true;el.className='demo-error';el.textContent=e.message;document.documentElement.append(el)});
 window.DemoLife.saveAttempt=async(u,p,a)=>{const d=window.DemoLife.read(u,p);d.attempts.push(a);return window.DemoLife.persist(d,u,p)};
})();
