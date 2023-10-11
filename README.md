# TableBeautifuller (English Version)

Welcome to TableBeautifuller, a JavaScript library designed to enhance your HTML tables with advanced features such as pagination, sorting, and searching.
If the features provided do not meet your specific requirements, we recommend using `Datatable.js` for more advanced functionalities.
However, `tableBeautifuller` supports extending its functionalities through plugins.
If you require features that are not currently available, you can submit a ticket, and we will consider adding it after review.

## Features
- Pagination for long tables.
- Sorting columns in ascending or descending order.
- A search bar to filter rows based on input.


# Performance Comparison: tableBeautifuller vs Datatable

This document provides a detailed performance comparison between `tableBeautifuller` and `Datatable`. The tests were conducted over 3000 executions.

## Comparative Table

| Metric                         | tableBeautifuller         | Datatable               |
|--------------------------------|---------------------------|-------------------------|
| Number of executions           | 3000                      | 3000                    |
| Execution time (ms)            | 4083.40                   | 142709.70               |
| Average time/execution (ms)    | 1.36                      | 47.57                   |

As seen in the table above, `tableBeautifuller` outperforms `Datatable` in terms of execution time, being significantly faster over 3000 runs.


## Installation

Include `tableBeautifuller.js` in your project to get started.

```html
<script src="path_to_your_js_folder/tableBeautifuller.js"></script>
```

## Usage

Wrap your table with the `TableBeautifuller` class and enjoy the new features.

```javascript
let myTable = new TableBeautifuller("#myTable");
```

### 🚀 How to Contribute to the Development

**English :**

1. **Fork** the repository on GitHub.
2. **Clone** the forked repository to your local machine.
3. **Install** the dependencies with `npm install`.
4. When working on the project, run the `watch` script with the command `npm run watch`. This will automatically update the demo file upon any changes.
5. **Create** a new branch for each feature or bug fix.
6. **Commit** your changes and **push** your branch to your fork on GitHub.
7. Create a **pull request** for your changes from your fork.

**Note :** Make sure to thoroughly test any new feature or bug fix before submitting your pull request.

## Documentation

For a comprehensive guide and detailed instructions, refer to our [documentation](./doc/english.md).




---




# TableBeautifuller (Version Française)

Bienvenue sur TableBeautifuller, une bibliothèque JavaScript conçue pour embellir vos tables HTML avec des fonctionnalités avancées telles que la pagination, le tri et la recherche.
Si les fonctionnalités fournies ne répondent pas à vos exigences spécifiques, nous vous recommandons d'utiliser `Datatable.js` pour des fonctionnalités plus avancées.
Cependant, `tableBeautifuller` permet l'extension de ses fonctionnalités via des plugins. 
Si vous avez besoin de fonctionnalités qui ne sont pas actuellement disponibles, vous pouvez soumettre un ticket, et nous examinerons la possibilité de l'ajouter après évaluation.

## Caractéristiques
- Pagination pour les tables longues.
- Tri des colonnes par ordre croissant ou décroissant.
- Une barre de recherche pour filtrer les lignes selon l'input.


# Comparaison des Performances : tableBeautifuller vs Datatable

Ce document fournit une comparaison détaillée des performances entre `tableBeautifuller` et `Datatable`. Les tests ont été effectués sur 3000 exécutions.

## Tableau Comparatif

| Métrique                    | tableBeautifuller         | Datatable               |
|-----------------------------|---------------------------|-------------------------|
| Nombre d'exécutions         | 3000                      | 3000                    |
| Durée d'exécution (ms)      | 4083.40                   | 142709.70               |
| Durée moyenne/ exécution (ms)| 1.36                     | 47.57                  |


Comme on peut le voir dans le tableau ci-dessus, `tableBeautifuller` surpasse `Datatable` en termes de temps d'exécution, en étant significativement plus rapide sur 3000 exécutions.


## Installation

Incluez `tableBeautifuller.js` dans votre projet pour commencer.

```html
<script src="chemin_vers_votre_dossier_js/tableBeautifuller.js"></script>
```

## Utilisation

Encadrez votre table avec la classe `TableBeautifuller` et profitez des nouvelles fonctionnalités.

```javascript
let myTable = new TableBeautifuller("#myTable");
```

### 🚀 Comment contribuer au développement

**Français :**

1. **Forkez** le dépôt sur GitHub.
2. **Clonez** le dépôt forké sur votre machine locale.
3. **Installez** les dépendances avec `npm install`.
4. Pour travailler sur le projet, lancez le script `watch` avec la commande `npm run watch`. Cela mettra automatiquement à jour le fichier de démo lors de toute modification.
5. **Créez** une nouvelle branche pour chaque fonctionnalité ou correction de bug.
6. **Committez** vos changements et **poussez** votre branche vers votre fork sur GitHub.
7. Créez une **pull request** pour vos modifications à partir de votre fork.

**Note :** Assurez-vous de tester minutieusement toute nouvelle fonctionnalité ou correction de bug avant de soumettre votre pull request.

## Documentation

Pour un guide complet et des instructions détaillées, consultez notre [documentation](./doc/french.md).

---
# Contributors

<a href="https://github.com/Fabacks/TableBeautifuller/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=Fabacks/TableBeautifuller" />
</a>

Made with [contrib.rocks](https://contrib.rocks).