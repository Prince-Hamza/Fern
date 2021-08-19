const firebase = require('firebase')
const ProductsInfo = require('../data/ProductsV3.json')
const admin = require('firebase-admin');
const serviceAccount = require('./servicekey.json');
const axios = require('axios')
const fetch = require('node-fetch');
var request = require('request'), JSONStream = require('JSONStream'), es = require('event-stream')
const hyperrequest = require('hyperrequest')
const fs = require('fs');
const WooCommerceRestApi = require("@woocommerce/woocommerce-rest-api")
var ProductNum = 5;


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


const FirstCapital = (Term) => {
    return Term.substring(0, 1).toUpperCase() + Term.substring(1, Term.length)
}

var imglink = ''
const ImageProxy = async (req, res) => {

    // var ImagesArr = req.body.info, respArray = []
    // UpdateProductImages(ImagesArr, respArray)

    // var waitpix = setInterval(() => {
    //     if (respArray.length == ImagesArr) clearInterval(waitpix)
    //     return res.json({ PicLinx: respArray })
    // }, 1000)
    var Img = req.body.image
    //return res.send(Img)


    var index = 0

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


    var response = await axios({ method: 'GET', url: Img, responseType: 'stream' })
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
                return res.send(downloadLink)
            })
        })
        .on('error', (err) => {
            console.log(`error : ${err}`)
        })






}


const UpdateProductImages = async (ImagesArr, respArray) => {


}

const getRandom = (min, max) => {
    return Math.trunc(Math.random() * (max - min) + min);
}


const WooRequest = (start, end) => {
    fetch(`https://firewallforce.se/wp-json/wc/v3/update64?start=${start}&end=${end}`).then((resp) => {
        resp.json().then((data) => {
            console.log(JSON.stringify(data))
        })
    })
}

