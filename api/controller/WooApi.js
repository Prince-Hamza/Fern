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
var sizeOf = require('buffer-image-size');
const imageToBase64 = require('image-to-base64');


const Once = async (Ref) => {
    const info = await firebase.database().ref(Ref).once('value')
    console.log(info)
    return info
}


const EmailApi = async (req, res) => {
    var resp = await firebase.database().ref('/EmailApi').once('value')
    var ar = []
    resp.forEach((item) => {
        ar.push(item.val())
    })
    console.log('okokok')
    res.send(ar)
}

const postToForm = (req, res) => {
    //return res.send("ok");
    const Params = req.url.split('/')[2]
    const ParamArray = Params.split('&')
    let name, lastName, mail, msg, phone;

    ParamArray.forEach((param) => {
        if (param.includes('name')) name = param.split('=')[1]
        if (param.includes('email')) mail = param.split('=')[1]
        if (param.includes('lastnem')) lastName = param.split('=')[1]
        if (param.includes('msg')) msg = param.split('=')[1]
        if (param.includes('phone')) phone = param.split('=')[1]
    })

    // return res.send(`${name} ${lastName} ${mail} ${phone} ${msg}`)

    firebase.database().ref('/EmailApi').push({
        FirstName: name,
        LastName: lastName,
        Email: mail,
        Phone: phone,
        Message: msg
    })

    return res.send(`Successfully Saved : ({ Name: ${name},Last Name:${lastName},Email:${mail},Message:${msg}})`);

}


// const FirstCapital = (Term) => {
//     return Term.substring(0, 1).toUpperCase() + Term.substring(1, Term.length)
// }

// var imglink = ''

const ImageProxy = async (Img) => {

    //var Img = req.body.image
    //return res.send(Img)



    try {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            databaseURL: "https://kidland-5754b-default-rtdb.firebaseio.com",
            storageBucket: "kidland-5754b.appspot.com",
        });
    } catch (ex) {
        //console.log(ex)
    }


    //  const Img = 'https://media.itscope.com/img/p/2Rtfp0SobLwvFrWehpjLZwrU7VdxDvXyQlpP1oq3v74=/aHR0cHM6Ly9pbmlzaG9wLmNvbS9pbWcvZ2FsbGVyeS84NjM2Nzg5Nl8xNTAwNjQwMTA0LmpwZw==?'


    var num = getRandom(5, 10000);
    const destination = `pix/image_${num}.jpg`
    var downloadLink = ''

    var response = await axios(Img, { method: 'GET', responseType: 'stream' })

    // const file = admin.storage().bucket().file(destination)
    // var response = await axios({ method: 'GET', url: Img, responseType: 'stream' })

    const file = admin.storage().bucket().file(destination)

    const writeStream = file.createWriteStream({
        metadata: {
            contentType: 'image/jpeg',
            // firebaseStorageDownloadTokens:uuid,
        },
        public: true
    })



    await response.data.pipe(writeStream)
        .on('finish', () => {
            console.log('success')
            file.getSignedUrl({ action: 'read', expires: '01-01-2022' }).then(signedUrls => {
                downloadLink = signedUrls[0];
                console.log(downloadLink)
                return downloadLink
            })
        })
        .on('error', (err) => {
            console.log(`error : ${err}`)
        })

}




const getRandom = (min, max) => {
    return Math.trunc(Math.random() * (max - min) + min);
}







const useCurrencyResp = async (cinf, Eur) => {
    console.log('currency Resp')

    const cExRate = await fetch('https://currencyapi.net/api/v1/rates?key=McRbxJQKvXlfe5D6EHIv2Q8qtSxTD37zEq9m&output=JSON');
    cinf = await cExRate.json();

    var nowDate = new Date();
    var date = nowDate.getFullYear() + '/' + (nowDate.getMonth() + 1) + '/' + nowDate.getDate();

    firebase.database().ref('/CurrencyApi').set({
        Info: cinf,
        Date: date
    })


    var EurInApi = cinf.rates.EUR;
    var intEur = EurInApi + 0;
    var cnvbase = 1 / intEur; // Eur * by cnvbase = usd value	
    var USdollar = Eur * cnvbase;
    var SEK = cinf.rates.SEK;
    var Krona = USdollar * SEK;
    return Krona.toString()
}

