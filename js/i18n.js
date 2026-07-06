const dictionaries = {
  en: {
    // Header & Nav
    'nav.dashboard': 'Dashboard',
    'nav.board': 'Board',
    'header.lang': 'ID',
    
    // Dashboard Toolbar
    'filter.all': 'All',
    'filter.wishlist': 'Wishlist',
    'filter.applied': 'Applied',
    'filter.interview': 'Interview',
    'filter.offer': 'Offer',
    'filter.rejected': 'Rejected',
    'search.placeholder': 'Search company or position...',
    'action.addJob': 'Add Job',
    
    // Stats
    'stat.total': 'Total Applications',
    'stat.active': 'Active Processes',
    'stat.interviews': 'Interviews',
    'stat.offers': 'Offers',
    'stat.thisWeek': 'This Week',
    
    // Kanban Board
    'board.wishlist': 'Wishlist',
    'board.applied': 'Applied',
    'board.interview': 'Interview',
    'board.offer': 'Offer',
    'board.rejected': 'Rejected',
    
    // Job List / Card
    'card.edit': 'Edit',
    'card.delete': 'Delete',
    'empty.title': 'No applications yet',
    'empty.desc': 'Your journey starts here. Add your first job application to start tracking.',
    
    // Modal (Add / Edit)
    'modal.addTitle': 'Add New Application',
    'modal.editTitle': 'Edit Application',
    'form.company': 'Company Name',
    'form.position': 'Position / Role',
    'form.status': 'Status',
    'form.location': 'Location',
    'form.salary': 'Salary (Optional)',
    'form.notes': 'Notes',
    'form.save': 'Save Application',
    'form.cancel': 'Cancel',
    
    // Confirm Delete
    'confirm.deleteTitle': 'Delete Application?',
    'confirm.deleteDesc': 'Remove {position} at {company}? This can\'t be undone.',
    'confirm.yes': 'Delete',
    'confirm.no': 'Keep it',
    
    // Toasts
    'toast.fillFields': 'Please fill in company and position.',
    'toast.updated': 'Job updated successfully.',
    'toast.added': 'Job added successfully.',
    'toast.deleted': 'Application removed.',
    'toast.moved': 'Moved to {status}.'
  },
  id: {
    // Header & Nav
    'nav.dashboard': 'Dasbor',
    'nav.board': 'Papan',
    'header.lang': 'EN',
    
    // Dashboard Toolbar
    'filter.all': 'Semua',
    'filter.wishlist': 'Tersimpan',
    'filter.applied': 'Dilamar',
    'filter.interview': 'Wawancara',
    'filter.offer': 'Diterima',
    'filter.rejected': 'Ditolak',
    'search.placeholder': 'Cari perusahaan atau posisi...',
    'action.addJob': 'Tambah Pekerjaan',
    
    // Stats
    'stat.total': 'Total Lamaran',
    'stat.active': 'Proses Aktif',
    'stat.interviews': 'Wawancara',
    'stat.offers': 'Diterima',
    'stat.thisWeek': 'Minggu Ini',
    
    // Kanban Board
    'board.wishlist': 'Tersimpan',
    'board.applied': 'Dilamar',
    'board.interview': 'Wawancara',
    'board.offer': 'Diterima',
    'board.rejected': 'Ditolak',
    
    // Job List / Card
    'card.edit': 'Ubah',
    'card.delete': 'Hapus',
    'empty.title': 'Belum ada lamaran',
    'empty.desc': 'Perjalanan Anda dimulai di sini. Tambahkan lamaran pertama Anda.',
    
    // Modal (Add / Edit)
    'modal.addTitle': 'Tambah Lamaran Baru',
    'modal.editTitle': 'Ubah Lamaran',
    'form.company': 'Nama Perusahaan',
    'form.position': 'Posisi / Pekerjaan',
    'form.status': 'Status',
    'form.location': 'Lokasi',
    'form.salary': 'Gaji (Opsional)',
    'form.notes': 'Catatan',
    'form.save': 'Simpan Lamaran',
    'form.cancel': 'Batal',
    
    // Confirm Delete
    'confirm.deleteTitle': 'Hapus Lamaran?',
    'confirm.deleteDesc': 'Hapus {position} di {company}? Data tidak bisa dikembalikan.',
    'confirm.yes': 'Hapus',
    'confirm.no': 'Kembali',
    
    // Toasts
    'toast.fillFields': 'Mohon isi nama perusahaan dan posisi.',
    'toast.updated': 'Lamaran berhasil diperbarui.',
    'toast.added': 'Lamaran berhasil ditambahkan.',
    'toast.deleted': 'Lamaran dihapus.',
    'toast.moved': 'Dipindah ke {status}.'
  }
};

class I18n {
  constructor() {
    this.lang = 'en'; // default
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
    let str = dictionaries[this.lang][key] || dictionaries['en'][key] || key;
    for (const [k, v] of Object.entries(params)) {
      str = str.replace(`{${k}}`, v);
    }
    return str;
  }
}

export default new I18n();
