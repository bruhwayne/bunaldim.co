document.addEventListener('DOMContentLoaded', () => {

    console.log("DOM Yüklendi. Atari script'i başlıyor...");

    // --- DOM Elementleri ---
    const mainContent = document.querySelector('.main-content');
    const emulatorContainer = document.getElementById('emulator-container');
    const mobileGateOverlay = document.querySelector('.mobile-gate-overlay');
    const gameHolder = document.getElementById('game-holder');
    const canvas = document.getElementById('boot-canvas');
    
    // Hata kontrolü: Eğer temel elementler bulunamazsa, kod devam etmesin.
    if (!mainContent || !mobileGateOverlay || !canvas) {
        console.error("KRİTİK HATA: Gerekli HTML elementleri (.main-content, .mobile-gate-overlay, #boot-canvas) bulunamadı! HTML dosyasını kontrol edin.");
        document.body.innerHTML = '<h1 style="color:red; font-family: monospace;">KRİTİK HATA: HTML elementleri eksik. Konsolu (F12) kontrol edin.</h1>';
        return; // Script'i durdur
    }
    
    const ctx = canvas.getContext('2d');
    
    // --- Genel Değişkenler ---
    let allGames = [];
    let favorites = []; // Başlangıçta boş
    let menuState = 'all', selectedIndex = 0, scrollOffset = 0, searchQuery = '', activeGameList = [];
    let vurguRengi = '#6366f1', animationFrameId;
    const isMobile = 'ontouchstart' in window;
    let isEmulatorInitialized = false;

    // DÜZELTME: localStorage'dan veri okumayı güvenli hale getiriyoruz.
    try {
        const storedFavorites = localStorage.getItem('favoriteGames');
        if (storedFavorites) {
            favorites = JSON.parse(storedFavorites);
        }
        console.log("Favoriler localStorage'dan başarıyla okundu:", favorites);
    } catch (e) {
        console.error("localStorage'daki 'favoriteGames' verisi bozuk. Favoriler sıfırlanıyor.", e);
        favorites = []; // Hata durumunda favorileri sıfırla
    }

    // --- Uygulama Başlangıç Noktası ---
    async function main() {
        console.log("main() fonksiyonu çalıştı. Cihaz mobil mi?:", isMobile);
        if (isMobile) {
            setupMobileGate();
        } else {
            console.log("Masaüstü modu algılandı. Ana içerik gösteriliyor.");
            mainContent.style.display = 'flex';
            await initializeEmulator();
        }
    }
    
    function setupMobileGate() {
        console.log("Mobil giriş ekranı (gatekeeper) ayarlanıyor.");
        mobileGateOverlay.style.display = 'flex';
        const gateButton = document.getElementById('gate-button');
        gateButton.addEventListener('click', () => { document.documentElement.requestFullscreen().catch(err => { console.warn("Tam ekran isteği başarısız:", err); }); });
        window.addEventListener('resize', checkMobileConditions);
        document.addEventListener('fullscreenchange', checkMobileConditions);
        checkMobileConditions();
    }
    
    async function checkMobileConditions() {
        if (!isMobile) return;
        const isLandscape = window.innerWidth > window.innerHeight;
        const isFullscreen = !!document.fullscreenElement;
        const gateMessage = document.getElementById('gate-message');
        const gateIcon = document.getElementById('gate-icon');
        const gateButton = document.getElementById('gate-button');

        console.log(`Mobil durum kontrolü: Yan Ekran mı? ${isLandscape}, Tam Ekran mı? ${isFullscreen}`);

        if (isLandscape && isFullscreen) {
            if (!isEmulatorInitialized) {
                console.log("Koşullar sağlandı. Emülatör başlatılıyor.");
                isEmulatorInitialized = true;
                mobileGateOverlay.style.display = 'none';
                mainContent.style.display = 'flex';
                await initializeEmulator();
            }
        } else {
            if (!isLandscape) {
                gateMessage.innerHTML = "Daha iyi bir oyun deneyimi için<br>lütfen ekranınızı yan çevirin.";
                gateIcon.style.display = 'block'; gateButton.style.display = 'none';
            } else {
                gateMessage.textContent = "Harika! Başlatmak için butona dokunun.";
                gateIcon.style.display = 'none'; gateButton.style.display = 'block';
            }
        }
    }

    // --- Emülatör Başlatma Fonksiyonu ---
    async function initializeEmulator() {
        console.log("Emülatör başlatılıyor (initializeEmulator)...");
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        createFullscreenButton();
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        
        if (isMobile) {
            document.body.classList.add('is-mobile', 'gate-passed');
            createMobileControls();
        } else {
            document.addEventListener('keydown', handleDesktopInput);
        }

        try { await new Promise(res => setTimeout(res, 50)); const c = getComputedStyle(document.body).getPropertyValue('--renk-vurgu').trim(); if (c) vurguRengi = c; } catch (e) {}
        try {
            console.log("Oyun listesi (oyunlar.txt) çekiliyor...");
            allGames = await fetchGames();
            console.log("Oyunlar başarıyla çekildi:", allGames.length, "oyun bulundu.");
            updateActiveList();
            await runBootSequence();
            drawMenu();
        } catch (error) {
            console.error("Emülatör başlatılırken ciddi bir hata oluştu:", error);
            drawErrorState(error.message); 
        }
    }

    function handleFullscreenChange() {
        if (document.fullscreenElement) {
            mainContent.classList.add('no-padding');
            emulatorContainer.classList.add('is-fullscreen');
        } else {
            mainContent.classList.remove('no-padding');
            emulatorContainer.classList.remove('is-fullscreen');
        }
        // Tam ekran değişikliğinden sonra canvas'ı yeniden boyutlandır
        setTimeout(resizeCanvas, 100);
    }
    
    // --- GERİ KALAN TÜM FONKSİYONLARINIZ BURADA YER ALIYOR ---
    // (Aşağıdaki kodda bir değişiklik yapmadım, sadece var olduğundan emin olun)
    const navigateUp = () => { selectedIndex = (selectedIndex > 0) ? selectedIndex - 1 : activeGameList.length - 1; updateScroll(); drawMenu(); };
    const navigateDown = () => { selectedIndex = (selectedIndex < activeGameList.length - 1) ? selectedIndex + 1 : 0; updateScroll(); drawMenu(); };
    const selectItem = () => { if (activeGameList.length > 0) launchEmulator(activeGameList[selectedIndex]); };
    const toggleFavorite = () => { if (!activeGameList[selectedIndex]) return; const gameId = activeGameList[selectedIndex].id; const favIndex = favorites.indexOf(gameId); if (favIndex > -1) { favorites.splice(favIndex, 1); } else { favorites.push(gameId); } localStorage.setItem('favoriteGames', JSON.stringify(favorites)); drawMenu(); };
    function handleDesktopInput(e) { e.preventDefault(); switch (e.key) { case 'ArrowUp': navigateUp(); return; case 'ArrowDown': navigateDown(); return; case 'Enter': selectItem(); return; } if (menuState === 'search') { if (e.key === 'Escape') { menuState = 'all'; updateActiveList(); drawMenu(); } else if (e.key === 'Backspace') { searchQuery = searchQuery.slice(0, -1); updateActiveList(); drawMenu(); } else if (e.key.length === 1 && e.key.match(/[a-z0-9 _.-]/i)) { searchQuery += e.key; updateActiveList(); drawMenu(); } } else { switch (e.key) { case 'e': case 'E': toggleFavorite(); break; case 'f': case 'F': menuState = (menuState === 'all') ? 'favorites' : 'all'; updateActiveList(); drawMenu(); break; case 's': case 'S': menuState = 'search'; searchQuery = ''; updateActiveList(); drawMenu(); break; } } }
    async function launchEmulator(game) { if (document.querySelector('.mobile-controls')) document.querySelector('.mobile-controls').style.display = 'none'; document.removeEventListener('keydown', handleDesktopInput); menuState = 'loading'; canvas.style.display = 'block'; await playTheatricalAnimation(3000); drawBlackScreen(); window.EJS_onGameStart = () => { if (animationFrameId) cancelAnimationFrame(animationFrameId); canvas.style.display = 'none'; delete window.EJS_onGameStart; }; gameHolder.style.display = 'block'; window.EJS_player = '#game-holder'; window.EJS_core = game.core; window.EJS_gameUrl = game.path; window.EJS_pathtodata = 'data/'; window.EJS_startOnLoaded = true; const existingScript = document.getElementById('ejs-loader'); if (existingScript) existingScript.remove(); const script = document.createElement('script'); script.id = 'ejs-loader'; script.src = 'data/loader.js'; script.async = true; document.body.appendChild(script); };
    const selectionIcon = new Image(); selectionIcon.src = "images/selection-icon.png";
    function drawMenu() { if (menuState === 'loading') return; const lineHeight = 30, topMargin = 60, sideMargin = 30, iconSize = 20, textPadding = 10; ctx.fillStyle = 'black'; ctx.fillRect(0, 0, canvas.width, canvas.height); ctx.font = '16px "Press Start 2P"'; ctx.fillStyle = vurguRengi; ctx.textAlign = 'left'; let menuTitle = 'TÜM OYUNLAR'; if (menuState === 'favorites') menuTitle = 'FAVORİLER'; else if (menuState === 'search') menuTitle = 'ARAMA'; ctx.fillText(menuTitle, 20, 35); if (!isMobile) { ctx.fillStyle = 'white'; ctx.textAlign = 'right'; ctx.fillText("[F]Favori [S]Ara", canvas.width - 20, 35); } ctx.fillStyle = '#aaa'; ctx.fillRect(10, 45, canvas.width - 20, 2); ctx.textAlign = 'left'; ctx.font = '14px "Press Start 2P"'; if (activeGameList.length === 0) { ctx.fillStyle = '#aaa'; ctx.textAlign = 'center'; if (menuState === 'favorites') { ctx.font = '12px "Press Start 2P"'; ctx.fillText('Favori oyun bulunamadı.', canvas.width / 2, canvas.height / 2 - 10); ctx.fillText("Listeden 'E' tusuna basarak", canvas.width / 2, canvas.height / 2 + 20); ctx.fillText("favori ekleyebilirsiniz.", canvas.width / 2, canvas.height / 2 + 40); } else { ctx.fillText('- BULUNAMADI -', canvas.width / 2, canvas.height / 2); } if (menuState === 'search') { ctx.font = '14px "Press Start 2P"'; ctx.fillText(`ARA: ${searchQuery}_`, canvas.width / 2, canvas.height / 2 + 60); } return; } const itemsOnScreen = Math.floor((canvas.height - topMargin - 50) / lineHeight); const startIndex = scrollOffset; const endIndex = Math.min(scrollOffset + itemsOnScreen, activeGameList.length); for (let i = startIndex; i < endIndex; i++) { const game = activeGameList[i]; const yPos = topMargin + (i - startIndex + 1) * lineHeight; let displayName = game.name.toUpperCase(); if (favorites.includes(game.id)) { displayName = '★ ' + displayName; } if (i === selectedIndex) { ctx.fillStyle = vurguRengi; if (selectionIcon.complete && selectionIcon.naturalHeight > 0) { ctx.drawImage(selectionIcon, sideMargin, yPos - 17, iconSize, iconSize); } else { ctx.fillText('>', sideMargin, yPos); } ctx.fillText(displayName, sideMargin + iconSize + textPadding, yPos); } else { ctx.fillStyle = 'white'; ctx.fillText(displayName, sideMargin + iconSize + textPadding, yPos); } } if (menuState === 'search') { ctx.fillStyle = 'black'; ctx.fillRect(0, canvas.height - 40, canvas.width, 40); ctx.fillStyle = '#aaa'; ctx.fillRect(0, canvas.height - 42, canvas.width, 2); ctx.fillStyle = 'white'; ctx.textAlign = 'left'; ctx.fillText(`ARA: ${searchQuery}_`, 20, canvas.height - 15); } }
    function playTheatricalAnimation(duration) { return new Promise(resolve => { const startTime = Date.now(); function animate() { const elapsedTime = Date.now() - startTime; if (elapsedTime >= duration) { draw(1.0); resolve(); return; } const progress = elapsedTime / duration; draw(progress); animationFrameId = requestAnimationFrame(animate); } function draw(progress) { const barWidth = canvas.width * 0.4, pixelSize = 8, barHeight = pixelSize * 2; const barX = (canvas.width - barWidth) / 2, barY = (canvas.height / 2) + 30; ctx.fillStyle = 'black'; ctx.fillRect(0, 0, canvas.width, canvas.height); ctx.font = '20px "Press Start 2P"'; ctx.fillStyle = '#aaa'; ctx.textAlign = 'center'; ctx.fillText("YÜKLENİYOR", canvas.width / 2, canvas.height / 2); ctx.strokeStyle = vurguRengi; ctx.strokeRect(barX - 1, barY - 1, barWidth + 2, barHeight + 2); const pixelsToDraw = Math.floor((barWidth / pixelSize) * progress); ctx.fillStyle = vurguRengi; for (let i = 0; i < pixelsToDraw; i++) { ctx.fillRect(barX + i * pixelSize, barY, pixelSize, barHeight); } } animate(); }); }
    function drawBlackScreen() { ctx.fillStyle = 'black'; ctx.fillRect(0, 0, canvas.width, canvas.height); }
    function createFullscreenButton() { const button = document.createElement('div'); button.className = 'fullscreen-button'; button.innerHTML = '⛶'; button.title = 'Tam Ekran'; button.addEventListener('click', () => document.fullscreenElement ? document.exitFullscreen() : emulatorContainer.requestFullscreen()); emulatorContainer.appendChild(button); }
    function createMobileControls() { const controlsContainer = document.createElement('div'); controlsContainer.className = 'mobile-controls'; const upBtn = document.createElement('div'); upBtn.className = 'mc-button'; upBtn.innerHTML = '▲'; const selectBtn = document.createElement('div'); selectBtn.className = 'mc-button'; selectBtn.id = 'mc-select'; selectBtn.innerHTML = 'SEÇ'; const downBtn = document.createElement('div'); downBtn.className = 'mc-button'; downBtn.innerHTML = '▼'; upBtn.addEventListener('click', navigateUp); selectBtn.addEventListener('click', selectItem); downBtn.addEventListener('click', navigateDown); controlsContainer.append(upBtn, selectBtn, downBtn); document.body.appendChild(controlsContainer); }
    async function fetchGames() { const response = await fetch("oyunlar.txt"); if (!response.ok) throw new Error("oyunlar.txt dosyası bulunamadı.\nSunucunun çalıştığından ve dosyanın\ndoğru yerde olduğundan emin olun."); return (await response.text()).split("\n").map(f => f.trim()).filter(Boolean).map(createGameObject).filter(Boolean); }
    function createGameObject(filename) { const lower_fn = filename.toLowerCase(); let core = ''; if (lower_fn.endsWith(".nes")) core = 'nes'; else if (lower_fn.endsWith(".smc") || lower_fn.endsWith('.sfc')) core = 'snes'; else return null; const displayName = filename.replace(/\.[^/.]+$/, "").replace(/ \([\s\S]*?\)/g, "").trim(); return { id: filename, name: displayName, path: `roms/${filename}`, core: core }; }
    async function runBootSequence() { ctx.fillStyle = "black"; ctx.fillRect(0, 0, canvas.width, canvas.height); const logo = new Image(); logo.src = "images/pixel-logo.png"; await new Promise(res => { logo.onload = res; logo.onerror = res; }); const logoX = (canvas.width - logo.width) / 2; const logoY = (canvas.height - logo.height) / 2; ctx.drawImage(logo, logoX, logoY); await new Promise(res => setTimeout(res, 2500)); }
    function resizeCanvas() { if (!canvas) return; const container = emulatorContainer; if (container.clientWidth === 0 || container.clientHeight === 0) return; canvas.width = container.clientWidth; canvas.height = container.clientHeight; ctx.imageSmoothingEnabled = false; if (menuState !== 'loading') drawMenu(); }
    function drawErrorState(message) { if (animationFrameId) cancelAnimationFrame(animationFrameId); ctx.fillStyle = 'black'; ctx.fillRect(0, 0, canvas.width, canvas.height); ctx.font = '16px "Press Start 2P"'; ctx.fillStyle = 'red'; ctx.textAlign = 'center'; ctx.fillText('HATA!', canvas.width / 2, canvas.height / 2 - 20); ctx.font = '12px "Press Start 2P"'; ctx.fillStyle = 'white'; message.split('\n').forEach((line, index) => ctx.fillText(line, canvas.width / 2, canvas.height / 2 + 20 + (index * 20))); }
    function updateActiveList() { activeGameList = menuState === 'favorites' ? allGames.filter(g => favorites.includes(g.id)) : menuState === 'search' ? allGames.filter(g => g.name.toLowerCase().includes(searchQuery.toLowerCase())) : [...allGames]; selectedIndex = 0; scrollOffset = 0; }
    function updateScroll() { const maxItems = Math.floor((canvas.height - 110) / 30); if (selectedIndex < scrollOffset) { scrollOffset = selectedIndex; } else if (selectedIndex >= scrollOffset + maxItems) { scrollOffset = selectedIndex - maxItems + 1; } }

    // Script'i çalıştır
    main();
});