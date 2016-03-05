import searchArrayOfObjects from "./searchArrayOfObjects.js"

export default function courseSearch(query, courses) {

    clearOldResults();
    search(query, courses, appendMatchToFragment, keysToSkip);
    document.getElementById("results_table").appendChild(allResults);   // empties the documentFragment

};

const search = searchArrayOfObjects,
    resultsLimit = 30,
    keysToSkip = [
        "units",
        "actv",
        "term",
        "max_enrl",
        "act_enrl",
        "seats_avail"
    ];
let allResults = document.createDocumentFragment();

function clearOldResults() {

    let old = document.getElementsByClassName("results_row");

    while (old.length)
        document.getElementById("results_table").removeChild(old[0]);

}

function appendMatchToFragment(match) {

    let newRow = document.createElement("tr");
    newRow.className = "results_row";

    // Make cells for each property
    for (let property in match) {

        let newCell = document.createElement("td");
        newCell.innerHTML = match[property];
        newCell.className = "results_cell" + " " + property;
        newRow.appendChild(newCell);

    }

    allResults.appendChild(newRow);

}