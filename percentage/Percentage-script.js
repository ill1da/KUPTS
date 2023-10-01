// Слои
const gameContainer = document.getElementById('game-container');
const mainContainer = document.getElementById('main-container');
const resultContainer = document.getElementById('result-container');

// Игровой слой
const roundSpan = document.getElementById('round')
const questionElement = document.getElementById('question-text');
// Процентное кольцо
const circle = document.getElementById('circle');
const pointer = document.getElementById('pointer');
const percentText = document.getElementById('percent'); // Новый элемент для отображения процента
const fillElement = document.getElementById('fill');
const correctPercent = document.getElementById('correct-percent');
const estimation = document.getElementById('estimation');
const rightPercentage = document.getElementById('right-percentage');
const accruedPoints = document.getElementById('accrued-points');
// Кнопка подтверждения
const button = document.getElementById('confirm-button');

let questions = []; // Здесь будут храниться вопросы и ответы из JSON
let firstQuestionShown = false; // Флаг для отслеживания первого показанного вопроса

// Добавьте следующую переменную в ваш код перед функцией `startGame`:
let askedQuestionIndexes = [];

let currentRound = 1; // Текущий раунд
const maxRounds = 8; // Максимальное количество раундов

// Функция для загрузки JSON-файла
async function loadJSONFile(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return await response.json();
    } catch (error) {
        console.error('Error loading JSON:', error);
        return null;
    }
}

// Радиус круга
const radius = 100;

// Начальный угол для самой верхней точки
const initialAngle = -Math.PI / 2;

// Минимальный угол, чтобы предотвратить сброс градиентной заливки
const minAngle = -Math.PI + 0.001;

// Максимальный угол (полный оборот)
const maxAngle = initialAngle + 2 * Math.PI;

// Флаг, показывающий, что пользователь начал перетаскивать точку
let isDragging = false;

// Позиция точки (по умолчанию - 50%)
let currentPosition = 50;

// Обновление положения точки в соответствии с текущей позицией
updatePointerPosition();

// Обработчики событий
pointer.addEventListener('mousedown', startDragging);
pointer.addEventListener('touchstart', startDragging);

document.addEventListener('mousemove', drag);
document.addEventListener('touchmove', drag);

document.addEventListener('mouseup', stopDragging);
document.addEventListener('touchend', stopDragging);

// Функция начала перетаскивания
function startDragging(evt) {
    isDragging = true;
    pointer.style.transition = 'none';

    // Если текущая позиция равна 0% или 100%, запретить двигать влево или вправо
    if (currentPosition === 0 || currentPosition === 100) {
        return;
    }

    drag(evt);
}

// Предыдущее корректное значение процента
let previousPosition = 50;

// Функция перетаскивания
function drag(evt) {
    if (!isDragging) return;

    let x, y;

    if (evt.type === 'touchmove') {
        x = evt.touches[0].clientX;
        y = evt.touches[0].clientY;
    } else {
        x = evt.clientX;
        y = evt.clientY;
    }

    // Расчет угла относительно центра основного круга
    const centerX = circle.getBoundingClientRect().left + radius;
    const centerY = circle.getBoundingClientRect().top + radius;
    const angle = Math.atan2(y - centerY, x - centerX);

    // Проверка минимального угла и максимального угла (полный оборот)
    if (angle < minAngle) {
        currentPosition = 0; // Задать минимальную позицию
    } else if (angle > maxAngle) {
        currentPosition = 100; // Задать максимальную позицию
    } else {
        const degrees = (angle * 180) / Math.PI;

        // Расчет положения точки на контуре круга
        const pointerX = centerX + radius * Math.cos(angle);
        const pointerY = centerY + radius * Math.sin(angle);

        // Установка положения маленькой точки
        pointer.style.left = pointerX - circle.getBoundingClientRect().left + 'px';
        pointer.style.top = pointerY - circle.getBoundingClientRect().top + 'px';

        // Расчет процента относительно положения красного круга на основном
        currentPosition = ((angle - initialAngle) / (2 * Math.PI)) * 100;

        // Поправка на отрицательные значения
        if (currentPosition < 0) {
            currentPosition = 100 + currentPosition;
        }

        // Если currentPosition становится NaN, установить его в предыдущее корректное значение
        if (isNaN(currentPosition)) {
            currentPosition = previousPosition;
        } else {
            // Обновить предыдущее корректное значение
            previousPosition = currentPosition;
        }
    }

    // Обновление заполнения круга градиентом
    circle.style.background = `conic-gradient(rgba(46, 49, 145, 1) ${currentPosition}%, rgba(142, 194, 226, 1) ${currentPosition}%)`;

    // Обновление отображения процента
    percentText.textContent = `${Math.round(currentPosition)}%`;
}

// Функция завершения перетаскивания
function stopDragging() {
    isDragging = false;
    pointer.style.transition = 'left 0.5s ease-in-out, top 0.5s ease-in-out';
}

// Функция обновления положения точки на основе текущей позиции
function updatePointerPosition() {
    const angle = ((currentPosition / 100) * 2 * Math.PI) + initialAngle;
    const centerX = circle.getBoundingClientRect().left + radius;
    const centerY = circle.getBoundingClientRect().top + radius;
    const pointerX = centerX + radius * Math.cos(angle);
    const pointerY = centerY + radius * Math.sin(angle);
    pointer.style.left = pointerX - circle.getBoundingClientRect().left + 'px';
    pointer.style.top = pointerY - circle.getBoundingClientRect().top + 'px';
    circle.style.background = `conic-gradient(rgba(46, 49, 145, 1) ${currentPosition}%, rgba(142, 194, 226, 1) ${currentPosition}%)`;
    percentText.textContent = `${Math.round(currentPosition)}%`;
}

