import{r as t,c as s,h as i,g as h}from"./p-d3a33f42.js";import{P as o,t as l}from"./p-4644e97c.js";const r=class{constructor(i){t(this,i),this.value=s(this,"value",7)}async componentWillLoad(){var t,s,i,h,r,n;try{this.name=null!==(i=null!==(s=null===(t=this.bind)||void 0===t?void 0:t.name)&&void 0!==s?s:this.name)&&void 0!==i?i:"",this.namespace=null!==(r=null===(h=this.bind)||void 0===h?void 0:h.namespace)&&void 0!==r?r:this.namespace,this.debug=(null===(n=this.bind)||void 0===n?void 0:n.debug)||this.debug,o.find(this.el,this.name,this.namespace,this.debug).listen((t=>{try{this.value.emit(t)}catch(t){l(this.el,t)}}),!0)}catch(t){l(this.el,t)}}render(){return i("slot",null)}get el(){return h(this)}};export{r as quantum_consumer}