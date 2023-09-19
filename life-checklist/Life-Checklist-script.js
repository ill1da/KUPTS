// Функция для загрузки JSON-файла
async function loadJSONFile(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return await response.json();
  } catch (error) {
    console.error('Error loading JSON:', error);
    return null;
  }
}

const progressTitleValue = document.querySelector(".progress-title-value");

// Функция для создания элементов на основе данных из JSON-файла
async function createElements() {
  const achievementsData = await loadJSONFile("./Life-Checklist-source/achievements.json");

  if (!achievementsData) {
    console.error('Failed to load achievements data');
    return;
  }

  let checkedBoxes = {};
  let checkedCount = 0;

  // Получаем данные из локального хранилища
  if (localStorage.getItem("checkedBoxes")) {
    checkedBoxes = JSON.parse(localStorage.getItem("checkedBoxes"));
  }
  if (localStorage.getItem("checkedCount")) {
    checkedCount = localStorage.getItem("checkedCount");
    updateProgressBar(checkedCount);
  }

  achievementsData.forEach(word => {
    let id = `cb-${word}`;

    let label = document.createElement("label");
    label.classList.add("item");

    let input = document.createElement("input");
    input.type = "checkbox";
    input.id = id;
    input.classList.add("checkbox");

    // Проверяем, был ли чекбокс активным
    if (checkedBoxes[id]) {
      label.classList.add("active");
      if (checkedBoxes[input.id]) {
        input.checked = true;
      }
    }

    input.addEventListener("change", () => {
      if (input.checked) {
        vibrateOnMove();
        label.classList.add("active");
        checkedBoxes[id] = true;
        checkedCount++;
      } else {
        vibrateOnMove();
        label.classList.remove("active");
        delete checkedBoxes[id];
        checkedCount--;
      }
      
      // Обновляем локальное хранилище
      localStorage.setItem("checkedBoxes", JSON.stringify(checkedBoxes));
      localStorage.setItem("checkedCount", JSON.stringify(checkedCount));

      // Обновляем прогресс бар
      updateProgressBar(checkedCount);
    });
    
    label.append(input, word);
    document.querySelector(".labels").append(label)
  });
}

// Функция обнолвения прогресс бара
function updateProgressBar(checkedCount) {
  const ProgressBar = document.querySelector(".progress");
  ProgressBar.value = checkedCount;
  progressTitleValue.textContent = checkedCount;
}

function vibrateOnMove() {
  if ("vibrate" in navigator) {
      navigator.vibrate(20);
  }
}

// Вызываем функцию для создания элементов после загрузки JSON-файла
createElements();