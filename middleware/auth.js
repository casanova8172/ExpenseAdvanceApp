const jwt = require('jsonwebtoken');
const User = require('../models/user');

const authentication = async (req, res, next) => {
    try {
        const token = req.header('Authorization');

        if (!token) {
            return res.status(401).json({ success: false, message: 'Token is missing' });
        }

        // This will throw an error if the token is invalid or expired
        const decodedToken = jwt.verify(token, 'whereistoken');
        
        // 3. Find the user in the database
        const user = await User.findByPk(decodedToken.userId);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // 4. Attach user to the request object and move to the next function
        req.user = user;
        next();

    } catch (error) {
        console.log("Authentication Error:", error);
        // 5. Send a response to the client so the request doesn't "hang"
        return res.status(401).json({ success: false, message: 'Unauthorized / Invalid Token' });
    }
}

module.exports = { authentication };