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

/** Renders NgRx analysis results as a graph */

import * as d3 from 'd3';
import {Link, Node} from '../common/types';
import {NgrxGraph} from '../ngrx_graph';
import {UI} from '../ui/ui';
import {loadStatus} from './actions';
import {initCopyButton, initEaseButton, initOpenFileButton, initRefreshButton, initSearch} from './buttons';
import {initHandlers, initSimulation, initSVG, updateD3EngineAndReset, updateD3SimData} from './internal';
import {initLoadParam} from './params';
import {initDisplayModeSetting, initGraphicsSetting, initStyleSetting, loadSettings} from './settings';

/** Input settings for the simulation */
export interface SimulationOptions {
  width: number;
  height: number;
  radius: number;
  showParam?: string[];
  loadParam?: string;
  scaleParam?: number;
  translateParam?: number[];
  reducerLengthParam: number;
  cacheParam: number;
}

/** An interactive graph of usages of actions in an NgRx application */
export class Simulation {
  originalGraph: NgrxGraph;
  graphSplitReducers: NgrxGraph;
  graphNoReducers: NgrxGraph;
  graph: NgrxGraph;

  d3sim: d3.Simulation<Node, Link>;

  link: d3.Selection<SVGLineElement, Link, SVGGElement, {}>;
  node: d3.Selection<SVGCircleElement, Node, SVGGElement, {}>;
  rect: d3.Selection<SVGRectElement, Node, SVGGElement, {}>;
  label: d3.Selection<SVGTextElement, Node, SVGGElement, {}>;

  svg: d3.Selection<SVGElement, {}, HTMLElement, {}>;
  globalSVGContainer: d3.Selection<SVGGElement, {}, HTMLElement, {}>;

  linkForce: d3.ForceLink<Node, Link>;
  chargeForce: d3.ForceManyBody<Node>;

  zoomHandler: d3.ZoomBehavior<Element, {}>;
  dragHandler: d3.DragBehavior<SVGCircleElement, Node, d3.SubjectPosition|Node>;

  constructor(readonly options: SimulationOptions, readonly ui: UI) {
    loadStatus(this, 'Starting simulation');
    this.graph = NgrxGraph.empty();

    initSimulation(this);
    initSVG(this);
    updateD3SimData(this);
    updateD3EngineAndReset(this);

    initHandlers(this);
    initEaseButton(this);
    initRefreshButton(this);
    initOpenFileButton(this);
    initCopyButton(this);

    initDisplayModeSetting(this);
    initStyleSetting(this);
    initGraphicsSetting(this);
    loadSettings(this);

    initSearch(this);

    loadStatus(this, 'Loading graph');
    initLoadParam(this);
    if (!this.options.loadParam) {
      this.ui.loading.setVisible(false);
    }
  }
}
