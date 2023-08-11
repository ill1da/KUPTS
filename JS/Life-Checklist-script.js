//1. Импортируем список
import words from "./SOURCE/Life-Checklist-source/achievements.json" assert {type: "json"};

const progressTitleValue = document.querySelector(".progress-title-value");

//Функция для создания элементов
const createElements = (word) => {
  let checkedBoxes = {};
  let checkedCount = 0;

  //Получаем данные из локального хранилища
  if(localStorage.getItem("checkedBoxes")){
    checkedBoxes = JSON.parse(localStorage.getItem("checkedBoxes"));
  }
  if(localStorage.getItem("checkedCount")){
    checkedCount = localStorage.getItem("checkedCount");
    updateProgressBar(checkedCount);
  }

  words.forEach(word => {
    let id = `cb-${word}`;

    let label = document.createElement("label");
    label.classList.add("item");

    let input = document.createElement("input");
    input.type = "checkbox";
    input.id = id;
    input.classList.add("checkbox");

    //Проверяем, был ли чекбокс активным
    if(checkedBoxes[id]){
      label.classList.add("active");
      if (checkedBoxes[input.id]) {
        input.checked = true;
      }
    }

    input.addEventListener("change", () => {
      if(input.checked){
        label.classList.add("active");
        checkedBoxes[id] = true;
        checkedCount++;
      } else {
        label.classList.remove("active");
        delete checkedBoxes[id];
        checkedCount--;
      }
      

      //Обновляем локальное хранилище
      localStorage.setItem("checkedBoxes", JSON.stringify(checkedBoxes));
      localStorage.setItem("checkedCount", JSON.stringify(checkedCount));

      //Обновляем прогресс бар
      updateProgressBar(checkedCount);
    });
    
    label.append(input, word);
    document.querySelector(".labels").append(label)
  });
}

//Функция обнолвения прогресс бара
const updateProgressBar = (checkedCount) => {
  const ProgressBar = document.querySelector(".progress");
  ProgressBar.value = checkedCount;
  progressTitleValue.textContent = checkedCount;
}

//Вызываем функцию для создания элементов
createElements(words);