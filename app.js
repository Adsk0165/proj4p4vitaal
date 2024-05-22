let map;
let userMarker;
let directionsService;
let directionsRenderer;
const flowerMarkers = [];
const flowersCollected = new Set();

const startLocation = { lat: 51.557, lng: 4.569 };
const endLocation = { lat: 51.557, lng: 4.569 };
const flowerLocations = [
  { lat: 51.54827117919922, lng: 4.5983967781066895 },
  { lat: 51.5569, lng: 4.5983967781066895 },
];

function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: startLocation,
    zoom: 16,
  });

  directionsService = new google.maps.DirectionsService();
  directionsRenderer = new google.maps.DirectionsRenderer({ map: map });

  calculateAndDisplayRoute();

  flowerLocations.forEach(location => {
    const marker = new google.maps.Marker({
      position: location,
      map: map,
      icon: {
        url: 'assets/flower-icon.png',
        scaledSize: new google.maps.Size(30, 30),
      },
    });
    flowerMarkers.push(marker);
  });

  if (navigator.geolocation) {
    navigator.geolocation.watchPosition(
      position => {
        const { latitude, longitude } = position.coords;
        const userLocation = { lat: latitude, lng: longitude };

        if (userMarker) {
          userMarker.setPosition(userLocation);
        } else {
          userMarker = new google.maps.Marker({
            position: userLocation,
            map: map,
            icon: {
              url: 'assets/current-location-icon.png',
              scaledSize: new google.maps.Size(30, 30),
            },
          });
        }

        checkProximityToFlowers(userLocation);
      },
      error => {
        console.error("Error watching position: ", error);
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

function calculateAndDisplayRoute() {
  directionsService.route(
    {
      origin: startLocation,
      destination: endLocation,
      travelMode: google.maps.TravelMode.WALKING,
    },
    (response, status) => {
      if (status === google.maps.DirectionsStatus.OK) {
        directionsRenderer.setDirections(response);
      } else {
        console.error("Directions request failed due to " + status);
      }
    }
  );
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

window.onload = initMap;
