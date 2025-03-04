import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getFirestore, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js";

// Firebase configuration
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

// Function to fetch reviews for the logged-in user (where sellerId matches userId)
async function fetchUserReviews(userId) {
    const reviewsContainer = document.getElementById("reviewsContainer");
    reviewsContainer.innerHTML = ""; // Clear previous content

    try {
        // Query reviews where sellerId matches the logged-in user's ID
        const reviewsQuery = query(collection(db, "reviews"), where("sellerId", "==", userId));
        const reviewsSnapshot = await getDocs(reviewsQuery);

        // If no reviews exist, show a message
        if (reviewsSnapshot.empty) {
            reviewsContainer.innerHTML = "<p>No reviews found for this user.</p>";
            return;
        }

        // Loop through and display the reviews
        reviewsSnapshot.forEach((doc) => {
            const reviewData = doc.data();
            const reviewDiv = document.createElement("div");
            reviewDiv.className = "bg-white shadow-md rounded p-6 mb-4";

            reviewDiv.innerHTML = `
                <h3 class="text-xl font-semibold text-gray-800">${reviewData.productName}</h3>
                <p class="text-gray-600">Rating: ${"⭐".repeat(reviewData.rating)}</p>
                <p class="text-gray-600">${reviewData.reviewText}</p>
            `;

            reviewsContainer.appendChild(reviewDiv);
        });
    } catch (error) {
        console.error("Error fetching reviews:", error);
        reviewsContainer.innerHTML = "<p>Error loading reviews. Please try again later.</p>";
    }
}

// Check if user is logged in and fetch reviews
onAuthStateChanged(auth, (user) => {
    const reviewsContainer = document.getElementById("reviewsContainer");

    if (user) {
        document.getElementById("username").textContent = user.displayName || "User";
        fetchUserReviews(user.uid);
    } else {
        reviewsContainer.innerHTML = "<p>Please log in to view your reviews.</p>";
    }
});