const WooParallel = (req, res) => {
    //WooRequest(20,23)
    var nowDate = new Date();
    return res.send('ok')
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


const Product_Update = (req, res) => {

    //  var Title = Pro.manufacturer.name + " " + Pro.manufacturerSKU;
    // var Images = this.ParseImages(Pro)
    var App = this, Price = 0.00;
    //if (Pro.hasOwnProperty('productPriceInfo') == true) Price = Pro.productPriceInfo.price




    fetch(`https://firewallforce.se/wp-json/wc/v3/update64?name=${'Title'}&puid=${'puid'}&sku=${'iMerror'}&price=${'Price'}&catname=${'Pro.productType.name'}&brand=${'Pro.manufacturer.name'}&shortdesc=${'Pro.shortDescription'}&longdesc=${'Pro.longDescription'}&stock=${'3'}&stockstatus=${'Pro.aggregatedStatusText'}&attrib1=${'Pro.productType.attributeTypeName1'}&attrib2=${'Pro.productType.attributeTypeName2'}&attrib3=${'Pro.productType.attributeTypeName3'}&attrib4=${'Pro.productType.attributeTypeName4'}&attrib5=${'Pro.productType.attributeTypeName5'}&attrib1v=${'Pro.attributeValue1'}&attrib2v=${'Pro.attributeValue2'}&attrib3v=${'Pro.attributeValue3'}&attrib4v=${'Pro.attributeValue4'}&attrib5v=${'Pro.attributeValue5'}&images=${[]}`, {
        method: 'GET',
        // body:{info:Product},
        headers: {
            'Authorization': 'Basic' + Buffer.from('ck_42a75ce7a233bc1e341e33779723c304e6d820cc:cs_6e5a683ab5f08b62aa1894d8d2ddc4ad69ff0526', 'binary').toString('base64')
        }
    }).then((resp) => {
        resp.json().then((respJson) => {
            console.log('success')
            return res.send(respJson)
        })
    }).catch((e) => {
        console.log(e)
        return res.send('@safe!')
    })



}

var File, startIndex = 18, ResumeFrom = 0, TotalProducts = [], StreamCount = 0;
const StreamJson = (req, res) => {
    //  console.log(req.params.key)
    // var stream =  request.get('https://tools.learningcontainer.com/sample-json.json')
    //var stream = request.get('https://api.itscope.com/2.0/products/search/KEYWORDS=$cat/developer.json?sort=DEFAULT').auth('m135172', 'GXBlezJK0n-I55K4RV_f0vHIRrFq_YcTNh9Yz735LJs', false)
    var stream = request.get('https://api.itscope.com/2.0/products/exports/530415fa-b0bc-4a01-bd62-4598dd579cd2').auth('m135172', 'GXBlezJK0n-I55K4RV_f0vHIRrFq_YcTNh9Yz735LJs', false)

    File = "", count = 1;
    stream.on('data', (chunk) => {
        // console.log(Buffer.from(chunk).toString())
        File += Buffer.from(chunk).toString()
    });

    ObserveSplit(0, 100000)

}


const ObserveSplit = (start, end) => {

    var listen = setInterval(() => {
        if (File.length >= end) {
            splitStream(start, end)
            clearInterval(listen)
        }
    }, 1000)

}

const splitStream = async (start, end) => {

    console.log(`start ${start}`)
    console.log(`end ${start + 100000}`)

    console.log(`File Length :: ${File.length}`)


    var ByteText = File.substring(start, start + 100000);
    console.log("Length :: " + ByteText.length)
    //var ByteText = await Bytes.text();

    var i2 = getIndex(ByteText, "puid", 2)
    //console.log(i2)

    //console.log(`Resume From :: ${start + i2 - 100}`)
    // this.setState({ ResumeFrom: start + i2 - 100 })
    ResumeFrom = start + i2 - 100
    console.log('res from 1:' + ResumeFrom)
    var LinesArray = ByteText.split('\n')
    ReadRow2(LinesArray)



}

ReadRow2 = async (rows) => {

    var Product = '', Pause = -1, Stream = false, Count = 0;
    for (let c = 0; c <= rows.length - 1; c++) {
        if (rows[c].includes('puid')) Stream = true
        if (Stream) {
            if (rows[c].includes('puid')) Count += 1
            if (Count == 1) {
                let Row = rows[c].includes('puid') ? '{' + rows[c] : rows[c]
                Product += Row;
                //  console.log(Row)
            }
            if (Count == 2) {
                Stream = false;
                Product = Product.substring(0, Product.length - 3)
                //  console.log(Product)

            }
        }

    }


    try {
        var niceProduct = JSON.parse(Product)
        // console.log(niceProduct)

        TotalProducts.push(niceProduct)
        StreamCount += 1
        //if (TotalProducts.length == 5) FireSave(TotalProducts)



        Resumify(File)

    } catch (ex) {
        //  console.log(`Catch :: ${ex}`)
        // Resumify(File)
    }

    //    console.log(this.state.ResumeFrom)
    // if (!this.state.Pause) this.Resumify(File)

}

Resumify = () => {
    //console.log(File.substring(ResumeFrom + 100,ResumeFrom + 300))
    console.log(`rs in splitstream ${ResumeFrom}`)
    //splitStream(ResumeFrom, ResumeFrom + 100000)
    ObserveSplit(ResumeFrom, ResumeFrom + 100000)

}



// var ProArray = []
// const Extract_Product = (Data) => {
//     var ByteText = Data.substring(startIndex, 100000);
//     var puid2 = getIndex(ByteText, "puid", 2)
//     var Product = Data.substring(startIndex, puid2 + 9)
//     startIndex = puid2 - 8;
//     var Pro = JSON.parse(Product)
//     return Pro;

// }

const getIndex = (string, subString, index) => {
    return string.split(subString, index).join(subString).length;
}

FireSave = (Products) => {
    StreamCount = 0
    TotalProducts = 0
    firebase.database().ref(`/JsonStreaming/Stream${StreamCount}`).push(Products[0])
    firebase.database().ref(`/JsonStreaming/Stream${StreamCount}`).push(Products[1])
    firebase.database().ref(`/JsonStreaming/Stream${StreamCount}`).push(Products[2])
    firebase.database().ref(`/JsonStreaming/Stream${StreamCount}`).push(Products[3])
    firebase.database().ref(`/JsonStreaming/Stream${StreamCount}`).push(Products[4])
}



// stream.pipe(fs.createWriteStream('./stream.txt'))
// stream.pipe(res)

// const Reset = (stream) => {
//     stream.pause()
//     fs.writeFile('/path/to/file', '')
//     console.log('Stream Paused')
// }

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



var ProRefresh = 0, ProList = [], ImageListPro1 = [], ImageListPro2 = [], ImageListPro3 = [], ImageListPro4 = [], ImageListPro5 = []
const WooCreate = async (req, res) => {

    // console.log('request recieved')
    // ImageProxy('https://thumbs.dreamstime.com/b/good-thumb-up-15811851.jpg')


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
        console.log(`PRODUCT REFRESH :: ${ProRefresh}`)
        console.log(`ProList Length :: ${ProList.length}`)

        if (ProRefresh == 5) {
            clearInterval(countPro)
            return res.send({ info: ProList })
        }
    }, 1000)






    //return res.send({ info: ProList })

}


