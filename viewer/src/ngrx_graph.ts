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

import {Graph, Link, Node, NodeType} from './common/types';

/**
 * Wrapper for a graph with NgRx related operations.
 */
export class NgrxGraph implements Graph {
  /** Generate from JSON */
  static fromJSON(jsonInput: string): NgrxGraph {
    const parsed = JSON.parse(jsonInput);
    if (parsed.nodes == null) {
      throw new Error('Missing nodes');
    }
    if (parsed.links == null) {
      throw new Error('Missing links');
    }
    return NgrxGraph.fromData(parsed.nodes, parsed.links);
  }

  /** Generate from a Graph object */
  static fromGraph(graphInput: Graph): NgrxGraph {
    return NgrxGraph.fromData(graphInput.nodes, graphInput.links);
  }

  /** Generate from data */
  static fromData(nodes: Node[], links: Link[]) {
    return new NgrxGraph(nodes, links);
  }

  /** An empty graph */
  static empty() {
    return new NgrxGraph([], []);
  }

  private idToNode: {[key: string]: Node} = {};

  protected constructor(public nodes: Node[], public links: Link[]) {
    for (const node of nodes) {
      this.idToNode[node.id] = node;
    }
  }

  /** One level deep clone of graph */
  clone(): NgrxGraph {
    const clonedNodes: Node[] = [];
    for (const node of this.nodes) {
      clonedNodes.push({...node});
    }
    const clonedLinks: Link[] = [];
    for (const link of this.links) {
      clonedLinks.push({...link});
    }
    return NgrxGraph.fromData(clonedNodes, clonedLinks);
  }

  /** Graph with nodes marked as REDUCER removed */
  withoutReducers(): NgrxGraph {
    const noReducers = this.clone();
    noReducers.nodes =
        noReducers.nodes.filter(n => n.type !== NodeType.REDUCER);
    noReducers.links = noReducers.links.filter(
        l => noReducers.nodes.some(n => n.id === l.source) &&
            noReducers.nodes.some(n => n.id === l.target));
    return noReducers;
  }

  /**
   * Graph with reducers removed, and actions pointing to reducers becoming
   * reducers
   */
  withSplitReducers(): NgrxGraph {
    const splitReducers = this.clone();
    const reducers: {[key: string]: boolean} = {};
    splitReducers.nodes.forEach(n => {
      if (n.type === NodeType.REDUCER) {
        reducers[n.id] = true;
      }
    });
    splitReducers.nodes =
        splitReducers.nodes.filter(n => n.type !== NodeType.REDUCER).map(n => {
          if (n.type === NodeType.ACTION &&
              splitReducers.links.some(
                  l => l.source === n.id && reducers[l.target as string])) {
            n.type = NodeType.REDUCER;
            n.reducer = splitReducers.links
                            .filter(
                                l => l.source === n.id &&
                                    reducers[l.target as string])[0]
                            .target.toString();
          }
          return n;
        });
    splitReducers.links = splitReducers.links.filter(
        l => splitReducers.nodes.some(n => n.id === l.source) &&
            splitReducers.nodes.some(n => n.id === l.target));
    return splitReducers;
  }

  /** Returns node from node id */
  getNodeFromID(id: string): Node {
    return this.idToNode[id];
  }

  /** Returns visible nodes */
  getVisibleNodes(): Node[] {
    return this.nodes.filter(n => !n.hidden);
  }

  /** Returns visible links (source and target visible) */
  getVisibleLinks(): Link[] {
    // Workaround because links source / target are converted to nodes later
    // Initially they are strings
    return this.links.filter(l => {
      const sourceHidden = (l.source as Node).hidden ||
          (this.idToNode[l.source.toString()] &&
           this.idToNode[l.source.toString()].hidden);
      const targetHidden = (l.target as Node).hidden ||
          (this.idToNode[l.target.toString()] &&
           this.idToNode[l.target.toString()].hidden);
      return !sourceHidden && !targetHidden;
    });
  }
}