const priceByFire = async (cinf, Eur) => {
    console.log('priceByFire')
    console.log(`Rates : ${cinf.rates}`)
    var EurInApi = cinf.rates.EUR;
    var intEur = EurInApi + 0;
    var cnvbase = 1 / intEur; // Eur * by cnvbase = usd value	

    var USdollar = Eur * cnvbase;
    var SEK = cinf.rates.SEK;
    var Krona = USdollar * SEK;
    return Krona.toString()
}

const currencyExchange = async (req, res) => {

    const Eur = req.params.amount;
    var FireData = await Once('/CurrencyApi')
    var Fireval = FireData.val()

    var nowDate = new Date();
    var date = nowDate.getFullYear() + '/' + (nowDate.getMonth() + 1) + '/' + nowDate.getDate();

    console.log(date)

    var Method = (date === Fireval.Date) ? priceByFire : useCurrencyResp
    var Final = await Method(Fireval.Info, Eur)

    return res.send(Final)

}


const upload_image_to_wordpress = () => {
    console.log('sending image')

    fetch(`https://firewallforce.se/wp-json/wp/v2/media`, {
        method: 'POST',
        headers: {
            'Content-Disposition': 'attachment; filename="file.jpg"',
            'Content-Type': 'image/jpeg',
            'Authorization': 'Basic' + Buffer.from('ck_42a75ce7a233bc1e341e33779723c304e6d820cc:cs_6e5a683ab5f08b62aa1894d8d2ddc4ad69ff0526', 'binary').toString('base64')
        },
        body: 'https://thumbs.dreamstime.com/b/good-thumb-up-15811851.jpg'
    }).then((resp) => {
        resp.json().then((respJson) => {
            console.log(`img resp :: ${JSON.stringify(respJson)}`)
        })
    }).catch((e) => {
        console.log(e)
        console.log(`img err :: ${e}`)
    })

}


// CBL-0484L
var ProRefresh = 0, ProList = [], catOnce = true, newcategories = [];

const WooCreate = async (req, res) => {


    uploadImages2()
    return;

    var ProArray = req.body.info
    console.log(`Fetch :: ${typeof (ProArray[0])}`)

    ProRefresh = 0;
    ProList = []

    CreateOrUpdate(ProArray[0])
    CreateOrUpdate(ProArray[1])
    CreateOrUpdate(ProArray[2])
    CreateOrUpdate(ProArray[3])
    CreateOrUpdate(ProArray[4])

    //var ProList = [resp1, resp2, resp3, resp4, resp5];



    var countPro = setInterval(() => {
        //  console.log(`PRODUCT REFRESH :: ${ProRefresh}`)
        // console.log(`ProList Length :: ${ProList.length}`)

        if (ProRefresh === 5) {
            clearInterval(countPro)
            return res.send({ info: ProList })
        }
    }, 1000)






    //return res.send({ info: ProList })

}

const idBySku = async (SKU) => {
    const Auth = 'Basic' + Buffer.from('ck_42a75ce7a233bc1e341e33779723c304e6d820cc:cs_6e5a683ab5f08b62aa1894d8d2ddc4ad69ff0526', 'binary').toString('base64')

    var id = await fetch(`https://firewallforce.se/wp-json/wc/v3/idbysku?`, {
        method: 'POST',
        headers: { 'Authorization': Auth, 'Content-Type': 'application/json' },
        body: JSON.stringify({ Sku: SKU })
    })

    var idString = await id.text()

    return idString

}

const CreateOrUpdate = async (Product) => {

    var id = await idBySku(Product.manufacturerSKU)
    // var id = await idBySku('ZP500GM3A021')
    console.log(`id by sku :: ${id}`)
    console.log(`Pro img length :: ${Product.images.length}`)

    if (id == 0) {
        console.log(`GOING TO UPLOAD IMAGES`)
        var resp = uploadImages(Product, 'create')
        return resp;

    } else {
        console.log(`GOING TO UPDATE PRODUCT`)
        var updateResp = UpdateProduct(Product, id);
        // var updateResp = uploadImages(Product, 'update', id);

        return updateResp
    }

}


