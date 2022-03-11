const express = require('express');
const router = express.Router();

const catchAsync = require('../utils/CatchAsync');
const expressError = require('../utils/ExpressError');


const passport = require('passport');

const userController = require('../controllers/users');


router.route('/register')
    .get(userController.renderRegisterForm)
    .post(catchAsync(userController.registerUser))


router.route('/login')
    .get(userController.renderLogin)
    .post(passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }),
        userController.loginUser
    )

router.get('/logout', userController.logout);

module.exports = router;