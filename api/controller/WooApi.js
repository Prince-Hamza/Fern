const firebase = require('firebase')
const ProductsInfo = require('../data/ProductsV3.json')
const admin = require('firebase-admin');
const serviceAccount = require('./servicekey.json');
const axios = require('axios')
const fetch = require('node-fetch');





const Once = async (Ref) => {
    
    const info = await firebase.database().ref(Ref).once('value')
    console.log(info)
    return info

}



const FirstCapital = (Term) => {
    return Term.substring(0, 1).toUpperCase() + Term.substring(1, Term.length)
}


const ImageProxy = async (req, res) => {

    //const PRIVATE_KEY = "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCMPLXLhUTEhHuc\nIh0yIuYF88MAnoNFKqofS/eu8zcbaLy6l8n33OtTdnlHraTZ0LzvUj3WYGN40mCy\nMcT45WAt0Dv8toMEqsFNCELVI3R/TIhz9Dpm2As+NVtxFDJE7xJ9QjMeOJBgX4za\ncX070+mjdW0nG5Jrexsru1AeaBNOEdC6nr/IeRn78b4zs/ak4XI1eQ5kCs/cqBqK\nJYTacR0dEsh2q4fCENbqCP77g6o6Bhf4yzf5sct+rCXLQbNZVr5eGrLc5Lut/P/K\nK5mrKdxkWXAXNdJCIgmK3MeNhM1bJHxL3hPlHcBniZIMB3jhTwmlWvRYQ7NFI5qE\ni/1zV9UTAgMBAAECggEADsA2CR3QAXHEBMTL2GG2W0rsKI0D1sspkNgvSd44XjAy\npdfgfStmL2XHVQRNUkH0FaJLcdi6rdNHK4czplCOQNNl8+uItX12jrE/QmcT0m4M\n7lFysS2pZRY8s5TBwuF4yucjNFsTyKdUTAfi+d+M9E4eOJ5cVOTik0OFJmWhHjV2\npa7ifqKR44iRZS0ZkCcsH+vWN6x3vCFxdtLlhPq5D9uAGHn704uKnWJlBr8trPtX\nbnKw2Q4kaVqmYc5BuNAcZ2EQxOeiQSwxj1DiEhXwxKkxk5N++h2Z8bdSb8HIOsX/\nwMWARKiGH7zvUy2eTzoWpzzpP6aIjHM+gysuw/PxWQKBgQDB4Yj6I6AYXnAyqUMi\n2OWq37mFUKIkwIgeab84eS6M8yOznQWdKNnLNa8452SVdLfTxoDuZ26yTPtpMx3v\nnkPVT9kG3CxfbjFe2YSTzfqas4WbrPZ6gpOU4p3B1hGgtmjqt0O6vYr1k13labnM\nW6Mwr3SIgoufDJvMw6t5k3q+qQKBgQC5KzYJeQ+52GMwTlqqo+eQ7TXnFhgo9io2\nYjqmej5rv6DpNzqeNTFlIbxWT64+tds4j96Uq66vE66OMagUpgFRdxNDsAt7/U34\nCw79lW/EnIioI2zxv7h97fW/GUcYDJ0F4bnR5dTBM2LgFRNew6Mf+MtZabKASdgA\nUWLd0Fn3WwKBgQCW6r47J9wI3AouBT9zMq6j8f5xXbC5Nv0930av6PRpVyHlQEcM\nbK4L1kAM5WGQTQiC2rOl3/F07SOOYfHdga5/ruXaxyvrJNVdZagjfWSjYzaPVXWP\nK3FBpZzzM3UJSrQkcH9SLxSp0Ap493FfN72xugHV+PhB2Ai2vWEPA9O58QKBgFkU\nWKKmAtK9LrqGd0ewIi6ub0gEcQsDobsX9m8wT+c2AQsw7po9rM2iNSCwpHq2sge7\n7rBHB3piVY9ChEGquueeCT5+6odzjJbPex6zTVmglH2OzVJfkTnDyH1ug60mJEQ4\nG1TG5FsthVuXyAHGzCsNXYZeOulMnQVKIe3j1eQRAoGAUzZTW1fqkk8t/HkWvuwa\nlBQQ2geEHggZtOqjwfnZN/Owag2XvN5SwRCWglWF6wrPkX90QQEiFxerWoJB340f\nlQJJpH/SHJ5pU03WljDosaCuMiL9ZsiufB87HKTIS2g91UzcnnS3gUroJkA2nh2h\nBox5eB3CJ7i4fSuxSgt6ZQo=\n-----END PRIVATE KEY-----\n"

    try {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            databaseURL: "https://kidland-5754b-default-rtdb.firebaseio.com",
            storageBucket: "kidland-5754b.appspot.com",
        });
    } catch (ex) {
        console.log(ex)
    }




    //  const Img = 'https://media.itscope.com/img/p/2Rtfp0SobLwvFrWehpjLZwrU7VdxDvXyQlpP1oq3v74=/aHR0cHM6Ly9pbmlzaG9wLmNvbS9pbWcvZ2FsbGVyeS84NjM2Nzg5Nl8xNTAwNjQwMTA0LmpwZw==?'
    const input = req.url.split('/')[2]
    var Img = input.split('-').join('/')
    var num = getRandom(5, 10000);
    const destination = `pix/image_${num}.jpg`
    // const uuid = uuid();
    var downloadLink = ''


    axios({
        method: 'GET',
        url: Img,
        responseType: 'stream'
    }).then(async response => {
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
                    res.json({ 'DownloadLink': downloadLink })
                })
            })
            .on('error', () => {
                console.log('error')
            })
    }).catch((err) => {
        console.log(err)
    })





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
         Info:cinf,
         Date:date
     })


    var EurInApi = cinf.rates.EUR;
    var intEur = EurInApi + 0;
    var cnvbase = 1 / intEur; // Eur * by cnvbase = usd value	
    var USdollar = Eur * cnvbase;
    var SEK = cinf.rates.SEK;
    var Krona = USdollar * SEK;
    return Krona.toString()
}

const priceByFire = async (cinf,Eur) => {
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

const stream = (req, res) => {
    return res.send("ok")
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






module.exports = {
    ImageProxy,
    WooParallel,
    currencyExchange,
    stream,
    Product_Update
}
