document.addEventListener('DOMContentLoaded', function() {
    // Create modal overlay using Tailwind classes
    const modalOverlay = document.createElement('div');
    modalOverlay.id = 'page-load-modal-overlay';
    modalOverlay.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';

    // Create modal content using Tailwind classes and add background image
    const modalContent = document.createElement('div');
    modalContent.className = 'relative p-8 rounded-lg shadow-lg flex flex-col items-center overflow-hidden bg-cover bg-center w-full max-w-xl min-h-[60vh]';
    modalContent.style.backgroundImage = "url('images/index_bg.png')";
    modalContent.innerHTML = `
        <div class="absolute inset-0 bg-white bg-opacity-80 z-0"></div>
        <div class="relative z-10 flex flex-col items-center">
            <h2 class="text-2xl font-bold mb-4">Welcome!</h2>
            <p class="mb-6 text-gray-700">This is a page load modal. Click below to continue.</p>
            <button id="close-page-load-modal" class="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">Close</button>
        </div>
    `;

    modalOverlay.appendChild(modalContent);
    document.body.appendChild(modalOverlay);

    document.getElementById('close-page-load-modal').onclick = function() {
        modalOverlay.remove();
    };
});