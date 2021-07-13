const firebase = require('firebase')
const ProductsInfo = require('../data/ProductsV3.json')



const emailInfo = async (req,res) => {
   var resp = await firebase.database().ref('/EmailApi').once('value')
   var ar = []
   resp.forEach((item)=>{
     ar.push(item.val())
   })
   console.log('okokok')
   res.send(ar)
}


const ByCategory = async (req, res) => {

    var count = 0
    ProductsInfo.products.forEach((Product) => {
        let productCat = Product.categories[0]
        firebase.database().ref(`/category/${productCat}`).push(Product)
        count++
        console.log(`Saved To Firebase :: ${count}`)
    })

    console.log('Success')

    return res.json({ Success: true })
}





const Info = (req, res) => {
    const Category = req.url.split('/')[2]
    const categoryFiltered = Category.substring(0, 1).toUpperCase() + Category.substring(1, Category.length)
    var c = 0
    firebase.database().ref(`/category/${categoryFiltered}`)
        .once('value', (resp) => {
            resp.forEach(item => {
                c++
            })
            return res.send(`<h5>Category:${categoryFiltered}  ______________________________ Products:${c}</h5>`)
        })
}

const Categories = async (req, res) => {
    const CK = `consumer_key=ck_42a75ce7a233bc1e341e33779723c304e6d820cc`
    const CS = `consumer_secret=cs_6e5a683ab5f08b62aa1894d8d2ddc4ad69ff0526`
    const Api = `https://firewallforce.se/wc-api/v3/products?filter[limit]=5&filter[category]=cable&page=1`

    fetch(`${Api}&${CK}&${CS}`).then((resp) => {
        resp.json().then((res) => {
            console.log(res)
            return res.json(res)
        })
    })


}







const FirstCapital = (Term) => {
    return Term.substring(0, 1).toUpperCase() + Term.substring(1, Term.length)
}



module.exports = {
    ByCategory,
    Categories,
    Info,
    emailInfo
}
