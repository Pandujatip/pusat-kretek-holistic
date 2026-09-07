/**
 * Pusat Kretek & Reposisi Holistic - Application Engine
 * Handles dynamic therapist directory, city filtering, live search,
 * interactive modal rendering, and responsive interactions.
 */

document.addEventListener('DOMContentLoaded', () => {
  // -------------------------------------------------------------
  // 1. Mobile Menu Toggle
  // -------------------------------------------------------------
  const mobileToggle = document.getElementById('mobileToggle');
  const navLinks = document.getElementById('navLinks');

  if (mobileToggle && navLinks) {
    mobileToggle.addEventListener('click', () => {
      const isExpanded = mobileToggle.getAttribute('aria-expanded') === 'true';
      mobileToggle.setAttribute('aria-expanded', !isExpanded);
      navLinks.classList.toggle('active');
    });

    navLinks.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        mobileToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // -------------------------------------------------------------
  // 2. Dynamic Therapist Directory & Filters
  // -------------------------------------------------------------
  const therapistsGrid = document.getElementById('therapistsGrid');
  const filterBtns = document.querySelectorAll('.filter-tab-btn');
  const searchInput = document.getElementById('therapistSearch');
  const resultsCount = document.getElementById('resultsCount');

  let currentFilter = 'all';
  let searchQuery = '';

  function renderTherapists() {
    if (!therapistsGrid || typeof THERAPISTS_DATA === 'undefined') return;

    const filtered = THERAPISTS_DATA.filter(t => {
      // Filter by city/region
      const matchCity = currentFilter === 'all' || 
                        t.regionGroup === currentFilter || 
                        t.city.toLowerCase().includes(currentFilter.toLowerCase());

      // Filter by search query
      const q = searchQuery.toLowerCase().trim();
      const matchSearch = !q || 
        t.brand.toLowerCase().includes(q) ||
        t.practitioner.toLowerCase().includes(q) ||
        t.city.toLowerCase().includes(q) ||
        t.address.toLowerCase().includes(q) ||
        t.services.some(s => s.toLowerCase().includes(q)) ||
        t.complaints.some(c => c.toLowerCase().includes(q));

      return matchCity && matchSearch;
    });

    if (resultsCount) {
      resultsCount.textContent = `${filtered.length} Cabang / Sentra Terapi Ditemukan`;
    }

    if (filtered.length === 0) {
      therapistsGrid.innerHTML = `
        <div class="no-results-card">
          <p>🔍 Tidak ditemukan terapis yang cocok dengan pencarian <strong>"${searchQuery}"</strong>.</p>
          <button class="btn btn-secondary btn-sm" onclick="resetSearchFilter()">Tampilkan Semua Cabang</button>
        </div>
      `;
      return;
    }

    therapistsGrid.innerHTML = filtered.map(t => `
      <article class="therapist-card" data-id="${t.id}">
        <div class="t-card-header">
          <div class="t-avatar-box">
            <img src="${t.avatar}" alt="${t.brand} - ${t.practitioner}" class="t-avatar-img" loading="lazy">
            <span class="t-city-badge">📍 ${t.city}</span>
          </div>
          <div class="t-header-text">
            <span class="t-tag-badge">${t.badge}</span>
            <h3 class="t-brand-name">${t.brand}</h3>
            <p class="t-practitioner-name">${t.practitioner}</p>
            <p class="t-role-text">${t.role}</p>
          </div>
        </div>

        <div class="t-card-body">
          <div class="t-price-box">
            <span class="t-price-label">Tarif Sesi:</span>
            <span class="t-price-val">${t.priceRange}</span>
          </div>

          <div class="t-services-list">
            ${t.services.slice(0, 4).map(s => `<span class="service-pill">✓ ${s}</span>`).join('')}
            ${t.services.length > 4 ? `<span class="service-pill more-pill">+${t.services.length - 4} lainnya</span>` : ''}
          </div>

          <p class="t-address-snippet">
            <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            <span><strong>Patokan:</strong> ${t.landmark}</span>
          </p>
        </div>

        <div class="t-card-footer">
          <button type="button" class="btn btn-outline btn-sm btn-open-detail" data-id="${t.id}" aria-haspopup="dialog">
            <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
            Detail & Galeri
          </button>
          <a href="https://wa.me/${t.waNumber}?text=Halo%20${encodeURIComponent(t.brand)}%20(${encodeURIComponent(t.practitioner)})%2C%20saya%20ingin%20konsultasi%20dan%20reservasi%20terapi." target="_blank" rel="noopener" class="btn btn-primary btn-sm btn-wa-card">
            <svg class="icon-sm" viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0012.04 2z"/></svg>
            Chat WA
          </a>
        </div>
      </article>
    `).join('');

    // Bind detail buttons
    therapistsGrid.querySelectorAll('.btn-open-detail').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        openTherapistModal(id);
      });
    });
  }

  // Filter Buttons binding
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.getAttribute('data-filter') || 'all';
      renderTherapists();
    });
  });

  // Search input binding
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      renderTherapists();
    });
  }

  window.resetSearchFilter = function() {
    searchQuery = '';
    currentFilter = 'all';
    if (searchInput) searchInput.value = '';
    filterBtns.forEach(b => {
      if (b.getAttribute('data-filter') === 'all') b.classList.add('active');
      else b.classList.remove('active');
    });
    renderTherapists();
  };

  // Initial directory render
  renderTherapists();

  // -------------------------------------------------------------
  // 3. Dynamic Modal for Any Therapist (<dialog>)
  // -------------------------------------------------------------
  const modalDialog = document.getElementById('therapistModal');
  const btnCloseModal = document.getElementById('btnCloseModal');
  const btnCloseModalFooter = document.getElementById('btnCloseModalFooter');

  function openTherapistModal(therapistId) {
    if (!modalDialog || typeof THERAPISTS_DATA === 'undefined') return;

    const t = THERAPISTS_DATA.find(item => item.id === therapistId) || THERAPISTS_DATA[0];

    // Populate Modal Elements
    const elAvatar = document.getElementById('modalAvatar');
    const elBrand = document.getElementById('modalBrand');
    const elPractitioner = document.getElementById('modalPractitioner');
    const elRole = document.getElementById('modalRole');
    const elMotto = document.getElementById('modalMotto');
    const elBadge = document.getElementById('modalBadge');
    const elPrice = document.getElementById('modalPrice');
    const elCity = document.getElementById('modalCity');
    const elAddress = document.getElementById('modalAddress');
    const elMapsBtn = document.getElementById('modalMapsBtn');
    const elWaBtn = document.getElementById('modalWaBtn');
    const elWaFooterBtn = document.getElementById('modalWaFooterBtn');
    const elPhilosophy = document.getElementById('modalPhilosophy');
    const elSpecialtiesGrid = document.getElementById('modalSpecialtiesGrid');
    const elTrackRecordList = document.getElementById('modalTrackRecordList');
    const elGalleryContainer = document.getElementById('modalGalleryContainer');

    if (elAvatar) elAvatar.src = t.avatar;
    if (elBrand) elBrand.textContent = t.brand;
    if (elPractitioner) elPractitioner.textContent = t.practitioner;
    if (elRole) elRole.textContent = t.role;
    if (elMotto) elMotto.textContent = `"${t.motto}"`;
    if (elBadge) elBadge.textContent = t.badge;
    if (elPrice) elPrice.textContent = t.priceRange;
    if (elCity) elCity.textContent = `${t.city}, ${t.province}`;
    if (elAddress) elAddress.textContent = t.address;
    if (elMapsBtn) elMapsBtn.href = t.mapsUrl;

    const waLink = `https://wa.me/${t.waNumber}?text=Halo%20${encodeURIComponent(t.brand)}%20(${encodeURIComponent(t.practitioner)})%2C%20saya%20tertarik%20dengan%20layanan%20terapi%20dan%20ingin%20konsultasi.`;
    if (elWaBtn) elWaBtn.href = waLink;
    if (elWaFooterBtn) elWaFooterBtn.href = waLink;

    if (elPhilosophy) elPhilosophy.textContent = t.experienceDetails.philosophy;

    // Specialties
    if (elSpecialtiesGrid) {
      elSpecialtiesGrid.innerHTML = t.experienceDetails.specialties.map(spec => `
        <div class="skill-box">
          <h4>${spec.name}</h4>
          <p>${spec.desc}</p>
        </div>
      `).join('');
    }

    // Track record
    if (elTrackRecordList) {
      elTrackRecordList.innerHTML = t.experienceDetails.trackRecord.map(rec => `
        <li>${rec}</li>
      `).join('');
    }

    // Gallery
    if (elGalleryContainer) {
      if (t.gallery && t.gallery.length > 0) {
        elGalleryContainer.innerHTML = `
          <div class="modal-gallery-grid">
            ${t.gallery.map(img => `
              <div class="modal-gallery-item">
                <img src="${img}" alt="Dokumentasi Terapi ${t.brand}" loading="lazy">
              </div>
            `).join('')}
          </div>
        `;
      } else {
        elGalleryContainer.innerHTML = '';
      }
    }

    // Show Dialog
    if (typeof modalDialog.showModal === 'function') {
      modalDialog.showModal();
      document.body.style.overflow = 'hidden';
    }
  }

  function closeModal() {
    if (!modalDialog) return;
    if (typeof modalDialog.close === 'function') {
      modalDialog.close();
      document.body.style.overflow = '';
    }
  }

  if (btnCloseModal) btnCloseModal.addEventListener('click', closeModal);
  if (btnCloseModalFooter) btnCloseModalFooter.addEventListener('click', closeModal);

  if (modalDialog) {
    modalDialog.addEventListener('close', () => {
      document.body.style.overflow = '';
    });

    // Fallback light-dismiss for browsers without closedby support
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

  // Hero Quick View button
  const btnHeroQuickView = document.getElementById('btnHeroQuickView');
  if (btnHeroQuickView) {
    btnHeroQuickView.addEventListener('click', () => {
      openTherapistModal('andi-bogor');
    });
  }

  // -------------------------------------------------------------
  // 4. Navbar scroll shadow
  // -------------------------------------------------------------
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navbar.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.08)';
    } else {
      navbar.style.boxShadow = 'none';
    }
  }, { passive: true });

  console.log('✅ Sentra Terapi & Reposisi directory initialized successfully.');
});
