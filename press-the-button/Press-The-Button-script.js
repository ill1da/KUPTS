// Элементы
const defaultSound = new Audio("./press-the-button-source/sounds/BRUH.mp3");
const redButton = document.querySelector(".pushable");
const resetButton = document.querySelector("#reset-btn");
const inputFile = document.querySelector("#change-sound");
let changeTitle = document.querySelector(".input-file-list");
// Элемент для отображения счетчика
const countDisplay = document.querySelector("#count-display");
// Громкость звука
const volumeSlider = document.querySelector("#volume-slider"); // Ползунок громкости
const volumeValueDisplay = document.querySelector("#volume-value");
// Скорость нажатия на кнопку
const speedSlider = document.querySelector("#speed-slider"); // Ползунок скорости нажатий
const speedValueDisplay = document.querySelector("#speed-value");
let canPressButton = true; // Флаг, указывающий, можно ли нажимать кнопку

// Функция для расчета задержки на основе значения ползунка скорости
function calculateDelay(value) {
    const minDelay = 2000; // Максимальная задержка (ползунок в крайнем левом положении)
    const maxDelay = 0; // Минимальная задержка (ползунок в крайнем правом положении)
    const normalDelay = 500; // Задержка при среднем положении ползунка
    
    if (value <= 0.5) {
        // Линейно увеличиваем задержку от нормальной до максимальной
        return normalDelay + (2 * value) * (minDelay - normalDelay);
    } else {
        // Линейно уменьшаем задержку от нормальной до минимальной
        return normalDelay - ((value - 0.5) * 2) * (normalDelay - maxDelay);
    }
}

// Устанавливаем начальное значение громкости
volumeValueDisplay.textContent = volumeSlider.value;
// Устанавливаем начальное значение скорости
speedValueDisplay.textContent = speedSlider.value;

// Обработчик изменения громкости
volumeSlider.addEventListener("input", () => {
    // Обновляем значение громкости в элементе отображения
    volumeValueDisplay.textContent = volumeSlider.value;
    // Обновляем громкость звука в соответствии с положением ползунка
    defaultSound.volume = volumeSlider.value;
});

// Добавляем обработчик изменения ползунка скорости
speedSlider.addEventListener("input", () => {
    speedValueDisplay.textContent = speedSlider.value;
});

// Функция для Long Polling счетчика
function pollCount(lastCount = 0) {
  fetch(`poll_count.php?lastCount=${lastCount}`)
    .then(response => response.text())
    .then(newCount => {
      // Обновляем отображаемое значение счетчика
      countDisplay.textContent = `Нажатий: ${newCount}`;
      // Продолжаем polling с новым значением счетчика
      pollCount(newCount);
    })
    .catch(error => console.error('Ошибка Long Polling:', error));
}

// Функция для обновления счетчика на сервере и получения нового значения
function updateCount() {
  fetch('/update_count.php', { method: 'POST' })
    .then(response => response.text())
    .then(count => {
      console.log('Текущее количество нажатий:', count);
      // Здесь обновление текста счетчика не требуется, так как это делает pollCount
    })
    .catch(error => console.error('Ошибка:', error));
}

// Обработчик изменения ползунка громкости
volumeSlider.addEventListener("input", () => {
  // Обновляем громкость звука в соответствии с положением ползунка
  defaultSound.volume = volumeSlider.value;
});

// Функция для расчета задержки на основе значения ползунка скорости
function calculateDelay(value) {
  const maxDelay = 2000; // Максимальная задержка при минимальном значении ползунка
  const minDelay = 0; // Минимальная задержка при максимальном значении ползунка
  return minDelay + (1 - value) * (maxDelay - minDelay);
}

// Обработчик нажатия на кнопку
redButton.addEventListener("click", () => {
  if (!canPressButton) return; // Если нажатие на кнопку заблокировано, выходим из функции

  let soundToPlay;
  const savedSoundSrc = localStorage.getItem("sound");

  if (savedSoundSrc) {
      soundToPlay = new Audio(savedSoundSrc);
  } else {
      soundToPlay = defaultSound.cloneNode();
  }

  soundToPlay.volume = volumeSlider.value;

  try {
      soundToPlay.play();
  } catch (e) {
      console.error("Ошибка проигрывания", e);
  }

  canPressButton = false; // Блокируем возможность нажатия до истечения задержки
  redButton.classList.add('disabled');

  const delay = calculateDelay(speedSlider.value);
  setTimeout(() => {
      canPressButton = true; // Разблокируем нажатие после истечения задержки
      redButton.classList.remove('disabled');
  }, delay);
});

// Добавляем обработчик изменения ползунка скорости, если нужно отобразить значение задержки или для других целей
speedSlider.addEventListener("input", () => {
  const delay = calculateDelay(speedSlider.value);
  console.log("Текущая задержка между нажатиями:", delay, "мс");
  // Здесь можно добавить код для обновления пользовательского интерфейса, например, отображения текущей задержки
});

// // Обработчик кнопки Default
// resetButton.addEventListener("click", () => {
//   // Удаляем сохраненный звук
//   localStorage.removeItem("sound");
//   // Удаляем имя файла
//   changeTitle.innerHTML = "";
//   localStorage.removeItem("soundName");

//   // Создаем копию начального звука и проигрываем
//   const cloneSound = defaultSound.cloneNode();
//   cloneSound.play();
// });

// // Обработчик выбора файла
// inputFile.addEventListener("change", () => {
//   const file = inputFile.files[0];

//   // Сохраняем в локальное хранилище
//   localStorage.setItem("sound", URL.createObjectURL(file));
//   localStorage.setItem("soundName", file.name);

//   console.log(file.name);
//   changeTitle.innerHTML = file.name;
// });

// window.addEventListener("load", () => {
//   const soundName = localStorage.getItem("soundName");

//   if (soundName) {
//     changeTitle.textContent = soundName;
//   }

//   // Инициализация Long Polling при загрузке страницы
//   pollCount();
// });

/* Кнопка донат */
let donateButton = document.querySelector(".donate-button");
donateButton.addEventListener("click", function(event) {
  let link = this;
  let originalText = link.textContent;
  link.textContent += " 🧡";
  donateButton.style.pointerEvents = "none";
  setTimeout(function() {
    link.textContent = originalText;
    donateButton.style.pointerEvents = "";
  }, 1000);
});