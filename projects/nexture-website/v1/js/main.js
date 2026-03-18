// ============================================
// NEXTURE WEBSITE v1 - MAIN JAVASCRIPT
// ============================================

(function() {
  'use strict';

  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ============================================
  // NAVIGATION
  // ============================================

  const nav = document.querySelector('.nav');
  const navToggle = document.querySelector('.nav__toggle');
  const navLinks = document.querySelector('.nav__links');
  const navLinkItems = document.querySelectorAll('.nav__links a:not(.btn)');

  // Scroll state
  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    if (currentScroll > 50) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }

    lastScroll = currentScroll;
  });

  // Mobile toggle
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', !isExpanded);
      navLinks.classList.toggle('active');
    });

    // Close menu when clicking a link
    navLinkItems.forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // Active page highlighting
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  navLinkItems.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

  // ============================================
  // SCROLL REVEAL
  // ============================================

  if (!prefersReducedMotion) {
    const revealElements = document.querySelectorAll('.reveal');

    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal--active');
          revealObserver.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(el => {
      revealObserver.observe(el);
    });
  } else {
    // If reduced motion, show all elements immediately
    document.querySelectorAll('.reveal').forEach(el => {
      el.classList.add('reveal--active');
    });
  }

  // ============================================
  // FAQ ACCORDION
  // ============================================

  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const question = item.querySelector('.faq-item__question');

    if (question) {
      question.addEventListener('click', () => {
        const isActive = item.classList.contains('active');

        // Close all other items
        faqItems.forEach(otherItem => {
          if (otherItem !== item) {
            otherItem.classList.remove('active');
          }
        });

        // Toggle current item
        item.classList.toggle('active');
      });
    }
  });

  // ============================================
  // FORM VALIDATION & SUBMISSION
  // ============================================

  const contactForm = document.getElementById('contact-form');

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      // Clear previous errors
      document.querySelectorAll('.form-group').forEach(group => {
        group.classList.remove('error');
      });

      let isValid = true;

      // Validate name
      const nameInput = document.getElementById('name');
      if (nameInput && nameInput.value.trim() === '') {
        showError(nameInput, 'Please enter your name');
        isValid = false;
      }

      // Validate email
      const emailInput = document.getElementById('email');
      if (emailInput) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (emailInput.value.trim() === '') {
          showError(emailInput, 'Please enter your email');
          isValid = false;
        } else if (!emailRegex.test(emailInput.value)) {
          showError(emailInput, 'Please enter a valid email');
          isValid = false;
        }
      }

      // Validate organization
      const orgInput = document.getElementById('organization');
      if (orgInput && orgInput.value.trim() === '') {
        showError(orgInput, 'Please enter your organization');
        isValid = false;
      }

      // Validate message
      const messageInput = document.getElementById('message');
      if (messageInput && messageInput.value.trim() === '') {
        showError(messageInput, 'Please enter a message');
        isValid = false;
      }

      if (isValid) {
        // Get form data
        const formData = {
          name: nameInput.value,
          email: emailInput.value,
          organization: orgInput.value,
          role: document.getElementById('role')?.value || '',
          requestType: document.getElementById('request-type')?.value || '',
          message: messageInput.value
        };

        console.log('Form submitted:', formData);

        // Show success message
        alert('Thank you for your message! We will get back to you soon.');
        contactForm.reset();
      }
    });
  }

  function showError(input, message) {
    const formGroup = input.closest('.form-group');
    if (formGroup) {
      formGroup.classList.add('error');
      const errorElement = formGroup.querySelector('.form-error');
      if (errorElement) {
        errorElement.textContent = message;
      }
    }
  }

  // ============================================
  // SMOOTH SCROLL FOR ANCHOR LINKS
  // ============================================

  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href === '#') return;

      e.preventDefault();
      const target = document.querySelector(href);

      if (target) {
        const offsetTop = target.offsetTop - 80; // Account for fixed nav
        window.scrollTo({
          top: offsetTop,
          behavior: prefersReducedMotion ? 'auto' : 'smooth'
        });
      }
    });
  });

  // ============================================
  // PARTICLE SYSTEM (CANVAS)
  // ============================================

  const heroCanvas = document.getElementById('hero-canvas');

  if (heroCanvas && !prefersReducedMotion) {
    const ctx = heroCanvas.getContext('2d');
    let particles = [];
    let mouse = { x: null, y: null, radius: 150 };
    let animationId;

    // Set canvas size
    function resizeCanvas() {
      heroCanvas.width = heroCanvas.offsetWidth;
      heroCanvas.height = heroCanvas.offsetHeight;
      initParticles();
    }

    // Particle class
    class Particle {
      constructor() {
        this.x = Math.random() * heroCanvas.width;
        this.y = Math.random() * heroCanvas.height;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.radius = Math.random() * 2 + 1;

        // Random color from particle palette
        const colors = ['#00C8E8', '#5870E8', '#9050C8'];
        this.color = colors[Math.floor(Math.random() * colors.length)];
      }

      update() {
        // Mouse repel effect
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < mouse.radius) {
          const force = (mouse.radius - distance) / mouse.radius;
          const angle = Math.atan2(dy, dx);
          this.vx -= Math.cos(angle) * force * 0.5;
          this.vy -= Math.sin(angle) * force * 0.5;
        }

        // Update position
        this.x += this.vx;
        this.y += this.vy;

        // Friction
        this.vx *= 0.98;
        this.vy *= 0.98;

        // Boundary check
        if (this.x < 0 || this.x > heroCanvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > heroCanvas.height) this.vy *= -1;

        // Keep in bounds
        this.x = Math.max(0, Math.min(heroCanvas.width, this.x));
        this.y = Math.max(0, Math.min(heroCanvas.height, this.y));
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
      }
    }

    // Initialize particles
    function initParticles() {
      particles = [];
      const particleCount = window.innerWidth < 768 ? 40 : 80;

      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
      }
    }

    // Connect particles
    function connectParticles() {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 120) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(88, 112, 232, ${(1 - distance / 120) * 0.2})`;
            ctx.lineWidth = 1;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
    }

    // Animation loop
    function animate() {
      ctx.clearRect(0, 0, heroCanvas.width, heroCanvas.height);

      particles.forEach(particle => {
        particle.update();
        particle.draw();
      });

      connectParticles();

      animationId = requestAnimationFrame(animate);
    }

    // Mouse move event
    heroCanvas.addEventListener('mousemove', (e) => {
      const rect = heroCanvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    });

    heroCanvas.addEventListener('mouseleave', () => {
      mouse.x = null;
      mouse.y = null;
    });

    // Window resize
    window.addEventListener('resize', resizeCanvas);

    // Initialize
    resizeCanvas();
    animate();

    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    });
  }

  // ============================================
  // LOADING OVERLAY
  // ============================================

  window.addEventListener('DOMContentLoaded', () => {
    const loadingOverlay = document.querySelector('.loading-overlay');
    if (loadingOverlay) {
      setTimeout(() => {
        loadingOverlay.classList.add('hidden');
      }, 300);
    }
  });

})();
