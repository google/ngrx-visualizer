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

/** Buttons that affect the simulation */

import * as Fuse from 'fuse-js-latest';

import {Node, NodeType} from '../common/types';
import {setGraphJSON, zoomToNode} from './actions';
import {onVisibilityChange} from './events';
import {updateD3EngineAndReset, updateD3SimData} from './internal';
import {cacheAndLoadGraph} from './params';
import {Simulation} from './simulation';

/** Recreates the visibility sidebar DOM */
export function initVisibility(sim: Simulation) {
  const tree: any = {};

  for (const node of sim.originalGraph.nodes) {
    if (node.type === NodeType.ACTION) {
      const path = node.filePath.split('/');
      let cur = tree;
      for (const elem of path) {
        cur[elem] = cur[elem] || {};
        cur = cur[elem];
      }
      cur[node.id] = node.id;
    }
  }

  sim.ui.visibility.setContent(tree, sim.originalGraph);
  sim.ui.visibility.onChange.on(v => onVisibilityChange(sim, v));
}

/** Binds search sidebar events. */
export function initSearch(sim: Simulation) {
  sim.ui.search.onClickResult.on(id => {
    zoomToNode(sim, id);
  });

  sim.ui.search.onSearch.on(text => {
    const optionsFuse = {
      distance: 100,
      keys: ['name'],
      location: 0,
      maxPatternLength: 32,
      minMatchCharLength: 1,
      shouldSort: true,
      threshold: 0.6
    };
    const fuse = new Fuse(sim.graph.getVisibleNodes(), optionsFuse);
    const results = fuse.search<Node>(text);
    sim.ui.search.setResults(results);
  });
}

/** Binds the ease button to spread out the graph when held down */
export function initEaseButton(sim: Simulation) {
  sim.ui.sidebar.easeButton.addEventListener('mousedown', () => {
    sim.d3sim.alphaTarget(1).restart();
  });

  sim.ui.sidebar.easeButton.addEventListener('mouseup', () => {
    sim.d3sim.alphaTarget(0);
  });
}

/** Binds the refresh button to reload the graph when clicked. */
export function initRefreshButton(sim: Simulation) {
  sim.ui.sidebar.refreshButton.addEventListener('click', () => {
    if (sim.options.loadParam) {
      // If we are using a loaded graph, redownload it.
      sim.ui.loading.setVisible(true);
      cacheAndLoadGraph(sim);
    } else {
      // If we are in a locally loaded graph, just reposition.
      updateD3SimData(sim);
      updateD3EngineAndReset(sim);
    }
  });
}

/** Binds the open file button to set the graph to a local file */
export function initOpenFileButton(sim: Simulation) {
  sim.ui.sidebar.onFile.on(fileList => {
    if (fileList.length === 1) {
      const file = fileList[0];
      const reader = new FileReader();
      reader.onload = e => {
        const data = (e.target as any).result;
        sim.options.loadParam = undefined;
        setGraphJSON(sim, data);
      };
      reader.readAsText(file);
    }
  });
}

/** Binds the copy button to copy the current URL to clipboard */
export function initCopyButton(sim: Simulation) {
  sim.ui.sidebar.copyButton.addEventListener('click', () => {
    sim.ui.copyTextToClipboard(window.location.toString());
  });
}
