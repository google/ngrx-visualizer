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

/** Decodes analyzer output into d3 graph structure */

import {ActionExport, Graph, LinkStatus, NamedUsageExport, NodeType, ReferenceExport, UsageExport, UsageType} from './common/types';

/** Convert action to unique ID */
export function actionToID(action: ActionExport): string {
  return `Action::${action.filePath}::${action.name}`;
}

/** Convert usage to unique ID */
export function usageToID(
    reference: ReferenceExport, usage: UsageExport): string {
  return `${usage.type}::${reference.filePath}`;
}

/** Convert named usage to unique ID */
export function namedUsageToID(
    reference: ReferenceExport, usage: NamedUsageExport): string {
  return `${usage.type}::${reference.filePath}::${usage.name}`;
}

/**
 * Convert usage type to node type (allows constructors to become method nodes)
 */
export function usageTypeToNodeType(type: UsageType): NodeType {
  const map: {[key: string]: NodeType} = {
    [UsageType.EFFECT]: NodeType.EFFECT,
    [UsageType.METHOD]: NodeType.METHOD,
    [UsageType.CONSTRUCTOR]: NodeType.METHOD,
    [UsageType.REDUCER]: NodeType.REDUCER,
    [UsageType.UNKNOWN]: NodeType.UNKNOWN
  };
  return map[type];
}

/**
 * Given a reference with multiple usages, decide which usage type it should be
 */
export function classifyReference(reference: ReferenceExport): UsageExport {
  const usageTypes: {[key: string]: UsageExport} = {};
  for (const usage of reference.usages) {
    usageTypes[usage.type] = usage;
  }

  const priority = [
    UsageType.REDUCER, UsageType.EFFECT, UsageType.METHOD,
    UsageType.CONSTRUCTOR, UsageType.UNKNOWN
  ];

  for (const type of priority) {
    if (Object.keys(usageTypes).indexOf(type) !== -1) {
      return usageTypes[type];
    }
  }
}

/** Type guard for NamedUsageExport */
export function isNamedUsage(usage: any): usage is NamedUsageExport {
  return usage.name !== undefined;
}

/**
 * Convert reference to unique ID by classifying its most important usage type
 */
export function referenceToID(reference: ReferenceExport): string {
  const usage = classifyReference(reference);
  if (isNamedUsage(usage)) {
    return namedUsageToID(reference, usage as NamedUsageExport);
  }
  return usageToID(reference, usage);
}

/**
 * Decodes analyzer output into a d3 graph
 *
 * @param json JSON data.
 * @param reducerLength The number of folders of the filePath to put into the
 *     reducer node name.
 */
export function decodeJSON(json: string, reducerLength: number) {
  return decode(JSON.parse(json), reducerLength);
}

/**
 * Decodes analyzer output into a d3 graph
 *
 * @param actionExports Parsed analyzer output.
 * @param reducerLength The number of folders of the filePath to put into the
 *     reducer node name.
 */
export function decode(
    actionExports: ActionExport[], reducerLength: number): Graph {
  // Filter out empty or useless results
  for (const action of actionExports) {
    action.references = action.references.filter(
        r => r.usages.length !== 0 &&
            !(r.usages.length === 1 &&
              r.usages[0].type === UsageType.INSTANTIATE));
  }

  const keyToObject: {[key: string]: ActionExport|ReferenceExport} = {};

  for (const action of actionExports) {
    keyToObject[actionToID(action)] = action;
    for (const reference of action.references) {
      keyToObject[referenceToID(reference)] = reference;
    }
  }

  const graph: Graph = {links: [], nodes: []};
  const links = graph.links;
  const nodes = graph.nodes;
  const usedNode: {[key: string]: boolean} = {};
  const usedLink: {[key: string]: boolean} = {};

  for (const action of actionExports) {
    nodes.push({
      filePath: action.filePath,
      id: actionToID(action),
      line: action.line,
      name: action.name,
      type: NodeType.ACTION
    });
    for (const reference of action.references) {
      const referenceID = referenceToID(reference);
      const classified = classifyReference(reference) as NamedUsageExport;
      let name = classified.name;
      if (classified.type === UsageType.REDUCER) {
        const split = reference.filePath.split('/');
        name = split.slice(split.length - reducerLength).join('/');
      }
      if (!usedNode[referenceID]) {
        nodes.push({
          filePath: reference.filePath,
          id: referenceID,
          line: reference.line,
          name,
          type: usageTypeToNodeType(classified.type)
        });
        usedNode[referenceID] = true;
      }
    }
  }

  for (const action of actionExports) {
    for (const reference of action.references) {
      const referenceID = referenceToID(reference);
      let link;
      if (reference.usages.some(u => u.type === UsageType.INSTANTIATE)) {
        link = {
          filePath: reference.filePath,
          line: reference.line,
          source: referenceID,
          status: LinkStatus.DISABLED,
          target: actionToID(action)
        };
      } else {
        link = {
          filePath: reference.filePath,
          line: reference.line,
          source: actionToID(action),
          status: LinkStatus.DISABLED,
          target: referenceID
        };
      }
      if (!usedLink[JSON.stringify(link)]) {
        links.push(link);
        usedLink[JSON.stringify(link)] = true;
      }
    }
  }

  return graph;
}
