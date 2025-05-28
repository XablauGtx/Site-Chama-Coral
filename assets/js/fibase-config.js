const firebaseConfig = {
        apiKey: "AIzaSyCnS13vmO3FrKj8voKrDq4VthAwTdvtS5s",
        authDomain: "site-chama-d447b.firebaseapp.com",
        projectId: "site-chama-d447b",
        storageBucket: "site-chama-d447b.firebasestorage.app",
        messagingSenderId: "512446285695",
        appId: "1:512446285695:web:c7081caec49dc23e3f3c4a",
        measurementId: "G-SNLH7KMNDQ"
  };

  firebase.initializeApp(firebaseConfig);
  const db = firebase.firestore();
  const auth = firebase.auth();