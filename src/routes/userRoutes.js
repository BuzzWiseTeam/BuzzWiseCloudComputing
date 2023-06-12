const express = require('express');
const { signUp, signIn, logOut, verifyUserEmail, forgetUserPassword, deleteUserAccount,
    getAllUsersAccountProfiles, getUserAccountProfile, getCurrentUserAccountProfile, updateUserAccountProfile, updateUserProfile, deleteUserAccountProfile } = require('../controllers/userController');

const router = express.Router();

router.post('/signUp', signUp);
router.post('/signIn', signIn);
router.delete('/logOut', logOut);
router.post('/verifyUserEmail', verifyUserEmail);
router.post('/forgetUserPassword', forgetUserPassword);
router.delete('/deleteUserAccount', deleteUserAccount);
router.get('/allUsersProfiles', getAllUsersAccountProfiles);
router.get('/userProfile', getCurrentUserAccountProfile);
router.get('/userProfile/:id', getUserAccountProfile);
router.put('/updateUserAccountProfile', updateUserAccountProfile);
router.put('/updateUserProfile/:id', updateUserProfile);
router.delete('/deleteUserProfile/:id', deleteUserAccountProfile);

module.exports = { routes: router };