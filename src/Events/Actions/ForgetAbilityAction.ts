import { Action, Ability, ActionParameters, Entity, Component, ActionType, BroadcastType } from '../../internal'; 

export class ForgetAbilityAction extends Action {
  actionType: ActionType = ActionType.FORGET_ABILITY_ACTION;
  broadcastType = BroadcastType.HAS_SENSE_OF_ENTITY;  // TODO should only be owning players?

  ability: Ability;
  target: Entity;
  grantedBy?: Entity | Component;

  constructor({caster, target, using, grantedBy, ability, tags = []}: ForgetAbilityAction.Params) {
    super({caster, using, tags});
    this.target = target;
    this.ability = ability;
    this.grantedBy = grantedBy;
  }

  apply(): boolean {
    this.target._forget(this.ability, this.grantedBy, this.using);
    return false;
  }
}

export namespace ForgetAbilityAction {
  export interface EntityParams extends ActionParameters {
    ability: Ability;
    grantedBy?: Entity | Component;
  }
  
  export interface Params extends EntityParams {
    target: Entity,
  }
}
