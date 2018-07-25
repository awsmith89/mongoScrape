let mongoose = require("mongoose");
let Schema = mongoose.Schema;
let NoteSchema = new Schema({
  article_id: {
    type: Schema.Types.ObjectId
  },
  body: {
    type: String
  }
});

let Note = mongoose.model("Note", NoteSchema);

module.exports = Note;