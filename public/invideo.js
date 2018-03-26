/*
Stephanie Koltun
Accumulation of Movement
*/

console.log("sketch started");

var debug = true;

var mode = 1;
var speed = 1;
var connect = false;

var danceTime = 0;
var maxDance = 30 * 30;

var exposedTime = 0;
var maxExposure = 30 * 6;

// Declare kinectron
var kinectron = null;
var elsewhereKinect = null;
// Mapping Kinect data to projecion
var scvar, xscl, yscl;
var xshift, yshift;
var scl = true;

// variables for saving
var oldSkeleton = [];
var oldJointsNum = 20;
var allOldSkels = [];

var rgbImage;
var keyImage;

function setup() {
  var cnv = createCanvas(800, 600);
  cnv.parent("cnv");  // set parent of canvas
  frameRate(30);
  //background(0);

  // KINECTRON SETUP
  // Define and create an instance of kinectron
  // connect to our peer server
  kinectron = new Kinectron("dancing",
  {
    "host": "sk6385.itp.io",
    "port": "9000",
    "path": "/peerjs",
    "secure":"true"
  });

  elsewhereKinect = new Kinectron("audience",
  {
    "host": "sk6385.itp.io",
    "port": "9000",
    "path": "/peerjs",
    "secure":"true"
  });

  // Connect with application over peer
  kinectron.makeConnection();
  // Set individual frame callbacks for KINECT 1
  kinectron.setKeyCallback(keyCallback);
  kinectron.startKey();

  elsewhereKinect.makeConnection();
  elsewhereKinect.setColorCallback(colorCallback);
  elsewhereKinect.setBodiesCallback(bodiesCallback);
  // the other kinect will start the color frames

  thrillerVid = createVideo('assets/thriller.mp4');
  thrillerVid.hide();
  thrillerVid.loop();

  scvar = 0.45;
  xscl = (width / 2) * scvar;
  yscl = -(width / 2) * scvar;
  xshift = width / 2;
  yshift = height / 2 - 75;


  // populate 2D array
  oldSkeleton["head"] = [];
  oldSkeleton["leftwrist"] = [];
  oldSkeleton["rightwrist"] = [];
  oldSkeleton["leftfoot"] = [];
  oldSkeleton["rightfoot"] = [];

}

function draw() {
    // draw the correct background
  switch (mode) {
    case (1): // mj video
      var vidWidth = 600 / 480 * 654;
      image(thrillerVid,0,0,vidWidth,600);

      if (danceTime < maxDance) {
          danceTime++;
      } else {
          mode = 2;
          danceTime = 0;
      }
      break;

    case (2): // elsewhere audience
      if (rgbImage != null) {
        var offset = (1067-800)/2*(-1);
        image(rgbImage,offset,0,1067,600);
      } else {
        background(0);
      }
      //keep track of timing
      if (exposedTime < maxExposure) {
          exposedTime++;
      } else {
          exposedTime = 0;
          // go back to dancing
          mode = 1;
      }
      break;
  }
  if (keyImage != null) {
    var offset = (1067-800)/2*(-1);
    image(keyImage,offset,0,1067,600);
  }
}

function keyCallback(img) {
  loadImage(img.src, function(loadedBodyImage) {
    keyImage = loadedBodyImage;
  })
}

function colorCallback(img) {
  loadImage(img.src, function(loadedColorImage) {
    rgbImage = loadedColorImage;
  })
}

function bodiesCallback(body) {
}
