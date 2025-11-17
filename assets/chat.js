/* --- JavaScript para o Widget de Chat (Versão RASA) --- */

document.addEventListener('DOMContentLoaded', () => {

    // --- 1. SELETORES DO DOM ---
    // Seleciona os elementos principais
    const chatLauncher = document.getElementById('chat-launcher');
    const chatWidget = document.getElementById('chat-widget');
    const chatCloseBtn = document.getElementById('chat-close-btn');
    
    // Seleciona os elementos da conversa
    const chatMessages = document.getElementById('chat-messages');
    const chatInput = document.getElementById('chat-input');
    const chatSendBtn = document.getElementById('chat-send-btn');

    // --- 2. URL DO SEU SERVIDOR RASA ---
    // !!! IMPORTANTE: Mude esta URL para o endereço do seu servidor RASA
    const RASA_SERVER_URL = "http://localhost:5005/webhooks/rest/webhook";

    // --- 3. SENDER ID (ID do Usuário) ---
    // O RASA usa isso para saber que é a mesma pessoa conversando
    // Vamos gerar um ID aleatório simples para este exemplo
    const SENDER_ID = "user_" + Math.random().toString(36).substring(2, 15);

    
    // --- 4. FUNÇÕES DO CHAT ---

    /**
     * Adiciona uma bolha de mensagem na tela
     * @param {string} sender - "user" ou "bot"
     * @param {string} text - O texto da mensagem
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
        
        // Rola para a mensagem mais recente
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    /**
     * Envia a mensagem do usuário para o servidor RASA
     * @param {string} messageText - O texto que o usuário digitou
     */
    async function sendMessageToRasa(messageText) {
        try {
            const response = await fetch(RASA_SERVER_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    "sender": SENDER_ID,
                    "message": messageText
                })
            });

            if (!response.ok) {
                throw new Error(`Erro na rede: ${response.status}`);
            }

            const rasaResponses = await response.json();
            
            // O RASA pode retornar várias respostas
            rasaResponses.forEach(botMessage => {
                // VERIFICA SE O RASA MANDOU UM SINAL DE TRANSFERÊNCIA
                if (botMessage.custom && botMessage.custom.action === "transfer_human") {
                    handleWhatsAppTransfer(botMessage.text); // Usa o texto do RASA se houver
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
        // Mostra a mensagem de transferência
        const transferText = text || "Entendido. Estou transferindo você para um especialista no WhatsApp.";
        addMessage('bot', transferText);

        // O link que você já usa no seu site
        const whatsappLink = "https://wa.me/5511965438698?text=Ol%C3%A1%2C%20gostaria%20de%20saber%20mais%20informa%C3%A7%C3%B5es%20sobre%20os%20m%C3%A9todos%20propostos%20pelo%20Projeto%20Leumas.";
        
        // Abre o link em uma nova aba
        setTimeout(() => {
            window.open(whatsappLink, '_blank');
        }, 1000); // Espera 1 segundo antes de abrir
    }

    /**
     * Lida com o envio da mensagem (Click no botão ou Enter)
     */
    function handleSendMessage() {
        const text = chatInput.value.trim();
        
        if (text === "") {
            return; // Não envia mensagens em branco
        }

        addMessage('user', text);
        sendMessageToRasa(text);
        chatInput.value = ""; // Limpa o campo de input
    }


    // --- 5. "ESCUTADORES" DE EVENTOS (EVENT LISTENERS) ---

    // Abrir/Fechar o chat
    chatLauncher.addEventListener('click', () => {
        chatWidget.classList.toggle('active');
        // Se for a primeira vez abrindo, manda um "oi" do bot
        if (chatWidget.classList.contains('active') && chatMessages.children.length === 0) {
            // Manda uma "mensagem inicial" para o RASA
            // Isso aciona a saudação (ex: "intent_greet")
            sendMessageToRasa("oi"); 
        }
    });

    chatCloseBtn.addEventListener('click', () => {
        chatWidget.classList.remove('active');
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