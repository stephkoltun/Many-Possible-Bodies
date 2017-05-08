/*
Stephanie Koltun
Accumulation of Movement
*/

console.log("sketch started");

var debug = true;

var mode = 0;
var speed = 1;
var connect = false;

var correctJoints = 0;
var attempts = 0;
var maxLoop = 8;
var maxAttempts = maxLoop * 90;

var exposed = false;
var exposedTime = 0;
var maxExposure = 30 * 6;

// manage the flickering
var screenMode = 2;
// 1 = performer
// 2 = audience

// Declare kinectron
var kinectron = null;
var audience = null;

var IP = "172.16.219.228";
var IPaudience = "172.16.243.66";

// Managing kinect bodies
var bm = new BodyManager();
var DEATH_TH = 500;

var skelColor = "rgba(137,35,253,1)";
var skelAction = "rgba(217,124,238,"
var mjColor = "rgba(24,210,255,1)";
var mjAction = "rgba(140,207,203,";
var boneWeight = 10;

// Mapping Kinect data to projecion
var scvar, xscl, yscl;
var xshift, yshift;
var scl = true;

// Mapping Michael to projection
var mjxscl, mjyscl, mjscale;
var mjxshift, mjyshift;
var mjscl = true;

// variable to track frame number of MJ dance
var fr = 0;
var accumfr = 1;

// variables for saving
var oldSkeleton = [];
var oldJointsNum = 80;
var allOldSkels = [];

function setup() {
    createCanvas(windowWidth, windowHeight);

    frameRate(30);

    // KINECTRON SETUP
    // Define and create an instance of kinectron
    kinectron = new Kinectron(IP);
    audience = new Kinectron(IPaudience);

    // Connect with application over peer
    kinectron.makeConnection();
    audience.makeConnection();

    // Set individual frame callbacks for KINECT 1
    kinectron.setColorCallback(performCallback);
    kinectron.setBodiesCallback(bodyCallback);
    //kinectron.startMultiFrame(["body", "color"]);

    audience.setColorCallback(audienceCallback);
    //audience.startMultiFrame(["color"]);

    scvar = 0.45;
    mjscale = 1;

    xscl = (width / 2) * scvar;
    yscl = -(width / 2) * scvar;
    xshift = width / 2;
    yshift = height / 2 - 75;

    mjxscl = 1.45 * mjscale;
    mjyscl = 1.45 * mjscale;
    mjxshift = 0;
    mjyshift = -60;

    background(0);

    // populate 2D array
    for (var i = 0; i < 25; i++) {
        oldSkeleton[i] = [];
    }
}

function bodyCallback(body) {
    //find tracked bodies
    for (var i = 0; i < body.length; i++) {
        if (body[i].tracked === true) {
            bodyTracked(body[i]);
        }
    }
}


function performCallback(img) {
    if (mode == 3) {
        var mapheight = (540 / 960) * windowWidth;
        fill(0);
        noStroke(0);
        rect(0, 0, windowWidth, windowHeight);

        loadImage(img.src, function(loadedImage) {
            image(loadedImage, 0, 0, windowWidth, mapheight);
        });
    }
}

function audienceCallback(img) {

}

function bodyTracked(body) {
    var id = body.trackingId;
    // When there is a new body, add it
    if (!bm.contains(id)) bm.add(body);
    // Otherwise, update it
    else bm.update(body);
}

function draw() {
    // save the old skeletons
    if (mode == 0) {
        var bodies = bm.getBodies();
        if (bodies.length > 0) {
            for (var b = 0; b < 1; b++) {
                var body = bodies[b];

                // save points to past-position array
                for (var j = 0; j < body.joints.length; j++) {

                    var oldJoints = oldSkeleton[j];
                    oldJoints.push(getPos(body.getPosition(j)));

                    if (oldJoints.length > oldJointsNum) {
                        oldJoints.shift();
                    }
                }
            }
        }
    }

    if (frameCount % 10 == 0) {
        // check if mode should change 
        $.ajax({
            url: "http://sk6385.itp.io:1234/check",
            dataType: 'json',
            success: function(data) {
                // do nothing

                if (data.exposed) {
                    // change to exposed
                    mode = 3;
                } else {
                    mode = 0;
                }
            },
            error: function() {

            },
        });
    }


    // manage modes
    switch (mode) {
        case (0): // no skeletons
            background(0);
            //draw mj oldSkeleton
            drawAccumThriller();
            if (oldSkeleton[0].length == oldJointsNum) {
                drawAccumSkeleton();
            }
            drawSkeleton();
            break;

        case (3): // selfie
            break;
    }

    if (debug) {
        textSize(16);
        fill(255);
        noStroke();
        text("screen (s): " + screenMode, 20, 20);
        text("mode (>): " + mode, 20, 40);
        text("connect: " + connect, 20, 70);
        text("attempt: " + floor(attempts / 90), 20, 90)
        text("yshift (y/h): " + round(yshift), 20, 120);
        text("xscale (t/g): " + round(xscl), 20, 140);
        text("yscale: (t/g)" + round(yscl), 20, 160);

        text("mjY (r/f): " + round(mjyshift), 150, 120);
        text("mjX (b): " + round(mjxshift), 150, 140);
        text("mjscale (u/j): " + mjscale, 150, 160);

    }
}

