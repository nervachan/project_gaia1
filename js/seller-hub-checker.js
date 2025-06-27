// Import Firebase libraries and initialize Firestore and Authentication
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js";

// Firebase configuration and initialization
const firebaseConfig = {
    apiKey: "AIzaSyC7eaM6HrHalV-wcG-I9_RZJRwDNhin2R0",
    authDomain: "project-gaia1.firebaseapp.com",
    projectId: "project-gaia1",
    storageBucket: "project-gaia1.firebasestorage.app",
    messagingSenderId: "832122601643",
    appId: "1:832122601643:web:1ab91b347704174f52b7ee",
    measurementId: "G-DX2L33NH4H"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Function to check if the logged-in user is a seller or a buyer
async function checkIfUserIsSeller(event) {
    const user = auth.currentUser;
    if (!user) {
        alert("You need to be logged in to access this page.");
        event.preventDefault(); // Prevent the default action of the <a> tag
        return;
    }

    const userId = user.uid;

    // Fetch user data from Firestore (both user-seller and user-buyer collections)
    const userSellerDocRef = doc(db, "user-seller", userId);
    const userBuyerDocRef = doc(db, "user-buyer", userId);

    try {
        // Fetch the user data from both collections
        const userSellerDocSnap = await getDoc(userSellerDocRef);
        const userBuyerDocSnap = await getDoc(userBuyerDocRef);

        if (userSellerDocSnap.exists()) {
            const sellerData = userSellerDocSnap.data();
            if (sellerData.roles === "seller") {
                // User is a seller
                console.log("User is a seller, proceeding...");
                return; // Allow navigation to seller hub
            }
        }

        if (userBuyerDocSnap.exists()) {
            const buyerData = userBuyerDocSnap.data();
            if (buyerData.roles === "buyer") {
                // User is a buyer
                alert("Only for sellers.");
                event.preventDefault(); // Prevent navigation
                return;
            }
        }

        // If neither collection contains the user, show an alert
        alert("You don't have the necessary role to access this page.");
        event.preventDefault(); // Prevent navigation
    } catch (error) {
        console.error("Error checking user roles:", error);
        alert("An error occurred. Please try again later.");
        event.preventDefault(); // Prevent the default action of the <a> tag
    }
}

// Event listener for auth state change
onAuthStateChanged(auth, (user) => {
    const sellerHubLink = document.getElementById("sellerHubLink");
    if (sellerHubLink) {
        // Ensure the event listener is added only after the DOM is fully loaded
        sellerHubLink.addEventListener("click", (event) => {
            checkIfUserIsSeller(event);
        });
    }
});
