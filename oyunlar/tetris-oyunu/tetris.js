document.addEventListener('DOMContentLoaded', () => {
    // ---- Elementler ve Sabitler (Değişiklik yok)----
    const canvas = document.getElementById('tetris-board');
    const ctx = canvas.getContext('2d');
    const startOverlay = document.getElementById('start-game-overlay');
    const startButton = document.getElementById('start-button');
    const gameOverOverlay = document.getElementById('game-over-overlay');
    const gameOverText = document.getElementById('game-over-text');
    const finalRestartButton = document.getElementById('final-restart-button');
    const COLS = 10, ROWS = 20, BLOCK_SIZE = 30;
    const SHAPES = [ [], [[1, 1, 1, 1]], [[2, 2, 2], [0, 2, 0]], [[3, 3, 3], [3, 0, 0]], [[4, 4, 4], [0, 0, 4]], [[5, 5, 0], [0, 5, 5]], [[0, 6, 6], [6, 6, 0]], [[7, 7], [7, 7]] ];
    const COLORS = [ null, '#008516', '#5e0091', '#053bff', '#fbff05', '#fbff05', '#ff1205', '#05daff' ];
    
    // ---- Değişkenler (Değişiklik yok) ----
    let ui = {};
    let board, piece, nextPiece, score, level, linesCleared, gameOver, animationFrameId;
    let lastTime = 0, dropCounter = 0, dropInterval = 1000;
    let isGameRunning = false;
    
    // ---- Oyun Başlatma ve Yönetim (Değişiklik yok)----
    function initializeGame() { startOverlay.classList.add('hidden'); gameOverOverlay.classList.add('hidden'); const isMobile=window.innerWidth<=768; ui={scoreEl: isMobile ? document.getElementById('mobile-score') : document.getElementById('score'), levelEl: isMobile ? document.getElementById('mobile-level') : document.getElementById('level'), nextCanvas: isMobile ? document.getElementById('mobile-next-canvas') : document.getElementById('next-piece-canvas'),}; isGameRunning=true; resetGameLogic();}
    function createPiece() { const id = Math.floor(Math.random() * 7) + 1; return { m: JSON.parse(JSON.stringify(SHAPES[id])), t: id, p: { x: Math.floor(COLS/2 - SHAPES[id][0].length/2), y: 0 } }; }
    function collide(b, p) { return p.m.some((row, y) => row.some((val, x) => val !== 0 && (b[y + p.p.y] && b[y + p.p.y][x + p.p.x]) !== 0)); }
    function merge(b, p) { const c=p.t; p.m.forEach((row, y) => row.forEach((val, x) => { if (val !== 0) b[y+p.p.y][x+p.p.x] = c; })); for(let row=0;row<b.length;row++) for(let col=0;col<b[row].length;col++) if(b[row][col]!==0)b[row][col]=c;}
    function pieceMove(dir) { if(gameOver||!isGameRunning)return; piece.p.x += dir; if(collide(board,piece)) piece.p.x -= dir;}
    function pieceRotate() { if(gameOver||!isGameRunning)return; const pos=piece.p.x; const matrix=JSON.parse(JSON.stringify(piece.m)); let offset=1; piece.m=piece.m[0].map((_,ci)=>piece.m.map(row=>row[ci]).reverse()); while(collide(board,piece)){ piece.p.x+=offset; offset=-(offset+(offset>0?1:-1)); if(Math.abs(offset)>piece.m[0].length+1){piece.m=matrix;piece.p.x=pos;return;}}}
    function pieceDrop(soft=false) { if(gameOver||!isGameRunning)return; piece.p.y++; if(collide(board, piece)) { piece.p.y--; merge(board, piece); sweepBoard(); piece = nextPiece; nextPiece = createPiece(); if(collide(board, piece)) endGame(); } if(!soft) dropCounter = 0;}
    function sweepBoard() { let lines=0; outer: for(let y=board.length-1;y>0;--y){ for(let x=0;x<board[y].length;++x)if(board[y][x]===0)continue outer; const row=board.splice(y,1)[0].fill(0); board.unshift(row); y++; lines++; } if(lines>0){score+=[0,40,100,300,1200][lines]*level; linesCleared+=lines; updateUI();}}
    function endGame() { gameOver = true; isGameRunning = false; gameOverText.textContent = "OYUN BİTTİ"; gameOverOverlay.classList.remove('hidden'); }
    function draw() { const bgColor=getComputedStyle(document.body).getPropertyValue('--renk-ikincil-arkaplan')||'#080808'; ctx.fillStyle=bgColor; ctx.fillRect(0,0,canvas.width,canvas.height); drawMatrix(ctx,board,{x:0,y:0}); drawMatrix(ctx,piece.m,piece.p);}
    function drawMatrix(c, m, o) { const bc = board.flat().find(v=>v>0)||piece.t; m.forEach((r,y)=>r.forEach((v,x)=>{if(v!==0){c.fillStyle=COLORS[m===board?bc:v]; c.fillRect((x+o.x)*BLOCK_SIZE,(y+o.y)*BLOCK_SIZE,BLOCK_SIZE,BLOCK_SIZE);}}));}
    function drawNextPiece() { if(!ui.nextCanvas)return; const nCtx=ui.nextCanvas.getContext('2d'); const s=ui.nextCanvas.width; const bgC=getComputedStyle(document.body).getPropertyValue('--renk-ikincil-arkaplan')||'#080808'; nCtx.fillStyle=bgC; nCtx.fillRect(0,0,s,s); const sc=s/4; const xO=(4-nextPiece.m[0].length)/2; const yO=(4-nextPiece.m.length)/2; nCtx.save(); nCtx.scale(sc,sc); nextPiece.m.forEach((r,y)=>r.forEach((v,x)=>{if(v!==0){nCtx.fillStyle=COLORS[nextPiece.t]; nCtx.fillRect(x+xO,y+yO,1,1);}})); nCtx.restore();}
    function updateUI() { if (!isGameRunning && score === 0) return; level=Math.floor(linesCleared/10)+1; dropInterval=Math.max(150,1000-(level*75)); ui.scoreEl.textContent=score; ui.levelEl.textContent=level; }
    function updateLoop(t=0){ if(!isGameRunning) return; dropCounter+=t-lastTime; lastTime=t; if(dropCounter>dropInterval) pieceDrop(); draw(); drawNextPiece(); animationFrameId=requestAnimationFrame(updateLoop);}
    function resetGameLogic() { if(animationFrameId)cancelAnimationFrame(animationFrameId); board=Array.from({length:ROWS},()=>Array(COLS).fill(0)); score=0; linesCleared=0; gameOver=false; piece=createPiece(); nextPiece=createPiece(); updateUI(); lastTime=0; dropInterval=1000; updateLoop(); }
    
    // --- PC Kontrolü (Değişiklik Yok) ---
    document.addEventListener('keydown', e => { if (!isGameRunning || gameOver) return; if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) e.preventDefault(); switch (e.key) { case 'ArrowLeft': pieceMove(-1); break; case 'ArrowRight': pieceMove(1); break; case 'ArrowUp': pieceRotate(); break; case 'ArrowDown': pieceDrop(true); break; } });
    
    // --- DÜZELTME: YENİ MOBİL KONTROL MEKANİZMASI ---
    let touchStartX = 0, touchStartY = 0;
    let touchStartTime = 0;
    let holdTimer = null, dropIntervalTimer = null;
    let hasSwiped = false;
    const HOLD_THRESHOLD = 200; // ms (Basılı tutma sayılması için gereken süre)
    const SWIPE_THRESHOLD = 30; // px (Kaydırma sayılması için gereken mesafe)
    const DROP_INTERVAL_FAST = 50; // ms (Basılı tutarken düşme hızı)

    canvas.addEventListener('touchstart', e => {
        if (!isGameRunning || gameOver) return;
        e.preventDefault();
        
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        touchStartTime = Date.now();
        hasSwiped = false;
        
        // Basılı tutma eylemini 'holdTimer' ile başlat
        holdTimer = setTimeout(() => {
            // Zamanlayıcı tetiklendiğinde, sürekli aşağı düşürmeyi başlat
            if (!hasSwiped) { // Eğer bu sürede kaydırma olmadıysa
                dropIntervalTimer = setInterval(() => {
                    pieceDrop(true);
                }, DROP_INTERVAL_FAST);
            }
        }, HOLD_THRESHOLD);
        
    }, { passive: false });

    canvas.addEventListener('touchmove', e => {
        if (!isGameRunning || gameOver || !touchStartTime) return;
        e.preventDefault();

        const touchX = e.touches[0].clientX;
        const deltaX = touchX - touchStartX;

        // Yatay kaydırmayı kontrol et
        if (Math.abs(deltaX) > SWIPE_THRESHOLD) {
            hasSwiped = true; // Kaydırma yapıldı, artık bu bir 'tap' değil.
            clearTimeout(holdTimer); // Basılı tutma eylemini iptal et.
            clearInterval(dropIntervalTimer); // Hızlı düşmeyi durdur.
            
            pieceMove(deltaX > 0 ? 1 : -1);
            
            // Başlangıç noktasını güncelle ki sürekli kaydırma yapılabilsin
            touchStartX = touchX;
        }
    }, { passive: false });

    canvas.addEventListener('touchend', e => {
        if (!isGameRunning || gameOver || !touchStartTime) return;
        e.preventDefault();

        // Her durumda tüm zamanlayıcıları temizle
        clearTimeout(holdTimer);
        clearInterval(dropIntervalTimer);

        const touchDuration = Date.now() - touchStartTime;
        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;
        const moveDistance = Math.sqrt(Math.pow(touchEndX - touchStartX, 2) + Math.pow(touchEndY - touchStartY, 2));

        // Eğer kaydırma olmadıysa VE dokunma süresi kısaysa, bunu bir 'tap' (döndürme) olarak kabul et
        if (!hasSwiped && touchDuration < HOLD_THRESHOLD && moveDistance < SWIPE_THRESHOLD) {
            pieceRotate();
        }

        // Değişkenleri sıfırla
        touchStartTime = 0;
    });

    // --- BAŞLANGIÇ ---
    startButton.addEventListener('click', initializeGame);
    finalRestartButton.addEventListener('click', initializeGame);
});