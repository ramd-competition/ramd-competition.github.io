var noNodes = 150;
var noConn = 150;
var gravityConstant = 0.5;
var forceConstant = 4000;
var physics = true;

var nodes = [];
var nodeCon = [];
var clicked = false;
var lerpValue = 0.2;
var startDisMultiplier = 10;
var closeNode;
var closeNodeMag;

var androidLogo;
var malwareLogo;

function preload() {
  androidLogo = loadImage('https://upload.wikimedia.org/wikipedia/commons/d/d7/Android_robot.svg'); // Load the Android logo
  malwareLogo = loadImage('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQt82ZRBDyicFhl0c_PL03vrrm-QIWpg8GWNA&s'); // Load the malware Android logo
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  frameRate(20);
  for (let i = 0; i < noNodes; i++) {
    let x = random(-startDisMultiplier * width, startDisMultiplier * width);
    let y = random(-startDisMultiplier * height, startDisMultiplier * height);
    let isMalware = random() < 0.3; // 30% chance to assign malware logo
    node = new Node(createVector(x, y), random(1, 5), isMalware);
    nodes.push(node);
  }
  closeNode = nodes[0];
  for (let n = 0; n < noConn; n++) {
    nodeCon.push([
      round(random(noNodes - 1)),
      round(random(noNodes - 1)),
      random(100, 300)
    ]);
  }
  nodeCon.push([0, 1, 200]);

  let connected = new Set();
  nodeCon.forEach(conn => {
    connected.add(conn[0]);
    connected.add(conn[1]);
  });

  for (let n = 0; n < noNodes; n++) {
    if (!connected.has(n)) {
      nodeCon.push([
        n,
        round(random(noNodes - 1)),
        random(100, 300)
      ]);
    }
  }

  // Skip initialization
  for (let i = 0; i < 150; i++) {
    draw();
  }
}

let drawCount = 0;

function draw() {
  col = 235 + max(0, 170 - drawCount);
  drawCount++;
  
  fill(col);
  stroke(col);

  translate(width / 2, height / 2);
  background(255);

  applyForces(nodes);
  nodes.forEach(node => {
    node.draw();
    if (physics) {
      node.update();
    }
  });
}

function applyForces(nodes) {
  nodes.forEach(node => {
    gravity = node.pos.copy().mult(-1).mult(gravityConstant);
    node.force = gravity;
  });

  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      pos = nodes[i].pos;
      dir = nodes[j].pos.copy().sub(pos);
      force = dir.div(dir.mag() * dir.mag());
      force.mult(forceConstant);
      nodes[i].force.add(force.copy().mult(-1));
      nodes[j].force.add(force);
    }
  }

  nodeCon.forEach(con => {
    let node1 = nodes[con[0]];
    let node2 = nodes[con[1]];
    let maxDis = con[2];
    let dis = node1.pos.copy().sub(node2.pos);
    diff = dis.mag() - maxDis;
    node1.force.sub(dis);
    node2.force.add(dis);
  });
}

function Node(pos, size, isMalware) {
  this.pos = pos;
  this.force = createVector(0, 0);
  this.mass = (2 * PI * size) / 1.5;
  this.size = 15;
  this.isMalware = isMalware; // Add a property to determine if the node is malware
}

Node.prototype.update = function() {
  force = this.force.copy();
  vel = force.copy().div(this.mass);
  this.pos.add(vel);
}

Node.prototype.draw = function() { 
  if (this.isMalware) {
    image(malwareLogo, this.pos.x, this.pos.y, this.size, this.size); // Draw the malware logo if the node is malware
  } else {
    image(androidLogo, this.pos.x, this.pos.y, this.size, this.size); // Draw the Android logo otherwise
  }
}
