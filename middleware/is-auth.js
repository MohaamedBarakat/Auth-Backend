const jwt = require('jsonwebtoken');
const errorGenrator = require('../util/errorGenrators');
module.exports = (req, res, next) => {
    const authHeader = req.get('Authorization');
    //console.log(authHeader);
    if (!authHeader) {
        errorGenrator.notAuth();
    }
    const Bearer = authHeader.split(' ');
    //console.log(Bearer);
    const token = Bearer[1];
    //console.log(token);
    let decodedToken;
    try {
        decodedToken = jwt.verify(token, process.env.tokenPrivateKeyAuth);
        //console.log(decodedToken);
    } catch (err) {
        err.statusCode = 500;
        throw err;
    }
    if (!decodedToken) {
        errorGenrator.notAuth();
    }
    req.userId = decodedToken.userId;
    next();
};