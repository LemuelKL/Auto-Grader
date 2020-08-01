const express = require('express')
const router = express.Router()
const fs = require('fs')
const Pdfjs = require('pdfjs-dist/es5/build/pdf.js')
const { createCanvas } = require('canvas')
var QrCode = require('qrcode-reader');
var Jimp = require("jimp");
const { PDFDocument } = require('pdf-lib')
const _ = require('underscore')
var path = require('path');
const Paper = require('./../models/Paper')
const Student = require('./../models/Student')

function getDirectories(path) {
  return fs.readdirSync(path).filter(function (file) {
    return fs.statSync(path + '/' + file).isDirectory();
  });
}

router.get('/papers/ungraded', (req, res) => {
  try {
    res.json(getDirectories(`${process.cwd()}/public/ungraded`))
  } catch (err) {
    res.json({ msg: err })
  }
})

router.get('/papers/ungraded/:id/students', (req, res) => {
  try {
    fs.readdir(`${process.cwd()}/public/ungraded/${req.params.id}`, { withFileTypes: true }, async (err, dirents) => {
      if (err) throw err
      const dirsNames = dirents
        .filter(dirent => !dirent.isFile())
        .map(dirent => path.parse(dirent.name).name);

      students = await Student.find().where('pyccode').in(dirsNames).exec();
      res.json(students)
    })
  } catch (err) {
    res.json({ msg: err })
  }
})

function NodeCanvasFactory() { }
NodeCanvasFactory.prototype = {
  create: function NodeCanvasFactory_create(width, height) {
    var canvas = createCanvas(width, height);
    var context = canvas.getContext("2d");
    return {
      canvas: canvas,
      context: context
    };
  },

  reset: function NodeCanvasFactory_reset(canvasAndContext, width, height) {
    canvasAndContext.canvas.width = width;
    canvasAndContext.canvas.height = height;
  },

  destroy: function NodeCanvasFactory_destroy(canvasAndContext) {
    canvasAndContext.canvas.width = 0;
    canvasAndContext.canvas.height = 0;
    canvasAndContext.canvas = null;
    canvasAndContext.context = null;
  }
};

router.post('/papers/ungraded', (req, res) => {
  if (!req.files) {
    return res.status(500).send({ msg: "File is not found" })
  }
  const myFile = req.files.pdf;
  const pdfUri = `${process.cwd()}/tmp/${myFile.name}`
  myFile.mv(pdfUri, async function (err) {
    if (err) {
      console.log(err)
      return res.status(500).send({ msg: "Error occured" });
    }
    else {
      var imageDatas = await Pdf2Img(pdfUri, 1)  // Buffers
      var pages = []
      var queue = 0
      for (let i = 1; i <= imageDatas.length; i++) {
        queue++  // Perhaps needs optimization
        Jimp.read(imageDatas[i - 1], async function (err, image) {
          if (err) {
            console.error(err);
            // TODO handle error
          }

          image.crop(0, 0, 41, 41)
          const result = await QrDecode(image)  // This package is quite glitchy, may consider switching
          pages.push({
            paperId: result.paper_id,
            localPage: result.page,
            candidate: result.candidate
          })

          const dir = `./public/ungraded/${result.paper_id}`
          fs.mkdir(dir, { recursive: true }, async (err) => {
            if (err) throw err
            //Split to images 
            await image.writeAsync(`${dir}/debug/${result.candidate}-${result.page}.png`)
            myFile.mv(`${dir}/backup/${myFile.name}`)
            queue--
            complete(queue, res, pages, pdfUri, dir)
          })
        })
      }
      // Marker
    }
  })
})

