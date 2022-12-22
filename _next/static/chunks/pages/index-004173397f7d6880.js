(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[405],{248:function(e){e.exports=function(e){if(!e)throw Error("hashlru must have a max value, of type number, greater than 0");var r=0,t=Object.create(null),o=Object.create(null);function n(n,i){t[n]=i,++r>=e&&(r=0,o=t,t=Object.create(null))}return{has:function(e){return void 0!==t[e]||void 0!==o[e]},remove:function(e){void 0!==t[e]&&(t[e]=void 0),void 0!==o[e]&&(o[e]=void 0)},get:function(e){var r=t[e];return void 0!==r?r:void 0!==(r=o[e])?(n(e,r),r):void 0},set:function(e,r){void 0!==t[e]?t[e]=r:n(e,r)},clear:function(){t=Object.create(null),o=Object.create(null)}}}},5301:function(e,r,t){(window.__NEXT_P=window.__NEXT_P||[]).push(["/",function(){return t(4186)}])},4186:function(e,r,t){"use strict";t.r(r);var o=t(5893),n=t(7294),i=t(9008),a=t(3043),l=t.n(a);function s(e,r,t){return r in e?Object.defineProperty(e,r,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[r]=t,e}function c(e,r){return r||(r=e.slice(0)),Object.freeze(Object.defineProperties(e,{raw:{value:Object.freeze(r)}}))}function d(){var e=c(["w-fill border-t-2 border-b-2 border-gray-200 flex flex-col justify-center items-center text-gray-900 opacity-80"]);return d=function(){return e},e}function u(){var e=c(["w-fill h-screen border-t-2 border-b-2 border-gray-200 flex flex-col justify-center items-center text-gray-900 opacity-80"]);return u=function(){return e},e}function p(){var e=c(["text-blue-800"]);return p=function(){return e},e}function f(){var e=c(["text-blue-800 bg-gray-200 py-2 px-3 block-inline rounded-lg"]);return f=function(){return e},e}var b=l().div(d()),m=l().div(u()),g=l().span(p()),v=l().code(f()),h=[{title:"clone",prefix:"clone",sampleArgs:["amir-s/dev","https://github.com/facebook/react","git@github.com:vercel/next.js.git"],description:"clone a repository from a remote url to configured local path."},{title:"cd",prefix:"cd",sampleArgs:["amir-s/dev","fbreact","next"],description:"change current directory to a cloned repository."},{title:"up",prefix:"up",sampleArgs:[""],description:"install dependencies for the current project."},{title:"open pr",prefix:"open pr",sampleArgs:["","--new"],description:"open a browser to create a pull request for the current branch."},{title:"lan scan",prefix:"lan scan",sampleArgs:[""],description:"scan the local network for devices."},{title:"ps",prefix:"ps",sampleArgs:["-p","-u amir-s","-o github.com"],description:"list currently cloned git repositories."},{title:"ip",prefix:"ip",sampleArgs:[""],description:"get information about your ip address."},{title:"lan sync",prefix:"lan sync",sampleArgs:[". root@pi.local:/home/pi"],description:"sync a folder with a device on the local network recursively and continuously."},{title:"<command>",prefix:"",sampleArgs:["build","lint","custom-command","export","..."],description:"run a custom script for the current project."}],y=function(e){var r=e.title,t=e.description,i=e.sampleArgs,a=e.prefix,l=(0,n.useState)(0),s=l[0],c=l[1];return(0,n.useEffect)((function(){var e=setInterval((function(){c((function(e){return(e+1)%i.length}))}),1500);return function(){return clearInterval(e)}}),[]),(0,o.jsxs)("div",{className:"text-left self-stretch p-10",children:[(0,o.jsxs)("div",{className:"",children:["dev ",r]}),(0,o.jsx)("div",{className:"text-gray-600",children:t}),(0,o.jsx)("div",{className:"flex flex-col mt-4",children:(0,o.jsx)("div",{className:"text-gray-600",children:(0,o.jsxs)(v,{children:["$ dev ",a," ",i[s]]})})})]})};r.default=function(){return(0,o.jsxs)("div",{children:[(0,o.jsxs)(i.default,{children:[(0,o.jsx)("title",{children:"DEV"}),(0,o.jsx)("meta",{name:"description",content:"dev cli for mac"}),(0,o.jsx)("link",{rel:"icon",href:"/favicon.ico"})]}),(0,o.jsxs)("main",{className:"max-h-screen overflow-y-scroll snap snap-y snap-mandatory",children:[(0,o.jsxs)(m,{children:[(0,o.jsx)("h1",{className:"text-6xl mt-auto",children:"$ dev"}),(0,o.jsxs)("div",{className:"opacity-80 mt-2",children:["super simple javascript based cli; to do"," ",(0,o.jsx)(g,{children:"git clone"}),", ",(0,o.jsx)(g,{children:"cd"}),", and a few other things."]}),(0,o.jsx)("div",{className:"mt-8",children:(0,o.jsx)(v,{children:"npm i -g amir-s/dev"})}),(0,o.jsx)("div",{className:"opacity-60 mt-auto mb-10 pb-10",children:"\u25bd scroll down to see some examples"})]}),(0,o.jsx)(b,{children:h.map((function(e){return(0,o.jsx)(y,function(e){for(var r=1;r<arguments.length;r++){var t=null!=arguments[r]?arguments[r]:{},o=Object.keys(t);"function"===typeof Object.getOwnPropertySymbols&&(o=o.concat(Object.getOwnPropertySymbols(t).filter((function(e){return Object.getOwnPropertyDescriptor(t,e).enumerable})))),o.forEach((function(r){s(e,r,t[r])}))}return e}({},e),e.title)}))}),(0,o.jsx)(m,{children:(0,o.jsxs)("div",{className:"opacity-80 mt-2",children:["learn more at"," ",(0,o.jsx)(g,{children:(0,o.jsx)("a",{href:"https://github.com/amir-s/dev",children:"https://github.com/amir-s/dev"})})]})})]})]})}},9008:function(e,r,t){e.exports=t(3121)},518:function(e,r,t){"use strict";e.exports=t(4293)},4293:function(e,r,t){"use strict";Object.defineProperty(r,"__esModule",{value:!0});var o=function(e){return e&&"object"==typeof e&&"default"in e?e:{default:e}}(t(248));function n(){return n=Object.assign||function(e){for(var r=1;r<arguments.length;r++){var t=arguments[r];for(var o in t)Object.prototype.hasOwnProperty.call(t,o)&&(e[o]=t[o])}return e},n.apply(this,arguments)}function i(e){var r=function(e){var r=e.theme,t=e.prefix,o={nextPart:{},validators:[]};return function(e,r){return r?e.map((function(e){return[e[0],e[1].map((function(e){return"string"==typeof e?r+e:"object"==typeof e?Object.fromEntries(Object.entries(e).map((function(e){return[r+e[0],e[1]]}))):e}))]})):e}(Object.entries(e.classGroups),t).forEach((function(e){s(e[1],o,e[0],r)})),o}(e);return{getClassGroupId:function(e){var t=e.split("-");return""===t[0]&&1!==t.length&&t.shift(),a(t,r)||function(e){if(l.test(e)){var r=l.exec(e)[1],t=null==r?void 0:r.substring(0,r.indexOf(":"));if(t)return"arbitrary.."+t}}(e)},getConflictingClassGroupIds:function(r){return e.conflictingClassGroups[r]||[]}}}function a(e,r){var t;if(0===e.length)return r.classGroupId;var o=r.nextPart[e[0]],n=o?a(e.slice(1),o):void 0;if(n)return n;if(0!==r.validators.length){var i=e.join("-");return null==(t=r.validators.find((function(e){return(0,e.validator)(i)})))?void 0:t.classGroupId}}var l=/^\[(.+)\]$/;function s(e,r,t,o){e.forEach((function(e){if("string"!=typeof e){if("function"==typeof e)return e.isThemeGetter?void s(e(o),r,t,o):void r.validators.push({validator:e,classGroupId:t});Object.entries(e).forEach((function(e){s(e[1],c(r,e[0]),t,o)}))}else(""===e?r:c(r,e)).classGroupId=t}))}function c(e,r){var t=e;return r.split("-").forEach((function(e){void 0===t.nextPart[e]&&(t.nextPart[e]={nextPart:{},validators:[]}),t=t.nextPart[e]})),t}function d(e){return n({cache:(r=e.cacheSize,r>=1?o.default(r):{get:function(){},set:function(){}})},i(e));var r}var u=/\s+/,p=/:(?![^[]*\])/;function f(e,r){var t=r.getClassGroupId,o=r.getConflictingClassGroupIds,n=new Set;return e.trim().split(u).map((function(e){var r=e.split(p),o=r.pop(),n=o.startsWith("!"),i=n?o.substring(1):o,a=t(i);if(!a)return{isTailwindClass:!1,originalClassName:e};var l=0===r.length?"":r.sort().concat("").join(":");return{isTailwindClass:!0,modifier:n?"!"+l:l,classGroupId:a,originalClassName:e}})).reverse().filter((function(e){if(!e.isTailwindClass)return!0;var r=e.modifier,t=e.classGroupId,i=r+":"+t;return!n.has(i)&&(n.add(i),o(t).forEach((function(e){return n.add(r+":"+e)})),!0)})).reverse().map((function(e){return e.originalClassName})).join(" ")}function b(){for(var e=arguments.length,r=new Array(e),t=0;t<e;t++)r[t]=arguments[t];var o,n,i,a=l;function l(e){var t=r[0],l=r.slice(1).reduce((function(e,r){return r(e)}),t());return o=d(l),n=o.cache.get,i=o.cache.set,a=s,s(e)}function s(e){var r=n(e);if(r)return r;var t=f(e,o);return i(e,t),t}return function(){for(var e,r="",t=0;t<arguments.length;t+=1)(e=arguments[t])&&(r&&(r+=" "),r+=e);return a(r)}}function m(e){var r=function(r){return r[e]||[]};return r.isThemeGetter=!0,r}var g=/^\[(.+)\]$/,v=/^\d+\/\d+$/,h=new Set(["px","full","screen"]),y=/^(\d+)?(xs|sm|md|lg|xl)$/,x=/\d+(%|px|em|rem|vh|vw|pt|pc|in|cm|mm|cap|ch|ex|lh|rlh|vi|vb|vmin|vmax)/,w=/^-?((\d+)?\.?(\d+)[a-z]+|0)_-?((\d+)?\.?(\d+)[a-z]+|0)/;function j(e){return!Number.isNaN(Number(e))||h.has(e)||v.test(e)||k(e)}function k(e){var r,t=null==(r=g.exec(e))?void 0:r[1];return!!t&&(t.startsWith("length:")||x.test(t))}function z(e){var r,t=null==(r=g.exec(e))?void 0:r[1];return!!t&&t.startsWith("size:")}function O(e){var r,t=null==(r=g.exec(e))?void 0:r[1];return!!t&&t.startsWith("position:")}function N(e){var r,t=null==(r=g.exec(e))?void 0:r[1];return!!t&&(t.startsWith("url(")||t.startsWith("url:"))}function _(e){var r,t=null==(r=g.exec(e))?void 0:r[1];return!!t&&(!Number.isNaN(Number(t))||t.startsWith("number:"))}function A(e){var r,t=null==(r=g.exec(e))?void 0:r[1];return Number.isInteger(Number(t||e))}function C(e){return g.test(e)}function P(){return!0}function E(e){return y.test(e)}function G(e){var r,t=null==(r=g.exec(e))?void 0:r[1];return!!t&&w.test(t)}var T={__proto__:null,isLength:j,isArbitraryLength:k,isArbitrarySize:z,isArbitraryPosition:O,isArbitraryUrl:N,isArbitraryWeight:_,isInteger:A,isArbitraryValue:C,isAny:P,isTshirtSize:E,isArbitraryShadow:G};function I(){var e=m("colors"),r=m("spacing"),t=m("blur"),o=m("brightness"),n=m("borderColor"),i=m("borderRadius"),a=m("borderWidth"),l=m("contrast"),s=m("grayscale"),c=m("hueRotate"),d=m("invert"),u=m("gap"),p=m("gradientColorStops"),f=m("inset"),b=m("margin"),g=m("opacity"),v=m("padding"),h=m("saturate"),y=m("scale"),x=m("sepia"),w=m("skew"),T=m("space"),I=m("translate"),S=function(){return["auto",r]},M=function(){return["",j]},W=function(){return["auto",A]},$=function(){return["","0",C]};return{cacheSize:500,theme:{colors:[P],spacing:[j],blur:["none","",E,k],brightness:[A],borderColor:[e],borderRadius:["none","","full",E,k],borderWidth:M(),contrast:[A],grayscale:$(),hueRotate:[A],invert:$(),gap:[r],gradientColorStops:[e],inset:S(),margin:S(),opacity:[A],padding:[r],saturate:[A],scale:[A],sepia:$(),skew:[A,C],space:[r],translate:[r]},classGroups:{aspect:[{aspect:["auto","square","video",C]}],container:["container"],columns:[{columns:[E]}],"break-after":[{"break-after":["auto","avoid","all","avoid-page","page","left","right","column"]}],"break-before":[{"break-before":["auto","avoid","all","avoid-page","page","left","right","column"]}],"break-inside":[{"break-inside":["auto","avoid","avoid-page","avoid-column"]}],"box-decoration":[{"box-decoration":["slice","clone"]}],box:[{box:["border","content"]}],display:["block","inline-block","inline","flex","inline-flex","table","inline-table","table-caption","table-cell","table-column","table-column-group","table-footer-group","table-header-group","table-row-group","table-row","flow-root","grid","inline-grid","contents","list-item","hidden"],float:[{float:["right","left","none"]}],clear:[{clear:["left","right","both","none"]}],isolation:["isolate","isolation-auto"],"object-fit":[{object:["contain","cover","fill","none","scale-down"]}],"object-position":[{object:[].concat(["bottom","center","left","left-bottom","left-top","right","right-bottom","right-top","top"],[C])}],overflow:[{overflow:["auto","hidden","clip","visible","scroll"]}],"overflow-x":[{"overflow-x":["auto","hidden","clip","visible","scroll"]}],"overflow-y":[{"overflow-y":["auto","hidden","clip","visible","scroll"]}],overscroll:[{overscroll:["auto","contain","none"]}],"overscroll-x":[{"overscroll-x":["auto","contain","none"]}],"overscroll-y":[{"overscroll-y":["auto","contain","none"]}],position:["static","fixed","absolute","relative","sticky"],inset:[{inset:[f]}],"inset-x":[{"inset-x":[f]}],"inset-y":[{"inset-y":[f]}],top:[{top:[f]}],right:[{right:[f]}],bottom:[{bottom:[f]}],left:[{left:[f]}],visibility:["visible","invisible"],z:[{z:[j]}],basis:[{basis:[r]}],"flex-direction":[{flex:["row","row-reverse","col","col-reverse"]}],"flex-wrap":[{flex:["wrap","wrap-reverse","nowrap"]}],flex:[{flex:["1","auto","initial","none",C]}],grow:[{grow:$()}],shrink:[{shrink:$()}],order:[{order:["first","last","none",A]}],"grid-cols":[{"grid-cols":[P]}],"col-start-end":[{col:["auto",{span:[A]}]}],"col-start":[{"col-start":W()}],"col-end":[{"col-end":W()}],"grid-rows":[{"grid-rows":[P]}],"row-start-end":[{row:["auto",{span:[A]}]}],"row-start":[{"row-start":W()}],"row-end":[{"row-end":W()}],"grid-flow":[{"grid-flow":["row","col","row-dense","col-dense"]}],"auto-cols":[{"auto-cols":["auto","min","max","fr",C]}],"auto-rows":[{"auto-rows":["auto","min","max","fr",C]}],gap:[{gap:[u]}],"gap-x":[{"gap-x":[u]}],"gap-y":[{"gap-y":[u]}],"justify-content":[{justify:["start","end","center","between","around","evenly"]}],"justify-items":[{"justify-items":["start","end","center","stretch"]}],"justify-self":[{"justify-self":["auto","start","end","center","stretch"]}],"align-content":[{content:["start","end","center","between","around","evenly"]}],"align-items":[{items:["start","end","center","baseline","stretch"]}],"align-self":[{self:["auto","start","end","center","stretch","baseline"]}],"place-content":[{"place-content":[].concat(["start","end","center","between","around","evenly"],["stretch"])}],"place-items":[{"place-items":["start","end","center","stretch"]}],"place-self":[{"place-self":["auto","start","end","center","stretch"]}],p:[{p:[v]}],px:[{px:[v]}],py:[{py:[v]}],pt:[{pt:[v]}],pr:[{pr:[v]}],pb:[{pb:[v]}],pl:[{pl:[v]}],m:[{m:[b]}],mx:[{mx:[b]}],my:[{my:[b]}],mt:[{mt:[b]}],mr:[{mr:[b]}],mb:[{mb:[b]}],ml:[{ml:[b]}],"space-x":[{"space-x":[T]}],"space-x-reverse":["space-x-reverse"],"space-y":[{"space-y":[T]}],"space-y-reverse":["space-y-reverse"],w:[{w:["auto","min","max",r]}],"min-w":[{"min-w":["min","max","fit",j]}],"max-w":[{"max-w":["0","none","full","min","max","fit","prose",{screen:[E]},E,k]}],h:[{h:S()}],"min-h":[{"min-h":["min","max","fit",j]}],"max-h":[{"max-h":[r,"min","max","fit"]}],"font-size":[{text:["base",E,k]}],"font-smoothing":["antialiased","subpixel-antialiased"],"font-style":["italic","not-italic"],"font-weight":[{font:["thin","extralight","light","normal","medium","semibold","bold","extrabold","black",_]}],"font-family":[{font:[P]}],"fvn-normal":["normal-nums"],"fvn-ordinal":["ordinal"],"fvn-slashed-zero":["slashed-zero"],"fvn-figure":["lining-nums","oldstyle-nums"],"fvn-spacing":["proportional-nums","tabular-nums"],"fvn-fraction":["diagonal-fractions","stacked-fractons"],tracking:[{tracking:["tighter","tight","normal","wide","wider","widest",k]}],leading:[{leading:["none","tight","snug","normal","relaxed","loose",j]}],"list-style-type":[{list:["none","disc","decimal",C]}],"list-style-position":[{list:["inside","outside"]}],"placeholder-color":[{placeholder:[e]}],"placeholder-opacity":[{"placeholder-opacity":[g]}],"text-alignment":[{text:["left","center","right","justify"]}],"text-color":[{text:[e]}],"text-opacity":[{"text-opacity":[g]}],"text-decoration":["underline","overline","line-through","no-underline"],"text-decoration-style":[{decoration:[].concat(["solid","dashed","dotted","double","none"],["wavy"])}],"text-decoration-thickness":[{decoration:["auto","from-font",j]}],"underline-offset":[{"underline-offset":["auto",j]}],"text-decoration-color":[{decoration:[e]}],"text-transform":["uppercase","lowercase","capitalize","normal-case"],"text-overflow":["truncate","text-ellipsis","text-clip"],indent:[{indent:[r]}],"vertical-align":[{align:["baseline","top","middle","bottom","text-top","text-bottom","sub","super",k]}],whitespace:[{whitespace:["normal","nowrap","pre","pre-line","pre-wrap"]}],break:[{break:["normal","words","all"]}],content:[{content:["none",C]}],"bg-attachment":[{bg:["fixed","local","scroll"]}],"bg-clip":[{"bg-clip":["border","padding","content","text"]}],"bg-opacity":[{"bg-opacity":[g]}],"bg-origin":[{"bg-origin":["border","padding","content"]}],"bg-position":[{bg:[].concat(["bottom","center","left","left-bottom","left-top","right","right-bottom","right-top","top"],[O])}],"bg-repeat":[{bg:["no-repeat",{repeat:["","x","y","round","space"]}]}],"bg-size":[{bg:["auto","cover","contain",z]}],"bg-image":[{bg:["none",{"gradient-to":["t","tr","r","br","b","bl","l","tl"]},N]}],"bg-color":[{bg:[e]}],"gradient-from":[{from:[p]}],"gradient-via":[{via:[p]}],"gradient-to":[{to:[p]}],rounded:[{rounded:[i]}],"rounded-t":[{"rounded-t":[i]}],"rounded-r":[{"rounded-r":[i]}],"rounded-b":[{"rounded-b":[i]}],"rounded-l":[{"rounded-l":[i]}],"rounded-tl":[{"rounded-tl":[i]}],"rounded-tr":[{"rounded-tr":[i]}],"rounded-br":[{"rounded-br":[i]}],"rounded-bl":[{"rounded-bl":[i]}],"border-w":[{border:[a]}],"border-w-x":[{"border-x":[a]}],"border-w-y":[{"border-y":[a]}],"border-w-t":[{"border-t":[a]}],"border-w-r":[{"border-r":[a]}],"border-w-b":[{"border-b":[a]}],"border-w-l":[{"border-l":[a]}],"border-opacity":[{"border-opacity":[g]}],"border-style":[{border:[].concat(["solid","dashed","dotted","double","none"],["hidden"])}],"divide-x":[{"divide-x":[a]}],"divide-x-reverse":["divide-x-reverse"],"divide-y":[{"divide-y":[a]}],"divide-y-reverse":["divide-y-reverse"],"divide-opacity":[{"divide-opacity":[g]}],"divide-style":[{divide:["solid","dashed","dotted","double","none"]}],"border-color":[{border:[n]}],"border-color-x":[{"border-x":[n]}],"border-color-y":[{"border-y":[n]}],"border-color-t":[{"border-t":[n]}],"border-color-r":[{"border-r":[n]}],"border-color-b":[{"border-b":[n]}],"border-color-l":[{"border-l":[n]}],"divide-color":[{divide:[n]}],"outline-style":[{outline:[""].concat(["solid","dashed","dotted","double","none"],["hidden"])}],"outline-offset":[{"outline-offset":[j]}],"outline-w":[{outline:[j]}],"outline-color":[{outline:[e]}],"ring-w":[{ring:M()}],"ring-w-inset":["ring-inset"],"ring-color":[{ring:[e]}],"ring-opacity":[{"ring-opacity":[g]}],"ring-offset-w":[{"ring-offset":[j]}],"ring-offset-color":[{"ring-offset":[e]}],shadow:[{shadow:["","inner","none",E,G]}],"shadow-color":[{shadow:[P]}],opacity:[{opacity:[g]}],"mix-blend":[{"mix-blend":["normal","multiply","screen","overlay","darken","lighten","color-dodge","color-burn","hard-light","soft-light","difference","exclusion","hue","saturation","color","luminosity"]}],"bg-blend":[{"bg-blend":["normal","multiply","screen","overlay","darken","lighten","color-dodge","color-burn","hard-light","soft-light","difference","exclusion","hue","saturation","color","luminosity"]}],filter:[{filter:["","none"]}],blur:[{blur:[t]}],brightness:[{brightness:[o]}],contrast:[{contrast:[l]}],"drop-shadow":[{"drop-shadow":["","none",E,C]}],grayscale:[{grayscale:[s]}],"hue-rotate":[{"hue-rotate":[c]}],invert:[{invert:[d]}],saturate:[{saturate:[h]}],sepia:[{sepia:[x]}],"backdrop-filter":[{"backdrop-filter":["","none"]}],"backdrop-blur":[{"backdrop-blur":[t]}],"backdrop-brightness":[{"backdrop-brightness":[o]}],"backdrop-contrast":[{"backdrop-contrast":[l]}],"backdrop-grayscale":[{"backdrop-grayscale":[s]}],"backdrop-hue-rotate":[{"backdrop-hue-rotate":[c]}],"backdrop-invert":[{"backdrop-invert":[d]}],"backdrop-opacity":[{"backdrop-opacity":[g]}],"backdrop-saturate":[{"backdrop-saturate":[h]}],"backdrop-sepia":[{"backdrop-sepia":[x]}],"border-collapse":[{border:["collapse","separate"]}],"table-layout":[{table:["auto","fixed"]}],transition:[{transition:["none","all","","colors","opacity","shadow","transform",C]}],duration:[{duration:[A]}],ease:[{ease:["linear","in","out","in-out",C]}],delay:[{delay:[A]}],animate:[{animate:["none","spin","ping","pulse","bounce",C]}],transform:[{transform:["","gpu","none"]}],scale:[{scale:[y]}],"scale-x":[{"scale-x":[y]}],"scale-y":[{"scale-y":[y]}],rotate:[{rotate:[A,C]}],"translate-x":[{"translate-x":[I]}],"translate-y":[{"translate-y":[I]}],"skew-x":[{"skew-x":[w]}],"skew-y":[{"skew-y":[w]}],"transform-origin":[{origin:["center","top","top-right","right","bottom-right","bottom","bottom-left","left","top-left",C]}],accent:[{accent:["auto",e]}],appearance:["appearance-none"],cursor:[{cursor:["auto","default","pointer","wait","text","move","help","not-allowed","none","context-menu","progress","cell","crosshair","vertical-text","alias","copy","no-drop","grab","grabbing","all-scroll","col-resize","row-resize","n-resize","e-resize","s-resize","w-resize","ne-resize","nw-resize","se-resize","sw-resize","ew-resize","ns-resize","nesw-resize","nwse-resize","zoom-in","zoom-out",C]}],"caret-color":[{caret:[e]}],"pointer-events":[{"pointer-events":["none","auto"]}],resize:[{resize:["none","y","x",""]}],"scroll-behavior":[{scroll:["auto","smooth"]}],"scroll-m":[{"scroll-m":[r]}],"scroll-mx":[{"scroll-mx":[r]}],"scroll-my":[{"scroll-my":[r]}],"scroll-mt":[{"scroll-mt":[r]}],"scroll-mr":[{"scroll-mr":[r]}],"scroll-mb":[{"scroll-mb":[r]}],"scroll-ml":[{"scroll-ml":[r]}],"scroll-p":[{"scroll-p":[r]}],"scroll-px":[{"scroll-px":[r]}],"scroll-py":[{"scroll-py":[r]}],"scroll-pt":[{"scroll-pt":[r]}],"scroll-pr":[{"scroll-pr":[r]}],"scroll-pb":[{"scroll-pb":[r]}],"scroll-pl":[{"scroll-pl":[r]}],"snap-align":[{snap:["start","end","center","align-none"]}],"snap-stop":[{snap:["normal","always"]}],"snap-type":[{snap:["none","x","y","both"]}],"snap-strictness":[{snap:["mandatory","proximity"]}],touch:[{touch:["auto","none","pinch-zoom","manipulation",{pan:["x","left","right","y","up","down"]}]}],select:[{select:["none","text","all","auto"]}],"will-change":[{"will-change":["auto","scroll","contents","transform",C]}],fill:[{fill:[e]}],"stroke-w":[{stroke:[j]}],stroke:[{stroke:[e]}],sr:["sr-only","not-sr-only"]},conflictingClassGroups:{overflow:["overflow-x","overflow-y"],overscroll:["overscroll-x","overscroll-y"],inset:["inset-x","inset-y","top","right","bottom","left"],"inset-x":["right","left"],"inset-y":["top","bottom"],flex:["basis","grow","shrink"],"col-start-end":["col-start","col-end"],"row-start-end":["row-start","row-end"],gap:["gap-x","gap-y"],p:["px","py","pt","pr","pb","pl"],px:["pr","pl"],py:["pt","pb"],m:["mx","my","mt","mr","mb","ml"],mx:["mr","ml"],my:["mt","mb"],"font-size":["leading"],"fvn-normal":["fvn-ordinal","fvn-slashed-zero","fvn-figure","fvn-spacing","fvn-fraction"],"fvn-ordinal":["fvn-normal"],"fvn-slashed-zero":["fvn-normal"],"fvn-figure":["fvn-normal"],"fvn-spacing":["fvn-normal"],"fvn-fraction":["fvn-normal"],rounded:["rounded-t","rounded-r","rounded-b","rounded-l","rounded-tl","rounded-tr","rounded-br","rounded-bl"],"rounded-t":["rounded-tl","rounded-tr"],"rounded-r":["rounded-tr","rounded-br"],"rounded-b":["rounded-br","rounded-bl"],"rounded-l":["rounded-tl","rounded-bl"],"border-w":["border-w-t","border-w-r","border-w-b","border-w-l"],"border-w-x":["border-w-r","border-w-l"],"border-w-y":["border-w-t","border-w-b"],"border-color":["border-color-t","border-color-r","border-color-b","border-color-l"],"border-color-x":["border-color-r","border-color-l"],"border-color-y":["border-color-t","border-color-b"],"scroll-m":["scroll-mx","scroll-my","scroll-mt","scroll-mr","scroll-mb","scroll-ml"],"scroll-mx":["scroll-mr","scroll-ml"],"scroll-my":["scroll-mt","scroll-mb"],"scroll-p":["scroll-px","scroll-py","scroll-pt","scroll-pr","scroll-pb","scroll-pl"],"scroll-px":["scroll-pr","scroll-pl"],"scroll-py":["scroll-pt","scroll-pb"]}}}var S=b(I);function M(e,r){for(var t in r)D(e,t,r[t]);return e}var W=Object.prototype.hasOwnProperty,$=new Set(["string","number","boolean"]);function D(e,r,t){if(W.call(e,r)&&!$.has(typeof t)&&null!==t){if(Array.isArray(t)&&Array.isArray(e[r]))e[r]=e[r].concat(t);else if("object"==typeof t&&"object"==typeof e[r]){if(null===e[r])return void(e[r]=t);for(var o in t)D(e[r],o,t[o])}}else e[r]=t}r.createTailwindMerge=b,r.extendTailwindMerge=function(e){for(var r=arguments.length,t=new Array(r>1?r-1:0),o=1;o<r;o++)t[o-1]=arguments[o];return b.apply(void 0,"function"==typeof e?[I,e].concat(t):[function(){return M(I(),e)}].concat(t))},r.fromTheme=m,r.getDefaultConfig=I,r.mergeConfigs=M,r.twMerge=S,r.validators=T},7824:function(e,r){"use strict";Object.defineProperty(r,"__esModule",{value:!0});r.default=["a","abbr","address","area","article","aside","audio","b","base","bdi","bdo","big","blockquote","body","br","button","canvas","caption","cite","code","col","colgroup","data","datalist","dd","del","details","dfn","dialog","div","dl","dt","em","embed","fieldset","figcaption","figure","footer","form","h1","h2","h3","h4","h5","h6","head","header","hgroup","hr","html","i","iframe","img","input","ins","kbd","keygen","label","legend","li","link","main","map","mark","menu","menuitem","meta","meter","nav","noscript","object","ol","optgroup","option","output","p","param","picture","pre","progress","q","rp","rt","ruby","s","samp","script","section","select","small","source","span","strong","style","sub","summary","sup","table","tbody","td","textarea","tfoot","th","thead","time","title","tr","track","u","ul","var","video","wbr","circle","clipPath","defs","ellipse","foreignObject","g","image","line","linearGradient","marker","mask","path","pattern","polygon","polyline","radialGradient","rect","stop","svg","text","tspan"]},3043:function(e,r,t){"use strict";var o=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(r,"__esModule",{value:!0}),r.default=void 0;const n=o(t(7904));r.default=n.default},7904:function(e,r,t){"use strict";var o=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(r,"__esModule",{value:!0}),r.cleanTemplate=r.mergeArrays=void 0;const n=o(t(7294)),i=o(t(7824)),a=t(518),l=Symbol("isTwElement?");r.mergeArrays=(e,r)=>e.reduce(((e,t,o)=>e.concat(t||[],r[o]||[])),[]);r.cleanTemplate=(e,r="")=>{const t=e.join(" ").trim().replace(/\n/g," ").replace(/\s{2,}/g," ").split(" ").filter((e=>","!==e)),o=r?r.split(" "):[];return(0,a.twMerge)(...t.concat(o).filter((e=>" "!==e)))};const s=([e])=>"$"!==e.charAt(0),c=e=>(t,...o)=>{const i=n.default.forwardRef((({$as:i,...a},c)=>{const d=i||e,u=!0===d[l]?a:Object.fromEntries(Object.entries(a).filter(s));return n.default.createElement(d,{...u,ref:c,className:(0,r.cleanTemplate)((0,r.mergeArrays)(t,o.map((e=>e({...a,$as:i})))),a.className)})}));return i[l]=!0,i.displayName="string"!==typeof e?e.displayName||e.name||"tw.Component":"tw."+e,i},d=i.default.reduce(((e,r)=>({...e,[r]:c(r)})),{}),u=Object.assign(c,d);r.default=u}},function(e){e.O(0,[774,888,179],(function(){return r=5301,e(e.s=r);var r}));var r=e.O();_N_E=r}]);