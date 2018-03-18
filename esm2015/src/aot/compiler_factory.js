/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { CompilerConfig } from '../config';
import { ViewEncapsulation } from '../core';
import { DirectiveNormalizer } from '../directive_normalizer';
import { DirectiveResolver } from '../directive_resolver';
import { Lexer } from '../expression_parser/lexer';
import { Parser } from '../expression_parser/parser';
import { I18NHtmlParser } from '../i18n/i18n_html_parser';
import { InjectableCompiler } from '../injectable_compiler';
import { CompileMetadataResolver } from '../metadata_resolver';
import { HtmlParser } from '../ml_parser/html_parser';
import { NgModuleCompiler } from '../ng_module_compiler';
import { NgModuleResolver } from '../ng_module_resolver';
import { TypeScriptEmitter } from '../output/ts_emitter';
import { PipeResolver } from '../pipe_resolver';
import { DomElementSchemaRegistry } from '../schema/dom_element_schema_registry';
import { StyleCompiler } from '../style_compiler';
import { TemplateParser } from '../template_parser/template_parser';
import { syntaxError } from '../util';
import { TypeCheckCompiler } from '../view_compiler/type_check_compiler';
import { ViewCompiler } from '../view_compiler/view_compiler';
import { AotCompiler } from './compiler';
import { StaticReflector } from './static_reflector';
import { StaticSymbolCache } from './static_symbol';
import { StaticSymbolResolver } from './static_symbol_resolver';
import { AotSummaryResolver } from './summary_resolver';
/**
 * @param {?} host
 * @return {?}
 */
export function createAotUrlResolver(host) {
    return {
        resolve: (basePath, url) => {
            const /** @type {?} */ filePath = host.resourceNameToFileName(url, basePath);
            if (!filePath) {
                throw syntaxError(`Couldn't resolve resource ${url} from ${basePath}`);
            }
            return filePath;
        }
    };
}
/**
 * Creates a new AotCompiler based on options and a host.
 * @param {?} compilerHost
 * @param {?} options
 * @param {?=} errorCollector
 * @return {?}
 */
export function createAotCompiler(compilerHost, options, errorCollector) {
    let /** @type {?} */ translations = options.translations || '';
    const /** @type {?} */ urlResolver = createAotUrlResolver(compilerHost);
    const /** @type {?} */ symbolCache = new StaticSymbolCache();
    const /** @type {?} */ summaryResolver = new AotSummaryResolver(compilerHost, symbolCache);
    const /** @type {?} */ symbolResolver = new StaticSymbolResolver(compilerHost, symbolCache, summaryResolver);
    const /** @type {?} */ staticReflector = new StaticReflector(summaryResolver, symbolResolver, [], [], errorCollector);
    const /** @type {?} */ htmlParser = new I18NHtmlParser(new HtmlParser(), translations, options.i18nFormat, options.missingTranslation, console);
    const /** @type {?} */ config = new CompilerConfig({
        defaultEncapsulation: ViewEncapsulation.Emulated,
        useJit: false,
        missingTranslation: options.missingTranslation,
        preserveWhitespaces: options.preserveWhitespaces,
        strictInjectionParameters: options.strictInjectionParameters,
    });
    const /** @type {?} */ normalizer = new DirectiveNormalizer({ get: (url) => compilerHost.loadResource(url) }, urlResolver, htmlParser, config);
    const /** @type {?} */ expressionParser = new Parser(new Lexer());
    const /** @type {?} */ elementSchemaRegistry = new DomElementSchemaRegistry();
    const /** @type {?} */ tmplParser = new TemplateParser(config, staticReflector, expressionParser, elementSchemaRegistry, htmlParser, console, []);
    const /** @type {?} */ resolver = new CompileMetadataResolver(config, htmlParser, new NgModuleResolver(staticReflector), new DirectiveResolver(staticReflector), new PipeResolver(staticReflector), summaryResolver, elementSchemaRegistry, normalizer, console, symbolCache, staticReflector, errorCollector);
    // TODO(vicb): do not pass options.i18nFormat here
    const /** @type {?} */ viewCompiler = new ViewCompiler(staticReflector);
    const /** @type {?} */ typeCheckCompiler = new TypeCheckCompiler(options, staticReflector);
    const /** @type {?} */ compiler = new AotCompiler(config, options, compilerHost, staticReflector, resolver, tmplParser, new StyleCompiler(urlResolver), viewCompiler, typeCheckCompiler, new NgModuleCompiler(staticReflector), new InjectableCompiler(staticReflector, !!options.enableIvy), new TypeScriptEmitter(), summaryResolver, symbolResolver);
    return { compiler, reflector: staticReflector };
}
//# sourceMappingURL=compiler_factory.js.map