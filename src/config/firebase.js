// Import the functions you need from the SDKs you need
const firebase = require('firebase/app');
require('firebase/auth');
require('firebase/firestore');

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

const firebaseConfig = {
  apiKey: 'AIzaSyAzhpanNmp5ZmZZOFqQgvV950PdR2OHXhk',
  authDomain: 'buzz-wise-team.firebaseapp.com',
  projectId: 'buzz-wise-team',
  storageBucket: 'buzz-wise-team.appspot.com',
  messagingSenderId: '986827973522',
  appId: '1:986827973522:web:9fa1bdaa19b8d95564974b',
  measurementId: 'G-5H08CCDCFM'
};

// Initialize Firebase
const InitializeApp = firebase.initializeApp(firebaseConfig);

firebase.firestore().settings({ ignoreUndefinedProperties: true });

module.exports = InitializeApp;