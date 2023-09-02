import cardData from './Fun-facts-source/facts.json' assert {type: "json"};

const card = document.querySelector('.card');
const cardImage = document.querySelector('.card-image');
const cardText = document.querySelector('.card-text');
const cardTitle = document.querySelector('.card-title');
const startButton = document.getElementById('start-button');
const retryButton = document.getElementById('retry-button');

const startContainer = document.getElementById('start-container');
const gameContainer = document.getElementById("game-container");
const endContainer = document.getElementById("end-container");


let currentIndex = 0; /*getRandomCardIndex(-1)*/
let swipeCount = 0;
let startX = 0;
let currentTranslateX = 0;
let isDragging = false;
let swipeLeftCount = 0;
let swipeRightCount = 0;

function showCard(index) {
  const card = cardData[index];
  
  cardImage.src = card.image; 
  cardTitle.textContent = card.title;
  cardText.textContent = card.text;
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

    swipeCount++;
    document.getElementById('count-up').textContent = swipeCount;
    if (direction === 1) {
      swipeRightCount++;
      document.getElementById('know-counter').textContent = swipeRightCount;
    } else {
      swipeLeftCount++;
      document.getElementById('dont-know-counter').textContent = swipeLeftCount;
    }

    if(swipeCount === 10){
      gameContainer.style.display = "none";
      endContainer.style.display = "flex";
      endResult();
    }

    setTimeout(() => {
      currentIndex = getRandomCardIndex(currentIndex);

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

function getRandomCardIndex(currentIndex) {
  let randomIndex;
  do {
    randomIndex = Math.floor(Math.random() * cardData.length);
  } while (randomIndex === currentIndex);
  return randomIndex;
}

function endResult() {
  document.getElementById("end-know").textContent = swipeRightCount;
  document.getElementById("end-dont-know").textContent = swipeLeftCount;
}

showCard(currentIndex);

card.addEventListener('mousedown', handleCardSwipeStart);
card.addEventListener('touchstart', handleCardSwipeStart);

startButton.addEventListener('click', () => {
  startContainer.style.display = "none";
  gameContainer.style.display = "flex";

  swipeRightCount = 0;
  document.getElementById("end-know").textContent = "0";
  swipeLeftCount = 0;
  document.getElementById("end-dont-know").textContent = "0";
  swipeCount = 0;
  document.getElementById("count-up").textContent = "0";
});

retryButton.addEventListener('click', () => {
  gameContainer.style.display = "flex";
  endContainer.style.display = "none";

  swipeRightCount = 0;
  document.getElementById("know-counter").textContent = "0";
  swipeLeftCount = 0;
  document.getElementById("dont-know-counter").textContent = "0";
  swipeCount = 0;
  document.getElementById("count-up").textContent = "0";
})