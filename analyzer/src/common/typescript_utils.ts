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

import {NodeWrap, WrappedAst} from 'tsutils';
import * as ts from 'typescript';

/** Get the first child of given kind */
export function getChildOfKind<T extends ts.SyntaxKind>(
    node: NodeWrap, kind: T): NodeWrap|undefined {
  for (const child of node.children) {
    if (child.kind === kind) {
      return child;
    }
  }
  return undefined;
}

/** Get all children of a given kind */
export function getChildrenOfKind<T extends ts.SyntaxKind>(
    node: NodeWrap, kind: T): NodeWrap[] {
  const res = [];
  for (const child of node.children) {
    if (child.kind === kind) {
      res.push(child);
    }
  }
  return res;
}

/** Get every node down the tree */
export function getDescendantsOfKind<T extends ts.SyntaxKind>(
    node: NodeWrap, kind: T): NodeWrap[] {
  const res: NodeWrap[] = [];
  function r(node: NodeWrap) {
    if (node.kind === kind) {
      res.push(node);
    }
    for (const child of node.children) {
      r(child);
    }
  }
  for (const child of node.children) {
    r(child);
  }
  return res;
}

/** Get first node of type down the tree */
export function getFirstDescendantOfKind<T extends ts.SyntaxKind>(
    node: NodeWrap, kind: T): NodeWrap|undefined {
  let res: NodeWrap|undefined = undefined;
  let found = false;
  function r(node: NodeWrap) {
    if (node.kind === kind) {
      found = true;
      res = node;
      return;
    }
    for (const child of node.children) {
      if (found) {
        break;
      }
      r(child);
    }
  }
  for (const child of node.children) {
    if (found) {
      break;
    }
    r(child);
  }
  return res;
}

/**
 * Get parent while condition is true. Undefined if initial parent fails
 * condition.
 */
export function getParentWhile(
    node: NodeWrap, condition: (node: NodeWrap) => boolean): NodeWrap|
    undefined {
  let parent: NodeWrap|undefined = undefined;
  let nextParent = node.parent;
  while (nextParent != null && condition(nextParent)) {
    parent = nextParent;
    nextParent = nextParent.parent;
  }
  return parent;
}

/** Get first ancestor with kind */
export function getFirstAncestorByKind(node: NodeWrap, kind: ts.SyntaxKind) {
  let parent = node.parent;
  while (parent) {
    if (parent.kind === kind) {
      return parent;
    }
    parent = parent.parent;
  }
  return undefined;
}

/** Get all class declarations in a WrappedAst */
export function getClassDeclarations(ast: WrappedAst): NodeWrap[] {
  return getChildrenOfKind(ast, ts.SyntaxKind.ClassDeclaration);
}

/** Convert ts.Type to text */
export function typeToString(type: ts.Type, program: ts.Program): string {
  return program.getTypeChecker().typeToString(
      type, undefined,
      (ts.TypeFormatFlags.UseTypeOfFunction | ts.TypeFormatFlags.NoTruncation |
       ts.TypeFormatFlags.UseFullyQualifiedType |
       ts.TypeFormatFlags.WriteTypeArgumentsOfSignature) as ts.TypeFormatFlags);
}

/** Get type of NodeWrap */
export function getType(node: NodeWrap, program: ts.Program): ts.Type {
  return program.getTypeChecker().getTypeAtLocation(node.node);
}

/** Get type of NodeWrap as text */
export function getTypeAsText(node: NodeWrap, program: ts.Program): string {
  return typeToString(getType(node, program), program);
}
