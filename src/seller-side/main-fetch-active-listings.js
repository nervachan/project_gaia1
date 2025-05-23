import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getFirestore, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyC7eaM6HrHalV-wcG-I9_RZJRwDNhin2R0",
    authDomain: "project-gaia1.firebaseapp.com",
    projectId: "project-gaia1",
    storageBucket: "project-gaia1.appspot.com",
    messagingSenderId: "832122601643",
    appId: "1:832122601643:web:1ab91b347704174f52b7ee",
    measurementId: "G-DX2L33NH4H"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);
const auth = getAuth(app);

// Function to fetch and display active listings
async function fetchActiveListings() {
    const user = auth.currentUser;

    if (!user) {
        console.error("No user is logged in.");
        return;
    }

    const userId = user.uid;
    const activeListingsContainer = document.getElementById("active-listings");

    if (!activeListingsContainer) {
        console.error("Active listings container not found.");
        return;
    }

    activeListingsContainer.innerHTML = "<li>Loading...</li>";

    try {
        // Query the "listed_items" collection for active listings
        const listingsQuery = query(
            collection(db, "listed_items"),
            where("sellerId", "==", userId)
            
        );
        const listingsSnapshot = await getDocs(listingsQuery);

        activeListingsContainer.innerHTML = ""; // Clear loading text

        if (listingsSnapshot.empty) {
            activeListingsContainer.innerHTML = "<li>No active listings found.</li>";
            return;
        }

        // Counter for active listings
        let activeListingsCount = 0;

        // Loop through the active listings and display them
        listingsSnapshot.forEach((docSnapshot) => {
            const listingData = docSnapshot.data();
            const listingItem = document.createElement("li");
            listingItem.className = "text-blue-800 hover:underline cursor-pointer";
            listingItem.textContent = listingData.productName;

            // Increment the counter
            activeListingsCount++;

            // Append the listing item to the container
            activeListingsContainer.appendChild(listingItem);
        });

        // Display the total count of active listings
        const countElement = document.createElement("p");
        countElement.className = "text-gray-700 font-semibold mb-4";
        countElement.textContent = `Total Active Listings: ${activeListingsCount}`;
        activeListingsContainer.prepend(countElement); // Add the count before the list
    } catch (error) {
        console.error("Error fetching active listings:", error);
        activeListingsContainer.innerHTML = "<li>Error loading active listings. Please try again later.</li>";
    }
}

// Function to fetch and display pending listings
async function fetchPendingListings() {
    const user = auth.currentUser;

    if (!user) {
        console.error("No user is logged in.");
        return;
    }

    const userId = user.uid;
    const pendingListingsContainer = document.getElementById("pending-listings");

    if (!pendingListingsContainer) {
        console.error("Pending listings container not found.");
        return;
    }

    pendingListingsContainer.innerHTML = "<li>Loading...</li>";

    try {
        // Query the "pending_rentals" collection for pending listings
        const pendingQuery = query(
            collection(db, "pending_rentals"),
            where("sellerId", "==", userId)
        );
        const pendingSnapshot = await getDocs(pendingQuery);

        pendingListingsContainer.innerHTML = ""; // Clear loading text

        if (pendingSnapshot.empty) {
            pendingListingsContainer.innerHTML = "<li>No pending listings found.</li>";
            return;
        }

        // Counter for pending listings
        let pendingListingsCount = 0;

        // Loop through the pending listings and display them
        pendingSnapshot.forEach((docSnapshot) => {
            const listingData = docSnapshot.data();
            const listingItem = document.createElement("li");
            listingItem.className = "text-yellow-800 hover:underline cursor-pointer";
            listingItem.textContent = listingData.productName;

            // Increment the counter
            pendingListingsCount++;

            // Append the listing item to the container
            pendingListingsContainer.appendChild(listingItem);
        });

        // Display the total count of pending listings
        const countElement = document.createElement("p");
        countElement.className = "text-gray-700 font-semibold mb-4";
        countElement.textContent = `Total Pending Listings: ${pendingListingsCount}`;
        pendingListingsContainer.prepend(countElement); // Add the count before the list
    } catch (error) {
        console.error("Error fetching pending listings:", error);
        pendingListingsContainer.innerHTML = "<li>Error loading pending listings. Please try again later.</li>";
    }
}

