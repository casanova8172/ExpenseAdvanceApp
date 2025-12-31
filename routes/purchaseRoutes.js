const path = require('path');
const express = require('express');


const purchaseController = require('../controller/purchase');
const authenticationMiddleware = require('../middleware/auth');

const router = express.Router();


router.get('/premiummembership', authenticationMiddleware.authentication, purchaseController.purchasepremium);

router.post('/updatetransactionstatus', authenticationMiddleware.authentication, purchaseController.updateTransactionStatus)

router.post('/updatetransactionstatusfailed', authenticationMiddleware.authentication, purchaseController.updateTransactionStatusFailed);



module.exports = router;