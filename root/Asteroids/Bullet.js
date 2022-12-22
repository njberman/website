class Bullet {
  constructor(x, y, img) {
    this.pos = {
      x,
      y,
    };
    this.w = 25;
    this.h = 10;
    this.size = 20;
    this.speed = 7.5;
    this.img = img;
  }

  show() {
    stroke(255, 0, 0);
    noFill();
    if (!this.img) {
      rect(this.pos.x, this.pos.y, 1, this.size);
    } else {
      push();
      translate(this.pos.x, this.pos.y);
      rotate(270);
      imageMode(CENTER);
      image(this.img, 0, 0, this.w, this.h);
      imageMode(CORNER);
      pop();
    }
  }

  update() {
    this.pos.y -= this.speed;
  }

  isColliding(obj) {
    return (
      this.pos.x > obj.pos.x - obj.w / 2 &&
      this.pos.x < obj.pos.x + obj.w / 2 &&
      this.pos.y <= obj.pos.y + obj.h / 2
    );
  }

  checkIfOffScreen() {
    return this.pos.y + this.size / 2 < 0;
  }
}
