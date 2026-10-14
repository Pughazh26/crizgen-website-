/**
 * Crizgen Website Scripts
 * Plain Vanilla JavaScript - No frameworks, zero external dependencies
 */

(function () {
  'use strict';

  // =========================================================================
  // 1. THEME TOGGLE (Dark / Light Theme with localStorage persistence)
  // =========================================================================
  const THEME_STORAGE_KEY = 'crizgen_theme_preference';
  const htmlRoot = document.documentElement;
  const themeToggleBtn = document.getElementById('themeToggle');
  const metaThemeColor = document.querySelector('meta[name="theme-color"]');

  /**
   * Safe localStorage getter with try/catch fallback
   */
  function getStoredTheme() {
    try {
      return localStorage.getItem(THEME_STORAGE_KEY);
    } catch (e) {
      console.warn('localStorage is not accessible:', e);
      return null;
    }
  }

  /**
   * Safe localStorage setter with try/catch fallback
   */
  function setStoredTheme(theme) {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch (e) {
      console.warn('localStorage is not writable:', e);
    }
  }

  /**
   * Apply theme to DOM and update meta theme-color
   */
  function applyTheme(theme) {
    htmlRoot.setAttribute('data-theme', theme);
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', theme === 'light' ? '#f8fafc' : '#090d16');
    }
    if (themeToggleBtn) {
      themeToggleBtn.setAttribute(
        'aria-label',
        theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'
      );
      themeToggleBtn.setAttribute(
        'title',
        theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'
      );
    }
  }

  /**
   * Determine initial theme:
   * 1. URL parameter (?theme=light or ?theme=dark)
   * 2. Saved preference in localStorage
   * 3. Otherwise default to 'dark' as specified in requirements
   */
  function initTheme() {
    const urlParams = new URLSearchParams(window.location.search);
    const themeParam = urlParams.get('theme');
    if (themeParam === 'light' || themeParam === 'dark') {
      applyTheme(themeParam);
      setStoredTheme(themeParam);
      return;
    }

    const saved = getStoredTheme();
    if (saved === 'light' || saved === 'dark') {
      applyTheme(saved);
    } else {
      // Dark theme by default
      applyTheme('dark');
    }
  }

  /**
   * Toggle between dark and light themes
   */
  function toggleTheme() {
    const currentTheme = htmlRoot.getAttribute('data-theme') || 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme(newTheme);
    setStoredTheme(newTheme);
  }

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', toggleTheme);
  }

  // Initialize theme immediately
  initTheme();

  // =========================================================================
  // 2. MOBILE NAVIGATION DRAWER
  // =========================================================================
  const mobileMenuToggle = document.getElementById('mobileMenuToggle');
  const mobileDrawer = document.getElementById('mobileDrawer');
  const mobileNavItems = document.querySelectorAll('.mobile-nav-item, .mobile-drawer-cta a');

  function openMobileMenu() {
    if (!mobileMenuToggle || !mobileDrawer) return;
    mobileMenuToggle.setAttribute('aria-expanded', 'true');
    mobileDrawer.classList.add('open');
    mobileDrawer.setAttribute('aria-hidden', 'false');
  }

  function closeMobileMenu() {
    if (!mobileMenuToggle || !mobileDrawer) return;
    mobileMenuToggle.setAttribute('aria-expanded', 'false');
    mobileDrawer.classList.remove('open');
    mobileDrawer.setAttribute('aria-hidden', 'true');
  }

  if (mobileMenuToggle && mobileDrawer) {
    mobileMenuToggle.addEventListener('click', function () {
      const isExpanded = mobileMenuToggle.getAttribute('aria-expanded') === 'true';
      if (isExpanded) {
        closeMobileMenu();
      } else {
        openMobileMenu();
      }
    });

    // Close when clicking any nav item inside the drawer
    mobileNavItems.forEach(function (item) {
      item.addEventListener('click', function () {
        closeMobileMenu();
      });
    });

    // Close when clicking outside drawer
    document.addEventListener('click', function (e) {
      if (
        mobileDrawer.classList.contains('open') &&
        !mobileDrawer.contains(e.target) &&
        !mobileMenuToggle.contains(e.target)
      ) {
        closeMobileMenu();
      }
    });

    // Close on Escape key
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && mobileDrawer.classList.contains('open')) {
        closeMobileMenu();
        mobileMenuToggle.focus();
      }
    });
  }

  // =========================================================================
  // 3. SCROLLSPY / ACTIVE NAV ITEM INDICATOR
  // =========================================================================
  const navLinks = document.querySelectorAll('.nav-links .nav-item');
  const sections = document.querySelectorAll('section[id]');

  function updateActiveNav() {
    const scrollPosition = window.scrollY + 120; // Offset for navbar

    sections.forEach(function (section) {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const sectionId = section.getAttribute('id');

      if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
        navLinks.forEach(function (link) {
          if (link.getAttribute('href') === '#' + sectionId) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }
    });
  }

  window.addEventListener('scroll', updateActiveNav, { passive: true });

  // =========================================================================
  // 4. SCROLL REVEAL ANIMATIONS (IntersectionObserver)
  // =========================================================================
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const urlParams = new URLSearchParams(window.location.search);
  const forceReveal = urlParams.get('revealed') === 'true';
  const revealElements = document.querySelectorAll('.reveal-fade');

  if (forceReveal || prefersReducedMotion || !('IntersectionObserver' in window)) {
    // Reveal all elements immediately if forced, reduced motion, or no observer support
    revealElements.forEach(function (el) {
      el.classList.add('revealed');
    });
  } else {
    const observerOptions = {
      root: null,
      rootMargin: '50px 0px 0px 0px',
      threshold: 0.05,
    };

    const revealObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    revealElements.forEach(function (el) {
      revealObserver.observe(el);
    });

    // Safety fallback: Reveal elements that are already within view
    window.addEventListener('scroll', function () {
      revealElements.forEach(function (el) {
        if (!el.classList.contains('revealed')) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= (window.innerHeight || document.documentElement.clientHeight) + 100) {
            el.classList.add('revealed');
          }
        }
      });
    }, { passive: true });
  }

  // =========================================================================
  // 5. CONTACT FORM VALIDATION & SUBMISSION
  // =========================================================================
  const contactForm = document.getElementById('contactForm');
  const userName = document.getElementById('userName');
  const userEmail = document.getElementById('userEmail');
  const userMessage = document.getElementById('userMessage');
  const nameError = document.getElementById('nameError');
  const emailError = document.getElementById('emailError');
  const messageError = document.getElementById('messageError');
  const formStatus = document.getElementById('formStatus');
  const submitBtn = document.getElementById('submitBtn');

  function clearErrors() {
    if (nameError) nameError.textContent = '';
    if (emailError) emailError.textContent = '';
    if (messageError) messageError.textContent = '';
    if (userName) userName.classList.remove('error');
    if (userEmail) userEmail.classList.remove('error');
    if (userMessage) userMessage.classList.remove('error');
    if (formStatus) {
      formStatus.className = 'form-status';
      formStatus.textContent = '';
    }
  }

  function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  }

  function validateForm() {
    let isValid = true;
    clearErrors();

    // Name check
    if (!userName.value.trim()) {
      nameError.textContent = 'Please enter your full name.';
      userName.classList.add('error');
      isValid = false;
    }

    // Email check
    if (!userEmail.value.trim()) {
      emailError.textContent = 'Please enter your email address.';
      userEmail.classList.add('error');
      isValid = false;
    } else if (!isValidEmail(userEmail.value.trim())) {
      emailError.textContent = 'Please enter a valid email address.';
      userEmail.classList.add('error');
      isValid = false;
    }

    // Message check
    if (!userMessage.value.trim()) {
      messageError.textContent = 'Please describe your project requirements.';
      userMessage.classList.add('error');
      isValid = false;
    } else if (userMessage.value.trim().length < 10) {
      messageError.textContent = 'Please provide a bit more detail (at least 10 characters).';
      userMessage.classList.add('error');
      isValid = false;
    }

    return isValid;
  }

  if (contactForm) {
    contactForm.addEventListener('submit', async function (e) {
      e.preventDefault();

      if (!validateForm()) {
        return;
      }

      const formAction = contactForm.getAttribute('action');
      const isPlaceholderEndpoint =
        !formAction ||
        formAction.includes('YOUR_FORM_ID') ||
        formAction.includes('your_form_id');

      // Loading state
      submitBtn.classList.add('loading');
      submitBtn.disabled = true;

      try {
        if (isPlaceholderEndpoint) {
          // Simulated submission when user hasn't yet hooked up Formspree endpoint
          await new Promise(function (resolve) {
            setTimeout(resolve, 800);
          });

          formStatus.className = 'form-status success';
          formStatus.innerHTML = `<strong>Thank you, ${userName.value.trim()}!</strong> Your project inquiry has been recorded. <em>(Form endpoint is in demo mode: please replace YOUR_FORM_ID in index.html with your Formspree/Web3Forms endpoint to receive emails.)</em>`;
          contactForm.reset();
        } else {
          // Live submission to Formspree / Web3Forms
          const formData = new FormData(contactForm);
          const response = await fetch(formAction, {
            method: 'POST',
            body: formData,
            headers: {
              Accept: 'application/json',
            },
          });

          if (response.ok) {
            formStatus.className = 'form-status success';
            formStatus.textContent =
              'Thank you! Your inquiry has been sent successfully. Our team will contact you within 24 hours.';
            contactForm.reset();
          } else {
            const data = await response.json().catch(function () {
              return {};
            });
            formStatus.className = 'form-status error';
            formStatus.textContent =
              data.error ||
              'Unable to send inquiry at this time. Please email us directly at hello@crizgen.com.';
          }
        }
      } catch (err) {
        console.error('Form submission error:', err);
        formStatus.className = 'form-status error';
        formStatus.textContent =
          'Network connection error. Please try again or email us directly at hello@crizgen.com.';
      } finally {
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
      }
    });

    // Real-time error clearance on input
    [userName, userEmail, userMessage].forEach(function (input) {
      if (input) {
        input.addEventListener('input', function () {
          if (this.classList.contains('error')) {
            this.classList.remove('error');
            const errSpan = document.getElementById(this.id.replace('user', '').toLowerCase() + 'Error');
            if (errSpan) errSpan.textContent = '';
          }
        });
      }
    });
  }

  // =========================================================================
  // 6. BACK TO TOP BUTTON
  // =========================================================================
  const backToTopBtn = document.getElementById('backToTopBtn');
  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', function (e) {
      e.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    });
  }

  // =========================================================================
  // 7. DYNAMIC COPYRIGHT YEAR
  // =========================================================================
  const currentYearSpan = document.getElementById('currentYear');
  if (currentYearSpan) {
    currentYearSpan.textContent = new Date().getFullYear();
  }
})();
