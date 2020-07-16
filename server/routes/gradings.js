const express = require('express')
const router = express.Router()
const Grading = require('./../models/Grading')

router.get('/gradings/:paperId/:questionName/:candidate', async (req, res) => {
  console.log("Received request for Fetching Grading", { paperId: req.params.paperId, questionName: req.params.questionName, candidate: req.params.candidate })
  try {
    const grading = await Grading.findOne({ paperId: req.params.paperId, questionName: req.params.questionName, candidate: req.params.candidate })
    res.json(grading)
    console.log("Sent Grading: ", grading)
  } catch (err) {
    res.json({ msg: err })
  }
})

router.put('/gradings', (req, res) => {
  console.log("Received request for Creating/Updating Grading")
  Grading.findOneAndUpdate({ paperId: req.body.paperId, questionName: req.body.questionName, candidate: req.body.candidate }, req.body, { upsert: true, new: true, runValidators: true,useFindAndModify: false }, function (err, doc) {
    if (err) {
      res.status(500).send()
    }
    else {
      console.log("Successfully created/updated Grading document: ", doc)
      res.status(200).send()
    }
  })
})

module.exports = router