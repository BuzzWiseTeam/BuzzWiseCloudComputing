// Error request handler
const httpErrorRequest = (req, res, next) => {
    const error = new Error('Not Found');

    error.statusCode = 404;
    error.message = 'Invalid Route';

    next(error);
};

// Error response
const httpErrorResponse = (error, req, res, next) => {
    res.status(error.statusCode).json({
        message: 'Something Went Wrong With The Server, Please Try Again.',
        status: error.statusCode,
        error: error.message
    });
};

module.exports = { httpErrorRequest, httpErrorResponse };