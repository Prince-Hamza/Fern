
window.onload = (function () {
    if (window.location.href.includes('/product/')) {
        var specsInterv = setInterval(() => {
            var onceDone = false;
            if (document.getElementsByClassName('sku')[0]) {
                const Sku = document.getElementsByClassName('sku')[0].innerText;
                getSpecs(Sku)
                clearInterval(specsInterv)

                console.log('Specs Api')
            }
            var cc = document.getElementsByClassName('product-add-to-cart')
            if (cc[cc.length - 1]) {
                //alert(cc[2])
                for (let n = 0; n <= cc.length - 1; n++) {
                    cc[n].remove()

                }
            }

            var selectThin = document.getElementsByClassName('product_type_simple')
            if (selectThin[selectThin.length - 1]) {
                for (let x = 0; x <= selectThin.length - 1; x++) {
                    console.log(selectThin[x])
                    selectThin[x].remove()
                }
                if (onceDone == false) {
                    onceDone = true;
                    endify(cc, selectThin)
                }

            }


        }, 1000)

        async function getSpecs(Sku) {
            var spec = await fetch(`https://firewallforce.se/wp-json/wc/v3/productbysku?sku=${Sku}&consumer_key=ck_42a75ce7a233bc1e341e33779723c304e6d820cc&consumer_secret=cs_6e5a683ab5f08b62aa1894d8d2ddc4ad69ff0526`)
            var specjson = await spec.json()
            //console.log(`Product data :: ${JSON.stringify(specjson)}`)

            if (document.getElementById('HTML_SPEC').innerHtml === undefined) {
                var attribs = specjson.attributes, htmlSpex, Ean;
                attribs.forEach((attrib) => {
                    if (attrib.name == 'Html Specs') htmlSpex = attrib.options[0]
                    if (attrib.name == 'ean') Ean = attrib.options[0]
                })
                // alert(specjson.regular_price)
                //console.log(htmlSpex)
                var root = document.getElementById('HTML_SPEC')
                root.insertAdjacentHTML("afterend", htmlSpex);

                //document.getElementById('ean').value = Ean
                //eanBox.insertAdjacentHTML("afterend", Ean);

                Hider()

            }
        }

        function cartButtonMethod() {
            // alert("btnmethod")

            for (let x = 0; x <= 3; x++) {
                document.getElementById('cartbtn' + x).addEventListener("click", function () {
                    var inf = document.getElementById('inputinfo' + x.value)
                    alert("hi cart btn")
                    alert(inf)
                });
            }

        }


        function endify(cc, ss) {
            setTimeout(function () {

                try {
                    cc[cc.length - 1].remove();
                    ss[ss.length - 1].remove();
                }
                catch (ex) { console.log(ex) }


                var wrappers = document.getElementsByClassName('product-wrap')
                var Css = "margin-bottom:5px;border-style:none;outline:none;width:160px;height:34px;background-color:lightred;color:white;font:bold 14px arial";

                for (let num = 0; num <= 3; num++) {
                    wrappers[num].insertAdjacentHTML('afterend', `<button style=${Css} id = "cartbtn${num}" class="single_add_to_cart_button">
                        ADD TO CART</button>`);
                }

                cartButtonMethod()
            }, 2500)

        }


        function Hider() {
            var Found, FoundEan;
            var Attribz = document.getElementsByClassName('woocommerce-product-attributes-item__label');
            console.log('attrib length' + Attribz.length)
            for (let x = 0; x <= Attribz.length - 1; x++) {
                console.log(Attribz[x].innerHTML)
                if (Attribz[x].innerHTML.includes('Html Spec')) {
                    Found = x;
                    Attribz[x].style.display = 'none';
                }
                if (Attribz[x].innerHTML.includes('ean')) {
                    FoundEan = x;
                    Attribz[x].style.display = 'none';
                }
            }
            var AttribValz = document.getElementsByClassName('woocommerce-product-attributes-item__value');
            AttribValz[Found].style.display = 'none';
            AttribValz[FoundEan].style.display = 'none';
        }






    }
});