const uploadImages = async (Product, method, id) => {

    fireConnect()

    console.log(`Lets Upload Images First`)

    if (!Product.images.length || Product.images.length == 0) {
        skipVoidImages('no images')
        return
    }

    var NewImages = [], NewImagesLength = 0, filePathx = [], extra

    if (Product.images.length > 5) {
        extra = Product.images.length - 5
        for (let x = 1; x <= extra; x++) {
            console.log(`remove`)
            Product.images.splice(-1)
        }
    }



    console.log(`PRODUCT.IMAGES :: ${Product.images}`)
    // console.log(`PRODUCT.IMAGES Length :: ${Product.images.length}`)


    var waitPix = setInterval(() => {
        console.log(`New Images Length:: ${NewImages.length}`)
        console.log(`Product IMAGES LENGTH:: ${Product.images.length}`)
        console.log(`PRODUCT.IMAGES :: ${Product.images}`)


        if (Product.images.length == NewImagesLength && NewImages.length !== 0) {
            clearInterval(waitPix)

            console.log(`NEW IMAGES LENGTH:: ${NewImages.length}`)
            console.log(`Product IMAGES LENGTH:: ${Product.images.length}`)

            console.log(`IMAGES UPLOADED LETS CREATE/UPDATE PRODUCT NOW`)

            Product.FilePaths = filePathx
            Product.images = []
            Product.images = NewImages
            if (method == 'create') CreateProduct(Product)
            if (method == 'update') UpdateProduct(Product, id)
        }
    }, 1000)




    connect()

    // try {
    //     admin.initializeApp({
    //         credential: admin.credential.cert(serviceAccount),
    //         databaseURL: "https://kidland-5754b-default-rtdb.firebaseio.com",
    //         storageBucket: "kidland-5754b.appspot.com",
    //     });
    // } catch (ex) {
    //     //console.log(ex)
    // }





    if (Product.images.length >= 1) {

        var num = getRandom(5, 10000);
        const destination = `pix/image_${num}.jpg`
        let downloadLink = ''

        try {
            var response = await axios(Product.images[0], { method: 'GET', responseType: 'stream' })
        } catch (ex) {
            NewImagesLength += 1
            skipVoidImages(ex)
            return
        }


        const file = admin.storage().bucket().file(destination)

        const writeStream = file.createWriteStream({
            metadata: { contentType: 'image/jpeg', },
            public: true
        })


        await response.data.pipe(writeStream)
            .on('finish', () => {
                console.log('success')

                file.getSignedUrl({ action: 'read', expires: '01-01-2022' }).then(signedUrls => {
                    downloadLink = signedUrls[0];
                    console.log(downloadLink)
                    NewImages.push(downloadLink)
                    NewImagesLength += 1
                    filePathx.push(destination)
                })
            })
            .on('error', (err) => {
                NewImagesLength += 1
                console.log(`error : ${err}`)
            })
    }



    if (Product.images.length >= 2) {

        var num = getRandom(5, 10000);
        const destination = `pix/image_${num}.jpg`
        let downloadLink = ''

        try {
            var response = await axios(Product.images[1], { method: 'GET', responseType: 'stream' })
        } catch (ex) {
            NewImagesLength += 1
            skipVoidImages(ex)
            return
        }

        const file = admin.storage().bucket().file(destination)
        const writeStream = file.createWriteStream({
            metadata: {
                contentType: 'image/jpeg',
            },
            public: true
        })

        await response.data.pipe(writeStream)
            .on('finish', () => {
                console.log('success')
                console.log(writeStream)

                file.getSignedUrl({ action: 'read', expires: '01-01-2022' }).then(signedUrls => {
                    downloadLink = signedUrls[0];
                    console.log(downloadLink)
                    NewImages.push(downloadLink)
                    NewImagesLength += 1
                    filePathx.push(destination)
                })
            })
            .on('error', (err) => {
                NewImagesLength += 1
                console.log(`error : ${err}`)
            })
    }






    if (Product.images.length >= 3) {

        var num = getRandom(5, 10000);
        const destination = `pix/image_${num}.jpg`
        let downloadLink = ''

        try {
            var response = await axios(Product.images[2], { method: 'GET', responseType: 'stream' })
        } catch (ex) {
            NewImagesLength += 1
            skipVoidImages(ex)
            return
        }

        const file = admin.storage().bucket().file(destination)
        const writeStream = file.createWriteStream({
            metadata: {
                contentType: 'image/jpeg',
            },
            public: true
        })

        await response.data.pipe(writeStream)
            .on('finish', () => {
                console.log('success')
                console.log(writeStream)

                file.getSignedUrl({ action: 'read', expires: '01-01-2022' }).then(signedUrls => {
                    downloadLink = signedUrls[0];
                    console.log(downloadLink)
                    NewImages.push(downloadLink)
                    NewImagesLength += 1
                    filePathx.push(destination)
                })
            })
            .on('error', (err) => {
                NewImagesLength += 1
                console.log(`error : ${err}`)
            })


    }




    if (Product.images.length >= 4) {

        let num = getRandom(5, 10000);
        const destination = `pix/image_${num}.jpg`
        let downloadLink = ''

        try {
            var response = await axios(Product.images[3], { method: 'GET', responseType: 'stream' })
        } catch (ex) {
            NewImagesLength += 1
            skipVoidImages(ex)
            return
        }

        const file = admin.storage().bucket().file(destination)
        const writeStream = file.createWriteStream({
            metadata: {
                contentType: 'image/jpeg',
            },
            public: true
        })

        await response.data.pipe(writeStream)
            .on('finish', () => {
                console.log('success')
                console.log(writeStream)

                file.getSignedUrl({ action: 'read', expires: '01-01-2022' }).then(signedUrls => {
                    downloadLink = signedUrls[0];
                    console.log(downloadLink)
                    NewImages.push(downloadLink)
                    NewImagesLength += 1
                    filePathx.push(destination)
                })
            })
            .on('error', (err) => {
                NewImagesLength += 1
                console.log(`error : ${err}`)
            })


    }





    if (Product.images.length >= 5) {

        var num = getRandom(5, 10000);
        const destination = `pix/image_${num}.jpg`
        var downloadLink = ''


        try {
            var response = await axios(Product.images[4], { method: 'GET', responseType: 'stream' })
        } catch (ex) {
            NewImagesLength += 1
            skipVoidImages(ex)
            return
        }

        const file = admin.storage().bucket().file(destination)
        const writeStream = file.createWriteStream({
            metadata: {
                contentType: 'image/jpeg',
            },
            public: true
        })

        await response.data.pipe(writeStream)
            .on('finish', () => {
                console.log('success')
                console.log(writeStream)

                file.getSignedUrl({ action: 'read', expires: '01-01-2022' }).then(signedUrls => {
                    downloadLink = signedUrls[0];
                    console.log(downloadLink)
                    NewImages.push(downloadLink)
                    NewImagesLength += 1
                    filePathx.push(destination)
                })
            })
            .on('error', (err) => {
                NewImagesLength += 1
                console.log(`error : ${err}`)
            })

    }



}

