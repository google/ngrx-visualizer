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

import {NgrxGraph} from '../ngrx_graph';

import {LiteEvent} from './lite_event';
import {SidebarUI} from './sidebar';

/** Controls which nodes are visible */
export class VisibilityUI {
  sidebarButton: HTMLElement;
  content: HTMLElement;

  onChange = new LiteEvent<{[key: string]: boolean}>();

  constructor(
      private readonly documentRef: HTMLDocument,
      private readonly sidebar: SidebarUI) {
    this.sidebarButton =
        this.documentRef.getElementById('sidebar-visibility-button');
    this.content = this.documentRef.getElementById('visibility-content');

    this.initElements();
  }

  /** Get a dictionary of node id -> visible? */
  getVisibility(): {[key: string]: boolean} {
    const actions = this.content.getElementsByTagName('input');
    const result: {[key: string]: boolean} = {};
    for (let i = 0; i < actions.length; i++) {
      const action = actions[i];
      if (action.id.indexOf('visibility-entry-') === 0) {
        result[action.id.slice('visibility-entry-'.length)] = action.checked;
      }
    }
    return result;
  }

  /**
   * Sets the content of the visibility sidebar (converts object to checkbox
   * tree)
   */
  setContent(content: any, graph: NgrxGraph) {
    this.content.innerHTML = '';
    const margin = 5;
    let nonNodeIDCtr = 0;
    const recurse = (obj: any) => {
      const container = this.documentRef.createElement('div');
      container.style.marginLeft = `${margin}px`;
      for (const key of Object.keys(obj)) {
        const checkboxContainer = this.documentRef.createElement('div');
        checkboxContainer.style.whiteSpace = 'nowrap';
        const dropdownButton = this.documentRef.createElement('div');
        dropdownButton.innerHTML = '&#9662;';
        dropdownButton.classList.add('visibility-entry-toggle-button');
        dropdownButton.classList.add('noselect');
        checkboxContainer.appendChild(dropdownButton);
        const checkbox = this.documentRef.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = true;
        const label = this.documentRef.createElement('label');
        label.textContent = key;
        if (typeof obj[key] === 'string') {
          label.textContent = graph.getNodeFromID(obj[key]).name;
          checkbox.id = `visibility-entry-${obj[key]}`;
        } else {
          checkbox.id = `visibility-container-${nonNodeIDCtr++}`;
        }
        label.htmlFor = checkbox.id;
        checkboxContainer.appendChild(checkbox);
        checkboxContainer.appendChild(label);
        container.appendChild(checkboxContainer);
        if (typeof obj[key] !== 'string') {
          const subTree = recurse(obj[key]);
          checkboxContainer.appendChild(subTree);
          checkbox.addEventListener('click', () => {
            const subBoxes = subTree.getElementsByTagName('input');
            for (let i = 0; i < subBoxes.length; i++) {
              subBoxes[i].checked = checkbox.checked;
              subBoxes[i].indeterminate = false;
            }
            this.onChange.trigger(this.getVisibility());
            this.bubbleCheckboxState(container.parentElement);
          });

          const toggleDropDown = () => {
            if (subTree.style.display === 'none') {
              subTree.style.display = 'block';
            } else {
              subTree.style.display = 'none';
            }
            dropdownButton.classList.toggle('rotated');
          };

          dropdownButton.addEventListener('click', toggleDropDown);

          if (typeof obj[key][Object.keys(obj[key])[0]] === 'string' ||
              Object.keys(obj[key])[0] === 'actions.ts') {
            toggleDropDown();
          }
        } else {
          // Maintain padding but hidden
          dropdownButton.style.visibility = 'hidden';
          checkbox.addEventListener('click', () => {
            this.onChange.trigger(this.getVisibility());
            this.bubbleCheckboxState(container.parentElement);
          });
        }
      }
      return container;
    };
    this.content.appendChild(recurse(content));
  }

  /** Hide all nodes */
  hideAll() {
    const subBoxes = this.content.getElementsByTagName('input');
    for (let i = 0; i < subBoxes.length; i++) {
      subBoxes[i].checked = false;
      subBoxes[i].indeterminate = false;
    }
    this.onChange.trigger(this.getVisibility());
  }

  /** Turn on the checkbox of a specific path */
  showPath(pathInput: string): boolean {
    const path = pathInput.split('/');
    if (path[path.length - 1] === '') {
      path.pop();
    }
    let current = this.content;
    let lastChild;
    for (const subPath of path) {
      let found = false;
      for (let i = 0; i < current.childNodes.length && !found; i++) {
        const child = current.childNodes[i];
        if (child.childNodes) {
          for (let j = 0; j < child.childNodes.length && !found; j++) {
            if (child.childNodes[j].childNodes[2]) {
              const name = child.childNodes[j].childNodes[2].textContent;
              if (name === subPath) {
                current = child.childNodes[j] as HTMLElement;
                found = true;
                lastChild = child.childNodes[j];
              }
            }
          }
        }
      }
      if (!found) {
        return false;
      }
    }
    (lastChild.childNodes[1] as HTMLInputElement).click();
  }

  private initElements() {
    this.sidebarButton.addEventListener('click', () => {
      this.sidebar.setContent('sidebar-visibility', true);
    });
  }

  private bubbleCheckboxState(obj: HTMLElement) {
    const curCheck = obj.childNodes[1] as HTMLInputElement;
    if (curCheck === undefined || curCheck.checked === undefined) {
      return;
    }
    const subTree = obj.childNodes[3];
    const firstChild = subTree.childNodes[0].childNodes[1] as HTMLInputElement;
    curCheck.checked = firstChild.checked;
    curCheck.indeterminate = firstChild.indeterminate;
    for (let i = 0; i < subTree.childNodes.length; i++) {
      const child = subTree.childNodes[i].childNodes[1] as HTMLInputElement;
      if (child.checked !== firstChild.checked || child.indeterminate) {
        curCheck.indeterminate = true;
        curCheck.checked = false;
      }
    }
    this.bubbleCheckboxState(obj.parentElement.parentElement);
  }
}
