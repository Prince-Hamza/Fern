const firebase = require('firebase')
const admin = require('firebase-admin');
const serviceAccount = require('./servicekey.json');
const axios = require('axios')
const fetch = require('node-fetch');
const WooCommerceRestApi = require("@woocommerce/woocommerce-rest-api")
const fs = require('fs')

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



var ProRefresh = 0, ProList = [], catOnce = true, categoryMemory = [];

const WooCreate = async (req, res) => {



    var ProArray = req.body.info
    console.log(`Fetch :: ${typeof (ProArray[0])}`)


    ProRefresh = 0;
    ProList = []

    CreateOrUpdate(ProArray[0], 1)
    CreateOrUpdate(ProArray[1], 2)
    CreateOrUpdate(ProArray[2], 3)
    CreateOrUpdate(ProArray[3], 4)
    CreateOrUpdate(ProArray[4], 5)
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

const CreateOrUpdate = async (Product, imgArrNum) => {


    var id = await idBySku(Product.manufacturerSKU)
    //var id = await idBySku('khoti')




    console.log(`id by sku : ${id}`)


    if (id == 0) {

        console.log(`GOING TO UPLOAD IMAGES`)
        var resp = uploadImages(Product, 'create')
        // var resp = CreateProduct(Product)
        return resp;
        //return ({ method: "create", "productId": 'data.id', body: 'data' });

    } else {

        console.log(`GOING TO UPDATE PRODUCT`)
        var resp = uploadImages(Product, 'update' , id)

        //var updateResp = UpdateProduct(Product, id);
        //return updateResp

        //  return ({ update: 'success', info: 'updateResp' });
    }


}


const uploadImages = async (Product, method , id) => {

    console.log(`Lets Upload Images First`)

    var NewImages = []
    var filePathx = []

    try {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            databaseURL: "https://kidland-5754b-default-rtdb.firebaseio.com",
            storageBucket: "kidland-5754b.appspot.com",
        });
    } catch (ex) {
        //console.log(ex)
    }





    if (Product.images.length >= 1) {

        var num = getRandom(5, 10000);
        const destination = `pix/image_${num}.jpg`
        let downloadLink = ''

        // var response = await axios(Product.images[0], { method: 'GET', responseType: 'stream' })
        try {
            var response = await axios(Product.images[0], { method: 'GET', responseType: 'stream' })
        } catch (ex) {
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
                file.getSignedUrl({ action: 'read', expires: '01-01-2022' }).then(signedUrls => {
                    downloadLink = signedUrls[0];
                    console.log(downloadLink)
                    NewImages.push(downloadLink)
                    filePathx.push(destination)
                })
            })
            .on('error', (err) => {
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
                file.getSignedUrl({ action: 'read', expires: '01-01-2022' }).then(signedUrls => {
                    downloadLink = signedUrls[0];
                    console.log(downloadLink)
                    NewImages.push(downloadLink)
                    filePathx.push(destination)
                })
            })
            .on('error', (err) => {
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
                file.getSignedUrl({ action: 'read', expires: '01-01-2022' }).then(signedUrls => {
                    downloadLink = signedUrls[0];
                    console.log(downloadLink)
                    NewImages.push(downloadLink)
                    filePathx.push(destination)
                })
            })
            .on('error', (err) => {
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
            skipVoidImages(ex)
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
                file.getSignedUrl({ action: 'read', expires: '01-01-2022' }).then(signedUrls => {
                    downloadLink = signedUrls[0];
                    console.log(downloadLink)
                    NewImages.push(downloadLink)
                    filePathx.push(destination)
                })
            })
            .on('error', (err) => {
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
            skipVoidImages(ex)
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
                file.getSignedUrl({ action: 'read', expires: '01-01-2022' }).then(signedUrls => {
                    downloadLink = signedUrls[0];
                    console.log(downloadLink)
                    NewImages.push(downloadLink)
                    filePathx.push(destination)
                })
            })
            .on('error', (err) => {
                console.log(`error : ${err}`)
            })


    }








    var waitPix = setInterval(() => {
        console.log()
        console.log(`NewImages Length :: ${NewImages.length}`)
        console.log()
        if (Product.images.length >= NewImages.length) {
            clearInterval(waitPix)
            console.log(`IMAGES UPLOADED LETS CREATE PRODUCT NOW`)
            Product.images = NewImages
            Product.FilePaths = filePathx
            console.log(`IMAGES :: ${Product.images}`)
            //CreateProduct(Product)
            if (method == 'create') CreateProduct(Product)
            if (method == 'update') UpdateProduct(Product , id)
        }
    }, 1000)

}

