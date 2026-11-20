/* Independently written navigation and photo gallery. No WordPress scripts. */
(() => {
  'use strict';
  document.body.dataset.js = 'true';
  const menuButton = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.main-nav');
  const dropdown = document.querySelector('.nav-dropdown');
  const submenuButton = document.querySelector('.submenu-toggle');
  const screen = window.matchMedia('(max-width: 1024px)');

  function setMenu(open) {
    if (!nav || !menuButton) return;
    nav.classList.toggle('is-open', open);
    menuButton.setAttribute('aria-expanded', String(open));
    const label = menuButton.querySelector('.sr-only');
    if (label) label.textContent = open ? 'Close navigation' : 'Open navigation';
  }
  function setSubmenu(open, dismiss = false) {
    if (!dropdown || !submenuButton) return;
    dropdown.classList.toggle('is-open', open);
    dropdown.classList.toggle('is-dismissed', dismiss);
    submenuButton.setAttribute('aria-expanded', String(open));
  }
  menuButton?.addEventListener('click', () => {
    const open = menuButton.getAttribute('aria-expanded') !== 'true';
    setMenu(open);
    if (!open) setSubmenu(false);
  });
  submenuButton?.addEventListener('click', () => {
    const open = !dropdown.classList.contains('is-open');
    setSubmenu(open, !open);
  });
  dropdown?.addEventListener('pointerenter', () => {
    if (!screen.matches && !dropdown.classList.contains('is-dismissed')) submenuButton?.setAttribute('aria-expanded', 'true');
  });
  dropdown?.addEventListener('pointerleave', () => {
    dropdown.classList.remove('is-dismissed');
    if (!dropdown.classList.contains('is-open')) submenuButton?.setAttribute('aria-expanded', 'false');
  });
  document.addEventListener('click', (event) => {
    if (dropdown && !dropdown.contains(event.target)) setSubmenu(false, dropdown.matches(':focus-within'));
    if (screen.matches && nav && menuButton && !nav.contains(event.target) && !menuButton.contains(event.target)) setMenu(false);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    if (dropdown?.contains(document.activeElement) || dropdown?.classList.contains('is-open')) {
      setSubmenu(false, true);
      submenuButton?.focus();
    } else if (screen.matches && nav?.classList.contains('is-open')) {
      setMenu(false);
      menuButton?.focus();
    }
  });
  screen.addEventListener('change', () => { setMenu(false); setSubmenu(false); });

  const items = [...document.querySelectorAll('a[data-gallery]')];
  const dialog = document.querySelector('#image-dialog');
  const preview = document.querySelector('#dialog-image');
  if (!items.length || !dialog || !preview || typeof dialog.showModal !== 'function') return;
  let current = 0;
  let opener = null;
  function show(index) {
    current = (index + items.length) % items.length;
    preview.src = items[current].href;
    preview.alt = items[current].querySelector('img')?.alt || '';
  }
  items.forEach((item, index) => item.addEventListener('click', (event) => {
    event.preventDefault();
    opener = item;
    show(index);
    dialog.showModal();
    dialog.querySelector('.dialog-close')?.focus();
  }));
  dialog.querySelector('.dialog-close')?.addEventListener('click', () => dialog.close());
  dialog.querySelector('.dialog-prev')?.addEventListener('click', () => show(current - 1));
  dialog.querySelector('.dialog-next')?.addEventListener('click', () => show(current + 1));
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
  dialog.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft') { event.preventDefault(); show(current - 1); }
    if (event.key === 'ArrowRight') { event.preventDefault(); show(current + 1); }
  });
  dialog.addEventListener('close', () => { preview.removeAttribute('src'); opener?.focus(); });
})();

/* ==========================================
   CONTACT FORM SUBMISSION
========================================== */

