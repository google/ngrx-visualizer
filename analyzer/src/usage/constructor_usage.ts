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

import {Usage} from './usage';

/** Description of a node inside a constructor */
export class ConstructorUsage extends Usage {
  type = UsageType.CONSTRUCTOR;

  constructor(node: NodeWrap, sourceFile: ts.SourceFile) {
    super(node, sourceFile);
  }

  toString(): string {
    return `Method::${this.toName()}`;
  }

  toName(): string {
    const classDeclaration =
        utils.getFirstAncestorByKind(this.node, SyntaxKind.ClassDeclaration);

    if (!classDeclaration) {
      return 'Unknown';
    }

    const className = (classDeclaration.node as ts.ClassDeclaration).name;

    if (!className) {
      return 'Unknown';
    }

    return className.getText(this.sourceFile);
  }

  export(): NamedUsageExport {
    return {...super.export(), name: this.toName()};
  }

  static matches(node: NodeWrap): boolean {
    return !!ConstructorUsage.getConstructor(node);
  }

  private static getConstructor(node: NodeWrap): NodeWrap|undefined {
    return utils.getFirstAncestorByKind(node, SyntaxKind.Constructor);
  }
}
