
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
router.get('/productupdate', WooApi.Product_Update)
// router.get('/stream/:key', WooApi.StreamJson)
router.post('/woo', WooApi.WooCreate)




module.exports = router


