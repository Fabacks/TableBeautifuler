# Documentation : Librairie TableBeautifuller

TableBeautifuller est une classe JavaScript conçue pour améliorer la visualisation et la gestion des tables HTML en ajoutant des fonctionnalités utiles telles que la recherche, le tri, la pagination, etc.

TableBeautifuller est compatible avec les attributs de base de "datatable.js".

## Utilisation de base

Pour initialiser TableBeautifuller, vous avez besoin d'une table HTML du tableau. Le tableau avec un identifiant unique (id). Vous passerez cet identifiant lors de la création d'une instance de TableBeautifuller.

```javascript
let myTable = new TableBeautifuller("#myTable");
```

## Méthodes principales

Voici quelques méthodes que vous pourriez trouver utiles:

- **destroy()**: Supprime toutes les fonctionnalités ajoutées par TableBeautifuller et ramène la table à son état d'origine.

## Options ou Attributs de la table
Certains éléments peuvent être passés par le constructeur ou directement sur les éléments HTML. Si la propriété apparait à la fois dans le constructeur et sur la balise, la valeur du constructeur est prioritaire.



## Options

Lors de l'initialisation de TableBeautifuller, vous pouvez passer un objet d'options. Voici les options disponibles :

<!-- - **lang**: Un objet qui spécifie les données de langue. Par défaut, cela est défini sur un objet vide.

```javascript
let myTable = new TableBeautifuller("myTable", {
    lang: {
        // données de langue ici
    }
});
``` -->


- **info**: 
Permet spécifier si l'on afficher les informations sur le nombre d'éléments du tableau. Exemple : "Affichage de l'élément 1 à 15 sur 57 éléments". Par défaut true si non spécifié.
```javascript
let myTable = new TableBeautifuller("myTable", {
    info: false
});
```


- **ordering**: 
Permet spécifier si l'on veut un trie sur les colonnes. Par défaut true si non spécifié.
```javascript
let myTable = new TableBeautifuller("myTable", {
    ordering: false
});
```


- **order**: 
Permet de spécifier quelle colonne doit être trier et dans quel sens (ASC, DESC) à la création du tableau.
```javascript
let myTable = new TableBeautifuller("myTable", {
    order: [[0, 'ASC']]
});
```


- **paging**:
Permet spécifier si l'on veut de la pagination. Par défaut true si non spécifié.
```javascript
let myTable = new TableBeautifuller("myTable", {
    paging: false
});
```


- **pageLength**:
Nombre d'élément affiché par page de pagination. Par défaut 10 si non spécifié.
```javascript
let myTable = new TableBeautifuller("myTable", {
    pageLength: 10
});
```

- **selectItemPage**:
Définie dans le sélecteur le nombre d'éléments affichable possible. Par défaut [10, 20, 30] si non spécifié.
```javascript
let myTable = new TableBeautifuller("myTable", {
    selectItemPage: [10, 20, 30]
});
```


- **searching**:
Permet spécifier si l'on veut une recherche global sur le tableau. Par défaut true si non spécifié.
```javascript
let myTable = new TableBeautifuller("myTable", {
    searching: false
});
```


- **columnSearch**:
Permet spécifier si l'on veut une recherche sur chaque colonne sur le tableau. Attention : Pour que cette option soit active, il faut au préalable avoir définie l'attribut colSearch, [voir ici : recherche par colonnes](#recherche_colonne). Par défaut true si non spécifié.
```javascript
let myTable = new TableBeautifuller("myTable", {
    columnSearch: false
});
```


- **debounceDelai**: 

Permet de définir un délais pour le debounce lors de la recherche. Par default  300ms si non spécifié.

```javascript
let myTable = new TableBeautifuller("myTable", {
    debounceDelai : 300
});
```

## Attributs de la table

Certains attributs peuvent être ajoutés directement sur les balises de votre table pour influencer le comportement de TableBeautifuller. 


- **data-page-length**: 
Initialise le nombre d'items par page. Par exemple:

```html
<table id="myTable" data-page-length="10">...</table>
```


- **data-order**: 
Initialise le tri par défaut des colonnes. (Actuellement, un seul tri est possible). Exemple:

```html
<table id="myTable" data-order='[["0", "asc"]]'>...</table>
```
Ici, `0` représente l'index de la colonne et `asc` le sens du tri (ascendant).


<a id="recherche_colonne"></a>
- **data-search**: Spécifie le type de recherche à effectuer. Les types possibles sont "input" et "combobox". Ajoutez cet attribut aux en-têtes de colonne dans le thead. 
Rajoute dans le "thead" une ligne de recherche spécifique à la colonne. Exemple:

```html
<table>
    <thead>
        <tr>
            <th data-search="input">Name</th>
            <th data-search="combobox">Country</th>
        ....
```

- **data-search**:  Permet d'effectuer une recherche spécifique pour cette cellule. Utile pour afficher des diminutifs mais que l'on veut effectuer la recherche sur le nom complet Exemple:

```html
<table>
    <tbody>
            <tr>
                <td data-search="Tiger Nixon">T. Nixon</td>
                <td>System Architect</td>
            ....
```

- **data-order**:  Permet de spécifier une donnée spécifique lors du trie de la colonne. Voir partie [Trier avec des données spécifiques](#trie_data_order)


## Tri des colonnes

Le tri est activé en cliquant sur les en-têtes de colonne. Par défaut, le tri sera effectué comme un tri de chaînes. Si la colonne contient des nombres, elle sera automatiquement triée comme une colonne numérique.

### Trier avec des données spécifiques (`data-order`) <a id="trie_data_order"></a>

Dans certains cas, vous souhaiterez peut-être trier une colonne en fonction d'une valeur qui ne correspond pas au texte visible. Par exemple, pour trier des dates dans un format spécifique ou pour trier en fonction d'une valeur cachée. Pour cela, utilisez l'attribut `data-order`.

### Exemple

Supposons que vous ayez une colonne avec des dates sous forme textuelle, comme "12 Mars 1983". Toutefois, pour le tri, vous souhaiteriez utiliser un timestamp pour garantir un tri correct. Voici comment vous pourriez structurer votre table :

```html
<table data-sortable>
    <thead>
        <tr>
            <th>Nom</th>
            <th>Date de Naissance</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>Jean</td>
            <td data-order="415532400">12 Mars 1983</td>
        </tr>
        <!-- ... autres lignes ... -->
    </tbody>
</table>
```

Dans cet exemple, bien que la date affichée soit "12 Mars 1983", la valeur utilisée pour le tri sera le timestamp `415532400`.


## Stylisation du tableau

### Ligne pair et Impair
Pour afficher une couleur par défaut sur les lignes pair et impaire, il faut rajouter la class "tableRowsColors".


```html
<table id="myTable" class="tableRowsColors">
```

### Survol d'une ligne
Pour afficher une couleur par défaut lors du survol d'une ligne, il faut rajouter la class "tableRowsHover".


```html
<table id="myTable" class="tableRowsHover">
```

## Conclusion

TableBeautifuller est une librairie puissante et flexible qui permet d'ajouter rapidement des fonctionnalités améliorées à vos tables HTML. Grâce à ses méthodes et options de configuration, vous pouvez personnaliser facilement le comportement et l'apparence de vos tables.