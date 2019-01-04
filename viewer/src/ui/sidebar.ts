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

import {LiteEvent} from './lite_event';

/** Pop up area on the side of the screen */
export class SidebarUI {
  container: HTMLElement;
  easeButton: HTMLElement;
  refreshButton: HTMLElement;
  openFileButton: HTMLElement;
  copyButton: HTMLElement;
  fileSelect: HTMLInputElement;
  content: HTMLElement;
  drag: HTMLCollectionOf<Element>;

  onFile = new LiteEvent<FileList>();

  private visible: boolean;
  private width: number;

  constructor(
      private readonly documentRef: HTMLDocument,
      private readonly windowRef: Window, readonly startWidth: number,
      readonly contentIDs: string[]) {
    this.container = this.documentRef.getElementById('sidebar-container');
    this.easeButton = this.documentRef.getElementById('sidebar-ease-button');
    this.refreshButton =
        this.documentRef.getElementById('sidebar-refresh-button');
    this.openFileButton =
        this.documentRef.getElementById('sidebar-open-file-button');
    this.copyButton = this.documentRef.getElementById('sidebar-copy-button');
    this.fileSelect = this.documentRef.getElementById('sidebar-file-select') as
        HTMLInputElement;
    this.drag = this.documentRef.getElementsByClassName('sidebar-drag');

    this.width = startWidth;
    this.setContent(contentIDs[0], false);

    this.bindResize();
    this.bindFile();
  }

  setContent(id: string, showAndToggleContent: boolean): boolean {
    if (showAndToggleContent) {
      if (this.content.id === id) {
        this.toggleVisible();
      } else {
        this.setVisible(true);
      }
    }
    for (const content of this.contentIDs) {
      this.content = this.documentRef.getElementById(content);
      this.content.style.width = '0px';
    }
    this.content = this.documentRef.getElementById(id);
    this.recalculateStyle();
    return this.visible;
  }

  /** Adds event handlers for dragging to expand box */
  bindResize() {
    let isResizing = false;

    for (let i = 0; i < this.drag.length; i++) {
      this.drag[i].addEventListener('mousedown', e => {
        isResizing = true;
      });
    }

    this.documentRef.addEventListener('mousemove', e => {
      if (!isResizing) {
        return;
      }
      e.preventDefault();
      this.width = this.windowRef.innerWidth - e.pageX;
      this.recalculateStyle();
    });

    this.documentRef.addEventListener('mouseup', e => {
      isResizing = false;
    });
  }

  /**
   * Adds event handlers for opening a file.
   *
   * To subscribe, listen to the onFile event.
   */
  bindFile() {
    this.openFileButton.addEventListener('click', () => {
      this.fileSelect.click();
    });
    this.fileSelect.addEventListener('change', () => {
      this.onFile.trigger(this.fileSelect.files);
    });
  }

  /** Shows or hides the content */
  recalculateStyle() {
    this.content.style.width = `${this.width}px`;
    if (this.visible) {
      this.container.style.right = '0px';
    } else {
      this.container.style.right = `-${this.width}px`;
    }
  }

  /**
   * Set the width of the sidebar.
   *
   * @param width Width in pixels.
   */
  setWidth(width: number) {
    this.width = width;
    this.recalculateStyle();
  }

  /** Get the width of the sidebar in pixels */
  getWidth() {
    return this.width;
  }

  /**
   * Set the visibility of the sidebar.
   *
   * @param visible Is the bar visible?
   */
  setVisible(visible: boolean) {
    this.visible = visible;
    this.recalculateStyle();
    return this.visible;
  }

  /** Get the visibility of the sidebar */
  getVisible() {
    return this.visible;
  }

  /** Toggle the visibility of the bottombar */
  toggleVisible(): boolean {
    return this.setVisible(!this.visible);
  }
}
