(this.webpackJsonpview=this.webpackJsonpview||[]).push([[0],{26:function(e,t,n){},27:function(e,t,n){},29:function(e){e.exports=JSON.parse("{}")},55:function(e,t,n){"use strict";n.r(t);var s=n(3),c=n.n(s),r=n(21),o=n.n(r),a=(n(26),n.p,n(27),n(2)),u=n.n(a),i=n(4),l=n(5),p=n(6),f=n(9),d=n(8),h=(n(29),n(0));s.Component;var g=n(7),m=(n(31),n(34),n(53),0),v=[],b=function(e){Object(f.a)(n,e);var t=Object(d.a)(n);function n(){var e;return Object(l.a)(this,n),(e=t.call(this)).getFileContext=function(t){var n=t.target.files[0];e.splitStream(n,0,1e5)},e.splitStream=function(){var t=Object(i.a)(u.a.mark((function t(n,s,c){var r,o,a,i;return u.a.wrap((function(t){for(;;)switch(t.prev=t.next){case 0:if(!(c<=n.size)){t.next=11;break}return r=n.slice(s,c),t.next=4,r.text();case 4:o=t.sent,a=e.getIndex(o,"puid",2),e.setState({ResumeFrom:s+a-100}),i=o.split("\n"),e.ReadRow2(n,i),t.next=13;break;case 11:console.log("Finished Processing File"),e.setState({progressInstance:"Finished Processing File"});case 13:case"end":return t.stop()}}),t)})));return function(e,n,s){return t.apply(this,arguments)}}(),e.ReadRow2=function(){var t=Object(i.a)(u.a.mark((function t(n,s){var c,r,o,a,i,l;return u.a.wrap((function(t){for(;;)switch(t.prev=t.next){case 0:for(c="",-1,r=!1,o=0,a=0;a<=s.length-1;a++)s[a].includes("puid")&&(r=!0),r&&(s[a].includes("puid")&&(o+=1),1==o&&(i=s[a].includes("puid")?"{"+s[a]:s[a],c+=i),2==o&&(r=!1,c=c.substring(0,c.length-3)));try{l=JSON.parse(c),e.UpdateProduct(l,n)}catch(u){console.log("Catch :: ".concat(u)),e.Resumify(n)}case 3:case"end":return t.stop()}}),t)})));return function(e,n){return t.apply(this,arguments)}}(),e.Resumify=function(t){e.splitStream(t,e.state.ResumeFrom,e.state.ResumeFrom+1e6)},e.UpdateProduct=function(){var t=Object(i.a)(u.a.mark((function t(n,s){return u.a.wrap((function(t){for(;;)switch(t.prev=t.next){case 0:v.push(n),5==v.length?(console.log("5 products bundled"),e.Fetch(v),setInterval((function(){5==e.state.SequenceCount&&(console.log("5 products uploaded"),v=[],e.setState({SequenceCount:0}),e.Resumify(s))}),1e3)):(console.log("Resume: Products "),e.Resumify(s));case 2:case"end":return t.stop()}}),t)})));return function(e,n){return t.apply(this,arguments)}}(),e.Fetch=function(t){e.ParseImages(t),console.log("Status :: Sending:Request");var n=Object(g.a)(e);fetch("https://firewallforce.se/wp-json/wc/v3/postify?",{method:"POST",body:JSON.stringify({info:t}),headers:{Authorization:"Basic"+btoa("ck_42a75ce7a233bc1e341e33779723c304e6d820cc:cs_6e5a683ab5f08b62aa1894d8d2ddc4ad69ff0526"),"Content-Type":"application/json"}}).then((function(t){t.text().then((function(t){return m+=5,console.log("resp :: ".concat(JSON.stringify(t))),console.log("Products :: ".concat(m)),n.setState({progressInstance:m,SequenceCount:e.state.SequenceCount+=5}),t}))})).catch((function(t){console.log("@safe!"),m+=5,n.setState({progressInstance:m,SequenceCount:e.state.SequenceCount+=5})}))},e.ParseImages=function(e){e.forEach((function(e){var t=[];e.hasOwnProperty("mediaContents")&&(e.mediaContents.forEach((function(e){if(e.value.includes("img")){var n=e.value.split("/").join("*");n=n.split("&").join("^"),t.push(n)}})),e.images=t,t=[])}))},e.streamSlice=function(){var t=Object(i.a)(u.a.mark((function t(n,s,c){var r,o,a,i;return u.a.wrap((function(t){for(;;)switch(t.prev=t.next){case 0:return r=n.slice(s,c),t.next=3,r.text();case 3:return o=t.sent,a=e.getProduct(o,s),e.state.Products.push(a),e.setState({Products:e.state.Products,counter:e.state.counter+1}),i=n.slice(e.state.ResumeFrom,3),t.next=10,i.text();case 10:t.sent;case 11:case"end":return t.stop()}}),t)})));return function(e,n,s){return t.apply(this,arguments)}}(),e.getProduct=function(t,n){var s=e.getIndex(t,"puid",2);e.setState({ResumeFrom:s});var c=t.substring(n-9,s);console.log(c);var r=c.substring(0,c.length-9),o=JSON.parse(r);return console.log(o),o},e.nodechecker=function(){},e.state={ResumeFrom:-1,Products:[],counter:0,progressInstance:0,Pause:!1,SequenceCount:!1},e}return Object(p.a)(n,[{key:"getIndex",value:function(e,t,n){return e.split(t,n).join(t).length}},{key:"render",value:function(){var e=this;return Object(h.jsxs)("div",{children:[Object(h.jsx)("input",{type:"file",onChange:function(t){e.getFileContext(t)}}),Object(h.jsxs)("h5",{children:[" ",this.state.progressInstance," "]})]})}}]),n}(s.Component);var j=function(){return Object(h.jsx)("div",{className:"App",children:Object(h.jsx)(b,{})})},S=function(e){e&&e instanceof Function&&n.e(3).then(n.bind(null,57)).then((function(t){var n=t.getCLS,s=t.getFID,c=t.getFCP,r=t.getLCP,o=t.getTTFB;n(e),s(e),c(e),r(e),o(e)}))};n(54);o.a.render(Object(h.jsx)(c.a.StrictMode,{children:Object(h.jsx)(j,{})}),document.getElementById("root")),S()}},[[55,1,2]]]);
//# sourceMappingURL=main.d18c227b.chunk.js.map