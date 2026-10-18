/* In-memory adapter around the APK's original presentation components. */
const mode=document.documentElement.dataset.demoMode;
window.PAWMEET_DATA={contentImages:{}};
const nativePets=[
  { id: 'u_dog_1', name: 'Luna · 金毛', breed: '金毛寻回犬', species: 'dog', age: '2岁', gender: '♀', dist: '1.5km', bio: '温柔粘人的大暖男，最爱接飞盘和游泳。', tags: ['接飞盘狂魔', '社交悍匪'], questions: ['周末一般去哪遛狗？', '最爱的零食是什么？'], img: window.PAWMEET_DATA.contentImages.dog },
  { id: 'u_dog_2', name: 'Max · 边牧', breed: '边境牧羊犬', species: 'dog', age: '3岁', gender: '♂', dist: '2.2km', bio: '高智商工作犬，每天都要飞盘消耗精力。', tags: ['指令大师', '充电5分钟狂奔2小时'], questions: ['你家狗狗会哪些指令？', '喜欢户外运动吗？'], img: window.PAWMEET_DATA.contentImages.event },
  { id: 'u_cat_1', name: '布布 · 英短', breed: '英短蓝猫', species: 'cat', age: '1岁8个月', gender: '♀', dist: '1.1km', bio: '高冷小公主，心情好才肯给摸。', tags: ['粘人精', '踩奶专家'], questions: ['你家猫咪粘人吗？', '喜欢什么玩具？'], img: window.PAWMEET_DATA.contentImages.cat },
  { id: 'u_cat_2', name: '咪咪 · 布偶猫', breed: '布偶猫', species: 'cat', age: '2岁', gender: '♂', dist: '3.0km', bio: '行走的棉花糖，一抱就瘫软。', tags: ['猫条杀手', '纸箱爱好者'], questions: ['猫咪会踩奶吗？', '爱吃什么零食？'], img: window.PAWMEET_DATA.contentImages.cat },
  { id: 'u_rabbit_1', name: '团团 · 垂耳兔', breed: '荷兰垂耳兔', species: 'rabbit', age: '1岁', gender: '♂', dist: '2.5km', bio: '软萌小团子，最爱苜蓿草和摸头。', tags: ['摸头狂魔', '挑食精'], questions: ['你家兔兔吃什么草？', '喜欢被摸哪里？'], img: window.PAWMEET_DATA.contentImages.smallPet },
  { id: 'u_rabbit_2', name: '雪球 · 侏儒兔', breed: '荷兰侏儒兔', species: 'rabbit', age: '8个月', gender: '♀', dist: '1.8km', bio: '迷你小雪球，跑起来像风火轮。', tags: ['无敌风火轮', '越狱大师'], questions: ['兔兔会越狱吗？', '喜欢什么玩具？'], img: window.PAWMEET_DATA.contentImages.smallPet },
  { id: 'u_guineapig_1', name: '豆豆 · 短毛豚鼠', breed: '短毛豚鼠', species: 'guineapig', age: '1岁', gender: '♂', dist: '2.0km', bio: '一听到零食袋就疯狂尖叫的小吃货。', tags: ['爆米花跳跃', '疯狂尖叫'], questions: ['你家豚鼠会尖叫吗？', '爱吃什么蔬菜？'], img: window.PAWMEET_DATA.contentImages.smallPet },
  { id: 'u_guineapig_2', name: '花生 · 阿比西尼亚', breed: '阿比西尼亚豚鼠', species: 'guineapig', age: '10个月', gender: '♀', dist: '2.7km', bio: '毛茸茸的小花生，干草粉碎机。', tags: ['干草粉碎机', '胆小如鼠'], questions: ['豚鼠挑食吗？', '会爆米花跳吗？'], img: window.PAWMEET_DATA.contentImages.smallPet },
  { id: 'u_other_1', name: '小灰 · 仓鼠', breed: '金丝熊', species: 'other', age: '6个月', gender: '♂', dist: '1.3km', bio: '夜间跑轮冠军，白天呼呼大睡。', tags: ['跑轮冠军', '囤粮高手'], questions: ['仓鼠喜欢什么垫料？', '会越狱吗？'], img: window.PAWMEET_DATA.contentImages.smallPet },
  { id: 'u_other_2', name: '球球 · 龙猫', breed: '龙猫', species: 'other', age: '2岁', gender: '♀', dist: '3.2km', bio: '蓬松大尾巴，最爱沙浴打滚。', tags: ['沙浴狂魔', '越狱大师'], questions: ['龙猫用什么浴沙？', '会啃家具吗？'], img: window.PAWMEET_DATA.contentImages.smallPet }
],nativePhotos={
  u_dog_1: ['./assets/bb2bc64e426c6ce4d99e463054d0e7ec94a4b3fc9400103c6bca0230684665e2.jpg','./assets/76b320960077b295eb1119da08a08c6e061bfe4689cdbbbda11c73656ab6db72.jpg'], u_dog_2: ['./assets/c1173312a8fd1c53363867c127906d58bc07bf8a7be7266d3c1d640a18466faa.jpg','./assets/855459d380d9865c89b6e4dcc8cc7ceac7694b120fad734e76aae9c9e0215667.jpg'],
  u_cat_1: ['./assets/a379feddc628abce8a1726bd01d8bccf84621355ebc1b6a56680a5578af39075.jpg','./assets/2a841210dd30de76b71bf11b31423f20373f80c96e9471a5f6f8315e7bc2054e.jpg'], u_cat_2: ['./assets/2bbef9a964351ccaa4979c758e958d18d5c480aeaf14aa3b6cb29940e87aa8f7.jpg','./assets/130b3afc585673f677bf6d72ac8a6216b4a04b37b2b90fc058fb2f254c7631f5.jpg'],
  u_rabbit_1: ['./assets/c3e8c56da0aebf873f801d1563cdc52c7dcc6324197ffed53a9bc09e9bd46b68.jpg','./assets/639cedd46c442b7014a07ae75d869008dd9045c15ea3008ac03997ab8d0228dc.jpg'], u_rabbit_2: ['./assets/6881eac4570c14241abdbade548e44c873387fb0720ef0c9db8db368b32312de.jpg','./assets/12f4f53d5b62c98338f4de8ae479cf7987b663ee87dd0d69071b6793e3dd5e89.webp'],
  u_guineapig_1: ['./assets/99e68bcad913eaf33f63a67486bb89a96270fc7658e5477bb79ca0c912f7086e.jpg','./assets/64daffb9d543d9c936f8d8fd0eac049d75e21075865563c0b504e5f843548ced.jpg'], u_guineapig_2: ['./assets/f17f8c282c5edecba83e1f72a692193041e1006f30fe81298203d934f3d0cf27.jpg','./assets/295a7c70544e54135c00ec0e781159c4f6c3536cf033415bf0f993335323ebdc.jpg'],
  u_other_1: ['./assets/42367a5afd36b27c5073fbb95136498d989b9343d35d539d5f617529fac9f9f4.jpg','./assets/42400ce65c9af34ba0c8993ee2c88aaea83573118d516cee55ffe4b7ac72cb03.jpg'], u_other_2: ['./assets/51fd48a9d2876002c2d0bdd9d3648763039a10a9a8951a58776e2411272a9e84.jpg','./assets/4d2711224abbd9ac61ad1c7dfc0b8b3037334b774e35868a14433e22b4697a8d.jpg']
},swiped=new Set();
nativePets.forEach(p=>{const photos=nativePhotos[p.id]||[];p.img=photos[0];p.photos=photos.slice(1);});
window.PawMeetData={getExplorePool:()=>nativePets.filter(p=>!swiped.has(p.id)),addSwipedUser:id=>swiped.add(id),createMatch:()=>{},getPets:()=>[]};
window.DemoAllow=e=>mode==='explore'?!!e.target.closest('[data-apk-swipe]'):!!e.target.closest('[data-open-post]');
function act(e){const b=e.target.closest('[data-apk-swipe]');if(b){L3.handleButtonClick(Number(b.dataset.apkSwipe));return}if(e.target.closest('[data-open-post]'))parent.postMessage({type:'pawmeet-open-post'},'*');}
document.addEventListener('click',act);document.addEventListener('keydown',e=>{if(['Enter',' '].includes(e.key)&&e.target.closest('[data-apk-swipe],[data-open-post]')){e.preventDefault();parent.postMessage({type:'pawmeet-demo-interaction'},'*');act(e)}});
// A drag is also an interaction, so the outer handwritten cue goes away.
document.addEventListener('pointerdown',()=>parent.postMessage({type:'pawmeet-demo-interaction'},'*'),{passive:true});
