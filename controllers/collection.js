const express = require('express');
const Collection = require('../models/collection');
const router = express.Router();

// Create a new collection (POST)
router.post('/', async (req, res) => {
    try {
        const collection = new Collection(req.body);
        
        // Add the current user to the collection's users array
        if (!collection.users.includes(req.user._id)) {
            collection.users.push(req.user._id);
        }
        
        await collection.save();
        res.status(201).json(collection);
    } catch (error) {
        console.log(error);
        res.status(500).json({error: error.message});
    }
});

// Get a specific collection (GET)
router.get('/:collectionId', async (req, res) => {
    try {
        const collection = await Collection.findById(req.params.collectionId)
            .populate('books')
            .populate('users', 'username email');
        
        if (!collection) {
            return res.status(404).json({error: 'Collection not found'});
        }
        
        // Check if the user has access to this collection
        if (!collection.users.some(user => user._id.toString() === req.user._id.toString())) {
            return res.status(403).json({error: 'You do not have access to this collection'});
        }
        
        res.status(200).json(collection);
    } catch (error) {
        console.log(error);
        res.status(500).json({error: error.message});
    }
});

// Update a collection (PUT)
router.put('/:collectionId', async (req, res) => {
    try {
        const collection = await Collection.findById(req.params.collectionId);
        
        if (!collection) {
            return res.status(404).json({error: 'Collection not found'});
        }
        
        // Check if the user has access to this collection
        if (!collection.users.some(user => user._id.toString() === req.user._id.toString())) {
            return res.status(403).json({error: 'You do not have access to this collection'});
        }
        
        // Update the collection fields
        if (req.body.title) collection.title = req.body.title;
        if (req.body.description) collection.description = req.body.description;
        if (req.body.books) collection.books = req.body.books;
        if (req.body.users) collection.users = req.body.users;
        
        await collection.save();
        res.status(200).json(collection);
    } catch (error) {
        console.log(error);
        res.status(500).json({error: error.message});
    }
});

// Delete a collection (DELETE)
router.delete('/:collectionId', async (req, res) => {
    try {
        const collection = await Collection.findById(req.params.collectionId);
        
        if (!collection) {
            return res.status(404).json({error: 'Collection not found'});
        }
        
        // Check if the user has access to this collection
        if (!collection.users.some(user => user._id.toString() === req.user._id.toString())) {
            return res.status(403).json({error: 'You do not have access to this collection'});
        }
        
        await Collection.findByIdAndDelete(req.params.collectionId);
        res.status(200).json({message: 'Collection deleted successfully'});
    } catch (error) {
        console.log(error);
        res.status(500).json({error: error.message});
    }
});

module.exports = router;
