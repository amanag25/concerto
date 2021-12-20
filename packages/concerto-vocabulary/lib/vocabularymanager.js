/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

const YAML = require('yaml');
const Vocabulary = require('./vocabulary');

/**
* A vocabulary manager for concerto models. The vocabulary manager
* stores and provides API access to a set of vocabulary files, where each file
* is associated with a BCP-47 language tag and a Concerto namespace.
* @see https://datatracker.ietf.org/doc/html/rfc5646#section-2
* @class
* @memberof module:concerto-vocabulary
*/
class VocabularyManager {
    /**
     * Create the VocabularyManager
     * @constructor
     */
    constructor() {
        this.vocabularies = {}; // key is namespace/locale, value is a Vocabulary object
    }

    /**
     * Removes all vocabularies
     */
    clear() {
        this.vocabularies = {};
    }

    /**
     * Removes a vocabulary from the vocabulary manager
     * @param {string} namespace the namespace for the vocabulary
     * @param {string} locale the BCP-47 locale identifier
     */
    removeVocabulary(namespace, locale) {
        delete this.vocabularies[`${namespace}/${locale}`];
    }

    /**
     * Adds a vocabulary to the vocabulary manager
     * @param {string} contents the YAML string for the vocabulary
     */
    addVocabulary(contents) {
        if(!contents) {
            throw new Error('Vocabulary contents must be specified');
        }
        const voc = new Vocabulary(this, YAML.parse(contents));

        const existing = Object.values(this.vocabularies).find( v => v.getIdentifier() === voc.getIdentifier());
        if(existing) {
            throw new Error('Vocabulary has already been added.');
        }
        this.vocabularies[voc.getIdentifier()] = voc;
    }

    /**
     * Finds the vocabulary for a requested locale, removing language
     * identifiers from the locale until the locale matches, or if no
     * vocabulary is found, null is returned
     * @param {string} requestedLocale the BCP-47 locale identifier
     * @param {Vocabulary[]} vocabularies the vocabularies to match against
     * @param {*} [options] options to configure vocabulary lookup
     * @param {*} [options.localeMatcher] Pass 'lookup' to find a general vocabulary, if available
     * @returns {Vocabulary} the most specific vocabulary, or null
     */
    static findVocabulary(requestedLocale, vocabularies, options) {
        let locale = requestedLocale;
        let done = false;
        do {
            const voc = vocabularies.find(v => v.getLocale() === locale);
            if (voc) {
                return voc;
            }

            if (options?.localeMatcher !== 'lookup') {
                done = true;
                break;
            }

            const pos = locale.lastIndexOf('-');
            if (pos === -1) {
                done = true;
                break;
            }
            locale = locale.substring(0, pos);
        } while (!done);
        return null;
    }

    /**
     * Gets a vocabulary for a given namespace plus locale
     * @param {string} namespace the namespace for the vocabulary
     * @param {string} locale the BCP-47 locale identifier
     * @param {*} [options] options to configure vocabulary lookup
     * @param {*} [options.localeMatcher] Pass 'lookup' to find a general vocabulary, if available
     * @returns {Vocabulary} the vocabulary or null if no vocabulary exists for the locale
     */
    getVocabulary(namespace, locale, options) {
        const vocs = this.getVocabulariesForNamespace(namespace);
        return VocabularyManager.findVocabulary(locale.toLowerCase(), vocs, options);
    }

    /**
     * Gets all the vocabulary files for a given namespace
     * @param {string} namespace the namespace
     * @returns {Vocabulary[]} the array of vocabularies
     */
    getVocabulariesForNamespace(namespace) {
        return Object.values(this.vocabularies).filter( v => v.getNamespace() === namespace);
    }

    /**
     * Gets all the vocabulary files for a given locale
     * @param {string} locale the BCP-47 locale identifier
     * @returns {Vocabulary[]} the array of vocabularies
     */
    getVocabulariesForLocale(locale) {
        return Object.values(this.vocabularies).filter( v => v.getLocale() === locale.toLowerCase());
    }

    /**
     * Gets the term for a concept, enum or property, looking up terms
     * from a more general vocabulary if required
     * @param {string} namespace the namespace
     * @param {string} locale the BCP-47 locale identifier
     * @param {string} declarationName the name of a concept or enum
     * @param {string} [propertyName] the name of a property (optional)
     * @returns {string} the term or null if it does not exist
     */
    getTerm(namespace, locale, declarationName, propertyName) {
        const voc = this.getVocabulary(namespace, locale);
        let term = null;
        if(voc) {
            term = voc.getTerm(declarationName, propertyName);
        }
        if(term) {
            return term;
        }
        else {
            const dashIndex = locale.lastIndexOf('-');
            if(dashIndex >= 0) {
                return this.getTerm(namespace, locale.substring(0, dashIndex), declarationName, propertyName);
            }
            else {
                return null;
            }
        }
    }

    /**
     * Validates the terms in the vocabulary against the namespaces and declarations
     * within a ModelManager
     * @param {ModelManager} modelManager - the Model Manager
     * @returns {*} the result of validation
     */
    validate(modelManager) {
        // missing vocabularies
        const missingVocabularies = modelManager.getModelFiles()
            .map( m => this.getVocabulariesForNamespace(m.getNamespace()).length === 0 ? m.getNamespace() : null)
            .filter( m => m !== null);

        // additional vocabularies
        const additionalVocabularies = Object.values(this.vocabularies)
            .filter( v => !modelManager.getModelFile(v.getNamespace()));

        const result = {
            missingVocabularies,
            additionalVocabularies,
            vocabularies: {}
        };

        // validate the models against the vocs
        Object.values(this.vocabularies)
            .forEach(voc => {
                const vocResult = {
                    locale: voc.getLocale(),
                    namespace: voc.getNamespace(),
                    missingTerms: [],
                    additionalTerms: []
                };

                const model = modelManager.getModelFile(voc.getNamespace());
                if(model) {
                    const errors = voc.validate(model);
                    if(errors.missingTerms) {
                        vocResult.missingTerms = vocResult.missingTerms.concat(errors.missingTerms);
                    }
                    if(errors.additionalTerms) {
                        vocResult.additionalTerms = vocResult.additionalTerms.concat(errors.additionalTerms);
                    }

                    result.vocabularies[`${vocResult.namespace}/${vocResult.locale}`] = vocResult;
                }
            });
        return result;
    }
}

module.exports = VocabularyManager;
