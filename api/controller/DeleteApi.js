const firebase = require('firebase/app').default
const config = require('../config')
require("firebase/database");
require("firebase/storage");
const admin = require('firebase-admin');
const serviceAccount = require('./servicekey.json');
const axios = require('axios').default
const fetch = require('node-fetch');
const WooCommerceRestApi = require("@woocommerce/woocommerce-rest-api")
const fs = require('fs')
const request = require('request')
const url = require('url')
const https = require('https')
// const sizeOf = require('image-size')
var sizeOf = require('buffer-image-size');


var remCount = 0, errCount = 0, once = 0, Finish = false

DelByBrand = async (req, res) => {
    once = 0; remCount = 0; errCount = 0
    console.log('Delete By Brand')

    var idList = []
    var api = await fetch(`https://firewallforce.se/wp-json/wc/v3/brandproducts?brand=${req.params.id}&limit=25&page=1`)
    var resp = await api.json()
    if (resp == []) Finish = true
    resp.forEach(pro => {
        idList.push(pro.id)
    })
    console.log(`ID List :: ${idList}`)
    DeleteProParallel(idList)

    var awaitRem = setInterval(() => {
        if ((remCount + errCount == 25) && !once) {
            clearInterval(awaitRem)
            once++
            console.log(`End`)
            return res.send("success")
        }
        if (Finish == true) {
            console.log(`Finish`)
            clearInterval(awaitRem)
            return res.send('Finish')
        }
    })
}



DeleteProParallel = (idList) => {
    console.log('Parallel')
    idList.forEach((id) => {
        removePro(id)
    })

}



removePro = (id) => {

    var WooCommerceApi = WooCommerceRestApi.default;

    var api = new WooCommerceApi({
        url: 'https://firewallforce.se',
        consumerKey: 'ck_42a75ce7a233bc1e341e33779723c304e6d820cc',
        consumerSecret: 'cs_6e5a683ab5f08b62aa1894d8d2ddc4ad69ff0526',
        version: 'wc/v3'
    });

    api.delete(`products/${id}`, {
        force: true
    }).then((response) => {
        console.log(`Successfuly Deleted :: ${response.data.id}`);
        remCount++
    }).catch((error) => {
        console.log(error.response.data);
        errCount++
    })

}


module.exports = {
    DelByBrand
}
