const container = document.getElementById('sequins-container');
const sequinSize = 60; // Размер пайетки
const overlapRatio = 0.55; // Коэффициент наложения
const screenHeight = window.innerHeight;
const rowCount = Math.ceil(screenHeight / (sequinSize * overlapRatio)) + 2; // Добавляем дополнительный ряд сверху и снизу
const colCount = Math.ceil(window.innerWidth / sequinSize) + 1; // Количество колонок
const sequins = [];
const flipRadius = 60; 
let colors = [];

// Генерация случайных цветов
function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

// Функция для затемнения цвета
function shadeColor(color, percent) {
    var num = parseInt(color.slice(1),16),
        amt = Math.round(2.55 * percent),
        R = (num >> 16) + amt,
        G = (num >> 8 & 0x00FF) + amt,
        B = (num & 0x0000FF) + amt;
    return "#" + (
        0x1000000 +
        (R<255?R<1?0:R:255)*0x10000 +
        (G<255?G<1?0:G:255)*0x100 +
        (B<255?B<1?0:B:255)
    ).toString(16).slice(1);
}

// Создание пайеток
function createSequins() {
    colors = Array.from({ length: rowCount * colCount }, () => getRandomColor());

    for (let i = 0; i < rowCount; i++) {
        for (let j = 0; j < colCount; j++) {
            const sequin = document.createElement('div');
            sequin.classList.add('sequin');
            const xOffset = (j * sequinSize) - (i % 2) * (sequinSize / 2);
            const yOffset = i * sequinSize * overlapRatio - sequinSize * overlapRatio;
            sequin.style.left = `${xOffset}px`;
            sequin.style.top = `${yOffset}px`;
            // Устанавливаем z-index: верхние ряды имеют больший z-index
            sequin.style.zIndex = (rowCount - i) * 2;
            sequin.dataset.index = i * colCount + j;
            sequin.dataset.row = i; // Сохраняем индекс ряда
            container.appendChild(sequin);
            sequins.push(sequin);
        }
    }
}

// Обработка переворота пайеток
function flipSequins(x, y, isUpward) {
    sequins.forEach(sequin => {
        const rect = sequin.getBoundingClientRect();
        const sequinX = rect.left + rect.width / 2;
        const sequinY = rect.top + rect.height / 2;
        const distance = Math.hypot(x - sequinX, y - sequinY);

        if (distance < flipRadius) {
            const index = sequin.dataset.index;
            const row = parseInt(sequin.dataset.row);
            if (isUpward && !sequin.classList.contains('flipped')) {
                sequin.classList.add('flipped');
                const darkColor = shadeColor(colors[index], -40); // Затемняем цвет на 40%
                sequin.style.backgroundImage = `linear-gradient(to bottom, ${darkColor}, ${colors[index]})`;
                // Изменяем z-index: нижние ряды имеют больший z-index
                sequin.style.zIndex = (row * 2) + 1; // Используем нечетные значения
            } else if (!isUpward && sequin.classList.contains('flipped')) {
                sequin.classList.remove('flipped');
                sequin.style.backgroundImage = 'linear-gradient(to bottom, #222, #444)';
                // Возвращаем z-index: верхние ряды имеют больший z-index
                sequin.style.zIndex = (rowCount - row) * 2; // Используем четные значения
            }
        }
    });
}

// Функция для получения позиции касания или мыши
function getTouchOrMousePosition(event) {
    if (event.touches) {
        return { x: event.touches[0].clientX, y: event.touches[0].clientY };
    } else {
        return { x: event.clientX, y: event.clientY };
    }
}

// Обработчики событий мыши
let isMouseDown = false;
let lastY = 0;

document.addEventListener('mousedown', (e) => {
    isMouseDown = true;
    lastY = e.clientY;
});

document.addEventListener('mouseup', () => {
    isMouseDown = false;
});

document.addEventListener('mousemove', (e) => {
    if (isMouseDown) {
        const { x, y } = getTouchOrMousePosition(e);
        const isUpward = y < lastY;
        flipSequins(x, y, isUpward);
        lastY = y;
    }
});

// Обработчики событий касания
document.addEventListener('touchstart', (e) => {
    isMouseDown = true;
    const { y } = getTouchOrMousePosition(e);
    lastY = y;
});

document.addEventListener('touchend', () => {
    isMouseDown = false;
});

document.addEventListener('touchmove', (e) => {
    if (isMouseDown) {
        const { x, y } = getTouchOrMousePosition(e);
        const isUpward = y < lastY;
        flipSequins(x, y, isUpward);
        lastY = y;
    }
});

// Инициализация пайеток
createSequins();