const skipVoidImages = (ex) => {
    console.log('PRODUCT CREATE SKIP');
    //console.log(ex)
    ProRefresh += 1
    ProList.push({ error: ex, description: 'image missing', action: 'dropping product' });
}



const uploadImages2 = async () => {
    fireConnect()

    fetch('https://images.unsplash.com/reserve/Af0sF2OS5S5gatqrKzVP_Silhoutte.jpg')
        .then(function (response) {
            return response.blob()
        })
        .then(function (blob) {
            console.log('blob :: ' + blob)
            blob.arrayBuffer().then((buffer) => {
                console.log('buffer :: ' + buffer)

                var storageRef = firebase.storage().ref('/TestPix')
                var ref = storageRef.child('/pic.jpg')

                // var metadata = { contentType: blob.mimeT };

                ref.put(buffer).then((res) => {
                    console.log(`Img res :: ${res}`)
                }).catch((err) => {
                    console.log(` Error :: ${err}`)
                })

            })
            return;







        });








}

const base64_encode = async (image) => {
    var base64 = await imageToBase64(image)
    return base64
}

const CreateProduct = async (Product) => {

    var WooCommerceApi = WooCommerceRestApi.default;

    var api = new WooCommerceApi({
        url: 'https://firewallforce.se',
        consumerKey: 'ck_42a75ce7a233bc1e341e33779723c304e6d820cc',
        consumerSecret: 'cs_6e5a683ab5f08b62aa1894d8d2ddc4ad69ff0526',
        version: 'wc/v3'
    });



    var inputPrice = Product.hasOwnProperty('productPriceInfo') ? Product.productPriceInfo.price : 0
    var price = await EURtoSwedish(inputPrice)
    var intPrice = parseFloat(price)
    var priceByMargin = intPrice + ((intPrice / 100) * 20);
    var roundPrice = priceByMargin.toFixed(2) + ""


    var Status = Product.hasOwnProperty('aggregatedStatusText') ? Product.aggregatedStatusText : ""
    var stockStatus = Status === "In stock" ? "instock" : "outofstock"
    var stockQuantity = Product.hasOwnProperty('productStockInfo') ? Product.productStockInfo.stock : 0

    console.log(`Cat name :: ${Product.productType.name}`)
    var categoryId = await CategoryIdByName(Product.productSubType)
    console.log(`CATEGORY ID :: ${categoryId}`)




    // var proImages = []
    // Product.images.forEach((image) => {
    //     proImages.push({ src: image })
    // })


    var proImages = await arrangeImages2(Product)
    console.log(`ARRANGED IMG :: ${proImages}`)


    console.log(`CREATE_PRODUCT : SKU :: ${Product.manufacturerSKU}  PRICE:${roundPrice}  STOCK:${stockStatus}   CATEGORY:${categoryId}   IMAGES:${proImages.length} `)
    //console.log(Product)

    api.post("products", {
        name: Product.manufacturer.name + " " + Product.manufacturerSKU,
        type: "simple",
        sku: Product.manufacturerSKU,
        regular_price: roundPrice,
        price: roundPrice,
        manage_stock: true,
        stock_status: stockStatus,
        stock_quantity: stockQuantity,
        description: Product.longDescription,
        short_description: Product.shortDescription,
        categories: [
            {
                id: parseInt(categoryId) > 0 ? parseInt(categoryId) : 0
            },
        ],

        images: proImages,

        attributes: [
            {
                id: 4,
                name: "Brands",
                slug: "pa_brands",
                options: [Product.manufacturer.name ? Product.manufacturer.name : "N/A"]
            },
            {
                name: 'Html Specs',
                options: [Product.htmlMainSpecs ? Product.htmlMainSpecs : "N/A"]
            },

            {
                name: 'estimate Gross Weight',
                options: [Product.estimateGrossWeight ? Product.estimateGrossWeight : "N/A"]
            },
            {
                name: 'product Model',
                options: [Product.productModel ? Product.productModel : "N/A"]
            },
            {
                name: 'ean',
                options: [Product.ean ? Product.ean : "N/A"]
            },
            {
                name: 'warranty Text',
                options: [Product.warrantyText ? Product.warrantyText : "N/A"]
            },
            {
                name: 'product Type Name',
                options: [Product.productType.name ? Product.productType.name : "N/A"]
            },
            {
                name: 'product Sub Type Id',
                options: [Product.productSubTypeId ? Product.productSubTypeId : "N/A"]
            },
            {
                name: 'product Sub Type',
                options: [Product.productSubType ? Product.productSubType : "N/A"]
            },
        ],

    }).then((resp) => {
        console.log('PRODUCT CREATE SUCCESS');
        ProRefresh += 1
        var data = resp.data
        ProList.push({ method: "create", images: Product.images, productId: data.id, body: data, Files: Product.FilePaths });
    }).catch((error) => {
        // admin.database().ref('/Woo/ErrorLogs').push({
        //     sku: Product.manufacturerSKU,
        //     images: Product.images,
        //     category: categoryId,
        //     product: Product,
        //     error: error
        // })
        console.log(`PRODUCT CREATE HAS FAILED BECAUSE : ${error}`)
        ProRefresh += 1
        ProList.push({ method: "create", error: "error" });
    });



}

