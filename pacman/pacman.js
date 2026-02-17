// Maze definition with pellets (.), walls (#), empty paths ( ), Pac-Man (P), and ghosts (G)
const MAZE_DATA = `
############################# 
#P ........ #.......... G   #
# ## ##### # ####### ## ### #
# #  #   # #       #  # #  G#
# # ## # # ### #### ## # ## #
#     #     #       #  #    #
### ### ### # ##### ## #### #
#   #   # # #   #     #     #
# ### # # # ### # ##### ### #
#   # # #       #     # #   #
### # # ### ##### ### # # # ##
#   #     #   #   #   # # # #
# ##### # # # # # # ### # # #
#       # # #     #       # #
####### # # ### ##### ####### 
#   #   # # #   #           #
# # # ### # # # # ########## #
# #   #   #     #            G
# ### # ### ##### ### ########
#  G  #     #   #     #      #
############################## 
`.trim();

const TILE_SIZE = 24;
const MAZE = [];
let PELLET_COUNT = 0;

// Parse maze from string
function parseMaze() {
    const lines = MAZE_DATA.split('\n');
    for (let i = 0; i < lines.length; i++) {
        MAZE[i] = [];
        for (let j = 0; j < lines[i].length; j++) {
            MAZE[i][j] = lines[i][j];
            if (lines[i][j] === '.') PELLET_COUNT++;
        }
    }
}

// Game state
const gameState = {
    running: false,
    gameOver: false,
    won: false,
    score: 0,
    lives: 3,
    pelletsEaten: 0,
    pacman: null,
    ghosts: [],
    pellets: [],
    rose: null,
    hearts: [],
    lastRoseTime: 0,
    lastHeartTime: 0,
    nextGhostRespawn: 0
};

// Pac-Man entity
class PacMan {
    constructor(x, y) {
        this.gridX = x;
        this.gridY = y;
        this.spawnX = x;
        this.spawnY = y;
        this.direction = 'RIGHT';
        this.queuedDirection = 'RIGHT';
        this.speed = 6; // tiles per second
        this.moveAccumulator = 0;
        this.pixelX = x * TILE_SIZE;
        this.pixelY = y * TILE_SIZE;
        this.invulnerable = false;
        this.invulnerableTime = 0;
        this.poweredUp = false;
        this.powerTime = 0;
        this.mouthAngle = 0;
    }

    update(dt) {
        // Accumulate movement time
        this.moveAccumulator += dt;
        const moveInterval = 1 / this.speed; // time between grid moves

        // Try to turn in queued direction at intersections
        if (this.canMove(this.queuedDirection)) {
            this.direction = this.queuedDirection;
        }

        // Move when enough time has accumulated
        while (this.moveAccumulator >= moveInterval) {
            this.moveAccumulator -= moveInterval;

            const offset = this.getDirectionOffset(this.direction);
            const targetX = this.gridX + offset.x;
            const targetY = this.gridY + offset.y;

            if (this.canMove(this.direction)) {
                this.gridX = targetX;
                this.gridY = targetY;
            }
        }

        // Update pixel position for rendering
        this.pixelX = this.gridX * TILE_SIZE;
        this.pixelY = this.gridY * TILE_SIZE;

        // Update invulnerability
        if (this.invulnerable) {
            this.invulnerableTime -= dt;
            if (this.invulnerableTime <= 0) {
                this.invulnerable = false;
            }
        }

        // Update power-up
        if (this.poweredUp) {
            this.powerTime -= dt;
            if (this.powerTime <= 0) {
                this.poweredUp = false;
            }
        }

        // Update mouth animation
        this.mouthAngle = (this.mouthAngle + 0.1) % (Math.PI * 2);

        // Check pellet collision
        if (MAZE[this.gridY][this.gridX] === '.') {
            MAZE[this.gridY][this.gridX] = ' ';
            gameState.score += 10;
            gameState.pelletsEaten++;
        }

        // Check rose collision
        if (gameState.rose && gameState.rose.gridX === this.gridX && gameState.rose.gridY === this.gridY) {
            this.poweredUp = true;
            this.powerTime = 5;
            gameState.score += 50;
            gameState.rose = null;
        }
    }

