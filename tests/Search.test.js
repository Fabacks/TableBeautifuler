const TableBeautifuller = require('../dist/js/TableBeautifuller.min.js');

beforeEach(() => {
    document.body.innerHTML = `
        <table id="monTableId">
        <thead>
        <tr>
            <th>ID</th>
            <th>Nom</th>
            <th>Description</th>
            <th>Date</th>
            <th>Statut</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>1</td>
            <td>Alice</td>
            <td>hello world</td>
            <td>2024-02-29</td>
            <td>Actif</td>
        </tr>
        <tr>
            <td>2</td>
            <td>Bob</td>
            <td>(hello)</td>
            <td>2024-03-01</td>
            <td>Inactif</td>
        </tr>
        <tr>
            <td>3</td>
            <td>Charlie</td>
            <td>+hello</td>
            <td>2024-03-02</td>
            <td>En attente</td>
        </tr>
        <tr>
            <td>4</td>
            <td>Diana</td>
            <td>-hello</td>
            <td>2024-03-03</td>
            <td>Actif</td>
        </tr>
        <tr>
            <td>5</td>
            <td>Edward</td>
            <td>hello%</td>
            <td>2024-03-04</td>
            <td>Inactif</td>
        </tr>
    </tbody>
</table>
    `;
});

let tbf;
beforeEach(() => {
    // Créer une instance de TableBeautifuller après avoir défini le DOM
    tbf = new TableBeautifuller("#monTableId");
});



/**
 * Tests for determineSearchType
 */
describe('determineSearchType', () => {
    it('returns regex for queries with regex characters', () => {
        expect(tbf.determineSearchType('\\w+')).toEqual('regex');
        expect(tbf.determineSearchType('^(hello)')).toEqual('regex');
    });

    it('returns special for queries with special operations', () => {
        expect(tbf.determineSearchType('+hello')).toEqual('special');
        expect(tbf.determineSearchType('-hello')).toEqual('special');
        expect(tbf.determineSearchType('hello%')).toEqual('special');
        expect(tbf.determineSearchType('hello*')).toEqual('special');
    });

    it('returns levenshtein for other queries', () => {
        expect(tbf.determineSearchType('hello')).toEqual('levenshtein');
    });
});




describe('matchesRegex', () => {
    it('matches based on regular expression', () => {
        expect(tbf.matchesRegex('hello world', 'hello.*')).toBeTruthy();
        expect(tbf.matchesRegex('hello world', '^hello')).toBeTruthy();
        expect(tbf.matchesRegex('hello world', 'world$')).toBeTruthy();
        expect(tbf.matchesRegex('hello world', 'bye')).toBeFalsy();
    });
});



describe('matchesUsingLevenshtein', () => {
    it('returns true for close matches', () => {
        expect(tbf.matchesUsingLevenshtein('hello', 'helo', 'text')).toBeTruthy();
    });

    it('returns false for distant matches', () => {
        expect(tbf.matchesUsingLevenshtein('hello', 'world', 'text')).toBeFalsy();
    });
});



describe('matchesSpecial', () => {
    it('handles + operation', () => {
        expect(tbf.matchesSpecial('hello world', '+hello')).toBeTruthy();
        expect(tbf.matchesSpecial('hello world', '+bye')).toBeFalsy();
    });

    it('handles - operation', () => {
        expect(tbf.matchesSpecial('hello world', '-hello')).toBeFalsy();
        expect(tbf.matchesSpecial('hello world', '-bye')).toBeTruthy();
    });

    it('handles * wildcard', () => {
        expect(tbf.matchesSpecial('hello world', 'h*o')).toBeTruthy();
        expect(tbf.matchesSpecial('hello world', 'b*e')).toBeFalsy();
    });

    it('handles % fuzzy search', () => {
        expect(tbf.matchesSpecial('hello', 'hlo%')).toBeTruthy();
        expect(tbf.matchesSpecial('hello', 'world%')).toBeFalsy();
    });
});
