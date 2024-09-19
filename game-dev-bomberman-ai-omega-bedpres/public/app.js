import { draw } from './drawer.js';
import { getAiActions, resolveActions } from './game-state.js';
import { setUp } from './setup.js';
import { printRankings } from './scoreboard.js';

const TIME_PER_UPDATE = 160; 
// const TIME_PER_UPDATE = 16;

var last = Date.now();
var lag = 0;
setUp();
async function loop(time) {
    let current = Date.now();
    lag+=current-last;
    last=current;
    while(lag>=TIME_PER_UPDATE) {
        await getAiActions();
        resolveActions();
        lag-=TIME_PER_UPDATE;
    }
    draw(lag/TIME_PER_UPDATE);
    printRankings();
    window.requestAnimationFrame(loop);
    
}
loop();