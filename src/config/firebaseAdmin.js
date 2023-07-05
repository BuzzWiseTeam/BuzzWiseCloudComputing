const firebaseAdmin = require('firebase-admin');

const serviceAccount = require('../../serviceAccountKey.json');

// Initialize Firebase
firebaseAdmin.initializeApp({
    credential: firebaseAdmin.credential.cert(serviceAccount),
    databaseURL: 'https://buzz-wise-team-default-rtdb.asia-southeast1.firebasedatabase.app'
});

firebaseAdmin.firestore().settings({ ignoreUndefinedProperties: true });

module.exports = firebaseAdmin;