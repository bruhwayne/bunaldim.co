document.addEventListener('DOMContentLoaded', () => {

    // --- Ana Sayfa Butonları ---
    const randomGameBtn = document.getElementById('random-game-btn');
    const allDestinations = [
        'oyunlar/yilan-oyunu/yilan-index.html',
        'oyunlar/tic-tac-toe/tic-tac-toe-index.html',
        'oyunlar/tetris-oyunu/tetris-index.html',
        'oyunlar/hafiza-oyunu/hafiza-index.html',
        'oyunlar/yazi-oyunu/yazi-index.html',
        'oyunlar/mayin-tarlasi/mayin-index.html',
        'atari-salonu/atari-index.html',
        'acayip-seyler/olum-tarihi/olum-index.html',
        'acayip-seyler/kristal-kure/kure-index.html',
        'acayip-seyler/espri-makinesi/espri-index.html',
        'acayip-seyler/isim-jenerator/generator-index.html',
        'blog/blog-index.html',
        'acayip-seyler/sokak-gorunumu/sokak-index.html',
        'acayip-seyler/hikaye-tamamlayici/hikaye-index.html',
        'acayip-seyler/ruya-yorumlayici/ruya-index.html'
    ];
    if (randomGameBtn) {
        randomGameBtn.addEventListener('click', () => {
            const randomIndex = Math.floor(Math.random() * allDestinations.length);
            window.location.href = allDestinations[randomIndex];
        });
    }

    // --- Ana Sayfa Ayarlar ve Tema Menüsü Mantığı ---
    const settingsToggleBtn = document.getElementById('settings-toggle-btn');
    const settingsDropdown = document.getElementById('settings-dropdown');
    const themeSwitcherHomepage = document.getElementById('theme-switcher-homepage');

    if (settingsToggleBtn && settingsDropdown) {
        settingsToggleBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Buton tıklamasının pencereyi kapatmasını engelle
            settingsDropdown.classList.toggle('active');
        });
    }
    
    // Dışarı tıklayınca menüyü kapat
    window.addEventListener('click', () => {
        if (settingsDropdown && settingsDropdown.classList.contains('active')) {
            settingsDropdown.classList.remove('active');
        }
    });

    // Ana sayfadaki tema değiştiriciye tıklandığında
    if (themeSwitcherHomepage) {
        themeSwitcherHomepage.addEventListener('click', (e) => {
            e.stopPropagation(); // Tıklamanın menüyü kapatmasını engelle
            let currentTheme = document.body.classList.contains('light-theme') ? 'light' : 'dark';
            let newTheme = currentTheme === 'light' ? 'dark' : 'light';
            localStorage.setItem('theme', newTheme);
            
            // global-script.js içindeki applyTheme fonksiyonuna benzer mantık
            const body = document.body;
            if (newTheme === 'light') {
                body.classList.remove('dark-theme');
                body.classList.add('light-theme');
            } else {
                body.classList.remove('light-theme');
                body.classList.add('dark-theme');
            }
            const themeIcons = document.querySelectorAll('.theme-icon');
            themeIcons.forEach(icon => {
                icon.innerHTML = (newTheme === 'light') ? '🌙' : '☀️';
            });
        });
    }
});
