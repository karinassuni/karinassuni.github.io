'use strict';
/* FEATURES
- FB CONNECT--CLASS SWAP
- RATE MY PROFESSOR
// ObjArrSearcher class, extended? and MAYBE with a function wrapper
// ORDER OF SEARCH RESULTS = PRIORITY QUEUE!!!!
// HIGHLIGHT matching string
// create schedule recommendations based on what classes you want to take for the term
*/

import courseSearch from "./courseSearch.js";
import appendSelectOptions from"./appendSelectOptions.js";
let xhr = require("xhr");

let courses;

window.onload = function() {

    xhr.get("http://ucm.karinaantonio.com/courses.JSON", {responseType: "json"}, function(err, resp) {
        courses = resp.body.courses; // all courses are in the fucking COURSES KEY/PROPERTY OADJEKLSFG;LGVSGFLFDDV
    });

    appendSelectOptions("department_select", ["All","Anthropology", "Art", "Bio Engin Small Scale Tech", "Biological Sciences", "Bioengineering", "Chicano Chicana Studies", "Chemistry", "Chinese", "Cognitive Science", "Core", "Community Research and Service", "Computer Science & Engineering", "Economics", "Elect. Engr. & Comp. Sci.", "English", "Engineering", "Environmental Engineering", "Environmental Systems (GR)", "Earth Systems Science", "French", "Global Arts Studies Program", "History", "Interdisciplinary Humanities", "Japanese", "Mathematics", "Mechanical Engineering", "Management", "Materials Science & Engr", "Natural Sciences Education", "Nat Sciences Undergrad Studies", "Public Health", "Philosophy", "Physics", "Political Science", "Psychology", "Quantitative & Systems Biology", "Social Sciences", "Sociology", "Spanish", "Undergraduate Studies", "World Heritage", "Writing"]);

    /* Attach event listeners */

    let searchBox = document.getElementById("search_box");

    searchBox.oninput = function() {
        if (this.value)
            courseSearch(this.value, courses);
    };

    // Prevent form submission with <Enter>:
    searchBox.onkeydown = function(e) {
        if (e.keyCode === 13)
            e.preventDefault();
    };

};