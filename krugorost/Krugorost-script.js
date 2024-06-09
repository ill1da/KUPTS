document.addEventListener('DOMContentLoaded', function() {
    const { Engine, Render, World, Bodies, Body, Events } = Matter;

    const engine = Engine.create({
        gravity: { x: 0, y: 1 },
        positionIterations: 10,
        velocityIterations: 10
    });

    const world = engine.world;
    const render = Render.create({
        element: document.getElementById('game-container'),
        engine: engine,
        options: { wireframes: false, width: 800, height: 600 }
    });

    const levels = [
        { size: 8, color: '#5B748E', density: 0.01 },
        { size: 17, color: '#FF4B19', density: 0.015 },
        { size: 26, color: '#D95970', density: 0.02 },
        { size: 35, color: '#F2A679', density: 0.025 },
        { size: 44, color: '#E8D650', density: 0.03 },
        { size: 53, color: '#473145', density: 0.035 },
        { size: 62, color: '#F28705', density: 0.04 },
        { size: 71, color: '#BF1304', density: 0.045 },
        { size: 80, color: '#D9A404', density: 0.05 },
        { size: 89, color: '#8C4E03', density: 0.055 },
        { size: 98, color: '#50732D', density: 0.06 }
    ];

    function createCircle(level, x, y) {
        return Bodies.circle(x, y, levels[level - 1].size, {
            isStatic: false,
            render: { fillStyle: levels[level - 1].color },
            restitution: 0.5,
            level: level,
            density: levels[level - 1].density
        });
    }

    let controlCircle = null;

    function createControlCircle() {
        const randomLevel = Math.floor(Math.random() * 4) + 1;
        const x = 400;  // Central position horizontally
        const y = 50;   // Small offset from the top
        controlCircle = createCircle(randomLevel, x, y);
        Body.setStatic(controlCircle, true);
        World.add(world, controlCircle);
        Body.setPosition(controlCircle, { x: 400, y: 50 });  // Ensure it's centered right after creation
    }

    createControlCircle();  // Create the initial control circle

    render.canvas.addEventListener('mousemove', function(event) {
        const rect = render.canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        if (controlCircle && controlCircle.isStatic) {
            Body.setPosition(controlCircle, { x: mouseX, y: 50 });
        }
    });

    render.canvas.addEventListener('mousedown', function() {
        if (controlCircle && controlCircle.isStatic) {
            Body.setStatic(controlCircle, false);
            setTimeout(createControlCircle, 500);  // Delay next circle creation
        }
    });

    Events.on(engine, 'collisionStart', function(event) {
        event.pairs.forEach(pair => {
            const { bodyA, bodyB } = pair;
            if (bodyA.level && bodyB.level && bodyA.level === bodyB.level && bodyA.level < levels.length) {
                const newLevel = bodyA.level + 1;
                const posX = (bodyA.position.x + bodyB.position.x) / 2;
                const posY = (bodyA.position.y + bodyB.position.y) / 2;
                const newCircle = createCircle(newLevel, posX, posY);
                World.add(world, newCircle);
                World.remove(world, bodyA);
                World.remove(world, bodyB);
                // Animate the merging
                Body.scale(newCircle, 1.2, 1.2);
                setTimeout(() => Body.scale(newCircle, 1/1.2, 1/1.2), 100);
            }
        });
    });

    World.add(world, [
        Bodies.rectangle(400, 600, 800, 50, { isStatic: true, render: { fillStyle: 'grey' } }),
        Bodies.rectangle(300, 300, 50, 600, { isStatic: true, render: { fillStyle: 'grey' } }),
        Bodies.rectangle(0, 300, 50, 600, { isStatic: true, render: { fillStyle: 'grey' } }),
        Bodies.rectangle(800, 300, 50, 600, { isStatic: true, render: { fillStyle: 'grey' } }) // Right wall
    ]);

    Engine.run(engine);
    Render.run(render);
});