const CreateOrUpdate = async (Product, imgArrNum) => {

    console.log('createorupdate')
    // cadmium : fafe1920-056f-43df-9719-3615e5de6541

    //var getidreq = await fetch(`https://firewallforce.se/wp-json/wc/v3/idbysku?sku=${Product.manufacturerSKU}`);
    var getidreq = await fetch(`https://firewallforce.se/wp-json/wc/v3/idbysku?sku=khoti`);
    var id = await getidreq.text();

    // return ({ skip: 'success' });


    console.log(`id by sku : ${id}`)

    if (id == 0) {
        var resp = CreateProduct(Product)
        //var resp = CreateProduct(Product);
        return resp;
        //return ({ method: "create", "productId": 'data.id', body: 'data' });

    } else {
        var updateResp = UpdateProduct(Product, id);
        return updateResp
        //  return ({ update: 'success', info: 'updateResp' });
    }


}


// const precreate = (Images, Product, imgArrNum) => {
//     console.log(`InputImage :: ${Images}`)
//     var arrayToAwait = [];

//     // if (Images.length > 0) ImageProxy(Images[0], Product, imgArrNum)
//     // if (Images.length >= 0) ImageProxy(Images[1], Product, imgArrNum)
//     // if (Images.length >= 3) ImageProxy(Images[2], Product, imgArrNum)
//     // if (Images.length >= 4) ImageProxy(Images[3], Product, imgArrNum)
//     // if (Images.length >= 5) ImageProxy(Images[4], Product, imgArrNum)

//     // var imgc = setInterval(() => {
//     //     console.log('waiting image upload')
//     //     if (imgArrNum == 1 && ImageListPro1.length == Images.length) { CreateProduct(Product, ImageListPro1); clearInterval(imgc) }
//     //     if (imgArrNum == 2 && ImageListPro1.length == Images.length) { CreateProduct(Product, ImageListPro2); clearInterval(imgc) }
//     //     if (imgArrNum == 3 && ImageListPro1.length == Images.length) { CreateProduct(Product, ImageListPro3); clearInterval(imgc) }
//     //     if (imgArrNum == 4 && ImageListPro1.length == Images.length) { CreateProduct(Product, ImageListPro4); clearInterval(imgc) }
//     //     if (imgArrNum == 5 && ImageListPro1.length == Images.length) { CreateProduct(Product, ImageListPro5); clearInterval(imgc) }

//     // }, 500)

// }

