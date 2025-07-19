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

// Enemies
const enemies = [];
const ENEMY_RADIUS = 15;
const ENEMY_SPEED = 1;
const ENEMY_COLOR = 'red';

let score = 0;

function spawnEnemy() {
    const x = Math.random() * (canvas.width - ENEMY_RADIUS * 2) + ENEMY_RADIUS;
    const y = Math.random() * (canvas.height - ENEMY_RADIUS * 2) + ENEMY_RADIUS;
    const angle = Math.random() * Math.PI * 2;
    const enemy = {
        x,
        y,
        radius: ENEMY_RADIUS,
        color: ENEMY_COLOR,
        dx: Math.cos(angle) * ENEMY_SPEED,
        dy: Math.sin(angle) * ENEMY_SPEED,
    };
    enemies.push(enemy);
}

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

        let projectileRemoved = false;
        // Check for collision with enemies
        for (let j = enemies.length - 1; j >= 0; j--) {
            const e = enemies[j];
            const dist = Math.hypot(p.x - e.x, p.y - e.y);
            if (dist - e.radius - PROJECTILE_RADIUS < 1) {
                enemies.splice(j, 1);
                projectiles.splice(i, 1);
                score++;
                projectileRemoved = true;
                break; // Exit enemy loop, projectile is gone
            }
        }

        if (projectileRemoved) {
            continue;
        }

        // Remove projectile if it's off-screen
        if (p.x + PROJECTILE_RADIUS < 0 ||
            p.x - PROJECTILE_RADIUS > canvas.width ||
            p.y + PROJECTILE_RADIUS < 0 ||
            p.y - PROJECTILE_RADIUS > canvas.height) {
            projectiles.splice(i, 1);
        }
    }
}

function updateEnemies() {
    enemies.forEach(e => {
        e.x += e.dx;
        e.y += e.dy;

        // Bounce off walls
        if (e.x - e.radius < 0 || e.x + e.radius > canvas.width) {
            e.dx *= -1;
        }
        if (e.y - e.radius < 0 || e.y + e.radius > canvas.height) {
            e.dy *= -1;
        }
    });
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

    // Draw enemies
    enemies.forEach(e => {
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.radius, 0, Math.PI * 2);
        ctx.fillStyle = e.color;
        ctx.fill();
        ctx.closePath();
    });

    // Draw projectiles
    projectiles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, PROJECTILE_RADIUS, 0, Math.PI * 2);
        ctx.fillStyle = PROJECTILE_COLOR;
        ctx.fill();
        ctx.closePath();
    });

    // Draw score
    ctx.fillStyle = 'white';
    ctx.font = '24px Arial';
    ctx.fillText(`Score: ${score}`, 10, 30);
}

function gameLoop() {
    updatePlayer();
    updateProjectiles();
    updateEnemies();
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

setInterval(spawnEnemy, 2000);

gameLoop();
