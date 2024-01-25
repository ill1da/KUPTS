// Создаем сцену, камеру и рендерер
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 10, 0);
camera.lookAt(new THREE.Vector3(0, 0, 0));

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Создаем плоскость для поля
const groundGeometry = new THREE.PlaneGeometry(20, 20);
// Загрузка текстуры
const textureLoader = new THREE.TextureLoader();
const TEXgradient = textureLoader.load('./ac0fd73a762874aae2a41c419041f1c3_waifu2x_art_noise3_scale.png');
const groundMaterial = new THREE.MeshBasicMaterial({ map: TEXgradient, side: THREE.DoubleSide });
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2; // Поворачиваем поле, чтобы оно лежало на плоскости XZ
ground.position.y = -0.5; // Опускаем плоскость вниз
scene.add(ground);

const grassGeometry = new THREE.PlaneGeometry(0.1, 1);
const grassMaterial = new THREE.MeshBasicMaterial({
  color: 0x7cc76f,
  side: THREE.DoubleSide
});
const gradient = new THREE.CanvasTexture(generateGradientTexture());
grassMaterial.map = gradient;

const grassGroup = new THREE.Group();

for (let i = 0; i < 10000; i++) {
  const grassBlade = new THREE.Mesh(grassGeometry, grassMaterial);
  grassBlade.position.x = (Math.random() - 0.5) * 15;
  grassBlade.position.z = (Math.random() - 0.5) * 9;
  grassBlade.rotation.x = -1;
  grassGroup.add(grassBlade);
}

scene.add(grassGroup);

const cursorRadius = 0.5;

// Создаем геометрию для круглой области
const circleGeometry = new THREE.CircleGeometry(cursorRadius, 32);
const circleMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.3 });
const cursorCircle = new THREE.Mesh(circleGeometry, circleMaterial);

// Поворачиваем круглую область на 90 градусов, чтобы сделать её горизонтальной
cursorCircle.rotation.x = -Math.PI / 2;

scene.add(cursorCircle);

const cursorPosition = new THREE.Vector3(); // Позиция курсора в мировых координатах

const raycaster = new THREE.Raycaster();
const mouseVector = new THREE.Vector2();

const clock = new THREE.Clock();

// Обработка событий касания на мобильных устройствах
function onTouchMove(event) {
  event.preventDefault();

  const touch = event.touches[0];
  const touchX = (touch.clientX / window.innerWidth) * 2 - 1;
  const touchY = -(touch.clientY / window.innerHeight) * 2 + 1;

  mouseVector.set(touchX, touchY);
  raycaster.setFromCamera(mouseVector, camera);

  const intersection = raycaster.intersectObject(ground);
  if (intersection.length > 0) {
    const point = intersection[0].point;
    cursorCircle.position.set(point.x, point.y + 0.75, point.z);
    cursorPosition.copy(point);
    cursorPosition.y = cursorCircle.position.y;
    cursorPosition.sub(cursorCircle.position);
    cursorPosition.add(cursorCircle.position);
  }
}

// Добавляем обработчики событий
window.addEventListener('resize', () => {
  const newWidth = window.innerWidth;
  const newHeight = window.innerHeight;

  camera.aspect = newWidth / newHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(newWidth, newHeight);
});

window.addEventListener('mousemove', (event) => {
  const mouseX = (event.clientX / window.innerWidth) * 2 - 1;
  const mouseY = -(event.clientY / window.innerHeight) * 2 + 1;

  mouseVector.set(mouseX, mouseY);
  raycaster.setFromCamera(mouseVector, camera);

  const intersection = raycaster.intersectObject(ground);
  if (intersection.length > 0) {
    const point = intersection[0].point;
    cursorCircle.position.set(point.x, point.y + 0.75, point.z);
    cursorPosition.copy(point);
    cursorPosition.y = cursorCircle.position.y;
    cursorPosition.sub(cursorCircle.position);
    cursorPosition.add(cursorCircle.position);
  }
});

window.addEventListener('touchmove', onTouchMove, { passive: false }); // Поддержка обработки событий касания

function handleInput(event) {
  event.preventDefault();

  const touches = event.touches;
  const mouseX = (touches[0].clientX / window.innerWidth) * 2 - 1;
  const mouseY = -(touches[0].clientY / window.innerHeight) * 2 + 1;

  mouseVector.set(mouseX, mouseY);
  raycaster.setFromCamera(mouseVector, camera);

  // Получаем координаты мыши в мировых координатах
  const intersection = raycaster.intersectObject(ground);
  if (intersection.length > 0) {
    const point = intersection[0].point;

    // Позиционируем круглую область по центру относительно позиции мыши
    cursorCircle.position.set(point.x, point.y + 0.75, point.z);

    // Смещаем курсор относительно центра области
    cursorPosition.copy(point);
    cursorPosition.y = cursorCircle.position.y;
    cursorPosition.sub(cursorCircle.position);
    cursorPosition.add(cursorCircle.position);
  }
}

function handleMouseDown() {
  isMousePressed = true;
}

function handleMouseUp() {
  isMousePressed = false;
}

window.addEventListener('touchstart', handleInput);
window.addEventListener('touchmove', handleInput);
window.addEventListener('mousedown', handleMouseDown);
window.addEventListener('mouseup', handleMouseUp);

let isMousePressed = false;

function updateGrassTilt() {
  const cursorPositionXZ = new THREE.Vector2(cursorPosition.x, cursorPosition.z);
  grassGroup.children.forEach((grassBlade) => {
    const grassBladeXZ = new THREE.Vector2(grassBlade.position.x, grassBlade.position.z);

    // Проверяем, находится ли травинка внутри области вокруг курсора
    const distance = cursorPositionXZ.distanceTo(grassBladeXZ);
    const radius = cursorRadius + 0.4; // увеличиваем радиус для более мягкого взаимодействия
    if (distance < radius) {
      const direction = new THREE.Vector2().subVectors(grassBladeXZ, cursorPositionXZ).normalize();
      const angle = Math.atan2(direction.y, direction.x);

      // Угол поворота для травинок в радиусе зависит от угла курсора
      const cursorAngle = Math.atan2(cursorPosition.z, cursorPosition.x);
      const relativeAngle = angle - cursorAngle;

      // Отворачиваем травинки от центра радиуса курсора в разные стороны
      const tiltAmount = 1.6; // Максимальный угол наклона
      const tilt = Math.sin(relativeAngle * 1.6) * tiltAmount;

      grassBlade.rotation.z = tilt;
    }
  });
}

function animate() {
  requestAnimationFrame(animate);

  // Позиционируем курсор визуально по центру области
  cursorCircle.position.copy(cursorPosition);

  // Анимация колыхания травинок
  const delta = clock.getDelta();
  grassGroup.children.forEach((grassBlade) => {
    grassBlade.rotation.z = Math.sin(grassBlade.position.x * 2 + grassBlade.position.z * 2 + clock.elapsedTime) * 0.1;
  });

  // Обновляем наклон травинок в сторону курсора при зажатой кнопке мыши
  if (isMousePressed) {
    updateGrassTilt();
  }

  renderer.render(scene, camera);
}

function generateGradientTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;

  const context = canvas.getContext('2d');

  const gradient = context.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, '#a4db76');
  gradient.addColorStop(1, '#4c6b39');

  context.fillStyle = gradient;
  context.fillRect(0, 0, canvas.width, canvas.height);

  return canvas;
}

animate();
