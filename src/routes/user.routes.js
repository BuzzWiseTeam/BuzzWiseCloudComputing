const express = require('express');

const { signUp, signIn, logOut, verifyUserEmail, forgotUserPassword, changeUserEmail, changeUserPassword,
    getAllUsersAccountProfile, getUserAccountProfile, getUserAccountProfileByID, updateUserAccountProfile, updateUserAccountProfileByID,
    editUserProfile, editUserInformation, deleteUserAccount, deleteUserAccountByID } = require('../controllers/userController');

const Middleware = require('../middleware/auth');

const router = express.Router();

router.post('/signUp', signUp);
router.post('/signIn', signIn);
router.post('/logOut', Middleware.authenticate, logOut);
router.post('/verifyUserEmail', Middleware.authenticate, verifyUserEmail);
router.post('/forgotUserPassword', forgotUserPassword);

router.get('/allUsersProfile', getAllUsersAccountProfile);
router.get('/userProfile', Middleware.authenticate, getUserAccountProfile);
router.get('/userProfile/:id', Middleware.authenticate, getUserAccountProfileByID);

router.put('/updateUserAccountProfile', Middleware.authenticate, updateUserAccountProfile);
router.put('/updateUserAccountProfile/:id', Middleware.authenticate, updateUserAccountProfileByID);
router.put('/editUserProfile', Middleware.authenticate, editUserProfile);
router.put('/editUserInformation', Middleware.authenticate, editUserInformation);
router.put('/changeUserEmail', Middleware.authenticate, changeUserEmail);
router.put('/changeUserPassword', Middleware.authenticate, changeUserPassword);

router.delete('/deleteUserAccount', Middleware.authenticate, deleteUserAccount);
router.delete('/deleteUserAccount/:id', Middleware.authenticate, deleteUserAccountByID);

module.exports = { routes: router };