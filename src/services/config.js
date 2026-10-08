/* Configuration Firebase (clés publiques par conception : la sécurité vient des règles Firestore). */
export const FB_CONFIG = {
  apiKey: 'AIzaSyAiYeZwcmQSxBrTFzJxl9I1QJvSUjxVoVQ',
  authDomain: 'ascend-raphael.firebaseapp.com',
  projectId: 'ascend-raphael',
  storageBucket: 'ascend-raphael.firebasestorage.app',
  messagingSenderId: '432533880107',
  appId: '1:432533880107:web:4a5907519510d49dc1d96e'
};
export const SDK = 'https://www.gstatic.com/firebasejs/10.14.1/';
/** Mode démo (?demo) : données dans localStorage, sans Firebase. */
export const DEMO = typeof location !== 'undefined' && /[?&]demo\b/.test(location.search);
