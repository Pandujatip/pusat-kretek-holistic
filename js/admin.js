/**
 * SATRIA DIGITAL - ADMIN DASHBOARD JAVASCRIPT
 * Otorisasi, CRUD Terapis, Upload Foto, & Real-time UI
 */

const API_BASE = window.location.pathname.startsWith('/pusat-kretek-holistic')
  ? '/pusat-kretek-holistic/api'
  : '/api';

const TOKEN_KEY = 'satria_admin_token';
let therapistsState = [];
let deleteCandidateId = null;

// ==========================================
// 1. AUTHENTICATION & SESSION
// ==========================================

function getAuthToken() {
  return localStorage.getItem(TOKEN_KEY) || '';
}

function setAuthToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

function clearAuthToken() {
  localStorage.removeItem(TOKEN_KEY);
}

function authHeaders() {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
}

async function verifySession() {
  const token = getAuthToken();
  if (!token) {
    showLoginScreen();
    return false;
  }

  try {
    const res = await fetch(`${API_BASE}/auth/verify`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) {
      showDashboardScreen();
      loadTherapists();
      return true;
    } else {
      clearAuthToken();
      showLoginScreen();
      return false;
    }
  } catch (err) {
    console.warn('Session verification fallback, showing dashboard if token exists:', err);
    showDashboardScreen();
    loadTherapists();
    return true;
  }
}

function showLoginScreen() {
  document.getElementById('loginScreen').classList.remove('hidden');
  document.getElementById('dashboardScreen').classList.add('hidden');
}

function showDashboardScreen() {
  document.getElementById('loginScreen').classList.add('hidden');
  document.getElementById('dashboardScreen').classList.remove('hidden');
}

// Login Form Submit
document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const alertEl = document.getElementById('loginAlert');
  const alertText = document.getElementById('loginAlertText');
  const submitBtn = document.getElementById('loginSubmitBtn');
  const btnText = submitBtn.querySelector('.btn-text');
  const btnSpinner = submitBtn.querySelector('.btn-spinner');

  alertEl.classList.add('hidden');
  btnText.classList.add('hidden');
  btnSpinner.classList.remove('hidden');
  submitBtn.disabled = true;

  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();

  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();
    if (res.ok && data.success) {
      setAuthToken(data.token);
      showToast('Selamat datang, Admin SATRIA!', 'success');
      showDashboardScreen();
      loadTherapists();
    } else {
      alertText.textContent = data.message || 'Username atau password tidak cocok!';
      alertEl.classList.remove('hidden');
    }
  } catch (err) {
    alertText.textContent = 'Gagal menghubungi server API: ' + err.message;
    alertEl.classList.remove('hidden');
  } finally {
    btnText.classList.remove('hidden');
    btnSpinner.classList.add('hidden');
    submitBtn.disabled = false;
  }
});

// Toggle Password
document.getElementById('togglePasswordBtn').addEventListener('click', () => {
  const input = document.getElementById('password');
  const icon = document.querySelector('#togglePasswordBtn i');
  if (input.type === 'password') {
    input.type = 'text';
    icon.classList.remove('fa-eye');
    icon.classList.add('fa-eye-slash');
  } else {
    input.type = 'password';
    icon.classList.remove('fa-eye-slash');
    icon.classList.add('fa-eye');
  }
});

// Logout
document.getElementById('logoutBtn').addEventListener('click', () => {
  clearAuthToken();
  showToast('Anda telah keluar dari panel admin.', 'info');
  showLoginScreen();
});

// ==========================================
// 2. DATA MANAGEMENT (CRUD)
// ==========================================

