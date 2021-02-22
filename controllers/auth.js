const bcrypt = require('bcrypt');

const jwt = require('jsonwebtoken');

const sgMail = require('@sendgrid/mail');

const User = require('../models/user');

const errorsGenrator = require('../util/errorGenrators');

const { validationResult } = require('express-validator/check');

const user = require('../models/user');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

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
            //console.log(process.env.email_company);
            console.log(result.email);
            const websiteName = '_websiteName';
            const subject = 'Signup From ' + websiteName;
            const text = 'Thanks ' + result.name + 'for your signup, we are hoping for serving you in elegant way !!...';
            message = {
                to: result.email,
                from: process.env.email_company,
                subject: subject,
                text: text
            };
            return sgMail.send(message);
            //console.log(result);
        })
        .then(result => {
            console.log(result);
            res.status(201).json({
                message: 'User created and email sent'
            });
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
            }, process.env.tokenPrivateKeyAuth, { expiresIn: '0.5h' });
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
};

exports.resetPass = (req, res, next) => {
    //console.log(req.body);
    const error = validationResult(req);
    errorsGenrator.validationFailed(error);
    const email = req.body.email;
    User.findOne({ email: email })
        .then(user => {
            if (!user) {
                errorsGenrator.userNotFound();
            }
            const token = jwt.sign({
                email: user.email,
                userId: user._id.toString()
            }, process.env.tokenResetPassword, { expiresIn: '0.5h' });
            return token;
        })
        .then(token => {
            console.log(token);
            message = {
                to: email,
                from: process.env.email_company,
                subject: "Reset password for _websiteCompany",
                text: "Hello, you were request to reset your password!!..., Here your link below",
                html: "<a href = 'http://localhost/auth/update-password/'" + token + ">" + "click here" + "</a>"
            };
            return sgMail.send(message);
        })
        .then(result => {
            //console.log(result);
            res.status(200).json({ message: 'E-mail sent' });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
};
exports.setNewPassword = async(req, res, next) => {
    try {
        //console.log(req.body, req.params);
        const error = validationResult(req);
        errorsGenrator.validationFailed(error);
        const token = req.params.token;
        let decodedToken;
        decodedToken = await jwt.verify(token, process.env.tokenResetPassword);
        if (!decodedToken) {
            const error = new Error('token Dose not verified or may expired');
            error.statusCode = 401;
            throw error;
        }
        const password = req.body.password;
        //console.log(password);
        let loadedUser;
        User.findById(decodedToken.userId)
            .then(user => {
                if (!user) {
                    errorsGenrator.userNotFound();
                }
                loadedUser = user;
                return bcrypt.hash(password, 12);
            })
            .then(hashedPass => {
                loadedUser.password = hashedPass;
                return loadedUser.save();
            })
            .then(result => {
                console.log(result);
                res.status(201).json({
                    message: 'password updated'
                })
            })
            .catch(err => {
                if (!err.statusCode) {
                    err.statusCode = 500;
                }
                next(err);
            });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};