const dayElement = document.getElementById("treya-day");
const monthElement = document.getElementById("treya-month");
const yearElement = document.getElementById("treya-year");

setInterval(() => {
    const now = new Date();

    let day = now.getDate();
    let month = now.getMonth() + 1;
    let year = now.getFullYear();

    dayElement.textContent = day;
    if (month < 10) {
        monthElement.textContent = `0${month}`;
    } else {
        monthElement.textContent = month;
    }
    yearElement.textContent = year;
}, 1000)

const newYearCross = document.getElementById("new-year-cross");
const newYear = document.getElementById("new-year");
newYearCross.addEventListener("click", () => {
    newYear.style.display = "none";
});


/* - - - - - СЕРЫЕ ДНИ - - - - -*/
const container = document.getElementById("container");
const pastDayAugust = document.getElementById("past-day-august");
const pastDayOctober = document.getElementById("future-day-october");

/* Сентябрь*/
document.querySelectorAll("#august-day").forEach(buttonsAugust => {
    buttonsAugust.addEventListener("click", () => {
        pastDayAugust.style.display = "flex";
    });
})
document.getElementById("past-day-august-button").addEventListener("click", () => {
    pastDayAugust.style.display = "none";
})
/* Октябрь */
document.querySelectorAll("#october-day").forEach(buttonsOctober => {
    buttonsOctober.addEventListener("click", () => {
        pastDayOctober.style.display = "flex";
    });
})
document.getElementById("future-day-october-button").addEventListener("click", () => {
    pastDayOctober.style.display = "none";
})