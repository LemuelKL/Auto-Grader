const express = require('express')
const router = express.Router()
const { PDFDocument } = require('pdf-lib')
const fs = require('fs')
var Jimp = require("jimp");
const Pdfjs = require('pdfjs-dist/es5/build/pdf.js')
const { createCanvas } = require('canvas')

router.post('/pdf', (req, res) => {
  const pdf = req.files.pdf
  const pdfUri = `${process.cwd()}/tmp/${pdf.name}`
  pdf.mv(pdfUri, async (err) => {
    if (err) {
      console.log(err)
      return res.status(500).send({ msg: "Error occured" });
    }
    const pdfDoc = await PDFDocument.load(fs.readFileSync(pdfUri))
    const pdfDimesion = pdfDoc.getPage(0).getSize()

    var w = 0
    var h = 0
    var imageDatas = await Pdf2Img(pdfUri)
    for (let i = 1; i <= imageDatas.length; i++) {
      await Jimp.read(imageDatas[i - 1]).then(image => {
        const dir = `./public/img/${pdf.name}`  // This path serves images statically for frontend to "crop" questions
        fs.mkdir(dir, { recursive: true }, async (err) => {
          if (err) throw err
          await image.writeAsync(`${dir}/${i}.png`)
        })
      })
    }
    res.send({ numPages: pdfDoc.getPageCount(), imgsPath: `http://localhost:3000/img/${pdf.name}`, width: pdfDimesion.width, height: pdfDimesion.height })
  })
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

function Pdf2Img(pdfUri) {
  return new Promise(async (resolve, reject) => {
    var rawData = new Uint8Array(fs.readFileSync(pdfUri));

    const pdfDocument = await Pdfjs.getDocument(rawData).promise
    const numPages = pdfDocument.numPages
    console.log("# PDF document loaded.")
    console.log('Number of Pages: ' + numPages)

    var imageDatas = []
    for (i = 1; i <= numPages; i++) {
      await pdfDocument.getPage(i).then(async page => {
        const viewport = page.getViewport({ scale: 1.0 });
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

module.exports = router