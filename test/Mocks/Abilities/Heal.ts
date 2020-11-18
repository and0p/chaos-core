import Entity from '../../../src/EntityComponent/Entity';
import Ability, { OptionalCastParameters } from '../../../src/EntityComponent/Ability';
import Event from '../../../src/Events/Event';
import { PropertyAdjustmentAction } from '../../../src/Events/Actions/PropertyActions';

export default class Heal extends Ability {
  name = "Heal";

  cast(caster: Entity, { using, target, options }: OptionalCastParameters = {}): Event {
    // TODO check line-of-sight
    const amount = 5; // TODO roll based on INT or something
    // default to casting on self
    target = target && target instanceof Entity ? target : caster;
    const event = new Event([
      new PropertyAdjustmentAction({ caster, target, property: "HP", amount, tags: ['heal'] })
    ]);
    return event;
  }
  
  _move() {

  }

}