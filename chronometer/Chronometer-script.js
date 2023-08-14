// 🎉 🎉 🎉 Счетчики праздников 🎉 🎉 🎉
//Получение элементов прогресс-баров
const secondsBar = document.getElementById("secondsBar"); const secondsValue = document.getElementById("seconds");
const minutesBar = document.getElementById("minutesBar"); const minutes = document.getElementById("minutes");
const hoursBar = document.getElementById("hoursBar"); const hours = document.getElementById("hours");
const dayWeekBar = document.getElementById("dayWeekBar"); const dayWeek = document.getElementById("dayWeek");
const dayMonthBar = document.getElementById("dayMonthBar"); const dayMont = document.getElementById("dayMonth");
const dayNewYearBar = document.getElementById("dayNewYearBar"); const dayNewYear = document.getElementById("dayNewYear");
const dayChristmasBar = document.getElementById("dayChristmasBar"); const dayChristmas = document.getElementById("dayChristmas"); const ChristmasDate = new Date(null, 0, 7);
const dayLoveBar = document.getElementById("dayLoveBar"); const dayLove = document.getElementById("dayLove"); const LoveDate = new Date(null, 1, 14);
const dayDefenderBar = document.getElementById("dayDefenderBar"); const dayDefender = document.getElementById("dayDefender"); const DefenderDate = new Date(null, 1, 23);
const dayWomanBar = document.getElementById("dayWomanBar"); const dayWoman = document.getElementById("dayWoman"); const WomanDate = new Date(null, 2, 8);
const dayMayBar = document.getElementById("dayMayBar"); const dayMay = document.getElementById("dayMay"); const MayDate = new Date(null, 4, 1);
const dayVictoryBar = document.getElementById("dayVictoryBar"); const dayVictory = document.getElementById("dayVictory"); const VictoryDate = new Date(null, 4, 9);
const dayRussiaBar = document.getElementById("dayRussiaBar"); const dayRussia = document.getElementById("dayRussia"); const RussiaDate = new Date(null, 5, 12);
const dayUnityBar = document.getElementById("dayUnityBar"); const dayUnity = document.getElementById("dayUnity"); const UnityDate = new Date(null, 10, 4);

// Функция обновления прогресс-баров
function updateProgressBars() {
    //Получаем текущее время
    const now = new Date();

    //Обновляем значения
//Секунд до конца минуты
    secondsBar.value = now.getSeconds();
    seconds.textContent = 60-secondsBar.value;
//Минут до конца часа
    minutesBar.value = now.getMinutes();
    minutes.textContent = 60-minutesBar.value;
//Часов до конца Дня
    hoursBar.value = now.getHours();
    hours.textContent = 24-hoursBar.value;
//Дней до конца недели
    let dayOfWeek = now.getDay();
    let daysToWeekend = 7 - dayOfWeek;
    if (dayOfWeek === 7){
        daysToWeekend = 1;
    }
    dayWeekBar.max = 7;
    dayWeekBar.value = daysToWeekend;
    dayWeek.textContent = 7 - dayWeekBar.value;
//Дней до конца месяца
    //Получаем текущий год и месяц
    let curMonth = now.getMonth();
    let curYear = now.getFullYear();
    //Получаем последний день месяца
    let lastDayOfMonth = new Date(curYear, curMonth + 1, 0).getDate();
    //Текущий день месяца
    let curDayOfMonth = now.getDate();
    //Рассчет дней до конца
    const daysToMonthEnd = lastDayOfMonth - curDayOfMonth;
    //Обновляем прогресс-бар
    dayMonthBar.max = lastDayOfMonth;
    dayMonthBar.value = daysToMonthEnd;
    dayMont.textContent = daysToMonthEnd;
//Дней до нового года
    let isLeapYear = new Date(curYear, 1, 29).getMonth() === 1;
    //Кол-во дней в году
    let daysInYear = isLeapYear ? 366 : 365; 
    //Номер текущего дня в году
    const dayNum = getDayOfYear(now);

    dayNewYearBar.max = daysInYear;
    dayNewYearBar.value = dayNum;
    dayNewYear.textContent = daysInYear - dayNum;

    function getDayOfYear(date){
        // Получаем год
        const year = date.getFullYear();
        // Проверяем високосный год
        const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
        // Количество дней по умолчанию
        let days = 365;
        // Массив с количеством дней в месяцах
        const monthDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];  
        // Для високосного года 
        if (isLeapYear) {
            monthDays[1] = 29;
            days = 366;
        }
        // Считаем дни в предыдущих месяцах
        let totalDays = 0;

        for (let i = 0; i < date.getMonth(); i++) {
            totalDays += monthDays[i];
        }
        // Прибавляем дни в текущем месяце
        totalDays += date.getDate();
        // Возвращаем номер дня в году
        return totalDays;
    }
