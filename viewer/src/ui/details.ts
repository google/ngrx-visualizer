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

import {Link, Node, NodeType} from '../common/types';
import {NgrxGraph} from '../ngrx_graph';

import {zoomToNode} from '../simulation/actions';
import {Simulation} from '../simulation/simulation';
import {BottombarUI} from './bottombar';
import * as UIUtils from './utils';

/** Shows node information as text on the bottom of the screen */
export class DetailsUI {
  bottomButton: HTMLElement;
  details: HTMLElement;

  constructor(
      private readonly documentRef: HTMLDocument,
      private readonly bottombar: BottombarUI) {
    this.bottomButton =
        this.documentRef.getElementById('bottombar-details-button');
    this.details = this.documentRef.getElementById('details');

    this.initElements();
  }

  /**
   * Writes out the details of a node into the bottombar.
   *
   * @param node Node to load.
   * @param graph Currently loaded graph.
   * @param isSplitReducers Is the current graph in split reducer mode?
   * @param originalGraph Original graph (without modifications such as split
   *     reducer)
   */
  loadDetails(
      sim: Simulation, node: Node, graph: NgrxGraph, isSplitReducers: boolean,
      originalGraph: NgrxGraph) {
    this.details.innerHTML = '';

    const titleElem = document.createElement('a');
    titleElem.textContent = node.name;
    titleElem.href = '#';
    titleElem.addEventListener('click', () => {
      zoomToNode(sim, node.id);
    });
    titleElem.classList.add('details-header');
    this.details.appendChild(titleElem);

    const typeElem = document.createElement('p');
    let typeText = UIUtils.typeToText(node.type);
    if (isSplitReducers && node.type === NodeType.REDUCER) {
      typeText = UIUtils.typeToText(NodeType.ACTION);
    }
    typeElem.textContent = `Type: ${typeText}`;
    typeElem.classList.add('details-row');
    this.details.appendChild(typeElem);

    if (isSplitReducers && node.type === NodeType.REDUCER) {
      const reducer = originalGraph.getNodeFromID(node.reducer);
      const reducerElem = document.createElement('p');
      const reducerTypeText = UIUtils.typeToText(reducer.type);
      reducerElem.textContent = `${reducerTypeText}: `;
      const reducerLink = document.createElement('a');
      reducerLink.href = '#';
      reducerLink.textContent = reducer.name;
      reducerElem.appendChild(reducerLink);
      reducerElem.classList.add('details-row');
      this.details.appendChild(reducerElem);
    }

    const causes: Link[] = [];
    const effects: Link[] = [];
    for (const link of graph.links) {
      if (link.source === node) {
        effects.push(link);
      } else if (link.target === node) {
        causes.push(link);
      }
    }

    const causesElem = document.createElement('p');
    causesElem.textContent = 'Causes:';
    causesElem.classList.add('details-row');
    this.details.appendChild(causesElem);

    for (const cause of this.sortCauses(causes)) {
      const causeElem = document.createElement('a');
      causeElem.textContent = (cause.source as Node).name;
      causeElem.href = '#';
      causeElem.addEventListener('click', () => {
        zoomToNode(sim, (cause.source as Node).id);
      });
      causeElem.classList.add('details-row', 'indent');
      this.details.appendChild(causeElem);
      this.details.appendChild(document.createElement('br'));
    }

    const effectsElem = document.createElement('p');
    effectsElem.textContent = 'Effects:';
    effectsElem.classList.add('details-row');
    this.details.appendChild(effectsElem);

    for (const effect of this.sortEffects(effects)) {
      const effectElem = document.createElement('a');
      effectElem.textContent = (effect.target as Node).name;
      effectElem.href = '#';
      effectElem.addEventListener('click', () => {
        zoomToNode(sim, (effect.target as Node).id);
      });
      effectElem.classList.add('details-row', 'indent');
      this.details.appendChild(effectElem);
      this.details.appendChild(document.createElement('br'));
    }
  }

  private initElements() {
    this.bottomButton.addEventListener('click', () => {
      this.bottombar.toggleVisible();
    });
  }

  private sortCauses(links: Link[]) {
    return links.sort(
        (a, b) =>
            (a.source as Node).name.localeCompare((b.source as Node).name));
  }

  private sortEffects(links: Link[]) {
    return links.sort(
        (a, b) =>
            (a.target as Node).name.localeCompare((b.target as Node).name));
  }
}
