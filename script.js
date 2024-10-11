const canvas = document.getElementById('canvas');
const ctx = canvas.getContext("2d");
let width = canvas.width;
let height = canvas.height;

// definir sonidos
const synth = new Tone.Synth().toDestination();
const winSound = new Tone.Player("path_to_win_sound.mp3").toDestination(); // Coloca aquí la ruta al archivo de sonido para ganar
const loseSound = new Tone.Player("path_to_lose_sound.mp3").toDestination(); // Coloca aquí la ruta al archivo de sonido para perder

// definir la velocidad de la maquina
const MAX_COMPUTER_SPEED = 2;

// Coordenadas para una línea vertical en el centro
const startX = canvas.width / 2;
const startY = 0;
const endX = canvas.width / 2;
const endY = canvas.height;

// determinar velocidad
let xSpeed;
let ySpeed;

// Valores de la pelota
const BALL_SIZE = 10;
let ballPosition;

function initBall(player) {
    ballPosition = {
        x: player === 'left' ? 20 : width - 20,
        y: 30,
    };
    xSpeed = player === 'left' ? 4 : -4;
    ySpeed = 2;
}

// Valores de las paletas
const PADDLE_WIDTH = 10;
const PADDLE_HEIGTH = 40;
const PADDLE_OFFSET = 15;
let leftPaddleTop = 10;
let rightPaddleTop = 30;

// score
let leftScore = 0;
let rightScore = 0;

// puntaje máximo
const MAX_SCORE = 5;

// Función de dibujado
function draw() {
    ctx.fillStyle = '#73EC8B';
    ctx.fillRect(0, 0, width, height);

    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#D94C4C';
    ctx.beginPath();
    ctx.arc(ballPosition.x + BALL_SIZE / 2, ballPosition.y + BALL_SIZE / 2, BALL_SIZE / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();

    ctx.fillStyle = '#F2994A';
    ctx.fillRect(PADDLE_OFFSET, leftPaddleTop, PADDLE_WIDTH, PADDLE_HEIGTH);

    ctx.fillStyle = '#F7A94B';
    ctx.fillRect(width - PADDLE_OFFSET, rightPaddleTop, PADDLE_WIDTH, PADDLE_HEIGTH);

    ctx.font = "30px monospace";
    ctx.textAlign = "left";
    ctx.fillText(leftScore.toString(), 260, 35);

    ctx.textAlign = "right";
    ctx.fillText(rightScore.toString(), 335, 35);
}

// Función para seguir la pelota
function followBall() {
    let ball = { top: ballPosition.y, bottom: ballPosition.y + BALL_SIZE };
    let leftPaddle = { top: leftPaddleTop, bottom: leftPaddleTop + PADDLE_HEIGTH };

    if (ball.top < leftPaddle.top) {
        leftPaddleTop -= MAX_COMPUTER_SPEED;
    } else if (ball.bottom > leftPaddle.bottom) {
        leftPaddleTop += MAX_COMPUTER_SPEED;
    }
}

function update() {
    ballPosition.x += xSpeed;
    ballPosition.y += ySpeed;
    followBall();
}

function checkCollision() {
    let ball = { left: ballPosition.x, right: ballPosition.x + BALL_SIZE, top: ballPosition.y, bottom: ballPosition.y + BALL_SIZE };
    let leftPaddle = { left: PADDLE_OFFSET, right: PADDLE_OFFSET + PADDLE_WIDTH, top: leftPaddleTop, bottom: leftPaddleTop + PADDLE_HEIGTH };
    let rightPaddle = { left: width - PADDLE_WIDTH - PADDLE_OFFSET, right: width - PADDLE_OFFSET, top: rightPaddleTop, bottom: rightPaddleTop + PADDLE_HEIGTH };

    if (ball.left < 0 || ball.right > width) {
        if (ball.left < 0) {
            rightScore++;
            synth.triggerAttackRelease("C4", "8n");
        } else {
            leftScore++;
            synth.triggerAttackRelease("G4", "8n");
        }
        initBall();

        // Verificar si hay un ganador
        if (rightScore === MAX_SCORE || leftScore === MAX_SCORE) {
            gameOver();
        }
    }

    if (ball.top < 0 || ball.bottom > height) {
        ySpeed = -ySpeed;
    }

    if (ball.left <= leftPaddle.right && ball.top >= leftPaddle.top && ball.bottom <= leftPaddle.bottom) {
        xSpeed = -xSpeed;
    }

    if (ball.right >= rightPaddle.left && ball.top >= rightPaddle.top && ball.bottom <= rightPaddle.bottom) {
        xSpeed = -xSpeed;
    }
}

function gameOver() {
    clearInterval(gameInterval);
    gameRunning = false;

    // Mostrar mensaje final
    ctx.fillStyle = '#000000';
    ctx.font = "40px monospace";
    ctx.textAlign = "center";
    if (rightScore === MAX_SCORE) {
        ctx.fillText("You Win!", width / 2, height / 2);
        loseSound.start();
    } else if (leftScore === MAX_SCORE) {
        ctx.fillText("Game Over! You Lose!", width / 2, height / 2);
        winSound.start();
    }
}

// Eventos de mouse
document.addEventListener('mousemove', function(e) {
    if ((e.y - canvas.offsetTop + PADDLE_HEIGTH) >= height || e.y <= canvas.offsetTop) return;
    rightPaddleTop = e.y - canvas.offsetTop;
});

// Variables para control del juego
let gameRunning = false;
let gameInterval;

// Función del ciclo del juego
function gameLoop() {
    draw();
    update();
    checkCollision();
}

// Iniciar el juego
function startGame() {
    if (!gameRunning) {
        initBall();
        gameInterval = setInterval(gameLoop, 30);
        gameRunning = true;
    }
}

// Reiniciar el juego
function resetGame() {
    clearInterval(gameInterval);
    leftScore = 0;
    rightScore = 0;
    leftPaddleTop = 10;
    rightPaddleTop = 30;
    gameRunning = false;
    startGame();
}

// Escuchar eventos de los botones
document.getElementById('startButton').addEventListener('click', startGame);
document.getElementById('resetButton').addEventListener('click', resetGame);
