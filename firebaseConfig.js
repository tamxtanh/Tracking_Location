import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database"; // Import for Realtime Database
// Optionally import the services that you want to use
// import {...} from "firebase/auth";
// import {...} from "firebase/database";
// import {...} from "firebase/firestore";
// import {...} from "firebase/functions";
// import {...} from "firebase/storage";

// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDfU5pMzOx-DtVYpkZrn39fuMarfkhCNMM",
  authDomain: "tracking-location-77dab.firebaseapp.com",
  databaseURL: "https://tracking-location-77dab-default-rtdb.firebaseio.com",
  projectId: "tracking-location-77dab",
  storageBucket: "tracking-location-77dab.appspot.com",
  messagingSenderId: "678984750448",
  appId: "1:678984750448:web:ca88feab2ebd444dc8abb5",
  measurementId: "G-H04MS103HG",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app); // Set up the database

export { app, database };
