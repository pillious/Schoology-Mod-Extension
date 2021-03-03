var upcoming = document.querySelector(".upcoming-events");;

window.onload = async function () {
    // TODO: Add checkboxes to course homepages 
    // if (document.body.classList.contains("is-home") ||
    //     document.body.classList.contains("s-course-materials-has-add-content")) {
    if (document.body.classList.contains("is-home")) {
        // start observing
        observer.observe(document, {
            childList: true,
            subtree: true
        });
    }
}

// wait for upcoming to populate before adding checkboxes
var observer = new MutationObserver(function (mutations, me) {
    // `mutations` is an array of mutations that occurred, `me` is the MutationObserver instance
    if (upcoming) {
        let assignments = upcoming.querySelectorAll("a[href*=assignment]");
        let dueDates = Array.from(upcoming.querySelectorAll(".upcoming-event")).map(elem => elem.dataset.start);

        if (assignments) {
            if (document.body.classList.contains("is-home")) {
                cleanLocalStorage(assignments, dueDates);
            }
            appendCheckboxes(assignments, dueDates);
            me.disconnect();
            return;
        }
    } else {
        me.disconnect();
        return;
    }

});

function appendCheckboxes(assignments, dueDates) {
    var stored = getStoredAssignments();
    assignments.forEach((a, idx) => {
        var aLink = a.pathname;
        a.parentNode.insertBefore(createCheckbox(aLink, dueDates[idx], stored), a.nextSibling);
    });
}

function createCheckbox(aLink, dueDate, storedAssignments) {
    var label = document.createElement("label");
    label.className = "st-checkbox-container";
    label.innerHTML = "&nbsp";

    var input = document.createElement("input");
    input.type = "checkbox";
    input.className = "st-checkbox";
    input.dataset.assignment = aLink;
    input.dataset.due = dueDate;

    if (storedAssignments && storedAssignments.data.length > 0) {
        const index = storedAssignments.data.findIndex((e) => e.assignment === aLink);
        if (index !== -1) {
            input.checked = storedAssignments.data[index].isComplete;
            input.isChecked = storedAssignments.data[index].isComplete;
        }
    }


    input.addEventListener("click", function () {
        stOnAssignmentCheck(this.checked, this.dataset.assignment, this.dataset.due)
    });

    var span = document.createElement("span");
    span.className = "checkmark";

    label.appendChild(input);
    label.appendChild(span);

    return label;
}

// updates local storage when checkbox is clicked
function stOnAssignmentCheck(isChecked, aLink, due) {
    var stored = getStoredAssignments();
    if (stored === null) {
        localStorage.setItem("st-assignments", JSON.stringify({
            data: []
        }));
        stored = {
            data: []
        };
    }

    const index = stored.data.findIndex((e) => e.assignment === aLink);
    if (index === -1) {
        stored.data.push({
            "assignment": aLink,
            "due": due,
            "isComplete": isChecked
        });
    } else {
        stored.data[index].isComplete = isChecked;
    }

    localStorage.setItem("st-assignments", JSON.stringify(stored));
}

// retrieve assignment completion data from local storage
function getStoredAssignments() {
    return JSON.parse(localStorage.getItem("st-assignments"));
}

// remove assignment from local storage if past due date.
function cleanLocalStorage(currentAssignments) {
    let stored = getStoredAssignments();

    if (stored && stored.data.length > 0) {
        let d = new Date();

        stored.data.forEach((s, idx) => {
            if (parseInt(s.due) < parseInt(d.getTime() / 1000)) {
                stored.data.splice(idx, 1);
            }
        });

        localStorage.setItem("st-assignments", JSON.stringify(stored));
    }
}