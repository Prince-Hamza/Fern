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

const SignUp = async (req,res) => {
    
    const input = req.url.split('/')[2]
    const array = input.split('&')
    const EmailParam = array[0] , PassParam = array[1]
    const Email = EmailParam.split('=')[1] , Pass = PassParam.split('=')[1]


   try {
       const userId = await FireSignUp(Email,Pass)
       res.json({UserId:userId , Mesage:'User Created Successfully'})
   } catch (ex) {
       res.send(ex)
   }
  
}

const SignIn = async (req,res) => {

    const input = req.url.split('/')[2]
    const array = input.split('&')
    const EmailParam = array[0] , PassParam = array[1]
    const Email = EmailParam.split('=')[1] , Pass = PassParam.split('=')[1]


    try {
        const userid = await FireSignIn(Email,Pass)
        res.json({Message:'Sign In Successful' , UserId: userid})
    } catch (ex) {
        res.send(ex)
    }
    
}


const FireSignUp = async (Email , Password) => {
    const response = await firebase.auth().createUserWithEmailAndPassword(Email, Password);
    const Id = response.user.uid
    console.log ('Response :: ' + Id);
    return Id 
  }

const FireSignIn = async (Email,Password) => {
  const response = await firebase.auth().signInWithEmailAndPassword(Email, Password);
  const Id = response.user.uid
  console.log('Resp : ' + Id);
  return Id
}



module.exports = {
    getInfo,
    Once,
    OnceArrray,
    SignUp,
    SignIn
}
