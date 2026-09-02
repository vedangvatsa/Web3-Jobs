// A simple event emitter for handling Firebase errors globally.
// This is a simplified version of Node's EventEmitter for browser compatibility.

type Listener = (...args: any[]) => void;

class EventEmitter {
 private events: { [key: string]: Listener[] } = {};

 on(event: string, listener: Listener): () => void {
  if (!this.events[event]) {
   this.events[event] = [];
  }
  this.events[event].push(listener);
  // Return an unsubscribe function
  return () => {
   this.events[event] = this.events[event].filter(l => l !== listener);
  };
 }

 emit(event: string, ...args: any[]): void {
  if (this.events[event]) {
   this.events[event].forEach(listener => listener(...args));
  }
 }
}

export const errorEmitter = new EventEmitter();
