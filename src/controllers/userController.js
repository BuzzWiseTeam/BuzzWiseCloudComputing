const { Storage } = require('@google-cloud/storage');
const formidable = require('formidable-serverless');

const firebaseApp = require('../config/firebaseApp');
const firebaseAdmin = require('../config/firebaseAdmin');
const UserModel = require('../models/userModel');

const UsersCollection = firebaseAdmin.firestore().collection('users');

const CloudStorage = new Storage({
    projectId: 'buzz-wise-team',
    keyFilename: 'serviceAccountKey.json'
});

const getAllUsersAccountProfile = async (req, res) => {
    try {
        UserModel.getAllUsersAccountProfile(req, res, UsersCollection);
    } catch (error) {
        res.status(400).send({
            message: 'Something Went Wrong to Display All Users Profile',
            status: 400,
            error: error.message
        });
    }
};

// Get the current user's account profile by login with email and password
const getUserAccountProfile = async (req, res) => {
    try {
        UserModel.getUserAccountProfile(req, res, firebaseApp, UsersCollection);
    } catch (error) {
        res.status(400).send({
            message: 'Something Went Wrong to Display User Account Profile',
            status: 400,
            error: error.message
        });
    }
};

// Get the user's account profile by id (Only For Testing)
const getUserAccountProfileByID = async (req, res) => {
    try {
        UserModel.getUserAccountProfileByID(req, res, UsersCollection);
    } catch (error) {
        res.status(400).send({
            message: 'Something Went Wrong to Display User Account Profile',
            status: 400,
            error: error.message
        });
    }
};

// Update the current user's account profile by login with email and password
const updateUserAccountProfile = async (req, res) => {
    try {
        const user = firebaseApp.auth().currentUser;

        const form = new formidable.IncomingForm({ multiples: true });

        if (user && req.user.uid) {
            await UsersCollection.doc(user.uid).get().then(() => {
                // Default implementation
                form.parse(req, async (error, fields, files) => {
                    // Create validation of the fields and files
                    if (!fields.name || !fields.headline || !fields.location || !fields.skills || !fields.status || !files.userProfileImage || !fields.about) {
                        return res.status(422).json({
                            message: 'Please Fill Out All Fields',
                            status: 422
                        });
                    }

                    const userID = user.uid;

                    const bucketName = 'buzz-wise-team';

                    const storagePublicURL = `https://storage.googleapis.com/${bucketName}.appspot.com/`;

                    // const storagePublicURL = `https://firebasestorage.googleapis.com/v0/b/${bucketName}.appspot.com/o/`;

                    // The variable should be match with the name of the key field
                    const { userProfileImage } = files;

                    // URL of the uploaded image
                    let imageURL;

                    if (error) {
                        return res.status(400).json({
                            message: 'There Was an Error Parsing The Files',
                            status: 400,
                            error: error.message
                        });
                    }

                    const bucket = CloudStorage.bucket(`gs://${bucketName}.appspot.com`);

                    if (userProfileImage.size === 0) {
                        res.status(404).send({
                            message: 'No Image Found',
                            status: 404
                        });
                    } else {
                        const imageResponse = await bucket.upload(userProfileImage.path, {
                            destination: `users/${userID}/${userProfileImage.name}`,
                            resumable: true,
                            metadata: {
                                metadata: {
                                    firebaseStorageDownloadTokens: userID
                                }
                            }
                        });

                        // Profile image url
                        // imageURL = `${storagePublicURL + encodeURIComponent(imageResponse[0].name)}?alt=media&token=${userID}`;

                        imageURL = storagePublicURL + imageResponse[0].name;
                    }

                    const date = new Date();

                    const getDateAndTime = date.toLocaleDateString() + '|' + date.toLocaleTimeString();

                    // Object to send to the database
                    const userData = {
                        name: fields.name,
                        headline: fields.headline,
                        location: fields.location,
                        skills: fields.skills,
                        status: fields.status,
                        userProfileImage: userProfileImage.size === 0 ? '' : imageURL,
                        about: fields.about,
                        updatedAt: getDateAndTime
                    };

                    // Added to the firestore collection
                    await UsersCollection.doc(userID).update(userData, { merge: true })
                        .then(() => {
                            user.updateProfile({
                                displayName: userData.name,
                                photoURL: userData.userProfileImage
                            });
                        })
                        .then(() => {
                            res.status(202).send({
                                message: 'Successfully Update User Profile',
                                status: 202,
                                data: userData
                            });
                        });
                });
            });
        } else {
            res.status(403).send({
                message: 'User is Not Sign In',
                status: 403
            });
        }
    } catch (error) {
        res.status(400).send({
            message: 'Something Went Wrong to Update User Profile',
            status: 400,
            error: error.message
        });
    }
};

