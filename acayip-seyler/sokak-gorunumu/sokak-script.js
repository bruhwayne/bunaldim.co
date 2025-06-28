document.addEventListener('DOMContentLoaded', () => {
    const randomLocationBtn = document.getElementById('random-location-btn');

    // ÖNCEDEN BELİRLENMİŞ VE GARANTİLİ LOKASYONLAR LİSTESİ
    // Buradaki her koordinatın Street View'de görüntüsü olduğu test edilmiştir.
    // Listeyi dilediğiniz gibi genişletebilirsiniz!
    const knownLocations = [
        // Dünya Harikaları ve Ünlü Yerler
        { lat: 48.85837, lng: 2.294481 },      // Eyfel Kulesi, Paris
        { lat: 40.7587, lng: -73.9853 },      // Times Meydanı, New York
        { lat: 29.9792, lng: 31.1342 },       // Giza Piramitleri, Mısır
        { lat: 41.8902, lng: 12.4922 },       // Kolezyum, Roma
        { lat: 35.6586, lng: 139.7454 },      // Tokyo Kulesi, Japonya
        { lat: 51.5007, lng: -0.1246 },       // Big Ben, Londra
        { lat: -22.9519, lng: -43.2105 },     // Kurtarıcı İsa Heykeli, Rio
        { lat: -13.1631, lng: -72.5450 },     // Machu Picchu, Peru
        { lat: 37.8267, lng: -122.4233 },     // Alcatraz Adası, San Francisco

        // Türkiye'den Harika Yerler
        { lat: 41.0086, lng: 28.9781 },       // Sultanahmet Meydanı, İstanbul
        { lat: 38.4192, lng: 27.1287 },       // Konak Meydanı, İzmir
        { lat: 38.6575, lng: 34.8466 },       // Göreme, Kapadokya (Balonların arası)
        { lat: 37.9892, lng: 27.3426 },       // Efes Antik Kenti, Selçuk
        { lat: 36.8848, lng: 30.7056 },       // Kaleiçi, Antalya

        // Doğal Güzellikler ve Manzaralar
        { lat: 36.1084, lng: -113.8118 },     // Grand Canyon Skywalk, ABD
        { lat: 46.5763, lng: 7.9904 },        // Grindelwald, İsviçre Alpleri
        { lat: -27.1274, lng: -109.3524 },    // Moai Heykelleri, Paskalya Adası
        { lat: 64.0729, lng: -21.1332 },      // İzlanda'da bir yol
        { lat: 44.4605, lng: -110.8281 }      // Grand Prismatic Spring, Yellowstone
    ];

    if (randomLocationBtn) {
        randomLocationBtn.addEventListener('click', () => {
            // 1. Listeden rastgele bir konum seç
            const randomIndex = Math.floor(Math.random() * knownLocations.length);
            const randomLocation = knownLocations[randomIndex];

            // 2. Seçilen konuma göre Google Haritalar URL'sini oluştur
            const url = `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${randomLocation.lat},${randomLocation.lng}`;

            // 3. URL'yi yeni bir sekmede aç
            window.open(url, '_blank');
        });
    }
});