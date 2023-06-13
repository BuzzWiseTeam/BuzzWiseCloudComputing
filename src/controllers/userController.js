const { Storage } = require('@google-cloud/storage');
const formidable = require('formidable-serverless');

const firebase = require('../config/firebase');
const FirebaseDatabase = require('../database');

const usersCollection = FirebaseDatabase.firestore().collection('users');

const storage = new Storage({
    projectId: 'buzz-wise-team',
    keyFilename: 'serviceAccountKey.json',
});

const signUp = async (req, res) => {
    try {
        /* Default validation
        if (!req.body.name || !req.body.email || !req.body.password) {
            return res.status(422).json({
                name: 'Name is required',
                email: 'Email is required',
                password: 'Password is required'
            });
        }
        */

        const { name, email, password } = req.body;

        if (!(name && email && password)) {
            return res.status(422).json({
                error: 'Please fill out all fields!'
            });
        }

        const defaultUserProfile = 'https://storage.googleapis.com/buzz-wise-team.appspot.com/users/DefaultProfile.png';

        await firebase.auth().createUserWithEmailAndPassword(req.body.email, req.body.password)
            .then((credential) => {
                const date = new Date();

                const getDateAndTime = date.toLocaleDateString() + '|' + date.toLocaleTimeString();

                usersCollection.doc(credential.user.uid).set({
                    id: credential.user.uid,
                    name: req.body.name,
                    headline: req.body.headline || null,
                    email: credential.user.email,
                    location: req.body.location || null,
                    status: 'Available',
                    skills: req.body.skill || null,
                    userProfileImage: defaultUserProfile,
                    about: req.body.about || null,
                    createdAt: getDateAndTime
                });
            })
            .then(() => {
                const user = firebase.auth().currentUser;

                user.updateProfile({
                    displayName: req.body.name,
                    imageURL: defaultUserProfile
                });
            })
            .then((data) => res.status(201)
                .send({
                    message: 'User Account Signed Up Successfully',
                    data
                }))
            .catch((error) => {
                if (error.code === 'auth/weak-password') {
                    return res.status(500).json({ error: error.message });
                } else {
                    return res.status(500).json({ error: error.message });
                }
            });
    } catch (error) {
        res.status(400).send({
            message: 'Something Went Wrong to Sign Up a User Account!',
            error: error.message
        });
    }
};

const signIn = async (req, res) => {
    try {
        /* Default validation
        if (!req.body.email || !req.body.password) {
            return res.status(422).json({
                email: 'Email is required',
                password: 'Password is required'
            });
        }
        */

        const { email, password } = req.body;

        if (!(email && password)) {
            return res.status(422).json({
                error: 'Please fill out all fields!'
            });
        }

        await firebase.auth().signInWithEmailAndPassword(req.body.email, req.body.password)
            .then((data) => res.status(200)
                .send({
                    message: 'User Account Signed In Successfully',
                    data
                }))
            .catch((error) => {
                if (error.code === 'auth/wrong-password') {
                    return res.status(500).json({ message: 'Wrong Email or Password!' });
                } else {
                    return res.status(500).json({ error: 'Wrong Email or Password!' });
                }
            });
    } catch (error) {
        res.status(400).send({
            message: 'Something Went Wrong to Sign In a User Account!',
            error: error.message
        });
    }
};

const logOut = async (req, res) => {
    try {
        const user = firebase.auth().currentUser;

        if (user) {
            await firebase.auth().signOut().then(() => {
                res.status(200).send({
                    message: 'User log out successfully',
                    status: 'Success'
                });
            }).catch((error) => {
                res.status(404).send({
                    message: 'Something Went Wrong to Log Out a User Account!',
                    error: error.message
                });
            });
        } else {
            res.status(403).send({
                message: 'User is already logged out!',
                status: 'Failure!'
            });
        }
    } catch (error) {
        res.status(400).send({
            message: 'Something Went Wrong to Log Out a User Account!',
            error: error.message
        });
    }
};

