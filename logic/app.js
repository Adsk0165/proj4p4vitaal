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
    const marker = new google.maps.Marker({
      position: location,
      map: map,
      icon: {
        url: '../assets/flower-icon.png',
        scaledSize: new google.maps.Size(30, 30),
      },
    });
    flowerMarkers.push(marker);
  });

  userMarker = new google.maps.Marker({
    position: userLocation,
    map: map,
    icon: {
      url: '../assets/current-location-icon.png',
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
        
        // Gebruik een animatie voor de update van de marker positie
        animateMarker(userMarker, userMarker.getPosition(), userLocation);
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

function animateMarker(marker, startPos, endPos) {
  const deltaLat = endPos.lat - startPos.lat();
  const deltaLng = endPos.lng - startPos.lng();
  const frames = 60; // Aantal frames voor de animatie
  let currentFrame = 0;

  function moveMarker() {
    currentFrame++;
    const lat = startPos.lat() + (deltaLat * (currentFrame / frames));
    const lng = startPos.lng() + (deltaLng * (currentFrame / frames));
    const newPosition = new google.maps.LatLng(lat, lng);
    marker.setPosition(newPosition);

    if (currentFrame < frames) {
      requestAnimationFrame(moveMarker);
    }
  }

  requestAnimationFrame(moveMarker);
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
    url: '../logic/get_position.php',
    dataType: 'json',
    success: function(data) {
      // Update de positie van de marker
      var newPosition = new google.maps.LatLng(data.lat, data.lng);
      animateMarker(marker, marker.getPosition(), newPosition);
    },
    complete: function() {
      // Roep de functie opnieuw aan na een vertraging
      setTimeout(updatePosition, 10000); // 10 seconden vertraging
    }
  });
}

// Roep de functie initieel aan
$(document).ready(function() {
  updatePosition();
});
