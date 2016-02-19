'use strict'
/* FEATURES
- FB CONNECT--CLASS SWAP
*/

// Globals
var courses;
    var resultsLimit = 30,
        skipKeys = ["units",
                    "actv",
                    "term",
                    "max_enrl",
                    "act_enrl",
                    "seats_avail"];

window.onload = init;

function validateInputKey(keyevent, callback, callbackArgs) {

    // https://css-tricks.com/snippets/javascript/javascript-keycodes/
    if (!(keyevent.keyCode >= 13 && keyevent.keyCode <= 45 && keyevent.keyCode !== 32)
     || (keyevent.keyCode >= 91 && keyevent.keyCode <= 93)
     || (keyevent.keyCode >= 112 && keyevent.keyCode <= 145)
     || keyevent.ctrlKey || keyevent.shiftKey || keyevent.metaKey || keyevent.altKey)   // true if modifiers pressed when event occurred

        callback();

}

function courseSearch(input, dataArr, resultsLimit, skipKeys) {

    var numEntries = dataArr.length,
        resultsCount = 0;

    //alert(numEntries);
    // Alphabetical precedence: <>

    // Clear old results
    var oldResultsRows = document.getElementsByClassName("results_row");
    while(oldResultsRows.length)
        document.getElementById("results_table").removeChild(oldResultsRows[oldResultsRows.length-1]);

    // ALPHEBETICAL
    for(var i = 0; i < numEntries; i++) {

        for(var key in dataArr[i]) {

            if(skipKeys.indexOf(key) !== -1)
                continue;   // skip this key

            if( dataArr[i][key].toLowerCase().indexOf(input.toLowerCase()) === 0  // match start of string, case insensitive
                || ( (key === "department" || key === "ctitle")
                    && (dataArr[i][key].toLowerCase().split(" ")).indexOf(input.toLowerCase()) === 0 ) ) {  // or match start of words, for these properties

                // Create table row for matching course
                var newRow = document.createElement("tr");
                newRow.className = "results_row";

                // Iterate over all keys again, to make cells for each property
                for(var property in dataArr[i]) {

                    var newCell = document.createElement("td");
                    newCell.innerHTML = dataArr[i][property];

                    if(property !== "time" && property !== "ctitle")
                        newCell.className = "results_cell";    // text-align: center
                    newRow.appendChild(newCell);

                    // Padding cell for "Seats:" header
                    if(property === "instructor")
                        newRow.appendChild(document.createElement("td"));
                }

                document.getElementById("results_table").appendChild(newRow);
                resultsCount++;

                if( resultsCount === resultsLimit ) return;

                break;  // Look at next course[i]

            }   // if match found

        }   // for key in dataArr[i]

    }   // for i < numEntries

}

function httpGET(url, responseType) {

    return new Promise(function(resolve, reject) {

        var req = new XMLHttpRequest;
        req.responseType = responseType;
        req.open("GET", url, true); // async

        req.onreadystatechange = function(e) {

            // If request is DONE processing, and is SUCCESSful
            if(req.readyState === 4 && req.status === 200)
                resolve(req.response);    

        }

        req.send();

    });

}

function appendSelectOptions(elementId, newOptionsArr) {

    var selectBox = document.getElementById(elementId),
        numNewOptions = newOptionsArr.length,        
        selectOption;

    for(var i = 0; i < numNewOptions; i++) {
        selectOption = document.createElement("option");
        selectOption.setAttribute("value", newOptionsArr[i]);
        selectOption.setAttribute("label", newOptionsArr[i]);
        selectBox.appendChild(selectOption);
    }

}

function init(e) {

    httpGET("http://ucm.karinaantonio.com/courses.JSON", "json")
    .then(function(response) {
        courses = response.courses;
    })
    .catch(function(reason) {
        alert("Failed to retrieve courses.");
    });
    
    appendSelectOptions("department_select", ["All","Anthropology", "Art", "Bio Engin Small Scale Tech", "Biological Sciences", "Bioengineering", "Chicano Chicana Studies", "Chemistry", "Chinese", "Cognitive Science", "Core", "Community Research and Service", "Computer Science & Engineering", "Economics", "Elect. Engr. & Comp. Sci.", "English", "Engineering", "Environmental Engineering", "Environmental Systems (GR)", "Earth Systems Science", "French", "Global Arts Studies Program", "History", "Interdisciplinary Humanities", "Japanese", "Mathematics", "Mechanical Engineering", "Management", "Materials Science & Engr", "Natural Sciences Education", "Nat Sciences Undergrad Studies", "Public Health", "Philosophy", "Physics", "Political Science", "Psychology", "Quantitative & Systems Biology", "Social Sciences", "Sociology", "Spanish", "Undergraduate Studies", "World Heritage", "Writing"]);

    /* Attach event listeners */

    var searchBox = document.getElementById("search_box");
    searchBox.addEventListener("keyup",
                                function(keyevent) {
                                    validateInputKey(keyevent, courseSearch.bind(this, this.value, courses, resultsLimit, skipKeys));
                                },
                                false);
    searchBox.addEventListener("keydown",   // prevent form submission with <Enter>
                                function(keyevent) {
                                    if (keyevent.keyCode == 13)
                                        keyevent.preventDefault();
                                },
                                false);

}