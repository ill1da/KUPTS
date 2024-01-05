// 💜 Вернитесь 😭
let originalTitle = document.title;
let originalFavicon = "./main/MAIN-source/logo/fav-logo.ico";
// Врменной интервал
let timeoutInterval = 2 * 60 * 1000 + 30 * 1000;

// Обработка изменения названия вкладки 
document.addEventListener('visibilitychange', () => {
  if(document.hidden) {
    // Пользователь ушел со вкладки
    setTimeout(() => {
      if(document.hidden) {
        changeTabInfo("./main/MAIN-source/logo/💜.ico", "Вернитесь 😭");
      }
    }, timeoutInterval);
  } else {
    // Пользователь вернулся на вкладку
    changeTabInfo(originalFavicon, originalTitle);
  }
});

// Обработчик события фокуса на вкладке
window.addEventListener("focus", function () {
  // Пользователь активен на вкладке
  changeTabInfo(originalFavicon, originalTitle);
});

// Функция для изменения логотипа и названия вкладки
function changeTabInfo(favicon, title) {
  document.getElementById("favicon").href = favicon;
  document.title = title;
}

// 🟧 Смена эмоджи
let emoji = document.getElementById('emoji');
emoji.addEventListener('click', () => {
  let randomEmoji = Math.floor(Math.random() * (128586 - 128511 + 1)) + 128511;
  emoji.style.transform = 'scale(1.2) rotate(' + (Math.random() * 20 - 10) + 'deg)';
  emoji.innerHTML = `&#${randomEmoji}`; 

  // Сохранение выбранного эмодзи в локальное хранилище
  localStorage.setItem('lastEmoji', `&#${randomEmoji}`);

  setTimeout(function () {
    emoji.style.transform = 'scale(1) rotate(0)';
  }, 200);
});

// Восстановление последнего выбранного эмодзи при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
  let lastEmoji = localStorage.getItem('lastEmoji');
  if (lastEmoji) {
    emoji.innerHTML = lastEmoji;
  }
});

// 🟨 Прокрутка prompter
let Prompter = document.getElementById('prompter-list');

// Событие при прокрутке страницы
window.addEventListener('scroll', function () {
  // Получение координат верхней границы блока prompter
  let PrompterTop = Prompter.getBoundingClientRect().top;

  // Настройка стилей для блока prompter в зависимости от прокрутки
  Prompter.style.transform = 'translateX(' + (-PrompterTop / 4) + 'px)';
});

// 🟪 Счетчик проектов
let cardValue = document.querySelectorAll('.card')
document.getElementById('progect-value').textContent = cardValue.length;

// 🟩 Кнопка "наверх"
let goUpButton = document.getElementById('go-up');
let coverSection = document.getElementById('cover');
goUpButton.addEventListener('click', () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
});