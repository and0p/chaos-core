import { Component, isSensor, isModifier, isReacter, ComponentType, ComponentContainer, Scope, Game, Team, Player, World, Action, Entity } from '../internal';
import { SubscriptionSet } from './ComponentCatalog/SubscriptionSet';

interface Subscription {
  component: Component,
  to: ComponentContainer,
  types: ComponentType[],
  scope: Scope
}

const validSubscriptions = {
  entity: ['world', 'player', 'team', 'game'],
  world: ['game'],
  player: ['team', 'game'],
  team: ['game'],
  game: [] as string[],
}

interface ComponentsByType {
  sensor: Map<string, Component>,
  roller: Map<string, Component>,
  modifier: Map<string, Component>,
  reacter: Map<string, Component>
}

export class ComponentCatalog {
  // Scope of parent object -- ie being owned by a World would be 'world'
  parentScope: Scope;

  // All components owned by this ComponentContainer
  all: Map<string, Component> = new Map<string, Component>();

  // Components from other containers subscribed (listening/interacting) to this ComponentContainer
  subscribers: ComponentsByType = { 
    sensor: new Map<string, Component>(),
    roller: new Map<string, Component>(),
    modifier: new Map<string, Component>(),
    reacter: new Map<string, Component>() 
  };

  // Components owned by this catalog that are subscribed to other catalogs
  subscriptions = {
    entity: new SubscriptionSet(),
    world: new SubscriptionSet(),
    player: new SubscriptionSet(),
    team: new SubscriptionSet(),
    game: new SubscriptionSet()
  };

  constructor(private parent: ComponentContainer) {
    // Get the parent's scope based on the parent's type
   if (parent instanceof World) {
      this.parentScope = 'world';
    } else if (parent instanceof Player) {
      this.parentScope = 'player';
    } else if (parent instanceof Team) {
      this.parentScope = 'team';
    } else if (parent instanceof Game) {
      this.parentScope = 'game';
    } else {
      this.parentScope = 'entity';
    }
  }

  // Shut this catalog down
  unload() {}

  // Add a component to this catalog
  addComponent(c: Component): boolean {
    // TODO check for uniqueness
    const { id } = c;
    this.all.set(id, c);
    this.createSubscriptions(c);
    return true;
  }

  // Remove a component from this catalog, unsubscribing all
  removeComponent(c: Component) {
    const { id } = c;
    this.all.delete(id);
    // Unsubscribe from other components if needed
    if(this.subscriptions.entity.has(id)) {
      const subscription = this.subscriptions.entity.get(id)!;
      this.unsubscribeFromOther(id, subscription);
    }
    if(this.subscriptions.world.has(id)) {
      const subscription = this.subscriptions.entity.get(id)!;
      this.unsubscribeFromOther(id, subscription);
    }
    if(this.subscriptions.player.has(id)) {
      const subscription = this.subscriptions.entity.get(id)!;
      this.unsubscribeFromOther(id, subscription);
    }
    if(this.subscriptions.team.has(id)) {
      const subscription = this.subscriptions.entity.get(id)!;
      this.unsubscribeFromOther(id, subscription);
    }
    if(this.subscriptions.game.has(id)) {
      const subscription = this.subscriptions.entity.get(id)!;
      this.unsubscribeFromOther(id, subscription);
    }
  }

  unsubscribeFromOther(id: string, subscription: Subscription) {
    subscription.to.components.removeSubscriber(id, subscription.type);
  }

  // Create all outgoing subscriptions
  subscribeToAll() {
    this.removeAllSubscriptions();  // clear any old internal subscriptions
    for(let [id, component] of this.all) {
      this.createSubscriptions(component);
    }
  }

  removeAllSubscriptions() {
    for(const [id, subscriber] of this.subscribers.sensor) {
      this.removeSubscriber(subscriber.id, 'sensor');
    }
    for(const [id, subscriber] of this.subscribers.modifier) {
      this.removeSubscriber(subscriber.id, 'modifier');
    }
    for(const [id, subscriber] of this.subscribers.reacter) {
      this.removeSubscriber(subscriber.id, 'reacter');
    }
  }

  unsubscribeFromAll() {
    for(const [id, subscription] of this.subscriptions.entity) {
      subscription.to.components.removeSubscriber(subscription.component.id, subscription.type);
    }
    for(const [id, subscription] of this.subscriptions.world) {
      subscription.to.components.removeSubscriber(subscription.component.id, subscription.type);

    }
    for(const [id, subscription] of this.subscriptions.game) {
      subscription.to.components.removeSubscriber(subscription.component.id, subscription.type);
    }
  }

  private createSubscriptions(c: Component) {
    const { id } = c;
    // Figure out which, if any, interactive types this components is and connect appropriately
    if(isSensor(c)) {
      const scope = c.scope.sensor;
      if(scope !== undefined && validSubscriptions[this.parentScope].includes(scope) && this.parent.isPublished()) {
        this.subscribeToOther(c, 'sensor', scope);
      } else {
        this.attachSubscriber(c, 'sensor');
      }
    }
    if(isModifier(c)) {
      const scope = c.scope.modifier;
      if(scope !== undefined && validSubscriptions[this.parentScope].includes(scope) && this.parent.isPublished()) {
        this.subscribeToOther(c, 'modifier', scope);
      } else {
        this.attachSubscriber(c, 'modifier');
      }
    }
    if(isReacter(c)) {
      const scope = c.scope.reacter;
      if(scope !== undefined && validSubscriptions[this.parentScope].includes(scope) && this.parent.isPublished()) {
        this.subscribeToOther(c, 'reacter', scope);
      } else {
        this.attachSubscriber(c, 'reacter');
      }
    }
  }

  // Subscribe one of these components to another catalog
  private subscribeToOther(c: Component, type: ComponentType, scope: Scope) {
    // Defer to parent to decide which ComponentContainer fits the relative scope
    const container = this.parent.getComponentContainerByScope(scope);
    // Subscribe to these containers
    if(container) {
      container.components.attachSubscriber(c, type);
      this.subscriptions[scope].set(c.id, { 
        component: c, 
        to: container,
        type,
        scope
       });
    }
  }

  // Susbcribe an external component to this catalog
  attachSubscriber(c: Component, type: ComponentType) {
    this.subscribers[type].set(c.id, c);
  }

  removeSubscriber(id: string, type: ComponentType) {
    this.subscribers[type].delete(id);
  }

  // ACTION METHODS
  senseEntity(e: Entity) {

  }

  senseAction(a: Action) {

  }

  modify(a: Action) {

  }

  react(a: Action) {

  }

  // MISC
  is(componentName: string): Component | undefined {
    return this.has(componentName);
  }

  has(componentName: string): Component | undefined {
    return Array.from(this.all.values()).find(c => c.name === componentName);
  }

}
