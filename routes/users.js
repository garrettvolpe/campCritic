const express = require('express');
const { model } = require('mongoose');
const { register } = require('../models/user');
const router = express.Router();
const catchAsync = require('../utils/catchAsync')
const users = require('../controllers/users');
const passport = require('passport');

router.get('/register', users.renderRegister);

router.post('/register', catchAsync(users.registerUser));

router.get('/login', users.renderLogin);

router.post('/login', passport.authenticate('local', { failureFlash: true, failureRedirect: '/login', keepSessionInfo: true }), users.loginUser);

router.get('/logout', users.logoutUser)

module.exports = router