document.addEventListener('DOMContentLoaded', () => {

    // Global tema uygulama fonksiyonu
    const applyTheme = (theme) => {
        const body = document.body;
        if (theme === 'light') {
            body.classList.remove('dark-theme');
            body.classList.add('light-theme');
        } else {
            body.classList.remove('light-theme');
            body.classList.add('dark-theme');
        }
        // Sayfadaki tüm tema ikonlarını bulup güncelle
        const themeIcons = document.querySelectorAll('.theme-icon');
        themeIcons.forEach(icon => {
            icon.innerHTML = (theme === 'light') ? '🌙' : '☀️';
        });
    };

    // Sayfa yüklenir yüklenmez temayı uygula
    const savedTheme = localStorage.getItem('theme') || 'dark';
    applyTheme(savedTheme);

    const isHomePage = document.body.id === 'home-page';

    // Ana sayfa DEĞİLSE global header'ı oluştur
    if (!isHomePage) {
        createGlobalHeader();
        document.body.classList.add('has-global-header');
    }

    function createGlobalHeader() {
        const header = document.createElement('header');
        header.className = 'global-header';

        // 1. Logo
        const logoLink = document.createElement('a');
        logoLink.href = '/index.html'; // Ana sayfaya link
        logoLink.className = 'header-logo-link';
        const logoImg = document.createElement('img');
        // YER TUTUCU: Kendi logo dosyanızın yolunu buraya yapıştırın
        logoImg.src = '/favicon.png'; 
        logoImg.alt = 'Site Logosu';
        logoImg.className = 'header-logo-icon';
        logoLink.appendChild(logoImg);
        
        // 2. Sağ Taraftaki Eylemler İçin Konteyner
        const actionsContainer = document.createElement('div');
        actionsContainer.className = 'header-actions';

        // 2a. "Bunaldım!" Butonu
        const boredButton = document.createElement('button');
        boredButton.className = 'header-bored-button';
        boredButton.textContent = 'Bunaldım!';
        boredButton.addEventListener('click', () => {
             const destinations = [
                '/oyunlar/yilan-oyunu/yilan-index.html',
                '/oyunlar/tic-tac-toe/tic-tac-toe-index.html',
                '/oyunlar/tetris-oyunu/tetris-index.html',
                '/oyunlar/hafiza-oyunu/hafiza-index.html',
                '/oyunlar/yazi-oyunu/yazi-index.html',
                '/oyunlar/mayin-tarlasi/mayin-index.html',
                '/atari-salonu/atari-index.html',
                '/acayip-seyler/olum-tarihi/olum-index.html',
                '/acayip-seyler/kristal-kure/kure-index.html',
                '/acayip-seyler/espri-makinesi/espri-index.html',
                '/acayip-seyler/isim-jenerator/generator-index.html',
                '/blog/blog-index.html',
                '/acayip-seyler/sokak-gorunumu/sokak-index.html',
                '/acayip-seyler/hikaye-tamamlayici/hikaye-index.html',
                '/acayip-seyler/ruya-yorumlayici/ruya-index.html',
                '/oyunlar/pong-oyunu/pong-index.html',
                
            ];
            const currentPath = window.location.pathname;
            let availableDestinations = destinations.filter(dest => dest !== currentPath);
            if (availableDestinations.length === 0) {
                availableDestinations = destinations;
            }
            const randomDestination = availableDestinations[Math.floor(Math.random() * availableDestinations.length)];
            window.location.href = randomDestination;
        });

        // 2b. Ayarlar Menüsü
        const settingsContainer = document.createElement('div');
        settingsContainer.className = 'settings-menu-container';
        const settingsButton = document.createElement('button');
        settingsButton.className = 'settings-button';
        settingsButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>`;
        const settingsDropdown = document.createElement('div');
        settingsDropdown.className = 'settings-dropdown';
        const themeRow = document.createElement('div');
        themeRow.className = 'theme-switcher-row';
        themeRow.innerHTML = `<span>Tema</span><div class="theme-icon">${savedTheme === 'light' ? '🌙' : '☀️'}</div>`;
        settingsDropdown.appendChild(themeRow);
        settingsContainer.appendChild(settingsButton);
        settingsContainer.appendChild(settingsDropdown);

        settingsButton.addEventListener('click', (e) => {
            e.stopPropagation();
            settingsDropdown.classList.toggle('active');
        });
        themeRow.addEventListener('click', (e) => {
            e.stopPropagation();
            let newTheme = document.body.classList.contains('light-theme') ? 'dark' : 'light';
            localStorage.setItem('theme', newTheme);
            applyTheme(newTheme);
        });
        window.addEventListener('click', () => {
            if (settingsDropdown.classList.contains('active')) {
                settingsDropdown.classList.remove('active');
            }
        });

        // Tüm elemanları birleştir
        actionsContainer.appendChild(boredButton);
        actionsContainer.appendChild(settingsContainer);
        header.appendChild(logoLink);
        header.appendChild(actionsContainer);

        document.body.prepend(header);
    }
});
