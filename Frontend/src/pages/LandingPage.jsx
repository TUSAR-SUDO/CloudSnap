import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import fireImage from '../images/FIREEYE.png';

// ─── Color palette matching the image ────────────────────────────
const FLAME_COLORS = [
  { r: 255, g: 160, b: 20 }, { r: 255, g: 120, b: 10 },
  { r: 255, g: 200, b: 60 }, { r: 255, g: 100, b: 0 },
  { r: 255, g: 50, b: 150 }, { r: 255, g: 80, b: 200 },
  { r: 230, g: 30, b: 120 },
  { r: 180, g: 60, b: 255 }, { r: 150, g: 40, b: 220 },
  { r: 200, g: 80, b: 255 },
  { r: 80, g: 180, b: 255 }, { r: 50, g: 140, b: 255 },
  { r: 100, g: 220, b: 255 },
];

const EMBER_COLORS = [
  { r: 255, g: 220, b: 150 }, { r: 255, g: 180, b: 100 },
  { r: 255, g: 200, b: 255 }, { r: 200, g: 200, b: 255 },
  { r: 255, g: 255, b: 200 },
];

function lerp(a, b, t) { return a + (b - a) * t; }
function randomRange(min, max) { return Math.random() * (max - min) + min; }
function pickRandom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

class FireParticle {
  constructor(canvasW, canvasH, isEmber = false) {
    this.isEmber = isEmber;
    this.reset(canvasW, canvasH);
  }

  reset(canvasW, canvasH) {
    const emitXMin = canvasW * 0.18;
    const emitXMax = canvasW * 0.78;
    const emitY = canvasH * 0.75;
    this.x = randomRange(emitXMin, emitXMax);
    this.y = randomRange(emitY - canvasH * 0.15, emitY);
    const center = (emitXMin + emitXMax) / 2;
    this.x = lerp(this.x, center, randomRange(0.1, 0.5));

    if (this.isEmber) {
      this.size = randomRange(1, 3);
      this.life = randomRange(0.8, 1.5);
      this.maxLife = this.life;
      this.vx = randomRange(-0.8, 0.8);
      this.vy = randomRange(-2.5, -1.0);
      const col = pickRandom(EMBER_COLORS);
      this.r = col.r; this.g = col.g; this.b = col.b;
      this.alpha = randomRange(0.6, 1.0);
      this.flickerSpeed = randomRange(8, 15);
      this.flickerPhase = Math.random() * Math.PI * 2;
    } else {
      this.size = randomRange(8, 35);
      this.life = randomRange(0.6, 1.8);
      this.maxLife = this.life;
      this.vx = randomRange(-0.6, 0.6);
      this.vy = randomRange(-3.5, -1.0);
      const col = pickRandom(FLAME_COLORS);
      this.r = col.r; this.g = col.g; this.b = col.b;
      this.alpha = randomRange(0.15, 0.55);
      this.flickerSpeed = randomRange(4, 12);
      this.flickerPhase = Math.random() * Math.PI * 2;
      this.swayAmplitude = randomRange(0.3, 1.5);
      this.swayFreq = randomRange(2, 5);
      this.swayPhase = Math.random() * Math.PI * 2;
    }
    this.age = 0;
    this.alive = true;
  }

  update(dt, canvasW, canvasH, time) {
    this.age += dt;
    if (this.age >= this.maxLife) { this.alive = false; return; }
    const progress = this.age / this.maxLife;
    this.x += this.vx * 60 * dt;
    this.y += this.vy * 60 * dt;
    if (!this.isEmber) {
      this.x += Math.sin(time * this.swayFreq + this.swayPhase) * this.swayAmplitude * dt * 30;
    } else {
      this.x += Math.sin(time * 3 + this.flickerPhase) * 0.3 * dt * 30;
    }
    this.vy *= 0.998;
    this.vy -= 0.02 * dt;
    if (!this.isEmber) {
      this.currentSize = progress < 0.15
        ? this.size * (progress / 0.15)
        : this.size * (1 - (progress - 0.15) / 0.85) * 0.8;
    } else {
      this.currentSize = this.size * (1 - progress * 0.5);
    }
    const flicker = Math.sin(time * this.flickerSpeed + this.flickerPhase) * 0.3 + 0.7;
    let fadeOut = progress > 0.6 ? 1 - (progress - 0.6) / 0.4 : 1;
    let fadeIn = progress < 0.1 ? progress / 0.1 : 1;
    this.currentAlpha = this.alpha * flicker * fadeOut * fadeIn;
  }

