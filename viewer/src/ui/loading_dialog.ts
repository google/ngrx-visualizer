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

/** Dialog that shows when the application is loading */
export class LoadingDialogUI {
  dialog: HTMLElement;
  exitButton: HTMLElement;
  textElement: HTMLElement;

  private visible: boolean;

  constructor(private readonly documentRef: HTMLDocument) {
    this.dialog = this.documentRef.getElementById('loading-dialog');
    this.exitButton = this.documentRef.getElementById('loading-exit-button');
    this.textElement = this.documentRef.getElementById('loading-text');

    this.initElements();
  }

  /**
   * Set the visibility of the loading dialog.
   *
   * @param visible Is the dialog visible?
   */
  setVisible(visible: boolean) {
    this.visible = visible;
    if (this.visible) {
      this.dialog.classList.add('visible');
    } else {
      this.dialog.classList.remove('visible');
    }
    return this.visible;
  }

  /** Get the visibility of the loading dialog */
  getVisible() {
    return this.visible;
  }

  /** Toggle the visibility of the loading dialog */
  toggleVisible(): boolean {
    return this.setVisible(!this.visible);
  }

  /** Set the status text of the loading dialog */
  setStatusText(text: string) {
    this.textElement.textContent = `Status: ${text}`;
  }

  /** Set the status text of the loading dialog directly */
  setRawText(text: string) {
    this.textElement.textContent = text;
  }

  private initElements() {
    this.exitButton.addEventListener('click', () => this.toggleVisible());
  }
}
