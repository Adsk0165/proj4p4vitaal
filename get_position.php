<?php
// Simuleer het ophalen van de positie vanuit een database of een ander bron
$lat = 51.54827117919922; // Voorbeeld breedtegraad
$lng = 4.5983967781066895; // Voorbeeld lengtegraad

// Stuur de positie terug als JSON
echo json_encode(array('lat' => $lat, 'lng' => $lng));
?>
