import {
    actions,
    addPlayer,
    getHumanId,
    initBoard,
    playerActionQueued,
    queueAction,
    resetAgents,
    resetBombsNFires,
    setPlayerActionQueued,
} from "./game-state.js";

export var isGametime = false;
export var startTime = Date.now();
var isShowingAiNames = false;

const startGame = () => {
    isGametime = true;
    startTime = Date.now();
};

const stopGame = () => {
    isGametime = false;
};

function initStartStop() {
  document.querySelector("#startStop").innerHTML = "Start";
  document.querySelector("#startStop").addEventListener("click", (e) => {
    isGametime ? stopGame() : startGame();
    e.target.innerHTML = isGametime ? "Stop" : "Start";
    e.preventDefault();
  });
}

function initReset() {
  document.querySelector("#reset").innerHTML = "Reset";
  document.querySelector("#reset").addEventListener("click", () => {
    initBoard();
    resetAgents();
    document.querySelector("#player").disabled = false;
    document.querySelector("#startStop").innerHTML = "Start";
    stopGame();
    resetBombsNFires();
  });
}

function initPlayerButton() {
  document.querySelector("#player").innerHTML = "Add human";
  document.querySelector("#player").addEventListener("click", () => {
    addPlayer(true);
    document.querySelector("#player").disabled = true;
  });
}

function initAiButton() {
  document.querySelector("#ai").innerHTML = "Add a random AI";
  document.querySelector("#ai").addEventListener("click", () => {
    fetch("/ais")
      .then((response) => response.json())
      .then((aiNames) => {
        addPlayer(false, aiNames[Math.floor(Math.random() * aiNames.length)]);
      });
  });
}

function initOptionsButton() {
  document.querySelector("#options").innerHTML = "Show AI options";
  document.querySelector("#options").addEventListener("click", () => {
    isShowingAiNames = !isShowingAiNames;
    if (isShowingAiNames) {
      showAiNames();
    } else {
      document.querySelector("#aiNamesList").innerHTML = "";
    }
  });
}

export function initHumanControls() {
  document.onkeydown = (ev) => {
    if (playerActionQueued) return;
    if (ev.key == "ArrowLeft") {
      queueAction(getHumanId(), actions.left);
    } else if (ev.key == "ArrowRight") {
      queueAction(getHumanId(), actions.right);
    } else if (ev.key == "ArrowUp") {
      queueAction(getHumanId(), actions.up);
    } else if (ev.key == "ArrowDown") {
      queueAction(getHumanId(), actions.down);
    } else if (ev.key == " ") {
      queueAction(getHumanId(), actions.bomb);
    }
    setPlayerActionQueued(true);
  };
}

function showAiNames() {
  const aiList = document.querySelector("#aiNamesList");
  fetch("/ais")
    .then((response) => response.json())
    .then((aiNames) => {
      for (let name of aiNames) {
        const p = document.createElement("button");
        p.innerHTML = name;
        p.onclick = () => {
          addPlayer(false, name);
        };
        aiList.appendChild(p);
      }
    });
}

export function setUp() {
  initBoard();
  initStartStop();
  initReset();
  initPlayerButton();
  initAiButton();
  initOptionsButton();
}
