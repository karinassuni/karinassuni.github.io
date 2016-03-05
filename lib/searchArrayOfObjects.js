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