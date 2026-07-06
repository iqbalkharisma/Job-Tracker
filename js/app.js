/**
 * app.js — Application Entry Point
 * Orchestrates all modules, event handling, and routing
 */

import Store from './store.js';
import Search from './search.js';
import DragDrop from './dragdrop.js';
import i18n from './i18n.js';
import {
  renderHeroStats,
  renderToolbar,
  renderJobList,
  renderKanbanBoard,
  renderModal,
  renderToast,
  renderConfirmDialog,
  getStatusLabel,
  ICONS
} from './components.js';

/** ========================
 *  APP STATE
 *  ======================== */
let currentView = 'dashboard'; // 'dashboard' | 'board'
let searchQuery = '';

/** ========================
 *  DOM REFERENCES
 *  ======================== */
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

/** ========================
 *  RENDER ENGINE
 *  ======================== */
function renderApp() {
  const mainContent = $('#main-content');
  if (!mainContent) return;

  const activeFilter = Search.getFilter();
  const filteredJobs = Search.getFilteredJobs();

  let viewHTML = '';

  if (currentView === 'dashboard') {
    viewHTML = `
      ${renderHeroStats()}
      ${renderToolbar(activeFilter, searchQuery)}
      <div class="view is-active" id="view-dashboard">
        ${renderJobList(filteredJobs)}
      </div>
    `;
  } else if (currentView === 'board') {
    viewHTML = `
      ${renderHeroStats()}
      <div class="toolbar" style="margin-bottom: var(--space-6);">
        <div class="toolbar__right" style="margin-left: auto;">
          <button class="btn btn--primary" id="btn-add-job" aria-label="Add new job">
            ${ICONS.plus}
            <span>Add Job</span>
          </button>
        </div>
      </div>
      <div class="view is-active" id="view-board">
        ${renderKanbanBoard()}
      </div>
    `;
  }

  mainContent.innerHTML = viewHTML;

  // Re-bind dynamic elements
  bindDynamicEvents();

  // Initialize kanban drag-drop if on board view
  if (currentView === 'board') {
    const board = $('#kanban-board');
    if (board) {
      DragDrop.bindEvents(board);
    }
  }

  // Update nav active state
  $$('.header__nav-btn').forEach(btn => {
    btn.classList.toggle('is-active', btn.dataset.view === currentView);
  });

  // Animate stat numbers
  animateCountUp();
}

/** ========================
 *  COUNT-UP ANIMATION
 *  ======================== */
function animateCountUp() {
  $$('.count-up').forEach(el => {
    const target = parseInt(el.dataset.target, 10);
    if (isNaN(target)) return;

    let current = 0;
    const duration = 600;
    const step = Math.max(1, Math.floor(target / (duration / 16)));
    const startTime = performance.now();

    function tick(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      current = Math.round(target * eased);
      el.textContent = current;

      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        el.textContent = target;
      }
    }

    el.textContent = '0';
    requestAnimationFrame(tick);
  });
}

/** ========================
 *  MODAL MANAGEMENT
 *  ======================== */
function openModal(jobId = null) {
  const job = jobId ? Store.getJob(jobId) : null;
  const modalHTML = renderModal(job);

  // Remove existing modal if any
  closeModal();

  document.body.insertAdjacentHTML('beforeend', modalHTML);
  document.body.style.overflow = 'hidden';

  // Focus first input
  setTimeout(() => {
    const firstInput = $('#field-company');
    if (firstInput) firstInput.focus();
  }, 100);

  // Bind modal events
  bindModalEvents();
}

function closeModal() {
  const overlay = $('#modal-overlay');
  if (!overlay) return;

  const modal = overlay.querySelector('.modal');
  if (modal) {
    modal.classList.remove('modal-enter');
    modal.classList.add('modal-exit');
    overlay.classList.remove('backdrop-enter');
    overlay.classList.add('backdrop-exit');
  }

  setTimeout(() => {
    overlay.remove();
    document.body.style.overflow = '';
  }, 220);
}