// Update the user's account profile by id (Only For Testing)
const updateUserAccountProfileByID = async (req, res) => {
    try {
        const userID = req.params.id;
        const user = await UsersCollection.doc(userID);
        const profile = await user.get();

        const form = new formidable.IncomingForm({ multiples: true });

        if (!profile.exists) {
            res.status(404).send({
                message: 'User is Not Found',
                status: 404
            });
        } else {
            // Default implementation
            form.parse(req, async (error, fields, files) => {
                // Create validation of the fields and files
                if (!fields.name || !fields.headline || !fields.location || !fields.skills || !fields.status || !files.userProfileImage || !fields.about) {
                    return res.status(422).json({
                        message: 'Please Fill Out All Fields',
                        status: 422
                    });
                }

                const bucketName = 'buzz-wise-team';

                const storagePublicURL = `https://storage.googleapis.com/${bucketName}.appspot.com/`;

                // const storagePublicURL = `https://firebasestorage.googleapis.com/v0/b/${bucketName}.appspot.com/o/`;

                // The variable should be match with the name of the key field
                const { userProfileImage } = files;

                // URL of the uploaded image
                let imageURL;

                if (error) {
                    return res.status(400).json({
                        message: 'There Was an Error Parsing The Files',
                        status: 400,
                        error: error.message
                    });
                }

                const bucket = CloudStorage.bucket(`gs://${bucketName}.appspot.com`);

                if (userProfileImage.size === 0) {
                    res.status(404).send({
                        message: 'No Image Found',
                        status: 404
                    });
                } else {
                    const imageResponse = await bucket.upload(userProfileImage.path, {
                        destination: `users/${userID}/${userProfileImage.name}`,
                        resumable: true,
                        metadata: {
                            metadata: {
                                firebaseStorageDownloadTokens: userID
                            }
                        }
                    });

                    // Profile image url
                    // imageURL = `${storagePublicURL + encodeURIComponent(imageResponse[0].name)}?alt=media&token=${userID}`;

                    imageURL = storagePublicURL + imageResponse[0].name;
                }

                const date = new Date();

                const getDateAndTime = date.toLocaleDateString() + '|' + date.toLocaleTimeString();

                // Object to send to the database
                const userData = {
                    name: fields.name,
                    headline: fields.headline,
                    location: fields.location,
                    skills: fields.skills,
                    status: fields.status,
                    userProfileImage: userProfileImage.size === 0 ? '' : imageURL,
                    about: fields.about,
                    updatedAt: getDateAndTime
                };

                // Added to the firestore collection
                await UsersCollection.doc(userID).update(userData, { merge: true })
                    .then(() => {
                        user.updateProfile({
                            displayName: userData.name,
                            photoURL: userData.userProfileImage
                        });
                    })
                    .then(() => {
                        res.status(202).send({
                            message: 'Successfully Update User Profile',
                            status: 202,
                            data: userData
                        });
                    });
            });
        }
    } catch (error) {
        res.status(400).send({
            message: 'Something Went Wrong to Update User Profile',
            status: 400,
            error: error.message
        });
    }
};

