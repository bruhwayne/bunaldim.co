const cellElements = document.querySelectorAll('[data-cell]');
const boardElement = document.getElementById('board');
const statusText = document.getElementById('status-text');
const modeSelectionScreen = document.getElementById('mode-selection');
const gameContainer = document.getElementById('game-container');
const pvpButton = document.getElementById('pvp-button');
const pvcButton = document.getElementById('pvc-button');
const endGameControls = document.getElementById('end-game-controls');
const playAgainButton = document.getElementById('play-again-button');
const modeSelectButton = document.getElementById('mode-select-button');

const X_CLASS = 'x';
const O_CLASS = 'o';
const WINNING_COMBINATIONS = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
];

let boardState, oTurn, gameIsOver, gameMode;

pvpButton.addEventListener('click', () => selectMode('pvp'));
pvcButton.addEventListener('click', () => selectMode('pvc'));
playAgainButton.addEventListener('click', startGame);
modeSelectButton.addEventListener('click', showModeSelection);

function selectMode(mode) {
    gameMode = mode;
    modeSelectionScreen.classList.add('hidden');
    gameContainer.classList.remove('hidden');
    startGame();
}

function showModeSelection() {
    gameContainer.classList.add('hidden');
    modeSelectionScreen.classList.remove('hidden');
}

function startGame() {
    boardState = Array(9).fill(null);
    oTurn = false;
    gameIsOver = false;
    boardElement.classList.remove('game-over');
    endGameControls.classList.add('invisible');
    statusText.innerText = `Sıradaki: X`;
    cellElements.forEach(cell => {
        cell.classList.remove(X_CLASS, O_CLASS, 'win');
        cell.innerHTML = '';
        cell.removeEventListener('click', handleCellClick);
        cell.addEventListener('click', handleCellClick, { once: true });
    });
}

function handleCellClick(e) {
    if (gameIsOver) return;
    const cell = e.target;
    const cellIndex = [...cellElements].indexOf(cell);
    if (boardState[cellIndex]) return;

    const currentClass = oTurn ? O_CLASS : X_CLASS;
    placeMark(cellIndex, currentClass);

    if (processMoveResult(currentClass)) return;
    
    swapTurns();
    
    if (gameMode === 'pvc' && oTurn && !gameIsOver) {
        statusText.innerText = 'Bilgisayar düşünüyor...';
        boardElement.classList.add('thinking'); // Tahtayı interaktif olmayan hale getir
        setTimeout(() => {
            computerMove();
            boardElement.classList.remove('thinking');
        }, 700); // Rakibin düşündüğünü hissettirmek için küçük bir gecikme
    }
}

function processMoveResult(currentClass) {
    if (checkWin(boardState, currentClass)) {
        endGame(false, currentClass);
        return true; // Oyun bitti
    } else if (isDraw()) {
        endGame(true);
        return true; // Oyun bitti
    }
    return false; // Oyun devam ediyor
}

function endGame(draw, winnerClass = null) {
    gameIsOver = true;
    boardElement.classList.add('game-over');
    endGameControls.classList.remove('invisible');
    if (draw) {
        statusText.innerText = 'Berabere!';
    } else {
        statusText.innerText = `${winnerClass.toUpperCase()} Kazandı!`;
        const winningCombination = WINNING_COMBINATIONS.find(combo =>
            combo.every(index => boardState[index] === winnerClass)
        );
        winningCombination.forEach(index => cellElements[index].classList.add('win'));
    }
}

function computerMove() {
    if (gameIsOver) return;
    const bestMoveIndex = findBestMove(boardState);
    placeMark(bestMoveIndex, O_CLASS);

    if (processMoveResult(O_CLASS)) return;

    swapTurns();
}

function findBestMove(currentBoard) {
    const emptyCells = getEmptyCells(currentBoard);
    // 1. Kazanma hamlesi var mı kontrol et
    for (let index of emptyCells) {
        const tempBoard = [...currentBoard];
        tempBoard[index] = O_CLASS;
        if (checkWin(tempBoard, O_CLASS)) return index;
    }
    // 2. Rakibin kazanma hamlesini engelle
    for (let index of emptyCells) {
        const tempBoard = [...currentBoard];
        tempBoard[index] = X_CLASS;
        if (checkWin(tempBoard, X_CLASS)) return index;
    }
    // 3. Merkezi al
    const center = 4;
    if (emptyCells.includes(center)) return center;
    // 4. Köşeleri al
    const corners = [0, 2, 6, 8].filter(i => emptyCells.includes(i));
    if (corners.length > 0) return corners[Math.floor(Math.random() * corners.length)];
    // 5. Kalan herhangi bir yeri oyna
    return emptyCells[Math.floor(Math.random() * emptyCells.length)];
}

function placeMark(index, classToPlace) {
    boardState[index] = classToPlace;
    const cell = cellElements[index];
    cell.classList.add(classToPlace);
    cell.innerHTML = `<span class="mark">${classToPlace.toUpperCase()}</span>`;
    cell.removeEventListener('click', handleCellClick); // İşaretlenmiş hücreye tekrar tıklamayı önle
}

function swapTurns() { 
    oTurn = !oTurn; 
    statusText.innerText = `Sıradaki: ${oTurn ? 'O' : 'X'}`; 
}
const checkWin = (board, player) => WINNING_COMBINATIONS.some(combo => combo.every(index => board[index] === player));
const isDraw = () => boardState.every(cell => cell !== null);
const getEmptyCells = (board) => board.map((val, index) => val === null ? index : null).filter(v => v !== null);