exports.validationFailed = errors => {
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed.');
        error.statusCode = 422;
        error.data = errors.array();
        throw error;
    }
};
exports.userNotFound = () => {
    const error = new Error('User could not found');
    error.statusCode = 401;
    throw error;
};

exports.notAuth = () => {
    const error = new Error('Not authenticated');
    error.statusCode = 401;
    throw error;
}
exports.forbidden = () => {
    const error = new Error('This user forbidden from this action');
    error.status = 401;
    throw console.error();
}