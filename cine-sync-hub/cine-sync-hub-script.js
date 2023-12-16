// Подключение к серверу веб-сокетов
const socket = io();

// Функция для создания комнаты
function createRoom() {
    const fileInput = document.getElementById('fileInput');
    const roomLinkContainer = document.getElementById('roomLink');
    const videoPlayer = document.getElementById('videoPlayer');

    // Если файл выбран
    if (fileInput.files.length > 0) {
        const selectedFile = fileInput.files[0];

        // Генерация уникального идентификатора комнаты (в данном случае, случайная строка)
        const roomId = generateRandomString(8);

        // Создание ссылки для присоединения к комнате
        const roomLink = window.location.origin + '/join?room=' + roomId;

        // Отображение ссылки на комнату
        roomLinkContainer.innerHTML = `<p>Отправьте эту ссылку друзьям: <a href="${roomLink}" target="_blank">${roomLink}</a></p>`;

        // Отображение проигрывателя видео и воспроизведение выбранного файла
        videoPlayer.style.display = 'block';
        videoPlayer.src = URL.createObjectURL(selectedFile);
        videoPlayer.play();

        // Отправка информации о файле на сервер веб-сокетов
        socket.emit('fileSelected', { roomId, fileName: selectedFile.name });
    }
}

// Функция для генерации случайной строки
function generateRandomString(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}
