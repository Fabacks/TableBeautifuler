/**
 * TableBeautifuller
 * 
 * Author: Fabacks
 * License: Free distribution except for commercial use
 * GitHub Repository: https://github.com/Fabacks/TableBeautifuller
 * Version 1.0.4
 * 
 * This software is provided "as is" without any warranty. The author is
 * not responsible for any damages or liabilities caused by the use of this software.
 * Please do not use this software for commercial purposes without explicit permission from the author.
 * If you use or distribute this software, please credit the author and link back to the GitHub repository.
 */

class TableBeautifuller {
    constructor(tableId, options = {}) {
        this.table = document.querySelector(tableId);
        this.eventList = [];    // List of event listener
        this.plugins = [];      // List of plugin active
        this.filters = {};      // List of filter active
        this.options = {};      // List of options
        this.displayBloc = {};  // List of display

        // Translate
        this.lang = options.language ?? "en_EN";
        this.translation = options.translation ?? null;

        // Display
        this.displayBloc.info = options.info ?? true;
        this.displayBloc.ordering = options.ordering ?? true;
        this.displayBloc.paging = options.paging ?? true;
        this.displayBloc.searching = options.searching ?? true;
        this.displayBloc.columnSearch = options.columnSearch ?? true;

        // Levenshtein temperature (différence)
        this.options.temperature = parseInt(options.temperature) || 1;

        // Initialisation du trie par défaut
        let orderString = options.order || this.table.getAttribute("data-order");
        if (typeof orderString === "string") {
            this.sortedColumns = JSON.parse(orderString);
        } else if (Array.isArray(orderString)) {
            this.sortedColumns = orderString;
        } else {
            this.sortedColumns = [];
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

        // Colorisation des lignes pair et impair
        this.options.rowOddEven = options.rowOddEven ?? true;

        // this.readyPromise = this.init();
        this.init();
    }

    init() {
        if( this.translation === null ) {
            this.loadTranslate();
        }

        this.createWrappers();

        if (this.displayBloc.searching ) {
            this.addSearchInput();
        }

        if (this.displayBloc.info) {
            this.addInfoControls();
        }

        if (this.displayBloc.paging) {
            this.addPaginationControls();
        }

        if (this.displayBloc.ordering) {
            this.addSortingArrows();
            this.applyInitialOrder();
        }

        // Ici, car on fait un paginate lorsque l'on re-ordonne le tableau 
        if( !this.displayBloc.ordering ) {
            this.paginate();
        }

        if (this.displayBloc.columnSearch) {
            this.addSearchColumn();
        }
    }

    ready() {
        return this.readyPromise;
    }

    loadTranslate() {
        if (this.lang === 'en_EN') {
            this.getLangDefault();
            return;
        }

        try {
            let request = new XMLHttpRequest();
            request.open('GET', this.lang, false);
            request.setRequestHeader("Content-Type", "application/json");
            request.send(null);

            if (request.status !== 200) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            this.translation = JSON.parse(request.responseText);
        } catch (error) {
            console.error("Error loading translation file :", error);
        }
    }

    translator(keys, variables = {}) {
        let template = this.translation[keys] || keys;
        // console.log("Key : " + keys + " || Translate : " + template);

        for (let [k, v] of Object.entries(variables)) {
            template = template.replace(`{{${k}}}`, v);
        }

        return template;
    }

    getLangDefault() {
        // The variable is replaced during compilation
        this.translation = {"searchGlobalTitle":"Search in global table","searchGlobalPlaceholder":"Search...","searchColomnTitle":"Search in the column : ","searchColomnPlaceholder":"Search in the column ...","infoLabel":"Display of {{start}} element at {{end}} on {{total}} elements","previous":"Previous","next":"Next","all":"All","selectItemsDisplay":"Display","selectItemsItems":"items","selectItemsTitle":"List for numbers items display","copy":"Copy","copyTitle":"Copy to clipboard","copyExported":"Text copied to clipboard","csv":"CSV","csvTitle":"Export to CSV"};
    }

    use(plugin) {
        // this.ready().then(() => {
            plugin.install(this);
            this.plugins.push(plugin);
        // });
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
        this.searchInput.title = this.translator('searchGlobalTitle');
        this.searchInput.setAttribute("type", "text");
        this.searchInput.setAttribute("placeholder", this.translator('searchGlobalPlaceholder'));
        this.searchInput.className = "search-input";
        this.paginationWrapperTopContainer.appendChild(this.searchInput);

        this.addEventList(this.searchInput, 'keyup', this.debounce(() => {
            this.searchTable(null, this.searchInput.value, 'text');
        }, this.debounce_delai).bind(this));
    }

    addSearchColumn() {
        let searchRow = document.createElement('tr');
        searchRow.classList.add("thead-search");

        let headers = this.table.querySelectorAll("thead th");
        headers.forEach(header => {
            let cell = document.createElement('th');
            let searchType = header.getAttribute('data-search') ?? '';
            let colName = this.translator('searchColomnTitle') + header.innerHTML.indexOf('<span') !== -1 ? header.innerHTML.substring(0, header.innerHTML.indexOf('<span')).trim() : header.innerText;

            switch (searchType) {
                case "input":     // deprecated
                case "text":
                    let input = document.createElement('input');
                    input.type = "text";
                    input.title = colName;
                    input.placeholder = this.translator('searchColomnPlaceholder');

                    this.addEventList(input, 'input', this.debounce((e) => {
                        this.searchTable(header.cellIndex, e.target.value, 'text');
                    }, this.debounce_delai).bind(this));
                    cell.appendChild(input);
                break;
                case "combobox":    // deprecated
                case "select":
                    let sortOrder = header.getAttribute('data-searchOrder') ?? 'asc';
                    sortOrder = sortOrder.toLowerCase();
                    if (sortOrder !== 'asc' && sortOrder !== 'desc') {
                        sortOrder = 'asc';
                    }

                    let select = document.createElement('select');
                    select.title = colName;
                    let uniqueValues = this.getUniqueValuesForColumn(header.cellIndex, sortOrder);
                    select.innerHTML = `<option value="">` + this.translator('all') + `</option>`;
                    uniqueValues.forEach(val => {
                        let option = document.createElement('option');
                        option.value = val;
                        option.textContent = val;
                        select.appendChild(option);
                    });

                    this.addEventList(select, 'change', this.debounce((e) => {
                        this.searchTable(header.cellIndex, e.target.value, 'select');
                    }, this.debounce_delai).bind(this));
                    cell.appendChild(select);
                break;
                default:
                    // On ne fait rien, cela ajoutera un th vide
                break;
            }

            searchRow.appendChild(cell);
        });

        this.table.querySelector('thead').appendChild(searchRow);
    }

    getUniqueValuesForColumn(colIndex, sortOrder) {
        let values = [];
        let rows = this.table.querySelector("tbody").querySelectorAll("tr");
        rows.forEach(row => {
            let cell = row.cells[colIndex];
            let value = cell.hasAttribute("data-search") ? cell.getAttribute("data-search") : cell.textContent.trim();
            if (!values.includes(value)) {
                values.push(value);
            }
        });

        // Tri des valeurs en tenant compte des nombres
        values.sort((a, b) => {
            // Convertit en nombres si possible, sinon laisse comme chaîne
            let numA = isNaN(a) ? a : parseFloat(a);
            let numB = isNaN(b) ? b : parseFloat(b);

            if (numA < numB) return sortOrder === 'asc' ? -1 : 1;
            if (numA > numB) return sortOrder === 'asc' ? 1 : -1;

            return 0;
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
        header.dataset.sort = sortDirection;

        this.sortTable(idx, sortDirection);
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
        let rows = Array.from(this.table.querySelector("tbody").querySelectorAll("tr"));
        rows.sort((a, b) => {
            let A = a.cells[colIndex].hasAttribute('data-order') ? a.cells[colIndex].getAttribute('data-order') : a.cells[colIndex].textContent.trim();
            let B = b.cells[colIndex].hasAttribute('data-order') ? b.cells[colIndex].getAttribute('data-order') : b.cells[colIndex].textContent.trim();

            if (this.detectColumnType(colIndex) === 'number') {
                return direction === 'asc' ? A - B : B - A;
            } else {
                return direction === 'asc' ? A.localeCompare(B) : B.localeCompare(A);
            }
        });

        this.table.querySelector("tbody").append(...rows);

        if (this.displayBloc.paging) {
            this.paginate();
        } else {
            this.oddEven();
        }
    }

    applyInitialOrder() {
        this.sortedColumns.forEach(orderCriteria => {
            let [colIndex, direction] = orderCriteria;
            this.sortTable(colIndex, direction.toLowerCase());

            let header = this.table.querySelector(`th:nth-child(${colIndex + 1})`);
            header.dataset.sort = direction.toLowerCase();
            this.updateArrows(header);
        });
    }

    oddEven() {
        if( !this.options.rowOddEven )
            return;

        let rows = this.table.querySelectorAll("tbody tr");
        var visibleCount = 0;

        rows.forEach(row => {
            if( row.style.display == "none" )
                return;

            visibleCount++;

            row.classList.remove('even');
            row.classList.remove('odd');

            if (visibleCount % 2 === 0) {
                row.classList.add('even');
            } else {
                row.classList.add('odd');
            }
        });
    }

    searchTable(colIndex, query, typeSearch) {
        query = query.trim();

        // on utilise 'global' comme clé pour une recherche globale ou le numéro d'index pour les colonnes
        let key = colIndex === null || colIndex === undefined ? "global" : colIndex;

        // Mise à jour de l'objet des filtres
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

                // Info : data-search dans ce contexte  est sur le td des données pour avoir plus d'information exemple : <td data-search="Tiger Nixon">T. Nixon</td>
                let rowText = ""
                if (filterKey !== 'global') {
                    let cell = row.cells[parseInt(filterKey)];
                    rowText = cell.hasAttribute("data-search") ? cell.getAttribute("data-search") : cell.textContent;
                } else {
                    let cells = Array.from(row.getElementsByTagName("td"));
                    rowText = Array.from(cells).map(
                        cell => cell.hasAttribute("data-search") ? cell.getAttribute("data-search") : cell.textContent
                    ).join(' ');
                }

                rowText = rowText.trim().toLowerCase();
                if ( !this.matchesUsingLevenshtein(rowText, filterQuery, typeSearch) ){
                    row.style.display = "none";
                    row.dataset.matched = "false";
                }
            }
        });

        // Remise à zéro de la pagination et repagination avec les résultats filtrés
        this.currentPage = 1;
        this.paginate();
    }

