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