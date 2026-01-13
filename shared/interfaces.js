/**
 * Shared TypeScript interfaces for client-server communication
 * Defines the contract for game state synchronization
 */
/**
 * Game state enum for room lifecycle
 */
export var GamePhase;
(function (GamePhase) {
    GamePhase["WAITING"] = "waiting";
    GamePhase["PLAYING"] = "playing";
    GamePhase["FINISHED"] = "finished";
})(GamePhase || (GamePhase = {}));
//# sourceMappingURL=interfaces.js.map