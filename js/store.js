/**
 * store.js — State Management with localStorage
 * Handles all CRUD operations for job entries
 */

const STORAGE_KEY = 'jobtrack_data';

const STATUS_ORDER = ['wishlist', 'applied', 'interview', 'offer', 'rejected'];

const STAGE_LABELS = ['Wishlist', 'Applied', 'Screen', 'Interview', 'Offer'];

/** Default data structure */
function createDefaultStore() {
  return {
    jobs: [],
    settings: {
      view: 'dashboard', // 'dashboard' | 'board'
      filter: 'all',
      sortBy: 'lastUpdate', // 'lastUpdate' | 'appliedDate' | 'company'
      sortDir: 'desc'
    }
  };
}

/** Create a new job entry */
function createJob(data) {
  return {
    id: crypto.randomUUID(),
    company: data.company || '',
    position: data.position || '',
    location: data.location || '',
    salary: data.salary || '',
    url: data.url || '',
    status: data.status || 'wishlist',
    stage: STATUS_ORDER.indexOf(data.status || 'wishlist'),
    appliedDate: data.appliedDate || new Date().toISOString().split('T')[0],
    lastUpdate: new Date().toISOString().split('T')[0],
    notes: data.notes || '',
    favorite: false,
    createdAt: Date.now()
  };
}

/** Load state from localStorage */
function loadStore() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Merge with defaults for forward compatibility
      return { ...createDefaultStore(), ...parsed };
    }
  } catch (e) {
    console.warn('Failed to load store:', e);
  }
  return createDefaultStore();
}

/** Save state to localStorage */
function saveStore(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('Failed to save store:', e);
  }
}

/** Store singleton */
const Store = {
  _state: loadStore(),
  _listeners: [],

  /** Subscribe to state changes */
  subscribe(fn) {
    this._listeners.push(fn);
    return () => {
      this._listeners = this._listeners.filter(l => l !== fn);
    };
  },

  /** Notify all listeners */
  _notify() {
    saveStore(this._state);
    this._listeners.forEach(fn => fn(this._state));
  },

  /** Get current state */
  getState() {
    return this._state;
  },

  /** Get all jobs */
  getJobs() {
    return this._state.jobs;
  },

  /** Get a single job by ID */
  getJob(id) {
    return this._state.jobs.find(j => j.id === id);
  },

  /** Get jobs filtered by status */
  getJobsByStatus(status) {
    if (status === 'all') return this._state.jobs;
    return this._state.jobs.filter(j => j.status === status);
  },

  /** Add a new job */
  addJob(data) {
    const job = createJob(data);
    this._state.jobs.unshift(job);
    this._notify();
    return job;
  },

  /** Update an existing job */
  updateJob(id, updates) {
    const idx = this._state.jobs.findIndex(j => j.id === id);
    if (idx === -1) return null;

    const job = this._state.jobs[idx];
    const updated = {
      ...job,
      ...updates,
      lastUpdate: new Date().toISOString().split('T')[0]
    };

    // Auto-update stage if status changed
    if (updates.status && updates.status !== job.status) {
      updated.stage = STATUS_ORDER.indexOf(updates.status);
    }

    this._state.jobs[idx] = updated;
    this._notify();
    return updated;
  },

  /** Delete a job */
  deleteJob(id) {
    this._state.jobs = this._state.jobs.filter(j => j.id !== id);
    this._notify();
  },

  /** Toggle favorite */
  toggleFavorite(id) {
    const job = this.getJob(id);
    if (job) {
      this.updateJob(id, { favorite: !job.favorite });
    }
  },

  /** Update job status (used by kanban drag-drop) */
  updateJobStatus(id, newStatus) {
    return this.updateJob(id, { status: newStatus });
  },

  /** Update settings */
  updateSettings(updates) {
    this._state.settings = { ...this._state.settings, ...updates };
    this._notify();
  },

  /** Get current settings */
  getSettings() {
    return this._state.settings;
  },

  /** Get status order constant */
  getStatusOrder() {
    return STATUS_ORDER;
  },

  /** Get stage labels */
  getStageLabels() {
    return STAGE_LABELS;
  },

  /** Load sample data for first-time users */
  loadSampleData() {
    if (this._state.jobs.length > 0) return;

    const samples = [
      {
        company: 'Gojek',
        position: 'Senior Frontend Developer',
        location: 'Jakarta, Indonesia',
        salary: 'IDR 25-35M',
        status: 'interview',
        url: 'https://gojek.com/careers',
        appliedDate: '2026-06-15',
        notes: 'HR interview completed. Waiting for technical round next week.'
      },
      {
        company: 'Tokopedia',
        position: 'Full Stack Engineer',
        location: 'Jakarta, Indonesia',
        salary: 'IDR 28-40M',
        status: 'applied',
        url: 'https://tokopedia.com/careers',
        appliedDate: '2026-06-22',
        notes: 'Applied through referral from college friend.'
      },
      {
        company: 'Shopee',
        position: 'Frontend Engineer',
        location: 'Singapore (Remote)',
        salary: 'SGD 5-7K',
        status: 'offer',
        url: 'https://careers.shopee.com',
        appliedDate: '2026-05-28',
        notes: 'Offer received! Negotiating salary package.'
      },
      {
        company: 'Grab',
        position: 'Software Engineer II',
        location: 'Jakarta, Indonesia',
        salary: 'IDR 30-42M',
        status: 'rejected',
        url: 'https://grab.careers',
        appliedDate: '2026-06-01',
        notes: 'Rejected after final round. Feedback: need more system design experience.'
      },
      {
        company: 'Traveloka',
        position: 'UI Engineer',
        location: 'Jakarta, Indonesia',
        salary: 'IDR 22-30M',
        status: 'wishlist',
        url: 'https://traveloka.com/careers',
        appliedDate: '2026-06-28',
        notes: 'Job posting looks interesting. Will apply after updating portfolio.'
      },
      {
        company: 'Bukalapak',
        position: 'React Developer',
        location: 'Bandung, Indonesia',
        salary: 'IDR 18-25M',
        status: 'applied',
        url: 'https://careers.bukalapak.com',
        appliedDate: '2026-06-25',
        notes: 'Applied directly through website.'
      }
    ];

    samples.forEach(s => this.addJob(s));
  }
};

export default Store;
export { STATUS_ORDER, STAGE_LABELS };
