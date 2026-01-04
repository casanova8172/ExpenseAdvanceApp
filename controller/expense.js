const Expense = require('../models/expense');
const User = require('../models/user')
//const AWS = require('aws-sdk');

const Userservices = require('../service/userservices');
const Sequelize = require('sequelize');
//const S3services = require('../service/s3services');
const sequelize = require('../util/database');



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



// exports.getLeaderBoardUser = async (req, res, next) => {

//   try {
//     if (req.user.ispremiumuser) {
//       const userId = req.params.loadUserId;
//       const user = await User.findOne({ where: { id: userId } })

//       const expenses = await user.getExpenses();
//       return res.status(200).json({ success: true, data: expenses })
//     }

//   }
//   catch (error) {
//     return res.status(500).json({ success: false, data: error });
//   }


// }



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

// add expenses working good
exports.addExpenses = async (req, res, next) => {
  const { eamount, edescription, category } = req.body;

  try {

    if (!eamount || !edescription || !category) {
      return res.status(400).json({ message: 'no fields can be empty' })
    }
    const data = await req.user.createExpense({
      eamount,
      edescription,
      category
    })
    //magic funcs of seq for associations
    res.status(201).json({ newExpenseDetail: data });

    /* const data = await Expense.create({
         eamount: eamount,
         edescription: edescription,
         category: category,
     })
     res.status(201).json({newExpenseDetail: data});*/
  }
  catch (error) {
    console.log(error);
    res.status(500).json({ error: error });
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