const UpdateProduct = async (Product, pid) => {


    var WooCommerceApi = WooCommerceRestApi.default;

    var api = new WooCommerceApi({
        url: 'https://firewallforce.se',
        consumerKey: 'ck_42a75ce7a233bc1e341e33779723c304e6d820cc',
        consumerSecret: 'cs_6e5a683ab5f08b62aa1894d8d2ddc4ad69ff0526',
        version: 'wc/v3'
    });

    console.log(`PRODUCT_UPDATE`)


    // console.log(`Cat name :: ${Product.productType.name}`)
    // var categoryId = await CategoryIdByName(Product.productSubType, api)
    // console.log(`CATEGORY ID :: ${categoryId}`)


    var inputPrice = Product.hasOwnProperty('productPriceInfo') ? Product.productPriceInfo.price : 0
    var price = await EURtoSwedish(inputPrice)
    var intPrice = parseFloat(price)
    var priceByMargin = intPrice + ((intPrice / 100) * 20);
    var roundPrice = priceByMargin.toFixed(2) + ""


    var Status = Product.hasOwnProperty('aggregatedStatusText') ? Product.aggregatedStatusText : ""
    var stockStatus = Status === "In stock" ? "instock" : "outofstock"
    var stockQuantity = Product.hasOwnProperty('productStockInfo') ? Product.productStockInfo.stock : 0

    // var proImages = await arrangeImages2(Product)
    // console.log(`ARRANGED IMG :: ${proImages}`)


    console.log(`UPDATE_PRODUCT : SKU :: ${Product.manufacturerSKU};   PRICE:${roundPrice};   STOCK:${stockStatus};`)

    api.put(`products/${pid}`, {
        name: Product.manufacturer.name + " " + Product.manufacturerSKU, // See more in https://woocommerce.github.io/woocommerce-rest-api-docs/#product-properties
        type: "simple",
        // sku: 'AFI-ALN-R',//Product.manufacturerSKU,
        regular_price: roundPrice,
        price: roundPrice,
        manage_stock: true,
        stock_status: stockStatus,
        stock_quantity: stockQuantity,
        description: Product.longDescription,
        short_description: Product.shortDescription,
        // categories: [
        //     {
        //         id: parseInt(categoryId) > 0 ? parseInt(categoryId) : 0
        //     },
        // ],


        // images: proImages,



        attributes: [
            {
                id: 4,
                name: "Brands",
                slug: "pa_brands",
                options: [Product.manufacturer.name ? Product.manufacturer.name : "N/A"]
            },
            {
                name: 'Html Specs',
                options: [Product.htmlMainSpecs ? Product.htmlMainSpecs : "N/A"]
            },

            {
                name: 'estimate Gross Weight',
                options: [Product.estimateGrossWeight ? Product.estimateGrossWeight : "N/A"]
            },
            {
                name: 'product Model',
                options: [Product.productModel ? Product.productModel : "N/A"]
            },
            {
                name: 'ean',
                options: [Product.ean ? Product.ean : "N/A"]
            },
            {
                name: 'warranty Text',
                options: [Product.warrantyText ? Product.warrantyText : "N/A"]
            },
            {
                name: 'product Type Name',
                options: [Product.productType.name ? Product.productType.name : "N/A"]
            },
            {
                name: 'product Sub Type Id',
                options: [Product.productSubTypeId ? Product.productSubTypeId : "N/A"]
            },
            {
                name: 'product Sub Type',
                options: [Product.productSubType ? Product.productSubType : "N/A"]
            },
        ],


    }).then((resp) => {
        console.log('PRODUCT UPDATE SUCCESS')
        var data = resp.data
        //console.log(`PRODUCT UPDATED :: ${JSON.stringify(data)}`)
        ProRefresh += 1
        ProList.push({ method: "update", images: Product.images, "productId": data.id, body: data });
    }).catch((ex) => {
        console.log('product update failed')
        console.log(ex)
        ProRefresh += 1
        ProList.push({ method: "update", body: 'data', error: `PRODUCT UPDATE ERROR :: $ex` })
    })


}



