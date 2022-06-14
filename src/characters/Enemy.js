import Explosion from "../effects/Explosion";
import ExpUp from "../effects/ExpUp";

export default class Enemy extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture, animKey, initHp, dropRate) {
    super(scene, x, y, texture);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.scale = 2;
    this.m_speed = 50;
    this.m_hp = initHp;
    this.m_dropRate = dropRate;

    this.on("overlapstart", (projectile) => {
      this.hit(projectile, 10);
    });

    if (animKey) {
      this.play(animKey);
    }

    this.m_events = [];
    this.m_events.push(
      this.scene.time.addEvent({
        delay: 100,
        callback: () => {
          scene.physics.moveToObject(this, scene.m_player, this.m_speed);
        },
        loop: true,
      })
    );

    // Ref: https://github.com/photonstorm/phaser/issues/3378
    scene.events.on("update", (time, delta) => {
      this.update(time, delta);
    });
  }

  update(time, delta) {
    // TODO : refactor (없어진 enemy에서도 계속 호출되는 듯)
    if (!this.body) return;

    if (this.body.velocity.x > 0) this.flipX = true;
    else this.flipX = false;
  }

  hit(projectile, damage) {
    this.m_hp -= damage;

    // TODO: 관통 무기
    projectile.destroy();
    this.scene.m_hitEnemySound.play();

    if (this.m_hp <= 0) {
      const explosion = new Explosion(this.scene, this.x, this.y);

      // 랜덤으로 item 떨어뜨리기
      if (Math.random() < this.m_dropRate) {
        const expUp = new ExpUp(this.scene, this);
        this.scene.m_expUps.add(expUp);
      }

      // TODO: 이런건 scene에서?
      this.scene.m_score += 1;
      this.scene.m_scoreLabel.text = `ENEMY KILLED ${this.scene.m_score
        .toString()
        .padStart(6, "0")}`;
      this.scene.m_explosionSound.play();

      this.scene.time.removeEvent(this.m_events);
      this.destroy();
    }
  }
}
