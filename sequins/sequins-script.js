// Получаем элементы интерфейса
const container = document.getElementById('sequins-container');
const homeLink = document.getElementById('home-link');
const settingsIcon = document.getElementById('settings-icon');
const settingsPanel = document.getElementById('settings-panel');
const outerColorPicker = document.getElementById('outer-color-picker');
const innerColorPicker = document.getElementById('inner-color-picker');
const imageUploader = document.getElementById('image-uploader');
const closeSettingsButton = document.getElementById('close-settings');

// Элементы модального окна кадрирования
const imageCropperModal = document.getElementById('image-cropper-modal');
const cropperImage = document.getElementById('cropper-image');
const applyCroppedImageOriginalButton = document.getElementById('apply-cropped-image-original');
const applyCroppedImageAdaptiveButton = document.getElementById('apply-cropped-image-adaptive');
const cancelCroppingButton = document.getElementById('cancel-cropping');

let cropper = null; // Переменная для Cropper.js

// Параметры пайеток
const sequinSize = 60;
const overlapRatio = 0.55;
const screenHeight = window.innerHeight;
const screenWidth = window.innerWidth;
const rowCount = Math.ceil(screenHeight / (sequinSize * overlapRatio)) + 2;
const colCount = Math.ceil(screenWidth / sequinSize) + 1;
const sequins = [];
const flipRadius = 60;
let colors = [];
let lastPosition = { x: 0, y: 0 };

const verticalThreshold = 1; // Порог для вертикального движения

// Генерация случайных светлых цветов
function getRandomLightColor() {
    const letters = '89ABCDEF'; // Используем только светлые цвета
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * letters.length)];
    }
    return color;
}

// Генерация случайных темных цветов
function getRandomDarkColor() {
    const letters = '0123456789ABC'; // Используем только темные цвета
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * letters.length)];
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
    colors = Array.from({ length: rowCount * colCount }, () => getRandomLightColor());

    // Устанавливаем начальные цвета внешней стороны
    const outerColor = getRandomDarkColor();
    const outerDarkColor = shadeColor(outerColor, -30);
    document.documentElement.style.setProperty('--sequin-back-color', outerColor);
    document.documentElement.style.setProperty('--sequin-back-dark-color', outerDarkColor);
    outerColorPicker.value = outerColor;

    for (let i = 0; i < rowCount; i++) {
        for (let j = 0; j < colCount; j++) {
            const sequinWrapper = document.createElement('div');
            sequinWrapper.classList.add('sequin-wrapper');
            sequinWrapper.style.width = `${sequinSize}px`;
            sequinWrapper.style.height = `${sequinSize}px`;
            sequinWrapper.style.overflow = 'hidden';
            sequinWrapper.style.position = 'absolute';

            const xOffset = (j * sequinSize) - (i % 2) * (sequinSize / 2);
            const yOffset = i * sequinSize * overlapRatio - sequinSize * overlapRatio;
            sequinWrapper.style.left = `${xOffset}px`;
            sequinWrapper.style.top = `${yOffset}px`;

            sequinWrapper.style.zIndex = 2000 + (rowCount - i);

            const sequin = document.createElement('div');
            sequin.classList.add('sequin');
            sequin.style.width = `${sequinSize}px`;
            sequin.style.height = `${sequinSize}px`;

            const index = i * colCount + j;
            sequin.dataset.index = index;
            sequin.dataset.row = i;
            sequin.dataset.col = j;

            // Сохраняем позиции центра пайетки
            const centerX = xOffset + sequinSize / 2;
            const centerY = yOffset + sequinSize / 2;
            sequin.dataset.centerX = centerX;
            sequin.dataset.centerY = centerY;

            // Устанавливаем цвета внутренней стороны через CSS-переменные
            const color = colors[index];
            const darkColor = shadeColor(color, -40);
            sequin.style.setProperty('--sequin-color', color);
            sequin.style.setProperty('--sequin-dark-color', darkColor);

            sequinWrapper.appendChild(sequin);
            container.appendChild(sequinWrapper);
            sequins.push(sequin);
        }
    }
}

// Функция для интерполяции позиций (упрощенная)
function interpolatePositions(x1, y1, x2, y2, steps) {
    const positions = [];
    const stepX = (x2 - x1) / steps;
    const stepY = (y2 - y1) / steps;

    for (let i = 0; i <= steps; i++) {
        positions.push({ x: x1 + stepX * i, y: y1 + stepY * i });
    }

    return positions;
}

// Получение пайеток рядом с позицией
function getSequinsNearPosition(x, y, radius) {
    let sequinsIndices = [];

    let approxRow = Math.floor(y / (sequinSize * overlapRatio));
    let rowOffset = (approxRow % 2) * (sequinSize / 2);
    let adjustedX = x - rowOffset;
    let approxCol = Math.floor(adjustedX / sequinSize);

    let minRow = Math.max(0, approxRow - 1);
    let maxRow = Math.min(rowCount - 1, approxRow + 1);

    for (let i = minRow; i <= maxRow; i++) {
        let rowOffset = (i % 2) * (sequinSize / 2);
        let adjustedX = x - rowOffset;
        let col = Math.floor(adjustedX / sequinSize);
        let minCol = Math.max(0, col - 1);
        let maxCol = Math.min(colCount - 1, col + 1);

        for (let j = minCol; j <= maxCol; j++) {
            const index = i * colCount + j;
            sequinsIndices.push(index);
        }
    }

    return sequinsIndices;
}

