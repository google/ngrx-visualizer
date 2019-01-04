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

import {Node} from '../common/types';

import {LiteEvent} from './lite_event';
import {SidebarUI} from './sidebar';

/** Searches through nodes for names matching input */
export class SearchUI {
  sidebarButton: HTMLElement;
  searchBox: HTMLInputElement;
  searchForm: HTMLFormElement;
  searchResults: HTMLElement;

  onSearch = new LiteEvent<string>();
  onClickResult = new LiteEvent<string>();

  constructor(
      private readonly documentRef: HTMLDocument,
      private readonly sidebar: SidebarUI) {
    this.sidebarButton =
        this.documentRef.getElementById('sidebar-search-button');
    this.searchBox =
        this.documentRef.getElementById('search-box') as HTMLInputElement;
    this.searchForm = document.getElementById('search-form') as HTMLFormElement;
    this.searchResults = document.getElementById('search-results');

    this.initElements();
  }

  /** Set the results of the search box */
  setResults(results: Node[]) {
    this.searchResults.innerHTML = '';
    for (let i = 0; i < results.length; i++) {
      const currentResult = results[i];
      const elem = document.createElement('a');
      elem.href = '#';
      elem.textContent = currentResult.name;
      elem.addEventListener('click', clickEvent => {
        clickEvent.preventDefault();
        this.onClickResult.trigger(currentResult.id);
      });
      this.searchResults.appendChild(elem);
    }
  }

  private initElements() {
    this.sidebarButton.addEventListener('click', () => {
      if (this.sidebar.setContent('sidebar-search', true)) {
        setTimeout(() => this.searchBox.focus(), 250);
      }
    });

    this.searchForm.addEventListener('submit', event => {
      event.preventDefault();
      this.onSearch.trigger(this.searchBox.value);
    });
  }
}
