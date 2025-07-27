let scene, camera, renderer, plane;
let raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2();
let isUserInteracting = false;

let previousMousePosition = { x: 0, y: 0 };
let previousPoint = null;
let previousTimestamp = null;
let brushRadius = 50;
let eraserRadius = 50;
let currentRadius = 50;
let isEraserMode = false;
let commonSize = true;
let isResetting = false;
let clock;
let autoRadius = true;
let updateCounter = 0;
let autoRadiusBrush = true; 
let autoRadiusEraser = true;

init();
animate();

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xF0E0C0);

    camera = new THREE.OrthographicCamera(
        window.innerWidth / -2, window.innerWidth / 2,
        window.innerHeight / 2, window.innerHeight / -2,
        -500, 1000
    );
    camera.position.set(0, 0, 500);
    camera.lookAt(0, 0, 0);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    document.body.appendChild(renderer.domElement);

    document.getElementById("brush-button").addEventListener("click", () => setMode(false));
    document.getElementById("eraser-button").addEventListener("click", () => setMode(true));

    // Обработчик для обновления положения круга вокруг курсора
    window.addEventListener("mousemove", (event) => {
        updateCursorCircle(event.clientX, event.clientY, currentRadius);
    });

    // Настройка интерфейса
    const brushButton = document.getElementById("brush-button");
    const eraserButton = document.getElementById("eraser-button");
    const radiusSliderContainer = document.getElementById("radius-slider-container");
    const radiusSlider = document.getElementById("radius-slider");
    const commonSizeCheckbox = document.getElementById("common-size-checkbox");

    brushButton.addEventListener("mouseenter", () => showToolOptions(brushButton, "brush"));
    brushButton.addEventListener("mouseleave", () => hideToolOptions("brush"));
    eraserButton.addEventListener("mouseenter", () => showToolOptions(eraserButton, "eraser"));
    eraserButton.addEventListener("mouseleave", () => hideToolOptions("eraser"));

    radiusSlider.addEventListener("input", (event) => {
        const newSize = parseInt(event.target.value, 10);
    
        if (commonSize) {
            // Если выбран "Общий размер", устанавливаем радиус и адаптацию для обоих инструментов
            brushRadius = eraserRadius = newSize;
            autoRadiusBrush = autoRadiusEraser = (newSize === 51);
        } else {
            // Если "Общий размер" не выбран, устанавливаем радиус и адаптацию только для активного инструмента
            if (isEraserMode) {
                eraserRadius = newSize;
                autoRadiusEraser = (newSize === 51);
            } else {
                brushRadius = newSize;
                autoRadiusBrush = (newSize === 51);
            }
        }
    
        // Немедленно обновляем текущий флаг autoRadius для активного инструмента
        autoRadius = isEraserMode ? autoRadiusEraser : autoRadiusBrush;
    
        // Обновляем текущий радиус
        currentRadius = isEraserMode ? eraserRadius : brushRadius;
        updateCursorCircle(mouse.x, mouse.y, currentRadius);
    });
    
    
    
    commonSizeCheckbox.addEventListener("change", (event) => {
        commonSize = event.target.checked;
    
        // Если включен общий размер, синхронизируем радиусы
        if (commonSize) {
            brushRadius = eraserRadius = currentRadius;
        }
    
        // Обновляем текущий радиус
        currentRadius = isEraserMode ? eraserRadius : brushRadius;
        updateCursorCircle(mouse.x, mouse.y, currentRadius);
    });
    

    document.getElementById('reset-button').addEventListener('click', showConfirmationDialog);

    // Настройка света
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(ambientLight);

    // Плоскость песка
    const geometry = new THREE.PlaneGeometry(window.innerWidth, window.innerHeight, 128, 128);
    const material = new THREE.MeshStandardMaterial({
        color: 0xE0C080,
        roughness: 1.0,
        metalness: 0.0,
    });

    plane = new THREE.Mesh(geometry, material);
    plane.receiveShadow = true;
    plane.castShadow = false;
    scene.add(plane);

    window.addEventListener('resize', onWindowResize, false);
    renderer.domElement.addEventListener('pointerdown', onPointerDown, false);
    renderer.domElement.addEventListener('pointermove', onPointerMove, false);
    renderer.domElement.addEventListener('pointerup', onPointerUp, false);
    window.addEventListener('mousemove', (event) => {
        updateCursorCircle(event.clientX, event.clientY, currentRadius);
    });

    clock = new THREE.Clock();
    setMode(false);
}

function showToolOptions(button, tool) {
    const radiusSliderContainer = document.getElementById("radius-slider-container");
    const radiusSlider = document.getElementById("radius-slider");

    radiusSliderContainer.style.display = "flex";
    radiusSliderContainer.style.left = `${button.getBoundingClientRect().right + 10}px`;
    radiusSliderContainer.style.top = `${button.getBoundingClientRect().top}px`;

    if (tool === "brush") {
        radiusSlider.value = brushRadius;
    } else if (tool === "eraser") {
        radiusSlider.value = eraserRadius;
    }
}