  draw(ctx) {
    if (!this.alive || this.currentSize <= 0) return;
    const size = Math.max(this.currentSize, 0.5);
    if (!isFinite(this.x) || !isFinite(this.y) || !isFinite(size) || !isFinite(this.currentAlpha)) return;
    if (this.isEmber) {
      ctx.save();
      ctx.globalAlpha = this.currentAlpha;
      ctx.beginPath();
      ctx.arc(this.x, this.y, size, 0, Math.PI * 2);
      ctx.fillStyle = `rgb(${this.r}, ${this.g}, ${this.b})`;
      ctx.shadowColor = `rgb(${this.r}, ${this.g}, ${this.b})`;
      ctx.shadowBlur = size * 4;
      ctx.fill();
      ctx.restore();
    } else {
      ctx.save();
      ctx.globalAlpha = this.currentAlpha;
      const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, size);
      gradient.addColorStop(0, `rgba(${this.r}, ${this.g}, ${this.b}, 1)`);
      gradient.addColorStop(0.4, `rgba(${this.r}, ${this.g}, ${this.b}, 0.6)`);
      gradient.addColorStop(1, `rgba(${this.r}, ${this.g}, ${this.b}, 0)`);
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(this.x, this.y, size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }
}

// ─── SVG Icons ───────────────────────────────────────────────────
const CloudIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/>
  </svg>
);
const UploadIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
  </svg>
);
const GridIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
  </svg>
);
const ShieldIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);
const ZapIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
);
const ImageIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
  </svg>
);
const ArrowIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
);
const UserIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);