// Функция для начала нового раунда
function startNewRound() {
    currentRound += 1;
    roundSpan.textContent = currentRound;
    if (currentRound <= maxRounds) {
        // Сброс интерфейса для нового раунда
        estimation.style.display = "none";
        fillElement.style.display = "none";
        rightPercentage.innerText = "0%";
        accruedPoints.innerText = "0";
        currentPosition = 50;
        previousPosition = 50;
        updatePointerPosition();
        // Показ нового вопроса
        showRandomQuestion();
    } else {
        // Окончание игры
        alert("Игра окончена. Все раунды завершены!");
    }
}

// Обработчик нажатия на кнопку "ПОДТВЕРДИТЬ"
button.addEventListener('click', handleConfirmClick);

// Функция для начала игры
function startGame() {
    showRandomQuestion();
}

let currentQuestionIndex = -1; // Индекс текущего вопроса
let score = 0; // Счет игрока

// Функция для включения кнопки
function enableButton() {
    pointer.style.display = "block";
    button.disabled = false;
}

// Функция для выключения кнопки
function disableButton() {
    pointer.style.display = "none";
    button.disabled = true;
}

// Функция для отображения случайного вопроса с эффектом печатающегося текста и кареткой
function showRandomQuestion() {
    currentQuestionIndex = getRandomQuestionIndex();
    const currentQuestion = questions[currentQuestionIndex];
    const questionText = currentQuestion.question;
    questionElement.textContent = ''; // Очистить текстовый элемент

    let index = 0;

    // Выключаем кнопку перед началом анимации
    disableButton();

    function addNextCharacter() {
        if (index < questionText.length) {
            const textWithCaret = questionText.substring(0, index) + '|'; // Добавление каретки
            questionElement.textContent = textWithCaret;
            index++;
            setTimeout(addNextCharacter, 40); // Интервал между символами (40 миллисекунд)
        } else {
            // Убрать каретку после окончания анимации
            questionElement.textContent = questionText;
            // По окончании анимации, сбросить положение точки и обновить интерфейс
            updatePointerPosition();
            // Включаем кнопку после окончания анимации
            enableButton();
        }
    }

    addNextCharacter();
}

// Функция для получения случайного индекса вопроса
function getRandomQuestionIndex() {
    return Math.floor(Math.random() * questions.length);
}

// Функция для обработки нажатия на кнопку "ПОДТВЕРДИТЬ"
function handleConfirmClick() {
    // Выключаем кнопку перед началом стирания текста
    disableButton();
    // Имитация загрузки данных (через setTimeout)
    const currentQuestion = questions[currentQuestionIndex];
    const correctAnswer = currentQuestion.answer; // Правильный ответ
    setTimeout(() => {
        estimation.style.display = "flex";
        fillElement.style.display = "block"

        // Имитация заполнения fill (круга) с анимацией (через requestAnimationFrame)
        let fillValue = 0;
        const startTime = performance.now();
        const duration = 1000; // 1000 мс (1 секунда)

        function animateFill(timestamp) {
            const progress = Math.min(1, (timestamp - startTime) / duration);
            fillValue = progress * correctAnswer;
            rightPercentage.innerText = `${Math.round(fillValue)}%`;
            fillElement.style.background = `conic-gradient(transparent 0%, rgba(16, 156, 134, 1) 0%, rgba(16, 156, 134, 1) ${fillValue}%, rgba(142, 194, 226, 0) ${fillValue}%)`;
            
            if (progress < 1) {
                requestAnimationFrame(animateFill);
            } else {
                // После анимации заполнения
                rightPercentage.innerText = `${Math.round(correctAnswer)}%`;

                // Общая логика проверки ответа
                const userAnswer = Math.round(fillValue); // Ответ пользователя

                // Рассчет разницы между ответами
                const difference = Math.abs(userAnswer - correctAnswer);
                console.log("difference " + difference);

                // Рассчет очков в соответствии с новыми правилами
                let points = 0;
                if (difference === 0) {
                    points = 3000; // Точный ответ
                } else if (difference >= 1 && difference <= 10) {
                    points = 3000 - difference * 100; // 1-10% разницы
                } else if (difference >= 11 && difference <= 30) {
                    points = 3000 - 1000 - (difference - 10) * 50; // 11-30% разницы
                }

                // Добавление очков к счету
                accruedPoints.innerText = points;

                // Имитация полученных очков
                setTimeout(startNewRound, 2000); // Переход к следующему раунду через 2 секунды
            }
        }

        requestAnimationFrame(animateFill);

    }, 1000); // Подождем 1 секунду перед показом результатов
}

// Вызов функции для загрузки JSON-файла сразу после загрузки страницы
window.addEventListener('load', () => {
    loadJSONFile('./Percentage-source/questions.json').then(data => {
        if (data) {
            questions = data;
            if (questions.length > 0) {
                startGame(); // Начать игру после загрузки вопросов
            } else {
                console.error('No questions loaded.');
            }
        }
    });
});