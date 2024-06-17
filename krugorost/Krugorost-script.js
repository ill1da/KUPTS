document.addEventListener('DOMContentLoaded', function() {
    const { Engine, Render, World, Bodies, Body, Events, Query, Vector } = Matter;

    const engine = Engine.create({
        gravity: { x: 0, y: 1 },
        positionIterations: 10,
        velocityIterations: 10
    });

    engine.world.gravity.y = 1;
    Matter.Common.set(engine, 'constraintIterations', 2);

    const world = engine.world;
    const render = Render.create({
        element: document.getElementById('game-container'),
        engine: engine,
        options: { wireframes: false, width: 800, height: 720 }
    });

    const collisionCategories = {
        control: 0x0001,
        active: 0x0002
    };

    const levels = [
        { size: 16, color: '#5B748E', density: 0.01 },
        { size: 34, color: '#FF4B19', density: 0.01 },
        { size: 52, color: '#D95970', density: 0.01 },
        { size: 70, color: '#F2A679', density: 0.01 },
        { size: 88, color: '#E8D650', density: 0.01 },
        { size: 106, color: '#473145', density: 0.01 },
        { size: 124, color: '#F28705', density: 0.01 },
        { size: 142, color: '#BF1304', density: 0.01 },
        { size: 160, color: '#D9A404', density: 0.01 },
        { size: 178, color: '#8C4E03', density: 0.01 },
        { size: 196, color: '#50732D', density: 0.01 }
    ];

    let score = 0;

    function updateScoreDisplay() {
        const scoreDisplay = document.getElementById('score-display');
        scoreDisplay.textContent = `Score: ${score}`;
    }

    function createCircle(level, x, y, isControl = false) {
        return Bodies.circle(x, y, levels[level - 1].size, {
            isStatic: false,
            render: { fillStyle: levels[level - 1].color },
            restitution: 0.1,
            level: level,
            density: levels[level - 1].density,
            friction: 0.05,
            frictionAir: 0.01,
            frictionStatic: 0.5,
            collisionFilter: {
                category: isControl ? collisionCategories.control : collisionCategories.active,
                mask: isControl ? 0x0000 : 0xFFFF
            }
        });
    }

    let controlCircle = null;

    let currentLineColor = '#000';

    function createControlCircle(x, y) {
        const randomLevel = Math.floor(Math.random() * 4) + 1;
        controlCircle = createCircle(randomLevel, x, y, true);
        Body.setStatic(controlCircle, true);
        World.add(world, controlCircle);
        Body.setPosition(controlCircle, { x, y });
    
        currentLineColor = levels[randomLevel - 1].color;
    }

    function isTouchDevice() {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    }

    function getCanvasCoordinates(event) {
        const rect = render.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        return { x, y };
    }

    function initializeControlCircle() {
        if (isTouchDevice()) {
            createControlCircle(render.options.width / 2, 50);
        } else {
            createControlCircle(render.options.width / 2, 50); // Спавним по центру при загрузке страницы
            render.canvas.addEventListener('mousemove', handleMouseMove);
            render.canvas.addEventListener('mousedown', handleMouseDown);
        }
    }

    // Глобальные переменные для хранения текущих координат курсора
    let currentCursorX = render.options.width / 2;

    function handleMouseMove(event) {
        const { x } = getCanvasCoordinates(event);
        // Обновляем глобальные координаты курсора
        currentCursorX = x;
    
        if (controlCircle && controlCircle.isStatic) {
            const radius = controlCircle.circleRadius;
            const clampedX = Math.min(Math.max(x, radius + 25), render.options.width - radius - 25);
            Body.setPosition(controlCircle, { x: clampedX, y: 50 });
        }
    }

    let lastSpawnTime = 0;
    const spawnInterval = 500; // Интервал в миллисекундах между созданием новых шариков
    
    function handleMouseDown(event) {
        const currentTime = new Date().getTime();
        if (currentTime - lastSpawnTime < spawnInterval) {
            return; // Если прошло недостаточно времени, не создаем новый шарик
        }
        lastSpawnTime = currentTime; // Обновляем время последнего создания шарика
        
        if (controlCircle) {
            controlCircle.collisionFilter.mask = 0xFFFF;
            Body.setStatic(controlCircle, false);
        }
        
        // Используем текущие координаты курсора из глобальной переменной
        setTimeout(() => {
            createControlCircle(currentCursorX, 50);
        }, 500);
    }

    render.canvas.addEventListener('touchstart', function(event) {
        event.preventDefault();
        const touch = event.touches[0];
        const { x } = getCanvasCoordinates(touch);
        if (controlCircle && controlCircle.isStatic) {
            const radius = controlCircle.circleRadius;
            const clampedX = Math.min(Math.max(x, radius + 25), render.options.width - radius - 25);
            // Держим шарик по центру до касания
            Body.setPosition(controlCircle, { x: render.options.width / 2, y: 50 });
        }
    });

    render.canvas.addEventListener('touchmove', function(event) {
        event.preventDefault();
        const touch = event.touches[0];
        const { x } = getCanvasCoordinates(touch);
        if (controlCircle && controlCircle.isStatic) {
            const radius = controlCircle.circleRadius;
            const clampedX = Math.min(Math.max(x, radius + 25), render.options.width - radius - 25);
            Body.setPosition(controlCircle, { x: clampedX, y: 50 });
        }
    });

    render.canvas.addEventListener('touchend', function(event) {
        const touch = event.changedTouches[0];
        const { x } = getCanvasCoordinates(touch);
        const currentTime = new Date().getTime();
        if (currentTime - lastSpawnTime < spawnInterval) {
            return; // Если прошло недостаточно времени, не создаем новый шарик
        }
        lastSpawnTime = currentTime; // Обновляем время последнего создания шарика
        
        if (controlCircle && controlCircle.isStatic) {
            // Перемещаем шарик на позицию x касания
            const radius = controlCircle.circleRadius;
            const clampedX = Math.min(Math.max(x, radius + 25), render.options.width - radius - 25);
            Body.setPosition(controlCircle, { x: clampedX, y: 50 });
    
            controlCircle.collisionFilter.mask = 0xFFFF;
            Body.setStatic(controlCircle, false);
            
            setTimeout(() => {
                createControlCircle(render.options.width / 2, 50); // Создаем новый шарик по центру
            }, 500);
        }
    });

    Events.on(engine, 'collisionStart', function(event) {
        event.pairs.forEach(pair => {
            const { bodyA, bodyB } = pair;
            if (bodyA.level === bodyB.level && bodyA.level < levels.length && !bodyA.hasMerged && !bodyB.hasMerged) {
                const newLevel = bodyA.level + 1;
                const posX = (bodyA.position.x + bodyB.position.x) / 2;
                const posY = (bodyA.position.y + bodyB.position.y) / 2;
                const newCircle = createCircle(newLevel, posX, posY);
                World.add(world, newCircle);
                World.remove(world, bodyA);
                World.remove(world, bodyB);

                score += newLevel * 10;
                updateScoreDisplay();

                bodyA.hasMerged = true;
                bodyB.hasMerged = true;
                newCircle.hasMerged = true;
            }
        });
    });

    Events.on(engine, 'collisionActive', function(event) {
        event.pairs.forEach(pair => {
            const { bodyA, bodyB } = pair;
            const overlap = pair.collision.depth;
            if (overlap > 0) {
                const normal = { x: bodyB.position.x - bodyA.position.x, y: bodyB.position.y - bodyA.position.y };
                const distance = Math.sqrt(normal.x * normal.x + normal.y * normal.y);
                const correction = { x: normal.x / distance * overlap, y: normal.y / distance * overlap };
                Body.applyForce(bodyB, bodyB.position, { x: -correction.x, y: -correction.y * 1.5 });
            }
        });
    });

    Events.on(engine, 'afterUpdate', function() {
        Matter.Composite.allBodies(world).forEach(body => {
            body.hasMerged = false;
        });
    });

    let dashOffset = 0;
    function animateLine() {
        dashOffset += 0.5;
    }

    Events.on(render, 'afterRender', function() {
        if (controlCircle && controlCircle.isStatic) {
            const ctx = render.context;
            ctx.fillStyle = currentLineColor;

            const bodies = Matter.Composite.allBodies(world);
            const rayStart = { x: controlCircle.position.x, y: controlCircle.position.y + controlCircle.circleRadius };
            const rayEnd = { x: controlCircle.position.x, y: render.options.height };

            const collisions = Query.ray(bodies, rayStart, rayEnd);

            let closestPoint = rayEnd;
            let minDistance = Vector.magnitude(Vector.sub(rayStart, rayEnd));

            collisions.forEach(collision => {
                if (collision.body.isStatic === false && collision.body.circleRadius) {
                    const bodyCenter = collision.body.position;
                    const bodyRadius = collision.body.circleRadius;

                    const lineStart = rayStart;
                    const lineEnd = rayEnd;
                    const lineDir = Vector.normalise(Vector.sub(lineEnd, lineStart));

                    const toCircle = Vector.sub(bodyCenter, lineStart);

                    const projLength = Vector.dot(lineDir, toCircle);
                    const projPoint = Vector.add(lineStart, Vector.mult(lineDir, projLength));

                    const fromProjToCenter = Vector.sub(bodyCenter, projPoint);

                    if (Vector.magnitude(fromProjToCenter) < bodyRadius) {
                        const offsetLength = Math.sqrt(bodyRadius * bodyRadius - Vector.magnitudeSquared(fromProjToCenter));
                        const collisionPoint = Vector.add(projPoint, Vector.mult(lineDir, -offsetLength));

                        const distanceToEdgeVertical = Vector.magnitude(Vector.sub(rayStart, collisionPoint));

                        if (distanceToEdgeVertical < minDistance) {
                            minDistance = distanceToEdgeVertical;
                            closestPoint = collisionPoint;
                        }
                    }
                }
            });

            const gradient = ctx.createLinearGradient(rayStart.x, rayStart.y, closestPoint.x, closestPoint.y);
            gradient.addColorStop(0, `${currentLineColor}00`);
            gradient.addColorStop(0.05, currentLineColor);
            gradient.addColorStop(0.9, currentLineColor);
            gradient.addColorStop(1, `${currentLineColor}00`);

            for (let i = dashOffset % 15; i < minDistance; i += 15) {
                const x = rayStart.x;
                const y = rayStart.y + i;
                ctx.fillStyle = gradient;

                ctx.beginPath();
                ctx.arc(x, y, 2.6, 0, Math.PI * 2);
                ctx.fill();
            }

            animateLine();
        }
        if (document.getElementById('score-display')) {
            updateScoreDisplay();
        }
    });

    World.add(world, [
        Bodies.rectangle(400, 720, 800, 50, { isStatic: true, render: { fillStyle: 'grey' } }),
        Bodies.rectangle(0, 360, 50, 720, { isStatic: true, render: { fillStyle: 'grey' } }),
        Bodies.rectangle(800, 360, 50, 720, { isStatic: true, render: { fillStyle: 'grey' } })
    ]);

    Engine.run(engine);
    Render.run(render);

    initializeControlCircle();
});
