const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const errorsGenrator = require('../util/errorGenrators');
const { validationResult } = require('express-validator/check');
const user = require('../models/user');

exports.signup = (req, res, next) => {
    //console.log(req.body);
    const errors = validationResult(req);
    errorsGenrator.validationFailed(errors);
    const email = req.body.email;
    const password = req.body.password;
    const name = req.body.name;
    bcrypt.hash(password, 12)
        .then(hashedPass => {
            const user = new User({
                email: email,
                name: name,
                password: hashedPass

            })
            return user.save();
        })
        .then(result => {
            //console.log(result);
            res.status(201).json({
                message: 'User created'
            })
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
};

exports.login = (req, res, next) => {
    const error = validationResult(req);
    errorsGenrator.validationFailed(error);
    const email = req.body.email;
    const password = req.body.password;
    let loadedUser;
    User.findOne({ email: email })
        .then(user => {
            if (!user) {
                errorsGenrator.userNotFound();
            }
            loadedUser = user;
            return bcrypt.compare(password, user.password);
        })
        .then(isEqual => {
            if (!isEqual) {
                const error = new Error('Password not matched');
                error.statusCode = 401;
                throw error;
            }
            return jwt.sign({
                email: loadedUser.email,
                userId: loadedUser._id.toString()
            }, process.env.tokenPrivateKey, { expiresIn: '0.5h' });
        })
        .then(token => {
            res.status(200).json({
                token: token,
                userId: loadedUser._id.toString()
            })
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
};

exports.deleteUser = (req, res, next) => {
    const userId = req.params.userId;
    console.log(userId);
    User.findById(userId)
        .then(user => {
            if (!user) {
                errorsGenrator.userNotFound();
            }
            if (user._id !== req.userId) {
                errorsGenrator.forbidden();
            }
        })
        .then(() => {
            res.status(200).json({
                message: 'User deleted'
            })
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
};

exports.add = (req, res, next) => {
    console.log('adding item succsesful');
    res.status(200).json({ messgae: 'Succes' });
}