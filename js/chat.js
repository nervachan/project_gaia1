
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getFirestore, collection, addDoc, setDoc, serverTimestamp, query, where, orderBy, onSnapshot, getDocs, doc, getDoc, deleteDoc, updateDoc, arrayUnion } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

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
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const chatsRef = collection(db, 'chats');

// DOM Elements
const messagesContainer = document.getElementById('messages');
const messageInput = document.getElementById('message-input');
const sendButton = document.getElementById('send-button');
const userList = document.getElementById('user-list');
const chatName = document.getElementById('chat-name');
const chatWindow = document.getElementById('chat-window');
const placeholder = document.getElementById('placeholder');
const newMessageBtn = document.getElementById('new-message-btn');
const modal = document.getElementById('new-message-modal');
const closeModalBtn = document.getElementById('close-modal-btn');
const modalUserList = document.getElementById('modal-user-list');



// App State
let currentUser;
let currentChatId = null;
let unsubscribeMessages;

// --- AUTHENTICATION ---
async function fetchUserProfile(uid) {
    const userBuyerRef = doc(db, 'user-buyer', uid);
    const userSellerRef = doc(db, 'user-seller', uid);

    let userDoc = await getDoc(userBuyerRef);
    if (!userDoc.exists()) {
        userDoc = await getDoc(userSellerRef);
    }

    return userDoc.exists() ? userDoc.data() : null;
}

onAuthStateChanged(auth, async (user) => {
    if (user) {
        const userProfile = await fetchUserProfile(user.uid);
        currentUser = { 
            ...user, 
            displayName: userProfile?.username || user.displayName || 'Anonymous' 
        };
        updateConversationsList();
    } else {
        window.location.href = 'index.html';
    }
});

// --- CHAT LOGIC ---
function switchChat(chatId, name) {
    if (unsubscribeMessages) {
        unsubscribeMessages();
    }
    currentChatId = chatId;
    chatName.textContent = name;
    messagesContainer.innerHTML = '';

    // Show chat window and hide placeholder
    chatWindow.classList.remove('hidden');
    placeholder.classList.add('hidden');

    listenForMessages(chatId);
}

function listenForMessages(chatId) {
    const messagesRef = collection(db, 'chats', chatId, 'messages');
    const q = query(messagesRef, orderBy('timestamp'));

    unsubscribeMessages = onSnapshot(q, (snapshot) => {
        messagesContainer.innerHTML = '';
        snapshot.forEach(doc => {
            renderMessage(doc.data());
        });
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    });
}

async function sendMessage() {
    const messageText = messageInput.value.trim();
    if (messageText && currentUser && currentChatId) {
        const messagesRef = collection(db, 'chats', currentChatId, 'messages');
        try {
            await addDoc(messagesRef, {
                text: messageText,
                uid: currentUser.uid,
                displayName: currentUser.displayName || 'Anonymous',
                timestamp: serverTimestamp()
            });
            messageInput.value = '';
        } catch (error) {
            console.error("Error sending message: ", error);
        }
    }
}

function renderMessage(message) {
    const messageWrapper = document.createElement('div');
    messageWrapper.classList.add('flex', 'mb-2');
    const isSentByCurrentUser = message.uid === currentUser.uid;

    if (message.isImage) {
        // Handle image messages
        if (isSentByCurrentUser) {
            messageWrapper.classList.add('justify-end');
            messageWrapper.innerHTML = `
                <div class="p-2 max-w-xs">
                    <img src="${message.text}" alt="Sent Image" class="rounded-lg max-w-full h-auto">
                </div>
            `;
        } else {
            messageWrapper.classList.add('justify-start');
            messageWrapper.innerHTML = `
                <div class="p-2 max-w-xs">
                    <p class="text-sm font-bold">${message.displayName}</p>
                    <img src="${message.text}" alt="Received Image" class="rounded-lg max-w-full h-auto">
                </div>
            `;
        }
    } else {
        // Handle text messages
        if (isSentByCurrentUser) {
            messageWrapper.classList.add('justify-end');
            messageWrapper.innerHTML = `
                <div class="bg-blue-500 text-white rounded-lg p-2 max-w-xs">
                    <p class="break-words">${message.text}</p>
                </div>
            `;
        } else {
            messageWrapper.classList.add('justify-start');
            messageWrapper.innerHTML = `
                <div class="bg-gray-200 rounded-lg p-2 max-w-xs">
                    <p class="text-sm font-bold">${message.displayName}</p>
                    <p class="break-words">${message.text}</p>
                </div>
            `;
        }
    }
    messagesContainer.appendChild(messageWrapper);
}

