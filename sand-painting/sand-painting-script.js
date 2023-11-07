const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');
let painting = false;

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

context.lineWidth = 5;
context.lineCap = 'round';
context.strokeStyle = '#000';

function startPosition(e) {
    painting = true;
    draw(e);
}

function endPosition() {
    painting = false;
    context.beginPath();
}

function draw(e) {
    if (!painting) return;

    context.lineTo(e.clientX, e.clientY);
    context.stroke();
    context.beginPath();
    context.moveTo(e.clientX, e.clientY);
}

canvas.addEventListener('mousedown', startPosition);
canvas.addEventListener('mouseup', endPosition);
canvas.addEventListener('mousemove', draw);

// Настройка эффекта песчаных частиц
particlesJS('particles-js', {
    "particles": {
        "number": {
            "value": 1000,
            "density": {
                "enable": true,
                "value_area": 800
            }
        },
        "color": {
            "value": ["#fcdd76", "#e3c087", "#e6c16d", "#e0d0a7"] // Дополнительные оттенки песка
        },
        "shape": {
            "type": "circle"
        },
        "opacity": {
            "value": 0.5,
            "random": false
        },
        "size": {
            "value": 5,
            "random": true
        },
        "line_linked": {
            "enable": false
        },
        "move": {
            "enable": true,
            "speed": 0
        }
    },
    "interactivity": {
        "events": {
            "onhover": {
                "enable": true,
                "mode": "repulse"
            }
        }
    }
});
