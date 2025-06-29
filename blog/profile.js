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
    const auth = firebase.auth(); // Auth servisini ekle

    if (document.body.id !== 'profile-page-body') return;

    // --- HTML ELEMANLARI ---
    const profileCardEl = document.getElementById('profile-card');
    const loadingProfileEl = document.getElementById('loading-profile');
    const profileUsernameEl = document.getElementById('profile-username');
    const profileStatsEl = document.getElementById('profile-stats');
    const postsContainer = document.getElementById('profile-posts-container');
    const userInfoEl = document.getElementById('user-info');
    const userDisplayNameEl = document.getElementById('user-display-name');
    const logoutButton = document.getElementById('logout-button');
    const userProfileLink = document.getElementById('user-profile-link');
    
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('uid');

    if (!userId) {
        loadingProfileEl.innerHTML = '<p style="color:red;">Geçerli bir kullanıcı ID\'si belirtilmedi.</p>';
        return;
    }

    // --- OTURUM YÖNETİMİ (SAĞ ÜST KÖŞE İÇİN) ---
    auth.onAuthStateChanged(user => {
        if (user && user.emailVerified) {
            // Kullanıcı giriş yapmışsa header'daki bilgileri güncelle
            userInfoEl.classList.remove('hidden');
            userDisplayNameEl.textContent = user.displayName;
            userProfileLink.href = `profile.html?uid=${user.uid}`;
        } else {
            // Kullanıcı giriş yapmamışsa header'da kullanıcı bilgisi gösterme
            userInfoEl.classList.add('hidden');
        }
    });

    logoutButton.addEventListener('click', () => {
        auth.signOut().then(() => {
            // Çıkış yapıldıktan sonra blog ana sayfasına yönlendir
            window.location.href = 'blog-index.html';
        });
    });


    // --- PROFİL VERİSİ ÇEKME VE SAYFAYI OLUŞTURMA ---
    db.collection('posts').where('userId', '==', userId).orderBy('timestamp', 'desc').get()
      .then(snapshot => {
            loadingProfileEl.classList.add('hidden');
            profileCardEl.classList.remove('hidden');

            if (snapshot.empty) {
                profileUsernameEl.textContent = "Bilinmeyen Kullanıcı";
                postsContainer.innerHTML = '<p style="text-align:center; color: var(--renk-soluk-yazi);">Bu kullanıcı henüz hiçbir şey yazmamış.</p>';
                profileStatsEl.innerHTML = `
                    <div class="stat">
                        <span class="stat-value">0</span>
                        <span class="stat-label">Gönderi</span>
                    </div>
                `;
                return;
            }
            
            const postCount = snapshot.size;
            const username = snapshot.docs[0].data().username;
            
            profileUsernameEl.textContent = username;
            profileStatsEl.innerHTML = `
                <div class="stat">
                    <span class="stat-value">${postCount}</span>
                    <span class="stat-label">Gönderi</span>
                </div>
            `;

            postsContainer.innerHTML = '';
            snapshot.forEach(doc => {
                createProfilePostElement(doc.data());
            });
       })
       .catch(err => {
            loadingProfileEl.innerHTML = `<p style="color:red;">Profil yüklenirken bir hata oluştu: ${err.message}</p>`;
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
