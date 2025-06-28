document.addEventListener("DOMContentLoaded", () => {
    // DÜZELTME 1: Eleman artık doğru komut olan querySelector ile bulunuyor. Çökme sorunu çözüldü.
    const boardContainer = document.querySelector(".board-container"); 
    const canvas = document.getElementById("game-board");
    const ctx = canvas.getContext("2d");
    const scoreElement = document.getElementById("score");
    const overlay = document.getElementById("overlay");
    const overlayText = document.getElementById("overlay-text");
    const restartButton = document.getElementById("restart-button");

    const GRID_SIZE = 20;
    canvas.width = 500;
    canvas.height = 500;
    const TILE_SIZE = canvas.width / GRID_SIZE;
    
    let snake, food, direction, score, isGameOver, gameStarted, gameLoopTimeout;

    function setupGame() {
        isGameOver = false;
        gameStarted = false; 
        snake = [{ x: 10, y: 10 }];
        direction = { x: 0, y: 0 };
        score = 0;
        scoreElement.textContent = "0";
        
        // Oyunun başında, yön seçimiyle başlanacağı için buton gizlenir.
        overlayText.textContent = "Başlamak için yön seçin";
        restartButton.classList.add("hidden"); 
        overlay.classList.remove("hidden");
        
        spawnFood();
        draw();
        
        if (gameLoopTimeout) clearTimeout(gameLoopTimeout);
    }

    function gameLoop() {
        if (isGameOver) return;
        
        if (moveSnake()) {
            draw();
            gameLoopTimeout = setTimeout(gameLoop, 120 - (Math.floor(score / 5) * 5));
        } else {
            endGame();
        }
    }
    
    function moveSnake() {
        if (direction.x === 0 && direction.y === 0) return true;
        const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };
        if (isCollision(head)) return false;

        snake.unshift(head);
        
        if (head.x === food.x && head.y === food.y) {
            score++;
            scoreElement.textContent = score;
            spawnFood();
        } else {
            snake.pop();
        }
        return true;
    }

    function isCollision(head) {
        return (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE ||
               snake.some(segment => segment.x === head.x && segment.y === head.y));
    }

    function draw() {
        const bodyStyles = getComputedStyle(document.body);
        const bgColor = bodyStyles.getPropertyValue('--renk-ikincil-arkaplan') || '#000'; // Güvenlik için varsayılan renk
        const snakeColor = bodyStyles.getPropertyValue('--renk-vurgu') || '#00FF00';
        const foodColor = bodyStyles.getPropertyValue('--renk-hata') || '#FF0000';
        
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = snakeColor;
        snake.forEach(segment => ctx.fillRect(segment.x * TILE_SIZE, segment.y * TILE_SIZE, TILE_SIZE - 1, TILE_SIZE - 1));
        
        ctx.fillStyle = foodColor;
        ctx.fillRect(food.x * TILE_SIZE, food.y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
    }
    
    function spawnFood() {
        do { food = { x: Math.floor(Math.random() * GRID_SIZE), y: Math.floor(Math.random() * GRID_SIZE) };
        } while (snake.some(segment => segment.x === food.x && segment.y === food.y));
    }
    
    function endGame() {
        isGameOver = true;
        clearTimeout(gameLoopTimeout);
        overlayText.innerHTML = `Oyun Bitti! <br>Skor: ${score}`;
        
        // DÜZELTME 2: Oyun bittiğinde butonun yazısı "Tekrar Oyna" olarak ayarlanıyor.
        restartButton.textContent = "Tekrar Oyna";
        restartButton.classList.remove("hidden");
        overlay.classList.remove("hidden");
    }

    function handleInput(dx, dy) {
        if (isGameOver) return;
        const newDirection = { x: dx, y: dy };
        if (gameStarted && (direction.x === -newDirection.x && direction.y === -newDirection.y)) return;
        direction = newDirection;
        if (!gameStarted) {
            gameStarted = true;
            overlay.classList.add('hidden');
            gameLoop();
        }
    }
    
    document.addEventListener("keydown", e => {
        switch (e.key) {
            case "ArrowUp": case "w": e.preventDefault(); handleInput(0, -1); break;
            case "ArrowDown": case "s": e.preventDefault(); handleInput(0, 1); break;
            case "ArrowLeft": case "a": handleInput(-1, 0); break;
            case "ArrowRight": case "d": handleInput(1, 0); break;
        }
    });

    let touchStartX = 0, touchStartY = 0;
    // Mobil kontrol dinleyicisinin 'boardContainer'da olması doğru.
    boardContainer.addEventListener('touchstart', e => { 
        if(isGameOver) return;
        e.preventDefault(); 
        touchStartX = e.touches[0].clientX; 
        touchStartY = e.touches[0].clientY; 
    }, { passive: false });

    boardContainer.addEventListener('touchend', e => {
        if (touchStartX === 0 || isGameOver) return;
        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;
        const deltaX = touchEndX - touchStartX;
        const deltaY = touchEndY - touchStartY;
        touchStartX = 0;
        if (Math.max(Math.abs(deltaX), Math.abs(deltaY)) < 30) return;
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            handleInput(deltaX > 0 ? 1 : -1, 0);
        } else {
            handleInput(0, deltaY > 0 ? 1 : -1);
        }
    }, { passive: false });

    restartButton.addEventListener('click', setupGame);
    setupGame();
});