// --- CONVERSATION LIST LOGIC ---
function updateConversationsList() {
    const q = query(chatsRef, where('members', 'array-contains', currentUser.uid));

    onSnapshot(q, async (snapshot) => {
        const conversations = [];
        const filteredDocs = snapshot.docs.filter(doc => {
            const data = doc.data();
            // Hide conversation if the current user's UID is in the 'deletedBy' array
            return !data.deletedBy || !data.deletedBy.includes(currentUser.uid);
        });

        for (const doc of filteredDocs) {
            const chatData = doc.data();
            const otherMemberUid = chatData.members.find(uid => uid !== currentUser.uid);
            // For group chats, you'd need a chat name. For 1-on-1, we find the other user.
            let chatDisplayName = 'Chat';
            if (otherMemberUid) {
                const userProfile = await fetchUserProfile(otherMemberUid);
                const username = userProfile ? userProfile.username : `User ${otherMemberUid.substring(0, 6)}...`;
                chatDisplayName = `Chat with ${username}`;
            }
            conversations.push({ id: doc.id, name: chatDisplayName, ...chatData });
        }

        userList.innerHTML = '';
        conversations.forEach(chat => {
            const convoElement = document.createElement('li');
            convoElement.className = 'p-4 hover:bg-gray-100 cursor-pointer border-b flex justify-between items-center';
            convoElement.dataset.chatId = chat.id;
            convoElement.dataset.chatName = chat.name;

            const chatNameSpan = document.createElement('span');
            chatNameSpan.textContent = chat.name;
            convoElement.appendChild(chatNameSpan);

            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-btn text-gray-400 hover:text-red-500';
            deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
            deleteBtn.dataset.chatId = chat.id;
            convoElement.appendChild(deleteBtn);

            userList.appendChild(convoElement);
        });
    });
}



async function deleteConversation(chatId) {
    if (!chatId || !currentUser) return;

    try {
        const chatDocRef = doc(db, 'chats', chatId);
        await updateDoc(chatDocRef, {
            deletedBy: arrayUnion(currentUser.uid)
        });

        // If the deleted chat is the current one, reset the view
        if (currentChatId === chatId) {
            currentChatId = null;
            chatWindow.classList.add('hidden');
            placeholder.classList.remove('hidden');
        }
        // The conversation list will update automatically via the onSnapshot listener
    } catch (error) {
        console.error("Error hiding conversation: ", error);
        alert('Failed to hide conversation.');
    }
}

// --- MODAL LOGIC ---
async function openNewMessageModal() {
    modalUserList.innerHTML = '<li>Loading...</li>';
    modal.classList.remove('hidden');

    const userBuyerRef = collection(db, 'user-buyer');
    const userSellerRef = collection(db, 'user-seller');

    try {
        const [buyerSnapshot, sellerSnapshot] = await Promise.all([
            getDocs(userBuyerRef),
            getDocs(userSellerRef)
        ]);

        const allUsers = new Map();

        const processSnapshot = (snapshot) => {
            snapshot.forEach(doc => {
                const user = doc.data();
                // Use doc.id as the UID if user.uid field doesn't exist
                const uid = user.uid || doc.id;
                if (uid !== currentUser.uid && !allUsers.has(uid)) {
                    allUsers.set(uid, {
                        uid: uid,
                        displayName: user.username || user.displayName || 'Anonymous User',
                        ...user
                    });
                }
            });
        };

        processSnapshot(buyerSnapshot);
        processSnapshot(sellerSnapshot);

        modalUserList.innerHTML = '';
        if (allUsers.size === 0) {
            modalUserList.innerHTML = '<li>No users found.</li>';
            return;
        }

        allUsers.forEach(user => {
            const li = document.createElement('li');
            li.className = 'p-3 hover:bg-gray-100 cursor-pointer border-b';
            li.textContent = user.displayName;
            li.dataset.uid = user.uid;
            li.dataset.name = user.displayName;
            modalUserList.appendChild(li);
        });

    } catch (error) {
        console.error("Error fetching users:", error);
        modalUserList.innerHTML = '<li>Error loading users.</li>';
    }
}

async function createNewChat(otherUserUid, otherUserName) {
    modal.classList.add('hidden');

    // Create a consistent chat ID
    const chatId = currentUser.uid < otherUserUid ? `${currentUser.uid}_${otherUserUid}` : `${otherUserUid}_${currentUser.uid}`;
    
    // Check if chat already exists
    const chatDocRef = doc(db, 'chats', chatId);
    const docSnap = await getDoc(chatDocRef);

    if (!docSnap.exists()) {
        // Create new chat document
        await setDoc(chatDocRef, {
            members: [currentUser.uid, otherUserUid]
        });
    }

    switchChat(chatId, otherUserName);
}

// --- EVENT LISTENERS ---
sendButton.addEventListener('click', sendMessage);

messageInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') sendMessage();
});

userList.addEventListener('click', (event) => {
    const deleteButton = event.target.closest('.delete-btn');
    if (deleteButton) {
        event.stopPropagation();
        const chatId = deleteButton.dataset.chatId;
        if (confirm('Are you sure you want to delete this conversation?')) {
            deleteConversation(chatId);
        }
        return;
    }

    const target = event.target.closest('li');
    if (target && target.dataset.chatId) {
        const { chatId, chatName } = target.dataset;
        switchChat(chatId, chatName);
    }
});

newMessageBtn.addEventListener('click', openNewMessageModal);
closeModalBtn.addEventListener('click', () => modal.classList.add('hidden'));
modalUserList.addEventListener('click', (event) => {
    const target = event.target.closest('li');
    if (target && target.dataset.uid) {
        createNewChat(target.dataset.uid, target.dataset.name);
    }
});
