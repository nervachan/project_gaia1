// Function to open modal with pre-filled data
function openEditModal(listingData) {
    const modal = document.getElementById("editModal");
    const productNameInput = document.getElementById("editProductName");
    const categoryInput = document.getElementById("editCategory");
    const conditionInput = document.getElementById("editCondition");
    const rentPriceInput = document.getElementById("editRentPrice");
    const sellPriceInput = document.getElementById("editSellPrice");

    // Prefill the form fields with the existing data
    productNameInput.value = listingData.productName;
    categoryInput.value = listingData.category;
    conditionInput.value = listingData.condition;
    rentPriceInput.value = listingData.rentPrice || '';
    sellPriceInput.value = listingData.sellPrice || '';

    // Show the modal
    modal.classList.remove("hidden");

    // Event listener to handle form submission
    const submitBtn = document.getElementById("saveEditBtn");
    submitBtn.onclick = async () => {
        await saveEditedListing(listingData.id, {
            productName: productNameInput.value,
            category: categoryInput.value,
            condition: conditionInput.value,
            rentPrice: rentPriceInput.value,
            sellPrice: sellPriceInput.value,
        });
    };
}

// Function to save the edited listing data to Firestore
async function saveEditedListing(listingId, updatedData) {
    try {
        const listingRef = doc(db, "listed_items", listingId);

        // Update the document in Firestore
        await updateDoc(listingRef, updatedData);
        
        // Close the modal after saving the data
        closeEditModal();
        alert("Listing updated successfully!");
    } catch (error) {
        console.error("Error updating listing:", error);
        alert("Failed to update listing. Please try again.");
    }
}

// Function to close the modal
function closeEditModal() {
    const modal = document.getElementById("editModal");
    modal.classList.add("hidden");
}

// Adding event listener to close the modal if clicked outside the modal content
window.onclick = (event) => {
    const modal = document.getElementById("editModal");
    if (event.target === modal) {
        closeEditModal();
    }
};