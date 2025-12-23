const path = require('path');
const express = require('express');

const expenseController = require('../controller/expense');
const userController = require('../controller/users');

//const userAuthentication = require('../middleware/auth');


const router = express.Router();


router.post('/signup', userController.signup);

router.post('/login', userController.login);

//router.post('/getExpenses/:pageNo', expenseController.getExpenses);
router.get('/getExpenses', expenseController.getExpenses);

router.post('/addExpense', expenseController.addExpenses);

router.delete('/deleteExpense/:userId', expenseController.deleteExpenses);


module.exports = router;