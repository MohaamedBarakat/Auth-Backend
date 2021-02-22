const authController = require('../controllers/auth');
const { body } = require('express-validator');
const User = require('../models/user');
const isAuth = require('../middleware/is-auth');
const express = require('express');
const router = express.Router();

router.put('/signup', [
    body('email', 'Invalid email.')
    .isEmail()
    .trim()
    .custom(async(value, req, res, next) => {
        //console.log(value);
        await User.findOne({ email: value })
            .then(userDoc => {
                if (userDoc) {
                    //console.log('Email already exist');
                    return Promise.reject('E-Mail already exists!');
                }
                // console.log('End of customization');
            });
    }),
    body('password', 'Invalid password')
    .trim()
    .isLength({ min: 5 }),
    body('name', "Invalid name")
    .isLength({ min: 5 })
    .trim()
], authController.signup);

router.post('/login', [
    body('email', 'Invalid email.')
    .isEmail()
    .trim(),
    body('password', 'Invalid password')
    .trim()
    .isLength({ min: 5 })
], authController.login);

router.delete('/user/:userId', isAuth, authController.deleteUser);

router.post('/add', isAuth, authController.add);

router.post('/reset-password', [body('email', 'Invalid E-mali.')
    .trim()
    .isEmail()
    .custom(
        async(value, req, res, next) => {
            await User.findOne({ email: value })
                .then(userDoc => {
                    if (!userDoc) {
                        return Promise.reject("This E-mail didn't Register yet.");
                    }
                })
                .catch(error => {
                    if (!error.statusCode) {
                        error.statusCode = 500;
                    }
                    next(error);
                });

        })
], authController.resetPass);

router.put('/reset-password/:token', [
    body('password', 'Invalid password')
    .trim()
    .custom(async(value, { req }) => {
        req.password = value;
    })
    .isLength({ min: 5 }), body('confirmPassword', 'Invalid password')
    .trim()
    .isLength({ min: 5 })
    .custom(async(value, { req }) => {
        console.log(req.password);
        if (value !== req.password) {
            return Promise.reject('Passwords not matched');
        }
    })
], authController.setNewPassword);

module.exports = router;