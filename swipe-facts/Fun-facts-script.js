import cardData from './Fun-facts-source/facts.json' assert {type: "json"};
//HTML-элементы
const card = document.querySelector('.card');
const cardImage = document.querySelector('.card-image');
const cardText = document.querySelector('.card-text');
const cardTitle = document.querySelector('.card-title');
//Переменные
let currentIndex = 0; /*getRandomUnviewedCardIndex(-1)*/
let startX = 0;
let currentTranslateX = 0;
let isDragging = false;
let swipeLeftCount = 0;
let swipeRightCount = 0;
let swipeCount = 0;

const viewedCards = [0]; // Список просмотренных карточек
let viewedCardsIndex = -1; // Индекс текущей карточки в списке просмотренных

//Объявление данных карточки
function showCard(index) {
  const card = cardData[index];
  
  cardImage.src = card.image; 
  cardTitle.textContent = card.title;
  cardText.textContent = card.text;
}

//Сброс позиции карточки
function resetCardPosition() {
  card.style.transition = 'transform 0.3s ease';
  card.style.transform = `translateX(0) rotate(0deg)`;
}

//Является ли карточка просмотренной
function isCardViewed(index) {
  return viewedCards.includes(index);
}

//Обработчик события начала свайпа
function handleCardSwipeStart(event) {
  if (isDragging) return; // Уже перетаскивается

  startX = event.clientX || event.touches[0].clientX;
  currentTranslateX = 0;
  isDragging = true;

  card.style.transition = 'none';

  document.addEventListener('mousemove', handleCardSwipeMove);
  document.addEventListener('touchmove', handleCardSwipeMove);

  document.addEventListener('mouseup', handleCardSwipeEnd);
  document.addEventListener('touchend', handleCardSwipeEnd);
}

//Обработчик движения при свайпе
function handleCardSwipeMove(event) {
  if (!isDragging) return;

  const currentX = event.clientX || event.touches[0].clientX;
  const deltaX = currentX - startX;

  currentTranslateX = deltaX;
  card.style.transform = `translateX(${currentTranslateX}px) rotate(${(currentTranslateX / 10).toFixed(1)}deg)`;
}

//Обработчик завершения свайпа
function handleCardSwipeEnd() {
  if (!isDragging) return;

  isDragging = false;

  document.removeEventListener('mousemove', handleCardSwipeMove);
  document.removeEventListener('touchmove', handleCardSwipeMove);

  document.removeEventListener('mouseup', handleCardSwipeEnd);
  document.removeEventListener('touchend', handleCardSwipeEnd);

  card.style.transition = 'transform 0.3s ease';

  if (Math.abs(currentTranslateX) < 100) {
    resetCardPosition();
  } else {
    const direction = currentTranslateX > 0 ? 1 : -1; // 1 for right, -1 for left

    card.style.transform = `translateX(${direction * 300}px) rotate(${direction * 15}deg)`;

    swipeCount++;

    if (swipeCount > 1) {
      document.getElementById("i-dont-know").textContent = "Прошлая";
    }

    if (direction === 1) {
      swipeRightCount++;
      currentIndex = getRandomUnviewedCardIndex(); //Случайная непросмотренная
    } else {
      swipeLeftCount++;

      //Проверка, есть ли прошлая карточка
      if (viewedCardsIndex > 0) {
        viewedCardsIndex--;
        currentIndex = viewedCards[viewedCardsIndex];
      } else {
        //Если нет, то берем любую
        currentIndex = getRandomUnviewedCardIndex();
      }
    }

    //Добавляем в список просмотренных
    viewedCards.push(currentIndex);
    viewedCardsIndex = viewedCards.length - 1;

    setTimeout(() => {
      showCard(currentIndex);
      resetCardPosition();

      setTimeout(() => {
        // Снова подключаем обработчики событий для следующей карточки
        card.addEventListener('mousedown', handleCardSwipeStart);
        card.addEventListener('touchstart', handleCardSwipeStart);
      }, 100);
    }, 300);
  }
}

//Получение случайного индекса карточки
function getRandomUnviewedCardIndex() {
  let unviewedIndex = cardData.map((_, index) => index).filter(index => !isCardViewed(index));

  if (unviewedIndex.length === 0) {
    //Если карточки просмотренны
    document.getElementById("end-screen").style.display = "flex";
    viewedCards.length = 0;
    unviewedIndex = cardData.map((_, index) => index);
  }

  const randomIndex = unviewedIndex[Math.floor(Math.random() * unviewedIndex.length)];
  return randomIndex;  
}

showCard(currentIndex);

card.addEventListener('mousedown', handleCardSwipeStart);
card.addEventListener('touchstart', handleCardSwipeStart);

document.getElementById("end-screen-button").addEventListener("click", () => {
  document.getElementById("end-screen").style.display = "none";
})