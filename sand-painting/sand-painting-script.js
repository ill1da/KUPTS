const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');
let painting = false;
let lastX = 0;
let lastY = 0;

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const particles = []; // Массив для хранения частиц

function createParticle(x, y) {
    const particle = new Path2D();
    particle.arc(x, y, 3, 0, Math.PI * 2);
    particles.push(particle);
}

function drawParticles() {
    context.fillStyle = 'rgba(194, 147, 97, 1)'; // Цвет песчаных частиц
    for (const particle of particles) {
        context.fill(particle);
    }
}

function startPosition(e) {
    painting = true;
    [lastX, lastY] = [e.clientX, e.clientY];
    createParticle(lastX, lastY);
    draw(e);
}

function endPosition() {
    painting = false;
    context.beginPath();
}

function draw(e) {
    if (!painting) return;

    const currentX = e.clientX;
    const currentY = e.clientY;

    for (let i = 0; i < 5; i++) { // Создаем несколько частиц на каждом шаге
        const offsetX = (Math.random() - 0.5) * 20;
        const offsetY = (Math.random() - 0.5) * 20;
        const x = lastX + offsetX;
        const y = lastY + offsetY;
        createParticle(x, y);
    }

    drawParticles();
    [lastX, lastY] = [currentX, currentY];
}

canvas.addEventListener('mousedown', startPosition);
canvas.addEventListener('mouseup', endPosition);
canvas.addEventListener('mousemove', draw);

// Очистка холста
function clearCanvas() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    particles.length = 0; // Очистка массива частиц
}

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