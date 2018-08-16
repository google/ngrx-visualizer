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

import * as path from "path";
import resolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import license from "rollup-plugin-license";
import sourceMaps from "rollup-plugin-sourcemaps";
import { uglify } from "rollup-plugin-uglify";

export default {
  entry: "bin/ts/app.js",
  dest: "bin/bundle.js",
  format: "umd",
  sourceMap: false,
  plugins: [
    resolve({
      jsnext: true,
      main: true,
      module: true
    }),
    commonjs(),
    sourceMaps(),
    uglify(),
    license({
      banner: {
        file: path.join(__dirname, "bundle_license")
      }
    })
  ],
  moduleName: "app"
};
