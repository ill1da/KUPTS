const sand = document.getElementById("sand");
let drawing = false;

sand.addEventListener("mousedown", () => {
    drawing = true;
    sand.style.cursor = "pointer";
});

sand.addEventListener("mouseup", () => {
    drawing = false;
    sand.style.cursor = "crosshair";
});

sand.addEventListener("mousemove", draw);

sand.addEventListener("touchstart", () => {
    drawing = true;
    sand.style.cursor = "pointer";
});

sand.addEventListener("touchend", () => {
    drawing = false;
    sand.style.cursor = "crosshair";
});

sand.addEventListener("touchmove", draw);

function draw(e) {
    if (!drawing) return;

    const dot = document.createElement("div");
    dot.classList.add("dot");
    dot.style.left = (e.clientX - sand.getBoundingClientRect().left) + "px";
    dot.style.top = (e.clientY - sand.getBoundingClientRect().top) + "px";

    sand.appendChild(dot);

    setTimeout(() => {
        dot.remove();
    }, 3000); // Убираем точку через 3 секунды (или любое другое значение в миллисекундах)
}
