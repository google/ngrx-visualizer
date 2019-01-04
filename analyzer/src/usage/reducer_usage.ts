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

/** Description of a node inside an ngrx reducer */
export class ReducerUsage extends Usage {
  type = UsageType.REDUCER;

  constructor(node: NodeWrap, sourceFile: ts.SourceFile) {
    super(node, sourceFile);
  }

  toString(): string {
    return `Reducer::${formatPath(this.sourceFile.fileName)}`;
  }

  static matches(node: NodeWrap, sourceFile: ts.SourceFile): boolean {
    return ReducerUsage.isWithinReducer(node, sourceFile);
  }

  private static isWithinReducer(node: NodeWrap, sourceFile: ts.SourceFile):
      boolean {
    let highestBlock = utils.getParentWhile(
        node, p => p.kind === SyntaxKind.PropertyAccessExpression);

    if (highestBlock === undefined) {
      highestBlock = node;
    }

    const switchChild = utils.getParentWhile(
        highestBlock, p => p.kind !== SyntaxKind.SwitchStatement);

    if (!switchChild || !switchChild.parent) {
      return false;
    }

    const switchStatement = switchChild.parent;

    const identifierChildren =
        utils.getChildrenOfKind(switchStatement, SyntaxKind.Identifier);
    const parameterAccessChildren = utils.getChildrenOfKind(
        switchChild.parent, SyntaxKind.PropertyAccessExpression);

    // In reducer if there is some child in the switch related to type
    const directChild = identifierChildren.length > 0 &&
        identifierChildren.some(
            c => c.node.getText(sourceFile).indexOf('type') !== -1);

    const parameterChild = parameterAccessChildren.length > 0 &&
        parameterAccessChildren.some(
            c => utils.getDescendantsOfKind(c, SyntaxKind.Identifier)
                     .some(
                         i => i.node.getText(sourceFile).indexOf('type') !==
                             -1));
    return directChild || parameterChild;
  }
}
