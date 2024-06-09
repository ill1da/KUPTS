let mode = 'classic'; // По умолчанию выбран классический режим

document.addEventListener('DOMContentLoaded', function() {
    setupUI();
    setupGameStartHandlers();
});

function setupUI() {
    document.querySelectorAll('[name="mode"]').forEach(radio => {
        radio.addEventListener('change', function() {
            mode = this.value;
            updateModeInfo();
        });
    });
}

function setupGameStartHandlers() {
    document.getElementById('play-bot').addEventListener('click', function() {
        let firstPlayer = chooseFirstPlayer();
        startGame('bot', firstPlayer);
    });

    document.getElementById('play-bot').addEventListener('click', function() {
        let firstPlayer = chooseFirstPlayer(); // Получаем, кто ходит первым
        startGame('bot', firstPlayer); // Убрана лишняя скобка
    });    
    document.getElementById('back-button').addEventListener('click', function() {
        returnToMenu();
    });
};

function updateModeInfo() {
    const title = document.getElementById('mode-title');
    const rules = document.getElementById('mode-rules');
    switch(mode) {
        case 'classic':
            title.textContent = 'Классический';
            rules.textContent = 'Игроки по очереди ставят X и O на 3x3 поле. Первый, выстроивший линию из трех своих фигур, выигрывает.';
            break;
        case 'updated':
            title.textContent = 'Обновленный';
            rules.textContent = 'Включает элементы улучшений и бонусов на поле.';
            break;
        case 'super':
            title.textContent = 'Супер';
            rules.textContent = 'Добавлены дополнительные усложнения и многоуровневые стратегии.';
            break;
        case 'four-in-a-row':
            title.textContent = '4 в ряд';
            rules.textContent = 'Цель игры - выстроить четыре своих фигуры по вертикали, горизонтали или диагонали.';
            break;
    }
}

function chooseFirstPlayer() {
    return Math.random() < 0.5 ? 'X' : 'O';
}

function startGame(opponent, firstPlayer) {
    document.getElementById('modal-menu').classList.add('hidden');
    document.getElementById('game-board').classList.remove('hidden');
    document.getElementById('status').classList.remove('hidden');
    document.getElementById('back-button').classList.remove('hidden');
    initializeGame(firstPlayer);
}

function returnToMenu() {
    document.getElementById('modal-menu').classList.remove('hidden');
    document.getElementById('game-board').classList.add('hidden');
    document.getElementById('status').classList.add('hidden');
    document.getElementById('back-button').classList.add('hidden');
    resetGameBoard();
}
