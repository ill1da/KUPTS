//Элементы
//Начальный звук
const defaultSound = new Audio("./press-the-button-source/sounds/BRUH.mp3");
//Кнопки
const redButton = document.querySelector("#red-button");
const resetButton = document.querySelector("#reset-btn");
//Пользовательский звук
const inputFile = document.querySelector("#change-sound");
let changeTitle = document.querySelector(".input-file-list");

//Обработчик кнопки
redButton.addEventListener("click", () => {
  // Получаем сохраненный звук из локального хранилища
  const savedSound = localStorage.getItem("sound");

  try {
    // Если звук найден - создаем объект и проигрываем
    if(savedSound) {
      const audio = new Audio(savedSound);
      audio.play();
    } // Иначе проигрываем звук по умолчанию
    else {
      defaultSound.play(); 
    }
  } catch(e) {
    console.error("Ошибка проигрывания", e);
  }
});

// Обработчик кнопки Default
resetButton.addEventListener("click", () => {

  // Удаляем сохраненный звук
  localStorage.removeItem("sound");
  
  // Проигрываем звук по умолчанию
  defaultSound.play();

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
});