function bindModalEvents() {
  // Close button
  const closeBtn = $('#modal-close');
  if (closeBtn) closeBtn.addEventListener('click', closeModal);

  // Cancel button
  const cancelBtn = $('#modal-cancel');
  if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

  // Overlay click to close
  const overlay = $('#modal-overlay');
  if (overlay) {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeModal();
    });
  }

  // Save button
  const saveBtn = $('#modal-save');
  if (saveBtn) {
    saveBtn.addEventListener('click', (e) => {
      e.preventDefault();
      handleSaveJob();
    });
  }

  // Form submit
  const form = $('#job-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      handleSaveJob();
    });
  }

  // Escape key
  document.addEventListener('keydown', handleEscKey);
}

function handleEscKey(e) {
  if (e.key === 'Escape') {
    const confirmOverlay = $('#confirm-overlay');
    if (confirmOverlay) {
      confirmOverlay.remove();
      return;
    }
    closeModal();
    document.removeEventListener('keydown', handleEscKey);
  }
}

/** ========================
 *  FORM HANDLING
 *  ======================== */
function handleSaveJob() {
  const form = $('#job-form');
  if (!form) return;

  const formData = new FormData(form);
  const data = Object.fromEntries(formData.entries());

  // Basic validation
  if (!data.company.trim() || !data.position.trim()) {
    showToast(i18n.t('toast.fillFields'), 'error');
    return;
  }

  const id = data.id;
  delete data.id;

  if (id) {
    // Update existing
    Store.updateJob(id, data);
    showToast(i18n.t('toast.updated'), 'success');
  } else {
    // Add new
    Store.addJob(data);
    showToast(i18n.t('toast.added'), 'success');
  }

  closeModal();
  renderApp();
}

/** ========================
 *  DELETE CONFIRMATION
 *  ======================== */
function showConfirmDelete(jobId) {
  const job = Store.getJob(jobId);
  if (!job) return;

  const html = renderConfirmDialog(
    i18n.t('confirm.deleteTitle'),
    i18n.t('confirm.deleteDesc', { position: job.position, company: job.company })
  );

  document.body.insertAdjacentHTML('beforeend', html);

  const confirmYes = $('#confirm-yes');
  const confirmCancel = $('#confirm-cancel');
  const confirmOverlay = $('#confirm-overlay');

  if (confirmYes) {
    confirmYes.addEventListener('click', () => {
      Store.deleteJob(jobId);
      confirmOverlay.remove();
      showToast(i18n.t('toast.deleted'), 'info');
      renderApp();
    });
  }

  if (confirmCancel) {
    confirmCancel.addEventListener('click', () => {
      confirmOverlay.remove();
    });
  }

  if (confirmOverlay) {
    confirmOverlay.addEventListener('click', (e) => {
      if (e.target === confirmOverlay) confirmOverlay.remove();
    });
  }
}

/** ========================
 *  TOAST NOTIFICATIONS
 *  ======================== */
function showToast(message, type = 'success') {
  const container = $('#toast-container');
  if (!container) return;

  const toastHTML = renderToast(message, type);
  container.insertAdjacentHTML('beforeend', toastHTML);

  const toast = container.lastElementChild;

  // Close button
  const closeBtn = toast.querySelector('.toast__close');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => dismissToast(toast));
  }

  // Auto dismiss after 3.5s
  setTimeout(() => dismissToast(toast), 3500);
}

function dismissToast(toast) {
  if (!toast || !toast.parentNode) return;
  toast.classList.remove('toast-enter');
  toast.classList.add('toast-exit');
  setTimeout(() => {
    if (toast.parentNode) toast.remove();
  }, 260);
}

/** ========================
 *  DYNAMIC EVENT BINDING
 *  ======================== */