const verifyUserEmail = async (req, res) => {
    try {
        await firebase.auth().currentUser.sendEmailVerification()
            .then(() => res.status(200)
                .send({
                    message: 'Verify User Account Email Successfully',
                    status: 'Email Verification Sent, Please check your inbox'
                }))
            .catch((error) => {
                if (error.code === 'auth/too-many-requests') {
                    return res.status(500).json({ error: error.message });
                } else {
                    return res.status(500).json({ error: error.message });
                }
            });
    } catch (error) {
        res.status(400).send({
            message: 'Something Went Wrong to Verify User Email Account!',
            error: error.message
        });
    }
};

const forgetUserPassword = async (req, res) => {
    try {
        if (!req.body.email) {
            return res.status(422).json({ email: 'Email is required!' });
        }

        await firebase.auth().sendPasswordResetEmail(req.body.email)
            .then(() => res.status(200)
                .send({
                    message: 'Forget User Password Successfully',
                    status: 'Password Reset Email Sent, Please check your inbox'
                }))
            .catch((error) => {
                if (error.code === 'auth/invalid-email') {
                    return res.status(500).json({ error: 'Invalid Email!' });
                } else if (error.code === 'auth/user-not-found') {
                    return res.status(500).json({ error: 'Email Not Found!' });
                }
            });
    } catch (error) {
        res.status(400).send({
            message: 'Something Went Wrong to Forget a User Account Password!',
            error: error.message
        });
    }
};

// Delete user account from authentication
const deleteUserAccount = async (req, res) => {
    try {
        await firebase.auth().currentUser.delete()
            .then(() => res.status(202)
                .send({
                    message: 'Delete User Account Successfully'
                }))
            .catch((error) => {
                if (error.code === 'auth/invalid-email') {
                    return res.status(500).json({ error: 'Invalid Email!' });
                } else if (error.code === 'auth/user-not-found') {
                    return res.status(500).json({ error: 'Email Not Found!' });
                }
            });
    } catch (error) {
        res.status(400).send({
            message: 'Something Went Wrong to Delete a User Account!',
            error: error.message
        });
    }
};

const getAllUsersAccountProfiles = async (req, res) => {
    try {
        const response = [];

        await usersCollection.get().then((data) => {
            const { docs } = data;

            docs.map((doc) => {
                const selectedData = {
                    id: doc.data().id,
                    name: doc.data().name,
                    email: doc.data().email,
                    headline: doc.data().headline,
                    location: doc.data().location,
                    status: doc.data().status,
                    skills: doc.data().skills,
                    userProfileImage: doc.data().userProfileImage,
                    about: doc.data().about,
                    createdAt: doc.data().createdAt
                };

                response.push(selectedData);
            });

            return response;
        });

        res.status(200).send({
            message: 'Display All User Profile',
            data: response
        });
    } catch (error) {
        res.status(400).send({
            message: 'Something went wrong to Display All User Profile!',
            error: error.message
        });
    }
};

// Get the current user's account profile by login with email and password
const getCurrentUserAccountProfile = async (req, res) => {
    try {
        const user = firebase.auth().currentUser;

        await usersCollection.doc(user.uid).get()
            .then((result) => {
                res.status(200).send({
                    message: 'Display a User Profile',
                    data: result.data()
                });
            });
    } catch (error) {
        res.status(400).send({
            message: 'Something went wrong to Display a User Profile!',
            error: error.message
        });
    }
};

// Get the user's account profile by id
const getUserAccountProfile = async (req, res) => {
    try {
        const uid = req.params.id;
        const user = await usersCollection.doc(uid);
        const profile = await user.get();

        if (!profile.exists) {
            res.status(404).send({
                message: 'Cannot Found User!',
            });
        } else {
            res.status(200).send({
                message: 'Display a User Profile',
                data: profile.data()
            });
        }
    } catch (error) {
        res.status(400).send({
            message: 'Something went wrong to Display a User Profile!',
            error: error.message
        });
    }
};

