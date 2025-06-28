document.addEventListener('DOMContentLoaded', () => {
    const questionInput = document.getElementById('question-input');
    const askButton = document.getElementById('ask-button');
    const crystalBall = document.getElementById('crystal-ball');
    const answerText = document.getElementById('answer-text');

    let isLoading = false;

    // Metni kavisli bir şekilde gösteren fonksiyon (Mevcut haliyle harika çalışıyor)
    function displayCurvedText(text) {
        answerText.innerHTML = '';
        const characters = text.split('');
        const midIndex = (characters.length - 1) / 2;
        const maxRotate = 40;
        const maxTranslate = -25;

        characters.forEach((char, i) => {
            const span = document.createElement('span');
            span.textContent = char === ' ' ? '\u00A0' : char; // Boşlukları koru
            const distanceFromCenter = (i - midIndex) / midIndex;
            const rotateY = distanceFromCenter * maxRotate;
            const translateY = (distanceFromCenter * distanceFromCenter) * maxTranslate;
            span.style.setProperty('--transform', `translateY(${translateY}px) rotateY(${rotateY}deg)`);
            span.style.transitionDelay = `${Math.abs(distanceFromCenter) * 0.15}s`;
            answerText.appendChild(span);
        });
    }

    // Yapay zeka ile cevap üreten ana fonksiyon
    const getCrystalBallAnswer = async () => {
        if (isLoading) return;
        
        const question = questionInput.value.trim();
        if (question.length < 5) {
            displayCurvedText("Daha derin bir soru sor.");
            answerText.classList.add('visible');
            setTimeout(() => answerText.classList.remove('visible'), 2000);
            return;
        }

        isLoading = true;
        askButton.disabled = true;
        answerText.classList.remove('visible');
        crystalBall.classList.add('thinking');
        
        // Yükleme animasyonunu göster
        answerText.innerHTML = '<div class="spinner"></div>';
        answerText.classList.add('visible');

        try {
            // GÜNCELLENDİ: Yapay zekaya daha bilge ve muzip bir kişilik veren yeni prompt
            const prompt = `Sen, zamanın ötesinden fısıldayan, hem bilge hem de biraz muzip bir Kristal Küre'sin. Sana sorulan "${question}" sorusuna doğrudan cevap verme. Bunun yerine, metaforlar ve imalar kullanarak, kaderin cilvelerini yansıtan, üzerinde düşündürecek, gizemli ve şiirsel bir kehanette bulun. Cevabın kısa olsun, yaklaşık 7-10 kelimeden oluşsun. Cevabın sonunda asla nokta veya başka bir noktalama işareti kullanma.`;

            const payload = {
                contents: [{ role: "user", parts: [{ text: prompt }] }]
            };
            const apiKey = "AIzaSyD8_x8-_r2ysytJPvhfwO2Fh_XzwnC56go"; // API anahtarınızı buraya yapıştırın.
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error("Evren şu an sessiz.");
            }

            const result = await response.json();
            const aiAnswer = result?.candidates?.[0]?.content?.parts?.[0]?.text;
            
            // Yükleme animasyonunu gizle
            answerText.classList.remove('visible');
            await new Promise(resolve => setTimeout(resolve, 500)); // Geçiş için bekle

            if (aiAnswer) {
                displayCurvedText(aiAnswer.trim());
            } else {
                displayCurvedText("Sisler dağılmadı.");
            }

        } catch (error) {
            console.error("Kristal küre hatası:", error);
            displayCurvedText(error.message);
        } finally {
            // Cevap gösterildikten sonra her şeyi sıfırla
            crystalBall.classList.remove('thinking');
            answerText.classList.add('visible');
            questionInput.value = '';
            
            // Butonu tekrar aktif etmeden önce kısa bir bekleme
            setTimeout(() => {
                isLoading = false;
                askButton.disabled = false;
            }, 1000);
        }
    };

    askButton.addEventListener('click', getCrystalBallAnswer);
    questionInput.addEventListener('keyup', (event) => {
        if (event.key === 'Enter') {
            getCrystalBallAnswer();
        }
    });
});
