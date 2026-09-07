/**
 * Pusat Kretek Holistic - Interactive Zipper Screen
 * Creates a photorealistic full-screen dark zipper curtain that splits open
 * as the user drags the zipper slider downward.
 */

class ZipperIntro {
  constructor() {
    this.overlay = document.getElementById('zipperOverlay');
    this.flapLeft = document.getElementById('flapLeft');
    this.flapRight = document.getElementById('flapRight');
    this.slider = document.getElementById('zipperSlider');
    this.teethSvg = document.getElementById('zipperTeethSvg');
    this.skipBtn = document.getElementById('btnSkipZipper');
    this.hintText = document.getElementById('zipperHint');

    if (!this.overlay || !this.slider) return;

    this.isDragging = false;
    this.startY = 0;
    this.currentY = 60; // initial top offset
    this.initialY = 60;
    this.maxY = window.innerHeight;
    this.audioCtx = null;
    this.lastSoundY = 0;
    this.isUnzipped = false;

    this.init();
  }

  init() {
    // Handle resize
    window.addEventListener('resize', () => {
      this.maxY = window.innerHeight;
      if (!this.isUnzipped) {
        this.updateCut(this.currentY);
      }
    });

    // Pointer Events (Mouse, Touch, Pen)
    this.slider.addEventListener('pointerdown', (e) => this.onStart(e));
    window.addEventListener('pointermove', (e) => this.onMove(e));
    window.addEventListener('pointerup', () => this.onEnd());
    window.addEventListener('pointercancel', () => this.onEnd());

    // Skip button
    if (this.skipBtn) {
      this.skipBtn.addEventListener('click', () => this.autoUnzip());
    }

    // Replay button in footer
    const replayBtn = document.getElementById('btnReplayZipper');
    if (replayBtn) {
      replayBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        this.resetZipper();
      });
    }

    // Allow clicking on track to pull to that point
    const track = document.getElementById('zipperTrack');
    if (track) {
      track.addEventListener('click', (e) => {
        if (e.clientY > this.currentY) {
          this.pullTo(e.clientY);
        }
      });
    }

    // Initial render of closed/resting state
    this.updateCut(this.initialY);

    // Prevent body scroll while zipper is closed
    document.body.style.overflow = 'hidden';
  }

  initAudio() {
    try {
      if (!this.audioCtx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) this.audioCtx = new AudioContext();
      }
      if (this.audioCtx && this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
    } catch (e) {
      // Audio fallback
    }
  }

  playZipperClick(freq = 900) {
    if (!this.audioCtx) return;
    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      const filter = this.audioCtx.createBiquadFilter();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq + (Math.random() * 300 - 150), this.audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(180, this.audioCtx.currentTime + 0.025);

      filter.type = 'bandpass';
      filter.frequency.value = 1800;
      filter.Q.value = 4;

      gain.gain.setValueAtTime(0.08, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.025);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.025);
    } catch (e) {
      // Ignore audio error
    }
  }

  onStart(e) {
    if (this.isUnzipped) return;
    this.isDragging = true;
    this.startY = e.clientY - this.currentY;
    this.slider.setPointerCapture(e.pointerId);
    this.slider.classList.add('grabbing');
    if (this.hintText) this.hintText.style.opacity = '0';
    this.initAudio();
  }

  onMove(e) {
    if (!this.isDragging || this.isUnzipped) return;

    let targetY = e.clientY - this.startY;
    if (targetY < this.initialY) targetY = this.initialY;
    if (targetY > this.maxY) targetY = this.maxY;

    this.currentY = targetY;
    this.updateCut(this.currentY);

    // Audio ratchet sound every 14 pixels
    if (Math.abs(this.currentY - this.lastSoundY) > 14) {
      this.playZipperClick(750 + (this.currentY / this.maxY) * 600);
      this.lastSoundY = this.currentY;
    }

    // If dragged past 65% of screen height, trigger auto unzip
    if (this.currentY > this.maxY * 0.65) {
      this.autoUnzip();
    }
  }

  onEnd() {
    if (!this.isDragging || this.isUnzipped) return;
    this.isDragging = false;
    this.slider.classList.remove('grabbing');

    // If released past 45%, finish unzipping, else snap back gently
    if (this.currentY > this.maxY * 0.45) {
      this.autoUnzip();
    } else {
      this.snapBack();
    }
  }

  snapBack() {
    const startY = this.currentY;
    const endY = this.initialY;
    const duration = 250;
    const startTime = performance.now();

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const ease = 1 - Math.pow(1 - progress, 3);
      this.currentY = startY + (endY - startY) * ease;
      this.updateCut(this.currentY);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        if (this.hintText) this.hintText.style.opacity = '1';
      }
    };
    requestAnimationFrame(animate);
  }

  pullTo(targetY) {
    if (this.isUnzipped) return;
    this.initAudio();
    const startY = this.currentY;
    const duration = 300;
    const startTime = performance.now();

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      this.currentY = startY + (targetY - startY) * ease;
      this.updateCut(this.currentY);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else if (this.currentY > this.maxY * 0.65) {
        this.autoUnzip();
      }
    };
    requestAnimationFrame(animate);
  }

  updateCut(y) {
    const W = window.innerWidth;
    const H = window.innerHeight;
    const Xc = W / 2;

    // The open triangular V width at the top
    const openSpread = Math.min(Xc, y * 0.75);

    // Update Slider position
    this.slider.style.transform = `translate(-50%, ${y}px)`;

    // Left Curtain polygon:
    // Starts at top-left (0,0), goes to top V-opening (Xc - openSpread, 0),
    // down to slider tip (Xc, y), straight down to bottom (Xc, H), to bottom-left (0, H)
    const leftPolygon = `polygon(0 0, ${Xc - openSpread}px 0, ${Xc}px ${y}px, ${Xc}px ${H}px, 0 ${H}px)`;
    this.flapLeft.style.clipPath = leftPolygon;

    // Right Curtain polygon:
    // Starts at top V-opening (Xc + openSpread, 0), goes to top-right (W, 0),
    // down to bottom-right (W, H), to bottom center (Xc, H), up to slider tip (Xc, y)
    const rightPolygon = `polygon(${Xc + openSpread}px 0, ${W}px 0, ${W}px ${H}px, ${Xc}px ${H}px, ${Xc}px ${y}px)`;
    this.flapRight.style.clipPath = rightPolygon;

    // Render SVG zipper teeth
    this.renderTeeth(Xc, y, openSpread, H);
  }

  renderTeeth(Xc, y, openSpread, H) {
    if (!this.teethSvg) return;
    const toothH = 14;
    const toothW = 9;

    let svgHtml = '';

    // 1. Open teeth along left V slant
    const leftSteps = Math.floor(y / toothH);
    for (let i = 0; i < leftSteps; i++) {
      const ty = i * toothH;
      const progress = ty / Math.max(1, y);
      const tx = (Xc - openSpread) + (openSpread * progress) - toothW;
      const rot = -15 * (1 - progress);
      svgHtml += `<rect x="${tx}" y="${ty}" width="${toothW}" height="6" rx="2" fill="url(#metalGold)" transform="rotate(${rot} ${tx} ${ty})"/>`;
    }

    // 2. Open teeth along right V slant
    for (let i = 0; i < leftSteps; i++) {
      const ty = i * toothH + (toothH / 2);
      if (ty > y) break;
      const progress = ty / Math.max(1, y);
      const tx = (Xc + openSpread) - (openSpread * progress);
      const rot = 15 * (1 - progress);
      svgHtml += `<rect x="${tx}" y="${ty}" width="${toothW}" height="6" rx="2" fill="url(#metalGold)" transform="rotate(${rot} ${tx} ${ty})"/>`;
    }

    // 3. Closed teeth below slider (interlocking in center)
    const closedSteps = Math.floor((H - y) / (toothH / 2));
    for (let i = 0; i < closedSteps; i++) {
      const ty = y + 25 + i * (toothH / 2);
      if (ty > H) break;
      const isLeft = i % 2 === 0;
      const tx = isLeft ? (Xc - toothW + 1) : (Xc - 1);
      svgHtml += `<rect x="${tx}" y="${ty}" width="${toothW}" height="5" rx="1.5" fill="url(#metalGold)"/>`;
    }

    this.teethSvg.innerHTML = `
      <defs>
        <linearGradient id="metalGold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#fef08a"/>
          <stop offset="35%" stop-color="#eab308"/>
          <stop offset="70%" stop-color="#ca8a04"/>
          <stop offset="100%" stop-color="#854d0e"/>
        </linearGradient>
      </defs>
      ${svgHtml}
    `;
  }

  autoUnzip() {
    if (this.isUnzipped) return;
    this.isUnzipped = true;
    this.isDragging = false;

    // Fast finish sound
    for (let i = 0; i < 8; i++) {
      setTimeout(() => this.playZipperClick(900 + i * 80), i * 35);
    }

    const startY = this.currentY;
    const endY = this.maxY + 150;
    const duration = 450;
    const startTime = performance.now();

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease in expo / quad
      const ease = Math.pow(progress, 2.5);
      this.currentY = startY + (endY - startY) * ease;
      this.updateCut(this.currentY);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // Overlay curtain parts fully open and vanishes
        this.overlay.classList.add('unzipped');
        document.body.style.overflow = '';

        setTimeout(() => {
          this.overlay.style.display = 'none';
        }, 600);
      }
    };
    requestAnimationFrame(animate);
  }

  resetZipper() {
    this.isUnzipped = false;
    this.currentY = this.initialY;
    this.overlay.style.display = 'block';
    requestAnimationFrame(() => {
      this.overlay.classList.remove('unzipped');
      this.updateCut(this.initialY);
      document.body.style.overflow = 'hidden';
      if (this.hintText) this.hintText.style.opacity = '1';
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.zipperScreen = new ZipperIntro();
});
