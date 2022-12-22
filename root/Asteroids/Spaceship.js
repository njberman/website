class Spaceship {
  constructor(w, h, y, img, bulletImg) {
    this.w = w;
    this.h = h;
    this.pos = {
      x: mouseX,
      y: height - this.h - y,
    };
    this.bullets = [];
    this.MAX_AMMO = 5;
    this.ammo = this.MAX_AMMO;
    this.regenAmmo = 0;
    this.img = img;
    this.bulletImg = bulletImg;
  }

  show() {
    noStroke();
    fill(255);
    if (!this.img) {
      rectMode(CENTER);
      rect(this.pos.x, this.pos.y, this.w, this.h);
    } else {
      imageMode(CENTER);
      image(this.img, this.pos.x, this.pos.y, this.w, this.h);
      imageMode(CORNER);
    }
    for (let bullet of this.bullets) {
      bullet.show();
    }
  }

  update() {
    this.pos.x = mouseX;
    for (let bullet of this.bullets) {
      bullet.update();
    }
    if (this.ammo === 0) {
      this.regenAmmo++;
    }
    if (this.regenAmmo === 50) {
      this.ammo = this.MAX_AMMO;
      this.regenAmmo = 0;
    }
  }

  shoot() {
    if (this.ammo > 0) {
      this.bullets.push(
        new Bullet(this.pos.x, this.pos.y - this.h + 20, this.bulletImg)
      );
      this.ammo--;
    }
  }
}
