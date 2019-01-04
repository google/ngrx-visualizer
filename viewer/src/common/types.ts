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

/** Describes shared types */

import {SimulationLinkDatum, SimulationNodeDatum} from 'd3';

/** Describes the function of the node */
export enum NodeType {
  UNKNOWN = 'UNKNOWN',
  ACTION = 'ACTION',
  EFFECT = 'EFFECT',
  METHOD = 'METHOD',
  REDUCER = 'REDUCER'
}

/**
 * Links can be disabled, inputs, or outputs.
 * Links should be disabled until a node is clicked on.
 */
export enum LinkStatus {
  DISABLED,
  ACTIVE_INPUT,
  ACTIVE_OUTPUT
}

/**
 * Nodes extend d3's SimulationNodeDatum, and provide additional information
 * such as name, path, etc
 */
export interface Node extends SimulationNodeDatum {
  id: string;
  name: string;
  type: NodeType;
  filePath: string;
  line: number;
  bbox?: SVGRect;
  hidden?: boolean;
  reducer?: string;
}

/**
 * Links extend d3's SimulationLinkDatum, and provide additional information
 * such as path, line, etc
 */
export interface Link extends SimulationLinkDatum<Node> {
  filePath?: string;
  line?: number;
  status: LinkStatus;
}

/** A graph is the basic structure d3 will accept */
export interface Graph {
  nodes: Node[];
  links: Link[];
}

/** Describes how a reference to an action is being used */
export enum UsageType {
  UNKNOWN = 'UNKNOWN',
  INSTANTIATE = 'INSTANTIATE',
  EFFECT = 'EFFECT',
  METHOD = 'METHOD',
  REDUCER = 'REDUCER',
  CONSTRUCTOR = 'CONSTRUCTOR'
}

/** Exported usage of a reference */
export interface UsageExport {
  type: UsageType;
}

/** Exported usage with a derived name */
export interface NamedUsageExport extends UsageExport {
  name: string;
}

/** Exported reference to an action */
export interface ReferenceExport {
  filePath: string;
  line: number;
  usages: UsageExport[];
}

/** Exported action from the analyzer */
export interface ActionExport {
  name: string;
  filePath: string;
  line: number;
  references: ReferenceExport[];
}

/** Cache of the graph */
export interface CachedGraph {
  /** What mode the graph should be loaded in (split reducers, reducers, etc) */
  display: string;
  /** Original data */
  json: string;
  /**
   * The processed d3 graph, used to restore node positions (to avoid
   * processing again)
   */
  graph: Graph;
}
