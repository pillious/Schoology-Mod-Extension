var upcoming = document.querySelector(".upcoming-events");

window.onload = async function () {
    // start observing
    getStoredAssignments()
    observer.observe(document, {
        childList: true,
        subtree: true
    });
}

// wait for upcoming to populate before adding checkboxes
var observer = new MutationObserver(function (mutations, me) {
    // `mutations` is an array of mutations that occurred
    // `me` is the MutationObserver instance
    var assignments = upcoming.querySelectorAll(".infotip");
    if (assignments) {
        cleanLocalStorage(assignments);
        appendCheckboxes(assignments);
        me.disconnect();
        return;
    }
});

function appendCheckboxes(assignments) {
    var stored = getStoredAssignments();
    assignments.forEach(a => {
        var aLink = a.firstElementChild.nextSibling.pathname;
        a.insertBefore(createCheckbox(aLink, stored), a.firstElementChild.nextSibling);
    });
}

function createCheckbox(aLink, storedAssignments) {
    var label = document.createElement("label");
    label.className = "st-checkbox-container";
    label.innerHTML = "&nbsp";

    var input = document.createElement("input");
    input.type = "checkbox";
    input.className = "st-checkbox";
    input.dataset.assignment = aLink;

    if (storedAssignments && storedAssignments.data.length > 0) {
        const index = storedAssignments.data.findIndex((e) => e.assignment === aLink);
        if (index !== -1) {
            input.checked = storedAssignments.data[index].isComplete;
            input.isChecked = storedAssignments.data[index].isComplete;
        }
    }


    input.addEventListener("click", function() {
        stOnAssignmentCheck(this.checked, this.dataset.assignment)
    });

    var span = document.createElement("span");
    span.className = "checkmark";

    label.appendChild(input);
    label.appendChild(span);

    return label;
}

// updates local storage when checkbox is clicked
function stOnAssignmentCheck(isChecked, aLink) {
    var stored = getStoredAssignments();
    if (stored === null) {
        localStorage.setItem("st-assignments", JSON.stringify({data: []}));
        stored = {data: []};
    }

    const index = stored.data.findIndex((e) => e.assignment === aLink);
    if (index === -1) {
        stored.data.push({"assignment": aLink, "isComplete": isChecked});
    } else {
        stored.data[index].isComplete = isChecked;
    }

    localStorage.setItem("st-assignments", JSON.stringify(stored));
}

// retrieve assignment completion data from local storage
function getStoredAssignments() {
    return JSON.parse(localStorage.getItem("st-assignments"));
}

// remove all unneccesary assignments from local storage
function cleanLocalStorage(currentAssignments) {
    var stored = getStoredAssignments();

    if (stored && stored.data.length > 0) {
        var currentAssignmentLinks = [];
        currentAssignments.forEach((a) => {
            currentAssignmentLinks.push(a.firstElementChild.nextSibling.pathname)
        });
    
        
        stored.data.forEach((a, index) => {
            const i = currentAssignmentLinks.findIndex((e) => e === a.assignment);
            if (i === -1) {
                stored.data.splice(index, 1);
            }
        });
        
        localStorage.setItem("st-assignments", JSON.stringify(stored));
    }
}