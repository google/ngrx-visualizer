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

/** Settings dialog interaction with simulation */

import {LinkStatus} from '../common/types';
import {getData, storeData} from '../ui/utils';
import {onVisibilityChange} from './events';
import {updateD3Engine, updateD3EngineAndReset, updateD3SimData} from './internal';
import {Simulation} from './simulation';

export interface SavedSettings {
  colorScheme: string;
  graphicsQuality: string;
}

/** Setting that switches graph modes */
export function initDisplayModeSetting(sim: Simulation) {
  sim.ui.settings.displayModeSelect.addEventListener('change', () => {
    updateGraphDisplayMode(sim);

    for (const link of sim.graph.links) {
      link.status = LinkStatus.DISABLED;
    }
    updateD3SimData(sim);
    updateD3Engine(sim);
    onVisibilityChange(sim, sim.ui.visibility.getVisibility());
    updateD3EngineAndReset(sim);
  });
}

/** Setting that changes color scheme */
export function initStyleSetting(sim: Simulation) {
  sim.ui.settings.styleSelect.addEventListener('change', () => {
    const styleID = 'color-scheme-style';
    sim.ui.unloadStyle(styleID);
    if (sim.ui.settings.styleSelect.value === 'dark') {
      sim.ui.loadStyle('dark.css', styleID);
    }
    saveSetting('colorScheme', sim.ui.settings.styleSelect.value);
  });
}

/** Settings that changes graphics quality */
export function initGraphicsSetting(sim: Simulation) {
  sim.ui.settings.graphicsSelect.addEventListener('change', () => {
    const styleID = 'graphics-style';
    sim.ui.unloadStyle(styleID);
    if (sim.ui.settings.graphicsSelect.value === 'fast') {
      sim.ui.loadStyle('fast.css', styleID);
    }
    saveSetting('graphicsQuality', sim.ui.settings.graphicsSelect.value);
  });
}

/** Sets graph mode from settings */
export function updateGraphDisplayMode(sim: Simulation) {
  const value = sim.ui.settings.displayModeSelect.value;
  if (value === 'splitreducers') {
    sim.graph = sim.graphSplitReducers;
  }
  if (value === 'noreducers') {
    sim.graph = sim.graphNoReducers;
  }
  if (value === 'reducers') {
    sim.graph = sim.originalGraph;
  }
}

/**
 * Saves a single setting to localStorage.
 *
 * @param key The key of the setting to save.
 * @param value The value of the setting.
 */
export function saveSetting(key: keyof SavedSettings, value: any) {
  const settings = (getData('settings') || {}) as SavedSettings;
  settings[key] = value;
  storeData('settings', settings, 100000);
}

/** Restores all settings of the simulation. */
export function loadSettings(sim: Simulation) {
  const settings = (getData('settings') || {}) as SavedSettings;
  if (settings.colorScheme !== undefined) {
    sim.ui.settings.styleSelect.value = settings.colorScheme;
    sim.ui.settings.styleSelect.dispatchEvent(new Event('change'));
  }
  if (settings.graphicsQuality !== undefined) {
    sim.ui.settings.graphicsSelect.value = settings.graphicsQuality;
    sim.ui.settings.graphicsSelect.dispatchEvent(new Event('change'));
  }
}