function Pdf2Img(pdfUri, scale) {
  return new Promise(async (resolve, reject) => {
    var rawData = new Uint8Array(fs.readFileSync(pdfUri));

    const pdfDocument = await Pdfjs.getDocument(rawData).promise
    const numPages = pdfDocument.numPages
    console.log("# PDF document loaded.")
    console.log('Number of Pages: ' + numPages)

    var imageDatas = []
    for (i = 1; i <= numPages; i++) {
      await pdfDocument.getPage(i).then(async page => {
        const viewport = page.getViewport({ scale: scale });
        const canvasFactory = new NodeCanvasFactory();
        const canvasAndContext = canvasFactory.create(
          viewport.width,
          viewport.height
        );

        await page.render({
          canvasContext: canvasAndContext.context,
          viewport,
          canvasFactory
        }).promise

        const imageData = canvasAndContext.canvas.toBuffer();
        imageDatas.push(imageData)
      })
    }
    resolve(imageDatas)
  })
}

function QrDecode(image) {
  return new Promise(async (resolve, reject) => {
    var qr = new QrCode();
    qr.callback = function (err, value) {
      if (err) {
        console.log("Error reading QR code")
        console.error(err)
        reject()
      }
      resolve(JSON.parse(value.result))
    }
    qr.decode(image.bitmap)
  })
}

async function complete(queue, res, pages, pdfUri, dir) {
  if (!queue) {
    //console.log("We have completed")
    //console.log(pages)

    var globalPageCount = 0
    var candidates = Object.keys(_.groupBy(pages, "candidate"));
    console.log(candidates)
    candidates.forEach(candidate => {
      var pagesOfCandidate = pages.filter(page => { return page.candidate == candidate })
      console.log(pagesOfCandidate)

      var pageIndices = [];
      for (var i = 0; i < pagesOfCandidate.length; i++) {
        pageIndices.push(globalPageCount)
        globalPageCount++
      }
      perCandidateSplit(pdfUri, candidate, pageIndices, dir)
    })

    // TODO check for paperId anomaly

    const paper = await Paper.findOne({ id: pages[0].paperId })
    res.json({
      msg: "File successfully processed.",
      paperInfo: {
        id: paper.id,
        name: paper.name,
        numPages: paper.numPages,
        width: paper.width,
        height: paper.height,
        questions: paper.questions,
        candidates: candidates,
        expectedCandidates: paper.candidates,
        // This import is missing:
        thisLackedCandidates: lackedCandidates(paper.candidates, candidates),
        // After this import, still missing:
        afterLackedCandidates: 'a'  // TODO
      }
    })
  }
}

function lackedCandidates(expected, got) {
  var missing = []
  for (let [i, c] of expected.entries()) {
    if (got.indexOf(c) == -1) {
      missing.push(i)
    }
  }
  var pyccodes = []
  for (let i of missing) {
    pyccodes.push(expected[i])
  }
  return pyccodes
}

async function perCandidateSplit(pdfUri, candidate, pageIndices, savePath) {
  // Note: the end pdf page order follows the order of the elements of pageIndices
  const donorPdfDoc = await PDFDocument.load(fs.readFileSync(pdfUri))
  const pdfDoc = await PDFDocument.create();

  const extractedPages = await pdfDoc.copyPages(donorPdfDoc, pageIndices)

  for (let page of extractedPages) {
    pdfDoc.addPage(page)
  }

  const paperId = savePath.split('/').pop()
  const questions = (await Paper.findOne({id: paperId}, 'questions')).questions

  const dir = `${savePath}/${candidate}`
  fs.mkdir(dir, { recursive: true }, async (err) => {
    if (err) return console.error(err);
    fs.writeFileSync(`${dir}/attempt.pdf`, await pdfDoc.save())
    // Lemuel is so smart OMG!
    const scale = 1
    Pdf2Img(`${savePath}/${candidate}/attempt.pdf`, scale).then(pageImages => {
      questions.forEach(q => {
        Jimp.read(pageImages[q.page - 1], async function (err, image) {
          if (err) return console.error(err);
          image.crop(q.pos.sx*scale, q.pos.sy*scale, q.pos.swidth*scale, q.pos.sheight*scale)
          await image.writeAsync(`${savePath}/${candidate}/${q.name}.png`)
          await image.writeAsync(`${savePath.replace('ungraded', 'graded')}/${candidate}/${q.name}.png`)
        })
      })
    })
  })
}

module.exports = router