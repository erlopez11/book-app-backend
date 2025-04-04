const mongoose = require("mongoose");
const { Schema } = mongoose;

const collectionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  thumbnailUrl: { type: String },
  description: { type: String },
  users: [{ type: Schema.Types.ObjectId, ref: "User" }],
  books: [{ type: Schema.Types.ObjectId, ref: "Book" }],
});

module.exports = mongoose.model("Collection", collectionSchema);
