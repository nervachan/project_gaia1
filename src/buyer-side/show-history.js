// Import necessary functions from Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getFirestore, getDoc, doc, setDoc, deleteDoc, updateDoc, query, collection, where, getDocs } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";
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

// Load rental history on page load
window.onload = () => {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            console.log("User is logged in:", user);
            showRentalHistory(user.uid); // Show history for the logged-in user
        } else {
            console.log("No user is logged in.");
        }
    });
};

// Show rental history for the logged-in user
async function showRentalHistory(userId) {
    const rentalHistoryContainer = document.getElementById('rentalHistoryContainer');
    rentalHistoryContainer.innerHTML = ''; // Clear previous content

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
    const reviewGiven = rentalData.reviewGiven || false;

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

                <!-- Show the review form if item is returned and no review is given -->
                <div class="reviews mt-4">
                    ${isReturned && !reviewGiven ? `
                        <h4 class="text-lg font-semibold text-gray-800">Leave a Review</h4>
                        <textarea id="buyerReviewText-${rentalData.id}" class="w-full p-2 border rounded-md mt-2" placeholder="Write your review..."></textarea>
                        <button class="bg-blue-500 text-white px-4 py-2 rounded-md mt-4" data-rental-id="${rentalData.id}" data-seller-id="${rentalData.sellerId}">Submit Review</button>
                    ` : ''}
                </div>
            </div>
        </div>
    `;

    // Add the event listener for the Submit Review button
    const submitReviewButton = rentalElement.querySelector('button');
    if (submitReviewButton) {
        submitReviewButton.addEventListener('click', (e) => {
            const rentalId = e.target.getAttribute('data-rental-id');
            const sellerId = e.target.getAttribute('data-seller-id');
            submitBuyerReview(rentalId, sellerId);
        });
    }

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
        // Step 1: Fetch the rental document to get the listingName and name
        const rentalRef = doc(db, "rentals", rentalId);
        const rentalSnapshot = await getDoc(rentalRef);

        if (!rentalSnapshot.exists()) {
            alert("Rental document not found!");
            return;
        }

        const rentalData = rentalSnapshot.data();
        const listingName = rentalData.listingName;  // Fetch the listingName from the rental
        const name = rentalData.name;  // Fetch the name from the rental

        // Step 2: Store the review in the 'reviews' collection, including the listingName, name, and other relevant data
        await setDoc(doc(db, "reviews", rentalId), {
            rentalId,
            sellerId,
            listingName,    // Add the listingName to the review entry
            name,           // Add the name to the review entry
            reviewText,
            reviewBy: "buyer",  // Indicate it's the buyer's review
            timestamp: new Date(),
        });

        // Step 3: Update the rental document to mark that the buyer has submitted a review
        await updateDoc(rentalRef, { reviewGiven: true });

        alert("Review submitted successfully!");

        // Refresh the rental history to reflect the review submission
        const user = auth.currentUser;
        if (user) {
            showRentalHistory(user.uid);
        }
    } catch (error) {
        // Properly handling errors by catching them and showing a message
        console.error("Error submitting buyer review:", error);
        alert("Failed to submit the review. Please try again.");
    }
}
