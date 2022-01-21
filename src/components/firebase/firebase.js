// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore"

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBXoHDAOgjCyyZFX0A9E7TAWOCpRlhOZ5s",
  authDomain: "identity-4bdce.firebaseapp.com",
  projectId: "identity-4bdce",
  storageBucket: "identity-4bdce.appspot.com",
  messagingSenderId: "246998016051",
  appId: "1:246998016051:web:675532c0040bc956a78346",
  measurementId: "G-9GMETR6G18"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db =  getFirestore();
export default db;