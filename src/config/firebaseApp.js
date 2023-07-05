const firebaseApp = require('firebase/app');

require('firebase/auth');
require('firebase/firestore');
require('firebase/storage');
require('firebase/database');
require('firebase/analytics');

const firebaseConfig = {
  apiKey: 'AIzaSyAzhpanNmp5ZmZZOFqQgvV950PdR2OHXhk',
  authDomain: 'buzz-wise-team.firebaseapp.com',
  databaseURL: 'https://buzz-wise-team-default-rtdb.asia-southeast1.firebasedatabase.app',
  projectId: 'buzz-wise-team',
  storageBucket: 'buzz-wise-team.appspot.com',
  messagingSenderId: '986827973522',
  appId: '1:986827973522:web:9fa1bdaa19b8d95564974b',
  measurementId: 'G-5H08CCDCFM'
};

// Initialize Firebase
firebaseApp.initializeApp(firebaseConfig);

firebaseApp.firestore().settings({ ignoreUndefinedProperties: true });
firebaseApp.analytics.Analytics;

module.exports = firebaseApp;