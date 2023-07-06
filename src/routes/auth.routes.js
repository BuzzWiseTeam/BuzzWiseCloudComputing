const express = require('express');

const { signUp, signIn, logOut, verifyUserEmail, forgotUserPassword, changeUserEmail, changeUserPassword,
    deleteUserAccount, deleteUserAccountByID } = require('../controllers/authController');

const Middleware = require('../middleware/auth');

const router = express.Router();

router.post('/signUp', signUp);
router.post('/signIn', signIn);
router.post('/logOut', Middleware.authenticate, logOut);
router.post('/verifyUserEmail', Middleware.authenticate, verifyUserEmail);
router.post('/forgotUserPassword', forgotUserPassword);

router.put('/changeUserEmail', Middleware.authenticate, changeUserEmail);
router.put('/changeUserPassword', Middleware.authenticate, changeUserPassword);

router.delete('/deleteUserAccount', Middleware.authenticate, deleteUserAccount);
router.delete('/deleteUserAccount/:id', Middleware.authenticate, deleteUserAccountByID);

module.exports = { routes: router };