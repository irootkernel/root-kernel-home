import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js';
import {
  initializeAppCheck,
  ReCaptchaV3Provider
} from 'https://www.gstatic.com/firebasejs/12.15.0/firebase-app-check.js';
import {
  addDoc,
  collection,
  getFirestore,
  serverTimestamp
} from 'https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js';

const ALLOWED_TOPICS = new Set([
  'Lecture',
  'Workshop',
  'Consulting',
  'PoC / Product Development Collaboration'
]);

const LIMITS = {
  name: 80,
  email: 120,
  organization: 120,
  subject: 160,
  message: 4000,
  pageUrl: 500
};

const copy = {
  ko: {
    disabled: '문의 저장 설정이 아직 완료되지 않았습니다. 직접 이메일로 연락해 주세요.',
    invalid: '필수 항목과 동의 여부를 확인해 주세요.',
    sending: '저장 중...',
    success: '문의가 저장되었습니다. 확인 후 연락드리겠습니다.',
    failure: '문의 저장에 실패했습니다. 잠시 후 다시 시도하거나 직접 이메일로 연락해 주세요.',
    button: '문의 저장하기'
  },
  en: {
    disabled: 'Contact storage is not configured yet. Please use direct email.',
    invalid: 'Check the required fields and consent checkbox.',
    sending: 'Saving...',
    success: 'Your inquiry was saved. We will review it and follow up.',
    failure: 'Could not save the inquiry. Try again later or use direct email.',
    button: 'Save inquiry'
  }
};

function getLanguage() {
  return document.body.getAttribute('data-lang') === 'en' ? 'en' : 'ko';
}

function trimValue(value) {
  return String(value || '').trim();
}

function isConfigured(config) {
  if (!config || config.enabled !== true) return false;
  if (!config.appCheckSiteKey || config.appCheckSiteKey.startsWith('REPLACE_WITH_')) return false;

  const firebaseConfig = config.firebaseConfig || {};
  return [
    'apiKey',
    'authDomain',
    'projectId',
    'appId'
  ].every((key) => firebaseConfig[key] && !String(firebaseConfig[key]).startsWith('REPLACE_WITH_'));
}

function setStatus(form, message, state) {
  const status = form.querySelector('[data-contact-status]');
  if (!status) return;
  status.textContent = message;
  status.setAttribute('data-state', state);
}

function setSubmitting(form, isSubmitting, labels) {
  const submit = form.querySelector('[type="submit"]');
  if (!submit) return;
  submit.disabled = isSubmitting;
  submit.textContent = isSubmitting ? labels.sending : labels.button;
}

function disableSubmit(form, labels) {
  const submit = form.querySelector('[type="submit"]');
  if (submit) {
    submit.disabled = true;
    submit.textContent = labels.button;
  }
  form.addEventListener('submit', (event) => event.preventDefault());
}

function isWithinLimit(value, maxLength) {
  return value.length > 0 && value.length <= maxLength;
}

function optionalWithinLimit(value, maxLength) {
  return value.length <= maxLength;
}

function buildSubmission(form) {
  const formData = new FormData(form);
  const topic = trimValue(formData.get('topic'));
  const name = trimValue(formData.get('name'));
  const email = trimValue(formData.get('email'));
  const organization = trimValue(formData.get('organization'));
  const subject = trimValue(formData.get('subject'));
  const message = trimValue(formData.get('message'));
  const honeypot = trimValue(formData.get('website'));

  if (honeypot) return null;
  if (!ALLOWED_TOPICS.has(topic)) return null;
  if (!isWithinLimit(name, LIMITS.name)) return null;
  if (!isWithinLimit(email, LIMITS.email) || !email.includes('@')) return null;
  if (!optionalWithinLimit(organization, LIMITS.organization)) return null;
  if (!optionalWithinLimit(subject, LIMITS.subject)) return null;
  if (!isWithinLimit(message, LIMITS.message)) return null;
  if (formData.get('consent') !== 'agreed') return null;

  return {
    topic,
    name,
    email,
    organization,
    subject,
    message,
    consent: true,
    locale: getLanguage(),
    source: 'rootkernel-homepage-v4',
    pageUrl: window.location.href.slice(0, LIMITS.pageUrl),
    status: 'new',
    createdAt: serverTimestamp()
  };
}

function initContactForms() {
  const forms = Array.from(document.querySelectorAll('[data-firestore-contact]'));
  if (!forms.length) return;

  const labels = copy[getLanguage()];
  const config = window.RootKernelContactFirebase;

  if (!isConfigured(config)) {
    forms.forEach((form) => {
      setStatus(form, labels.disabled, 'error');
      disableSubmit(form, labels);
    });
    return;
  }

  const app = initializeApp(config.firebaseConfig);
  initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider(config.appCheckSiteKey),
    isTokenAutoRefreshEnabled: true
  });
  const db = getFirestore(app);
  const collectionName = config.collection || 'contactSubmissions';

  forms.forEach((form) => {
    setSubmitting(form, false, labels);
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const submission = buildSubmission(form);
      if (!submission) {
        setStatus(form, labels.invalid, 'error');
        return;
      }

      setSubmitting(form, true, labels);
      setStatus(form, labels.sending, 'pending');

      try {
        await addDoc(collection(db, collectionName), submission);
        form.reset();
        setStatus(form, labels.success, 'success');
      } catch (_error) {
        setStatus(form, labels.failure, 'error');
      } finally {
        setSubmitting(form, false, labels);
      }
    });
  });
}

initContactForms();
