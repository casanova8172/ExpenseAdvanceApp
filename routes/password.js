const path = require('path');
const passwordController = require('../controller/passwordCtrl')

const middlewareAuthentication = require('../middleware/auth')

const express = require('express');
const router = express.Router();

//router.get('/reset/:id',passwordController.resetPassword)

//router.get('/update/:resetpassid',passwordController.updatePassword)

router.use('/forgot',passwordController.ForgotpasswordCont)

module.exports = router;