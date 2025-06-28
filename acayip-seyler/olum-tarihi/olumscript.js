document.addEventListener('DOMContentLoaded', () => {
    // ------ ELEMENTLERİ SEÇ ------
    const birthdateInput = document.getElementById('birthdate-input');
    const calculateBtn = document.getElementById('calculate-btn');
    const resultContainer = document.getElementById('result-container');
    const resultText = document.getElementById('result-text');

    const nedenler = [
        "uzaylılar tarafından en sevdikleri dans figürü seçildiğin için",
        "konuşan bir sincapla girdiğin hararetli bir fıstık pazarlığını kaybettiğin için",
        "yanlışlıkla evrenin en rahat koltuğuna oturduğun ve bir daha kalkmak istemediğin için",
        "klavyendeki 'Caps Lock' tuşuna fazla mesai yaptırdığın için",
        "kayıp Atlantis şehrini bulduğun ama internet çekmediği için canın sıkıldığı için"
    ];
    const yerler = [
        "en sevdiğin koltuğun tam üstünde",
        "Ay'ın karanlık yüzündeki ikinci el eşya dükkanında",
        "bir halk kütüphanesinin 'unutulmuş icatlar' bölümünde",
        "Antarktika'da bir grup penguene stand-up yaparken",
        "en yakın marketin abur cubur reyonunda"
    ];
    const son_anlar = [
        "en sevdiğin şarkının enstrümantal versiyonunu mırıldanırken",
        "çorabının diğer tekini nihayet bulduğun o anki mutlulukla",
        "bir kediye 'neden bu kadar tatlısın?' diye felsefi bir soru sorduktan hemen sonra",
        "buzdolabının ışığının gerçekten sönüp sönmediğini son kez kontrol ederken",
        "internetin neden yavaş olduğunu araştırırken"
    ];

    calculateBtn.addEventListener('click', () => {
        const birthdate = birthdateInput.value;
        if (!birthdate) {
            alert("Geleceği görmek için geçmişe bir bilet lazım! Lütfen doğum tarihini gir.");
            return;
        }

        const randomNeden = nedenler[Math.floor(Math.random() * nedenler.length)];
        const randomYer = yerler[Math.floor(Math.random() * yerler.length)];
        const randomAn = son_anlar[Math.floor(Math.random() * son_anlar.length)];
        const randomYil = new Date().getFullYear() + Math.floor(Math.random() * 50) + 15;

        resultText.innerText = `Yıldızlar ve kozmik fısıltılar, büyük günün ${randomYil} yılında olacağını söylüyor. O epik anda, ${randomYer}, ${randomAn}, ${randomNeden} hayata veda edeceksin. Ama unutma, efsaneler asla gerçekten ölmez, sadece sunucu değiştirir!`;
        resultContainer.classList.remove('hidden');
    });
});