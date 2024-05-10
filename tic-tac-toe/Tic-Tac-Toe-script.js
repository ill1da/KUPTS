document.addEventListener('DOMContentLoaded', () => {
    const cellsContainer = document.getElementById('mainField');
    const modal = document.getElementById('modal');
    const vsPlayerButton = document.getElementById('vsPlayer');
    const vsBotButton = document.getElementById('vsBot');
    const botDifficultyDiv = document.getElementById('botDifficulty');
    const startBotGameButton = document.getElementById('startBotGame');
    const difficultySlider = document.getElementById('difficulty');
    const scoreXElement = document.getElementById('scoreX');
    const scoreOElement = document.getElementById('scoreO');
    const playerOElement = document.getElementById('playerO');
    const modifyCheckbox = document.getElementById('modifyCheckbox');
    const modificationOptions = document.getElementById('modificationOptions');
    const gridSizeSelect = document.getElementById('gridSize');
    const winLengthInput = document.getElementById('winLength');
    const gameModeRadios = document.getElementsByName('gameMode');
    let turn;
    let gameOver = false;
    let vsBot = false;
    let difficulty = 1;
    let scoreX = 0;
    let scoreO = 0;
    let gridSize = 3;
    let winLength = 3;
    let gameMode = 'classic';
    let cells = [];
    let movesX = [];
    let movesO = [];

    const resizeObserver = new ResizeObserver(entries => {
        for (let entry of entries) {
            const cellSize = Math.min(entry.contentRect.width, entry.contentRect.height);
            entry.target.style.setProperty('--cell-font-size', `${cellSize * 0.6}px`);
        }
    });

    modifyCheckbox.addEventListener('change', () => {
        if (modifyCheckbox.checked) {
            modificationOptions.style.display = 'block';
        } else {
            modificationOptions.style.display = 'none';
            resetToDefaultSettings();
        }
    });

    vsPlayerButton.addEventListener('click', () => {
        vsBot = false;
        updatePlayerOText('Игрок O');
        startGame();
    });

    vsBotButton.addEventListener('click', () => {
        vsBot = true;
        updatePlayerOText('Бот O');
        botDifficultyDiv.style.display = 'block';
    });

    startBotGameButton.addEventListener('click', () => {
        difficulty = parseInt(difficultySlider.value, 10);
        startGame();
    });

    gameModeRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            gameMode = e.target.value;
        });
    });

    function startGame() {
        gridSize = parseInt(gridSizeSelect.value, 10);
        winLength = parseInt(winLengthInput.value, 10);
        modal.style.display = 'none';
        createGrid(gridSize);
        turn = Math.random() < 0.5 ? 'X' : 'O';
        movesX = [];
        movesO = [];
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
            const symbol = document.createElement('div'); // Добавляем элемент для символа
            symbol.classList.add('symbol');
            cell.appendChild(symbol);
            cellsContainer.appendChild(cell);
            cells.push(cell);
            resizeObserver.observe(cell);
        }
    }

    function cellClick(e) {
        if (!gameOver && (vsBot && turn === 'X' || !vsBot)) {
            const cell = e.target.closest('.cell'); // Получаем ближайшую ячейку
            const symbol = cell.querySelector('.symbol'); // Получаем элемент символа
            if (symbol.textContent === '') {
                prepareNextMove();
                symbol.textContent = turn;
                cell.style.pointerEvents = 'none';
                finalizeMove(cell);
            }
        }
    }

    function prepareNextMove() {
        if (gameMode === 'modern') {
            if (turn === 'X' && movesX.length >= winLength) {
                const oldMove = movesX[0].querySelector('.symbol');
                oldMove.classList.add('fading');
            } else if (turn === 'O' && movesO.length >= winLength) {
                const oldMove = movesO[0].querySelector('.symbol');
                oldMove.classList.add('fading');
            }
        }
    }

    function finalizeMove(cell) {
        if (gameMode === 'modern') {
            if (turn === 'X') {
                if (movesX.length >= winLength) {
                    const oldMove = movesX.shift();
                    const oldSymbol = oldMove.querySelector('.symbol');
                    oldSymbol.textContent = '';
                    oldSymbol.classList.remove('fading');
                    oldMove.style.pointerEvents = 'auto';
                }
                movesX.push(cell);
            } else {
                if (movesO.length >= winLength) {
                    const oldMove = movesO.shift();
                    const oldSymbol = oldMove.querySelector('.symbol');
                    oldSymbol.textContent = '';
                    oldSymbol.classList.remove('fading');
                    oldMove.style.pointerEvents = 'auto';
                }
                movesO.push(cell);
            }

            // Check for win or full board after removing the old move
            if (checkWin(turn)) {
                gameOver = true;
                updateScore(turn);
                setTimeout(resetBoard, 1000);
            } else if (isBoardFull()) {
                setTimeout(resetBoard, 1000);
            } else {
                switchTurn();
                if (vsBot && turn === 'O') {
                    lockCells();
                    setTimeout(botMove, 1000);
                } else {
                    unlockCells(); // Ensure cells are unlocked for player's turn
                }
            }
        } else {
            // Classic mode handling
            if (checkWin(turn)) {
                gameOver = true;
                updateScore(turn);
                setTimeout(resetBoard, 1000);
            } else if (isBoardFull()) {
                setTimeout(resetBoard, 1000);
            } else {
                switchTurn();
                if (vsBot && turn === 'O') {
                    lockCells();
                    setTimeout(botMove, 1000);
                } else {
                    unlockCells(); // Ensure cells are unlocked for player's turn
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
                prepareNextMove(); // Prepare before making a random move
                setTimeout(() => {
                    makeRandomMove();
                    finalizeMove(movesO[movesO.length - 1]); // Finalize move for bot
                    unlockCells(); // Ensure cells are unlocked after bot's move
                }, 500);
            } else {
                finalizeMove(movesO[movesO.length - 1]); // Finalize move for bot
                unlockCells(); // Ensure cells are unlocked after bot's move
            }
        }
    }

    function attemptWinningMove(player) {
        return winningCombinations(player).some(combination => {
            const cellsArray = combination.map(index => cells[index]);
            const countPlayer = cellsArray.filter(cell => cell.querySelector('.symbol').textContent === player).length;
            const emptyCells = cellsArray.filter(cell => cell.querySelector('.symbol').textContent === '');

            if (countPlayer === winLength - 1 && emptyCells.length === 1) {
                emptyCells[0].querySelector('.symbol').textContent = 'O';
                emptyCells[0].style.pointerEvents = 'none';
                return true;
            }
            return false;
        });
    }

    function attemptBlockingMove(player) {
        return attemptWinningMove(player);
    }

    function makeRandomMove() {
        const emptyCells = cells.filter(cell => !cell.querySelector('.symbol').textContent);
        const randomIndex = Math.floor(Math.random() * emptyCells.length);
        const cell = emptyCells[randomIndex];
        if (gameMode === 'modern') {
            if (movesO.length >= winLength) {
                const oldMove = movesO.shift();
                const oldSymbol = oldMove.querySelector('.symbol');
                oldSymbol.textContent = '';
                oldSymbol.classList.remove('fading');
                oldMove.style.pointerEvents = 'auto';
            }
            movesO.push(cell);
        }
        const symbol = cell.querySelector('.symbol');
        symbol.textContent = 'O';
        cell.style.pointerEvents = 'none';
    }

    function lockCells() {
        cells.forEach(cell => cell.style.pointerEvents = 'none');
    }

    function unlockCells() {
        cells.forEach(cell => {
            if (!cell.querySelector('.symbol').textContent) {
                cell.style.pointerEvents = 'auto';
            }
        });
    }

    function switchTurn() {
        turn = turn === 'X' ? 'O' : 'X';
        document.body.style.backgroundColor = turn === 'X' ? '#F2AF5C' : '#40799A';
    }

    function checkWin(player) {
        return winningCombinations(player).some(combination => {
            return combination.every(index => {
                return cells[index].querySelector('.symbol').textContent === player;
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
        return cells.every(cell => cell.querySelector('.symbol').textContent);
    }

    function resetBoard() {
        cells.forEach(cell => {
            const symbol = cell.querySelector('.symbol');
            symbol.textContent = '';
            cell.style.pointerEvents = 'auto';
            symbol.classList.remove('fading');
            cell.addEventListener('click', cellClick);
        });
        movesX = [];
        movesO = [];
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

    function resetToDefaultSettings() {
        gridSizeSelect.value = 3;
        winLengthInput.value = 3;
    }
});