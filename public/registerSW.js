if ('serviceWorker' in navigator && (window.location.protocol === 'https:' || window.location.hostname === 'localhost')) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js', { scope: '/' })
      .then((registration) => {
        console.debug('Voyan Service Worker registered with scope:', registration.scope);
      })
      .catch((error) => {
        console.warn('Voyan Service Worker registration failed:', error);
      });
  });
}
