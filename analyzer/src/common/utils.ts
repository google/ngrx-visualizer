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

import {AnalyzerOptions} from './types';

let args: AnalyzerOptions;

/** Set the analyzer arguments */
export function setArgs(newArgs: AnalyzerOptions) {
  args = newArgs;
}

/** Get the analyzer arguments */
export function getArgs(): AnalyzerOptions {
  return args;
}

/** Format a path with the remove argument and / file separators */
export function formatPath(input: string) {
  if (!args.remove) {
    return input;
  }
  const regex = new RegExp(args.remove);
  return input.replace(regex, '').replace('\\', '/');
}

/** Check if a string ends with another string */
export function endsWith(str: string, suffix: string) {
  return str.indexOf(suffix, str.length - suffix.length) !== -1;
}