    canMove(dir) {
        const offset = this.getDirectionOffset(dir);
        const nextX = this.gridX + offset.x;
        const nextY = this.gridY + offset.y;

        if (nextY < 0 || nextY >= MAZE.length || nextX < 0 || nextX >= MAZE[0].length) {
            return false;
        }

        return MAZE[nextY][nextX] !== '#';
    }

    getDirectionOffset(dir) {
        const offsets = {
            'UP': { x: 0, y: -1 },
            'DOWN': { x: 0, y: 1 },
            'LEFT': { x: -1, y: 0 },
            'RIGHT': { x: 1, y: 0 }
        };
        return offsets[dir] || { x: 0, y: 0 };
    }

    render(ctx) {
        const x = this.pixelX + TILE_SIZE / 2;
        const y = this.pixelY + TILE_SIZE / 2;
        const radius = TILE_SIZE / 2 - 1;

        // Draw Pac-Man
        ctx.fillStyle = '#ffff00';
        ctx.beginPath();

        // Calculate mouth opening based on animation
        const mouthOpen = Math.abs(Math.sin(this.mouthAngle)) * 0.4;

        // Get rotation based on direction
        let rotation = 0;
        if (this.direction === 'LEFT') rotation = Math.PI;
        else if (this.direction === 'UP') rotation = -Math.PI / 2;
        else if (this.direction === 'DOWN') rotation = Math.PI / 2;

        ctx.arc(x, y, radius, rotation + mouthOpen, rotation + Math.PI * 2 - mouthOpen, false);
        ctx.lineTo(x, y);
        ctx.fill();

        // Draw eye (single dot for classic look)
        ctx.fillStyle = '#333';
        const eyeX = x + Math.cos(rotation) * (radius * 0.3);
        const eyeY = y + Math.sin(rotation) * (radius * 0.3);
        ctx.beginPath();
        ctx.arc(eyeX, eyeY, 1.5, 0, Math.PI * 2);
        ctx.fill();

        // Draw invulnerability indicator (shimmer effect)
        if (this.invulnerable) {
            ctx.strokeStyle = 'rgba(255, 255, 0, 0.6)';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(x, y, radius + 2.5, 0, Math.PI * 2);
            ctx.stroke();
            
            // Double ring for extra shimmer
            ctx.strokeStyle = 'rgba(255, 255, 0, 0.3)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(x, y, radius + 4.5, 0, Math.PI * 2);
            ctx.stroke();
        }

        // Draw power-up indicator (glowing aura)
        if (this.poweredUp) {
            ctx.fillStyle = 'rgba(255, 0, 127, 0.15)';
            ctx.fillRect(this.pixelX - 2, this.pixelY - 2, TILE_SIZE + 4, TILE_SIZE + 4);
            
            ctx.strokeStyle = 'rgba(255, 0, 127, 0.4)';
            ctx.lineWidth = 1;
            ctx.strokeRect(this.pixelX - 1, this.pixelY - 1, TILE_SIZE + 2, TILE_SIZE + 2);
        }
    }
}

// Ghost entity
class Ghost {
    constructor(x, y, color) {
        this.gridX = x;
        this.gridY = y;
        this.color = color;
        this.pixelX = x * TILE_SIZE;
        this.pixelY = y * TILE_SIZE;
        this.spawnX = x;
        this.spawnY = y;
        this.moveCounter = 0;
        this.moveInterval = (160 + Math.random() * 60) / 1000; // 160-220ms random
        this.respawnTimer = 0;
        this.isRespawning = false;
        this.currentDirection = this.getRandomDirection();
        this.lastDirection = this.currentDirection;
    }

    getRandomDirection() {
        const directions = ['UP', 'DOWN', 'LEFT', 'RIGHT'];
        return directions[Math.floor(Math.random() * directions.length)];
    }

    getDirectionOffset(dir) {
        const offsets = {
            'UP': { x: 0, y: -1 },
            'DOWN': { x: 0, y: 1 },
            'LEFT': { x: -1, y: 0 },
            'RIGHT': { x: 1, y: 0 }
        };
        return offsets[dir] || { x: 0, y: 0 };
    }

