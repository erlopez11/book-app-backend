const express = require('express');
const User = require('../models/user'); 
const router = express.Router();


router.post('/:bookId/bookLog', async (req, res) => {
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

router.get('/:bookId/bookLog/:bookLogId', async (req, res) => {
    try {
        const currentUser = await User.findById(req.user._id);
        const bookLogItem = currentUser.bookLog.id(req.params.bookLogId);
        res.status(200).json(bookLogItem);

    } catch (error) {
        console.log(error);
        res.status(500).json({error: error.message});
    }
});

router.put('/:bookId/bookLog/:bookLogId', async (req, res) => {
    try {
        const currentUser = await User.findById(req.user._id);
        const bookLog = currentUser.bookLog.id(req.params.bookLogId);
        bookLog.set(req.body);
        await currentUser.save();
        res.status(200).json(bookLog);
    } catch (error) {
        console.log(error);
        res.status(500).json({error: error.message});
    }
});

router.delete('/:bookId/bookLog/:bookLogId', async (req, res) => {
    try {
        const currentUser = await User.findById(req.user._id);
        const bookLog = currentUser.bookLog; 
        bookLog.remove({_id: req.params.bookLogId});
        await currentUser.save();
        res.status(200).json({message: "Delete Successful!"});
    } catch (error) {
        console.log(error);
        res.status(500).json({error: error.message});
    }
});






module.exports = router;