/* --- JavaScript de Controle de Modal (Clinicas) - Versão Detalhada --- */

document.addEventListener('DOMContentLoaded', () => {

    const modal = document.getElementById('clinic-modal');
    const modalBox = document.querySelector('.modal-box'); 
    const modalCloseBtn = document.getElementById('modal-close-btn');
    const modalTitle = document.getElementById('modal-title');
    const modalContent = document.getElementById('modal-content');
    const modalScrollTopBtn = document.getElementById('modal-scroll-top-btn'); 
    
    // DADOS DETALHADOS DAS CLÍNICAS (12 ESTADOS x 3 CLÍNICAS = 36 CLÍNICAS)
    const CLINIC_DATA = {
        'SP': {
            nome: "São Paulo",
            clinicas: [
                { nome: "Unidade Morumbi", desc: "Clínica de alto padrão na capital, foco em reabilitação executiva e TCC.", localizacao: "São Paulo - Morumbi", imagens: 4, tags: ["Alto Padrão", "Convênio"] },
                { nome: "Unidade Atibaia", desc: "Ambiente rural, terapias complementares e especialização em tratamento de alcoolismo.", localizacao: "Atibaia - Interior de SP", imagens: 3, tags: ["Feminino", "Rural"] },
                { nome: "Unidade Litoral", desc: "Foco em tratamento de longo prazo e grupos de apoio. Remoção 24h.", localizacao: "Santos - Litoral de SP", imagens: 3, tags: ["Involuntária", "Longo Prazo"] }
            ]
        },
        'MG': {
            nome: "Minas Gerais",
            clinicas: [
                { nome: "Fazenda Esperança", desc: "Foco em tranquilidade e ambiente rural. Excelente para recomeço.", localizacao: "Interior de MG (Próx. a BH)", imagens: 4, tags: ["Rural", "Voluntária"] },
                { nome: "Clínica de Comorbidades", desc: "Especializada em dupla patologia (adicção + transtornos mentais).", localizacao: "Belo Horizonte - MG", imagens: 3, tags: ["Psiquiatria", "Masculino"] },
                { nome: "Unidade Feminina Serra", desc: "Acolhimento exclusivo para mulheres em ambiente de serra.", localizacao: "Região da Serra - MG", imagens: 3, tags: ["Feminino", "TCC"] }
            ]
        },
        'RJ': {
            nome: "Rio de Janeiro",
            clinicas: [
                { nome: "Unidade Niterói Luxo", desc: "Clínica de luxo com vista para o mar e tratamento intensivo.", localizacao: "Niterói - RJ", imagens: 4, tags: ["Alto Padrão", "Feminino"] },
                { nome: "Reserva Terapêutica", desc: "Ambiente reservado e sigiloso na região serrana. Foco em traumas.", localizacao: "Petrópolis - RJ", imagens: 3, tags: ["Involuntária", "Longo Prazo"] },
                { nome: "Clínica de Crise 24h", desc: "Atendimento emergencial e intervenção imediata. Vaga garantida.", localizacao: "Nova Iguaçu - Baixada Fluminense", imagens: 3, tags: ["Remoção 24h", "Convênio"] }
            ]
        },
        'ES': { 
            nome: "Espírito Santo", 
            clinicas: [
                { nome: "Unidade Vitória", desc: "Foco em espiritualidade e terapia ocupacional. Próxima à capital.", localizacao: "Vitória - ES", imagens: 3, tags: ["Holístico", "Voluntária"] },
                { nome: "Unidade Rural ES", desc: "Ambiente reservado e tranquilo, ideal para desintoxicação.", localizacao: "Cariacica - ES", imagens: 2, tags: ["Rural", "Masculino"] },
                { nome: "Clínica Feminina ES", desc: "Acolhimento de médio prazo para dependência química.", localizacao: "Vila Velha - ES", imagens: 3, tags: ["Feminino", "TCC"] }
            ] 
        },
        'PR': { 
            nome: "Paraná", 
            clinicas: [
                { nome: "Centro de Reabilitação Sul", desc: "Programas de reinserção social e familiar. Foco em adolescentes.", localizacao: "Curitiba - PR", imagens: 4, tags: ["Adolescentes", "Familiar"] },
                { nome: "Unidade Curta Duração", desc: "Focada em estabilização e desintoxicação rápida.", localizacao: "Londrina - PR", imagens: 2, tags: ["Curta Duração", "Convênio"] },
                { nome: "Comunidade Terapêutica", desc: "Programa de 12 Passos com forte base comunitária.", localizacao: "Maringá - PR", imagens: 3, tags: ["12 Passos", "Voluntária"] }
            ] 
        },
        'SC': { 
            nome: "Santa Catarina", 
            clinicas: [
                { nome: "Unidade Holística de Luxo", desc: "Abordagens complementares, qualidade de vida e alto padrão.", localizacao: "Florianópolis - SC", imagens: 5, tags: ["Alto Padrão", "Holístico"] },
                { nome: "Clínica da Serra", desc: "Ambiente calmo e reservado, ideal para terapia intensiva.", localizacao: "Lages - SC", imagens: 3, tags: ["Rural", "Individual"] },
                { nome: "Centro Masculino", desc: "Reabilitação masculina focada em TCC e TRE.", localizacao: "Joinville - SC", imagens: 3, tags: ["Masculino", "TCC"] }
            ] 
        },
        'RS': { 
            nome: "Rio Grande do Sul", 
            clinicas: [
                { nome: "Unidade Porto Alegre", desc: "Clínica com atendimento psiquiátrico de ponta.", localizacao: "Porto Alegre - RS", imagens: 4, tags: ["Psiquiatria", "Involuntária"] },
                { nome: "Fazenda de Apoio", desc: "Foco em programas de 12 Passos e recuperação espiritual.", localizacao: "Caxias do Sul - RS", imagens: 3, tags: ["12 Passos", "Rural"] },
                { nome: "Clínica Feminina POA", desc: "Acolhimento exclusivo feminino, terapias de grupo.", localizacao: "Porto Alegre - RS", imagens: 2, tags: ["Feminino", "Voluntária"] }
            ] 
        },
        'BA': { 
            nome: "Bahia", 
            clinicas: [
                { nome: "Unidade Salvador", desc: "Foco em ambiente acolhedor e terapias de grupo.", localizacao: "Salvador - BA", imagens: 3, tags: ["Voluntária", "Feminino"] },
                { nome: "Clínica Litoral Norte", desc: "Tratamento de médio e longo prazo na Bahia.", localizacao: "Litoral Norte - BA", imagens: 3, tags: ["Longo Prazo", "TCC"] },
                { nome: "Centro Masculino BA", desc: "Reabilitação masculina focada em desintoxicação.", localizacao: "Feira de Santana - BA", imagens: 2, tags: ["Masculino", "Remoção"] }
            ] 
        },
        'PE': { 
            nome: "Pernambuco", 
            clinicas: [
                { nome: "Centro de Recuperação PE", desc: "Tratamento intensivo para dependência química no Nordeste.", localizacao: "Recife - PE", imagens: 4, tags: ["Involuntária", "Psiquiatria"] },
                { nome: "Unidade Feminina Recife", desc: "Acolhimento para mulheres com foco em comorbidades.", localizacao: "Recife - PE", imagens: 3, tags: ["Feminino", "Convênio"] },
                { nome: "Fazenda Sertão", desc: "Ambiente tranquilo, com foco na reinserção social.", localizacao: "Interior de PE", imagens: 3, tags: ["Rural", "Voluntária"] }
            ] 
        },
        'CE': { 
            nome: "Ceará", 
            clinicas: [
                { nome: "Unidade Fortaleza", desc: "Infraestrutura completa e programas de reabilitação de longo prazo.", localizacao: "Fortaleza - CE", imagens: 4, tags: ["Longo Prazo", "TCC"] },
                { nome: "Clínica Masculina CE", desc: "Acolhimento para homens, terapias em grupo e individuais.", localizacao: "Sobral - CE", imagens: 3, tags: ["Masculino", "12 Passos"] },
                { nome: "Unidade Holística CE", desc: "Foco em terapias alternativas e bem-estar.", localizacao: "Fortaleza - CE", imagens: 2, tags: ["Holístico", "Voluntária"] }
            ] 
        },
        'GO': { 
            nome: "Goiás", 
            clinicas: [
                { nome: "Clínica Alto Padrão GO", desc: "Foco em tratamento executivo e atendimento sigiloso.", localizacao: "Goiânia - GO", imagens: 4, tags: ["Alto Padrão", "Convênio"] },
                { nome: "Unidade Familiar", desc: "Tratamento focado na terapia familiar e apoio pós-alta.", localizacao: "Anápolis - GO", imagens: 3, tags: ["Familiar", "Voluntária"] },
                { nome: "Centro de Desintoxicação", desc: "Foco em estabilização e desintoxicação física rápida.", localizacao: "Goiânia - GO", imagens: 2, tags: ["Curta Duração", "Remoção"] }
            ] 
        },
        'DF': { 
            nome: "Distrito Federal", 
            clinicas: [
                { nome: "Unidade Asa Norte", desc: "Opções com foco em alto padrão e atendimento rápido no DF.", localizacao: "Brasília - Asa Norte", imagens: 4, tags: ["Alto Padrão", "TCC"] },
                { nome: "Clínica de Psiquiatria", desc: "Tratamento de comorbidades associadas à adicção.", localizacao: "Brasília - Asa Sul", imagens: 3, tags: ["Psiquiatria", "Involuntária"] },
                { nome: "Reserva de Reabilitação", desc: "Ambiente calmo e reservado para reabilitação masculina.", localizacao: "Taguatinga - DF", imagens: 3, tags: ["Masculino", "Longo Prazo"] }
            ] 
        }
    };
    
    // --- LÓGICA DE ABERTURA E GERAÇÃO DO MODAL ---
    
    // Abre o modal
    document.querySelectorAll('.open-modal-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const stateId = button.dataset.state;
            const data = CLINIC_DATA[stateId];

            if (data) {
                modalTitle.textContent = `Clínicas em ${data.nome} (${stateId})`;
                modalContent.innerHTML = ''; // Limpa o conteúdo anterior

                // Parágrafo introdutório no modal
                let htmlContent = `<p class="modal-intro-text">Encontramos ${data.clinicas.length} opções parceiras em ${data.nome}. Clique no botão abaixo para falar com um especialista e obter detalhes completos e disponibilidade de vagas.</p>`;
                
                data.clinicas.forEach((clinic, index) => {
                    // 1. Tags HTML
                    const tagsHtml = clinic.tags.map(tag => `<span class="clinic-tag">${tag}</span>`).join('');
                    
                    // 2. Galeria Placeholder
                    let galleryHtml = '';
                    for (let i = 1; i <= clinic.imagens; i++) {
                        // MUDANÇA AQUI: Aponta para a sua imagem "embreve.png"
                        const placeholderUrl = `./assets/imagens/embreve.png`; 
                        galleryHtml += `<div class="gallery-placeholder" style="background-image: url('${placeholderUrl}')"></div>`; // Removido o texto "Foto X"
                    }

                    // 3. Estrutura do Card Detalhado
                    htmlContent += `
                        <div class="clinic-detail-card">
                            <div class="card-info-header">
                                <h4>${clinic.nome}</h4>
                                <div class="clinic-tags">${tagsHtml}</div>
                            </div>
                            
                            <div class="card-content-grid">
                                
                                <div class="clinic-text-details">
                                    <p>${clinic.desc}</p>
                                    <div class="clinic-location">
                                        <strong>Localização:</strong> <span>${clinic.localizacao}</span>
                                    </div>
                                    <a target="_blank" href="https://wa.me/5511965438698?text=Ol%C3%A1,%20busco%20vagas%20na%20${clinic.nome}%20em%20${data.nome}." class="modal-cta-btn">Ver Detalhes e Vagas Imediatas</a>
                                </div>

                                <div class="clinic-gallery">
                                    <p class="gallery-title">Galeria de Imagens (Disponível em breve)</p>
                                    <div class="gallery-grid">
                                        ${galleryHtml}
                                    </div>
                                </div>
                                
                            </div>
                        </div>
                    `;
                });
                
                modalContent.innerHTML = htmlContent;
                modal.classList.add('visible');
                document.body.classList.add('modal-open'); // Previne o scroll no body
            }
        });
    });

    // Fecha o modal
    modalCloseBtn.addEventListener('click', () => {
        modal.classList.remove('visible');
        document.body.classList.remove('modal-open');
    });

    // Fecha se clicar fora
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('visible');
            document.body.classList.remove('modal-open');
        }
    });

    // --- Lógica de Scroll-to-Top ---
    if (modalBox && modalScrollTopBtn) {
        modalBox.addEventListener('scroll', () => {
            if (modalBox.scrollTop > 200) {
                modalScrollTopBtn.classList.add('visible');
            } else {
                modalScrollTopBtn.classList.remove('visible');
            }
        });

        modalScrollTopBtn.addEventListener('click', (e) => {
            e.preventDefault();
            modalBox.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

});