const mongoose = require('mongoose')

const StudentSchema = mongoose.Schema({
  pyccode: String,
  ename: String,
  cname: String,
  class: String,
  classNo: String,
})

module.exports = mongoose.model('students', StudentSchema)