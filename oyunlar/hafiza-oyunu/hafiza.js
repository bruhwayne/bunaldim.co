document.addEventListener('DOMContentLoaded', () => {
    // ------ Element Seçimleri ------
    const gameBoard = document.querySelector('.game-board');
    const movesCountSpan = document.getElementById('moves-count');
    const restartButton = document.getElementById('restart-button');
    const winMessage = document.getElementById('win-message');

    const symbols = [
        '⚽️', '🏀', '🏈', '🎱', '🥎', '🏐', '🥏', '🏓',
        '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷',
        '🐸', '🐵'
    ];
    
    // ------ Oyunun Durum Değişkenleri ------
    let firstCard = null, secondCard = null;
    let hasFlippedCard = false;
    let lockBoard = false;
    let moves = 0;
    let matchedPairs = 0;

    function startGame() {
        winMessage.classList.add('hidden');
        moves = 0;
        matchedPairs = 0;
        movesCountSpan.innerText = moves;
        lockBoard = false;
        hasFlippedCard = false;
        firstCard = null;
        secondCard = null;

        const shuffledSymbols = [...symbols, ...symbols].sort(() => Math.random() - 0.5);

        gameBoard.innerHTML = shuffledSymbols.map(symbol => `
            <div class="card" data-symbol="${symbol}">
                <div class="card-face card-front">${symbol}</div>
                <div class="card-face card-back"></div>
            </div>
        `).join('');
            
        document.querySelectorAll('.card').forEach(card => card.addEventListener('click', flipCard));
    }

    function flipCard() {
        if (lockBoard || this === firstCard || this.classList.contains('matched')) return;
        this.classList.add('flipped');

        if (!hasFlippedCard) {
            hasFlippedCard = true;
            firstCard = this;
            return;
        }

        secondCard = this;
        updateMoves();
        checkForMatch();
    }

    function checkForMatch() {
        const isMatch = firstCard.dataset.symbol === secondCard.dataset.symbol;
        isMatch ? disableMatchedCards() : unflipWrongCards();
    }

    function disableMatchedCards() {
        firstCard.removeEventListener('click', flipCard);
        secondCard.removeEventListener('click', flipCard);
        firstCard.classList.add('matched');
        secondCard.classList.add('matched');

        matchedPairs++;
        if (matchedPairs === symbols.length) {
            setTimeout(() => {
                winMessage.classList.remove('hidden');
            }, 500);
        }

        resetTurn();
    }

    function unflipWrongCards() {
        lockBoard = true;
        setTimeout(() => {
            firstCard.classList.remove('flipped');
            secondCard.classList.remove('flipped');
            resetTurn();
        }, 1200);
    }

    function resetTurn() {
        hasFlippedCard = false;
        lockBoard = false;
        firstCard = null;
        secondCard = null;
    }
    
    function updateMoves() {
        moves++;
        movesCountSpan.innerText = moves;
    }

    restartButton.addEventListener('click', startGame);
    startGame();
});