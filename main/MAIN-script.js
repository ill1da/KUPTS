// Получаем все карточки на странице
const cards = document.querySelectorAll('.card');

// Добавляем обработчики на каждую карточку
cards.forEach(card => {

  let defaultTransform = ''; 

  card.addEventListener('mouseover', () => {
    defaultTransform = card.style.transform; 
  });

  card.addEventListener('mousemove', e => {
    
    let rect = card.getBoundingClientRect();
    let xCenter = rect.left + rect.width / 2;
    let yCenter = rect.top + rect.height / 2;
    
    let dx = e.clientX - xCenter;
    let dy = e.clientY - yCenter;
    
    let tiltX = dy / rect.height * -15;
    let tiltY = dx / rect.width * 30;
    
    card.style.transform = `${defaultTransform} perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;

  });
  
  card.addEventListener('mouseout', () => {
    card.style.transform = defaultTransform; 
  });

});