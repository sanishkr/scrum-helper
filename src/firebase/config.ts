import { initializeApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"

// Firebase configuration
// You can either use environment variables (recommended) or hardcode the values
const firebaseConfig = {
  apiKey: process.env.PLASMO_PUBLIC_FIREBASE_API_KEY || "your-api-key",
  authDomain:
    process.env.PLASMO_PUBLIC_FIREBASE_AUTH_DOMAIN ||
    "your-project.firebaseapp.com",
  databaseURL:
    process.env.PLASMO_PUBLIC_FIREBASE_DATABASE_URL ||
    "https://your-project-default-rtdb.firebaseio.com/",
  projectId: process.env.PLASMO_PUBLIC_FIREBASE_PROJECT_ID || "your-project-id",
  storageBucket:
    process.env.PLASMO_PUBLIC_FIREBASE_STORAGE_BUCKET ||
    "your-project.appspot.com",
  messagingSenderId:
    process.env.PLASMO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: process.env.PLASMO_PUBLIC_FIREBASE_APP_ID || "your-app-id"
}

// Debug: Log the config to see if env vars are loading
console.log("Firebase Config:", {
  apiKey: firebaseConfig.apiKey?.substring(0, 10) + "...",
  projectId: firebaseConfig.projectId
})

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firestore and get a reference to the service
export const firestore = getFirestore(app)
export default app
