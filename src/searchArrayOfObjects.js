export default function searchArrayOfObjects(query, objArr, matchProcessor, keysToSkip = []) {

    const numObjs = objArr.length;

    function match(lhs, rhs) {
        return lhs.toLowerCase().indexOf(rhs.toLowerCase()) !== -1;
    }

    for (let i = 0; i < numObjs; ++i) {

        for (let key in objArr[i]) {

            if (keysToSkip.indexOf(key) !== -1)
                continue;

            if (match(objArr[i][key], query)) {

                matchProcessor(objArr[i]);
                break;

            }

        }

    }

}