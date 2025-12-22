const User = require("../models/user");

//const bcrypt = require('bcrypt');

//const jwt = require('jsonwebtoken');

exports.signup = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    await User.create({ username, email, password });
    res.status(201).json({ message: "successfully created user" });
    //   const user = await User.findAll({where:{email}});
    //     if(user.length>0){
    //         return res.status(207).json({message:'User already exists'})
    //     }
    //     else{
    //         bcrypt.hash(password, 10 , async (err , hash)=>{
    //           console.log(err)
    //           await User.create({username, email, password: hash})
    //           res.status(201).json({message : 'successfully created user'})
    //         })
    //     }
  } catch (err) {
    res.status(500).json(err);
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email: email } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.password === password) {
      return res.status(200).json({ message: "User login sucessful" });
    } else {
      return res.status(401).json({ message: "User not authorized" });
    }
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};


// exports.login = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     console.log(password);

//     const user = await User.findAll({ where: { email } });

//     if (user.length > 0) {
//       bcrypt.compare(password, user[0].password, (err, match) => {
//         if (!match) {
//           return res.status(207).json({ message: "password incorrect" });
//         }
//         return res
//           .status(200)
//           .json({
//             message: "login success",
//             token: generateToken(user[0].id),
//             isPremium: user[0].ispremiumuser,
//           });
//       });
//     } else {
//       return res.status(207).json({ message: "Invalid Email " });
//     }
//   } catch (error) {
//     res.status(500).json(error);
//   }
// };

// function generateToken(id){
//   return jwt.sign({userId:id}, 'whereistoken');
// }

/*
exports.signup = async (req,res,next)=>{
  console.log("hey into signup");

  try
  {
   /* User.findByPk(req.body.email).then(userEmail=>{
      if(userEmail){
        const email = req.body.email

        const data = {
          email: email
        }
        res.status(207).json({newUserDetail: data})
      }*/
/*
     const findingEmail = await User.findByPk(req.body.email)
     if(findingEmail !== null){
        res.status(207).json({newUserDetail: 'Already Exists'})
     }
     if(findingEmail ==null)
      {
        const username = req.body.username;
        const email = req.body.email
        const password = req.body.password;

        if(!password){
          throw new Error('please enter password');
        }

        const signedUserData =  User.create({

          username : username,
          email : email,
          password : password

        })

        res.status(201).json({newUserDetail: 'signup success'});

     }
  }

  catch(error){
    console.log(error);
    res.status(500).json({error:error});

  }


}*/

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
