// Элементы
const defaultSound = new Audio("./press-the-button-source/sounds/BRUH.mp3");
const redButton = document.querySelector("#red-button");
const resetButton = document.querySelector("#reset-btn");
const inputFile = document.querySelector("#change-sound");
let changeTitle = document.querySelector(".input-file-list");
// Элемент для отображения счетчика
const countDisplay = document.querySelector("#count-display");

// Функция для обновления счетчика на сервере и получения нового значения
function updateCount() {
  fetch('./update_count.php', { method: 'POST' })
    .then(response => response.text())
    .then(count => {
      console.log('Текущее количество нажатий:', count);
      countDisplay.textContent = `Нажатий: ${count}`; // Обновляем текст счетчика на странице
    })
    .catch(error => console.error('Ошибка:', error));
}

// Инициализируем счетчик при загрузке страницы
function initCount() {
  fetch('update_count.php') // Запрос без метода POST для получения текущего значения счетчика
    .then(response => response.text())
    .then(count => {
      countDisplay.textContent = `Нажатий: ${count}`; // Обновляем текст счетчика на странице
    })
    .catch(error => console.error('Ошибка инициализации счетчика:', error));
}

// Обработчик кнопки
redButton.addEventListener("click", () => {
  // Получаем сохраненный звук из локального хранилища
  const savedSound = localStorage.getItem("sound");

  try {
    // Если звук найден - создаем объект и проигрываем
    if (savedSound) {
      const audio = new Audio(savedSound);
      audio.play();
    } else {
      // Создаем копию начального звука и проигрываем
      const cloneSound = defaultSound.cloneNode();
      cloneSound.play();
    }
  } catch (e) {
    console.error("Ошибка проигрывания", e);
  }

  // Обновление счетчика
  updateCount();
});

// Обработчик кнопки Default
resetButton.addEventListener("click", () => {
  // Удаляем сохраненный звук
  localStorage.removeItem("sound");
  // Удаляем имя файла
  changeTitle.innerHTML = "";
  localStorage.removeItem("soundName");

  // Создаем копию начального звука и проигрываем
  const cloneSound = defaultSound.cloneNode();
  cloneSound.play();
});

// Обработчик выбора файла
inputFile.addEventListener("change", () => {
  const file = inputFile.files[0];

  // Сохраняем в локальное хранилище
  localStorage.setItem("sound", URL.createObjectURL(file));
  localStorage.setItem("soundName", file.name);

  console.log(file.name);
  changeTitle.innerHTML = file.name;
});

window.addEventListener("load", () => {
  const soundName = localStorage.getItem("soundName");

  if (soundName) {
    changeTitle.textContent = soundName;
  }

  // Инициализируем счетчик при загрузке страницы
  initCount();
});
