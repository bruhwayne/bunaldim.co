document.addEventListener("DOMContentLoaded", () => {
    // Gerekli HTML elemanlarını seç
    const nameInput = document.getElementById("name-input");
    const generateButton = document.getElementById("generate-button");
    const resultBox = document.getElementById("result-box");

    let isLoading = false;

    // GÜNCELLENDİ: Metni HTML'e çeviren fonksiyon
    const formatResponseToHTML = (text) => {
        // ***İsim*** -> <strong class="suggested-name">İsim</strong>
        let html = text.replace(/\*\*\*(.*?)\*\*\*/g, '<strong class="suggested-name">$1</strong>');
        // **Başlık** -> <strong>Başlık</strong>
        html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        // Yeni satır -> <br>
        html = html.replace(/\n/g, '<br>');
        return html;
    };

    const generateUsernames = async () => {
        if (isLoading) return;

        const userInput = nameInput.value.trim();
        if (userInput.length < 2) {
            resultBox.innerHTML = '<p class="placeholder">Lütfen en az 2 karakter girin.</p>';
            return;
        }
        
        isLoading = true;
        generateButton.disabled = true;
        resultBox.innerHTML = '<div class="spinner"></div>';

        try {
            // GÜNCELLENDİ: Yapay zekadan isimleri özel formatta istemek için yeni prompt
            const prompt = `Kullanıcının girdiği "${userInput}" temasından ilham alarak, bana detaylı bir karakter ismi analizi ve öneri listesi oluştur. Cevabın şu yapıda olsun:
1.  **Giriş Paragrafı:** Temanın anahtar özelliklerini analiz eden kısa bir giriş yazısı.
2.  **Kategorize Edilmiş Listeler:** Alt kategoriler oluştur. Her kategori başlığını **yalnızca çift yıldız içine al**. Örneğin: **Doğa Temalı**.
3.  **İsim Önerileri:** Her kategorinin altına, isim önerileri listele. Her önerilen ismi ***üçlü yıldız içine al***. Örneğin: ***Aethelgard*** - Anlamı şudur...
4.  **Sonuç Paragrafı:** Kısa bir kapanış yazısı.
Lütfen cevabı akıcı bir metin olarak formatla. Sadece bu metni döndür, başka hiçbir şey ekleme.`;
            
            const payload = {
                contents: [{ role: "user", parts: [{ text: prompt }] }]
            };
            const apiKey = "AIzaSyAKuu4khxQfXb235hWwbXbBIwxz9f4-YEE"; // API anahtarınızı buraya yapıştırın.
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error.message || 'Bir API hatası oluştu');
            }

            const result = await response.json();
            const suggestionsText = result?.candidates?.[0]?.content?.parts?.[0]?.text;
            
            if (suggestionsText) {
                resultBox.innerHTML = `<p>${formatResponseToHTML(suggestionsText)}</p>`;
            } else {
                resultBox.innerHTML = '<p class="placeholder">Yapay zeka bir öneri üretemedi. Tekrar deneyin.</p>';
            }

        } catch (error) {
            console.error("İsim üretilirken hata oluştu:", error);
            resultBox.innerHTML = `<p class="placeholder">Hata: ${error.message}</p>`;
        } finally {
            isLoading = false;
            generateButton.disabled = false;
        }
    };

    generateButton.addEventListener("click", generateUsernames);
    nameInput.addEventListener("keyup", (event) => {
        if (event.key === "Enter") {
            generateUsernames();
        }
    });
});
