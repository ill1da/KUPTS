document.addEventListener('DOMContentLoaded', () => {
    const cellsContainer = document.getElementById('mainField');
    const modal = document.getElementById('modal');
    const startBotGameConnectFourButton = document.getElementById('startBotGameConnectFour');
    const startPlayerGameConnectFourButton = document.getElementById('startPlayerGameConnectFour');
    const difficultySliderConnectFour = document.getElementById('difficultyConnectFour');
    const scoreXElement = document.getElementById('scoreX');
    const scoreOElement = document.getElementById('scoreO');
    const playerOElement = document.getElementById('playerO');
    let turn = 'X';
    let gameOver = false;
    let scoreX = 0;
    let scoreO = 0;
    let cells = [];
    let vsBot = false;
    let difficulty = 1;

    const ROWS = 6;
    const COLS = 7;

    startPlayerGameConnectFourButton.addEventListener('click', () => {
        vsBot = false;
        updatePlayerOText('Игрок O');
        startConnectFourGame();
    });

    startBotGameConnectFourButton.addEventListener('click', () => {
        vsBot = true;
        updatePlayerOText('Бот O');
        difficulty = parseInt(difficultySliderConnectFour.value, 10);
        startConnectFourGame();
    });

    function startConnectFourGame() {
        modal.style.display = 'none';
        createConnectFourGrid();
        turn = Math.random() < 0.5 ? 'X' : 'O';
        gameOver = false;
        setTimeout(() => {
            document.body.style.backgroundColor = turn === 'X' ? '#F2AF5C' : '#40799A';
            cells.forEach(cell => cell.addEventListener('click', connectFourCellClick));
            cellsContainer.addEventListener('mouseover', highlightColumn);
            cellsContainer.addEventListener('mouseout', removeHighlightColumn);
            if (vsBot && turn === 'O') {
                lockCells();
                setTimeout(botMove, 1000);
            }
        }, 1000);
    }

    function createConnectFourGrid() {
        cellsContainer.innerHTML = '';
        cellsContainer.classList.add('connect-four-grid');
        cells = [];

        for (let row = 0; row < ROWS; row++) {
            for (let col = 0; col < COLS; col++) {
                const cell = document.createElement('div');
                cell.classList.add('cell');
                cell.dataset.row = row;
                cell.dataset.col = col;
                cellsContainer.appendChild(cell);
                cells.push(cell);
            }
        }
    }

    function connectFourCellClick(e) {
        if (gameOver) return;
        const col = parseInt(e.target.dataset.col);
        const availableCell = getAvailableCellInCol(col);

        if (availableCell) {
            availableCell.textContent = turn;
            availableCell.classList.add(`player${turn}`);

            if (checkWin(turn)) {
                gameOver = true;
                updateScore(turn);
                setTimeout(resetConnectFourBoard, 1000);
                return;
            }

            if (isBoardFull()) {
                setTimeout(resetConnectFourBoard, 1000);
                return;
            }

            switchTurn();
            if (vsBot && turn === 'O') {
                lockCells();
                setTimeout(botMove, 1000);
            }
        }
    }

    function getAvailableCellInCol(col) {
        for (let row = ROWS - 1; row >= 0; row--) {
            const cell = cells.find(c => parseInt(c.dataset.row) === row && parseInt(c.dataset.col) === col);
            if (cell && !cell.textContent) {
                return cell;
            }
        }
        return null;
    }

    function botMove() {
        if (gameOver) return;

        let targetCell;
        const availableCols = getAvailableCols();

        if (difficulty === 3) {
            targetCell = findBestMove('O') || findBestMove('X');
        } else if (difficulty === 2) {
            targetCell = findBestMove('X');
        }

        if (!targetCell && availableCols.length > 0) {
            const col = availableCols[Math.floor(Math.random() * availableCols.length)];
            targetCell = getAvailableCellInCol(col);
        }

        if (targetCell) {
            targetCell.textContent = 'O';
            targetCell.classList.add('playerO');

            if (checkWin('O')) {
                gameOver = true;
                updateScore('O');
                setTimeout(resetConnectFourBoard, 1000);
                return;
            }

            if (isBoardFull()) {
                setTimeout(resetConnectFourBoard, 1000);
                return;
            }

            switchTurn();
            unlockCells();
        }
    }

    function getAvailableCols() {
        const cols = [];
        for (let col = 0; col < COLS; col++) {
            if (getAvailableCellInCol(col)) {
                cols.push(col);
            }
        }
        return cols;
    }

    function findBestMove(player) {
        // Add logic for finding the best move for the bot
        return null;
    }

    function checkWin(player) {
        return checkHorizontalWin(player) || checkVerticalWin(player) || checkDiagonalWin(player);
    }

    function checkHorizontalWin(player) {
        for (let row = 0; row < ROWS; row++) {
            for (let col = 0; col < COLS - 3; col++) {
                if (cells.find(c => c.dataset.row == row && c.dataset.col == col).textContent === player &&
                    cells.find(c => c.dataset.row == row && c.dataset.col == col + 1).textContent === player &&
                    cells.find(c => c.dataset.row == row && c.dataset.col == col + 2).textContent === player &&
                    cells.find(c => c.dataset.row == row && c.dataset.col == col + 3).textContent === player) {
                    return true;
                }
            }
        }
        return false;
    }

    function checkVerticalWin(player) {
        for (let col = 0; col < COLS; col++) {
            for (let row = 0; row < ROWS - 3; row++) {
                if (cells.find(c => c.dataset.row == row && c.dataset.col == col).textContent === player &&
                    cells.find(c => c.dataset.row == row + 1 && c.dataset.col == col).textContent === player &&
                    cells.find(c => c.dataset.row == row + 2 && c.dataset.col == col).textContent === player &&
                    cells.find(c => c.dataset.row == row + 3 && c.dataset.col == col).textContent === player) {
                    return true;
                }
            }
        }
        return false;
    }

    function checkDiagonalWin(player) {
        for (let row = 0; row < ROWS - 3; row++) {
            for (let col = 0; col < COLS - 3; col++) {
                if (cells.find(c => c.dataset.row == row && c.dataset.col == col).textContent === player &&
                    cells.find(c => c.dataset.row == row + 1 && c.dataset.col == col + 1).textContent === player &&
                    cells.find(c => c.dataset.row == row + 2 && c.dataset.col == col + 2).textContent === player &&
                    cells.find(c => c.dataset.row == row + 3 && c.dataset.col == col + 3).textContent === player) {
                    return true;
                }
            }
        }

        for (let row = 3; row < ROWS; row++) {
            for (let col = 0; col < COLS - 3; col++) {
                if (cells.find(c => c.dataset.row == row && c.dataset.col == col).textContent === player &&
                    cells.find(c => c.dataset.row == row - 1 && c.dataset.col == col + 1).textContent === player &&
                    cells.find(c => c.dataset.row == row - 2 && c.dataset.col == col + 2).textContent === player &&
                    cells.find(c => c.dataset.row == row - 3 && c.dataset.col == col + 3).textContent === player) {
                    return true;
                }
            }
        }
        return false;
    }

    function isBoardFull() {
        return cells.every(cell => cell.textContent);
    }

    function resetConnectFourBoard() {
        cells.forEach(cell => {
            cell.textContent = '';
            cell.classList.remove('playerX', 'playerO');
            cell.style.pointerEvents = 'auto';
        });
        gameOver = false;
        switchTurn();
        if (vsBot && turn === 'O') {
            lockCells();
            setTimeout(botMove, 1000);
        } else {
            unlockCells();
        }
    }

    function switchTurn() {
        turn = turn === 'X' ? 'O' : 'X';
        document.body.style.backgroundColor = turn === 'X' ? '#F2AF5C' : '#40799A';
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

    function highlightColumn(e) {
        if (e.target.classList.contains('cell')) {
            const col = e.target.dataset.col;
            cells.forEach(cell => {
                if (cell.dataset.col === col && !cell.textContent) {
                    cell.classList.add('column-highlight');
                }
            });
        }
    }

    function removeHighlightColumn(e) {
        if (e.target.classList.contains('cell')) {
            const col = e.target.dataset.col;
            cells.forEach(cell => {
                if (cell.dataset.col === col) {
                    cell.classList.remove('column-highlight');
                }
            });
        }
    }
});
