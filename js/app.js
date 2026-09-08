/**
 * SentraKretek.id - Application Engine
 * Manages compact therapist directory, category filtering, city chips,
 * instant live search, full detailed modal rendering on click,
 * and robust real-time synchronization from Admin Panel / REST API.
 */

document.addEventListener('DOMContentLoaded', () => {
  const therapistsGrid = document.getElementById('therapistsGrid');
  const searchInput = document.getElementById('therapistSearch');
  const btnClearSearch = document.getElementById('btnClearSearch');
  const resultsCount = document.getElementById('resultsCount');
  const catButtons = document.querySelectorAll('.cat-col-btn');
  const cityChipsWrap = document.querySelector('.city-chips-wrap');

  let activeCategory = 'all';
  let activeCity = 'all';
  let searchQuery = '';

  // -------------------------------------------------------------
  // 0. Data Normalizer (Defensive Guarantee)
  // -------------------------------------------------------------
  const catNames = {
    'kretek': 'Pijat Kretek / Reposisi',
    'sport-massage': 'Sport Massage & Recovery',
    'akupunktur': 'Akupunktur Medis',
    'bekam': 'Bekam Medis Higienis',
    'bio-elektrik': 'Bio Elektrik'
  };

  function normalizeTherapist(raw) {
    if (!raw) return null;
    const t = { ...raw };

    t.id = t.id || 'terapis-' + Date.now();
    t.brand = t.brand || 'Tempat Terapi SATRIA';
    t.practitioner = t.practitioner || 'Praktisi SATRIA';
    t.city = t.city || 'Indonesia';
    t.district = t.district || '';
    t.province = t.province || '';
    t.address = t.address || t.city;
    t.landmark = t.landmark || t.address || '-';
    t.phone = t.phone || '-';
    t.waNumber = t.waNumber || (t.phone ? t.phone.replace(/[^0-9]/g, '') : '');
    if (t.waNumber.startsWith('0')) {
      t.waNumber = '62' + t.waNumber.slice(1);
    }
    t.mapsUrl = t.mapsUrl || `https://maps.google.com/?q=${encodeURIComponent(t.brand + ' ' + t.city)}`;
    t.avatar = t.avatar || 'public/images/logo-satria.png';
    t.association = t.association || 'SATRIA • Seduluran Terapis Recovery Indonesia';
    t.shortCode = t.shortCode || (t.brand ? t.brand.replace(/[^A-Za-z0-9]/g, '').slice(0, 4).toUpperCase() : 'STR') || 'STR';
    t.regionKey = (t.regionKey || t.city || '').toLowerCase().replace(/[^a-z0-9]/g, '');

    t.priceRange = t.priceRange || 'Hubungi Terapis';
    t.priceNote = t.priceNote || 'Sesuai konsultasi awal & kondisi pasien';
    t.operatingHours = t.operatingHours || 'Sesuai Reservasi Janji Temu WhatsApp';
    t.motto = t.motto || 'Seduluran dalam kebersamaan, profesional dalam pelayanan.';
    t.overview = t.overview || `${t.brand} melayani penanganan keluhan tulang, sendi, dan pemulihan holistik terpercaya anggota SATRIA.`;

    t.categoryTags = Array.isArray(t.categoryTags) && t.categoryTags.length > 0 ? t.categoryTags : ['kretek'];

    // Primary Specialties
    if (!Array.isArray(t.primarySpecialties) || t.primarySpecialties.length === 0) {
      if (Array.isArray(t.servicesDetailed) && t.servicesDetailed.length > 0) {
        t.primarySpecialties = t.servicesDetailed
          .map(s => (s.title || '').replace(/^[^\w\s]+/, '').trim())
          .filter(Boolean)
          .slice(0, 4);
      } else {
        t.primarySpecialties = t.categoryTags.map(c => catNames[c] || c).slice(0, 4);
      }
    }
    if (t.primarySpecialties.length === 0) {
      t.primarySpecialties = ['Terapi Reposisi', 'Pijat Holistik'];
    }

    // Complaints Detailed
    if (!Array.isArray(t.complaintsDetailed) || t.complaintsDetailed.length === 0) {
      if (Array.isArray(t.complaintsTreated) && t.complaintsTreated.length > 0) {
        t.complaintsDetailed = t.complaintsTreated;
      } else {
        t.complaintsDetailed = ['Postural Problem', 'Gangguan Persendian', 'Syaraf Terjepit', 'Kaku Otot'];
      }
    }

    // Services Detailed
    if (!Array.isArray(t.servicesDetailed) || t.servicesDetailed.length === 0) {
      t.servicesDetailed = [
        { title: '🦴 Manual Terapi Reposisi Tulang Otot Sendi', desc: 'Penyesuaian biomekanika sendi dan pelepasan syaraf terjepit.' },
        { title: '🏃 Recovery Sport Injury & Pijat Holistik', desc: 'Penanganan cedera olahraga dan relaksasi ketegangan otot dalam.' }
      ];
    }

    // Action Photos
    if (!Array.isArray(t.actionPhotos) || t.actionPhotos.length === 0) {
      t.actionPhotos = [
        { url: t.avatar, caption: `${t.brand} - ${t.practitioner}` }
      ];
    }

    return t;
  }

  function getCleanTherapists() {
    if (typeof THERAPISTS_DATA === 'undefined' || !Array.isArray(THERAPISTS_DATA)) return [];
    return THERAPISTS_DATA.map(normalizeTherapist).filter(Boolean);
  }

  // -------------------------------------------------------------
  // 1. Dynamic City Chips Registration
  // -------------------------------------------------------------
  function syncCityChips() {
    if (!cityChipsWrap) return;
    const knownKeys = new Set();
    cityChipsWrap.querySelectorAll('.city-chip').forEach(c => {
      knownKeys.add(c.getAttribute('data-city'));
    });

    const cleanList = getCleanTherapists();
    cleanList.forEach(t => {
      if (!t.regionKey || knownKeys.has(t.regionKey)) return;
      knownKeys.add(t.regionKey);

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'city-chip';
      btn.setAttribute('data-city', t.regionKey);
      btn.textContent = t.city;
      btn.addEventListener('click', () => {
        cityChipsWrap.querySelectorAll('.city-chip').forEach(c => c.classList.remove('active'));
        btn.classList.add('active');
        activeCity = t.regionKey;
        filterAndRender();
      });
      cityChipsWrap.appendChild(btn);
    });
  }

  // -------------------------------------------------------------
  // 2. Filter & Render Directory Cards
  // -------------------------------------------------------------
  function filterAndRender() {
    if (!therapistsGrid) return;

    const all = getCleanTherapists();
    const query = searchQuery.toLowerCase().trim();

    const filtered = all.filter(t => {
      // 1. Category filter
      const matchCategory = activeCategory === 'all' || t.categoryTags.includes(activeCategory);

      // 2. City filter
      const matchCity = activeCity === 'all' || 
        t.regionKey === activeCity ||
        (t.city && t.city.toLowerCase().includes(activeCity));

      // 3. Search query filter
      const matchSearch = !query || 
        (t.brand && t.brand.toLowerCase().includes(query)) ||
        (t.practitioner && t.practitioner.toLowerCase().includes(query)) ||
        (t.city && t.city.toLowerCase().includes(query)) ||
        (t.district && t.district.toLowerCase().includes(query)) ||
        t.primarySpecialties.some(s => s.toLowerCase().includes(query)) ||
        t.complaintsDetailed.some(c => c.toLowerCase().includes(query));

      return matchCategory && matchCity && matchSearch;
    });

    // Update results badge
    if (resultsCount) {
      resultsCount.textContent = `${filtered.length} Tempat Terapi`;
    }

    if (filtered.length === 0) {
      therapistsGrid.innerHTML = `
        <div class="empty-results-box">
          <p>🔍 Tidak ditemukan tempat terapi yang sesuai dengan filter atau kata kunci Anda.</p>
          <button type="button" class="btn btn-secondary btn-sm" onclick="resetAllFilters()">Reset Semua Filter</button>
        </div>
      `;
      return;
    }

    // Render Compact Directory Cards
    therapistsGrid.innerHTML = filtered.map(t => `
      <article class="compact-therapist-card" data-id="${t.id}">
        <!-- Top Bar: Avatar & Brand Info -->
        <div class="c-card-top" onclick="window.showTherapistDetail('${t.id}')" role="button" tabindex="0" title="Klik untuk lihat profil lengkap">
          <div class="c-card-avatar">
            <img src="${t.avatar}" alt="${t.brand}" loading="lazy" onerror="this.src='public/images/logo-satria.png'">
            <span class="c-avatar-city">📍 ${t.city}</span>
          </div>
          <div class="c-card-meta">
            <div class="c-badge-row">
              <span class="c-code-badge">${t.shortCode}</span>
              <span class="c-verified-badge">✓ Terverifikasi</span>
            </div>
            <h3 class="c-brand-title">${t.brand}</h3>
            <p class="c-practitioner">${t.practitioner}</p>
            <p class="c-assoc">${t.association}</p>
          </div>
        </div>

        <!-- Middle: Specialties & Pricing -->
        <div class="c-card-mid" onclick="window.showTherapistDetail('${t.id}')" role="button" tabindex="0">
          <div class="c-price-strip">
            <span class="c-price-label">Tarif:</span>
            <span class="c-price-amount">${t.priceRange}</span>
          </div>

          <div class="c-services-row">
            ${t.primarySpecialties.map(s => `<span class="c-service-pill">✓ ${s}</span>`).join('')}
          </div>

          <div class="c-landmark-strip">
            <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            <span><strong>Patokan:</strong> ${t.landmark}</span>
          </div>
        </div>

        <!-- Footer: Action Buttons -->
        <div class="c-card-actions">
          <button type="button" class="btn btn-outline btn-sm btn-view-profile" onclick="window.showTherapistDetail('${t.id}')">
            👁️ Profil & Galeri
          </button>
          <a href="https://wa.me/${t.waNumber}?text=Halo%20${encodeURIComponent(t.brand)}%20(${encodeURIComponent(t.practitioner)})%2C%20saya%20menemukan%20profil%20Anda%20di%20direktori%20SATRIA%20dan%20ingin%20konsultasi%20jadwal%20terapi." target="_blank" rel="noopener" class="btn btn-primary btn-sm btn-wa-direct">
            <svg class="icon-sm" viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0012.04 2z"/></svg>
            Chat WhatsApp
          </a>
        </div>
      </article>
    `).join('');
  }

  // -------------------------------------------------------------
  // 3. Category & City Filters Interaction
  // -------------------------------------------------------------
  catButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      catButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeCategory = btn.getAttribute('data-category') || 'all';
      filterAndRender();
    });
  });

  if (cityChipsWrap) {
    cityChipsWrap.querySelectorAll('.city-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        cityChipsWrap.querySelectorAll('.city-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        activeCity = chip.getAttribute('data-city') || 'all';
        filterAndRender();
      });
    });
  }

  // Search input
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      if (btnClearSearch) {
        btnClearSearch.style.display = searchQuery ? 'block' : 'none';
      }
      filterAndRender();
    });
  }

  if (btnClearSearch) {
    btnClearSearch.addEventListener('click', () => {
      if (searchInput) searchInput.value = '';
      searchQuery = '';
      btnClearSearch.style.display = 'none';
      filterAndRender();
    });
  }

  window.resetAllFilters = function() {
    activeCategory = 'all';
    activeCity = 'all';
    searchQuery = '';
    if (searchInput) searchInput.value = '';
    if (btnClearSearch) btnClearSearch.style.display = 'none';

    catButtons.forEach(b => {
      if (b.getAttribute('data-category') === 'all') b.classList.add('active');
      else b.classList.remove('active');
    });

    if (cityChipsWrap) {
      cityChipsWrap.querySelectorAll('.city-chip').forEach(c => {
        if (c.getAttribute('data-city') === 'all') c.classList.add('active');
        else c.classList.remove('active');
      });
    }

    filterAndRender();
  };

  // -------------------------------------------------------------
  // 4. Deep-Dive Detailed Modal (Muncul saat diklik)
  // -------------------------------------------------------------
  const modalDialog = document.getElementById('therapistModal');
  const btnCloseModal = document.getElementById('btnCloseModal');
  const btnCloseModalBottom = document.getElementById('btnCloseModalBottom');

  window.showTherapistDetail = function(therapistId) {
    if (!modalDialog) return;

    const all = getCleanTherapists();
    const t = all.find(item => item.id === therapistId) || all[0];
    if (!t) return;

    // Populate Top Header
    document.getElementById('modalAvatar').src = t.avatar;
    document.getElementById('modalAvatar').alt = t.brand;
    document.getElementById('modalTag').textContent = `ID: ${t.shortCode} • Sentra Resmi`;
    document.getElementById('modalLocBadge').textContent = `📍 ${t.city}`;
    document.getElementById('modalBrandTitle').textContent = t.brand;
    document.getElementById('modalPractitioner').textContent = t.practitioner;
    document.getElementById('modalAssoc').textContent = t.association;
    document.getElementById('modalPrice').textContent = `Tarif: ${t.priceRange} (${t.priceNote})`;
    document.getElementById('modalHours').textContent = `⏱️ ${t.operatingHours}`;

    // WhatsApp Links
    const waText = `Halo ${encodeURIComponent(t.brand)} (${encodeURIComponent(t.practitioner)}), saya melihat profil lengkap Anda di direktori SATRIA dan ingin konsultasi serta reservasi jadwal terapi.`;
    const waUrl = `https://wa.me/${t.waNumber}?text=${waText}`;

    document.getElementById('modalWaPrimary').href = waUrl;
    document.getElementById('modalWaBottom').href = waUrl;
    document.getElementById('modalMapsPrimary').href = t.mapsUrl;
    document.getElementById('modalMapsSecondary').href = t.mapsUrl;

    // Overview & Motto
    document.getElementById('modalOverview').textContent = t.overview;
    document.getElementById('modalMotto').innerHTML = `<em>"${t.motto}"</em>`;

    // Action Gallery Grid
    const galleryGrid = document.getElementById('modalGalleryGrid');
    if (galleryGrid) {
      if (t.actionPhotos && t.actionPhotos.length > 0) {
        galleryGrid.innerHTML = t.actionPhotos.map(p => `
          <div class="gallery-photo-card">
            <div class="photo-aspect">
              <img src="${p.url}" alt="${p.caption || t.brand}" loading="lazy" onerror="this.src='public/images/logo-satria.png'">
            </div>
            <p class="photo-caption">${p.caption || t.brand}</p>
          </div>
        `).join('');
      } else {
        galleryGrid.innerHTML = '<p class="text-muted">Dokumentasi foto akan segera diperbarui.</p>';
      }
    }

    // Services Grid
    const servicesGrid = document.getElementById('modalServicesGrid');
    if (servicesGrid) {
      servicesGrid.innerHTML = t.servicesDetailed.map(s => `
        <div class="service-detail-item">
          <h4>${s.title}</h4>
          <p>${s.desc}</p>
        </div>
      `).join('');
    }

    // Complaints Checklist
    const complaintsList = document.getElementById('modalComplaintsList');
    if (complaintsList) {
      complaintsList.innerHTML = t.complaintsDetailed.map(c => `
        <div class="complaint-chip-item">
          <span class="chk-icon">✔</span>
          <span>${c}</span>
        </div>
      `).join('');
    }

    // Address & Landmark
    document.getElementById('modalFullAddress').textContent = t.address;
    document.getElementById('modalLandmark').innerHTML = `<strong>Patokan:</strong> ${t.landmark}`;

    // Open Modal
    if (typeof modalDialog.showModal === 'function') {
      modalDialog.showModal();
      document.body.style.overflow = 'hidden';
    }
  };

  function closeModal() {
    if (!modalDialog) return;
    if (typeof modalDialog.close === 'function') {
      modalDialog.close();
      document.body.style.overflow = '';
    }
  }

  if (btnCloseModal) btnCloseModal.addEventListener('click', closeModal);
  if (btnCloseModalBottom) btnCloseModalBottom.addEventListener('click', closeModal);

  if (modalDialog) {
    modalDialog.addEventListener('close', () => {
      document.body.style.overflow = '';
    });

    // Light-dismiss boundary check fallback
    if (!('closedBy' in HTMLDialogElement.prototype)) {
      modalDialog.addEventListener('click', (event) => {
        if (event.target !== modalDialog) return;
        const rect = modalDialog.getBoundingClientRect();
        const isDialogContent = (
          rect.top <= event.clientY &&
          event.clientY <= rect.top + rect.height &&
          rect.left <= event.clientX &&
          event.clientX <= rect.left + rect.width
        );
        if (isDialogContent) return;
        closeModal();
      });
    }
  }

  // -------------------------------------------------------------
  // 5. Initial Render & Live API Sync
  // -------------------------------------------------------------
  syncCityChips();
  filterAndRender();

  // Live fetch from Admin API to guarantee real-time updates
  const apiEndpoint = window.location.pathname.startsWith('/pusat-kretek-holistic')
    ? '/pusat-kretek-holistic/api/therapists'
    : '/api/therapists';

  fetch(`${apiEndpoint}?v=${Date.now()}`)
    .then(res => res.ok ? res.json() : null)
    .then(data => {
      const items = Array.isArray(data) ? data : (data && Array.isArray(data.therapists) ? data.therapists : null);
      if (items && items.length > 0) {
        window.THERAPISTS_DATA = items;
        syncCityChips();
        filterAndRender();
      }
    })
    .catch(err => {
      console.warn('Live API sync fallback to bundled data:', err);
    });

  console.log('✅ SATRIA Digital directory engine initialized successfully.');
});