function hideToolOptions(tool) {
    const radiusSliderContainer = document.getElementById("radius-slider-container");
    setTimeout(() => {
        if (!radiusSliderContainer.matches(":hover")) {
            radiusSliderContainer.style.display = "none";
        }
    }, 100);

    // Обработчик события начала рисования
    renderer.domElement.addEventListener("pointerdown", (event) => {
        isUserInteracting = true;

        // Скрываем поле с ползунком
        radiusSliderContainer.style.display = "none";

        previousTimestamp = performance.now();
        previousMousePosition.x = event.clientX;
        previousMousePosition.y = event.clientY;
        updateMousePosition(event);
        const intersectPoint = getIntersectPoint();
        previousPoint = intersectPoint ? intersectPoint : null;
    });
}

function setMode(isEraser) {
    isEraserMode = isEraser;

    // Устанавливаем текущий радиус и адаптацию в зависимости от выбранного инструмента
    currentRadius = isEraser ? eraserRadius : brushRadius;
    autoRadius = isEraser ? autoRadiusEraser : autoRadiusBrush;

    document.getElementById("brush-button").classList.toggle("selected", !isEraser);
    document.getElementById("eraser-button").classList.toggle("selected", isEraser);

    document.getElementById("cursor-circle").style.border = isEraser ? "1px solid #333" : "1px dashed #333";
    updateCursorCircle(mouse.x, mouse.y, currentRadius);
}

function updateCurrentRadius() {
    currentRadius = isEraserMode ? eraserRadius : brushRadius;
    // update circle using the current mouse coordinates
    updateCursorCircle(mouse.x, mouse.y, currentRadius);
}

function showConfirmationDialog() {
    const confirmDialog = document.createElement("div");
    confirmDialog.style.position = "absolute";
    confirmDialog.style.top = "50%";
    confirmDialog.style.left = "50%";
    confirmDialog.style.transform = "translate(-50%, -50%)";
    confirmDialog.style.padding = "20px";
    confirmDialog.style.backgroundColor = "rgba(255, 255, 255, 0.9)";
    confirmDialog.style.borderRadius = "8px";
    confirmDialog.style.boxShadow = "0px 0px 10px rgba(0, 0, 0, 0.3)";
    confirmDialog.innerHTML = `
        <p>Стереть все?</p>
        <button id="confirm-yes">Да</button>
        <button id="confirm-no">Нет</button>
    `;
    document.body.appendChild(confirmDialog);

    document.getElementById("confirm-yes").addEventListener("click", () => {
        document.body.removeChild(confirmDialog);
        clearSandField(); 
    });

    document.getElementById("confirm-no").addEventListener("click", () => {
        document.body.removeChild(confirmDialog); 
    });
}

function clearSandField() {
    const geometry = plane.geometry;
    const position = geometry.attributes.position;
    const pos = position.array;

    for (let i = 0; i < pos.length; i += 3) {
        pos[i + 2] = 0; 
    }

    position.needsUpdate = true;
    geometry.computeVertexNormals();
}

function onWindowResize() {
    camera.left = window.innerWidth / -2;
    camera.right = window.innerWidth / 2;
    camera.top = window.innerHeight / 2;
    camera.bottom = window.innerHeight / -2;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    plane.geometry.dispose();
    plane.geometry = new THREE.PlaneGeometry(window.innerWidth, window.innerHeight, 128, 128);
}

function onPointerDown(event) {
    if (isResetting) return;

    isUserInteracting = true;
    previousTimestamp = performance.now();
    previousMousePosition.x = event.clientX;
    previousMousePosition.y = event.clientY;
    updateMousePosition(event);
    const intersectPoint = getIntersectPoint();
    previousPoint = intersectPoint ? intersectPoint : null;
}

function onPointerMove(event) {
    if (isUserInteracting && !isResetting) {
        updateMousePosition(event);
        const currentTimestamp = performance.now();
        const deltaTime = currentTimestamp - previousTimestamp;

        const deltaX = event.clientX - previousMousePosition.x;
        const deltaY = event.clientY - previousMousePosition.y;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

        if (autoRadius) {
            // Если включена автоматическая адаптация, меняем радиус в зависимости от скорости
            const speed = distance / deltaTime;
            const minRadius = 10;
            const maxRadius = 50;
            const maxSpeed = 1.0;
            const speedRatio = Math.min(speed / maxSpeed, 1);
            targetRadius = maxRadius - (maxRadius - minRadius) * speedRatio;
            currentRadius += (targetRadius - currentRadius) * 0.2;
        }

        const currentPoint = getIntersectPoint();

        if (currentPoint && previousPoint) {
            const moveDistance = currentPoint.distanceTo(previousPoint);
            const radius = currentRadius;
            const height = isEraserMode ? 0 : 15;
            const steps = Math.ceil(moveDistance / (radius / 2));
            const maxSteps = 50;
            const actualSteps = Math.min(steps, maxSteps);

            deformPlaneBetweenPoints(previousPoint, currentPoint, radius, height, actualSteps);
            previousPoint.copy(currentPoint);

            updateCounter++;
            if (updateCounter % 5 === 0) {
                plane.geometry.computeVertexNormals();
                updateCounter = 0;
            }
        }

        previousMousePosition.x = event.clientX;
        previousMousePosition.y = event.clientY;
        previousTimestamp = currentTimestamp;

        plane.geometry.attributes.position.needsUpdate = true;
    }
}


