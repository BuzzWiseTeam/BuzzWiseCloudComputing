const AuthModel = require('../models/authModel');

const authenticate = async (req, res, next) => {
    try {
        AuthModel.authenticate(req, res, next);
    } catch (error) {
        res.status(500).json({
            message: 'Something Went Wrong With The Server, Please Try Again.',
            status: 500,
            error: error.message
        });
    }
};

module.exports = { authenticate };