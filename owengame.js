const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Player
const player = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 10,
    color: 'cyan',
    speed: 3,
    targetX: canvas.width / 2,
    targetY: canvas.height / 2,
};

// Projectiles
const projectiles = [];
const PROJECTILE_RADIUS = 4;
const PROJECTILE_SPEED = 6;
const PROJECTILE_COLOR = 'yellow';

function updatePlayer() {
    const dx = player.targetX - player.x;
    const dy = player.targetY - player.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > player.speed) {
        player.x += (dx / distance) * player.speed;
        player.y += (dy / distance) * player.speed;
    } else {
        player.x = player.targetX;
        player.y = player.targetY;
    }
}

function updateProjectiles() {
    for (let i = projectiles.length - 1; i >= 0; i--) {
        const p = projectiles[i];
        p.x += p.dx;
        p.y += p.dy;

        // Remove projectile if it's off-screen
        if (p.x + PROJECTILE_RADIUS < 0 ||
            p.x - PROJECTILE_RADIUS > canvas.width ||
            p.y + PROJECTILE_RADIUS < 0 ||
            p.y - PROJECTILE_RADIUS > canvas.height) {
            projectiles.splice(i, 1);
        }
    }
}

function draw() {
    ctx.fillStyle = '#000020';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw player
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
    ctx.fillStyle = player.color;
    ctx.fill();
    ctx.closePath();

    // Draw projectiles
    projectiles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, PROJECTILE_RADIUS, 0, Math.PI * 2);
        ctx.fillStyle = PROJECTILE_COLOR;
        ctx.fill();
        ctx.closePath();
    });
}

function gameLoop() {
    updatePlayer();
    updateProjectiles();
    draw();
    requestAnimationFrame(gameLoop);
}

// Event Listeners
canvas.addEventListener('click', (event) => {
    player.targetX = event.clientX;
    player.targetY = event.clientY;
});

canvas.addEventListener('contextmenu', (event) => {
    event.preventDefault();

    const angle = Math.atan2(event.clientY - player.y, event.clientX - player.x);

    const projectile = {
        x: player.x,
        y: player.y,
        dx: Math.cos(angle) * PROJECTILE_SPEED,
        dy: Math.sin(angle) * PROJECTILE_SPEED,
    };
    projectiles.push(projectile);
});

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

gameLoop();
