// =====================================================================
// BLOG.JS - GİRİŞ SONRASI MODAL KAPANMA HATASI DÜZELTİLDİ
// =====================================================================

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
    const auth = firebase.auth();
    const db = firebase.firestore();
    const postsCollection = db.collection('posts');

    if (document.body.id !== 'blog-page-body') return;

    // --- TÜM HTML ELEMANLARI ---
    const postsContainer = document.getElementById("posts-container");
    const authModal = document.getElementById('auth-modal');
    const loginPromptButton = document.getElementById('login-prompt-button');
    const logoutButton = document.getElementById('logout-button');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const resetPasswordForm = document.getElementById('reset-password-form');
    const postForm = document.getElementById("post-form");
    const messageInput = document.getElementById("message-input");
    const loadingOverlay = document.getElementById("loading-overlay");
    const verificationPrompt = document.getElementById("verification-prompt");

    // --- TEMEL OLAY DİNLEYİCİLERİ ---
    loginPromptButton.addEventListener('click', () => authModal.classList.remove('hidden'));
    authModal.addEventListener('click', (e) => { if (e.target === authModal) authModal.classList.add('hidden'); });
    logoutButton.addEventListener('click', () => auth.signOut());
    
    document.querySelector('.auth-tabs').addEventListener('click', e => { if(e.target.matches('.auth-tab')){ document.querySelectorAll('.auth-tab, .auth-view').forEach(el => el.classList.remove('active')); e.target.classList.add('active'); document.getElementById(`${e.target.dataset.tab}-view`).classList.add('active'); }});
    document.getElementById('forgot-password-link').addEventListener('click', e => {e.preventDefault(); document.getElementById('login-view').classList.remove('active'); document.getElementById('reset-password-view').classList.add('active');});
    document.getElementById('back-to-login-link').addEventListener('click', e => {e.preventDefault(); document.getElementById('reset-password-view').classList.remove('active'); document.getElementById('login-view').classList.add('active');});

    // --- ANA AKIŞ ---
    loadPosts();
    auth.onAuthStateChanged(user => updateUIVisibility(user?.emailVerified ? user : null));
    
    // --- TEMEL FONKSİYONLAR ---

    function updateUIVisibility(user) {
        const isLoggedIn = !!user;
        
        // ==== DÜZELTME BURADA ====
        // Giriş başarılı olduğunda, modal'ı otomatik olarak kapat ve formu sıfırla.
        if (isLoggedIn) {
            authModal.classList.add('hidden');
            loginForm.reset();
            registerForm.reset();
        }
        // ==== DÜZELTME SONU ====

        document.getElementById('user-info').classList.toggle('hidden', !isLoggedIn);
        if(isLoggedIn) document.getElementById('user-display-name').textContent = user.displayName;
        document.getElementById('post-box').classList.toggle('hidden', !isLoggedIn);
        document.getElementById('auth-prompt').classList.toggle('hidden', isLoggedIn);
        
        document.querySelectorAll('.like-button, .comment-actions').forEach(el => el.classList.toggle('hidden', !isLoggedIn));
        document.querySelectorAll('.comment-form').forEach(el => {
            const container = el.closest('.comments-section, .comment-wrapper')?.querySelector('.comments-container, .replies-container');
            const isParentHidden = container ? container.classList.contains('hidden') : el.classList.contains('main-comment-form');
            el.classList.toggle('hidden', !isLoggedIn || isParentHidden);
        });
    }

    function loadPosts() {
        postsCollection.orderBy('timestamp', 'desc').onSnapshot(snapshot => {
            postsContainer.innerHTML = '';
            snapshot.forEach(doc => createPostElement(doc.id, doc.data()));
            updateUIVisibility(auth.currentUser?.emailVerified ? auth.currentUser : null);
        }, err => console.error(err));
    }

    function createPostElement(id, data) {
        const card = document.createElement('div');
        card.className = 'post-card';
        const userLink = data.userId ? `<a href="profile.html?uid=${data.userId}"><p class="post-username">${data.username}</p></a>` : `<p class="post-username">${data.username}</p>`;
        
        card.innerHTML = `
            <div class="post-header">${userLink}</div>
            <p class="post-message"><span class="post-prefix">Bunaldım, çünkü </span><span>${data.message}</span></p>
            <div class="post-footer">
                <div class="post-actions"><button class="like-button hidden">❤️<span class="like-count">0</span></button><button class="toggle-comments-button">Yorumlar</button></div>
                <p class="post-timestamp">${data.timestamp?.toDate().toLocaleString('tr-TR')}</p>
            </div>
            <div class="comments-section">
                <div class="comments-container hidden"></div>
                <form class="comment-form main-comment-form hidden"><input type="text" class="comment-input" placeholder="Yorum yaz..."><button type="submit">Gönder</button></form>
            </div>`;
        postsContainer.appendChild(card);
        
        const postRef = db.collection('posts').doc(id);
        postRef.onSnapshot(doc => {
            const postData = doc.data() || {};
            card.querySelector('.like-count').textContent = postData.likes?.length || 0;
            if(auth.currentUser) card.querySelector('.like-button').classList.toggle('liked', (postData.likes || []).includes(auth.currentUser.uid));
        });
        postRef.collection('comments').onSnapshot(snap => card.querySelector('.toggle-comments-button').textContent = `Yorumlar (${snap.size})`);
        
        card.querySelector('.like-button').addEventListener('click', () => toggleLike(id));
        card.querySelector('.toggle-comments-button').addEventListener('click', () => {
            const commentsDiv = card.querySelector('.comments-container');
            const commentForm = card.querySelector('.main-comment-form');
            const isHidden = commentsDiv.classList.toggle('hidden');
            if(auth.currentUser) commentForm.classList.toggle('hidden', isHidden);
            if(!isHidden && commentsDiv.innerHTML === '') loadComments(id, commentsDiv);
        });
        card.querySelector('.main-comment-form').addEventListener('submit', (e) => { e.preventDefault(); const input = e.target.querySelector('input'); addComment(id, input.value.trim()); input.value = ''; });
    }

    function loadComments(postId, container) {
        db.collection('posts').doc(postId).collection('comments').orderBy('timestamp', 'asc').onSnapshot(snapshot => {
            container.innerHTML = '';
            const commentsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            const elementMap = {};
            commentsData.forEach(comment => { elementMap[comment.id] = createCommentElement(postId, comment); });
            commentsData.forEach(comment => {
                if (comment.parentId && elementMap[comment.parentId]) {
                    elementMap[comment.parentId].querySelector('.replies-container').appendChild(elementMap[comment.id]);
                } else if (!comment.parentId) {
                    container.appendChild(elementMap[comment.id]);
                }
            });
            updateUIVisibility(auth.currentUser?.emailVerified ? auth.currentUser : null);
        });
    }

    function createCommentElement(postId, data) {
        const wrapper = document.createElement('div');
        wrapper.className = 'comment-wrapper';
        if (data.parentId) wrapper.classList.add('is-reply');

        const authorLink = data.userId ? `<a href="profile.html?uid=${data.userId}"><span class="comment-author">${data.username}:</span></a>` : `<span class="comment-author">${data.username}:</span>`;
        const canReply = !data.parentId; 

        wrapper.innerHTML = `
            <div class="comment">${authorLink}<span class="comment-text">${data.text}</span></div>
            ${canReply ? `<div class="comment-actions hidden"><button class="reply-button">Yanıtla</button></div>` : ''}
            <div class="replies-container"></div>
            ${canReply ? `<form class="reply-form hidden"><input type="text" class="comment-input" placeholder="Yanıt yaz..."><button type="submit">Gönder</button></form>` : ''}
        `;

        if (canReply) {
            const replyButton = wrapper.querySelector('.reply-button');
            const replyForm = wrapper.querySelector('.reply-form');
            replyButton.addEventListener('click', () => replyForm.classList.toggle('hidden'));
            replyForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const input = replyForm.querySelector('input');
                if (input.value.trim()) {
                    addComment(postId, input.value.trim(), data.id);
                    input.value = '';
                    replyForm.classList.add('hidden');
                }
            });
        }
        return wrapper;
    }
    
    // AUTH VE DİĞER İŞLEMLER
    postForm.addEventListener('submit', e => { e.preventDefault(); if(auth.currentUser && messageInput.value.trim()) postsCollection.add({userId: auth.currentUser.uid, username: auth.currentUser.displayName, message: messageInput.value.trim(), timestamp: firebase.firestore.FieldValue.serverTimestamp(), likes: []}).then(()=>messageInput.value='')});
    function toggleLike(id) {if(!auth.currentUser) return; const postRef = db.collection('posts').doc(id); db.runTransaction(t=>t.get(postRef).then(doc=>{if(!doc.exists)return;const likes=doc.data().likes||[];const i=likes.indexOf(auth.currentUser.uid);i===-1?likes.push(auth.currentUser.uid):likes.splice(i,1);t.update(postRef,{likes})}))};
    function addComment(postId, text, parentId = null) {if(!auth.currentUser || !text)return; db.collection('posts').doc(postId).collection('comments').add({userId: auth.currentUser.uid, username: auth.currentUser.displayName, text, parentId, timestamp: firebase.firestore.FieldValue.serverTimestamp()})};
    
    registerForm.addEventListener('submit',e=>{e.preventDefault();loadingOverlay.classList.remove('hidden');const u=e.target['register-username'].value,m=e.target['register-email'].value,p=e.target['register-password'].value;auth.createUserWithEmailAndPassword(m,p).then(c=>c.user.updateProfile({displayName:u}).then(()=>c.user.sendEmailVerification())).then(()=>auth.signOut()).then(()=>{e.target.reset();authModal.classList.add('hidden');verificationPrompt.classList.remove('hidden')}).catch(err=>alert("Kayıt: "+err.message)).finally(()=>loadingOverlay.classList.add('hidden'))});
    loginForm.addEventListener('submit',e=>{e.preventDefault();loadingOverlay.classList.remove('hidden');const m=e.target['login-email'].value,p=e.target['login-password'].value;auth.signInWithEmailAndPassword(m,p).then(c=>{if(!c.user.emailVerified){auth.signOut();alert("E-postanızı doğrulayın.")}}).catch(err=>alert("Giriş: "+err.message)).finally(()=>loadingOverlay.classList.add('hidden'))});
    resetPasswordForm.addEventListener('submit',e=>{e.preventDefault();loadingOverlay.classList.remove('hidden');auth.sendPasswordResetEmail(e.target['reset-email'].value).then(()=>alert('E-posta gönderildi.')).catch(err=>alert('Hata: '+err.message)).finally(()=>loadingOverlay.classList.add('hidden'))});
});