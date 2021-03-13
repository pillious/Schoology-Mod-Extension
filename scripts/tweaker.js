var upcoming = document.querySelector(".upcoming-events");
var overdue = document.querySelector("#overdue-submissions");

window.onload = async function () {
    themeManager();
    displaySTLogo();

    // TODO: Add checkboxes to course homepages  (s-course-materials-has-add-content)
    if (document.body.classList.contains("is-home")) {
        // start observing
        // observer.observe(document, {
        //     childList: true,
        //     subtree: true
        // });

        upcomingObserver.observe(document, {
            childList: true,
            subtree: true
        });
        overdueObserver.observe(document, {
            childList: true,
            subtree: true
        });
    }
}

var upcomingObserver = new MutationObserver(function (mutations, me) {
    console.log(upcoming);
    console.log("run 1");
    // `mutations` is an array of mutations that occurred, `me` is the MutationObserver instance
    if (upcoming) {
        try {
            createSidebarCollapse(upcoming, "upcoming");
        }
        catch(err) {
            console.log(err);
            return;
        }
        try {
            let assignments = upcoming.querySelectorAll("a[href*=assignment]");
            let dueDates = Array.from(upcoming.querySelectorAll(".upcoming-event")).map(elem => elem.dataset.start);
    
            if (assignments) {
                if (document.body.classList.contains("is-home")) {
                    cleanLocalStorageAssignments(assignments, dueDates);
                }
                appendCheckboxes(assignments, dueDates);
            }
            me.disconnect();
            return;
        }
        catch(err) {
            console.log(err);
            return;
        }
    } else {
        // me.disconnect();
        return;
    }

    // if (upcoming) {
    //     try {
    //         createSidebarCollapse(upcoming, "upcoming");

    //         let assignments = upcoming.querySelectorAll("a[href*=assignment]");
    //         let dueDates = Array.from(upcoming.querySelectorAll(".upcoming-event")).map(elem => elem.dataset.start);
    
    //         if (assignments) {
    //             if (document.body.classList.contains("is-home")) {
    //                 cleanLocalStorageAssignments(assignments, dueDates);
    //             }
    //             appendCheckboxes(assignments, dueDates);
    //             me.disconnect();
    //             return;
    //         }
    //     }
    //     catch(err) {
    //         console.log(err);
    //         return;
    //     }
    // } else {
    //     // me.disconnect();
    //     return;
    // }
});

var overdueObserver = new MutationObserver(function (mutations, me) {
    // `mutations` is an array of mutations that occurred, `me` is the MutationObserver instance
    console.log(overdue);
    console.log("run 2");
    if (overdue) {
        try {
            createSidebarCollapse(overdue, "overdue");
            me.disconnect();
            return;
        }
        catch(err) {
            console.log(err);
            return;
        }
    } else {
        // me.disconnect();
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
function cleanLocalStorageAssignments(currentAssignments) {
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

async function themeManager() {
    setTheme(await getTheme());

    try {
        chrome.storage.onChanged.addListener(async function (changes, area) {
            if (area === "sync" || area === "local" && "st-theme" in changes) {
                setTheme(changes["st-theme"].newValue);
            }
        });
    } catch (err) {
        console.log(err);
    }

}

async function getTheme() {
    try {
        return new Promise((resolve, reject) => {
            chrome.storage.sync.get(["st-theme"], function (result) {
                if (result["st-theme"]) {
                    resolve(result["st-theme"]);
                } else {
                    resolve("dark");
                }
            });
        });
    } catch (err) {
        console.log(err);
    }

    return "dark";
}

function setTheme(theme) {
    document.documentElement.setAttribute("data-st-theme", theme);
    document.body.setAttribute("data-st-theme", theme);
}

function createSidebarCollapse(elem, name) {
    let icon = document.createElement("i");

    let states = getCollapseStates();
    if (states) {
        if (states.data[name]) {
            icon.className = "fas fa-chevron-right st-icon-collapse";
            icon.setAttribute("data-is-collapsed", true);

            let assignmentList = elem.querySelector(".upcoming-list");
            assignmentList.classList.toggle("st-assignments-collapsed");
        } else {
            icon.className = "fas fa-chevron-down st-icon-collapse";
            icon.setAttribute("data-is-collapsed", false);
        }
    } else {
        icon.className = "fas fa-chevron-down st-icon-collapse";
        icon.setAttribute("data-is-collapsed", false);
    }

    icon.addEventListener("click", function () {
        handleCollapseToggle(this, name);
    });

    elem.insertBefore(icon, elem.firstChild);
}

function handleCollapseToggle(elem, name) {
    elem.classList.toggle("fa-chevron-right");
    elem.classList.toggle("fa-chevron-down");

    let assignmentList = elem.parentElement.querySelector(".upcoming-list");
    assignmentList.classList.toggle("st-assignments-collapsed");

    elem.setAttribute("data-is-collapsed", elem.dataset["isCollapsed"] === "true" ? false : true);
    saveCollapseState(name, elem.dataset["isCollapsed"] === "true" ? true : false);
}

function saveCollapseState(name, isCollapsed) {
    let states = getCollapseStates();

    if (!states) {
        states = {
            data: {
                upcoming: false,
                overdue: false
            }
        };
    }

    states.data[name] = isCollapsed;
    localStorage.setItem("st-collapse", JSON.stringify(states));
}

function getCollapseStates() {
    return JSON.parse(localStorage.getItem("st-collapse"));
}

function displaySTLogo() {
    let overlay = document.createElement("div");
    overlay.className = "st-overlay";

    let logo = document.createElement("img");
    logo.src = chrome.runtime.getURL("images/icon32.png");
    logo.className = "st-logo";

    let alertWrapper = document.createElement("div");
    alertWrapper.className = "st-logo-alert-wrapper";

    let alert = document.createElement("div");
    alert.className = "st-logo-alert";
    alert.innerHTML = "You are running Schoology Tweaker!";

    alertWrapper.append(alert);
    overlay.append(logo);
    overlay.append(alertWrapper);
    document.body.append(overlay);
}