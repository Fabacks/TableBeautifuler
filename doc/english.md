# Documentation: TableBeautifuller Library

TableBeautifuller is a JavaScript class designed to enhance the visualization and management of HTML tables by adding useful features such as search, sorting, pagination, etc.

TableBeautifuller is compatible with the basic attributes of "datatable.js".

## Basic Usage

To initialize TableBeautifuller, you need an HTML table with a unique identifier (id). You will pass this identifier when creating a TableBeautifuller instance.

```javascript
let myTable = new TableBeautifuller("#myTable");
```



## Main Methods

Here are some methods you might find useful:

- **destroy()**: Removes all features added by TableBeautifuller and returns the table to its original state.

## Table Options or Attributes
Certain elements can be passed via the constructor or directly on the HTML elements. If the property appears in both the constructor and the tag, the constructor's value takes precedence.


## Use of Translation
The library comes with an English translation by default. You have the option to customize the language used through two available options in the constructor.

### option: language
This option allows you to provide the URL of a JSON file containing translations. For instance, to use French, you can specify the path to fr_FR.json.

```javascript
let myTable = new TableBeautifuller("myTable", {
    lang: {
        language: "./../dist/languages/fr_FR.json"
    }
});
```


### option: translation
This option allows you to directly pass the translation object into the constructor, thus avoiding an AJAX load and speeding up the process.

If the translation option is used, the language option becomes unnecessary.

Note that the "en_EN.json" file is incorporated into the library during compilation.

```javascript
let table = new TableBeautifuller("#demo-table", {
    translation : {
        "searchGlobalTitle": "Global search in the table",
        "searchGlobalPlaceholder": "Search...",
        //... other translation strings
    }
});
```


## Options

When initializing TableBeautifuller, you can pass an options object. Here are the available options:

- **info**: 
Allows you to specify whether to display information about the number of items in the table. Example: "Displaying item 1 to 15 of 57 items". Defaults to true if not specified.
```javascript
let myTable = new TableBeautifuller("myTable", {
    info: false
});
```

- **ordering**: 
Allows you to specify whether column sorting is desired. Defaults to true if not specified.
```javascript
let myTable = new TableBeautifuller("myTable", {
    ordering: false
});
```

- **order**: 
Allows you to specify which column should be sorted and in which direction (ASC, DESC) upon table creation.
```javascript
let myTable = new TableBeautifuller("myTable", {
    order: [[0, 'ASC']]
});
```

- **paging**:
Allows you to specify whether pagination is desired. Defaults to true if not specified.
```javascript
let myTable = new TableBeautifuller("myTable", {
    paging: false
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
Defines the selectable number of displayable items in the selector. Defaults to [10, 20, 30] if not specified.
```javascript
let myTable = new TableBeautifuller("myTable", {
    selectItemPage: [10, 20, 30]
});
```

- **searching**:
Allows you to specify if a global search on the table is desired. Defaults to true if not specified.
```javascript
let myTable = new TableBeautifuller("myTable", {
    searching: false
});
```

- **columnSearch**:
Allows you to specify if a search for each column on the table is desired. Note: For this option to be active, you must first have defined the colSearch attribute, [see here: column-wise search](#column_search). Defaults to true if not specified.
```javascript
let myTable = new TableBeautifuller("myTable", {
    columnSearch: false
});
```

- **temperature**: 
Allows you to specify the distance for the Levenshtein algorithm during search. Defaults to 1 if not specified. [see here for more explanation](#levenshtein_search)
```javascript
let myTable = new TableBeautifuller("myTable", {
    temperature: 2
});
```

- **debounceDelai**: 
Allows you to define a delay for the debounce during the search. Defaults to 300ms if not specified.
```javascript
let myTable = new TableBeautifuller("myTable", {
    debounceDelai : 300
});
```


- Even and Odd Rows

To display a default color for even and odd rows, add the option "rowOddEven" to true. Defaults to true if not specified.

```javascript
let myTable = new TableBeautifuller("myTable", {
    rowOddEven : true
});
```


## Table Attributes

Certain attributes can be added directly to the tags of your table to influence the behavior of TableBeautifuller.

- **data-page-length**: 
Initializes the number of items per page. For example:
```html
<table id="myTable" data-page-length="10">...</table>
```

- **data-order**: 
Initializes the default column sorting. (Currently, only one sort is possible). Example:
```html
<table id="myTable" data-order='[["0", "asc"]]'>...</table>
```
Here, `0` represents the column index and `asc` the sort direction (ascending).

<a id="column_search"></a>
- **data-search**: Specifies the type of search to perform. Possible types are "text" and "select". Add this attribute to column headers in the thead. This adds a search row specific to the column in the "thead". 

  - Type "*text*" : Allows for text-based searches on the column.

  - Type "*select*" : Allows for an exact search based on the selection from a dropdown list. Recommended when the column contains identical values.

  - Deprecations : The "input" type is renamed to "text" to be more consistent if we add input types like date, etc. The "combobox" type is renamed to "select" to align with HTML terminology.


Example:
```html
<table>
    <thead>
        <tr>
            <th data-search="text">Name</th>
            <th data-search="select">Country</th>
        ...
