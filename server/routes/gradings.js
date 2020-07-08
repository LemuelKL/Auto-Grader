const express = require('express')
const router = express.Router()
const Grading = require('./../models/Grading')

router.get('/gradings/:paperId/:questionName/:candidate', async (req, res) => {
  try {
    const grading = await Grading.findOne({ paperId: req.params.paperId, questionName: req.params.questionName, candidate: req.params.candidate })
    res.json(grading)
  } catch (err) {
    res.json({ msg: err })
  }
})

router.post('/gradings', (req, res) => {
  Grading.findOneAndUpdate({ paperId: req.body.paperId, questionName: req.body.questionName, candidate: req.body.candidate }, req.body, { upsert: true, new: true, runValidators: true }, function (err, doc) {
    if (err) throw err
    console.log(doc)
  })
})

module.exports = router