const mongoose = require("mongoose");
const { Schema } = mongoose;

const bookSchema = new Schema({
  isbn: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  author: { type: String },
  description: { type: String },
  numberOfPages: { type: Number },
  thumbnailUrl: { type: String },
});

module.exports = mongoose.model("Book", bookSchema);