// Update the current user's account profile by login with email and password
const updateUserAccountProfile = async (req, res) => {
    try {
        const user = firebase.auth().currentUser;

        const form = new formidable.IncomingForm({ multiples: true });

        await usersCollection.doc(user.uid).get().then(() => {
            form.parse(req, async (error, fields, files) => {
                const userId = user.uid;

                const bucketName = 'buzz-wise-team';

                const storagePublicURL = `https://storage.googleapis.com/${bucketName}.appspot.com/`;

                // const storagePublicURL = `https://firebasestorage.googleapis.com/v0/b/${bucketName}.appspot.com/o/`;

                const { userProfileImage } = files;

                // URL of the uploaded image
                let imageURL;

                if (error) {
                    return res.status(400).json({
                        message: 'There was an error parsing the files!',
                        error: error.message
                    });
                }

                const bucket = storage.bucket(`gs://${bucketName}.appspot.com`);

                if (userProfileImage.size === 0) {
                    // Do nothing
                    res.send('No user profile image');
                } else {
                    const imageResponse = await bucket.upload(userProfileImage.path, {
                        destination: `users/${userProfileImage.name}`,
                        resumable: true,
                        metadata: {
                            metadata: {
                                firebaseStorageDownloadTokens: userId
                            }
                        }
                    });

                    // Profile image url
                    // imageURL = `${storagePublicURL + encodeURIComponent(imageResponse[0].name)}?alt=media&token=${uid}`;

                    imageURL = storagePublicURL + imageResponse[0].name;
                }

                // Object to send to the database
                const profileData = {
                    name: fields.name,
                    headline: fields.headline,
                    location: fields.location,
                    skills: fields.skills,
                    status: fields.status,
                    userProfileImage: userProfileImage.size === 0 ? '' : imageURL,
                    about: fields.about
                };

                // Added to the firestore collection
                await usersCollection.doc(userId).update(profileData, { merge: true })
                    .then(() => {
                        user.updateProfile({
                            displayName: profileData.name,
                            photoURL: profileData.userProfileImage
                        });
                    })
                    .then(() => {
                        res.status(202).send({
                            message: 'Successfully Update a User Profile',
                            data: profileData
                        });
                    });
            });
        });

        /* Default implementation
        form.parse(req, async (error, fields, files) => {
            const userId = user.uid;

            const bucketName = 'buzz-wise-team';

            const storagePublicURL = `https://storage.googleapis.com/${bucketName}.appspot.com/`;

            // const storagePublicURL = `https://firebasestorage.googleapis.com/v0/b/${bucketName}.appspot.com/o/`;

            const { userProfileImage } = files;

            // URL of the uploaded image
            let imageURL;

            if (error) {
                return res.status(400).json({
                    message: 'There was an error parsing the files!',
                    error: error.message
                });
            }

            const bucket = storage.bucket(`gs://${bucketName}.appspot.com`);

            if (userProfileImage.size === 0) {
                // Do nothing
                res.send('No user profile image');
            } else {
                const imageResponse = await bucket.upload(userProfileImage.path, {
                    destination: `users/${userProfileImage.name}`,
                    resumable: true,
                    metadata: {
                        metadata: {
                            firebaseStorageDownloadTokens: userId
                        }
                    }
                });

                // Profile image url
                // imageURL = `${storagePublicURL + encodeURIComponent(imageResponse[0].name)}?alt=media&token=${uid}`;

                imageURL = storagePublicURL + imageResponse[0].name;
            }

            // Object to send to the database
            const profileData = {
                name: fields.name,
                headline: fields.headline,
                location: fields.location,
                skills: fields.skills,
                status: fields.status,
                userProfileImage: userProfileImage.size === 0 ? '' : imageURL,
                about: fields.about
            };

            // Added to the firestore collection
            await usersCollection.doc(userId).update(profileData, { merge: true })
                .then(() => {
                    user.updateProfile({
                        displayName: profileData.name,
                        photoURL: profileData.userProfileImage
                    });
                })
                .then(() => {
                    res.status(202).send({
                        message: 'Successfully Update a User Profile',
                        data: profileData
                    });
                });
        });
        */
    } catch (error) {
        res.status(400).send({
            message: 'Something went wrong to Update a User Profile!',
            error: error.message
        });
    }
};

