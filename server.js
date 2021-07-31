const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser')
const firebaseRouter = require('./api/routes/firebaseRouter')
const firebase = require('firebase')
const firebaseConfig = require('./api/config')
require('dotenv').config()
console.log("startify")

app.use(bodyParser.urlencoded({ extended: true }))
app.use(cors())
app.use(bodyParser.json())

// app.use(function (req, res, next) {
//     res.header("Access-Control-Allow-Origin", "*");
//     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
// });

firebase.initializeApp(firebaseConfig)

app.use('/api', firebaseRouter)
app.use('/', express.static(__dirname + '/build'))

const port = process.env.PORT;
app.listen(port)
console.log(`Server running on port: ${port}`)




