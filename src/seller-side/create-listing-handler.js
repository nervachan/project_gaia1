// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-analytics.js";
import { getFirestore, collection, doc, setDoc } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js";

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
    const size = document.getElementById('size'); // Garment size input field

    // Collect photo inputs
    const photoInputs = [
        document.getElementById('photo1'),
        document.getElementById('photo2'),
        document.getElementById('photo3'),
        document.getElementById('photo4'),
        document.getElementById('photo5')
    ];

    // When the "Create Listing" button is clicked
    createListingButton.addEventListener('click', function() {
        // Show confirmation modal
        confirmationModal.classList.remove('hidden');
    });

    // If the user cancels, hide the modal
    cancelButton.addEventListener('click', function() {
        confirmationModal.classList.add('hidden');
    });

    // Add validation logic before submitting the form
    confirmButton.addEventListener('click', async function () {
        // Get the current logged-in user
        const user = auth.currentUser;

        if (!user) {
            alert('You need to be logged in to create a listing.');
            return;
        }

        // Validate form inputs
        if (!productName.value.trim()) {
            alert('Product name is required.');
            return;
        }

        if (!productDescription.value.trim()) {
            alert('Product description is required.');
            return;
        }

        if (!category.value.trim()) {
            alert('Category is required.');
            return;
        }

        if (!rentPrice.value.trim() || parseFloat(rentPrice.value) <= 0) {
            alert('Rent price must be greater than 0.');
            return;
        }

        if (!size.value.trim()) {
            alert('Size is required.');
            return;
        }

        const imageFiles = [];
        photoInputs.forEach((input) => {
            if (input.files.length > 0) {
                imageFiles.push(input.files[0]);
            }
        });

        if (imageFiles.length === 0) {
            alert('At least one photo is required.');
            return;
        }

        const userId = user.uid; // Get the logged-in user's UID

        // Prepare the listing data
        const listingData = {
            productName: productName.value.trim(),
            productDescription: productDescription.value.trim(),
            category: category.value.trim(),
            rentPrice: parseFloat(rentPrice.value),
            isActive: true, // Assuming you want to set the listing as active
            garmentSize: size.value.trim(), // Include the garment size
            sellerId: userId // Add the user's ID to the listing data
        };

        // Generate a new document reference with a unique ID
        const listingsRef = collection(db, 'listed_items');
        const newListingRef = doc(listingsRef); // Create a new document reference
        const listingId = newListingRef.id; // Get the generated document ID
        listingData.listingId = listingId; // Add the document ID to the listing data

        // Process each image and convert to base64
        const imageBase64Array = [];

        for (const imageFile of imageFiles) {
            const reader = new FileReader();
            reader.onloadend = async function () {
                const img = new Image();
                img.src = reader.result;

                img.onload = async function () {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');

                    const maxWidth = 800;
                    const maxHeight = 800;
                    let width = img.width;
                    let height = img.height;

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

                    canvas.width = width;
                    canvas.height = height;

                    ctx.drawImage(img, 0, 0, width, height);

                    const downscaledImage = canvas.toDataURL('image/jpeg');
                    imageBase64Array.push(downscaledImage);

                    if (imageBase64Array.length === imageFiles.length) {
                        listingData.images = imageBase64Array;

                        try {
                            // Add the document to Firestore with the generated ID
                            await setDoc(newListingRef, listingData);
                            console.log("Listing added successfully!");

                            confirmationModal.classList.add('hidden');
                            window.location.href = 'seller-hub-main.html';
                        } catch (error) {
                            console.error("Error adding document: ", error);
                        }
                    }
                };
            };

            reader.readAsDataURL(imageFile);
        }
    });
});
