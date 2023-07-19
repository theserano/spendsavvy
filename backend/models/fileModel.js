const mongoose = require("mongoose");

const FileSchema = new mongoose.Schema({
    filename: {
      type: String,
      required: true
    },
    data: {
      type: Buffer,
      required: true
    },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    contentType: {
      type: Object,
      required: true
    },
  });

const fileModel = mongoose.model('file', FileSchema);

module.exports = fileModel;