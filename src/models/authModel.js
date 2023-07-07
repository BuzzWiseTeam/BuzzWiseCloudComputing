const { Storage } = require('@google-cloud/storage');

const firebaseAdmin = require('../config/firebaseAdmin');

const CloudStorage = new Storage({
    projectId: 'buzz-wise-team',
    keyFilename: 'serviceAccountKey.json'
});

/*  
    This middleware is to take the user data from
    firebase by access token given in headers with
    key = 'authorization' and the value = accessToken 
    and store it in req.user so we can use the req.user in controller
*/
const authenticate = async (req, res, next) => {
    const authorizationHeader = req.headers.authorization || req.headers.Authorization;

    if (authorizationHeader) {
        const bearerToken = authorizationHeader.split(' ')[1]; // Split the header by space and take the second part
        const idToken = bearerToken; // Assign the extracted token to the idToken variable

        // console.log("Token: " + idToken);

        try {
            const decodeToken = await firebaseAdmin.auth().verifyIdToken(idToken);

            req.user = decodeToken; // Assign req.user with decodeToken to access user's information

            next();
        } catch (error) {
            res.status(401).json({
                message: 'User Unauthorized',
                status: 401,
                error: error.message
            });
        }
    } else {
        return res.status(422).json({
            message: 'Required User Token Authorization',
            status: 422
        });
    }
};

const deleteProfileStorage = async (uid) => {
    try {
        const bucket = CloudStorage.bucket('buzz-wise-team.appspot.com');

        // Delete the folder itself
        bucket.deleteFiles({
            prefix: `users/${uid}`
        });

        /*
        // Delete files in the folder
        bucket.deleteFiles({
          prefix: filePath
        });
        */

        // console.log('Folder deleted successfully.');
    } catch (error) {
        throw new Error('Error Deleting Folder: ', error);
    }
};

// Delete user account from authentication and firestore
const deleteAccount = async (req, res, firebase, collection) => {
    const user = firebase.auth().currentUser;

    if (user && req.user.uid) {
        await user.delete()
            .then(() => {
                // Delete the user's account profile from firestore
                collection.doc(user.uid).delete();

                // Delete the user's account profile from storage
                deleteProfileStorage(user.uid || req.user.uid);
            })
            .then(() => res.status(200)
                .send({
                    message: 'Successfully Deleted Account',
                    status: 200
                }));
    } else {
        res.status(403).send({
            message: 'Account is Not Sign In',
            status: 403
        });
    }
};

// Delete user account from authentication and firestore by id (Only For Testing)
const deleteAccountByID = async (req, res, firebase, collection) => {
    const userID = req.params.id;
    const user = await collection.doc(userID);
    const profile = await user.get();

    if (!profile.exists) {
        res.status(404).send({
            message: 'Account is Not Found',
            status: 404
        });
    } else {
        // Delete the user's account profile from authentication
        await firebase.auth().currentUser.delete();

        // Delete the user's account profile from firestore
        await collection.doc(userID).delete();

        // Delete the user's account profile from storage
        await deleteProfileStorage(userID);

        res.status(200).send({
            message: 'Successfully Deleted Account',
            status: 200
        });
    }
};

module.exports = { authenticate, deleteAccount, deleteAccountByID };