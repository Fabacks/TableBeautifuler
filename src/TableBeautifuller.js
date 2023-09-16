class TableBeautifuller {
    constructor(tableId, options = {}) {
        this.table = document.getElementById(tableId);

        // Initialisation du trie par défaut
        let orderString = options.order || this.table.getAttribute("data-order");
        this.initialOrder = orderString ? JSON.parse(orderString) : [];

        // Initialisation des valeurs pour la pagination
        this.pageLength = options.pageLength || parseInt(this.table.getAttribute("data-page-length")) || 15;
        this.currentPage = 1;

        this.init();
    }

    init() {
        // Ajout de la classe "tableBeautifuller" à la table
        this.table.classList.add('tableBeautifuller');

        // Création du wrapper "pagination-wrapper-top-container" au dessus du tableau
        this.paginationWrapperTopContainer = document.createElement('div');
        this.paginationWrapperTopContainer.classList.add('tableBeautifuller', 'pagination-wrapper-top-container');
        this.table.parentNode.insertBefore(this.paginationWrapperTopContainer, this.table);

        // Création du wrapper "pagination-wrapper-bottom-container" en dessous du tableau
        this.paginationWrapperBottomContainer = document.createElement('div');
        this.paginationWrapperBottomContainer.classList.add('tableBeautifuller', 'pagination-wrapper-bottom-container');
        this.table.parentNode.insertBefore(this.paginationWrapperBottomContainer, this.table.nextSibling);

        this.addSearchInput();
        this.addSortingArrows();
        this.addSearchRow();
        this.addPaginationControls();
        this.applyInitialOrder();
        this.paginate();
    }

    addSearchInput() {
        this.searchInput = document.createElement("input");
        this.searchInput.setAttribute("type", "text");
        this.searchInput.setAttribute("placeholder", "Recherche...");
        this.searchInput.className = "search-input";
        this.paginationWrapperTopContainer.appendChild(this.searchInput);

        this.searchInput.addEventListener("keyup", () => {
            this.searchTable(this.searchInput.value);
        });
    }

    addSearchRow() {
        let searchRow = document.createElement('tr');
        searchRow.classList.add("thead-search");
        let headers = this.table.querySelectorAll("th");

        headers.forEach(header => {
            let cell = document.createElement('th');
            let searchType = header.getAttribute('data-search') ?? '';

            switch (searchType) {
                case "input":
                    let input = document.createElement('input');
                    input.type = "text";
                    input.addEventListener('input', (e) => {
                        this.filterTable(header.cellIndex, e.target.value);
                    });
                    cell.appendChild(input);
                break;
                case "combobox":
                    let select = document.createElement('select');
                    let uniqueValues = this.getUniqueValuesForColumn(header.cellIndex);
                    select.innerHTML = `<option value="">Tout</option>`;
                    uniqueValues.forEach(val => {
                        let option = document.createElement('option');
                        option.value = val;
                        option.textContent = val;
                        select.appendChild(option);
                    });
                    select.addEventListener('change', (e) => {
                        this.filterTable(header.cellIndex, e.target.value);
                    });
                    cell.appendChild(select);
                break;
                default:
                    return;
            }

            searchRow.appendChild(cell);
        });

        this.table.querySelector('thead').appendChild(searchRow);
    }

    getUniqueValuesForColumn(colIndex) {
        let values = [];
        let rows = this.table.querySelector("tbody").querySelectorAll("tr");
        rows.forEach(row => {
            let value = row.cells[colIndex].textContent.trim();
            if (!values.includes(value)) {
                values.push(value);
            }
        });
        return values;
    }

    filterTable(colIndex, query) {
        let rows = this.table.querySelector("tbody").querySelectorAll("tr");
        rows.forEach(row => {
            let cellValue = row.cells[colIndex].textContent.trim();
            if (cellValue.includes(query) || query === "") {
                row.style.display = "";
            } else {
                row.style.display = "none";
            }
        });
    }

    addSortingArrows() {
        let headers = this.table.querySelectorAll("th");
        headers.forEach((header, idx) => {
            header.dataset.sort = 'none'; // Initial state

            let arrow = document.createElement('span');
            arrow.classList.add('sort-arrow');
            header.appendChild(arrow);

            // Créez un gestionnaire d'événements lié et stockez-le
            let boundHandler = this.headerClickHandler.bind(this, header, idx);
            header._sortingHandler = boundHandler;

            header.addEventListener("click", boundHandler);
        });
    }

    headerClickHandler(header, idx) {
        let sortDirection = header.dataset.sort === 'asc' ? 'desc' : 'asc';
        this.sortTable(idx, sortDirection);
        header.dataset.sort = sortDirection;
        this.updateArrows(header);
    }

    updateArrows(currentHeader) {
        // Reset all arrows
        this.table.querySelectorAll(".sort-arrow").forEach(arrow => {
            arrow.textContent = '';
        });

        let arrowSpan = currentHeader.querySelector('.sort-arrow');
        arrowSpan.textContent = currentHeader.dataset.sort === 'asc' ? '▲' : '▼';
    }

    detectColumnType(colIndex) {
        let rows = this.table.querySelector("tbody").querySelectorAll("tr");
        for (let i = 0; i < rows.length; i++) {
            if (rows[i].cells[colIndex]) {
                let content = rows[i].cells[colIndex].hasAttribute('data-order') ? rows[i].cells[colIndex].getAttribute('data-order') : rows[i].cells[colIndex].textContent.trim();
                if (!isNaN(content)) {
                    return 'number';
                }
            }
        }
        return 'string';
    }

    sortTable(colIndex, direction) {
        let type = this.detectColumnType(colIndex);
        let rows = Array.from(this.table.querySelector("tbody").querySelectorAll("tr"));
        rows.sort((a, b) => {
            let A = a.cells[colIndex].hasAttribute('data-order') ? a.cells[colIndex].getAttribute('data-order') : a.cells[colIndex].textContent.trim();
            let B = b.cells[colIndex].hasAttribute('data-order') ? b.cells[colIndex].getAttribute('data-order') : b.cells[colIndex].textContent.trim();

            if (type === 'number') {
                return direction === 'asc' ? A - B : B - A;
            } else {
                return direction === 'asc' ? A.localeCompare(B) : B.localeCompare(A);
            }
        });

        this.table.querySelector("tbody").append(...rows);
    }

    applyInitialOrder() {
        this.initialOrder.forEach(orderCriteria => {
            let [colIndex, direction] = orderCriteria;
            this.sortTable(colIndex, direction.toLowerCase());

            let header = this.table.querySelector(`th:nth-child(${colIndex + 1})`);
            header.dataset.sort = direction.toLowerCase();
            this.updateArrows(header);
        });
    }

    searchTable(query) {
        let rows = this.table.querySelectorAll("tbody tr");
        rows.forEach(row => {
            let cells = Array.from(row.getElementsByTagName("td"));
            let rowText = cells.map(cell => cell.textContent).join(' ').toLowerCase();

            if (rowText.indexOf(query.toLowerCase()) !== -1) {
                row.style.display = "";
            } else {
                row.style.display = "none";
            }
        });
    }

    paginate() {
        let totalRows = this.table.querySelectorAll("tbody tr").length;
        let totalPages = Math.ceil(totalRows / this.pageLength);
    
        // Control display of previous & next buttons
        this.prevButton.style.display = this.currentPage > 1 ? '' : 'none';
        this.nextButton.style.display = this.currentPage < totalPages ? '' : 'none';
    
        let startIdx = (this.currentPage - 1) * this.pageLength;
        let endIdx = startIdx + this.pageLength;
    
        let rows = Array.from(this.table.querySelectorAll("tbody tr"));
        rows.forEach((row, idx) => {
            row.style.display = idx < startIdx || idx >= endIdx ? "none" : "";
        });
    
        let endDisplay = endIdx > totalRows ? totalRows : endIdx;
        this.infoLabel.textContent = `Affichage de l'élément ${startIdx + 1} à ${endDisplay} sur ${totalRows} éléments`;
    
        // Update displayed page buttons (just 5 for now)
        let startPage = Math.max(1, this.currentPage - 2);
        let endPage = Math.min(totalPages, this.currentPage + 2);
    
        let pageButtons = this.paginationWrapperBottomContainer.querySelectorAll('.page-btn');
        pageButtons.forEach((btn, idx) => {
            let pageNumber = startPage + idx;
            btn.textContent = pageNumber;
            btn.style.display = pageNumber <= endPage ? '' : 'none';
            btn.classList.toggle('active', pageNumber === this.currentPage);
        });
    }

    addPaginationControls() {
        this.paginationWrapperTop = document.createElement('div');
        this.paginationWrapperTop.className = 'pagination-wrapper-top';
    
        // Items per page select
        this.paginationInfoTop = document.createElement("span");
        this.paginationInfoTop.textContent = "Afficher ";
        this.paginationWrapperTop.appendChild(this.paginationInfoTop);
    
        this.paginationSelect = document.createElement("select");
        [10, 20, 30].forEach(num => {
            let option = document.createElement("option");
            option.value = num;
            option.textContent = num;
            this.paginationSelect.appendChild(option);
        });
        this.paginationSelect.value = this.pageLength;
        this.paginationWrapperTop.appendChild(this.paginationSelect);

        this.paginationInfoTopAfter = document.createElement("span");
        this.paginationInfoTopAfter.textContent = " éléments";
        this.paginationWrapperTop.appendChild(this.paginationInfoTopAfter);

        this.paginationWrapperTopContainer.appendChild(this.paginationWrapperTop);

        // Information display
        this.infoLabel = document.createElement('span');
        this.infoLabel.className = 'pagination-info';
        this.paginationWrapperBottomContainer.appendChild(this.infoLabel);

        // Création du wrapper "pagination-buttons-container"
        this.paginationButtonsContainer = document.createElement('div');
        this.paginationButtonsContainer.className = 'pagination-buttons-container';

        // Previous & Next buttons and pages display
        this.prevButton = document.createElement('button');
        this.prevButton.textContent = 'Précédent';
        this.paginationButtonsContainer.appendChild(this.prevButton);

        // Display pages (for simplicity we'll display five pages for now)
        for (let i = 1; i <= 5; i++) {
            let pageButton = document.createElement('button');
            pageButton.textContent = i;
            pageButton.className = 'page-btn';
            pageButton.addEventListener('click', () => {
                this.currentPage = parseInt(pageButton.textContent);
                this.paginate();
            });
            this.paginationButtonsContainer.appendChild(pageButton);
        }

        this.nextButton = document.createElement('button');
        this.nextButton.textContent = 'Suivant';
        this.paginationButtonsContainer.appendChild(this.nextButton);
        this.paginationWrapperBottomContainer.appendChild(this.paginationButtonsContainer);

        // Event listeners
        this.paginationSelect.addEventListener("change", () => {
            this.pageLength = parseInt(this.paginationSelect.value);
            this.currentPage = 1;
            this.paginate();
        });

        this.prevButton.addEventListener('click', () => {
            this.currentPage--;
            this.paginate();
        });

        this.nextButton.addEventListener('click', () => {
            this.currentPage++;
            this.paginate();
        });
    }

    destroy() {
        // Supprimer l'input de recherche
        if (this.searchInput) {
            this.searchInput.remove();
        }

        // Supprimer les flèches de tri et les gestionnaires d'événements
        let headers = this.table.querySelectorAll("th");
        headers.forEach(header => {
            if (header._sortingHandler) {
                header.removeEventListener("click", header._sortingHandler);
                delete header._sortingHandler;
            }

            let arrow = header.querySelector(".sort-arrow");
            if (arrow) {
                arrow.remove();
            }
        });

        // Supprimer les éléments de pagination
        if (this.paginationWrapperTopContainer) {
            this.paginationWrapperTopContainer.remove();
        }

        if (this.paginationWrapperBottomContainer) {
            this.paginationWrapperBottomContainer.remove();
        }

        // Supprimer la ligne de recherche (filtres) dans l'en-tête
        let searchRow = this.table.querySelector(".thead-search");
        if (searchRow) {
            searchRow.remove();
        }
    }
}