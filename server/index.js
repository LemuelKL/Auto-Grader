const db = require('./db')
const express = require('express')
const app = express()
const fileUpload = require('express-fileupload')
const cors = require('cors')

var options = {
  dotfiles: 'ignore',
  etag: false,
  extensions: ['htm', 'html'],
  index: false,
  maxAge: '1d',
  redirect: false,
  setHeaders: function (res, path, stat) {
    res.set('Access-Control-Allow-Origin', "*")
    res.set('Access-Control-Allow-Headers', "*")
  }
}

app.use(express.static('public', options))
app.use(express.json())
app.use(cors())
app.use(fileUpload({
  createParentPath: true
}))

app.use(require('./routes/students.js'))
app.use(require('./routes/ungraded.js'))
app.use(require('./routes/papers.js'))
app.use(require('./routes/pdf.js'))
app.use(require('./routes/gradings.js'))
app.use(require('./routes/presets.js'))

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log('Express server listening on port', port)
});
