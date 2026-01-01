// Firebase Configuration for Emulators
// Use this in your app to connect to Firebase Emulators

// Firebase config (substitua com suas credenciais reais)
const firebaseConfig = {
  apiKey: "demo-api-key",
  authDomain: "planning-with-ai-fa2a3.firebaseapp.com",
  projectId: "planning-with-ai-fa2a3",
  storageBucket: "planning-with-ai-fa2a3.appspot.com",
  messagingSenderId: "123456789",
  appId: "demo-app-id"
};

// Detectar se está em modo desenvolvimento (emuladores)
const USE_EMULATORS = window.location.hostname === 'localhost' || 
                     window.location.hostname === '127.0.0.1' ||
                     process.env.NODE_ENV === 'development';

// Exportar configuração
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { firebaseConfig, USE_EMULATORS };
}

