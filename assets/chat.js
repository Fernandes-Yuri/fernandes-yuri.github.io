/* --- JavaScript para o Widget de Chat (Versão RASA) --- */

document.addEventListener('DOMContentLoaded', () => {

    // --- 1. SELETORES DO DOM ---
    const chatLauncher = document.getElementById('chat-launcher');
    const chatWidget = document.getElementById('chat-widget');
    const chatCloseBtn = document.getElementById('chat-close-btn');
    const chatMessages = document.getElementById('chat-messages');
    const chatInput = document.getElementById('chat-input');
    const chatSendBtn = document.getElementById('chat-send-btn');

    // --- 2. URL DO SEU SERVIDOR RASA ---
    // !!! IMPORTANTE: Mude esta URL para o endereço do seu servidor RASA
    const RASA_SERVER_URL = "http://localhost:5005/webhooks/rest/webhook";

    // --- 3. SENDER ID (ID do Usuário) ---
    const SENDER_ID = "user_" + Math.random().toString(36).substring(2, 15);

    
    // --- 4. FUNÇÕES DO CHAT ---

    /**
     * Adiciona uma bolha de mensagem na tela
     */
    function addMessage(sender, text) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('chat-message');
        
        if (sender === 'user') {
            messageElement.classList.add('msg-user');
        } else {
            messageElement.classList.add('msg-bot');
        }
        
        messageElement.textContent = text;
        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    /**
     * Envia a mensagem do usuário para o servidor RASA
     */
    async function sendMessageToRasa(messageText) {
        try {
            const response = await fetch(RASA_SERVER_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    "sender": SENDER_ID,
                    "message": messageText
                })
            });

            if (!response.ok) throw new Error(`Erro na rede: ${response.status}`);

            const rasaResponses = await response.json();
            
            rasaResponses.forEach(botMessage => {
                if (botMessage.custom && botMessage.custom.action === "transfer_human") {
                    handleWhatsAppTransfer(botMessage.text);
                } else if (botMessage.text) {
                    addMessage('bot', botMessage.text);
                }
            });

        } catch (error) {
            console.error("Erro ao falar com o RASA:", error);
            addMessage('bot', "Desculpe, estou com problemas de conexão. Tente novamente mais tarde.");
        }
    }

    /**
     * Cuida da transferência para o WhatsApp
     */
    function handleWhatsAppTransfer(text) {
        const transferText = text || "Entendido. Estou transferindo você para um especialista no WhatsApp.";
        addMessage('bot', transferText);

        // Link do WhatsApp do seu index.html
        const whatsappLink = "https://wa.me/5511965438698?text=Ol%C3%A1%2C%20gostaria%20de%20saber%20mais%20informa%C3%A7%C3%B5es%20sobre%20os%20m%C3%A9todos%20propostos%20pelo%20Projeto%20Leumas.";
        
        setTimeout(() => {
            window.open(whatsappLink, '_blank');
        }, 1000); // Espera 1 segundo antes de abrir
    }

    /**
     * Lida com o envio da mensagem (Click no botão ou Enter)
     */
    function handleSendMessage() {
        const text = chatInput.value.trim();
        if (text === "") return;

        addMessage('user', text);
        sendMessageToRasa(text);
        chatInput.value = "";
    }


    // --- 5. "ESCUTADORES" DE EVENTOS (EVENT LISTENERS) ---

    // === MUDANÇA (Esconde o ícone ao abrir) ===
    // Abrir o chat
    chatLauncher.addEventListener('click', () => {
        chatWidget.classList.add('active'); 
        chatLauncher.classList.add('hidden'); // Esconde o ícone
        
        // Se for a primeira vez abrindo, manda um "oi" do bot
        if (chatMessages.children.length === 0) {
            sendMessageToRasa("oi"); 
        }
    });

    // === MUDANÇA (Mostra o ícone ao fechar) ===
    // Fechar o chat
    chatCloseBtn.addEventListener('click', () => {
        chatWidget.classList.remove('active');
        chatLauncher.classList.remove('hidden'); // Mostra o ícone novamente
    });

    // Enviar mensagem com o botão
    chatSendBtn.addEventListener('click', handleSendMessage);

    // Enviar mensagem com "Enter"
    chatInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            handleSendMessage();
        }
    });

});