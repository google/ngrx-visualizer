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

/** Internal d3 handling */

import * as d3 from 'd3';
import {Graph, Link, LinkStatus, Node} from '../common/types';
import {zoomToGraph} from './actions';
import {dragContinue, dragEnd, dragStart} from './drag';
import {Simulation} from './simulation';

/** Starts the simulation as a d3 forceSimulation */
export function initSimulation(sim: Simulation) {
  sim.d3sim =
      d3.forceSimulation<Node, Link>().nodes(sim.graph.getVisibleNodes());

  sim.linkForce = d3.forceLink<Node, Link>(sim.graph.getVisibleLinks())
                      .id(d => {
                        return d.id;
                      })
                      .distance(200);

  sim.chargeForce = d3.forceManyBody<Node>().distanceMax(700).strength(-100);

  sim.d3sim.force('chargeForce', sim.chargeForce)
      .force('linkForce', sim.linkForce);

  sim.d3sim.on('tick', () => tickActions(sim));
}

/** When zoom events occur on the SVG */
export function zoomActions(sim: Simulation) {
  sim.globalSVGContainer.attr('transform', d3.event.transform);
}

/** Starts SVG handlers such as drag, zoom, and click */
export function initHandlers(sim: Simulation) {
  sim.dragHandler = d3.drag<SVGCircleElement, Node>()
                        .on('start', d => dragStart(sim, d))
                        .on('drag', d => dragContinue(sim, d))
                        .on('end', d => dragEnd(sim, d));
  sim.node.call(sim.dragHandler);

  sim.zoomHandler = d3.zoom().on('zoom', () => zoomActions(sim));
  sim.svg.call(sim.zoomHandler);
  // Needed for centering to be consistent, because svg doesn't have defined
  // width / height (css 100%)
  sim.zoomHandler.extent([[0, 0], [window.innerWidth, window.innerHeight]]);

  sim.svg.on('click', () => {
    for (const node of sim.graph.getVisibleNodes()) {
      sim.ui.document.getElementById(node.id).style.opacity = '1';
    }
    for (const link of sim.graph.links) {
      link.status = LinkStatus.DISABLED;
    }
    updateD3SimData(sim);
    sim.ui.bottombar.setVisible(false);
  });
}

/** Restores node positions from an existing graph */
export function restoreNodePositions(sim: Simulation, graph: Graph) {
  for (const node of graph.nodes) {
    const simNode = sim.graph.getNodeFromID(node.id);
    if (simNode) {
      simNode.x = node.x;
      simNode.y = node.y;
    }
  }
}

/** Creates SVG elements for the simulation */
export function initSVG(sim: Simulation) {
  sim.svg = d3.select<SVGElement, {}>('#canvas');

  sim.globalSVGContainer =
      sim.svg.append<SVGGElement>('g').attr('class', 'everything');

  sim.link = sim.globalSVGContainer.append<SVGGElement>('g')
                 .attr('class', 'links')
                 .selectAll<SVGLineElement, Link>('line');

  sim.node = sim.globalSVGContainer.append<SVGGElement>('g')
                 .attr('class', 'nodes')
                 .selectAll<SVGCircleElement, Node>('circle');

  sim.rect = sim.globalSVGContainer.append<SVGGElement>('g')
                 .attr('class', 'labelrects')
                 .selectAll<SVGRectElement, Node>('rect');

  sim.label = sim.globalSVGContainer.append<SVGGElement>('g')
                  .attr('class', 'labels')
                  .selectAll<SVGTextElement, Node>('text');
}

/** Sets d3 data to the current graph's data */
export function updateD3Engine(sim: Simulation) {
  sim.d3sim.nodes(sim.graph.getVisibleNodes());
  sim.linkForce.links(sim.graph.getVisibleLinks());
}

/**
 * Sets d3 data to the current graph's data, repositions nodes, and zooms to
 * show graph
 */
export function updateD3EngineAndReset(
    sim: Simulation, reposition = true, zoom = true) {
  // Makes d3 reposition the nodes in phyllotaxis arrangement
  if (reposition) {
    for (const n of sim.graph.nodes) {
      n.x = NaN;
      n.y = NaN;
    }
  }
  sim.d3sim.nodes(sim.graph.getVisibleNodes());
  sim.linkForce.links(sim.graph.getVisibleLinks());

  const ticks = reposition ? 400 : 1;
  sim.d3sim.alphaTarget(1).restart();
  for (let i = 0; i < ticks; i++) {
    sim.d3sim.tick();
  }
  sim.d3sim.alphaTarget(0);

  if (zoom) {
    zoomToGraph(sim);
  }
}

/** Handles d3 elements exiting and entering */
export function updateD3SimData(sim: Simulation) {
  sim.link = sim.link.data(sim.graph.getVisibleLinks());
  sim.link.exit().remove();
  sim.link =
      sim.link.enter()
          .append<SVGLineElement>('line')
          .attr('marker-end', 'url(#arrowhead)')
          .merge(sim.link)
          .attr(
              'class',
              d => `link-status-${
                  LinkStatus[d.status].toLowerCase().replace('_', '-')}`);

  sim.node = sim.node.data(sim.graph.getVisibleNodes());
  sim.node.exit().remove();
  sim.node = sim.node.enter()
                 .append<SVGCircleElement>('circle')
                 .on('click',
                     () => {
                       d3.event.stopPropagation();
                     })
                 .call(sim.dragHandler || (() => undefined))
                 .merge(sim.node)
                 .attr('r', sim.options.radius)
                 .attr('fill', d => sim.ui.nodeColor(d))
                 .attr('id', d => d.id);

  sim.rect = sim.rect.data(sim.graph.getVisibleNodes());
  sim.rect.exit().remove();
  sim.rect = sim.rect.enter().append<SVGRectElement>('rect').merge(sim.rect);

  sim.label = sim.label.data(sim.graph.getVisibleNodes());
  sim.label.exit().remove();
  sim.label = sim.label.enter()
                  .append<SVGTextElement>('text')
                  .merge(sim.label)
                  .text(d => d.name)
                  .attr('class', 'noselect node-label');
}

/** Gets the boundary box of a SVG text element */
export function getBB(
    selection: d3.Selection<SVGTextElement, Node, SVGGElement, {}>) {
  selection.each((d, i, j) => {
    d.bbox = j[i].getBBox();
  });
}

/** D3 tick handler, used to move SVG elements */
export function tickActions(sim: Simulation) {
  sim.node
      .attr(
          'cx',
          d => {
            return d.x;
          })
      .attr('cy', d => {
        return d.y;
      });

  sim.link
      .attr(
          'x1',
          d => {
            return (d.source as Node).x;
          })
      .attr(
          'y1',
          d => {
            return (d.source as Node).y;
          })
      .attr(
          'x2',
          d => {
            return (d.target as Node).x;
          })
      .attr('y2', d => {
        return (d.target as Node).y;
      });

  sim.label
      .attr(
          'x',
          d => {
            return d.x;
          })
      .attr(
          'y',
          d => {
            return d.y - 18;
          })
      .call(getBB);

  sim.rect
      .attr(
          'width',
          d => {
            return d.bbox.width;
          })
      .attr(
          'height',
          d => {
            return d.bbox.height;
          })
      .attr(
          'x',
          d => {
            return d.bbox.x;
          })
      .attr('y', d => {
        return d.bbox.y;
      });
}
