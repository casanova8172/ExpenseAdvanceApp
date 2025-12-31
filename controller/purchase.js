const Razorpay = require('razorpay');
const Order = require('../models/orders');

const purchasepremium = async (req, res) => {
    try {
        const rzp = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET
        });

        const amount = 250000; 

        const order = await rzp.orders.create({ amount, currency: "INR" });

        await Order.create({ 
            orderid: order.id, 
            status: 'PENDING',
            userId: req.user.id 
        });

        return res.status(201).json({ order, key_id: rzp.key_id });

    } catch (err) {
        console.error(err);
        res.status(403).json({ message: 'Something went wrong', error: err.message });
    }
}

const updateTransactionStatus = async (req, res) => {
    try {
        const { payment_id, order_id } = req.body;

        const order = await Order.findOne({ where: { orderid: order_id } });

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        // Update Order and User status
        await Promise.all([
            order.update({ paymentid: payment_id, status: 'SUCCESSFUL' }),
            req.user.update({ ispremiumuser: true })
        ]);

        return res.status(202).json({ 
            success: true, 
            message: "Transaction Successful" 
        });

    } catch (err) {
        console.error("Transaction Error:", err);
        return res.status(403).json({ 
            message: 'Something went wrong', 
            error: err.message 
        });
    }
};

// NEW FUNCTION: Handle Payment Failure
const updateTransactionStatusFailed = async (req, res) => {
    try {
        const { order_id, payment_id } = req.body;

        const order = await Order.findOne({ where: { orderid: order_id } });
        
        if (order) {
            // Update status to FAILED in database
            await order.update({ paymentid: payment_id, orderid: order_id, status: 'FAILED' });
            return res.status(200).json({ success: true, message: "Transaction status updated to FAILED" });
        } else {
            return res.status(404).json({ message: "Order not found" });
        }

    } catch (err) {
        console.error("Failure Update Error:", err);
        return res.status(500).json({ message: 'Internal Server Error', error: err.message });
    }
};

module.exports = {
    purchasepremium,
    updateTransactionStatus,
    updateTransactionStatusFailed // Export this
}