    determineTemperature(typeSearch) {
        let temperture = 0;

        switch (typeSearch) {
            case 'text' :
                temperture = this.options.temperature;
            break;
            case 'select' :
                temperture = 0;
            break;
        }

        return temperture;
    }

    matchesUsingLevenshtein(rowText, filterQuery, typeSearch) {
        if ( rowText.indexOf(filterQuery) !== -1) {
            return true;
        }

        let temperature = this.determineTemperature(typeSearch);
        if( temperature == 0 || filterQuery.length < 4 || typeof rowText !== 'string' || typeof filterQuery !== 'string') {
            return false;
        }

        for (let i = 0; i <= rowText.length - filterQuery.length; i++) {
            let sub = rowText.substring(i, i + filterQuery.length);
            if (this.levenshteinDistance(sub, filterQuery) <= this.options.temperature) {
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
            this.infoLabel.textContent = this.translator('infoLabel', {start : startIdx, end : endDisplay, total : totalRows});
        }

        // Control display of previous & next buttons
        this.prevButton.disabled = this.currentPage <= 1;
        this.nextButton.disabled = this.currentPage >= totalPages

        let rows = Array.from(this.table.querySelectorAll("tbody tr")).filter(row => row.dataset.matched !== "false");
        rows.forEach((row, idx) => {
            row.style.display = idx < startIdx || idx >= endIdx ? "none" : "";
        });

        // Supprime les boutons existants
        let buttonsDelete = this.paginationButtonsContainer.querySelectorAll('.page-btn');
        buttonsDelete.forEach((button) => {
            this.paginationButtonsContainer.removeChild(button);
        });

        let numPagesAround = 1; // Nombre de pages avant et après la page courante
        let startPage = Math.max(1, this.currentPage - numPagesAround);
        let endPage = Math.min(totalPages, this.currentPage + numPagesAround);

        let lastChild = this.paginationButtonsContainer.lastElementChild;

        // Ajoute toujours la première page
        if (startPage > 1) {
            this.addPageButton(1, lastChild);
        }

        // Ajoute les pages intermédiaires.
        for (let i = startPage; i <= endPage; i++) {
            this.addPageButton(i, lastChild);
        }

        // Ajoute toujours la dernière page
        if (endPage < totalPages) {
            this.addPageButton(totalPages, lastChild);
        }

        this.oddEven();
    }

    addPageButton(pageNumber, lastChild) {
        let btn = document.createElement('button');
        btn.textContent = pageNumber;
        btn.setAttribute('data-page', pageNumber);
        btn.className = 'page-btn';
        btn.classList.toggle('active', pageNumber === this.currentPage);

        this.paginationButtonsContainer.insertBefore(btn, lastChild);
    }

    addInfoControls() {
        this.infoLabel = document.createElement('span');
        this.infoLabel.className = 'pagination-info';
        this.paginationWrapperDownContainer.appendChild(this.infoLabel);
    }

    addPaginationControls() {
        this.paginationWrapperTop = document.createElement('div');
        this.paginationWrapperTop.className = 'pagination-wrapper-top';

        this.paginationInfoTop = document.createElement("span");
        this.paginationInfoTop.textContent = this.translator('selectItemsDisplay');
        this.paginationWrapperTop.appendChild(this.paginationInfoTop);

        this.paginationSelect = document.createElement("select");
        this.paginationSelect.title = this.translator('selectItemsTitle');
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
        this.paginationInfoTopAfter.textContent = this.translator('selectItemsItems');
        this.paginationWrapperTop.appendChild(this.paginationInfoTopAfter);

        this.paginationWrapperTopContainer.appendChild(this.paginationWrapperTop);

        // Create du wrapper "pagination-buttons-container" for boutton
        this.paginationButtonsContainer = document.createElement('div');
        this.paginationButtonsContainer.className = 'pagination-buttons-container';

        this.prevButton = document.createElement('button');
        this.prevButton.textContent = this.translator('previous');
        this.prevButton.className = 'page-prev';
        this.paginationButtonsContainer.appendChild(this.prevButton);

        this.nextButton = document.createElement('button');
        this.nextButton.textContent = this.translator('next');
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

        // Supprime le wrapper en dessous du tableau 
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