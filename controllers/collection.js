const express = require("express");
const Collection = require("../models/collection");
const Book = require("../models/book");
const router = express.Router();

// Get all collections for the current user (GET)
router.get("/", async (req, res) => {
  try {
    const collections = await Collection.find({ users: req.user._id }).populate(
      "books"
    );

    res.status(200).json(collections);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});

// Create a new collection (POST)
router.post("/", async (req, res) => {
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
    res.status(500).json({ error: error.message });
  }
});

// Get a specific collection (GET)
router.get("/:collectionId", async (req, res) => {
  try {
    const collection = await Collection.findById(req.params.collectionId)
      .populate("books")
      .populate("users", "username email");

    if (!collection) {
      return res.status(404).json({ error: "Collection not found" });
    }

    // Check if the user has access to this collection
    if (
      !collection.users.some(
        (user) => user._id.toString() === req.user._id.toString()
      )
    ) {
      return res
        .status(403)
        .json({ error: "You do not have access to this collection" });
    }

    res.status(200).json(collection);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});

// Update a collection (PUT)
router.put("/:collectionId", async (req, res) => {
  try {
    const collection = await Collection.findById(req.params.collectionId);

    if (!collection) {
      return res.status(404).json({ error: "Collection not found" });
    }

    // Check if the user has access to this collection
    if (
      !collection.users.some(
        (user) => user._id.toString() === req.user._id.toString()
      )
    ) {
      return res
        .status(403)
        .json({ error: "You do not have access to this collection" });
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
    res.status(500).json({ error: error.message });
  }
});

// Delete a collection (DELETE)
router.delete("/:collectionId", async (req, res) => {
  try {
    const collection = await Collection.findById(req.params.collectionId);

    if (!collection) {
      return res.status(404).json({ error: "Collection not found" });
    }

    // Check if the user has access to this collection
    if (
      !collection.users.some(
        (user) => user._id.toString() === req.user._id.toString()
      )
    ) {
      return res
        .status(403)
        .json({ error: "You do not have access to this collection" });
    }

    await Collection.findByIdAndDelete(req.params.collectionId);
    res.status(200).json({ message: "Collection deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});

// Add a book to a collection (POST)
router.post("/:collectionId/books/:bookId", async (req, res) => {
  try {
    const { collectionId, bookId } = req.params;
    console.log(`Adding book ${bookId} to collection ${collectionId}`);

    // Find the collection
    const collection = await Collection.findById(collectionId);
    if (!collection) {
      console.log(`Collection ${collectionId} not found`);
      return res.status(404).json({ error: "Collection not found" });
    }

    // Check if the user has access to this collection
    if (
      !collection.users.some(
        (user) => user._id.toString() === req.user._id.toString()
      )
    ) {
      console.log(
        `User ${req.user._id} does not have access to collection ${collectionId}`
      );
      return res
        .status(403)
        .json({ error: "You do not have access to this collection" });
    }

    // Find the book by its string ID
    console.log(`Looking for book with googleId: ${bookId}`);
    let book = await Book.findOne({ googleId: bookId });

    if (book) {
      console.log(
        `Found existing book: ${book.title} (${book.googleId}) with MongoDB _id: ${book._id}`
      );
    } else {
      console.log(
        `Book with id ${bookId} not found in database, creating new book`
      );
    }

    // If the book doesn't exist in our database yet, create it
    if (!book) {
      try {
        // Get book data from Google Books API
        const params = new URLSearchParams();
        params.append("key", process.env.GOOGLE_BOOKS_KEY);
        const apiUrl = `https://www.googleapis.com/books/v1/volumes/${bookId}?${params.toString()}`;
        console.log(`Fetching book data from Google Books API: ${apiUrl}`);

        const apiResponse = await fetch(apiUrl);

        if (!apiResponse.ok) {
          throw new Error(`Google Books API error: ${apiResponse.statusText}`);
        }

        const googleBook = await apiResponse.json();

        if (!googleBook || !googleBook.id) {
          throw new Error("Invalid book data received from Google Books API");
        }

        // Create a new book in our database
        book = new Book({
          googleId: googleBook.id,
          title: googleBook.volumeInfo.title || "Unknown Title",
          author: googleBook.volumeInfo.authors?.[0] ?? "N/A",
          thumbnailUrl: googleBook.volumeInfo.imageLinks?.thumbnail || "",
          description: googleBook.volumeInfo.description || "",
          numberOfPages: googleBook.volumeInfo.pageCount || 0,
        });

        await book.save();
        console.log(
          `Created new book in database: ${book.title} (${book.googleId})`
        );
      } catch (error) {
        console.error("Error creating book:", error);
        return res
          .status(500)
          .json({ error: `Failed to fetch or create book: ${error.message}` });
      }
    }

    // Check if the book is already in the collection
    // We need to compare ObjectId values as strings since direct comparison won't work
    console.log(
      `Checking if book ${book.title} (${book.googleId}) with MongoDB _id ${book._id} is already in collection`
    );
    console.log(
      `Collection books: ${JSON.stringify(
        collection.books.map((id) => id.toString())
      )}`
    );

    const bookAlreadyExists = collection.books.some((existingBookId) => {
      const match = existingBookId.toString() === book._id.toString();
      if (match) {
        console.log(
          `Book already exists in collection: ${existingBookId} === ${book._id}`
        );
      }
      return match;
    });

    if (bookAlreadyExists) {
      console.log(
        `Book ${book.title} (${book.googleId}) already exists in collection, returning 400`
      );
      return res.status(400).json({ error: "Book already in collection" });
    }

    // Add the book to the collection
    collection.books.push(book._id);
    await collection.save();

    // Fetch the updated collection with populated books
    const updatedCollection = await Collection.findById(collectionId).populate(
      "books"
    );

    res.status(200).json(updatedCollection);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
