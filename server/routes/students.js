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

// Get list of students by class.
router.get('/students/class/:class', async (req, res) => {
  try {
    const students = await Student.find({ class: req.params.class })
    res.json(students)
  } catch (err) {
    res.json({ msg: err })
  }
})

// Get list of students **grouped** by class.
router.get('/students/grouped/class', async (req, res) => {
  try {
    const students = await Student.aggregate([{$group:{_id:"$class", data:{$push:"$$ROOT"}}}])
    res.json(students)
  } catch (err) {
    res.json({ msg: err })
  }
})

module.exports = router