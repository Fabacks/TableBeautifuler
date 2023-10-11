/**
 * TableBeautifuller
 * 
 * Author: Fabacks
 * License: Free distribution except for commercial use
 * GitHub Repository: https://github.com/Fabacks/TableBeautifuller
 * Version 0.9.1
 * 
 * This software is provided "as is" without any warranty. The author is
 * not responsible for any damages or liabilities caused by the use of this software.
 * Please do not use this software for commercial purposes without explicit permission from the author.
 * If you use or distribute this software, please credit the author and link back to the GitHub repository.
 */

class TableBeautifuller {
    constructor(tableId, options = {}) {
        this.table = document.querySelector(tableId);
        this.eventList = [];
        this.plugins = [];

        // Display
        this.displayBloc = {};
        this.displayBloc.info = options.info ?? true;
        this.displayBloc.ordering = options.ordering ?? true;
        this.displayBloc.paging = options.paging ?? true;
        this.displayBloc.searching = options.searching ?? true;
        this.displayBloc.columnSearch = options.columnSearch ?? true;

        // Options
        this.options = {};
        this.options.temperature = parseInt(options.temperature) || 1;

        // Initialisation du trie par défaut
        let orderString = options.order || this.table.getAttribute("data-order");
        if (typeof orderString === "string") {
            this.initialOrder = JSON.parse(orderString);
        } else if (Array.isArray(orderString)) {
            this.initialOrder = orderString;
        } else {
            this.initialOrder = [];
        }

        // Initialisation des valeurs pour la pagination (nombre item par page)
        this.pageLength = options.pageLength || parseInt(this.table.getAttribute("data-page-length")) || 10;
        this.currentPage = 1;

        // Initialisation du nombre d'item par page dans le selector
        this.selectItemPage = options.selectItemPage || [10, 20, 30];
        if (!this.selectItemPage.includes(this.pageLength)) {
            this.selectItemPage.push(this.pageLength);
            this.selectItemPage.sort((a, b) => a - b);
        }

        // Initialisation du debounce
        this.debounce_delai = options.debounceDelai || 300;

        // Initialisez un objet pour suivre les filtres actifs
        this.filters = {}; 

        this.createWrappers();

        if (this.displayBloc.searching ) {
            this.addSearchInput();
        }

        if (this.displayBloc.ordering) {
            this.addSortingArrows();
            this.applyInitialOrder();
        }

        if (this.displayBloc.columnSearch) {
            this.addSearchColumn();
        }

        if (this.displayBloc.info) {
            this.addInfoControls();
        }

        if (this.displayBloc.paging) {
            this.addPaginationControls();
            this.paginate();
        }
    }

    use(plugin) {
        plugin.install(this);
        this.plugins.push(plugin);
    }

    createWrappers() {
        // Ajout de la classe "tableBeautifuller" à la table
        this.table.classList.add('tableBeautifuller');

        // Création du wrapper "pagination-wrapper-top-container" au dessus du tableau
        this.paginationWrapperTopContainer = document.createElement('div');
        this.paginationWrapperTopContainer.classList.add('tableBeautifuller', 'pagination-wrapper-top-container');
        this.table.parentNode.insertBefore(this.paginationWrapperTopContainer, this.table);

        // Création du wrapper "pagination-down-container" en dessous du tableau
        this.paginationWrapperDownContainer = document.createElement('div');
        this.paginationWrapperDownContainer.classList.add('tableBeautifuller', 'pagination-down-container');
        this.table.parentNode.appendChild(this.paginationWrapperDownContainer);
    }

