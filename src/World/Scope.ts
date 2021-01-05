import { Game, Vector, World } from "..";

export default class Scope {
  active = new Set<string>();
  chunkViewers = new Map<string, Set<string>>();
  size?: Vector;

  constructor(width?: number, height?: number) {
    if(width && height) {
      this.size = new Vector(width - 1, height - 1);
    }
  }
  
  // Adds viewer of chunk, returns true if not previously viewed/loaded
  addChunkViewer = (viewer: string, chunk: string): boolean => {
    const previouslyViewed = this.active.has(chunk);
    if (!previouslyViewed) {
      this.active.add(chunk);
      this.chunkViewers.set(chunk, new Set<string>([viewer]));
    } else {
      this.chunkViewers.get(chunk)!.add(viewer);
    }
    return !previouslyViewed;
  }

  // Removes viewer of chunk, returns true if no longer viewed by anyone
  removeChunkViewer = (viewer: string, chunk: string): boolean => {
    const viewers = this.chunkViewers.get(chunk);
    if (!viewers || !viewers.has(viewer)) {
      return false;
    }
    viewers.delete(viewer);
    const noViewersRemaining = viewers.size === 0;
    if (noViewersRemaining) {
      this.chunkViewers.delete(chunk);
    }
    return noViewersRemaining;
  }

  addViewer(viewer: string, to: Vector, from?: Vector): ScopeChange {
    const distance = Game.getInstance().viewDistance;
    const newChunks = from !== undefined ? subtract(this.getChunksInView(from, distance), this.getChunksInView(to, distance)) : this.getChunksInView(to, distance);
    const totalAdded: string[] = [];
    // Add new tiles + viewers
    for (let chunk of newChunks) {
      if (this.addChunkViewer(viewer, chunk)) {
        totalAdded.push(chunk);
      }
    }
    return new ScopeChange(totalAdded, []);
  }

  removeViewer(viewer: string, from: Vector, to?: Vector): ScopeChange {
    const distance = Game.getInstance().viewDistance;
    const oldChunks = to !== undefined ? subtract(this.getChunksInView(to, distance), this.getChunksInView(from, distance)) : this.getChunksInView(from, distance);
    const totalRemoved: string[] = [];
    // Add new tiles + viewers
    for (let chunk in oldChunks) {
      if (this.removeChunkViewer(viewer, chunk)) {
        totalRemoved.push(chunk);
      }
    }
    return new ScopeChange([], totalRemoved);
  }

  getMoveChange(viewer: string, from: Vector, to: Vector): ScopeChange {
    const distance = Game.getInstance().viewDistance;
    // Get the view areas from before and after
    const oldView = this.getChunksInView(from, distance);
    const newView = this.getChunksInView(to, distance);
    const viewerAdded = subtract(oldView, newView);
    const viewerRemoved = subtract(newView, oldView);
    const totalAdded: string[] = [];
    const totalRemoved: string[] = [];
    // Add new tiles + viewers
    for (let chunk in viewerAdded) {
      if (this.addChunkViewer(viewer, chunk)) {
        totalAdded.push(chunk);
      }
    }
    // Remove unviewed tiles
    for (let chunk in viewerRemoved) {
      if (this.addChunkViewer(viewer, chunk)) {
        totalAdded.push(chunk);
      }
    }
    return new ScopeChange(totalAdded, totalRemoved);
  };
  
  getChunksInView(center: Vector, distance: number): Set<string> {
    const chunks = new Set<string>();
    let topLeft = center.add(new Vector(-distance, -distance));
    let bottomRight = center.add(new Vector(distance, distance));
    if(this.size) {
      topLeft = topLeft.clamp(this.size);
      bottomRight = bottomRight.clamp(this.size);
    }
    for (let x = topLeft.x; x <= bottomRight.x; x++) {
      for (let y = topLeft.y; y <= bottomRight.y; y++) {
        chunks.add(new Vector(x, y).getIndexString());
      }
    }
    return chunks;
  }

}

const subtract = (sub: Set<string>, from: Set<string>): string[] => {
  const c: string[] = [];
  for (let s in from) {
    if (!sub.has(s)) {
      c.push(s);
    }
  }
  return c;
}

export class ScopeChange {
  constructor(public added: string[], public removed: string[]) { }
}