    getOppositeDirection(dir) {
        const opposites = {
            'UP': 'DOWN',
            'DOWN': 'UP',
            'LEFT': 'RIGHT',
            'RIGHT': 'LEFT'
        };
        return opposites[dir];
    }

    canMoveInDirection(dir) {
        const offset = this.getDirectionOffset(dir);
        const nx = this.gridX + offset.x;
        const ny = this.gridY + offset.y;

        if (ny < 0 || ny >= MAZE.length || nx < 0 || nx >= MAZE[0].length) {
            return false;
        }

        return MAZE[ny][nx] !== '#';
    }

    chooseDirection() {
        const currentOffset = this.getDirectionOffset(this.currentDirection);
        const nextX = this.gridX + currentOffset.x;
        const nextY = this.gridY + currentOffset.y;

        // Check if we can continue in current direction
        if (nextY >= 0 && nextY < MAZE.length && nextX >= 0 && nextX < MAZE[0].length && MAZE[nextY][nextX] !== '#') {
            // Can continue, but at intersections, consider better options
            const validMoves = [];
            const directions = ['UP', 'DOWN', 'LEFT', 'RIGHT'];
            const opposite = this.getOppositeDirection(this.currentDirection);

            for (let dir of directions) {
                if (dir === opposite) continue; // Never backtrack
                if (this.canMoveInDirection(dir)) {
                    validMoves.push(dir);
                }
            }

            // If this is an intersection (can move in multiple directions), reconsider
            if (validMoves.length > 1) {
                // Calculate distances for each valid move
                let bestDir = this.currentDirection;
                let bestDist = this.calculateManhattan(this.currentDirection);

                for (let dir of validMoves) {
                    const dist = this.calculateManhattan(dir);
                    if (dist < bestDist) {
                        bestDist = dist;
                        bestDir = dir;
                    } else if (dist === bestDist && Math.random() > 0.5) {
                        // Randomly choose if equal distance
                        bestDir = dir;
                    }
                }

                this.currentDirection = bestDir;
            }
            return this.currentDirection;
        }

        // Current direction blocked, find new direction
        const validMoves = [];
        const directions = ['UP', 'DOWN', 'LEFT', 'RIGHT'];

        for (let dir of directions) {
            if (this.canMoveInDirection(dir)) {
                validMoves.push(dir);
            }
        }

        if (validMoves.length > 0) {
            // Pick direction closest to Pac-Man
            let bestDir = validMoves[0];
            let bestDist = this.calculateManhattan(bestDir);

            for (let dir of validMoves) {
                const dist = this.calculateManhattan(dir);
                if (dist < bestDist) {
                    bestDist = dist;
                    bestDir = dir;
                }
            }

            this.currentDirection = bestDir;
            return bestDir;
        }

        // Dead end, pick random
        return this.getRandomDirection();
    }

    calculateManhattan(dir) {
        const offset = this.getDirectionOffset(dir);
        const nextX = this.gridX + offset.x;
        const nextY = this.gridY + offset.y;
        return Math.abs(nextX - gameState.pacman.gridX) + Math.abs(nextY - gameState.pacman.gridY);
    }

    update(dt) {
        // Handle respawn delay
        if (this.isRespawning) {
            this.respawnTimer -= dt;
            if (this.respawnTimer <= 0) {
                this.gridX = this.spawnX;
                this.gridY = this.spawnY;
                this.isRespawning = false;
                this.currentDirection = this.getRandomDirection();
                this.moveCounter = 0;
            } else {
                this.pixelX = this.gridX * TILE_SIZE;
                this.pixelY = this.gridY * TILE_SIZE;
                return;
            }
        }

        this.moveCounter += dt;

        // Move when enough time has passed
        if (this.moveCounter >= this.moveInterval) {
            this.moveCounter -= this.moveInterval;

            // Choose direction based on AI
            const newDirection = this.chooseDirection();

            // Try to move in chosen direction
            const offset = this.getDirectionOffset(newDirection);
            const nextX = this.gridX + offset.x;
            const nextY = this.gridY + offset.y;

            if (nextY >= 0 && nextY < MAZE.length && nextX >= 0 && nextX < MAZE[0].length && MAZE[nextY][nextX] !== '#') {
                this.gridX = nextX;
                this.gridY = nextY;
                this.lastDirection = newDirection;
            }
        }

        this.pixelX = this.gridX * TILE_SIZE;
        this.pixelY = this.gridY * TILE_SIZE;
    }

