// Import Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import {
    getFirestore,
    collection,
    query,
    where,
    getDocs,
    doc,
    setDoc,
    deleteDoc,
    getDoc
} from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";
import {
    getAuth,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js";

// Firebase Configuration
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
const db = getFirestore();
const auth = getAuth();

// Fetch inactive listings for the logged-in seller
async function fetchInactiveListings() {
    const user = auth.currentUser;

    if (!user) {
        console.log("No user is logged in.");
        return;
    }

    const listingsContainer = document.getElementById('inactive-listings-container');
    listingsContainer.innerHTML = ''; // Clear existing content

    try {
        const q = query(collection(db, 'inactive_listings'), where('sellerId', '==', user.uid));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            listingsContainer.innerHTML = "<p>No inactive listings found.</p>";
            return;
        }

        for (const docSnap of querySnapshot.docs) {
            const listing = docSnap.data();
            const listingElement = createInactiveListingElement(listing, docSnap.id);
            listingsContainer.appendChild(listingElement);
        }
    } catch (error) {
        console.error("Error fetching inactive listings: ", error);
    }
}

// Create listing card with image/carousel and details
function createInactiveListingElement(listing, listingId) {
    const listingElement = document.createElement('div');
    listingElement.classList.add('bg-white', 'p-4', 'rounded-lg', 'shadow-lg', 'mb-6');

    let imageHTML = '';

    if (Array.isArray(listing.images) && listing.images.length > 0) {
        if (listing.images.length === 1) {
            imageHTML = `<img src="${listing.images[0]}" alt="${listing.productName}" class="w-full h-48 object-cover rounded-md mb-4">`;
        } else {
            const carouselId = `carousel-${listingId}`;
            const slides = listing.images.map((url, i) => `
                <div class="carousel-slide ${i === 0 ? 'block' : 'hidden'} transition-all duration-300 ease-in-out">
                    <img src="${url}" class="w-full h-auto object-cover rounded-md" alt="Slide ${i + 1}">
                </div>
            `).join('');

            const indicators = listing.images.map((_, i) => `
                <button type="button"
                    data-carousel-slide-to="${i}"
                    class="w-3 h-3 rounded-full bg-gray-300 hover:bg-gray-500 transition"
                    aria-label="Slide ${i + 1}">
                </button>
            `).join('');

            imageHTML = `
                <div id="${carouselId}" class="relative mb-4">
                    <div class="carousel-inner relative overflow-hidden rounded-md">
                        ${slides}
                    </div>
                    <div class="absolute inset-x-0 bottom-2 flex justify-center gap-2">
                        ${indicators}
                    </div>
                </div>
            `;
        }
    }

    listingElement.innerHTML = `
        ${imageHTML}
        <h3 class="text-xl font-semibold text-gray-900 mt-2">${listing.productName}</h3>
        <p class="text-gray-700 mt-2">Category: ${listing.category}</p>
        <p class="text-gray-700 mt-2">Terms: ${listing.condition}</p>
        ${listing.rentPrice ? `<p class="text-gray-700 mt-2">Rent Price: ₱${listing.rentPrice}</p>` : ''}
        ${listing.sellPrice ? `<p class="text-gray-700 mt-2">Selling Price: ₱${listing.sellPrice}</p>` : ''}
        <div class="mt-4 flex gap-4">
            <button class="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 relist-button" data-id="${listingId}">Re-list</button>
            <button class="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 delete-button" data-id="${listingId}">Delete</button>
        </div>
    `;

    if (Array.isArray(listing.images) && listing.images.length > 1) {
        setupCarousel(`carousel-${listingId}`);
    }

    return listingElement;
}

// Setup basic image carousel switching
function setupCarousel(carouselId) {
    const carousel = document.getElementById(carouselId);
    if (!carousel) return;

    const slides = carousel.querySelectorAll(".carousel-slide");
    const buttons = carousel.querySelectorAll("button[data-carousel-slide-to]");

    buttons.forEach((btn, index) => {
        btn.addEventListener("click", () => {
            slides.forEach(slide => slide.classList.add("hidden"));
            slides[index].classList.remove("hidden");
        });
    });
}

// Re-list item to listed_items collection
async function relistItem(listingId) {
    const user = auth.currentUser;

    if (!user) {
        console.log("No user is logged in.");
        return;
    }

    try {
        const listingRef = doc(db, 'inactive_listings', listingId);
        const listingSnap = await getDoc(listingRef);

        if (listingSnap.exists()) {
            const listingData = listingSnap.data();
            listingData.sellerId = user.uid;

            await setDoc(doc(db, 'listed_items', listingId), listingData);
            await deleteDoc(listingRef);

            console.log("Item re-listed successfully.");
            alert("Item has been re-listed successfully!"); // Show relisted alert
            fetchInactiveListings(); // Refresh the inactive listings
        } else {
            console.error("Listing not found.");
        }
    } catch (error) {
        console.error("Error re-listing item: ", error);
        alert("Failed to re-list the item. Please try again.");
    }
}

// Delete item from inactive_listings collection
async function deleteListing(listingId) {
    const user = auth.currentUser;

    if (!user) {
        console.log("No user is logged in.");
        return;
    }

    try {
        const listingRef = doc(db, 'inactive_listings', listingId);

        // Confirm before deleting
        const confirmation = confirm("Are you sure you want to delete this listing? This action cannot be undone.");
        if (!confirmation) {
            return; // Exit if the user cancels the action
        }

        await deleteDoc(listingRef);

        console.log("Listing deleted successfully.");
        alert("Listing has been deleted successfully!"); // Show delete success alert
        fetchInactiveListings(); // Refresh the inactive listings
    } catch (error) {
        console.error("Error deleting listing: ", error);
        alert("Failed to delete the listing. Please try again.");
    }
}

// Event delegation for relist buttons
document.body.addEventListener('click', (event) => {
    if (event.target.classList.contains('relist-button')) {
        const listingId = event.target.getAttribute('data-id');
        relistItem(listingId);
    }
});

// Event delegation for delete buttons
document.body.addEventListener('click', (event) => {
    if (event.target.classList.contains('delete-button')) {
        const listingId = event.target.getAttribute('data-id');
        deleteListing(listingId);
    }
});

// Auth state listener
onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log("User is logged in:", user);
        fetchInactiveListings();
    } else {
        console.log("No user is logged in.");
    }
});
