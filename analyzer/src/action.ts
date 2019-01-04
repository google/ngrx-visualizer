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

import {ActionExport} from './common/types';
import * as utils from './common/typescript_utils';
import {formatPath, getArgs} from './common/utils';
import {Reference} from './reference';

/** Holds references to an action */
export class Action {
  references: Reference[] = [];

  constructor(
      readonly classDeclaration: NodeWrap, readonly identifier: NodeWrap,
      readonly sourceFile: ts.SourceFile, readonly program: ts.Program) {}

  toString() {
    return `Action::${formatPath(this.sourceFile.fileName)}::${
        utils.getTypeAsText(this.identifier, this.program)
            .replace('"', '')
            .replace('"', '')}`;
  }

  getName(): string {
    return utils.getTypeAsText(this.identifier, this.program)
        .replace('"', '')
        .replace('"', '');
  }

  /** An exported version of this action */
  export(): ActionExport {
    return {
      name: this.getName(),
      filePath: formatPath(this.sourceFile.fileName),
      line: this.sourceFile
                .getLineAndCharacterOfPosition(
                    this.classDeclaration.node.getStart())
                .line,
      references: this.references.map(r => r.export())
                      .filter(r => r.usages.length !== 0 || getArgs().emptyRef)
    };
  }
}
