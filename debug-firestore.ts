
import firebase from "firebase/compat/app";
import "firebase/compat/firestore";

const firebaseConfig = {
    apiKey: process.env.VITE_FIREBASE_API_KEY,
    authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.VITE_FIREBASE_APP_ID,
    measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const db = firebase.firestore();

async function checkPayments() {
    try {
        console.log("Checking 'payments' collection...");
        const snapshot = await db.collection('payments').get();
        console.log(`Found ${snapshot.size} documents in 'payments'.`);
        snapshot.forEach(doc => {
            console.log(doc.id, "=>", doc.data());
        });

        console.log("\nChecking 'Payments' collection (case sensitive check)...");
        const snapshot2 = await db.collection('Payments').get();
        console.log(`Found ${snapshot2.size} documents in 'Payments'.`);

    } catch (error) {
        console.error("Error checking payments:", error);
    }
}

checkPayments();
