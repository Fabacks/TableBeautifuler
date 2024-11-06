/**
 * TableBeautifuller
 * 
 * Author: Fabacks
 * License: Free distribution except for commercial use
 * GitHub Repository: https://github.com/Fabacks/TableBeautifuller
 * Version 1.3.0
 * 
 * This software is provided "as is" without any warranty. The author is
 * not responsible for any damages or liabilities caused by the use of this software.
 * Please do not use this software for commercial purposes without explicit permission from the author.
 * If you use or distribute this software, please credit the author and link back to the GitHub repository.
 */

class TableBeautifuller {
    TYPE_SEARCH_LEVENSHTEIN = "levenshtein";

    constructor(tableId, pOptions = {}) {
        this.table = document.querySelector(tableId);
        this.eventList = [];    // List of event listener
        this.plugins = [];      // List of plugin active
        this.filters = {};      // List of filter active
        this.options = {};      // List of options
        this.displayBloc = {};  // List of display

        // Translate
        this.langDefault = "en_EN";
        this.lang = pOptions.language ?? this.langDefault;
        this.translation = pOptions.translation ?? null;

        // Display
        this.displayBloc.info = pOptions.info ?? true;
        this.displayBloc.ordering = pOptions.ordering ?? true;
        this.displayBloc.paging = pOptions.paging ?? true;
        this.displayBloc.searching = pOptions.searching ?? true;
        this.displayBloc.columnSearch = pOptions.columnSearch ?? true;

        // Levenshtein temperature (différence)
        this.options.temperature = parseInt(pOptions.temperature) || 1;

        // Type de recherche par défaut
        this.options.searchType = pOptions.searchType ?? this.TYPE_SEARCH_LEVENSHTEIN;
        this.options.searchChooses = {};

        // Initialisation du trie par défaut
        let orderString = pOptions.order || this.table.getAttribute("data-order");
        if (typeof orderString === "string") {
            this.sortedColumns = JSON.parse(orderString);
        } else if (Array.isArray(orderString)) {
            this.sortedColumns = orderString;
        } else {
            this.sortedColumns = [];
        }

        // Initialisation des valeurs pour la pagination (nombre item par page)
        this.pageLength = pOptions.pageLength || parseInt(this.table.getAttribute("data-page-length")) || 10;
        this.currentPage = 1;

        // Initialisation du nombre d'item par page dans le selector
        this.selectItemPage = pOptions.selectItemPage || [10, 20, 30, 40, 50];
        if (!this.selectItemPage.includes(this.pageLength)) {
            this.selectItemPage.push(this.pageLength);
            this.selectItemPage.sort((a, b) => a - b);
        }

        // Initialisation du debounce
        this.debounce_delai = pOptions.debounceDelai || 300;

        // Colorisation des lignes pair et impair
        this.options.rowOddEven = pOptions.rowOddEven ?? true;

        // this.readyPromise = this.init();
        this.init();
    }

    init() {
        this.loadTranslate();
        this.createWrappers();
        this.addSearchInput();
        this.addInfoControls();
        this.addPaginationControls();

        if (this.displayBloc.ordering) {
            this.addSortingArrows();
            this.applyInitialOrder();
            this.paginate();
        }

        this.addSearchColumn();
    }

    ready() {
        return this.readyPromise;
    }

