var Interface={extend:function(b){for(var a in this){if(!b.hasOwnProperty(a)){b[a]=this[a]}}return b}};var Api={isInited:false,init:null,extend:function(){var b=[this].concat(Array.prototype.slice.call(arguments));var c=b.pop(),d;while(d=b.pop()){for(var a in d){if(!c.hasOwnProperty(a)&&(!b.length||a!="extend")){c[a]=d[a]}}}return c}};var Loadable=Interface.extend({requestMethod:"post",responseType:"json",controller:"url/uri",receiver:function(a,b){},requestMapper:function(a){return a},responseMapper:function(a,b){return a},loadStart:function(a){},loadEnd:function(a,b){},responceMock:[],load:function(b,d){var a=this;function c(e){e=a.responseMapper(e,b);a.receiver(e,b);d&&d.call(a,e,b);a.loadEnd(e,b)}if(a.responceMock.length){response=a.responseMapper(response,b);c(response)}else{$[a.requestMethod](a.controller,a.requestMapper(b)||{},c,a.responseType);a.loadStart(b)}return a}});var Val=Interface.extend({inputId:null,getValueMapper:function(){},get$input:function(){return $(document.getElementById(this.inputId))
},getValue:function(){return this.get$input().val()},setValue:function(a){this.get$input().val(a);return this},val:function(a){if(!arguments.length){return this.getValue()}return this.setValue(a)}});var ListVal=Val.extend({listValSplitter:",",getValue:function(){var a=Val.getValue.call(this);return a?a.split(this.listValSplitter):[]},setValue:function(a){Val.setValue.call(this,a.join(this.listValSplitter))},hasVal:function(a){return -1!=$.inArray(a,this.val())},addVal:function(b){var a=this.val();a.push(b);return this.val(a)},removeVal:function(c){var b=this.val();var a=$.inArray(c,b);b.splice(a,1);return this.val(b)},toggleVal:function(a){this[this.hasVal(a)?"removeVal":"addVal"](a)}});var List=Api.extend({$ul:null,make$item:function(a){return $("<li>").text(a.text)},fill:function(a){var b=this;b.$ul.empty();$.each(a||[],function(){b.make$item(this).appendTo(b.$ul)});return b}});var LoadableTree=List.extend(Loadable,{isRoot:true,click:function(c,a,b){},hasChildren:function(a){return a.hasChildren
},make$list:function(){return $("<ul>").addClass("treeList")},make$itemContent:function(a){return $(document.createTextNode(a.text))},load:function(b,c){if(b&&b.children){var a=b.children;this.receiver(a);c&&c.call(this,a,b)}else{Loadable.load.call(this,b,c)}return this},make$item:function(a){var c=this;var b=$('<li class="closed"><span><i></i><a href="javascript://"></a></span></li>');b.find("a:first").append(c.make$itemContent(a));if(this.isRoot){b.children("span").addClass("liRoot")}if(c.hasChildren(a)){b.addClass("liHasChild").find("span:first").addClass("clop");var d=c.make$list(a);b.data("api",c.extend({isRoot:false,$ul:d}));b.append(d)}else{b.find("span").addClass("noHasChild")}b.children("span").click(function(e){if(b.hasClass("liHasChild")){b.toggleClass("closed");if(!b.hasClass("loaded")){b.data("api").load(a,function(){b.removeClass("loading").addClass("loaded")});b.addClass("loading")}}c.click(e,a,b)});return b},fill:function(a){List.fill.call(this,a);this.$ul.children("li:last").addClass("liLast");
return this}});var Shadow=Api.extend({_counter:0,show:function(){if(1==++this._counter){var a=$(document).height();$("#shadowWrap").height(a).show()}},hide:function(){if(0==--this._counter){var a=$(document).height();$("#shadowWrap").height(a).hide()}}});