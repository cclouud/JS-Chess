

const letras = ["A", "B", "C", "D", "E", "F", "G", "H"]


function crearTab() {

    for (let i = 8; i > 0; i--) {
        const lett = letras[7-(i-1)]
        for (let j = 0; j < 8; j++) {
            document.querySelector(".tab").innerHTML +=
            `<div class="${(i + j) % 2 == 1 ? "even" : "odd"}" 
                  id="${lett}${j+1}" 
                  ondragover="handleDragOver(event)" 
                  ondrop="handleDrop(event)">
             </div>`;
        
        }
    }

}



const pieces = {
    bishopB: '<img src="img/BishopB.svg" draggable="true">',
    bishopW: '<img src="img/BishopW.svg" draggable="true">',
    kingB: '<img src="img/KingB.svg" draggable="true">',
    kingW: '<img src="img/KingW.svg" draggable="true">',
    knightB: '<img src="img/KnightB.svg" draggable="true">',
    knightW: '<img src="img/KnightW.svg" draggable="true">',
    pawnB: '<img src="img/PawnB.svg" draggable="true">',
    pawnW: '<img src="img/PawnW.svg" draggable="true">',
    queenB: '<img src="img/QueenB.svg" draggable="true">',
    queenW: '<img src="img/QueenW.svg" draggable="true">',
    rookB: '<img src="img/RookB.svg" draggable="true">',
    rookW: '<img src="img/RookW.svg" draggable="true">'    

};



const initPos = [
    [pieces.rookB, pieces.knightB, pieces.bishopB, pieces.queenB, pieces.kingB, pieces.bishopB, pieces.knightB, pieces.rookB], 
    [pieces.pawnB, pieces.pawnB, pieces.pawnB, pieces.pawnB, pieces.pawnB, pieces.pawnB, pieces.pawnB, pieces.pawnB],           
    ["", "", "", "", "", "", "", ""],                                                 
    ["", "", "", "", "", "", "", ""],                                                 
    ["", "", "", "", "", "", "", ""],                                                 
    ["", "", "", "", "", "", "", ""],                                                 
    [pieces.pawnW, pieces.pawnW, pieces.pawnW, pieces.pawnW, pieces.pawnW, pieces.pawnW, pieces.pawnW, pieces.pawnW],         
    [pieces.rookW, pieces.knightW, pieces.bishopW, pieces.queenW, pieces.kingW, pieces.bishopW, pieces.knightW, pieces.rookW]  
];



const tab = document.getElementById("tablero")




function colocarPiezas() {
    for (let fila = 0; fila < initPos.length; fila++) {
        for (let col = 0; col < initPos[fila].length; col++) {
            const pieza = initPos[fila][col]; 
            const indice = fila * 8 + col; 
            const celda = tablero.children[indice];



            if (pieza) {
             const obj = Object.entries(pieces).find(([key, value]) => value == pieza)
             celda.innerHTML = obj[1];

             const img = celda.querySelector("img");
             img.addEventListener("dragstart", handleDragStart);
            }
        }
    }   
}

let draggedPiece = null;

function handleDragStart(event) {
    draggedPiece = event.target;
}

function handleDragOver(event) {
    event.preventDefault(); 
}

function handleDrop(event) {
    event.preventDefault();
    if (draggedPiece) {
        const targetCell = event.target;
        if (targetCell.tagName === "DIV" && !targetCell.querySelector("img")) {
            targetCell.appendChild(draggedPiece);
            draggedPiece = null;
        }
    }
}






document.addEventListener("DOMContentLoaded", crearTab(), colocarPiezas());


