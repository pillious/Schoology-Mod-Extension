window.onload = function() {
    console.log("hello");
    setTheme(getTheme());
}

function getTheme() {
    return "dark";
    // return "light";
}

function setTheme(theme) {
    conolse.log(document.documentElement);
    document.documentElement.setAttribute("data-theme", "dark");
}

// window.onload = function() {
//     main()
// }

// function main() {
//     let path = window.location.pathname;
//     console.log(path);
//     if (path.includes("assignment")) {
//         document.getElementsByClassName("dropbox-submit")[0].addEventListener("click", async function() {
//             await wait(4000);
//             setTextboxColor();
//         });
//     }
// }

// function setTextboxColor() {
//     document.getElementById("tinymce").style.backgroundColor = "#2d2d2d"; // $E6
//     console.log("done");
// }

// async function wait(ms) {
//     return new Promise(resolve => {
//       setTimeout(resolve, ms);
//     });
// }

// setTimeout(function(){ alert("Hello"); }, 3000);