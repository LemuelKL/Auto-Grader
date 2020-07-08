const mongoose = require('mongoose')

const PaperSchema = mongoose.Schema({
  id: String,
  name: String,
  numPages: Number,
  width: Number,
  height: Number,
  candidates: [String],
  questions: [{}]
})

module.exports = mongoose.model('papers', PaperSchema)