async function loadTherapists() {
  const container = document.getElementById('therapistsList');
  const emptyState = document.getElementById('emptyState');
  container.innerHTML = '<div class="text-muted" style="grid-column: 1/-1; text-align:center; padding: 2rem;"><i class="fa-solid fa-spinner fa-spin fa-2x"></i><br><br>Memuat data direktori terapis...</div>';

  try {
    const res = await fetch(`${API_BASE}/therapists?v=${Date.now()}`);
    if (!res.ok) throw new Error('Gagal mengambil data terapis');
    
    therapistsState = await res.json();
    renderTherapists(therapistsState);
    updateStats(therapistsState);
  } catch (err) {
    console.error('Fetch error:', err);
    container.innerHTML = `<div class="alert-box error" style="grid-column: 1/-1;">Gagal memuat data: ${err.message}. Pastikan server aktif.</div>`;
  }
}

function updateStats(list) {
  document.getElementById('statTotalCount').textContent = `${list.length} Terapis`;
  const cities = new Set(list.map(t => (t.city || '').trim()).filter(Boolean));
  document.getElementById('statCitiesCount').textContent = `${cities.size} Kota`;
}

function renderTherapists(list) {
  const container = document.getElementById('therapistsList');
  const emptyState = document.getElementById('emptyState');

  if (!list || list.length === 0) {
    container.innerHTML = '';
    emptyState.classList.remove('hidden');
    return;
  }

  emptyState.classList.add('hidden');
  container.innerHTML = list.map(t => {
    const categoryBadges = (t.categoryTags || []).map(cat => {
      const labels = {
        'kretek': 'Pijat Kretek',
        'sport-massage': 'Sport Massage',
        'akupunktur': 'Akupunktur',
        'bekam': 'Bekam',
        'bio-elektrik': 'Bio Elektrik'
      };
      return `<span class="t-tag active">${labels[cat] || cat}</span>`;
    }).join(' ');

    const complaintsExcerpt = (t.complaintsTreated || []).slice(0, 3).join(', ');
    const moreComplaints = (t.complaintsTreated || []).length > 3 
      ? ` +${(t.complaintsTreated || []).length - 3} lainnya` 
      : '';

    return `
      <div class="therapist-card" data-id="${t.id}">
        <div class="t-card-header">
          <img src="${t.avatar || 'public/images/logo-satria.png'}" alt="${t.brand}" class="t-avatar" onerror="this.src='public/images/logo-satria.png'">
          <div class="t-header-info">
            <h4 class="t-brand" title="${t.brand}">${t.brand}</h4>
            <div class="t-practitioner">
              <i class="fa-solid fa-user-check text-green"></i> ${t.practitioner}
            </div>
            <div class="t-location">
              <i class="fa-solid fa-location-dot"></i> ${t.city || 'Indonesia'}
            </div>
          </div>
        </div>

        <div class="t-card-body">
          <div class="t-meta-row">
            <span class="t-meta-label">WhatsApp / HP</span>
            <span class="t-meta-value">
              <a href="https://wa.me/${t.waNumber || ''}" target="_blank" class="text-green" style="text-decoration:none;">
                <i class="fa-brands fa-whatsapp"></i> ${t.phone || '-'}
              </a>
            </span>
          </div>

          <div class="t-meta-row">
            <span class="t-meta-label">Tarif Sesi</span>
            <span class="t-meta-value">${t.priceRange || 'Hubungi Terapis'}</span>
          </div>

          <div>
            <span class="t-meta-label" style="display:block; margin-bottom: 0.35rem;">Kategori Terapi</span>
            <div class="t-tags">
              ${categoryBadges || '<span class="t-tag">Umum</span>'}
            </div>
          </div>

          ${t.complaintsTreated && t.complaintsTreated.length > 0 ? `
            <div>
              <span class="t-meta-label" style="display:block; margin-bottom: 0.2rem;">Penanganan Keluhan</span>
              <p style="font-size: 0.775rem; color: var(--text-muted); line-height: 1.35;">
                ${complaintsExcerpt}${moreComplaints}
              </p>
            </div>
          ` : ''}
        </div>

        <div class="t-card-footer">
          <div class="t-actions-left">
            <button class="btn btn-sm btn-outline edit-btn" onclick="openEditModal('${t.id}')">
              <i class="fa-solid fa-pen-to-square"></i> Edit
            </button>
            <a href="${t.mapsUrl || '#'}" target="_blank" class="btn btn-sm btn-secondary" title="Buka Google Maps">
              <i class="fa-solid fa-map-pin"></i> Maps
            </a>
          </div>
          <button class="btn btn-sm btn-danger-outline delete-btn" onclick="openDeleteModal('${t.id}', '${t.brand.replace(/'/g, "\'")}')" title="Hapus profil terapis">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
      </div>
    `;
  }).join('');
}

