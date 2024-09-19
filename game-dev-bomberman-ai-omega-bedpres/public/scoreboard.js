import { getPlayers } from "./game-state.js";
import { startTime } from "./setup.js";

const scoreboard = document.getElementById("scoreboard");

export const printRankings = () => {
  // remove all children of the scoreboard
  while (scoreboard.firstChild) {
    scoreboard.removeChild(scoreboard.firstChild);
  }
  getPlayers()
    .sort(sortRanking)
    .forEach((player, index) => {
      const playerElement = document.createElement("div");
      playerElement.style.color = player.isAlive ? "green" : "red";
      const tekst =
        `${index + 1}. ${player.name}` +
        (!!player.deathTime
          ? ` - ${(player.deathTime - startTime)} millis survived`
          : "");
      playerElement.innerHTML = tekst;
      scoreboard.appendChild(playerElement);
    });
};
function sortRanking(a, b) {
    if (a.isAlive && !b.isAlive) return -1;
    if (!a.isAlive && b.isAlive) return 1;
    return b.deathTime - a.deathTime;
}

