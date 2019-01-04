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

/** General actions the simulation does */

import * as AnalysisDecoder from '../analysis_decoder';

import {Node} from '../common/types';
import {NgrxGraph} from '../ngrx_graph';
import {initVisibility} from './buttons';
import {updateD3EngineAndReset, updateD3SimData} from './internal';
import {updateGraphDisplayMode} from './settings';
import {Simulation} from './simulation';

/** Set status text on the loading dialog */
export function loadStatus(sim: Simulation, text: string) {
  sim.ui.loading.setStatusText(text);
}

/**
 * Used to set the current graph.
 *
 * @param json The JSON input data.
 * @param repsoition Whether to resimulate the nodes and spread them out
 *     (expensive).
 */
export function setGraphJSON(
    sim: Simulation, json: string, reposition = true, zoom = true) {
  const data = AnalysisDecoder.decodeJSON(json, sim.options.reducerLengthParam);
  sim.originalGraph = NgrxGraph.fromGraph(data);
  sim.graphSplitReducers = sim.originalGraph.withSplitReducers();
  sim.graphNoReducers = sim.originalGraph.withoutReducers();
  sim.graph = sim.graphSplitReducers;
  updateGraphDisplayMode(sim);
  initVisibility(sim);
  updateD3SimData(sim);
  updateD3EngineAndReset(sim, reposition, zoom);
  sim.ui.loading.setVisible(false);
}

/** Zoom graph to a specific node */
export function zoomToNode(sim: Simulation, id: string) {
  const node = sim.graph.getNodeFromID(id);
  sim.svg.transition().duration(1000).call(
      sim.zoomHandler.translateTo, node.x, node.y);
}

/**
 * Zooms out the view to show most of the loaded graph.
 * If translate or scale parameters are given it will use those instead.
 */
export function zoomToGraph(sim: Simulation) {
  if (sim.graph.getVisibleNodes().length === 0) {
    return;
  }
  let minX = 0;
  let maxX = 0;
  let minY = 0;
  let maxY = 0;

  const nodeHasLinks: {[key: string]: boolean} = {};

  for (const link of sim.graph.links) {
    nodeHasLinks[(link.source as Node).id] = true;
    nodeHasLinks[(link.target as Node).id] = true;
  }

  for (const node of sim.graph.getVisibleNodes()) {
    if (nodeHasLinks[node.id]) {
      minX = Math.min(node.x, minX);
      minY = Math.min(node.y, minY);
      maxX = Math.max(node.x, maxX);
      maxY = Math.max(node.y, maxY);
    }
  }
  let translateX = (minX + maxX) / 2;
  let translateY = (minY + maxY) / 2;
  let scale = 1000 / (maxX - minX);
  if (sim.options.translateParam !== undefined) {
    translateX = sim.options.translateParam[0];
    translateY = sim.options.translateParam[1];
  }
  if (sim.options.scaleParam !== undefined) {
    scale = sim.options.scaleParam;
  }
  if (!isNaN(translateX) && !isNaN(translateY) && !isNaN(scale) &&
      scale !== Infinity) {
    sim.svg.call(sim.zoomHandler.translateTo, translateX, translateY);
    sim.svg.call(sim.zoomHandler.scaleTo, scale);
  }
}
