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

import {NodeType} from '../common/types';

/** Convert NodeType to a text representation */
export function typeToText(type: NodeType) {
  return {
    [NodeType.UNKNOWN]: 'Unknown',
    [NodeType.ACTION]: 'Action',
    [NodeType.EFFECT]: 'Effect',
    [NodeType.METHOD]: 'Method',
    [NodeType.REDUCER]: 'Reducer'
  }[type];
}

/**
 * Stores data similar to a cookie, but in localStorage (to allow larger data).
 *
 * @param key The key of the data.
 * @param value The value of the data.
 * @param exdays The number of days the data is valid.
 */
export function storeData(key: string, value: any, exdays: number): boolean {
  try {
    const d = new Date();
    d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
    const storeObject = {expires: d, value};
    localStorage.setItem(key, JSON.stringify(storeObject));
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Gets stored data similar to a cookie, but from localStorage.
 *
 * @param key The key of the data.
 */
export function getData(key: string) {
  try {
    const storeObject = localStorage.getItem(key);
    if (storeObject == null) {
      return undefined;
    }
    const object = JSON.parse(storeObject);
    const expirationDate = new Date(object.expires).getTime();
    const now = new Date().getTime();
    if (isNaN(expirationDate) || now > expirationDate) {
      return undefined;
    }
    return object.value;
  } catch (e) {
    return undefined;
  }
}

// https://stackoverflow.com/questions/45790423/how-to-get-parameter-name
export function getURLParameterByName(name: string, url?: string): string|
    undefined {
  if (!url) {
    url = window.location.href;
  }
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)');
  const results = regex.exec(url);
  if (!results) {
    return undefined;
  }
  if (!results[2]) {
    return '';
  }
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

export function updateURLParameter(key: string, value: string) {
  if (history.replaceState) {
    const newUrl = updateQueryString(key, value);
    window.history.replaceState('', '', newUrl);
  }
}

// https://stackoverflow.com/questions/5999118/how-can-i-add-or-update-a-query-string-parameter/15023688
export function updateQueryString(key: string, value: string, url?: string) {
  if (!url) {
    url = window.location.href;
  }
  const re = new RegExp('([?&])' + key + '=.*?(&|#|$)(.*)', 'gi');
  let hash;

  if (re.test(url)) {
    if (typeof value !== 'undefined' && value !== null) {
      return url.replace(re, '$1' + key + '=' + value + '$2$3');
    } else {
      hash = url.split('#');
      url = hash[0].replace(re, '$1$3').replace(/(&|\?)$/, '');
      if (typeof hash[1] !== 'undefined' && hash[1] !== null) {
        url += '#' + hash[1];
      }
      return url;
    }
  } else if (typeof value !== 'undefined' && value !== null) {
    const separator = url.indexOf('?') !== -1 ? '&' : '?';
    hash = url.split('#');
    url = hash[0] + separator + key + '=' + value;
    if (typeof hash[1] !== 'undefined' && hash[1] !== null) {
      url += '#' + hash[1];
    }
    return url;
  } else {
    return url;
  }
}