// Search Filter
document.getElementById('searchInput').addEventListener('input', (e) => {
  const query = e.target.value.toLowerCase().trim();
  if (!query) {
    renderTherapists(therapistsState);
    return;
  }

  const filtered = therapistsState.filter(t => {
    const brand = (t.brand || '').toLowerCase();
    const practitioner = (t.practitioner || '').toLowerCase();
    const city = (t.city || '').toLowerCase();
    const address = (t.address || '').toLowerCase();
    const complaints = (t.complaintsTreated || []).join(' ').toLowerCase();
    return brand.includes(query) || practitioner.includes(query) || city.includes(query) || address.includes(query) || complaints.includes(query);
  });

  renderTherapists(filtered);
});

// Refresh Button
document.getElementById('refreshBtn').addEventListener('click', () => {
  loadTherapists();
  showToast('Data diperbarui dari server.', 'info');
});

// ==========================================
// 3. ADD & EDIT MODAL
// ==========================================

const modal = document.getElementById('therapistModal');
const modalTitle = document.getElementById('modalTitle');
const therapistForm = document.getElementById('therapistForm');
const editIdInput = document.getElementById('editTherapistId');
const servicesContainer = document.getElementById('servicesContainer');

function openAddModal() {
  therapistForm.reset();
  editIdInput.value = '';
  modalTitle.innerHTML = '<i class="fa-solid fa-plus-circle"></i> Tambah Profil Terapis Baru';
  document.getElementById('fAssociation').value = 'SATRIA • Seduluran Terapis Recovery Indonesia';
  document.getElementById('avatarPreview').src = 'public/images/logo-satria.png';
  document.getElementById('fAvatar').value = '';
  servicesContainer.innerHTML = '';
  
  // Default default service items
  addServiceItemRow('🦴 Manual Terapi Reposisi Tulang Otot Sendi', 'Penyesuaian biomekanika sendi dan pelepasan syaraf terjepit.');
  addServiceItemRow('🏃 Recovery Sport Injury & Pijat Holistik', 'Penanganan cedera olahraga dan relaksasi ketegangan otot dalam.');

  modal.classList.remove('hidden');
}

function openEditModal(id) {
  const t = therapistsState.find(item => item.id === id);
  if (!t) return;

  editIdInput.value = t.id;
  modalTitle.innerHTML = `<i class="fa-solid fa-pen-to-square"></i> Edit Profil: ${t.brand}`;

  document.getElementById('fBrand').value = t.brand || '';
  document.getElementById('fPractitioner').value = t.practitioner || '';
  document.getElementById('fShortCode').value = t.shortCode || '';
  document.getElementById('fAssociation').value = t.association || 'SATRIA • Seduluran Terapis Recovery Indonesia';
  document.getElementById('fMotto').value = t.motto || '';
  document.getElementById('fOverview').value = t.overview || '';
  
  document.getElementById('fAvatar').value = t.avatar || '';
  document.getElementById('avatarPreview').src = t.avatar || 'public/images/logo-satria.png';

  document.getElementById('fPhone').value = t.phone || '';
  document.getElementById('fCity').value = t.city || '';
  document.getElementById('fDistrict').value = t.district || '';
  document.getElementById('fProvince').value = t.province || '';
  document.getElementById('fAddress').value = t.address || '';
  document.getElementById('fLandmark').value = t.landmark || '';
  document.getElementById('fMapsUrl').value = t.mapsUrl || '';

  document.getElementById('fPriceRange').value = t.priceRange || '';
  document.getElementById('fPriceNote').value = t.priceNote || '';

  // Categories
  const catBoxes = document.querySelectorAll('input[name="categories"]');
  const activeTags = t.categoryTags || [];
  catBoxes.forEach(box => {
    box.checked = activeTags.includes(box.value);
  });

  // Complaints
  document.getElementById('fComplaints').value = (t.complaintsTreated || []).join(', ');

  // Services
  servicesContainer.innerHTML = '';
  if (t.servicesDetailed && t.servicesDetailed.length > 0) {
    t.servicesDetailed.forEach(s => addServiceItemRow(s.title, s.desc));
  } else {
    addServiceItemRow('', '');
  }

  modal.classList.remove('hidden');
}

