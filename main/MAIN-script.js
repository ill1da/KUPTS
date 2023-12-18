// Анимация логотипа обложки
document.addEventListener('DOMContentLoaded', () => {
  let coverLogo = document.querySelector('.cover-logo');
  coverLogo.classList.add('show');
  setInterval(() => {
      let coverUnderLogo = document.querySelector('.cover-under-logo');
      coverUnderLogo.classList.add('ushow');            
  }, 1000);
});

// Смена эмоджи
document.getElementById('emoji').addEventListener('click', () => {
  let randomEmoji = Math.floor(Math.random() * (128586 - 128511 + 1)) + 128511;
  document.getElementById('emoji').style.transform = 'scale(1.2) rotate(' + (Math.random() * 20 - 10) + 'deg)';
  document.getElementById('emoji').innerHTML = `&#${randomEmoji}`; 

  // Сохранение выбранного эмодзи в локальное хранилище
  localStorage.setItem('lastEmoji', `&#${randomEmoji}`);

  setTimeout(function () {
      document.getElementById('emoji').style.transform = 'scale(1) rotate(0)';
  }, 200);
});

// Восстановление последнего выбранного эмодзи при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
  let lastEmoji = localStorage.getItem('lastEmoji');
  if (lastEmoji) {
      document.getElementById('emoji').innerHTML = lastEmoji;
  }
});

//Счетчик проектов
let cardValue = document.querySelectorAll('.card-menu a')
document.getElementById('progect-value').textContent = cardValue.length;

// Прокрутка about-prompter
let aboutPrompter = document.getElementById('about-prompter-list');
let header = document.querySelector('header');

// Событие при прокрутке страницы
window.addEventListener('scroll', function () {
  // Получение координат верхней границы блока about-prompter
  let aboutPrompterTop = aboutPrompter.getBoundingClientRect().top;

  // Настройка стилей для блока about-prompter в зависимости от прокрутки
  aboutPrompter.style.transform = 'translateX(' + (-aboutPrompterTop / 4) + 'px)';

  // Изменение цвета header после прохождения блока about-prompter
  if (aboutPrompterTop < 0) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
});