// Update the user's account profile by id
const updateUserProfile = async (req, res) => {
    try {
        const form = new formidable.IncomingForm({ multiples: true });

        form.parse(req, async (error, fields, files) => {
            const userId = req.params.id;

            const bucketName = 'buzz-wise-team';

            const storagePublicURL = `https://storage.googleapis.com/${bucketName}.appspot.com/`;

            // const storagePublicURL = `https://firebasestorage.googleapis.com/v0/b/${bucketName}.appspot.com/o/`;

            const { userProfileImage } = files;

            // URL of the uploaded image
            let imageURL;

            if (error) {
                return res.status(400).json({
                    message: 'There was an error parsing the files!',
                    error: error.message
                });
            }

            const bucket = storage.bucket(`gs://${bucketName}.appspot.com`);

            if (userProfileImage.size === 0) {
                // Do nothing
                res.send('No user profile image');
            } else {
                const imageResponse = await bucket.upload(userProfileImage.path, {
                    destination: `users/${userProfileImage.name}`,
                    resumable: true,
                    metadata: {
                        metadata: {
                            firebaseStorageDownloadTokens: userId
                        }
                    }
                });

                // Profile image url
                // imageURL = `${storagePublicURL + encodeURIComponent(imageResponse[0].name)}?alt=media&token=${uid}`;

                imageURL = storagePublicURL + imageResponse[0].name;
            }

            // Object to send to the database
            const profileData = {
                name: fields.name,
                headline: fields.headline,
                location: fields.location,
                skills: fields.skills,
                status: fields.status,
                userProfileImage: userProfileImage.size === 0 ? '' : imageURL,
                about: fields.about
            };

            // Added to the firestore collection
            await usersCollection.doc(userId).update(profileData, { merge: true })
                .then(() => {
                    const user = firebase.auth().currentUser;

                    user.updateProfile({
                        displayName: profileData.name,
                        photoURL: profileData.userProfileImage
                    });
                })
                .then(() => {
                    res.status(202).send({
                        message: 'Successfully Update a User Profile',
                        data: profileData
                    });
                });
        });
    } catch (error) {
        res.status(400).send({
            message: 'Something went wrong to Update a User Profile!',
            error: error.message
        });
    }
};

const editUserProfile = async (req, res) => {
    try {
        const user = firebase.auth().currentUser;

        const form = new formidable.IncomingForm({ multiples: true });

        await usersCollection.doc(user.uid).get().then(() => {
            form.parse(req, async (error, fields, files) => {
                const userId = user.uid;

                const bucketName = 'buzz-wise-team';

                const storagePublicURL = `https://storage.googleapis.com/${bucketName}.appspot.com/`;

                // const storagePublicURL = `https://firebasestorage.googleapis.com/v0/b/${bucketName}.appspot.com/o/`;

                const { userProfileImage } = files;

                // URL of the uploaded image
                let imageURL;

                if (error) {
                    return res.status(400).json({
                        message: 'There was an error parsing the files!',
                        error: error.message
                    });
                }

                const bucket = storage.bucket(`gs://${bucketName}.appspot.com`);

                if (userProfileImage.size === 0) {
                    // Do nothing
                    res.send('No user profile image');
                } else {
                    const imageResponse = await bucket.upload(userProfileImage.path, {
                        destination: `users/${userProfileImage.name}`,
                        resumable: true,
                        metadata: {
                            metadata: {
                                firebaseStorageDownloadTokens: userId
                            }
                        }
                    });

                    // Profile image url
                    // imageURL = `${storagePublicURL + encodeURIComponent(imageResponse[0].name)}?alt=media&token=${uid}`;

                    imageURL = storagePublicURL + imageResponse[0].name;
                }

                // Object to send to the database
                const profileData = {
                    name: fields.name,
                    userProfileImage: userProfileImage.size === 0 ? '' : imageURL
                };

                // Added to the firestore collection
                await usersCollection.doc(userId).update(profileData, { merge: true })
                    .then(() => {
                        user.updateProfile({
                            displayName: profileData.name,
                            photoURL: profileData.userProfileImage
                        });
                    })
                    .then(() => {
                        res.status(202).send({
                            message: 'Successfully Update a User Profile',
                            data: profileData
                        });
                    });
            });
        });

        /* Default implementation
        form.parse(req, async (error, fields, files) => {
            const userId = user.uid;

            const bucketName = 'buzz-wise-team';

            const storagePublicURL = `https://storage.googleapis.com/${bucketName}.appspot.com/`;

            // const storagePublicURL = `https://firebasestorage.googleapis.com/v0/b/${bucketName}.appspot.com/o/`;

            const { userProfileImage } = files;

            // URL of the uploaded image
            let imageURL;

            if (error) {
                return res.status(400).json({
                    message: 'There was an error parsing the files!',
                    error: error.message
                });
            }

            const bucket = storage.bucket(`gs://${bucketName}.appspot.com`);

            if (userProfileImage.size === 0) {
                // Do nothing
                res.send('No user profile image');
            } else {
                const imageResponse = await bucket.upload(userProfileImage.path, {
                    destination: `users/${userProfileImage.name}`,
                    resumable: true,
                    metadata: {
                        metadata: {
                            firebaseStorageDownloadTokens: userId
                        }
                    }
                });

                // Profile image url
                // imageURL = `${storagePublicURL + encodeURIComponent(imageResponse[0].name)}?alt=media&token=${uid}`;

                imageURL = storagePublicURL + imageResponse[0].name;
            }

            // Object to send to the database
            const profileData = {
                name: fields.name,
                userProfileImage: userProfileImage.size === 0 ? '' : imageURL
            };

            // Added to the firestore collection
            await usersCollection.doc(userId).update(profileData, { merge: true })
                .then(() => {
                    user.updateProfile({
                        displayName: profileData.name,
                        photoURL: profileData.userProfileImage
                    });
                })
                .then(() => {
                    res.status(202).send({
                        message: 'Successfully Update a User Profile',
                        data: profileData
                    });
                });
        });
        */
    } catch (error) {
        res.status(400).send({
            message: 'Something went wrong to Update a User Profile!',
            error: error.message
        });
    }
};

