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

import {Node, NodeType} from '../common/types';

import {BottombarUI} from './bottombar';
import {DetailsUI} from './details';
import {LoadingDialogUI} from './loading_dialog';
import {SearchUI} from './search';
import {SettingsUI} from './settings';
import {SidebarUI} from './sidebar';
import {VisibilityUI} from './visibility';

/** Contains all UI elements of the application */
export class UI {
  constructor(
      readonly document: HTMLDocument, readonly settings: SettingsUI,
      readonly sidebar: SidebarUI, readonly search: SearchUI,
      readonly visibility: VisibilityUI, readonly bottombar: BottombarUI,
      readonly details: DetailsUI, readonly loading: LoadingDialogUI) {}

  /** Gives d3 node circle colors */
  nodeColor(d: Node) {
    return {
      [NodeType.UNKNOWN]: 'black',
      [NodeType.ACTION]: 'red',
      [NodeType.EFFECT]: 'yellow',
      [NodeType.METHOD]: 'brown',
      [NodeType.REDUCER]: 'blue'
    }[d.type];
  }

  /**
   * Loads a stylesheet. Does nothing if already loaded.
   *
   * @param href URL of stylesheet.
   * @param id Unique id for the DOM element.
   * @param callback Callback once loaded.
   */
  loadStyle(href: string, id: string, callback?: () => void) {
    for (let i = 0; i < document.styleSheets.length; i++) {
      if (document.styleSheets[i].href === href) {
        return;
      }
    }
    const head = document.getElementsByTagName('head')[0];
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = href;
    link.id = id;
    if (callback) {
      link.onload = callback;
    }
    head.appendChild(link);
  }

  /**
   * Unloads a stylesheet. Does nothing if doesn't exist.
   *
   * @param id Unique id for the DOM element.
   */
  unloadStyle(id: string) {
    const sheet = document.getElementById(id) as any;
    if (sheet) {
      sheet.disabled = true;
      sheet.parentNode.removeChild(sheet);
    }
  }

  // https://stackoverflow.com/questions/400212/how-do-i-copy-to-the-clipboard-in-javascript
  copyTextToClipboard(text: string): boolean {
    const textArea = document.createElement('textarea');

    // Place in top-left corner of screen regardless of scroll position.
    textArea.style.position = 'fixed';
    textArea.style.top = '0';
    textArea.style.left = '0';

    // Ensure it has a small width and height. Setting to 1px / 1em
    // doesn't work as this gives a negative w/h on some browsers.
    textArea.style.width = '2em';
    textArea.style.height = '2em';

    // We don't need padding, reducing the size if it does flash render.
    textArea.style.padding = '0';

    // Clean up any borders.
    textArea.style.border = 'none';
    textArea.style.outline = 'none';
    textArea.style.boxShadow = 'none';

    // Avoid flash of white box if rendered for any reason.
    textArea.style.background = 'transparent';

    textArea.value = text;

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    let successful = false;
    try {
      successful = document.execCommand('copy');
    } catch (err) {
      // Ignore
    }

    document.body.removeChild(textArea);
    return successful;
  }
}
