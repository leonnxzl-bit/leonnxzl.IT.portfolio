/* script.js - accessible lightbox + supporting-row scroll
   Works with the provided HTML structure.
*/

(() => {
  // Lightbox elements (from your HTML)
  const lightbox = document.getElementById('lightbox');
  const lbImage = document.getElementById('lbImage');
  const lbCaption = document.getElementById('lbCaption');
  const lbClose = document.getElementById('lbClose');
  const lbPrev = document.getElementById('lbPrev');
  const lbNext = document.getElementById('lbNext');

  let currentImages = []; // array of <img> elements for the active project
  let currentIndex = 0;
  let currentArticle = null;

  // Open lightbox for an image element
  function openLightbox(imgEl) {
    const article = imgEl.closest('.project');
    if (!article) return;

    currentArticle = article;
    currentImages = Array.from(article.querySelectorAll('.support-card img'));
    currentIndex = currentImages.indexOf(imgEl);
    if (currentIndex === -1) currentIndex = 0;

    updateLightboxImage();
    showLightbox();
  }

  function updateLightboxImage() {
    if (!currentImages.length) return;
    const imgEl = currentImages[currentIndex];
    lbImage.src = imgEl.src;
    lbImage.alt = imgEl.alt || '';
    lbCaption.textContent = imgEl.alt || '';
  }

  function showLightbox() {
    lightbox.setAttribute('aria-hidden', 'false');
    lightbox.style.display = 'flex';
    // trap focus on close button initially
    lbClose.focus();
    document.body.style.overflow = 'hidden'; // optional: prevent page scroll while open
  }

  function closeLightbox() {
    lightbox.setAttribute('aria-hidden', 'true');
    lightbox.style.display = 'none';
    lbImage.src = '';
    lbCaption.textContent = '';
    currentImages = [];
    currentIndex = 0;
    currentArticle = null;
    document.body.style.overflow = ''; // restore scroll
  }

  function showNext(delta = 1) {
    if (!currentImages.length) return;
    currentIndex = (currentIndex + delta + currentImages.length) % currentImages.length;
    updateLightboxImage();
  }

  // Click on supporting images (delegation)
  document.addEventListener('click', (e) => {
    const img = e.target.closest('.support-card img');
    if (img) {
      e.preventDefault();
      openLightbox(img);
    }
  });

  // Lightbox control buttons
  lbClose.addEventListener('click', (e) => {
    e.stopPropagation();
    closeLightbox();
  });

  lbPrev.addEventListener('click', (e) => {
    e.stopPropagation();
    showNext(-1);
  });

  lbNext.addEventListener('click', (e) => {
    e.stopPropagation();
    showNext(1);
  });

  // Close when clicking overlay (outside inner)
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    const isOpen = lightbox.getAttribute('aria-hidden') === 'false';
    if (!isOpen) return;
    if (e.key === 'Escape') {
      closeLightbox();
    } else if (e.key === 'ArrowLeft') {
      showNext(-1);
    } else if (e.key === 'ArrowRight') {
      showNext(1);
    }
  });

  // Row scrolling for nav buttons (rewind / forward)
  function setupRowNavButtons() {
    const rewindBtns = document.querySelectorAll('.nav-btn.rewind');
    const forwardBtns = document.querySelectorAll('.nav-btn.forward');

    rewindBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const wrapper = btn.closest('.supporting-row-wrapper');
        if (!wrapper) return;
        const row = wrapper.querySelector('.supporting-row');
        if (!row) return;
        const card = row.querySelector('.support-card');
        const gap = parseInt(getComputedStyle(row).gap || getComputedStyle(row).columnGap || 14, 10) || 14;
        const step = (card ? card.offsetWidth : 260) + gap;
        row.scrollBy({ left: -step, behavior: 'smooth' });
      });
    });

    forwardBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const wrapper = btn.closest('.supporting-row-wrapper');
        if (!wrapper) return;
        const row = wrapper.querySelector('.supporting-row');
        if (!row) return;
        const card = row.querySelector('.support-card');
        const gap = parseInt(getComputedStyle(row).gap || getComputedStyle(row).columnGap || 14, 10) || 14;
        const step = (card ? card.offsetWidth : 260) + gap;
        row.scrollBy({ left: step, behavior: 'smooth' });
      });
    });
  }

  // Ensure Prev/Next hover/click doesn't cause focus loss when tabbing
  [lbPrev, lbNext, lbClose].forEach(el => {
    if (!el) return;
    el.setAttribute('tabindex', '0');
  });

  // Initialize
  setupRowNavButtons();

  // Optional: keep lightbox image if window resized - re-find index by src
  window.addEventListener('resize', () => {
    if (!currentArticle || !currentImages.length || !lbImage.src) return;
    const imgs = Array.from(currentArticle.querySelectorAll('.support-card img'));
    const foundIndex = imgs.findIndex(i => i.src === lbImage.src);
    if (foundIndex !== -1) {
      currentImages = imgs;
      currentIndex = foundIndex;
    } else {
      // fallback: reset mapping
      currentImages = imgs;
      currentIndex = 0;
      updateLightboxImage();
    }
  });

  // Accessibility improvement: trap focus inside lightbox while open (simple)
  document.addEventListener('focusin', (e) => {
    if (lightbox.getAttribute('aria-hidden') === 'false') {
      if (!lightbox.contains(e.target)) {
        // return focus to close button
        lbClose.focus();
      }
    }
  });
})();
