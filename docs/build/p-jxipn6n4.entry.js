import{r as t,g as s}from"./p-80430b56.js";import{b as r,t as i}from"./p-b5e32d09.js";const h=class{constructor(s){t(this,s),this.mapper=t=>`${t}`}async componentWillLoad(){try{r.find(this.el,this.name).listen(t=>{try{this.value=this.mapper(t)}catch(s){i(this.el,s)}})}catch(t){i(this.el,t)}}render(){return this.value}get el(){return s(this)}};export{h as quantum_consumer};