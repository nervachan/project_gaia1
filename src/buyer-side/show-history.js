// Import necessary functions from Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getFirestore, getDoc, doc, setDoc, deleteDoc, updateDoc, query, collection, where, getDocs 
} from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";

import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js";

// Your Firebase configuration
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
const auth = getAuth(); // Initialize Firebase Authentication

// ... (imports and firebase config stay the same)

// Load rental history on page load
window.onload = () => {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            console.log("User is logged in:", user);
            showRentalHistory(user.uid);
        } else {
            console.log("No user is logged in.");
        }
    });
};

// Show rental history for the logged-in user (Buyer)
async function showRentalHistory(userId) {
    const rentalHistoryContainer = document.getElementById('rentalHistoryContainer');
    rentalHistoryContainer.innerHTML = ''; // Clear previous

    try {
        const rentalsQuery = query(collection(db, "rentals"), where('buyerId', '==', userId));
        const rentalsSnapshot = await getDocs(rentalsQuery);

        if (rentalsSnapshot.empty) {
            rentalHistoryContainer.innerHTML = '<p class="text-gray-500 text-center">No rental history found.</p>';
            return;
        }

        for (const docSnapshot of rentalsSnapshot.docs) {
            const rentalData = docSnapshot.data();
            rentalData.id = docSnapshot.id; // Attach doc ID for cancellation
            const rentalElement = createRentalHistoryElement(rentalData);
            rentalHistoryContainer.appendChild(rentalElement);
        }

    } catch (error) {
        console.error("Error fetching rental history: ", error);
        rentalHistoryContainer.innerHTML = '<p class="text-red-500 text-center">Failed to load rental history. Please try again later.</p>';
    }
}

// Create the rental history element for the buyer
function createRentalHistoryElement(rentalData) {
    const rentalElement = document.createElement('div');
    rentalElement.classList.add('bg-white', 'p-4', 'rounded-lg', 'shadow-lg', 'mb-4');

    const imageUrl = rentalData.image || '';
    const isReturned = rentalData.status.toLowerCase() === 'returned';

    rentalElement.innerHTML = `
        <div class="flex">
            <div class="w-32 h-32 mr-4">
                <img src="${imageUrl}" alt="${rentalData.productName}" class="w-full h-full object-cover rounded-lg">
            </div>
            <div class="flex-1">
                <h3 class="text-xl font-semibold text-gray-900">${rentalData.listingName}</h3>
                <p class="text-gray-700 mt-2">Start Date: ${rentalData.startDate}</p>
                <p class="text-gray-700 mt-2">End Date: ${rentalData.endDate}</p>
                <p class="text-gray-700 mt-2">Price: ₱${rentalData.finalPrice}</p>
                <p class="text-gray-700 mt-2">Status: ${rentalData.status}</p>

                <!-- Show the review form if item is returned -->
                <div class="reviews mt-4">
                    ${isReturned && !rentalData.reviewGiven ? `
                        <h4 class="text-lg font-semibold text-gray-800">Leave a Review</h4>
                        <textarea id="buyerReviewText-${rentalData.id}" class="w-full p-2 border rounded-md mt-2" placeholder="Write your review..."></textarea>
                        <button class="bg-blue-500 text-white px-4 py-2 rounded-md mt-4" onclick="submitBuyerReview('${rentalData.id}', '${rentalData.sellerId}')">Submit Review</button>
                    ` : ''}
                </div>
            </div>
        </div>
    `;

    return rentalElement;
}

// Function to submit the review from the buyer
async function submitBuyerReview(rentalId, sellerId) {
    const reviewText = document.getElementById(`buyerReviewText-${rentalId}`).value;

    if (!reviewText.trim()) {
        alert("Please write a review before submitting.");
        return;
    }

    try {
        // Store the review in the 'reviews' collection
        await setDoc(doc(db, "reviews", rentalId), {
            rentalId,
            sellerId,
            reviewText,
            reviewBy: "buyer", // Indicate it's the buyer's review
            timestamp: new Date(),
        });

        // Update the rental document to mark that the buyer has submitted a review
        const rentalRef = doc(db, "rentals", rentalId);
        await updateDoc(rentalRef, { reviewGiven: true });

        alert("Review submitted successfully!");

        // Refresh the rental history to reflect the review submission
        showRentalHistory(auth.currentUser.uid);

    } catch (error) {
        console.error("Error submitting buyer review:", error);
        alert("Failed to submit the review. Please try again.");
    }
}

// Example: Initialize and display rental history when the page loads
window.onload = () => {
    const user = auth.currentUser;
    if (user) {
        showRentalHistory(user.uid);
    }
};

// Function to handle rental cancellation
async function cancelRental(rentalId) {
    try {
        const rentalRef = doc(db, "rentals", rentalId);
        const rentalSnap = await getDoc(rentalRef);

        if (!rentalSnap.exists()) {
            alert("Rental record not found.");
            return;
        }

        const rentalData = rentalSnap.data();

        // Step 1: Move to rental_history with status "cancelled"
        const historyRef = doc(db, "rental_history", rentalId);
        await setDoc(historyRef, { ...rentalData, status: "cancelled" });

        // Step 2: Delete from rentals collection
        await deleteDoc(rentalRef);

        // Step 3: Find related listing in listed_items and set isActive: true
        const listedItemsQuery = query(
            collection(db, "listed_items"),
            where("productName", "==", rentalData.listingName)
        );
        const listedItemsSnapshot = await getDocs(listedItemsQuery);

        if (!listedItemsSnapshot.empty) {
            listedItemsSnapshot.forEach(async (docSnapshot) => {
                const listingRef = doc(db, "listed_items", docSnapshot.id);
                await updateDoc(listingRef, { isActive: true });
            });
        } else {
            console.warn("No matching listing found in 'listed_items'.");
        }

        alert("Rental cancelled and listing reactivated.");

        // Refresh rental history
        const user = auth.currentUser;
        if (user) {
            showRentalHistory(user.uid);
        }

    } catch (error) {
        console.error("Error cancelling rental:", error);
        alert("Failed to cancel the rental. Please try again.");
    }
}