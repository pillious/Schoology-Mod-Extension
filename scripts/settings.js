var theme;

window.onload = async function() {
    theme = await getTheme();
    document.getElementById("themeToggle").checked = theme === "light" ? false : true; 

    document.getElementById("themeToggle").addEventListener("click", function() {
        setThemeLocal(this.checked);
    })
    document.getElementById("confirm-theme").addEventListener("click", function(e) {
        e.preventDefault();
        setThemeChromeStorage();
        window.close();
    });
}

async function getTheme() {
    try {
        return new Promise((resolve, reject) => {
            chrome.storage.sync.get(["st-theme"], function(result) {
                if (result["st-theme"]) {
                    resolve(result["st-theme"]);
                }
                else {
                    resolve("dark");
                }
            });
        });
    }
    catch(err) {
        console.log(err);
    }

    return "dark";
}

function setThemeLocal(isToggled) {
    if (isToggled != undefined) {
        theme = isToggled ? "dark" : "light";
    }
}

function setThemeChromeStorage() {
    try {
        chrome.storage.sync.set({"st-theme": theme}, function() {});
    }
    catch(err) {
        console.log(err);
    }

}