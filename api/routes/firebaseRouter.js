
const express = require('express')
const FireController = require('../controller/fireControl')
const WooApi = require('../controller/WooApi')
const DeleteApi = require('../controller/DeleteApi')

const router = express.Router()

//router.get('/firetest', FireController.getInfo)
//router.get('/writebycategory', WooApi.ByCategory)
//router.get('/category', WooApi.Categories)
//router.get('/info/:id', WooApi.Info)
//router.get('/emailinfo', WooApi.emailInfo)

router.post('/imageup', WooApi.ImageProxy)
// router.post('/updateimages', WooApi.updateImages)

router.get('/signup/:id', FireController.SignUp)
router.get('/signin/:id', FireController.SignIn)
router.get('/eurtokrona/:amount', WooApi.currencyExchange)
router.get('/postform/:id', WooApi.postToForm)
router.get('/getform', WooApi.EmailApi)
// router.get('/stream/:key', WooApi.StreamJson)
router.post('/woo', WooApi.WooCreate)

router.get('/nets', WooApi.nodejsAxiosCheckout)

router.get('/deleteapi/:id', DeleteApi.DelByBrand)

module.exports = router


