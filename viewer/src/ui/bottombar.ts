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

/** Pop up area on the bottom of the screen */
export class BottombarUI {
  container: HTMLElement;
  content: HTMLElement;
  drag: HTMLElement;
  details: HTMLElement;

  private visible: boolean;
  private height: number;

  constructor(
      private readonly documentRef: HTMLDocument,
      private readonly windowRef: Window, readonly startHeight: number) {
    this.container = this.documentRef.getElementById('bottombar-container');
    this.content = this.documentRef.getElementById('bottombar');
    this.drag = this.documentRef.getElementById('bottombar-drag');
    this.details = this.documentRef.getElementById('details');

    this.height = startHeight;
    this.recalculateStyle();

    this.bindResize();
  }

  /** Adds event handlers for dragging to expand box */
  bindResize() {
    let isResizing = false;

    this.drag.addEventListener('mousedown', e => {
      isResizing = true;
    });

    this.documentRef.addEventListener('mousemove', e => {
      if (!isResizing) {
        return;
      }
      e.preventDefault();
      this.height = this.windowRef.innerHeight - e.pageY;
      this.recalculateStyle();
    });

    this.documentRef.addEventListener('mouseup', e => {
      isResizing = false;
    });
  }

  /** Shows or hides the content */
  recalculateStyle() {
    this.content.style.height = `${this.height}px`;
    this.details.style.height = `${this.height}px`;
    if (this.visible) {
      this.container.style.bottom = '0px';
      this.container.classList.add('visible');
    } else {
      this.container.style.bottom = `-${this.height}px`;
      this.container.classList.remove('visible');
    }
  }

  /**
   * Set the height of the bottombar.
   *
   * @param height Height in pixels.
   */
  setHeight(height: number) {
    this.height = height;
    this.recalculateStyle();
  }

  /** Get the height of the bottombar in pixels */
  getHeight() {
    return this.height;
  }

  /**
   * Set the visibility of the bottombar.
   *
   * @param visible Is the bar visible?
   */
  setVisible(visible: boolean) {
    this.visible = visible;
    this.recalculateStyle();
    return this.visible;
  }

  /** Get the visibility of the bottombar */
  getVisible() {
    return this.visible;
  }

  /** Toggle the visibility of the bottombar */
  toggleVisible(): boolean {
    return this.setVisible(!this.visible);
  }
}
