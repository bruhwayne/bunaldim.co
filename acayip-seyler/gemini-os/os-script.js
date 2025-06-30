document.addEventListener('DOMContentLoaded', () => {
    const terminalBody = document.getElementById('terminal-body');
    const commandInput = document.getElementById('command-input');
    const sendButton = document.getElementById('send-button');

    // Komut geçmişi
    const commandHistory = [];
    let historyIndex = -1;

    // Başlangıç mesajı
    const welcomeMessage = `Gemini OS [Versiyon 1.0]\n(c) bunaldim.co Corporation. Tüm hakları saklıdır.\n\nHoş geldin! Kullanılabilir komutları görmek için 'yardım' yaz.`;
    typewriterEffect(welcomeMessage, 'os-response');

    // Komut gönderme fonksiyonu
    const executeCommand = () => {
        const command = commandInput.value.trim().toLowerCase();
        if (command === '') return;

        // Komutu ekrana yazdır
        appendLine(`> ${command}`, 'user-command');
        
        // Komut geçmişine ekle
        commandHistory.unshift(command);
        historyIndex = -1;
        
        // Komutu işle
        processCommand(command);

        // Input'u temizle
        commandInput.value = '';
    };

    // Komutları işleyen fonksiyon
    const processCommand = (command) => {
        let response = '';
        switch (command) {
            case 'yardım':
                response = `Kullanılabilir komutlar:\n` +
                           `  hakkında      - Bu işletim sistemi hakkında bilgi verir.\n` +
                           `  uygulamalar   - Sitedeki oyunları ve araçları listeler.\n` +
                           `  tarih         - Bugünün tarihini gösterir.\n` +
                           `  saat          - Şu anki saati gösterir.\n` +
                           `  pong          - Pong oyununu açar.\n` +
                           `  tetris        - Tetris oyununu açar.\n` +
                           `  temizle       - Terminal ekranını temizler.`;
                break;
            case 'hakkında':
                response = 'Gemini OS, bunaldim.co için tasarlanmış basit, metin tabanlı bir arayüzdür. Site içinde gezinmeyi eğlenceli hale getirmeyi amaçlar.';
                break;
            case 'uygulamalar':
                response = `Uygulamalar listeleniyor...\n` +
                           `  - /oyunlar/pong/index.html\n` +
                           `  - /oyunlar/tetris-oyunu/tetris-index.html\n` +
                           `  - /oyunlar/yilan-oyunu/yilan-index.html\n` +
                           `  - /acayip-seyler/espri-makinesi/espri-index.html`;
                break;
            case 'tarih':
                response = `Bugünün tarihi: ${new Date().toLocaleDateString('tr-TR')}`;
                break;
            case 'saat':
                response = `Şu anki saat: ${new Date().toLocaleTimeString('tr-TR')}`;
                break;
            case 'pong':
                response = "Pong oyunu yeni sekmede açılıyor...";
                window.open('/oyunlar/pong/index.html', '_blank');
                break;
            case 'tetris':
                response = "Tetris oyunu yeni sekmede açılıyor...";
                window.open('/oyunlar/tetris-oyunu/tetris-index.html', '_blank');
                break;
            case 'temizle':
                terminalBody.innerHTML = '';
                return; // Yanıt yazdırmadan çık
            default:
                response = `Hata: '${command}' adında bir komut bulunamadı.`;
                typewriterEffect(response, 'os-response error');
                return;
        }
        typewriterEffect(response, 'os-response');
    };

    // Yazı yazma efekti
    function typewriterEffect(text, className) {
        const p = document.createElement('p');
        p.className = className;
        terminalBody.appendChild(p);
        
        let i = 0;
        const interval = setInterval(() => {
            if (i < text.length) {
                p.textContent += text.charAt(i);
                i++;
                scrollToBottom();
            } else {
                clearInterval(interval);
            }
        }, 20); // Yazı hızı
    }

    // Ekrana satır ekleme fonksiyonu
    function appendLine(text, className) {
        const p = document.createElement('p');
        p.className = className;
        p.textContent = text;
        terminalBody.appendChild(p);
        scrollToBottom();
    }

    // En alta kaydırma
    function scrollToBottom() {
        terminalBody.scrollTop = terminalBody.scrollHeight;
    }

    // Event Listeners
    sendButton.addEventListener('click', executeCommand);
    commandInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            executeCommand();
        } else if (e.key === 'ArrowUp') {
            if (commandHistory.length > 0) {
                historyIndex = Math.min(historyIndex + 1, commandHistory.length - 1);
                commandInput.value = commandHistory[historyIndex];
            }
        } else if (e.key === 'ArrowDown') {
            if (historyIndex > 0) {
                historyIndex--;
                commandInput.value = commandHistory[historyIndex];
            } else {
                historyIndex = -1;
                commandInput.value = '';
            }
        }
    });

});
