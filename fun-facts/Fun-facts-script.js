const card = document.querySelector('.card');
const cardImage = document.querySelector('.card-image');
const cardText = document.querySelector('.card-text');
const cardTitle = document.querySelector('.card-text');
const startButton = document.getElementById('start-button');

const startContainer = document.getElementById('start-container');
const gameContainer = document.getElementById("game-container");

const cardData = [
  {
    image: './',
    title: 'Шоколадные дороги',
    text: 'Если бы все батоны шоколада, произведенные за год, выложить в ряд, то эта "шоколадная дорога" могла бы несколько раз обернуть весь земной шар!'
  },
  {
    image: './',
    title: 'Шоколадные дороги',
    text: 'Text for Card 2'
  },
  // Добавьте другие карточки по аналогии
];

let currentIndex = 0;
let swipeCount = 0;
let startX = 0;
let currentTranslateX = 0;
let isDragging = false;
let swipeLeftCount = 0;
let swipeRightCount = 0;

function showCard(index) {
  cardImage.src = cardData[index].image;
  cardTitle.textContent = cardData[index].title;
  cardText.textContent = cardData[index].text;
}

function resetCardPosition() {
  card.style.transition = 'transform 0.3s ease';
  card.style.transform = `translateX(0) rotate(0deg)`;
}

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

function handleCardSwipeMove(event) {
  if (!isDragging) return;

  const currentX = event.clientX || event.touches[0].clientX;
  const deltaX = currentX - startX;

  currentTranslateX = deltaX;
  card.style.transform = `translateX(${currentTranslateX}px) rotate(${(currentTranslateX / 10).toFixed(1)}deg)`;
}

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

    if (direction === 1) {
      swipeRightCount++;

    } else {
      swipeLeftCount++;
    }

    console.log(`Swipe Right: ${swipeRightCount}, Swipe Left: ${swipeLeftCount}`);

    setTimeout(() => {
      currentIndex = (currentIndex + (direction === 1 ? 1 : cardData.length - 1)) % cardData.length;

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

showCard(currentIndex);

card.addEventListener('mousedown', handleCardSwipeStart);
card.addEventListener('touchstart', handleCardSwipeStart);

startButton.addEventListener('click', () => {
  startContainer.style.display = "none";
  gameContainer.style.display = "flex";
});