const arrangeImages2 = async (Product) => {

    console.log(`Product images :: ${Product.images.length}`)


    // get size & make object with image src & size

    var imagesInfo = []
    if (Product.images[0]) imagesInfo.push(await getImageSize(Product.images[0]))
    if (Product.images[1]) imagesInfo.push(await getImageSize(Product.images[1]))
    if (Product.images[2]) imagesInfo.push(await getImageSize(Product.images[2]))
    if (Product.images[3]) imagesInfo.push(await getImageSize(Product.images[3]))
    if (Product.images[4]) imagesInfo.push(await getImageSize(Product.images[4]))

    // sort objects

    //  imagesInfo.sort(function (a, b) { return b - a });
    imagesInfo = imagesInfo.sort((a, b) => b.width - a.width);

    console.log(`IMAGE INFO :: ${JSON.stringify(imagesInfo)}`)

    var images = []
    imagesInfo.forEach((item) => { images.push({ src: item.src }) })
    // images = images.reverse()

    console.log(`IMAGES FINAL DATA:: ${JSON.stringify(images)}`)
    return images


}

const getImageSize = async (Uri) => {
    const response = await axios.get(Uri, { responseType: 'arraybuffer' })
    const buffer = Buffer.from(response.data, "utf-8")
    const resp = sizeOf(buffer)
    resp.src = Uri
    return resp
}



