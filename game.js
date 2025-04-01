const config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    physics: {
        default: 'arcade',
        arcade: { gravity: { y: 0 }, debug: false }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

let game = new Phaser.Game(config);
let pumpButton;
let activeBalloon = null;
let balloons = [];
const alphabetImages = [];
let balloonCount = 0;

function preload() {
    this.load.image('background', 'assets/background.png');
    this.load.image('balloon', 'assets/balloon.png');
    this.load.image('pump', 'assets/pump.png');

    for (let i = 1; i <= 26; i++) {
        this.load.image(`alphabet${i}`, `assets/symbol 1000${i}.png`);
    }
}

function create() {
    this.add.image(config.width / 2, config.height / 2, 'background').setScale(Math.max(config.width / 2560, config.height / 1152));

    pumpButton = this.add.image(config.width - 100, config.height - 100, 'pump').setScale(0.3);
    pumpButton.setInteractive();

    pumpButton.on('pointerdown', () => {
        if (!activeBalloon && balloonCount < 26) {
            createBalloon(this);
        } else if (activeBalloon) {
            inflateBalloon();
        }
    });
}

function createBalloon(scene) {
    activeBalloon = scene.physics.add.image(config.width - 180, config.height - 120, 'balloon').setScale(0.1).setVisible(true);
    activeBalloon.clickCount = 0;
    activeBalloon.floating = false;
    activeBalloon.setCollideWorldBounds(true);
    activeBalloon.setBounce(1, 1);
    balloons.push(activeBalloon);

    activeBalloon.alphabetIndex = balloons.length;
    activeBalloon.alphabetText = scene.add.image(activeBalloon.x, activeBalloon.y, `alphabet${activeBalloon.alphabetIndex}`).setScale(0.07);
    activeBalloon.alphabetText.setOrigin(0.5);
    balloonCount++;
}

function burstBalloon(balloon) {
    balloon.alphabetText.destroy();
    balloon.destroy();
    balloons = balloons.filter(b => b !== balloon);
    balloonCount--;
}

function inflateBalloon() {
    if (activeBalloon && !activeBalloon.floating) {
        if (activeBalloon.clickCount < 3) {
            activeBalloon.clickCount++;
            activeBalloon.setScale(0.1 + activeBalloon.clickCount * 0.1);
            activeBalloon.alphabetText.setScale((0.1 + activeBalloon.clickCount * 0.1) * 0.7);
        } else {
            activeBalloon.floating = true;
            activeBalloon.body.setVelocity(-50, Phaser.Math.Between(-20, 20));
            activeBalloon.body.setCollideWorldBounds(true);
            activeBalloon.body.onWorldBounds = true;

            // Add click event after floating start
            activeBalloon.setInteractive();
            activeBalloon.on('pointerdown', () => {
                console.log("Balloon Clicked!");
                burstBalloon(activeBalloon); // blast only the clicked balloon
            });
            console.log("Balloon set to interactable"); //for console error
            activeBalloon = null;
        }
    }
}

function update() {
    balloons.forEach(balloon => {
        if (balloon.floating) {
            balloon.body.setVelocity(-50, balloon.body.velocity.y + Phaser.Math.Between(-5, 5));

            if (balloon.x < 0) {
                balloon.body.setVelocity(0, 200);
                balloon.floating = false;
                balloon.body.setCollideWorldBounds(false);
                balloon.landed = true;
            }
        } else if (balloon.landed) {
            balloon.setInteractive();
            balloon.on('pointerdown', () => {
                burstBalloon(balloon);
            });
            balloon.landed = false;
        }

        if (balloon.alphabetText) {
            balloon.alphabetText.x = balloon.x;
            balloon.alphabetText.y = balloon.y;
            balloon.alphabetText.setScale(balloon.scale * 0.7);
        }
    });

    for (let i = 0; i < balloons.length; i++) {
        for (let j = i + 1; j < balloons.length; j++) {
            this.physics.collide(balloons[i], balloons[j]);
        }
    }
}