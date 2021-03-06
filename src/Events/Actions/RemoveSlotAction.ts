import { Action, ActionParameters, Entity, ActionType, BroadcastType } from '../../internal';

export class RemoveSlotAction extends Action {
  actionType: ActionType = ActionType.REMOVE_SLOT_ACTION;
  broadcastType = BroadcastType.HAS_SENSE_OF_ENTITY;

  name: string;
  target: Entity;

  constructor({caster, target, using, name, tags = []}: RemoveSlotAction.Params) {
    super({caster, using, tags});
    this.target = target;
    this.name = name;
  }

  apply(): boolean {
    return this.target._removeSlot(this.name);
  }
}

export namespace RemoveSlotAction {
  export interface EntityParams extends ActionParameters {
    name: string,
  }

  export interface Params extends EntityParams {
    target: Entity;
  }

}
