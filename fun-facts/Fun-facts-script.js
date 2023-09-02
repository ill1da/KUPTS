const card = document.querySelector('.card');
const cardImage = document.querySelector('.card-image');
const cardText = document.querySelector('.card-text');
const cardTitle = document.querySelector('.card-title');
const startButton = document.getElementById('start-button');
const retryButton = document.getElementById('retry-button');

const startContainer = document.getElementById('start-container');
const gameContainer = document.getElementById("game-container");
const endContainer = document.getElementById("end-container");

const cardData = [
  {
    image: './Fun-facts-source/img/F10.png',
    title: 'Дружелюбные альпаки',
    text: 'Альпаки — это милые животные, близкие к ламам. Они могут проявлять дружелюбие, обнимая друг друга шеей в знак приветствия.'
  },
  {
    image: './Fun-facts-source/img/F9.png',
    title: 'Пчеловождение',
    text: 'В некоторых странах существуют специальные "отели" для диких пчел, чтобы помочь им размножаться и сохранять популяции. Эти отели содержат отверстия разных размеров, чтобы привлечь разные виды пчел.'
  },
  {
    image: './Fun-facts-source/img/F8.png',
    title: 'Пение китов',
    text: 'Киты могут исполнять "песни", которые продолжаются в течение нескольких часов и состоят из разнообразных звуков и мелодий. Некоторые ученые полагают, что это их способ общения или даже форма искусства.'
  },
  {
    image: './Fun-facts-source/img/F7.png',
    title: 'Путешествие в будущее',
    text: 'Из-за гравитационных эффектов и релятивистской физики, астронавты на борту космического корабля, двигающегося со значительной скоростью, на самом деле стареют медленнее, чем люди на Земле.'
  },
  {
    image: './Fun-facts-source/img/F6.png',
    title: 'Водопады под водой',
    text: 'В океанах можно найти "подводные водопады" из плотной соленой воды, которая сливается со свежей водой. Это создает визуально впечатляющий эффект струй воды, падающих вниз.'
  },
  {
    image: './Fun-facts-source/img/F5.png',
    title: 'Спящие морские звезды',
    text: 'У морских звезд нет мозга, но они способны засыпать. Они могут переходить в состояние пассивного режима, которое напоминает сон.'
  },
  {
    image: './Fun-facts-source/img/F4.png',
    title: 'Вечное движение',
    text: 'Земля постоянно в движении! Мы не только вращаемся вокруг своей оси, но и двигаемся вокруг Солнца. Так что каждый из нас в сущности двигается быстрее, чем кажется!'
  },
  {
    image: './Fun-facts-source/img/F3.png',
    title: 'Морские котики-детективы',
    text: 'В Антарктике обитают морские котики, которые могут помочь ученым в поиске подводных объектов благодаря своей способности различать звуки и отличать одни звуки от других.'
  },
  {
    image: './Fun-facts-source/img/F2.png',
    title: 'Ленивые деревья',
    text: 'Деревья такие ленивые, что растут всего лишь на несколько сантиметров в год. Это означает, что если дерево начало расти с момента основания Рима (около 753 года до н.э.), оно было бы высотой всего несколько метров.'
  },
  {
    image: './Fun-facts-source/img/F1.png',
    title: 'Шоколадные дороги',
    text: 'Если бы все батоны шоколада, произведенные за год, выложить в ряд, то эта "шоколадная дорога" могла бы несколько раз обернуть весь земной шар!'
  }
];

let currentIndex = 0; /*getRandomCardIndex(-1)*/
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