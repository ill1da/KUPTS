<?php
// Подключение к БД
$host = 'ill4663966.mysql'; // Адрес сервера 
$database = 'ill4663966_4'; // Имя базы данных
$user = 'ill4663966_mysql'; // Имя пользователя
$password = 'bjR7iVw/'; // Пароль

// Создаем соединение
$conn = new mysqli($host, $user, $password, $database);

// Проверяем соединение
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Чтение и обновление счетчика
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Увеличение счетчика
    $conn->query("UPDATE button_press_count SET count = count + 1 WHERE id = 1");
}

// Получение текущего значения счетчика
$result = $conn->query("SELECT count FROM button_press_count WHERE id = 1");
$row = $result->fetch_assoc();

echo $row['count'];

$conn->close();
?>
