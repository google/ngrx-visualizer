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

/** Description of a node inside a method */
export class MethodUsage extends Usage {
  type = UsageType.METHOD;

  constructor(node: NodeWrap, sourceFile: ts.SourceFile) {
    super(node, sourceFile);
  }

  toString(): string {
    return `Method::${formatPath(this.sourceFile.fileName)}::${this.toName()}`;
  }

  toName(): string {
    const declaration = MethodUsage.getMethodDeclaration(this.node);

    if (!declaration) {
      return 'Unknown';
    }

    const declarationName = (declaration.node as ts.MethodDeclaration).name;

    if (!declarationName) {
      return 'Unknown';
    }

    return declarationName.getText(this.sourceFile);
  }

  export(): NamedUsageExport {
    return {...super.export(), name: this.toName()};
  }

  static matches(node: NodeWrap): boolean {
    return !!MethodUsage.getMethodDeclaration(node);
  }

  private static getMethodDeclaration(node: NodeWrap): NodeWrap|undefined {
    return utils.getFirstAncestorByKind(node, SyntaxKind.MethodDeclaration);
  }
}
