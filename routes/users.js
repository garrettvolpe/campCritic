const express = require('express');
const { model } = require('mongoose');
const { register } = require('../models/user');
const router = express.Router();
const catchAsync = require('../utils/catchAsync')
const users = require('../controllers/users');
const passport = require('passport');

router.route('/register')
    .get(users.renderRegister)
    .post(catchAsync(users.registerUser));


router.route('/login')
    .get(users.renderLogin)
    .post(passport.authenticate('local',
        { failureFlash: true, failureRedirect: '/login', keepSessionInfo: true }), users.loginUser);

router.get('/logout', users.logoutUser)

module.exports = router