const titleInput = document.getElementById("userText");
const dateInput = document.getElementById("userDate");
const addBtn = document.getElementById("addBtn");
const countersList = document.getElementById("userList");

// Функция добавления счетчика  
function addCounter() {

  // Получаем данные из инпутов
  const title = titleInput.value;
  const date = new Date(dateInput.value);

  // Создаем уникальный id
  const id = Date.now().toString();

  // Создаем разметку счетчика
  const counter = `
    <div class="counter" id="${id}" data-date="${date}">
        <div class="counter-title">  
            <h4 class="counter__title">${title}</h4>  
            <p class="counter__date">${date.toLocaleDateString()}</p>
        </div>
        <div class="counter-items">
            <p class="counter__count">${countDays(date)}</p>
            <button class="delete-btn"></button>
        </div>
    </div>
  `;

  // Добавляем в DOM
  countersList.insertAdjacentHTML('beforeend', counter);

  // Сохраняем в storage
  saveCounterToStorage(id, title, date);

  // Очищаем поля ввода
  titleInput.value = '';
  dateInput.value = '';

}

// Функция подсчета дней 
function countDays(date) {

  const now = new Date();
  const diff = date - now;
  console.log("date " + date);
  console.log("now " + now);
  const days = Math.floor(diff / (1000 * 60 * 60 * 24) + 1);

  if(days >= 0) {
    return `Осталось ${days} дней`;
  } else {
    return `Прошло ${Math.abs(days)} дней`; 
  }

}

// Функция сохранения в storage
function saveCounterToStorage(id, title, date) {

  const counters = JSON.parse(localStorage.getItem('counters')) || [];

  counters.push({
    id, 
    title,
    date
  });

  localStorage.setItem('counters', JSON.stringify(counters));

}

// Функция удаления из storage
function removeCounterFromStorage(id) {

  const counters = JSON.parse(localStorage.getItem('counters')) || [];

  const index = counters.findIndex(c => c.id === id);

  if(index > -1) {
    counters.splice(index, 1);
  }

  localStorage.setItem('counters', JSON.stringify(counters));

}

// Функция удаления счетчика
function deleteCounter(e) {
  
  if(e.target.classList.contains('delete-btn')) {
    
    const parent = e.target.closest('.counter');
    const id = parent.id;

    parent.remove();

    removeCounterFromStorage(id);

  }

}

// Функция обновления счетчиков
function updateCounters() {
  // Получаем все счетчики
  const counters = document.querySelectorAll('.counter');
  
  counters.forEach(counter => {
    // Находим элемент с кол-вом дней
    const countElem = counter.querySelector('.counter__count');
    // Получаем дату из data-атрибута
    const date = new Date(counter.dataset.date);
    // Обновляем подсчет дней
    countElem.textContent = countDays(date);
    console.log(countElem);
  });

}

// Запускаем обновление каждый день 
setInterval(updateCounters, 1000);

// Обработчики событий
addBtn.addEventListener('click', addCounter);
countersList.addEventListener('click', deleteCounter);

// Загрузка данных из storage при загрузке страницы
function init() {

  const counters = JSON.parse(localStorage.getItem('counters')) || [];

  counters.forEach(counter => {

    const {id, title, date} = counter;

    const counterMarkup = `
      <div class="counter" id="${id}" data-date="${counter.date}" >
        <div class="counter-title">
            <h4 class="counter__title">${title}</h4>
            <p class="counter__date">${new Date(date).toLocaleDateString()}</p> 
        </div>
        <div class="counter-items">
           <p class="counter__count">${countDays(new Date(date))}</p>
            <button class="delete-btn"></button>
        </div>
      </div>
    `;

    countersList.insertAdjacentHTML('beforeend', counterMarkup);

  });

  const deleteBtns = document.querySelectorAll('.delete-btn');

  deleteBtns.forEach(btn => {
    btn.addEventListener('click', deleteCounter); 
  });
}

init();