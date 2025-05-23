// Import Firebase libraries and initialize Firestore
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getFirestore, collection, getDocs, query, where, updateDoc, doc } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";
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

// Function to fetch and display user-specific listings from "listed_items"
async function fetchUserListings() {
    const user = auth.currentUser;
    const userId = user ? user.uid : null;

    if (!userId) {
        console.log("No user is logged in.");
        return;
    }

    const listingsContainer = document.getElementById("activeListings");
    listingsContainer.innerHTML = "<p>Loading...</p>";

    try {
        const listingsQuery = query(collection(db, "listed_items"), where("sellerId", "==", userId));
        const listingsSnapshot = await getDocs(listingsQuery);
        listingsContainer.innerHTML = ""; // Clear loading text

        if (listingsSnapshot.empty) {
            listingsContainer.innerHTML = "<p>No listings found for this user.</p>";
            return;
        }

        for (const docSnapshot of listingsSnapshot.docs) {
            const listingData = docSnapshot.data();

            // Skip listings where isActive is false
            if (!listingData.isActive) {
                continue;
            }

            const itemDiv = document.createElement("div");
            itemDiv.className = "bg-white shadow-md rounded p-6 mb-4";

            const images = listingData.images || [];
            let carouselHtml = '';

            if (images.length > 1) {
                carouselHtml = `
                    <div class="relative">
                        <div class="overflow-hidden relative">
                            <div class="flex transition-transform duration-300 ease-in-out" id="carousel-${docSnapshot.id}">
                                ${images.map((img, index) => `
                                    <div class="carousel-item w-full ${index === 0 ? 'block' : 'hidden'}">
                                        <img src="${img}" alt="${listingData.productName}" class="w-full h-48 object-cover rounded-md">
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                        <button class="absolute top-1/2 left-0 transform -translate-y-1/2 bg-gray-800 text-white p-2 rounded-full cursor-pointer" id="prev-${docSnapshot.id}">&lt;</button>
                        <button class="absolute top-1/2 right-0 transform -translate-y-1/2 bg-gray-800 text-white p-2 rounded-full cursor-pointer" id="next-${docSnapshot.id}">&gt;</button>
                    </div>
                `;
            } else if (images.length === 1) {
                carouselHtml = `<img src="${images[0]}" alt="${listingData.productName}" class="w-full h-48 object-cover rounded-md">`;
            }

            itemDiv.innerHTML = `
                ${carouselHtml}
                <div class="p-4">
                    <br>
                    <p class="text-gray-700 mt-2">${listingData.category}</p>
                    <h3 class="text-xl font-semibold text-gray-800">${listingData.productName}</h3>
                    ${listingData.garmentSize ? `<p class="text-gray-700 mt-2">Garment Size: ${listingData.garmentSize}</p>` : ''}
                    ${listingData.rentPrice ? `<p class="text-gray-700 mt-2">Rent Price: $${listingData.rentPrice}</p>` : ''}
                    <div class="flex justify-between mt-4">
                        <a href="#" class="inline-block py-2 px-6 bg-blue-600 text-white rounded-full text-sm hover:bg-blue-700 deactivate-btn" data-id="${docSnapshot.id}" data-listing='${JSON.stringify(listingData)}'>
                            Deactivate Listing
                        </a>
                        <button class="inline-block py-2 px-6 bg-orange-600 text-white rounded-full text-sm hover:bg-orange-700 edit-btn" data-id="${docSnapshot.id}">
                            Edit Listing
                        </button>
                    </div>
                </div>
            `;
            listingsContainer.appendChild(itemDiv);

            // Add event listener for the "Edit Listing" button
            const editButton = itemDiv.querySelector(".edit-btn");
            editButton.addEventListener("click", () => {
                window.location.href = `seller-edit-listing.html?id=${docSnapshot.id}`;
            });

            // Add event listeners for carousel navigation
            if (images.length > 1) {
                const prevButton = document.getElementById(`prev-${docSnapshot.id}`);
                const nextButton = document.getElementById(`next-${docSnapshot.id}`);
                const carousel = document.getElementById(`carousel-${docSnapshot.id}`);
                const items = carousel.querySelectorAll('.carousel-item');
                let currentIndex = 0;

                nextButton.addEventListener('click', () => {
                    currentIndex = (currentIndex + 1) % items.length;
                    updateCarousel();
                });

                prevButton.addEventListener('click', () => {
                    currentIndex = (currentIndex - 1 + items.length) % items.length;
                    updateCarousel();
                });

                function updateCarousel() {
                    items.forEach((item, index) => {
                        item.classList.toggle('block', index === currentIndex);
                        item.classList.toggle('hidden', index !== currentIndex);
                    });
                }
            }
        }

    } catch (error) {
        console.error("Error fetching user listings:", error);
        listingsContainer.innerHTML = "<p>Error loading listings. Please try again later.</p>";
    }
}

// Function to show the edit modal
// function showEditModal(listingId, listingData) {
//     const modal = document.getElementById("edit-modal");
//     const modalContent = modal.querySelector(".modal-content");

//     modalContent.innerHTML = `
//         <h2 class="text-xl font-semibold mb-4">Edit Listing</h2>
//         <form id="edit-listing-form">
//             <label class="block mb-2">Product Name:</label>
//             <input type="text" name="productName" value="${listingData.productName}" class="w-full p-2 border rounded mb-4">

//             <label class="block mb-2">Category:</label>
//             <input type="text" name="category" value="${listingData.category}" class="w-full p-2 border rounded mb-4">

//             <label class="block mb-2">Garment Size:</label>
//             <input type="text" name="garmentSize" value="${listingData.garmentSize || ''}" class="w-full p-2 border rounded mb-4">

//             <label class="block mb-2">Rent Price:</label>
//             <input type="number" name="rentPrice" value="${listingData.rentPrice || ''}" class="w-full p-2 border rounded mb-4">

//             <button type="submit" class="bg-blue-600 text-white py-2 px-4 rounded">Save Changes</button>
//         </form>
//     `;

//     modal.classList.remove("hidden");

    // Handle form submission
//     const form = modal.querySelector("#edit-listing-form");
//     form.addEventListener("submit", async (event) => {
//         event.preventDefault();

//         const formData = new FormData(form);
//         const updatedData = Object.fromEntries(formData.entries());

//         try {
//             // Update the listing in Firestore
//             await updateDoc(doc(db, "listed_items", listingId), updatedData);
//             console.log("Listing updated successfully!");
//             modal.classList.add("hidden");
//             fetchUserListings(); // Refresh the listings
//         } catch (error) {
//             console.error("Error updating listing:", error);
//         }
//     });

//     // Close the modal when clicking outside the content
//     modal.addEventListener("click", (event) => {
//         if (event.target === modal) {
//             modal.classList.add("hidden");
//         }
//     });
// }

// Listen for authentication state changes
onAuthStateChanged(auth, (user) => {
    if (user) {
        fetchUserListings();
    } else {
        console.log("User is not logged in.");
        const listingsContainer = document.getElementById("rentedItemsList");
        listingsContainer.innerHTML = "<p>You need to log in to view your listings.</p>";
    }
});

// Call fetchUserListings when the page loads, if the user is already logged in
document.addEventListener("DOMContentLoaded", () => {
    const user = auth.currentUser;
    if (user) {
        fetchUserListings();
    } else {
        console.log("User is not logged in yet.");
    }
});
