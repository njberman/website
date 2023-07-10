const ASTEROID_NUM = 20;

let spaceship;
let asteroids = Array.from({ length: ASTEROID_NUM });
let score = 0;
let pressStartFont;
let backgroundImg, asteroidImg, spaceshipImg, bulletImg;
let playing,
  won,
  lost = false;

function preload() {
  pressStartFont = loadFont('fonts/PressStart2P-Regular.ttf');
  backgroundImg = loadImage('images/space-background.png');
  asteroidImg = loadImage('images/asteroid.png');
  spaceshipImg = loadImage('images/spaceship.png');
  bulletImg = loadImage('images/laser.png');
}

function setup() {
  createCanvas(800, 600);

  angleMode(DEGREES);

  spaceship = new Spaceship(100, 50, 50, spaceshipImg, bulletImg);

  let y = 50;
  let xmult = 0;
  for (let i = 0; i < ASTEROID_NUM; i++) {
    if (xmult === 5) {
      xmult = 0;
      y += 100;
    }
    asteroids[i] = new Asteroid(xmult * (width / 5) + 75, y, asteroidImg);
    xmult++;
  }
}

function draw() {
  imageMode(CORNER);
  image(backgroundImg, 0, 0, width, height);
  textAlign(CENTER);
  textFont(pressStartFont);
  noStroke();
  if (playing) {
    if (asteroids.length === 0) won = true;
    if (lost) {
      textSize(75);
      fill(255, 0, 0, 200);
      text('You lost!', width / 2, height / 2 + 50);
      noLoop();
    } else if (won) {
      textSize(100);
      fill(0, 255, 0, 200);
      text('You won!', width / 2 + 10, height / 2 + 50);
    } else {
      textSize(250);
      fill(255, 75);
      text(score, width / 2, height / 2 + 150);
      textSize(25);
      fill(0, 178, 255);
      text(`Ammo: ${spaceship.ammo}`, width - 120, height - 20);
    }

    if (!won && !lost) {
      spaceship.show();
      spaceship.update();

      for (let asteroid of asteroids) {
        asteroid.show();
        asteroid.update();
        if (asteroid.checkIfPastPlayer(spaceship)) {
          lost = true;
          break;
        }
        for (let bullet of spaceship.bullets) {
          if (bullet.checkIfOffScreen()) {
            spaceship.bullets.splice(spaceship.bullets.indexOf(bullet), 1);
            continue;
          }

          if (bullet.isColliding(asteroid)) {
            asteroids.splice(asteroids.indexOf(asteroid), 1);
            spaceship.bullets.splice(spaceship.bullets.indexOf(bullet), 1);
            score++;
          }
        }
      }
    }
  } else {
    fill(0, 178, 255);
    textSize(50);
    text('ASTEROIDS', width / 2, height / 2 - 100);
    textSize(20);
    text(
      'To win the game you must shoot\n all the asteroids.\n You move the spaceship with your mouse\n and click to shoot\n\nPress p to start!',
      width / 2,
      height / 2
    );
  }
}

function mousePressed() {
  if (mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height) {
    spaceship.shoot();
  }
}

function keyPressed() {
  if (key === 'p') {
    playing = true;
    won = false;
    lost = false;
  }
}
