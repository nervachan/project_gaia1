# Loader Utility Usage Guide

## Overview

This project includes a reusable loader utility (`loader.js`) that provides consistent loading feedback for all asynchronous operations and button clicks. The loader displays a spinner overlay with customizable messages during async operations.

## Features

- **Global loader instance** - Single loader for entire application
- **Automatic show/hide** - Loader automatically shows before async operations and hides after completion/error
- **Customizable messages** - Each operation can have its own loading message
- **Error handling** - Loader automatically hides on errors
- **Tailwind CSS styling** - Modern, responsive design

## Usage

### 1. Import the Loader

```javascript
import { loader } from './loader.js';
```

### 2. Basic Usage with Async Operations

#### Option A: Using `withLoader` wrapper (Recommended)

```javascript
// Wrap your async function with loader
await loader.withLoader(async () => {
    // Your async operation here
    const result = await someAsyncOperation();
    return result;
}, "Loading data...");
```

#### Option B: Manual show/hide

```javascript
try {
    loader.show("Loading...");
    const result = await someAsyncOperation();
    // Handle result
} catch (error) {
    console.error(error);
} finally {
    loader.hide();
}
```

### 3. Integration Examples

#### Firebase Operations

```javascript
// Firestore operations
await loader.withLoader(async () => {
    const docRef = await addDoc(collection(db, 'items'), data);
    return docRef;
}, "Creating item...");

// Authentication
await loader.withLoader(async () => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
}, "Signing in...");
```

#### Form Submissions

```javascript
document.getElementById('myForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    await loader.withLoader(async () => {
        // Validate and submit form
        await submitFormData();
        alert('Form submitted successfully!');
    }, "Submitting form...");
});
```

#### Button Click Handlers

```javascript
document.getElementById('actionButton').addEventListener('click', async () => {
    await loader.withLoader(async () => {
        // Your async action here
        await performAction();
    }, "Processing action...");
});
```

## Files Updated with Loaders

The following files have been updated to use the loader utility:

### Authentication & Registration
- `loginHandler.js` - Login operations
- `register-buyer.js` - Buyer registration
- `register-seller.js` - Seller registration

### Profile Management
- `buyer-edit-profile.js` - Buyer profile updates
- `seller-edit-profile.js` - Seller profile updates

### Listing Operations
- `create-listing-handler.js` - Create new listings
- `rent-item.js` - Rent items and fetch listing data

### History & Reviews
- `show-history.js` - Buyer rental history and reviews
- `seller-show-history.js` - Seller rental history and reviews (if exists)

## Loader Configuration

The loader is configured with:
- **Spinner animation** - CSS-based rotating spinner
- **Dark overlay** - Semi-transparent background
- **Centered content** - Always centered on screen
- **Responsive design** - Works on all screen sizes

## Best Practices

1. **Always use `withLoader`** for async operations - it handles errors and cleanup automatically
2. **Provide meaningful messages** - Users should know what's happening
3. **Keep messages concise** - 2-3 words max for common operations
4. **Handle errors appropriately** - The loader will hide automatically on errors

## Common Loading Messages

- "Loading..." - Generic loading
- "Signing in..." - Authentication
- "Registering..." - Account creation
- "Saving..." - Data updates
- "Processing..." - Form submissions
- "Loading profile..." - Profile data
- "Loading listings..." - Fetching items
- "Submitting review..." - Review operations

## Troubleshooting

### Loader Not Showing
- Ensure `loader.js` is imported correctly
- Check if the async operation is actually being called
- Verify no errors are occurring before the loader shows

### Loader Not Hiding
- Ensure `loader.withLoader` is used or manual `loader.hide()` is called
- Check for unhandled promise rejections
- Verify all async operations complete (success or error)

### Styling Issues
- Loader uses Tailwind CSS classes - ensure Tailwind is properly configured
- Check for conflicting CSS that might override loader styles

## Adding Loaders to New Files

When creating new JavaScript files with async operations:

1. Import the loader: `import { loader } from './loader.js';`
2. Wrap async operations with `loader.withLoader()`
3. Provide appropriate loading messages
4. Test the flow to ensure proper loading feedback

## Example Template

```javascript
import { loader } from './loader.js';

// Example async function with loader
async function performAsyncOperation() {
    await loader.withLoader(async () => {
        // Your async code here
        const result = await someAsyncFunction();
        // Handle result
    }, "Processing operation...");
}

// Example event listener with loader
document.getElementById('myButton').addEventListener('click', async () => {
    await loader.withLoader(async () => {
        await performAsyncOperation();
    }, "Processing...");
});
```
