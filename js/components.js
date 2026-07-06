/**
 * components.js — UI Render Functions
 * All DOM rendering logic lives here
 */

import Store, { STATUS_ORDER, STAGE_LABELS } from './store.js';
import Analytics from './analytics.js';
import i18n from './i18n.js';

/** SVG Icons (inline for zero dependencies) */
const ICONS = {
  search: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>`,
  plus: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>`,
  x: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>`,
  star: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
  starFilled: `<svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
  edit: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>`,
  trash: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>`,
  link: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>`,
  check: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
  alertCircle: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>`,
  info: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>`,
  briefcase: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>`,
  mapPin: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`,
  calendar: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>`,
  building: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="16" height="20" x="4" y="2" rx="2" ry="2"/><path d="M9 22v-4h6v4M8 6h.01M16 6h.01M12 6h.01M12 10h.01M12 14h.01M16 10h.01M16 14h.01M8 10h.01M8 14h.01"/></svg>`,
  dollar: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`,
  rocket: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09zM12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>`,
  layout: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><line x1="3" x2="21" y1="9" y2="9"/><line x1="9" x2="9" y1="21" y2="9"/></svg>`,
  columns: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M7.5 3v18M12 3v18M16.5 3v18"/></svg>`,
  notepad: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2v4M16 2v4M3 10h18"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01"/></svg>`,
};

function getStatusLabel(s) {
  return i18n.t('board.' + s) || s;
}

/** Format date to readable string */
function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

/** ========================
 *  HERO STATS BAR
 *  ======================== */
function renderHeroStats() {
  const stats = Analytics.getHeroStats();
  return `
    <section class="hero-stats" id="hero-stats" aria-label="Application statistics">
      ${stats.map((stat, i) => `
        <div class="stat-card ${stat.modifier ? 'stat-card--' + stat.modifier : ''} animate-slide-up stagger-${i + 1}">
          <div class="stat-card__number count-up holo-text" data-target="${stat.value}">
            ${stat.value}
          </div>
          <div class="stat-card__label">${stat.label}</div>
        </div>
      `).join('')}
    </section>
  `;
}

/** ========================
 *  FILTER TABS
 *  ======================== */
function renderToolbar(activeFilter, query) {
  const counts = Analytics.getStatusCounts();
  const filters = [
    { key: 'all', label: i18n.t('filter.all') },
    ...STATUS_ORDER.map(s => ({ key: s, label: getStatusLabel(s) }))
  ];

  return `
    <div class="toolbar">
      <div class="toolbar__left">
        <div class="filter-tabs" role="tablist" aria-label="Filter by status">
          ${filters.map(f => `
            <button class="filter-tab ${activeFilter === f.key ? 'is-active' : ''}"
                    data-filter="${f.key}"
                    role="tab"
                    aria-selected="${activeFilter === f.key}">
              ${f.label}<span class="filter-tab__count">${counts[f.key] || 0}</span>
            </button>
          `).join('')}
        </div>
      </div>
      <div class="toolbar__right">
        <div class="search-box">
          <span class="search-box__icon">${ICONS.search}</span>
          <input type="text"
                 class="search-box__input"
                 id="search-input"
                 placeholder="${i18n.t('search.placeholder')}"
                 value="${query || ''}"
                 aria-label="Search jobs" />
        </div>
        <button class="btn btn--primary" id="btn-add-job" aria-label="Add new job">
          ${ICONS.plus}
          <span>${i18n.t('action.addJob')}</span>
        </button>
      </div>
    </div>
  `;
}

/** ========================
 *  JOURNEY PROGRESS RAIL
 *  ======================== */
function renderJourneyRail(status) {
  const stageIndex = STATUS_ORDER.indexOf(status);

  return `
    <div class="journey-rail" aria-label="Application progress">
      ${STAGE_LABELS.map((label, i) => {
        let nodeClass = 'journey-rail__node';
        let lineClass = 'journey-rail__line';

        if (i < stageIndex) {
          nodeClass += ' journey-rail__node--completed';
          lineClass += ' journey-rail__line--completed';
        } else if (i === stageIndex) {
          nodeClass += ' journey-rail__node--current rail-pulse';
        } else {
          nodeClass += ' journey-rail__node--upcoming';
          lineClass += ' journey-rail__line--upcoming';
        }

        const segment = `
          <div class="journey-rail__segment">
            <div class="${nodeClass}" data-stage="${i}" title="${label}"></div>
            ${i < STAGE_LABELS.length - 1 ? `<div class="${lineClass}"></div>` : ''}
          </div>
        `;
        return segment;
      }).join('')}
    </div>
    <div class="journey-rail__labels">
      ${STAGE_LABELS.map((_, i) => {
        const stages = ['wishlist', 'applied', 'interview', 'offer', 'rejected'];
        return `<span class="journey-rail__label ${i === stageIndex ? 'journey-rail__label--active' : ''}">${i18n.t('board.' + stages[i])}</span>`;
      }).join('')}
    </div>
  `;
}

/** ========================
 *  JOB CARD
 *  ======================== */
function renderJobCard(job, index) {
  const statusLabel = getStatusLabel(job.status);

  return `
    <article class="job-card job-card--${job.status} animate-slide-up hover-lift"
             data-id="${job.id}"
             style="animation-delay: ${index * 60}ms"
             tabindex="0"
             role="article"
             aria-label="${job.position} at ${job.company}">
      <div class="job-card__header">
        <div class="job-card__header-left">
          <div class="job-card__status">
            <span class="job-card__status-dot"></span>
            ${statusLabel}
          </div>
          <h3 class="job-card__title">${job.position}</h3>
          <div class="job-card__company">
            <span>${job.company}</span>
            ${job.location ? `<span class="separator">·</span><span>${job.location}</span>` : ''}
            ${job.salary ? `<span class="separator">·</span><span>${job.salary}</span>` : ''}
          </div>
        </div>
        <div class="job-card__header-right">
          <button class="btn btn--icon job-card__fav ${job.favorite ? 'is-active' : ''}"
                  data-action="toggle-fav" data-id="${job.id}"
                  aria-label="${job.favorite ? 'Remove from favorites' : 'Add to favorites'}"
                  title="${job.favorite ? 'Remove from favorites' : 'Add to favorites'}">
            ${job.favorite ? ICONS.starFilled : ICONS.star}
          </button>
          <div class="job-card__actions">
            ${job.url ? `
              <a href="${job.url}" target="_blank" rel="noopener noreferrer"
                 class="btn btn--icon" aria-label="Open job posting" title="Open job posting">
                ${ICONS.link}
              </a>
            ` : ''}
            <button class="btn btn--icon" data-action="edit-job" data-id="${job.id}"
                    aria-label="Edit job" title="Edit">
              ${ICONS.edit}
            </button>
            <button class="btn btn--icon btn--danger" data-action="delete-job" data-id="${job.id}"
                    aria-label="Delete job" title="Delete">
              ${ICONS.trash}
            </button>
          </div>
        </div>
      </div>

      <div class="job-card__dates">
        <span>Applied: ${formatDate(job.appliedDate)}</span>
        <span>Updated: ${formatDate(job.lastUpdate)}</span>
      </div>

      ${renderJourneyRail(job.status)}
    </article>
  `;
}

/** ========================
 *  JOB LIST
 *  ======================== */
function renderJobList(jobs) {
  if (jobs.length === 0) {
    return renderEmptyState();
  }

  return `
    <div class="job-list" id="job-list" role="list">
      ${jobs.map((job, i) => renderJobCard(job, i)).join('')}
    </div>
  `;
}

/** ========================
 *  EMPTY STATE
 *  ======================== */
function renderEmptyState() {
  return `
    <div class="empty-state">
      <div class="empty-state__icon animate-float">
        ${ICONS.rocket}
      </div>
      <h3 class="empty-state__title">${i18n.t('empty.title')}</h3>
      <p class="empty-state__desc">${i18n.t('empty.desc')}</p>
      <button class="btn btn--primary" id="btn-add-job-empty">
        ${ICONS.plus} ${i18n.t('action.addJob')}
      </button>
    </div>
  `;
}

/** ========================
 *  KANBAN BOARD
 *  ======================== */
function renderKanbanBoard() {
  const jobs = Store.getJobs();

  return `
    <div class="kanban-board" id="kanban-board">
      ${STATUS_ORDER.map(status => {
        const columnJobs = jobs.filter(j => j.status === status);
        return `
          <div class="kanban-column kanban-column--${status}" data-status="${status}">
            <div class="kanban-column__header">
              <span class="kanban-column__title">${getStatusLabel(status)}</span>
              <span class="kanban-column__count">${columnJobs.length}</span>
            </div>
            <div class="kanban-column__cards">
              ${columnJobs.map(job => `
                <div class="kanban-card" draggable="true" data-id="${job.id}"
                     tabindex="0" aria-label="${job.position} at ${job.company}">
                  <div class="kanban-card__company">${job.company}</div>
                  <div class="kanban-card__position">${job.position}</div>
                  <div class="kanban-card__date">${formatDate(job.appliedDate)}</div>
                </div>
              `).join('')}
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

/** ========================
 *  MODAL — Add / Edit Job
 *  ======================== */
function renderModal(job = null) {
  const isEdit = !!job;
  const title = isEdit ? i18n.t('modal.editTitle') : i18n.t('modal.addTitle');
  const btnText = isEdit ? i18n.t('form.save') : i18n.t('form.save');

  return `
    <div class="modal-overlay backdrop-enter" id="modal-overlay">
      <div class="modal modal-enter" id="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div class="modal__header">
          <h2 class="modal__title" id="modal-title">${title}</h2>
          <button class="modal__close" id="modal-close" aria-label="Close dialog">
            ${ICONS.x}
          </button>
        </div>

        <form class="modal__body" id="job-form" novalidate>
          <input type="hidden" name="id" value="${isEdit ? job.id : ''}" />

          <div class="form-group">
            <label for="field-company">${ICONS.building} ${i18n.t('form.company')}</label>
            <input type="text" id="field-company" name="company"
                   placeholder="e.g. Gojek, Tokopedia"
                   value="${isEdit ? job.company : ''}" required />
          </div>

          <div class="form-group">
            <label for="field-position">${ICONS.briefcase} ${i18n.t('form.position')}</label>
            <input type="text" id="field-position" name="position"
                   placeholder="e.g. Senior Frontend Developer"
                   value="${isEdit ? job.position : ''}" required />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="field-location">${ICONS.mapPin} ${i18n.t('form.location')}</label>
              <input type="text" id="field-location" name="location"
                     placeholder="e.g. Jakarta, Remote"
                     value="${isEdit ? job.location : ''}" />
            </div>
            <div class="form-group">
              <label for="field-salary">${ICONS.dollar} ${i18n.t('form.salary')}</label>
              <input type="text" id="field-salary" name="salary"
                     placeholder="e.g. IDR 25-35M"
                     value="${isEdit ? job.salary : ''}" />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="field-status">${i18n.t('form.status')}</label>
              <select id="field-status" name="status">
                ${STATUS_ORDER.map(s => `
                  <option value="${s}" ${isEdit && job.status === s ? 'selected' : ''}>
                    ${getStatusLabel(s)}
                  </option>
                `).join('')}
              </select>
            </div>
            <div class="form-group">
              <label for="field-date">${ICONS.calendar} Applied Date</label>
              <input type="date" id="field-date" name="appliedDate"
                     value="${isEdit ? job.appliedDate : new Date().toISOString().split('T')[0]}" />
            </div>
          </div>

          <div class="form-group">
            <label for="field-url">${ICONS.link} Job URL</label>
            <input type="url" id="field-url" name="url"
                   placeholder="https://..."
                   value="${isEdit ? job.url : ''}" />
          </div>

          <div class="form-group">
            <label for="field-notes">${ICONS.notepad} ${i18n.t('form.notes')}</label>
            <textarea id="field-notes" name="notes"
                      placeholder="...">${isEdit ? job.notes : ''}</textarea>
          </div>
        </form>

        <div class="modal__footer">
          <button class="btn btn--ghost" id="modal-cancel">${i18n.t('form.cancel')}</button>
          <button class="btn btn--primary" id="modal-save" type="submit" form="job-form">
            ${ICONS.check} ${btnText}
          </button>
        </div>
      </div>
    </div>
  `;
}

/** ========================
 *  TOAST NOTIFICATION
 *  ======================== */
function renderToast(message, type = 'success') {
  const iconMap = {
    success: ICONS.check,
    error: ICONS.alertCircle,
    info: ICONS.info
  };

  return `
    <div class="toast toast--${type} toast-enter" role="alert">
      <span class="toast__icon">${iconMap[type] || iconMap.info}</span>
      <span class="toast__message">${message}</span>
      <button class="toast__close" aria-label="Dismiss">${ICONS.x}</button>
    </div>
  `;
}

/** ========================
 *  CONFIRM DIALOG
 *  ======================== */
function renderConfirmDialog(title, message) {
  return `
    <div class="modal-overlay backdrop-enter" id="confirm-overlay">
      <div class="modal modal-enter" style="max-width: 400px;">
        <div class="confirm-dialog">
          <h3 class="confirm-dialog__title">${title}</h3>
          <p class="confirm-dialog__message">${message}</p>
          <div class="confirm-dialog__actions">
            <button class="btn btn--ghost" id="confirm-cancel">${i18n.t('confirm.no')}</button>
            <button class="btn btn--danger" id="confirm-yes">${i18n.t('confirm.yes')}</button>
          </div>
        </div>
      </div>
    </div>
  `;
}

export {
  renderHeroStats,
  renderToolbar,
  renderJobList,
  renderJobCard,
  renderKanbanBoard,
  renderModal,
  renderToast,
  renderEmptyState,
  renderConfirmDialog,
  renderJourneyRail,
  ICONS,
  getStatusLabel,
  formatDate
};
