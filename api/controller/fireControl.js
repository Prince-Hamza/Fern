// const Event = require('../models/Events')
// const Devicez = require('../models/Devices')

const firebase = require('firebase')

const getInfo = async (req, res) => {

    let devId = req.url.split('/')[1]
    console.log(`${devId}`)

    firebase.database().ref('/test').set({ success: 'waaoo' })
    return res.json({ success: true })

}

const Once = async (req , res) => {
    let Ref = req.url.split('/')[2]
    console.log(Ref)
    const info = await firebase.database().ref(Ref).once('value')
    return res.json(info)
    
}

const OnceArrray = async (req , res) => {
    let Ref = req.url.split('/')[2]
    const resp = await firebase.database().ref(Ref).once('value')
    var Set = []
    resp.forEach(item => {
        Set.push(item.val())
    })
    return res.send(Set)

}



module.exports = {
    getInfo,
    Once,
    OnceArrray
}
