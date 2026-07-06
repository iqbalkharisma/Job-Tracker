/**
 * search.js — Filter, Search & Sort
 */

import Store from './store.js';

const Search = {
  _query: '',
  _filter: 'all',
  _sortBy: 'lastUpdate',
  _sortDir: 'desc',

  /** Set search query */
  setQuery(q) {
    this._query = q.toLowerCase().trim();
  },

  /** Set status filter */
  setFilter(status) {
    this._filter = status;
    Store.updateSettings({ filter: status });
  },

  /** Set sort */
  setSort(by, dir) {
    this._sortBy = by;
    this._sortDir = dir || 'desc';
  },

  /** Toggle sort direction */
  toggleSortDir() {
    this._sortDir = this._sortDir === 'desc' ? 'asc' : 'desc';
  },

  /** Get current filter */
  getFilter() {
    return this._filter;
  },

  /** Apply all filters and return matching jobs */
  getFilteredJobs() {
    let jobs = Store.getJobs();

    // Status filter
    if (this._filter !== 'all') {
      jobs = jobs.filter(j => j.status === this._filter);
    }

    // Search query
    if (this._query) {
      jobs = jobs.filter(j =>
        j.company.toLowerCase().includes(this._query) ||
        j.position.toLowerCase().includes(this._query) ||
        j.location.toLowerCase().includes(this._query) ||
        j.notes.toLowerCase().includes(this._query)
      );
    }

    // Sort
    jobs = [...jobs].sort((a, b) => {
      let valA, valB;

      switch (this._sortBy) {
        case 'company':
          valA = a.company.toLowerCase();
          valB = b.company.toLowerCase();
          return this._sortDir === 'asc'
            ? valA.localeCompare(valB)
            : valB.localeCompare(valA);

        case 'appliedDate':
          valA = new Date(a.appliedDate).getTime();
          valB = new Date(b.appliedDate).getTime();
          break;

        case 'lastUpdate':
        default:
          valA = new Date(a.lastUpdate).getTime();
          valB = new Date(b.lastUpdate).getTime();
          break;
      }

      return this._sortDir === 'asc' ? valA - valB : valB - valA;
    });

    return jobs;
  }
};

export default Search;
