const fs = require('fs');

// Script to generate config.js from Environment Variables during Vercel Build
const config = `export const firebaseConfig = {
  apiKey: "${process.env.FIREBASE_API_KEY || ''}",
  authDomain: "${process.env.FIREBASE_AUTH_DOMAIN || ''}",
  databaseURL: "${process.env.FIREBASE_DATABASE_URL || ''}",
  projectId: "${process.env.FIREBASE_PROJECT_ID || ''}",
  storageBucket: "${process.env.FIREBASE_STORAGE_BUCKET || ''}",
  messagingSenderId: "${process.env.FIREBASE_MESSAGING_SENDER_ID || ''}",
  appId: "${process.env.FIREBASE_APP_ID || ''}",
  measurementId: "${process.env.FIREBASE_MEASUREMENT_ID || ''}"
};`;

try {
    fs.writeFileSync('./config.js', config);
    console.log('✅ config.js has been generated successfully from Environment Variables.');
} catch (err) {
    console.error('❌ Error generating config.js:', err);
    process.exit(1);
}
