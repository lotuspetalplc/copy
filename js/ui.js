// ===================================
// UI EFFECTS & ANIMATIONS
// Particles, Tilt, and other visual effects
// ===================================

// ===== PARTICLE BACKGROUND =====
class ParticleBackground {
  constructor() {
    this.canvas = document.getElementById('particles-canvas');
    if (!this.canvas) return;
    
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.particleCount = this.isMobile() ? 0 : 80;
    this.mouse = { x: null, y: null, radius: 150 };
    
    this.init();
  }
  
  isMobile() {
    return window.innerWidth < 768;
  }
  
  init() {
    this.resize();
    this.createParticles();
    this.animate();
    
    window.addEventListener('resize', () => this.resize());
    window.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    
    // Respect reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.particleCount = 0;
    }
  }
  
  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    
    // Recreate particles on resize
    if (this.particleCount > 0) {
      this.particles = [];
      this.createParticles();
    }
  }
  
  createParticles() {
    for (let i = 0; i < this.particleCount; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        size: Math.random() * 2 + 1,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: (Math.random() - 0.5) * 0.5,
        opacity: Math.random() * 0.5 + 0.2
      });
    }
  }
  
  handleMouseMove(e) {
    this.mouse.x = e.x;
    this.mouse.y = e.y;
  }
  
  drawParticles() {
    this.particles.forEach((particle, index) => {
      // Update position
      particle.x += particle.speedX;
      particle.y += particle.speedY;
      
      // Wrap around screen
      if (particle.x > this.canvas.width) particle.x = 0;
      if (particle.x < 0) particle.x = this.canvas.width;
      if (particle.y > this.canvas.height) particle.y = 0;
      if (particle.y < 0) particle.y = this.canvas.height;
      
      // Get accent color from CSS variable
      const accentColor = getComputedStyle(document.documentElement)
        .getPropertyValue('--accent').trim();
      
      // Draw particle
      this.ctx.fillStyle = `rgba(${this.hexToRgb(accentColor)}, ${particle.opacity})`;
      this.ctx.beginPath();
      this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      this.ctx.fill();
      
      // Connect particles
      this.particles.slice(index + 1).forEach(otherParticle => {
        const dx = particle.x - otherParticle.x;
        const dy = particle.y - otherParticle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 120) {
          this.ctx.strokeStyle = `rgba(${this.hexToRgb(accentColor)}, ${0.2 * (1 - distance / 120)})`;
          this.ctx.lineWidth = 1;
          this.ctx.beginPath();
          this.ctx.moveTo(particle.x, particle.y);
          this.ctx.lineTo(otherParticle.x, otherParticle.y);
          this.ctx.stroke();
        }
      });
      
      // Mouse interaction
      if (this.mouse.x !== null && this.mouse.y !== null) {
        const dx = particle.x - this.mouse.x;
        const dy = particle.y - this.mouse.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < this.mouse.radius) {
          const force = (this.mouse.radius - distance) / this.mouse.radius;
          const angle = Math.atan2(dy, dx);
          particle.x += Math.cos(angle) * force * 2;
          particle.y += Math.sin(angle) * force * 2;
        }
      }
    });
  }
  
  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawParticles();
    requestAnimationFrame(() => this.animate());
  }
  
  hexToRgb(hex) {
    // Handle both #RRGGBB and rgb(r,g,b) formats
    if (hex.startsWith('rgb')) {
      return hex.match(/d+/g).slice(0, 3).join(',');
    }
    
    const result = /^#?([a-fd]{2})([a-fd]{2})([a-fd]{2})$/i.exec(hex);
    return result ?
      `${parseInt(result[1], 16)},${parseInt(result[2], 16)},${parseInt(result[3], 16)}` :
      '0,255,255';
  }
}

// Initialize particle background
document.addEventListener('DOMContentLoaded', () => {
  new ParticleBackground();
});

// ===== PROJECT CARD TILT EFFECT =====
class TiltEffect {
  constructor() {
    this.cards = [];
    this.init();
  }
  
  init() {
    // Wait for projects to load
    setTimeout(() => {
      this.cards = document.querySelectorAll('.project-card');
      this.addTiltEffect();
    }, 2000);
    
    // Re-initialize when theme changes
    document.addEventListener('click', (e) => {
      if (e.target.closest('.theme-btn')) {
        setTimeout(() => this.addTiltEffect(), 100);
      }
    });
  }
  
  addTiltEffect() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }
    
    this.cards = document.querySelectorAll('.project-card');
    
    this.cards.forEach(card => {
      card.addEventListener('mousemove', (e) => this.handleTilt(e, card));
      card.addEventListener('mouseleave', () => this.resetTilt(card));
    });
  }
  
  handleTilt(e, card) {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = ((y - centerY) / centerY) * -10;
    const rotateY = ((x - centerX) / centerX) * 10;
    
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
  }
  
  resetTilt(card) {
    card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
  }
}

// Initialize tilt effect
document.addEventListener('DOMContentLoaded', () => {
  new TiltEffect();
});

// ===== CURSOR GLOW EFFECT (Desktop only) =====
class CursorGlow {
  constructor() {
    if (window.innerWidth < 768) return;
    
    this.cursor = document.createElement('div');
    this.cursor.className = 'cursor-glow';
    this.cursor.style.cssText = `
      position: fixed;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      pointer-events: none;
      z-index: 9999;
      mix-blend-mode: screen;
      transition: transform 0.2s ease;
      display: none;
    `;
    
    document.body.appendChild(this.cursor);
    
    document.addEventListener('mousemove', (e) => this.handleMove(e));
    document.addEventListener('mouseenter', () => this.cursor.style.display = 'block');
    document.addEventListener('mouseleave', () => this.cursor.style.display = 'none');
  }
  
  handleMove(e) {
    const accentColor = getComputedStyle(document.documentElement)
      .getPropertyValue('--accent').trim();
    
    this.cursor.style.left = `${e.clientX - 10}px`;
    this.cursor.style.top = `${e.clientY - 10}px`;
    this.cursor.style.background = `radial-gradient(circle, ${accentColor} 0%, transparent 70%)`;
    
    // Scale up on interactive elements
    if (e.target.closest('a, button, input, textarea')) {
      this.cursor.style.transform = 'scale(2)';
    } else {
      this.cursor.style.transform = 'scale(1)';
    }
  }
}

// Initialize cursor glow (optional - can be removed if too distracting)
// document.addEventListener('DOMContentLoaded', () => {
//   new CursorGlow();
// });
