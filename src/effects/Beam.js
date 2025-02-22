import Phaser from "phaser";

export default class Beam extends Phaser.Physics.Arcade.Sprite {
  static SPEED = 200;
  static DURATION = 1000;

  constructor(scene, player) {
    const x = player.x;
    const y = player.y - 16;
    super(scene, x, y, "beam");
    this.scale = 0.5;
    
    scene.add.existing(this);
    scene.physics.world.enableBody(this);
    
    scene.m_projectiles.add(this);
    scene.m_beamSound.play();

    this.setCircle(30);
    this.setDepth(80);
    this.setVelocity();
    this.setAngle();

    // DURATION만큼 시간이 지나면 사라짐
    scene.time.addEvent({
      delay: Beam.DURATION,
      callback: () => {
        this.destroy(); //디스트로이로 객체파괴
      },
      loop: false,
    });
  }

  // beam이 가장 가까운 mob으로 날아가도록 속도를 설정해주는 함수
  setVelocity() {
    if (!this.scene.m_closest) {
      this.setVelocityY(-250);
      return;
    }
    const _x = this.scene.m_closest.x - this.x; //거리
    const _y = this.scene.m_closest.y - this.y; //거리
    const _r = Math.sqrt(_x * _x + _y * _y); //피타고라스로 벡터의 크기(두점사이의 거리) 구함 sqrt==루트
    this.body.velocity.x = (_x / _r) * Beam.SPEED; //벡터 정규화 공식으로 방향만 남기고 스피드는 스피드 변수로 조정.
    this.body.velocity.y = (_y / _r) * Beam.SPEED; //벡터 정규화 공식으로 방향만 남기고 스피드는 스피드 변수로 조정.
  }

  // beam이 mob에 날아갈 때 각도를 설정해주는 함수
  setAngle() {
    const angleToMob = Phaser.Math.Angle.Between(
      this.x,
      this.y,
      this.scene.m_closest.x,
      this.scene.m_closest.y
    );
    this.rotation = angleToMob + Math.PI / 2;
    this.body.setAngularVelocity(0); //각속도 초기화로 한번만 회전하고 계속 회전하지 않게 조정
  }
}
