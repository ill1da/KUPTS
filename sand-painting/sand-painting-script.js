const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');
let lineWidthSlider = document.getElementById('line-width-slider');
let lineWidthValue = document.getElementById('line-width-value');
let painting = false;
let erasing = false;
let bucketMode = false;
let lastX = 0;
let lastY = 0;
let actions = []; // Массив для хранения действий
let touchCoordinates = {};

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

context.lineWidth = 15;
context.lineCap = 'round';
context.strokeStyle = '#825937';

lineWidthSlider.addEventListener('input', () => {
    context.lineWidth = lineWidthSlider.value;
    lineWidthValue.textContent = lineWidthSlider.value;
});

function makeInterfaceElementsTransparent() {
    const interfaceElements = document.querySelectorAll('.interface-element');
    interfaceElements.forEach(element => {
        element.style.transition = 'opacity 0.16s ease-in-out'; // Добавляем плавный переход
        element.style.opacity = 0.2; // Устанавливаем желаемую прозрачность (от 0 - полностью прозрачный до 1 - непрозрачный)
        element.style.pointerEvents = 'none';
    });
}

function restoreInterfaceElementsOpacity() {
    const interfaceElements = document.querySelectorAll('.interface-element');
    interfaceElements.forEach(element => {
        element.style.transition = 'opacity 0.16s ease-in-out'; // Добавляем плавный переход
        element.style.opacity = 1; // Восстанавливаем полную непрозрачность
        element.style.pointerEvents = 'auto';
    });
}

// Обработчик события для кнопки "Кисть"
const brushButton = document.getElementById('brush');
brushButton.addEventListener('click', () => {
    erasing = false;
    bucketMode = false;
    setButtonActive(brushButton);
    setButtonInactive(eraserButton);
    setButtonInactive(document.getElementById('bucket'));
    context.globalCompositeOperation = 'source-over'; // Возвращаем режим кисти
    cursorCircle.style.borderStyle = 'solid'; // Тонкий круг становится сплошным
    cursorCircle.style.borderColor = '#17191D'; // И черным
});

// Обработчик события для кнопки "Ластик"
const eraserButton = document.getElementById('eraser');
eraserButton.addEventListener('click', () => {
    erasing = true;
    bucketMode = false;
    setButtonActive(eraserButton);
    setButtonInactive(document.getElementById('brush'));
    setButtonInactive(document.getElementById('bucket'));
    context.globalCompositeOperation = 'destination-out'; // Устанавливаем режим ластика
    cursorCircle.style.borderStyle = 'dashed'; // Тонкий круг становится пунктирным
    cursorCircle.style.borderColor = '#17191D'; // И черным
});

// Обработчик события для кнопки "Ведро"
const bucketButton = document.getElementById('bucket');
bucketButton.addEventListener('click', () => {
    // Отображаем модальное окно
    const confirmModal = document.getElementById('confirm-modal');
    confirmModal.style.display = 'flex';

    document.getElementById('confirm-yes').addEventListener('click', () => {
        // Если пользователь нажал "Да", очищаем канву и обнуляем массив действий
        context.clearRect(0, 0, canvas.width, canvas.height);
        actions = [];
        confirmModal.style.display = 'none'; // Закрываем модальное окно
    });

    document.getElementById('confirm-no').addEventListener('click', () => {
        // Если пользователь нажал "Нет", закрываем модальное окно
        confirmModal.style.display = 'none';
    });
    restoreInterfaceElementsOpacity(); // Восстанавливаем непрозрачность элементов интерфейса
});

// Обработчик события для кнопки "Отмена"
const cancelButton = document.getElementById('cancel');
cancelButton.addEventListener('click', () => {
    if (actions.length > 0) {
        // Если есть действия, отменяем последнее и перерисовываем канву
        actions.pop();
        context.clearRect(0, 0, canvas.width, canvas.height);
        actions.forEach(action => context.putImageData(action, 0, 0));
    }
    restoreInterfaceElementsOpacity(); // Восстанавливаем непрозрачность элементов интерфейса
});

function startPosition(e) {
    makeInterfaceElementsTransparent();

    if (bucketMode) {
        const confirmModal = document.getElementById('confirm-modal');
        confirmModal.style.display = 'block';
    } else {
        painting = true;

        if (e.touches) {
            // Если это событие мультитача, то для каждого touch хранить свои координаты
            for (let i = 0; i < e.touches.length; i++) {
                const touch = e.touches[i];
                touchCoordinates[touch.identifier] = {
                    lastX: touch.clientX,
                    lastY: touch.clientY,
                };
            }
        } else {
            [lastX, lastY] = [e.clientX, e.clientY];
        }

        draw(e);
    }
}

