class TableBeautifullerExport {
    constructor(options = {}) {
        this.tableBF = null; // référence à tableBeautifuller
        this.options = {};

        this.options.csv = options.exportCSV ?? true;
        this.options.copy = options.copy ?? true;
    }

    install(tb) {
        this.tableBF = tb;

        this.tableBF.getTableData = this.getTableData.bind(this);
        this.tableBF.copyTableData = this.copyTableData.bind(this);
        this.tableBF.exportTableToCSV = this.exportTableToCSV.bind(this);

        this.createWrappers();
    }

    createWrappers() {
        const wrapper = document.querySelector('.tableBeautifuller.pagination-wrapper-top-container');
        const buttonsContainer = document.createElement('div');
        buttonsContainer.style.cssText = 'align-self: flex-end; display: flex; gap: 10px; margin: 10px 0;';

        if (this.options.copy) {
            this.addCopyButton(buttonsContainer);
        }

        if (this.options.csv) {
            this.addCSVButton(buttonsContainer);
        }

        wrapper.appendChild(buttonsContainer);
    }

    addCopyButton(container) {
        const copyBtn = document.createElement('button');
        copyBtn.innerText = this.tableBF.translator('copy');
        copyBtn.title = this.tableBF.translator('copyTitle');
        container.appendChild(copyBtn);

        // this.tableBF.addEventList(copyBtn, 'click', this.copyTableData().bind(this.tableBF));
        copyBtn.addEventListener('click', () => {
            this.tableBF.copyTableData();
        });
    }

    addCSVButton(container) {
        const csvBtn = document.createElement('button');
        csvBtn.innerText = this.tableBF.translator('csv');
        csvBtn.title = this.tableBF.translator('csvTitle');
        container.appendChild(csvBtn);

        let nameFile = 'tableDatas.csv';
        // this.tableBF.addEventList(copyBtn, 'click', this.exportTableToCSV(nameFile).bind(this.tableBF));
        csvBtn.addEventListener('click', () => {
            this.tableBF.exportTableToCSV(nameFile);
        });
    }

    getTableData() {
        const data = [];

        // Récupération des lignes d'entête
        const headerRows = this.tableBF.table.querySelectorAll("thead tr:not(.thead-search)");
        for (let row of headerRows) {
            // data.push(Array.from(row.querySelectorAll("th")).map(cell => cell.innerText));

            data.push(Array.from(row.querySelectorAll("th")).map(header => {
                if (header.innerHTML.indexOf('<span') !== -1) {
                    return header.innerHTML.substring(0, header.innerHTML.indexOf('<span')).trim();
                }

                return header.innerText;
            }));
        }

        // Récupération des lignes du corps
        const bodyRows = this.tableBF.table.querySelectorAll("tbody tr");
        for (let row of bodyRows) {
            data.push(Array.from(row.querySelectorAll("td")).map(cell => cell.innerText));
        }

        return data;
    }

    copyTableData() {
        const tableData = this.getTableData();
        const textToCopy = tableData.map(row => row.join("\t")).join("\n");

        try {
            navigator.clipboard.writeText(textToCopy);
            alert( this.tableBF.translator('copyExported') );
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    }

    exportTableToCSV(filename) {
        const tableData = this.getTableData();
        const csvData = tableData.map(row => row.map(cell => cell).join(";")).join("\n");

        let csvFile;
        let downloadLink;

        csvFile = new Blob([csvData], {type: "text/csv"});
        downloadLink = document.createElement("a");
        downloadLink.download = filename;
        downloadLink.href = window.URL.createObjectURL(csvFile);
        downloadLink.style.display = "none";
        document.body.appendChild(downloadLink);
        downloadLink.click();
    }
}