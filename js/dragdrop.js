/**
 * dragdrop.js — HTML5 Drag & Drop for Kanban Board
 */

import Store from './store.js';

let draggedId = null;
let draggedEl = null;
let placeholder = null;

const DragDrop = {
  _onDrop: null,

  /** Initialize drag-drop on kanban board */
  init(onDropCallback) {
    this._onDrop = onDropCallback;
  },

  /** Handle drag start on a kanban card */
  handleDragStart(e) {
    const card = e.target.closest('.kanban-card');
    if (!card) return;

    draggedId = card.dataset.id;
    draggedEl = card;

    card.classList.add('is-dragging');

    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', draggedId);

    // Create a subtle drag image
    requestAnimationFrame(() => {
      if (draggedEl) {
        draggedEl.style.opacity = '0.4';
      }
    });
  },

  /** Handle drag over a column */
  handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

    const column = e.target.closest('.kanban-column');
    if (!column) return;

    // Add visual feedback
    column.classList.add('is-drag-over');

    // Show drop placeholder
    const cardsContainer = column.querySelector('.kanban-column__cards');
    if (cardsContainer && !cardsContainer.querySelector('.kanban-drop-placeholder')) {
      if (!placeholder) {
        placeholder = document.createElement('div');
        placeholder.className = 'kanban-drop-placeholder';
      }
      cardsContainer.appendChild(placeholder);
    }
  },

  /** Handle drag enter */
  handleDragEnter(e) {
    e.preventDefault();
    const column = e.target.closest('.kanban-column');
    if (column) {
      column.classList.add('is-drag-over');
    }
  },

  /** Handle drag leave */
  handleDragLeave(e) {
    const column = e.target.closest('.kanban-column');
    if (!column) return;

    // Only remove if actually leaving the column
    const relatedColumn = e.relatedTarget?.closest('.kanban-column');
    if (relatedColumn !== column) {
      column.classList.remove('is-drag-over');
      const ph = column.querySelector('.kanban-drop-placeholder');
      if (ph) ph.remove();
    }
  },

  /** Handle drop on a column */
  handleDrop(e) {
    e.preventDefault();

    const column = e.target.closest('.kanban-column');
    if (!column || !draggedId) return;

    const newStatus = column.dataset.status;
    const job = Store.getJob(draggedId);

    if (job && job.status !== newStatus) {
      Store.updateJobStatus(draggedId, newStatus);

      if (this._onDrop) {
        this._onDrop(draggedId, newStatus);
      }
    }

    this._cleanup();
  },

  /** Handle drag end (cleanup) */
  handleDragEnd() {
    this._cleanup();
  },

  /** Cleanup drag state */
  _cleanup() {
    if (draggedEl) {
      draggedEl.classList.remove('is-dragging');
      draggedEl.style.opacity = '';
    }

    // Remove all drag-over states
    document.querySelectorAll('.is-drag-over').forEach(el => {
      el.classList.remove('is-drag-over');
    });

    // Remove placeholders
    document.querySelectorAll('.kanban-drop-placeholder').forEach(el => {
      el.remove();
    });

    draggedId = null;
    draggedEl = null;
    placeholder = null;
  },

  /** Bind events to the kanban board container */
  bindEvents(boardEl) {
    if (!boardEl) return;

    boardEl.addEventListener('dragstart', (e) => this.handleDragStart(e));
    boardEl.addEventListener('dragover', (e) => this.handleDragOver(e));
    boardEl.addEventListener('dragenter', (e) => this.handleDragEnter(e));
    boardEl.addEventListener('dragleave', (e) => this.handleDragLeave(e));
    boardEl.addEventListener('drop', (e) => this.handleDrop(e));
    boardEl.addEventListener('dragend', () => this.handleDragEnd());
  }
};

export default DragDrop;