const editUserInformation = async (req, res) => {
    try {
        const user = firebase.auth().currentUser;

        const form = new formidable.IncomingForm({ multiples: true });

        await usersCollection.doc(user.uid).get().then(() => {
            form.parse(req, async (error, fields) => {
                const userId = user.uid;

                if (error) {
                    return res.status(400).json({
                        message: 'There was an error parsing the files!',
                        error: error.message
                    });
                }

                // Object to send to the database
                const profileData = {
                    headline: fields.headline,
                    skills: fields.skills,
                    location: fields.location,
                    status: fields.status,
                    about: fields.about
                };

                // Added to the firestore collection
                await usersCollection.doc(userId).update(profileData, { merge: true })
                    .then(() => {
                        user.updateProfile({
                            displayName: profileData.name,
                            photoURL: profileData.userProfileImage
                        });
                    })
                    .then(() => {
                        res.status(202).send({
                            message: 'Successfully Update a User Profile',
                            data: profileData
                        });
                    });
            });
        });

        /* Default implementation
        const user = firebase.auth().currentUser;

        const form = new formidable.IncomingForm({ multiples: true });

        form.parse(req, async (error, fields) => {
            const userId = user.uid;

            if (error) {
                return res.status(400).json({
                    message: 'There was an error parsing the files!',
                    error: error.message
                });
            }

            // Object to send to the database
            const profileData = {
                headline: fields.headline,
                skills: fields.skills,
                location: fields.location,
                status: fields.status,
                about: fields.about
            };

            // Added to the firestore collection
            await usersCollection.doc(userId).update(profileData, { merge: true })
                .then(() => {
                    user.updateProfile({
                        displayName: profileData.name,
                        photoURL: profileData.userProfileImage
                    });
                })
                .then(() => {
                    res.status(202).send({
                        message: 'Successfully Update a User Profile',
                        data: profileData
                    });
                });
        });
        */
    } catch (error) {
        res.status(400).send({
            message: 'Something went wrong to Update a User Profile!',
            error: error.message
        });
    }
};

// Delete user account data from firestore
const deleteUserAccountProfile = async (req, res) => {
    try {
        await usersCollection.doc(req.params.id).delete();

        res.status(202).send({
            message: 'Successfully Delete a User Profile',
        });
    } catch (error) {
        res.status(400).send({
            message: 'Something went wrong to Delete a User Profile!',
            error: error.message
        });
    }
};

module.exports = {
    signUp, signIn, logOut, verifyUserEmail, forgetUserPassword, deleteUserAccount,
    getAllUsersAccountProfiles, getUserAccountProfile, getCurrentUserAccountProfile, updateUserAccountProfile, updateUserProfile,
    editUserProfile, editUserInformation, deleteUserAccountProfile
};