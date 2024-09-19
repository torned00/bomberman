import { getActions, getBoard, getBombs, getFires, getPlayers, getTileTypes } from "./game-state.js";

// Legal imports for AIs

export const getBoardInfo = () => {
  return JSON.parse(JSON.stringify(getBoard()));
};

export const getTileTypesInfo = () => {
  return { ...getTileTypes() };
};

export const getPlayersInfo = () => {
  return JSON.parse(JSON.stringify(getPlayers()));
};

export const getActionsInfo = () => {
  return { ...getActions() };
};

export const getBombsInfo = () => {
  return JSON.parse(JSON.stringify(getBombs()));
};

export const getFiresInfo = () => {
  return JSON.parse(JSON.stringify(getFires()));
};
