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
import {NamedUsageExport} from '../common/types';
import * as utils from '../common/typescript_utils';
import {formatPath} from '../common/utils';

import {Usage} from './usage';

/** Description of a node inside an @Effect decorator */
export class EffectUsage extends Usage {
  type = UsageType.EFFECT;

  constructor(node: NodeWrap, sourceFile: ts.SourceFile) {
    super(node, sourceFile);
  }

  toString(): string {
    return `Effect::${formatPath(this.sourceFile.fileName)}::${this.toName()}`;
  }

  toName(): string {
    const identifier =
        EffectUsage.getEffectIdentifier(this.node, this.sourceFile);
    if (!identifier) {
      return 'Unknown';
    }
    return identifier.node.getText(this.sourceFile);
  }

  export(): NamedUsageExport {
    return {...super.export(), name: this.toName()};
  }

  static matches(node: NodeWrap, sourceFile: ts.SourceFile): boolean {
    return !!EffectUsage.getEffectIdentifier(node, sourceFile);
  }

  private static getEffectIdentifier(node: NodeWrap, sourceFile: ts.SourceFile):
      NodeWrap|undefined {
    // Traverse up the AST until we find the decorator
    const decoratorChild = utils.getParentWhile(
        node,
        p => utils.getDescendantsOfKind(p, SyntaxKind.Decorator).length === 0);

    if (!decoratorChild || !decoratorChild.parent) {
      return undefined;
    }

    const decorator = utils.getFirstDescendantOfKind(
        decoratorChild.parent, SyntaxKind.Decorator);

    if (!decorator || !decorator.parent ||
        decorator.node.getText(sourceFile).indexOf('@Effect(') !== 0) {
      return undefined;
    }

    const decoratorParent = decorator.parent;

    if (!decoratorParent) {
      return undefined;
    }

    // Get the first identifier of the decorator's parent
    const identifiers =
        utils.getChildrenOfKind(decoratorParent, SyntaxKind.Identifier);

    return identifiers[0];
  }
}