function closeModal() {
  modal.classList.add('hidden');
}

document.getElementById('openAddModalBtn').addEventListener('click', openAddModal);
document.getElementById('closeModalBtn').addEventListener('click', closeModal);
document.getElementById('cancelModalBtn').addEventListener('click', closeModal);

// Dynamic Service Item
function addServiceItemRow(title = '', desc = '') {
  const row = document.createElement('div');
  row.className = 'service-item-row';
  row.innerHTML = `
    <div class="service-item-inputs">
      <input type="text" class="form-control s-title" placeholder="Nama Layanan (Contoh: Cupping / Bekam Higienis)" value="${escapeHtml(title)}">
      <input type="text" class="form-control s-desc" placeholder="Penjelasan singkat layanan..." value="${escapeHtml(desc)}">
    </div>
    <button type="button" class="remove-service-btn" title="Hapus baris ini">
      <i class="fa-solid fa-circle-xmark"></i>
    </button>
  `;

  row.querySelector('.remove-service-btn').addEventListener('click', () => {
    row.remove();
  });

  servicesContainer.appendChild(row);
}

document.getElementById('addServiceItemBtn').addEventListener('click', () => {
  addServiceItemRow('', '');
});

// Photo Upload via Base64 to Server
document.getElementById('avatarFileInput').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  if (file.size > 10 * 1024 * 1024) {
    showToast('Ukuran foto maksimal 10MB!', 'error');
    return;
  }

  const reader = new FileReader();
  reader.onload = async () => {
    const base64Data = reader.result;
    document.getElementById('avatarPreview').src = base64Data;
    showToast('Mengunggah foto ke server...', 'info');

    try {
      const res = await fetch(`${API_BASE}/upload`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          filename: file.name,
          base64Data: base64Data
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        document.getElementById('fAvatar').value = data.url;
        showToast('Foto berhasil diunggah dan disimpan!', 'success');
      } else {
        showToast('Upload gagal: ' + (data.message || 'Terjadi kesalahan'), 'error');
      }
    } catch (err) {
      showToast('Gagal mengunggah foto: ' + err.message, 'error');
    }
  };
  reader.readAsDataURL(file);
});

// Live preview when URL input changes
document.getElementById('fAvatar').addEventListener('input', (e) => {
  const val = e.target.value.trim();
  if (val) {
    document.getElementById('avatarPreview').src = val;
  }
});

