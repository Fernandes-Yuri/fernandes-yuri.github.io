/* --- JavaScript para o Widget de Chat (Versão RASA - Profissional) --- */

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

    // --- 3. SENDER ID (Com Persistência) ---
    // Pega o ID da sessão ou cria um novo
    const SENDER_ID = getOrCreateSenderId();

    
    // --- 4. FUNÇÕES DO CHAT ---

    /**
     * Pega ou cria o Sender ID e o salva no sessionStorage
     * @returns {string} O ID do usuário para esta sessão
     */
    function getOrCreateSenderId() {
        let senderId = sessionStorage.getItem('rasa_sender_id');
        if (!senderId) {
            // Cria um ID aleatório
            senderId = "user_" + Math.random().toString(36).substring(2, 15);
            sessionStorage.setItem('rasa_sender_id', senderId);
        }
        return senderId;
    }

    /**
     * Carrega o histórico do chat do sessionStorage
     */
    function loadChatHistory() {
        const history = JSON.parse(sessionStorage.getItem('chat_history') || '[]');
        // Adiciona mensagens sem salvar novamente (terceiro param 'false')
        history.forEach(msg => addMessage(msg.sender, msg.text, false));
    }

    /**
     * Salva uma nova mensagem no histórico do sessionStorage
     * @param {string} sender - "user" ou "bot"
     * @param {string} text - O texto da mensagem
     */
    function saveMessageToHistory(sender, text) {
        const history = JSON.parse(sessionStorage.getItem('chat_history') || '[]');
        history.push({ sender, text });
        sessionStorage.setItem('chat_history', JSON.stringify(history));
    }

    /**
     * Adiciona uma bolha de mensagem na tela
     * @param {string} sender - "user" ou "bot"
     * @param {string} text - O texto da mensagem
     * @param {boolean} save - Se deve salvar no histórico
     */
    function addMessage(sender, text, save = true) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('chat-message');

        if (sender === 'user') {
            messageElement.classList.add('msg-user');
            messageElement.textContent = text; // Simples: só o texto
        } else {
            messageElement.classList.add('msg-bot');
            // Estrutura complexa: Avatar + Bolha de texto
            messageElement.innerHTML = `
                <div class="bot-avatar">
                    <img src="./assets/imagens/avatar.png" alt="Bot"> 
                </div>
                <div class="msg-bot-bubble"></div>
            `;
            // Adiciona o texto de forma segura
            messageElement.querySelector('.msg-bot-bubble').textContent = text;
        }
        
        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight; // Rola para o fim

        // Salva no histórico, se for uma mensagem nova
        if (save) {
            saveMessageToHistory(sender, text);
        }
    }

    /**
     * Mostra o indicador "digitando..."
     */
    function showTypingIndicator() {
        // Verifica se já existe para não duplicar
        if (document.getElementById('typing-indicator')) return;
        
        const typingElement = document.createElement('div');
        typingElement.id = 'typing-indicator';
        typingElement.classList.add('chat-message', 'msg-bot');
        // A estrutura do "digitando" também inclui o avatar
        typingElement.innerHTML = `
            <div class="bot-avatar">
                <img src="./assets/imagens/avatar.png" alt="Bot">
            </div>
            <div class="msg-bot-bubble typing-indicator">
                <span></span><span></span><span></span>
            </div>
        `;
        chatMessages.appendChild(typingElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    /**
     * Esconde o indicador "digitando..."
     */
    function hideTypingIndicator() {
        const typingElement = document.getElementById('typing-indicator');
        if (typingElement) {
            typingElement.remove();
        }
    }

    /**
     * Envia a mensagem do usuário para o servidor RASA
     * @param {string} messageText - O texto que o usuário digitou
     */
    async function sendMessageToRasa(messageText) {
        // Desabilita input e mostra "digitando..."
        chatInput.disabled = true;
        chatSendBtn.disabled = true;
        showTypingIndicator();

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
            
            // Esconde o "digitando..."
            hideTypingIndicator();

            rasaResponses.forEach(botMessage => {
                if (botMessage.custom && botMessage.custom.action === "transfer_human") {
                    handleWhatsAppTransfer(botMessage.text);
                } else if (botMessage.text) {
                    addMessage('bot', botMessage.text); // Salva por padrão
                }
            });

        } catch (error) {
            console.error("Erro ao falar com o RASA:", error);
            hideTypingIndicator(); // Esconde mesmo se der erro
            addMessage('bot', "Desculpe, estou com problemas de conexão. Tente novamente mais tarde.");
        } finally {
            // Reabilita o input, aconteça o que acontecer
            chatInput.disabled = false;
            chatSendBtn.disabled = false;
            chatInput.focus(); // Foca no input para o usuário digitar
        }
    }

    /**
     * Cuida da transferência para o WhatsApp
     */
    function handleWhatsAppTransfer(text) {
        const transferText = text || "Entendido. Estou transferindo você para um especialista no WhatsApp.";
        addMessage('bot', transferText); // Salva esta mensagem também

        const whatsappLink = "https://wa.me/5511965438698?text=Ol%C3%A1%C2%A0gostaria%C2%A0de%C2%A0saber%C2%A0mais%C2%A0informa%C3%A7%C3%B5es%C2%A0sobre%C2%A0os%C2%A0m%C3%A9todos%C2%A0propostos%C2%A0pelo%C2%A0Projeto%C2%A0Leumas.";
        
        setTimeout(() => {
            window.open(whatsappLink, '_blank');
        }, 1000); 
    }

    /**
     * Lida com o envio da mensagem (Click no botão ou Enter)
     */
    function handleSendMessage() {
        const text = chatInput.value.trim();
        if (text === "") return;

        addMessage('user', text); // Salva por padrão
        sendMessageToRasa(text);
        chatInput.value = "";
    }


    // --- 5. "ESCUTADORES" DE EVENTOS (EVENT LISTENERS) ---

    // Abrir o chat
    chatLauncher.addEventListener('click', () => {
        chatWidget.classList.add('active'); 
        chatLauncher.classList.add('hidden');
        
        // Manda o "oi" inicial apenas se o chat estiver vazio
        if (chatMessages.children.length === 0) {
            // Manda uma "mensagem inicial" para o RASA
            sendMessageToRasa("oi"); 
        }
        
        // Foca no input sempre que abrir
        chatInput.focus();
    });

    // Fechar o chat
    chatCloseBtn.addEventListener('click', () => {
        chatWidget.classList.remove('active');
        chatLauncher.classList.remove('hidden');
    });

    // Enviar mensagem com o botão
    chatSendBtn.addEventListener('click', handleSendMessage);

    // Enviar mensagem com "Enter"
    chatInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            handleSendMessage();
        }
    });

    // --- 6. INICIALIZAÇÃO ---
    // Carrega o histórico de chat assim que a página carregar
    loadChatHistory();
    
    // Se o chat já tiver histórico, manda a saudação do bot (se RASA estiver offline)
    // Se você *não* quiser essa saudação "offline" ao recarregar, comente a linha abaixo.
    if (chatMessages.children.length === 0) {
         addMessage('bot', 'Olá! Sou seu assistente virtual. Como posso te ajudar hoje?', false); // Não salva essa
    }

});