function endPosition() {
    restoreInterfaceElementsOpacity();
    painting = false;
    context.beginPath();
    actions.push(context.getImageData(0, 0, canvas.width, canvas.height));
    touchCoordinates = {}; // Очищаем координаты для мультитача
}

function draw(e) {
    if (!painting) return;

    context.beginPath();

    if (e.touches && e.touches.length > 0) {
        // Если это событие мультитача, то рисуем для каждого touch'а независимо
        for (let i = 0; i < e.touches.length; i++) {
            const touch = e.touches[i];
            const touchCoord = touchCoordinates[touch.identifier];
            
            context.moveTo(touchCoord.lastX, touchCoord.lastY);
            context.lineTo(touch.clientX, touch.clientY);
            context.stroke();

            touchCoordinates[touch.identifier] = {
                lastX: touch.clientX,
                lastY: touch.clientY,
            };
        }
    } else {
        context.moveTo(lastX, lastY);
        context.lineTo(e.clientX, e.clientY);
        context.stroke();
        [lastX, lastY] = [e.clientX, e.clientY];
    }
}

const cursorCircle = document.getElementById('cursor-circle');

function updateCursorCircleSize() {
    const cursorSize = context.lineWidth;
    cursorCircle.style.width = `${cursorSize}px`;
    cursorCircle.style.height = `${cursorSize}px`;
}

function updateCursorCirclePosition(x, y) {
    cursorCircle.style.left = `${x}px`;
    cursorCircle.style.top = `${y}px`;
}

// Добавлен код для отслеживания перемещения курсора на всей странице
document.addEventListener('mousemove', (e) => {
    updateCursorCirclePosition(e.clientX, e.clientY);
});

// Обновление размера и позиции круга при изменении размера кисти
lineWidthSlider.addEventListener('input', () => {
    context.lineWidth = lineWidthSlider.value;
    lineWidthValue.textContent = lineWidthSlider.value;
    updateCursorCircleSize();
});

canvas.addEventListener('mousemove', (e) => {
    updateCursorCirclePosition(e.clientX, e.clientY);
});

canvas.addEventListener('touchmove', (e) => {
    const touch = e.touches[0];
    updateCursorCirclePosition(touch.clientX, touch.clientY);
});

// При старте устанавливаем начальный размер круга
updateCursorCircleSize();

canvas.addEventListener('mousedown', startPosition);
canvas.addEventListener('mouseup', endPosition);
canvas.addEventListener('mousemove', draw);

// Новый код для управления видимостью тонкого круга на телефонах
let isTouchDevice = ('ontouchstart' in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0);

if (isTouchDevice) {
    cursorCircle.style.display = 'none'; // Скрываем круг по умолчанию на телефонах

    canvas.addEventListener('touchstart', (e) => {
        // Проверяем, проводятся ли три пальца вниз
        if (e.touches.length === 3) {
            e.preventDefault();
            // Тут вы можете добавить код, который выполнится, когда проводятся три пальца вниз
            // Например, можно не делать ничего, или выполнить какие-то другие действия.
        } else {
            startPosition(e);
        }
        cursorCircle.style.display = 'block'; // Показываем круг при касании
        updateCursorCirclePosition(e.touches[0].clientX, e.touches[0].clientY); // Обновляем позицию круга под пальцем
        makeInterfaceElementsTransparent();
    });

    canvas.addEventListener('touchend', () => {
        endPosition();
        cursorCircle.style.display = 'none'; // Скрываем круг после окончания касания
        restoreInterfaceElementsOpacity();
    });
}

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    draw(e);
    updateCursorCirclePosition(e.touches[0].clientX, e.touches[0].clientY); // Обновляем позицию круга при перемещении пальца
});

// Функция для установки активной кнопки
function setButtonActive(button) {
    button.classList.add('active');
}

// Функция для снятия активности с кнопки
function setButtonInactive(button) {
    button.classList.remove('active');
}

// Настройка эффекта песчаных частиц
particlesJS('particles-js', {
    "particles": {
        "number": {
            "value": 50000,
            "density": {
                "enable": false,
            }
        },
        "color": {
            "value": ["#F0C690", "#E3BA7B", "#CC9966", "#F5C896"]
        },
        "shape": {
            "type": "circle"
        },
        "opacity": {
            "value": 0.7,
            "random": true
        },
        "size": {
            "value": 3,
            "random": true
        },
        "line_linked": {
            "enable": false
        },
        "move": {
            "enable": false,
        }
    },
    "interactivity": {
        "events": {
            "onhover": {
                "enable": false,
                "mode": "repulse"
            }
        }
    }
});