// Переворот пайеток
function flipSequins(x, y, isUpward) {
    const positions = interpolatePositions(lastPosition.x, lastPosition.y, x, y, 2);

    positions.forEach(pos => {
        const indices = getSequinsNearPosition(pos.x, pos.y, flipRadius);
        indices.forEach(index => {
            const sequin = sequins[index];
            const sequinX = parseFloat(sequin.dataset.centerX);
            const sequinY = parseFloat(sequin.dataset.centerY);
            const distance = Math.hypot(pos.x - sequinX, pos.y - sequinY);

            if (distance < flipRadius) {
                const i = parseInt(sequin.dataset.row);

                if (isUpward && !sequin.classList.contains('flipped')) {
                    sequin.classList.add('flipped');
                    sequin.parentElement.style.zIndex = 1000 + i;
                } else if (!isUpward && sequin.classList.contains('flipped')) {
                    sequin.classList.remove('flipped');
                    sequin.parentElement.style.zIndex = 2000 + (rowCount - i);
                }
            }
        });
    });

    lastPosition = { x, y };
}

// Функция для получения позиции касания или мыши
function getTouchOrMousePosition(event) {
    if (event.touches) {
        return { x: event.touches[0].clientX, y: event.touches[0].clientY };
    } else {
        return { x: event.clientX, y: event.clientY };
    }
}

// Обработчики событий мыши и касания
let isMouseDown = false;
let lastY = 0;
let lastX = 0;

function onMouseDown(e) {
    // Проверяем, был ли клик по ссылке или значку настроек
    if (e.target === homeLink || e.target === settingsIcon || settingsPanel.contains(e.target) || imageCropperModal.contains(e.target)) {
        return; // Не обрабатываем нажатие, если кликнули по этим элементам
    }

    isMouseDown = true;
    const { x, y } = getTouchOrMousePosition(e);
    lastX = x;
    lastY = y;
    lastPosition = { x, y };

    // Добавляем класс прозрачности
    homeLink.classList.add('transparent');
    settingsIcon.classList.add('transparent');
    settingsPanel.classList.add('transparent');

    // Скрываем панель настроек
    settingsPanel.classList.remove('open');
}

function onMouseUp() {
    isMouseDown = false;

    // Убираем класс прозрачности
    homeLink.classList.remove('transparent');
    settingsIcon.classList.remove('transparent');
    settingsPanel.classList.remove('transparent');
}

function onMouseMove(e) {
    if (isMouseDown) {
        const { x, y } = getTouchOrMousePosition(e);
        const deltaY = y - lastY;
        const deltaX = x - lastX;

        // Проверяем, что вертикальное движение превышает порог и больше горизонтального
        if (Math.abs(deltaY) > verticalThreshold && Math.abs(deltaY) > Math.abs(deltaX)) {
            const isUpward = deltaY < 0;
            flipSequins(x, y, isUpward);
        }

        // Обновляем последние позиции независимо от переворота
        lastY = y;
        lastX = x;
        lastPosition = { x, y };

        e.preventDefault(); // Предотвращаем прокрутку страницы
    }
}

document.addEventListener('mousedown', onMouseDown);
document.addEventListener('mouseup', onMouseUp);
document.addEventListener('mousemove', onMouseMove);

document.addEventListener('touchstart', onMouseDown, { passive: false });
document.addEventListener('touchend', onMouseUp, { passive: false });
document.addEventListener('touchmove', onMouseMove, { passive: false });

// Остановить распространение событий на ссылки и иконки
homeLink.addEventListener('mousedown', (e) => e.stopPropagation());
homeLink.addEventListener('touchstart', (e) => e.stopPropagation());

settingsIcon.addEventListener('mousedown', (e) => e.stopPropagation());
settingsIcon.addEventListener('touchstart', (e) => e.stopPropagation());

settingsPanel.addEventListener('mousedown', (e) => e.stopPropagation());
settingsPanel.addEventListener('touchstart', (e) => e.stopPropagation());

imageCropperModal.addEventListener('mousedown', (e) => e.stopPropagation());
imageCropperModal.addEventListener('touchstart', (e) => e.stopPropagation());

// Обработчики для настроек
settingsIcon.addEventListener('click', (e) => {
    e.stopPropagation();
    settingsPanel.classList.toggle('open');
});

closeSettingsButton.addEventListener('click', (e) => {
    e.stopPropagation();
    settingsPanel.classList.remove('open');
});

// Изменение цвета внешней стороны пайеток по настройкам
outerColorPicker.addEventListener('input', () => {
    const color = outerColorPicker.value;
    const darkColor = shadeColor(color, -30);

    document.documentElement.style.setProperty('--sequin-back-color', color);
    document.documentElement.style.setProperty('--sequin-back-dark-color', darkColor);
});

