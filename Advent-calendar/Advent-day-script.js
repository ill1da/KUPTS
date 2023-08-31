document.querySelectorAll(".none").forEach(
    noneBtn => {
        noneBtn.addEventListener("click", () => {
            document.getElementById("none-advent").style.display = "flex";
        });
});
document.getElementById("none-advent-button").addEventListener("click", () => {
    document.getElementById("none-advent").style.display = "none";
})


document.getElementById("day1").addEventListener("click", () => {
    document.getElementById("day1-advent").style.display = "flex";
});
document.getElementById("day1-advent-button").addEventListener("click", () => {
    document.getElementById("day1-advent").style.display = "none";
})