function onPointerUp() {
    isUserInteracting = false;
    previousPoint = null;

    plane.geometry.computeVertexNormals();
    plane.geometry.attributes.position.needsUpdate = true;
}

function updateMousePosition(event) {
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
}

function updateCursorCircle(x, y, radius) {
    const cursorCircle = document.getElementById("cursor-circle");
    cursorCircle.style.width = `${radius * 2}px`;
    cursorCircle.style.height = `${radius * 2}px`;
    cursorCircle.style.left = `${x - radius}px`; // Центрируем круг по X
    cursorCircle.style.top = `${y - radius}px`;  // Центрируем круг по Y
}

// Обновление круга при каждом движении мыши
window.addEventListener("mousemove", (event) => {
    updateCursorCircle(event.clientX, event.clientY, currentRadius);
});


function getIntersectPoint() {
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObject(plane);
    return intersects.length > 0 ? intersects[0].point.clone() : null;
}

function deformPlaneBetweenPoints(point1, point2, radius, height, steps) {
    const geometry = plane.geometry;
    const position = geometry.attributes.position;
    const pos = position.array;

    const dir = new THREE.Vector3().subVectors(point2, point1);
    if (dir.length() === 0) return;
    dir.normalize();

    for (let step = 0; step <= steps; step++) {
        const t = step / steps;
        const currentPoint = new THREE.Vector3().lerpVectors(point1, point2, t);

        for (let i = 0; i < pos.length; i += 3) {
            const x = pos[i];
            const y = pos[i + 1];

            const dx = x - currentPoint.x;
            const dy = y - currentPoint.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < radius) {
                const influence = (radius - distance) / radius;
                const deformation = influence * height;

                pos[i + 2] = isEraserMode ? Math.min(pos[i + 2] + (0 - pos[i + 2]) * influence, 0) : Math.min(pos[i + 2], -deformation);
            }
        }
    }

    position.needsUpdate = true;
}

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}


// Создаем кнопку и круги для управления светом
const sunButton = document.getElementById("sun-button");
const sunControl = document.createElement("div");
sunControl.id = "sun-control";

const sunHandle = document.createElement("div");
sunHandle.id = "sun-handle";
sunControl.appendChild(sunHandle);
document.body.appendChild(sunControl);

// Добавляем направляющий свет в сцену
const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
directionalLight.position.set(100, 200, 300); // Начальное положение света
directionalLight.castShadow = true;
scene.add(directionalLight);

// Переменные для вращения света
let isRotating = false;
let initialAngle;

// Устанавливаем начальное положение и центр вращения
function setInitialPosition() {
    // Центрируем большой круг по экрану
    sunControl.style.display = "flex";
    sunControl.style.position = "absolute";
    sunControl.style.left = "50%";
    sunControl.style.top = "50%";
    sunControl.style.transform = "translate(-50%, -50%)";

    // Начальное положение маленького круга по верхней границе
    sunHandle.style.position = "absolute";
    sunHandle.style.transformOrigin = "0px 75px"; // Радиус большого круга
    sunHandle.style.transform = "rotate(0deg) translateY(-75px)"; // Смещение на радиус
}

// Показать или скрыть управление светом при нажатии на кнопку "Солнце"
sunButton.addEventListener("click", () => {
    const isVisible = sunControl.style.display === "flex";
    sunControl.style.display = isVisible ? "none" : "flex";

    if (!isVisible) {
        setInitialPosition();
    }
});

// Начало вращения при нажатии на маленький круг
sunHandle.addEventListener("mousedown", (event) => {
    isRotating = true;
    const rect = sunControl.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const dx = event.clientX - centerX;
    const dy = event.clientY - centerY;
    initialAngle = Math.atan2(dy, dx) * (180 / Math.PI); // Переводим угол в градусы
    document.addEventListener("mousemove", rotateLight);
    document.addEventListener("mouseup", stopRotating);
});

// Функция для вращения света
function rotateLight(event) {
    if (!isRotating) return;

    const rect = sunControl.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const dx = event.clientX - centerX;
    const dy = event.clientY - centerY;
    const currentAngle = Math.atan2(dy, dx) * (180 / Math.PI); // Угол в градусах

    // Поворачиваем маленький круг
    const rotationAngle = currentAngle - initialAngle;
    sunHandle.style.transform = `rotate(${rotationAngle}deg) translateY(-75px)`;

    // Поворачиваем свет по оси Z
    const lightRadius = 300; // Радиус вращения света
    directionalLight.position.set(
        lightRadius * Math.cos(rotationAngle * (Math.PI / 180)),
        lightRadius * Math.sin(rotationAngle * (Math.PI / 180)),
        directionalLight.position.z
    );
}

// Остановить вращение
function stopRotating() {
    isRotating = false;
    document.removeEventListener("mousemove", rotateLight);
    document.removeEventListener("mouseup", stopRotating);
}
