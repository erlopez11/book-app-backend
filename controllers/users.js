const express = require('express');
const router = express.Router();
const User = require('../models/user');


//GET /users 'get all users from database' 'protected'
router.get('/', async (req, res) => {
    try {
        const users = await User.find({}, 'username');
        res.json(users);
    } catch (error) {
        res.status(500).json({error: error.message});
    }
});

//GET /users/:userId 'get a single user's details'
router.get('/:userId', async (req, res) => {
    try {
        //if user is trying to see another user's information
        //can block request and say it's unauthorized
        if (req.user._id !== req.params.userId) {
            return res.status(403).json({error: 'Unauthorized'})
        }

        const user = await User.findById(req.params.userId);
        if(!user) {
            return res.status(404).json({error: 'User not found'});
        }
        res.json({ user });
    } catch (error) {
        console.log(error);
        res.status(500).json({error: error.message});
    }
});
module.exports = router;