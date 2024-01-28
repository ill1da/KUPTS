// 💜 Вернитесь 😭
let originalTitle = document.title;
let originalFavicon = "./main/MAIN-source/logo/fav-logo.ico";
// Врменной интервал
let timeoutInterval = 10 * 60 * 1000;

// Обработка изменения названия вкладки 
document.addEventListener('visibilitychange', () => {
  if(document.hidden) {
    // Пользователь ушел со вкладки
    setTimeout(() => {
      if(document.hidden) {
        changeTabInfo("./main/MAIN-source/logo/💜.ico", "Вернитесь 😭");
      }
    }, timeoutInterval);
  } else {
    // Пользователь вернулся на вкладку
    changeTabInfo(originalFavicon, originalTitle);
  }
});

// Обработчик события фокуса на вкладке
window.addEventListener("focus", function () {
  // Пользователь активен на вкладке
  changeTabInfo(originalFavicon, originalTitle);
});

// Функция для изменения логотипа и названия вкладки
function changeTabInfo(favicon, title) {
  document.getElementById("favicon").href = favicon;
  document.title = title;
}

// 🟧 Смена эмоджи
let emoji = document.getElementById('emoji');
emoji.addEventListener('click', () => {
  let randomEmoji = Math.floor(Math.random() * (128586 - 128511 + 1)) + 128511;
  emoji.style.transform = 'scale(1.2) rotate(' + (Math.random() * 20 - 10) + 'deg)';
  emoji.innerHTML = `&#${randomEmoji}`; 

  // Сохранение выбранного эмодзи в локальное хранилище
  localStorage.setItem('lastEmoji', `&#${randomEmoji}`);

  setTimeout(function () {
    emoji.style.transform = 'scale(1) rotate(0)';
  }, 200);
});

// Восстановление последнего выбранного эмодзи при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
  let lastEmoji = localStorage.getItem('lastEmoji');
  if (lastEmoji) {
    emoji.innerHTML = lastEmoji;
  }
});

// 🟨 Прокрутка prompter
let Prompter = document.getElementById('prompter-list');

// Событие при прокрутке страницы
window.addEventListener('scroll', function () {
  // Получение координат верхней границы блока prompter
  let PrompterTop = Prompter.getBoundingClientRect().top;

  // Настройка стилей для блока prompter в зависимости от прокрутки
  Prompter.style.transform = 'translateX(' + (-PrompterTop / 4) + 'px)';
});

// 🟪 Счетчик проектов
let cardValue = document.querySelectorAll('.card')
document.getElementById('progect-value').textContent = `0${cardValue.length}`;

// 🟩 Кнопка "наверх"
let goUpButton = document.getElementById('go-up');
let coverSection = document.getElementById('cover');
goUpButton.addEventListener('click', () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
});

// КУБ
document.addEventListener('DOMContentLoaded', () => {
  // Set up Three.js scene
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(25, 1, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }); // Set alpha to true for transparency
  const targetDiv = document.querySelector('.color-shape.target');

  // Set canvas size to match the target div
  const width = targetDiv.clientWidth;
  const height = targetDiv.clientHeight;
  renderer.setSize(width, height);

  document.body.appendChild(renderer.domElement);

  // Create a glass-like material
  const material = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    metalness: 0.1, 
    roughness: 0,
    thickness: 5,
    transparency: 1, 
    transmission: 0.5,
    transparent: true,
    refractionRatio: 1,
    refraction: true,
    refractiveIndex: 1.5,
    opacity: 0.5
  });

  const geometry = new THREE.BoxGeometry();
  const cube = new THREE.Mesh(geometry, material);
  scene.add(cube);

  // Add lights for even illumination
  const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 0.5);
  directionalLight.position.set(1, 1, 1).normalize();
  scene.add(directionalLight);
  
  const hemisphereLight = new THREE.HemisphereLight(0xFFFFFF, 0xFFFFFF, 0.5);
  scene.add(hemisphereLight);

  // Remove axes helper (optional)
  scene.remove(scene.children.find(child => child instanceof THREE.AxesHelper));

  // Position the camera
  camera.position.z = 5;

  // Ensure cube maintains proportions
  const updateCameraAspect = () => {
    const aspect = targetDiv.clientWidth / targetDiv.clientHeight;
    camera.aspect = aspect;
    camera.updateProjectionMatrix();
  };

  // Rotate the cube
  const animate = () => {
    requestAnimationFrame(animate);
    cube.rotation.x += 0.006;
    cube.rotation.y += 0.005;
    renderer.render(scene, camera);
  };

  // Handle window and target div resize
  const observer = new ResizeObserver(() => {
    const newWidth = targetDiv.clientWidth;
    const newHeight = targetDiv.clientHeight;
    renderer.setSize(newWidth, newHeight);
    updateCameraAspect();
  });

  observer.observe(targetDiv);
  window.addEventListener('resize', () => {
    const newWidth = targetDiv.clientWidth;
    const newHeight = targetDiv.clientHeight;
    renderer.setSize(newWidth, newHeight);
    updateCameraAspect();
  });

  // Append the renderer to the target div
  targetDiv.appendChild(renderer.domElement);

  // Initialize camera aspect
  updateCameraAspect();

  // Start animation
  animate();
});