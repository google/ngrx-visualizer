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

import * as tsutils from 'tsutils';
import {NodeWrap, WrappedAst} from 'tsutils';
import * as ts from 'typescript';
import {SyntaxKind} from 'typescript';

import {Action} from './action';
import * as utils from './common/typescript_utils';
import {getArgs} from './common/utils';
import {Reference} from './reference';
import {ConstructorUsage} from './usage/constructor_usage';
import {EffectUsage} from './usage/effect_usage';
import {InstantiateUsage} from './usage/instantiate_usage';
import {MethodUsage} from './usage/method_usage';
import {ReducerUsage} from './usage/reducer_usage';
import {UnknownUsage} from './usage/unknown_usage';
import {Usage} from './usage/usage';

/** The list of usages to consider when analyzing the AST */
const USAGE_CLASSES: Array<{
  new (node: NodeWrap, sourceFile: ts.SourceFile): Usage;
  matches(node: NodeWrap, sourceFile: ts.SourceFile): boolean;
}> =
    [
      UnknownUsage, InstantiateUsage, EffectUsage, MethodUsage, ReducerUsage,
      ConstructorUsage
    ];

/** Runs the AST analysis */
export class ProjectAnalyzer {
  wrappedTrees: {[key: string]: WrappedAst} = {};
  actions: Action[] = [];

  fileMap: {[key: string]: ts.SourceFile} = {};
  typeMap: {[key: string]: Action} = {};
  methodMap: {[key: string]: string[]} = {};

  constructor(
      private readonly program: ts.Program,
      private readonly actionsFiles: string[]) {
    this.populateFileMap();
    this.wrapSource();
    this.discoverActions();
  }

  populateFileMap() {
    for (const sourceFile of this.program.getSourceFiles()) {
      this.fileMap[sourceFile.fileName] = sourceFile;
    }
  }

  wrapSource() {
    for (const sourceFile of this.program.getSourceFiles()) {
      this.wrappedTrees[sourceFile.fileName] =
          tsutils.convertAst(sourceFile).wrapped;
    }
  }

  // Read action file and find actions
  discoverActions() {
    // Actions have 1 property called type
    // Try to extract it and if successful assume we have an action
    for (const fileName of this.actionsFiles) {
      const sourceFile = this.fileMap[fileName];
      const ast = this.wrappedTrees[fileName];
      for (const classNode of utils.getClassDeclarations(ast)) {
        try {
          const actionType = utils.getTypeAsText(classNode, this.program);
          const firstProperty = utils.getDescendantsOfKind(
              classNode, SyntaxKind.PropertyDeclaration);
          if (firstProperty.length === 0) {
            continue;
          }
          const firstPropertyType =
              utils.getTypeAsText(firstProperty[0], this.program);
          const firstPropertyIdentifier =
              utils.getChildOfKind(firstProperty[0], SyntaxKind.Identifier);
          if (!firstPropertyIdentifier) {
            continue;
          }
          const firstPropertyName =
              firstPropertyIdentifier.node.getText(sourceFile);
          if (firstPropertyType !== 'string' && firstPropertyName === 'type') {
            const action = new Action(
                classNode, firstProperty[0], sourceFile, this.program);
            this.actions.push(action);
            this.typeMap[actionType] = action;
            this.typeMap[firstPropertyType] = action;
            console.log(actionType);
          }
        } catch (e) {
        }
      }
    }
  }

  // Find and analyze usages of all actions
  processActions() {
    for (const sourceFile of this.program.getSourceFiles()) {
      if (getArgs().exclude &&
          (sourceFile.fileName.match(new RegExp(getArgs().exclude)) ||
           []).length !== 0) {
        continue;
      }
      console.log('File: ' + sourceFile.fileName);
      const ast = this.wrappedTrees[sourceFile.fileName];
      const usages =
          utils.getDescendantsOfKind(ast, SyntaxKind.Identifier).filter(i => {
            try {
              let type = utils.getTypeAsText(i, this.program);
              if (type.indexOf('typeof ') === 0) {
                type = type.slice('typeof '.length);
              }
              return this.typeMap.hasOwnProperty(type);
            } catch (e) {
            }
            return false;
          });
      for (const usage of usages) {
        let type = utils.getTypeAsText(usage, this.program);
        if (type.indexOf('typeof ') === 0) {
          type = type.slice('typeof '.length);
        }
        const action = this.typeMap[type];
        const analysis = this.analyzeUsage(usage, sourceFile);
        action.references.push(analysis);
      }
    }
  }

  // Use surrounding code to guess how action is used
  analyzeUsage(node: NodeWrap, sourceFile: ts.SourceFile): Reference {
    const reference = new Reference(node, sourceFile, []);

    for (const usageClass of USAGE_CLASSES) {
      if (usageClass.matches(node, sourceFile)) {
        reference.usages.push(new usageClass(node, sourceFile));
      }
    }

    return reference;
  }
}
