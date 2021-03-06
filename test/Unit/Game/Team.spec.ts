import { expect } from 'chai';
import 'mocha';
import { v4 as uuid } from 'uuid';

import { Team, Game } from '../../../src/internal';

import EmptyGame from '../../Mocks/Games/EmptyGame';

describe('Team', () => {
  let game: Game;
  let team: Team;
  beforeEach(() => {
    game = new EmptyGame();
    team = new Team({ name: 'Red', players: [uuid(), uuid(), uuid()] });
  });

  describe('Serializing and Deserializing', () => {

    it('Serializes for the client properly', () => {
      const serialized = team.serializeForClient();
      expect(serialized.id).to.equal(team.id);
      expect(serialized.name).to.equal(team.name);
      for(let id of team.players) {
        expect(serialized.players).to.contain(id);
      }
    });
    
    it('Deserializes for the client properly', () => {
      const serialized = team.serializeForClient();
      const deserialized = Team.DeserializeAsClient(serialized);
      expect(deserialized.id).to.equal(team.id);
      expect(deserialized.name).to.equal(team.name);
      for(let id of team.players) {
        expect(deserialized.players.has(id)).to.be.true;
      }
    });
  });

  // Construction, and uuid -> name if none provided
  // Owning and disowning entities, along with scope modifications, handled in integration tests
});
