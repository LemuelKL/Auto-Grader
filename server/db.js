require('dotenv/config')

const mongooee = require('mongoose')
const uri = process.env.DB_URI
mongooee.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true }, () => {
  console.log("Connected to DB")
});
