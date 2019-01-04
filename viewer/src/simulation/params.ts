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

/** Parameters that affect the simulation */

import {CachedGraph} from '../common/types';
import {getData, storeData} from '../ui/utils';
import {loadStatus, setGraphJSON} from './actions';
import {restoreNodePositions, updateD3EngineAndReset} from './internal';
import {Simulation} from './simulation';

/** Downloads a graph, loads it, then stores it in localStorage */
export function cacheAndLoadGraph(sim: Simulation) {
  loadStatus(sim, `Downloading graph: ${sim.options.loadParam}`);
  const dataKey = `CachedGraph: ${sim.options.loadParam}`;
  const request = new XMLHttpRequest();
  request.onload = () => {
    if (request.status === 200) {
      loadStatus(sim, `Loading graph: ${sim.options.loadParam}`);
      setGraphJSON(sim, request.response);
      initShowParam(sim);
      updateD3EngineAndReset(sim, false, true);
      if (sim.options.cacheParam !== undefined &&
          sim.options.cacheParam !== 0) {
        storeData(
            dataKey, {
              display: `${sim.ui.settings.displayModeSelect.value}`,
              graph: sim.graph,
              json: request.response
            },
            sim.options.cacheParam);
      }
    } else {
      loadStatus(sim, `Failed to download: ${sim.options.loadParam}`);
    }
  };
  request.open('GET', sim.options.loadParam);
  request.send();
}

/**
 * Downloads a graph if load parameter is set, loads it, and caches the result
 */
export function initLoadParam(sim: Simulation): boolean {
  if (!sim.options.loadParam) {
    return false;
  }

  const dataKey = `CachedGraph: ${sim.options.loadParam}`;
  const cachedGraph = getData(dataKey) as CachedGraph;
  if (sim.options.cacheParam !== undefined && sim.options.cacheParam !== 0 &&
      cachedGraph && cachedGraph.json && cachedGraph.graph &&
      cachedGraph.display) {
    try {
      loadStatus(sim, `Loading cache: ${sim.options.loadParam}`);
      sim.ui.settings.displayModeSelect.value = cachedGraph.display;
      setGraphJSON(sim, cachedGraph.json, false, false);
      initShowParam(sim);
      restoreNodePositions(sim, cachedGraph.graph);
      updateD3EngineAndReset(sim, false, true);
    } catch (e) {
      // If fail to parse graph fallback to caching it
      cacheAndLoadGraph(sim);
      return false;
    }
    return true;
  }

  cacheAndLoadGraph(sim);
  return false;
}

/** Shows only paths set by the show parameter */
export function initShowParam(sim: Simulation) {
  if (!sim.options.showParam) {
    return;
  }

  sim.ui.visibility.hideAll();
  for (const path of sim.options.showParam) {
    sim.ui.visibility.showPath(path);
  }
}
