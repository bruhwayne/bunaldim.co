// ==========================================================
// PROFILE.JS - ÇOKLU GÖNDERİ GÖSTERME HATASI DÜZELTİLDİ
// ==========================================================

document.addEventListener("DOMContentLoaded", () => {
    // --- FIREBASE KURULUMU ---
    const firebaseConfig = {
      apiKey: "AIzaSyDnCPhqwGVQLumZeErMvcqtxGBBiuWXZqU", // KENDİ ANAHTARINIZI BURAYA GİRİN
      authDomain: "bunaldimblog.firebaseapp.com",
      projectId: "bunaldimblog",
      storageBucket: "bunaldimblog.appspot.com",
      messagingSenderId: "847056238",
      appId: "1:847056238:web:32587b6ac1187ef01e857f",
      measurementId: "G-5QQR7TV21Z"
    };

    if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
    const db = firebase.firestore();

    if (document.body.id !== 'profile-page-body') return;

    // --- HTML ELEMANLARI ---
    const profileUsernameEl = document.getElementById('profile-username');
    const postsContainer = document.getElementById('profile-posts-container');
    
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('uid');

    if (!userId) {
        profileUsernameEl.textContent = "Kullanıcı Bulunamadı";
        postsContainer.innerHTML = '<p style="text-align:center;">Geçerli bir kullanıcı ID\'si belirtilmedi.</p>';
        return;
    }

    // --- VERİ ÇEKME ---
    db.collection('posts').where('userId', '==', userId).orderBy('timestamp', 'desc').get()
      .then(snapshot => {
            if (snapshot.empty) {
                profileUsernameEl.textContent = "Kullanıcı";
                postsContainer.innerHTML = '<p style="text-align:center;">Bu kullanıcı henüz hiçbir şey yazmamış.</p>';
                return;
            }
            
            profileUsernameEl.textContent = snapshot.docs[0].data().username; // İlk posttan kullanıcı adını al
            postsContainer.innerHTML = ''; // "Yükleniyor" yazısını temizle
            
            // DÜZELTME: Her bir doküman için createProfilePostElement fonksiyonunu çağır.
            snapshot.forEach(doc => {
                createProfilePostElement(doc.data()); // Her döngüde kendi verisini kullanır.
            });
       })
       .catch(err => {
            profileUsernameEl.textContent = "Hata";
            postsContainer.innerHTML = '<p style="color:red;">Gönderiler yüklenemedi.</p>';
            console.error("Profil sorgu hatası:", err);
       });

    function createProfilePostElement(postData) {
        const card = document.createElement('div');
        card.className = 'post-card';
        card.innerHTML = `
            <p class="post-message"><span class="post-prefix">Bunaldım, çünkü </span><span>${postData.message}</span></p>
            <div class="post-footer">
                <span style="color:var(--renk-soluk-yazi);font-size:0.9rem;">❤️ ${postData.likes?.length || 0} beğeni</span>
                <p class="post-timestamp">${postData.timestamp?.toDate().toLocaleString('tr-TR')}</p>
            </div>`;
        postsContainer.appendChild(card);
    }
});