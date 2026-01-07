const Expense = require('../models/expense');
const User = require('../models/user')
//const AWS = require('aws-sdk');

const Userservices = require('../service/userservices');
const Sequelize = require('sequelize');
//const S3services = require('../service/s3services');
const sequelize = require('../util/database');
const { categorizeExpense } = require('../service/aiService');


// Optimized leaderboard fetching function
exports.getAllUsers = async (req, res, next) => {
  try {
    if (!req.user.ispremiumuser) {
      return res.status(403).json({ message: 'User is not a premium user' });
    }

    //Optimized Query: Fetch users and their total expense sum in ONE go
    const leaderboard = await User.findAll({
      attributes: [
        'id',
        'username',
        // Create a virtual column for the sum of expenses
        [sequelize.fn('sum', sequelize.col('expenses.eamount')), 'totalExpense']
      ],
      include: [
        {
          model: Expense,
          attributes: [] // We don't need the individual expense rows, just the sum
        }
      ],
      group: ['User.id'], // Group by user id to get individual sums
      order: [[sequelize.literal('totalExpense'), 'DESC']] // Sort by highest spender
    });

    return res.status(200).json({ success: true, data: leaderboard });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};


// Fetch expenses of a specific user for leaderboard details
exports.getLeaderBoardUser = async (req, res, next) => {

  try {
    if (req.user.ispremiumuser) {
      const userId = req.params.loadUserId;
      const user = await User.findOne({ where: { id: userId } })

      const expenses = await user.getExpenses();
      return res.status(200).json({ success: true, data: expenses })
    }

  }
  catch (error) {
    return res.status(500).json({ success: false, data: error });
  }
}



// exports.getExpenses = async (req, res) => {//getExpenses
//     try {
//         // 1. Get and parse pagination parameters from query string
//         const page = parseInt(req.query.page) || 1;
//         const limit = parseInt(req.query.limit) || 5;
//         const offset = (page - 1) * limit;

//         // 2. Fetch data and total count in one go
//         const { count: totalItems, rows: expenses } = await Expense.findAndCountAll({
//             where: { userId: req.user.id },
//             limit: limit,
//             offset: offset,
//             order: [['createdAt', 'DESC']] // Optional: show newest first
//         });

//         const lastPage = Math.ceil(totalItems / limit);

//         // 3. Send structured response
//         res.status(200).json({
//             expenses,
//             pagination: {
//                 totalItems,
//                 currentPage: page,
//                 hasNextPage: page < lastPage,
//                 hasPreviousPage: page > 1,
//                 nextPage: page + 1,
//                 previousPage: page - 1,
//                 lastPage: lastPage
//             }
//         });

//     } catch (error) {
//         console.error('Get Expenses Error:', error);
//         res.status(500).json({ 
//             message: "Failed to fetch expenses", 
//             error: error.message 
//         });
//     }
// };


// I can able to fetch all expenses without pagination
exports.getExpenses = async (req, res) => {
  try {
    const expenses = await req.user.getExpenses();
    res.status(200).json(expenses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// add expenses working good with AI category prediction
exports.addExpenses = async (req, res, next) => {
  const t = await sequelize.transaction(); // start transaction

  try {
    const { eamount, edescription } = req.body;

    // AI predicts the category
    const category = await categorizeExpense(edescription);

    if (!eamount || !edescription || !category) {
      await t.rollback();
      return res.status(400).json({ message: 'no fields can be empty' });
    }

    const data = await req.user.createExpense({ eamount, edescription, category }, {transaction:t });

    await t.commit(); // commit if everything is successful

    res.status(201).json({ newExpenseDetail: data });
  } catch (error) {
    await t.rollback(); // rollback on error
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};



// delete expense working good
exports.deleteExpenses = async (req, res, next) => {
  try {
    const expenseId = req.params.userId;

    if (!expenseId || expenseId === 'undefined') {
      return res.status(400).json({ success: false, message: 'Expense ID is required' });
    }

    // Fetch the specific expense belonging to this user
    // This ensures User A cannot delete User B's expense by guessing the ID
    const expenses = await req.user.getExpenses({ where: { id: expenseId } });
    const expense = expenses[0];

    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense not found or unauthorized' });
    }

    await expense.destroy();

    return res.status(200).json({ success: true, message: "Expense deleted successfully" });

  } catch (error) {
    console.error("Delete Error:", error);
    return res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};



exports.downloadAllUrl = async (req, res, next) => {
  try {
    let urls = await req.user.getDownloadurls();
    if (!urls) {
      res.status(404).json({ message: 'no urls found with this user', success: false });
    }
    res.status(200).json({ urls, success: true })
  } catch (error) {
    res.status(500).json({ err })
  }
}