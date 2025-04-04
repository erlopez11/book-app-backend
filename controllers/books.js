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

        const newBookStat = bookStats[bookStats.length - 1];
        res.status(201).json(newBookStat);
    } catch (error) {
        console.log(error);
        res.status(500).json({error: error.message});
    }
});

//PUT /books/:bookId - UPDATE (Book Stats) Route "Protected"
router.put('/:bookId', verifyToken, async (req, res) => {
    try {
        const currentUser = await User.findById(req.user._id);
        //TODO: Can't use the bookId from params to access the bookStat blc that id will be set to book?
        //need diff way to get that bookstat id or maybe the route id is set to the new bookStat?
        //maybe it is ties to the book title?
        //maybe insted of object ide use the isbn of the book since it is unique to the book?
        const bookStat = currentUser.bookStats.id(req.params.bookId);
        bookStat.set(req.body);
        await currentUser.save();
        res.status(200).json({message: 'Update Successful'});
    } catch (error) {
        console.log(error);
        res.status(500).json({error: error.message});
    }
});

//DELETE /books/:bookId - DELETE (Book Stats) Route "Protected"
router.delete('/:bookId', verifyToken, async (req, res) => {
    try {
        const currentUser = await User.findById(req.user._id);
        const bookStats = currentUser.bookStats; 
        bookStats.remove({_id: req.params.bookId});//TODO: same issue as above
        await currentUser.save();
        res.status(200).json({message: "Delete Successful!"});
    } catch (error) {
        console.log(error);
        res.status(500).json({error: error.message});
    }
});






module.exports = router;