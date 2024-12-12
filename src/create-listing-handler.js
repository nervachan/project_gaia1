// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-analytics.js";
import { getFirestore, collection, query, where, getDocs,addDoc } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";
import { getStorage, ref, uploadString, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-storage.js";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
const storage = getStorage(app);

// Get references to the form, modal, and buttons
document.addEventListener('DOMContentLoaded', () => {
    const createListingButton = document.getElementById('createListingButton');
    const confirmationModal = document.getElementById('confirmationModal');
    const cancelButton = document.getElementById('cancelButton');
    const confirmButton = document.getElementById('confirmButton');

    // Get references to the form fields
    const productName = document.getElementById('product-name');
    const productDescription = document.getElementById('product-description');
    const category = document.getElementById('category');
    const condition = document.getElementById('condition');
    const rentPrice = document.getElementById('rent-price');
    const sellPrice = document.getElementById('sell-price');
    const photos = document.getElementById('photos');

    // When the "Create Listing" button is clicked
    createListingButton.addEventListener('click', function() {
        // Show confirmation modal
        confirmationModal.classList.remove('hidden');
    });

    // If the user cancels, hide the modal
    cancelButton.addEventListener('click', function() {
        confirmationModal.classList.add('hidden');
    });

// If the user confirms, submit the form and store the data in Firestore
confirmButton.addEventListener('click', async function() {
    // Prepare the listing data
    const listingData = {
        productName: productName.value,
        productDescription: productDescription.value,
        category: category.value,
        condition: condition.value,
        rentPrice: rentPrice.value,
        sellPrice: sellPrice.value,
        isActive: true // Assuming you want to set the listing as active
    };

    // Convert the image file to base64 if selected
    const imageFile = photos.files[0];
    if (imageFile) {
        const reader = new FileReader();
        reader.onloadend = async function() {
            const img = new Image();
            img.src = reader.result;

            img.onload = async function() {
                // Create a canvas to downscale the image
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                // Set the desired width and height for the downscaled image
                const maxWidth = 800; // Set your desired max width
                const maxHeight = 800; // Set your desired max height
                let width = img.width;
                let height = img.height;

                // Calculate the new dimensions while maintaining the aspect ratio
                if (width > height) {
                    if (width > maxWidth) {
                        height *= maxWidth / width;
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width *= maxHeight / height;
                        height = maxHeight;
                    }
                }

                // Resize the canvas to the new dimensions
                canvas.width = width;
                canvas.height = height;

                // Draw the image onto the canvas
                ctx.drawImage(img, 0, 0, width, height);

                // Convert the canvas to a base64 string
                const downscaledImage = canvas.toDataURL('image/jpeg'); // You can change the format if needed
                listingData.image = downscaledImage; // Store the downscaled image

                // Now add the new listing to Firestore
                try {
                    await addDoc(collection(db, 'listed items'), listingData);
                    console.log("Listing added successfully!");

                    // Hide the modal and redirect to seller hub page
                    confirmationModal.classList.add('hidden');
                    window.location.href = 'seller-hub-main.html'; // Redirect to seller hub page
                } catch (error) {
                    console.error("Error adding document: ", error);
                }
            };
        };

        // Read the image file as base64
        reader.readAsDataURL(imageFile);
    } else {
        // If no image is selected, proceed without it
        try {
            // Add the new listing to Firestore
            await addDoc(collection(db, 'listed items'), listingData);
            console.log("Listing added successfully!");

            // Hide the modal and redirect to seller hub page
            confirmationModal.classList.add('hidden');
            window.location.href = 'seller-hub-main.html'; // Redirect to seller hub page
        } catch (error) {
            console.error("Error adding document: ", error);
        }
    }
});
});