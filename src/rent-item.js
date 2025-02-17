// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-analytics.js";
import { getFirestore, collection, addDoc, doc } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js";

// Your web app's Firebase configuration
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
const analytics = getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth(app);

// Check if the user is logged in
onAuthStateChanged(auth, (user) => {
    if (user) {
        // User is logged in
        console.log('Logged in as: ' + user.email);
        // Assign the current user to a global variable for use
        window.currentUserId = user.uid;
    } else {
        // No user is logged in, alert the user
        alert("You need to log in first to rent an item.");
    }
});

// Add event listener for renting an item
document.getElementById('rent-item-btn').addEventListener('click', () => {
    if (!window.currentUserId) {
        // User is not logged in
        alert("You need to log in first to rent an item.");
        return;
    }

    const rentalDate = document.getElementById('rentalStartDate').value;
    const returnDate = document.getElementById('rentalEndDate').value;

    // Check if both dates are provided
    if (!rentalDate || !returnDate) {
        alert("Please select both rental and return dates.");
        return;
    }

    const buyerId = window.currentUserId; // Get the current logged-in user's ID
    const itemId = window.currentItemId;  // The item ID selected for rent
    const sellerId = window.currentSellerId;  // Seller's ID from the item details
    
    // Creating the rental request object for the seller's request collection
    const rentalRequest = {
        buyer_id: buyerId,
        seller_id: sellerId,
        item_id: itemId,
        status: 'pending', // Set status to 'pending' initially
        rental_date: rentalDate,
        return_date: returnDate
    };

    // Create a new rental request in the 'rental_requests' collection (for the seller)
    const rentalRequestsRef = collection(db, 'rental_requests');
    addDoc(rentalRequestsRef, rentalRequest)
        .then(() => {
            console.log("Rental request created successfully.");
            
            // Now, push the rental details to the logged-in buyer's rented items subcollection
            updateBuyerRentedItems(buyerId, itemId, rentalDate, returnDate);

            // Close the modal after the rental is confirmed
            rentModal.style.display = 'none';
            alert("Rental request sent successfully!");
        })
        .catch((error) => {
            console.error("Error creating rental request:", error);
            alert("Failed to send rental request.");
        });
});

// Function to update buyer's rented items subcollection
function updateBuyerRentedItems(buyerId, itemId, rentalDate, returnDate) {
    const buyerRef = doc(db, 'user-buyer', buyerId); // Reference to the buyer's document
    const rentedItemsRef = collection(buyerRef, 'rented_items'); // Subcollection of rented items

    // Creating the rental details object
    const rentalDetails = {
        item_id: itemId,
        rental_date: rentalDate,
        return_date: returnDate,
        status: 'pending', // Initially set the rental status as pending
    };

    // Add the rental details to the buyer's rented_items subcollection
    addDoc(rentedItemsRef, rentalDetails)
        .then(() => {
            console.log("Buyer rental history updated.");
        })
        .catch((error) => {
            console.error("Error updating buyer rental history:", error);
        });
}