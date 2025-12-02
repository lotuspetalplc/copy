// ===================================
// MAIN APPLICATION LOGIC
// Dippan Bhusal Portfolio - 2025
// ===================================

document.addEventListener('DOMContentLoaded', () => {
  initializeApp();
});

// Initialize all app features
function initializeApp() {
  initThemeSwitcher();
  initNavigation();
  initTypingAnimation();
  initSectionReveal();
  initContactForm();
  initSmoothScroll();
  updateCopyrightYear();
}

// ===== THEME SWITCHER =====
function initThemeSwitcher() {
  const themeButtons = document.querySelectorAll('.theme-btn');
  const savedTheme = localStorage.getItem('theme') || 'dark';
  
  // Apply saved theme
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateActiveThemeButton(savedTheme);
  
  themeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const theme = btn.getAttribute('data-theme');
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('theme', theme);
      updateActiveThemeButton(theme);
    });
  });
}

function updateActiveThemeButton(theme) {
  document.querySelectorAll('.theme-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-theme') === theme);
  });
}

// ===== NAVIGATION =====
function initNavigation() {
  const navToggle = document.querySelector('.nav-toggle');
  const navMenu = document.querySelector('.nav-menu');
  const navLinks = document.querySelectorAll('.nav-menu a');
  
  if (navToggle) {
    navToggle.addEventListener('click', () => {
      const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', !isExpanded);
      navToggle.classList.toggle('active');
      navMenu.classList.toggle('active');
    });
  }
  
  // Close menu when clicking nav links
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      navToggle.classList.remove('active');
      navMenu.classList.remove('active');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });
  
  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.navbar') && navMenu.classList.contains('active')) {
      navToggle.classList.remove('active');
      navMenu.classList.remove('active');
      navToggle.setAttribute('aria-expanded', 'false');
    }
  });
  
  // Navbar scroll effect
  let lastScroll = 0;
  const navbar = document.querySelector('.navbar');
  
  window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 100) {
      navbar.style.background = 'rgba(11, 15, 20, 0.95)';
      navbar.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.3)';
    } else {
      navbar.style.background = 'rgba(11, 15, 20, 0.8)';
      navbar.style.boxShadow = 'none';
    }
    
    lastScroll = currentScroll;
  });
}

// ===== TYPING ANIMATION =====
function initTypingAnimation() {
  const typedTextElement = document.getElementById('typed-text');
  if (!typedTextElement) return;
  
  const texts = [
    'Creative Frontend Developer',
    'Tech Enthusiast',
    'Problem Solver',
    'UI/UX Lover'
  ];
  
  let textIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let typingSpeed = 100;
  
  function type() {
    const currentText = texts[textIndex];
    
    if (isDeleting) {
      typedTextElement.textContent = currentText.substring(0, charIndex - 1);
      charIndex--;
      typingSpeed = 50;
    } else {
      typedTextElement.textContent = currentText.substring(0, charIndex + 1);
      charIndex++;
      typingSpeed = 100;
    }
    
    if (!isDeleting && charIndex === currentText.length) {
      isDeleting = true;
      typingSpeed = 2000; // Pause at end
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      textIndex = (textIndex + 1) % texts.length;
      typingSpeed = 500; // Pause before next text
    }
    
    setTimeout(type, typingSpeed);
  }
  
  // Start typing animation
  type();
}

// ===== SECTION REVEAL ANIMATION =====
function initSectionReveal() {
  const sections = document.querySelectorAll('.section-reveal');
  
  const observerOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -100px 0px'
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);
  
  sections.forEach(section => {
    observer.observe(section);
  });
}

// ===== CONTACT FORM =====
function initContactForm() {
  const form = document.getElementById('contact-form');
  const formStatus = document.getElementById('form-status');
  
  if (!form) return;
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(form);
    const button = form.querySelector('button[type="submit"]');
    const originalButtonText = button.innerHTML;
    
    // Disable button and show loading
    button.disabled = true;
    button.innerHTML = '<span>Sending...</span>';
    formStatus.style.display = 'none';
    
    try {
      const response = await fetch(form.action, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (response.ok) {
        formStatus.textContent = '✓ Message sent successfully! I\'ll get back to you soon.';
        formStatus.className = 'form-status success';
        formStatus.style.display = 'block';
        form.reset();
      } else {
        throw new Error('Form submission failed');
      }
    } catch (error) {
      formStatus.textContent = '✗ Oops! Something went wrong. Please try again or email me directly.';
      formStatus.className = 'form-status error';
      formStatus.style.display = 'block';
    } finally {
      button.disabled = false;
      button.innerHTML = originalButtonText;
    }
  });
}

// ===== SMOOTH SCROLL =====
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href === '#') return;
      
      e.preventDefault();
      const target = document.querySelector(href);
      
      if (target) {
        const navHeight = document.querySelector('.navbar').offsetHeight;
        const targetPosition = target.offsetTop - navHeight;
        
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
}

// ===== UPDATE COPYRIGHT YEAR =====
function updateCopyrightYear() {
  const year = new Date().getFullYear();
  const copyrightElement = document.querySelector('.footer-content p');
  if (copyrightElement) {
    copyrightElement.textContent = `© ${year} Dippan Bhusal. All rights reserved.`;
  }
}

// ===== UTILITY: DEBOUNCE =====
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Export for use in other modules if needed
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { debounce };
}
// Load AI SEO optimizer
const seoScript = document.createElement('script');
seoScript.src = 'js/ai-seo.js';
document.body.appendChild(seoScript);
