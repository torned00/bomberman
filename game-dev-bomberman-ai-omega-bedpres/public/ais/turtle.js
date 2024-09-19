// AIs are only allowed to import from ai-info-gate.js. Do not import from any other file.
import { getActionsInfo } from "../ai-info-gate.js";

// Variable to store the assigned player id when creating the AI object.
var my_id;

// Function to create the AI decision maker object. Must return an object with a get_action function.
export function makeAi(id) {
  my_id = id;
  return {
    get_action: get_action,
  };
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

// Returns the AI-s chosen action. For legal actions see the list of possible actions.
// Use methods from ai-info-gate.js to get information about the game state.
async function get_action() {
    // Sleep for 2 seconds
    await sleep(9000);
    
    const actions = getActionsInfo();
    return actions.bomb;
}