//Дней до рождества
    // Устанавливаем целевую дату в этом году
    ChristmasDate.setFullYear(now.getFullYear());
    //Если в этом году уже прошла
    if (now > ChristmasDate) {
        //Устанавливаем на следующий год
        ChristmasDate.setFullYear(now.getFullYear() + 1);
    }
// Дней до Рождества
    let dayToChristmas = getDayOfYear(ChristmasDate) - dayNum;
    dayChristmasBar.max = daysInYear;
    dayChristmasBar.value = daysInYear - (daysInYear + dayToChristmas);
    dayChristmas.textContent = daysInYear + dayToChristmas;
//Дней до дня всех влюбленных
    // Устанавливаем целевую дату в этом году
    LoveDate.setFullYear(now.getFullYear());
    //Если в этом году уже прошла
    if (now > LoveDate) {
        //Устанавливаем на следующий год
        LoveDate.setFullYear(now.getFullYear() + 1);
    }
    let dayToLove = getDayOfYear(LoveDate) - dayNum;
    dayLoveBar.max = daysInYear;
    dayLoveBar.value = daysInYear - (daysInYear + dayToLove);
    dayLove.textContent = daysInYear + dayToLove;
//Дней до Дня защитника Отечества
    DefenderDate.setFullYear(now.getFullYear());
    if (now > DefenderDate) {
        DefenderDate.setFullYear(now.getFullYear() + 1);
    }
    let dayToDefender = getDayOfYear(DefenderDate) - dayNum;
    dayDefenderBar.max = daysInYear;
    dayDefenderBar.value = daysInYear - (daysInYear + dayToDefender);
    dayDefender.textContent = daysInYear + dayToDefender;
//Дней до Международного женского деня
    WomanDate.setFullYear(now.getFullYear());
    if (now > WomanDate) {
        WomanDate.setFullYear(now.getFullYear() + 1);
    }
    let dayToWoman = getDayOfYear(WomanDate) - dayNum;
    dayWomanBar.max = daysInYear;
    dayWomanBar.value = daysInYear - (daysInYear + dayToWoman);
    dayWoman.textContent = daysInYear + dayToWoman;
//Дней до 1 мая
    MayDate.setFullYear(now.getFullYear());
    if (now > MayDate) {
        MayDate.setFullYear(now.getFullYear() + 1);
    }
    let dayToMay =  getDayOfYear(MayDate) - dayNum;
    dayMayBar.max = daysInYear;
    dayMayBar.value = daysInYear - (daysInYear + dayToMay);
    dayMay.textContent = daysInYear + dayToMay;
//Дней до Дня Победы
    VictoryDate.setFullYear(now.getFullYear());
    if (now > VictoryDate) {
        VictoryDate.setFullYear(now.getFullYear() + 1);
    }
    let dayToVictory = getDayOfYear(VictoryDate) - dayNum;
    dayVictoryBar.max = daysInYear;
    dayVictoryBar.value = daysInYear - (daysInYear + dayToVictory);
    dayVictory.textContent = daysInYear + dayToVictory;
//Дней до Дня России
    RussiaDate.setFullYear(now.getFullYear());
    if (now > RussiaDate) {
        RussiaDate.setFullYear(now.getFullYear() + 1);
    }
    let dayToRussia = getDayOfYear(RussiaDate) - dayNum;
    dayRussiaBar.max = daysInYear;
    dayRussiaBar.value = daysInYear - (daysInYear + dayToRussia);
    dayRussia.textContent = daysInYear + dayToRussia;
//Дней до Дня народного единства
    UnityDate.setFullYear(now.getFullYear());
    if (now > UnityDate) {
        UnityDate.setFullYear(now.getFullYear() + 1);
    }
    let dayToUnity = getDayOfYear(UnityDate) - dayNum;
    dayUnityBar.max = daysInYear;
    if (dayToUnity > 0){
        dayUnityBar.value = daysInYear - dayToUnity;
        dayUnity.textContent = daysInYear - dayUnityBar.value;
    } else {
        dayUnityBar.value = daysInYear - (daysInYear + dayToUnity);
        dayUnity.textContent = daysInYear - dayToUnity;        
    }
    //Вызов функции каждую секунду
    setTimeout(updateProgressBars, 1000);
}

updateProgressBars();



// 📅 📅 📅 КАЛЕНДАРЬ 📅 📅 📅
