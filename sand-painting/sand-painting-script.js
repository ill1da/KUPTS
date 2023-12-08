const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');
let lineWidthSlider = document.getElementById('line-width-slider');
let lineWidthValue = document.getElementById('line-width-value');
let painting = false;
let erasing = false;
let bucketMode = false;
let actions = []; // Массив для хранения действий
let touchCoordinates = {};
let sprayStartTime;

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

// Обновленные обработчики событий
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

    if (erasing) {
        // Ластик (сплошная линия)
        if (e.touches && e.touches.length > 0) {
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
    } else {
        // Кисть (эффект плавного заполнения линии)
        const sprayDensity = context.lineWidth / 10;
        const sprayRadius = context.lineWidth / 2;
        const sprayDuration = 500; // 1 секунда

        if (e.touches && e.touches.length > 0) {
            for (let i = 0; i < e.touches.length; i++) {
                const touch = e.touches[i];

                if (painting) {
                    const sprayStartTime = Date.now();

                    function spray() {
                        if (!painting) return; // Проверка, активно ли рисование

                        const elapsedTime = Date.now() - sprayStartTime;
                        const progress = Math.min(elapsedTime / sprayDuration, 1);

                        if (progress < 1) {
                            for (let j = 0; j < sprayDensity; j++) {
                                const sandColor = getRandomSandColor();
                                const angle = Math.random() * 2 * Math.PI;
                                const distance = Math.random() * sprayRadius;

                                const offsetX = distance * Math.cos(angle);
                                const offsetY = distance * Math.sin(angle);

                                context.fillStyle = sandColor;
                                context.beginPath();
                                context.arc(touch.clientX + offsetX, touch.clientY + offsetY, 1, 0, 2 * Math.PI);
                                context.fill();
                            }

                            requestAnimationFrame(spray);
                        }
                    }

                    spray();
                }
            }
        } else {
            if (painting) {
                const sprayStartTime = Date.now();

                function spray() {
                    if (!painting) return; // Проверка, активно ли рисование

                    const elapsedTime = Date.now() - sprayStartTime;
                    const progress = Math.min(elapsedTime / sprayDuration, 1);

                    if (progress < 1) {
                        for (let i = 0; i < sprayDensity; i++) {
                            const sandColor = getRandomSandColor();
                            const angle = Math.random() * 2 * Math.PI;
                            const distance = Math.random() * sprayRadius;

                            const offsetX = distance * Math.cos(angle);
                            const offsetY = distance * Math.sin(angle);

                            context.fillStyle = sandColor;
                            context.beginPath();
                            context.arc(e.clientX + offsetX, e.clientY + offsetY, 1, 0, 2 * Math.PI);
                            context.fill();
                        }

                        requestAnimationFrame(spray);
                    }
                }

                spray();
            }
        }
    }
}

function getRandomSandColor() {
    const baseColor = "#BC9167"; // Базовый цвет песка

    // Уменьшенный диапазон отклонений для более мягких оттенков
    const deviation = 20;
    const deltaR = Math.floor(Math.random() * deviation) - deviation / 2;
    const deltaG = Math.floor(Math.random() * deviation) - deviation / 2;
    const deltaB = Math.floor(Math.random() * deviation) - deviation / 2;

    // Применение отклонений к базовому цвету
    const r = Math.max(0, Math.min(255, parseInt(baseColor.slice(1, 3), 16) + deltaR));
    const g = Math.max(0, Math.min(255, parseInt(baseColor.slice(3, 5), 16) + deltaG));
    const b = Math.max(0, Math.min(255, parseInt(baseColor.slice(5, 7), 16) + deltaB));

    // Формирование нового цвета
    const sandColor = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;

    return sandColor;
}


function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
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
}, { passive: false });

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
        e.preventDefault();
        startPosition(e.touches[0]);
        cursorCircle.style.display = 'block';
        updateCursorCirclePosition(e.touches[0].clientX, e.touches[0].clientY);
        makeInterfaceElementsTransparent();
        for (let i = 0; i < e.touches.length; i++) {
            startPosition(e.touches[i]);
        }
    });

    canvas.addEventListener('touchend', (e) => {
        endPosition();
        cursorCircle.style.display = 'none';
        restoreInterfaceElementsOpacity();
        for (let i = 0; i < e.changedTouches.length; i++) {
            endPosition();
        }
    });
}

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    draw(e.touches[0]);
    updateCursorCirclePosition(e.touches[0].clientX, e.touches[0].clientY);
    for (let i = 0; i < e.touches.length; i++) {
        draw(e.touches[i]);
    }
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