var container = document.querySelector("#unity-container");
var canvas = document.querySelector("#unity-canvas");
var loadingBar = document.querySelector("#unity-loading-bar");
var progressBarFull = document.querySelector("#unity-progress-bar-full");
var warningBanner = document.querySelector("#unity-warning");
var unityGame;

// Ensure full viewport dimensions
if (container) {
    container.style.width = "100vw";
    container.style.height = "100vh";
    container.style.margin = "0";
    container.style.padding = "0";
}
if (canvas) {
    canvas.style.width = "100vw";
    canvas.style.height = "100vh";
    canvas.style.margin = "0";
    canvas.style.padding = "0";
}
