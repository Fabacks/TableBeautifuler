<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tableau de Données Aléatoires</title>

    <link rel="stylesheet" href="./../dist/css/TableBeautifuller.css">
    <script src="./../dist/js/TableBeautifuller.js" defer></script>

    <style>
        table {
            width: 100%;
            border-collapse: collapse;
        }
        th, td {
            border: 1px solid #333;
            padding: 8px;
            text-align: left;
        }
    </style>
</head>
<body>

<script>
    document.addEventListener("DOMContentLoaded", () => {
        let table = new TableBeautifuller("#demo-table");
    });
</script>

<?php
// Number line generate 
$nbLine = 10000;

// simulate data 
$name = ["Martin", "Dupont", "Durand", "Leroy", "Morel", "Petit", "Roux", "Fournier", "Dubois", "Blanc", "Garnier", "Faure", "Andre", "Mercier", "Legrand", "Giraud", "Renaud", "Gaillard", "Brun", "Perez", "Lemoine", "Marin", "Lemoine", "Renard", "Fischer", "Perrot", "Schmitt", "Moreau", "Dufour", "Girard"];
$fname = ["Jean", "Marie", "Pierre", "Luc", "Laura", "Michel", "Sophie", "Alain", "Claire", "David", "Julie", "Paul", "Elise", "Jacques", "Nathalie", "Antoine", "Hélène", "Maxime", "Emma", "Julien", "Camille", "Simon", "Charlotte", "Louis", "Sarah", "Henri", "Marion", "Théo", "Laura", "Mélanie"];
$city = ["Paris", "Lyon", "Marseille", "Toulouse", "Nice", "Nantes", "Montpellier", "Strasbourg", "Bordeaux", "Lille", "Rennes", "Reims", "Le Havre", "Saint-Étienne", "Toulon", "Grenoble", "Dijon", "Angers", "Nîmes", "Villeurbanne", "Saint-Denis", "Le Mans", "Aix-en-Provence", "Brest", "Limoges", "Tours", "Amiens", "Metz", "Boulogne-Billancourt", "Besançon"];
$work = ["Ingénieur", "Médecin", "Enseignant", "Comptable", "Artisan", "Avocat", "Architecte", "Infirmier", "Agriculteur", "Chauffeur", "Chef de projet", "Électricien", "Journaliste", "Plombier", "Développeur", "Technicien", "Consultant", "Pharmacien", "Chef d'entreprise", "Dentiste", "Commercial", "Psychologue", "Notaire", "Maçon", "Menuisier", "Banquier", "Professeur", "Chirurgien", "Assistant social", "Esthéticien"];
$birth = range(20, 60);

// Function random extract data
function getElementRandom($array) {
    return $array[array_rand($array)];
}
?>

<table id="demo-table" data-page-length="20" data-order='[[0, "ASC"]]'>
    <thead>
        <tr>
            <th data-search="text">Name</th>
            <th data-search="text">Firstname</th>
            <th data-search="text">City</th>
            <th data-search="select">Work</th>
            <th data-search="text">Birth</th>
        </tr>
    </thead>
    <tbody>
        <?php for ($i = 0; $i < $nbLine; $i++): ?>
        <tr>
            <td><?php echo getElementRandom($name); ?></td>
            <td><?php echo getElementRandom($fname); ?></td>
            <td><?php echo getElementRandom($city); ?></td>
            <td><?php echo getElementRandom($work); ?></td>
            <td><?php echo getElementRandom($birth); ?></td>
        </tr>
        <?php endfor; ?>
    </tbody>
</table>

</body>
</html>