    debounce(func, delay) {
        let debounceTimer;
        return function() {
            const context = this;
            const args = arguments;
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => func.apply(context, args), delay);
        };
    }

    addEventList(element, eventName, listener) {
        // Ajouter l'écouteur d'événement à l'élément
        element.addEventListener(eventName, listener);

        // Stocker l'élément, l'événement et la fonction d'écouteur liée dans eventList
        this.eventList.push({element, eventName, listener});
    }

    addSearchInput() {
        this.searchInput = document.createElement("input");
        this.searchInput.title = "Search in global table";
        this.searchInput.setAttribute("type", "text");
        this.searchInput.setAttribute("placeholder", "Recherche...");
        this.searchInput.className = "search-input";
        this.paginationWrapperTopContainer.appendChild(this.searchInput);

        this.addEventList(this.searchInput, 'keyup', this.debounce(() => {
            this.searchTable(null, this.searchInput.value);
        }, this.debounce_delai).bind(this));
    }

    addSearchColumn() {
        let searchRow = document.createElement('tr');
        searchRow.classList.add("thead-search");

        let headers = this.table.querySelectorAll("th");
        headers.forEach(header => {
            let cell = document.createElement('th');
            let searchType = header.getAttribute('data-search') ?? '';
            let colName = "Search for " + (header.innerHTML.indexOf('<span') !== -1 ? header.innerHTML.substring(0, header.innerHTML.indexOf('<span')).trim() : header.innerText);

            switch (searchType) {
                case "input":
                    let input = document.createElement('input');
                    input.type = "text";
                    input.title = colName;
                    input.placeholder = "Rechercher dans la colonne...";

                    this.addEventList(input, 'input', this.debounce((e) => {
                        this.searchTable(header.cellIndex, e.target.value);
                    }, this.debounce_delai).bind(this));
                    cell.appendChild(input);
                break;
                case "combobox":
                    let select = document.createElement('select');
                    select.title = colName;
                    let uniqueValues = this.getUniqueValuesForColumn(header.cellIndex);
                    select.innerHTML = `<option value="">Tout</option>`;
                    uniqueValues.forEach(val => {
                        let option = document.createElement('option');
                        option.value = val;
                        option.textContent = val;
                        select.appendChild(option);
                    });

                    this.addEventList(select, 'change', this.debounce((e) => {
                        this.searchTable(header.cellIndex, e.target.value);
                    }, this.debounce_delai).bind(this));
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
            let cell = row.cells[colIndex];
            let value = cell.hasAttribute("data-search") ? cell.getAttribute("data-search") : cell.textContent.trim();
            if (!values.includes(value)) {
                values.push(value);
            }
        });
        return values;
    }

    addSortingArrows() {
        let headers = this.table.querySelectorAll("th");
        headers.forEach((header, idx) => {
            header.dataset.sort = 'none';

            let arrow = document.createElement('span');
            arrow.classList.add('sort-arrow');
            header.appendChild(arrow);

            this.addEventList(header, 'click', this.headerClickHandler.bind(this, header, idx));
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

    searchTable(colIndex, query) {
        query = query.trim();

        // Mise à jour de l'objet des filtres, on utilise 'global' comme clé pour une recherche globale
        let key = colIndex === null || colIndex === undefined ? "global" : colIndex;
        if (query.trim() != '') {
            this.filters[key] = query.toLowerCase();
        } else {
            delete this.filters[key];
        }

        let rows = this.table.querySelectorAll("tbody tr");

        // Reset de la recherche
        rows.forEach(row => {
            row.dataset.matched = "true";
            row.style.display = "";
        });

        rows.forEach(row => {
            for (const [filterKey, filterQuery] of Object.entries(this.filters)) {
                if (row.dataset.matched !== "true") 
                    return;

                let rowText = ""
                if (filterKey !== 'global') {
                    let cell = row.cells[parseInt(filterKey)];
                    rowText = cell.hasAttribute("data-search") ? cell.getAttribute("data-search") : cell.textContent;
                } else {
                    let cells = Array.from(row.getElementsByTagName("td"));
                    rowText = Array.from(cells).map(cell => cell.hasAttribute("data-search") ? cell.getAttribute("data-search") : cell.textContent).join(' ');
                }

                rowText = rowText.trim().toLowerCase();
                if ( !this.matchesUsingLevenshtein(rowText, filterQuery, this.options.temperature) ){
                    row.style.display = "none";
                    row.dataset.matched = "false";
                }
            }
        });

        // Remise à zéro de la pagination et repagination avec les résultats filtrés
        this.currentPage = 1;
        this.paginate();
    }

    matchesUsingLevenshtein(rowText, filterQuery, temperature) {
        if ( rowText.indexOf(filterQuery) !== -1) {
            return true;
        }

        if( temperature == 0 || filterQuery.length < 4 || typeof rowText !== 'string' || typeof filterQuery !== 'string') {
            return false;
        }

        for (let i = 0; i <= rowText.length - filterQuery.length; i++) {
            let sub = rowText.substring(i, i + filterQuery.length);
            if (this.levenshteinDistance(sub, filterQuery) <= temperature) {
                return true;
            }
        }

        return false;
    }

    levenshteinDistance(a, b) {
        const matrix = [];
        let i, j;

        for (i = 0; i <= b.length; i++) {
            matrix[i] = [i];
        }

        for (j = 0; j <= a.length; j++) {
            matrix[0][j] = j;
        }

        for (i = 1; i <= b.length; i++) {
            for (j = 1; j <= a.length; j++) {
                if (b.charAt(i - 1) === a.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    );
                }
            }
        }

        return matrix[b.length][a.length];
    }

    paginate() {
        let totalRows = Array.from(this.table.querySelectorAll("tbody tr")).filter(row => row.dataset.matched !== "false").length;
        let totalPages = Math.ceil(totalRows / this.pageLength);
        let startIdx = (this.currentPage - 1) * this.pageLength;
        let endIdx = startIdx + this.pageLength;

        if( this.displayBloc.info) {
            let endDisplay = endIdx > totalRows ? totalRows : endIdx;
            this.infoLabel.textContent = `Affichage de l'élément ${startIdx + 1} à ${endDisplay} sur ${totalRows} éléments`;
        }

        // Control display of previous & next buttons
        this.prevButton.disabled = this.currentPage <= 1;
        this.nextButton.disabled = this.currentPage >= totalPages

        let rows = Array.from(this.table.querySelectorAll("tbody tr")).filter(row => row.dataset.matched !== "false");
        rows.forEach((row, idx) => {
            row.style.display = idx < startIdx || idx >= endIdx ? "none" : "";
        });

        let buttonsDelete = this.paginationButtonsContainer.querySelectorAll('.page-btn');
        buttonsDelete.forEach((button) => {
            this.paginationButtonsContainer.removeChild(button);
        });

        let startPage = Math.max(1, this.currentPage - 3);
        let endPage = Math.min(totalPages, this.currentPage + 3) -1;

        let lastChild = this.paginationButtonsContainer.lastElementChild;
        for (let i = startPage-1; i <= endPage; i++) {
            let pageNumber = startPage + i;
            let btn = document.createElement('button');
            btn.textContent = pageNumber;
            btn.setAttribute('data-page', pageNumber);
            btn.className = 'page-btn';
            btn.classList.toggle('active', pageNumber === this.currentPage);

            this.paginationButtonsContainer.insertBefore(btn, lastChild);
        }

    }

    addInfoControls() {
        this.infoLabel = document.createElement('span');
        this.infoLabel.className = 'pagination-info';
        this.paginationWrapperDownContainer.appendChild(this.infoLabel);
    }

    addPaginationControls() {
        // Items per page select
        this.paginationWrapperTop = document.createElement('div');
        this.paginationWrapperTop.className = 'pagination-wrapper-top';

        this.paginationInfoTop = document.createElement("span");
        this.paginationInfoTop.textContent = "Afficher";
        this.paginationWrapperTop.appendChild(this.paginationInfoTop);

        this.paginationSelect = document.createElement("select");
        this.paginationSelect.title = "List for numbers items display";
        this.selectItemPage.forEach(num => {
            let option = document.createElement("option");
            option.value = num;
            option.textContent = num;
            option.selected = num === this.pageLength ? true : false;
            this.paginationSelect.appendChild(option);
        });
        this.paginationSelect.value = this.pageLength;
        this.paginationWrapperTop.appendChild(this.paginationSelect);

        this.paginationInfoTopAfter = document.createElement("span");
        this.paginationInfoTopAfter.textContent = "éléments";
        this.paginationWrapperTop.appendChild(this.paginationInfoTopAfter);

        this.paginationWrapperTopContainer.appendChild(this.paginationWrapperTop);

        // Create du wrapper "pagination-buttons-container" for boutton
        this.paginationButtonsContainer = document.createElement('div');
        this.paginationButtonsContainer.className = 'pagination-buttons-container';

        this.prevButton = document.createElement('button');
        this.prevButton.textContent = 'Précédent';
        this.prevButton.className = 'page-prev';
        this.paginationButtonsContainer.appendChild(this.prevButton);

        this.nextButton = document.createElement('button');
        this.nextButton.textContent = 'Suivant';
        this.nextButton.className = 'page-next';
        this.paginationButtonsContainer.appendChild(this.nextButton);
        this.paginationWrapperDownContainer.appendChild(this.paginationButtonsContainer);

        this.addEventList(this.paginationSelect, 'change', (() => {
            this.pageLength = parseInt(this.paginationSelect.value);
            this.currentPage = 1;
            this.paginate();
        }).bind(this));

        this.addEventList(this.paginationButtonsContainer, 'click', ((event) => {
            let classList = event.target.classList;
            if ( classList.contains('page-btn') )
                this.currentPage = parseInt(event.target.getAttribute('data-page'));
            else if (classList.contains('page-prev') )
                this.currentPage--;
            else if (classList.contains('page-next') )
                this.currentPage++;

            this.paginate();
        }).bind(this));
    }

    destroy() {
        // Supprimer tous les écouteurs d'événements
        this.eventList.forEach(({ element, eventName, listener }) => {
            element.removeEventListener(eventName, listener);
        });

        // Supprimer les flèches de tri
        let headers = this.table.querySelectorAll("th");
        headers.forEach(header => {
            let arrow = header.querySelector(".sort-arrow");
            if (arrow) {
                arrow.remove();
            }
        });

        // Afficher toutes les lignes du tableau
        let rows = this.table.querySelectorAll("tbody tr");
        rows.forEach(row => {
            row.style.display = "";
        });

        // Supprime le wrapper au dessus du tableau
        if (this.paginationWrapperTopContainer) {
            this.paginationWrapperTopContainer.remove();
        }

        // Supprime le wrapper en dessosu du tableau 
        if (this.paginationWrapperDownContainer) {
            this.paginationWrapperDownContainer.remove();
        }

        // Supprimer la ligne de recherche (filtres) dans l'en-tête
        let searchRow = this.table.querySelector(".thead-search");
        if (searchRow) {
            searchRow.remove();
        }

        // Parcourir tous les attributs de l'objet et les définir à null
        for (let attribut in this) {
            if (this.hasOwnProperty(attribut)) {
            this[attribut] = null;
            }
        }
    }
}