// ─── Landing Page Component ──────────────────────────────────────
const LandingPage = () => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const particlesRef = useRef([]);
  const animFrameRef = useRef(null);
  const [ignited, setIgnited] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const opacityRef = useRef(0);
  const navigate = useNavigate();
  const { user } = useAuth();

  const getFlameRect = useCallback(() => {
    const container = containerRef.current;
    if (!container) return null;
    const vw = container.clientWidth;
    const vh = container.clientHeight;
    const imgW = 2048, imgH = 1152;
    const imgAspect = imgW / imgH;
    const vpAspect = vw / vh;
    let renderW, renderH, offsetX, offsetY;
    if (vpAspect > imgAspect) {
      renderW = vw; renderH = vw / imgAspect; offsetX = 0; offsetY = (vh - renderH) / 2;
    } else {
      renderH = vh; renderW = vh * imgAspect; offsetX = (vw - renderW) / 2; offsetY = 0;
    }
    return {
      x: offsetX + renderW * 0.30, y: offsetY + renderH * 0.02,
      w: renderW * 0.37, h: renderH * 0.36,
    };
  }, []);

  const getParticleCount = useCallback(() => {
    const w = window.innerWidth;
    if (w < 480) return { flames: 40, embers: 8 };
    if (w < 768) return { flames: 60, embers: 12 };
    if (w < 1200) return { flames: 100, embers: 20 };
    return { flames: 150, embers: 30 };
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setIgnited(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !imageLoaded) return;
    const ctx = canvas.getContext('2d');
    let particles = particlesRef.current;
    let startTime = performance.now() / 1000;
    let lastTime = startTime;

    const resize = () => {
      const rect = getFlameRect();
      if (!rect || rect.w <= 0 || rect.h <= 0) return;
      const dpr = window.devicePixelRatio || 1;
      canvas.style.left = `${rect.x}px`;
      canvas.style.top = `${rect.y}px`;
      canvas.style.width = `${rect.w}px`;
      canvas.style.height = `${rect.h}px`;
      canvas.width = rect.w * dpr;
      canvas.height = rect.h * dpr;
      ctx.scale(dpr, dpr);
      const counts = getParticleCount();
      particles = [];
      for (let i = 0; i < counts.flames; i++) {
        const p = new FireParticle(rect.w, rect.h, false);
        p.age = Math.random() * p.maxLife;
        particles.push(p);
      }
      for (let i = 0; i < counts.embers; i++) {
        const p = new FireParticle(rect.w, rect.h, true);
        p.age = Math.random() * p.maxLife;
        particles.push(p);
      }
      particlesRef.current = particles;
    };

    resize();
    window.addEventListener('resize', resize);

    const animate = (timestamp) => {
      const now = timestamp / 1000;
      const dt = Math.min(now - lastTime, 0.05);
      lastTime = now;
      const time = now - startTime;
      const rect = getFlameRect();
      if (!rect || rect.w <= 0 || rect.h <= 0) { animFrameRef.current = requestAnimationFrame(animate); return; }
      const dpr = window.devicePixelRatio || 1;
      canvas.style.left = `${rect.x}px`;
      canvas.style.top = `${rect.y}px`;
      canvas.style.width = `${rect.w}px`;
      canvas.style.height = `${rect.h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, rect.w, rect.h);
      ctx.globalCompositeOperation = 'lighter';
      if (ignited && opacityRef.current < 1) {
        opacityRef.current = Math.min(1, opacityRef.current + dt * 0.5);
      }
      canvas.style.opacity = opacityRef.current;
      particles = particlesRef.current;
      const counts = getParticleCount();
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.update(dt, rect.w, rect.h, time);
        if (!p.alive) {
          const isEmber = i >= counts.flames;
          p.reset(rect.w, rect.h);
          p.isEmber = isEmber;
          if (!isEmber) {
            p.size = randomRange(8, 35);
            p.life = randomRange(0.6, 1.8);
            p.maxLife = p.life;
            const col = pickRandom(FLAME_COLORS);
            p.r = col.r; p.g = col.g; p.b = col.b;
            p.alpha = randomRange(0.15, 0.55);
          }
        }
        p.draw(ctx);
      }
      if (Math.random() < 0.02 && ignited) {
        for (let i = 0; i < 3; i++) {
          const spark = new FireParticle(rect.w, rect.h, true);
          spark.alpha = randomRange(0.8, 1.0);
          spark.vy = randomRange(-4, -2);
          spark.size = randomRange(2, 5);
          particles.push(spark);
          if (particles.length > counts.flames + counts.embers + 20) particles.shift();
        }
      }
      ctx.globalCompositeOperation = 'source-over';
      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);
    return () => {
      window.removeEventListener('resize', resize);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [imageLoaded, ignited, getFlameRect, getParticleCount]);

  const handleExploreGallery = (e) => {
    e.preventDefault();
    navigate(user ? '/feed' : '/auth');
  };

  const handleUploadImage = (e) => {
    e.preventDefault();
    navigate(user ? '/create-post' : '/auth');
  };

  return (
    <div className="landing-page" ref={containerRef}>
      {/* Background image */}
      <img
        src={fireImage}
        alt="CloudSnap hero"
        className="landing-bg-img"
        onLoad={() => setImageLoaded(true)}
        draggable={false}
      />

      {/* Fire particle canvas */}
      <canvas ref={canvasRef} className="fire-canvas" style={{ opacity: 0 }} />

      {/* Vignette */}
      <div className="landing-vignette" />

      {/* ───── Top nav bar ───── */}
      <div className={`landing-topnav ${ignited ? 'landing-topnav--visible' : ''}`}>
        <div className="landing-topnav-brand">
          <CloudIcon />
          <span>CloudSnap</span>
        </div>
        <div className="landing-topnav-actions">
          {user ? (
            <>
              <Link to="/feed" className="landing-nav-link" id="landing-nav-gallery">Gallery</Link>
              <Link to="/create-post" className="landing-nav-link" id="landing-nav-upload">Upload</Link>
              <div className="landing-nav-avatar" title={user.fullName}>
                {user.fullName.charAt(0).toUpperCase()}
              </div>
            </>
          ) : (
            <>
              <Link to="/auth" className="landing-nav-link" id="landing-nav-signin">
                <UserIcon />
                Sign In
              </Link>
              <Link to="/auth" className="landing-nav-btn" id="landing-nav-getstarted">
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>

      {/* ───── Left content panel ───── */}
      <div className={`landing-hero-content ${ignited ? 'landing-hero-content--visible' : ''}`}>
        {/* Brand badge */}
        <div className="landing-badge">
          <CloudIcon />
          <span>CloudSnap</span>
          <div className="badge-dot" />
          <span className="badge-status">Cloud Powered</span>
        </div>

        {/* Headline */}
        <h1 className="landing-headline">
          Store Your
          <br />
          <span className="headline-gradient">Memories</span>
          <br />
          In The Cloud
        </h1>

        {/* Subtext */}
        <p className="landing-description">
          Upload, organize, and share your images instantly.
          Powered by ImageKit CDN for blazing-fast delivery
          across the globe.
        </p>

        {/* CTA Buttons */}
        <div className="landing-actions">
          <button onClick={handleExploreGallery} className="landing-cta-btn landing-cta-primary" id="explore-gallery-btn">
            <GridIcon />
            {user ? 'Go to Gallery' : 'Explore Gallery'}
            <ArrowIcon />
            <span className="cta-glow" />
          </button>
          <button onClick={handleUploadImage} className="landing-cta-btn landing-cta-secondary" id="upload-btn">
            <UploadIcon />
            Upload Image
          </button>
        </div>

        {/* Stats row */}
        <div className="landing-stats">
          <div className="stat-item">
            <span className="stat-number">∞</span>
            <span className="stat-label">Cloud Storage</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <span className="stat-number">CDN</span>
            <span className="stat-label">Global Delivery</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <span className="stat-number">4K</span>
            <span className="stat-label">Quality Upload</span>
          </div>
        </div>
      </div>

      {/* ───── Right floating feature cards ───── */}
      <div className={`landing-features ${ignited ? 'landing-features--visible' : ''}`}>
        <div className="feature-card feature-card-1">
          <div className="feature-icon feature-icon--orange">
            <ZapIcon />
          </div>
          <div className="feature-text">
            <h3>Lightning Fast</h3>
            <p>Upload in seconds with optimized compression</p>
          </div>
        </div>

        <div className="feature-card feature-card-2">
          <div className="feature-icon feature-icon--purple">
            <ShieldIcon />
          </div>
          <div className="feature-text">
            <h3>Secure Storage</h3>
            <p>Your images are encrypted and safely stored</p>
          </div>
        </div>

        <div className="feature-card feature-card-3">
          <div className="feature-icon feature-icon--cyan">
            <ImageIcon />
          </div>
          <div className="feature-text">
            <h3>Smart Gallery</h3>
            <p>Beautiful masonry layout for your collection</p>
          </div>
        </div>
      </div>

      {/* Bottom tagline bar */}
      <div className={`landing-bottom-bar ${ignited ? 'landing-bottom-bar--visible' : ''}`}>
        <div className="bottom-bar-left">
          <span className="tech-pill">React</span>
          <span className="tech-pill">Node.js</span>
          <span className="tech-pill">ImageKit</span>
          <span className="tech-pill">MongoDB</span>
        </div>
        <p className="bottom-tagline">Built with modern web technologies • Open source</p>
      </div>

      {/* ───── Bottom-right decorative corner (covers watermark) ───── */}
      <div className={`landing-corner-decor ${ignited ? 'landing-corner-decor--visible' : ''}`}>
        <div className="corner-decor-inner">
          <div className="corner-orbit">
            <div className="corner-orbit-dot corner-orbit-dot--1" />
            <div className="corner-orbit-dot corner-orbit-dot--2" />
            <div className="corner-orbit-dot corner-orbit-dot--3" />
          </div>
          <div className="corner-ring corner-ring--outer" />
          <div className="corner-ring corner-ring--inner" />
          <div className="corner-pulse-core" />
          <p className="corner-label">Powered by CloudSnap</p>
        </div>
        <div className="corner-gradient-wash" />
      </div>

      {/* Scroll hint */}
      <div className={`landing-scroll-hint ${ignited ? 'landing-scroll-hint--visible' : ''}`}>
        <div className="scroll-hint-line" />
      </div>

      {/* Decorative gradient orbs */}
      <div className="landing-orb landing-orb--1" />
      <div className="landing-orb landing-orb--2" />

      {/* Ambient particles */}
      <div className="ambient-particles">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="ambient-dot"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 8}s`,
              animationDuration: `${4 + Math.random() * 6}s`,
              width: `${1 + Math.random() * 3}px`,
              height: `${1 + Math.random() * 3}px`,
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default LandingPage;
