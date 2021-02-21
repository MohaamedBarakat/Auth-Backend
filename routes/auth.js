const authController = require('../controllers/auth');
const { body } = require('express-validator/check');
const User = require('../models/user');
const isAuth = require('../middleware/is-auth');
const express = require('express');
const router = express.Router();

router.put('/signup', [
    body('email', 'Invalid email.')
    .isEmail()
    .trim()
    .custom((value, req, res, next) => {
        User.findOne({ email: value })
            .then(userDoc => {
                if (userDoc) {
                    return new Promise.reject('E-Mail already exists!');
                }
            })
            .catch(err => {
                if (!err.statusCode) {
                    err.statusCode = 500;
                }
                next(err);
            })
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

module.exports = router;