//холст
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

//размеры
const WIDTH = 1000;
const HEIGHT = 1000;

//размер пикселя
const pixelSize = 1;

//массив пикселей
let pixelsArr = [];

//инициализация
initCanvas();

//функции
function initCanvas(){
    //вычисляем кол-во пикселей
    const totalPixels = WIDTH * HEIGHT / (pixelSize * pixelSize)
    //создаем массив
    pixelsArr = new Array(totalPixels);
    //заполняем пикселями
    for(let i = 0; i < pixelsArr.length; i++){
        //вычисляем координаты
        const y = Math.floor(i / WIDTH);
        const x = i % WIDTH;

        pixelsArr[i] = {
            x,
            y,
            color: "white",
            owner: null
        };
    }
    //устанавливаем размер холста
    canvas.width = WIDTH * pixelSize;
    canvas.height = HEIGHT * pixelSize;
    //отрисовка холста
    rander();
}

function rander(){
    //Очистка холста
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    //размер отрисовки пикселя
    ctx.lineWidth = pixelSize;
    //проходимся по всем пикселям
    for(let i = 0; i < pixelsArr.length; i++){
        //получаем пиксель
        const pixel = pixelsArr[i];
        //цвет заливки
        ctx.fillStyel =pixel.color;
        //рассчет координаты
        const x = pixel.x * pixelSize;
        const y = pixel.y * pixelSize;
        //закрасить пиксель
        ctx.fillRect(x, y, pixelSize, pixelSize)
       //очистка контейнера
       pixelContainer.innerHTML = "";
       //создание элемента - пробег по массиву
        for(let i = 0; i < pixelsArr.length; i++){
            const pixel = pixelsArr[i];
            //создание элемента
            const pixelEI = document.createElement("div");
            pixelEI.classList.add("pixel");
            //установка цвета
            pixelEI.style.backgroundColor = pixel.color;
            //добавление в контейнер
            pixelContainer.appendChild(pixelEI);
        }
    }
}

function buyPixel(x, y){

}

//Обработка событий
canvas.onclick = e => {

}