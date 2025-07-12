document.addEventListener('DOMContentLoaded', function() {

    // =========================================================================
    // CONFIGURACIÓN CENTRAL Y VARIABLES GLOBALES
    // =========================================================================
    const API_KEY = 'AIzaSyDy2PehGbmzaFB4S5-fWrRxXyFLZnirhqM'; // ¡RECUERDA USAR TU PROPIA CLAVE DE API!
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${API_KEY}`;

    function simpleMarkdownToHtml(text) {
        const titleMatch = text.match(/\*\*Título:\*\*(.*)/);
        const title = titleMatch ? titleMatch[1].trim() : 'Recomendación';
        const bodyMatch = text.match(/\*\*Cuerpo:\*\*(.*)/s);
        let body = bodyMatch ? bodyMatch[1].trim() : text;
        let html = `<span class="tag ai-rec">IA Recomienda</span><h1>${title}</h1>`;
        const sections = body.split('\n').filter(line => line.trim() !== '');
        html += '<div class="detail-section"><ul>';
        sections.forEach(line => {
            if (line.trim().startsWith('-') || line.trim().startsWith('*')) {
                html += `<li><span class="material-icons check-icon">check_circle</span>${line.trim().substring(1).trim()}</li>`;
            } else {
                html += '</ul><p>' + line.trim() + '</p><ul>'; 
            }
        });
        html += '</ul></div>';
        return html.replace(/<ul><\/ul>/g, '');
    }

    // =========================================================================
    // LÓGICA PARA EL PERFIL (perfil.html)
    // =========================================================================
    const interestsContainer = document.getElementById('interests-container');
    if (interestsContainer) {
        const saveInterestsBtn = document.getElementById('save-interests-btn');
        const savedInterests = JSON.parse(localStorage.getItem('userInterests')) || [];
        const interestItems = interestsContainer.querySelectorAll('.interest-item');
        interestItems.forEach(item => {
            if (savedInterests.includes(item.dataset.interest)) item.classList.add('active');
            item.addEventListener('click', () => item.classList.toggle('active'));
        });
        saveInterestsBtn.addEventListener('click', () => {
            const selectedInterests = Array.from(interestItems).filter(item => item.classList.contains('active')).map(item => item.dataset.interest);
            localStorage.setItem('userInterests', JSON.stringify(selectedInterests));
            alert('¡Tus intereses han sido guardados!');
        });
    }

    // =========================================================================
    // LÓGICA PARA RECOMENDACIONES DE IA (home.html)
    // =========================================================================
    const aiRecommendationsContainer = document.getElementById('ai-recommendations-container');
    if (aiRecommendationsContainer) {
        const userInterests = JSON.parse(localStorage.getItem('userInterests')) || [];
        if (userInterests.length > 0) {
            getAiRecommendations(userInterests);
        } else {
            aiRecommendationsContainer.innerHTML = `<div class="initial-state"><span class="material-icons">manage_accounts</span><p>¡Personaliza tu experiencia! Ve a tu <b>Perfil</b> y elige tus intereses.</p></div>`;
        }
    }

    async function getAiRecommendations(interests) {
        aiRecommendationsContainer.innerHTML = '<div class="spinner"></div>';
        const prompt = `Como el asistente "Conecta", genera 2 ideas de actividades para un joven en Perú con estos intereses: ${interests.join(', ')}. Para CADA idea, formatea la respuesta EXACTAMENTE así:\n**Título:** [Un título corto]\n**Cuerpo:** [Una descripción detallada]\n---`;
        try {
            const response = await fetch(API_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }) });
            if (!response.ok) throw new Error('Error de red');
            const data = await response.json();
            if (data.candidates && data.candidates.length > 0) {
                const aiText = data.candidates[0].content.parts[0].text;
                const recommendations = aiText.split('---').filter(rec => rec.trim() !== '');
                aiRecommendationsContainer.innerHTML = '';
                recommendations.forEach((rec, index) => {
                    const titleMatch = rec.match(/\*\*Título:\*\*(.*)/);
                    const title = titleMatch ? titleMatch[1].trim() : 'Recomendación Personalizada';
                    const key = `ai-rec-${Date.now()}-${index}`;
                    localStorage.setItem(key, rec);
                    const cardHTML = `<a href="detalle_ia.html?key=${key}" class="card-link"><div class="card ai-card"><div class="card-content"><span class="tag ai-rec">IA Recomienda</span><h4>${title}</h4><p>Haz clic para ver los detalles.</p></div></div></a>`;
                    aiRecommendationsContainer.innerHTML += cardHTML;
                });
            } else {
                aiRecommendationsContainer.innerHTML = '<p>No pude generar recomendaciones esta vez.</p>';
            }
        } catch (error) {
            console.error('Error en recomendación de IA:', error);
            aiRecommendationsContainer.innerHTML = '<p>Hubo un problema al conectar con la IA.</p>';
        }
    }

    // =========================================================================
    // LÓGICA PARA PÁGINA DE DETALLES DE IA (detalle_ia.html)
    // =========================================================================
    const aiDetailContainer = document.getElementById('ai-detail-content');
    if (aiDetailContainer) {
        const params = new URLSearchParams(window.location.search);
        const recommendationKey = params.get('key');
        const recommendationData = localStorage.getItem(recommendationKey);
        if (recommendationData) {
            aiDetailContainer.innerHTML = simpleMarkdownToHtml(recommendationData);
        } else {
            aiDetailContainer.innerHTML = '<h1>Error</h1><p>No se pudo encontrar la recomendación.</p>';
        }
    }

    // =========================================================================
    // LÓGICA PARA DETALLES DE EVENTOS (detalle_evento.html)
    // =========================================================================
    const opportunitiesData = {
        beca18: { category: 'Educación y Becas', tagClass: 'becas', title: 'Beca 18 – PRONABEC', subtitle: 'La oportunidad para transformar tu futuro.', image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1470&auto=format&fit=crop', sections: [ { icon: 'help_outline', title: '¿Qué es?', content: 'Es una beca completa que el Estado peruano otorga a jóvenes talentosos con recursos limitados para que estudien una carrera en una universidad o instituto de primer nivel.' }, { icon: 'card_giftcard', title: 'Beneficios Clave', content: '<ul><li>Costo total de matrícula y pensión.</li><li>Laptop nueva para tus estudios.</li><li>Apoyo para alimentación y movilidad.</li><li>Acompañamiento académico y emocional.</li></ul>' }, { icon: 'checklist', title: 'Requisitos Principales', content: '<ul><li>Alto rendimiento académico en el colegio.</li><li>Estar en 5to de secundaria o ser egresado reciente.</li><li>Acreditar condición de pobreza o pobreza extrema (SISFOH).</li></ul><p class="note"><i>Nota: Los requisitos pueden variar. ¡Siempre revisa la fuente oficial!</i></p>' } ], cta: { text: 'Ver Página Oficial de Beca 18', url: 'https://www.pronabec.gob.pe/beca-18/' } },
        concytec: { category: 'Tecnología y Ciencia', tagClass: 'tecnologia', title: 'Concursos Escolares – CONCYTEC', subtitle: 'Demuestra tu talento en ciencia y tecnología.', image: 'https://images.unsplash.com/photo-1554475901-4538ddfbccc2?q=80&w=1470&auto=format&fit=crop', sections: [ { icon: 'emoji_events', title: '¿Qué es?', content: 'Son concursos nacionales, como la feria "Eureka!", donde estudiantes de secundaria presentan proyectos de investigación en ciencia y tecnología.' }, { icon: 'card_giftcard', title: '¿Qué puedes ganar?', content: '<ul><li>Premios en efectivo y laptops.</li><li>Pasantías en centros de investigación.</li><li>Reconocimiento a nivel nacional.</li></ul>' } ], cta: { text: 'Conoce más sobre Eureka!', url: 'https://www.gob.pe/institucion/minedu/campa%C3%B1as/64666-feria-escolar-nacional-de-ciencia-y-tecnologia-eureka' } },
        cenfotur: { category: 'Emprendimiento', tagClass: 'emprendimiento', title: 'Talleres de Emprendimiento – CENFOTUR', subtitle: 'Aprende a crear tu propio negocio en el sector turismo.', image: 'https://images.unsplash.com/photo-1579532537598-459ecdaf39cc?q=80&w=1374&auto=format&fit=crop', sections: [ { icon: 'lightbulb', title: '¿Qué ofrecen?', content: 'Cursos y talleres gratuitos o de bajo costo sobre cómo iniciar emprendimientos en gastronomía, hotelería y turismo.' }, { icon: 'school', title: '¿Qué aprenderás?', content: '<ul><li>Creación de planes de negocio.</li><li>Marketing para turismo.</li><li>Gestión de pequeños restaurantes o alojamientos.</li></ul>' } ], cta: { text: 'Visita la web de CENFOTUR', url: 'https://www.cenfotur.edu.pe/' } },
        jovenesproductivos: { category: 'Formación Técnica', tagClass: 'trabajo', title: 'Jóvenes Productivos – MTPE', subtitle: 'Capacítate gratis para conseguir tu primer empleo formal.', image: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?q=80&w=1469&auto=format&fit=crop', sections: [ { icon: 'work', title: '¿En qué consiste?', content: 'Es un programa del Ministerio de Trabajo que te brinda capacitación técnica gratuita en oficios con alta demanda laboral y te conecta con oportunidades de empleo formal.' }, { icon: 'checklist', title: 'Requisitos', content: '<ul><li>Tener entre 15 y 29 años.</li><li>No estar trabajando ni estudiando actualmente.</li></ul>' } ], cta: { text: 'Inscríbete en Jóvenes Productivos', url: 'https://www.jovenesproductivos.gob.pe/inicio/' } },
        becaperu: { category: 'Educación y Becas', tagClass: 'becas', title: 'Beca Perú', subtitle: 'Cursos cortos y gratuitos para potenciar tus habilidades.', image: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=1470&auto=format&fit=crop', sections: [ { icon: 'help_outline', title: '¿Qué es?', content: 'Es una beca que ofrece cursos cortos, módulos o diplomados en institutos y universidades privadas, donados por estas instituciones.' }, { icon: 'school', title: '¿Qué tipo de cursos hay?', content: '<ul><li>Ofimática y herramientas digitales.</li><li>Inglés y otros idiomas.</li><li>Gestión de ventas y marketing.</li></ul>' } ], cta: { text: 'Revisa las convocatorias de Beca Perú', url: 'https://www.pronabec.gob.pe/beca-peru/' } }
    };
    const detailContent = document.getElementById('detail-main-content');
    if (detailContent) {
        const params = new URLSearchParams(window.location.search);
        const opportunityId = params.get('id');
        const data = opportunitiesData[opportunityId];
        if (data) {
            const imageContainer = document.getElementById('detail-image-container');
            imageContainer.innerHTML = `<img src="${data.image}" alt="${data.title}">`;
            let htmlContent = `<span class="tag ${data.tagClass}">${data.category}</span><h1>${data.title}</h1><p class="detail-subtitle">${data.subtitle}</p>`;
            data.sections.forEach(section => {
                htmlContent += `<div class="detail-section"><h3><span class="material-icons">${section.icon}</span>${section.title}</h3>${section.content}</div>`;
            });
            htmlContent += `<div class="cta-container"><a href="${data.cta.url}" target="_blank" class="cta-button">${data.cta.text}</a></div>`;
            detailContent.innerHTML = htmlContent;
        } else {
            detailContent.innerHTML = '<h1>Error</h1><p>La oportunidad que buscas no fue encontrada.</p>';
        }
    }

    // =========================================================================
    // LÓGICA PARA FILTROS (home.html)
    // =========================================================================
    const filterContainer = document.querySelector('.filter-container');
    if (filterContainer) {
        const filterButtons = filterContainer.querySelectorAll('.filter-btn');
        const opportunityCards = document.querySelectorAll('#feed-container .card-link');
        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                filterButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                const filter = button.dataset.filter;
                opportunityCards.forEach(card => {
                    card.classList.toggle('hidden', !(filter === 'all' || card.dataset.category === filter));
                });
            });
        });
    }
    
    // =========================================================================
    // LÓGICA PARA BÚSQUEDA INTELIGENTE (explorar.html)
    // =========================================================================
    const aiSearchContainer = document.getElementById('ai-search-results');
    if (aiSearchContainer) {
        const aiSearchInput = document.getElementById('ai-search-input');
        const aiSearchBtn = document.getElementById('ai-search-btn');
        const categoryCards = document.querySelectorAll('.category-card');
        async function performAiSearch(prompt) {
            aiSearchContainer.innerHTML = '<div class="spinner"></div>';
            const fullPrompt = `Eres "Conecta", un asistente para jóvenes en Perú. Actúa como un motor de búsqueda inteligente. Busca en tu conocimiento sobre el siguiente tema y presenta la información de forma clara y organizada. La búsqueda del usuario es: "${prompt}"`;
            try {
                const response = await fetch(API_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents: [{ parts: [{ text: fullPrompt }] }] }) });
                if (!response.ok) throw new Error('La respuesta de la red no fue exitosa.');
                const data = await response.json();
                if (data.candidates && data.candidates.length > 0) {
                    aiSearchContainer.innerHTML = simpleMarkdownToHtml(data.candidates[0].content.parts[0].text);
                } else {
                    aiSearchContainer.innerHTML = '<p>No pude encontrar resultados para tu búsqueda. Intenta con otras palabras.</p>';
                }
            } catch (error) {
                console.error('Error en la búsqueda con IA:', error);
                aiSearchContainer.innerHTML = '<p>¡Uy! Hubo un problema al conectar con la IA. Por favor, intenta de nuevo más tarde.</p>';
            }
        }
        aiSearchBtn.addEventListener('click', () => { if (aiSearchInput.value.trim()) performAiSearch(aiSearchInput.value.trim()); });
        aiSearchInput.addEventListener('keydown', (event) => { if (event.key === 'Enter' && aiSearchInput.value.trim()) performAiSearch(aiSearchInput.value.trim()); });
        categoryCards.forEach(card => {
            card.addEventListener('click', (event) => {
                event.preventDefault();
                const prompt = card.dataset.prompt;
                if (prompt) {
                    aiSearchInput.value = prompt;
                    performAiSearch(prompt);
                }
            });
        });
    }

    // =========================================================================
    // LÓGICA PARA EL CHAT CON IA (chat.html)
    // =========================================================================
    const chatBox = document.getElementById('chat-box');
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');

    async function getAiResponse(prompt) {
        const thinkingMessage = document.createElement('div');
        thinkingMessage.classList.add('chat-message', 'ai-message');
        thinkingMessage.innerHTML = `<p>Pensando...</p>`;
        chatBox.appendChild(thinkingMessage);
        chatBox.scrollTop = chatBox.scrollHeight;

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: `Eres "Conecta", un asistente virtual amigable y empático para adolescentes de secundaria en Perú. Tu misión es dar información útil y ánimo sobre oportunidades educativas, trabajo y salud mental. Usa un lenguaje claro, cercano y positivo. Responde de forma concisa. La pregunta del usuario es: "${prompt}"`
                        }]
                    }]
                })
            });

            chatBox.removeChild(thinkingMessage); 

            if (!response.ok) {
                throw new Error(`Error en la API: ${response.statusText}`);
            }

            const data = await response.json();
            
            if (data.candidates && data.candidates.length > 0) {
                const aiText = data.candidates[0].content.parts[0].text;
                addMessage(aiText, 'ai');
            } else {
                 addMessage('No he podido generar una respuesta esta vez. Inténtalo de nuevo.', 'ai');
            }

        } catch (error) {
            console.error('Error al contactar la IA:', error);
            if (chatBox.contains(thinkingMessage)) {
                chatBox.removeChild(thinkingMessage);
            }
            addMessage('¡Uy! Hubo un problema de conexión. Asegúrate de que tu clave de API sea correcta y revisa la consola (F12) para ver el error.', 'ai');
        }
    }
    
    function addMessage(message, sender) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('chat-message', `${sender}-message`);
        const formattedMessage = message.replace(/\n/g, '<br>');
        messageElement.innerHTML = `<p>${formattedMessage}</p>`;
        chatBox.appendChild(messageElement);
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    if (sendBtn && userInput) {
        sendBtn.addEventListener('click', () => { if (userInput.value.trim()) { addMessage(userInput.value.trim(), 'user'); getAiResponse(userInput.value.trim()); userInput.value = ''; userInput.style.height = 'auto'; } });
        userInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                if (userInput.value.trim()) { addMessage(userInput.value.trim(), 'user'); getAiResponse(userInput.value.trim()); userInput.value = ''; userInput.style.height = 'auto'; }
            }
        });
        userInput.addEventListener('input', () => {
            userInput.style.height = 'auto';
            userInput.style.height = (userInput.scrollHeight) + 'px';
        });
    }

});