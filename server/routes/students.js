const express = require('express')
const router = express.Router()
const Student = require('./../models/Student')

router.get('/students/:pyccode', async (req, res) => {
  try {
    const student = await Student.findOne({ pyccode: req.params.pyccode })
    res.json(student)
  } catch (err) {
    res.json({ msg: err })
  }
})

router.post('/students', (req, res) => {
  const student = new Student({
    pyccode: req.body.pyccode,
    ename: req.body.ename,
    cname: req.body.cname,
    class: req.body.class,
    classNo: req.body.classNo
  })
  console.log(student)
  student.save().then(data => {
    console.log("Nice")
    res.json(data)
  }).catch(err => {
    console.log("Bad")
    res.status(500)
  })
})

module.exports = router