// Function to fetch and display total earnings from rentals
async function fetchTotalEarnings() {
    const user = auth.currentUser;

    if (!user) {
        console.error("No user is logged in.");
        return;
    }

    const userId = user.uid;
    const inactiveListingsContainer = document.getElementById("inactive-listings");

    if (!inactiveListingsContainer) {
        console.error("Inactive listings container not found.");
        return;
    }

    inactiveListingsContainer.innerHTML = "<li>Loading...</li>";

    try {
        // Query the "rentals" collection for rentals by this seller
        const rentalsQuery = query(
            collection(db, "rentals"),
            where("sellerId", "==", userId)
        );
        const rentalsSnapshot = await getDocs(rentalsQuery);

        inactiveListingsContainer.innerHTML = ""; // Clear loading text

        if (rentalsSnapshot.empty) {
            inactiveListingsContainer.innerHTML = "<li>No rentals found.</li>";
            return;
        }

        // Sum up totalPrice from all rentals
        let totalEarnings = 0;
        rentalsSnapshot.forEach((docSnapshot) => {
            const rentalData = docSnapshot.data();
            const price = Number(rentalData.totalPrice) || 0;
            totalEarnings += price;
        });

        // Display the total earnings
        const earningsElement = document.createElement("p");
        earningsElement.className = "text-gray-700 font-semibold mb-4";
        earningsElement.textContent = `Total Earnings from Rentals: $${totalEarnings.toFixed(2)}`;
        inactiveListingsContainer.appendChild(earningsElement);
    } catch (error) {
        console.error("Error fetching rentals:", error);
        inactiveListingsContainer.innerHTML = "<li>Error loading rental earnings. Please try again later.</li>";
    }
}

// Function to fetch and display rental history
async function fetchRentalHistory() {
    const user = auth.currentUser;

    if (!user) {
        console.error("No user is logged in.");
        return;
    }

    const userId = user.uid;
    const rentalHistoryContainer = document.getElementById("rental-history");

    if (!rentalHistoryContainer) {
        console.error("Rental history container not found.");
        return;
    }

    rentalHistoryContainer.innerHTML = "<p>Loading...</p>";

    try {
        // Query the "rental_history" collection for the user's rental history
        const historyQuery = query(
            collection(db, "rental_history"),
            where("sellerId", "==", userId)
        );
        const historySnapshot = await getDocs(historyQuery);

        rentalHistoryContainer.innerHTML = ""; // Clear loading text

        if (historySnapshot.empty) {
            rentalHistoryContainer.innerHTML = "<p>No rental history found.</p>";
            return;
        }

        // Loop through the rental history and display each item
        historySnapshot.forEach((docSnapshot) => {
            const historyData = docSnapshot.data();
            const historyItem = document.createElement("div");
            historyItem.className = "p-4 bg-gray-100 rounded-lg shadow-sm";

            historyItem.innerHTML = `
                <h4 class="text-lg font-semibold text-gray-800">${historyData.listingName}</h4>
                <p class="text-gray-700">Rent Price: ${historyData.finalPrice}</p>
                <p class="text-gray-700">Status: <span class="font-semibold">${historyData.status}</span></p>
                <p class="text-gray-700">Rented To: ${historyData.name}</p>
            `;

            rentalHistoryContainer.appendChild(historyItem);
        });
    } catch (error) {
        console.error("Error fetching rental history:", error);
        rentalHistoryContainer.innerHTML = "<p>Error loading rental history. Please try again later.</p>";
    }
}

// Ensure the user is authenticated before fetching listings
onAuthStateChanged(auth, (user) => {
    if (user) {
        fetchActiveListings();
        fetchPendingListings();
        fetchTotalEarnings();
        fetchRentalHistory();
    } else {
        console.warn("User is not logged in.");
    }
});