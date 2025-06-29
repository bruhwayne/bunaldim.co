// Gerekli DOM elementlerini seçiyoruz
const questionContainer = document.getElementById('question-container');
const resultScreen = document.getElementById('result-screen');
const predictButton = document.getElementById('predict-button');
const questionInput = document.getElementById('question-input');
const backButton = document.getElementById('back-button');
const predictionVideo = document.getElementById('prediction-video');
const answerText = document.getElementById('answer-text');

// Olası kehanetler listesi
const answers = [
    "Kesinlikle evet.", "İşaretler eveti gösteriyor.", "Şüphesiz.",
    "Evet, kesinlikle.", "Buna güvenebilirsin.", "Gördüğüm kadarıyla, evet.",
    "Büyük olasılıkla.", "Görünüm iyi.", "Evet.", "Cevabım hayır.",
    "Buna güvenme.", "Kaynaklarım hayır diyor.", "Pek iyi görünmüyor.",
    "Çok şüpheli.", "Şimdi cevap vermek zor, tekrar dene.",
    "Daha sonra tekrar sor.", "Şimdi söylemesem daha iyi.",
    "Konsantre ol ve tekrar sor.", "Yıldızlar henüz hizalanmadı."
];

// Animasyon döngüsü için bir değişken
let animationFrameId = null;

// Kehanet fonksiyonunu tetikleyen olaylar
predictButton.addEventListener('click', showPrediction);
questionInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') showPrediction();
});

// Geri dönme olayını tetikleyen olay
backButton.addEventListener('click', (e) => {
    e.preventDefault();
    goBackToQuestion();
});

/**
 * Kehaneti gösterme fonksiyonu.
 * Ekran geçişini ve video oynatımını yönetir.
 */
function showPrediction() {
    if (questionInput.value.trim() === '') {
        questionInput.style.borderColor = 'red';
        setTimeout(() => { questionInput.style.borderColor = '#4b5563'; }, 1500);
        return;
    }

    // Ekranları değiştir
    questionContainer.classList.add('hidden'); // Soru ekranını gizle
    resultScreen.classList.remove('hidden'); // Video ekranını göster
    backButton.classList.remove('hidden');
    
    // Varsa önceki animasyon döngüsünü temizle
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
    }
    
    // Video bittiğinde geri sarması için dinleyiciyi ayarla
    predictionVideo.removeEventListener('ended', playReverse);
    predictionVideo.addEventListener('ended', playReverse, { once: true }); // Sadece bir kez tetiklenir
    
    // Videoyu oynat
    predictionVideo.currentTime = 0;
    predictionVideo.play();

    // Metni sıfırla ve gecikmeyle göster
    answerText.textContent = '';
    answerText.classList.remove('visible');
    setTimeout(() => {
        const randomIndex = Math.floor(Math.random() * answers.length);
        const randomAnswer = answers[randomIndex];
        typeWriter(randomAnswer, answerText);
    }, 1500);
}

/**
 * Video bittiğinde, akıcı bir şekilde geri sarmak için animasyon döngüsünü başlatır.
 */
function playReverse() {
    const rewind = () => {
        // Videoyu küçük adımlarla geri sar
        predictionVideo.currentTime -= 0.033;
        // Eğer başa dönmediyse, bir sonraki frame'i iste
        if (predictionVideo.currentTime > 0) {
            animationFrameId = requestAnimationFrame(rewind);
        } else {
            // Başa döndüyse, tekrar ileri oynat ve dinleyiciyi yeniden ekle
            predictionVideo.currentTime = 0;
            predictionVideo.play();
            predictionVideo.addEventListener('ended', playReverse, { once: true });
        }
    };
    // Animasyon döngüsünü başlat
    animationFrameId = requestAnimationFrame(rewind);
}

/**
 * Soru sorma ekranına geri dönme fonksiyonu.
 */
function goBackToQuestion() {
    resultScreen.classList.add('hidden');
    questionContainer.classList.remove('hidden');
    backButton.classList.add('hidden');
    
    // Tüm video işlemlerini durdur ve temizle
    predictionVideo.pause();
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }
    predictionVideo.removeEventListener('ended', playReverse);
    
    // Sayfa durumunu sıfırla
    predictionVideo.currentTime = 0;
    answerText.textContent = '';
    answerText.classList.remove('visible');
    questionInput.value = '';
}

/**
 * Metni harf harf yazdıran "daktilo" efekti fonksiyonu.
 */
function typeWriter(txt, element) {
    let i = 0;
    element.textContent = '';
    element.classList.add('visible');
    
    function type() {
        if (i < txt.length) {
            element.textContent += txt.charAt(i);
            i++;
            setTimeout(type, 90);
        }
    }
    type();
}
