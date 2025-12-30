const CONFIG = {
    'PT-BR': {
        url: './assets/itemData_traduzido.json',
        title: 'Free Fire Database <span class="highlight">BR</span>',
        subtitle: 'Explore a coleção completa de itens em Português!',
        searchPlaceholder: 'Pesquisar por ID ou Nome...',
        allTypes: 'Todos os Tipos',
        allCollections: 'Todas as Coleções',
        allTags: 'Todas as Atualizações',
        footerCopy: '© 2025 Ilanzera | Todos os direitos reservados',
        footerGarena: 'Este conteúdo não está afiliado a nenhuma parte da Garena ou do Free Fire.',
        footerEdu: 'Uso apenas para fins educacionais e para auxiliar na busca de itens dentro do jogo.',
        noItems: 'Nenhum item encontrado.',
        errorLoading: 'Erro ao carregar itens.',
        idPrefix: 'ID: ',
        noDescription: 'Sem descrição disponível.',
        unknownItem: 'Item Desconhecido'
    },
    'EN': {
        url: './assets/itemData.json',
        title: 'Free Fire Database <span class="highlight">EN</span>',
        subtitle: 'Explore the complete collection of items in English!',
        searchPlaceholder: 'Search by ID or Name...',
        allTypes: 'All Types',
        allCollections: 'All Collections',
        allTags: 'All Updates',
        footerCopy: '© 2025 Ilanzera | All rights reserved',
        footerGarena: 'This content is not affiliated with Garena or Free Fire.',
        footerEdu: 'For educational purposes only and to help search for items in-game.',
        noItems: 'No items found.',
        errorLoading: 'Error loading items.',
        idPrefix: 'ID: ',
        noDescription: 'No description available.',
        unknownItem: 'Unknown Item'
    }
};

const ITEMS_PER_PAGE = 60;
let allItems = [];
let filteredItems = [];
let currentPage = 1;
let currentLanguage = localStorage.getItem('language') || 'PT-BR';

