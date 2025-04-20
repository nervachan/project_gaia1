// Import necessary functions from Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getFirestore, collection, query, where, getDocs, getDoc, doc } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";
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

// Load rental history when the page loads
window.onload = () => {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            console.log("User is logged in:", user);
            showRentalHistory(user.uid); // Show rental history for the logged-in user
        } else {
            console.log("No user is logged in.");
        }
    });
};

// Show rental history for the logged-in user
async function showRentalHistory(userId) {
    const rentalHistoryContainer = document.getElementById('rentalHistoryContainer');
    rentalHistoryContainer.innerHTML = ''; // Clear the container

    try {
        // Query the 'rentals' collection for documents where the 'buyerId' matches the logged-in user's ID
        const rentalsQuery = query(collection(db, "rentals"), where('buyerId', '==', userId));
        const rentalsSnapshot = await getDocs(rentalsQuery);

        if (rentalsSnapshot.empty) {
            rentalHistoryContainer.innerHTML = '<p class="text-gray-500 text-center">No rental history found.</p>';
            return;
        }

        // Loop through the documents and display each rental item
        for (const docSnapshot of rentalsSnapshot.docs) {
            const rentalData = docSnapshot.data();
            const rentalElement = createRentalHistoryElement(rentalData);
            rentalHistoryContainer.appendChild(rentalElement);
        }
    } catch (error) {
        console.error("Error fetching rental history: ", error);
        rentalHistoryContainer.innerHTML = '<p class="text-red-500 text-center">Failed to load rental history. Please try again later.</p>';
    }
}

// Function to create rental history elements
function createRentalHistoryElement(rentalData) {
    const rentalElement = document.createElement('div');
    rentalElement.classList.add('bg-white', 'p-4', 'rounded-lg', 'shadow-lg', 'mb-4');

    // Check if the "image" field exists
    const imageUrl = rentalData.image || '';

    rentalElement.innerHTML = `
        <div class="flex">
            <!-- Image section -->
            <div class="w-32 h-32 mr-4">
                <img src="${imageUrl}" alt="${rentalData.productName}" class="w-full h-full object-cover rounded-lg">
            </div>
            
            <div class="flex-1">
                <h3 class="text-xl font-semibold text-gray-900">${rentalData.listingName}</h3>
                <p class="text-gray-700 mt-2">Start Date: ${rentalData.startDate}</p>
                <p class="text-gray-700 mt-2">End Date: ${rentalData.endDate}</p>
                <p class="text-gray-700 mt-2">Price: ₱${rentalData.finalPrice}</p>
                <p class="text-gray-700 mt-2">Status: ${rentalData.status}</p>
            </div>
        </div>
    `;

    return rentalElement;
}
