mapboxgl.accessToken =
  "pk.eyJ1Ijoidml0YWFsb3ZlcmFsMjAyNCIsImEiOiJjbHdseHNoYTEwajVzMmpueG15NjFiNzliIn0.i0vTHFJc8gnPInHozWhDuA";

let map;
let userMarker;
const flowerMarkers = [];
const flowerPaths = [];
const amountOfFlowers = 10;
const radiusInMeters = 500;
const MINIMAL_FLOWER_DISTANCE_IN_METERS = 20;
const initialFlowerPickupDistance = 10;
const flowersCollected = new Set();

function initializeFlowerPaths(array, count) {
  for (let i = 1; i <= count; i++) {
    let flower = `assets/flower_${i}.png`;
    array.push(flower);
  }
}

function pickRandomFlower(array) {
  const randomIndex = Math.floor(Math.random() * array.length);
  let randomFlower = array[randomIndex];
  return randomFlower;
}

function initMap(userLocation) {
  initializeFlowerPaths(flowerPaths, 9);

  map = new mapboxgl.Map({
    container: "map",
    style: "mapbox://styles/mapbox/streets-v11",
    center: [userLocation.lng, userLocation.lat],
    zoom: 16,
  });

  generateFlowerLocations(userLocation, amountOfFlowers, radiusInMeters); // 10 flowers within 1 km radius

  userMarker = new mapboxgl.Marker({
    element: createMarkerElement("../assets/current_location_icon.png", 30, 30),
  })
    .setLngLat([userLocation.lng, userLocation.lat])
    .addTo(map);

  watchUserLocation();
}

function watchUserLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const userLocation = { lat: latitude, lng: longitude };

        animateMarker(userMarker, userMarker.getLngLat(), userLocation);
        checkProximityToFlowers(userLocation);
      },
      (error) => {
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
    const lat = startPos.lat + deltaLat * (currentFrame / frames);
    const lng = startPos.lng + deltaLng * (currentFrame / frames);
    marker.setLngLat([lng, lat]);

    if (currentFrame < frames) {
      requestAnimationFrame(moveMarker);
    }
  }

  requestAnimationFrame(moveMarker);
}

function collectFlower() {
  // Voeg confetti toe
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
  });

  // Toon de melding
  const notification = document.getElementById("notification");
  notification.style.display = "block";

  // Verberg de melding na 10 seconden
  setTimeout(() => {
    notification.style.display = "none";
  }, 10000);
}

function checkProximityToFlowers(userLocation) {
  flowerMarkers.forEach((marker, index) => {
    const flowerLocation = marker.getLngLat();
    const distance = turf.distance(
      [userLocation.lng, userLocation.lat],
      [flowerLocation.lng, flowerLocation.lat],
      { units: "meters" }
    );

    // Skip proximity check if user is within initialFlowerPickupDistance
    if (distance < initialFlowerPickupDistance) {
      console.log(
        `Flower ${index} is too close to the initial spawn location. Skipping collection check.`
      );
      return;
    }

    if (
      distance < initialFlowerPickupDistance &&
      !flowersCollected.has(index)
    ) {
      marker.remove();
      flowersCollected.add(index);
      collectFlower(); // Roep de functie aan om te vieren
    }
  });
}

function createMarkerElement(url, width, height) {
  const element = document.createElement("div");
  element.style.backgroundImage = `url(${url})`;
  element.style.backgroundSize = "cover";
  element.style.width = `${width}px`;
  element.style.height = `${height}px`;
  return element;
}

function generateFlowerLocations(center, count, radius) {
  const isochroneServiceUrl = `https://api.mapbox.com/isochrone/v1/mapbox/walking/${center.lng},${center.lat}?contours_meters=${radius}&polygons=true&access_token=${mapboxgl.accessToken}`;

  fetch(isochroneServiceUrl)
    .then((response) => response.json())
    .then((data) => {
      const isochrone = data.features[0].geometry.coordinates[0];
      for (let i = 0; i < count; i++) {
        let location;
        let isValidLocation = false;

        // Ensure the flower is at least MINIMAL_FLOWER_DISTANCE_IN_METERS from others
        while (!isValidLocation) {
          const randomPoint = getRandomPointInPolygon(isochrone);
          location = { lng: randomPoint[0], lat: randomPoint[1] };
          isValidLocation = flowerMarkers.every((marker) => {
            const flowerLocation = marker.getLngLat();
            const distance = turf.distance(
              [location.lng, location.lat],
              [flowerLocation.lng, flowerLocation.lat],
              { units: "meters" }
            );
            return distance >= MINIMAL_FLOWER_DISTANCE_IN_METERS;
          });
        }

        const marker = new mapboxgl.Marker({
          element: createMarkerElement(pickRandomFlower(flowerPaths), 30, 30),
        })
          .setLngLat([location.lng, location.lat])
          .addTo(map);

        flowerMarkers.push(marker);
      }
    })
    .catch((error) => console.error("Error fetching isochrone:", error));
}

function getRandomPointInPolygon(polygon) {
  const bbox = turf.bbox(turf.polygon([polygon]));
  let point;
  while (true) {
    point = turf.randomPoint(1, { bbox }).features[0].geometry.coordinates;
    if (turf.booleanPointInPolygon(point, turf.polygon([polygon]))) {
      return point;
    }
  }
}

window.onload = function () {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const userLocation = { lat: latitude, lng: longitude };
        initMap(userLocation);
      },
      (error) => {
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
    url: "../logic/get_position.php",
    dataType: "json",
    success: function (data) {
      const newPosition = { lat: data.lat, lng: data.lng };
      animateMarker(userMarker, userMarker.getLngLat(), newPosition);
    },
    complete: function () {
      setTimeout(updatePosition, 10000);
    },
  });
}

$(document).ready(function () {
  updatePosition();
});
