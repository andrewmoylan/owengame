# Owengame

A simple browser-based game.

## Play the game

You can play Owengame here: [https://andrewmoylan.github.io/owengame/owengame.html](https://andrewmoylan.github.io/owengame/owengame.html)

## How to Play

### Controls
*   **Move:** Left-click on the canvas to move your character (the cyan circle) to that location.
*   **Shoot:** Right-click to shoot a projectile from your character towards the cursor. Hold the right mouse button to shoot continuously.

### Gameplay
*   Enemies (red, purple, and blue circles) will spawn and move around the screen.
*   Your projectiles can destroy enemies. You get points for each enemy you destroy.
*   Enemies can also shoot projectiles if they move over a green power-up square.
*   Avoid enemy projectiles. You have 10 lives. If you are hit, you lose a life.
*   Collect green power-up squares to increase your shooting speed.

### Merging
*   When two enemies of the same type collide, they merge to form a stronger enemy of the next tier:
    *   Red + Red -> Purple
    *   Purple + Purple -> Blue
    *   Blue + Blue -> Boss

### Win/Loss Conditions
*   **Win:** Defeat the final boss enemy that appears when two blue enemies merge.
*   **Lose:** The game is over if you lose all 10 of your lives.

Your final score will be displayed when the game ends.
