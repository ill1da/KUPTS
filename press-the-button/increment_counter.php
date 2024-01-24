<?php
// Путь к файлу счетчика на хостинге
$counterFilePath = './counter.json';

// Получение текущего значения счетчика
$currentCount = json_decode(file_get_contents($counterFilePath), true);

// Увеличение счетчика
$currentCount['count']++;

// Запись нового значения в файл
file_put_contents($counterFilePath, json_encode($currentCount));

// Отправка обновленного значения счетчика в формате JSON
echo json_encode($currentCount);
?>
