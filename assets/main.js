/* --- JavaScript Principal do Site (main.js) --- */

document.addEventListener('DOMContentLoaded', () => {

    // --- 1. LÓGICA DE ESCONDER O HEADER AO ROLAR ---
    const header = document.querySelector('.navbar');
    let lastScrollTop = 0; // Guarda a última posição do scroll

    // --- 2. LÓGICA DO BOTÃO "VOLTAR AO TOPO" ---
    const scrollToTopBtn = document.getElementById('scroll-to-top');


    // Escutador de evento de Scroll (controla os dois)
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


    // --- 3. AÇÃO DE CLICK DO BOTÃO "VOLTAR AO TOPO" ---
    scrollToTopBtn.addEventListener('click', (event) => {
        event.preventDefault(); // Impede que o '#' vá para a URL
        window.scrollTo({
            top: 0,
            behavior: 'smooth' // Rolagem suave
        });
    });

});