import { getActionsInfo, getBoardInfo, getBombsInfo, getFiresInfo, getPlayersInfo, getTileTypesInfo } from "../ai-info-gate.js";

var my_id;

export function makeAi(id) {
  my_id = id;
  return {
    get_action: get_action,
  };
}

function get_action() {
  const board = getBoardInfo();
  const actions = getActionsInfo();
  const bombs = getBombsInfo();
  const fire = getFiresInfo();
  const players = getPlayersInfo();
  const tileTypes = getTileTypesInfo();
  const myAi = players.find((p) => p.id === my_id);

  // return random action
  const r = Math.floor(Math.random() * 5);
  switch (r) {
    case 0:
      return actions.up;
    case 1:
      return actions.down;
    case 2:
      return actions.left;
    case 3:
      return actions.right;
    case 4:
      return actions.bomb;
  }
}
