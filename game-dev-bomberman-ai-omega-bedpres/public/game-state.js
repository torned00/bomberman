import { initHumanControls, isGametime } from "./setup.js";

// config
const BOARD_SIZE = 15;
const FIRE_DURATION = 1000;
const TIME_TO_EXPLODE = 3000;
const BOARD_ROW_COUNT = BOARD_SIZE;
const BOARD_COL_COUNT = BOARD_SIZE;
const DEFAULT_BLAST_RANGE = 3;
const DECISION_TIMEOUT = 1000;

var board = [];
var players = [];
var bombs = [];
var fires = [];
var actionQueue = [];
export var playerActionQueued = false;

export const tileTypes = {
  empty: 0,
  stone: 6,
  wood: 5,
  player1: 1,
  player2: 2,
  player3: 3,
  player4: 4,
};

const spawnPoints = [
  { nr: 1, x: 0, y: 0 },
  { nr: 2, x: BOARD_SIZE - 1, y: BOARD_SIZE - 1 },
  { nr: 3, x: BOARD_SIZE - 1, y: 0 },
  { nr: 4, x: 0, y: BOARD_SIZE - 1 },
];

export const actions = {
  up: 0,
  right: 1,
  down: 2,
  left: 3,
  bomb: 4,
  no_action: 5,
};

export function getBoard() {
  return board;
}

export function getTileTypes() {
  return tileTypes;
}

export function getActions() {
  return actions;
}

export function getPlayers() {
  return players;
}

export function getBombs() {
  return bombs;
}

export function getFires() {
  return fires;
}

export function initBoard() {
  for (let i = 0; i < BOARD_ROW_COUNT; i++) {
    board[i] = [];
    for (let j = 0; j < BOARD_COL_COUNT; j++) {
      if ((i + j) % 2 === 1) {
        board[i][j] = tileTypes.wood;
      } else if (i % 2 === 1 && j % 2 === 1) {
        board[i][j] = tileTypes.stone;
      } else {
        board[i][j] = tileTypes.empty;
      }
    }
  }
  for (let i = 1; i < 3; i++) {
    board[0][i] = tileTypes.empty;
    board[i][0] = tileTypes.empty;
    board[0][BOARD_SIZE - 1 - i] = tileTypes.empty;
    board[BOARD_SIZE - 1 - i][0] = tileTypes.empty;
    board[i][BOARD_SIZE - 1] = tileTypes.empty;
    board[BOARD_SIZE - 1][i] = tileTypes.empty;
    board[BOARD_SIZE - 1 - i][BOARD_SIZE - 1] = tileTypes.empty;
    board[BOARD_SIZE - 1][BOARD_SIZE - 1 - i] = tileTypes.empty;
  }
}

export const getHumanId = () => {
  return getPlayers().find((p) => p.isHuman)?.id;
};

export function resetAgents() {
  players = [];
}

function resolveAction(id, action) {
  const player = players.find((p) => p.id === id);
  if (player?.isAlive) {
    if (action === actions.up) {
      if (player.y > 0 && board[player.y - 1][player.x] === tileTypes.empty) {
        board[player.y][player.x] = tileTypes.empty;
        player.y--;
        board[player.y][player.x] = id;
      }
    } else if (action === actions.down) {
      if (
        player.y < BOARD_SIZE - 1 &&
        board[player.y + 1][player.x] === tileTypes.empty
      ) {
        board[player.y][player.x] = tileTypes.empty;
        player.y++;
        board[player.y][player.x] = id;
      }
    } else if (action === actions.left) {
      if (player.x > 0 && board[player.y][player.x - 1] === tileTypes.empty) {
        board[player.y][player.x] = tileTypes.empty;
        player.x--;
        board[player.y][player.x] = id;
      }
    } else if (action === actions.right) {
      if (
        player.x < BOARD_SIZE - 1 &&
        board[player.y][player.x + 1] === tileTypes.empty
      ) {
        board[player.y][player.x] = tileTypes.empty;
        player.x++;
        board[player.y][player.x] = id;
      }
    } else if (action === actions.bomb) {
      if (player.cd < Date.now()) {
        player.cd = Date.now() + 3000;
        dropBomb(player);
      }
    }
  }
}

export function setPlayerActionQueued(value) {
  playerActionQueued = value;
}

export function queueAction(id, action) {
  actionQueue.push({ id, action });
}

export function resolveActions() {
  if (!isGametime) return;
  // randomize order of actions
  actionQueue.sort(() => Math.random() - 0.5);
  for (let action of actionQueue) {
    resolveAction(action.id, action.action);
  }
  actionQueue = [];
  playerActionQueued = false;
  resolveBombs();
  removeWalls();
  resolveDeath();
  removeFires();
}

function removeWalls() {
  for (let fire of fires) {
    if (board[fire.y][fire.x] === tileTypes.wood) {
      board[fire.y][fire.x] = tileTypes.empty;
    }
  }
}

