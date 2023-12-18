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

// Получаем все карточки на странице
const cards = document.querySelectorAll('.card');

// Добавляем обработчики на каждую карточку
cards.forEach(card => {

  let defaultTransform = ''; 

  card.addEventListener('mouseover', () => {
    defaultTransform = card.style.transform; 
    defaultTransform = card.style.transform = 'scale(1.1)';
  });

  card.addEventListener('mousemove', e => {
    
    let rect = card.getBoundingClientRect();
    let xCenter = rect.left + rect.width / 2;
    let yCenter = rect.top + rect.height / 2;
    
    let dx = e.clientX - xCenter;
    let dy = e.clientY - yCenter;
    
    let tiltX = dy / rect.height * -15;
    let tiltY = dx / rect.width * 30;
    
    card.style.transform = `${defaultTransform} perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
  });
  
  card.addEventListener('mouseout', () => {
    card.style.transform = defaultTransform; 
    defaultTransform = card.style.transform = 'scale(1)'
  });

});