// Изменение цвета внутренней стороны пайеток по настройкам
innerColorPicker.addEventListener('input', () => {
    sequins.forEach(sequin => {
        const color = innerColorPicker.value;
        const darkColor = shadeColor(color, -40);

        sequin.style.setProperty('--sequin-color', color);
        sequin.style.setProperty('--sequin-dark-color', darkColor);
        sequin.style.removeProperty('--sequin-image'); // Убираем изображение, если было
        sequin.style.removeProperty('--sequin-bg-position');
    });
});

// Обработчик загрузки изображения
imageUploader.addEventListener('change', () => {
    const file = imageUploader.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            cropperImage.src = event.target.result;
            openImageCropperModal();
        };
        reader.readAsDataURL(file);
        // Сбрасываем значение input для повторного выбора того же файла
        imageUploader.value = '';

        // Скрываем панель настроек
        settingsPanel.classList.remove('open');
    }
});

// Открытие модального окна кадрирования
function openImageCropperModal() {
    imageCropperModal.style.display = 'flex';
    cropper = new Cropper(cropperImage, {
        aspectRatio: screenWidth / screenHeight,
        viewMode: 1,
        autoCropArea: 1,
        responsive: true,
        background: false
    });
}

// Закрытие модального окна кадрирования
function closeImageCropperModal() {
    imageCropperModal.style.display = 'none';
    cropper.destroy();
    cropper = null;
}

// Применение кадрированного изображения в режиме "Оригинал"
applyCroppedImageOriginalButton.addEventListener('click', () => {
    const canvas = cropper.getCroppedCanvas({
        width: screenWidth,
        height: screenHeight
    });
    const img = new Image();
    img.onload = function() {
        applyOriginalImage(img);
        closeImageCropperModal();

        // Скрываем панель настроек
        settingsPanel.classList.remove('open');
    };
    img.src = canvas.toDataURL();
});

// Применение кадрированного изображения в режиме "Адаптив"
applyCroppedImageAdaptiveButton.addEventListener('click', () => {
    const canvas = cropper.getCroppedCanvas({
        width: screenWidth,
        height: screenHeight
    });
    const img = new Image();
    img.onload = function() {
        applyAdaptiveImage(img);
        closeImageCropperModal();

        // Скрываем панель настроек
        settingsPanel.classList.remove('open');
    };
    img.src = canvas.toDataURL();
});

// Отмена кадрирования
cancelCroppingButton.addEventListener('click', () => {
    closeImageCropperModal();
});

// Применение изображения в режиме "Адаптив"
function applyAdaptiveImage(img) {
    // Создаем canvas для обработки изображения
    const canvas = document.createElement('canvas');
    canvas.width = colCount;
    canvas.height = rowCount;
    const ctx = canvas.getContext('2d');

    // Рисуем изображение на canvas, масштабируя его до размеров сетки пайеток
    ctx.drawImage(img, 0, 0, colCount, rowCount);

    // Получаем данные изображения
    const imageData = ctx.getImageData(0, 0, colCount, rowCount).data;

    sequins.forEach(sequin => {
        const index = parseInt(sequin.dataset.index);
        const row = Math.floor(index / colCount);
        const col = index % colCount;

        const pixelIndex = (row * colCount + col) * 4;
        const r = imageData[pixelIndex];
        const g = imageData[pixelIndex + 1];
        const b = imageData[pixelIndex + 2];
        const a = imageData[pixelIndex + 3];

        const color = `rgba(${r}, ${g}, ${b}, ${a / 255})`;

        // Устанавливаем фон пайетки
        sequin.style.setProperty('--sequin-image', `linear-gradient(to bottom, ${color}, ${color})`);
        sequin.style.setProperty('--sequin-color', color);
        sequin.style.setProperty('--sequin-dark-color', shadeColor(color, -40));
        sequin.style.removeProperty('--sequin-bg-position');
        sequin.classList.remove('transparent-inner'); // Убираем класс прозрачности
    });

    // Убираем фон страницы
    document.body.style.backgroundImage = '';
}

// Применение изображения в режиме "Оригинал"
function applyOriginalImage(img) {
    // Устанавливаем изображение фоном страницы
    document.body.style.backgroundImage = `url(${img.src})`;
    document.body.style.backgroundSize = 'cover';
    document.body.style.backgroundPosition = 'center';

    // Делаем внутреннюю сторону пайеток прозрачной, но сохраняем контур
    sequins.forEach(sequin => {
        sequin.style.setProperty('--sequin-color', 'rgba(255, 255, 255, 0)');
        sequin.style.setProperty('--sequin-dark-color', 'rgba(255, 255, 255, 0)');
        sequin.style.removeProperty('--sequin-image');
        sequin.style.removeProperty('--sequin-bg-position');
        sequin.classList.add('transparent-inner'); // Добавляем класс для сохранения контура
    });
}

// Инициализация пайеток
createSequins();
