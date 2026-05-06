const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const downloadBtn = document.getElementById('download-btn');

const systemPrompt = "You are a helpful university campus chat assistant supporting staff and students at Federal University of Technology, Owerri (FUTO). Keep replies concise, relevant, and professional.";

const conversationHistory = [];

async function sendMessage() {
    const text = userInput.value.trim();
    if (!text) return;

    // Display User Message
    appendMessage('You', text, 'user-msg');
    userInput.value = '';
    sendBtn.disabled = true;

    // Push user input to history WITH timestamp
    conversationHistory.push({ 
        role: "user", 
        content: text,
        time: new Date().toLocaleTimeString() 
    });

    // Display "Typing" indicator
    const typingMsg = appendMessage('Campus AI', 'Typing...', 'bot-msg');

    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                system: systemPrompt,
                messages: conversationHistory.map(({ role, content }) => ({ role, content })) 
            })
        });

        const data = await response.json();
        
        
        if (!response.ok) throw new Error("Backend error"); 
        
        chatBox.removeChild(typingMsg);


        // Safely grab the reply using Groq/OpenAI's JSON structure
        const reply = data.choices?.[0]?.message?.content || "I'm unable to respond right now.";
        appendMessage('Campus AI', reply, 'bot-msg');

        // Always push, whether real reply or fallback
        conversationHistory.push({ 
            role: "assistant", 
            content: reply,
            time: new Date().toLocaleTimeString()
        });

    } catch (error) {
        chatBox.removeChild(typingMsg);
        
        appendMessage('System', 'Connection issue. Try again later.', 'bot-msg');
        
        // Roll back the user message that just failed so the history stays clean for retries
        conversationHistory.pop();
        
    } finally {
        sendBtn.disabled = false;
        userInput.focus();
    }
}

function appendMessage(sender, text, cssClass) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${cssClass}`;
    
    const label = document.createElement('strong');
    label.textContent = `${sender}: `;
    
    const content = document.createTextNode(text);
    
    msgDiv.appendChild(label);
    msgDiv.appendChild(content);
    
    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
    
    return msgDiv; 
}

// Event Listeners for Chat
sendBtn.addEventListener('click', sendMessage);
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

// --- EXPORT CHAT FEATURE ---
downloadBtn.addEventListener('click', () => {
    if (conversationHistory.length === 0) {
        alert("There are no messages to download yet!");
        return;
    }

    // Format the Header
    let chatLog = "=========================================\n";
    chatLog += "   CAMPUS AI - CHAT LOG\n";
    chatLog += "=========================================\n";
    chatLog += `Date: ${new Date().toDateString()}\n`;
    chatLog += `Total messages: ${conversationHistory.length}\n\n`;

    // Format the Messages
    conversationHistory.forEach(msg => {
        const senderName = msg.role === 'user' ? 'You' : 'Campus AI';
        chatLog += `[${msg.time}] ${senderName}: ${msg.content}\n\n`;
    });

    // Create File Download
    const blob = new Blob([chatLog], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    
    // Dynamic Filename
    const now = new Date().toISOString().slice(0, 10); 
    a.href = url;
    a.download = `campus-ai-transcript-${now}.txt`;
    
    document.body.appendChild(a);
    a.click();
    
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
});
