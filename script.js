const DATA_URL = './assets/itemData_traduzido.json';
const ITEMS_PER_PAGE = 60;
let allItems = [];
let filteredItems = [];
let currentPage = 1;

const itemsContainer = document.getElementById('items');
const paginationControls = document.getElementById('paginationControls');
const searchInput = document.getElementById('searchInput');
const typeFilter = document.getElementById('typeFilter');
const collectionFilter = document.getElementById('collectionFilter');
const tagFilter = document.getElementById('tagFilter');
const modal = document.getElementById('modal');
const modalIcon = document.getElementById('modalIcon');
const modalID = document.getElementById('modalID');
const modalTitle = document.getElementById('modalTitle');
const modalDescription = document.getElementById('modalDescription');
const closeModalBtn = document.getElementById('closeModal');

fetch(DATA_URL)
    .then(response => {
        if (!response.ok) throw new Error('Network response was not ok');
        return response.json();
    })
    .then(data => {
        // Ordena os itens pelo itemID do menor para o maior
        allItems = data.sort((a, b) => a.itemID - b.itemID);
        filteredItems = [...allItems];
        populateFilters();
        renderItems();
        renderPagination();
    })
    .catch(error => {
        console.error('Erro ao carregar o JSON:', error);
        itemsContainer.innerHTML = '<p style="text-align:center; grid-column: 1/-1;">Erro ao carregar itens.</p>';
    });

function populateFilters() {
    const itemTypes = new Set();
    const collectionTypes = new Set();
    const tagTypes = new Set();

    allItems.forEach(item => {
        if (item.itemType !== undefined && item.itemType !== null && item.itemType !== "") {
            itemTypes.add(item.itemType);
        }

        if (item.collectionType !== undefined && item.collectionType !== null && item.collectionType !== "") {
            collectionTypes.add(item.collectionType);
        }

        if (item.tag !== undefined && item.tag !== null && item.tag !== "") {
            tagTypes.add(item.tag);
        }
    });

    typeFilter.innerHTML = '<option value="">Todos os Tipos</option>';
    collectionFilter.innerHTML = '<option value="">Todas as Coleções</option>';
    tagFilter.innerHTML = '<option value="">Todas as Atualizações</option>';

    [...itemTypes].sort().forEach(type => {
        const option = document.createElement('option');
        option.value = type;
        option.textContent = type;
        typeFilter.appendChild(option);
    });

    [...collectionTypes].sort().forEach(type => {
        const option = document.createElement('option');
        option.value = type;
        option.textContent = type;
        collectionFilter.appendChild(option);
    });

    [...tagTypes].sort().forEach(tag => {
        const option = document.createElement('option');
        option.value = tag;
        option.textContent = tag;
        tagFilter.appendChild(option);
    });
}

function formatFilterName(str) {
    return str.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
}

function applyFilters() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    const selectedType = typeFilter.value;
    const selectedCollection = collectionFilter.value;
    const selectedTag = tagFilter.value;

    filteredItems = allItems.filter(item => {

        const searchMatch =
            searchTerm === "" ||
            item.itemID.toString().includes(searchTerm) ||
            (item.description && item.description.toLowerCase().includes(searchTerm));

        const typeMatch =
            selectedType === "" || item.itemType === selectedType;

        const collectionMatch =
            selectedCollection === "" || item.collectionType === selectedCollection;

        const tagMatch =
            selectedTag === "" || item.tag === selectedTag;

        return searchMatch && typeMatch && collectionMatch && tagMatch;
    });

    currentPage = 1;
    renderItems();
    renderPagination();
}

searchInput.addEventListener('input', applyFilters);
typeFilter.addEventListener('change', applyFilters);
collectionFilter.addEventListener('change', applyFilters);
tagFilter.addEventListener('change', applyFilters);


function renderItems() {
    itemsContainer.innerHTML = '';

    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = currentPage * ITEMS_PER_PAGE;
    const itemsToRender = filteredItems.slice(start, end);

    if (itemsToRender.length === 0) {
        itemsContainer.innerHTML = '<p style="text-align:center; grid-column: 1/-1; color: #888;">Nenhum item encontrado.</p>';
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
                alt="${item.icon || 'Item'}" 
                loading="lazy"
                onerror="this.onerror=null; this.src='${fallbackSrc}'">
            <div style="margin-top: 10px; font-size: 0.8rem; color: #888;">
                ${item.itemID}
            </div>
        `;


        div.addEventListener('click', () => {
            openModal(item);
        });

        itemsContainer.appendChild(div);
    });
}

function renderPagination() {
    paginationControls.innerHTML = '';
    const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);

    if (totalPages <= 1) return;

    const prevBtn = createPageButton('«', currentPage > 1, () => changePage(currentPage - 1));
    paginationControls.appendChild(prevBtn);

    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, currentPage + 2);

    if (currentPage <= 3) {
        endPage = Math.min(5, totalPages);
    }

    if (currentPage >= totalPages - 2) {
        startPage = Math.max(1, totalPages - 4);
    }

    if (startPage > 1) {
        paginationControls.appendChild(createPageButton('1', true, () => changePage(1)));
        if (startPage > 2) {
            paginationControls.appendChild(createSpan('...'));
        }
    }

    for (let i = startPage; i <= endPage; i++) {
        const btn = createPageButton(i, true, () => changePage(i));
        if (i === currentPage) btn.classList.add('active');
        paginationControls.appendChild(btn);
    }

    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            paginationControls.appendChild(createSpan('...'));
        }
        paginationControls.appendChild(createPageButton(totalPages, true, () => changePage(totalPages)));
    }

    const nextBtn = createPageButton('»', currentPage < totalPages, () => changePage(currentPage + 1));
    paginationControls.appendChild(nextBtn);
}

function createPageButton(text, enabled, onClick) {
    const btn = document.createElement('button');
    btn.className = 'page-btn';
    btn.textContent = text;
    btn.disabled = !enabled;
    if (enabled) {
        btn.addEventListener('click', onClick);
    }
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
    modalIcon.onerror = () => {
        modalIcon.src = './assets/icons/NONE.png';
    };

    modalIcon.src = `./assets/icons/${item.itemID}_rgb.png`;
    modalID.textContent = `ID: ${item.itemID}`;
    modalTitle.textContent = item.description || 'Item Desconhecido';
    modalDescription.textContent = item2Description2(item);
    modal.classList.add('active');
}

function item2Description2(item) {
    if (item.description2 && item.description2 !== "NONE" && item.description2 !== "Nulla") return item.description2;
    if (item.description2 && item.description2 !== "NONE") return item.description2;
    return "Sem descrição disponível.";
}

function closeModal() {
    modal.classList.remove('active');
}

closeModalBtn.addEventListener('click', closeModal);

modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
        closeModal();
    }
});
