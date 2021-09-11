require('dotenv').config()
const express = require('express');
const app = express();
var http = require('http').Server(app);
// var io = require('socket.io')(http);

const cors = require('cors');
const bodyParser = require('body-parser')
const firebaseRouter = require('./api/routes/firebaseRouter')
const firebase = require('firebase')
const firebaseConfig = require('./api/config')
const WebSocketServer = require('websocket').server;
//const WooApi = require('../controller/WooApi')
var request = require('request')
// io.on('connection', function (socket) {
//     console.log('A new WebSocket connection has been established');
// });






console.log("start")

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }))
// app.use(bodyParser.json())
app.use(bodyParser.json({ limit: '50mb' }));


firebase.initializeApp(firebaseConfig)

app.use('/api', firebaseRouter)
app.use('/', express.static(__dirname + '/build'))

const port = process.env.PORT;


const server = app.listen(port)
server.setTimeout(1000 * 60 * 60 * 12);



console.log(`Server running on port: ${port}`)



const wsServer = new WebSocketServer({
    httpServer: server
});



// let REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
// let workQueue = new Queue('work', REDIS_URL);  //

var ProductReady = ''
var File, startIndex = 18, ResumeFrom = 0, TotalProducts = [], StreamCount = 0;

wsServer.on('connect', function (ws) {
    console.log("connected")
    app.ws = ws;

    app.get('/api/stream/:key/:resume', function (req, res) {

        console.log('Api Starts')
        console.log(req.params.key)
        console.log(req.params.resume)

        var proReadyCount = 0, resumeCount = req.params.resume
        var stream = request.get(`https://api.itscope.com/2.0/products/exports/${req.params.key}`).auth('m135172', 'GXBlezJK0n-I55K4RV_f0vHIRrFq_YcTNh9Yz735LJs', false)

        File = "", count = 1;
        stream.on('data', (chunk) => {
            // console.log(Buffer.from(chunk).toString())
            File += Buffer.from(chunk).toString()
        });


        ObserveSplit(0, 100000)

        //return res.send('ok')

        setInterval(() => {
            if (ProductReady !== '') {
                proReadyCount++
             //   console.log(`Product ready Count :: ${proReadyCount}`)
                if (proReadyCount >= resumeCount) ws.send(JSON.stringify(ProductReady))
                if (proReadyCount <= resumeCount) ws.send(JSON.stringify({ Skip: true }))
                ProductReady = ''
            }
        }, 500)


    })

})


wsServer.on('request', function (request) {
    const connection = request.accept(null, request.origin);
    connection.on('message', function (message) {
        console.log('Received Message:', message.utf8Data);
        // connection.sendUTF('Hi this is WebSocket server!');
    });
    connection.on('close', function (reasonCode, description) {
        console.log('Client has disconnected');
    });
});


const ObserveSplit = (start, end, ws) => {

    var listen = setInterval(() => {
        // console.log('observeSplitInterval')
        // console.log(`File:Length:: ${File.length}`)
        // console.log(`End :: ${end}`)

        if (File.length >= end) {
            // console.log('Length > End')
            splitStream(start, end)
            clearInterval(listen)
        }
    }, 1000)

}

const splitStream = async (start, end) => {

    // console.log(`start ${start}`)
    // console.log(`end ${start + 100000}`)

    //console.log(`File Length :: ${File.length}`)


    var ByteText = File.substring(start, start + 100000);
    // console.log("Length :: " + ByteText.length)
    //var ByteText = await Bytes.text()

    var i2 = getIndex(ByteText, "puid", 2)
    //console.log(i2)

    //console.log(`Resume From :: ${start + i2 - 100}`)
    // this.setState({ ResumeFrom: start + i2 - 100 })
    ResumeFrom = start + i2 - 100
    // console.log('res from 1:' + ResumeFrom)
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
        // console.log(`Nice :: ${ JSON.stringify(niceProduct)}`)
        ProductReady = niceProduct
        //TotalProducts.push(niceProduct)
        //StreamCount += 1
        //if (TotalProducts.length == 5) FireSave(TotalProducts)



        Resumify(File)

    } catch (ex) {
        // console.log(`Catch :: ${ex}`)
        Resumify(File)
    }

    //    console.log(this.state.ResumeFrom)
    // if (!this.state.Pause) this.Resumify(File)

}

Resumify = (File) => {
    console.log('Resumify')
    // console.log(`rs in splitstream ${ResumeFrom}`)
    //splitStream(ResumeFrom, ResumeFrom + 100000)
    ObserveSplit(ResumeFrom, ResumeFrom + 100000)

}

const getIndex = (string, subString, index) => {
    return string.split(subString, index).join(subString).length;
}
// app.use(function(req, res) {
//     res.header("Access-Control-Allow-Origin", "*");
//     res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
//     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
// });