/* ------ SKELETON FUNCTIONS ------- */

function drawSkeleton() {
    var bodies = bm.getBodies();
    if (bodies.length != 0) {

        for (var b = 0; b < 1; b++) {
            var body = bodies[b];

            // loop through each joint
            for (var j = 0; j < body.joints.length; j++) {

                var pos = getPos(body.getPosition(j));

                // draw LINES between joints
                noFill();
                stroke(skelColor);
                strokeWeight(boneWeight);


                switch (j) {
                    case 2: // neck to head 
                        line(pos.x, pos.y, getPos(body.getPosition(3)).x, getPos(body.getPosition(3)).y);
                        break;
                    case 4: // shoulders
                        line(pos.x, pos.y, getPos(body.getPosition(8)).x, getPos(body.getPosition(8)).y);
                        break;
                    case 5: // Left elbow
                        line(pos.x, pos.y, getPos(body.getPosition(4)).x, getPos(body.getPosition(4)).y)
                        line(pos.x, pos.y, getPos(body.getPosition(6)).x, getPos(body.getPosition(6)).y);
                        break;
                    case 9: // right elbow
                        line(pos.x, pos.y, getPos(body.getPosition(8)).x, getPos(body.getPosition(8)).y);
                        line(pos.x, pos.y, getPos(body.getPosition(10)).x, getPos(body.getPosition(10)).y);
                        break;
                    case 12: // hips
                        line(pos.x, pos.y, getPos(body.getPosition(16)).x, getPos(body.getPosition(16)).y);
                        break;
                    case 13: // left knee
                        line(pos.x, pos.y, getPos(body.getPosition(12)).x, getPos(body.getPosition(12)).y);
                        line(pos.x, pos.y, getPos(body.getPosition(14)).x, getPos(body.getPosition(14)).y);
                        break;
                    case 17: // right knee
                        line(pos.x, pos.y, getPos(body.getPosition(16)).x, getPos(body.getPosition(16)).y);
                        line(pos.x, pos.y, getPos(body.getPosition(18)).x, getPos(body.getPosition(18)).y);
                        break;
                }
            }


            var r = 20;
            var curpos;
            switch (correctJoints) {
                case (1):
                    curpos = getPos(body.getPosition(kinectron.ANKLELEFT));
                    break;
                case (0):
                    curpos = getPos(body.getPosition(kinectron.ANKLERIGHT));
                    break;
                case (2):
                    curpos = getPos(body.getPosition(kinectron.WRISTRIGHT));
                    break;
                case (3):
                    curpos = getPos(body.getPosition(kinectron.WRISTLEFT));
                    break;
                case (4):
                    curpos = getPos(body.getPosition(3));
                    break;
            }
            fill(skelColor);
            noStroke();
            ellipse(curpos.x, curpos.y, r, r);
        }
    }

}

function drawAccumSkeleton() {

    var bodies = bm.getBodies();

    if (bodies.length > 0) {
        noFill();

        for (var i = 1; i < oldJointsNum - 1; i++) {

            accumulateSkel(i, 2);
        }
    }
}

