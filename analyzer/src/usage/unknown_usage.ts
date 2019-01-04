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
import {UsageType} from '../common/types';
import {Usage} from './usage';

/** Description of an unknown node */
export class UnknownUsage extends Usage {
  type = UsageType.UNKNOWN;

  constructor(node: NodeWrap, sourceFile: ts.SourceFile) {
    super(node, sourceFile);
  }

  toString(): string {
    return 'Unknown';
  }

  static matches(node: NodeWrap): boolean {
    return true;
  }
}
