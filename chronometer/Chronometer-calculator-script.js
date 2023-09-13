// Получаем элементы на странице
const startDateInput = document.getElementById("dateInput1");
const endDateInput = document.getElementById("dateInput2");

startDateInput.addEventListener("input", calculateDateDiff);
endDateInput.addEventListener("input", calculateDateDiff);

// Функция для подсчета разницы дат
function calculateDateDiff() {
    // Получаем значения дат
    const startDate = new Date(startDateInput.value);
    const endDate = new Date(endDateInput.value);

    if (isNaN(startDate) || isNaN(endDate)) {
        // Одна из дат не задана, не выводим результат
        return;
    }

    // Вычисляем разницу в миллисекундах
    let diff = endDate - startDate;
    // Переводим разницу в нужные единицы измерения
    let seconds = Math.abs(Math.floor(diff / 1000));
    console.log(seconds);
    let minutes = Math.abs(Math.floor(seconds / 60));
    let hours = Math.abs(Math.floor(minutes / 60));
    let days = Math.abs(Math.floor(hours / 24));
    let weeks = Math.abs(Math.floor(days / 7));
    let months = Math.abs(Math.floor(days / 30));
    let years = Math.abs(Math.floor(months / 12));

    // Выводим результат
    document.getElementById("secondsSpan").textContent = seconds + " ";
    //Склонение для секунда
    let secondsText = document.getElementById("secondsText");
    if (seconds % 10 === 1 && seconds !== 11) {
        secondsText.textContent = "секунда";
    } else if (seconds % 10 >= 2 && seconds % 10 <= 4 && !(seconds >= 12 && seconds <= 14)) {
        secondsText.textContent = "секунды";
    } else {
        secondsText.textContent = "секунд";
    }

    document.getElementById("minutesSpan").textContent = minutes + " ";
    //Склонение для минута
    let minutesText = document.getElementById("minutes");
    if (minutes % 10 === 1 && minutes !== 11) {
        minutesText.textContent = "минута";
    } else if (minutes % 10 >= 2 && minutes % 10 <= 4 && !(minutes >= 12 && minutes <= 14)) {
        minutesText.textContent = "минуты";
    } else {
        minutesText.textContent = "минут"; 
    }

    document.getElementById("hoursSpan").textContent = hours + " ";
    //Склонение для час
    let hoursText = document.getElementById("hoursText");
    if (hours % 10 === 1 && hours !== 11) {
        hoursText.textContent = "час";
    } else if (hours % 10 >= 2 && hours % 10 <= 4 && !(hours >= 12 && hours <= 14)) {
        hoursText.textContent = "часа";
    } else {
        hoursText.textContent = "часов";
    }

    document.getElementById("daysSpan").textContent = days + " ";
    //Склонение для день
    let daysText = document.getElementById("daysText");
    if (days % 10 === 1 && days !== 11) {
        daysText.textContent = "день";
    } else if (days % 10 >= 2 && days % 10 <= 4 && !(days >=12 && days <= 14)) {
        daysText.textContent = "дня";
    } else {
        daysText.textContent = "дней";
    }

    document.getElementById("weeksSpan").textContent = weeks + " ";
    //Склонение для неделя
    let weeksText = document.getElementById("weeksText");
    if (weeks % 10 === 1 && weeks !== 11) {
        weeksText.textContent = "неделя";
    } else if (weeks % 10 >= 2 && weeks % 10 <= 4 && !(weeks >= 12 && weeks <= 14)) {
        weeksText.textContent = "недели";
    } else {
        weeksText.textContent = "недель";
    }

    document.getElementById("monthsSpan").textContent = months + " ";
    // Склонение для месяц
    let monthsText = document.getElementById("monthsText");
    if (months % 10 === 1 && months !== 11) {
        monthsText.textContent = "месяц";
    } else if (months % 10 >= 2 && months % 10 <= 4 && !(months >= 12 && months <= 14)) {
        monthsText.textContent = "месяца";
    } else {
        monthsText.textContent = "месяцев"; 
    }

    document.getElementById("yearsSpan").textContent = years + " ";
    // Склонение для лет
    const yearsText = document.getElementById("yearsText");
    if (years === 1) {
        yearsText.textContent = "год";
    } else if (years >= 2 && years <= 4) {
        yearsText.textContent = "года";  
    } else {
        yearsText.textContent = "лет";
    }
}