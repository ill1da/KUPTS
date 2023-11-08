const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');
let lineWidthSlider = document.getElementById('line-width-slider');
let lineWidthValue = document.getElementById('line-width-value');
let painting = false;
let erasing = false;
let bucketMode = false;
let lastX = 0;
let lastY = 0;

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

context.lineWidth = 15;
context.lineCap = 'round';
context.strokeStyle = '#825937';

lineWidthSlider.addEventListener('input', () => {
    context.lineWidth = lineWidthSlider.value;
    lineWidthValue.textContent = lineWidthSlider.value;
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
});

// Обработчик события для кнопки "Кисть"
const brushButton = document.getElementById('brush');
brushButton.addEventListener('click', () => {
    erasing = false;
    bucketMode = false;
    setButtonActive(brushButton);
    setButtonInactive(eraserButton);
    setButtonInactive(document.getElementById('bucket'));
    context.globalCompositeOperation = 'source-over'; // Возвращаем режим кисти
});

// Обработчик события для кнопки "Ведро"
const bucketButton = document.getElementById('bucket');
bucketButton.addEventListener('click', () => {
    // Отображаем модальное окно
    const confirmModal = document.getElementById('confirm-modal');
    confirmModal.style.display = 'flex';

    document.getElementById('confirm-yes').addEventListener('click', () => {
        // Если пользователь нажал "Да", очищаем канву
        context.clearRect(0, 0, canvas.width, canvas.height);
        confirmModal.style.display = 'none'; // Закрываем модальное окно
    });

    document.getElementById('confirm-no').addEventListener('click', () => {
        // Если пользователь нажал "Нет", закрываем модальное окно
        confirmModal.style.display = 'none';
    });
});

function startPosition(e) {
    if (bucketMode) {
        // Если режим "Ведро", то отображаем модальное окно
        const confirmModal = document.getElementById('confirm-modal');
        confirmModal.style.display = 'block';
    } else {
        painting = true;
        [lastX, lastY] = [e.clientX, e.clientY];
        draw(e);
    }
}

function endPosition() {
    painting = false;
    context.beginPath();
}

function draw(e) {
    if (!painting) return;

    if (e.type === 'mousemove' || e.type === 'mousedown') {
        context.beginPath();
        context.moveTo(lastX, lastY);
        context.lineTo(e.clientX, e.clientY);
        context.stroke();
        [lastX, lastY] = [e.clientX, e.clientY];
    } else if (e.type === 'touchmove' || e.type === 'touchstart') {
        e.preventDefault();
        const touch = e.touches[0];
        context.beginPath();
        context.moveTo(lastX, lastY);
        context.lineTo(touch.clientX, touch.clientY);
        context.stroke();
        [lastX, lastY] = [touch.clientX, touch.clientY];
    }
}

canvas.addEventListener('mousedown', startPosition);
canvas.addEventListener('mouseup', endPosition);
canvas.addEventListener('mousemove', draw);

canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    startPosition(e);
});

canvas.addEventListener('touchend', endPosition);
canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    draw(e);
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