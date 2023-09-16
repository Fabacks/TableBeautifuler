# Documentation : Librairie TableBeautifuller

TableBeautifuller est une classe JavaScript conçue pour améliorer la visualisation et la gestion des tables HTML en ajoutant des fonctionnalités utiles telles que la recherche, le tri, la pagination, etc.

## Utilisation de base

Pour initialiser TableBeautifuller, vous avez besoin d'une table HTML avec un identifiant unique. Vous passerez cet identifiant lors de la création d'une instance de TableBeautifuller.

```javascript
let myTable = new TableBeautifuller("monTableauId");
```

## Options

Lors de l'initialisation de TableBeautifuller, vous pouvez passer un objet d'options. Voici les options disponibles :

- **lang**: Un objet qui spécifie les données de langue. Par défaut, cela est défini sur un objet vide.

```javascript
let myTable = new TableBeautifuller("monTableauId", {
    lang: {
        // données de langue ici
    }
});
```

## Attributs de la table

Certains attributs peuvent être ajoutés à votre table pour influencer le comportement de TableBeautifuller:

- **data-page-length**: Initialise le nombre d'items par page. Par exemple:

```html
<table id="monTableauId" data-page-length="10">...</table>
```

- **data-order**: Initialise le tri par défaut des colonnes. (Actuellement, un seul tri est possible). Exemple:

```html
<table id="monTableauId" data-order='[["0", "asc"]]'>...</table>
```
Ici, `0` représente l'index de la colonne et `asc` le sens du tri (ascendant).

- **data-search**: Spécifie le type de recherche à effectuer. Les types possibles sont "input" et "combobox". Ajoutez cet attribut aux en-têtes de colonne. Exemple:

```html
<th data-search="input">Nom</th>
<th data-search="combobox">Pays</th>
```

## Méthodes principales

Voici quelques méthodes que vous pourriez trouver utiles:

- **destroy()**: Supprime toutes les fonctionnalités ajoutées par TableBeautifuller et ramène la table à son état d'origine.

## Conclusion

TableBeautifuller est une librairie puissante et flexible qui permet d'ajouter rapidement des fonctionnalités améliorées à vos tables HTML. Grâce à ses méthodes et options de configuration, vous pouvez personnaliser facilement le comportement et l'apparence de vos tables.