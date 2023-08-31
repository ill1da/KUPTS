//Список фактов
const facts = [
    "А",
    "Б"
]

const factCard = document.getElementById("fact-card");
const factText = document.getElementById("fact-text");
const cardContainer = document.getElementById("card-container")

//Текущий индекс факта в массиве
let currentFactIndex = 0;
//Начальная X координата прикосновения
let touchStartX = 0;

//Функция для отображения текущего факта
function displayFact(index) {
    factText.textContent = facts[index]; 
}

//Изначальное отобрадение факта
displayFact(currentFactIndex);

//Обработчики свайпа
factCard.addEventListener("touchstart", function(event){
    // Запоминаем начальную X координату
    touchStartX = event.touches[0].clientX;
});

factCard.addEventListener("touchmove", function(event){
    const touchMoveX = event.touches[0].clientX;
    const deltaX = touchMoveX - touchStartX;
    //Сдвигаем карточку
    factCard.style.transform = `translateX(${deltaX}px)`;
});

factCard.addEventListener("touchend", function(event) {
    const touchEndX = event.changedTouches[0].clientX;
    const deltaX = touchEndX - touchStartX;

    if (Math.abs(deltaX) >= factCard.offsetWidth * 0.1) {
        //Убираем карточку и показываем следующий факт
        factCard.style.transform = "translateX(-100%)";

        setTimeout(() => {
            // Переходим к следующему факту
            currentFactIndex = (currentFactIndex + 1) % facts.length;
            displayFact(currentFactIndex);
            factCard.style.transform = "translateX(0)";
        }, 300);
    } else {
        // Возвращаем карточку в исходное положение
        factCard.style.transform = "translateX(0)";
    }
});