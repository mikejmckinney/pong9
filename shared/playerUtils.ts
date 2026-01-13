import { MapSchema } from '@colyseus/schema';
import { PlayerSide } from './messages';
import { PlayerState } from './GameState';

export function getPlayerBySide(players: MapSchema<PlayerState>, side: PlayerSide): PlayerState | undefined {
    for (const player of players.values()) {
        if (player.side === side) {
            return player;
        }
    }
    return undefined;
}
