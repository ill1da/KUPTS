document.addEventListener('DOMContentLoaded', function() {
    const { Engine, Render, World, Bodies, Body, Events } = Matter;

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
        { size: 16, color: '#5B748E', density: 0.01},
        { size: 34, color: '#FF4B19', density: 0.01},
        { size: 52, color: '#D95970', density: 0.01},
        { size: 70, color: '#F2A679', density: 0.01},
        { size: 88, color: '#E8D650', density: 0.01},
        { size: 106, color: '#473145', density: 0.01},
        { size: 124, color: '#F28705', density: 0.01},
        { size: 142, color: '#BF1304', density: 0.01},
        { size: 160, color: '#D9A404', density: 0.01},
        { size: 178, color: '#8C4E03', density: 0.01},
        { size: 196, color: '#50732D', density: 0.01}
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

    function createControlCircle() {
        const randomLevel = Math.floor(Math.random() * 4) + 1;
        const x = 400;
        const y = 50;
        controlCircle = createCircle(randomLevel, x, y, true);
        Body.setStatic(controlCircle, true);
        World.add(world, controlCircle);
        Body.setPosition(controlCircle, { x: 400, y: 50 });
    }

    createControlCircle();

    render.canvas.addEventListener('mousemove', function(event) {
        const rect = render.canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const radius = controlCircle.circleRadius;
        if (controlCircle && controlCircle.isStatic) {
            const clampedX = Math.min(Math.max(mouseX, radius + 25), render.options.width - radius - 25);
            Body.setPosition(controlCircle, { x: clampedX, y: 50 });
        }
    });

    render.canvas.addEventListener('mousedown', function() {
        if (controlCircle && controlCircle.isStatic) {
            controlCircle.collisionFilter.mask = 0xFFFF;
            Body.setStatic(controlCircle, false);
            setTimeout(createControlCircle, 500);
        }
    });

    render.canvas.addEventListener('touchmove', function(event) {
        event.preventDefault();  // Предотвращаем стандартное поведение скроллинга
        const touch = event.touches[0];  // Получаем первое касание
        const rect = render.canvas.getBoundingClientRect();
        const touchX = touch.clientX - rect.left;
        const radius = controlCircle.circleRadius;
        if (controlCircle && controlCircle.isStatic) {
            const clampedX = Math.min(Math.max(touchX, radius + 25), render.options.width - radius - 25);
            Body.setPosition(controlCircle, { x: clampedX, y: 50 });
        }
    });

    render.canvas.addEventListener('touchend', function() {
        if (controlCircle && controlCircle.isStatic) {
            controlCircle.collisionFilter.mask = 0xFFFF;
            Body.setStatic(controlCircle, false);
            setTimeout(createControlCircle, 500);  // Задержка перед созданием нового контрольного шарика
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

    Events.on(render, 'afterRender', function() {
        if (controlCircle && controlCircle.isStatic) {
            const ctx = render.context;
            ctx.beginPath();
            ctx.setLineDash([5, 15]);
            ctx.strokeStyle = controlCircle.render.fillStyle;
            ctx.moveTo(controlCircle.position.x, controlCircle.position.y);
            ctx.lineTo(controlCircle.position.x, 720);  // Draw to the bottom of the canvas
            ctx.lineWidth = 2;
            ctx.stroke();
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
});
