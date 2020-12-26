import Entity from "../EntityComponent/Entity";
import Action from "../Events/Action";
import World from "../World/World";
import { Queue } from 'queue-typescript';
import Component, { ComponentContainer } from "../EntityComponent/Component";
import { isModifier, isReacter, Listener, Modifier, Reacter } from "../Events/Interfaces";

export default abstract class Game {
  private static instance: Game;

  worlds: Map<string, World> = new Map<string, World>();
  entities: Map<number, Entity> = new Map<number, Entity>();
  components: Component[] = []; // all components
  modifiers: Modifier[] = [];   // all modifiers
  reacters: Reacter[] = [];     // all reacters
  actionQueue: Queue<Action> = new Queue<Action>();
  // TODO players, teams

  constructor() {
    if(Game.instance && !process.env.DEBUG) {
      throw new Error();
    }
    Game.instance = this;
  }

  static getInstance = (): Game => {
    if(Game.instance) {
      return Game.instance;
    }
    throw new Error();
  }

  enqueueAction = (a: Action): void => {
    this.actionQueue.enqueue(a);
  }

  getWorld = (id: string): World | undefined => {
    return this.worlds.get(id);
  }

  getEntity = (id: number): Entity | undefined => {
    return this.entities.get(id);
  }

  addEntity = (e: Entity): boolean => {
    if(e.id) {
      this.entities.set(e.id, e);
      return true;
    }
    return false;
  }

  attach(c: Component): boolean {
    this.components.push(c); // TODO check for unique flag, return false if already attached
    if(isModifier(c)) {
      this.modifiers.push(c);
    }
    if(isReacter(c)) {
      this.reacters.push(c);
    }
    return true;
  }

  detach(c: Component): void {

  }

  modify(a: Action) {
    this.modifiers.map(r => r.modify(a));
  }

  react(a: Action) {
    this.reacters.map(r => r.react(a));
  }

  abstract initialize(options: any): void;
  abstract onPlayerConnect(options: any): void;

}
