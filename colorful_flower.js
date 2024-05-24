window.onload = function () {
  var canvas = document.getElementById("canvas");
  var ctx = canvas.getContext("2d");

  // Function to draw a flower with random hue and rotation
  function drawFlower(path) {
    // Load flower image
    var flower = new Image();
    flower.src = path; // Path to flower image

    // When the image is loaded, draw it on the canvas and apply color filters
    flower.onload = function () {
      // Generate a random hue rotation value between 0 and 360 degrees
      var randomHue = Math.floor(Math.random() * 360);
      var hueFilter = "hue-rotate(" + randomHue + "deg)";

      // Generate a random rotation angle between 0 and 360 degrees
      var randomRotation = Math.floor(Math.random() * 180) - 90;

      ctx.translate(canvas.width / 2, canvas.height / 2); // Move to the center of the canvas
      ctx.rotate((randomRotation * Math.PI) / 180); // Rotate the canvas

      // Apply the random hue rotation and draw the flower image
      ctx.filter = hueFilter;
      ctx.drawImage(
        flower,
        -canvas.width / 2,
        -canvas.height / 2,
        canvas.width,
        canvas.height
      );

      // Clear the filter and rotation to avoid affecting other drawings
      ctx.filter = "none";
      ctx.setTransform(1, 0, 0, 1, 0, 0);
    };
  }
  drawFlower("assets/flower_1.png");
};
