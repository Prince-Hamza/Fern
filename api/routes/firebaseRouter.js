
const express = require('express')
const FireController = require('../controller/fireControl')
const WooApi = require('../controller/WooApi')

const router = express.Router()

//router.get('/firetest', FireController.getInfo)
//router.get('/writebycategory', WooApi.ByCategory)
//router.get('/category', WooApi.Categories)
//router.get('/info/:id', WooApi.Info)
//router.get('/emailinfo', WooApi.emailInfo)
//router.get('/imageproxy/:id', WooApi.ImageProxy)
router.get('/signup/:id', FireController.SignUp)
router.get('/signin/:id', FireController.SignIn)
router.get('/eurtokrona/:amount', WooApi.currencyExchange)




module.exports = router


