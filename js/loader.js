// Loader utility for showing/hiding loading spinners during async operations

class Loader {
    constructor() {
        this.loaderElement = null;
        this.createLoader();
    }

    createLoader() {
        // Create loader element if it doesn't exist
        if (!document.getElementById('global-loader')) {
            const loaderHTML = `
                <div id="global-loader" class="fixed inset-0 bg-black bg-opacity-50 hidden items-center justify-center z-50">
                    <div class="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center">
                        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-3"></div>
                        <p class="text-gray-700 font-medium">Loading...</p>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', loaderHTML);
            this.loaderElement = document.getElementById('global-loader');
        } else {
            this.loaderElement = document.getElementById('global-loader');
        }
    }

    show(message = 'Loading...') {
        if (this.loaderElement) {
            const messageElement = this.loaderElement.querySelector('p');
            if (messageElement) {
                messageElement.textContent = message;
            }
            this.loaderElement.classList.remove('hidden');
        }
    }

    hide() {
        if (this.loaderElement) {
            this.loaderElement.classList.add('hidden');
        }
    }

    // Utility method to wrap async operations with loader
    async withLoader(asyncFn, message = 'Loading...') {
        try {
            this.show(message);
            const result = await asyncFn();
            return result;
        } catch (error) {
            console.error('Error during async operation:', error);
            throw error;
        } finally {
            this.hide();
        }
    }
}

// Create global instance
const loader = new Loader();

// Export for use in modules
export { loader };
