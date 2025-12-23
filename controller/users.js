const User = require("../models/user");
const bcrypt = require("bcrypt");

//const jwt = require('jsonwebtoken');

exports.signup = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ where: { email: email } });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    //Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    //Create the user with the hashed password
    await User.create({
      username,
      email,
      password: hashedPassword,
    });

    res.status(201).json({ message: "Successfully created user" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error", error: err.message });
  }
};


exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(password);

    const user = await User.findOne({ where: { email: email } });

    if (!user) {
      return res.status(401).json({ message: "Invalid email" });
    }

    //Compare the plain-text password with the stored hash
    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
      return res.status(200).json({ message: "User login successful" });
    } else {
      return res.status(401).json({ message: "Invalid password" });
    }
  } catch (error) {
    res.status(500).json(error);
  }
};







// function generateToken(id){
//   return jwt.sign({userId:id}, 'whereistoken');
// }

// exports.getUsers = async (req,res,next)=>{
//     console.log("Getting users");

//     try{

//      const data =  await User.findAll()
//      res.status(201).json(data);
//     }
//     catch(error) {
//       console.log(error);
//       res.status(500).json({error:error});
//     }

// }

// exports.postAddUser = async(req, res, next) => {
//   console.log('adding a user');
//   try{
//     const name = req.body.name;
//     const email = req.body.email;
//     const phoneNo = req.body.phoneNo;

//     if(!phoneNo){
//       throw new Error('please enter phone number');
//     }

//     const data = await User.create({
//       name: name,
//       email: email,
//       phoneNo: phoneNo,
//     })
//     res.status(201).json({newUserDetail: data});
//   }
//   catch(error){
//     console.log(error);
//     res.status(500).json({error:error});
//   }
// }

// exports.deleteUser = async (req,res,next)=>{

//   try{
//     let userId = req.params.userId;
//     if(!userId){
//       res.status(400).json({error:'id missing'});
//     }
//     await User.destroy({where:{id:userId}});
//     res.sendStatus(200);

//   }
//   catch(error){
//     console.log(error);
//     res.status(500).json('error occured');
//   };

// }

//left side  titlebelongs to db attribute and right side belongs to const

/*
router.post('/user/add-user', async (req,res,next)=>{
    console.log('hi');
    const name = req.body.name;
    const email = req.body.email;
    const phoneNo = req.body.number;

    const data = await User.create( {name:name, email:email, phoneNo:phoneNo});
    res.status(201).json({newUserDetail: data});
});

router.get('/user/get-user', async (req,res,next)=>{
    console.log("hi");
    const users = await User.findAll();
    res.status(200).json({allUsers: users});
});
*/