(() => {
  "use strict";

  const form = document.querySelector(
    "[data-contact-form]"
  );

  if (!form) return;

  const status = form.querySelector(
    "#form-preview-status"
  );

  const button = form.querySelector(
    'button[type="submit"]'
  );


  /* ========================================
     CHECK FOR LOCAL PREVIEW
  ======================================== */

  const preview = [
    "localhost",
    "127.0.0.1",
    "::1"
  ].includes(location.hostname);


  /* ========================================
     FORM SUBMISSION
  ======================================== */

  form.addEventListener(
    "submit",
    async (event) => {

      event.preventDefault();

      if (!form.reportValidity()) return;

      status.hidden = false;

      status.classList.remove(
        "error",
        "success"
      );


      /* ====================================
         LOCAL PREVIEW
      ==================================== */

      if (preview) {

        status.textContent =
          "Local preview only: no message was sent. Test email delivery on Hostinger staging.";

        return;

      }


      /* ====================================
         SEND TO SERVER
      ==================================== */

      button.disabled = true;

      status.textContent =
        "Sending your message…";

      try {

        const response = await fetch(
          form.action,
          {
            method: "POST",

            body: new FormData(form),

            credentials: "same-origin",

            headers: {
              "Accept": "application/json"
            }
          }
        );


        const result = await response.json();


        if (!response.ok || !result.ok) {

          throw new Error(
            result.message ||
            "Message could not be sent."
          );

        }


        /* SUCCESS */

        status.classList.add("success");

        status.textContent =
          "Your message has been sent. Thank you!";

        form.reset();

      } catch (error) {


        /* ERROR */

        status.classList.add("error");

        status.textContent =
          "Your message could not be sent. Please contact us by email or phone.";

      } finally {

        button.disabled = false;

      }

    }
  );

})();

/* ==========================================
   SCROLL ENTRANCE ANIMATIONS
========================================== */

(() => {
  "use strict";

  // Respect visitors who prefer reduced motion.

  if (
    window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches
  ) {
    return;
  }


  /* ========================================
     ELEMENTS TO ANIMATE
  ======================================== */

  const animationMap = [

    // HOMEPAGE HERO

    [".home-hero .hero-copy h1", "fade"],
    [".home-hero .hero-questions", "zoom"],
    [".home-hero .hero-description", "fade"],
    [".home-hero .hero-gallery", "fade"],


    // ACHIEVEMENTS

    [
      ".home-achievements > h2, .inner-achievements > h2",
      "fade"
    ],

    [".achievement-card", "fade"],


    // TEAM

    [".team-title", "fade"],
    [".coach-card", "fade"],


    // SERVICES

    [
      ".services-panel > h2, .services-page > .page-title",
      "fade"
    ],

    [".service-card", "fade"],


    // WHY CHOOSE US

    [".why-section > h2", "fade"],
    [".why-grid > ul", "fade"],


    // ABOUT US

    [".mission h1, .mission h2", "fade"],
    [".mission p", "fade"],


    // INDIVIDUAL SERVICE PAGES

    [".detail-photo", "fade"],
    [".article-copy h1", "fade"],


    // CONTACT PAGE

    [".contact-form", "fade"],


    // FOOTER

    [".site-footer .footer-logo", "up"],
    [".site-footer .footer-contact", "up"],
    [".site-footer .footer-cta", "up"],
    [".site-footer .footer-links", "fade"],
    [".site-footer .footer-bottom", "fade"]

  ];


  /* ========================================
     COLLECT ELEMENTS
  ======================================== */

  const elements = [];

  for (const [selector, effect] of animationMap) {

    document.querySelectorAll(selector).forEach(
      (element, index) => {

        element.dataset.reveal = effect;

        element.style.setProperty(
          "--reveal-delay",
          `${Math.min(index * 100, 300)}ms`
        );

        elements.push(element);

      }
    );

  }


  /* ========================================
     CHECK BROWSER SUPPORT
  ======================================== */

  if (
    !elements.length ||
    !("IntersectionObserver" in window)
  ) {
    return;
  }


  /* ========================================
     ENABLE ANIMATIONS
  ======================================== */

  document.documentElement.classList.add(
    "motion-ready"
  );


  /* ========================================
     OBSERVE ELEMENT VISIBILITY
  ======================================== */

  const observer = new IntersectionObserver(

    (entries) => {

      for (const entry of entries) {

        if (entry.isIntersecting) {

          entry.target.classList.add(
            "is-visible"
          );

          observer.unobserve(entry.target);

        }

      }

    },

    {
      threshold: 0.08,
      rootMargin: "0px 0px 75px 0px"
    }

  );


  /* ========================================
     START OBSERVING
  ======================================== */

  elements.forEach((element) => {

    observer.observe(element);

  });

})();