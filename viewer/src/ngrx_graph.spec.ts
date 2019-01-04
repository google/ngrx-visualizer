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

import 'jasmine';
import {LinkStatus, NodeType} from './common/types';
import {NgrxGraph} from './ngrx_graph';

const sampleGraph = {
  links: [
    {
      filePath: 'path/1',
      line: 1,
      source: 'id/1',
      status: LinkStatus.DISABLED,
      target: 'id/3'
    },
    {
      filePath: 'path/1',
      line: 1,
      source: 'id/2',
      status: LinkStatus.DISABLED,
      target: 'id/3'
    },
    {
      filePath: 'path/1',
      line: 1,
      source: 'id/4',
      status: LinkStatus.DISABLED,
      target: 'id/1'
    }
  ],
  nodes: [
    {
      filePath: 'path/1',
      id: 'id/1',
      line: 1,
      name: 'name/1',
      type: NodeType.ACTION
    },
    {
      filePath: 'path/2',
      id: 'id/2',
      line: 2,
      name: 'name/2',
      type: NodeType.ACTION
    },
    {
      filePath: 'path/2',
      id: 'id/5',
      line: 2,
      name: 'name/5',
      type: NodeType.ACTION
    },
    {
      filePath: 'path/3',
      id: 'id/3',
      line: 3,
      name: 'name/3',
      type: NodeType.REDUCER
    },
    {
      filePath: 'path/1',
      id: 'id/4',
      line: 1,
      name: 'name/1',
      type: NodeType.EFFECT
    }
  ]
};

let sampleParsed: NgrxGraph;
beforeEach(() => {
  sampleParsed = NgrxGraph.fromJSON(JSON.stringify(sampleGraph));
});

describe('Graph parsing ', () => {
  it('should work from json', () => {
    const res = NgrxGraph.fromJSON(JSON.stringify(sampleGraph));
    expect(res.nodes.length).toBe(5);
    expect(res.links.length).toBe(3);
  });

  it('should work from graph', () => {
    const res = NgrxGraph.fromGraph(sampleGraph);
    expect(res.nodes.length).toBe(5);
    expect(res.links.length).toBe(3);
  });

  it('should work from data', () => {
    const res = NgrxGraph.fromData(sampleGraph.nodes, sampleGraph.links);
    expect(res.nodes.length).toBe(5);
    expect(res.links.length).toBe(3);
  });
});

describe('Graph operations ', () => {
  it('should clone fully', () => {
    const cloned = sampleParsed.clone();
    sampleParsed.nodes.pop().id = 'a';
    sampleParsed.links.pop().source = 'e';
    expect(sampleParsed.nodes.length).toBe(4);
    expect(sampleParsed.links.length).toBe(2);
    expect(cloned.nodes.length).toBe(5);
    expect(cloned.links.length).toBe(3);
    expect(cloned.nodes[cloned.nodes.length - 1].id).toBe('id/4');
    expect(cloned.links[cloned.links.length - 1].source).toBe('id/4');
  });

  it('should remove reducers', () => {
    const res = sampleParsed.withoutReducers();
    expect(res.nodes.every(n => n.type !== NodeType.REDUCER)).toBe(true);
  });

  it('should split reducers', () => {
    const res = sampleParsed.withSplitReducers();
    for (const node of res.nodes) {
      if (node.type === NodeType.REDUCER) {
        // Expect the new reducer nodes to come from actions
        expect(sampleParsed.getNodeFromID(node.id).type).toBe(NodeType.ACTION);
        // Expect new reducer nodes to have pointed to a link
        expect(sampleParsed.links.some(
                   l => l.source === node.id &&
                       sampleParsed.getNodeFromID(l.target as string).type ===
                           NodeType.REDUCER))
            .toBe(true);
      }
    }
  });

  it('should get node from id', () => {
    expect(sampleParsed.getNodeFromID('id/1')).toBe(sampleParsed.nodes[0]);
  });

  it('should get visible nodes', () => {
    sampleParsed.nodes[0].hidden = true;
    const visible = sampleParsed.getVisibleNodes();
    expect(sampleParsed.nodes.length).toBe(5);
    expect(visible.length).toBe(4);
  });
});
