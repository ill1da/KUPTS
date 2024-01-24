let sequence = [];
const secretCode = ['ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown', 'KeyA', 'KeyB'];
let keysPressed = {};
let velocityX = 0;
let velocityY = 0;
let cursorX = window.innerWidth / 2;
let cursorY = window.innerHeight / 2;
let rotationAngle = 0;
let shootingInterval;

function updateCursorPosition(event) {
  cursorX = event.clientX;
  cursorY = event.clientY;
}

window.addEventListener('mousemove', updateCursorPosition);

function moveSquare() {
  const square = document.getElementById('square');
  if (!square) return;

  let posX = parseFloat(square.style.left) || window.innerWidth / 2 - 15;
  let posY = parseFloat(square.style.top) || window.innerHeight / 2 - 15;

  // Adjust velocities based on pressed keys
  velocityX += (keysPressed['KeyD'] || keysPressed['ArrowRight']) ? 0.2 : 0;
  velocityX -= (keysPressed['KeyA'] || keysPressed['ArrowLeft']) ? 0.2 : 0;
  velocityY += (keysPressed['KeyS'] || keysPressed['ArrowDown']) ? 0.2 : 0;
  velocityY -= (keysPressed['KeyW'] || keysPressed['ArrowUp']) ? 0.2 : 0;

  // Apply damping effect
  velocityX *= 0.9;
  velocityY *= 0.9;

  // Update position based on velocity
  posX += velocityX;
  posY += velocityY;

  // Wrap around when reaching the screen boundaries
  posX = (posX + window.innerWidth) % window.innerWidth;
  posY = (posY + window.innerHeight) % window.innerHeight;

  // Calculate angle between square and cursor on each step
  const angle = Math.atan2(cursorY - posY, cursorX - posX) * (180 / Math.PI);

  // Calculate the change in angle
  let deltaAngle = angle - rotationAngle;

  // Normalize deltaAngle to be within the range [-180, 180]
  deltaAngle = ((deltaAngle + 180) % 360 + 360) % 360 - 180;

  // Update square position and rotation directly
  square.style.left = `${posX}px`;
  square.style.top = `${posY}px`;

  // Rotate without abrupt changes in angle
  rotationAngle += deltaAngle;

  // Apply rotation to square using transform
  square.style.transform = `translate(-50%, -50%) rotate(${rotationAngle}deg)`;

  // Repeat the function with the next animation frame
  requestAnimationFrame(moveSquare);
}

function createSquare() {
  const square = document.createElement('div');
  square.id = 'square';
  document.body.appendChild(square);

  // Start the movement loop
  moveSquare();

  // Start shooting projectiles every second
  shootingInterval = setInterval(shootProjectile, 1000);
}


function shootProjectile() {
  const square = document.getElementById('square');
  const bullet = document.createElement('div');
  bullet.className = 'bullet';
  document.body.appendChild(bullet);

  // Set initial position of the bullet
  bullet.style.left = square.style.left;
  bullet.style.top = square.style.top;

  // Calculate the angle between square and cursor
  const bulletAngle = Math.atan2(cursorY - parseFloat(bullet.style.top), cursorX - parseFloat(bullet.style.left));

  // Set velocity of the bullet based on the angle
  const bulletSpeed = 5;
  const bulletVelocityX = bulletSpeed * Math.cos(bulletAngle);
  const bulletVelocityY = bulletSpeed * Math.sin(bulletAngle);

  // Move the bullet in the specified direction
  function moveBullet() {
    let bulletPosX = parseFloat(bullet.style.left);
    let bulletPosY = parseFloat(bullet.style.top);

    // Update position based on velocity
    bulletPosX += bulletVelocityX;
    bulletPosY += bulletVelocityY;

    // Remove the bullet if it goes outside the screen boundaries
    if (bulletPosX < 0 || bulletPosY < 0 || bulletPosX > window.innerWidth || bulletPosY > window.innerHeight) {
      document.body.removeChild(bullet);
      return;
    }

    // Check for collision with HTML elements
    const elementsAtPoint = document.elementsFromPoint(bulletPosX, bulletPosY);

    // Check if any of the elements at the point has the class 'target'
    const targetElement = elementsAtPoint.find(element => element.classList.contains('target'));

    if (targetElement) {
      // Check if the target element has nested targets
      const nestedTargets = targetElement.querySelectorAll('.target');

      // Ignore the target if it has nested targets
      if (nestedTargets.length === 0) {
        // Remove the target element
        targetElement.remove();

        // Remove the bullet
        document.body.removeChild(bullet);
      }
    }

    // Update bullet position
    bullet.style.left = `${bulletPosX}px`;
    bullet.style.top = `${bulletPosY}px`;

    // Repeat the function with the next animation frame
    requestAnimationFrame(moveBullet);
  }

  // Start moving the bullet
  moveBullet();
}

function checkCollision(x, y) {
  const elements = document.elementsFromPoint(x, y);

  // Iterate through the elements to find the first non-bullet element
  for (const element of elements) {
    if (element.classList.contains('bullet')) {
      continue;
    }

    return element;
  }

  return null;
}

window.addEventListener('keydown', (e) => {
  sequence.push(e.code);
  sequence.splice(-secretCode.length - 1, sequence.length - secretCode.length);

  if (sequence.join('') === secretCode.join('')) {
    createSquare();
  }

  // Track pressed keys
  keysPressed[e.code] = true;
});

window.addEventListener('keyup', (e) => {
  // Release keys
  keysPressed[e.code] = false;
});

// Clear shooting interval when the square is removed
document.addEventListener('DOMNodeRemoved', (event) => {
  if (event.target.id === 'square') {
    clearInterval(shootingInterval);
  }
});
