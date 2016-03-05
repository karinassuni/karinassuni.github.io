(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = appendSelectOptions;
function appendSelectOptions(selectId, newOptionsArr) {

    var selectBox = document.getElementById(selectId);
    var numNewOptions = newOptionsArr.length;

    for (var i = 0; i < numNewOptions; ++i) {

        var selectOption = document.createElement("option");
        selectOption.setAttribute("value", newOptionsArr[i]);
        selectOption.setAttribute("label", newOptionsArr[i]);
        selectBox.appendChild(selectOption);
    }
}
},{}],2:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = courseSearch;

var _searchArrayOfObjects = require("./searchArrayOfObjects.js");

var _searchArrayOfObjects2 = _interopRequireDefault(_searchArrayOfObjects);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function courseSearch(query, courses) {

    clearOldResults();
    search(query, courses, appendMatchToFragment, keysToSkip);
    document.getElementById("results_table").appendChild(allResults); // empties the documentFragment
};

var search = _searchArrayOfObjects2.default,
    resultsLimit = 30,
    keysToSkip = ["units", "actv", "term", "max_enrl", "act_enrl", "seats_avail"];
var allResults = document.createDocumentFragment();

function clearOldResults() {

    var old = document.getElementsByClassName("results_row");

    while (old.length) {
        document.getElementById("results_table").removeChild(old[0]);
    }
}

