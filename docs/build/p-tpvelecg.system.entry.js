System.register(["./p-b7289059.system.js","./p-125abd3c.system.js"],(function(e){"use strict";var t,r,n,o;return{setters:[function(e){t=e.r;r=e.h;n=e.g},function(e){o=e.P}],execute:function(){var u=e("quantum_provider",function(){function e(e){t(this,e)}e.prototype.componentWillLoad=function(){this.provider=o.create(this.el,this.name,this.value)};e.prototype.onValue=function(e){this.provider.provide(e)};e.prototype.render=function(){return r("slot",null)};Object.defineProperty(e.prototype,"el",{get:function(){return n(this)},enumerable:true,configurable:true});Object.defineProperty(e,"watchers",{get:function(){return{value:["onValue"]}},enumerable:true,configurable:true});return e}())}}}));