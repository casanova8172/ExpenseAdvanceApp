const User = require("../models/user");
const Forgotpassword = require("../models/forgotPass");
const uuid = require("uuid");
const sib = require("sib-api-v3-sdk");
const bcrypt = require("bcrypt");
require("dotenv").config();

const ForgotpasswordCont = async (req, res, next) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User with this email does not exist",
            });
        }

        //Create a unique ID for the reset link
        const id = uuid.v4();
        console.log(id);
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

        const receivers = [{ email: email }];

        // 5. Send the Email
        const mailResponse = await tranEmailApi.sendTransacEmail({
            sender,
            to: receivers,
            subject: "Password Reset Request",
            textContent: `Reset your password by clicking the link below.`,
            htmlContent: `
                <p>You requested a password reset.</p>
                <p>Click on the link below to reset your password:</p>
                <a href="http://localhost:4000/pass/reset/${id}">Reset password</a>
            `,
        });

        return res.status(202).json({
            success: true,
            message: "Password reset link sent to your email.",
        });
    } catch (err) {
        console.error("Forgot Password Error:", err);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: err.message,
        });
    }
};


// Reset Password Controller
const resetPassword = async (req, res, next) => {
    console.log('Inside reset password');
    let id = req.params.id;

    try {
        let forgotpasswordrequest = await Forgotpassword.findOne({ where: { id } })
        if (!forgotpasswordrequest) {
            return res.status(404).json('User doesnt exist');
        }

        res.status(200).send(`<html>
                                    <form action="/pass/update/${id}" method="POST">
                                        <label for="newpassword">Enter New password</label>
                                        <input name="newpassword" type="password" required></input>
                                        <button>reset password</button>
                                    </form>
                                    <script>
                                        function formsubmitted(e){
                                            e.preventDefault();
                                            console.log('called')
                                        }
                                    </script>
                                </html>`
        )
        res.end();
    } catch (err) {
        return res.status(500).json({ message: err });
    }
}


// Update Password Controller
const updatePassword = async (req, res) => {
    console.log('Inside update');

    try {
        const { newpassword } = req.body;   
        const id = req.params.resetpassid;

        if (!newpassword) {
            return res.status(400).send("Password is missing");
        }

        const resetRequest = await Forgotpassword.findOne({ where: { id } });

        if (!resetRequest || !resetRequest.active) {
            return res.status(400).send("Reset link expired or invalid");
        }

        const user = await User.findOne({ where: { id: resetRequest.userId } });

        if (!user) {
            return res.status(404).send("User not found");
        }

        const hash = await bcrypt.hash(newpassword, 10);
        await user.update({ password: hash });

        await resetRequest.update({ active: false });

        res.send("<h2>Password updated successfully. You can login now.</h2>");

    } catch (error) {
        console.error(error);
        res.status(500).send("Something went wrong");
    }
};




module.exports = {
    ForgotpasswordCont,
    resetPassword,
    updatePassword,
};
