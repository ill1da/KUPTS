let canvas = document.getElementById("canvas");
let cell = document.getElementsByClassName("cell");

let player = "x";
var winIndex = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
    [1, 4, 7],
    [2, 5, 8],
    [3, 6, 9],
    [1, 5, 9],
    [3, 5, 7]
];

for (let i = 1; i <= 9; i++){
    canvas.innerHTML += "<div class='cell' pos=" + i + "></div>"; 
}

for (let i = 0; i < cell.length; i++){
    cell[i].addEventListener("click", cellClick, false);

    cell[i].addEventListener('mouseover', onMouseOver);
    cell[i].addEventListener('mouseout', onMouseOut);
}

//занята ли ячейка - проверка
function cellClick(){
    let data = [];
    if(!this.innerHTML){
        this.innerHTML = player;
    }else{
        alert("Ячейка занята!");
        return;
    }
    //проверка на текущего игрока
    for(var i in cell){
        if (cell[i].innerHTML == player){
            data.push(parseInt(cell[i].getAttribute("pos")));
        }
    }

    //проверка на выигрушную комбинацию
    if(checkWin(data)){
        document.getElementById('message').textContent = `Выиграл: ${player}!`;
        //restart(`Выиграл: ${player}!`);
    }else{
        let draw = true;
        for (var i in cell){
            if(cell[i].innerHTML == "")
                draw = false;
        }
        if(draw){
            document.getElementById('message').textContent = `Ничья`;
            //restart("Ничья");
        }
    }

    player = player == "x" ? "o" : "x";
    console.log(data);
}

function onMouseOver() {
    if (this.innerHTML == "") {
        this.classList.add("cell_hover");
    } else {
        this.classList.add("cell_hover_occupied");
    }
}
function onMouseOut() {
    this.classList.remove("cell_hover");
    this.classList.remove("cell_hover_occupied");
}

function checkWin(data){
    for (let i in winIndex){
        let win = true;
        for (let j in winIndex[i]){
            let id = winIndex[i][j];
            let ind = data.indexOf(id);

            if(ind == -1){
                win = false;
            }
        }
        if(win)
            return true;
    }
    return false;
}



function restart(text){
    alert(text);
    for(let i = 0; i < cell.length; i++){
        cell[i].innerHTML = "";
    }
}
