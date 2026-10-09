/** Configuration Firebase. Ces clés sont publiques par conception : la sécurité vient des règles Firestore (voir firestore.rules). */
export const FB_CONFIG = {
  apiKey: 'AIzaSyAiYeZwcmQSxBrTFzJxl9I1QJvSUjxVoVQ',
  authDomain: 'ascend-raphael.firebaseapp.com',
  projectId: 'ascend-raphael',
  storageBucket: 'ascend-raphael.firebasestorage.app',
  messagingSenderId: '432533880107',
  appId: '1:432533880107:web:4a5907519510d49dc1d96e'
};

/** Mode démo (?demo) : données dans localStorage, sans Firebase. */
export const isDemo = (): boolean => /[?&]demo\b/.test(window.location.search);
/** Active l'écran Chabbat en mode démo (?demo&shabbat). */
export const forceShabbatInDemo = (): boolean => /shabbat/.test(window.location.search);