document.addEventListener('DOMContentLoaded', () => {
    const elements = {
        itemsContainer: document.getElementById('items'),
        paginationControls: document.getElementById('paginationControls'),
        searchInput: document.getElementById('searchInput'),
        typeFilter: document.getElementById('typeFilter'),
        collectionFilter: document.getElementById('collectionFilter'),
        tagFilter: document.getElementById('tagFilter'),
        modal: document.getElementById('modal'),
        modalIcon: document.getElementById('modalIcon'),
        modalID: document.getElementById('modalID'),
        modalTitle: document.getElementById('modalTitle'),
        modalDescription: document.getElementById('modalDescription'),
        closeModalBtn: document.getElementById('closeModal'),
        mainTitle: document.getElementById('mainTitle'),
        mainSubtitle: document.getElementById('mainSubtitle'),
        optAllTypes: document.getElementById('optAllTypes'),
        optAllCollections: document.getElementById('optAllCollections'),
        optAllTags: document.getElementById('optAllTags'),
        footerCopy: document.getElementById('footerCopy'),
        footerGarena: document.getElementById('footerGarena'),
        footerEdu: document.getElementById('footerEdu'),
        btnPT: document.getElementById('btnPT'),
        btnEN: document.getElementById('btnEN')
    };

    window.elements = elements;

    function init() {
        updateUIText();
        loadData();
    }

    function updateUIText() {
        const lang = CONFIG[currentLanguage];
        if (elements.mainTitle) elements.mainTitle.innerHTML = lang.title;
        if (elements.mainSubtitle) elements.mainSubtitle.textContent = lang.subtitle;
        if (elements.searchInput) elements.searchInput.placeholder = lang.searchPlaceholder;
        if (elements.optAllTypes) elements.optAllTypes.textContent = lang.allTypes;
        if (elements.optAllCollections) elements.optAllCollections.textContent = lang.allCollections;
        if (elements.optAllTags) elements.optAllTags.textContent = lang.allTags;
        if (elements.footerCopy) elements.footerCopy.textContent = lang.footerCopy;
        if (elements.footerGarena) elements.footerGarena.textContent = lang.footerGarena;
        if (elements.footerEdu) elements.footerEdu.textContent = lang.footerEdu;

        if (elements.btnPT) elements.btnPT.classList.toggle('active', currentLanguage === 'PT-BR');
        if (elements.btnEN) elements.btnEN.classList.toggle('active', currentLanguage === 'EN');
    }

    function loadData() {
        const langConfig = CONFIG[currentLanguage];
        if (elements.itemsContainer) {
            elements.itemsContainer.innerHTML = `<p style="text-align:center; grid-column: 1/-1;">${currentLanguage === 'EN' ? 'Loading...' : 'Carregando...'}</p>`;
        }

        fetch(langConfig.url)
            .then(response => {
                if (!response.ok) throw new Error('Network response was not ok');
                return response.json();
            })
            .then(data => {
                allItems = data.sort((a, b) => a.itemID - b.itemID);
                filteredItems = [...allItems];
                populateFilters();
                renderItems();
                renderPagination();
            })
            .catch(error => {
                console.error('Erro ao carregar o JSON:', error);
                if (elements.itemsContainer) {
                    elements.itemsContainer.innerHTML = `<p style="text-align:center; grid-column: 1/-1;">${langConfig.errorLoading}</p>`;
                }
            });
    }

    window.changeLanguage = function (lang) {
        if (lang === currentLanguage) return;
        currentLanguage = lang;
        localStorage.setItem('language', lang);
        currentPage = 1;
        if (elements.searchInput) elements.searchInput.value = '';
        init();
    };

    function populateFilters() {
        const itemTypes = new Set();
        const collectionTypes = new Set();
        const tagTypes = new Set();

        allItems.forEach(item => {
            if (item.itemType) itemTypes.add(item.itemType);
            if (item.collectionType) collectionTypes.add(item.collectionType);
            if (item.tag) tagTypes.add(item.tag);
        });

        const lang = CONFIG[currentLanguage];

        elements.typeFilter.innerHTML = `<option value="" id="optAllTypes">${lang.allTypes}</option>`;
        elements.collectionFilter.innerHTML = `<option value="" id="optAllCollections">${lang.allCollections}</option>`;
        elements.tagFilter.innerHTML = `<option value="" id="optAllTags">${lang.allTags}</option>`;

        const filtersContainer = document.querySelector('.filters');
        if (itemTypes.size === 0 && collectionTypes.size === 0 && tagTypes.size === 0) {
            if (filtersContainer) filtersContainer.style.display = 'none';
        } else {
            if (filtersContainer) filtersContainer.style.display = 'flex';

            [...itemTypes].sort().forEach(type => {
                const option = document.createElement('option');
                option.value = type;
                option.textContent = type;
                elements.typeFilter.appendChild(option);
            });

            [...collectionTypes].sort().forEach(type => {
                const option = document.createElement('option');
                option.value = type;
                option.textContent = type;
                elements.collectionFilter.appendChild(option);
            });

            [...tagTypes].sort().forEach(tag => {
                const option = document.createElement('option');
                option.value = tag;
                option.textContent = tag;
                elements.tagFilter.appendChild(option);
            });
        }
    }

    function applyFilters() {
        const searchTerm = elements.searchInput.value.toLowerCase().trim();
        const selectedType = elements.typeFilter.value;
        const selectedCollection = elements.collectionFilter.value;
        const selectedTag = elements.tagFilter.value;

        filteredItems = allItems.filter(item => {
            const title = (currentLanguage === 'EN' ? item.name || item.description : item.description) || '';
            const summary = (currentLanguage === 'EN' ? (item.name ? item.description : '') : item.description2) || '';

            const searchMatch =
                searchTerm === "" ||
                item.itemID.toString().includes(searchTerm) ||
                title.toLowerCase().includes(searchTerm) ||
                summary.toLowerCase().includes(searchTerm);

            const typeMatch = selectedType === "" || item.itemType === selectedType;
            const collectionMatch = selectedCollection === "" || item.collectionType === selectedCollection;
            const tagMatch = selectedTag === "" || item.tag === selectedTag;

            return searchMatch && typeMatch && collectionMatch && tagMatch;
        });

        currentPage = 1;
        renderItems();
        renderPagination();
    }

    elements.searchInput.addEventListener('input', applyFilters);
    elements.typeFilter.addEventListener('change', applyFilters);
    elements.collectionFilter.addEventListener('change', applyFilters);
    elements.tagFilter.addEventListener('change', applyFilters);

    function renderItems() {
        elements.itemsContainer.innerHTML = '';

        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        const end = currentPage * ITEMS_PER_PAGE;
        const itemsToRender = filteredItems.slice(start, end);

        if (itemsToRender.length === 0) {
            elements.itemsContainer.innerHTML = `<p style="text-align:center; grid-column: 1/-1; color: #888;">${CONFIG[currentLanguage].noItems}</p>`;
            return;
        }

        itemsToRender.forEach(item => {
            const div = document.createElement('div');
            div.className = 'item';

            const imgSrc = `./assets/icons/${item.itemID}_rgb.png`;
            const fallbackSrc = `./assets/icons/NONE.png`;

            div.innerHTML = `
                <img 
                    src="${imgSrc}" 
                    alt="Item" 
                    loading="lazy"
                    onerror="this.onerror=null; this.src='${fallbackSrc}'">
                <div style="margin-top: 10px; font-size: 0.8rem; color: #888;">
                    ${item.itemID}
                </div>
            `;

            div.addEventListener('click', () => openModal(item));
            elements.itemsContainer.appendChild(div);
        });
    }

    function renderPagination() {
        elements.paginationControls.innerHTML = '';
        const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);

        if (totalPages <= 1) return;

        const prevBtn = createPageButton('«', currentPage > 1, () => changePage(currentPage - 1));
        elements.paginationControls.appendChild(prevBtn);

        let startPage = Math.max(1, currentPage - 2);
        let endPage = Math.min(totalPages, currentPage + 2);

        if (currentPage <= 3) endPage = Math.min(5, totalPages);
        if (currentPage >= totalPages - 2) startPage = Math.max(1, totalPages - 4);

        if (startPage > 1) {
            elements.paginationControls.appendChild(createPageButton('1', true, () => changePage(1)));
            if (startPage > 2) elements.paginationControls.appendChild(createSpan('...'));
        }

        for (let i = startPage; i <= endPage; i++) {
            const btn = createPageButton(i, true, () => changePage(i));
            if (i === currentPage) btn.classList.add('active');
            elements.paginationControls.appendChild(btn);
        }

        if (endPage < totalPages) {
            if (endPage < totalPages - 1) elements.paginationControls.appendChild(createSpan('...'));
            elements.paginationControls.appendChild(createPageButton(totalPages, true, () => changePage(totalPages)));
        }

        const nextBtn = createPageButton('»', currentPage < totalPages, () => changePage(currentPage + 1));
        elements.paginationControls.appendChild(nextBtn);
    }

    function createPageButton(text, enabled, onClick) {
        const btn = document.createElement('button');
        btn.className = 'page-btn';
        btn.textContent = text;
        btn.disabled = !enabled;
        if (enabled) btn.addEventListener('click', onClick);
        return btn;
    }

    function createSpan(text) {
        const span = document.createElement('span');
        span.style.color = '#888';
        span.style.padding = '0 5px';
        span.textContent = text;
        return span;
    }

    function changePage(newPage) {
        currentPage = newPage;
        renderItems();
        renderPagination();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function openModal(item) {
        elements.modalIcon.onerror = () => { elements.modalIcon.src = './assets/icons/NONE.png'; };
        elements.modalIcon.src = `./assets/icons/${item.itemID}_rgb.png`;
        elements.modalID.textContent = `${CONFIG[currentLanguage].idPrefix}${item.itemID}`;

        if (currentLanguage === 'EN') {
            elements.modalTitle.textContent = item.name || item.description || CONFIG[currentLanguage].unknownItem;
            elements.modalDescription.textContent = (item.name ? item.description : '') || CONFIG[currentLanguage].noDescription;
        } else {
            elements.modalTitle.textContent = item.description || CONFIG[currentLanguage].unknownItem;
            elements.modalDescription.textContent = getItemDescriptionPT(item);
        }

        elements.modal.classList.add('active');
    }

    function getItemDescriptionPT(item) {
        if (item.description2 && item.description2 !== "NONE" && item.description2 !== "Nulla") return item.description2;
        return CONFIG[currentLanguage].noDescription;
    }

    function closeModal() {
        elements.modal.classList.remove('active');
    }

    if (elements.closeModalBtn) elements.closeModalBtn.addEventListener('click', closeModal);
    if (elements.modal) {
        elements.modal.addEventListener('click', (e) => { if (e.target === elements.modal) closeModal(); });
    }
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && elements.modal && elements.modal.classList.contains('active')) closeModal();
    });

    init();
});
