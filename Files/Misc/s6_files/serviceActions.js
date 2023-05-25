function descriptorTarget(a,c){var b=c?/\[(0|[1-9]\d*)\]/.exec(c):false;if(b){a=a.replace(/\[\]/,"["+b[1]+"]")}return $("<div/>").attr("name",a)}var changeValue=function(b,c,a){if(!a){var d=$(document.getElementById(b));d.val(c)}else{var d=descriptorTarget(b,a);d.descriptor("setAttribute","value",c)}};var changeReadonly=function(c,a,b){if(!b){var d=$(document.getElementById(c));d.attr("readonly",a)}else{var d=descriptorTarget(c,b);d.descriptor("setAttribute","readonly",a)}};var changeVisibility=function(b,a,c){if(a=="show"){$.each(b,function(){$(this).fadeIn(c)})}else{if(a=="hide"){$.each(b,function(){$(this).fadeOut(c)})}}};var changeVisibilityByCheckbox=function(b,d,c,a){if(d.checked){if(a){$.each(b,function(){$(this).fadeOut(c)})}else{$.each(b,function(){$(this).fadeIn(c)})}}else{if(!d.checked){if(a){$.each(b,function(){$(this).fadeIn(c)})}else{$.each(b,function(){$(this).fadeOut(c)})}}}};var toggleVisibility=function(a,b){$.each(a,function(){if($(this).css("display")=="none"){$(this).fadeIn(b)
}else{$(this).fadeOut(b)}})};var instantChangeVisibility=function(b,a){if(a=="show"){$.each(b,function(){$(this).css("display","")})}else{if(a=="hide"){$.each(b,function(){$(this).css("display","none")})}}};var instantToggleVisibility=function(a){$.each(a,function(){if($(this).css("display")=="none"){$(this).css("display","")}else{$(this).css("display","none")}})};var currentCloneCounter=1;var removeCloneSection=function(h,p,g,o,n){p=p.replace(/[#;&,\.\+\*~':"!\^\$\[\]\(\)=>|\/\\]/g,"\\$&");var m="#"+h;var k="."+o;var j=-1;var b=$("#"+p).attr("name").match(/(\w+[\.\w+]+)\[(\d+)\]/);if(b!=null&&b.length>0){j=b[2]}var e=$("#"+p).parents().find("."+g+"Processed-"+j);e.remove();for(var l=(j+1);l<currentCloneCounter;l++){var d=$("."+g+"Processed-"+l);d.find(k).each(function(){var r=$(this).attr("name").match(/(\w+[\.\w+]+)\[(\d+)\]/);if(r!=null&&r.length>0){var s=r[1]+"["+(parseInt(r[2]))+"]-err";var q=r[1]+"["+(parseInt(r[2])-1)+"]-err";var i=r[1]+"["+(parseInt(r[2])-1)+"]";$(this).attr("name",i).attr("id",i);
var t=d.find("#"+s.replace(/[#;&,\.\+\*~':"!\^\$\[\]\(\)=>|\/\\]/g,"\\$&"));t.attr("id",q)}});d.removeClass(g+"Processed-"+l);d.addClass(g+"Processed-"+(l-1));d.find(".clonebutton").each(function(){var q=$("A",this).attr("id").match(/(\w+[\.\w+]+)\[(\d+)\]([-\w]*)/);if(q!=null&&q.length>0){var r=parseInt(q[2]);var i=q[1]+"["+(r-1)+"]"+q[3];$("A",this).attr("name",i).attr("id",i)}})}var f=$("."+g);f.find(k).each(function(){var r=$(this).attr("name").match(/(\w+[\.\w+]+)\[(\d+)\]/);if(r!=null&&r.length>0){var s=r[1]+"["+(parseInt(r[2]))+"]-err";var q=r[1]+"["+(parseInt(r[2])-1)+"]-err";var i=r[1]+"["+(parseInt(r[2])-1)+"]";$(this).attr("name",i).attr("id",i);var t=f.find("#"+s.replace(/[#;&,\.\+\*~':"!\^\$\[\]\(\)=>|\/\\]/g,"\\$&"));t.attr("id",q)}});f.find(".clonebutton").each(function(){var q=$("A",this).attr("id").match(/(\w+[\.\w+]+)\[(\d+)\]([-\w]*)/);if(q!=null&&q.length>0){var r=parseInt(q[2]);var i=q[1]+"["+(r-1)+"]"+q[3];$("A",this).attr("name",i).attr("id",i)}});currentCloneCounter--;
if(currentCloneCounter<n){$(m).css("visibility","visible");var a=0;var c=$(m).parent();while(c.is("div")!=true){c=c.parent();a++;if(a>5){break}}c.css("visibility","visible")}};var cloneFormRowWithArrays=function(d,t,n,p,q){currentCloneCounter++;var o="."+t+(q?"":":last");var c="."+t+":last";var r="."+n;var h="#"+d;var f=$(h).parents().find(o);var u=f.clone(true);u.find(":input").each(function(){$(this).val("")});var e="";var l=[];u.find(r).each(function(){if($(this).attr("name")){$(this).unbind();var x=$(this).attr("name").match(/(\w+[\.\w+]+)\[(\d+)\]([-\w]*)/);if(x!=null&&x.length>0){e=parseInt(x[2]);var y=x[1]+"["+e+"]-err";var w=x[1]+"["+(e+1)+"]-err";var i=x[1]+"["+(e+1)+"]"+x[3];$(this).attr("name",i).attr("id",i);var z=u.find("#"+y.replace(/[#;&,\.\+\*~':"!\^\$\[\]\(\)=>|\/\\]/g,"\\$&"));z.attr("id",w);if(x[3]){l.push(x)}}if($(this).hasClass("hasDatepicker")){$(this).datepicker("destroy");$(this).datepicker({changeMonth:true,changeYear:true,yearRange:"c-100:c+20",beforeShow:function(A){$(A).unbind("blur")
},onClose:function(B,A){this.blur();$(this).trigger("change");$(this).trigger("blur")},onSelect:function(B,A){$(this).trigger("change");$(this).trigger("blur")}})}if($(this)){}}});u.find(".clonebutton").each(function(){var w=$("A",this).attr("id").match(/(\w+[\.\w+]+)\[(\d+)\]([-\w]*)/);if(w!=null&&w.length>0){e=parseInt(w[2]);var i=w[1]+"["+(e+1)+"]"+w[3];$("A",this).attr("name",i).attr("id",i)}});$(h).parents().find(c).after(u);for(var s=0;s<l.length;s++){var j=l[s];var g="__lookup__"+j[1]+"_"+(e+1)+"__sourceData";var a=j[1]+"["+(e+1)+"]";var v={};v[g]={isDictionary:true,dictionaryCode:"FMS_DOC_TYPES"};var b=new LookupWidget(true,"/pgu/widgets/lookup/dictionary",null,v[g],a,null,null,a+"-lookup",10,600,new LookupWidgetElementFactory(lookupWidgetElements.standard))}f.removeClass(t);f.addClass(t+"Processed-"+e);f.find(".clonebutton").each(function(){var i=$("A",this).attr("id");if(i==d){$(this).remove()}else{$(this).css("visibility","visible");$("A",this).click(function(){removeCloneSection(d,$(this).attr("id"),t,n,p)
})}});if(currentCloneCounter==p){$(h).css("visibility","hidden");var k=0;var m=$(h).parent();while(m.is("div")!=true){m=m.parent();k++;if(k>5){break}}m.css("visibility","hidden")}};var setUnsetReadonlyByValue=function(j,c,h,g){var i;var e=$(document.getElementById(j));var f=descriptorTarget(c,j);var b=e.attr("type");switch(b){case"text":i=e.val().toUpperCase();h=h.toUpperCase();break;case"checkbox":var a=(h.indexOf("on")!=-1)||(h.indexOf("off")!=-1);i=(e.is(":checked")?(a?"on":"1"):(a?"off":"0"));break;case"select-one":i=e.find(":selected").text().toUpperCase();h=h.toUpperCase();break;case"hidden":i=e.val().toUpperCase();h=h.toUpperCase();break;case"radio":i=e.val().toUpperCase();h=h.toUpperCase();break}var d=$.map(h.split(","),$.trim);var k=($.inArray($.trim(i),d)!=-1);if(g=="set"||g=="unset"){f.descriptor("setAttribute","readonly",!!((g=="set")^!k))}};var setUnsetDisabledByValue=function(j,c,h,g){var i;var e=$(document.getElementById(j));var f=descriptorTarget(c,j);var b=e.attr("type");
switch(b){case"text":i=e.val().toUpperCase();h=h.toUpperCase();break;case"checkbox":var a=(h.indexOf("on")!=-1)||(h.indexOf("off")!=-1);i=(e.is(":checked")?(a?"on":"1"):(a?"off":"0"));break;case"select-one":i=e.find(":selected").text().toUpperCase();h=h.toUpperCase();break;case"hidden":i=e.val().toUpperCase();h=h.toUpperCase();break;case"radio":i=e.val().toUpperCase();h=h.toUpperCase();break}var d=$.map(h.split(","),$.trim);var k=($.inArray($.trim(i),d)!=-1);if(g=="set"||g=="unset"){f.descriptor("setAttribute","disabled",!!((g=="set")^!k))}};var setUnsetVisibilityByValue=function(k,c,i,h,l){var j;var f=$(document.getElementById(k));var g=descriptorTarget(c,k);var b=f.attr("type");switch(b){case"text":j=f.val().toUpperCase();i=i.toUpperCase();break;case"checkbox":var a=(i.indexOf("on")!=-1)||(i.indexOf("off")!=-1);j=(f.is(":checked")?(a?"on":"1"):(a?"off":"0"));break;case"select-one":j=f.find(":selected").text().toUpperCase();i=i.toUpperCase();break;case"hidden":j=f.val().toUpperCase();i=i.toUpperCase();
break}var e=$.map(i.split(","),$.trim);var m=($.inArray($.trim(j),e)!=-1);if(h=="show"||h=="hide"){var d=(h=="show")^!m;g.descriptor("setAttribute","visible",d,{scope:l})}};var setValueByList=function(d,c){var a=$(document.getElementById(d));var e=descriptorTarget(c,d);var b=a.find("option:selected").text();e.descriptor("setAttribute","value",trim(b))};var setValueByField=function(d,c){var a=$(document.getElementById(d));var e=descriptorTarget(c,d);var b=a.val();e.descriptor("setAttribute","value",trim(b))};var setValueByValue=function(c,b,e,d){var a=$(document.getElementById(c));var f=descriptorTarget(b,c);if(a.val()==e){f.descriptor("setAttribute","value",d)}};var toUpperCase=function(a){var b=$(document.getElementById(a));b.val(b.val().toUpperCase())};var setRequiredIf=function(j,c,h,g){var i;var e=$(document.getElementById(j));var f=descriptorTarget(c,j);var b=e.attr("type");switch(b){case"textarea":i=e.val().toUpperCase();break;case"text":case"select-one":i=e.val().toUpperCase();h=h.toUpperCase();
break;case"hidden":i=e.val().toUpperCase();h=h.toUpperCase();break;case"checkbox":var a=(h.indexOf("on")!=-1)||(h.indexOf("off")!=-1);i=(e.is(":checked")?(a?"on":"1"):(a?"off":"0"));break}var d=$.map(h.split(","),$.trim);var k=($.inArray($.trim(i),d)!=-1);f.descriptor("setAttribute","required",(g==k))};var applyValidationIf=function(i,h,b,j,c,d,k){var f=$(document.getElementById(i));var g=$(document.getElementById(b));var a=$.trim(f.val()).toUpperCase();var e=$.trim(j).toUpperCase().split(/[\s]*,[\s]*/);if($.inArray(a,e)>-1^d){$.descriptor.waitingForProcess++;setTimeout(function(){descriptorTarget(b,i).descriptor("addValidation",h,c,k);$.descriptor.waitingForProcess--})}else{descriptorTarget(b,i).descriptor("removeValidation",h)}};function changeValueByValue(e,d,c,f){var a=$(document.getElementById(e));var g=descriptorTarget(d,e);var b=a.val();if(b==c){if(f!=undefined){g.descriptor("setAttribute","value",trim(f))}}else{g.descriptor("removeDescriptorAttribute","value")}}function fillHiddenForRadio(d,c,b){var a=$(document.getElementById(d));
var f=$(document.getElementById(c));var e=a.val().toUpperCase();if(b){f.val(trim(e))}else{f.val(trim(e)).trigger("change").trigger("blur")}}function trim(a){return(a||"").replace(/^\s*([\S\s]*)\b\s*$/,"$1")}function chooseInLookup(g,e){var d=$(document.getElementById(g));var f=$(document.getElementById(e));var c=d.children();var b=d.find("td:last-child");f.val(b.text())}function fillDynamicLabel(c,b,e){var a=$(document.getElementById(c));var f=$(document.getElementById(b));var d=a.find(":selected").text();f.text(e+" "+d)}function addFileUpload(i,f,l,d,e,b,j,o,n,a,g,c,m){var h=document.getElementById(e+"-upl"),k;new qq.FileUploader({fileName:i,setFileNameTo:f,isMulty:n,sizeLimit:d,allowedExtensions:l,element:h,action:o,onFileSelect:function(){k=this.value},onComplete:function(p,t,s){if(s.success){var q=function(){$(document.getElementById(b)).val(t);$(document.getElementById(j)).val(s.fileHash);$(document.getElementById(e)).val(s.fileID).trigger("blur").trigger("focusout")};var u=this;if(window.edsRequired&&window.edsProtocol=="V_OLD"){var x=function(F){var A=e.replace(/\..+$/,".signData");
var H=e.replace(/\..+$/,".digestData");var C=e.replace(/\..+$/,".certData");var B=$("#shadowWrap");B.height(getInsideWindowHeight()).show();var G=ESignObject.etgHashSignFile(1,1,F,k),z;if(z=ESignObject.etgErrorCode){r("Произошла ошибка: "+z);B.hide();return false}var E=G[0],y=G[1];var D=ESignObject.etgGetCertificate(1,1,F);if(z=ESignObject.etgErrorCode){r("Произошла ошибка: "+z);B.hide();return false}$(document.getElementById(A)).val(y);$(document.getElementById(H)).val(E);$(document.getElementById(C)).val(D);B.hide();return true};var v=u._listElement;var w=$(v).children(),r=function(y){w.attr("class",u._classes.fail);w.find(".qq-upload-failed-text").text(y)};if(ESignObject.etgSlotCount==0){r("Надо вставить токен");return}$("#confirmYes").unbind("click");$("#confirmNo").unbind("click");$("#confirmYes").bind("click",function(){var y=$("#ESD-pinCode-input").val();closeDialogBox("dialogESDpin");if(x(y)){q()}});$("#confirmNo").bind("click",function(){closeDialogBox("dialogESDpin");$("a.qq-upload-clear",h).click()
});$("#dialogESDpin").dialog("open");return}q()}},onClear:function(){$(document.getElementById(b)).val("");$(document.getElementById(e)).val("")},"X-AuthToken":a,"X-OrderID":g,"X-FieldName":c,"X-WithHash":m})}var linkListElemens=function(b,c,l,m,d){var i=false;var h=c.indexOf("[]");if(h!=-1){$.each(l,function(p){var q=this.indexOf("[]");if(q==-1){i=true;return false}});if(!i){var g=c.substr(0,h+1);var o=c.substr(h+1);var n=b.indexOf("]");if(n!=-1&&(n==b.length-1)){var f=b.lastIndexOf("[");var a=b.substring(f+1,n);var k=$(document.getElementById(g+a+o))}}else{k=$.descriptor.$select(c)}}else{k=$(document.getElementById(c))}if(k&&k.length){var j=function(r){var q=r.indexOf("]");if(q!=-1&&(q==r.length-1)){var p=r.lastIndexOf("[");return r.substring(p+1,q)}return undefined};var e=function(p,r){var q="";$.each(p,function(t){var u=$(this).attr("type");switch(u){case"text":var s=$(this).val();break;case"hidden":s=$(this).val();break;case"checkbox":s=$(this).is(":checked")?"on":"off";break}s=(s==undefined)?"":s;
q+=(t===0&&r?s:m+s);r=false});return q};$.each(k,function(){var r="";var q=true;if(h!=-1){var p=j($(this).attr("id"))}$.each(l,function(t){if(p){var w=this.indexOf("[]");if(w!=-1){var u=this.substr(0,w+1);var v=this.substr(w+1);var s=$(document.getElementById(u+p+v))}else{s=$.descriptor.$select(this)}}else{var s=$.descriptor.$select(this)}r+=e(s,q);q=false});$(this).val(r);$(this).trigger(d)})}};function getInsideWindowHeight(){return($(document).height())}function showResultOnTheLastStep(){$(".lastStepInfo, .lastStepRequest, .showResultButton, .lastStepShowResult").toggle()};