function accumulateSkel(i, opac) {

    var opacVal = ((i + 1) / oldJointsNum) * opac;
    var color = skelAction + opacVal + ')';
    stroke(color);


    var head = oldSkeleton[3];
    var wristleft = oldSkeleton[6];
    var wristright = oldSkeleton[10];
    var ankleleft = oldSkeleton[14];
    var ankleright = oldSkeleton[18];

    strokeWeight(4);

    line(ankleright[i].x, ankleright[i].y, ankleright[i - 1].x, ankleright[i - 1].y);
    line(ankleleft[i].x, ankleleft[i].y, ankleleft[i - 1].x, ankleleft[i - 1].y);
    line(wristright[i].x, wristright[i].y, wristright[i - 1].x, wristright[i - 1].y);
    line(wristleft[i].x, wristleft[i].y, wristleft[i - 1].x, wristleft[i - 1].y);
    line(head[i].x, head[i].y, head[i - 1].x, head[i - 1].y);


}



/* ------ MJ FUNCTIONS ------ */

var ankLeftArray = thriller.ankleleft.slice(0);
var ankRightArray = thriller.ankleright.slice(0);
var headArray = thriller.head.slice(0);
var wristLeftArray = thriller.wristleft.slice(0);
var wristRightArray = thriller.wristright.slice(0);

function accumulate(array, sw, opacvalue) {

    noFill();

    for (var i = 1; i < array.length - 1; i++) {
        var curJoint = getMJpos(array[i]);
        var prevJoint = getMJpos(array[i - 1]);

        var opac = (i + 1) / (array.length) * opacvalue;
        var color = mjAction + opac + ')';
        stroke(color);
        strokeWeight(sw);
        line(curJoint.x, curJoint.y, prevJoint.x, prevJoint.y);
    }
}

function drawAccumThriller() {

    // move the arrays around
    var firstAnkPos = ankLeftArray[0];
    ankLeftArray = ankLeftArray.slice(1);
    ankLeftArray.push(firstAnkPos);

    var firstAnkRightPos = ankRightArray[0];
    ankRightArray = ankRightArray.slice(1);
    ankRightArray.push(firstAnkRightPos);

    var firstWristLeftPos = wristLeftArray[0];
    wristLeftArray = wristLeftArray.slice(1);
    wristLeftArray.push(firstWristLeftPos);

    var firstWristRightPos = wristRightArray[0];
    wristRightArray = wristRightArray.slice(1);
    wristRightArray.push(firstWristRightPos);

    var firstHeadPos = headArray[0];
    headArray = headArray.slice(1);
    headArray.push(firstHeadPos);

    accumulate(ankLeftArray, 4, 2);
    accumulate(ankRightArray, 4, 2);
    accumulate(wristLeftArray, 4, 2);
    accumulate(wristRightArray, 4, 2);
    accumulate(headArray, 4, 2);

}




function drawThriller() {

    var ankLeft = getMJpos(thriller.ankleleft[fr]);
    var ankRight = getMJpos(thriller.ankleright[fr]);
    var kneeLeft = getMJpos(thriller.kneeleft[fr]);
    var kneeRight = getMJpos(thriller.kneeright[fr]);
    var hipLeft = getMJpos(thriller.hipleft[fr]);
    var hipRight = getMJpos(thriller.hipright[fr]);
    var baseSpine = getMJpos(thriller.basespine[fr]);
    var midSpine = getMJpos(thriller.midspine[fr]);
    var neck = getMJpos(thriller.neck[fr]);
    var head = getMJpos(thriller.head[fr]);
    var shoulderLeft = getMJpos(thriller.shoulderleft[fr]);
    var shoulderRight = getMJpos(thriller.shoulderright[fr]);
    var elbowLeft = getMJpos(thriller.elbowleft[fr]);
    var elbowRight = getMJpos(thriller.elbowright[fr]);
    var wristLeft = getMJpos(thriller.wristleft[fr]);
    var wristRight = getMJpos(thriller.wristright[fr]);

    // draw LINES between joints
    switch (mode) {
        case (1):
            noFill();
            stroke(mjColor);
            strokeWeight(boneWeight);
            break;
    }


    line(neck.x, neck.y, head.x, head.y);
    line(elbowRight.x, elbowRight.y, shoulderRight.x, shoulderRight.y);
    line(elbowRight.x, elbowRight.y, wristRight.x, wristRight.y);
    line(elbowLeft.x, elbowLeft.y, shoulderLeft.x, shoulderLeft.y);
    line(elbowLeft.x, elbowLeft.y, wristLeft.x, wristLeft.y);
    line(shoulderRight.x, shoulderRight.y, shoulderLeft.x, shoulderLeft.y);
    line(hipLeft.x, hipLeft.y, hipRight.x, hipRight.y);
    line(hipRight.x, hipRight.y, kneeRight.x, kneeRight.y);
    line(hipLeft.x, hipLeft.y, kneeLeft.x, kneeLeft.y);
    line(ankLeft.x, ankLeft.y, kneeLeft.x, kneeLeft.y);
    line(ankRight.x, ankRight.y, kneeRight.x, kneeRight.y);

    if (frameCount % speed == 0) {
        // increment through the frames
        if (fr < 88) {
            fr++;
        } else {
            fr = 0;
        }
    }
}

