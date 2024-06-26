document.addEventListener('DOMContentLoaded', () => {
    const cellsContainer = document.getElementById('mainField');
    const modal = document.getElementById('modal');
    const startBotGameSuperButton = document.getElementById('startBotGameSuper');
    const startPlayerGameSuperButton = document.getElementById('startPlayerGameSuper');
    const difficultySliderSuper = document.getElementById('difficultySuper');
    const scoreXElement = document.getElementById('scoreX');
    const scoreOElement = document.getElementById('scoreO');
    const playerOElement = document.getElementById('playerO');
    let turn = 'X';
    let gameOver = false;
    let scoreX = 0;
    let scoreO = 0;
    let cells = [];
    let moveHistory = { X: [], O: [] };
    let currentLargeCell = null;
    let vsBot = false;
    let difficulty = 1;

    const resizeObserver = new ResizeObserver(entries => {
        for (let entry of entries) {
            const cellSize = Math.min(entry.contentRect.width, entry.contentRect.height);
            entry.target.style.setProperty('--cell-font-size', `${cellSize * 0.6}px`);
        }
    });

    document.getElementById('superMode').addEventListener('click', () => {
        document.getElementById('classicOptions').style.display = 'none';
        document.getElementById('updatedOptions').style.display = 'none';
        document.getElementById('superOptions').style.display = 'block';
    });

    startPlayerGameSuperButton.addEventListener('click', () => {
        vsBot = false;
        updatePlayerOText('Игрок O');
        startSuperGame();
    });

    startBotGameSuperButton.addEventListener('click', () => {
        vsBot = true;
        updatePlayerOText('Бот O');
        difficulty = parseInt(difficultySliderSuper.value, 10);
        startSuperGame();
    });

    function startSuperGame() {
        modal.style.display = 'none';
        createSuperGrid();
        turn = Math.random() < 0.5 ? 'X' : 'O'; // Случайный выбор первого игрока
        currentLargeCell = null;
        gameOver = false;
        moveHistory = { X: [], O: [] };
        setTimeout(() => {
            document.body.style.backgroundColor = turn === 'X' ? '#F2AF5C' : '#40799A';
            cells.forEach(cell => cell.addEventListener('click', superCellClick));
            updateLargeCellClasses();
            if (vsBot && turn === 'O') {
                lockCells();
                setTimeout(botMove, 1000);
            }
        }, 1000);
    }

    function createSuperGrid() {
        cellsContainer.innerHTML = '';
        cellsContainer.classList.add('super-grid');
        cells = [];

        for (let i = 0; i < 9; i++) {
            const superCell = document.createElement('div');
            superCell.classList.add('super-cell');
            superCell.dataset.index = i;

            for (let j = 0; j < 9; j++) {
                const cell = document.createElement('div');
                cell.classList.add('cell');
                cell.dataset.superIndex = i;
                cell.dataset.index = j;
                superCell.appendChild(cell);
                cells.push(cell);
                resizeObserver.observe(cell);
            }

            cellsContainer.appendChild(superCell);
        }
    }

    function superCellClick(e) {
        if (gameOver) return;
        const cell = e.target;
        const superIndex = parseInt(cell.dataset.superIndex);
        const index = parseInt(cell.dataset.index);
    
        // Проверяем, доступен ли квадрат для хода или является "ничьей"
        if (cell.textContent === '' && (currentLargeCell === null || currentLargeCell === superIndex || isLargeCellWon(currentLargeCell) || checkDraw(currentLargeCell))) {
            cell.textContent = turn;
            cell.style.pointerEvents = 'none';
    
            moveHistory[turn].push(cell);
    
            if (checkWin(turn, superIndex)) {
                const largeCell = document.querySelector(`.super-cell[data-index='${superIndex}']`);
                largeCell.classList.add('won');
                largeCell.dataset.winner = turn;
    
                if (checkSuperWin(turn)) {
                    gameOver = true;
                    updateScore(turn);
                    setTimeout(resetSuperBoard, 1000);
                    return;
                }
            }
    
            if (isBoardFull(superIndex)) {
                if (!checkDraw(superIndex)) {
                    const largeCell = document.querySelector(`.super-cell[data-index='${superIndex}']`);
                    markAsDraw(largeCell);
                }
                // Если все клетки заполнены и ничья, разрешаем ход в любой квадрат
                currentLargeCell = null;  
            } else {
                currentLargeCell = index;
            }
    
            updateLargeCellClasses();
            switchTurn();
            if (vsBot && turn === 'O') {
                lockCells();
                setTimeout(botMove, 1000);
            }
        }
    }    

    function botMove() {
        if (gameOver) return;
    
        let targetCell;
    
        if (difficulty === 3) {
            // Attempt winning move or block player's winning move
            targetCell = findBestMove('O') || findBestMove('X');
        } else if (difficulty === 2) {
            // Block player's winning move
            targetCell = findBestMove('X');
        }
    
        if (!targetCell) {
            const availableCells = currentLargeCell === null 
                ? cells.filter(cell => !cell.parentElement.classList.contains('won') && !cell.textContent)
                : cells.filter(cell => parseInt(cell.dataset.superIndex) === currentLargeCell && !cell.textContent);
    
            if (availableCells.length > 0) {
                targetCell = availableCells[Math.floor(Math.random() * availableCells.length)];
            }
        }
    
        if (targetCell) {
            targetCell.textContent = 'O';
            targetCell.style.pointerEvents = 'none';
    
            const innerIndex = parseInt(targetCell.dataset.index);
            const outerIndex = parseInt(targetCell.dataset.superIndex);
    
            if (checkWin('O', outerIndex)) {
                const largeCell = document.querySelector(`.super-cell[data-index='${outerIndex}']`);
                largeCell.classList.add('won');
                largeCell.dataset.winner = 'O';
    
                if (checkSuperWin('O')) {
                    gameOver = true;
                    updateScore('O');
                    setTimeout(resetSuperBoard, 1000);
                    return;
                }
            }
    
            if (isBoardFull(outerIndex)) {
                currentLargeCell = null;
            } else {
                currentLargeCell = innerIndex;
            }
    
            updateLargeCellClasses();
            switchTurn();
            unlockCells();
        }
    }    

    function findBestMove(player) {
        const potentialMoves = [];
    
        for (let superIndex = 0; superIndex < 9; superIndex++) {
            if (!document.querySelector(`.super-cell[data-index='${superIndex}']`).classList.contains('won')) {
                for (let index = 0; index < 9; index++) {
                    const cell = cells[superIndex * 9 + index];
                    if (cell.textContent === '') {
                        cell.textContent = player;
                        if (checkWin(player, superIndex)) {
                            potentialMoves.push({ cell, superIndex, index });
                        }
                        cell.textContent = '';
                    }
                }
            }
        }
    
        if (potentialMoves.length > 0) {
            const validMoves = potentialMoves.filter(move => 
                currentLargeCell === null || currentLargeCell === move.superIndex || isLargeCellWon(currentLargeCell)
            );
            if (validMoves.length > 0) {
                return validMoves[Math.floor(Math.random() * validMoves.length)].cell;
            }
        }
    
        return null;
    }    

    function isLargeCellWon(index) {
        const largeCell = document.querySelector(`.super-cell[data-index='${index}']`);
        return largeCell && largeCell.classList.contains('won');
    }

    function checkWin(player, superIndex) {
        const startIndex = superIndex * 9;
        const subCells = cells.slice(startIndex, startIndex + 9);

        return [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
            [0, 4, 8], [2, 4, 6]  // Diagonals
        ].some(combination => {
            return combination.every(index => subCells[index].textContent === player);
        });
    }

    function checkSuperWin(player) {
        // Проверка выигрышных комбинаций
        const winningCombinations = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
            [0, 4, 8], [2, 4, 6]  // Diagonals
        ];
    
        const isWin = winningCombinations.some(combination => {
            return combination.every(index => {
                const largeCell = document.querySelector(`.super-cell[data-index='${index}']`);
                return largeCell && largeCell.dataset.winner === player;
            });
        });
    
        if (isWin) {
            return true;
        }
    
        // Проверка на ничью
        const isDraw = winningCombinations.every(combination => {
            return combination.every(index => {
                const largeCell = document.querySelector(`.super-cell[data-index='${index}']`);
                return largeCell.dataset.winner; // Ничья, если все квадраты завершены
            });
        });
    
        if (isDraw) {
            setTimeout(resetSuperBoard, 1000); // Сброс доски с задержкой
            return false;
        }
    
        return false;
    }    

    function markAsDraw(largeCell) {
        largeCell.classList.add('draw');
        largeCell.dataset.winner = 'draw';  // Отмечаем квадрат как завершенный ничьей
    }

    function isBoardFull(superIndex) {
        const startIndex = superIndex * 9;
        const subCells = cells.slice(startIndex, startIndex + 9);
        return subCells.every(cell => cell.textContent !== '');
    }

    function checkDraw(superIndex) {
        const largeCell = document.querySelector(`.super-cell[data-index='${superIndex}']`);
        return largeCell.classList.contains('draw');
    }

    function resetSuperBoard() {
        cells.forEach(cell => {
            cell.textContent = '';
            cell.style.pointerEvents = 'auto';
        });
        document.querySelectorAll('.super-cell').forEach(superCell => {
            superCell.classList.remove('won', 'draw', 'active', 'inactive');
            delete superCell.dataset.winner;
        });
        currentLargeCell = null;
        moveHistory = { X: [], O: [] };
        gameOver = false;
        switchTurn(); // Случайно выбираем, кто начнет следующий раунд
        if (vsBot && turn === 'O') {
            lockCells();
            setTimeout(botMove, 1000);
        } else {
            unlockCells();
        }
        updateLargeCellClasses();
    }


    function switchTurn() {
        turn = turn === 'X' ? 'O' : 'X';
        document.body.style.backgroundColor = turn === 'X' ? '#F2AF5C' : '#40799A';
    }

    function updateLargeCellClasses() {
        document.querySelectorAll('.super-cell').forEach(superCell => {
            const index = parseInt(superCell.dataset.index);
            if (currentLargeCell === null || currentLargeCell === index || isLargeCellWon(currentLargeCell) || checkDraw(currentLargeCell)) {
                superCell.classList.add('active');
                superCell.classList.remove('inactive');
            } else {
                superCell.classList.add('inactive');
                superCell.classList.remove('active');
            }
        });
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
});