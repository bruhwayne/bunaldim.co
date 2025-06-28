document.addEventListener("DOMContentLoaded", () => {
    // ------ Element Seçimleri ------
    const difficultySelection = document.getElementById("difficulty-selection");
    const gameWrapper = document.getElementById("game-wrapper");
    const boardElement = document.getElementById("board");
    const minesCountElement = document.getElementById("mines-count-display");
    const statusElement = document.getElementById("game-status");
    const changeDifficultyButton = document.getElementById("change-difficulty-button");
    const restartButton = document.getElementById('restart-button');

    // ------ Oyun Değişkenleri ------
    let boardSize, numberOfMines, boardModel;
    let isGameOver, firstClick, flagsPlaced;
    let currentDifficultyKey = 'easy'; // Varsayılan zorluk

    // Her zorluk seviyesi için ayarlar
    const difficulties = {
        easy: { size: 10, mines: 10 },
        medium: { size: 16, mines: 40 },
        hard: { size: 20, mines: 99 }
    };

    // ------ Olay Dinleyicileri ------

    // Zorluk seçim ekranındaki butonlar için olay dinleyicisi
    difficultySelection.addEventListener("click", e => {
        const clickedButton = e.target.closest(".difficulty-btn");
        if (!clickedButton) return;
        currentDifficultyKey = clickedButton.dataset.difficulty;
        
        // Arayüzü değiştir ve oyunu başlat
        difficultySelection.classList.remove("active");
        gameWrapper.classList.add("active");
        startGame();
    });
    
    // Oyun ekranından zorluk seçimine geri dönme
    changeDifficultyButton.addEventListener("click", () => {
        gameWrapper.classList.remove("active");
        difficultySelection.classList.add("active");
    });
    
    // Aynı zorlukta oyunu yeniden başlatma
    restartButton.addEventListener("click", startGame);

    // ------ ANA OYUN FONKSİYONLARI ------
    function startGame() {
        const { size, mines } = difficulties[currentDifficultyKey];
        boardSize = size;
        numberOfMines = mines;
        
        isGameOver = false;
        firstClick = true;
        flagsPlaced = 0;
        
        statusElement.textContent = "🤔";
        updateMinesCount();
        
        // CSS'deki grid boyutunu dinamik olarak ayarla
        document.documentElement.style.setProperty('--board-size', boardSize);
        
        // Hücre bilgilerini tutacak 2D diziyi (modeli) oluştur
        boardModel = Array.from({ length: boardSize }, (_, y) => 
            Array.from({ length: boardSize }, (_, x) => ({
                x, y, isMine: false, isRevealed: false, isFlagged: false, adjacentMines: 0
            }))
        );
        renderBoard(); // HTML'i oluştur
    }

    // Modeli HTML'e döken fonksiyon
    function renderBoard() {
        boardElement.innerHTML = "";
        boardModel.flat().forEach(cellModel => {
            const cellElement = document.createElement("div");
            cellElement.className = "cell";
            // Her hücre için olay dinleyicilerini ata
            cellElement.addEventListener("click", () => handleLeftClick(cellModel));
            cellElement.addEventListener("contextmenu", (e) => { e.preventDefault(); handleRightClick(cellModel); });
            
            // Modele, kendi HTML elementine bir referans ekle
            cellModel.element = cellElement;
            boardElement.appendChild(cellElement);
        });
    }

    // İlk tıklamadan sonra mayınları yerleştirir (ilk tıklamanın mayına denk gelmemesi için)
    function placeMines(initialClickCell) {
        let placedMines = 0;
        while (placedMines < numberOfMines) {
            const x = Math.floor(Math.random() * boardSize);
            const y = Math.floor(Math.random() * boardSize);
            const cell = boardModel[y][x];
            // Eğer hücre zaten mayınsa veya ilk tıklanan hücreyse, başka bir hücre seç
            if (cell.isMine || (cell.x === initialClickCell.x && cell.y === initialClickCell.y)) continue;
            cell.isMine = true;
            placedMines++;
        }
        // Tüm hücrelerin komşu mayın sayılarını hesapla
        boardModel.flat().forEach(cell => {
            if (!cell.isMine) {
                cell.adjacentMines = getAdjacentCells(cell.x, cell.y).filter(c => c.isMine).length;
            }
        });
    }

    // Sol tıklama mantığı
    function handleLeftClick(cell) {
        if (isGameOver || cell.isRevealed || cell.isFlagged) return;
        // Eğer ilk tıklama ise, mayınları yerleştir
        if (firstClick) { placeMines(cell); firstClick = false; }
        // Mayına tıklandıysa, oyunu bitir
        if (cell.isMine) { revealAllMines(cell); endGame(false); return; }
        
        revealCell(cell); // Hücreyi aç
        checkWinCondition(); // Kazanma durumunu kontrol et
    }
    
    // Sağ tıklama mantığı (Bayrak ekleme/kaldırma)
    function handleRightClick(cell) {
        if (isGameOver || cell.isRevealed) return;
        cell.isFlagged = !cell.isFlagged;
        cell.element.classList.toggle('flagged', cell.isFlagged);
        flagsPlaced += cell.isFlagged ? 1 : -1;
        updateMinesCount();
    }
    
    // Hücreleri açan ana fonksiyon (Boşsa komşuları da açar)
    function revealCell(cell) {
        if (cell.isRevealed || cell.isFlagged) return;
        cell.isRevealed = true;
        cell.element.classList.add("revealed");
        
        if (cell.adjacentMines > 0) {
            cell.element.textContent = cell.adjacentMines;
            cell.element.dataset.count = cell.adjacentMines;
        } else {
            // Eğer hücre boşsa, komşularını da küçük bir gecikmeyle aç (stack overflow'u önler)
            setTimeout(() => getAdjacentCells(cell.x, cell.y).forEach(revealCell), 10);
        }
    }

    // Oyunun sonu (kazanma veya kaybetme)
    function endGame(isWin) {
        isGameOver = true;
        statusElement.textContent = isWin ? '🥳 Kazandın!' : '😭 Kaybettin!';
        if (!isWin) revealAllMines();
    }
    
    // Kaybedildiğinde tüm mayınları göster
    function revealAllMines(hitCell = null) {
        boardModel.flat().filter(c => c.isMine).forEach(c => {
            c.element.classList.remove('flagged');
            c.element.classList.add("mine");
            // Tıklanan mayını farklı renkte göster
            if (c === hitCell) c.element.classList.add("mine-hit");
        });
    }
    
    // Kazanma koşulunu kontrol eder (Mayın olmayan tüm hücreler açıldı mı?)
    function checkWinCondition() {
        const revealedCount = boardModel.flat().filter(c => c.isRevealed).length;
        if (revealedCount === (boardSize * boardSize) - numberOfMines) {
            endGame(true);
        }
    }

    // Bir hücrenin 8 komşusunu bulan yardımcı fonksiyon
    function getAdjacentCells(x, y) {
        const adjacent = [];
        for (let yOff = -1; yOff <= 1; yOff++) {
            for (let xOff = -1; xOff <= 1; xOff++) {
                if (xOff === 0 && yOff === 0) continue; // Kendisini atla
                const nx = x + xOff, ny = y + yOff;
                // Sınırların içinde mi kontrol et
                if (nx >= 0 && nx < boardSize && ny >= 0 && ny < boardSize) {
                    adjacent.push(boardModel[ny][nx]);
                }
            }
        }
        return adjacent;
    }
    
    // Kalan mayın sayısını günceller
    function updateMinesCount() { minesCountElement.textContent = `💣 ${numberOfMines - flagsPlaced}`; }
});