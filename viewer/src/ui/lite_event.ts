/**
 * Copyright 2018 The NgRx Visualizer Authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/** Small way to add event handlers to arbitrary TS objects */
// https://gist.github.com/JasonKleban/50cee44960c225ac1993c922563aa540

export interface Event<T> {
  on(handler: (data?: T) => void): void;
  off(handler: (data?: T) => void): void;
}

export class LiteEvent<T> implements Event<T> {
  private handlers: Array<(data?: T) => void> = [];

  on(handler: (data?: T) => void): void {
    this.handlers.push(handler);
  }

  off(handler: (data?: T) => void): void {
    this.handlers = this.handlers.filter(h => h !== handler);
  }

  trigger(data?: T) {
    this.handlers.slice(0).forEach(h => {
      try {
        h(data);
      } catch (e) {
        console.error(e);
      }
    });
  }

  expose(): Event<T> {
    return this;
  }
}
