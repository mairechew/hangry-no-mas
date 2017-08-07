var options = [
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  ""
];

var startAngle = 0;
var arc = Math.PI / (options.length / 2);
var spinTimeout = null;

var spinArcStart = 10;
var spinTime = 0;
var spinTimeTotal = 0;

var ctx;

document.getElementById("spin").addEventListener("click", spin);

// $('#spin').click(function() {
//   $('.wheel-container').hide()
// })

function byte2Hex(n) {
  var nybHexString = "0123456789ABCDEF";
  return String(nybHexString.substr((n >> 4) & 0x0F, 1)) + nybHexString.substr(n & 0x0F, 1);
}

function RGB2Color(r, g, b) {
  return '#' + byte2Hex(r) + byte2Hex(g) + byte2Hex(b);
}

function getColor(item, maxitem) {
  var phase = 0;
  var center = 128;
  var width = 127;
  var frequency = Math.PI * 2 / maxitem;

  red = Math.sin(frequency * item + 2 + phase) * width + center;
  green = Math.sin(frequency * item + 0 + phase) * width + center;
  blue = Math.sin(frequency * item + 4 + phase) * width + center;

  return RGB2Color(red, green, blue);
}

function drawRouletteWheel() {
  var canvas = document.getElementById("canvas");
  if (canvas.getContext) {
    var outsideRadius = 200;
    var textRadius = 160;
    var insideRadius = 20;

    ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, 500, 500);

    ctx.strokeStyle = "white";
    ctx.lineWidth = 0.5;

    ctx.font = 'bold 18px Oswald sans-serif';

    for (var i = 0; i < options.length; i++) {
      var angle = startAngle + i * arc;
      ctx.fillStyle = getColor(i, options.length);

      ctx.beginPath();
      ctx.arc(250, 250, outsideRadius, angle, angle + arc, false);
      ctx.arc(250, 250, insideRadius, angle + arc, angle, true);
      ctx.stroke();
      ctx.fill();

      ctx.save();
      // ctx.shadowOffsetX = -1;
      // ctx.shadowOffsetY = -1;
      // // ctx.shadowBlur = 0;
      // ctx.shadowColor = "rgb(220,220,220)";
      ctx.fillStyle = "black";
      ctx.translate(250 + Math.cos(angle + arc / 2) * textRadius, 250 + Math.sin(angle + arc / 2) * textRadius);
      ctx.rotate(angle + arc / 2 + Math.PI / 2);
      var text = options[i];
      //Make text values in-line with panels
      ctx.translate(0, ctx.measureText(text).width / 4) //move text towards or away from inner radius
      ctx.rotate(Math.PI / 2)
      ctx.fillText(text, -ctx.measureText(text).width / 2, 0);
      ctx.restore();
    }

    //Build arrow
    ctx.fillStyle = "black";
    ctx.beginPath();
    ctx.moveTo(250 - 4, 250 - (outsideRadius + 5));
    ctx.lineTo(250 + 4, 250 - (outsideRadius + 5));
    ctx.lineTo(250 + 4, 250 - (outsideRadius - 5));
    ctx.lineTo(250 + 9, 250 - (outsideRadius - 5));
    ctx.lineTo(250 + 0, 250 - (outsideRadius - 13));
    ctx.lineTo(250 - 9, 250 - (outsideRadius - 5));
    ctx.lineTo(250 - 4, 250 - (outsideRadius - 5));
    ctx.lineTo(250 - 4, 250 - (outsideRadius + 5));
    ctx.fill();
  }
}

function spin() {
  spinAngleStart = Math.random() * 10 + 10;
  spinTime = 0;
  spinTimeTotal = Math.random() * 3 + 4 * 1000;
  rotateWheel();
}

function rotateWheel() {
  spinTime += 30;
  if (spinTime >= spinTimeTotal) {
    stopRotateWheel();
    return;
  }
  var spinAngle = spinAngleStart - easeOut(spinTime, 0, spinAngleStart, spinTimeTotal);
  startAngle += (spinAngle * Math.PI / 180);
  drawRouletteWheel();
  spinTimeout = setTimeout('rotateWheel()', 10);
}

function stopRotateWheel() {
  clearTimeout(spinTimeout);
  var degrees = startAngle * 180 / Math.PI + 90;
  var arcd = arc * 180 / Math.PI;
  var index = Math.floor((360 - degrees % 360) / arcd);
  ctx.save();
  ctx.font = 'bold 30px Helvetica, Arial';
  // output of choice of restaurant
  var text = options[index]
  alert('Congrats! Now go eat at ' + text)
  // Fill text in center of wheel
  // ctx.fillText(text, 250 - ctx.measureText(text).width / 2, 250 + 10);
  // ctx.restore();
}

function easeOut(t, b, c, d) {
  var ts = (t /= d) * t;
  var tc = ts * t;
  return b + c * (tc + -3 * ts + 3 * t);
}

function milesToMeters(miles) {
  return miles * 1609
}

drawRouletteWheel();

$(window).on("load", function() {

  var topFood = []
  var web = "https://cors-anywhere.herokuapp.com/https://api.yelp.com/v3/businesses/search?term="

  $('#submit').on('click', function(event) {
    event.preventDefault();
    var x = $('#zip').val()
    var y = $('.cuisine option:selected').val()
    var q = $('#radius option:selected').val()
    var z = milesToMeters(q)

    $.ajax({
      type: "GET",
      url: web + y + "&location=" + x + "&radius=" + z,
      headers: {
        "authorization": "Bearer sZ1Nyfc5TYJ8Q4JV2cPJHT5n0OWABiWOopAVSK4ZUDu3fexkGsM1IYHm1IeYVZI4ELQL0gH9tIF7Xd5kG5GnH_zrmgOCEe6GZ3SUITS4kBGyWX96Z3LlkgtvdYGDWXYx",
        "expires_in": 15551999,
        "token_type": "Bearer"
      },
      success: function(data) {
        for (var i = 0; i < 10; i++) {
          topFood.push(data.businesses[i].name)
        }
        for (var i = 0; i < 10; i++) {
          options[i] = topFood[i]
        }
        drawRouletteWheel()
      }
    })
  })

})
