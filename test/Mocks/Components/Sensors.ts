import { Action, Component, Entity, LoseEntityAction, NestedMap, Reacter, SenseEntityAction, Sensor } from '../../../src/internal';

export class Eyes extends Component implements Sensor, Reacter {
  sensedEntities: NestedMap<Entity>;

  constructor() {
    super(); // SHOULD hypothetically take ID in case of serialization / deserialization
    this.sensedEntities = new NestedMap<Entity>(this.id, 'sensor');
  }

  sense(action: Action): boolean {
    if(this.parent instanceof Entity) {
      action.sense(this.parent, true)
    }
    return true;
  }

  react(action: Action) {
    if(action.movementAction && this.parent instanceof Entity) {
      if(action.sensors.has(this.parent?.id)) {
        action.react(new SenseEntityAction({target: this.parent, caster: this.parent, using: this}));
      } else {
        action.react(new LoseEntityAction({target: this.parent, caster: this.parent, using: this}));
      }
    }
  }
}
