document.addEventListener('DOMContentLoaded', () => {
    const cellsContainer = document.getElementById('mainField');
    const modal = document.getElementById('modal');
    const classicModeButton = document.getElementById('classicMode');
    const updatedModeButton = document.getElementById('updatedMode');
    const gridSizeSelectClassic = document.getElementById('gridSizeClassic');
    const winLengthInputClassic = document.getElementById('winLengthClassic');
    const difficultySliderClassic = document.getElementById('difficultyClassic');
    const startBotGameClassicButton = document.getElementById('startBotGameClassic');
    const startPlayerGameClassicButton = document.getElementById('startPlayerGameClassic');
    const scoreXElement = document.getElementById('scoreX');
    const scoreOElement = document.getElementById('scoreO');
    const playerOElement = document.getElementById('playerO');
    const classicOptions = document.getElementById('classicOptions');
    const updatedOptions = document.getElementById('updatedOptions');
    let turn;
    let gameOver = false;
    let vsBot = false;
    let difficulty = 1;
    let scoreX = 0;
    let scoreO = 0;
    let gridSize = 3;
    let winLength = 3;
    let cells = [];

    const resizeObserver = new ResizeObserver(entries => {
        for (let entry of entries) {
            const cellSize = Math.min(entry.contentRect.width, entry.contentRect.height);
            entry.target.style.setProperty('--cell-font-size', `${cellSize * 0.6}px`);
        }
    });

    classicModeButton.addEventListener('click', () => {
        classicOptions.style.display = 'block';
        updatedOptions.style.display = 'none';
    });

    updatedModeButton.addEventListener('click', () => {
        classicOptions.style.display = 'none';
        updatedOptions.style.display = 'block';
    });

    gridSizeSelectClassic.addEventListener('change', () => {
        const size = parseInt(gridSizeSelectClassic.value, 10);
        if (size === 3) {
            winLengthInputClassic.value = 3;
            winLengthInputClassic.max = 3;
        } else if (size === 4) {
            winLengthInputClassic.value = 4;
            winLengthInputClassic.max = 4;
        } else {
            winLengthInputClassic.value = 5;
            winLengthInputClassic.max = 10;
        }
    });

    startPlayerGameClassicButton.addEventListener('click', () => {
        vsBot = false;
        updatePlayerOText('Игрок O');
        startGame();
    });

    startBotGameClassicButton.addEventListener('click', () => {
        vsBot = true;
        updatePlayerOText('Бот O');
        difficulty = parseInt(difficultySliderClassic.value, 10);
        startGame();
    });

    function startGame() {
        gridSize = parseInt(gridSizeSelectClassic.value, 10);
        winLength = parseInt(winLengthInputClassic.value, 10);
        modal.style.display = 'none';
        createGrid(gridSize);
        turn = Math.random() < 0.5 ? 'X' : 'O';
        setTimeout(() => {
            document.body.style.backgroundColor = turn === 'X' ? '#F2AF5C' : '#40799A';
            cells.forEach(cell => cell.addEventListener('click', cellClick));
            if (vsBot && turn === 'O') {
                lockCells();
                setTimeout(botMove, 1000);
            }
        }, 1000);
    }

    function createGrid(size) {
        cellsContainer.innerHTML = '';
        cellsContainer.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
        cellsContainer.style.gridTemplateRows = `repeat(${size}, 1fr)`;
        cells = [];
        for (let i = 0; i < size * size; i++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cellsContainer.appendChild(cell);
            cells.push(cell);
            resizeObserver.observe(cell);
        }
    }

    function cellClick(e) {
        if (!gameOver && (vsBot && turn === 'X' || !vsBot)) { // Разрешаем клик, если против бота и ход 'X', либо против игрока
            const cell = e.target;
            if (cell.textContent === '') {
                cell.textContent = turn;
                cell.style.pointerEvents = 'none';

                if (checkWin(turn)) {
                    gameOver = true;
                    updateScore(turn);
                    setTimeout(resetBoard, 1000);
                } else if (isBoardFull()) {
                    setTimeout(resetBoard, 1000);
                } else {
                    switchTurn();
                    if (vsBot && turn === 'O') {
                        lockCells(); // Блокируем ячейки перед ходом бота
                        setTimeout(botMove, 1000);
                    }
                }
            }
        }
    }

    function botMove() {
        if (!gameOver) {
            let moveMade = false;

            if (difficulty === 3) {
                moveMade = attemptWinningMove('O') || attemptBlockingMove('X');
            } else if (difficulty === 2) {
                moveMade = attemptBlockingMove('X');
            }

            if (!moveMade) {
                makeRandomMove();
            }

            if (checkWin(turn)) {
                gameOver = true;
                updateScore(turn);
                setTimeout(resetBoard, 1000);
            } else if (isBoardFull()) {
                setTimeout(resetBoard, 1000);
            } else {
                switchTurn();
                unlockCells(); // Разблокируем ячейки после хода бота
            }
        }
    }

    function attemptWinningMove(player) {
        return winningCombinations(player).some(combination => {
            const cellsArray = combination.map(index => cells[index]);
            const countPlayer = cellsArray.filter(cell => cell.textContent === player).length;
            const emptyCells = cellsArray.filter(cell => cell.textContent === '');

            if (countPlayer === winLength - 1 && emptyCells.length === 1) {
                const targetCell = emptyCells[0];
                targetCell.textContent = 'O';
                targetCell.style.pointerEvents = 'none';
                return true;
            }
            return false;
        });
    }

    function attemptBlockingMove(player) {
        return attemptWinningMove(player);
    }

    function makeRandomMove() {
        const emptyCells = cells.filter(cell => !cell.textContent);
        const randomIndex = Math.floor(Math.random() * emptyCells.length);
        const targetCell = emptyCells[randomIndex];
        targetCell.textContent = 'O';
        targetCell.style.pointerEvents = 'none';
    }

    function lockCells() {
        cells.forEach(cell => cell.style.pointerEvents = 'none');
    }

    function unlockCells() {
        cells.forEach(cell => {
            if (!cell.textContent) {
                cell.style.pointerEvents = 'auto';
            }
        });
    }

    function switchTurnWithDelay() {
        switchTurn();
        lockCells();
        setTimeout(() => {
            unlockCells();
            if (vsBot && turn === 'O' && !gameOver) {
                setTimeout(botMove, 1000);
            }
        }, 1000);
    }

    function switchTurn() {
        turn = turn === 'X' ? 'O' : 'X';
        document.body.style.backgroundColor = turn === 'X' ? '#F2AF5C' : '#40799A';
    }

    function checkWin(player) {
        return winningCombinations(player).some(combination => {
            return combination.every(index => {
                return cells[index].textContent === player;
            });
        });
    }

    function winningCombinations(player) {
        const combinations = [];
        const gridSizeSquared = gridSize * gridSize;

        for (let i = 0; i < gridSize; i++) {
            for (let j = 0; j < gridSize - winLength + 1; j++) {
                const row = [], col = [];
                for (let k = 0; k < winLength; k++) {
                    row.push(i * gridSize + j + k);
                    col.push(j * gridSize + i + k * gridSize);
                }
                combinations.push(row, col);
            }
        }

        for (let i = 0; i < gridSize - winLength + 1; i++) {
            for (let j = 0; j < gridSize - winLength + 1; j++) {
                const diag1 = [], diag2 = [];
                for (let k = 0; k < winLength; k++) {
                    diag1.push((i + k) * gridSize + j + k);
                    diag2.push((i + k) * gridSize + j + winLength - k - 1);
                }
                combinations.push(diag1, diag2);
            }
        }

        return combinations;
    }

    function isBoardFull() {
        return cells.every(cell => cell.textContent);
    }

    function resetBoard() {
        cells.forEach(cell => {
            cell.textContent = '';
            cell.style.pointerEvents = 'auto';
            cell.addEventListener('click', cellClick);
        });
        gameOver = false;
        switchTurn();
        if (vsBot && turn === 'O') {
            lockCells();
            setTimeout(botMove, 1000);
        }
    }

    function updateScore(player) {
        if (player === 'X') {
            scoreX++;
            scoreXElement.textContent = scoreX;
        } else if (player === 'O') {
            scoreO++;
            scoreOElement.textContent = scoreO;
        }
    }

    function updatePlayerOText(text) {
        playerOElement.firstChild.textContent = `${text}: `;
    }
});