    render(ctx) {
        const x = this.pixelX;
        const y = this.pixelY;
        const cx = x + TILE_SIZE / 2;
        const cy = y + TILE_SIZE / 2;

        // Ghost body - rounded top
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(cx, cy - 2, TILE_SIZE / 2 - 1, Math.PI, 0, false);
        ctx.lineTo(x + TILE_SIZE - 1, y + TILE_SIZE - 1);
        ctx.lineTo(x + 1, y + TILE_SIZE - 1);
        ctx.closePath();
        ctx.fill();

        // Ghost "skirt" - wavy bottom
        const waveHeight = 3;
        const waveWidth = 4;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.moveTo(x + 1, y + TILE_SIZE - 1);
        for (let i = 0; i < (TILE_SIZE - 2) / waveWidth; i++) {
            const px = x + 1 + i * waveWidth;
            ctx.arc(px + waveWidth / 2, y + TILE_SIZE + waveHeight - 1, waveWidth / 2, 0, Math.PI, false);
        }
        ctx.lineTo(x + TILE_SIZE - 1, y + TILE_SIZE - 1);
        ctx.closePath();
        ctx.fill();

        // Eyes - white circles
        ctx.fillStyle = '#fff';
        const eyeRadius = 2.5;
        const eyeOffsetX = 4;
        const eyeOffsetY = 4;
        ctx.beginPath();
        ctx.arc(cx - eyeOffsetX, cy - eyeOffsetY, eyeRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(cx + eyeOffsetX, cy - eyeOffsetY, eyeRadius, 0, Math.PI * 2);
        ctx.fill();

        // Pupils - black dots
        ctx.fillStyle = '#000';
        const pupilRadius = 1.5;
        ctx.beginPath();
        ctx.arc(cx - eyeOffsetX, cy - eyeOffsetY, pupilRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(cx + eyeOffsetX, cy - eyeOffsetY, pupilRadius, 0, Math.PI * 2);
        ctx.fill();

        // Outline for depth
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(cx, cy - 2, TILE_SIZE / 2, Math.PI, 0, false);
        ctx.lineTo(x + TILE_SIZE - 1, y + TILE_SIZE - 1);
        ctx.lineTo(x + 1, y + TILE_SIZE - 1);
        ctx.closePath();
        ctx.stroke();
    }
}

// Rose power-up
class Rose {
    constructor(x, y) {
        this.gridX = x;
        this.gridY = y;
        this.pixelX = x * TILE_SIZE;
        this.pixelY = y * TILE_SIZE;
    }

    render(ctx) {
        const x = this.pixelX + TILE_SIZE / 2;
        const y = this.pixelY + TILE_SIZE / 2;

        // Rose glow (Valentine accent - subtle)
        ctx.fillStyle = 'rgba(255, 20, 147, 0.2)';
        ctx.beginPath();
        ctx.arc(x, y, 7, 0, Math.PI * 2);
        ctx.fill();

        // Rose petals (layered circles)
        ctx.fillStyle = '#ff1493';
        // Outer petals
        for (let i = 0; i < 5; i++) {
            const angle = (i / 5) * Math.PI * 2;
            const px = x + Math.cos(angle) * 3;
            const py = y + Math.sin(angle) * 3 - 2;
            ctx.beginPath();
            ctx.arc(px, py, 2.5, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Center bloom
        ctx.fillStyle = '#ff69b4';
        ctx.beginPath();
        ctx.arc(x, y - 2, 3, 0, Math.PI * 2);
        ctx.fill();

        // Stem
        ctx.strokeStyle = '#228B22';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(x, y + 2);
        ctx.lineTo(x, y + 9);
        ctx.stroke();

        // Leaf
        ctx.fillStyle = '#228B22';
        ctx.beginPath();
        ctx.ellipse(x + 3, y + 6, 2, 2.5, Math.PI / 4, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Heart projectile
class Heart {
    constructor(x, y, direction) {
        this.gridX = x;
        this.gridY = y;
        this.pixelX = x * TILE_SIZE;
        this.pixelY = y * TILE_SIZE;
        this.direction = direction;
    }

    update(dt) {
        // Move heart
        const dirOffset = {
            'UP': { x: 0, y: -1 },
            'DOWN': { x: 0, y: 1 },
            'LEFT': { x: -1, y: 0 },
            'RIGHT': { x: 1, y: 0 }
        };

        const offset = dirOffset[this.direction];
        this.gridX += offset.x;
        this.gridY += offset.y;
        this.pixelX = this.gridX * TILE_SIZE;
        this.pixelY = this.gridY * TILE_SIZE;

        // Check bounds
        if (this.gridY < 0 || this.gridY >= MAZE.length || this.gridX < 0 || this.gridX >= MAZE[0].length) {
            return false;
        }

        // Check wall collision
        if (MAZE[this.gridY][this.gridX] === '#') {
            return false;
        }

        return true;
    }

    render(ctx) {
        const x = this.pixelX + TILE_SIZE / 2;
        const y = this.pixelY + TILE_SIZE / 2;

        // Heart glow (subtle Valentine accent)
        ctx.fillStyle = 'rgba(255, 105, 180, 0.25)';
        ctx.beginPath();
        ctx.arc(x, y, 5.5, 0, Math.PI * 2);
        ctx.fill();

        // Heart shape
        const size = 2.5;
        ctx.fillStyle = '#ff1493';
        
        // Left lobe
        ctx.beginPath();
        ctx.arc(x - size, y - size / 2, size, 0, Math.PI * 2);
        ctx.fill();
        
        // Right lobe
        ctx.beginPath();
        ctx.arc(x + size, y - size / 2, size, 0, Math.PI * 2);
        ctx.fill();
        
        // Bottom point
        ctx.beginPath();
        ctx.moveTo(x - size * 2.2, y);
        ctx.lineTo(x, y + size * 2.5);
        ctx.lineTo(x + size * 2.2, y);
        ctx.lineTo(x, y - size);
        ctx.closePath();
        ctx.fill();

        // Highlight for depth
        ctx.fillStyle = 'rgba(255, 182, 193, 0.5)';
        ctx.beginPath();
        ctx.arc(x - size / 2, y - size, size - 0.5, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Initialize game
function initGame() {
    parseMaze();

    // Find spawn points
    let pacmanSpawn = null;
    let ghostSpawns = [];

    for (let y = 0; y < MAZE.length; y++) {
        for (let x = 0; x < MAZE[y].length; x++) {
            if (MAZE[y][x] === 'P') {
                pacmanSpawn = { x, y };
                MAZE[y][x] = ' ';
            } else if (MAZE[y][x] === 'G') {
                ghostSpawns.push({ x, y });
                MAZE[y][x] = ' ';
            }
        }
    }

    gameState.pacman = new PacMan(pacmanSpawn.x, pacmanSpawn.y);
    gameState.ghosts = [
        new Ghost(ghostSpawns[0].x, ghostSpawns[0].y, '#ff0000'),
        new Ghost(ghostSpawns[1].x, ghostSpawns[1].y, '#ffb6c1'),
        new Ghost(ghostSpawns[2].x, ghostSpawns[2].y, '#00ffff'),
        new Ghost(ghostSpawns[3].x, ghostSpawns[3].y, '#ffb347')
    ];
}

// Update game state
function update(dt) {
    if (!gameState.running || gameState.gameOver || gameState.won) return;

    // Cap dt to prevent large jumps
    dt = Math.min(dt, 0.05);

    // Update Pac-Man
    gameState.pacman.update(dt);

    // Update ghosts
    for (let ghost of gameState.ghosts) {
        ghost.update(dt);
    }

    // Update hearts
    const activeHearts = [];
    for (let heart of gameState.hearts) {
        if (heart.update(dt)) {
            activeHearts.push(heart);
        }
    }
    gameState.hearts = activeHearts;

    // Check heart-ghost collision
    for (let i = 0; i < gameState.hearts.length; i++) {
        for (let j = 0; j < gameState.ghosts.length; j++) {
            if (gameState.hearts[i].gridX === gameState.ghosts[j].gridX &&
                gameState.hearts[i].gridY === gameState.ghosts[j].gridY &&
                !gameState.ghosts[j].isRespawning) {
                gameState.score += 50;
                gameState.hearts.splice(i, 1);
                gameState.ghosts[j].isRespawning = true;
                gameState.ghosts[j].respawnTimer = 2;
                break;
            }
        }
    }

    // Generate hearts while powered up
    if (gameState.pacman.poweredUp) {
        gameState.lastHeartTime += dt;
        if (gameState.lastHeartTime >= 0.2) {
            gameState.lastHeartTime = 0;
            const offset = gameState.pacman.getDirectionOffset(gameState.pacman.direction);
            const heartX = gameState.pacman.gridX + offset.x;
            const heartY = gameState.pacman.gridY + offset.y;

            if (heartY >= 0 && heartY < MAZE.length && heartX >= 0 && heartX < MAZE[0].length) {
                gameState.hearts.push(new Heart(heartX, heartY, gameState.pacman.direction));
            }
        }
    }

    // Spawn rose
    gameState.lastRoseTime += dt;
    if (!gameState.rose && gameState.lastRoseTime >= 8 + Math.random() * 7) {
        gameState.lastRoseTime = 0;
        // Try to find a walkable spot efficiently with max attempts
        let roseX, roseY, validSpot;
        let attempts = 0;
        do {
            roseX = Math.floor(Math.random() * MAZE[0].length);
            roseY = Math.floor(Math.random() * MAZE.length);
            validSpot = MAZE[roseY][roseX] !== '#' &&
                        !(roseX === gameState.pacman.gridX && roseY === gameState.pacman.gridY);
            attempts++;
        } while (!validSpot && attempts < 20);

        if (validSpot) {
            gameState.rose = new Rose(roseX, roseY);
        }
    }

    // Check Pac-Man-ghost collision
    if (!gameState.pacman.invulnerable) {
        for (let ghost of gameState.ghosts) {
            if (!ghost.isRespawning && gameState.pacman.gridX === ghost.gridX && gameState.pacman.gridY === ghost.gridY) {
                gameState.lives--;
                if (gameState.lives <= 0) {
                    gameState.gameOver = true;
                } else {
                    // Reset positions
                    gameState.pacman.gridX = gameState.pacman.spawnX;
                    gameState.pacman.gridY = gameState.pacman.spawnY;
                    gameState.pacman.pixelX = gameState.pacman.spawnX * TILE_SIZE;
                    gameState.pacman.pixelY = gameState.pacman.spawnY * TILE_SIZE;
                    gameState.pacman.invulnerable = true;
                    gameState.pacman.invulnerableTime = 1;

                    for (let g of gameState.ghosts) {
                        g.gridX = g.spawnX;
                        g.gridY = g.spawnY;
                        g.pixelX = g.spawnX * TILE_SIZE;
                        g.pixelY = g.spawnY * TILE_SIZE;
                        g.isRespawning = false;
                    }
                }
                break;
            }
        }
    }

    // Check win condition
    if (gameState.pelletsEaten === PELLET_COUNT) {
        gameState.won = true;
    }
}

// Render game
function render(ctx, canvas) {
    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw maze
    for (let y = 0; y < MAZE.length; y++) {
        for (let x = 0; x < MAZE[y].length; x++) {
            if (MAZE[y][x] === '#') {
                // Wall with gradient and shadow
                ctx.fillStyle = '#1a3a7f';
                ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
                
                // Bright edge highlight
                ctx.strokeStyle = '#4080ff';
                ctx.lineWidth = 1;
                ctx.strokeRect(x * TILE_SIZE + 0.5, y * TILE_SIZE + 0.5, TILE_SIZE - 1, TILE_SIZE - 1);
                
                // Inner shadow
                ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
                ctx.lineWidth = 1;
                ctx.strokeRect(x * TILE_SIZE + 1.5, y * TILE_SIZE + 1.5, TILE_SIZE - 3, TILE_SIZE - 3);
            } else if (MAZE[y][x] === '.') {
                // Pellets with better visibility
                ctx.fillStyle = '#ffb6c1';
                ctx.beginPath();
                ctx.arc(x * TILE_SIZE + TILE_SIZE / 2, y * TILE_SIZE + TILE_SIZE / 2, 2.5, 0, Math.PI * 2);
                ctx.fill();
                
                // Subtle glow
                ctx.strokeStyle = 'rgba(255, 182, 193, 0.3)';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.arc(x * TILE_SIZE + TILE_SIZE / 2, y * TILE_SIZE + TILE_SIZE / 2, 3.5, 0, Math.PI * 2);
                ctx.stroke();
            }
        }
    }

    // Draw rose
    if (gameState.rose) {
        gameState.rose.render(ctx);
    }

    // Draw hearts
    for (let heart of gameState.hearts) {
        heart.render(ctx);
    }

    // Draw ghosts
    for (let ghost of gameState.ghosts) {
        ghost.render(ctx);
    }

    // Draw Pac-Man
    gameState.pacman.render(ctx);
}

// Cache DOM elements
const scoreEl = document.getElementById('score');
const livesEl = document.getElementById('lives');
const powerEl = document.getElementById('power');
const statusEl = document.getElementById('status');

// Track last rendered values to avoid unnecessary DOM updates
let lastScore = 0;
let lastLives = 3;
let lastPowerTime = -1;
let lastStatus = '';

// Update HUD
function updateHUD() {
    // Only update score if changed
    if (gameState.score !== lastScore) {
        scoreEl.textContent = gameState.score;
        lastScore = gameState.score;
    }

    // Only update lives if changed
    if (gameState.lives !== lastLives) {
        livesEl.textContent = gameState.lives;
        lastLives = gameState.lives;
    }

    // Only update power if changed
    let powerText = '--';
    if (gameState.pacman.poweredUp) {
        powerText = gameState.pacman.powerTime.toFixed(1) + 's';
    }
    if (powerText !== lastPowerTime) {
        powerEl.textContent = powerText;
        lastPowerTime = powerText;
    }

    // Only update status if changed
    let newStatus = '';
    if (!gameState.running && !gameState.gameOver && !gameState.won) {
        newStatus = 'Press SPACE to Start';
    } else if (gameState.gameOver) {
        newStatus = 'GAME OVER - Press R to Restart';
    } else if (gameState.won) {
        newStatus = 'YOU WIN! 🎉 Press R to Restart';
    }
    
    if (newStatus !== lastStatus) {
        statusEl.textContent = newStatus;
        lastStatus = newStatus;
    }
}

// Input handling
document.addEventListener('keydown', (e) => {
    if (e.key === ' ') {
        e.preventDefault();
        if (!gameState.running && !gameState.gameOver && !gameState.won) {
            gameState.running = true;
        }
    }

    if (e.key === 'r' || e.key === 'R') {
        if (gameState.gameOver || gameState.won) {
            gameState.running = false;
            gameState.gameOver = false;
            gameState.won = false;
            gameState.score = 0;
            gameState.lives = 3;
            gameState.pelletsEaten = 0;
            gameState.hearts = [];
            gameState.rose = null;
            gameState.lastRoseTime = 0;
            gameState.lastHeartTime = 0;

            // Re-parse maze
            MAZE.length = 0;
            PELLET_COUNT = 0;
            initGame();
            updateHUD();
        }
    }

    if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        gameState.pacman.queuedDirection = 'UP';
    } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        gameState.pacman.queuedDirection = 'DOWN';
    } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        gameState.pacman.queuedDirection = 'LEFT';
    } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        gameState.pacman.queuedDirection = 'RIGHT';
    }
});

// Main game loop
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const mazeWidth = MAZE_DATA.split('\n')[0].length;
const mazeHeight = MAZE_DATA.split('\n').length;
canvas.width = mazeWidth * TILE_SIZE;
canvas.height = mazeHeight * TILE_SIZE;

initGame();
updateHUD();

let lastTime = performance.now();

function gameLoop(currentTime) {
    const dt = (currentTime - lastTime) / 1000;
    lastTime = currentTime;

    update(dt);
    render(ctx, canvas);
    updateHUD();

    requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
