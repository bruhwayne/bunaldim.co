document.addEventListener('DOMContentLoaded', () => {
    // HTML Elementlerini seçiyoruz
    const getJokeButton = document.getElementById('get-joke-button');
    const jokeContainer = document.getElementById('joke-container');
    const jokeText = document.getElementById('joke-text');

    // Bayrak değişkenleri
    let isJokeLoading = false;

    // Espri üretme fonksiyonu
    const generateAiJoke = async () => {
        if (isJokeLoading) return;

        isJokeLoading = true;
        getJokeButton.disabled = true;
        jokeContainer.classList.add('loading');
        jokeText.innerHTML = '<div class="spinner"></div>Yapay zeka düşünüyor...';
        jokeText.style.opacity = '1';

        try {
            const prompt = "Türkçe, çok komik, kısa ve herkesin anlayabileceği, soğuk olmayan bir espri yap.";
            const payload = {
                contents: [{
                    role: "user",
                    parts: [{ text: prompt }]
                }]
            };
            const apiKey = "AIzaSyAAylhs5oWXwTs6yYtF3Lpt7HcRazlV_Bo"; // API anahtarınızı buraya yapıştırmanız gerekmektedir.
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
            
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                let errorDetails = `API Hatası: ${response.status}`;
                try {
                    const errorData = await response.json();
                    errorDetails += ` - ${errorData.error.message}`;
                } catch (e) {
                    errorDetails += ` - Sunucu hatası ayrıştırılamadı.`;
                }
                throw new Error(errorDetails);
            }

            const result = await response.json();
            const joke = result?.candidates?.[0]?.content?.parts?.[0]?.text;

            jokeContainer.classList.remove('loading');
            
            // Espriyi göstermeden önce bir solma efekti için bekle
            jokeText.style.opacity = '0';
            await new Promise(resolve => setTimeout(resolve, 200));

            if (joke) {
                jokeText.textContent = joke.trim();
            } else {
                console.warn("API cevabı espri içermiyor.", result);
                jokeText.textContent = "İlham perim kaçtı galiba! Tekrar dener misin?";
            }
            
            // Yeni espriyi göster
            jokeText.style.opacity = '1';

        } catch (error) {
            jokeContainer.classList.remove('loading');
            console.error("Espri üretilirken hata oluştu:", error);
            jokeText.textContent = `Bir sorun var: ${error.message}. Lütfen internet bağlantınızı kontrol edip tekrar deneyin.`;
        } finally {
            isJokeLoading = false;
            getJokeButton.disabled = false;
        }
    };

    getJokeButton.addEventListener('click', generateAiJoke);
});
