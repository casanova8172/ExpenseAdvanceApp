const User = require("../models/user");
const Forgotpassword = require("../models/forgotPass");
const uuid = require("uuid");
const sib = require("sib-api-v3-sdk");
require("dotenv").config();

const ForgotpasswordCont = async (req, res, next) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(404).json({ success: false, message: "User with this email does not exist" });
        }

        //Create a unique ID for the reset link
        const id = uuid.v4();

        // Create the record in the Forgotpassword table (Awaited)
        // This assumes a HasMany/BelongsTo relationship is defined in your models
        await user.createForgotpassword({ id, active: true });

        //Initialize Brevo (Sendinblue)
        const client = sib.ApiClient.instance;
        const apiKey = client.authentications["api-key"];
        apiKey.apiKey = process.env.BREVO_API_KEY;

        const tranEmailApi = new sib.TransactionalEmailsApi();

        const sender = {
            email: "leelanandnitd@gmail.com",
            name: "Leelanand",
        };

        const receivers = [{ email: "211220030@nitdelhi.ac.in" }];

        // 5. Send the Email
        const mailResponse = await tranEmailApi.sendTransacEmail({
            sender,
            to: receivers,
            subject: "Password Reset Request",
            textContent: `Reset your password by clicking the link below.`,
            htmlContent: `
                <p>You requested a password reset.</p>
                <p>Click on the link below to reset your password:</p>
                <a href="http://localhost:4000/password/resetpassword/${id}">Reset password</a>
            `,
        });

        return res.status(202).json({ 
            success: true, 
            message: "Password reset link sent to your email." 
        });

    } catch (err) {
        console.error("Forgot Password Error:", err);
        return res.status(500).json({ 
            success: false, 
            message: "Internal Server Error", 
            error: err.message 
        });
    }
};



// exports.resetPassword = async (req, res, next) => {
//   console.log("into reset");
//   let id = req.params.id;

//   try {
//     let forgotpasswordrequest = await Forgotpassword.findOne({ where: { id } });
//     if (!forgotpasswordrequest) {
//       return res.status(404).json("User doesnt exist");
//     }
//     forgotpasswordrequest.update({ active: false });

//     res.status(200).send(`<html>
//                                     <script>
//                                         function formsubmitted(e){
//                                             e.preventDefault();
//                                             console.log('called')
//                                         }
//                                     </script>
//                                     <form action="/pass/update/${id}" method="POST">
//                                         <label for="newpassword">Enter New password</label>
//                                         <input name="newpassword" type="password" required></input>
//                                         <button>reset password</button>
//                                     </form>
//                                 </html>`);
//     res.end();
//   } catch (err) {
//     return res.status(500).json({ message: err });
//   }
// };



// exports.updatePassword = async (req, res, next) => {
//   console.log("into update");
//   const { newpassword } = req.query;
//   const id = req.params.resetpasswordid;

//   // const token = localStorage.getItem('token')

//   console.log(typeof newpassword);
//   try {
//     const resetpasswordrequest = await Forgotpassword.findOne({
//       where: { id },
//     });
//     const user = await User.findOne({
//       where: { id: resetpasswordrequest.userId },
//     });
//     if (!user) {
//       return res.status(404).json({ error: "No user Exists", success: false });
//     }

//     const saltRounds = 10;
//     bcrypt.hash(newpassword, saltRounds, async (err, hash) => {
//       if (err) {
//         throw new Error(err);
//       }
//       await user.update({ password: hash });
//       res.status(201).json({ message: "Successfuly update the new password" });
//     });
//   } catch (error) {
//     return res.status(403).json({ error, success: false });
//   }
// };


module.exports = {
  ForgotpasswordCont,
};