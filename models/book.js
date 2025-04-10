const mongoose = require("mongoose");
const { Schema } = mongoose;

const bookSchema = new Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  author: { type: String, required: true },
  thumbnailUrl: { type: String, required: true },
  description: { type: String },
  numberOfPages: { type: Number },
});

module.exports = mongoose.model("Book", bookSchema);
