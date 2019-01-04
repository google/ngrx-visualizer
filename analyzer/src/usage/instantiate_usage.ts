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

import {NodeWrap} from 'tsutils';
import * as ts from 'typescript';
import {SyntaxKind} from 'typescript';

import {UsageType} from '../common/types';
import * as utils from '../common/typescript_utils';
import {formatPath} from '../common/utils';

import {Usage} from './usage';

/** Description of a node inside a "new" statement */
export class InstantiateUsage extends Usage {
  type = UsageType.INSTANTIATE;

  constructor(node: NodeWrap, sourceFile: ts.SourceFile) {
    super(node, sourceFile);
  }

  toString(): string {
    return `Instantiate::${formatPath(this.sourceFile.fileName)}`;
  }

  static matches(node: NodeWrap, sourceFile: ts.SourceFile): boolean {
    return InstantiateUsage.isWithinInstantiation(node, sourceFile);
  }

  private static isWithinInstantiation(
      node: NodeWrap, sourceFile: ts.SourceFile): boolean {
    // Get the outermost block by going up property access expressions
    // Example: new a.b.c with node pointing to c, highestBlock = a.b.c
    let highestBlock = utils.getParentWhile(
        node, p => p.kind === SyntaxKind.PropertyAccessExpression);

    if (highestBlock === undefined) {
      highestBlock = node;
    }

    if (highestBlock.parent === undefined) {
      return false;
    }

    // Check if highest block is inside of a NewExpression
    return highestBlock.parent.kind === SyntaxKind.NewExpression;
  }
}
