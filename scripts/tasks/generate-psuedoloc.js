/**
 * @license Copyright 2018 The Lighthouse Authors. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */
'use strict';

module.exports.createPsuedoLocaleStrings = function (messages) {
    /** @type {Record<string, CtcMessage>} */
    const psuedoLocalizedStrings = {};
    for (const [key, ctc] of Object.entries(messages)) {
      const message = ctc.message;
      const psuedoLocalizedString = [];
      let braceCount = 0;
      let inPlaceholder = false;
      let useHatForAccentMark = true;
      for (const char of message) {
        psuedoLocalizedString.push(char);
        if (char === '$') {
          inPlaceholder = !inPlaceholder;
          continue;
        }
        if (inPlaceholder) {
          continue;
        }
  
        if (char === '{') {
          braceCount++;
        } else if (char === '}') {
          braceCount--;
        }
  
        // Hack to not change {plural{ICU}braces} nested an odd number of times.
        // ex: "{itemCount, plural, =1 {1 link found} other {# links found}}"
        // becomes "{itemCount, plural, =1 {1 l̂ín̂ḱ f̂óûńd̂} other {# ĺîńk̂ś f̂óûńd̂}}"
        // ex: "{itemCount, plural, =1 {1 link {nested_replacement} found} other {# links {nested_replacement} found}}"
        // becomes: "{itemCount, plural, =1 {1 l̂ín̂ḱ {nested_replacement} f̂óûńd̂} other {# ĺîńk̂ś {nested_replacement} f̂óûńd̂}}"
        if (braceCount % 2 === 1)
          continue;
  
        // Add diacritical marks to the preceding letter, alternating between a hat ( ̂ ) and an acute (´).
        if (/[a-z]/i.test(char)) {
          psuedoLocalizedString.push(useHatForAccentMark ? `\u0302` : `\u0301`);
          useHatForAccentMark = !useHatForAccentMark;
        }
      }
      psuedoLocalizedStrings[key] = {
        message: psuedoLocalizedString.join(''),
        description: ctc.description,
        placeholders: ctc.placeholders,
      };
    }
    return psuedoLocalizedStrings;
  }