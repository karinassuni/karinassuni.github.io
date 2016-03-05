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