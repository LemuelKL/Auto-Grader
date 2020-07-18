const mongoose = require('mongoose')

const PresetSchema = mongoose.Schema({
  paperId: String,
  questionName: String,
  name: String,
  description: String,
})

module.exports = mongoose.model('presets', PresetSchema)