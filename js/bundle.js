(() => {
  // js/store.js
  var STORAGE_KEY = "jobtrack_data";
  var STATUS_ORDER = ["wishlist", "applied", "interview", "offer", "rejected"];
  var STAGE_LABELS = ["Wishlist", "Applied", "Screen", "Interview", "Offer"];
  function createDefaultStore() {
    return {
      jobs: [],
      settings: {
        view: "dashboard",
        // 'dashboard' | 'board'
        filter: "all",
        sortBy: "lastUpdate",
        // 'lastUpdate' | 'appliedDate' | 'company'
        sortDir: "desc"
      }
    };
  }
  function createJob(data) {
    return {
      id: crypto.randomUUID(),
      company: data.company || "",
      position: data.position || "",
      location: data.location || "",
      salary: data.salary || "",
      url: data.url || "",
      status: data.status || "wishlist",
      stage: STATUS_ORDER.indexOf(data.status || "wishlist"),
      appliedDate: data.appliedDate || (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
      lastUpdate: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
      notes: data.notes || "",
      favorite: false,
      createdAt: Date.now()
    };
  }
  function loadStore() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        return { ...createDefaultStore(), ...parsed };
      }
    } catch (e) {
      console.warn("Failed to load store:", e);
    }
    return createDefaultStore();
  }
  function saveStore(state) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn("Failed to save store:", e);
    }
  }
  var Store = {
    _state: loadStore(),
    _listeners: [],
    /** Subscribe to state changes */
    subscribe(fn) {
      this._listeners.push(fn);
      return () => {
        this._listeners = this._listeners.filter((l) => l !== fn);
      };
    },
    /** Notify all listeners */
    _notify() {
      saveStore(this._state);
      this._listeners.forEach((fn) => fn(this._state));
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
      return this._state.jobs.find((j) => j.id === id);
    },
    /** Get jobs filtered by status */
    getJobsByStatus(status) {
      if (status === "all") return this._state.jobs;
      return this._state.jobs.filter((j) => j.status === status);
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
      const idx = this._state.jobs.findIndex((j) => j.id === id);
      if (idx === -1) return null;
      const job = this._state.jobs[idx];
      const updated = {
        ...job,
        ...updates,
        lastUpdate: (/* @__PURE__ */ new Date()).toISOString().split("T")[0]
      };
      if (updates.status && updates.status !== job.status) {
        updated.stage = STATUS_ORDER.indexOf(updates.status);
      }
      this._state.jobs[idx] = updated;
      this._notify();
      return updated;
    },
    /** Delete a job */
    deleteJob(id) {
      this._state.jobs = this._state.jobs.filter((j) => j.id !== id);
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
          company: "Gojek",
          position: "Senior Frontend Developer",
          location: "Jakarta, Indonesia",
          salary: "IDR 25-35M",
          status: "interview",
          url: "https://gojek.com/careers",
          appliedDate: "2026-06-15",
          notes: "HR interview completed. Waiting for technical round next week."
        },
        {
          company: "Tokopedia",
          position: "Full Stack Engineer",
          location: "Jakarta, Indonesia",
          salary: "IDR 28-40M",
          status: "applied",
          url: "https://tokopedia.com/careers",
          appliedDate: "2026-06-22",
          notes: "Applied through referral from college friend."
        },
        {
          company: "Shopee",
          position: "Frontend Engineer",
          location: "Singapore (Remote)",
          salary: "SGD 5-7K",
          status: "offer",
          url: "https://careers.shopee.com",
          appliedDate: "2026-05-28",
          notes: "Offer received! Negotiating salary package."
        },
        {
          company: "Grab",
          position: "Software Engineer II",
          location: "Jakarta, Indonesia",
          salary: "IDR 30-42M",
          status: "rejected",
          url: "https://grab.careers",
          appliedDate: "2026-06-01",
          notes: "Rejected after final round. Feedback: need more system design experience."
        },
        {
          company: "Traveloka",
          position: "UI Engineer",
          location: "Jakarta, Indonesia",
          salary: "IDR 22-30M",
          status: "wishlist",
          url: "https://traveloka.com/careers",
          appliedDate: "2026-06-28",
          notes: "Job posting looks interesting. Will apply after updating portfolio."
        },
        {
          company: "Bukalapak",
          position: "React Developer",
          location: "Bandung, Indonesia",
          salary: "IDR 18-25M",
          status: "applied",
          url: "https://careers.bukalapak.com",
          appliedDate: "2026-06-25",
          notes: "Applied directly through website."
        }
      ];
      samples.forEach((s) => this.addJob(s));
    }
  };
  var store_default = Store;

  // js/search.js
  var Search = {
    _query: "",
    _filter: "all",
    _sortBy: "lastUpdate",
    _sortDir: "desc",
    /** Set search query */
    setQuery(q) {
      this._query = q.toLowerCase().trim();
    },
    /** Set status filter */
    setFilter(status) {
      this._filter = status;
      store_default.updateSettings({ filter: status });
    },
    /** Set sort */
    setSort(by, dir) {
      this._sortBy = by;
      this._sortDir = dir || "desc";
    },
    /** Toggle sort direction */
    toggleSortDir() {
      this._sortDir = this._sortDir === "desc" ? "asc" : "desc";
    },
    /** Get current filter */
    getFilter() {
      return this._filter;
    },
    /** Apply all filters and return matching jobs */
    getFilteredJobs() {
      let jobs = store_default.getJobs();
      if (this._filter !== "all") {
        jobs = jobs.filter((j) => j.status === this._filter);
      }
      if (this._query) {
        jobs = jobs.filter(
          (j) => j.company.toLowerCase().includes(this._query) || j.position.toLowerCase().includes(this._query) || j.location.toLowerCase().includes(this._query) || j.notes.toLowerCase().includes(this._query)
        );
      }
      jobs = [...jobs].sort((a, b) => {
        let valA, valB;
        switch (this._sortBy) {
          case "company":
            valA = a.company.toLowerCase();
            valB = b.company.toLowerCase();
            return this._sortDir === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
          case "appliedDate":
            valA = new Date(a.appliedDate).getTime();
            valB = new Date(b.appliedDate).getTime();
            break;
          case "lastUpdate":
          default:
            valA = new Date(a.lastUpdate).getTime();
            valB = new Date(b.lastUpdate).getTime();
            break;
        }
        return this._sortDir === "asc" ? valA - valB : valB - valA;
      });
      return jobs;
    }
  };
  var search_default = Search;

  // js/dragdrop.js
  var draggedId = null;
  var draggedEl = null;
  var placeholder = null;
  var DragDrop = {
    _onDrop: null,
    /** Initialize drag-drop on kanban board */
    init(onDropCallback) {
      this._onDrop = onDropCallback;
    },
    /** Handle drag start on a kanban card */
    handleDragStart(e) {
      const card = e.target.closest(".kanban-card");
      if (!card) return;
      draggedId = card.dataset.id;
      draggedEl = card;
      card.classList.add("is-dragging");
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", draggedId);
      requestAnimationFrame(() => {
        if (draggedEl) {
          draggedEl.style.opacity = "0.4";
        }
      });
    },
    /** Handle drag over a column */
    handleDragOver(e) {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      const column = e.target.closest(".kanban-column");
      if (!column) return;
      column.classList.add("is-drag-over");
      const cardsContainer = column.querySelector(".kanban-column__cards");
      if (cardsContainer && !cardsContainer.querySelector(".kanban-drop-placeholder")) {
        if (!placeholder) {
          placeholder = document.createElement("div");
          placeholder.className = "kanban-drop-placeholder";
        }
        cardsContainer.appendChild(placeholder);
      }
    },
    /** Handle drag enter */
    handleDragEnter(e) {
      e.preventDefault();
      const column = e.target.closest(".kanban-column");
      if (column) {
        column.classList.add("is-drag-over");
      }
    },
    /** Handle drag leave */
    handleDragLeave(e) {
      const column = e.target.closest(".kanban-column");
      if (!column) return;
      const relatedColumn = e.relatedTarget?.closest(".kanban-column");
      if (relatedColumn !== column) {
        column.classList.remove("is-drag-over");
        const ph = column.querySelector(".kanban-drop-placeholder");
        if (ph) ph.remove();
      }
    },
    /** Handle drop on a column */
    handleDrop(e) {
      e.preventDefault();
      const column = e.target.closest(".kanban-column");
      if (!column || !draggedId) return;
      const newStatus = column.dataset.status;
      const job = store_default.getJob(draggedId);
      if (job && job.status !== newStatus) {
        store_default.updateJobStatus(draggedId, newStatus);
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
        draggedEl.classList.remove("is-dragging");
        draggedEl.style.opacity = "";
      }
      document.querySelectorAll(".is-drag-over").forEach((el) => {
        el.classList.remove("is-drag-over");
      });
      document.querySelectorAll(".kanban-drop-placeholder").forEach((el) => {
        el.remove();
      });
      draggedId = null;
      draggedEl = null;
      placeholder = null;
    },
    /** Bind events to the kanban board container */
    bindEvents(boardEl) {
      if (!boardEl) return;
      boardEl.addEventListener("dragstart", (e) => this.handleDragStart(e));
      boardEl.addEventListener("dragover", (e) => this.handleDragOver(e));
      boardEl.addEventListener("dragenter", (e) => this.handleDragEnter(e));
      boardEl.addEventListener("dragleave", (e) => this.handleDragLeave(e));
      boardEl.addEventListener("drop", (e) => this.handleDrop(e));
      boardEl.addEventListener("dragend", () => this.handleDragEnd());
    }
  };
  var dragdrop_default = DragDrop;

  // js/i18n.js
  var dictionaries = {
    en: {
      // Header & Nav
      "nav.dashboard": "Dashboard",
      "nav.board": "Board",
      "header.lang": "ID",
      // Dashboard Toolbar
      "filter.all": "All",
      "filter.wishlist": "Wishlist",
      "filter.applied": "Applied",
      "filter.interview": "Interview",
      "filter.offer": "Offer",
      "filter.rejected": "Rejected",
      "search.placeholder": "Search company or position...",
      "action.addJob": "Add Job",
      // Stats
      "stat.total": "Total Applications",
      "stat.active": "Active Processes",
      "stat.interviews": "Interviews",
      "stat.offers": "Offers",
      "stat.thisWeek": "This Week",
      // Kanban Board
      "board.wishlist": "Wishlist",
      "board.applied": "Applied",
      "board.interview": "Interview",
      "board.offer": "Offer",
      "board.rejected": "Rejected",
      // Job List / Card
      "card.edit": "Edit",
      "card.delete": "Delete",
      "empty.title": "No applications yet",
      "empty.desc": "Your journey starts here. Add your first job application to start tracking.",
      // Modal (Add / Edit)
      "modal.addTitle": "Add New Application",
      "modal.editTitle": "Edit Application",
      "form.company": "Company Name",
      "form.position": "Position / Role",
      "form.status": "Status",
      "form.location": "Location",
      "form.salary": "Salary (Optional)",
      "form.notes": "Notes",
      "form.save": "Save Application",
      "form.cancel": "Cancel",
      // Confirm Delete
      "confirm.deleteTitle": "Delete Application?",
      "confirm.deleteDesc": "Remove {position} at {company}? This can't be undone.",
      "confirm.yes": "Delete",
      "confirm.no": "Keep it",
      // Toasts
      "toast.fillFields": "Please fill in company and position.",
      "toast.updated": "Job updated successfully.",
      "toast.added": "Job added successfully.",
      "toast.deleted": "Application removed.",
      "toast.moved": "Moved to {status}."
    },
    id: {
      // Header & Nav
      "nav.dashboard": "Dasbor",
      "nav.board": "Papan",
      "header.lang": "EN",
      // Dashboard Toolbar
      "filter.all": "Semua",
      "filter.wishlist": "Tersimpan",
      "filter.applied": "Dilamar",
      "filter.interview": "Wawancara",
      "filter.offer": "Diterima",
      "filter.rejected": "Ditolak",
      "search.placeholder": "Cari perusahaan atau posisi...",
      "action.addJob": "Tambah Pekerjaan",
      // Stats
      "stat.total": "Total Lamaran",
      "stat.active": "Proses Aktif",
      "stat.interviews": "Wawancara",
      "stat.offers": "Diterima",
      "stat.thisWeek": "Minggu Ini",
      // Kanban Board
      "board.wishlist": "Tersimpan",
      "board.applied": "Dilamar",
      "board.interview": "Wawancara",
      "board.offer": "Diterima",
      "board.rejected": "Ditolak",
      // Job List / Card
      "card.edit": "Ubah",
      "card.delete": "Hapus",
      "empty.title": "Belum ada lamaran",
      "empty.desc": "Perjalanan Anda dimulai di sini. Tambahkan lamaran pertama Anda.",
      // Modal (Add / Edit)
      "modal.addTitle": "Tambah Lamaran Baru",
      "modal.editTitle": "Ubah Lamaran",
      "form.company": "Nama Perusahaan",
      "form.position": "Posisi / Pekerjaan",
      "form.status": "Status",
      "form.location": "Lokasi",
      "form.salary": "Gaji (Opsional)",
      "form.notes": "Catatan",
      "form.save": "Simpan Lamaran",
      "form.cancel": "Batal",
      // Confirm Delete
      "confirm.deleteTitle": "Hapus Lamaran?",
      "confirm.deleteDesc": "Hapus {position} di {company}? Data tidak bisa dikembalikan.",
      "confirm.yes": "Hapus",
      "confirm.no": "Kembali",
      // Toasts
      "toast.fillFields": "Mohon isi nama perusahaan dan posisi.",
      "toast.updated": "Lamaran berhasil diperbarui.",
      "toast.added": "Lamaran berhasil ditambahkan.",
      "toast.deleted": "Lamaran dihapus.",
      "toast.moved": "Dipindah ke {status}."
    }
  };
  var I18n = class {
    constructor() {
      this.lang = "en";
    }
    setLang(lang) {
      if (dictionaries[lang]) {
        this.lang = lang;
      }
    }
    getLang() {
      return this.lang;
    }
    t(key, params = {}) {
      let str = dictionaries[this.lang][key] || dictionaries["en"][key] || key;
      for (const [k, v] of Object.entries(params)) {
        str = str.replace(`{${k}}`, v);
      }
      return str;
    }
  };
  var i18n_default = new I18n();

  // js/analytics.js
  var Analytics = {
    /** Get all hero stats */
    getHeroStats() {
      const jobs = store_default.getJobs();
      const now = /* @__PURE__ */ new Date();
      const weekAgo = new Date(now);
      weekAgo.setDate(weekAgo.getDate() - 7);
      const thisWeek = jobs.filter((j) => {
        const d = new Date(j.appliedDate);
        return d >= weekAgo;
      }).length;
      return [
        {
          label: "Total Applied",
          value: jobs.length,
          modifier: "total"
        },
        {
          label: "Interviewing",
          value: jobs.filter((j) => j.status === "interview").length,
          modifier: "blue"
        },
        {
          label: "Offers",
          value: jobs.filter((j) => j.status === "offer").length,
          modifier: "gold"
        },
        {
          label: "This Week",
          value: thisWeek,
          modifier: "indigo"
        }
      ];
    },
    /** Get count per status */
    getStatusCounts() {
      const jobs = store_default.getJobs();
      const counts = { all: jobs.length };
      STATUS_ORDER.forEach((s) => {
        counts[s] = jobs.filter((j) => j.status === s).length;
      });
      return counts;
    },
    /** Get response rate */
    getResponseRate() {
      const jobs = store_default.getJobs();
      if (jobs.length === 0) return 0;
      const responded = jobs.filter(
        (j) => j.status === "interview" || j.status === "offer" || j.status === "rejected"
      ).length;
      return Math.round(responded / jobs.length * 100);
    }
  };
  var analytics_default = Analytics;

  // js/components.js
  var ICONS = {
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
    notepad: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2v4M16 2v4M3 10h18"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01"/></svg>`
  };
  function getStatusLabel(s) {
    return i18n_default.t("board." + s) || s;
  }
  function formatDate(dateStr) {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  }
  function renderHeroStats() {
    const stats = analytics_default.getHeroStats();
    return `
    <section class="hero-stats" id="hero-stats" aria-label="Application statistics">
      ${stats.map((stat, i) => `
        <div class="stat-card ${stat.modifier ? "stat-card--" + stat.modifier : ""} animate-slide-up stagger-${i + 1}">
          <div class="stat-card__number count-up holo-text" data-target="${stat.value}">
            ${stat.value}
          </div>
          <div class="stat-card__label">${stat.label}</div>
        </div>
      `).join("")}
    </section>
  `;
  }
  function renderToolbar(activeFilter, query) {
    const counts = analytics_default.getStatusCounts();
    const filters = [
      { key: "all", label: i18n_default.t("filter.all") },
      ...STATUS_ORDER.map((s) => ({ key: s, label: getStatusLabel(s) }))
    ];
    return `
    <div class="toolbar">
      <div class="toolbar__left">
        <div class="filter-tabs" role="tablist" aria-label="Filter by status">
          ${filters.map((f) => `
            <button class="filter-tab ${activeFilter === f.key ? "is-active" : ""}"
                    data-filter="${f.key}"
                    role="tab"
                    aria-selected="${activeFilter === f.key}">
              ${f.label}<span class="filter-tab__count">${counts[f.key] || 0}</span>
            </button>
          `).join("")}
        </div>
      </div>
      <div class="toolbar__right">
        <div class="search-box">
          <span class="search-box__icon">${ICONS.search}</span>
          <input type="text"
                 class="search-box__input"
                 id="search-input"
                 placeholder="${i18n_default.t("search.placeholder")}"
                 value="${query || ""}"
                 aria-label="Search jobs" />
        </div>
        <button class="btn btn--primary" id="btn-add-job" aria-label="Add new job">
          ${ICONS.plus}
          <span>${i18n_default.t("action.addJob")}</span>
        </button>
      </div>
    </div>
  `;
  }
  function renderJourneyRail(status) {
    const stageIndex = STATUS_ORDER.indexOf(status);
    return `
    <div class="journey-rail" aria-label="Application progress">
      ${STAGE_LABELS.map((label, i) => {
      let nodeClass = "journey-rail__node";
      let lineClass = "journey-rail__line";
      if (i < stageIndex) {
        nodeClass += " journey-rail__node--completed";
        lineClass += " journey-rail__line--completed";
      } else if (i === stageIndex) {
        nodeClass += " journey-rail__node--current rail-pulse";
      } else {
        nodeClass += " journey-rail__node--upcoming";
        lineClass += " journey-rail__line--upcoming";
      }
      const segment = `
          <div class="journey-rail__segment">
            <div class="${nodeClass}" data-stage="${i}" title="${label}"></div>
            ${i < STAGE_LABELS.length - 1 ? `<div class="${lineClass}"></div>` : ""}
          </div>
        `;
      return segment;
    }).join("")}
    </div>
    <div class="journey-rail__labels">
      ${STAGE_LABELS.map((_, i) => {
      const stages = ["wishlist", "applied", "interview", "offer", "rejected"];
      return `<span class="journey-rail__label ${i === stageIndex ? "journey-rail__label--active" : ""}">${i18n_default.t("board." + stages[i])}</span>`;
    }).join("")}
    </div>
  `;
  }
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
            ${job.location ? `<span class="separator">\xB7</span><span>${job.location}</span>` : ""}
            ${job.salary ? `<span class="separator">\xB7</span><span>${job.salary}</span>` : ""}
          </div>
        </div>
        <div class="job-card__header-right">
          <button class="btn btn--icon job-card__fav ${job.favorite ? "is-active" : ""}"
                  data-action="toggle-fav" data-id="${job.id}"
                  aria-label="${job.favorite ? "Remove from favorites" : "Add to favorites"}"
                  title="${job.favorite ? "Remove from favorites" : "Add to favorites"}">
            ${job.favorite ? ICONS.starFilled : ICONS.star}
          </button>
          <div class="job-card__actions">
            ${job.url ? `
              <a href="${job.url}" target="_blank" rel="noopener noreferrer"
                 class="btn btn--icon" aria-label="Open job posting" title="Open job posting">
                ${ICONS.link}
              </a>
            ` : ""}
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
  function renderJobList(jobs) {
    if (jobs.length === 0) {
      return renderEmptyState();
    }
    return `
    <div class="job-list" id="job-list" role="list">
      ${jobs.map((job, i) => renderJobCard(job, i)).join("")}
    </div>
  `;
  }
  function renderEmptyState() {
    return `
    <div class="empty-state">
      <div class="empty-state__icon animate-float">
        ${ICONS.rocket}
      </div>
      <h3 class="empty-state__title">${i18n_default.t("empty.title")}</h3>
      <p class="empty-state__desc">${i18n_default.t("empty.desc")}</p>
      <button class="btn btn--primary" id="btn-add-job-empty">
        ${ICONS.plus} ${i18n_default.t("action.addJob")}
      </button>
    </div>
  `;
  }
  function renderKanbanBoard() {
    const jobs = store_default.getJobs();
    return `
    <div class="kanban-board" id="kanban-board">
      ${STATUS_ORDER.map((status) => {
      const columnJobs = jobs.filter((j) => j.status === status);
      return `
          <div class="kanban-column kanban-column--${status}" data-status="${status}">
            <div class="kanban-column__header">
              <span class="kanban-column__title">${getStatusLabel(status)}</span>
              <span class="kanban-column__count">${columnJobs.length}</span>
            </div>
            <div class="kanban-column__cards">
              ${columnJobs.map((job) => `
                <div class="kanban-card" draggable="true" data-id="${job.id}"
                     tabindex="0" aria-label="${job.position} at ${job.company}">
                  <div class="kanban-card__company">${job.company}</div>
                  <div class="kanban-card__position">${job.position}</div>
                  <div class="kanban-card__date">${formatDate(job.appliedDate)}</div>
                </div>
              `).join("")}
            </div>
          </div>
        `;
    }).join("")}
    </div>
  `;
  }
  function renderModal(job = null) {
    const isEdit = !!job;
    const title = isEdit ? i18n_default.t("modal.editTitle") : i18n_default.t("modal.addTitle");
    const btnText = isEdit ? i18n_default.t("form.save") : i18n_default.t("form.save");
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
          <input type="hidden" name="id" value="${isEdit ? job.id : ""}" />

          <div class="form-group">
            <label for="field-company">${ICONS.building} ${i18n_default.t("form.company")}</label>
            <input type="text" id="field-company" name="company"
                   placeholder="e.g. Gojek, Tokopedia"
                   value="${isEdit ? job.company : ""}" required />
          </div>

          <div class="form-group">
            <label for="field-position">${ICONS.briefcase} ${i18n_default.t("form.position")}</label>
            <input type="text" id="field-position" name="position"
                   placeholder="e.g. Senior Frontend Developer"
                   value="${isEdit ? job.position : ""}" required />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="field-location">${ICONS.mapPin} ${i18n_default.t("form.location")}</label>
              <input type="text" id="field-location" name="location"
                     placeholder="e.g. Jakarta, Remote"
                     value="${isEdit ? job.location : ""}" />
            </div>
            <div class="form-group">
              <label for="field-salary">${ICONS.dollar} ${i18n_default.t("form.salary")}</label>
              <input type="text" id="field-salary" name="salary"
                     placeholder="e.g. IDR 25-35M"
                     value="${isEdit ? job.salary : ""}" />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="field-status">${i18n_default.t("form.status")}</label>
              <select id="field-status" name="status">
                ${STATUS_ORDER.map((s) => `
                  <option value="${s}" ${isEdit && job.status === s ? "selected" : ""}>
                    ${getStatusLabel(s)}
                  </option>
                `).join("")}
              </select>
            </div>
            <div class="form-group">
              <label for="field-date">${ICONS.calendar} Applied Date</label>
              <input type="date" id="field-date" name="appliedDate"
                     value="${isEdit ? job.appliedDate : (/* @__PURE__ */ new Date()).toISOString().split("T")[0]}" />
            </div>
          </div>

          <div class="form-group">
            <label for="field-url">${ICONS.link} Job URL</label>
            <input type="url" id="field-url" name="url"
                   placeholder="https://..."
                   value="${isEdit ? job.url : ""}" />
          </div>

          <div class="form-group">
            <label for="field-notes">${ICONS.notepad} ${i18n_default.t("form.notes")}</label>
            <textarea id="field-notes" name="notes"
                      placeholder="...">${isEdit ? job.notes : ""}</textarea>
          </div>
        </form>

        <div class="modal__footer">
          <button class="btn btn--ghost" id="modal-cancel">${i18n_default.t("form.cancel")}</button>
          <button class="btn btn--primary" id="modal-save" type="submit" form="job-form">
            ${ICONS.check} ${btnText}
          </button>
        </div>
      </div>
    </div>
  `;
  }
  function renderToast(message, type = "success") {
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
  function renderConfirmDialog(title, message) {
    return `
    <div class="modal-overlay backdrop-enter" id="confirm-overlay">
      <div class="modal modal-enter" style="max-width: 400px;">
        <div class="confirm-dialog">
          <h3 class="confirm-dialog__title">${title}</h3>
          <p class="confirm-dialog__message">${message}</p>
          <div class="confirm-dialog__actions">
            <button class="btn btn--ghost" id="confirm-cancel">${i18n_default.t("confirm.no")}</button>
            <button class="btn btn--danger" id="confirm-yes">${i18n_default.t("confirm.yes")}</button>
          </div>
        </div>
      </div>
    </div>
  `;
  }

  // js/app.js
  var currentView = "dashboard";
  var searchQuery = "";
  var $ = (sel) => document.querySelector(sel);
  var $$ = (sel) => document.querySelectorAll(sel);
  function renderApp() {
    const mainContent = $("#main-content");
    if (!mainContent) return;
    const activeFilter = search_default.getFilter();
    const filteredJobs = search_default.getFilteredJobs();
    let viewHTML = "";
    if (currentView === "dashboard") {
      viewHTML = `
      ${renderHeroStats()}
      ${renderToolbar(activeFilter, searchQuery)}
      <div class="view is-active" id="view-dashboard">
        ${renderJobList(filteredJobs)}
      </div>
    `;
    } else if (currentView === "board") {
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
    bindDynamicEvents();
    if (currentView === "board") {
      const board = $("#kanban-board");
      if (board) {
        dragdrop_default.bindEvents(board);
      }
    }
    $$(".header__nav-btn").forEach((btn) => {
      btn.classList.toggle("is-active", btn.dataset.view === currentView);
    });
    animateCountUp();
  }
  function animateCountUp() {
    $$(".count-up").forEach((el) => {
      const target = parseInt(el.dataset.target, 10);
      if (isNaN(target)) return;
      let current = 0;
      const duration = 600;
      const step = Math.max(1, Math.floor(target / (duration / 16)));
      const startTime = performance.now();
      function tick(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        current = Math.round(target * eased);
        el.textContent = current;
        if (progress < 1) {
          requestAnimationFrame(tick);
        } else {
          el.textContent = target;
        }
      }
      el.textContent = "0";
      requestAnimationFrame(tick);
    });
  }
  function openModal(jobId = null) {
    const job = jobId ? store_default.getJob(jobId) : null;
    const modalHTML = renderModal(job);
    closeModal();
    document.body.insertAdjacentHTML("beforeend", modalHTML);
    document.body.style.overflow = "hidden";
    setTimeout(() => {
      const firstInput = $("#field-company");
      if (firstInput) firstInput.focus();
    }, 100);
    bindModalEvents();
  }
  function closeModal() {
    const overlay = $("#modal-overlay");
    if (!overlay) return;
    const modal = overlay.querySelector(".modal");
    if (modal) {
      modal.classList.remove("modal-enter");
      modal.classList.add("modal-exit");
      overlay.classList.remove("backdrop-enter");
      overlay.classList.add("backdrop-exit");
    }
    setTimeout(() => {
      overlay.remove();
      document.body.style.overflow = "";
    }, 220);
  }
  function bindModalEvents() {
    const closeBtn = $("#modal-close");
    if (closeBtn) closeBtn.addEventListener("click", closeModal);
    const cancelBtn = $("#modal-cancel");
    if (cancelBtn) cancelBtn.addEventListener("click", closeModal);
    const overlay = $("#modal-overlay");
    if (overlay) {
      overlay.addEventListener("click", (e) => {
        if (e.target === overlay) closeModal();
      });
    }
    const saveBtn = $("#modal-save");
    if (saveBtn) {
      saveBtn.addEventListener("click", (e) => {
        e.preventDefault();
        handleSaveJob();
      });
    }
    const form = $("#job-form");
    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        handleSaveJob();
      });
    }
    document.addEventListener("keydown", handleEscKey);
  }
  function handleEscKey(e) {
    if (e.key === "Escape") {
      const confirmOverlay = $("#confirm-overlay");
      if (confirmOverlay) {
        confirmOverlay.remove();
        return;
      }
      closeModal();
      document.removeEventListener("keydown", handleEscKey);
    }
  }
  function handleSaveJob() {
    const form = $("#job-form");
    if (!form) return;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    if (!data.company.trim() || !data.position.trim()) {
      showToast(i18n_default.t("toast.fillFields"), "error");
      return;
    }
    const id = data.id;
    delete data.id;
    if (id) {
      store_default.updateJob(id, data);
      showToast(i18n_default.t("toast.updated"), "success");
    } else {
      store_default.addJob(data);
      showToast(i18n_default.t("toast.added"), "success");
    }
    closeModal();
    renderApp();
  }
  function showConfirmDelete(jobId) {
    const job = store_default.getJob(jobId);
    if (!job) return;
    const html = renderConfirmDialog(
      i18n_default.t("confirm.deleteTitle"),
      i18n_default.t("confirm.deleteDesc", { position: job.position, company: job.company })
    );
    document.body.insertAdjacentHTML("beforeend", html);
    const confirmYes = $("#confirm-yes");
    const confirmCancel = $("#confirm-cancel");
    const confirmOverlay = $("#confirm-overlay");
    if (confirmYes) {
      confirmYes.addEventListener("click", () => {
        store_default.deleteJob(jobId);
        confirmOverlay.remove();
        showToast(i18n_default.t("toast.deleted"), "info");
        renderApp();
      });
    }
    if (confirmCancel) {
      confirmCancel.addEventListener("click", () => {
        confirmOverlay.remove();
      });
    }
    if (confirmOverlay) {
      confirmOverlay.addEventListener("click", (e) => {
        if (e.target === confirmOverlay) confirmOverlay.remove();
      });
    }
  }
  function showToast(message, type = "success") {
    const container = $("#toast-container");
    if (!container) return;
    const toastHTML = renderToast(message, type);
    container.insertAdjacentHTML("beforeend", toastHTML);
    const toast = container.lastElementChild;
    const closeBtn = toast.querySelector(".toast__close");
    if (closeBtn) {
      closeBtn.addEventListener("click", () => dismissToast(toast));
    }
    setTimeout(() => dismissToast(toast), 3500);
  }
  function dismissToast(toast) {
    if (!toast || !toast.parentNode) return;
    toast.classList.remove("toast-enter");
    toast.classList.add("toast-exit");
    setTimeout(() => {
      if (toast.parentNode) toast.remove();
    }, 260);
  }
  function bindDynamicEvents() {
    const addBtns = $$("#btn-add-job, #btn-add-job-empty");
    addBtns.forEach((btn) => {
      btn.addEventListener("click", () => openModal());
    });
    $$(".filter-tab").forEach((tab) => {
      tab.addEventListener("click", () => {
        const filter = tab.dataset.filter;
        search_default.setFilter(filter);
        renderApp();
      });
    });
    const searchInput = $("#search-input");
    if (searchInput) {
      let debounceTimer;
      searchInput.addEventListener("input", (e) => {
        clearTimeout(debounceTimer);
        searchQuery = e.target.value;
        debounceTimer = setTimeout(() => {
          search_default.setQuery(searchQuery);
          const filteredJobs = search_default.getFilteredJobs();
          const listContainer = $("#view-dashboard");
          if (listContainer) {
            listContainer.innerHTML = renderJobList(filteredJobs).trim();
            bindCardEvents();
          }
        }, 250);
      });
    }
    bindCardEvents();
  }
  function bindCardEvents() {
    const jobList = $("#job-list");
    if (jobList) {
      jobList.addEventListener("click", handleCardClick);
    }
    $$(".kanban-card").forEach((card) => {
      card.addEventListener("click", (e) => {
        if (e.target.closest("button")) return;
        openModal(card.dataset.id);
      });
    });
  }
  function handleCardClick(e) {
    const btn = e.target.closest("[data-action]");
    if (btn) {
      e.stopPropagation();
      const action = btn.dataset.action;
      const id = btn.dataset.id;
      switch (action) {
        case "toggle-fav":
          btn.classList.add("star-pop");
          store_default.toggleFavorite(id);
          setTimeout(() => renderApp(), 400);
          break;
        case "edit-job":
          openModal(id);
          break;
        case "delete-job":
          showConfirmDelete(id);
          break;
      }
      return;
    }
    const card = e.target.closest(".job-card");
    if (card && !e.target.closest("a")) {
      openModal(card.dataset.id);
    }
  }
  function bindNavEvents() {
    $$(".header__nav-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        currentView = btn.dataset.view;
        store_default.updateSettings({ view: currentView });
        renderApp();
      });
    });
    const btnTheme = $("#btn-theme-toggle");
    if (btnTheme) {
      btnTheme.addEventListener("click", () => {
        const currentTheme = document.documentElement.getAttribute("data-theme") || "dark";
        const newTheme = currentTheme === "dark" ? "light" : "dark";
        document.documentElement.setAttribute("data-theme", newTheme);
        store_default.updateSettings({ theme: newTheme });
      });
    }
    const btnLang = $("#btn-lang-toggle");
    if (btnLang) {
      btnLang.addEventListener("click", () => {
        const currentLang = i18n_default.getLang();
        const newLang = currentLang === "en" ? "id" : "en";
        i18n_default.setLang(newLang);
        store_default.updateSettings({ lang: newLang });
        updateStaticText();
        renderApp();
      });
    }
  }
  function updateStaticText() {
    const btnLang = $("#btn-lang-toggle");
    if (btnLang) btnLang.textContent = i18n_default.t("header.lang");
    $$("[data-i18n]").forEach((el) => {
      el.textContent = i18n_default.t(el.dataset.i18n);
    });
  }
  function handleDragDrop(jobId, newStatus) {
    showToast(i18n_default.t("toast.moved", { status: getStatusLabel(newStatus) }), "success");
    renderApp();
  }
  function init() {
    const settings = store_default.getSettings();
    currentView = settings.view || "dashboard";
    search_default.setFilter(settings.filter || "all");
    const theme = settings.theme || "dark";
    document.documentElement.setAttribute("data-theme", theme);
    const lang = settings.lang || "en";
    i18n_default.setLang(lang);
    updateStaticText();
    store_default.loadSampleData();
    dragdrop_default.init(handleDragDrop);
    bindNavEvents();
    store_default.subscribe(() => {
    });
    renderApp();
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