const arrangeImages = async (Product) => {

    var proImages = []
    Product.images.forEach((image) => {
        proImages.push({ src: image })
    })

    var imgSizes = []


    if (proImages[0]) {
        var image = proImages[0]
        var resp = await fetch(image.src)
        var blob = await resp.blob();
        console.log(`blob Size :: ${blob.size}`)


        probe('http://example.com/image.jpg', function (err, result) {
            console.log(result);

        });

        imgSizes.push({ image: image.src, size: blob.size })
    }


    if (proImages[1]) {
        var image = proImages[1]
        var resp = await fetch(image.src)
        var blob = await resp.blob();
        console.log(`blob Size :: ${blob.size}`)
        imgSizes.push({ image: image.src, size: blob.size })
    }


    if (proImages[2]) {
        var image = proImages[2]
        var resp = await fetch(image.src)
        var blob = await resp.blob();
        console.log(`blob Size :: ${blob.size}`)
        imgSizes.push({ image: image.src, size: blob.size })
    }


    if (proImages[3]) {
        var image = proImages[3]
        var resp = await fetch(image.src)
        var blob = await resp.blob();
        console.log(`blob Size :: ${blob.size}`)
        imgSizes.push({ image: image.src, size: blob.size })
    }


    if (proImages[4]) {
        var image = proImages[4]
        var resp = await fetch(image.src)
        var blob = await resp.blob();
        console.log(`blob Size :: ${blob.size}`)
        imgSizes.push({ image: image.src, size: blob.size })
    }


    imgSizes.sort(function (a, b) { return b - a });
    var images = imgSizes.map((item) => ({ src: item.image }))

    return images.reverse()

    console.log(`IMAGE REFINED DATA:: ${JSON.stringify(imgSizes.reverse())}`)




}


const EURtoSwedish = async (Eur) => {
    var Krona = await fetch(`http://localhost:5000/api/eurtokrona/${Eur}`);
    var Krones = await Krona.text()
    return Krones + 0;
}


