document.addEventListener('DOMContentLoaded', () => {
    const cellsContainer = document.getElementById('mainField');
    const modal = document.getElementById('modal');
    const startSuperGameButton = document.getElementById('startSuperGame');
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

    startSuperGameButton.addEventListener('click', startSuperGame);

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

        if (cell.textContent === '' && (currentLargeCell === null || currentLargeCell === superIndex || isLargeCellWon(currentLargeCell))) {
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
                currentLargeCell = null;
            } else {
                currentLargeCell = index;
            }

            updateLargeCellClasses();
            switchTurn();
        }
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
        return [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
            [0, 4, 8], [2, 4, 6]  // Diagonals
        ].some(combination => {
            return combination.every(index => {
                const largeCell = document.querySelector(`.super-cell[data-index='${index}']`);
                return largeCell && largeCell.dataset.winner === player;
            });
        });
    }

    function isBoardFull(superIndex) {
        const startIndex = superIndex * 9;
        const subCells = cells.slice(startIndex, startIndex + 9);
        return subCells.every(cell => cell.textContent !== '');
    }

    function resetSuperBoard() {
        cells.forEach(cell => {
            cell.textContent = '';
            cell.style.pointerEvents = 'auto';
        });
        document.querySelectorAll('.super-cell').forEach(superCell => {
            superCell.classList.remove('won', 'active', 'inactive');
            delete superCell.dataset.winner;
        });
        currentLargeCell = null;
        moveHistory = { X: [], O: [] };
        switchTurn();
    }

    function switchTurn() {
        turn = turn === 'X' ? 'O' : 'X';
        document.body.style.backgroundColor = turn === 'X' ? '#F2AF5C' : '#40799A';
    }

    function updateLargeCellClasses() {
        document.querySelectorAll('.super-cell').forEach(superCell => {
            const index = parseInt(superCell.dataset.index);
            if (currentLargeCell === null || currentLargeCell === index || isLargeCellWon(currentLargeCell)) {
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
});
