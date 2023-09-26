const circle = document.getElementById('circle');
const pointer = document.getElementById('pointer');
const percentText = document.getElementById('percent'); // Новый элемент для отображения процента
const button = document.getElementById('button');

// Радиус круга
const radius = circle.clientWidth / 2;

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

        // Виброотклик на каждый процент
        navigator.vibrate([10]);
    }

    // Обновление заполнения круга градиентом
    circle.style.background = `conic-gradient(rgba(16, 156, 134, 1) ${currentPosition}%, rgba(142, 194, 226, 1) ${currentPosition}%)`;

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
    circle.style.background = `conic-gradient(rgba(16, 156, 134, 1) ${currentPosition}%, rgba(142, 194, 226, 1) ${currentPosition}%)`;
    percentText.textContent = `${Math.round(currentPosition)}%`;
}

button.addEventListener('click', () => {
    console.log(Math.round(currentPosition));
});