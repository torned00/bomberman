// Variable to store the assigned player id when creating the AI object.
import {
    getActionsInfo,
    getBoardInfo,
    getBombsInfo,
    getFiresInfo,
    getPlayersInfo,
    getTileTypesInfo
} from "../ai-info-gate.js";

var my_id;

// Function to create the AI decision maker object. Must return an object with a get_action function.
export function makeAi(id) {
    my_id = id;
    return {
        get_action: get_action,
    };
}

// Returns the AI's chosen action.
function get_action() {
    const actions = getActionsInfo(); // Get available actions (move, place bomb, etc.)
    const board = getBoardInfo(); // Get board state (tiles, walls, destructible objects)
    const bombs = getBombsInfo(); // Get active bombs on the board
    const fire = getFiresInfo(); // Get active fire tiles
    const players = getPlayersInfo(); // Get all players' info

    const me = getAIPos(players); // Get current AI player position

    // Define AI priorities:
    // 1. Avoid bombs and fires
    // 2. Try to place bombs near destructible objects or enemies
    // 3. Move strategically towards safe areas or destructible tiles

    // Step 1: Check if AI is near danger (bombs or fire)
    if (isBombInRange(me.x, me.y) || isFireInRange(me.x, me.y)) {
        return findSafeMove(me, actions); // Move to safety if in danger
    }

    // Step 2: Check if AI can place a bomb near a destructible block or enemy
    if (shouldPlaceBomb(me)) {
        if (actions.includes('place_bomb')) {
            return 'place_bomb';
        }
    }

    // Step 3: Move towards a strategic position (e.g., destructible block or enemy)
    const move = findStrategicMove(me, actions);
    if (move) {
        return move;
    }

    // If no strategic move is found, stay still
    return 'stay';
}

// Find the AI's current position
function getAIPos(players) {
    return players.find((p) => p.id === my_id);
}

// Function to determine if the AI is in the range of an active bomb
function isBombInRange(x, y) {
    const bombs = getBombsInfo();
    for (const bomb of bombs) {
        // Bomb has a range of 3 tiles in both directions
        if ((bomb.x === x && Math.abs(bomb.y - y) <= 3) || (bomb.y === y && Math.abs(bomb.x - x) <= 3)) {
            return true;
        }
    }
    return false;
}

// Function to determine if the AI is in the range of active fire
function isFireInRange(x, y) {
    const fires = getFiresInfo();
    for (const fire of fires) {
        if ((fire.x === x && Math.abs(fire.y - y) <= 1) || (fire.y === y && Math.abs(fire.x - x) <= 1)) {
            return true;
        }
    }
    return false;
}

// Function to find a safe move if the AI is in danger
function findSafeMove(me, actions) {
    const safeMoves = [];

    // Check all available moves (up, down, left, right) for safety
    if (actions.includes('move_up') && !isBombInRange(me.x, me.y - 1) && !isFireInRange(me.x, me.y - 1)) {
        safeMoves.push('move_up');
    }
    if (actions.includes('move_down') && !isBombInRange(me.x, me.y + 1) && !isFireInRange(me.x, me.y + 1)) {
        safeMoves.push('move_down');
    }
    if (actions.includes('move_left') && !isBombInRange(me.x - 1, me.y) && !isFireInRange(me.x - 1, me.y)) {
        safeMoves.push('move_left');
    }
    if (actions.includes('move_right') && !isBombInRange(me.x + 1, me.y) && !isFireInRange(me.x + 1, me.y)) {
        safeMoves.push('move_right');
    }

    // If safe moves are available, pick one randomly (or based on strategy)
    if (safeMoves.length > 0) {
        return safeMoves[Math.floor(Math.random() * safeMoves.length)];
    }

    // If no safe moves, stay still
    return 'stay';
}

// Function to check if it's a good idea to place a bomb
function shouldPlaceBomb(me) {
    const board = getBoardInfo();
    const players = getPlayersInfo();

    // Check surrounding tiles for destructible blocks or nearby players
    const targetTiles = [
        { x: me.x, y: me.y - 1 }, // Up
        { x: me.x, y: me.y + 1 }, // Down
        { x: me.x - 1, y: me.y }, // Left
        { x: me.x + 1, y: me.y }, // Right
    ];

    for (const tile of targetTiles) {
        if (isValidTile(tile.x, tile.y)) {
            const tileType = board[tile.x][tile.y];
            if (tileType === tileTypes.BREAKABLE || isPlayerNearby(tile.x, tile.y)) {
                return true; // Good opportunity to place a bomb
            }
        }
    }
    return false;
}

// Function to find a strategic move towards a destructible block or opponent
function findStrategicMove(me, actions) {
    const board = getBoardInfo();
    const players = getPlayersInfo();

    // Move towards destructible blocks or opponents
    if (actions.includes('move_up') && isDestructibleTile(me.x, me.y - 1)) {
        return 'move_up';
    }
    if (actions.includes('move_down') && isDestructibleTile(me.x, me.y + 1)) {
        return 'move_down';
    }
    if (actions.includes('move_left') && isDestructibleTile(me.x - 1, me.y)) {
        return 'move_left';
    }
    if (actions.includes('move_right') && isDestructibleTile(me.x + 1, me.y)) {
        return 'move_right';
    }

    // If no clear strategic move, return null
    return null;
}

// Helper function to check if a tile is destructible
function isDestructibleTile(x, y) {
    const board = getBoardInfo();
    return isValidTile(x, y) && board[x][y] === tileTypes.BREAKABLE;
}

// Helper function to check if a tile is within bounds
function isValidTile(x, y) {
    return x >= 0 && x < 15 && y >= 0 && y < 15; // Assuming a 15x15 grid
}

// Helper function to check if a player is nearby
function isPlayerNearby(x, y) {
    const players = getPlayersInfo();
    for (const player of players) {
        if (player.id !== my_id && Math.abs(player.x - x) + Math.abs(player.y - y) <= 2) {
            return true;
        }
    }
    return false;
}
