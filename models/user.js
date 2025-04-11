const mongoose = require("mongoose");
const book = require("./book");
const { Schema } = mongoose;

const bookLogSchema = new Schema({
  book: { type: String },
  author: {type: String},
  thumbnailUrl: {type: String},
  status: {
    type: String,
    enum: ['want to read', 'currently reading', 'read', 'did not finish'],
  },
  notes: {
    type: String,
  },
  rating: {
    type: String,
    required: true,
    enum: ['no rating', '1', '2', '3', '4', '5'],
  },
  collections: {
    type: String,
  }
});

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
  },
  hashedPassword: {
    type: String,
    required: true,
  },
  collections: [{ type: Schema.Types.ObjectId, ref: "Collection" }],
  bookLog: [bookLogSchema],
});

userSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    delete returnedObject.hashedPassword;
  },
});

module.exports = mongoose.model("User", userSchema);
