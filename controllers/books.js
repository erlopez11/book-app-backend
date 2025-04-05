const express = require('express');
const verifyToken = require('../middleware/verify-token');
const User = require('../models/user'); 
const Book = require('../models/book');
const router = express.Router();

//TODO: Change Url to reflect universal instead of specific book
const API_URL='https://www.googleapis.com/books/v1/volumes/wod-BAAAQBAJ'

//POST /book -CREATE New Book Info from API 
 router.post('/', verifyToken, async (req, res) => {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();
        const bookInfo = {
            isbn: data.volumeInfo.industryIdentifiers[0].identifier, //Correct ISBN# ?
            title: data.volumeInfo.title,
            author: data.volumeInfo.authors.toString(),
            description: data.volumeInfo.description,
            numberOfPages: data.volumeInfo.pageCount,
            thumbnailUrl: data.volumeInfo.imageLinks.thumbnail,
        }
        const book = await Book.create(bookInfo);
        res.json(book);
    } catch (error) {
        console.log(error);
        res.status(500).json({error: error.message})
    }
}); 

//BOOKSTATS

//POST /books - CREATE (Add new Book Stats) Route "Protected"
router.post('/:bookId/bookLog', verifyToken, async (req, res) => {
    try {
        const currentUser = await User.findById(req.user._id);
        const bookLog = currentUser.bookLog;
        bookLog.push(req.body);
        await currentUser.save();

        const newBookLog = bookLog[bookLog.length - 1];
        res.status(201).json(newBookLog);
    } catch (error) {
        console.log(error);
        res.status(500).json({error: error.message});
    }
});

//PUT /books/:bookId - UPDATE (Book Stats) Route "Protected"
router.put('/:bookId/bookLog/:logItemId', verifyToken, async (req, res) => {
    try {
        const currentUser = await User.findById(req.user._id);
        const bookLog = currentUser.bookLog.id(req.params.logItemId);
        bookLog.set(req.body);
        await currentUser.save();
        res.status(200).json({message: 'Update Successful'});
    } catch (error) {
        console.log(error);
        res.status(500).json({error: error.message});
    }
});

//DELETE /books/:bookId - DELETE (Book Stats) Route "Protected"
router.delete('/:bookId/bookLog/:logItemId', verifyToken, async (req, res) => {
    try {
        const currentUser = await User.findById(req.user._id);
        const bookLog = currentUser.bookLog; 
        bookLog.remove({_id: req.params.logItemId});
        await currentUser.save();
        res.status(200).json({message: "Delete Successful!"});
    } catch (error) {
        console.log(error);
        res.status(500).json({error: error.message});
    }
});






module.exports = router;