const mongoose = require("mongoose");
const { Schema } = mongoose;

const noteSchema = new Schema({
  book: { type: Schema.Types.ObjectId, ref: "Book", required: true },
  content: { type: String },
});

const ratingSchema = new Schema({
  book: { type: Schema.Types.ObjectId, ref: "Book", required: true },
  rating: { type: Number, min: 0, max: 5 },
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
  notes: [noteSchema],
  ratings: [ratingSchema],
});

userSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    delete returnedObject.hashedPassword;
  },
});

module.exports = mongoose.model("User", userSchema);
