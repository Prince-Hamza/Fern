
const express = require('express')
const FireController = require('../controller/fireControl')
const router = express.Router()

router.get('/firetest', FireController.getInfo)

module.exports = router
