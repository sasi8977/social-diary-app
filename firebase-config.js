import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';
import { getStorage } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js';
import { getFunctions } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-functions.js';
import { getAnalytics } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-analytics.js';

const firebaseConfig = {
  apiKey: "AIzaSyD0iJWnkuinWVCtsO5vjqohrCA4ws6fb8Q",
      authDomain: "social-diary-b6754.firebaseapp.com",
      projectId: "social-diary-b6754",
      storageBucket: "social-diary-b6754.appspot.com",
      messagingSenderId: "324502839373",
      appId: "1:324502839373:web:05b3f62f18dd78f14bbc04",
      measurementId: "G-6NSE70KRLB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const functions = getFunctions(app);
const analytics = getAnalytics(app);

export { auth, db, storage, functions, analytics };
