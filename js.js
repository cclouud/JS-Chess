const letras = ["A", "B", "C", "D", "E", "F", "G", "H"]

function crearTab() {
    for (let i = 8; i > 0; i--) {
        for (let j = 0; j < 8; j++) {
            document.querySelector(".tab").innerHTML +=
            `<div class="${(i + j) % 2 == 1 ? "even" : "odd"}" 
                  id="${letras[j]}${i}">
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
}

const initPos = [
    [pieces.rookB, pieces.knightB, pieces.bishopB, pieces.queenB, pieces.kingB, pieces.bishopB, pieces.knightB, pieces.rookB], 
    [pieces.pawnB, pieces.pawnB, pieces.pawnB, pieces.pawnB, pieces.pawnB, pieces.pawnB, pieces.pawnB, pieces.pawnB],           
    ["", "", "", "", "", "", "", ""],                                                 
    ["", "", "", "", "", "", "", ""],                                                 
    ["", "", "", "", "", "", "", ""],                                                 
    ["", "", "", "", "", "", "", ""],                                                 
    [pieces.pawnW, pieces.pawnW, pieces.pawnW, pieces.pawnW, pieces.pawnW, pieces.pawnW, pieces.pawnW, pieces.pawnW],         
    [pieces.rookW, pieces.knightW, pieces.bishopW, pieces.queenW, pieces.kingW, pieces.bishopW, pieces.knightW, pieces.rookW]  
]

let tab = null

// Estado del juego y UI
let currentTurn = 'white'
let selectedPiece = null;
let selectedCell = null;
let timerInterval = null
let remainingSeconds = 120
let timerElems = { white: null, black: null }
let capturedElems = { white: null, black: null }
let endTurnBtn = null
let endTurnBtnMobile = null
let isPromoting = false
let gameOver = false
let aiEnabled = false
const aiColor = 'black'
const aiDelayMs = 400

function initGame() {
    tab = document.getElementById("tablero")
    const tw = document.getElementById('timer-white')
    const tb = document.getElementById('timer-black')
    const cw = document.getElementById('captured-by-white')
    const cb = document.getElementById('captured-by-black')
    const btn = document.getElementById('end-turn')
    const btnm = document.getElementById('end-turn-mobile')
    const toggleAi = document.getElementById('toggle-ai')

    if (tw) timerElems.white = tw
    if (tb) timerElems.black = tb
    if (cw) capturedElems.white = cw
    if (cb) capturedElems.black = cb
    if (btn) {
        endTurnBtn = btn
        endTurnBtn.addEventListener('click', () => {
            clearSelection()
            switchTurn()
        })
    }
    if (btnm) {
        endTurnBtnMobile = btnm
        endTurnBtnMobile.addEventListener('click', () => {
            clearSelection()
            switchTurn()
        })
    }

    if (toggleAi) {
        toggleAi.addEventListener('change', (e) => {
            aiEnabled = !!e.target.checked
            if (aiEnabled && currentTurn === aiColor && !gameOver && !isPromoting) {
                scheduleAIMove()
            }
        })
    }

    // Inicia turno de blancas
    startTurn('white')
}

function startTurn(color) {
    currentTurn = color
    remainingSeconds = 120
    updateTimersDisplay()
    if (timerInterval) clearInterval(timerInterval)
    timerInterval = setInterval(() => {
        remainingSeconds--
        updateTimersDisplay()
        if (remainingSeconds <= 0) {
            switchTurn()
        }
    }, 1000)
    if (endTurnBtn) endTurnBtn.disabled = false
    if (endTurnBtnMobile) endTurnBtnMobile.disabled = false

    if (aiEnabled && currentTurn === aiColor && !gameOver && !isPromoting) {
        scheduleAIMove()
    }
}

function formatTime(totalSeconds) {
    const m = Math.floor(totalSeconds / 60)
    const s = totalSeconds % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

function updateTimersDisplay() {
    if (!timerElems.white || !timerElems.black) return
    if (currentTurn === 'white') {
        timerElems.white.textContent = formatTime(remainingSeconds)
        timerElems.black.textContent = '02:00'
    } else {
        timerElems.black.textContent = formatTime(remainingSeconds)
        timerElems.white.textContent = '02:00'
    }
}

function switchTurn() {
    if (timerInterval) clearInterval(timerInterval)
    currentTurn = currentTurn === 'white' ? 'black' : 'white'
    remainingSeconds = 120
    updateTimersDisplay()
    startTurn(currentTurn)
}

function clearSelection() {
    if (selectedCell) {
        selectedCell.style.backgroundColor = ''
    }
    selectedPiece = null
    selectedCell = null
}

function addCapturedPiece(imgElem, byColor) {
    const clone = imgElem.cloneNode(false)
    clone.removeAttribute('draggable')
    const container = byColor === 'white' ? capturedElems.white : capturedElems.black
    if (container) container.appendChild(clone)
}

function endGame(winnerColor) {
    if (timerInterval) clearInterval(timerInterval)
    gameOver = true
    if (endTurnBtn) endTurnBtn.disabled = true
    if (endTurnBtnMobile) endTurnBtnMobile.disabled = true
    alert(`Ganan ${winnerColor === 'white' ? 'blancas' : 'negras'}`)
}

function getPieceAssetSrc(type, color) {
    const colorCode = color === 'white' ? 'W' : 'B'
    return `img/${type}${colorCode}.svg`
}

function showPromotionModal(color, onPick) {
    const modal = document.getElementById('promotion-modal')
    if (!modal) { onPick && onPick('Queen'); return }
    const setSrc = (id, type) => {
        const el = document.getElementById(id)
        if (el) {
            el.src = getPieceAssetSrc(type, color)
        }
    }
    setSrc('promo-queen', 'Queen')
    setSrc('promo-rook', 'Rook')
    setSrc('promo-bishop', 'Bishop')
    setSrc('promo-knight', 'Knight')

    const cleanup = () => {
        ;['promo-queen','promo-rook','promo-bishop','promo-knight'].forEach(id => {
            const el = document.getElementById(id)
            if (el) {
                el.replaceWith(el.cloneNode(true))
            }
        })
    }

    const attach = (id, type) => {
        const el = document.getElementById(id)
        if (!el) return
        el.addEventListener('click', () => {
            modal.classList.add('hidden')
            isPromoting = false
            cleanup()
            onPick && onPick(type)
        }, { once: true })
    }

    isPromoting = true
    modal.classList.remove('hidden')
    attach('promo-queen', 'Queen')
    attach('promo-rook', 'Rook')
    attach('promo-bishop', 'Bishop')
    attach('promo-knight', 'Knight')
}

function colocarPiezas() {
    for (let fila = 0; fila < initPos.length; fila++) {
        for (let col = 0; col < initPos[fila].length; col++) {
            const pieza = initPos[fila][col]; 
            const indice = fila * 8 + col; 
            const celda = tab.children[indice];

            if (pieza) {
                const obj = Object.entries(pieces).find(([key, value]) => value == pieza)
                celda.innerHTML = obj[1];

                const img = celda.querySelector("img");
                img.addEventListener("click", handlePieceClick);
            }
            celda.addEventListener("click", handleCellClick);
        }
    }   
}


function handlePieceClick(event) {
    if (gameOver || isPromoting) return
    event.stopPropagation();
    const clickedPiece = event.target;
    const cell = clickedPiece.parentElement;
    const info = getPieceInfo(clickedPiece)
    if (selectedPiece) {
        const selectedInfo = getPieceInfo(selectedPiece)
        if (info.color === selectedInfo.color) {
            if (selectedCell) selectedCell.style.backgroundColor = ''
            selectedPiece = clickedPiece
            selectedCell = cell
            cell.style.backgroundColor = '#ffffaa'
            return
        }
        // Pieza enemiga: intentar capturar
        handleCellClick(event);
        return;
    }
    // Sin pieza seleccionada, solo permitir seleccionar si es del turno actual
    if (info.color !== currentTurn) {
        return
    }

    if (selectedCell) {
        selectedCell.style.backgroundColor = '';
    }

    selectedPiece = clickedPiece;
    selectedCell = cell;
    cell.style.backgroundColor = '#ffffaa';
}

function handleCellClick(event) {
    if (gameOver || isPromoting) return
    const targetCell = event.target.tagName === 'IMG' ? event.target.parentElement : event.target;

    if (!selectedPiece) {
        return;
    }
    const movingInfo = getPieceInfo(selectedPiece)
    if (movingInfo.color !== currentTurn) {
        return
    }

    if (selectedPiece && targetCell.tagName === "DIV") {
        const sourceCell = selectedCell;

        if (isMoveLegalRespectingCheck(sourceCell, targetCell, currentTurn)) {
            const targetImg = targetCell.querySelector('img')
            if (targetImg) {
                const info = getPieceInfo(targetImg)
                addCapturedPiece(targetImg, currentTurn)
                targetCell.innerHTML = ''
                if (info.type === 'King') {
                    targetCell.appendChild(selectedPiece)
                    clearSelection()
                    endGame(currentTurn)
                    return
                }
            }
            targetCell.appendChild(selectedPiece);

            // Promoción de peón
            const movedInfo = getPieceInfo(selectedPiece)
            const [endRow] = getPosition(targetCell)
            const reachedBackRank = (movedInfo.color === 'white' && endRow === 8) || (movedInfo.color === 'black' && endRow === 1)
            if (movedInfo.type === 'Pawn' && reachedBackRank) {
                showPromotionModal(movedInfo.color, (typePicked) => {
                    const img = targetCell.querySelector('img')
                    if (img) {
                        img.src = getPieceAssetSrc(typePicked, movedInfo.color)
                        // Asegurar handler de click
                        img.replaceWith(img.cloneNode(true))
                        const newImg = targetCell.querySelector('img')
                        if (newImg) newImg.addEventListener('click', handlePieceClick)
                    }
                    clearSelection()
                    if (!evaluateGameStateAfterMove(movedInfo.color)) {
                        switchTurn()
                    }
                })
            } else {
                clearSelection()
                if (!evaluateGameStateAfterMove(movedInfo.color)) {
                    switchTurn()
                }
            }
        }

        clearSelection()
    }
}

function getPosition(cell) {
    const id = cell.id;
    const col = letras.indexOf(id[0]);
    const row = parseInt(id[1]);
    return [row, col];
}

function getCellId(row, col) {
    return `${letras[col]}${row}`;
}

function getPieceInfo(img) {
    const src = img.src;
    const filename = src.split('/').pop();
    const base = filename.replace('.svg', '')
    const color = base.endsWith('B') ? 'black' : 'white'
    const type = base.replace(/[BW]$/, '')
    
    return {
        type: type,
        color: color
    };
}

function isValidPawnMove(start, end, piece) {
    const [startRow, startCol] = start;
    const [endRow, endCol] = end;

    if (startCol !== endCol) {
        if (Math.abs(startCol - endCol) === 1) {
            const targetCell = document.getElementById(getCellId(endRow, endCol));
            const hasEnemyPiece = targetCell.querySelector('img') !== null;
            
            if (piece.color === 'white') {
                return endRow === startRow + 1 && hasEnemyPiece;
            } else {
                return endRow === startRow - 1 && hasEnemyPiece;
            }
        }
        return false;
    }

    const targetCell = document.getElementById(getCellId(endRow, endCol));
    if (targetCell.querySelector('img')) {
        return false;
    }

    if (piece.color === 'white') {
        if (startRow === 2) {
            if (endRow === 4) {
                const intermediateCell = document.getElementById(getCellId(3, startCol));
                return !intermediateCell.querySelector('img');
            }
            return endRow === 3;
        }
        return endRow === startRow + 1;
    } else {
        if (startRow === 7) {
            if (endRow === 5) {
                const intermediateCell = document.getElementById(getCellId(6, startCol));
                return !intermediateCell.querySelector('img');
            }
            return endRow === 6;
        }
        return endRow === startRow - 1;
    }
}

function isValidRookMove(start, end) {
    const [startRow, startCol] = start;
    const [endRow, endCol] = end;
    const isHorizontal = startRow === endRow && startCol !== endCol;
    const isVertical = startCol === endCol && startRow !== endRow;
    return isHorizontal || isVertical;
}

function isValidBishopMove(start, end) {
    const [startRow, startCol] = start;
    const [endRow, endCol] = end;
    const rowDiff = Math.abs(endRow - startRow);
    const colDiff = Math.abs(endCol - startCol);
    return rowDiff === colDiff && rowDiff > 0;
}

function isValidKnightMove(start, end) {
    const rowDiff = Math.abs(start[0] - end[0]);
    const colDiff = Math.abs(start[1] - end[1]);
    return (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2);
}

function isValidQueenMove(start, end) {
    return isValidRookMove(start, end) || isValidBishopMove(start, end);
}

function isValidKingMove(start, end) {
    const rowDiff = Math.abs(start[0] - end[0]);
    const colDiff = Math.abs(start[1] - end[1]);
    return rowDiff <= 1 && colDiff <= 1;
}

function isPathClear(start, end) {
    const [startRow, startCol] = start;
    const [endRow, endCol] = end;
    const rowDir = startRow === endRow ? 0 : (endRow - startRow) / Math.abs(endRow - startRow);
    const colDir = startCol === endCol ? 0 : (endCol - startCol) / Math.abs(endCol - startCol);
    
    let currentRow = startRow + rowDir;
    let currentCol = startCol + colDir;
    
    while (currentRow !== endRow || currentCol !== endCol) {
        const cell = document.getElementById(getCellId(currentRow, currentCol));
        if (cell.querySelector('img')) {
            return false;
        }
        currentRow += rowDir;
        currentCol += colDir;
    }
    
    return true;
}

function isValidMove(startCell, targetCell) {
    const piece = getPieceInfo(selectedPiece);
    const start = getPosition(startCell);
    const end = getPosition(targetCell);
    
    const targetPiece = targetCell.querySelector('img');
    if (targetPiece) {
        const targetInfo = getPieceInfo(targetPiece);
        if (targetInfo.color === piece.color) {
            return false;
        }
    }
    
    let isValid = false;
    
    switch(piece.type) {
        case 'Pawn':
            isValid = isValidPawnMove(start, end, piece);
            break;
        case 'Rook':
            isValid = isValidRookMove(start, end);
            if (isValid) {
                isValid = isPathClear(start, end);
            }
            break;
        case 'Knight':
            isValid = isValidKnightMove(start, end);
            break;
        case 'Bishop':
            isValid = isValidBishopMove(start, end);
            if (isValid) {
                isValid = isPathClear(start, end);
            }
            break;
        case 'Queen':
            isValid = isValidQueenMove(start, end);
            if (isValid) {
                isValid = isPathClear(start, end);
            }
            break;
        case 'King':
            isValid = isValidKingMove(start, end);
            break;
    }
    
    return isValid;
}

// ================== Reglas de jaque/jaque mate ==================
function getKingCell(color) {
    const cells = getAllCells()
    for (const cell of cells) {
        const img = cell.querySelector('img')
        if (!img) continue
        const info = getPieceInfo(img)
        if (info.type === 'King' && info.color === color) return cell
    }
    return null
}

function isKingInCheck(color) {
    const kingCell = getKingCell(color)
    if (!kingCell) return true
    const opponent = color === 'white' ? 'black' : 'white'
    const cells = getAllCells()
    for (const from of cells) {
        const img = from.querySelector('img')
        if (!img) continue
        const info = getPieceInfo(img)
        if (info.color !== opponent) continue
        if (isValidMoveForPiece(from, kingCell, info)) return true
    }
    return false
}

function simulateMoveOnDOM(sourceCell, targetCell, fn) {
    const movingImg = sourceCell.querySelector('img')
    if (!movingImg) return fn()
    const capturedImg = targetCell.querySelector('img')
    if (capturedImg) targetCell.removeChild(capturedImg)
    targetCell.appendChild(movingImg)
    let result
    try {
        result = fn()
    } finally {
        sourceCell.appendChild(movingImg)
        if (capturedImg) targetCell.appendChild(capturedImg)
    }
    return result
}

function isMoveLegalRespectingCheck(sourceCell, targetCell, movingColor) {
    const movingImg = sourceCell.querySelector('img')
    if (!movingImg) return false
    const info = getPieceInfo(movingImg)
    if (info.color !== movingColor) return false
    if (!isValidMoveForPiece(sourceCell, targetCell, info)) return false
    return !simulateMoveOnDOM(sourceCell, targetCell, () => isKingInCheck(movingColor))
}

function hasAnyLegalMove(color) {
    const cells = getAllCells()
    for (const from of cells) {
        const img = from.querySelector('img')
        if (!img) continue
        const info = getPieceInfo(img)
        if (info.color !== color) continue
        for (const to of cells) {
            if (to === from) continue
            if (isMoveLegalRespectingCheck(from, to, color)) return true
        }
    }
    return false
}

function evaluateGameStateAfterMove(movingColor) {
    const opponent = movingColor === 'white' ? 'black' : 'white'
    if (isKingInCheck(opponent) && !hasAnyLegalMove(opponent)) {
        endGame(movingColor)
        return true
    }
    return false
}

// =============== IA (negras) ===============
function isValidMoveForPiece(startCell, targetCell, pieceInfo) {
    const start = getPosition(startCell)
    const end = getPosition(targetCell)

    const targetPieceImg = targetCell.querySelector('img')
    if (targetPieceImg) {
        const targetInfo = getPieceInfo(targetPieceImg)
        if (targetInfo.color === pieceInfo.color) return false
    }

    let valid = false
    switch (pieceInfo.type) {
        case 'Pawn':
            valid = isValidPawnMove(start, end, pieceInfo)
            break
        case 'Rook':
            valid = isValidRookMove(start, end)
            if (valid) valid = isPathClear(start, end)
            break
        case 'Knight':
            valid = isValidKnightMove(start, end)
            break
        case 'Bishop':
            valid = isValidBishopMove(start, end)
            if (valid) valid = isPathClear(start, end)
            break
        case 'Queen':
            valid = isValidQueenMove(start, end)
            if (valid) valid = isPathClear(start, end)
            break
        case 'King':
            valid = isValidKingMove(start, end)
            break
    }
    return valid
}

function pieceCaptureValue(type) {
    switch (type) {
        case 'Pawn': return 1
        case 'Knight': return 3
        case 'Bishop': return 3
        case 'Rook': return 5
        case 'Queen': return 9
        case 'King': return 100
        default: return 0
    }
}

function getAllCells() {
    const cells = []
    for (let i = 0; i < tab.children.length; i++) {
        const c = tab.children[i]
        if (c && c.tagName === 'DIV') cells.push(c)
    }
    return cells
}

function getLegalMovesForColor(color) {
    const cells = getAllCells()
    const moves = []
    for (const cell of cells) {
        const img = cell.querySelector('img')
        if (!img) continue
        const info = getPieceInfo(img)
        if (info.color !== color) continue
        for (const target of cells) {
            if (target === cell) continue
            if (!isMoveLegalRespectingCheck(cell, target, color)) continue
            const targetImg = target.querySelector('img')
            const capVal = targetImg ? pieceCaptureValue(getPieceInfo(targetImg).type) : 0
            moves.push({ fromCell: cell, toCell: target, captureValue: capVal })
        }
    }
    return moves
}

function pickAIMove(color) {
    const legal = getLegalMovesForColor(color)
    if (legal.length === 0) return null
    let bestCap = Math.max(...legal.map(m => m.captureValue))
    const candidates = bestCap > 0 ? legal.filter(m => m.captureValue === bestCap) : legal
    const idx = Math.floor(Math.random() * candidates.length)
    return candidates[idx]
}

function executeAIMove(move) {
    if (!move || gameOver) return
    const sourceCell = move.fromCell
    const targetCell = move.toCell
    const movingImg = sourceCell.querySelector('img')
    if (!movingImg) return

    clearSelection()

    const targetImg = targetCell.querySelector('img')
    if (targetImg) {
        const targetInfo = getPieceInfo(targetImg)
        addCapturedPiece(targetImg, aiColor)
        targetCell.innerHTML = ''
        if (targetInfo.type === 'King') {
            targetCell.appendChild(movingImg)
            clearSelection()
            endGame(aiColor)
            return
        }
    }

    targetCell.appendChild(movingImg)

    const movedInfo = getPieceInfo(movingImg)
    const [endRow] = getPosition(targetCell)
    const reachedBackRank = (movedInfo.color === 'white' && endRow === 8) || (movedInfo.color === 'black' && endRow === 1)
    if (movedInfo.type === 'Pawn' && reachedBackRank) {
        movingImg.src = getPieceAssetSrc('Queen', movedInfo.color)
        // asegurar handler
        movingImg.replaceWith(movingImg.cloneNode(true))
        const newImg = targetCell.querySelector('img')
        if (newImg) newImg.addEventListener('click', handlePieceClick)
    }

    clearSelection()
    if (!evaluateGameStateAfterMove(aiColor)) {
        switchTurn()
    }
}

function scheduleAIMove() {
    setTimeout(() => {
        if (!aiEnabled || gameOver || isPromoting || currentTurn !== aiColor) return
        const move = pickAIMove(aiColor)
        if (!move) {
            // sin movimientos válidos, ceder turno
            switchTurn()
            return
        }
        executeAIMove(move)
    }, aiDelayMs)
}

document.addEventListener("DOMContentLoaded", () => {
    crearTab();
    initGame();
    colocarPiezas();
});


