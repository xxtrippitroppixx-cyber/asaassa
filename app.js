(() => {
  'use strict';
  const levels = Array.isArray(window.GD_LEVELS) ? window.GD_LEVELS : [];
  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => [...document.querySelectorAll(selector)];
  const STORAGE_KEY = 'dashindex-progress-v1';
  const stageMeta = {
    starter: { label: 'STARTER DEMON', badge: 'starter-badge', heading: '01 / FIRST DEMONS' },
    easy: { label: 'EASY DEMON', badge: 'easy-badge', heading: '02 / EASY DEMON FOUNDATIONS' },
    bridge: { label: 'UPPER EASY', badge: 'bridge-badge', heading: '03 / UPPER EASY · BRIDGE' },
    medium: { label: 'MEDIUM DEMON', badge: 'medium-badge', heading: '04 / MEDIUM DEMON' }
  };
  const stageOrder = ['starter', 'easy', 'bridge', 'medium'];
  let activeStage = 'all';
  let activeFilter = 'all';
  let selectedIndex = null;
  let toastTimer = null;
  const progress = levels.map(() => ({ cleared: false, coinsDone: false, coinGoal: 'all', coinsCollected: 0 }));

  function safeText(value) {
    return String(value ?? '').replace(/[&<>"']/g, (character) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[character]));
  }

  function toast(message) {
    const node = $('#toast');
    node.textContent = message;
    node.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => node.classList.remove('show'), 2100);
  }

  function saveProgress() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, progress }));
      $('#saveStatus').textContent = '● SAVED LOCALLY';
    } catch (error) {
      $('#saveStatus').textContent = '● EXPORT BACKUP';
    }
  }

  function loadProgress() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
      if (!saved || !Array.isArray(saved.progress)) return;
      saved.progress.slice(0, levels.length).forEach((entry, index) => {
        if (!entry || typeof entry !== 'object') return;
        progress[index] = {
          cleared: Boolean(entry.cleared),
          coinsDone: Boolean(entry.coinsDone),
          coinGoal: ['all', '0', '1', '2', '3'].includes(String(entry.coinGoal)) ? String(entry.coinGoal) : 'all',
          coinsCollected: Math.max(0, Math.min(3, Number(entry.coinsCollected) || 0))
        };
      });
    } catch (error) {
      // A bad or old local save is ignored; exporting/importing remains available.
    }
  }

  function updateStats() {
    const cleared = progress.filter((item) => item.cleared).length;
    const coinsDone = progress.filter((item) => item.coinsDone).length;
    const percent = levels.length ? Math.round((cleared / levels.length) * 100) : 0;
    $('#overallPercent').innerHTML = `${percent}<span>%</span>`;
    $('#overallBar').style.width = `${percent}%`;
    $('#completedLabel').textContent = `${cleared} / ${levels.length} CLEARED`;
    $('#clearedCount').innerHTML = `${String(cleared).padStart(2, '0')}<span>/${levels.length}</span>`;
    $('#coinCount').innerHTML = `${String(coinsDone).padStart(2, '0')}<span>/${levels.length}</span>`;

    const next = progress.findIndex((item) => !item.cleared);
    let currentStage = 'STARTER';
    let hint = 'FIRST DEMON ROUTE';
    if (next < 0) {
      currentStage = 'ROUTE CLEARED';
      hint = '100 LEVELS COMPLETED';
    } else {
      const tier = levels[next].tier;
      currentStage = tier === 'starter' ? 'STARTER' : tier === 'easy' ? 'EASY DEMON' : tier === 'bridge' ? 'UPPER EASY' : 'MEDIUM DEMON';
      hint = `NEXT UP: #${String(next + 1).padStart(2, '0')}`;
    }
    $('#currentTier').textContent = currentStage;
    $('#currentTier').style.color = next < 0 ? 'var(--green)' : (next >= 75 ? 'var(--orange)' : next >= 45 ? 'var(--purple)' : next >= 15 ? 'var(--blue)' : 'var(--green)');
    $('#tierHint').textContent = hint;
    setNextTarget(next);
  }

  function setNextTarget(index) {
    if (index < 0) {
      $('#nextRank').textContent = '✓';
      $('#nextName').textContent = 'Route completed';
      $('#nextCreator').textContent = '100 / 100 levels cleared';
      $('#nextTargetBtn').disabled = true;
      return;
    }
    const level = levels[index];
    $('#nextRank').textContent = `#${String(index + 1).padStart(2, '0')}`;
    $('#nextName').textContent = level.name;
    $('#nextCreator').textContent = `by ${level.creator} · ${stageMeta[level.tier].label.toLowerCase()}`;
    $('#nextTargetBtn').disabled = false;
    $('#nextTargetBtn').dataset.index = index;
  }

  function activeLevels() {
    let list = levels.map((level, index) => ({ ...level, index, state: progress[index] }));
    const query = $('#searchInput').value.trim().toLowerCase();
    if (activeStage !== 'all') list = list.filter((level) => level.tier === activeStage);
    if (activeFilter === 'todo') list = list.filter((level) => !level.state.cleared);
    if (activeFilter === 'done') list = list.filter((level) => level.state.cleared);
    if (activeFilter === 'coins') list = list.filter((level) => !level.state.coinsDone);
    if (query) list = list.filter((level) => [level.name, level.creator, level.id, level.skill, level.note, stageMeta[level.tier].label].join(' ').toLowerCase().includes(query));

    const sort = $('#sortSelect').value;
    if (sort === 'name') list.sort((a, b) => a.name.localeCompare(b.name));
    if (sort === 'difficulty') list.sort((a, b) => stageOrder.indexOf(a.tier) - stageOrder.indexOf(b.tier) || a.index - b.index);
    if (sort === 'status') list.sort((a, b) => Number(a.state.cleared) - Number(b.state.cleared) || a.index - b.index);
    return list;
  }

  function coinLabel(level) {
    return level.state.coinGoal === 'all' ? 'ALL' : `${level.state.coinGoal}/3`;
  }

  function createRow(level) {
    const meta = stageMeta[level.tier];
    const status = level.state.cleared;
    const coins = level.state.coinsDone;
    return `<div class="level-row ${status ? 'is-cleared' : ''}" data-index="${level.index}" tabindex="0" role="button" aria-label="Open ${safeText(level.name)} details">
      <div class="rank"><strong>#${String(level.index + 1).padStart(2, '0')}</strong></div>
      <div class="level-info"><div class="level-name">${safeText(level.name)}</div><div class="level-creator">${safeText(level.creator)}${level.id ? ` · ID ${safeText(level.id)}` : ''}</div></div>
      <div class="difficulty-cell"><span class="difficulty-badge ${meta.badge}">${meta.label}</span></div>
      <div class="coin-cell"><button class="coin-goal-button ${coins ? 'coins-done' : ''}" data-coins="${level.index}" aria-label="Toggle coin objective for ${safeText(level.name)}"><span class="coin-dot">◉</span>${coins ? 'DONE' : coinLabel(level)}</button></div>
      <div class="status-cell"><button class="row-action ${status ? 'done' : ''}" data-clear="${level.index}" aria-label="${status ? 'Mark incomplete' : 'Mark cleared'}: ${safeText(level.name)}">${status ? 'CLEAR' : 'CLEAR?'}</button></div>
      <button class="row-more" data-open="${level.index}" aria-label="More details">›</button>
    </div>`;
  }

  function render() {
    const list = activeLevels();
    let html = '';
    let previousTier = null;
    for (const level of list) {
      const sortedGrouped = $('#sortSelect').value === 'rank' || $('#sortSelect').value === 'difficulty';
      if (sortedGrouped && level.tier !== previousTier) {
        const meta = stageMeta[level.tier];
        const count = list.filter((item) => item.tier === level.tier).length;
        html += `<div class="tier-header"><span>${meta.heading}</span><span>${count} LEVEL${count === 1 ? '' : 'S'}</span></div>`;
        previousTier = level.tier;
      }
      html += createRow(level);
    }
    $('#levelList').innerHTML = html;
    $('#emptyState').hidden = list.length !== 0;
    $('#resultCount').textContent = `SHOWING ${list.length} / ${levels.length} LEVELS`;
    $('#filterAll').textContent = levels.length;
    updateStats();
  }

  function openDetails(index) {
    if (!Number.isInteger(index) || !levels[index]) return;
    selectedIndex = index;
    const level = levels[index];
    const state = progress[index];
    const meta = stageMeta[level.tier];
    $('#modalKicker').textContent = `LEVEL / ${String(index + 1).padStart(3, '0')}`;
    $('#modalTitle').textContent = level.name;
    $('#modalCreator').textContent = `by ${level.creator}`;
    $('#modalBadge').textContent = meta.label;
    $('#modalBadge').className = `difficulty-badge ${meta.badge}`;
    $('#modalNote').textContent = level.note;
    $('#modalId').textContent = level.id || 'Not listed — search by name';
    $('#modalSkill').textContent = level.skill;
    $('#modalCoinLabel').textContent = state.coinGoal === 'all' ? 'ALL AVAILABLE' : `${state.coinGoal} COINS`;
    $('#coinGoal').value = state.coinGoal;
    $('#coinsCollected').value = String(state.coinsCollected);
    $('#modalCoinsDone').checked = state.coinsDone;
    $('#modalCleared').checked = state.cleared;
    const searchText = `Geometry Dash ${level.name} ${level.creator} ${level.id ? `level ${level.id}` : 'level'}`;
    $('#searchLevelLink').href = `https://www.google.com/search?q=${encodeURIComponent(searchText)}`;
    $('#levelModal').hidden = false;
    document.body.style.overflow = 'hidden';
    $('#modalClose').focus();
  }

  function closeDetails() {
    $('#levelModal').hidden = true;
    document.body.style.overflow = '';
    selectedIndex = null;
  }

  function updateSelectedFromModal() {
    if (selectedIndex === null) return;
    const state = progress[selectedIndex];
    state.coinGoal = $('#coinGoal').value;
    state.coinsCollected = Number($('#coinsCollected').value);
    state.coinsDone = $('#modalCoinsDone').checked;
    state.cleared = $('#modalCleared').checked;
    $('#modalCoinLabel').textContent = state.coinGoal === 'all' ? 'ALL AVAILABLE' : `${state.coinGoal} COINS`;
    saveProgress();
    render();
  }

  function toggleCleared(index) {
    progress[index].cleared = !progress[index].cleared;
    saveProgress();
    render();
    toast(progress[index].cleared ? `${levels[index].name} marked cleared.` : `${levels[index].name} moved back to to-do.`);
  }

  function toggleCoins(index) {
    progress[index].coinsDone = !progress[index].coinsDone;
    saveProgress();
    render();
    toast(progress[index].coinsDone ? 'Coin objective completed.' : 'Coin objective reopened.');
  }

  function exportData() {
    const payload = { app: 'DASHINDEX', version: 1, exportedAt: new Date().toISOString(), levels: levels.length, progress };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'dashindex-progress.json';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    toast('Progress backup exported.');
  }

  async function importData(file) {
    if (!file) return;
    try {
      const payload = JSON.parse(await file.text());
      const incoming = Array.isArray(payload) ? payload : payload.progress;
      if (!Array.isArray(incoming)) throw new Error('Invalid file');
      for (let index = 0; index < levels.length; index += 1) {
        const entry = incoming[index];
        if (!entry || typeof entry !== 'object') continue;
        progress[index] = {
          cleared: Boolean(entry.cleared),
          coinsDone: Boolean(entry.coinsDone),
          coinGoal: ['all', '0', '1', '2', '3'].includes(String(entry.coinGoal)) ? String(entry.coinGoal) : 'all',
          coinsCollected: Math.max(0, Math.min(3, Number(entry.coinsCollected) || 0))
        };
      }
      saveProgress();
      render();
      toast('Progress imported successfully.');
    } catch (error) {
      toast('Could not read that progress file.');
    } finally {
      $('#importFile').value = '';
    }
  }

  function setStage(stage) {
    activeStage = stage;
    $$('.stage-button').forEach((button) => button.classList.toggle('selected', button.dataset.stage === stage));
    render();
  }

  function setFilter(filter) {
    activeFilter = filter;
    $$('.filter-pill').forEach((button) => button.classList.toggle('active', button.dataset.filter === filter));
    render();
  }

  $('#levelList').addEventListener('click', (event) => {
    const clearButton = event.target.closest('[data-clear]');
    if (clearButton) {
      event.stopPropagation();
      toggleCleared(Number(clearButton.dataset.clear));
      return;
    }
    const coinButton = event.target.closest('[data-coins]');
    if (coinButton) {
      event.stopPropagation();
      toggleCoins(Number(coinButton.dataset.coins));
      return;
    }
    const row = event.target.closest('.level-row');
    if (row) openDetails(Number(row.dataset.index));
  });
  $('#levelList').addEventListener('keydown', (event) => {
    if ((event.key === 'Enter' || event.key === ' ') && event.target.matches('.level-row')) {
      event.preventDefault();
      openDetails(Number(event.target.dataset.index));
    }
  });
  $$('.stage-button').forEach((button) => button.addEventListener('click', () => setStage(button.dataset.stage)));
  $$('.filter-pill').forEach((button) => button.addEventListener('click', () => setFilter(button.dataset.filter)));
  $('#searchInput').addEventListener('input', render);
  $('#sortSelect').addEventListener('change', render);
  $('#modalClose').addEventListener('click', closeDetails);
  $('#levelModal').addEventListener('click', (event) => { if (event.target === $('#levelModal')) closeDetails(); });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !$('#levelModal').hidden) closeDetails();
    if (event.key === '/' && $('#levelModal').hidden && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
      event.preventDefault();
      $('#searchInput').focus();
    }
  });
  ['coinGoal', 'coinsCollected', 'modalCoinsDone', 'modalCleared'].forEach((id) => {
    $(`#${id}`).addEventListener('change', updateSelectedFromModal);
  });
  $('#continueBtn').addEventListener('click', () => {
    const next = progress.findIndex((item) => !item.cleared);
    if (next < 0) { toast('All 100 levels cleared. Route complete.'); return; }
    activeStage = 'all'; activeFilter = 'all';
    $$('.stage-button').forEach((button) => button.classList.toggle('selected', button.dataset.stage === 'all'));
    $$('.filter-pill').forEach((button) => button.classList.toggle('active', button.dataset.filter === 'all'));
    $('#searchInput').value = '';
    $('#sortSelect').value = 'rank';
    render();
    const row = $(`#levelList .level-row[data-index="${next}"]`);
    if (row) { row.scrollIntoView({ behavior: 'smooth', block: 'center' }); row.classList.add('focus-row'); setTimeout(() => row.classList.remove('focus-row'), 1500); }
  });
  $('#nextTargetBtn').addEventListener('click', () => {
    const index = Number($('#nextTargetBtn').dataset.index);
    if (Number.isInteger(index) && levels[index]) openDetails(index);
  });
  $('#exportBtn').addEventListener('click', exportData);
  $('#importBtn').addEventListener('click', () => $('#importFile').click());
  $('#importFile').addEventListener('change', (event) => importData(event.target.files[0]));
  $('#resetBtn').addEventListener('click', () => {
    if (!confirm('Reset all level clears and coin objectives? Export a backup first if you want to keep them.')) return;
    progress.forEach((entry) => Object.assign(entry, { cleared: false, coinsDone: false, coinGoal: 'all', coinsCollected: 0 }));
    saveProgress();
    render();
    toast('All progress has been reset.');
  });
  $('#mobileMenu').addEventListener('click', () => $('.topnav').classList.toggle('open'));
  $$('.nav-link').forEach((link) => link.addEventListener('click', () => $('.topnav').classList.remove('open')));

  // Ensure the data count remains visible and accurate if the list is edited later.
  if (levels.length !== 100) {
    console.warn(`DASHINDEX expected 100 levels but found ${levels.length}.`);
    $('#count-all').textContent = levels.length;
  }
  loadProgress();
  render();
})();
