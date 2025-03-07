const chatMessages = document.getElementById('chat-messages');
const userInput = document.getElementById('user-input');
const chatHistoryList = document.getElementById('chat-history-list');

let chats = [];
let currentChatIndex = -1;

userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

function saveChat(messages) {
    const chat = {
        id: Date.now(),
        messages: messages,
        firstMessage: messages[0]?.content || 'New Chat'
    };
    chats.push(chat);
    currentChatIndex = chats.length - 1;
    updateChatHistory();
    return chat;
}

function updateChatHistory() {
    chatHistoryList.innerHTML = '';
    chats.forEach((chat, index) => {
        const chatItem = document.createElement('div');
        chatItem.className = `chat-history-item ${index === currentChatIndex ? 'active' : ''}`;
        chatItem.textContent = chat.firstMessage;
        chatItem.onclick = () => loadChat(index);
        chatHistoryList.appendChild(chatItem);
    });
}

function loadChat(index) {
    if (index === currentChatIndex) return;

    const currentMessages = Array.from(chatMessages.children).map(msg => ({
        content: msg.textContent,
        isUser: msg.classList.contains('user-message')
    }));
    
    if (currentMessages.length > 0 && currentChatIndex === -1) {
        saveChat(currentMessages);
    }
    
    currentChatIndex = index;
    chatMessages.innerHTML = '';
    
    chats[index].messages.forEach(msg => {
        addMessage(msg.content, msg.isUser);
    });
    
    updateChatHistory();
}

function addMessage(message, isUser) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user-message' : 'bot-message'}`;
    messageDiv.textContent = message;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function clearChat() {
    chatMessages.innerHTML = '';
    currentChatIndex = -1;
    updateChatHistory();
}

function newChat() {

    const currentMessages = Array.from(chatMessages.children).map(msg => ({
        content: msg.textContent,
        isUser: msg.classList.contains('user-message')
    }));
    
    if (currentMessages.length > 0) {
        saveChat(currentMessages);
    }
    
    clearChat();
    addMessage("Hello! How can I help you today?", false);
}

async function sendMessage() {
    const message = userInput.value.trim();
    if (!message) return;

    addMessage(message, true);
    userInput.value = '';

    try {
        const response = await fetch('/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message }),
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        addMessage(data.reply, false);
        

        const currentMessages = Array.from(chatMessages.children).map(msg => ({
            content: msg.textContent,
            isUser: msg.classList.contains('user-message')
        }));
        
        if (currentChatIndex === -1) {
            saveChat(currentMessages);
        } else {
            chats[currentChatIndex].messages = currentMessages;
            updateChatHistory();
        }
    } catch (error) {
        console.error('Error:', error);
        addMessage('Sorry, something went wrong. Please try again.', false);
    }
}