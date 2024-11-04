let scene, camera, renderer, plane;
let raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2();
let isUserInteracting = false;

let previousMousePosition = { x: 0, y: 0 };
let previousPoint = null;
let previousTimestamp = null;
let currentRadius = 50; // Начальный радиус
let targetRadius = 50; // Целевой радиус

let isResetting = false; // Флаг для анимации волны
let waterMesh; // Меш воды
let clock;
let waterAnimationProgress = 0; // Прогресс анимации воды

init();
animate();

function init() {
    // Создание сцены
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xF0E0C0); // Светлый песочный фон

    // Настройка камеры
    camera = new THREE.OrthographicCamera(
        window.innerWidth / -2, window.innerWidth / 2,
        window.innerHeight / 2, window.innerHeight / -2,
        -500, 1000
    );
    camera.position.set(0, 0, 500);
    camera.lookAt(0, 0, 0);

    // Инициализация рендерера
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true; // Включаем поддержку теней
    renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Высокое качество теней
    document.body.appendChild(renderer.domElement);

    // Добавление света
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2); // Уменьшаем окружающий свет
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
    directionalLight.position.set(100, 200, 300);
    directionalLight.castShadow = true; // Источник света будет отбрасывать тени

    // Настройка параметров теней
    directionalLight.shadow.mapSize.width = 1024; // Умеренное разрешение теней
    directionalLight.shadow.mapSize.height = 1024;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 1500;
    directionalLight.shadow.camera.left = -500;
    directionalLight.shadow.camera.right = 500;
    directionalLight.shadow.camera.top = 500;
    directionalLight.shadow.camera.bottom = -500;

    scene.add(directionalLight);

    // Создание плоскости (песчаная поверхность)
    const geometry = new THREE.PlaneGeometry(window.innerWidth, window.innerHeight, 128, 128);

    // Используем материал, реагирующий на свет и тени
    const material = new THREE.MeshStandardMaterial({
        color: 0xE0C080, // Цвет песка
        roughness: 0.8,  // Шероховатость для улучшения теней
        metalness: 0.0,  // Неметаллический материал
    });

    plane = new THREE.Mesh(geometry, material);
    plane.receiveShadow = true; // Плоскость будет принимать тени
    plane.castShadow = false;   // Плоскость не отбрасывает тени
    scene.add(plane);

    // Обработчики событий
    window.addEventListener('resize', onWindowResize, false);
    renderer.domElement.addEventListener('pointerdown', onPointerDown, false);
    renderer.domElement.addEventListener('pointermove', onPointerMove, false);
    renderer.domElement.addEventListener('pointerup', onPointerUp, false);

    // Кнопка сброса
    document.getElementById('reset-button').addEventListener('click', startWaterReset);

    // Инициализация часов
    clock = new THREE.Clock();
}

function onWindowResize() {
    camera.left = window.innerWidth / -2;
    camera.right = window.innerWidth / 2;
    camera.top = window.innerHeight / 2;
    camera.bottom = window.innerHeight / -2;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

    // Обновляем размер плоскости
    plane.geometry.dispose();
    plane.geometry = new THREE.PlaneGeometry(window.innerWidth, window.innerHeight, 128, 128);
}

function onPointerDown(event) {
    if (isResetting) return; // Не позволяем рисовать во время сброса

    isUserInteracting = true;
    previousTimestamp = performance.now();
    previousMousePosition.x = event.clientX;
    previousMousePosition.y = event.clientY;
    updateMousePosition(event);
    const intersectPoint = getIntersectPoint();
    if (intersectPoint) {
        previousPoint = intersectPoint;
    } else {
        previousPoint = null;
    }
}

function onPointerMove(event) {
    if (isUserInteracting && !isResetting) {
        updateMousePosition(event);
        const currentTimestamp = performance.now();
        const deltaTime = currentTimestamp - previousTimestamp;

        const deltaX = event.clientX - previousMousePosition.x;
        const deltaY = event.clientY - previousMousePosition.y;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

        const speed = distance / deltaTime; // Скорость курсора (пиксели/мс)

        // Обновляем целевой радиус на основе скорости
        const minRadius = 10;
        const maxRadius = 50;
        const maxSpeed = 1.0; // Максимальная скорость для интерполяции

        const speedRatio = Math.min(speed / maxSpeed, 1);
        targetRadius = maxRadius - (maxRadius - minRadius) * speedRatio;

        // Плавное изменение текущего радиуса к целевому радиусу
        currentRadius += (targetRadius - currentRadius) * 0.2;

        const currentPoint = getIntersectPoint();

        if (currentPoint && previousPoint) {
            const moveDistance = currentPoint.distanceTo(previousPoint);

            // Динамическое количество шагов, зависящее от расстояния
            const radius = currentRadius;
            const height = 15;

            const steps = Math.ceil(moveDistance / (radius / 2));

            // Ограничение количества шагов для предотвращения зависаний
            const maxSteps = 50;
            const actualSteps = Math.min(steps, maxSteps);

            deformPlaneBetweenPoints(previousPoint, currentPoint, radius, height, actualSteps);

            previousPoint.copy(currentPoint);
        }

        previousMousePosition.x = event.clientX;
        previousMousePosition.y = event.clientY;
        previousTimestamp = currentTimestamp;
    }
}

