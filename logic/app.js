mapboxgl.accessToken =
  "pk.eyJ1Ijoidml0YWFsb3ZlcmFsMjAyNCIsImEiOiJjbHdseHNoYTEwajVzMmpueG15NjFiNzliIn0.i0vTHFJc8gnPInHozWhDuA";

let map;
let userMarker;
const flowerMarkers = [];
const amountOfFlowers = 2;
const radiusInMeters = 100;
const MINIMAL_FLOWER_DISTANCE_IN_METERS = 10;
const initialFlowerPickupDistance = 20;
const flowersCollected = new Set();
const flowers = [
  { name: "flower_1", path: "assets/flowers/flower_1.png" },
  { name: "flower_2", path: "assets/flowers/flower_2.png" },
  { name: "flower_3", path: "assets/flowers/flower_3.png" },
  { name: "flower_4", path: "assets/flowers/flower_4.png" },
  { name: "flower_5", path: "assets/flowers/flower_5.png" },
  { name: "flower_6", path: "assets/flowers/flower_6.png" },
  { name: "flower_7", path: "assets/flowers/flower_7.png" },
  { name: "flower_8", path: "assets/flowers/flower_8.png" },
  { name: "flower_9", path: "assets/flowers/flower_9.png" },
  { name: "flower_10", path: "assets/flowers/flower_10.png" },
  { name: "flower_11", path: "assets/flowers/flower_11.png" },
  { name: "flower_12", path: "assets/flowers/flower_12.png" },
  { name: "flower_13", path: "assets/flowers/flower_13.png" },
  { name: "flower_14", path: "assets/flowers/flower_14.png" },
  { name: "flower_15", path: "assets/flowers/flower_15.png" },
  { name: "flower_16", path: "assets/flowers/flower_16.png" },
  { name: "flower_17", path: "assets/flowers/flower_17.png" },
  { name: "flower_18", path: "assets/flowers/flower_18.png" },
  { name: "flower_19", path: "assets/flowers/flower_19.png" },
  { name: "flower_20", path: "assets/flowers/flower_20.png" },
  { name: "flower_21", path: "assets/flowers/flower_21.png" },
  { name: "flower_22", path: "assets/flowers/flower_22.png" },
  { name: "flower_23", path: "assets/flowers/flower_23.png" },
  { name: "flower_24", path: "assets/flowers/flower_24.png" },
  { name: "flower_25", path: "assets/flowers/flower_25.png" },
  { name: "flower_26", path: "assets/flowers/flower_26.png" },
  { name: "flower_27", path: "assets/flowers/flower_27.png" },
];

function pickRandomFlower(array) {
  const randomIndex = Math.floor(Math.random() * array.length);
  let randomFlower = array[randomIndex];
  return randomFlower;
}

function initMap(userLocation) {
  map = new mapboxgl.Map({
    container: "map",
    style: "mapbox://styles/mapbox/streets-v11",
    center: [userLocation.lng, userLocation.lat],
    zoom: 16,
  });

  generateFlowerLocations(userLocation, amountOfFlowers, radiusInMeters);

  userMarker = new mapboxgl.Marker({
    element: createMarkerElement("assets/current_location_icon.png", 30, 30),
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

function celebrateSingleFlower(flower) {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
  });

  const flowerImg = document.getElementById("collected-flower-img");
  const flowerName = document.getElementById("collected-flower-name");
  const popup = document.getElementById("popup-flower");

  if (flowerImg && flowerName && popup) {
    flowerImg.src = flower.path;
    flowerName.textContent = flower.name;
    popup.style.display = "flex";

    setTimeout(() => {
      popup.style.display = "none";
    }, 3000);
  } else {
    console.error("One or more required elements not found.");
  }
}

function showAllFlowersCollectedMessage() {
  const duration = 10 * 1000,
    animationEnd = Date.now() + duration,
    defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

  function randomInRange(min, max) {
    return Math.random() * (max - min) + min;
  }

  const interval = setInterval(function () {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    const particleCount = 50 * (timeLeft / duration);

    // since particles fall down, start a bit higher than random
    confetti(
      Object.assign({}, defaults, {
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      })
    );
    confetti(
      Object.assign({}, defaults, {
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      })
    );
  }, 250);

  const popup = document.getElementById("popup-bouquet");
  popup.style.display = "flex";
}

function checkProximityToFlowers(userLocation) {
  flowerMarkers.forEach((marker, index) => {
    const flowerLocation = marker.getLngLat();
    const distance = turf.distance(
      [userLocation.lng, userLocation.lat],
      [flowerLocation.lng, flowerLocation.lat],
      { units: "meters" }
    );

    if (
      distance < initialFlowerPickupDistance &&
      !flowersCollected.has(index)
    ) {
      marker.remove();
      flowersCollected.add(index);

      // Accessing the flowerPath from the marker options
      let flower = marker.options.flower;
      if (flowersCollected.size === amountOfFlowers) {
        showAllFlowersCollectedMessage();
      } else {
        celebrateSingleFlower(flower);
      }
    }
  });
}

function createMarkerElement(url, width, height) {
  const element = document.createElement("div");
  element.style.backgroundImage = `url(${url})`;
  element.style.backgroundSize = "contain";
  element.style.backgroundRepeat = "no-repeat";
  element.style.backgroundPosition = "center";
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

        const randomFlower = pickRandomFlower(flowers);

        const marker = new mapboxgl.Marker({
          element: createMarkerElement(randomFlower.path, 30, 30),
        })
          .setLngLat([location.lng, location.lat])
          .addTo(map);

        if (!marker.options) {
          marker.options = {}; // Ensure options object exists
        }

        marker.options.flower = randomFlower; // Set flower object instead of path
        flowerMarkers.push(marker);

        // Log the generated flower image paths
        console.log(`Flower ${i + 1} path: ${randomFlower.path}`);
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
