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

/** Starting point for the application */

import {Simulation} from './simulation/simulation';
import {BottombarUI} from './ui/bottombar';
import {DetailsUI} from './ui/details';
import {LoadingDialogUI} from './ui/loading_dialog';
import {SearchUI} from './ui/search';
import {SettingsUI} from './ui/settings';
import {SidebarUI} from './ui/sidebar';
import {UI} from './ui/ui';
import {getURLParameterByName} from './ui/utils';
import {VisibilityUI} from './ui/visibility';

const sidebarUI = new SidebarUI(
    document, window, 250, ['sidebar-search', 'sidebar-visibility']);
const bottombarUI = new BottombarUI(document, window, 250);
const ui = new UI(
    document, new SettingsUI(document), sidebarUI,
    new SearchUI(document, sidebarUI), new VisibilityUI(document, sidebarUI),
    bottombarUI, new DetailsUI(document, bottombarUI),
    new LoadingDialogUI(document));

const showURLParam = getURLParameterByName('show');
const showParam = showURLParam && showURLParam.split('|');

const loadParam = getURLParameterByName('load');

const cacheParamInput = getURLParameterByName('cache');
let cacheParam = 0;
if (cacheParamInput !== undefined) {
  cacheParam = parseFloat(cacheParamInput);
  if (cacheParam < 0 || isNaN(cacheParam)) {
    cacheParam = 0;
  }
}

const reducerLengthParamInput = getURLParameterByName('reducerLength');
let reducerLengthParam = 1;
if (reducerLengthParamInput !== undefined) {
  reducerLengthParam = parseInt(reducerLengthParamInput, 10);
}

const scaleParamInput = getURLParameterByName('scale');
let scaleParam: number;
if (scaleParamInput !== undefined) {
  scaleParam = parseFloat(scaleParamInput);
  if (scaleParam < 0 || isNaN(scaleParam)) {
    scaleParam = undefined;
  }
}

const translateParamInput = getURLParameterByName('translate');
let translateParam: number[];
if (translateParamInput !== undefined) {
  const split = translateParamInput.split(',');
  translateParam = split.map(t => parseFloat(t));
}

const simulation = new Simulation(
    {
      cacheParam,
      height: window.innerHeight,
      loadParam,
      radius: 10,
      reducerLengthParam,
      scaleParam,
      showParam,
      translateParam,
      width: window.innerWidth
    },
    ui);