    loadTranslate() {
        if( this.translation !== null )
            return;

        if (this.lang === this.langDefault) {
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
        this.translation = {"searchGlobalTitle":"Search in global table","searchGlobalPlaceholder":"Search...","searchColomnTitle":"Search in the column : ","searchColomnPlaceholder":"Search in the column ...","infoLabel":"Display of {{start}} element at {{end}} on {{total}} elements","previous":"Previous","next":"Next","all":"All","selectItemsDisplay":"Display","selectItemsItems":"items","selectItemsTitle":"List for numbers items display","copy":"Copy","copyTitle":"Copy to clipboard","copyExported":"Text copied to clipboard","csv":"CSV","csvTitle":"Export to CSV","searchOfType":"Type of search","searchDropStrict":"Strict","searchDropRegex":"Regex","searchDropLevenshtein":"Levenshtein","searchDropCompose":"Compose"};
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

        // Création du wrapper "pagination-wrapper-down-container" en dessous du tableau
        this.paginationWrapperDownContainer = document.createElement('div');
        this.paginationWrapperDownContainer.classList.add('tableBeautifuller', 'pagination-wrapper-down-container');
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

    /**
     * Ajouter l'écouteur d'événement à l'élément
     * Stocker l'élément, l'événement et la fonction d'écouteur liée dans eventList
     * 
     * @param {*} element 
     * @param {*} eventName 
     * @param {*} listener 
     */
    addEventList(element, eventName, listener) {
        element.addEventListener(eventName, listener);
        this.eventList.push({element, eventName, listener});
    }

    addSearchInput() {
        if ( !this.displayBloc.searching )
            return;

        let drop = this.addSearchDropdownContent();
        this.paginationWrapperTopContainer.appendChild(drop);

        this.searchInput = document.createElement("input");
        this.searchInput.title = this.translator('searchGlobalTitle');
        this.searchInput.setAttribute("type", "text");
        this.searchInput.setAttribute("placeholder", this.translator('searchGlobalPlaceholder'));
        this.searchInput.className = "search-input";
        this.paginationWrapperTopContainer.appendChild(this.searchInput);

        this.addEventList(this.searchInput, 'keyup', this.debounce(() => {
            this.handleSearchTable(null, this.searchInput.value, 'text');
        }, this.debounce_delai).bind(this));
    }

    addSearchColumn() {
        if ( !this.displayBloc.columnSearch )
            return;

        let searchRow = document.createElement('tr');
        searchRow.classList.add("thead-search");

        let headers = this.table.querySelectorAll("thead th");
        let findSearch = false;

        for (const header of headers) {
            let searchType = header.getAttribute('data-search') ?? '';
            if( searchType !== '') {
                findSearch = true;
                break;
            }
        };

        if( !findSearch ) 
            return;

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
                        this.handleSearchTable(header.cellIndex, e.target.value, 'text');
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

                    this.addEventList(select, 'change', (e) => {
                        this.handleSearchTable(header.cellIndex, e.target.value, 'select');
                    });

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


    addSearchDropdownContent() {
        // Définition des types de recherche
        this.options.searchChooses = [
            {
                "section": this.translator('searchOfType'),
                "options": [
                    { "key": "strict", "label": this.translator('searchDropStrict') },
                    { "key": "levenshtein", "label": this.translator('searchDropLevenshtein') },
                    { "key": "regex", "label": this.translator('searchDropRegex') },
                    // { "key": "compose", "label": this.translator('searchDropCompose') },
                ]
            }
        ];

        let wrapDropdown = document.createElement('div');
        wrapDropdown.classList.add('wrapper-dropdown');

        let btnDropdown = document.createElement('button');
        btnDropdown.id = 'search-options-button';
        btnDropdown.innerHTML = '&#8942' ;
        btnDropdown.addEventListener('click', () => this.toggleSearchDropdown());
        wrapDropdown.appendChild(btnDropdown);

        let dropdown = document.createElement('div');
        dropdown.id = 'search-dropdown';
        dropdown.classList.add('dropdown');

        this.options.searchChooses.forEach(sectionData => {
            let wrapItems = document.createElement('div');
            wrapItems.classList.add('dropdown-wrapper_items');
            dropdown.appendChild(wrapItems);

            let header = document.createElement('div');
            header.classList.add('dropdown-header');
            header.textContent = sectionData.section;
            wrapItems.appendChild(header);

            sectionData.options.forEach(optionData => {
                let item = document.createElement('div');
                item.classList.add('dropdown-item');
                item.setAttribute('data-key', optionData.key);

                if (optionData.key === this.options.searchType) {
                    item.classList.add('selected');
                }

                let checkIcon = document.createElement('span');
                checkIcon.classList.add('check-icon');
                checkIcon.textContent = '✔';
                item.appendChild(checkIcon);

                let optionText = document.createElement('span');
                optionText.textContent = optionData.label;
                item.appendChild(optionText);

                item.addEventListener('click', () => this.handleOptionSearchDropdownClick(item));
                wrapItems.appendChild(item);
            });
        });

        wrapDropdown.appendChild(dropdown);
        document.addEventListener('click', (event) => this.handleOutsideSearchDropdownClick(event, wrapDropdown));

        return wrapDropdown;
    }

    toggleSearchDropdown() {
        let dropdown = document.querySelector('#search-dropdown');
        dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
    }

    handleOptionSearchDropdownClick (item) {
        // Récupérer la clé de l'option sélectionnée & mise à jour l'option sélectionnée
        let selectedKey = item.getAttribute('data-key');
        this.options.searchType = selectedKey;

        // Retirer la classe 'selected' des autres éléments et masquer leurs icônes de coche
        let allItems = document.querySelectorAll('.dropdown-item');
        allItems.forEach(element => {
            element.classList.remove('selected');
        });

        // Ajouter la classe 'selected' à l'élément cliqué pour afficher l'icône de coche
        item.classList.add('selected');

        // On relance la recherche
        this.searchTable('text');
    }

    handleOutsideSearchDropdownClick(event, wrapDropdown) {
        if (!wrapDropdown.contains(event.target)) {
            let dropdown = document.querySelector('#search-dropdown');
            dropdown.style.display = 'none';
        }
    }


    getUniqueValuesForColumn(colIndex, sortOrder) {
        let values = [];
        let cells = this.table.querySelectorAll('tbody tr td:nth-child(' + (colIndex +1) + ')');
        cells.forEach(cell => {
            let value = cell.hasAttribute("data-search") ? cell.getAttribute("data-search") : cell.textContent.trim();
            if (!values.includes(value)) {
                values.push(value);
            }
        });

        const isNumeric = this.detectColumnType(colIndex) === 'number';
        values.sort((a, b) => {
            let numA = isNumeric ? a : parseFloat(a);
            let numB = isNumeric ? b : parseFloat(b);

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

    /**
     * Fonction utilitaire pour obtenir la valeur du "data-order" si présent sinon la valeur de la cellule
     * 
     * @param {*} cell 
     * @returns 
     */
    getCellValue_DataOrder(cell) {
        return cell.hasAttribute('data-order') ? cell.getAttribute('data-order') : cell.textContent.trim();
    }

    /**
     * Détecte le type de valeur pour la colonne : string ou numeric
     * @param {*} colIndex 
     * @returns 
     */
    detectColumnType(colIndex) {
        let cells = this.table.querySelectorAll('tbody tr td:nth-child(' + (colIndex +1) + ')');
        for (let cell of cells) {
            let content = this.getCellValue_DataOrder(cell);
            if (isNaN(content)) {
                return 'string';
            }
        }

        return 'number';
    }

    sortTable(colIndex, direction) {
        let rows = Array.from(this.table.querySelectorAll(`tbody tr`));
        const isNumericColumn = this.detectColumnType(colIndex) === 'number';

        rows.sort((a, b) => {
            const A = this.getCellValue_DataOrder(a.cells[colIndex]);
            const B = this.getCellValue_DataOrder(b.cells[colIndex]);

            if (isNumericColumn) {
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

            let header = this.table.querySelector(`thead th:nth-child(${colIndex + 1})`);
            if( header == undefined || header == null )
                    return;

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

    handleSearchTable(colIndex, query, typeSearch) {
        query = query.trim();

        // on utilise 'global' comme clé pour une recherche globale ou le numéro d'index pour les colonnes
        let key = colIndex === null || colIndex === undefined ? "global" : colIndex;

        // Mise à jour de l'objet des filtres
        if (query.trim() != '') {
            this.filters[key] = query.toLowerCase();
        } else {
            delete this.filters[key];
        }

        this.searchTable(typeSearch);
    }

    searchTable(typeSearch, colIndex = null) {
        let rows = this.table.querySelectorAll("tbody tr");

        // Reset de la recherche
        rows.forEach(row => {
            row.dataset.matched = "true";
            row.style.display = "";
        });

        rows.forEach(row => {
            if (row.dataset.matched !== "true")
                return;

            for (const [filterKey, filterQuery] of Object.entries(this.filters)) {
                const rowText = this.extractRowText(row, filterKey);
                const searchType = colIndex == null ? this.options.searchType : this.TYPE_SEARCH_LEVENSHTEIN;
                let isMatch = false;

                switch (searchType) {
                    case 'special':
                        isMatch = this.matchesSpecial(rowText, filterQuery);
                    break;
                    case 'regex':
                        isMatch = this.matchesRegex(rowText, filterQuery);
                    break;
                    case 'levenshtein':
                        isMatch = this.matchesUsingLevenshtein(rowText, filterQuery, typeSearch);
                    break;
                    case 'strict':
                        isMatch = this.matchesUsingLevenshtein(rowText, filterQuery, typeSearch, 0);
                    break;
                }

                if ( !isMatch ) {
                    row.style.display = "none";
                    row.dataset.matched = "false";
                }
            }
        });

        // Remise à zéro de la pagination et repagination avec les résultats filtrés
        this.currentPage = 1;
        this.paginate();
    }

    matchesSpecial(rowText, query) {
        const terms = query.split(/\s+/);
        let mustInclude = [];
        let mustExclude = [];
        let fuzzyMatches = [];

        terms.forEach(term => {
            if (term.startsWith('+')) {
                mustInclude.push(term.substring(1).replace(/\*/g, ".*"));
            } else if (term.startsWith('-')) {
                mustExclude.push(term.substring(1).replace(/\*/g, ".*"));
            } else if (term.endsWith('%')) {
                fuzzyMatches.push(term.slice(0, -1));
            } else {
                mustInclude.push(term.replace(/\*/g, ".*"));
            }
        });

        // Vérification des termes à inclure
        for (let term of mustInclude) {
            let regex = new RegExp(term);
            if (!regex.test(rowText)) {
                return false;
            }
        }

        // Vérification des termes à exclure
        for (let term of mustExclude) {
            let regex = new RegExp(term);
            if (regex.test(rowText)) {
                return false;
            }
        }

        // Vérification des correspondances floues (%)
        for (let term of fuzzyMatches) {
            if (this.levenshteinDistance(rowText, term) > this.options.temperature) {
                return false;
            }
        }

        return true;
    }

    matchesRegex(rowText, query) {
        // Créer l'expression régulière à partir de la requête modifiée
        let regex = new RegExp(query, 'i'); // 'i' pour la recherche insensible à la casse

        // Tester si le texte de la rangée correspond à l'expression régulière
        return regex.test(rowText);
    }

    /**
     * Extracts the text from a specific row and column index.
     * 
     * Info : data-search dans ce contexte  est sur le td des données pour avoir plus d'information 
     * exemple : <td data-search="Tiger Nixon">T. Nixon</td>
     * 
     * @param {Object} row - The row element from which to extract the text
     * @param {number|string} colIndex - The index of the column or 'global' for all columns
     * @return {string} The extracted text from the specified row and column index, trimmed and converted to lowercase
     */
    extractRowText(row, colIndex) {
        let rowText = "";
        if (colIndex !== 'global') {
            let cell = row.cells[parseInt(colIndex)];
            rowText = cell.hasAttribute("data-search") ? cell.getAttribute("data-search") : cell.textContent;

            // console.log(`Extracted text from column ${colIndex}: ${rowText}`);
        } else {
            let cells = Array.from(row.getElementsByTagName("td"));
            rowText = cells.map(
                cell => cell.hasAttribute("data-search") ? cell.getAttribute("data-search") : cell.textContent
            ).join(' ');
        }

        return rowText.trim().toLowerCase();
    }

    determineTemperature(typeSearch) {
        let temperature = 0;

        switch (typeSearch) {
            case 'text' :
                temperature = this.options.temperature;
            break;
            case 'select' :
                temperature = 0;
            break;
            default:
                temperature = 0;
        }

        return temperature;
    }

    matchesUsingLevenshtein(rowText, filterQuery, typeSearch, pTemperature = null) {
        if ( rowText.indexOf(filterQuery) !== -1) {
            return true;
        }

        const temperature = pTemperature ?? this.determineTemperature(typeSearch);
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
        if ( !this.displayBloc.info )
            return;

        this.infoLabel = document.createElement('span');
        this.infoLabel.className = 'pagination-info';
        this.paginationWrapperDownContainer.appendChild(this.infoLabel);
    }

    addPaginationControls() {
        if ( !this.displayBloc.paging )
            return;

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

if (typeof exports === 'object' && typeof module !== 'undefined') {
    module.exports = TableBeautifuller;
} else {
    window.TableBeautifuller = TableBeautifuller;
}