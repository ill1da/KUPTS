const container = document.getElementById('sequins-container');
const sequinSize = 60;
const overlapRatio = 0.55;
const screenHeight = window.innerHeight;
const rowCount = Math.ceil(screenHeight / (sequinSize * overlapRatio)) + 2;
const colCount = Math.ceil(window.innerWidth / sequinSize) + 1;
const sequins = [];
const flipRadius = 60;
let colors = [];
let lastPosition = { x: 0, y: 0 }; // Храним последнюю позицию

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

            sequin.style.zIndex = 2000 + (rowCount - i);

            sequin.dataset.index = i * colCount + j;
            sequin.dataset.row = i;

            // Добавляем оптимизацию анимации через will-change
            sequin.style.willChange = 'transform, background-color';

            container.appendChild(sequin);
            sequins.push(sequin);
        }
    }
}

// Интерполяция движения для покрытия пробелов
function interpolatePositions(x1, y1, x2, y2, steps) {
    const positions = [];
    const stepX = (x2 - x1) / steps;
    const stepY = (y2 - y1) / steps;

    for (let i = 0; i <= steps; i++) {
        positions.push({ x: x1 + stepX * i, y: y1 + stepY * i });
    }

    return positions;
}

// Обновляем пайетки с помощью requestAnimationFrame
let animationFrame;
function flipSequins(x, y, isUpward) {
    cancelAnimationFrame(animationFrame); // Отменяем предыдущий кадр, если он есть
    animationFrame = requestAnimationFrame(() => {
        const positions = interpolatePositions(lastPosition.x, lastPosition.y, x, y, 10); // Интерполируем по пути

        positions.forEach(pos => {
            sequins.forEach(sequin => {
                const rect = sequin.getBoundingClientRect();
                const sequinX = rect.left + rect.width / 2;
                const sequinY = rect.top + rect.height / 2;
                const distance = Math.hypot(pos.x - sequinX, pos.y - sequinY);

                if (distance < flipRadius) {
                    const index = sequin.dataset.index;
                    const i = parseInt(sequin.dataset.row);

                    if (isUpward && !sequin.classList.contains('flipped')) {
                        sequin.classList.add('flipped');
                        sequin.style.zIndex = 1000 + i;

                        const darkColor = shadeColor(colors[index], -40);
                        sequin.style.backgroundImage = `linear-gradient(to bottom, ${darkColor}, ${colors[index]})`;
                    } else if (!isUpward && sequin.classList.contains('flipped')) {
                        sequin.classList.remove('flipped');
                        sequin.style.zIndex = 2000 + (rowCount - i);
                        sequin.style.backgroundImage = 'linear-gradient(to bottom, #222, #444)';
                    }
                }
            });
        });

        lastPosition = { x, y }; // Обновляем последнюю позицию
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
    lastPosition = getTouchOrMousePosition(e); // Сохраняем начальную позицию
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
    lastPosition = getTouchOrMousePosition(e); // Сохраняем начальную позицию
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
