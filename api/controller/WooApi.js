const firebase = require('firebase')
const ProductsInfo = require('../data/ProductsV3.json')



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

    const Category = req.url.split('/')[2]
    var filtered = '', respArray = []
    // Ac Adapter
    if (Category.includes('-')) {
        var Arr = Category.split('-')
        Arr = Arr.map((Word) => FirstCapital(Word))
        filtered = Arr.join(' ')
    } else {
        filtered = FirstCapital(Category)
    }

    console.log(filtered)
    const Res = res
    firebase.database().ref(`category/${filtered}`)
        .once('value').then((res) => {
            res.forEach((item) => {
                let data = item.val()
                respArray.push(data)
            })
            console.log(respArray[0])
            return Res.json({ Count: respArray.length, Products: respArray })
        })
}

const FirstCapital = (Term) => {
    return Term.substring(0, 1).toUpperCase() + Term.substring(1, Term.length)
}



module.exports = {
    ByCategory,
    Categories,
    Info
}
