const admin = require('firebase-admin');
const serviceAccount = require('../../../serviceAccountKey.json');

const database = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

admin.firestore().settings({ ignoreUndefinedProperties: true });

module.exports = database;