const CategoryIdByName = async (categoryName) => {

    categoryName = modifyCatName(categoryName)
    var categoryId
    var categories = JSON.parse(fs.readFileSync(`${__dirname}/categories.json`, 'utf-8'))
    categories.forEach((category) => {
        if (category.name == categoryName) categoryId = category.id
    })

    if (!categoryId) {
        connect()
        var categories = await admin.database().ref('/Woo/Categories').once('value')
        categories.forEach((cat) => {
            var category = cat.val()
            if (category.name == categoryName) categoryId = category.id
        })
    }

    if (!categoryId) categoryId = await createCategory(categoryName)

    if (categoryId) return categoryId
    if (!categoryId) return 0

}





const modifyCatName = (categoryName) => {
    if (categoryName === 'Software Service & Support') categoryName = 'Software Service Support'
    if (categoryName.includes('&')) {
        categoryName = categoryName.split('&').join('&amp;')
    }
    return categoryName
}

const createCategory = async (catName) => {

    var WooCommerceApi = WooCommerceRestApi.default;

    var api = new WooCommerceApi({
        url: 'https://firewallforce.se',
        consumerKey: 'ck_42a75ce7a233bc1e341e33779723c304e6d820cc',
        consumerSecret: 'cs_6e5a683ab5f08b62aa1894d8d2ddc4ad69ff0526',
        version: 'wc/v3'
    });

    try {
        var resp = await api.post("products/categories", { name: catName })
        console.log(`CREATED CATEGORY :: ${resp.data}`)

        connect()
        admin.database().ref('/Woo/Categories').push({
            id: resp.data.id,
            name: resp.data.name
        })


        return resp.data.id

    } catch (ex) {
        console.log(`category error`)
        return undefined
    }



}

const connect = () => {
    try {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            databaseURL: "https://kidland-5754b-default-rtdb.firebaseio.com",
            storageBucket: "kidland-5754b.appspot.com",
        });
    } catch (ex) {
        //console.log(ex)
    }

}

const fireConnect = () => {
    try { firebase.initializeApp(config) } catch (ex) { console.log('') }
}


nodejsAxiosCheckout = (req, res) => {


    var data = JSON.stringify({
        "checkout": {
            "termsUrl": "http://localhost:8080/terms",
            "cancelURL": "https://cancellation-identifier-url",
            "returnURL": "https://127.0.0.1/redirect.php",
            "consumerType": {
                "supportedTypes": [
                    "B2C",
                    "B2B"
                ],
                "default": "B2C"
            },
            "integrationType": "HostedPaymentPage"
        },
        "order": {
            "reference": "MiaSDK-iOS",
            "currency": "SEK",
            "amount": 10000,
            "items": [
                {
                    "unit": "pcs",
                    "netTotalAmount": 10000,
                    "taxAmount": 0,
                    "grossTotalAmount": 10000,
                    "quantity": 1,
                    "name": "Lightning Cable",
                    "unitPrice": 10000,
                    "taxRate": 0,
                    "reference": "MiaSDK-iOS"
                }
            ]
        }
    });


    var config = {
        method: 'post',
        url: 'https://test.api.dibspayment.eu/v1/payments',
        headers: {
            'Authorization': 'Bearer 34562d73070744c1971de3f6e0051c8d',
            'Content-Type': 'application/json',
            // 'Cookie': 'visid_incap_1152503=HGd6Tm74RTiiMU4QW/LAkrksKmEAAAAAQUIPAAAAAAAbQQFsWI211iPl3pD9/M6Q; incap_ses_958_1967659=h6tIZNjHfzK6MdToV4BLDURhPGEAAAAAGTKuKge19102wgqkjJYXJw==; visid_incap_1967659=hsA3fPW5S3Cvb8aXlhDEPKbdLWEAAAAAQUIPAAAAAAAGQfetqrrxmsxl7vg78BwS'
        },
        data: data
    };

    axios(config)
        .then(function (response) {
            console.log(JSON.stringify(response.data));
            return res.send(JSON.stringify(response.data))
        })
        .catch(function (error) {
            console.log(error);
        });

}

module.exports = {
    ImageProxy,
    currencyExchange,
    WooCreate,
    EmailApi,
    postToForm,
    nodejsAxiosCheckout

}
