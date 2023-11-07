const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');
let painting = false;
let lastX = 0;
let lastY = 0;

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

context.lineWidth = 15;
context.lineCap = 'round';
context.strokeStyle = 'rgba(130, 89, 55, 0.7)';

function startPosition(e) {
    painting = true;
    [lastX, lastY] = [e.clientX, e.clientY];
    draw(e);
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

// Настройка эффекта песчаных частиц
particlesJS('particles-js', {
    "particles": {
        "number": {
            "value": 50000, // Увеличьте это значение
            "density": {
                "enable": false,
            }
        },
        "color": {
            "value": ["#F0C690", "#E3BA7B", "#CC9966", "#F5C896"] // Дополнительные оттенки песка
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