const editUserProfile = async (req, res) => {
    try {
        const user = firebaseApp.auth().currentUser;

        const form = new formidable.IncomingForm({ multiples: true });

        if (user && req.user.uid) {
            await UsersCollection.doc(user.uid).get().then(() => {
                // Default implementation
                form.parse(req, async (error, fields, files) => {
                    // Create validation of the fields and files
                    if (!fields.name || !files.userProfileImage) {
                        return res.status(400).send({
                            message: 'Please Fill All The Required Fields',
                            status: 400
                        });
                    }

                    const userID = user.uid;

                    const bucketName = 'buzz-wise-team';

                    const storagePublicURL = `https://storage.googleapis.com/${bucketName}.appspot.com/`;

                    // const storagePublicURL = `https://firebasestorage.googleapis.com/v0/b/${bucketName}.appspot.com/o/`;

                    // The variable should be match with the name of the key field
                    const { userProfileImage } = files;

                    // URL of the uploaded image
                    let imageURL;

                    if (error) {
                        return res.status(400).json({
                            message: 'There Was an Error Parsing The Files',
                            status: 400,
                            error: error.message
                        });
                    }

                    const bucket = CloudStorage.bucket(`gs://${bucketName}.appspot.com`);

                    if (userProfileImage.size === 0) {
                        res.status(404).send({
                            message: 'No Image Found',
                            status: 404
                        });
                    } else {
                        const imageResponse = await bucket.upload(userProfileImage.path, {
                            destination: `users/${userID}/${userProfileImage.name}`,
                            resumable: true,
                            metadata: {
                                metadata: {
                                    firebaseStorageDownloadTokens: userID
                                }
                            }
                        });

                        // Profile image url
                        // imageURL = `${storagePublicURL + encodeURIComponent(imageResponse[0].name)}?alt=media&token=${userID}`;

                        imageURL = storagePublicURL + imageResponse[0].name;
                    }

                    const date = new Date();

                    const getDateAndTime = date.toLocaleDateString() + '|' + date.toLocaleTimeString();

                    // Object to send to the database
                    const userData = {
                        name: fields.name,
                        userProfileImage: userProfileImage.size === 0 ? '' : imageURL,
                        updatedAt: getDateAndTime
                    };

                    // Added to the firestore collection
                    await UsersCollection.doc(userID).update(userData, { merge: true })
                        .then(() => {
                            user.updateProfile({
                                displayName: userData.name,
                                photoURL: userData.userProfileImage
                            });
                        })
                        .then(() => {
                            res.status(202).send({
                                message: 'Successfully Edit User Profile',
                                status: 202,
                                data: userData
                            });
                        });
                });
            });
        } else {
            res.status(403).send({
                message: 'User is Not Sign In',
                status: 403
            });
        }
    } catch (error) {
        res.status(400).send({
            message: 'Something Went Wrong to Edit User Profile',
            status: 400,
            error: error.message
        });
    }
};

const editUserInformation = async (req, res) => {
    try {
        const user = firebaseApp.auth().currentUser;

        const form = new formidable.IncomingForm({ multiples: true });

        if (user && req.user.uid) {
            await UsersCollection.doc(user.uid).get().then(() => {
                // Default implementation
                form.parse(req, async (error, fields) => {
                    // Create validation of the fields
                    if (!fields.headline || !fields.location || !fields.skills || !fields.status || !fields.about) {
                        return res.status(400).send({
                            message: 'All Fields are Required',
                            status: 400
                        });
                    }

                    const userID = user.uid;

                    if (error) {
                        return res.status(400).json({
                            message: 'There Was an Error Parsing The Files',
                            status: 400,
                            error: error.message
                        });
                    }

                    const date = new Date();

                    const getDateAndTime = date.toLocaleDateString() + '|' + date.toLocaleTimeString();

                    // Object to send to the database
                    const userData = {
                        headline: fields.headline,
                        skills: fields.skills,
                        location: fields.location,
                        status: fields.status,
                        about: fields.about,
                        updatedAt: getDateAndTime
                    };

                    // Added to the firestore collection
                    await UsersCollection.doc(userID).update(userData, { merge: true })
                        .then(() => {
                            user.updateProfile({
                                displayName: userData.name,
                                photoURL: userData.userProfileImage
                            });
                        })
                        .then(() => {
                            res.status(202).send({
                                message: 'Successfully Edit User Information',
                                status: 202,
                                data: userData
                            });
                        });
                });
            });
        } else {
            res.status(403).send({
                message: 'User is Not Sign In',
                status: 403
            });
        }
    } catch (error) {
        res.status(400).send({
            message: 'Something Went Wrong to Edit User Information',
            status: 400,
            error: error.message
        });
    }
};

module.exports = {
    getAllUsersAccountProfile, getUserAccountProfile, getUserAccountProfileByID, updateUserAccountProfile,
    updateUserAccountProfileByID, editUserProfile, editUserInformation
};