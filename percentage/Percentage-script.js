// Слои
const gameContainer = document.getElementById('game-container');
const mainContainer = document.getElementById('main-container');
const resultContainer = document.getElementById('result-container');
//главное меню
const goButton = document.getElementById('go-button');
// Игровой слой
const roundSpan = document.getElementById('round')
const questionElement = document.getElementById('question-text');
// Процентное кольцо
const circle = document.getElementById('circle');
const circleMini = document.getElementById('circle-mini');
const differenceElement = document.getElementById('circle-max');
const pointer = document.getElementById('pointer');
const percentText = document.getElementById('percent'); // Новый элемент для отображения процента
const fillElement = document.getElementById('fill');
const correctPercent = document.getElementById('correct-percent');
const estimation = document.getElementById('estimation');
const percentageDifferenceCircle = document.getElementById('percentage-difference-circle');
const percentageDifferenceText = document.getElementById('percentage-difference-text');
const rightPercentage = document.getElementById('right-percentage');
const accruedPoints = document.getElementById('accrued-points');
// Кнопка подтверждения
const button = document.getElementById('confirm-button');
const nextButton = document.getElementById('next-button');

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
const radiusMini = 70; // Радиус круга circleMini

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

// Позиция точки circleMini (по умолчанию - 50%)
let currentMiniPosition = 50;

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
        currentMiniPosition = 0; // Задать минимальную позицию для circleMini
    } else if (angle > maxAngle) {
        currentPosition = 100; // Задать максимальную позицию
        currentMiniPosition = 100; // Задать максимальную позицию для circleMini
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

        // Расчет процента относительно положения красного круга на circleMini
        currentMiniPosition = ((angle - initialAngle) / (2 * Math.PI)) * 100;

        // Поправка на отрицательные значения
        if (currentPosition < 0) {
            currentPosition = 100 + currentPosition;
        }

        // Поправка на отрицательные значения для circleMini
        if (currentMiniPosition < 0) {
            currentMiniPosition = 100 + currentMiniPosition;
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
    circleMini.style.background = `conic-gradient(rgba(46, 49, 145, 1) ${currentMiniPosition}%, rgba(142, 194, 226, 1) ${currentMiniPosition}%)`;

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
    circleMini.style.background = `conic-gradient(rgba(46, 49, 145, 1) ${currentMiniPosition}%, rgba(142, 194, 226, 1) ${currentMiniPosition}%)`;
    percentText.textContent = `${Math.round(currentPosition)}%`;
}

// Функция для начала нового раунда
function startNewRound() {
    currentRound += 1;
    // Показываем кнопку "Продолжить"
    nextButton.style.display = 'none';
    // Скрываем кнопку "Подтвердить"
    button.style.display = 'block';
    roundSpan.textContent = currentRound;
    if (currentRound <= maxRounds) {
        // Сброс интерфейса для нового раунда
        estimation.style.display = "none";
        fillElement.style.display = "none";
        differenceElement.style.display = "none";
        percentageDifferenceCircle.style.display = "none";
        rightPercentage.innerText = "0%";
        accruedPoints.innerText = "0";
        currentPosition = 50;
        currentMiniPosition = 50;
        previousPosition = 50;
        differenceElement.style.background = `conic-gradient(transparent 0%, rgba(10, 0, 28, 0) 0%, rgba(10, 0, 28, 0) ${0}%, rgba(142, 194, 226, 0) ${0}%)`;
        updatePointerPosition();
        // Показ нового вопроса
        showRandomQuestion();
    } else {
        // Окончание игры
        resultEnd();
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

    // Устанавливаем начальное положение элемента percentage-difference-circle
    const initialPercentage = currentQuestion.answer; // Правильный ответ текущего вопроса
    const angleInitial = ((initialPercentage / 100) * 2 * Math.PI) + initialAngle;

    const centerX = circle.getBoundingClientRect().left + radius;
    const centerY = circle.getBoundingClientRect().top + radius;
    const circleX = centerX + radius * Math.cos(angleInitial);
    const circleY = centerY + radius * Math.sin(angleInitial);

    percentageDifferenceCircle.style.left = circleX - percentageDifferenceCircle.offsetWidth / 2 + 'px';
    percentageDifferenceCircle.style.top = circleY - percentageDifferenceCircle.offsetHeight / 2 + 'px';

    function addNextCharacter() {
        if (index < questionText.length) {
            const textWithCaret = questionText.substring(0, index) + '|'; // Добавление каретки
            questionElement.textContent = textWithCaret;
            index++;
            setTimeout(addNextCharacter, 25); // Интервал между символами (30 миллисекунд)
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
    // Проверяем, есть ли еще не заданные вопросы
    if (askedQuestionIndexes.length === questions.length) {
        // Если все вопросы были заданы, сбросим массив и начнем заново
        askedQuestionIndexes = [];
    }

    let randomIndex;
    do {
        // Генерируем случайный индекс
        randomIndex = Math.floor(Math.random() * questions.length);
    } while (askedQuestionIndexes.includes(randomIndex)); // Повторяем, пока индекс не станет уникальным

    // Добавляем индекс в массив заданных вопросов
    askedQuestionIndexes.push(randomIndex);

    return randomIndex;
}

// Обновленная функция handleConfirmClick
function handleConfirmClick() {
    // Выключаем кнопку перед началом стирания текста
    disableButton();
    // Имитация загрузки данных (через setTimeout)
    const currentQuestion = questions[currentQuestionIndex];
    const correctAnswer = currentQuestion.answer; // Правильный ответ
    setTimeout(() => {
        // Имитация загрузки данных (через setTimeout)
        const currentQuestion = questions[currentQuestionIndex];
        const correctAnswer = currentQuestion.answer; // Правильный ответ
        const userAnswer = Math.round(currentPosition); // Ответ пользователя

        // Вычисляем разницу в процентах
        const difference = Math.abs(correctAnswer - userAnswer);
        const isFillingClockwise = currentPosition < correctAnswer;

        estimation.style.display = "flex";
        fillElement.style.display = "block";
        differenceElement.style.display = "block"; // Показываем элемент разницы

        // Настройки анимации
        const startTime = performance.now();
        const duration = 1000; // 1000 мс (1 секунда)
        let fillValue = 0;

        function animateFill(timestamp) {
            const progress = Math.min(1, (timestamp - startTime) / duration);
            fillValue = progress * correctAnswer;
            rightPercentage.innerText = `${Math.round(fillValue)}%`;
            fillElement.style.background = `conic-gradient(transparent 0%, rgba(101, 255, 255, 1) 0%, rgba(101, 255, 255, 1) ${fillValue}%, rgba(142, 194, 226, 0) ${fillValue}%)`;

            if (progress < 1) {
                requestAnimationFrame(animateFill);
            } else {
                // После анимации заполнения fillElement
                rightPercentage.innerText = `${Math.round(correctAnswer)}%`;

                // Общая логика проверки ответа
                const userAnswer = Math.round(fillValue); // Ответ пользователя

                // Рассчет разницы между процентами circleMax и пользователя
                const userPercentage = Math.round(currentPosition); // Процент пользователя
                const difference = Math.abs(correctAnswer - userPercentage);

                // Обновление элемента разницы с анимацией (через requestAnimationFrame)
                let differenceValue = 0;
                const differenceStartTime = performance.now();
                const differenceDuration = 1000; // 1000 мс (1 секунда)

                function animateDifference(timestamp) {
                    const differenceProgress = Math.min(1, (timestamp - differenceStartTime) / differenceDuration);
                    differenceValue = differenceProgress * difference;

                    // Рассчитываем угол в зависимости от условия
                    let degMax;

                    // Здесь происходит изменение способа вычисления degMax
                    if (currentPosition < correctAnswer) {
                        // Заполняем по часовой стрелке
                        degMax = 3.6 * (correctAnswer - differenceValue);
                    } else {
                        // Заполняем против часовой стрелки
                        degMax = 3.6 * correctAnswer;
                    }

                    percentageDifferenceCircle.style.display = "flex";

                    differenceElement.style.transform = `rotate(${degMax}deg)`;
                    differenceElement.style.background = `conic-gradient(transparent 0%, rgba(10, 0, 28, 1) 0%, rgba(10, 0, 28, 1) ${differenceValue}%, rgba(142, 194, 226, 0) ${differenceValue}%)`;

                     // Устанавливаем текст и стили для элемента percentageDifferenceCircle
                    percentageDifferenceText.textContent = `${Math.round(differenceValue)}%`;

                    // Устанавливаем начальное положение элемента percentage-difference-circle
                    const initialPercentage = correctAnswer; // Используйте правильный ответ
                    const angleInitial = ((initialPercentage / 100) * 2 * Math.PI) + initialAngle;

                    const centerX = circle.getBoundingClientRect().left + radius;
                    const centerY = circle.getBoundingClientRect().top + radius;
                    const circleX = centerX + radius * Math.cos(angleInitial);
                    const circleY = centerY + radius * Math.sin(angleInitial);

                    percentageDifferenceCircle.style.left = circleX - percentageDifferenceCircle.offsetWidth / 2 + 'px';
                    percentageDifferenceCircle.style.top = circleY - percentageDifferenceCircle.offsetHeight / 2 + 'px';

                    // Определите, в какую сторону двигаться, и насколько
                    const differenceDirection = currentPosition < correctAnswer ? -1 : 1;
                    const differenceValueToMove = difference / 2;
                    const angleToMove = ((differenceValueToMove / 100) * 2 * Math.PI) * differenceDirection;

                    // Вычислите новое положение элемента percentage-difference-circle
                    const newX = centerX + radius * Math.cos(angleInitial + angleToMove);
                    const newY = centerY + radius * Math.sin(angleInitial + angleToMove);

                    percentageDifferenceCircle.style.left = newX - percentageDifferenceCircle.offsetWidth / 2 + 'px';
                    percentageDifferenceCircle.style.top = newY - percentageDifferenceCircle.offsetHeight / 2 + 'px';

                    if (differenceProgress < 1) {
                        requestAnimationFrame(animateDifference);
                    } else {
                        // После анимации заполнения differenceElement
                        // Рассчет очков в соответствии с новыми правилами
                        let points = 0;
                        if (difference === 0) {
                            points = 3000; // Точный ответ
                        } else if (difference >= 1 && difference <= 30) {
                            points = 3000 - difference * 96; // 1-10% разницы
                        }

                        accruedPoints.innerText = points;

                        score += points;
                        console.log(score);

                        // Имитация полученных очков
                        setTimeout(() => {
                            // Показываем кнопку "Продолжить"
                            nextButton.style.display = 'block';
                            // Скрываем кнопку "Подтвердить"
                            button.style.display = 'none';
                        }, 1000); // Задержка в 1 секунду перед появлением кнопки "Продолжить"
                    }
                }

                requestAnimationFrame(animateDifference);
            }
        }

        requestAnimationFrame(animateFill);

    }, 1000); // Подождем 1 секунду перед показом результатов
}

nextButton.addEventListener('click', startNewRound);

function resultEnd() {
    document.getElementById('result-text').textContent = score;
    document.getElementById('result-container').style.display = "flex";
    document.getElementById('game-container').style.display = "none";
}

document.getElementById('new-game').addEventListener('click', () => {
    currentRound = 1;
    score = 0;
    roundSpan.textContent = currentRound;

    // Сброс интерфейса для нового раунда
    estimation.style.display = "none";
    fillElement.style.display = "none";
    differenceElement.style.display = "none";
    percentageDifferenceCircle.style.display = "none";
    rightPercentage.innerText = "0%";
    accruedPoints.innerText = "0";
    currentPosition = 50;
    currentMiniPosition = 50;
    previousPosition = 50;
    differenceElement.style.background = `conic-gradient(transparent 0%, rgba(10, 0, 28, 0) 0%, rgba(10, 0, 28, 0) ${0}%, rgba(142, 194, 226, 0) ${0}%)`;
    updatePointerPosition();
    // Показ нового вопроса
    showRandomQuestion();

    document.getElementById('result-container').style.display = "none";
    document.getElementById('game-container').style.display = "block";
});

document.getElementById('go-back').addEventListener('click', () => {
    document.getElementById('rules-text').style.display = "none";
});

document.getElementById('rules').addEventListener('click', () => {
    document.getElementById('rules-text').style.display = "flex";
});

document.getElementById('go-button').addEventListener('click', () => {
    document.getElementById('game-container').style.display = "block";
    document.getElementById('main-container').style.display = "none";
});

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