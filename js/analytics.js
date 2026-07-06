/**
 * analytics.js — Statistics Calculator
 * Computes summary stats for the hero bar
 */

import Store, { STATUS_ORDER } from './store.js';

const Analytics = {
  /** Get all hero stats */
  getHeroStats() {
    const jobs = Store.getJobs();
    const now = new Date();
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const thisWeek = jobs.filter(j => {
      const d = new Date(j.appliedDate);
      return d >= weekAgo;
    }).length;

    return [
      {
        label: 'Total Applied',
        value: jobs.length,
        modifier: 'total'
      },
      {
        label: 'Interviewing',
        value: jobs.filter(j => j.status === 'interview').length,
        modifier: 'blue'
      },
      {
        label: 'Offers',
        value: jobs.filter(j => j.status === 'offer').length,
        modifier: 'gold'
      },
      {
        label: 'This Week',
        value: thisWeek,
        modifier: 'indigo'
      }
    ];
  },

  /** Get count per status */
  getStatusCounts() {
    const jobs = Store.getJobs();
    const counts = { all: jobs.length };
    STATUS_ORDER.forEach(s => {
      counts[s] = jobs.filter(j => j.status === s).length;
    });
    return counts;
  },

  /** Get response rate */
  getResponseRate() {
    const jobs = Store.getJobs();
    if (jobs.length === 0) return 0;
    const responded = jobs.filter(j =>
      j.status === 'interview' || j.status === 'offer' || j.status === 'rejected'
    ).length;
    return Math.round((responded / jobs.length) * 100);
  }
};

export default Analytics;
