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

/** Provides user settings */
export class SettingsUI {
  sidebarButton: HTMLElement;
  exitButton: HTMLElement;
  displayModeSelect: HTMLSelectElement;
  styleSelect: HTMLSelectElement;
  graphicsSelect: HTMLSelectElement;
  settingsBox: HTMLElement;

  constructor(private readonly documentRef: HTMLDocument) {
    this.sidebarButton =
        this.documentRef.getElementById('sidebar-settings-button');
    this.exitButton = this.documentRef.getElementById('settings-exit-button');
    this.displayModeSelect =
        this.documentRef.getElementById('settings-display-mode-select') as
        HTMLSelectElement;
    this.styleSelect = this.documentRef.getElementById(
                           'settings-style-select') as HTMLSelectElement;
    this.graphicsSelect = this.documentRef.getElementById(
                              'settings-graphics-select') as HTMLSelectElement;
    this.settingsBox = this.documentRef.getElementById('settings');

    this.initElements();
  }

  /** Toggle the visibility of the settings dialog */
  toggleVisibility() {
    this.settingsBox.classList.toggle('visible');
  }

  private initElements() {
    this.sidebarButton.addEventListener('click', () => this.toggleVisibility());
    this.exitButton.addEventListener('click', () => this.toggleVisibility());
  }
}
