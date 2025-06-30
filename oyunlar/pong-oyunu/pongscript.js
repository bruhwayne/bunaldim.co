document.addEventListener('DOMContentLoaded', () => {

    // --- DOM Elementlerini Seçme ---
    const canvas = document.getElementById('pongCanvas');
    if (!canvas) return; // Eğer canvas yoksa scripti durdur
    const ctx = canvas.getContext('2d');
    
    const player1ScoreElem = document.getElementById('player1-score');
    const player2ScoreElem = document.getElementById('player2-score');
    
    const startScreen = document.getElementById('startScreen');
    const endScreen = document.getElementById('endScreen');
    const winnerText = document.getElementById('winnerText');
    
    const playerVsCpuBtn = document.getElementById('playerVsCpuBtn');
    const playerVsPlayerBtn = document.getElementById('playerVsPlayerBtn');
    const restartBtn = document.getElementById('restartBtn');

    // --- Oyun Ayarları ---
    const winningScore = 5;
    let gameMode = ''; // 'cpu' veya 'player'
    let gameRunning = false;
    let animationFrameId;
    // DÜZELTME: Sayı sonrası bekleme için değişken
    let ballIsMoving = true;

    // --- Tasarım ve Renkler ---
    const paddleWidth = 12, paddleHeight = 100;
    const styles = getComputedStyle(document.documentElement);
    const player1Color = styles.getPropertyValue('--renk-vurgu').trim() || '#6366f1';
    const player2Color = '#ff6347';
    
    // --- Oyun Nesneleri ---
    const player1 = {
        x: 10,
        y: canvas.height / 2 - paddleHeight / 2,
        width: paddleWidth,
        height: paddleHeight,
        color: player1Color,
        score: 0
    };

    const player2 = {
        x: canvas.width - paddleWidth - 10,
        y: canvas.height / 2 - paddleHeight / 2,
        width: paddleWidth,
        height: paddleHeight,
        color: player2Color,
        score: 0
    };

    const ball = {
        x: canvas.width / 2,
        y: canvas.height / 2,
        radius: 8,
        speed: 5,
        velocityX: 5,
        velocityY: 5,
        color: '#ffffff' // Bu render sırasında güncellenecek
    };

    // --- Çizim Fonksiyonları ---
    function drawRect(x, y, w, h, color) {
        ctx.fillStyle = color;
        ctx.fillRect(x, y, w, h);
    }

    function drawCircle(x, y, r, color) {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2, false);
        ctx.closePath();
        ctx.fill();
    }

    function drawNet(color) {
        ctx.beginPath();
        ctx.setLineDash([10, 10]);
        ctx.moveTo(canvas.width / 2, 0);
        ctx.lineTo(canvas.width / 2, canvas.height);
        ctx.strokeStyle = color;
        ctx.lineWidth = 4;
        ctx.stroke();
        ctx.setLineDash([]);
    }

    // --- Oyun Mantığı ---
    function resetBall() {
        // DÜZELTME: Sayı sonrası bekleme mantığı
        ballIsMoving = false; // Topu durdur
        const lastWinnerVelocityX = ball.velocityX; // Son yönü sakla

        ball.x = canvas.width / 2;
        ball.y = canvas.height / 2;
        ball.speed = 5;

        // 1 saniye sonra oyunu devam ettir
        setTimeout(() => {
            ball.velocityX = -lastWinnerVelocityX; // Yönü ters çevirerek servis at
            ball.velocityY = 5; // Düz bir açıyla başla
            ballIsMoving = true;
        }, 1000); 
    }
    
    function collision(b, p) {
        b.top = b.y - b.radius;
        b.bottom = b.y + b.radius;
        b.left = b.x - b.radius;
        b.right = b.x + b.radius;
        p.top = p.y;
        p.bottom = p.y + p.height;
        p.left = p.x;
        p.right = p.x + p.width;
        return b.right > p.left && b.bottom > p.top && b.left < p.right && b.top < p.bottom;
    }

    // --- KLAVYE KONTROLLERİ ---
    const keysPressed = {};
    document.addEventListener('keydown', (e) => {
        keysPressed[e.key.toLowerCase()] = true;
    });
    document.addEventListener('keyup', (e) => {
        delete keysPressed[e.key.toLowerCase()];
    });

    function updatePlayer1WithKeyboard() {
        const speed = 6;
        if (keysPressed['w']) player1.y -= speed;
        if (keysPressed['s']) player1.y += speed;

        if (player1.y < 0) player1.y = 0;
        if (player1.y + player1.height > canvas.height) player1.y = canvas.height - player1.height;
    }
    
    function updatePlayer2WithKeyboard() {
        const speed = 6;
        if (keysPressed['arrowup']) player2.y -= speed;
        if (keysPressed['arrowdown']) player2.y += speed;
        
        if (player2.y < 0) player2.y = 0;
        if (player2.y + player2.height > canvas.height) player2.y = canvas.height - player2.height;
    }


    // --- Ana Oyun Döngüsü ---
    function update() {
        updatePlayer1WithKeyboard();

        if (gameMode === 'cpu') {
            let targetY = ball.y - player2.height / 2;
            player2.y += (targetY - player2.y) * 0.06;
            
            if (player2.y < 0) player2.y = 0;
            if (player2.y + player2.height > canvas.height) player2.y = canvas.height - player2.height;

        } else if (gameMode === 'player') {
            updatePlayer2WithKeyboard();
        }

        // DÜZELTME: Top sadece hareket halindeyken pozisyonunu güncelle
        if (ballIsMoving) {
            ball.x += ball.velocityX;
            ball.y += ball.velocityY;
        }

        if (ball.y + ball.radius > canvas.height || ball.y - ball.radius < 0) {
            ball.velocityY = -ball.velocityY;
        }

        let player = (ball.x < canvas.width / 2) ? player1 : player2;
        if (collision(ball, player)) {
            let collidePoint = (ball.y - (player.y + player.height / 2)) / (player.height / 2);
            let angleRad = (Math.PI / 4) * collidePoint;
            let direction = (ball.x < canvas.width / 2) ? 1 : -1;
            
            ball.velocityX = direction * ball.speed * Math.cos(angleRad);
            ball.velocityY = ball.speed * Math.sin(angleRad);
            ball.speed += 0.15;
        }

        if (ball.x - ball.radius < 0) {
            player2.score++;
            updateScores();
            resetBall();
        } else if (ball.x + ball.radius > canvas.width) {
            player1.score++;
            updateScores();
            resetBall();
        }
        
        checkWinner();
    }
    
    function updateScores() {
        player1ScoreElem.textContent = player1.score;
        player2ScoreElem.textContent = player2.score;
    }

    function checkWinner() {
        if (player1.score >= winningScore || player2.score >= winningScore) {
            gameRunning = false;
            cancelAnimationFrame(animationFrameId);
            winnerText.textContent = `${player1.score > player2.score ? "1. Oyuncu" : "2. Oyuncu"} Kazandı!`;
            endScreen.classList.remove('hidden');
        }
    }

    function render() {
        // DÜZELTME: Temaya göre renkleri belirle
        const isLightTheme = document.body.classList.contains('light-theme');
        const bgColor = isLightTheme ? '#f3f4f6' : styles.getPropertyValue('--renk-ikincil-arkaplan').trim() || '#1e1e1e';
        const netColor = isLightTheme ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.2)';
        ball.color = isLightTheme ? '#121212' : '#ffffff';

        drawRect(0, 0, canvas.width, canvas.height, bgColor);
        drawNet(netColor);
        drawRect(player1.x, player1.y, player1.width, player1.height, player1.color);
        drawRect(player2.x, player2.y, player2.width, player2.height, player2.color);
        drawCircle(ball.x, ball.y, ball.radius, ball.color);
    }
    
    function gameLoop() {
        if (!gameRunning) return;
        update();
        render();
        animationFrameId = requestAnimationFrame(gameLoop);
    }
    
    // --- Oyun Yönetimi ---
    function startGame(mode) {
        gameMode = mode;
        gameRunning = true;
        ballIsMoving = true;
        startScreen.classList.add('hidden');
        endScreen.classList.add('hidden');
        
        player1.score = 0;
        player2.score = 0;
        updateScores();
        
        player1.y = canvas.height / 2 - paddleHeight / 2;
        player2.y = canvas.height / 2 - paddleHeight / 2;

        ball.x = canvas.width / 2;
        ball.y = canvas.height / 2;
        ball.velocityX = 5;
        
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
        gameLoop();
    }
    
    // --- Buton Eventleri ---
    playerVsCpuBtn.addEventListener('click', () => startGame('cpu'));
    playerVsPlayerBtn.addEventListener('click', () => startGame('player'));
    restartBtn.addEventListener('click', () => {
         endScreen.classList.add('hidden');
         startScreen.classList.remove('hidden');
    });
});
