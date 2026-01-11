const express = require('express');
const router = express.Router();
const passwordController = require('../controller/passwordCtrl');


router.get('/reset/:id', passwordController.resetPassword);

router.post('/update/:resetpassid', passwordController.updatePassword);

router.use('/forgot', passwordController.ForgotpasswordCont);

module.exports = router;