```

- **data-searchOrder**: Allows specifying a sort order for selects. It must be added in the th where the data-search="select" is located. The possible choices are "asc" or "desc", with the default value being "asc".

```html
<table>
    <thead>
        <tr>
            <th data-search="select" data-searchOrder="desc">Country</th>
        ....
```

- **data-search**: Allows a specific search for this cell. Useful for displaying nicknames but wanting the search to be on the full name. Example:
```html
<table>
    <tbody>
        <tr>
            <td data-search="Tiger Nixon">T. Nixon</td>
            <td>System Architect</td>
        ...
```

- **data-order**: Allows specifying specific data when sorting the column. See [Sorting with specific data](#sort_data_order) section.

## Column Sorting

Sorting is activated by clicking on column headers. By default, it will be sorted as a string sort. If the column contains numbers, it will automatically be sorted as a numeric column.

### Sorting with Specific Data (`data-order`) <a id="sort_data_order"></a>

In some cases, you might want to sort a column based on a value that doesn't match the visible text. For instance, to sort dates in a specific format or to sort based on a hidden value. For this, use the `data-order` attribute.

#### Example

Suppose you have a column with textual dates, like "March 12, 1983". However, for sorting, you'd like to use a timestamp to ensure correct sorting. Here's how you might structure your table:

```html
<table data-sortable>
    <thead>
        <tr>
            <th>Name</th>
            <th>Birth Date</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>John</td>
            <td data-order="415532400">March 12, 1983</td>
        </tr>
        <!-- ... other rows ... -->
    </tbody>
</table>
```

In this example, although the displayed date is "March 12, 1983", the value used for sorting will be the timestamp `415532400`.


### Sorting with the Levenshtein Algorithm <a id="levenshtein_search"></a>

The Levenshtein algorithm measures the distance between two strings by counting the minimum number of modifications (insertions, deletions, or substitutions) required to transform one string into another.

The algorithm only works if:
- The "temperature" is set greater than 0.
- There are more than 4 search characters.
- Both the cell and the search consist only of text.

**Note:** For large datasets, this can reduce performance. To deactivate the Levenshtein algorithm, simply set the "temperature" to 0.

## Table Styling

### Row Hover

To display a default color when hovering over a row, add the class "tableRowsHover".

```html
<table id="myTable" class="tableRowsHover">
```


## Plugins:

### Using Plugins

`tableBeautifuller` allows the use of plugins to extend its functionalities. To add a plugin, you should use the `use` method as shown in the following example with the `TableBeautifullerExport` plugin:

```javascript
table.use(new TableBeautifullerExport({
    exportCSV: true, 
    copy: true
}));
```

### TableBeautifullerExport
This plugin adds export functionalities to your tables. It introduces two buttons:

 - "Copy": to copy the table data to the clipboard.
 - "CSV": to export the table data in CSV format.

You can enable or disable these buttons by configuring them in the plugin's constructor:
```javascript
table.use(new TableBeautifullerExport({
    exportCSV: true, 
    copy: true
}));


## Conclusion

TableBeautifuller is a powerful and flexible library that allows you to quickly add enhanced features to your HTML tables. Thanks to its methods and configuration options, you can easily customize the behavior and appearance of your tables.