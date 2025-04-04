const express = require('express');
const verifyToken = require('../middleware/verify-token');
const User = require('../models/user'); 
const Book = require('../models/book');
const router = express.Router();

//POST /books - CREATE Route "Protected"
router.post('/', verifyToken, async (req, res) => {
    try {
        const currentUser = await User.findById(req.user._id);
        const bookStats = currentUser.bookStats;
        bookStats.push(req.body);
        await currentUser.save();
        res.status(201).json(bookStats);
    } catch (error) {
        console.log(error);
        res.status(500).json({error: error.message});
    }
});






module.exports = router;