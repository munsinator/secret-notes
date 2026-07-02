import posthog from 'posthog-js';

const posthogKey = import.meta.env.VITE_POSTHOG_KEY;
const posthogHost = import.meta.env.VITE_POSTHOG_HOST || 'https://eu.posthog.com';

export function initPostHog() {
  if (!posthogKey) {
    console.warn('PostHog is not initialized because VITE_POSTHOG_KEY is missing.');
    return;
  }

  posthog.init(posthogKey, {
    api_host: posthogHost,
    autocapture: false,
    capture_pageview: true,
    loaded: (posthogInstance) => {
      posthogInstance.identify(getAnonymousUserId());
    },
  });
}

export function getPostHog() {
  return posthog;
}

function getAnonymousUserId() {
  const storageKey = 'secret-notes-user-id';
  const existingUserId = localStorage.getItem(storageKey);

  if (existingUserId) {
    return existingUserId;
  }

  const newUserId = crypto.randomUUID();
  localStorage.setItem(storageKey, newUserId);

  return newUserId;
}