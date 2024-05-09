document.addEventListener('DOMContentLoaded', () => {
    const cells = document.querySelectorAll('.cell');
    const mainField = document.querySelector('.main-field');
    let turn = 'X'; // X начинает игру
    let gameOver = false;
    const winningCombinations = [
        { combo: [0, 1, 2], type: 'horizontal', linePos: '16.67%' },
        { combo: [3, 4, 5], type: 'horizontal', linePos: '50%' },
        { combo: [6, 7, 8], type: 'horizontal', linePos: '83.33%' },
        { combo: [0, 3, 6], type: 'vertical', linePos: '16.67%' },
        { combo: [1, 4, 7], type: 'vertical', linePos: '50%' },
        { combo: [2, 5, 8], type: 'vertical', linePos: '83.33%' },
        { combo: [0, 4, 8], type: 'diagonal-down' },
        { combo: [2, 4, 6], type: 'diagonal-up' }
    ];

    cells.forEach(cell => cell.addEventListener('click', cellClick, { once: true }));

    function cellClick(e) {
        if (!gameOver) {
            const cell = e.target;
            cell.textContent = turn;
            cell.classList.add(turn === 'X' ? 'x' : 'o'); // Добавляем класс для стилизации
            cell.style.pointerEvents = 'none'; // Предотвращаем повторный клик по ячейке

            if (checkWin(turn)) {
                gameOver = true;
                setTimeout(resetBoard, 3000); // Показываем линию 3 секунды перед сбросом
            } else if (isBoardFull()) {
                setTimeout(resetBoard, 1000); // Сброс при ничьей
            } else {
                switchTurn();
            }
        }
    }

    function drawLine({ type, linePos }) {
        const line = document.createElement('div');
        line.className = `line ${type}`;
        if (['horizontal', 'vertical'].includes(type)) {
            line.style[type === 'horizontal' ? 'top' : 'left'] = linePos;
        } else {
            line.style.top = '50%';
            line.style.left = '50%';
        }
        mainField.appendChild(line);
    }

    function checkWin(player) {
        return winningCombinations.some(({ combo, type, linePos }) => {
            if (combo.every(index => cells[index].textContent === player)) {
                drawLine({ type, linePos });
                return true;
            }
            return false;
        });
    }

    function switchTurn() {
        turn = turn === 'X' ? 'O' : 'X';
        document.body.style.backgroundColor = turn === 'X' ? '#F2AF5C' : '#40799A';
    }

    function isBoardFull() {
        return [...cells].every(cell => cell.textContent);
    }

    function resetBoard() {
        cells.forEach(cell => {
            cell.textContent = '';
            cell.classList.remove('x', 'o'); // Удаляем классы стилей
            cell.style.pointerEvents = 'auto';
            cell.addEventListener('click', cellClick, { once: true });
        });
        const line = document.querySelector('.line');
        if (line) {
            line.remove();
        }
        gameOver = false;
        switchTurn(); // Смена игрока, чтобы начать новый раунд
    }

    switchTurn(); // Устанавливаем начальный цвет фона
});
