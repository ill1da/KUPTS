document.addEventListener('DOMContentLoaded', function() {
    const { Engine, Render, World, Bodies, Body, Events, Query, Vector } = Matter;

    const engine = Engine.create({
        gravity: { x: 0, y: 1 },
        positionIterations: 10,
        velocityIterations: 10
    });

    const world = engine.world;
    const gameContainer = document.getElementById('game-container');
    const backgroundCanvas = document.getElementById('background-canvas');
    const gameCanvas = document.getElementById('game-canvas');
    const nextBallsContainer = document.getElementById('next-balls-container');

    // Настраиваем фон
    function setupBackgroundCanvas() {
        backgroundCanvas.width = gameContainer.clientWidth;
        backgroundCanvas.height = gameContainer.clientHeight;
        const ctx = backgroundCanvas.getContext('2d');
        const losingLineY = backgroundCanvas.height - 660;

        ctx.fillStyle = '#ADD8E6'; // Цвет для области выше линии проигрыша
        ctx.fillRect(0, 0, backgroundCanvas.width, losingLineY);

        ctx.fillStyle = '#FFFFE0'; // Цвет для области ниже линии проигрыша
        ctx.fillRect(0, losingLineY, backgroundCanvas.width, backgroundCanvas.height - losingLineY);
    }

    setupBackgroundCanvas(); // Рисуем фон один раз

    let render;

    function createRender() {
        const containerWidth = gameContainer.clientWidth;
        const containerHeight = gameContainer.clientHeight;

        render = Render.create({
            canvas: gameCanvas,
            engine: engine,
            options: {
                wireframes: false,
                width: containerWidth,
                height: containerHeight,
                background: 'transparent' // Убедимся, что фон прозрачный
            }
        });

        render.canvas.width = containerWidth;
        render.canvas.height = containerHeight;
    }

    createRender(); // Инициализируем рендер

    const collisionCategories = {
        control: 0x0001,
        active: 0x0002
    };

    const levels = [
        { size: 10, color: '#5B748E', density: 0.1 },
        { size: 15, color: '#FF4B19', density: 0.15 },
        { size: 22, color: '#D95970', density: 0.22 },
        { size: 32, color: '#F2A679', density: 0.32 },
        { size: 45, color: '#E8D650', density: 0.45 },
        { size: 60, color: '#473145', density: 0.60 },
        { size: 78, color: '#F28705', density: 0.78 },
        { size: 100, color: '#BF1304', density: 1.0 },
        { size: 125, color: '#D9A404', density: 1.25 },
        { size: 150, color: '#8C4E03', density: 1.50 },
        { size: 180, color: '#50732D', density: 1.80 }
    ];

    let score = 0;
    let upcomingBalls = [];

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

    function createUpcomingBall() {
        const randomLevel = Math.floor(Math.random() * 4) + 1;
        upcomingBalls.push(randomLevel);
        if (upcomingBalls.length > 3) {
            upcomingBalls.shift();
        }
        updateUpcomingBallsDisplay();
    }

    function updateUpcomingBallsDisplay() {
        const nextBallElements = document.querySelectorAll('.next-ball');
        nextBallElements.forEach((el, index) => {
            if (upcomingBalls[upcomingBalls.length - 1 - index] !== undefined) {
                const level = upcomingBalls[upcomingBalls.length - 1 - index];
                el.style.backgroundColor = levels[level - 1].color;
            } else {
                el.style.backgroundColor = '#ccc';
            }
        });
    }

    function getNextBallLevel() {
        const nextLevel = upcomingBalls.shift();
        createUpcomingBall();
        return nextLevel;
    }

    function updateBorders(width, height) {
        World.remove(world, 'border');
        World.add(world, [
            Bodies.rectangle(width / 2, height, width, 50, { isStatic: true, render: { fillStyle: 'grey' } }), // Нижняя граница
            Bodies.rectangle(0, height - 345, 50, height - 35, { isStatic: true, render: { fillStyle: 'grey' } }), // Левая граница
            Bodies.rectangle(width, height - 345, 50, height - 35, { isStatic: true, render: { fillStyle: 'grey' } }) // Правая граница
        ]);
    }

    function setDynamicCanvasSize() {
        const containerWidth = gameContainer.clientWidth;
        const containerHeight = gameContainer.clientHeight;

        render.options.width = containerWidth;
        render.options.height = containerHeight;
        render.canvas.width = containerWidth;
        render.canvas.height = containerHeight;

        setupBackgroundCanvas(); // Обновляем размеры фона
        updateBorders(containerWidth, containerHeight);
    }

    window.addEventListener('resize', setDynamicCanvasSize);
    setDynamicCanvasSize(); // Устанавливаем размеры при загрузке

    let controlCircle = null;

    let currentLineColor = '#000';

    function createControlCircle(x, y) {
        const randomLevel = getNextBallLevel();
        const radius = levels[randomLevel - 1].size;

        // Ограничение координат спавна по оси x
        const minX = radius + 25;
        const maxX = render.options.width - radius - 25;
        x = Math.max(minX, Math.min(x, maxX));

        controlCircle = createCircle(randomLevel, x, y - radius, true);
        Body.setStatic(controlCircle, true);
        World.add(world, controlCircle);
        Body.setPosition(controlCircle, { x, y: y - radius });

        currentLineColor = levels[randomLevel - 1].color;
    }

    function isTouchDevice() {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    }

    function getCanvasCoordinates(event) {
        const rect = render.canvas.getBoundingClientRect();
        const x = (event.clientX - rect.left) * (render.canvas.width / rect.width);
        const y = (event.clientY - rect.top) * (render.canvas.height / rect.height);
        return { x, y };
    }

    function initializeControlCircle() {
        const spawnX = render.options.width / 2;
        const spawnY = 50;
        createControlCircle(spawnX, spawnY);

        if (!isTouchDevice()) {
            render.canvas.addEventListener('mousemove', handleMouseMove);
            render.canvas.addEventListener('mousedown', handleMouseDown);
        }
    }

    let currentCursorX = render.options.width / 2;

    function handleMouseMove(event) {
        const { x } = getCanvasCoordinates(event);
        currentCursorX = x;

        if (controlCircle && controlCircle.isStatic) {
            const radius = controlCircle.circleRadius;

            // Ограничение координат по оси x
            const clampedX = Math.max(radius + 25, Math.min(x, render.options.width - radius - 25));
            Body.setPosition(controlCircle, { x: clampedX, y: 50 - radius });
        }
    }

    let lastSpawnTime = 0;
    const spawnInterval = 500;

    function handleMouseDown(event) {
        const currentTime = new Date().getTime();
        if (currentTime - lastSpawnTime < spawnInterval) {
            return;
        }
        lastSpawnTime = currentTime;

        if (controlCircle) {
            controlCircle.collisionFilter.mask = 0xFFFF;
            Body.setStatic(controlCircle, false);
        }

        setTimeout(() => {
            const spawnY = 50;
            createControlCircle(currentCursorX, spawnY);
        }, 500);
    }

    render.canvas.addEventListener('touchstart', function(event) {
        event.preventDefault();
        const touch = event.touches[0];
        const { x } = getCanvasCoordinates(touch);

        // Ограничение координат по оси x
        const clampedX = Math.max(25, Math.min(x, render.options.width - 25));
        if (controlCircle && controlCircle.isStatic) {
            const radius = controlCircle.circleRadius;
            Body.setPosition(controlCircle, { x: clampedX, y: 50 - radius });
        }
    });

    render.canvas.addEventListener('touchmove', function(event) {
        event.preventDefault();
        const touch = event.touches[0];
        const { x } = getCanvasCoordinates(touch);

        // Ограничение координат по оси x
        const clampedX = Math.max(25, Math.min(x, render.options.width - 25));
        if (controlCircle && controlCircle.isStatic) {
            const radius = controlCircle.circleRadius;
            Body.setPosition(controlCircle, { x: clampedX, y: 50 - radius });
        }
    });

    render.canvas.addEventListener('touchend', function(event) {
        const touch = event.changedTouches[0];
        const { x } = getCanvasCoordinates(touch);

        // Ограничение координат по оси x
        const clampedX = Math.max(25, Math.min(x, render.options.width - 25));
        const currentTime = new Date().getTime();
        if (currentTime - lastSpawnTime < spawnInterval) {
            return;
        }
        lastSpawnTime = currentTime;

        if (controlCircle && controlCircle.isStatic) {
            const radius = controlCircle.circleRadius;
            Body.setPosition(controlCircle, { x: clampedX, y: 50 - radius });

            controlCircle.collisionFilter.mask = 0xFFFF;
            Body.setStatic(controlCircle, false);

            setTimeout(() => {
                const spawnY = 50;
                createControlCircle(render.options.width / 2, spawnY);
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

    let losingFruits = [];

    Events.on(render, 'afterRender', function() {
        const ctx = render.context;

        if (controlCircle && controlCircle.isStatic) {
            ctx.fillStyle = currentLineColor;

            const bodies = Matter.Composite.allBodies(world);
            const rayStart = { x: controlCircle.position.x, y: controlCircle.position.y + controlCircle.circleRadius };
            const rayEnd = { x: controlCircle.position.x, y: render.options.height - 20 };

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

        ctx.strokeStyle = 'red';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 15]);
        ctx.beginPath();
        ctx.moveTo(0, render.options.height - 660);
        ctx.lineTo(render.options.width, render.options.height - 660);
        ctx.stroke();
        ctx.setLineDash([]);

        const bodies = Matter.Composite.allBodies(world);
        bodies.forEach(body => {
            const radius = body.circleRadius;
            const isTouchingLine = body.position.y + radius >= render.options.height - 660 && body.position.y - radius <= render.options.height - 660;
            if (!body.isStatic && isTouchingLine) {
                const fruitInContact = losingFruits.find(fruit => fruit.body === body);
                if (fruitInContact) {
                    fruitInContact.time += 1 / 60;
                    if (fruitInContact.time > 3) {
                        alert('Game Over!');
                        Engine.clear(engine);
                        Render.stop(render);
                        window.location.reload();
                    } else if (fruitInContact.time > 1) {
                        ctx.beginPath();
                        ctx.arc(fruitInContact.body.position.x, fruitInContact.body.position.y, radius + (Math.sin(Date.now() / 200) + 1) * 5, 0, Math.PI * 2);
                        ctx.strokeStyle = fruitInContact.body.render.fillStyle;
                        ctx.setLineDash([5, 3]);
                        ctx.lineWidth = 2;
                        ctx.stroke();
                        ctx.setLineDash([]);
                    }
                } else {
                    losingFruits.push({ body, time: 0 });
                }
            } else {
                const fruitInContact = losingFruits.find(fruit => fruit.body === body);
                if (fruitInContact) {
                    fruitInContact.time = 0;
                }
            }
        });

        losingFruits = losingFruits.filter(fruit => {
            const radius = fruit.body.circleRadius;
            const isContacting = fruit.body.position.y + radius >= render.options.height - 660 && fruit.body.position.y - radius <= render.options.height - 660;
            return isContacting;
        });

        if (document.getElementById('score-display')) {
            updateScoreDisplay();
        }
    });

    Engine.run(engine);
    Render.run(render);

    createUpcomingBall();
    createUpcomingBall();
    createUpcomingBall();
    initializeControlCircle();
});
