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
  Grading.findOneAndUpdate({ paperId: req.body.paperId, questionName: req.body.questionName, candidate: req.body.candidate }, req.body, { upsert: true, new: true, fields: { "_id": 0, "__v": 0 }, runValidators: true, useFindAndModify: false }, function (err, doc) {
    if (err) {
      res.status(500).send()
    }
    else {
      console.log("Successfully created/updated Grading document: ", doc)
      res.json(doc)
    }
  })
})

router.put('/gradingImages/:paperId/:questionName/:candidate', (req, res) => {
  console.log("Received request for Updating Grading Image")
  var base64Data = req.body.image.split(',')[1];
  const baseDir = `${process.cwd()}/public/graded/${req.params.paperId}/${req.params.candidate}`
  require("fs").writeFile(`${baseDir}/${req.params.questionName}.png`, base64Data, 'base64', function (err) {
    if (err) res.status(500).send()
    res.status(200).send()
  });
})

module.exports = router