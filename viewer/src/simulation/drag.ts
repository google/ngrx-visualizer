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

/** Node dragging events */

import * as d3 from 'd3';
import {LinkStatus, Node} from '../common/types';
import {updateD3SimData} from './internal';
import {Simulation} from './simulation';

/** When a node is dragged, update link colors and load node details */
export function dragStart(sim: Simulation, d: Node) {
  if (!d3.event.active) {
    sim.d3sim.alphaTarget(0.3).restart();
  }
  d.fx = d.x;
  d.fy = d.y;
  for (const link of sim.graph.links) {
    link.status = LinkStatus.DISABLED;
  }
  for (const link of sim.graph.links) {
    if (link.source === d) {
      link.status = LinkStatus.ACTIVE_INPUT;
    }
    if (link.target === d) {
      link.status = LinkStatus.ACTIVE_OUTPUT;
    }
  }

  updateD3SimData(sim);
  sim.ui.details.loadDetails(
      sim, d, sim.graph,
      sim.ui.settings.displayModeSelect.value === 'splitreducers',
      sim.originalGraph);
  sim.ui.bottombar.setVisible(true);
}

/** When a node is still dragged, continue moving it */
export function dragContinue(sim: Simulation, d: Node) {
  d.fx = d3.event.x;
  d.fy = d3.event.y;
}

/** When a node is finished being dragged, stop moving it */
export function dragEnd(sim: Simulation, d: Node) {
  if (!d3.event.active) {
    sim.d3sim.alphaTarget(0);
  }
  d.fx = null;
  d.fy = null;
}
