//Variables
var socket = io.connect();
var content = $('.content');
var mobile = false;


// Detect Mobile Connection
var isMobile = {
  Android: function() {
    return navigator.userAgent.match(/Android/i);
  },
  BlackBerry: function() {
    return navigator.userAgent.match(/BlackBerry/i);
  },
  iOS: function() {
    return navigator.userAgent.match(/iPhone|iPad|iPod/i);
  },
  Opera: function() {
    return navigator.userAgent.match(/Opera Mini/i);
  },
  Windows: function() {
    return navigator.userAgent.match(/IEMobile/i);
  },
  any: function() {
    return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
  }
};


$(function(){
  //Set touch to false
  var touching = false;


  if (isMobile.any()) {
    //Set mobile to true and add class if user is on a mobile device
    $('body').addClass("mobile");
    mobile = true;
    alert('This is a mobile device'); //alert user they are on mobile device (for testing)

    //Toggle touch if touching
    function onTouchStart() {touching = true;}
    function onTouchEnd() {touching = false;}
    window.addEventListener('touchstart', onTouchStart, false);
    window.addEventListener('touchend', onTouchEnd, false);
  }




  //Set up screen for new users
  socket.on('startConnection', function(userInfo){

    var ids = pullInfo(userInfo, 'id');
    var colors = pullInfo(userInfo, 'color');

    // console.log("New Connection: User #" + ids[ids.length - 1]);

    $('.current-user').html(ids[ids.length - 1]);

    generateUser(userInfo);

  });

  socket.on('hideNonMobile', function(ids){
    for(i=0; i < ids.length; i++) {
      $(".id-" + ids[i]).hide();
    };
  });


  socket.on('newConnection', function(userInfo){
    generateUser(userInfo);
  });

  socket.on('userDisconnected', function(id){
    // console.log("User #" + id  + " disconnected");
    var deleteUser = ".id-" + id;
    $(deleteUser).remove();
  });



  var x_offset = (document.width/2) - 90;
  var y_offset = (document.height/2) - 24;
  var x_sensitivity = 100;
  var y_sensitivity = 20;

  socket.on('update_orientationEvent', function(data){
    // console.log("data received");
    // console.log(data);
    var updateUser = ".id-" + data.id;

    // $(updateUser).show();
    //
    // $(updateUser + " .alpha").html(data.alpha);
    // $(updateUser + " .beta").html(data.beta);
    // $(updateUser + " .gamma").html(data.gamma);
    // $(updateUser + " .acX").html(data.acX);
    // $(updateUser + " .acY").html(data.acY);
    // $(updateUser + " .acZ").html(data.acZ);

    $('.touch').html(touching.toString());
    // console.log(touching);

    // var ac = data.accelerationIncludingGravity;

    deviceMoved(data.alpha, data.beta, data.gamma);

  });

  function deviceMotionHandler(eventData) {
    var acceleration = eventData.acceleration;
    // var accelerationGravity = eventData.accelerationIncludingGravity;
    var rotation = eventData.rotationRate;

    var roundTo = 100;
    var orientationEvent = {
      "alpha": Math.round(rotation.alpha*roundTo)/roundTo, //yaw - not absolute
      "beta": Math.round((rotation.beta)*roundTo)/roundTo,   //pitch - absolute
      "gamma": Math.round((rotation.gamma)*roundTo)/roundTo, //roll - absolute
      "acX": Math.round((acceleration.x)*roundTo)/roundTo,
      "acY": Math.round((acceleration.y)*roundTo)/roundTo,
      "acZ": Math.round((acceleration.z)*roundTo)/roundTo
    };

    if (touching) {
      socket.emit('orientationEvent', orientationEvent)
    };
  }

  if (window.DeviceMotionEvent && mobile) {
    window.addEventListener('devicemotion', deviceMotionHandler, false);
    alert('device motion tracking');
  }


  Array.prototype.diff = function(a) {
    return this.filter(function(i) {return a.indexOf(i) < 0;});
  };

  function generateUser(userInfo) {

    var ids = pullInfo(userInfo, 'id');
    var colors = pullInfo(userInfo, 'color');
    // console.log(colors);

    var users = [];

    $('.user-id').each(function() {
      users.push($(this).html());
    });

    // console.log("Users Online: " + ids);

    // console.log("Users on page: " + users);

    for(i=0; i < users.length; i++) {
      ids.splice(ids.indexOf(users[i]) + 1, 1);
    };
//
    // console.log("Users to add: " + ids);

    for(i=0; i < ids.length; i++) {

      for(var j = 0; j < userInfo.length; j++) {
        if(userInfo[j][0] == ids[i]) {
          var id = j;
        };
      };

      // console.log(userInfo[id][1]);

      // var userDataCell = '<div style="border: 8px solid ' + userInfo[id][1] + ';" class="motion-data id-' + userInfo[id][0] + '">	<h3>User: <span class="user-id ">' + userInfo[id][0] +'</span></h3> <ul> <li><b>X: </b><span class="acX"></span></li> <li><b>Y: </b><span class="acY"></span></li> <li><b>Z: </b><span class="acZ"></span></li> <li><b>A: </b><span class="alpha"></span></li> <li><b>B: </b><span class="beta"></span></li> <li><b>G: </b><span class="gamma"></span></li> </ul> </div>';

      // $('.content').append(userDataCell);

      // console.log(userDataCell);
    }

    for(var i = 0; i < userInfo.length; i++) {
      if(userInfo[i][0] == $('.current-user').html()) {
        $('.mobile').css('background-color', userInfo[i][1]);
      };
    };
  }

  function pullInfo(userInfo, type) {
    var a = [];

    if (type == 'id') {
      for(var i = 0; i < userInfo.length; i++) {
        a.push(userInfo[i][0]);
      }
    } else if ( type == 'color') {
      for(var i = 0; i < userInfo.length; i++) {
        a.push(userInfo[i][1]);
      }
    }


    return a;
  }






  ///CANVAS FUNCTIONS
  // Chelsea Myers
  // - chel.myers@gmail.com
  // - chelmyers.com
  // - @chelmyers
  // HTML5 Canvas Tests for iOS Motion

  //Variables
  var theCanvas = $("#c");
  var ctx = theCanvas[0].getContext("2d");
  var mouseRad = 5;
  var centerX = $(window).width()/2 - mouseRad/2;
  var centerY = $(window).height()/2 - mouseRad/2;
  var mouse = {x:centerX, y:centerY, rad:mouseRad, color:"rgb(0, 187, 222)"};


  ctx.canvas.width  = window.innerWidth;
  ctx.canvas.height = window.innerHeight;

  drawScreen();

  function drawScreen() {
    ctx.fillStyle = "#eee";
    ctx.fillRect(0,0, ctx.canvas.width, ctx.canvas.height);
    console.log('canvas drawn');
    drawMouse();
  }

  function drawMouse() {
    ctx.fillStyle = mouse.color;
    ctx.beginPath();
    ctx.arc(mouse.x, mouse.y, mouse.rad, 0, 2*Math.PI, false);
    ctx.closePath();
    ctx.fill();
  }

  rawRoll = 0;
  rawPitch = 0;
  rawYaw = 0;
  rollOffset = rawRoll;
  pitchOffset = rawPitch;
  yawOffset = rawYaw;
  var width = $(window).width();
  var height = $(window).height();
  lastX = 0;
  lastY = 0;
  isScrolling = false;


  X_SPEED = 1;
  Y_SPEED = width * 1.0 / height;
  DRAG_THRESHOLD = 5;
  SCROLL_SPEED = 60;


  function deviceMoved(alpha, beta, gamma){
      moveMouse(alpha, beta, gamma);
  }


  function moveMouse(alpha, beta, gamma) {

    var degtorad = Math.PI / 180; // Degree-to-Radian conversion

    var _x = beta  ? beta  * degtorad : 0; // beta value
    var _y = gamma ? gamma * degtorad : 0; // gamma value
    var _z = alpha ? alpha * degtorad : 0; // alpha value

    var cX = Math.cos( _x/2 );
    var cY = Math.cos( _y/2 );
    var cZ = Math.cos( _z/2 );
    var sX = Math.sin( _x/2 );
    var sY = Math.sin( _y/2 );
    var sZ = Math.sin( _z/2 );

    var w = cX * cY * cZ - sX * sY * sZ;
    var x = sX * cY * cZ - cX * sY * sZ;
    var y = cX * sY * cZ + sX * cY * sZ;
    var z = cX * cY * sZ + sX * sY * cZ;

    newRoll = Math.atan2(2.0 * (w * x + y * z), 1.0 - 2.0 * (x * x + y * y));
    newPitch = Math.asin(2.0 * (w * y - z * x));
    newYaw = Math.atan2(2.0 * (w * z + x * beta), 1.0 - 2.0 * (y * y + z * z));

    console.log("x,y,z,w:" + x + " " + y + " " + z + " " + w);

    roll = newRoll - rollOffset;
    pitch = newPitch - pitchOffset;
    yaw = newYaw - yawOffset;

    // if (Myo.direction == "toward_wrist") {
    // pitch *= -1;
    // console.log(Myo.direction)
    // }

    if (isScrolling)
    {
      scroll(-pitch * SCROLL_SPEED);
    } else {
      x = (width * (0.5 - X_SPEED * yaw));
      y = (height * (0.5 + Y_SPEED * pitch));

      dist = Math.sqrt((x - lastX) * (x - lastX) + (y - lastY) * (y - lastY));

      if ( dist > DRAG_THRESHOLD)
      {
        mouse.x = x
        mouse.y = y;

        if (mouse.x >= width - mouse.rad) {
          mouse.x = width  - mouse.rad;
        } else if (mouse.x <= 0){
          mouse.x = 0;
        } else if (mouse.y >= height - mouse.rad) {
          mouse.y = height  - mouse.rad;
        } else if (mouse.y <= 0) {
          mouse.y = 0;
        }

        lastX = x;
        lastY = y;
      }
    }
    rawRoll = newRoll;
    rawPitch = newPitch;
    rawYaw = newYaw;

    console.log(mouse.x + " " + mouse.y);
    drawScreen();
  }


});
