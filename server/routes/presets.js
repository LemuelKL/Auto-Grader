const express = require('express')
const router = express.Router()
const Preset = require('./../models/Preset')
const Grading = require('./../models/Grading')

router.get('/presets', async (req, res) => {
  try {
    const presets = await Preset.find({})
    res.json(presets)
  } catch (err) {
    res.json({ msg: err })
  }
})

router.get('/presets/:_id', async (req, res) => {
  try {
    const preset = await Preset.findOne({ _id: req.params._id })
    res.json(preset)
  } catch (err) {
    res.json({ msg: err })
  }
})

router.get('/presets/paper/:paperId', async (req, res) => {
  try {
    const presets = await Preset.find().or([{paperId: req.params.paperId}, {paperId: ''}])  // To include "global" presets as well
    res.json(presets)
  } catch (err) {
    res.json({ msg: err })
  }
})

router.get('/presets/paper/:paperId/question/:questionName', async (req, res) => {
  try {
    const presets = await Preset.find().or([{paperId: req.params.paperId, questionName: req.params.questionName}, {paperId: ''}, {paperId: req.params.paperId, questionName: ''}])
    res.json(presets)
  } catch (err) {
    res.json({ msg: err })
  }
})

router.post('/presets', (req, res) => {
  const preset = new Preset({
    paperId: req.body.paperId,
    questionName: req.body.questionName,
    name: req.body.name,
    description: req.body.description,
  })
  preset.save().then(doc => {
    console.log("Successfully created new Preset", doc)
    res.json(doc)
  }).catch(err => {
    console.log("Error when creating new Preset", err)
    res.status(500)
  })
})

router.put('/presets/:_id', async (req, res) => {
  try {
    const preset = await Preset.findOneAndUpdate({ _id: req.params._id }, req.body, {new: true, useFindAndModify: false}, function (err, doc) {
      if (err) {
        res.status(500).send()
      }
      else {
        console.log("Successfully created/updated Preset document: ", doc)
        res.json(doc)
      }
    })
  } catch (err) {
    res.json({ msg: err })
  }
})

// Return Gradings that the given preset is used in
router.get('/presets/:_id/gradings', async (req, res) => {
  try {
    const gradings = await Grading.find({ presetRemark: req.params._id })
    res.json(gradings)
  } catch (err) {
    res.json({ msg: err })
  }
})

router.delete('/presets/:_id', (req, res) => {
  Preset.deleteOne({_id: req.params._id}, function (err) {
    if (err) res.status(500).send()
    res.status(200).send()
  })
})

module.exports = router