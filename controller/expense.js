const Expense = require('../models/expense');
const User = require('../models/user')
//const AWS = require('aws-sdk');

const Userservices = require('../service/userservices')
//const S3services = require('../service/s3services');



// exports.downloadExpense =  async(req,res,next)=>{
//     try{



//         const expenses = await Userservices.getExpenses(req)   //s3 funcationality 
// //req.user.getExpenses();
//         console.log(expenses);

//         const stringyfyExpenses = JSON.stringify(expenses);
//         //for creating a txt file we have to stringify it
//         //because is an array rightnow

//         const userId = req.user.id;

//         const filename = `Expense${userId}/${new Date()}.txt`;

//         const fileURL = await S3services.uploadToS3(stringyfyExpenses, filename);

//         const downloadUrlData = await req.user.createDownloadurl({
//             fileURL: fileURL,
//             filename
//         })

//         res.status(200).json({fileURL,downloadUrlData, success:true})

//     }
//     catch(error){
//          res.status(500).json({fileURL: '', success:false})
//     }

// }


//get all users for leaderboard
exports.getAllUsers = async (req, res, next) => {
  try {
    console.log(req.user.ispremiumuser);

    if (req.user.ispremiumuser) {
      console.log("into getall Users");
      let leaderboard = [];
      let users = await User.findAll({ attributes: ['id', 'username', 'email'] })

      console.log(users);

      for (let i = 0; i < users.length; i++) {
        let expenses = await users[i].getExpenses();

        let totalExpense = 0;
        for (let j = 0; j < expenses.length; j++) {
          totalExpense += expenses[j].eamount
        }
    
        let userObj = {
          user: users[i],
          expenses,
          totalExpense
        }
        leaderboard.push(userObj);
      }
      return res.status(200).json({ success: true, data: leaderboard });
    }

    return res.status(400).json({ message: 'user is not premium user' });

  } catch (error) {
    res.status(500).json({ success: false, data: error });
  }
}


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
exports.getExpenses = async (req, res) => {// I can able to fetch all expenses without pagination
  try {
    const expenses = await req.user.getExpenses();
    res.status(200).json(expenses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


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