/**
 * ChessKidoo LMS — E-Library & Recorded Sessions Hub (v1.0)
 * ─────────────────────────────────────────────────────────────────
 * Comprehensive E-Library system for:
 * 1. Admin & Coaches: Upload study materials (PDFs, PGNs, notes) & link recorded class sessions (YouTube, Drive, Loom, Zoom)
 * 2. Students & Parents: Browse, filter by level & topic, watch recorded sessions, and download study materials
 * 3. Offline-first resilience with localStorage caching + Supabase sync
 */
(function () {
  'use strict';

  const STORAGE_KEY = 'ck_elibrary_materials';

  const DEFAULT_LIBRARY_ITEMS = [
    {
      id: 'elib-1',
      title: 'Grandmaster Opening Masterclass: Italian Game & Giuoco Piano',
      description: 'Comprehensive video lecture on dominating the center, piece harmony, and the sharp Evans Gambit / Fried Liver lines.',
      category: 'openings',
      categoryLabel: '♟️ Opening Repertoire',
      level: 'All Levels',
      type: 'video',
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', // Fallback stream
      author: 'Coach Ranjith A S',
      date: '2026-08-15',
      duration: '45 mins',
      tags: ['Opening', 'Italian', 'e4-e5', 'Tactics']
    },
    {
      id: 'elib-2',
      title: '100 Must-Know Chess Tactics & Sacrifices',
      description: 'Curated puzzle study guide and tactical handbook covering pins, skewers, knight forks, back-rank mates, and the Greek Gift sacrifice.',
      category: 'tactics',
      categoryLabel: '⚡ Tactics & Combinations',
      level: 'Intermediate',
      type: 'document',
      url: 'https://chesskidoo.com/assets/study/tactics_mastery.pdf',
      author: 'Senior Coach Panel',
      date: '2026-08-10',
      duration: 'PDF Guide + PGN',
      tags: ['Tactics', 'Forks', 'Pins', 'Calculations']
    },
    {
      id: 'elib-3',
      title: 'Rook Endgames Essential Guide: The Lucena & Philidor Principles',
      description: 'Master the "Bridge Technique" in the Lucena position and the passive 6th-rank cut-off in the Philidor defense with recorded live examples.',
      category: 'endgames',
      categoryLabel: '👑 Endgame Mastery',
      level: 'Advanced',
      type: 'video',
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      author: 'Coach Ranjith A S',
      date: '2026-08-05',
      duration: '52 mins',
      tags: ['Endgame', 'Rook Endgames', 'Lucena', 'Philidor']
    },
    {
      id: 'elib-4',
      title: 'Sicilian Defense Najdorf & Dragon Deep Breakdown',
      description: 'Master the sharpest counter-attacking weapon against 1.e4 with detailed move-by-move plans, pawn structures, and opposite-side castling races.',
      category: 'openings',
      categoryLabel: '♟️ Opening Repertoire',
      level: 'Advanced',
      type: 'document',
      url: 'https://chesskidoo.com/assets/study/sicilian_repertoire.pdf',
      author: 'FIDE Master Team',
      date: '2026-07-28',
      duration: 'Masterclass PDF',
      tags: ['Sicilian', 'Najdorf', 'Dragon', 'Counter-Attack']
    },
    {
      id: 'elib-5',
      title: 'Weekly Live Academy Masterclass: Tournament Psychology & Calculation',
      description: 'Recorded live masterclass session analyzing recent tournament games, clock management strategies, and blunder prevention habits.',
      category: 'recordings',
      categoryLabel: '🎥 Class Recording',
      level: 'All Levels',
      type: 'video',
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      author: 'Academy Coaching Panel',
      date: '2026-08-12',
      duration: '60 mins',
      tags: ['Recording', 'Live Session', 'Tournament', 'Psychology']
    }
  ];

  window.elibraryItems = [];
  let currentFilter = 'all';
  let currentSearch = '';
  let currentLevelFilter = 'all';

  // ── Load Data ──
  window.loadElibraryData = async function () {
    let local = [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) local = JSON.parse(raw);
    } catch (e) { console.warn('[E-Library] Local load err:', e); }

    if (!local || !local.length) {
      local = DEFAULT_LIBRARY_ITEMS;
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(local)); } catch (e) {}
    }

    // Attempt Supabase Fetch
    if (window.supabaseClient) {
      try {
        const { data, error } = await window.supabaseClient
          .from('elibrary')
          .select('*')
          .order('created_at', { ascending: false });
        if (!error && Array.isArray(data) && data.length > 0) {
          // Merge local and cloud items
          const map = new Map();
          data.forEach(item => map.set(String(item.id), item));
          local.forEach(item => { if (!map.has(String(item.id))) map.set(String(item.id), item); });
          local = Array.from(map.values());
        }
      } catch (e) {
        console.warn('[E-Library] Cloud fetch fallback to local:', e);
      }
    }

    window.elibraryItems = local;
    return local;
  };

  // ── Role Permissions Helper ──
  function canUserManageItem(item) {
    const role = window.role || (window.currentCoach ? 'coach' : 'student');
    if (role === 'admin' || role === 'master') return true;
    if (role === 'coach') {
      const coach = window.currentCoach;
      if (!coach) return false;
      const coachName = (coach.name || coach.full_name || '').toLowerCase().trim();
      const itemAuthor = (item.author || '').toLowerCase().trim();
      const coachId = String(coach.id || coach.coach_id || '');
      const itemCoachId = String(item.coach_id || '');
      return (coachId && itemCoachId === coachId) || (coachName && itemAuthor.includes(coachName)) || (itemAuthor === coachName);
    }
    return false;
  }

  // ── Save Material ──
  window.saveElibraryItem = async function (itemData) {
    if (!itemData.title || !itemData.url) {
      if (window.toast) window.toast('Please provide a title and resource link!', 'warning');
      return false;
    }

    const currentCoach = window.currentCoach;
    const coachName = currentCoach ? (currentCoach.name || currentCoach.full_name || 'Coach') : null;
    const coachId = currentCoach ? (currentCoach.id || currentCoach.coach_id || null) : null;

    const item = {
      id: itemData.id || ('elib-' + Date.now()),
      title: itemData.title.trim(),
      description: (itemData.description || '').trim(),
      category: itemData.category || 'openings',
      categoryLabel: getCategoryLabel(itemData.category),
      level: itemData.level || 'All Levels',
      type: itemData.type || (itemData.url.match(/\.(pdf|doc|docx|pgn)/i) ? 'document' : 'video'),
      url: itemData.url.trim(),
      author: itemData.author || (window.role === 'admin' ? 'Academy Admin' : (coachName || 'ChessKidoo Coach')),
      coach_id: itemData.coach_id || (window.role === 'coach' ? coachId : null),
      date: itemData.date || new Date().toISOString().split('T')[0],
      duration: itemData.duration || (itemData.type === 'video' ? 'Video Lesson' : 'Study Resource'),
      tags: Array.isArray(itemData.tags) ? itemData.tags : (itemData.tags || '').split(',').map(s => s.trim()).filter(Boolean),
      created_at: itemData.created_at || new Date().toISOString()
    };

    // Update memory & local storage
    const idx = window.elibraryItems.findIndex(x => String(x.id) === String(item.id));
    if (idx >= 0) {
      // If coach is updating, ensure they own it
      if (window.role === 'coach' && !canUserManageItem(window.elibraryItems[idx])) {
        if (window.toast) window.toast('Permission denied: Coaches can only edit their own materials.', 'error');
        return false;
      }
      window.elibraryItems[idx] = { ...window.elibraryItems[idx], ...item };
    } else {
      window.elibraryItems.unshift(item);
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(window.elibraryItems));
    } catch (e) {}

    // Cloud upsert
    if (window.supabaseClient) {
      try {
        await window.supabaseClient.from('elibrary').upsert([item]);
      } catch (e) {
        console.warn('[E-Library] Supabase upsert non-blocking error:', e);
      }
    }

    if (window.toast) window.toast(idx >= 0 ? '✨ Study material updated successfully!' : '✨ Study material added to E-Library successfully!', 'success');
    
    // Re-render active views
    window.renderAdminElibraryPage();
    window.renderCoachElibraryPage();
    window.renderChildElibrary();
    return true;
  };

  // ── Delete Material ──
  window.deleteElibraryItem = async function (id) {
    const item = window.elibraryItems.find(x => String(x.id) === String(id));
    if (!item) return;

    if (!canUserManageItem(item)) {
      if (window.toast) window.toast('Permission denied: You can only delete your own uploaded materials.', 'error');
      return;
    }

    if (!confirm(`Are you sure you want to delete "${item.title}" from E-Library?`)) return;
    window.elibraryItems = window.elibraryItems.filter(x => String(x.id) !== String(id));
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(window.elibraryItems));
    } catch (e) {}

    if (window.supabaseClient) {
      try {
        await window.supabaseClient.from('elibrary').delete().eq('id', id);
      } catch (e) {}
    }

    if (window.toast) window.toast('Material removed from E-Library.', 'info');
    window.renderAdminElibraryPage();
    window.renderCoachElibraryPage();
    window.renderChildElibrary();
  };

  // ── Edit Material ──
  window.editElibraryItem = function (id) {
    const item = window.elibraryItems.find(x => String(x.id) === String(id));
    if (!item) return;

    if (!canUserManageItem(item)) {
      if (window.toast) window.toast('Permission denied: Coaches can only edit their own materials.', 'error');
      return;
    }

    const modal = document.getElementById('add-elibrary-modal');
    if (!modal) return;

    window._editingElibId = item.id;
    window._editingElibAuthor = item.author;
    window._editingElibCoachId = item.coach_id;

    const modalTitle = modal.querySelector('.modal-title');
    if (modalTitle) modalTitle.innerHTML = '✏️ Edit Study Material / Recorded Session';

    const submitBtn = modal.querySelector('button.btn-gold');
    if (submitBtn) submitBtn.textContent = 'Save Changes';

    const fTitle = document.getElementById('elib-form-title');
    const fDesc = document.getElementById('elib-form-desc');
    const fCat = document.getElementById('elib-form-cat');
    const fLevel = document.getElementById('elib-form-level');
    const fUrl = document.getElementById('elib-form-url');
    const fDuration = document.getElementById('elib-form-duration');

    if (fTitle) fTitle.value = item.title || '';
    if (fDesc) fDesc.value = item.description || '';
    if (fCat) fCat.value = item.category || 'openings';
    if (fLevel) fLevel.value = item.level || 'All Levels';
    if (fUrl) fUrl.value = item.url || '';
    if (fDuration) fDuration.value = item.duration || '';

    modal.classList.add('active');
  };

  function getCategoryLabel(cat) {
    switch (cat) {
      case 'recordings': return '🎥 Class Recording';
      case 'openings': return '♟️ Opening Repertoire';
      case 'tactics': return '⚡ Tactics & Calculation';
      case 'endgames': return '👑 Endgame Mastery';
      case 'masterclasses': return '📖 Grandmaster Lecture';
      case 'tournaments': return '🏆 Tournament Prep';
      default: return '📚 Study Resource';
    }
  }

  // ── Render Card HTML ──
  function renderItemCard(item) {
    const isVideo = item.type === 'video' || item.url.includes('youtube') || item.url.includes('youtu.be') || item.url.includes('drive.google.com') || item.url.includes('loom.com');
    const badgeColor = item.category === 'recordings' ? '#ef4444' : (item.category === 'openings' ? '#3b82f6' : (item.category === 'tactics' ? '#eab308' : '#10b981'));
    const canManage = canUserManageItem(item);
    
    return `
      <div class="elib-card" style="background:var(--surface, #1e293b); border:1px solid rgba(255,255,255,0.08); border-radius:18px; overflow:hidden; display:flex; flex-direction:column; box-shadow:0 10px 30px rgba(0,0,0,0.25); transition:transform 0.25s, border-color 0.25s;">
        <div style="padding:18px 20px 14px; display:flex; justify-content:space-between; align-items:flex-start; border-bottom:1px solid rgba(255,255,255,0.05); background:rgba(255,255,255,0.02);">
          <div style="display:flex; gap:8px; align-items:center; flex-wrap:wrap;">
            <span style="background:${badgeColor}22; color:${badgeColor}; border:1px solid ${badgeColor}44; font-size:11px; font-weight:800; padding:3px 9px; border-radius:6px; text-transform:uppercase;">
              ${escapeHtml(item.categoryLabel || getCategoryLabel(item.category))}
            </span>
            <span style="background:rgba(255,255,255,0.06); color:var(--ivory-dim, #94a3b8); font-size:11px; font-weight:700; padding:3px 8px; border-radius:6px;">
              ${escapeHtml(item.level || 'All Levels')}
            </span>
          </div>
          ${canManage ? `
            <div style="display:flex; gap:6px;">
              <button class="btn btn-outline btn-sm" onclick="window.editElibraryItem('${escapeHtml(item.id)}')" style="padding:4px 8px; font-size:11px; color:var(--gold, #daa33e); border-color:rgba(218,163,62,0.3);" title="Edit Material">✏️</button>
              <button class="btn btn-outline btn-sm" onclick="window.deleteElibraryItem('${escapeHtml(item.id)}')" style="padding:4px 8px; font-size:11px; color:#ef4444; border-color:rgba(239,68,68,0.3);" title="Delete Material">🗑️</button>
            </div>
          ` : ''}
        </div>

        <div style="padding:20px; flex:1; display:flex; flex-direction:column;">
          <h3 style="margin:0 0 10px; font-size:1.15rem; font-weight:800; color:#ffffff; line-height:1.4;">
            ${isVideo ? '🎥 ' : '📄 '} ${escapeHtml(item.title)}
          </h3>
          <p style="margin:0 0 16px; font-size:0.92rem; color:#94a3b8; line-height:1.6; flex:1;">
            ${escapeHtml(item.description || 'No detailed description provided.')}
          </p>

          <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.82rem; color:#64748b; margin-bottom:16px; padding-top:12px; border-top:1px solid rgba(255,255,255,0.04);">
            <span>👨‍🏫 <strong>${escapeHtml(item.author || 'ChessKidoo Coach')}</strong></span>
            <span>📅 ${escapeHtml(item.date || '')}</span>
          </div>

          <div style="display:flex; gap:10px;">
            ${isVideo ? `
              <button class="btn btn-primary" style="flex:1; padding:10px 16px; font-size:0.88rem; font-weight:800; border-radius:10px; display:inline-flex; align-items:center; justify-content:center; gap:8px; box-shadow:0 4px 15px rgba(218,163,62,0.3);" onclick="window.openElibraryVideo('${escapeHtml(item.title)}', '${escapeHtml(item.url)}')">
                <span>▶ Watch Session</span>
              </button>
            ` : `
              <a href="${escapeHtml(item.url)}" target="_blank" rel="noopener" class="btn btn-gold" style="flex:1; padding:10px 16px; font-size:0.88rem; font-weight:800; border-radius:10px; text-decoration:none; display:inline-flex; align-items:center; justify-content:center; gap:8px;">
                <span>📥 Download Material</span>
              </a>
            `}
          </div>
        </div>
      </div>
    `;
  }

  // ── Open Video Player ──
  window.openElibraryVideo = function (title, url) {
    const modal = document.getElementById('video-player-modal');
    const modalTitle = document.getElementById('video-modal-title');
    const iframe = document.getElementById('video-modal-iframe');
    if (!modal) {
      window.open(url, '_blank');
      return;
    }

    if (modalTitle) modalTitle.textContent = `🎥 ${title}`;
    
    // Format embed URL if youtube or drive
    let embedUrl = url;
    if (url.includes('youtube.com/watch?v=')) {
      const vidId = url.split('v=')[1]?.split('&')[0];
      embedUrl = `https://www.youtube.com/embed/${vidId}?autoplay=1`;
    } else if (url.includes('youtu.be/')) {
      const vidId = url.split('youtu.be/')[1]?.split('?')[0];
      embedUrl = `https://www.youtube.com/embed/${vidId}?autoplay=1`;
    } else if (url.includes('drive.google.com/file/d/')) {
      embedUrl = url.replace('/view', '/preview');
    }

    if (iframe) iframe.src = embedUrl;
    modal.classList.add('active');
  };

  // ── Filter Helper ──
  function getFilteredItems() {
    return (window.elibraryItems || []).filter(item => {
      const matchesCat = currentFilter === 'all' || item.category === currentFilter;
      const matchesLevel = currentLevelFilter === 'all' || item.level === currentLevelFilter || item.level === 'All Levels';
      const q = currentSearch.toLowerCase();
      const matchesSearch = !q || item.title.toLowerCase().includes(q) || (item.description && item.description.toLowerCase().includes(q)) || (item.author && item.author.toLowerCase().includes(q));
      return matchesCat && matchesLevel && matchesSearch;
    });
  }

  // ── Render Views ──
  window.renderAdminElibraryPage = function () {
    const container = document.getElementById('admin-elibrary-grid');
    if (!container) return;
    const items = getFilteredItems();
    if (!items.length) {
      container.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:60px 20px; color:#94a3b8;">No study materials found matching filters. Click <strong>+ Add Material</strong> to upload!</div>`;
      return;
    }
    container.innerHTML = items.map(item => renderItemCard(item)).join('');
  };

  window.renderCoachElibraryPage = function () {
    const container = document.getElementById('coach-elibrary-grid');
    if (!container) return;
    const items = getFilteredItems();
    if (!items.length) {
      container.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:60px 20px; color:#94a3b8;">No study materials found matching filters. Click <strong>+ Upload Material</strong> to add one!</div>`;
      return;
    }
    container.innerHTML = items.map(item => renderItemCard(item)).join('');
  };

  window.renderChildElibrary = function () {
    const container = document.getElementById('child-elibrary-grid');
    if (!container) return;
    const items = getFilteredItems();
    if (!items.length) {
      container.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:60px 20px; color:#94a3b8;">No learning resources found in this category yet. Check back soon!</div>`;
      return;
    }
    container.innerHTML = items.map(item => renderItemCard(item)).join('');
  };

  // ── Filter Triggers ──
  window.filterElibrary = function (cat, btn) {
    currentFilter = cat;
    if (btn) {
      const parent = btn.parentElement;
      if (parent) parent.querySelectorAll('.elib-filter-pill').forEach(el => el.classList.remove('active'));
      btn.classList.add('active');
    }
    window.renderAdminElibraryPage();
    window.renderCoachElibraryPage();
    window.renderChildElibrary();
  };

  window.searchElibrary = function (val) {
    currentSearch = String(val || '').trim();
    window.renderAdminElibraryPage();
    window.renderCoachElibraryPage();
    window.renderChildElibrary();
  };

  window.openAddElibraryModal = function () {
    const modal = document.getElementById('add-elibrary-modal');
    if (modal) {
      window._editingElibId = null;
      window._editingElibAuthor = null;
      window._editingElibCoachId = null;

      const modalTitle = modal.querySelector('.modal-title');
      if (modalTitle) modalTitle.innerHTML = '📖 Add Study Material / Recorded Session';

      const submitBtn = modal.querySelector('button.btn-gold');
      if (submitBtn) submitBtn.textContent = 'Publish to E-Library';

      // Clear fields
      const fTitle = document.getElementById('elib-form-title');
      const fDesc = document.getElementById('elib-form-desc');
      const fUrl = document.getElementById('elib-form-url');
      const fDuration = document.getElementById('elib-form-duration');
      if (fTitle) fTitle.value = '';
      if (fDesc) fDesc.value = '';
      if (fUrl) fUrl.value = '';
      if (fDuration) fDuration.value = '';
      modal.classList.add('active');
    }
  };

  window.submitAddElibraryForm = function () {
    const title = document.getElementById('elib-form-title')?.value;
    const desc = document.getElementById('elib-form-desc')?.value;
    const cat = document.getElementById('elib-form-cat')?.value;
    const level = document.getElementById('elib-form-level')?.value;
    const url = document.getElementById('elib-form-url')?.value;
    const duration = document.getElementById('elib-form-duration')?.value;

    if (!title || !url) {
      if (window.toast) window.toast('Please provide at least a title and resource link!', 'warning');
      return;
    }

    const payload = {
      title,
      description: desc,
      category: cat,
      level,
      url,
      duration: duration || 'Study Resource'
    };

    if (window._editingElibId) {
      payload.id = window._editingElibId;
      if (window._editingElibAuthor) payload.author = window._editingElibAuthor;
      if (window._editingElibCoachId) payload.coach_id = window._editingElibCoachId;
    }

    window.saveElibraryItem(payload);

    const modal = document.getElementById('add-elibrary-modal');
    if (modal) modal.classList.remove('active');
  };

  function escapeHtml(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  // Initial load
  window.addEventListener('DOMContentLoaded', () => {
    window.loadElibraryData();
  });
})();
