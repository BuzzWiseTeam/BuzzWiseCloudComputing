const firebaseApp = require('../config/firebaseApp');
const firebaseAdmin = require('../config/firebaseAdmin');
const AuthModel = require('../models/authModel');

const UsersCollection = firebaseAdmin.firestore().collection('users');

const signUp = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!(name && email && password)) {
            return res.status(422).json({
                message: 'Please Fill Out All Fields',
                status: 422
            });
        }

        const defaultUserProfile = 'https://storage.googleapis.com/buzz-wise-team.appspot.com/users/DefaultProfile.png';

        await firebaseApp.auth().createUserWithEmailAndPassword(email, password)
            .then((credential) => {
                const date = new Date();

                const getDateAndTime = date.toLocaleDateString() + '|' + date.toLocaleTimeString();

                UsersCollection.doc(credential.user.uid).set({
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
                const user = firebaseApp.auth().currentUser;

                user.updateProfile({
                    displayName: name,
                    photoURL: defaultUserProfile
                });
            })
            .then(() => {
                const user = firebaseApp.auth().currentUser;

                // Send Email Verification after Sign Up
                if (user.emailVerified === false) {
                    user.sendEmailVerification();
                } else {
                    return res.status(400).send({
                        message: 'User Email Already Verified',
                        status: 400
                    });
                }
            })
            .then((data) => res.status(201)
                .send({
                    message: 'User Successfully Sign Up Account',
                    status: 201,
                    data
                }))
            .catch((error) => {
                if (error.code === 'auth/weak-password') {
                    return res.status(500).send({
                        error: error.message,
                        status: 500
                    });
                } else {
                    return res.status(500).send({
                        error: error.message,
                        status: 500
                    });
                }
            });
    } catch (error) {
        res.status(400).send({
            message: 'Something Went Wrong to Sign Up User Account',
            status: 400,
            error: error.message
        });
    }
};

const signIn = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!(email && password)) {
            return res.status(422).json({
                message: 'Please Fill Out All Fields',
                status: 422
            });
        }

        await firebaseApp.auth().signInWithEmailAndPassword(email, password)
            .then((data) => res.status(200)
                .send({
                    message: 'User Successfully Sign In Account',
                    status: 200,
                    data
                }))
            .then(() => {
                firebaseApp.auth().currentUser.getIdToken().then((idToken) => {
                    // console.log(idToken); // It shows the Firebase access token now
                });
            })
            .catch((error) => {
                if (error.code === 'auth/wrong-password') {
                    return res.status(500).send({
                        message: 'Invalid Email or Password',
                        status: 500,
                        error: error.message
                    });
                } else {
                    return res.status(500).send({
                        message: 'Invalid Email or Password',
                        status: 500,
                        error: error.message
                    });
                }
            });
    } catch (error) {
        res.status(400).send({
            message: 'Something Went Wrong to Sign In User Account',
            status: 400,
            error: error.message
        });
    }
};

const logOut = async (req, res) => {
    try {
        const user = firebaseApp.auth().currentUser;

        if (user && req.user.uid) {
            await firebaseApp.auth().signOut().then(() => {
                res.status(200).send({
                    message: 'User Log Out Successfully',
                    status: 200
                });
            });
        } else {
            res.status(401).send({
                message: 'User is already Log Out',
                status: 401
            });
        }
    } catch (error) {
        res.status(400).send({
            message: 'Something Went Wrong to Log Out User Account',
            status: 400,
            error: error.message
        });
    }
};

const verifyUserEmail = async (req, res) => {
    try {
        const user = firebaseApp.auth().currentUser;

        if (user && req.user.uid) {
            if (user.email) {
                if (user.emailVerified === false) {
                    await user.sendEmailVerification()
                        .then(() => res.status(200)
                            .send({
                                message: 'Email Verification Sent, Please Check Your Inbox',
                                status: 200
                            }))
                        .catch((error) => {
                            if (error.code === 'auth/too-many-requests') {
                                return res.status(500).send({
                                    error: error.message,
                                    status: 500
                                });
                            } else {
                                return res.status(500).send({
                                    error: error.message,
                                    status: 500
                                });
                            }
                        });
                } else {
                    return res.status(400).send({
                        message: 'User Email Already Verified',
                        status: 400
                    });
                }
            } else {
                res.status(400).send({
                    message: 'User Email is Not Found',
                    status: 400
                });
            }
        } else {
            res.status(403).send({
                message: 'User is Not Sign In',
                status: 403
            });
        }
    } catch (error) {
        res.status(400).send({
            message: 'Something Went Wrong to Verify User Email Account',
            status: 400,
            error: error.message
        });
    }
};

