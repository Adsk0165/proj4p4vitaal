mapboxgl.accessToken = 'pk.eyJ1Ijoidml0YWFsb3ZlcmFsMjAyNCIsImEiOiJjbHdseHNoYTEwajVzMmpueG15NjFiNzliIn0.i0vTHFJc8gnPInHozWhDuA';

let map;
let userMarker;
const flowerMarkers = [];
const flowersCollected = new Set();
const flowerLocations = [
  { lat: 51.54827117919922, lng: 4.5983967781066895 },
  { lat: 51.5569, lng: 4.5983967781066895 },
  { lat: 51.585935913488875, lng: 4.79281179602562 },
  { lat: 51.540415, lng: 4.607396}
];

function initMap(userLocation) {
  map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11',
    center: [userLocation.lng, userLocation.lat],
    zoom: 16,
  });

  flowerLocations.forEach(location => {
    const marker = new mapboxgl.Marker({
      element: createMarkerElement('../assets/flower-icon.png', 30, 30)
    })
    .setLngLat([location.lng, location.lat])
    .addTo(map);

    flowerMarkers.push(marker);
  });

  userMarker = new mapboxgl.Marker({
    element: createMarkerElement('../assets/current-location-icon.png', 30, 30)
  })
  .setLngLat([userLocation.lng, userLocation.lat])
  .addTo(map);

  watchUserLocation();
}

function watchUserLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.watchPosition(
      position => {
        const { latitude, longitude } = position.coords;
        const userLocation = { lat: latitude, lng: longitude };

        animateMarker(userMarker, userMarker.getLngLat(), userLocation);
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
  const deltaLat = endPos.lat - startPos.lat;
  const deltaLng = endPos.lng - startPos.lng;
  const frames = 60;
  let currentFrame = 0;

  function moveMarker() {
    currentFrame++;
    const lat = startPos.lat + (deltaLat * (currentFrame / frames));
    const lng = startPos.lng + (deltaLng * (currentFrame / frames));
    marker.setLngLat([lng, lat]);

    if (currentFrame < frames) {
      requestAnimationFrame(moveMarker);
    }
  }

  requestAnimationFrame(moveMarker);
}

function celebrate() {
  // Voeg confetti toe
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
  });

  // Laat de pop-up zien
  const popup = document.getElementById('popup');
  popup.style.display = 'flex';

  // Verberg de pop-up na enkele seconden
  setTimeout(() => {
      popup.style.display = 'none';
  }, 5000); // Stel hier de gewenste tijd in voor het tonen van de pop-up
}

function checkProximityToFlowers(userLocation) {
  flowerMarkers.forEach((marker, index) => {
      const flowerLocation = marker.getLngLat();
      const distance = turf.distance([userLocation.lng, userLocation.lat], [flowerLocation.lng, flowerLocation.lat], { units: 'meters' });
      console.log(`Distance to flower ${index}: ${distance} meters`); // Debugging output
      if (distance < 50 && !flowersCollected.has(index)) {
          marker.remove();
          flowersCollected.add(index);
          celebrate(); // Roep de functie aan om te vieren
      }
  });
}

function createMarkerElement(url, width, height) {
  const element = document.createElement('div');
  element.style.backgroundImage = `url(${url})`;
  element.style.backgroundSize = 'cover';
  element.style.width = `${width}px`;
  element.style.height = `${height}px`;
  return element;
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
      const newPosition = { lat: data.lat, lng: data.lng };
      animateMarker(userMarker, userMarker.getLngLat(), newPosition);
    },
    complete: function() {
      setTimeout(updatePosition, 10000);
    }
  });
}

$(document).ready(function() {
  updatePosition();
});
