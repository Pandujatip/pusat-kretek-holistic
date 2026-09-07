/**
 * Pusat Kretek Holistic - Interactive Logic
 * Follows modern-web-guidance standards for <dialog> handling,
 * light-dismiss fallback, and responsive navigation.
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

    // Close mobile nav when clicking a navigation link
    navLinks.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        mobileToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // -------------------------------------------------------------
  // 2. Owner Profile Modal Dialog (<dialog>)
  // -------------------------------------------------------------
  const ownerModal = document.getElementById('ownerModal');
  const btnOpenOwnerModal = document.getElementById('btnOpenOwnerModal');
  const btnHeroOwner = document.getElementById('btnHeroOwner');
  const btnOpenOwnerDetail = document.getElementById('btnOpenOwnerDetail');
  const cardOwnerQuick = document.getElementById('cardOwnerQuick');
  const btnCloseModal = document.getElementById('btnCloseModal');
  const btnCloseModalFooter = document.getElementById('btnCloseModalFooter');

  function openOwnerModal() {
    if (!ownerModal) return;
    if (typeof ownerModal.showModal === 'function') {
      ownerModal.showModal();
      document.body.style.overflow = 'hidden'; // prevent background scroll
    }
  }

  function closeOwnerModal() {
    if (!ownerModal) return;
    if (typeof ownerModal.close === 'function') {
      ownerModal.close();
      document.body.style.overflow = '';
    }
  }

  // Bind Open triggers
  if (btnOpenOwnerModal) btnOpenOwnerModal.addEventListener('click', (e) => {
    e.stopPropagation();
    openOwnerModal();
  });

  if (btnHeroOwner) btnHeroOwner.addEventListener('click', openOwnerModal);
  if (btnOpenOwnerDetail) btnOpenOwnerDetail.addEventListener('click', openOwnerModal);
  
  // Make clicking the owner preview card also open modal
  if (cardOwnerQuick) {
    cardOwnerQuick.addEventListener('click', (e) => {
      // If user clicked directly on another interactive element, ignore
      if (e.target.closest('a')) return;
      openOwnerModal();
    });
  }

  // Bind Close triggers
  if (btnCloseModal) btnCloseModal.addEventListener('click', closeOwnerModal);
  if (btnCloseModalFooter) btnCloseModalFooter.addEventListener('click', closeOwnerModal);

  // Restore scroll when modal is closed via Escape or other mechanisms
  if (ownerModal) {
    ownerModal.addEventListener('close', () => {
      document.body.style.overflow = '';
    });

    // Fallback light-dismiss for browsers that don't yet support closedby="any"
    // (As mandated by modern-web-guidance skill)
    if (!('closedBy' in HTMLDialogElement.prototype)) {
      ownerModal.addEventListener('click', (event) => {
        if (event.target !== ownerModal) return;

        const rect = ownerModal.getBoundingClientRect();
        const isDialogContent = (
          rect.top <= event.clientY &&
          event.clientY <= rect.top + rect.height &&
          rect.left <= event.clientX &&
          event.clientX <= rect.left + rect.width
        );

        if (isDialogContent) return;
        closeOwnerModal();
      });
    }
  }

  // -------------------------------------------------------------
  // 3. Navbar scroll effect
  // -------------------------------------------------------------
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navbar.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.08)';
    } else {
      navbar.style.boxShadow = 'none';
    }
  }, { passive: true });

  console.log('✅ Pusat Kretek Holistic landing page initialized successfully.');
});
