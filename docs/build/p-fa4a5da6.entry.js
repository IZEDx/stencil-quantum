import{r as e,h as s,g as t}from"./p-d3a33f42.js";import"./p-4644e97c.js";import{d as o}from"./p-0fc88d37.js";const r=class{constructor(s){e(this,s)}personToGreet(e){console.log("New person to greet",e)}render(){if(this.match&&this.match.params.name)return s("section",{class:"section"},s("div",{class:"container"},s("h1",{class:"title"},"Hello ",s("quantum-display",{bind:o.get("personToGreet"),name:"",namespace:"",debug:!0}),"!"),s("p",null,"My name is ",(e=this.match.params.name)?e.substr(0,1).toUpperCase()+e.substr(1).toLowerCase():"",". My name was passed in through a route param!"),s("p",null,"Code of this page:"),s("img",{src:"/assets/profile-code.png"})));var e}get el(){return t(this)}};!function(e,s,t,o){var r,n=arguments.length,a=n<3?s:null===o?o=Object.getOwnPropertyDescriptor(s,t):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,s,t,o);else for(var p=e.length-1;p>=0;p--)(r=e[p])&&(a=(n<3?r(a):n>3?r(s,t,a):r(s,t))||a);n>3&&a&&Object.defineProperty(s,t,a)}([o.Observe("personToGreet")],r.prototype,"personToGreet",null);export{r as app_profile}