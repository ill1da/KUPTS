const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');
let painting = false;
let lastX = 0;
let lastY = 0;
let particles = []; // Массив для хранения частиц

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

context.lineWidth = 15;
context.lineCap = 'round';
context.strokeStyle = '#825937';

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

    // Создаем частицы на пути рисования
    createParticles(e.clientX, e.clientY);
}

function createParticles(x, y) {
    const particleCount = 10; // Количество частиц, которые будут созданы
    for (let i = 0; i < particleCount; i++) {
        const particle = {
            x: x,
            y: y,
            size: Math.random() * 5 + 2, // Размер частицы
            color: "#F0C690" // Цвет частицы
        };
        particles.push(particle);
    }
}

function updateParticles() {
    for (let i = 0; i < particles.length; i++) {
        const particle = particles[i];
        context.fillStyle = particle.color;
        context.beginPath();
        context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        context.fill();

        // Двигаем частицы вверх, чтобы они постепенно исчезли
        particle.y -= 1;
        particle.size -= 0.1;

        if (particle.size <= 0) {
            particles.splice(i, 1); // Удаляем исчезшие частицы
            i--;
        }
    }
}

function animate() {
    requestAnimationFrame(animate);
    updateParticles();
}

animate();

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