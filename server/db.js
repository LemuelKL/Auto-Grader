require('dotenv/config')

const mongooee = require('mongoose')
const uri = process.env.DB_URI
mongooee.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true }, (err) => {
  if (err) return console.error("Cannot connecte to DB")
  console.log("Connected to DB")
});
