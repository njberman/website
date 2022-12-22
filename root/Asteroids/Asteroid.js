class Asteroid {
  constructor(x, y, img) {
    this.origPos = {
      x,
      y,
    };
    this.pos = {
      x,
      y,
    };
    this.w = 50;
    this.h = this.w;
    this.moveX = 0;
    this.moveXSpeed = 1.75;
    this.moveYSpeed = 30;
    this.img = img;
    this.rotation = floor(random(-180, 180));
    this.movedY = false;
  }

  show() {
    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.rotation);
    if (!this.img) {
      fill(0, 255, 0);
      noStroke();
      rect(0, 0, this.w, this.h);
    } else {
      imageMode(CENTER);
      image(this.img, 0, 0, this.w, this.h);
    }
    pop();
  }

  update() {
    console.log();
    this.pos.x = map(
      sin(this.moveX),
      -1,
      1,
      this.origPos.x - 50,
      this.origPos.x + 50
    );
    if (
      (sin(this.moveX) < -0.9999 || sin(this.moveX) > 0.9999) &&
      !this.movedY
    ) {
      this.pos.y += this.moveYSpeed;
      this.movedY = true;
    } else {
      this.movedY = false;
    }
    this.moveX += this.moveXSpeed;
  }

  checkIfPastPlayer(player) {
    return this.pos.y > player.pos.y - player.h;
  }
}
