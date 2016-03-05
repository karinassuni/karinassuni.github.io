export default function appendSelectOptions(selectId, newOptionsArr) {

    let selectBox = document.getElementById(selectId);
    const numNewOptions = newOptionsArr.length;

    for (let i = 0; i < numNewOptions; ++i) {

        let selectOption = document.createElement("option");
        selectOption.setAttribute("value", newOptionsArr[i]);
        selectOption.setAttribute("label", newOptionsArr[i]);
        selectBox.appendChild(selectOption);

    }

}