const skipVoidImages = (ex) => {
    console.log('PRODUCT CREATE SKIP');
    ProRefresh += 1
    ProList.push({ error: ex, description: 'image missing', action: 'dropping product' });
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

    console.log(`Cat name :: ${Product.productType.name}`)
    var categoryId = await CategoryIdByName(Product.productSubType)
    console.log(`CATEGORY ID :: ${categoryId}`)




    var proImages = []
    Product.images.forEach((image) => {
        proImages.push({ src: image })
    })

    console.log(`CREATE_PRODUCT : SKU :: ${Product.manufacturerSKU}  PRICE:${roundPrice}  STOCK:${stockStatus}   CATEGORY:${categoryId}   IMAGES:${proImages.length} `)


    api.post("products", {
        name: Product.manufacturer.name + " " + Product.manufacturerSKU,
        type: "simple",
        sku: 'sku_' + getRandom(0, 5000000000), //Product.manufacturerSKU,
        regular_price: roundPrice,
        price: roundPrice,
        manage_stock: true,
        stock_status: stockStatus,
        stock_quantity: Product.productStockInfo.stock,
        description: Product.longDescription,
        short_description: Product.shortDescription,
        // categories: [
        //     {
        //         id: parseInt(categoryId) > 0 ? parseInt(categoryId) : 0
        //     },
        // ],

        //        images: proImages,

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


    console.log(`Cat name :: ${Product.productType.name}`)
    var categoryId = await CategoryIdByName(Product.productSubType, api)
    console.log(`CATEGORY ID :: ${categoryId}`)


    var inputPrice = Product.hasOwnProperty('productPriceInfo') ? Product.productPriceInfo.price : 0
    var price = await EURtoSwedish(inputPrice)
    var intPrice = parseFloat(price)
    var priceByMargin = intPrice + ((intPrice / 100) * 20);
    var roundPrice = priceByMargin.toFixed(2) + ""


    var Status = Product.hasOwnProperty('aggregatedStatusText') ? Product.aggregatedStatusText : ""
    var stockStatus = Status === "In stock" ? "instock" : "outofstock"
    var stockQuantity = Product.hasOwnProperty('productStockInfo') ? Product.productStockInfo.stock : 0

    var proImages = []
    Product.images.forEach((image) => {
        proImages.push({ src: image })
    })

    console.log(`UPDATE_PRODUCT : SKU :: ${Product.manufacturerSKU}  PRICE:${roundPrice}  STOCK:${stockStatus}   CATEGORY:${categoryId}   IMAGES:${proImages.length} `)


    api.put(`products/${pid}`, {
        name: Product.manufacturer.name + " " + Product.manufacturerSKU, // See more in https://woocommerce.github.io/woocommerce-rest-api-docs/#product-properties
        type: "simple",
        // sku: 'AFI-ALN-R',//Product.manufacturerSKU,
        regular_price: roundPrice,
        price: roundPrice,
        manage_stock: true,
        stock_status: stockStatus,
        stock_quantity: stockQuantity ,
        description: Product.longDescription,
        short_description: Product.shortDescription,
        categories: [
            {
                id: parseInt(categoryId) > 0 ? parseInt(categoryId) : 0
            },
        ],

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
        console.log('product update success')
        var data = resp.data
        console.log(`PRODUCT UPDATED :: ${JSON.stringify(data)}`)
        ProRefresh += 1
        ProList.push({ method: "update", images: Product.images, "productId": data.id, body: data });
    }).catch((ex) => {
        console.log('product update failed')
        console.log(ex)
        ProRefresh += 1
        ProList.push({ method: "update", body: 'data', error: `PRODUCT UPDATE ERROR :: $ex` })
    })


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

        var categories = JSON.parse(fs.readFileSync(`${__dirname}/categories.json`, 'utf-8'))
        categories.push({ name: resp.data.name, id: resp.data.id })
        fs.writeFile(`${__dirname}/categories.json`, JSON.stringify(categories), () => {
            console.log(`categories updated`)
        })

        return resp.data.id

    } catch (ex) {
        console.log(`category error`)
        return undefined
    }



}



module.exports = {
    ImageProxy,
    currencyExchange,
    WooCreate,
    EmailApi,
    postToForm,

}
