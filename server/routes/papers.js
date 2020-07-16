const express = require('express')
const router = express.Router()
const Paper = require('./../models/Paper')
const fs = require('fs')
const Pdfjs = require('pdfjs-dist/es5/build/pdf.js')
const { PDFDocument } = require('pdf-lib')
const path = require('path');
var QRCode = require('qrcode')
var parse = require('parse-svg-path')
var extract = require('extract-svg-path').parse

router.get('/papers/debug/:name', (req, res) => {
  Paper.deleteMany({ name: req.params.name }, function (err) {
    if (err) return res.json({ msg: err })
  });
})

router.get('/papers', async (req, res) => {
  try {
    const papers = await Paper.find({})
    res.json(papers)
  } catch (err) {
    res.json({ msg: err })
  }
})

router.get('/papers/:id', async (req, res) => {
  try {
    const paper = await Paper.findOne({ id: req.params.id })
    res.json(paper)
  } catch (err) {
    res.json({ msg: err })
  }
})

function generateId() {
  var result = ''
  var characters = 'abcdefghijklmnopqrstuvwxyz0123456789'
  var charactersLength = characters.length
  for (var i = 0; i < 10; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

router.post('/papers', (req, res) => {
  const paperId = generateId()
  const rb = req.body

  const template = req.files.template
  const templateUri = `${process.cwd()}/public/papers/${paperId}/${template.name}`
  template.mv(templateUri, async function (err) {
    const PdfjsDoc = await Pdfjs.getDocument(fs.readFileSync(templateUri)).promise
    const numPages = PdfjsDoc.numPages
    var candidates = JSON.parse(rb.candidates)
    var questions = JSON.parse(rb.questions)

    const page = await PdfjsDoc.getPage(1)

    const paper = new Paper({
      id: paperId,
      name: template.name,
      numPages: numPages,
      width: page.view[2],
      height: page.view[3],
      candidates: candidates,
      questions: questions
    })

    paper.save().then(async (data) => {
      console.log("Created new Paper on DB")
      console.log(data)
      // Data saved onto Database, proceed to stick QR codes
      const templateDoc = await PDFDocument.load(fs.readFileSync(templateUri))
      for (let candidate of candidates) {
        const answerSheet = await PDFDocument.create()
        const copiedPages = await answerSheet.copyPages(templateDoc, templateDoc.getPageIndices())
        for (let [i, page] of copiedPages.entries()) {
          QRCode.toString(`{"paper_id":"${paperId}","candidate":"${candidate}","page":${i + 1}}`, { type: 'svg' }, async function (err, xmlSvg) {
            var converted = ''  // Manually parse XML SVG to pure SVG Paths
            var paths = parse(extract(xmlSvg))
            for (let path of paths) {
              converted += path[0]
              if (path.length > 1) {
                converted += path[1]
              }
              if (path.length > 2) {
                converted += ','
                converted += path[2]
              }
            }
            // At scale:1, [w, h] = 41, 41
            page.drawSvgPath(converted, { x: 0, y: page.getHeight(), scale: 1 }) // y-axis counts from the bottom
            answerSheet.addPage(page)
            fs.writeFileSync(`${process.cwd()}/public/papers/${paperId}/${path.parse(template.name).name}---${candidate}.pdf`, await answerSheet.save())
          })
        }
      }
    }).catch(err => {
      console.error(err)
    })
  })
})

module.exports = router