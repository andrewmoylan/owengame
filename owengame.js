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
    lives: 10,
};

// Projectiles
const projectiles = [];
const PROJECTILE_RADIUS = 4;
const PROJECTILE_SPEED = 6;
const PROJECTILE_COLOR = 'yellow';
const ENEMY_PROJECTILE_COLOR = 'orange';

// Powerups
const powerups = [];
const POWERUP_SIZE = 10;
const POWERUP_COLOR = 'green';

// Enemies
const enemies = [];
const ENEMY_RADIUS = 15;
const ENEMY_SPEED = 1;
const ENEMY_COLOR = 'red';
const STRONG_ENEMY_CHANCE = 0.1;
const STRONG_ENEMY_COLOR = 'purple';
const STRONG_ENEMY_HEALTH = 3;
const STRONG_ENEMY_RADIUS_MULTIPLIER = 1.5;
const STRONG_ENEMY_SPEED_MULTIPLIER = 1.5;

let score = 0;

let rightMouseDown = false;
let mouseX = 0;
let mouseY = 0;
let lastShotTime = 0;
let fireRate = 1; // shots per second

function spawnEnemy() {
    const isStrong = Math.random() < STRONG_ENEMY_CHANCE;

    const radius = isStrong ? ENEMY_RADIUS * STRONG_ENEMY_RADIUS_MULTIPLIER : ENEMY_RADIUS;
    const speed = isStrong ? ENEMY_SPEED * STRONG_ENEMY_SPEED_MULTIPLIER : ENEMY_SPEED;
    const color = isStrong ? STRONG_ENEMY_COLOR : ENEMY_COLOR;
    const health = isStrong ? STRONG_ENEMY_HEALTH : 1;

    const x = Math.random() * (canvas.width - radius * 2) + radius;
    const y = Math.random() * (canvas.height - radius * 2) + radius;
    const angle = Math.random() * Math.PI * 2;
    const enemy = {
        x,
        y,
        radius,
        color,
        dx: Math.cos(angle) * speed,
        dy: Math.sin(angle) * speed,
        health,
    };
    enemies.push(enemy);
}

function createStrongEnemy(x, y) {
    const radius = ENEMY_RADIUS * STRONG_ENEMY_RADIUS_MULTIPLIER;
    const speed = ENEMY_SPEED * STRONG_ENEMY_SPEED_MULTIPLIER;
    const angle = Math.random() * Math.PI * 2;
    const enemy = {
        x,
        y,
        radius,
        color: STRONG_ENEMY_COLOR,
        dx: Math.cos(angle) * speed,
        dy: Math.sin(angle) * speed,
        health: STRONG_ENEMY_HEALTH,
    };
    enemies.push(enemy);
}

function spawnPowerup() {
    const powerup = {
        x: Math.random() * (canvas.width - POWERUP_SIZE),
        y: Math.random() * (canvas.height - POWERUP_SIZE),
        size: POWERUP_SIZE,
        color: POWERUP_COLOR,
    };
    powerups.push(powerup);
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

    // Check for collision with powerups
    for (let i = powerups.length - 1; i >= 0; i--) {
        const p = powerups[i];
        const testX = Math.max(p.x, Math.min(player.x, p.x + p.size));
        const testY = Math.max(p.y, Math.min(player.y, p.y + p.size));
        const dist = Math.hypot(player.x - testX, player.y - testY);

        if (dist < player.radius) {
            powerups.splice(i, 1);
            fireRate++;
        }
    }
}

function updateProjectiles() {
    for (let i = projectiles.length - 1; i >= 0; i--) {
        const p = projectiles[i];
        p.x += p.dx;
        p.y += p.dy;

        let projectileRemoved = false;

        // Check for collision with player for enemy projectiles
        if (p.owner === 'enemy') {
            const dist = Math.hypot(p.x - player.x, p.y - player.y);
            if (dist < player.radius + PROJECTILE_RADIUS) {
                player.lives--;
                projectiles.splice(i, 1);
                projectileRemoved = true;
                continue;
            }
        }

        // Check for collision with enemies
        for (let j = enemies.length - 1; j >= 0; j--) {
            const e = enemies[j];
            const dist = Math.hypot(p.x - e.x, p.y - e.y);
            if (dist - e.radius - PROJECTILE_RADIUS < 1) {
                e.health--;
                projectiles.splice(i, 1);
                projectileRemoved = true;
                if (e.health <= 0) {
                    enemies.splice(j, 1);
                    if (p.owner === 'player') {
                        score++;
                    }
                }
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
    // Enemy merging
    for (let i = enemies.length - 1; i >= 0; i--) {
        for (let j = i - 1; j >= 0; j--) {
            const e1 = enemies[i];
            const e2 = enemies[j];

            const dist = Math.hypot(e1.x - e2.x, e1.y - e2.y);
            if (dist < e1.radius + e2.radius) {
                // Merge two normal enemies
                if (e1.health === 1 && e2.health === 1) {
                    const newX = (e1.x + e2.x) / 2;
                    const newY = (e1.y + e2.y) / 2;

                    enemies.splice(i, 1);
                    enemies.splice(j, 1);

                    createStrongEnemy(newX, newY);
                    
                    break;
                }
            }
        }
    }

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

        // Check for collision with powerups
        for (let i = powerups.length - 1; i >= 0; i--) {
            const p = powerups[i];
            const testX = Math.max(p.x, Math.min(e.x, p.x + p.size));
            const testY = Math.max(p.y, Math.min(e.y, p.y + p.size));
            const dist = Math.hypot(e.x - testX, e.y - testY);

            if (dist < e.radius) {
                powerups.splice(i, 1);
                // Shoot projectile in random direction
                const angle = Math.random() * Math.PI * 2;
                const projectile = {
                    x: e.x,
                    y: e.y,
                    dx: Math.cos(angle) * PROJECTILE_SPEED,
                    dy: Math.sin(angle) * PROJECTILE_SPEED,
                    owner: 'enemy',
                    color: ENEMY_PROJECTILE_COLOR,
                };
                projectiles.push(projectile);
            }
        }
    });
}

function shoot() {
    const angle = Math.atan2(mouseY - player.y, mouseX - player.x);

    const projectile = {
        x: player.x,
        y: player.y,
        dx: Math.cos(angle) * PROJECTILE_SPEED,
        dy: Math.sin(angle) * PROJECTILE_SPEED,
        owner: 'player',
        color: PROJECTILE_COLOR,
    };
    projectiles.push(projectile);
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

    // Draw powerups
    powerups.forEach(p => {
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, p.size, p.size);
    });

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
        ctx.fillStyle = p.color;
        ctx.fill();
        ctx.closePath();
    });

    // Draw score and lives
    ctx.fillStyle = 'white';
    ctx.font = '24px Arial';
    ctx.fillText(`Score: ${score}`, 10, 30);
    ctx.fillText(`Lives: ${player.lives}`, canvas.width - 120, 30);
}

function gameLoop() {
    const now = Date.now();
    if (rightMouseDown && now - lastShotTime > (1000 / fireRate)) {
        shoot();
        lastShotTime = now;
    }

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
});

canvas.addEventListener('mousedown', (event) => {
    if (event.button === 2) { // Right-click
        rightMouseDown = true;
    }
});

canvas.addEventListener('mouseup', (event) => {
    if (event.button === 2) { // Right-click
        rightMouseDown = false;
    }
});

canvas.addEventListener('mousemove', (event) => {
    mouseX = event.clientX;
    mouseY = event.clientY;
});

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

setInterval(spawnEnemy, 2000);
setInterval(spawnPowerup, 10000);

gameLoop();