function drawConnections() {

    // MJ's points
    var ankLeft = getMJpos(thriller.ankleleft[fr]);
    var ankRight = getMJpos(thriller.ankleright[fr]);
    var kneeLeft = getMJpos(thriller.kneeleft[fr]);
    var kneeRight = getMJpos(thriller.kneeright[fr]);
    var hipLeft = getMJpos(thriller.hipleft[fr]);
    var hipRight = getMJpos(thriller.hipright[fr]);
    var baseSpine = getMJpos(thriller.basespine[fr]);
    var midSpine = getMJpos(thriller.midspine[fr]);
    var neck = getMJpos(thriller.neck[fr]);
    var head = getMJpos(thriller.head[fr]);
    var shoulderLeft = getMJpos(thriller.shoulderleft[fr]);
    var shoulderRight = getMJpos(thriller.shoulderright[fr]);
    var elbowLeft = getMJpos(thriller.elbowleft[fr]);
    var elbowRight = getMJpos(thriller.elbowright[fr]);
    var wristLeft = getMJpos(thriller.wristleft[fr]);
    var wristRight = getMJpos(thriller.wristright[fr]);


    var bodies = bm.getBodies();
    for (var b = 0; b < bodies.length; b++) {
        var body = bodies[b];


        noFill();
        stroke(40, 70, 170);
        strokeWeight(2);

        // draw POINTS for each joint
        for (var j = 0; j < body.joints.length; j++) {
            var pos = getPos(body.getPosition(j));

            switch (j) {
                case 3: // head
                    line(pos.x, pos.y, head.x, head.y);
                    break;
                case 10: // right wrist
                    line(pos.x, pos.y, wristRight.x, wristRight.y);
                    break;
                case 13: // right knee
                    line(pos.x, pos.y, kneeRight.x, kneeRight.y);
                    break;
                case 14: // left ankle
                    line(pos.x, pos.y, ankLeft.x, ankLeft.y);
                    break;

            }

        }
    }

}




function keyPressed() {
    switch (keyCode) {
        case RIGHT_ARROW:
            fill(255);
            noStroke();
            rect(0, 0, windowWidth, windowHeight);

            if (mode < 3) {
                mode++;
            } else {
                mode = 0;
            }

            // pause and hide video
            if (mode != 2 && playing != false) {
                playing = false;
                thrillerVid.style("visibility", "hidden");
                thrillerVid.pause();
            }
            break;

        case LEFT_ARROW:
            connect = !connect;
            break;


        case 84: // t
            scvar += 0.03;
            xscl = (width / 2) * scvar;
            yscl = -(width / 2) * scvar;
            break;
        case 71: // g
            scvar -= 0.03;
            xscl = round((width / 2) * scvar);
            yscl = round(-(width / 2) * scvar);
            break;
        case 89: // y 
            yshift += 30;
            break;
        case 72: // h 
            yshift -= 30;
            break;
        case 82: // r
            mjyshift += 50;
            break;
        case 70: // f
            mjyshift -= 50;
            break;
        case 66: // b 
            mjxshift += 20;
        case 85: // u 
            mjscale += 0.05;
            mjxscl = 1.45 + mjscale;
            mjyscl = 1.45 + mjscale;
            break;
        case 74: // j 
            mjscale -= 0.05;
            mjxscl = 1.45 + mjscale;
            mjyscl = 1.45 + mjscale;
            break;

            // control screen mode for flickering rules
        case 83: // s
            if (screenMode < 2) {
                screenMode++;
            } else {
                screenMode = 1;
            }
            break;

        case 68: // d
            debug = !debug;
            break;
    }

}

// Scale the data to fit the screen
// Move it to the center of the screen
// Return it as a vector
function getPos(joint) {
    return createVector((joint.x * xscl) + xshift, (joint.y * yscl) + yshift);
}

function getMJpos(joint) {
    return createVector((joint.x * mjxscl) + mjxshift, (joint.y * mjyscl) + mjyshift);
}
