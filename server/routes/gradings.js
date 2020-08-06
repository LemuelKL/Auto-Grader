const express = require('express')
const router = express.Router()
const Grading = require('./../models/Grading')
const Preset = require('./../models/Preset')

router.get('/gradings/:paperId', async (req, res) => {
  console.log("Received request for Fetching Grading", { paperId: req.params.paperId })
  try {
    const gradings = await Grading.find({ paperId: req.params.paperId })
    res.json(gradings)
    console.log("Sent Grading: ", grading)
  } catch (err) {
    res.json({ msg: err })
  }
})

router.get('/gradings/:paperId/:questionName/:candidate', async (req, res) => {
  console.log("Received request for Fetching Grading", { paperId: req.params.paperId, questionName: req.params.questionName, candidate: req.params.candidate })
  try {
    var grading = null
    if (req.params.questionName === '*') {
      grading = await Grading.find({ paperId: req.params.paperId, candidate: req.params.candidate }).sort('questionName')
    } else {
      grading = await Grading.findOne({ paperId: req.params.paperId, questionName: req.params.questionName, candidate: req.params.candidate })
    }
    res.json(grading)
    console.log("Sent Grading: ", grading)
  } catch (err) {
    res.json({ msg: err })
  }
})

router.get('/gradingTags/:paperId/:questionName/:candidate', async (req, res) => {
  console.log("Received request for Fetching Grading Tags", { paperId: req.params.paperId, questionName: req.params.questionName, candidate: req.params.candidate })
  try {
    grading = await Grading.findOne({ paperId: req.params.paperId, questionName: req.params.questionName, candidate: req.params.candidate })
    var tags = []
    for (let pR of grading.presetRemark) {
      tags.push(await Preset.findOne({_id: pR}))
    }
    res.json(tags)
    console.log("Sent Tags: ", tags)
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