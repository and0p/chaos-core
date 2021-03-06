import { expect } from 'chai';
import 'mocha';

import { ComponentCatalog, Entity, Component, ComponentContainer, Game } from '../../../src/internal';

import EmptyGame from '../../Mocks/Games/EmptyGame';
import Room from '../../Mocks/Worlds/Room';

describe('ComponentCatalog', () => {
  let game: Game;
  let entity: Entity;
  let world: Room;
  beforeEach(() => {
    game = new EmptyGame();
    entity = new Entity();
    world = new Room();
  });

  describe('Construction', () => {
    it('Can take any type of ComponentContainer as a parent and assume the correct scope', () => {
      const attachedToEntity = new ComponentCatalog(entity);
      expect(attachedToEntity.parentScope).to.equal('entity');
      const attachedToWorld = new ComponentCatalog(world);
      expect(attachedToWorld.parentScope).to.equal('world');
      const attachedToGame = new ComponentCatalog(game);
      expect(attachedToGame.parentScope).to.equal('game');
    });
  });

});
