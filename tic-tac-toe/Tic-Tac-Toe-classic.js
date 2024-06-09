const board = [
    ['', '', ''],
    ['', '', ''],
    ['', '', '']
];

let currentPlayer = 'X'; // Игрок начинает игру

// Инициализация игрового поля
function initializeGame(firstPlayer) {
    document.querySelectorAll('.cell').forEach((cell, index) => {
        cell.textContent = '';
        cell.removeEventListener('click', handleCellClick);
        cell.addEventListener('click', handleCellClick, { once: true });
        cell.dataset.index = `${Math.floor(index / 3)},${index % 3}`;
    });
    currentPlayer = firstPlayer; // Задаем, кто начинает игру
    displayCurrentPlayer();

    // Если первым ходит бот и это игра против бота, бот делает ход
    if (currentPlayer === 'O' && mode === 'bot') {
        const difficulty = document.getElementById('difficulty-slider').value;
        setTimeout(() => botMove(difficulty), 200);
    }
}

function handleCellClick(event) {
    const cell = event.target;
    const [row, col] = cell.dataset.index.split(',');
    makeMove(parseInt(row), parseInt(col), currentPlayer);
    if (checkWin(currentPlayer)) {
        alert(`${currentPlayer} wins!`);
        resetGameBoard();
    } else if (checkDraw()) {
        alert("It's a draw!");
        resetGameBoard();
    } else {
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        displayCurrentPlayer();
        if (currentPlayer === 'O' && mode === 'bot') {
            const difficulty = document.getElementById('difficulty-slider').value;
            setTimeout(() => botMove(difficulty), 200);
        }
    }
}

function makeMove(row, col, player) {
    board[row][col] = player;
    document.querySelector(`[data-index="${row},${col}"]`).textContent = player;
}

function checkWin(player) {
    const lines = [
        [board[0][0], board[0][1], board[0][2]],
        [board[1][0], board[1][1], board[1][2]],
        [board[2][0], board[2][1], board[2][2]],
        [board[0][0], board[1][0], board[2][0]],
        [board[0][1], board[1][1], board[2][1]],
        [board[0][2], board[1][2], board[2][2]],
        [board[0][0], board[1][1], board[2][2]],
        [board[2][0], board[1][1], board[0][2]]
    ];
    return lines.some(line => line.every(cell => cell === player));
}

function checkDraw() {
    return board.every(row => row.every(cell => cell));
}

function displayCurrentPlayer() {
    const status = document.getElementById('status');
    status.textContent = `Current Player: ${currentPlayer}`;
}

function resetGameBoard() {
    board.forEach(row => row.fill(''));
    initializeGame();
}

function botMove(difficulty) {
    let move;
    if (difficulty === '1') {
        move = findRandomMove();
    } else if (difficulty === '2') {
        move = findBlockingMove('X') || findRandomMove();
    } else {
        move = findBestMove();
    }
    if (move) {
        makeMove(move.row, move.col, 'O');
        if (checkWin('O')) {
            alert(`O wins!`);
            resetGameBoard();
        } else if (checkDraw()) {
            alert("It's a draw!");
            resetGameBoard();
        } else {
            currentPlayer = 'X';
            displayCurrentPlayer();
        }
    }
}

function findRandomMove() {
    const emptyCells = [];
    board.forEach((row, rowIndex) => {
        row.forEach((cell, colIndex) => {
            if (cell === '') {
                emptyCells.push({ row: rowIndex, col: colIndex });
            }
        });
    });
    if (emptyCells.length > 0) {
        return emptyCells[Math.floor(Math.random() * emptyCells.length)];
    }
    return null;
}

function findBlockingMove(player) {
    for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
            if (board[row][col] === '') {
                board[row][col] = player;
                const winning = checkWin(player);
                board[row][col] = ''; // Возвращаем клетку в исходное состояние
                if (winning) {
                    return { row, col };
                }
            }
        }
    }
    return null;
}

function findBestMove() {
    let bestScore = -Infinity;
    let bestMove = null;
    for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
            if (board[row][col] === '') {
                board[row][col] = 'O';
                let score = minimax(board, 0, false);
                board[row][col] = '';
                if (score > bestScore) {
                    bestScore = score;
                    bestMove = { row, col };
                }
            }
        }
    }
    return bestMove;
}

function minimax(board, depth, isMaximizing) {
    if (checkWin('O')) return 10 - depth;
    if (checkWin('X')) return depth - 10;
    if (checkDraw()) return 0;

    if (isMaximizing) {
        let bestScore = -Infinity;
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 3; col++) {
                if (board[row][col] === '') {
                    board[row][col] = 'O';
                    let score = minimax(board, depth + 1, false);
                    board[row][col] = '';
                    bestScore = Math.max(score, bestScore);
                }
            }
        }
        return bestScore;
    } else {
        let bestScore = Infinity;
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 3; col++) {
                if (board[row][col] === '') {
                    board[row][col] = 'X';
                    let score = minimax(board, depth + 1, true);
                    board[row][col] = '';
                    bestScore = Math.min(score, bestScore);
                }
            }
        }
        return bestScore;
    }
}