const forgotUserPassword = async (req, res) => {
    try {
        if (!req.body.email) {
            return res.status(422).json({
                message: 'Email Should Not be Empty',
                status: 422
            });
        }

        await firebaseApp.auth().sendPasswordResetEmail(req.body.email)
            .then(() => res.status(200)
                .send({
                    message: 'Password Reset Email has been Sent, Please Check Your Inbox',
                    status: 200
                }))
            .catch((error) => {
                if (error.code === 'auth/invalid-email') {
                    return res.status(500).send({
                        message: 'Invalid Email',
                        status: 500,
                        error: error.message
                    });
                } else if (error.code === 'auth/user-not-found') {
                    return res.status(500).send({
                        message: 'Email is Not Found',
                        status: 500,
                        error: error.message
                    });
                }
            });
    } catch (error) {
        res.status(400).send({
            message: 'Something Went Wrong to Forgot User Account Password',
            status: 400,
            error: error.message
        });
    }
};

const changeUserEmail = async (req, res) => {
    try {
        const user = firebaseApp.auth().currentUser;

        const { newEmail, password } = req.body;

        if (!(newEmail && password)) {
            return res.status(422).json({
                message: 'Please Fill Out All Fields',
                status: 422
            });
        }

        if (user && req.user.uid) {
            const credential = firebaseApp.auth.EmailAuthProvider.credential(
                user.email,
                password
            );

            await user.reauthenticateWithCredential(credential)
                .then(() => {
                    user.updateEmail(newEmail)
                        .then(() => {
                            res.status(202).send({
                                message: 'User Email Account Successfully Changed',
                                status: 202
                            });
                        })
                        .catch((error) => {
                            if (error.code === 'auth/invalid-email') {
                                return res.status(500).send({
                                    message: 'Invalid Email',
                                    status: 500,
                                    error: error.message
                                });
                            } else if (error.code === 'auth/email-already-in-use') {
                                return res.status(500).send({
                                    message: 'Email is Already in Use',
                                    status: 500,
                                    error: error.message
                                });
                            } else if (error.code === 'auth/requires-recent-login') {
                                return res.status(500).send({
                                    message: 'User Needs to Re-Authenticate Recent Login',
                                    status: 500,
                                    error: error.message
                                });
                            }
                        });
                })
                .catch((error) => {
                    if (error.code === 'auth/wrong-password') {
                        return res.status(500).send({
                            message: 'Invalid Password',
                            status: 500,
                            error: error.message
                        });
                    }
                });
        }
    } catch (error) {
        res.status(400).send({
            message: 'Something Went Wrong to Change User Email Account',
            status: 400,
            error: error.message
        });
    }
};

const changeUserPassword = async (req, res) => {
    try {
        const user = firebaseApp.auth().currentUser;

        const { currentPassword, newPassword, confirmPassword } = req.body;

        if (!(currentPassword && newPassword && confirmPassword)) {
            return res.status(422).json({
                message: 'Please Fill Out All Fields',
                status: 422
            });
        }

        if (user && req.user.uid) {
            if (newPassword !== confirmPassword) {
                return res.status(422).send({
                    message: 'New Password and Confirm Password is Not Matched',
                    status: 422
                });
            }

            const credential = firebaseApp.auth.EmailAuthProvider.credential(
                user.email,
                currentPassword
            );

            await user.reauthenticateWithCredential(credential)
                .then(() => {
                    user.updatePassword(newPassword)
                        .then(() => {
                            res.status(202).send({
                                message: 'User Password Account Successfully Changed',
                                status: 202
                            });
                        })
                        .catch((error) => {
                            if (error.code === 'auth/weak-password') {
                                return res.status(500).send({
                                    message: 'Weak Password',
                                    status: 500,
                                    error: error.message
                                });
                            } else {
                                return res.status(500).send({
                                    message: 'Invalid Password',
                                    status: 500,
                                    error: error.message
                                });
                            }
                        });
                })
                .catch((error) => {
                    if (error.code === 'auth/wrong-password') {
                        return res.status(500).send({
                            message: 'Invalid Current Password',
                            status: 500,
                            error: error.message
                        });
                    } else {
                        return res.status(500).send({
                            message: 'Something Went Wrong to Change User Password Account',
                            status: 500,
                            error: error.message
                        });
                    }
                });
        } else {
            res.status(403).send({
                message: 'User is Not Sign In',
                status: 403
            });
        }
    } catch (error) {
        res.status(400).send({
            message: 'Something Went Wrong to Change User Password Account',
            status: 400,
            error: error.message
        });
    }
};

// Delete user account from authentication and firestore
const deleteUserAccount = async (req, res) => {
    try {
        AuthModel.deleteUserAccount(req, res, firebaseApp, UsersCollection);
    } catch (error) {
        res.status(400).send({
            message: 'Something Went Wrong to Delete User Account',
            status: 400,
            error: error.message
        });
    }
};

// Delete user account from authentication and firestore by id (Only for Testing)
const deleteUserAccountByID = async (req, res) => {
    try {
        AuthModel.deleteUserAccountByID(req, res, firebaseApp, UsersCollection);
    } catch (error) {
        res.status(400).send({
            message: 'Something Went Wrong to Delete User Account',
            status: 400,
            error: error.message
        });
    }
};

module.exports = {
    signUp, signIn, logOut, verifyUserEmail, forgotUserPassword, changeUserEmail,
    changeUserPassword, deleteUserAccount, deleteUserAccountByID
};