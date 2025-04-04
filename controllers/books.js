const express = require('express');
const verifyToken = require('../middleware/verify-token');
const User = require('../models/user'); 
const Book = require('../models/book');
const router = express.Router();

//POST /books - CREATE (Add new Book Stats) Route "Protected"
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

//PUT /books/:bookId - UPDATE (Book Stats) Route "Protected"
router.put('/:bookId', verifyToken, async (req, res) => {
    try {
        const currentUser = await User.findById(req.user._id);
        const bookStat = currentUser.bookStats.id(req.params.bookId);
        bookStat.set(req.body);
        await currentUser.save();
        res.status(200).json({message: 'Update Successful'});
    } catch (error) {
        console.log(error);
        res.status(500).json({error: error.message});
    }
});






module.exports = router;