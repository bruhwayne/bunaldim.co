document.addEventListener('DOMContentLoaded', () => {
    // HTML elementlerini seç
    const storyPrompt = document.getElementById('story-prompt');
    const completeButton = document.getElementById('complete-story-button');
    const resultContainer = document.getElementById('result-container');
    const resultText = document.getElementById('result-text');

    let isLoading = false;

    const completeStory = async () => {
        if (isLoading) return;

        const userPrompt = storyPrompt.value.trim();
        if (userPrompt.length < 10) {
            resultText.textContent = "Lütfen hikayeye başlamak için en az 10 karakterlik bir metin girin.";
            return;
        }

        isLoading = true;
        completeButton.disabled = true;
        resultContainer.classList.add('loading');
        resultContainer.innerHTML = '<div class="spinner"></div><p>Yapay zeka hikayeyi yazıyor...</p>';

        try {
            const prompt = `Aşağıdaki hikaye başlangıcını ilgi çekici, yaratıcı ve tutarlı bir şekilde devam ettir. Hikayeyi en az 3-4 paragrafla tamamla.\n\nHikaye başlangıcı: "${userPrompt}"`;
            const payload = {
                contents: [{ role: "user", parts: [{ text: prompt }] }]
            };
            const apiKey = "AIzaSyCMzQh8TnqVNr4qC_JTkRZZPsNVvfeSJus"; // API anahtarınızı buraya yapıştırın.
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error.message);
            }

            const result = await response.json();
            const storyCompletion = result?.candidates?.[0]?.content?.parts?.[0]?.text;
            
            resultContainer.classList.remove('loading');

            if (storyCompletion) {
                // Sonucu yazdırmak için resultContainer'ın içini temizle ve yeni metni ekle
                resultContainer.innerHTML = `<p id="result-text"></p>`;
                document.getElementById('result-text').textContent = storyCompletion.trim();
            } else {
                resultContainer.innerHTML = `<p id="result-text">Yapay zeka bir cevap üretemedi. Lütfen tekrar deneyin.</p>`;
            }

        } catch (error) {
            console.error("Hikaye tamamlanırken hata oluştu:", error);
            resultContainer.classList.remove('loading');
            resultContainer.innerHTML = `<p id="result-text">Bir hata oluştu: ${error.message}</p>`;
        } finally {
            isLoading = false;
            completeButton.disabled = false;
        }
    };

    completeButton.addEventListener('click', completeStory);
});
