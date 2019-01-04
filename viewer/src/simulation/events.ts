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

/** Events that affect the simulation */

import {Node, NodeType} from '../common/types';
import {updateD3Engine, updateD3SimData} from './internal';
import {Simulation} from './simulation';

/** When visibility checkboxes are changed, update the visible nodes */
export function onVisibilityChange(sim: Simulation, visibility: any) {
  /*
  Turn on all non-action nodes (any node that is not ACTION or REDUCER)
  Set all nodes that are actions to their visibility input
  Create a new mapping for the result visibilities
  For every link, if source and target are visibile, set it to visible in the
  new mapping Set all nodes visibilites to the result visibility
  */
  const hiddenMap: {[key: string]: boolean} = {};
  for (const node of sim.graph.nodes) {
    hiddenMap[node.id] = true;
    if (node.type !== NodeType.ACTION && node.type !== NodeType.REDUCER) {
      node.hidden = false;
    } else {
      node.hidden =
          visibility[node.id] === undefined ? false : !visibility[node.id];
      hiddenMap[node.id] = !visibility[node.id];
    }
  }

  for (const link of sim.graph.links) {
    if (!(link.source as Node).hidden && !(link.target as Node).hidden) {
      hiddenMap[(link.source as Node).id] = false;
      hiddenMap[(link.target as Node).id] = false;
    }
  }

  for (const node of Object.keys(hiddenMap)) {
    sim.graph.getNodeFromID(node).hidden = hiddenMap[node];
  }

  updateD3SimData(sim);
  updateD3Engine(sim);
  sim.d3sim.alphaTarget(1).restart();
  sim.d3sim.tick();
  sim.d3sim.alphaTarget(0);
}