function onPointerUp() {
    isUserInteracting = false;
    previousPoint = null; // Сбрасываем previousPoint
}

function updateMousePosition(event) {
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
}

function getIntersectPoint() {
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObject(plane);
    if (intersects.length > 0) {
        return intersects[0].point.clone();
    }
    return null;
}

function deformPlaneBetweenPoints(point1, point2, radius, height, steps) {
    const geometry = plane.geometry;
    const position = geometry.attributes.position;
    const pos = position.array;

    const dir = new THREE.Vector3().subVectors(point2, point1);
    const dirLength = dir.length();

    if (dirLength === 0) {
        return; // Если точки совпадают, деформация не нужна
    }

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

                // Накопление деформации для выделения ложбинок
                pos[i + 2] = Math.min(pos[i + 2], -deformation);
            }
        }
    }

    position.needsUpdate = true;
    geometry.computeVertexNormals();
}

function startWaterReset() {
    if (isResetting) return;
    isResetting = true;
    waterAnimationProgress = 0;

    createWaterMesh();
}

function createWaterMesh() {
    const radius = 50; // Начальный радиус
    const segments = 64; // Количество сегментов для геометрии круга

    // Создаем геометрию круга для слизи
    const waterGeometry = new THREE.CircleGeometry(radius, segments);

    // Создаем материал MeshPhysicalMaterial для эффекта слизи
    const waterMaterial = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(0x00f),
        metalness: 0.0,
        roughness: 0.5,
        transmission: 0.9, // Для прозрачности
        thickness: 5.0,    // Толщина материала для эффекта преломления
        opacity: 0.8,
        transparent: true,
        side: THREE.DoubleSide,
        clearcoat: 1.0,
        clearcoatRoughness: 0.1,
    });

    waterMesh = new THREE.Mesh(waterGeometry, waterMaterial);
    waterMesh.position.set(window.innerWidth / 2 + radius, 0, 10); // Начинаем справа за экраном
    waterMesh.scale.set(1, 1, 1);
    scene.add(waterMesh);
}

function animateWaterReset(deltaTime) {
    if (!isResetting) return;

    const duration = 3.0; // Общая продолжительность анимации слизи
    waterAnimationProgress += deltaTime / duration;

    if (waterAnimationProgress >= 1) {
        // Анимация завершена
        isResetting = false;
        scene.remove(waterMesh);
        waterMesh.geometry.dispose();
        waterMesh.material.dispose();
        waterMesh = null;
        waterAnimationProgress = 0;
        return;
    }

    // Анимируем слизь
    if (waterAnimationProgress < 0.5) {
        // Первая фаза: слизь выливается на экран
        const progress = waterAnimationProgress / 0.5;
        const scale = THREE.MathUtils.lerp(1, 15, progress); // Настройте конечный масштаб по необходимости
        waterMesh.scale.set(scale, scale, 1);
        const posX = THREE.MathUtils.lerp(window.innerWidth / 2 + 50, 0, progress); // Двигаемся справа к центру
        waterMesh.position.x = posX;

        // Добавляем небольшие деформации для органичности
        const deformation = Math.sin(waterAnimationProgress * Math.PI * 4) * 0.1;
        waterMesh.scale.y += deformation;
    } else {
        // Вторая фаза: слизь стекает вниз
        const progress = (waterAnimationProgress - 0.5) / 0.5;
        waterMesh.position.y = THREE.MathUtils.lerp(0, -window.innerHeight / 2 - waterMesh.geometry.parameters.radius * waterMesh.scale.y, progress);
    }

    // Сбрасываем песок под слизью
    resetSandUnderWater();
}

function resetSandUnderWater() {
    if (!waterMesh) return;

    const geometry = plane.geometry;
    const position = geometry.attributes.position;
    const pos = position.array;

    const waterPosition = waterMesh.position;
    const radius = waterMesh.geometry.parameters.radius * waterMesh.scale.x;

    for (let i = 0; i < pos.length; i += 3) {
        const x = pos[i];
        const y = pos[i + 1];

        const dx = x - waterPosition.x;
        const dy = y - waterPosition.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance <= radius) {
            // Точка под слизью
            pos[i + 2] += (0 - pos[i + 2]) * 0.2;
            if (Math.abs(pos[i + 2]) < 0.01) {
                pos[i + 2] = 0;
            }
        }
    }

    position.needsUpdate = true;
    geometry.computeVertexNormals();
}

function animate() {
    requestAnimationFrame(animate);

    const deltaTime = clock.getDelta();

    animateWaterReset(deltaTime);

    renderer.render(scene, camera);
}
