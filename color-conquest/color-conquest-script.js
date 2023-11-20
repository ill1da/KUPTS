document.addEventListener('DOMContentLoaded', () => {
    let canvas, ctx;
    let interval;
    let canvasWidth = 500, canvasHeight = 500;
    let gridSize = 125, gridStep = 500 / gridSize;
    let aliveCellRatio = 0;
    let grid, newGrid, neighborGrid, ratioGrid;
    let cellColor1, cellColor2;
    let progress, progressText;

    function initializeGrid() {
        grid = new Array(gridSize).fill(null).map(() => new Array(gridSize).fill(0));
        newGrid = new Array(gridSize).fill(null).map(() => new Array(gridSize).fill(0));
        neighborGrid = new Array(gridSize).fill(null).map(() => new Array(gridSize).fill(8));
        ratioGrid = new Array(gridSize).fill(null).map(() => new Array(gridSize).fill(0));

        for (let i = 0; i < gridSize; ++i) {
            for (let j = 0; j < gridSize; ++j) {
                neighborGrid[i][j] = 8;

                if (i === 0 || i === gridSize - 1) {
                    neighborGrid[i][j] = 5;
                    if (j === 0 || j === gridSize - 1) {
                        neighborGrid[i][j] = 3;
                    }
                }
                if (j === 0 || j === gridSize - 1) {
                    neighborGrid[i][j] = 5;
                    if (i === 0 || i === gridSize - 1) {
                        neighborGrid[i][j] = 3;
                    }
                }

                grid[i][j] = i < gridSize / 2 ? 1 : 0;
                aliveCellRatio += grid[i][j];
                newGrid[i][j] = grid[i][j];
            }
        }
        aliveCellRatio /= gridSize * gridSize;
    }

    function calculateCellRatio() {
        for (let i = 0; i < gridSize; ++i) {
            for (let j = 0; j < gridSize; ++j) {
                ratioGrid[i][j] = 0;

                if (i > 0) {
                    if (j > 0) ratioGrid[i][j] += grid[i - 1][j - 1];
                    ratioGrid[i][j] += grid[i - 1][j];
                    if (j < gridSize - 1) ratioGrid[i][j] += grid[i - 1][j + 1];
                }

                if (j > 0) ratioGrid[i][j] += grid[i][j - 1];
                if (j < gridSize - 1) ratioGrid[i][j] += grid[i][j + 1];

                if (i < gridSize - 1) {
                    if (j > 0) ratioGrid[i][j] += grid[i + 1][j - 1];
                    ratioGrid[i][j] += grid[i + 1][j];
                    if (j < gridSize - 1) ratioGrid[i][j] += grid[i + 1][j + 1];
                }

                ratioGrid[i][j] /= neighborGrid[i][j];
            }
        }
    }

    function drawGrid() {
        for (let i = 0; i < gridSize; ++i) {
            for (let j = 0; j < gridSize; ++j) {
                ctx.fillStyle = grid[i][j] === 1 ? cellColor1 : cellColor2;
                ctx.fillRect(i * gridStep, j * gridStep, gridStep, gridStep);
            }
        }
    }

    function updateGrid() {
        for (let i = 0; i < gridSize; ++i) {
            for (let j = 0; j < gridSize; ++j) {
                let randomValue = Math.random();

                if (ratioGrid[i][j] > randomValue) {
                    grid[i][j] = 1;
                } else {
                    grid[i][j] = 0;
                }
            }
        }

        aliveCellRatio = grid.reduce((acc1, row) => acc1 + row.reduce((acc2, cell) => acc2 + cell, 0), 0) / (gridSize * gridSize);
        updateProgressBar();
    }

    function runSimulation() {
        calculateCellRatio();
        drawGrid();
        updateGrid();
    }

    function getRandomColor() {
        return "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
    }

    function getInvertedColor(hexColor) {
        const [r, g, b] = hexToRGB(hexColor);
        return `#${(255 - r).toString(16).padStart(2, '0')}${(255 - g).toString(16).padStart(2, '0')}${(255 - b).toString(16).padStart(2, '0')}`;
    }

    function hexToRGB(hex) {
        return [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)];
    }

    function setup() {
        canvas = document.getElementById("battlefield");
        ctx = canvas.getContext("2d");
        aliveCellRatio = 0;

        initializeGrid();
        setRandomColors();
        setupProgressBar();
        interval = setInterval(runSimulation, 2);
    }

    function setRandomColors() {
        cellColor1 = getRandomColor();
        cellColor2 = getInvertedColor(cellColor1);
    
        // Установка случайных значений цветов в инпуты
        document.getElementById("color1").value = cellColor1;
        document.getElementById("color2").value = cellColor2;
    }

    function setupProgressBar() {
        progress = document.getElementById("progress");
        progressText = document.getElementById("progress-text");
        updateProgressBar();
    }

    function updateProgressBar() {
        const percentage = Math.round(aliveCellRatio * 100);
        progress.value = percentage;
    
        progress.style.background = `linear-gradient(to right, ${cellColor1} ${percentage}%, ${cellColor2} ${percentage}%)`;
    
        // Цвет текста
        document.getElementById("percentage1").style.color = cellColor2;
        document.getElementById("percentage2").style.color = cellColor1;
    
        document.getElementById("percentage1").textContent = percentage;
        document.getElementById("percentage2").textContent = 100 - percentage;
    }

    // Обработчики изменения цветов
    function handleColorChange() {
        cellColor1 = document.getElementById("color1").value;
        cellColor2 = document.getElementById("color2").value;
        updateProgressBar();
    }

    // Добавление обработчиков событий
    document.getElementById("color1").addEventListener("input", handleColorChange);
    document.getElementById("color2").addEventListener("input", handleColorChange);

    // Запуск инициализации
    setup();
});