function appendMatchToFragment(match) {

    var newRow = document.createElement("tr");
    newRow.className = "results_row";

    // Make cells for each property
    for (var property in match) {

        var newCell = document.createElement("td");
        newCell.innerHTML = match[property];
        newCell.className = "results_cell" + " " + property;
        newRow.appendChild(newCell);
    }

    allResults.appendChild(newRow);
}
},{"./searchArrayOfObjects.js":4}],3:[function(require,module,exports){
'use strict';
/* FEATURES
- FB CONNECT--CLASS SWAP
- RATE MY PROFESSOR
// ObjArrSearcher class, extended? and MAYBE with a function wrapper
// ORDER OF SEARCH RESULTS = PRIORITY QUEUE!!!!
// HIGHLIGHT matching string
// create schedule recommendations based on what classes you want to take for the term
*/

var _courseSearch = require("./courseSearch.js");

var _courseSearch2 = _interopRequireDefault(_courseSearch);

var _appendSelectOptions = require("./appendSelectOptions.js");

var _appendSelectOptions2 = _interopRequireDefault(_appendSelectOptions);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var xhr = require("xhr");

var courses = void 0;

window.onload = function () {

    xhr.get("http://ucm.karinaantonio.com/courses.JSON", { responseType: "json" }, function (err, resp) {
        courses = resp.body.courses; // all courses are in the fucking COURSES KEY/PROPERTY OADJEKLSFG;LGVSGFLFDDV
    });

    (0, _appendSelectOptions2.default)("department_select", ["All", "Anthropology", "Art", "Bio Engin Small Scale Tech", "Biological Sciences", "Bioengineering", "Chicano Chicana Studies", "Chemistry", "Chinese", "Cognitive Science", "Core", "Community Research and Service", "Computer Science & Engineering", "Economics", "Elect. Engr. & Comp. Sci.", "English", "Engineering", "Environmental Engineering", "Environmental Systems (GR)", "Earth Systems Science", "French", "Global Arts Studies Program", "History", "Interdisciplinary Humanities", "Japanese", "Mathematics", "Mechanical Engineering", "Management", "Materials Science & Engr", "Natural Sciences Education", "Nat Sciences Undergrad Studies", "Public Health", "Philosophy", "Physics", "Political Science", "Psychology", "Quantitative & Systems Biology", "Social Sciences", "Sociology", "Spanish", "Undergraduate Studies", "World Heritage", "Writing"]);

    /* Attach event listeners */

    var searchBox = document.getElementById("search_box");

    searchBox.oninput = function () {
        return this.value && (0, _courseSearch2.default)(this.value, courses);
    };

    // Prevent form submission with <Enter>:
    searchBox.onkeydown = function (e) {
        if (e.keyCode == 13) e.preventDefault();
    };
};
},{"./appendSelectOptions.js":1,"./courseSearch.js":2,"xhr":10}],4:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = searchArrayOfObjects;
function searchArrayOfObjects(query, objArr, matchProcessor) {
    var keysToSkip = arguments.length <= 3 || arguments[3] === undefined ? [] : arguments[3];


    var numObjs = objArr.length;

    function match(lhs, rhs) {
        return lhs.toLowerCase().indexOf(rhs.toLowerCase()) !== -1;
    }

    for (var i = 0; i < numObjs; ++i) {

        for (var key in objArr[i]) {

            if (keysToSkip.indexOf(key) !== -1) continue;

            if (match(objArr[i][key], query)) {

                matchProcessor(objArr[i]);
                break;
            }
        }
    }
}
},{}],5:[function(require,module,exports){
var isFunction = require('is-function')

module.exports = forEach

var toString = Object.prototype.toString
var hasOwnProperty = Object.prototype.hasOwnProperty

function forEach(list, iterator, context) {
    if (!isFunction(iterator)) {
        throw new TypeError('iterator must be a function')
    }

    if (arguments.length < 3) {
        context = this
    }
    
    if (toString.call(list) === '[object Array]')
        forEachArray(list, iterator, context)
    else if (typeof list === 'string')
        forEachString(list, iterator, context)
    else
        forEachObject(list, iterator, context)
}

function forEachArray(array, iterator, context) {
    for (var i = 0, len = array.length; i < len; i++) {
        if (hasOwnProperty.call(array, i)) {
            iterator.call(context, array[i], i, array)
        }
    }
}

function forEachString(string, iterator, context) {
    for (var i = 0, len = string.length; i < len; i++) {
        // no such thing as a sparse string.
        iterator.call(context, string.charAt(i), i, string)
    }
}

function forEachObject(object, iterator, context) {
    for (var k in object) {
        if (hasOwnProperty.call(object, k)) {
            iterator.call(context, object[k], k, object)
        }
    }
}

},{"is-function":7}],6:[function(require,module,exports){
(function (global){
if (typeof window !== "undefined") {
    module.exports = window;
} else if (typeof global !== "undefined") {
    module.exports = global;
} else if (typeof self !== "undefined"){
    module.exports = self;
} else {
    module.exports = {};
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],7:[function(require,module,exports){
module.exports = isFunction

var toString = Object.prototype.toString

function isFunction (fn) {
  var string = toString.call(fn)
  return string === '[object Function]' ||
    (typeof fn === 'function' && string !== '[object RegExp]') ||
    (typeof window !== 'undefined' &&
     // IE8 and below
     (fn === window.setTimeout ||
      fn === window.alert ||
      fn === window.confirm ||
      fn === window.prompt))
};

},{}],8:[function(require,module,exports){
var trim = require('trim')
  , forEach = require('for-each')
  , isArray = function(arg) {
      return Object.prototype.toString.call(arg) === '[object Array]';
    }

module.exports = function (headers) {
  if (!headers)
    return {}

  var result = {}

  forEach(
      trim(headers).split('\n')
    , function (row) {
        var index = row.indexOf(':')
          , key = trim(row.slice(0, index)).toLowerCase()
          , value = trim(row.slice(index + 1))

        if (typeof(result[key]) === 'undefined') {
          result[key] = value
        } else if (isArray(result[key])) {
          result[key].push(value)
        } else {
          result[key] = [ result[key], value ]
        }
      }
  )

  return result
}
},{"for-each":5,"trim":9}],9:[function(require,module,exports){

exports = module.exports = trim;

function trim(str){
  return str.replace(/^\s*|\s*$/g, '');
}

exports.left = function(str){
  return str.replace(/^\s*/, '');
};

exports.right = function(str){
  return str.replace(/\s*$/, '');
};

},{}],10:[function(require,module,exports){
"use strict";
var window = require("global/window")
var once = require("once")
var isFunction = require("is-function")
var parseHeaders = require("parse-headers")
var xtend = require("xtend")

module.exports = createXHR
createXHR.XMLHttpRequest = window.XMLHttpRequest || noop
createXHR.XDomainRequest = "withCredentials" in (new createXHR.XMLHttpRequest()) ? createXHR.XMLHttpRequest : window.XDomainRequest

forEachArray(["get", "put", "post", "patch", "head", "delete"], function(method) {
    createXHR[method === "delete" ? "del" : method] = function(uri, options, callback) {
        options = initParams(uri, options, callback)
        options.method = method.toUpperCase()
        return _createXHR(options)
    }
})

function forEachArray(array, iterator) {
    for (var i = 0; i < array.length; i++) {
        iterator(array[i])
    }
}

function isEmpty(obj){
    for(var i in obj){
        if(obj.hasOwnProperty(i)) return false
    }
    return true
}

function initParams(uri, options, callback) {
    var params = uri

    if (isFunction(options)) {
        callback = options
        if (typeof uri === "string") {
            params = {uri:uri}
        }
    } else {
        params = xtend(options, {uri: uri})
    }

    params.callback = callback
    return params
}

function createXHR(uri, options, callback) {
    options = initParams(uri, options, callback)
    return _createXHR(options)
}

function _createXHR(options) {
    var callback = options.callback
    if(typeof callback === "undefined"){
        throw new Error("callback argument missing")
    }
    callback = once(callback)

    function readystatechange() {
        if (xhr.readyState === 4) {
            loadFunc()
        }
    }

    function getBody() {
        // Chrome with requestType=blob throws errors arround when even testing access to responseText
        var body = undefined

        if (xhr.response) {
            body = xhr.response
        } else if (xhr.responseType === "text" || !xhr.responseType) {
            body = xhr.responseText || xhr.responseXML
        }

        if (isJson) {
            try {
                body = JSON.parse(body)
            } catch (e) {}
        }

        return body
    }

    var failureResponse = {
                body: undefined,
                headers: {},
                statusCode: 0,
                method: method,
                url: uri,
                rawRequest: xhr
            }

    function errorFunc(evt) {
        clearTimeout(timeoutTimer)
        if(!(evt instanceof Error)){
            evt = new Error("" + (evt || "Unknown XMLHttpRequest Error") )
        }
        evt.statusCode = 0
        callback(evt, failureResponse)
    }

    // will load the data & process the response in a special response object
    function loadFunc() {
        if (aborted) return
        var status
        clearTimeout(timeoutTimer)
        if(options.useXDR && xhr.status===undefined) {
            //IE8 CORS GET successful response doesn't have a status field, but body is fine
            status = 200
        } else {
            status = (xhr.status === 1223 ? 204 : xhr.status)
        }
        var response = failureResponse
        var err = null

        if (status !== 0){
            response = {
                body: getBody(),
                statusCode: status,
                method: method,
                headers: {},
                url: uri,
                rawRequest: xhr
            }
            if(xhr.getAllResponseHeaders){ //remember xhr can in fact be XDR for CORS in IE
                response.headers = parseHeaders(xhr.getAllResponseHeaders())
            }
        } else {
            err = new Error("Internal XMLHttpRequest Error")
        }
        callback(err, response, response.body)

    }

    var xhr = options.xhr || null

    if (!xhr) {
        if (options.cors || options.useXDR) {
            xhr = new createXHR.XDomainRequest()
        }else{
            xhr = new createXHR.XMLHttpRequest()
        }
    }

    var key
    var aborted
    var uri = xhr.url = options.uri || options.url
    var method = xhr.method = options.method || "GET"
    var body = options.body || options.data || null
    var headers = xhr.headers = options.headers || {}
    var sync = !!options.sync
    var isJson = false
    var timeoutTimer

    if ("json" in options) {
        isJson = true
        headers["accept"] || headers["Accept"] || (headers["Accept"] = "application/json") //Don't override existing accept header declared by user
        if (method !== "GET" && method !== "HEAD") {
            headers["content-type"] || headers["Content-Type"] || (headers["Content-Type"] = "application/json") //Don't override existing accept header declared by user
            body = JSON.stringify(options.json)
        }
    }

    xhr.onreadystatechange = readystatechange
    xhr.onload = loadFunc
    xhr.onerror = errorFunc
    // IE9 must have onprogress be set to a unique function.
    xhr.onprogress = function () {
        // IE must die
    }
    xhr.ontimeout = errorFunc
    xhr.open(method, uri, !sync, options.username, options.password)
    //has to be after open
    if(!sync) {
        xhr.withCredentials = !!options.withCredentials
    }
    // Cannot set timeout with sync request
    // not setting timeout on the xhr object, because of old webkits etc. not handling that correctly
    // both npm's request and jquery 1.x use this kind of timeout, so this is being consistent
    if (!sync && options.timeout > 0 ) {
        timeoutTimer = setTimeout(function(){
            aborted=true//IE9 may still call readystatechange
            xhr.abort("timeout")
            var e = new Error("XMLHttpRequest timeout")
            e.code = "ETIMEDOUT"
            errorFunc(e)
        }, options.timeout )
    }

    if (xhr.setRequestHeader) {
        for(key in headers){
            if(headers.hasOwnProperty(key)){
                xhr.setRequestHeader(key, headers[key])
            }
        }
    } else if (options.headers && !isEmpty(options.headers)) {
        throw new Error("Headers cannot be set on an XDomainRequest object")
    }

    if ("responseType" in options) {
        xhr.responseType = options.responseType
    }

    if ("beforeSend" in options &&
        typeof options.beforeSend === "function"
    ) {
        options.beforeSend(xhr)
    }

    xhr.send(body)

    return xhr


}

function noop() {}

},{"global/window":6,"is-function":7,"once":11,"parse-headers":8,"xtend":12}],11:[function(require,module,exports){
module.exports = once

once.proto = once(function () {
  Object.defineProperty(Function.prototype, 'once', {
    value: function () {
      return once(this)
    },
    configurable: true
  })
})

function once (fn) {
  var called = false
  return function () {
    if (called) return
    called = true
    return fn.apply(this, arguments)
  }
}

},{}],12:[function(require,module,exports){
module.exports = extend

var hasOwnProperty = Object.prototype.hasOwnProperty;

function extend() {
    var target = {}

    for (var i = 0; i < arguments.length; i++) {
        var source = arguments[i]

        for (var key in source) {
            if (hasOwnProperty.call(source, key)) {
                target[key] = source[key]
            }
        }
    }

    return target
}

},{}]},{},[1,2,3,4]);
