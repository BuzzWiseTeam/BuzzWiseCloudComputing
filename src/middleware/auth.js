const firebaseAdmin = require('../config/firebaseAdmin');

/*  
    This middleware is to take the user data from
    firebase by access token given in headers with
    key = 'authorization' and the value = accessToken 
    and store it in req.user so we can use the req.user in controller
*/
const authenticate = async (req, res, next) => {
    try {
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
    } catch (error) {
        res.status(500).json({
            message: 'Something Went Wrong With The Server, Please Try Again.',
            status: 500,
            error: error.message
        });
    }
};

module.exports = { authenticate };