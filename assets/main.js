/* --- JavaScript Principal do Site (main.js) --- */

document.addEventListener('DOMContentLoaded', () => {

    // --- 1. LÓGICA DE ESCONDER O HEADER AO ROLAR ---
    const header = document.querySelector('.navbar');
    let lastScrollTop = 0; // Guarda a última posição do scroll

    // --- 2. LÓGICA DO BOTÃO "VOLTAR AO TOPO" ---
    const scrollToTopBtn = document.getElementById('scroll-to-top');

    // --- 3. LÓGICA DO MODAL DA LEI 10.216 ---
    const lawModal = document.getElementById('law-modal');
    const lawModalOpenBtn = document.getElementById('open-law-modal');
    const lawModalCloseBtn = document.getElementById('law-modal-close-btn');

    // --- 4. ESCUTADOR DE EVENTO DE SCROLL (Controla Header e Botão Topo) ---
    window.addEventListener('scroll', () => {
        let currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;

        // --- Lógica do Header ---
        // Se o scroll for maior que a altura do header (aprox 150px)
        if (currentScrollTop > 150) {
            if (currentScrollTop > lastScrollTop) {
                // Rolando para BAIXO
                header.classList.add('navbar-hidden');
            } else {
                // Rolando para CIMA
                header.classList.remove('navbar-hidden');
            }
        }
        lastScrollTop = currentScrollTop <= 0 ? 0 : currentScrollTop; // Reseta no topo

        
        // --- Lógica do Botão "Voltar ao Topo" ---
        // Mostra o botão após rolar 300px
        if (currentScrollTop > 300) {
            scrollToTopBtn.classList.add('visible');
        } else {
            scrollToTopBtn.classList.remove('visible');
        }
    });


    // --- 5. AÇÃO DE CLICK DO BOTÃO "VOLTAR AO TOPO" ---
    scrollToTopBtn.addEventListener('click', (event) => {
        event.preventDefault(); // Impede que o '#' vá para a URL
        window.scrollTo({
            top: 0,
            behavior: 'smooth' // Rolagem suave
        });
    });


    // --- 6. LÓGICA DE FECHAR O MENU HAMBÚRGUER AO CLICAR ---
    
    // Seleciona a checkbox escondida que controla o menu
    const menuToggle = document.getElementById('menu-toggle');
    
    // Seleciona todos os links dentro do menu principal
    const menuLinks = document.querySelectorAll('.menu-principal a');

    // Adiciona um "escutador" de clique para cada link
    menuLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (menuToggle) {
                menuToggle.checked = false;
            }
        });
    });

    // --- 7. LÓGICA DO MODAL DA LEI ---
    if (lawModalOpenBtn && lawModal && lawModalCloseBtn) {

        // Abrir Modal
        lawModalOpenBtn.addEventListener('click', (e) => {
            e.preventDefault();
            lawModal.classList.add('visible');
            document.body.classList.add('modal-open');
        });

        // Fechar Modal (Botão X)
        lawModalCloseBtn.addEventListener('click', () => {
            lawModal.classList.remove('visible');
            document.body.classList.remove('modal-open');
        });

        // Fechar Modal (Clicar no Overlay)
        lawModal.addEventListener('click', (e) => {
            if (e.target === lawModal) {
                lawModal.classList.remove('visible');
                document.body.classList.remove('modal-open');
            }
        });
    }

});