const CreateProduct = async (Product) => {

    // console.log(`IMAGE LINK :: ${ImageLink}`)
    // var Title = Product.manufacturer.name + " " + Product.manufacturerSKU
    // console.log(`Title : ${Title}`)
    // return ({ method: "create", Title: Title , images : Product.images });


    //return Product.images;

    console.log(`create product type :: ${typeof (Product)}`)
    console.log(`Sku :: ${Product.manufacturerSKU}`)
    console.log(`Price input :: ${Product.productPriceInfo.price}`)

    var WooCommerceApi = WooCommerceRestApi.default;

    var api = new WooCommerceApi({
        url: 'https://firewallforce.se',
        consumerKey: 'ck_42a75ce7a233bc1e341e33779723c304e6d820cc',
        consumerSecret: 'cs_6e5a683ab5f08b62aa1894d8d2ddc4ad69ff0526',
        version: 'wc/v3'
    });








    console.log(Product.images)

    console.log(`starting Upload Pix`)

    var ImageApi = await fetch(`/api/woo`, {
        method: 'POST',
        body: JSON.stringify({ image: Product.images[0] }),
    })
    var piclink = ImageApi.text()
    console.log(`imgresp :: ${piclink}`)

    // var iLinx = []
    // var resp = await fetch(`http://localhost:5000/api/woo`, {
    //     method: 'POST',
    //     body: JSON.stringify({ image: Product.images[0] }),
    // })
    // var DownloadLink = resp.text()
    // console.log(`Download Link :: ${DownloadLink}`)
    // iLinx.push(DownloadLink)



    // if (Product.images.length >= 2) {
    //     var resp = await fetch(`http://localhost:5000/api/woo`, {
    //         method: 'POST',
    //         body: JSON.stringify({ image: Product.images[0] }),
    //     })
    //     var DownloadLink = resp.text()
    //     console.log(`Download Link :: ${DownloadLink}`)
    //     iLinx.push(DownloadLink)
    // }


    // if (Product.images.length >= 3) {
    //     var resp = await fetch(`http://localhost:5000/api/woo`, {
    //         method: 'POST',
    //         body: JSON.stringify({ image: Product.images[0] }),
    //     })
    //     var DownloadLink = resp.text()
    //     console.log(`Download Link :: ${DownloadLink}`)
    //     iLinx.push(DownloadLink)
    // }


    // if (Product.images.length >= 34) {
    //     var resp = await fetch(`http://localhost:5000/api/woo`, {
    //         method: 'POST',
    //         body: JSON.stringify({ image: Product.images[0] }),
    //     })
    //     var DownloadLink = resp.text()
    //     console.log(`Download Link :: ${DownloadLink}`)
    //     iLinx.push(DownloadLink)
    // }

    // if (Product.images.length >= 5) {
    //     var resp = await fetch(`http://localhost:5000/api/woo`, {
    //         method: 'POST',
    //         body: JSON.stringify({ image: Product.images[0] }),
    //     })
    //     var DownloadLink = resp.text()
    //     console.log(`Download Link :: ${DownloadLink}`)
    //     iLinx.push(DownloadLink)
    // }

    // console.log(`Linx :: ${iLinx}`)

    // return iLinx;











    var price = await EURtoSwedish(Product.productPriceInfo.price)
    var intPrice = parseFloat(price)
    var priceByMargin = intPrice + ((intPrice / 100) * 20);
    console.log(`${typeof (priceByMargin)}`)
    var roundPrice = priceByMargin.toFixed(2) + ""

    console.log(`PRICE :: ${price}`)
    console.log(`Price Margin :: ${priceByMargin}`)
    console.log(`Price round :: ${roundPrice}`)



    var stockStatus = Product.aggregatedStatusText == "In stock" ? "instock" : "outofstock"

    console.log(`Cat name :: ${Product.productType.name}`)
    var categoryId = await CategoryIdBySrc(Product.productType.name, api)
    console.log(`CATEGORY ID :: ${categoryId}`)



    api.post("products", {
        name: Product.manufacturer.name + " " + Product.manufacturerSKU,
        type: "simple",
        sku: 'skuku' + getRandom(5, 221330), //Product.manufacturerSKU,
        regular_price: roundPrice,
        price: roundPrice,
        manage_stock: true,
        stock_status: stockStatus,
        stock_quantity: Product.productStockInfo.stock,
        description: Product.longDescription,
        short_description: Product.shortDescription,
        categories: [
            {
                id: parseInt(categoryId) > 0 ? parseInt(categoryId) : 0
            },
        ],


        attributes: [
            {
                name: 'Brand',
                options: [Product.manufacturer.name ? Product.manufacturer.name : "N/A"]
            },
            {
                name: 'Html Specs',
                options: [Product.htmlSpecs ? Product.htmlSpecs : "N/A"]
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
        ProRefresh += 1
        var data = resp.data
        ProList.push({ method: "create", images: Product.images, productId: data.id, body: data });
    }).catch((error) => {
        console.log(`PRODUCT UPDATE HAS BADLY FAILED`)
        ProRefresh += 1
        ProList.push({ method: "create", error: error });
    });


    //return resp.data;
    // var data = resp.data
    // return ({ method: "create", images: Product.images, productId: data.id, body: data });

    //}
    // catch (ex) {
    //     console.log(ex)
    //     return ({ method: "create", error: ex });
    // }
}

const UpdateProduct = async (Product, pid) => {

    // console.log(`IMAGES :: ${Product.images}`)
    // var Title = Product.manufacturer.name + " " + Product.manufacturerSKU
    // console.log(`Title : ${Title}`)
    // return ({ method: "create", Title: Title , images : Product.images });



    var WooCommerceApi = WooCommerceRestApi.default;

    var api = new WooCommerceApi({
        url: 'https://firewallforce.se',
        consumerKey: 'ck_42a75ce7a233bc1e341e33779723c304e6d820cc',
        consumerSecret: 'cs_6e5a683ab5f08b62aa1894d8d2ddc4ad69ff0526',
        version: 'wc/v3'
    });

    // console.log(`cat Name :: ${Product.productType.name}`)
    // var categoryId = await CategoryIdBySrc(Product.productType.name, api)
    // console.log(`CatId :: ${categoryId}`)



    var price = await EURtoSwedish(Product.productPriceInfo.price)
    var intPrice = parseFloat(price)
    var priceByMargin = intPrice + ((intPrice / 100) * 20);

    console.log(`${typeof (priceByMargin)}`)
    var roundPrice = priceByMargin.toFixed(2) + ""

    console.log(`PRICE :: ${price}`)
    console.log(`Price Margin :: ${priceByMargin}`)
    console.log(`Price round :: ${roundPrice}`)



    var stockStatus = Product.aggregatedStatusText == "In stock" ? "instock" : "outofstock"

    //var categoryId = await CategoryIdBySrc(Product.productType.name)


    console.log(`PRODUCT ID :: ${pid}`)

    //try {


    api.put(`products/${pid}`, {
        name: Product.manufacturer.name + " " + Product.manufacturerSKU, // See more in https://woocommerce.github.io/woocommerce-rest-api-docs/#product-properties
        type: "simple",
        sku: Product.manufacturerSKU,
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

        attributes: [
            {
                name: 'Brand',
                options: [Product.manufacturer.name ? Product.manufacturer.name : "N/A"]
            },
            {
                name: 'Html Specs',
                options: [Product.htmlSpecs ? Product.htmlSpecs : "N/A"]
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

        ProRefresh += 1
        ProList.push({ method: "update", images: Product.images, "productId": data.id, body: data });
    }).catch((ex) => {
        console.log('product update failed')
        console.log(ex)

        ProRefresh += 1
        ProList.push({ method: "update", body: 'data', error: ex })
    })



    // console.log('product update success')
    // var data = resp.data
    // return ({ method: "update", images: Product.images, "productId": data.id, body: data });
    // } catch (ex) {
    // console.log('product update failed')
    // console.log(ex)
    // return ({ method: "update", body: 'data', error: ex })
    //}
}


const updateImages = () => {
    var WooCommerceApi = WooCommerceRestApi.default;

    var api = new WooCommerceApi({
        url: 'https://firewallforce.se',
        consumerKey: 'ck_42a75ce7a233bc1e341e33779723c304e6d820cc',
        consumerSecret: 'cs_6e5a683ab5f08b62aa1894d8d2ddc4ad69ff0526',
        version: 'wc/v3'
    });

    console.log(`IMAGES PRODUCT ID :: ${pid}`)

    //try {


    api.put(`products/${pid}`, {

        images: [
            {
                src: ImagesArray[0],
            },
            {
                src: ImagesArray[1],
            },
            {
                src: ImagesArray[2],
            }
        ],


    }).then((resp) => {
        console.log('product update success')
        var data = resp.data

        //      ProRefresh += 1
        //        ProList.push({ method: "update", images: Product.images, "productId": data.id, body: data });
    }).catch((ex) => {
        console.log('product update failed')
        console.log(ex)

        ProRefresh += 1
        ProList.push({ method: "update", body: 'data', error: ex })
    })



}

const EURtoSwedish = async (Eur) => {
    var Krona = await fetch(`http://localhost:5000/api/eurtokrona/${Eur}`);
    var Krones = await Krona.text()
    return Krones + 0;
}


const CategoryIdBySrc = async (categoryName, api) => {


    console.log(`in cat id by src :: ${categoryName}`)
    if (categoryName == 'Software Service & Support') categoryName = 'Software Service Support'
    if (categoryName.includes('&')) {
        console.log(`INCLUDES :: ${categoryName}`)
        categoryName = categoryName.split('&').join('&amp;')
    }

    console.log(`finalcat :: ${categoryName}`)

    var categoryId;

    var resp = await api.get("products/categories", { 'per_page': '100', 'page': '1' })
    var resp2 = await api.get("products/categories", { 'per_page': '100', 'page': '2' })

    var categories = resp.data
    var categories2 = resp2.data

    console.log(`Type :: ${typeof (categories)}`)

    categories.forEach((category) => {
        // console.log(`category names :: ${category.name}`)
        if (category.name == categoryName) {
            categoryId = category.id
            console.log(`found :: ${categoryId}`)
        }
    })

    categories2.forEach((category) => {
        //console.log(`category names :: ${category.name}`)
        if (category.name == categoryName) {
            categoryId = category.id
            console.log(`found :: ${categoryId}`)
        }
    })

    return categoryId

}

module.exports = {
    ImageProxy,
    WooParallel,
    currencyExchange,
    Product_Update,
    StreamJson,
    WooCreate,
    EmailApi,
    postToForm,
    updateImages
}