function resolveDeath() {
  for (let player of players) {
    if (player.isAlive) {
      for (let fire of fires) {
        if (player.x === fire.x && player.y === fire.y) {
          player.isAlive = false;
          player.deathTime = Date.now();
          board[player.y][player.x] = tileTypes.empty;
          console.log(player.name + " died");
        }
      }
    }
  }
}

export async function getAiActions() {
    let promises = [];
  for (let player of players) {
    if (!player.isHuman && player.isAlive && isGametime) {
      const actionPromise = new Promise((resolve) => {
        return resolve(player.agent.get_action());
      });
      const decisionTimeout = new Promise((resolve, reject) =>
        setTimeout(reject, DECISION_TIMEOUT)
      );
      const getActionPromise = Promise.race([actionPromise, decisionTimeout])
        .then((action) => {
          queueAction(player.id, action);
        })
        .catch(() => {
          console.log(player.name + " timed out");
          player.isAlive = false;
          player.deathTime = Date.now();
          board[player.y][player.x] = tileTypes.empty;
        });
        promises.push(getActionPromise);
    }
  }
  await Promise.all(promises);
}

function importAi(name, id) {
  return import(`./ais/${name}.js`).then((module) => {
    return module.makeAi(id);
  });
}

export const addPlayer = (isHuman, name = "") => {
  if (players.length > spawnPoints.length) {
    console.log("Maximum players added");
    return;
  }
  const { x, y, nr } = spawnPoints[players.length];
  if (isHuman && players.find((p) => p.isHuman)) {
    console.log("Only one human can play ata a time");
    return;
  } else if (isHuman) {
    initHumanControls();
    players.push({
      x,
      y,
      isHuman: true,
      isAlive: true,
      id: nr,
      name: "Human",
      cd: Date.now(),
    });
    console.log("Human joined as player " + nr);
  } else {
    importAi(name, nr).then((ai) => {
      players.push({
        x,
        y,
        isHuman: false,
        isAlive: true,
        id: nr,
        name: name + "Bot",
        agent: ai,
        cd: Date.now(),
      });
    });
    console.log(name + "Bot joined as player " + nr);
  }
  board[y][x] = nr;
};

export function resetBombsNFires() {
  bombs = [];
  fires = [];
  actionQueue = [];
}

export function removeFires() {
  const still = [];
  for (let fire of fires) {
    if (fire.duration > Date.now()) {
      still.push(fire);
    }
  }
  fires = still;
}

const resolveBombs = () => {
  const remaining = [];
  for (let bomb of bombs) {
    if (bomb.explosion < Date.now()) {
      explodeBomb(bomb);
    } else {
      remaining.push(bomb);
    }
  }
  bombs = remaining;
};

function dropBomb(player) {
  bombs.push({
    x: player.x,
    y: player.y,
    explosion: Date.now() + TIME_TO_EXPLODE,
  });
}

export function explodeBomb(bomb) {
  fires.push({ x: bomb.x, y: bomb.y, duration: Date.now() + FIRE_DURATION });
  for (let i = 1; i < DEFAULT_BLAST_RANGE; i++) {
    if (bomb.x + i < BOARD_SIZE) {
      if (isStoppingFire(bomb.x + 1, bomb.y)) {
        break;
      }
      fires.push({
        x: bomb.x + i,
        y: bomb.y,
        duration: Date.now() + FIRE_DURATION,
      });
      if (isBurnAndStop(bomb.x + 1, bomb.y)) {
        break;
      }
    }
  }
  for (let i = 1; i < DEFAULT_BLAST_RANGE; i++) {
    if (bomb.x - i >= 0) {
      if (isStoppingFire(bomb.x - 1, bomb.y)) {
        break;
      }
      fires.push({
        x: bomb.x - i,
        y: bomb.y,
        duration: Date.now() + FIRE_DURATION,
      });
      if (isBurnAndStop(bomb.x - 1, bomb.y)) {
        break;
      }
    }
  }
  for (let i = 1; i < DEFAULT_BLAST_RANGE; i++) {
    if (bomb.y + i < BOARD_SIZE) {
      if (isStoppingFire(bomb.x, bomb.y + i)) {
        break;
      }
      fires.push({
        x: bomb.x,
        y: bomb.y + i,
        duration: Date.now() + FIRE_DURATION,
      });
      if (isBurnAndStop(bomb.x, bomb.y + i)) {
        break;
      }
    }
  }
  for (let i = 1; i < DEFAULT_BLAST_RANGE; i++) {
    if (bomb.y - i >= 0) {
      if (isStoppingFire(bomb.x, bomb.y - i)) {
        break;
      }
      fires.push({
        x: bomb.x,
        y: bomb.y - i,
        duration: Date.now() + FIRE_DURATION,
      });
      if (isBurnAndStop(bomb.x, bomb.y - i)) {
        break;
      }
    }
  }
}
function isStoppingFire(x, y) {
  return board[y][x] === tileTypes.stone;
}

function isBurnAndStop(x, y) {
  return board[y][x] === tileTypes.wood;
}
