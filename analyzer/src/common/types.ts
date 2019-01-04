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

/** Describes how a reference to an action is being used */
export enum UsageType {
  UNKNOWN = 'UNKNOWN',
  INSTANTIATE = 'INSTANTIATE',
  EFFECT = 'EFFECT',
  METHOD = 'METHOD',
  REDUCER = 'REDUCER',
  CONSTRUCTOR = 'CONSTRUCTOR'
}

/** Exported usage of a reference */
export interface UsageExport {
  type: UsageType;
}

/** Exported usage with a derived name */
export interface NamedUsageExport extends UsageExport {
  name: string;
}

/** Exported reference to an action */
export interface ReferenceExport {
  filePath: string;
  line: number;
  usages: UsageExport[];
}

/** Exported action from the analyzer */
export interface ActionExport {
  name: string;
  filePath: string;
  line: number;
  references: ReferenceExport[];
}

/** Options passed into the analyzer script. */
export interface AnalyzerOptions {
  actions: string;
  classic: boolean;
  emptyRef: boolean;
  exclude: string;
  folder: string;
  remove: string;
  save: string;
}