function bindDynamicEvents() {
  // Add job button(s)
  const addBtns = $$('#btn-add-job, #btn-add-job-empty');
  addBtns.forEach(btn => {
    btn.addEventListener('click', () => openModal());
  });

  // Filter tabs
  $$('.filter-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const filter = tab.dataset.filter;
      Search.setFilter(filter);
      renderApp();
    });
  });

  // Search input
  const searchInput = $('#search-input');
  if (searchInput) {
    // Debounced search
    let debounceTimer;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(debounceTimer);
      searchQuery = e.target.value;
      debounceTimer = setTimeout(() => {
        Search.setQuery(searchQuery);
        // Only re-render the job list, not the whole app
        const filteredJobs = Search.getFilteredJobs();
        const listContainer = $('#view-dashboard');
        if (listContainer) {
          listContainer.innerHTML = renderJobList(filteredJobs).trim();
          // Re-bind card events
          bindCardEvents();
        }
      }, 250);
    });
  }

  // Card events
  bindCardEvents();
}

function bindCardEvents() {
  // Event delegation on job list
  const jobList = $('#job-list');
  if (jobList) {
    jobList.addEventListener('click', handleCardClick);
  }

  // Kanban card clicks
  $$('.kanban-card').forEach(card => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('button')) return;
      openModal(card.dataset.id);
    });
  });
}

function handleCardClick(e) {
  const btn = e.target.closest('[data-action]');

  if (btn) {
    e.stopPropagation();
    const action = btn.dataset.action;
    const id = btn.dataset.id;

    switch (action) {
      case 'toggle-fav':
        btn.classList.add('star-pop');
        Store.toggleFavorite(id);
        setTimeout(() => renderApp(), 400); // Wait for star spin to finish
        break;
      case 'edit-job':
        openModal(id);
        break;
      case 'delete-job':
        showConfirmDelete(id);
        break;
    }
    return;
  }

  // Click on card body → open edit modal
  const card = e.target.closest('.job-card');
  if (card && !e.target.closest('a')) {
    openModal(card.dataset.id);
  }
}

/** ========================
 *  NAVIGATION
 *  ======================== */
function bindNavEvents() {
  $$('.header__nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      currentView = btn.dataset.view;
      Store.updateSettings({ view: currentView });
      renderApp();
    });
  });

  const btnTheme = $('#btn-theme-toggle');
  if (btnTheme) {
    btnTheme.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', newTheme);
      Store.updateSettings({ theme: newTheme });
    });
  }

  const btnLang = $('#btn-lang-toggle');
  if (btnLang) {
    btnLang.addEventListener('click', () => {
      const currentLang = i18n.getLang();
      const newLang = currentLang === 'en' ? 'id' : 'en';
      i18n.setLang(newLang);
      Store.updateSettings({ lang: newLang });
      updateStaticText();
      renderApp();
    });
  }
}

function updateStaticText() {
  const btnLang = $('#btn-lang-toggle');
  if (btnLang) btnLang.textContent = i18n.t('header.lang');
  
  $$('[data-i18n]').forEach(el => {
    el.textContent = i18n.t(el.dataset.i18n);
  });
}

/** ========================
 *  DRAG-DROP CALLBACK
 *  ======================== */
function handleDragDrop(jobId, newStatus) {
  showToast(i18n.t('toast.moved', { status: getStatusLabel(newStatus) }), 'success');
  renderApp();
}

/** ========================
 *  INITIALIZATION
 *  ======================== */
function init() {
  // Load saved view preference
  const settings = Store.getSettings();
  currentView = settings.view || 'dashboard';
  Search.setFilter(settings.filter || 'all');

  const theme = settings.theme || 'dark';
  document.documentElement.setAttribute('data-theme', theme);
  
  const lang = settings.lang || 'en';
  i18n.setLang(lang);
  updateStaticText();

  // Load sample data on first visit
  Store.loadSampleData();

  // Initialize drag-drop
  DragDrop.init(handleDragDrop);

  // Bind static events
  bindNavEvents();

  // Subscribe to store changes (for external updates)
  Store.subscribe(() => {
    // Only re-render if not mid-interaction
  });

  // Initial render
  renderApp();
}

// Boot when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
