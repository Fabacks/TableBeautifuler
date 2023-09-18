# Documentation: TableBeautifuller Library

TableBeautifuller is a JavaScript class designed to enhance the visualization and management of HTML tables by adding useful features such as search, sorting, pagination, etc.

TableBeautifuller is compatible with basic attributes of "datatable.js".

## Basic Usage

To initialize TableBeautifuller, you need an HTML table with a unique identifier (id). You'll pass this identifier when creating a TableBeautifuller instance.

```javascript
let myTable = new TableBeautifuller("#myTable");
```

## Table Options or Attributes
Some properties can be passed via the constructor or directly on the HTML elements. If the property appears in both the constructor and the tag, the constructor value takes precedence.

## Options

When initializing TableBeautifuller, you can pass an options object. Here are the available options:

- **order**: 
Specifies which column should be sorted and in which order (ASC, DESC).
```javascript
let myTable = new TableBeautifuller("myTable", {
    order: [[0, 'ASC']]
});
```

- **pageLength**:
Number of items displayed per pagination page. Defaults to 10 if not specified.
```javascript
let myTable = new TableBeautifuller("myTable", {
    pageLength: 10
});
```

- **selectItemPage**:
Defines the number of displayable items in the selector. Defaults to [10, 20, 30] if not specified.
```javascript
let myTable = new TableBeautifuller("myTable", {
    selectItemPage: [10, 20, 30]
});
```

- **debounceDelay**: 
Defines a delay for debounce during search. Defaults to 300ms if not specified.
```javascript
let myTable = new TableBeautifuller("myTable", {
    debounceDelay: 300
});
```

## Table Attributes

Some attributes can be added directly to the tags of your table to influence TableBeautifuller's behavior.

- **data-page-length**: 
Sets the number of items per page. For example:

```html
<table id="myTable" data-page-length="10">...</table>
```

- **data-order**: 
Sets the default column sorting. (Currently, only one sort is possible). Example:

```html
<table id="myTable" data-order='[["0", "asc"]]'>...</table>
```

Here, `0` represents the column index and `asc` represents the sorting order (ascending).

- **data-search**: Specifies the type of search to perform. Possible types are "input" and "combobox". Add this attribute to column headers. It adds a specific search row in the "thead" for the column. Example:

```html
<table>
    <thead>
        <tr>
            <th data-search="input">Name</th>
            <th data-search="combobox">Country</th>
        ....
```

- **data-search**: Allows for a specific search for this cell. Useful for displaying abbreviations but wanting to search on the full name. Example:

```html
<table>
    <tbody>
        <tr>
            <td data-search="Tiger Nixon">T. Nixon</td>
            <td>System Architect</td>
        ....
```

- **data-order**: Specifies specific data for column sorting. See [Sort with specific data](#sort_data_order) section.

## Main Methods

Here are some methods you might find useful:

- **destroy()**: Removes all functionalities added by TableBeautifuller and returns the table to its original state.

## Column Sorting

Sorting is enabled by clicking on column headers. By default, sorting is done as a string sort. If the column contains numbers, it will be automatically sorted as a numeric column.

### Sort with Specific Data (`data-order`) <a id="sort_data_order"></a>

In some cases, you might want to sort a column based on a value that doesn't match the visible text, e.g., to sort dates in a specific format or to sort based on a hidden value. For this, use the `data-order` attribute.

### Example

Suppose you have a column with textual dates like "12 March 1983". However, for sorting, you'd want to use a timestamp to ensure correct sorting. Here's how you could structure your table:

```html
<table data-sortable>
    <thead>
        <tr>
            <th>Name</th>
            <th>Birthdate</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>John</td>
            <td data-order="415532400">12 March 1983</td>
        </tr>
        <!-- ... other rows ... -->
    </tbody>
</table>
```

In this example, although the displayed date is "12 March 1983", the sorting will use the timestamp `415532400`.

## Table Styling

### Even and Odd Rows
To display a default color on even and odd rows, add the class "tableRowsColors".

```html
<table id="myTable" class="tableRowsColors">
```

### Row Hover
To display a default color when hovering over a row, add the class "tableRowsHover".

```html
<table id="myTable" class="tableRowsHover">
```

## Conclusion

TableBeautifuller is a powerful and flexible library that allows you to quickly add enhanced features to your HTML tables. With its methods and configuration options, you can easily customize the behavior and appearance of your tables.