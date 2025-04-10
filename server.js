const dotenv = require('dotenv');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const logger = require('morgan');

const authRouter = require('./controllers/auth');
const usersRouter = require('./controllers/users');
const bookLogsRouter = require('./controllers/bookLogs');
const booksRouter = require("./controllers/books");
const collectionsRouter = require('./controllers/collection');

const verifyToken = require('./middleware/verify-token');

dotenv.config();

const port = process.env.PORT || '3000';

const app = express();

mongoose.connect(process.env.MONGODB_URI);
mongoose.connection.on("connected", () => {
  console.log(`Connected to MongoDB ${mongoose.connection.name}.`);
});

app.use(cors());
app.use(express.json());
app.use(logger("dev"));


app.use('/auth', authRouter);
app.use('/users', verifyToken, usersRouter);
app.use("/books", verifyToken, booksRouter);
app.use('/books', verifyToken, bookLogsRouter);
app.use('/collections', verifyToken, collectionsRouter);


app.listen(port, () => {
    console.log('The express app is ready!');
});

