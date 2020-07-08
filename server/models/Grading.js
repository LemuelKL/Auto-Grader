const mongoose = require('mongoose')

const GradingSchema = mongoose.Schema({
  paperId: String,
  questionName: String,
  candidate: String,
  score: Number,
  presetRemark: String, // Id of that remark preset
  customRemark: String  // Marker's typings
})

module.exports = mongoose.model('gradings', GradingSchema)