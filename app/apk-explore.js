var L3 = (function() {
  var _explorePool = [];  // 从 PawMeetData 加载的探索用户池
  var _poolIndex = 0;
  var _exploreFilters = { area: 'nearby', distance: '0', species: 'all' };

  function _loadExplorePool() {
    _explorePool = PawMeetData.getExplorePool() || [];
    _explorePool = _explorePool.filter(function(user) {
      var bySpecies = _exploreFilters.species === 'all' || (user.species || 'other') === _exploreFilters.species;
      var km = parseFloat(user.dist) || 0;
      var byDistance = !_exploreFilters.distance || _exploreFilters.distance === '0' || km <= parseFloat(_exploreFilters.distance);
      return bySpecies && byDistance;
    });
    _poolIndex = 0;
    if (_explorePool.length === 0) {
      _explorePool = [{ id: 'empty_1', name: '这附近的好朋友都刷完啦！', breed: '明天再来看看吧', age: '', gender: '', dist: '已到达尽头', bio: '你已认识附近所有的毛孩子🐾\n新用户会持续加入，明天再来探索新朋友吧！', tags: ['明天再来', '敬请期待'], img: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=500&q=80' }];
    }
  }

  function renderExplorePetSwitcher() {
    var holder = document.getElementById('explorePetSwitcherL3');
    if (!holder) return;
    var pets = [];
    try { pets = PawMeetData.getPets() || []; } catch (_) {}
    if (pets.length <= 1) { holder.innerHTML = ''; holder.classList.add('is-hidden'); return; }
    var activeId = (typeof activePetId !== 'undefined' && activePetId !== null) ? activePetId : ((pets.find(function(p){ return p.isActive; }) || {}).petId);
    holder.classList.remove('is-hidden');
    holder.innerHTML = pets.map(function(p) {
      var id = p.petId || p.id;
      var active = String(id) === String(activeId) ? ' active' : '';
      var avatar = p.avatar || (p.photos && p.photos[0]) || '';
      return '<button type="button" class="explore-pet-avatar-l3' + active + '" data-pet-id="' + id + '" aria-label="切换为 ' + (p.name || '宠物') + '"><img loading=lazy decoding=async src="' + avatar + '" alt=""><span>' + (p.name || '宠物') + '</span></button>';
    }).join('');
    holder.querySelectorAll('.explore-pet-avatar-l3').forEach(function(btn) { btn.addEventListener('click', function() {
      var id = btn.getAttribute('data-pet-id');
      if (typeof switchActivePet === 'function') switchActivePet(id);
      else { try { PawMeetData.switchActivePet(id); } catch (_) {} }
      setTimeout(function(){ renderExplorePetSwitcher(); initExplore(true); }, 0);
    }); });
  }

  window.PawMeetExploreCard = { render: renderCardHTML };
  function renderCardHTML(data, index) {
    var name = data.name || '毛孩子',
        breed = data.breed || data.tag || '未知品种',
        age = data.age || '2岁',
        gender = data.gender || '♂',
        dist = data.dist || '1.5km',
        bio = data.bio || '一个可爱的毛孩子~',
        tags = data.tags || ['活泼好动', '爱吃零食'],
        img = data.img || ('https://images.unsplash.com/photo-1568572933382-74d440642117?w=500&q=80');
    if (String(data.id || '').indexOf('empty_') === 0) {
      return '<div class="explore-empty-card-l3"><img loading=lazy decoding=async src="./assets/e3f6b0b01642ad480df17f1cb07c07c2710bc9631af9baf7d81a91657abfd9c6.webp" alt="安静的宠物游乐场"><div class="explore-empty-copy-l3"><strong>这附近的好朋友都刷完啦</strong><span>换个筛选条件，或晚些再来看看</span></div></div>';
    }
    var colors = ['var(--primary)', 'var(--tertiary)', 'var(--sky)', 'var(--secondary)'];
    var cleanName = name.replace(/\s*[·•]\s*[^·•]+$/, '');
    var breedChip = breed && breed !== '未知品种' && breed !== '未知' ? '<span>' + breed + '</span>' : '';
    var photos = (data.photos || []).filter(Boolean);
    if (!photos.length && img) photos = [img];
    var photoHtml = photos.length ? '<div class="explore-album-l3"><div class="explore-detail-label-l3">生活相册</div><div class="explore-photo-grid-l3">' + photos.slice(0, 3).map(function(src) { return '<img loading=lazy decoding=async src="' + src + '" alt="' + cleanName + '的照片">'; }).join('') + '</div></div>' : '';
    return '<div class="card-scroll-area-l3"><div class="card-img-wrap-l3"><img loading=lazy decoding=async class="card-img-l3" src="' + img + '" alt=""><div class="card-gradient-l3"></div><div class="card-info-overlay-l3"><div class="card-name-row-l3"><span class="pet-name-l3">' + cleanName + '</span><span class="pet-gender-l3">' + gender + '</span></div><div class="card-meta-l3">' + breedChip + '<span class="pet-age-l3">' + age + '</span></div></div></div><div class="card-details-section-l3"><div class="explore-detail-label-l3">小档案</div><div class="tags-wrap-l3">' + tags.map(function(t, i) { return '<span class="info-tag-l3" style="background:' + colors[i % 4] + ';">' + t + '</span>'; }).join('') + '</div><div class="bio-text-l3">' + bio + '</div>' + photoHtml + '<div class="distance-row-l3"><svg viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>距你 ' + dist + '</div></div></div>';
  }

  function updateExploreActions(data) {
    var actions = document.querySelector('#view-explore .action-buttons-l3');
    if (actions) actions.classList.toggle('is-hidden', String((data || {}).id || '').indexOf('empty_') === 0);
  }

  function _getCurrentExploreUser() {
    if (_explorePool.length === 0) _loadExplorePool();
    // V2.6: 池子耗尽后不再循环，永远显示尽头卡片
    if (_poolIndex >= _explorePool.length) {
      _explorePool = [{ id: 'empty_1', name: '这附近的好朋友都刷完啦！', breed: '明天再来看看吧', age: '', gender: '', dist: '已到达尽头', bio: '你已认识附近所有的毛孩子🐾\n新用户会持续加入，明天再来探索新朋友吧！', tags: ['明天再来', '敬请期待'], img: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=500&q=80' }];
      _poolIndex = 0;
    }
    return _explorePool[_poolIndex] || { name: '毛孩子', breed: '未知', age: '', gender: '', dist: '', bio: '...', tags: [], img: '' };
  }

  function _getNextExploreUser() {if(window.PawMeetCloudGroups){return _explorePool[_poolIndex+1]||{id:'empty_1'};}
    if (_explorePool.length === 0) _loadExplorePool();
    var nextIdx = _poolIndex + 1;
    // V2.6: 耗尽后不循环
    if (nextIdx >= _explorePool.length) {
      _explorePool = [{ id: 'empty_1', name: '这附近的好朋友都刷完啦！', breed: '明天再来看看吧', age: '', gender: '', dist: '已到达尽头', bio: '你已认识附近所有的毛孩子🐾\n新用户会持续加入，明天再来探索新朋友吧！', tags: ['明天再来', '敬请期待'], img: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=500&q=80' }];
      nextIdx = 0;
    }
    return _explorePool[nextIdx] || { name: '毛孩子', breed: '未知', age: '', gender: '', dist: '', bio: '...', tags: [], img: '' };
  }

  var tutorialOverlayL3 = document.getElementById('tutorialOverlayL3'), currentTutStepL3 = 1;

  function initExplore(skipTutorial) {
    endTutorial();
    _loadExplorePool();
    var stack = document.getElementById('cardStackL3');
    if (!stack) return;
    /* Keep the already-rendered original compact identity selector. */
    stack.innerHTML = '';
    var user1 = _getCurrentExploreUser();
    var user2 = _getNextExploreUser();
    var card1 = document.createElement('div'); card1.className = 'swipe-card-l3'; card1.id = 'topCardL3';
    card1.innerHTML = renderCardHTML(user1, 0);
    card1.setAttribute('data-explore-id', user1.id || '');
    stack.appendChild(card1);
    var card2 = document.createElement('div'); card2.className = 'swipe-card-l3 is-behind'; card2.id = 'behindCardL3';
    card2.innerHTML = renderCardHTML(user2, 1);
    card2.setAttribute('data-explore-id', user2.id || '');
    stack.appendChild(card2);
    if (String(user1.id || '').indexOf('empty_') !== 0) initCardEventsL3(card1);
    updateExploreActions(user1);
  }

  function openFilter() { var el = document.getElementById('exploreFilterOverlayL3'); if (el) { el.classList.add('show'); el.setAttribute('aria-hidden','false'); } }
  function closeFilter() { var el = document.getElementById('exploreFilterOverlayL3'); if (el) { el.classList.remove('show'); el.setAttribute('aria-hidden','true'); } }
  function syncFilterUI() { document.querySelectorAll('#exploreFilterOverlayL3 [data-filter]').forEach(function(group) { var key = group.getAttribute('data-filter'); group.querySelectorAll('button').forEach(function(btn){ btn.classList.toggle('active', btn.getAttribute('data-value') === _exploreFilters[key]); }); }); }
  function resetFilter() { _exploreFilters = { area: 'nearby', distance: '0', species: 'all' }; syncFilterUI(); }
  async function applyFilter() { if(window.PawMeetCloudGroups){if(await window.PawMeetCloudGroups.applyFilters({species:_exploreFilters.species}))closeFilter();return;}closeFilter();initExplore(true);}
  document.addEventListener('click', function(event) { var btn = event.target.closest('#exploreFilterOverlayL3 [data-filter] button'); if (!btn) return; var group = btn.closest('[data-filter]'); _exploreFilters[group.getAttribute('data-filter')] = btn.getAttribute('data-value'); syncFilterUI(); });

  function initCardEventsL3(card) { var scrollArea = card.querySelector('.card-scroll-area-l3'); card.addEventListener('touchstart', function(e) { handleDragStartL3(e, scrollArea); }, { passive: false }); card.addEventListener('touchmove', function(e) { handleDragMoveL3(e, scrollArea); }, { passive: false }); card.addEventListener('touchend', handleDragEndL3); card.addEventListener('mousedown', function(e) { handleDragStartL3(e, scrollArea); }); window.addEventListener('mousemove', function(e) { handleDragMoveL3(e, scrollArea); }); window.addEventListener('mouseup', handleDragEndL3); scrollArea.addEventListener('scroll', function() { if (tutorialOverlayL3 && !tutorialOverlayL3.classList.contains('hidden') && currentTutStepL3 === 3 && scrollArea.scrollTop > 50) { endTutorial(); } }); }

  var dragStateL3 = { startX: 0, startY: 0, currentX: 0, offsetX: 0, dragging: false };
  function handleDragStartL3(e, scrollArea) { dragStateL3.startX = e.type.indexOf('mouse') !== -1 ? e.clientX : e.touches[0].clientX; dragStateL3.startY = e.type.indexOf('mouse') !== -1 ? e.clientY : e.touches[0].clientY; dragStateL3.dragging = true; var top = document.getElementById('topCardL3'); if (top) { top.classList.add('is-moving'); top.style.transition = 'none'; } }
  function handleDragMoveL3(e, scrollArea) { if (!dragStateL3.dragging) return; dragStateL3.currentX = e.type.indexOf('mouse') !== -1 ? e.clientX : e.touches[0].clientX; dragStateL3.offsetX = dragStateL3.currentX - dragStateL3.startX; var top = document.getElementById('topCardL3'); if (top) { top.style.transform = 'translateX(' + dragStateL3.offsetX + 'px) rotate(' + (dragStateL3.offsetX * 0.05) + 'deg)'; } }
  function handleDragEndL3() {
    if (!dragStateL3.dragging) return; dragStateL3.dragging = false;
    var top = document.getElementById('topCardL3'); if (!top) return;
    top.classList.remove('is-moving'); top.style.transition = 'transform 0.3s ease';
    if(window.PawMeetCloudGroups){var hit=Math.abs(dragStateL3.offsetX)>100;var cloudDir=dragStateL3.offsetX>0?1:-1;dragStateL3.offsetX=0;top.style.transform='none';top.style.opacity='1';if(hit)return window.PawMeetCloudGroups.swipe(cloudDir,top.getAttribute('data-explore-id'));return;}
    if (Math.abs(dragStateL3.offsetX) > 100) {
      var dir = dragStateL3.offsetX > 0 ? 1 : -1;
      top.style.transform = 'translateX(' + (dir * 500) + 'px) rotate(' + (dir * 20) + 'deg)'; top.style.opacity = '0';
      if (tutorialOverlayL3 && !tutorialOverlayL3.classList.contains('hidden')) { advanceTutorialL3(dir); }

      // 记录已滑过的用户
      var exploreId = top.getAttribute('data-explore-id') || '';
      if (exploreId && exploreId.indexOf('empty_') !== 0) {
        PawMeetData.addSwipedUser(exploreId);
      }

      setTimeout(function() { swapCardsL3(); }, 300);
      if (dir === 1) {
        spawnParticlesL3('like');
        // 右滑喜欢: 创建匹配 (V2 createMatch 内置去重)
        try {
          var user = _explorePool.length > 0 && _poolIndex < _explorePool.length ? _explorePool[_poolIndex] : null;
          if (user && user.id && user.id.indexOf('empty_') !== 0) {
            PawMeetData.createMatch(user.name, user.breed, user.avatar || user.img || '', user.questions || []);
            // V1.8: 立即同步 matchData, 确保消息页实时看到新聊天
            _syncMatchDataNow();
            if (typeof _gInit !== 'undefined') _gInit['message'] = false;
            /* v4.0: 导航栏消息红点 */
            var bdg = document.getElementById('msgBadge'); if (bdg) bdg.style.display = 'block';
            if (typeof _gInit !== 'undefined') _gInit['profile'] = false;
            // 为新创建的聊天发送欢迎消息
          }
        } catch (_) {}
      }
    } else {
      top.style.transform = 'translateX(0) rotate(0deg)';
    }
    dragStateL3.offsetX = 0;
  }

  function swapCardsL3() {
    var stack = document.getElementById('cardStackL3');
    var top = document.getElementById('topCardL3');
    var behind = document.getElementById('behindCardL3');
    if (top) top.remove();
    if (behind) {
      behind.id = 'topCardL3'; behind.classList.remove('is-behind');
      behind.style.transform = 'none'; behind.style.opacity = '1';
      var nextId = behind.getAttribute('data-explore-id') || '';
      if (nextId.indexOf('empty_') !== 0) initCardEventsL3(behind);
      updateExploreActions({ id: nextId });
    }
    _poolIndex++;
    // V2.6: 池子耗尽时重新从 localStorage 加载 (过滤已滑用户), 不再循环
    if (_poolIndex >= _explorePool.length) { _loadExplorePool(); }
    var nextUser = _getNextExploreUser();
    var newCard = document.createElement('div'); newCard.className = 'swipe-card-l3 is-behind';
    newCard.innerHTML = renderCardHTML(nextUser, _poolIndex + 1);
    newCard.id = 'behindCardL3';
    newCard.setAttribute('data-explore-id', nextUser.id || '');
    stack.appendChild(newCard);
  }

  function handleButtonClick(dir) {if(window.PawMeetCloudGroups){return window.PawMeetCloudGroups.swipe(dir);}
    var top = document.getElementById('topCardL3'); if (!top) return;
    top.style.transition = 'transform 0.3s ease';
    top.style.transform = 'translateX(' + (dir * 500) + 'px) rotate(' + (dir * 20) + 'deg)'; top.style.opacity = '0';
    if (tutorialOverlayL3 && !tutorialOverlayL3.classList.contains('hidden')) { advanceTutorialL3(dir); }

    // 记录已滑过的用户
    var exploreId = top.getAttribute('data-explore-id') || '';
    if (exploreId && exploreId.indexOf('empty_') !== 0) {
      PawMeetData.addSwipedUser(exploreId);
    }

    setTimeout(function() { swapCardsL3(); }, 300);
    if (dir === 1) {
      spawnParticlesL3('like');
      try {
        var user = _explorePool.length > 0 && _poolIndex < _explorePool.length ? _explorePool[_poolIndex] : null;
        if (user && user.id && user.id.indexOf('empty_') !== 0) {
          PawMeetData.createMatch(user.name, user.breed, user.avatar || user.img || '', user.questions || []);
          _syncMatchDataNow();
          if (typeof _gInit !== 'undefined') _gInit['message'] = false;
          var bdg2 = document.getElementById('msgBadge'); if (bdg2) bdg2.style.display = 'block';
          if (typeof _gInit !== 'undefined') _gInit['profile'] = false;
        }
      } catch (_) {}
    }
  }

  function advanceTutorialL3(dir) { if (!tutorialOverlayL3 || tutorialOverlayL3.classList.contains('hidden')) return; var stepEl = document.getElementById('tut-step-' + currentTutStepL3 + '-l3'); if (stepEl) stepEl.classList.remove('active'); if (currentTutStepL3 === 1 && dir === -1) { currentTutStepL3 = 2; document.getElementById('tut-step-2-l3').classList.add('active'); } else if (currentTutStepL3 === 2 && dir === 1) { currentTutStepL3 = 3; document.getElementById('tut-step-3-l3').classList.add('active'); } else if (currentTutStepL3 === 3) { endTutorial(); } else { endTutorial(); } }
  function endTutorial() { if (tutorialOverlayL3) tutorialOverlayL3.classList.add('hidden'); }
  function spawnParticlesL3(type) { var E = type === 'like' ? ['💖','🐾','✨','💕','🥰','💝','🌟','🎉'] : ['👋']; for (var i = 0; i < 14; i++) { setTimeout(function() { var p = document.createElement('div'); p.style.cssText = 'position:fixed;z-index:99999;font-size:30px;pointer-events:none;left:50%;top:45%;margin-left:-15px;margin-top:-15px;'; p.textContent = E[Math.floor(Math.random() * E.length)]; document.body.appendChild(p); var tx = (Math.random() - 0.5) * 320; var ty = (Math.random() - 0.5) * 320 - 80; var r = (Math.random() - 0.5) * 720; p.animate([{transform:'translate(0,0) scale(0.2) rotate(0deg)',opacity:1,offset:0},{transform:'translate('+(tx*0.35)+'px,'+(ty*0.35)+'px) scale(1.3) rotate('+(r*0.25)+'deg)',opacity:1,offset:0.25},{transform:'translate('+tx+'px,'+ty+'px) scale(0) rotate('+r+'deg)',opacity:0,offset:1}],{duration:750,easing:'cubic-bezier(0.22,0.61,0.36,1)',fill:'forwards'}); setTimeout(function() { p.remove(); }, 800); }, i * 50); } }
  return { initExplore: initExplore, endTutorial: endTutorial, handleButtonClick: handleButtonClick, openFilter: openFilter, closeFilter: closeFilter, resetFilter: resetFilter, applyFilter: applyFilter };
})();

