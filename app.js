let map;
let userMarker;
const flowerMarkers = [];
const flowersCollected = new Set();
var marker;

const flowerLocations = [
  { lat: 51.54827117919922, lng: 4.5983967781066895 },
  { lat: 51.5569, lng: 4.5983967781066895 },
  { lat: 51.585935913488875, lng: 4.79281179602562 },
];

function initMap(userLocation) {
  map = new google.maps.Map(document.getElementById("map"), {
    center: userLocation,
    zoom: 16,
  });

  flowerLocations.forEach(location => {
    marker = new google.maps.Marker({  // Verwijder 'const' hier
        position: location,
        map: map,
        icon: {
            url: 'assets/flower-icon.png',
            scaledSize: new google.maps.Size(30, 30),
        },
    });
    flowerMarkers.push(marker);
});

  userMarker = new google.maps.Marker({
    position: userLocation,
    map: map,
    icon: {
      url: 'assets/current-location-icon.png',
      scaledSize: new google.maps.Size(30, 30),
    },
  });

  watchUserLocation();
}

function watchUserLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.watchPosition(
      position => {
        const { latitude, longitude } = position.coords;
        const userLocation = { lat: latitude, lng: longitude };

        userMarker.setPosition(userLocation);
        checkProximityToFlowers(userLocation);
      },
      error => {
        console.error("Error getting position: ", error);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 5000,
      }
    );
  } else {
    alert("Geolocation is not supported by this browser.");
  }
}

function checkProximityToFlowers(userLocation) {
  flowerMarkers.forEach((marker, index) => {
    const flowerLocation = marker.getPosition();
    const distance = google.maps.geometry.spherical.computeDistanceBetween(
      new google.maps.LatLng(userLocation),
      flowerLocation
    );
    if (distance < 50 && !flowersCollected.has(index)) { // 50 meters radius
      marker.setMap(null); // Remove marker from map
      flowersCollected.add(index); // Mark flower as collected
      alert("Flower Collected!");
    }
  });
}

window.onload = function() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      position => {
        const { latitude, longitude } = position.coords;
        const userLocation = { lat: latitude, lng: longitude };
        initMap(userLocation);
      },
      error => {
        console.error("Error getting position: ", error);
        alert("Geolocation is not supported by this browser.");
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 5000,
      }
    );
  } else {
    alert("Geolocation is not supported by this browser.");
  }
};

function updatePosition() {
  $.ajax({
      url: 'get_position.php',
      dataType: 'json',
      success: function(data) {
          // Update de positie van de marker
          var newPosition = new google.maps.LatLng(data.lat, data.lng);
          marker.setPosition(newPosition);
      },
      complete: function() {
          // Roep de functie opnieuw aan na een vertraging
          setTimeout(updatePosition, 10000); // 10 seconden vertraging
      }
  });
}

// Roep de functie initieel aan
$(document).ready(function() {
  // Initialiseer de marker hier (moet eerder worden gedaan)
  // bijvoorbeeld: marker = new google.maps.Marker({ ... });
  // Daarna kunnen we de updatePosition functie aanroepen
  updatePosition();
});