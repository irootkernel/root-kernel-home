(function () {
  const pageLang = document.body.getAttribute('data-lang') === 'en' ? 'en' : 'ko';
  const progress = document.querySelector('.scroll-progress span');
  function updateProgress() {
    if (!progress) return;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const pct = max > 0 ? (window.scrollY / max) * 100 : 0;
    progress.style.width = pct + '%';
  }
  updateProgress();
  window.addEventListener('scroll', updateProgress, { passive: true });
  window.addEventListener('resize', updateProgress);

  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('#primary-nav');
  if (toggle && nav) {
    const menuLabels = pageLang === 'en'
      ? { open: 'Open menu', close: 'Close menu' }
      : { open: '메뉴 열기', close: '메뉴 닫기' };
    toggle.setAttribute('aria-label', menuLabels.open);
    toggle.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? menuLabels.close : menuLabels.open);
    });
  }

  const reveals = Array.from(document.querySelectorAll('.reveal'));
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      }
    }, { threshold: 0.08 });
    reveals.forEach((el) => observer.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add('is-visible'));
  }

  const mailForms = Array.from(document.querySelectorAll('[data-mail-form]'));
  mailForms.forEach((form) => {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const formData = new FormData(form);
      const recipient = form.getAttribute('data-recipient') || 'contact@rootkernel.xyz';
      const subjectPrefix = form.getAttribute('data-subject-prefix') || 'Root Kernel Inquiry';
      const topic = formData.get('topic') || 'General';
      const subjectInput = formData.get('subject') || '';
      const mailSubject = subjectInput
        ? subjectPrefix + ' - ' + topic + ' - ' + subjectInput
        : subjectPrefix + ' - ' + topic;

      const lines = [
        'Topic: ' + topic,
        'Name: ' + (formData.get('name') || ''),
        'Email: ' + (formData.get('email') || ''),
        'Organization: ' + (formData.get('organization') || ''),
        'Subject: ' + subjectInput,
        '',
        'Message:',
        formData.get('message') || ''
      ];

      const subject = encodeURIComponent(mailSubject);
      const body = encodeURIComponent(lines.join('\n'));
      window.location.href = 'mailto:' + recipient + '?subject=' + subject + '&body=' + body;
    });
  });

  const founderButtons = Array.from(document.querySelectorAll('[data-founder-open]'));
  if (founderButtons.length) {
    const lang = pageLang;
    const copy = {
      ko: {
        title: 'Founder',
        intro: '컴퓨터공학 석사 · 10년 이상의 소프트웨어 엔지니어링 경력',
        body: '운영체제, 관계형 데이터베이스, 클라우드 시스템을 연구·개발했습니다.',
        credentials: [
          'Certified Kubernetes Administrator (CKA)',
          'Certified Kubernetes Application Developer (CKAD)'
        ],
        close: '닫기'
      },
      en: {
        title: 'Founder',
        intro: 'M.S. in Computer Engineering · Over 10 years of software engineering experience',
        body: 'Research and development across operating systems, relational database systems, and cloud platforms.',
        credentials: [
          'Certified Kubernetes Administrator (CKA)',
          'Certified Kubernetes Application Developer (CKAD)'
        ],
        close: 'Close'
      }
    }[lang];

    founderButtons.forEach((button) => {
      button.setAttribute('aria-label', lang === 'en' ? 'Founder profile' : '대표 소개');
    });

    const dialog = document.createElement('dialog');
    dialog.className = 'founder-dialog';
    dialog.setAttribute('aria-labelledby', 'founder-dialog-title');
    dialog.innerHTML = [
      '<div class="founder-dialog-shell">',
      '<div class="founder-dialog-head">',
      '<div><p class="eyebrow">Root Kernel</p><h2 id="founder-dialog-title">' + copy.title + '</h2></div>',
      '<button class="founder-dialog-close" type="button" aria-label="' + copy.close + '">&times;</button>',
      '</div>',
      '<div class="founder-dialog-body">',
      '<p class="hero-lead">' + copy.intro + '</p>',
      '<p>' + copy.body + '</p>',
      '<ul class="founder-credential-list">' + copy.credentials.map((item) => '<li>' + item + '</li>').join('') + '</ul>',
      '</div>',
      '</div>'
    ].join('');
    document.body.appendChild(dialog);

    const closeButton = dialog.querySelector('.founder-dialog-close');
    founderButtons.forEach((button) => {
      button.addEventListener('click', () => {
        if (typeof dialog.showModal === 'function') {
          dialog.showModal();
        } else {
          dialog.setAttribute('open', '');
        }
      });
    });
    closeButton.addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', (event) => {
      if (event.target === dialog) dialog.close();
    });
  }

  const lang = pageLang;
  const zoomableImageSelector = '.hero-image-figure > img, .card-asset-figure > img';

  function imageModalTriggerLabel(image) {
    const explicitLabel = image.getAttribute('data-modal-label') || image.closest('figure')?.getAttribute('data-modal-label');
    if (explicitLabel) return explicitLabel;
    return lang === 'en' ? 'Expand image' : '이미지 확대';
  }

  function enhanceImageModalTriggers(root) {
    const images = [];
    if (root.matches && root.matches(zoomableImageSelector)) images.push(root);
    images.push(...Array.from(root.querySelectorAll(zoomableImageSelector)));
    images.forEach((image) => {
      if (image.closest('.image-modal-trigger')) return;
      const trigger = document.createElement('button');
      trigger.className = 'image-modal-trigger';
      trigger.type = 'button';
      trigger.setAttribute('aria-label', imageModalTriggerLabel(image));
      image.parentNode.insertBefore(trigger, image);
      trigger.appendChild(image);
    });
  }

  enhanceImageModalTriggers(document);

  if (document.querySelector('.image-modal-trigger') || document.querySelector('[data-detail-key]')) {
    const closeLabel = lang === 'en' ? 'Close expanded image' : '확대 이미지 닫기';
    const dialogLabel = lang === 'en' ? 'Expanded image' : '확대 이미지';
    const dialog = document.createElement('dialog');
    const shell = document.createElement('div');
    const head = document.createElement('div');
    const closeButton = document.createElement('button');
    const frame = document.createElement('div');
    const modalImage = document.createElement('img');
    let lastTrigger = null;

    dialog.className = 'image-modal-dialog';
    dialog.setAttribute('aria-label', dialogLabel);
    shell.className = 'image-modal-shell';
    head.className = 'image-modal-head';
    closeButton.className = 'image-modal-close';
    closeButton.type = 'button';
    closeButton.setAttribute('aria-label', closeLabel);
    closeButton.textContent = '×';
    frame.className = 'image-modal-frame';
    modalImage.decoding = 'async';

    head.appendChild(closeButton);
    frame.appendChild(modalImage);
    shell.appendChild(head);
    shell.appendChild(frame);
    dialog.appendChild(shell);
    document.body.appendChild(dialog);

    function openImageModal(trigger) {
      const image = trigger.querySelector('img');
      if (!image) return;
      lastTrigger = trigger;
      modalImage.src = image.currentSrc || image.src;
      modalImage.alt = image.alt || trigger.getAttribute('aria-label') || '';
      if (typeof dialog.showModal === 'function') {
        dialog.showModal();
      } else {
        dialog.setAttribute('open', '');
      }
      closeButton.focus({ preventScroll: true });
    }

    document.addEventListener('click', (event) => {
      const trigger = event.target.closest('.image-modal-trigger');
      if (trigger) openImageModal(trigger);
    });
    closeButton.addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', (event) => {
      if (event.target === dialog) dialog.close();
    });
    dialog.addEventListener('close', () => {
      if (lastTrigger) lastTrigger.focus({ preventScroll: true });
    });

    if ('MutationObserver' in window) {
      const imageObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) enhanceImageModalTriggers(node);
          });
        });
      });
      imageObserver.observe(document.body, { childList: true, subtree: true });
    }
  }
})();
