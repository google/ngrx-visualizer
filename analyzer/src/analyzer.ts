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

import * as commander from 'commander';
import * as fs from 'fs';
import * as path from 'path';
import * as ts from 'typescript';

import {ActionExport, AnalyzerOptions} from './common/types';
import {endsWith, setArgs} from './common/utils';
import {ProjectAnalyzer} from './project_analyzer';

/** Run the analyzer with given arguments */
export function main(args: AnalyzerOptions): ActionExport[] {
  setArgs(args);
  console.log('Discovering files');

  const files: string[] = [];
  function discoverFiles(filePath: string) {
    const exists = fs.existsSync(filePath);
    const stats = exists && fs.statSync(filePath);
    const isDirectory = exists && stats && stats.isDirectory();
    if (exists && isDirectory) {
      fs.readdirSync(filePath).forEach(childItemName => {
        discoverFiles(path.join(filePath, childItemName));
      });
    } else if (endsWith(filePath, '.ts')) {
      files.push(path.resolve(filePath));
    }
  }
  discoverFiles(args.folder);
  const host = ts.createCompilerHost({});
  const moduleKind = args.classic ? ts.ModuleResolutionKind.Classic :
                                    ts.ModuleResolutionKind.NodeJs;
  console.log(
      `Resolving modules using: ${ts.ModuleResolutionKind[moduleKind]}`);
  const program = ts.createProgram(
      files, {
        target: ts.ScriptTarget.Latest,
        module: ts.ModuleKind.CommonJS,
        moduleResolution: moduleKind
      },
      host);
  const actionRegex = new RegExp(args.actions);
  const actions =
      program.getSourceFiles()
          .map(f => f.fileName)
          .filter(
              f => !args.actions || (f.match(actionRegex) || []).length !== 0);
  const analyzer = new ProjectAnalyzer(program, actions);
  analyzer.processActions();

  const output: ActionExport[] = [];

  for (const action of analyzer.actions) {
    output.push(action.export());
  }

  console.log(JSON.stringify(output));

  if (args.save) {
    fs.writeFileSync(args.save, JSON.stringify(output));
  }

  return output;
}

if (process.mainModule === module) {
  commander.version('1.0.0')
      .usage('[options] <folder>')
      .option('-c, --classic', 'use classic module resolution instead of node')
      .option('-e, --empty-ref', 'output references without any usages')
      .option('-s, --save <file>', 'save results to a file')
      .option('-r, --remove <regex>', 'erase part of file path with regex')
      .option('-a, --actions <regex>', 'filter action files with regex')
      .option('-x, --exclude <regex>', 'exclude files from analysis with regex')
      .parse(process.argv);

  if (!commander.args[0]) {
    console.log('Please specify a folder. Use -h for help.');
    process.exit();
  }

  main({
    actions: commander.actions,
    classic: commander.classic,
    emptyRef: commander.emptyRef,
    exclude: commander.exclude,
    folder: commander.args[0],
    remove: commander.remove,
    save: commander.save
  });
}
