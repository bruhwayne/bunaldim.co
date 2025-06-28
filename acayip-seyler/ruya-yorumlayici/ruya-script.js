document.addEventListener('DOMContentLoaded', () => {
    // HTML elementlerini seç
    const dreamInput = document.getElementById('dream-input');
    const interpretButton = document.getElementById('interpret-dream-button');
    const resultContainer = document.getElementById('result-container');

    let isLoading = false;

    // Metindeki temel Markdown formatını HTML'e çeviren basit bir fonksiyon
    const formatResponseToHTML = (text) => {
        let html = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        html = html.replace(/\n/g, '<br>');
        return html;
    };

    const interpretDream = async () => {
        if (isLoading) return;

        const userDream = dreamInput.value.trim();
        if (userDream.length < 15) {
            resultContainer.innerHTML = '<p class="placeholder">Lütfen yorumlamak için en az 15 karakterlik bir rüya anlatın.</p>';
            return;
        }

        isLoading = true;
        interpretButton.disabled = true;
        resultContainer.classList.add('loading');
        resultContainer.innerHTML = '<div class="spinner"></div><p>Rüyanız analiz ediliyor...</p>';

        try {
            // Yapay zeka için istem (prompt)
            const prompt = `Ben bir rüya tabiri uzmanı gibi davran. Kullanıcının anlattığı rüyayı, modern psikoloji ve sembolizm temelinde analiz et. Mistik veya dini yorumlardan kaçın. Analizin şu yapıda olsun:
1.  **Giriş:** Rüyada öne çıkan ana temaları ve duyguları özetleyen bir giriş paragrafı.
2.  **Sembol Analizi:** Rüyadaki önemli nesneleri, kişileri veya durumları (örn: uçmak, su, orman) tek tek ele al ve bunların psikolojik olarak ne anlama gelebileceğini açıkla. Her sembolü **kalın** harflerle başlık yap.
3.  **Genel Yorum:** Rüyadaki sembollerin birleşiminden yola çıkarak rüyanın, rüyayı gören kişinin mevcut yaşam durumu, duyguları, korkuları veya arzuları hakkında ne gibi ipuçları verebileceğine dair genel bir yorum yap.
4.  **Sonuç Cümlesi:** Rüyanın bir "içsel keşif" aracı olduğunu belirten pozitif bir kapanış cümlesi kur.

Kullanıcının rüyası: "${userDream}"`;

            const payload = {
                contents: [{ role: "user", parts: [{ text: prompt }] }]
            };
            const apiKey = "AIzaSyBBRHpz8-gn4K_wp_jumgILuQg_9OXUelY"; // API anahtarınızı buraya yapıştırın.
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
            const interpretation = result?.candidates?.[0]?.content?.parts?.[0]?.text;

            resultContainer.classList.remove('loading');
            
            if (interpretation) {
                resultContainer.innerHTML = `<p>${formatResponseToHTML(interpretation)}</p>`;
            } else {
                resultContainer.innerHTML = '<p class="placeholder">Yapay zeka rüyanızı yorumlayamadı. Lütfen tekrar deneyin.</p>';
            }

        } catch (error) {
            console.error("Rüya yorumlanırken hata oluştu:", error);
            resultContainer.classList.remove('loading');
            resultContainer.innerHTML = `<p class="placeholder">Bir hata oluştu: ${error.message}</p>`;
        } finally {
            isLoading = false;
            interpretButton.disabled = false;
        }
    };

    interpretButton.addEventListener('click', interpretDream);
});
