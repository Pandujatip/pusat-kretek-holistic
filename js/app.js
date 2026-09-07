/**
 * SentraKretek.id - Application Engine
 * Manages compact therapist directory, category filtering, city chips,
 * instant live search, and full detailed modal rendering on click.
 */

document.addEventListener('DOMContentLoaded', () => {
  const therapistsGrid = document.getElementById('therapistsGrid');
  const searchInput = document.getElementById('therapistSearch');
  const btnClearSearch = document.getElementById('btnClearSearch');
  const resultsCount = document.getElementById('resultsCount');
  const catButtons = document.querySelectorAll('.cat-col-btn');
  const cityChips = document.querySelectorAll('.city-chip');

  let activeCategory = 'all';
  let activeCity = 'all';
  let searchQuery = '';

  // -------------------------------------------------------------
  // 1. Filter & Render Directory Cards
  // -------------------------------------------------------------
  function filterAndRender() {
    if (!therapistsGrid || typeof THERAPISTS_DATA === 'undefined') return;

    const query = searchQuery.toLowerCase().trim();

    const filtered = THERAPISTS_DATA.filter(t => {
      // 1. Category filter
      const matchCategory = activeCategory === 'all' || 
        t.categoryTags.includes(activeCategory);

      // 2. City filter
      const matchCity = activeCity === 'all' || 
        t.regionKey === activeCity;

      // 3. Search query filter
      const matchSearch = !query || 
        t.brand.toLowerCase().includes(query) ||
        t.practitioner.toLowerCase().includes(query) ||
        t.city.toLowerCase().includes(query) ||
        t.district.toLowerCase().includes(query) ||
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
            <img src="${t.avatar}" alt="${t.brand}" loading="lazy">
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
          <a href="https://wa.me/${t.waNumber}?text=Halo%20${encodeURIComponent(t.brand)}%20(${encodeURIComponent(t.practitioner)})%2C%20saya%20menemukan%20profil%20Anda%20di%20SentraKretek.id%20dan%20ingin%20konsultasi%20jadwal%20terapi." target="_blank" rel="noopener" class="btn btn-primary btn-sm btn-wa-direct">
            <svg class="icon-sm" viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0012.04 2z"/></svg>
            Chat WhatsApp
          </a>
        </div>
      </article>
    `).join('');
  }

  // -------------------------------------------------------------
  // 2. Category & City Filters Interaction
  // -------------------------------------------------------------
  catButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      catButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeCategory = btn.getAttribute('data-category') || 'all';
      filterAndRender();
    });
  });

  cityChips.forEach(chip => {
    chip.addEventListener('click', () => {
      cityChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      activeCity = chip.getAttribute('data-city') || 'all';
      filterAndRender();
    });
  });

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
      searchQuery = '';
      searchInput.value = '';
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

    cityChips.forEach(c => {
      if (c.getAttribute('data-city') === 'all') c.classList.add('active');
      else c.classList.remove('active');
    });

    filterAndRender();
  };

  // -------------------------------------------------------------
  // 3. Deep-Dive Detailed Modal (Muncul saat diklik)
  // -------------------------------------------------------------
  const modalDialog = document.getElementById('therapistModal');
  const btnCloseModal = document.getElementById('btnCloseModal');
  const btnCloseModalBottom = document.getElementById('btnCloseModalBottom');

  window.showTherapistDetail = function(therapistId) {
    if (!modalDialog || typeof THERAPISTS_DATA === 'undefined') return;

    const t = THERAPISTS_DATA.find(item => item.id === therapistId) || THERAPISTS_DATA[0];

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
    const waText = `Halo ${encodeURIComponent(t.brand)} (${encodeURIComponent(t.practitioner)}), saya melihat profil lengkap Anda di SentraKretek.id dan ingin konsultasi serta reservasi jadwal terapi.`;
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
              <img src="${p.url}" alt="${p.caption}" loading="lazy">
            </div>
            <p class="photo-caption">${p.caption}</p>
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

  // Initial render
  filterAndRender();

  console.log('✅ SentraKretek.id marketplace directory initialized successfully.');
});