// Save Form Submit
therapistForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const submitBtn = document.getElementById('saveTherapistBtn');
  const btnText = submitBtn.querySelector('.btn-text');
  const btnSpinner = submitBtn.querySelector('.btn-spinner');

  btnText.classList.add('hidden');
  btnSpinner.classList.remove('hidden');
  submitBtn.disabled = true;

  try {
    const id = editIdInput.value.trim();
    const isEdit = Boolean(id);

    // Collect Categories
    const categoryTags = [];
    document.querySelectorAll('input[name="categories"]:checked').forEach(box => {
      categoryTags.push(box.value);
    });

    // Collect Complaints
    const rawComplaints = document.getElementById('fComplaints').value;
    const complaintsTreated = rawComplaints
      .split(/[,\n]+/)
      .map(c => c.trim())
      .filter(Boolean);

    // Collect Services Detailed
    const servicesDetailed = [];
    document.querySelectorAll('.service-item-row').forEach(row => {
      const title = row.querySelector('.s-title').value.trim();
      const desc = row.querySelector('.s-desc').value.trim();
      if (title) {
        servicesDetailed.push({ title, desc });
      }
    });

    const payload = {
      brand: document.getElementById('fBrand').value.trim(),
      practitioner: document.getElementById('fPractitioner').value.trim(),
      shortCode: document.getElementById('fShortCode').value.trim(),
      association: document.getElementById('fAssociation').value.trim(),
      motto: document.getElementById('fMotto').value.trim(),
      overview: document.getElementById('fOverview').value.trim(),
      avatar: document.getElementById('fAvatar').value.trim() || 'public/images/logo-satria.png',
      phone: document.getElementById('fPhone').value.trim(),
      city: document.getElementById('fCity').value.trim(),
      district: document.getElementById('fDistrict').value.trim(),
      province: document.getElementById('fProvince').value.trim(),
      address: document.getElementById('fAddress').value.trim(),
      landmark: document.getElementById('fLandmark').value.trim(),
      mapsUrl: document.getElementById('fMapsUrl').value.trim(),
      priceRange: document.getElementById('fPriceRange').value.trim(),
      priceNote: document.getElementById('fPriceNote').value.trim(),
      categoryTags,
      complaintsTreated,
      servicesDetailed
    };

    const url = isEdit ? `${API_BASE}/therapists/${id}` : `${API_BASE}/therapists`;
    const method = isEdit ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: authHeaders(),
      body: JSON.stringify(payload)
    });

    const resData = await res.json();
    if (res.ok && resData.success) {
      showToast(isEdit ? 'Profil berhasil diperbarui!' : 'Profil terapis baru berhasil ditambahkan!', 'success');
      closeModal();
      loadTherapists();
    } else {
      showToast('Gagal menyimpan: ' + (resData.message || 'Error tidak diketahui'), 'error');
    }
  } catch (err) {
    showToast('Terjadi kesalahan koneksi: ' + err.message, 'error');
  } finally {
    btnText.classList.remove('hidden');
    btnSpinner.classList.add('hidden');
    submitBtn.disabled = false;
  }
});

// ==========================================
// 4. DELETE MODAL
// ==========================================

const deleteModal = document.getElementById('deleteModal');

function openDeleteModal(id, brandName) {
  deleteCandidateId = id;
  document.getElementById('deleteTargetName').textContent = brandName;
  deleteModal.classList.remove('hidden');
}

function closeDeleteModal() {
  deleteCandidateId = null;
  deleteModal.classList.add('hidden');
}

document.getElementById('closeDeleteModalBtn').addEventListener('click', closeDeleteModal);
document.getElementById('cancelDeleteBtn').addEventListener('click', closeDeleteModal);

document.getElementById('confirmDeleteBtn').addEventListener('click', async () => {
  if (!deleteCandidateId) return;

  const btn = document.getElementById('confirmDeleteBtn');
  btn.disabled = true;
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Menghapus...';

  try {
    const res = await fetch(`${API_BASE}/therapists/${deleteCandidateId}`, {
      method: 'DELETE',
      headers: authHeaders()
    });

    const resData = await res.json();
    if (res.ok && resData.success) {
      showToast('Profil terapis berhasil dihapus.', 'success');
      closeDeleteModal();
      loadTherapists();
    } else {
      showToast('Gagal menghapus: ' + (resData.message || 'Error'), 'error');
    }
  } catch (err) {
    showToast('Terjadi kesalahan: ' + err.message, 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<i class="fa-solid fa-trash"></i> Ya, Hapus Terapis';
  }
});

// ==========================================
// 5. HELPER UTILITIES
// ==========================================

function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  const icon = type === 'success' 
    ? '<i class="fa-solid fa-circle-check text-green"></i>' 
    : type === 'error' 
      ? '<i class="fa-solid fa-circle-xmark text-danger"></i>' 
      : '<i class="fa-solid fa-circle-info"></i>';

  toast.innerHTML = `${icon} <span>${escapeHtml(message)}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  verifySession();
});
