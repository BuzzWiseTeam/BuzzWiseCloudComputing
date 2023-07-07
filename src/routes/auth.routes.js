const express = require('express');

const { signUp, signIn, logOut, verifyEmail, forgotPassword, changeEmail, changePassword,
    deleteAccount, deleteAccountByID } = require('../controllers/authController');

const Middleware = require('../middleware/auth');

const router = express.Router();

router.post('/signUp', signUp);
router.post('/signIn', signIn);
router.post('/logOut', Middleware.authenticate, logOut);
router.post('/verifyEmail', Middleware.authenticate, verifyEmail);
router.post('/forgotPassword', forgotPassword);

router.put('/changeEmail', Middleware.authenticate, changeEmail);
router.put('/changePassword', Middleware.authenticate, changePassword);

router.delete('/deleteAccount', Middleware.authenticate, deleteAccount);
router.delete('/deleteAccount/:id', Middleware.authenticate, deleteAccountByID);

module.exports = { routes: router };