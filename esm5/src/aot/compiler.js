/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { __read, __spread, __values } from "tslib";
import { componentFactoryName, flatten, identifierName, templateSourceUrl } from '../compile_metadata';
import { ConstantPool } from '../constant_pool';
import { ViewEncapsulation } from '../core';
import { MessageBundle } from '../i18n/message_bundle';
import { Identifiers, createTokenForExternalReference } from '../identifiers';
import { HtmlParser } from '../ml_parser/html_parser';
import { removeWhitespaces } from '../ml_parser/html_whitespaces';
import { DEFAULT_INTERPOLATION_CONFIG, InterpolationConfig } from '../ml_parser/interpolation_config';
import * as o from '../output/output_ast';
import { compileNgModuleFromRender2 as compileR3Module } from '../render3/r3_module_compiler';
import { compilePipeFromRender2 as compileR3Pipe } from '../render3/r3_pipe_compiler';
import { htmlAstToRender3Ast } from '../render3/r3_template_transform';
import { compileComponentFromRender2 as compileR3Component, compileDirectiveFromRender2 as compileR3Directive } from '../render3/view/compiler';
import { DomElementSchemaRegistry } from '../schema/dom_element_schema_registry';
import { BindingParser } from '../template_parser/binding_parser';
import { error, newArray, syntaxError, visitValue } from '../util';
import { GeneratedFile } from './generated_file';
import { listLazyRoutes, parseLazyRoute } from './lazy_routes';
import { StaticSymbol } from './static_symbol';
import { createForJitStub, serializeSummaries } from './summary_serializer';
import { ngfactoryFilePath, normalizeGenFileSuffix, splitTypescriptSuffix, summaryFileName, summaryForJitFileName } from './util';
var AotCompiler = /** @class */ (function () {
    function AotCompiler(_config, _options, _host, reflector, _metadataResolver, _templateParser, _styleCompiler, _viewCompiler, _typeCheckCompiler, _ngModuleCompiler, _injectableCompiler, _outputEmitter, _summaryResolver, _symbolResolver) {
        this._config = _config;
        this._options = _options;
        this._host = _host;
        this.reflector = reflector;
        this._metadataResolver = _metadataResolver;
        this._templateParser = _templateParser;
        this._styleCompiler = _styleCompiler;
        this._viewCompiler = _viewCompiler;
        this._typeCheckCompiler = _typeCheckCompiler;
        this._ngModuleCompiler = _ngModuleCompiler;
        this._injectableCompiler = _injectableCompiler;
        this._outputEmitter = _outputEmitter;
        this._summaryResolver = _summaryResolver;
        this._symbolResolver = _symbolResolver;
        this._templateAstCache = new Map();
        this._analyzedFiles = new Map();
        this._analyzedFilesForInjectables = new Map();
    }
    AotCompiler.prototype.clearCache = function () { this._metadataResolver.clearCache(); };
    AotCompiler.prototype.analyzeModulesSync = function (rootFiles) {
        var _this = this;
        var analyzeResult = analyzeAndValidateNgModules(rootFiles, this._host, this._symbolResolver, this._metadataResolver);
        analyzeResult.ngModules.forEach(function (ngModule) { return _this._metadataResolver.loadNgModuleDirectiveAndPipeMetadata(ngModule.type.reference, true); });
        return analyzeResult;
    };
    AotCompiler.prototype.analyzeModulesAsync = function (rootFiles) {
        var _this = this;
        var analyzeResult = analyzeAndValidateNgModules(rootFiles, this._host, this._symbolResolver, this._metadataResolver);
        return Promise
            .all(analyzeResult.ngModules.map(function (ngModule) { return _this._metadataResolver.loadNgModuleDirectiveAndPipeMetadata(ngModule.type.reference, false); }))
            .then(function () { return analyzeResult; });
    };
    AotCompiler.prototype._analyzeFile = function (fileName) {
        var analyzedFile = this._analyzedFiles.get(fileName);
        if (!analyzedFile) {
            analyzedFile =
                analyzeFile(this._host, this._symbolResolver, this._metadataResolver, fileName);
            this._analyzedFiles.set(fileName, analyzedFile);
        }
        return analyzedFile;
    };
    AotCompiler.prototype._analyzeFileForInjectables = function (fileName) {
        var analyzedFile = this._analyzedFilesForInjectables.get(fileName);
        if (!analyzedFile) {
            analyzedFile = analyzeFileForInjectables(this._host, this._symbolResolver, this._metadataResolver, fileName);
            this._analyzedFilesForInjectables.set(fileName, analyzedFile);
        }
        return analyzedFile;
    };
    AotCompiler.prototype.findGeneratedFileNames = function (fileName) {
        var _this = this;
        var genFileNames = [];
        var file = this._analyzeFile(fileName);
        // Make sure we create a .ngfactory if we have a injectable/directive/pipe/NgModule
        // or a reference to a non source file.
        // Note: This is overestimating the required .ngfactory files as the real calculation is harder.
        // Only do this for StubEmitFlags.Basic, as adding a type check block
        // does not change this file (as we generate type check blocks based on NgModules).
        if (this._options.allowEmptyCodegenFiles || file.directives.length || file.pipes.length ||
            file.injectables.length || file.ngModules.length || file.exportsNonSourceFiles) {
            genFileNames.push(ngfactoryFilePath(file.fileName, true));
            if (this._options.enableSummariesForJit) {
                genFileNames.push(summaryForJitFileName(file.fileName, true));
            }
        }
        var fileSuffix = normalizeGenFileSuffix(splitTypescriptSuffix(file.fileName, true)[1]);
        file.directives.forEach(function (dirSymbol) {
            var compMeta = _this._metadataResolver.getNonNormalizedDirectiveMetadata(dirSymbol).metadata;
            if (!compMeta.isComponent) {
                return;
            }
            // Note: compMeta is a component and therefore template is non null.
            compMeta.template.styleUrls.forEach(function (styleUrl) {
                var normalizedUrl = _this._host.resourceNameToFileName(styleUrl, file.fileName);
                if (!normalizedUrl) {
                    throw syntaxError("Couldn't resolve resource " + styleUrl + " relative to " + file.fileName);
                }
                var needsShim = (compMeta.template.encapsulation ||
                    _this._config.defaultEncapsulation) === ViewEncapsulation.Emulated;
                genFileNames.push(_stylesModuleUrl(normalizedUrl, needsShim, fileSuffix));
                if (_this._options.allowEmptyCodegenFiles) {
                    genFileNames.push(_stylesModuleUrl(normalizedUrl, !needsShim, fileSuffix));
                }
            });
        });
        return genFileNames;
    };
    AotCompiler.prototype.emitBasicStub = function (genFileName, originalFileName) {
        var outputCtx = this._createOutputContext(genFileName);
        if (genFileName.endsWith('.ngfactory.ts')) {
            if (!originalFileName) {
                throw new Error("Assertion error: require the original file for .ngfactory.ts stubs. File: " + genFileName);
            }
            var originalFile = this._analyzeFile(originalFileName);
            this._createNgFactoryStub(outputCtx, originalFile, 1 /* Basic */);
        }
        else if (genFileName.endsWith('.ngsummary.ts')) {
            if (this._options.enableSummariesForJit) {
                if (!originalFileName) {
                    throw new Error("Assertion error: require the original file for .ngsummary.ts stubs. File: " + genFileName);
                }
                var originalFile = this._analyzeFile(originalFileName);
                _createEmptyStub(outputCtx);
                originalFile.ngModules.forEach(function (ngModule) {
                    // create exports that user code can reference
                    createForJitStub(outputCtx, ngModule.type.reference);
                });
            }
        }
        else if (genFileName.endsWith('.ngstyle.ts')) {
            _createEmptyStub(outputCtx);
        }
        // Note: for the stubs, we don't need a property srcFileUrl,
        // as later on in emitAllImpls we will create the proper GeneratedFiles with the
        // correct srcFileUrl.
        // This is good as e.g. for .ngstyle.ts files we can't derive
        // the url of components based on the genFileUrl.
        return this._codegenSourceModule('unknown', outputCtx);
    };
    AotCompiler.prototype.emitTypeCheckStub = function (genFileName, originalFileName) {
        var originalFile = this._analyzeFile(originalFileName);
        var outputCtx = this._createOutputContext(genFileName);
        if (genFileName.endsWith('.ngfactory.ts')) {
            this._createNgFactoryStub(outputCtx, originalFile, 2 /* TypeCheck */);
        }
        return outputCtx.statements.length > 0 ?
            this._codegenSourceModule(originalFile.fileName, outputCtx) :
            null;
    };
    AotCompiler.prototype.loadFilesAsync = function (fileNames, tsFiles) {
        var _this = this;
        var files = fileNames.map(function (fileName) { return _this._analyzeFile(fileName); });
        var loadingPromises = [];
        files.forEach(function (file) { return file.ngModules.forEach(function (ngModule) {
            return loadingPromises.push(_this._metadataResolver.loadNgModuleDirectiveAndPipeMetadata(ngModule.type.reference, false));
        }); });
        var analyzedInjectables = tsFiles.map(function (tsFile) { return _this._analyzeFileForInjectables(tsFile); });
        return Promise.all(loadingPromises).then(function (_) { return ({
            analyzedModules: mergeAndValidateNgFiles(files),
            analyzedInjectables: analyzedInjectables,
        }); });
    };
    AotCompiler.prototype.loadFilesSync = function (fileNames, tsFiles) {
        var _this = this;
        var files = fileNames.map(function (fileName) { return _this._analyzeFile(fileName); });
        files.forEach(function (file) { return file.ngModules.forEach(function (ngModule) { return _this._metadataResolver.loadNgModuleDirectiveAndPipeMetadata(ngModule.type.reference, true); }); });
        var analyzedInjectables = tsFiles.map(function (tsFile) { return _this._analyzeFileForInjectables(tsFile); });
        return {
            analyzedModules: mergeAndValidateNgFiles(files),
            analyzedInjectables: analyzedInjectables,
        };
    };
    AotCompiler.prototype._createNgFactoryStub = function (outputCtx, file, emitFlags) {
        var _this = this;
        var componentId = 0;
        file.ngModules.forEach(function (ngModuleMeta, ngModuleIndex) {
            // Note: the code below needs to executed for StubEmitFlags.Basic and StubEmitFlags.TypeCheck,
            // so we don't change the .ngfactory file too much when adding the type-check block.
            // create exports that user code can reference
            _this._ngModuleCompiler.createStub(outputCtx, ngModuleMeta.type.reference);
            // add references to the symbols from the metadata.
            // These can be used by the type check block for components,
            // and they also cause TypeScript to include these files into the program too,
            // which will make them part of the analyzedFiles.
            var externalReferences = __spread(ngModuleMeta.transitiveModule.directives.map(function (d) { return d.reference; }), ngModuleMeta.transitiveModule.pipes.map(function (d) { return d.reference; }), ngModuleMeta.importedModules.map(function (m) { return m.type.reference; }), ngModuleMeta.exportedModules.map(function (m) { return m.type.reference; }), _this._externalIdentifierReferences([Identifiers.TemplateRef, Identifiers.ElementRef]));
            var externalReferenceVars = new Map();
            externalReferences.forEach(function (ref, typeIndex) {
                externalReferenceVars.set(ref, "_decl" + ngModuleIndex + "_" + typeIndex);
            });
            externalReferenceVars.forEach(function (varName, reference) {
                outputCtx.statements.push(o.variable(varName)
                    .set(o.NULL_EXPR.cast(o.DYNAMIC_TYPE))
                    .toDeclStmt(o.expressionType(outputCtx.importExpr(reference, /* typeParams */ null, /* useSummaries */ false))));
            });
            if (emitFlags & 2 /* TypeCheck */) {
                // add the type-check block for all components of the NgModule
                ngModuleMeta.declaredDirectives.forEach(function (dirId) {
                    var compMeta = _this._metadataResolver.getDirectiveMetadata(dirId.reference);
                    if (!compMeta.isComponent) {
                        return;
                    }
                    componentId++;
                    _this._createTypeCheckBlock(outputCtx, compMeta.type.reference.name + "_Host_" + componentId, ngModuleMeta, _this._metadataResolver.getHostComponentMetadata(compMeta), [compMeta.type], externalReferenceVars);
                    _this._createTypeCheckBlock(outputCtx, compMeta.type.reference.name + "_" + componentId, ngModuleMeta, compMeta, ngModuleMeta.transitiveModule.directives, externalReferenceVars);
                });
            }
        });
        if (outputCtx.statements.length === 0) {
            _createEmptyStub(outputCtx);
        }
    };
    AotCompiler.prototype._externalIdentifierReferences = function (references) {
        var e_1, _a;
        var result = [];
        try {
            for (var references_1 = __values(references), references_1_1 = references_1.next(); !references_1_1.done; references_1_1 = references_1.next()) {
                var reference = references_1_1.value;
                var token = createTokenForExternalReference(this.reflector, reference);
                if (token.identifier) {
                    result.push(token.identifier.reference);
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (references_1_1 && !references_1_1.done && (_a = references_1.return)) _a.call(references_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return result;
    };
    AotCompiler.prototype._createTypeCheckBlock = function (ctx, componentId, moduleMeta, compMeta, directives, externalReferenceVars) {
        var _a;
        var _b = this._parseTemplate(compMeta, moduleMeta, directives), parsedTemplate = _b.template, usedPipes = _b.pipes;
        (_a = ctx.statements).push.apply(_a, __spread(this._typeCheckCompiler.compileComponent(componentId, compMeta, parsedTemplate, usedPipes, externalReferenceVars, ctx)));
    };
    AotCompiler.prototype.emitMessageBundle = function (analyzeResult, locale) {
        var _this = this;
        var errors = [];
        var htmlParser = new HtmlParser();
        // TODO(vicb): implicit tags & attributes
        var messageBundle = new MessageBundle(htmlParser, [], {}, locale);
        analyzeResult.files.forEach(function (file) {
            var compMetas = [];
            file.directives.forEach(function (directiveType) {
                var dirMeta = _this._metadataResolver.getDirectiveMetadata(directiveType);
                if (dirMeta && dirMeta.isComponent) {
                    compMetas.push(dirMeta);
                }
            });
            compMetas.forEach(function (compMeta) {
                var html = compMeta.template.template;
                // Template URL points to either an HTML or TS file depending on whether
                // the file is used with `templateUrl:` or `template:`, respectively.
                var templateUrl = compMeta.template.templateUrl;
                var interpolationConfig = InterpolationConfig.fromArray(compMeta.template.interpolation);
                errors.push.apply(errors, __spread(messageBundle.updateFromTemplate(html, templateUrl, interpolationConfig)));
            });
        });
        if (errors.length) {
            throw new Error(errors.map(function (e) { return e.toString(); }).join('\n'));
        }
        return messageBundle;
    };
    AotCompiler.prototype.emitAllPartialModules = function (_a, r3Files) {
        var _this = this;
        var ngModuleByPipeOrDirective = _a.ngModuleByPipeOrDirective, files = _a.files;
        var contextMap = new Map();
        var getContext = function (fileName) {
            if (!contextMap.has(fileName)) {
                contextMap.set(fileName, _this._createOutputContext(fileName));
            }
            return contextMap.get(fileName);
        };
        files.forEach(function (file) { return _this._compilePartialModule(file.fileName, ngModuleByPipeOrDirective, file.directives, file.pipes, file.ngModules, file.injectables, getContext(file.fileName)); });
        r3Files.forEach(function (file) { return _this._compileShallowModules(file.fileName, file.shallowModules, getContext(file.fileName)); });
        return Array.from(contextMap.values())
            .map(function (context) { return ({
            fileName: context.genFilePath,
            statements: __spread(context.constantPool.statements, context.statements),
        }); });
    };
    AotCompiler.prototype._compileShallowModules = function (fileName, shallowModules, context) {
        var _this = this;
        shallowModules.forEach(function (module) { return compileR3Module(context, module, _this._injectableCompiler); });
    };
    AotCompiler.prototype._compilePartialModule = function (fileName, ngModuleByPipeOrDirective, directives, pipes, ngModules, injectables, context) {
        var _this = this;
        var errors = [];
        var schemaRegistry = new DomElementSchemaRegistry();
        var hostBindingParser = new BindingParser(this._templateParser.expressionParser, DEFAULT_INTERPOLATION_CONFIG, schemaRegistry, [], errors);
        // Process all components and directives
        directives.forEach(function (directiveType) {
            var directiveMetadata = _this._metadataResolver.getDirectiveMetadata(directiveType);
            if (directiveMetadata.isComponent) {
                var module = ngModuleByPipeOrDirective.get(directiveType);
                module ||
                    error("Cannot determine the module for component '" + identifierName(directiveMetadata.type) + "'");
                var htmlAst = directiveMetadata.template.htmlAst;
                var preserveWhitespaces = directiveMetadata.template.preserveWhitespaces;
                if (!preserveWhitespaces) {
                    htmlAst = removeWhitespaces(htmlAst);
                }
                var render3Ast = htmlAstToRender3Ast(htmlAst.rootNodes, hostBindingParser);
                // Map of StaticType by directive selectors
                var directiveTypeBySel_1 = new Map();
                var directives_1 = module.transitiveModule.directives.map(function (dir) { return _this._metadataResolver.getDirectiveSummary(dir.reference); });
                directives_1.forEach(function (directive) {
                    if (directive.selector) {
                        directiveTypeBySel_1.set(directive.selector, directive.type.reference);
                    }
                });
                // Map of StaticType by pipe names
                var pipeTypeByName_1 = new Map();
                var pipes_1 = module.transitiveModule.pipes.map(function (pipe) { return _this._metadataResolver.getPipeSummary(pipe.reference); });
                pipes_1.forEach(function (pipe) { pipeTypeByName_1.set(pipe.name, pipe.type.reference); });
                compileR3Component(context, directiveMetadata, render3Ast, _this.reflector, hostBindingParser, directiveTypeBySel_1, pipeTypeByName_1);
            }
            else {
                compileR3Directive(context, directiveMetadata, _this.reflector, hostBindingParser);
            }
        });
        pipes.forEach(function (pipeType) {
            var pipeMetadata = _this._metadataResolver.getPipeMetadata(pipeType);
            if (pipeMetadata) {
                compileR3Pipe(context, pipeMetadata, _this.reflector);
            }
        });
        injectables.forEach(function (injectable) { return _this._injectableCompiler.compile(injectable, context); });
    };
    AotCompiler.prototype.emitAllPartialModules2 = function (files) {
        var _this = this;
        // Using reduce like this is a select many pattern (where map is a select pattern)
        return files.reduce(function (r, file) {
            r.push.apply(r, __spread(_this._emitPartialModule2(file.fileName, file.injectables)));
            return r;
        }, []);
    };
    AotCompiler.prototype._emitPartialModule2 = function (fileName, injectables) {
        var _this = this;
        var context = this._createOutputContext(fileName);
        injectables.forEach(function (injectable) { return _this._injectableCompiler.compile(injectable, context); });
        if (context.statements && context.statements.length > 0) {
            return [{ fileName: fileName, statements: __spread(context.constantPool.statements, context.statements) }];
        }
        return [];
    };
    AotCompiler.prototype.emitAllImpls = function (analyzeResult) {
        var _this = this;
        var ngModuleByPipeOrDirective = analyzeResult.ngModuleByPipeOrDirective, files = analyzeResult.files;
        var sourceModules = files.map(function (file) { return _this._compileImplFile(file.fileName, ngModuleByPipeOrDirective, file.directives, file.pipes, file.ngModules, file.injectables); });
        return flatten(sourceModules);
    };
    AotCompiler.prototype._compileImplFile = function (srcFileUrl, ngModuleByPipeOrDirective, directives, pipes, ngModules, injectables) {
        var _this = this;
        var fileSuffix = normalizeGenFileSuffix(splitTypescriptSuffix(srcFileUrl, true)[1]);
        var generatedFiles = [];
        var outputCtx = this._createOutputContext(ngfactoryFilePath(srcFileUrl, true));
        generatedFiles.push.apply(generatedFiles, __spread(this._createSummary(srcFileUrl, directives, pipes, ngModules, injectables, outputCtx)));
        // compile all ng modules
        ngModules.forEach(function (ngModuleMeta) { return _this._compileModule(outputCtx, ngModuleMeta); });
        // compile components
        directives.forEach(function (dirType) {
            var compMeta = _this._metadataResolver.getDirectiveMetadata(dirType);
            if (!compMeta.isComponent) {
                return;
            }
            var ngModule = ngModuleByPipeOrDirective.get(dirType);
            if (!ngModule) {
                throw new Error("Internal Error: cannot determine the module for component " + identifierName(compMeta.type) + "!");
            }
            // compile styles
            var componentStylesheet = _this._styleCompiler.compileComponent(outputCtx, compMeta);
            // Note: compMeta is a component and therefore template is non null.
            compMeta.template.externalStylesheets.forEach(function (stylesheetMeta) {
                // Note: fill non shim and shim style files as they might
                // be shared by component with and without ViewEncapsulation.
                var shim = _this._styleCompiler.needsStyleShim(compMeta);
                generatedFiles.push(_this._codegenStyles(srcFileUrl, compMeta, stylesheetMeta, shim, fileSuffix));
                if (_this._options.allowEmptyCodegenFiles) {
                    generatedFiles.push(_this._codegenStyles(srcFileUrl, compMeta, stylesheetMeta, !shim, fileSuffix));
                }
            });
            // compile components
            var compViewVars = _this._compileComponent(outputCtx, compMeta, ngModule, ngModule.transitiveModule.directives, componentStylesheet, fileSuffix);
            _this._compileComponentFactory(outputCtx, compMeta, ngModule, fileSuffix);
        });
        if (outputCtx.statements.length > 0 || this._options.allowEmptyCodegenFiles) {
            var srcModule = this._codegenSourceModule(srcFileUrl, outputCtx);
            generatedFiles.unshift(srcModule);
        }
        return generatedFiles;
    };
    AotCompiler.prototype._createSummary = function (srcFileName, directives, pipes, ngModules, injectables, ngFactoryCtx) {
        var _this = this;
        var symbolSummaries = this._symbolResolver.getSymbolsOf(srcFileName)
            .map(function (symbol) { return _this._symbolResolver.resolveSymbol(symbol); });
        var typeData = __spread(ngModules.map(function (meta) { return ({
            summary: _this._metadataResolver.getNgModuleSummary(meta.type.reference),
            metadata: _this._metadataResolver.getNgModuleMetadata(meta.type.reference)
        }); }), directives.map(function (ref) { return ({
            summary: _this._metadataResolver.getDirectiveSummary(ref),
            metadata: _this._metadataResolver.getDirectiveMetadata(ref)
        }); }), pipes.map(function (ref) { return ({
            summary: _this._metadataResolver.getPipeSummary(ref),
            metadata: _this._metadataResolver.getPipeMetadata(ref)
        }); }), injectables.map(function (ref) { return ({
            summary: _this._metadataResolver.getInjectableSummary(ref.symbol),
            metadata: _this._metadataResolver.getInjectableSummary(ref.symbol).type
        }); }));
        var forJitOutputCtx = this._options.enableSummariesForJit ?
            this._createOutputContext(summaryForJitFileName(srcFileName, true)) :
            null;
        var _a = serializeSummaries(srcFileName, forJitOutputCtx, this._summaryResolver, this._symbolResolver, symbolSummaries, typeData, this._options.createExternalSymbolFactoryReexports), json = _a.json, exportAs = _a.exportAs;
        exportAs.forEach(function (entry) {
            ngFactoryCtx.statements.push(o.variable(entry.exportAs).set(ngFactoryCtx.importExpr(entry.symbol)).toDeclStmt(null, [
                o.StmtModifier.Exported
            ]));
        });
        var summaryJson = new GeneratedFile(srcFileName, summaryFileName(srcFileName), json);
        var result = [summaryJson];
        if (forJitOutputCtx) {
            result.push(this._codegenSourceModule(srcFileName, forJitOutputCtx));
        }
        return result;
    };
    AotCompiler.prototype._compileModule = function (outputCtx, ngModule) {
        var providers = [];
        if (this._options.locale) {
            var normalizedLocale = this._options.locale.replace(/_/g, '-');
            providers.push({
                token: createTokenForExternalReference(this.reflector, Identifiers.LOCALE_ID),
                useValue: normalizedLocale,
            });
        }
        if (this._options.i18nFormat) {
            providers.push({
                token: createTokenForExternalReference(this.reflector, Identifiers.TRANSLATIONS_FORMAT),
                useValue: this._options.i18nFormat
            });
        }
        this._ngModuleCompiler.compile(outputCtx, ngModule, providers);
    };
    AotCompiler.prototype._compileComponentFactory = function (outputCtx, compMeta, ngModule, fileSuffix) {
        var hostMeta = this._metadataResolver.getHostComponentMetadata(compMeta);
        var hostViewFactoryVar = this._compileComponent(outputCtx, hostMeta, ngModule, [compMeta.type], null, fileSuffix)
            .viewClassVar;
        var compFactoryVar = componentFactoryName(compMeta.type.reference);
        var inputsExprs = [];
        for (var propName in compMeta.inputs) {
            var templateName = compMeta.inputs[propName];
            // Don't quote so that the key gets minified...
            inputsExprs.push(new o.LiteralMapEntry(propName, o.literal(templateName), false));
        }
        var outputsExprs = [];
        for (var propName in compMeta.outputs) {
            var templateName = compMeta.outputs[propName];
            // Don't quote so that the key gets minified...
            outputsExprs.push(new o.LiteralMapEntry(propName, o.literal(templateName), false));
        }
        outputCtx.statements.push(o.variable(compFactoryVar)
            .set(o.importExpr(Identifiers.createComponentFactory).callFn([
            o.literal(compMeta.selector), outputCtx.importExpr(compMeta.type.reference),
            o.variable(hostViewFactoryVar), new o.LiteralMapExpr(inputsExprs),
            new o.LiteralMapExpr(outputsExprs),
            o.literalArr(compMeta.template.ngContentSelectors.map(function (selector) { return o.literal(selector); }))
        ]))
            .toDeclStmt(o.importType(Identifiers.ComponentFactory, [o.expressionType(outputCtx.importExpr(compMeta.type.reference))], [o.TypeModifier.Const]), [o.StmtModifier.Final, o.StmtModifier.Exported]));
    };
    AotCompiler.prototype._compileComponent = function (outputCtx, compMeta, ngModule, directiveIdentifiers, componentStyles, fileSuffix) {
        var _a = this._parseTemplate(compMeta, ngModule, directiveIdentifiers), parsedTemplate = _a.template, usedPipes = _a.pipes;
        var stylesExpr = componentStyles ? o.variable(componentStyles.stylesVar) : o.literalArr([]);
        var viewResult = this._viewCompiler.compileComponent(outputCtx, compMeta, parsedTemplate, stylesExpr, usedPipes);
        if (componentStyles) {
            _resolveStyleStatements(this._symbolResolver, componentStyles, this._styleCompiler.needsStyleShim(compMeta), fileSuffix);
        }
        return viewResult;
    };
    AotCompiler.prototype._parseTemplate = function (compMeta, ngModule, directiveIdentifiers) {
        var _this = this;
        if (this._templateAstCache.has(compMeta.type.reference)) {
            return this._templateAstCache.get(compMeta.type.reference);
        }
        var preserveWhitespaces = compMeta.template.preserveWhitespaces;
        var directives = directiveIdentifiers.map(function (dir) { return _this._metadataResolver.getDirectiveSummary(dir.reference); });
        var pipes = ngModule.transitiveModule.pipes.map(function (pipe) { return _this._metadataResolver.getPipeSummary(pipe.reference); });
        var result = this._templateParser.parse(compMeta, compMeta.template.htmlAst, directives, pipes, ngModule.schemas, templateSourceUrl(ngModule.type, compMeta, compMeta.template), preserveWhitespaces);
        this._templateAstCache.set(compMeta.type.reference, result);
        return result;
    };
    AotCompiler.prototype._createOutputContext = function (genFilePath) {
        var _this = this;
        var importExpr = function (symbol, typeParams, useSummaries) {
            if (typeParams === void 0) { typeParams = null; }
            if (useSummaries === void 0) { useSummaries = true; }
            if (!(symbol instanceof StaticSymbol)) {
                throw new Error("Internal error: unknown identifier " + JSON.stringify(symbol));
            }
            var arity = _this._symbolResolver.getTypeArity(symbol) || 0;
            var _a = _this._symbolResolver.getImportAs(symbol, useSummaries) || symbol, filePath = _a.filePath, name = _a.name, members = _a.members;
            var importModule = _this._fileNameToModuleName(filePath, genFilePath);
            // It should be good enough to compare filePath to genFilePath and if they are equal
            // there is a self reference. However, ngfactory files generate to .ts but their
            // symbols have .d.ts so a simple compare is insufficient. They should be canonical
            // and is tracked by #17705.
            var selfReference = _this._fileNameToModuleName(genFilePath, genFilePath);
            var moduleName = importModule === selfReference ? null : importModule;
            // If we are in a type expression that refers to a generic type then supply
            // the required type parameters. If there were not enough type parameters
            // supplied, supply any as the type. Outside a type expression the reference
            // should not supply type parameters and be treated as a simple value reference
            // to the constructor function itself.
            var suppliedTypeParams = typeParams || [];
            var missingTypeParamsCount = arity - suppliedTypeParams.length;
            var allTypeParams = suppliedTypeParams.concat(newArray(missingTypeParamsCount, o.DYNAMIC_TYPE));
            return members.reduce(function (expr, memberName) { return expr.prop(memberName); }, o.importExpr(new o.ExternalReference(moduleName, name, null), allTypeParams));
        };
        return { statements: [], genFilePath: genFilePath, importExpr: importExpr, constantPool: new ConstantPool() };
    };
    AotCompiler.prototype._fileNameToModuleName = function (importedFilePath, containingFilePath) {
        return this._summaryResolver.getKnownModuleName(importedFilePath) ||
            this._symbolResolver.getKnownModuleName(importedFilePath) ||
            this._host.fileNameToModuleName(importedFilePath, containingFilePath);
    };
    AotCompiler.prototype._codegenStyles = function (srcFileUrl, compMeta, stylesheetMetadata, isShimmed, fileSuffix) {
        var outputCtx = this._createOutputContext(_stylesModuleUrl(stylesheetMetadata.moduleUrl, isShimmed, fileSuffix));
        var compiledStylesheet = this._styleCompiler.compileStyles(outputCtx, compMeta, stylesheetMetadata, isShimmed);
        _resolveStyleStatements(this._symbolResolver, compiledStylesheet, isShimmed, fileSuffix);
        return this._codegenSourceModule(srcFileUrl, outputCtx);
    };
    AotCompiler.prototype._codegenSourceModule = function (srcFileUrl, ctx) {
        return new GeneratedFile(srcFileUrl, ctx.genFilePath, ctx.statements);
    };
    AotCompiler.prototype.listLazyRoutes = function (entryRoute, analyzedModules) {
        var e_2, _a, e_3, _b;
        var self = this;
        if (entryRoute) {
            var symbol = parseLazyRoute(entryRoute, this.reflector).referencedModule;
            return visitLazyRoute(symbol);
        }
        else if (analyzedModules) {
            var allLazyRoutes = [];
            try {
                for (var _c = __values(analyzedModules.ngModules), _d = _c.next(); !_d.done; _d = _c.next()) {
                    var ngModule = _d.value;
                    var lazyRoutes = listLazyRoutes(ngModule, this.reflector);
                    try {
                        for (var lazyRoutes_1 = (e_3 = void 0, __values(lazyRoutes)), lazyRoutes_1_1 = lazyRoutes_1.next(); !lazyRoutes_1_1.done; lazyRoutes_1_1 = lazyRoutes_1.next()) {
                            var lazyRoute = lazyRoutes_1_1.value;
                            allLazyRoutes.push(lazyRoute);
                        }
                    }
                    catch (e_3_1) { e_3 = { error: e_3_1 }; }
                    finally {
                        try {
                            if (lazyRoutes_1_1 && !lazyRoutes_1_1.done && (_b = lazyRoutes_1.return)) _b.call(lazyRoutes_1);
                        }
                        finally { if (e_3) throw e_3.error; }
                    }
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
                }
                finally { if (e_2) throw e_2.error; }
            }
            return allLazyRoutes;
        }
        else {
            throw new Error("Either route or analyzedModules has to be specified!");
        }
        function visitLazyRoute(symbol, seenRoutes, allLazyRoutes) {
            var e_4, _a;
            if (seenRoutes === void 0) { seenRoutes = new Set(); }
            if (allLazyRoutes === void 0) { allLazyRoutes = []; }
            // Support pointing to default exports, but stop recursing there,
            // as the StaticReflector does not yet support default exports.
            if (seenRoutes.has(symbol) || !symbol.name) {
                return allLazyRoutes;
            }
            seenRoutes.add(symbol);
            var lazyRoutes = listLazyRoutes(self._metadataResolver.getNgModuleMetadata(symbol, true), self.reflector);
            try {
                for (var lazyRoutes_2 = __values(lazyRoutes), lazyRoutes_2_1 = lazyRoutes_2.next(); !lazyRoutes_2_1.done; lazyRoutes_2_1 = lazyRoutes_2.next()) {
                    var lazyRoute = lazyRoutes_2_1.value;
                    allLazyRoutes.push(lazyRoute);
                    visitLazyRoute(lazyRoute.referencedModule, seenRoutes, allLazyRoutes);
                }
            }
            catch (e_4_1) { e_4 = { error: e_4_1 }; }
            finally {
                try {
                    if (lazyRoutes_2_1 && !lazyRoutes_2_1.done && (_a = lazyRoutes_2.return)) _a.call(lazyRoutes_2);
                }
                finally { if (e_4) throw e_4.error; }
            }
            return allLazyRoutes;
        }
    };
    return AotCompiler;
}());
export { AotCompiler };
function _createEmptyStub(outputCtx) {
    // Note: We need to produce at least one import statement so that
    // TypeScript knows that the file is an es6 module. Otherwise our generated
    // exports / imports won't be emitted properly by TypeScript.
    outputCtx.statements.push(o.importExpr(Identifiers.ComponentFactory).toStmt());
}
function _resolveStyleStatements(symbolResolver, compileResult, needsShim, fileSuffix) {
    compileResult.dependencies.forEach(function (dep) {
        dep.setValue(symbolResolver.getStaticSymbol(_stylesModuleUrl(dep.moduleUrl, needsShim, fileSuffix), dep.name));
    });
}
function _stylesModuleUrl(stylesheetUrl, shim, suffix) {
    return "" + stylesheetUrl + (shim ? '.shim' : '') + ".ngstyle" + suffix;
}
export function analyzeNgModules(fileNames, host, staticSymbolResolver, metadataResolver) {
    var files = _analyzeFilesIncludingNonProgramFiles(fileNames, host, staticSymbolResolver, metadataResolver);
    return mergeAnalyzedFiles(files);
}
export function analyzeAndValidateNgModules(fileNames, host, staticSymbolResolver, metadataResolver) {
    return validateAnalyzedModules(analyzeNgModules(fileNames, host, staticSymbolResolver, metadataResolver));
}
function validateAnalyzedModules(analyzedModules) {
    if (analyzedModules.symbolsMissingModule && analyzedModules.symbolsMissingModule.length) {
        var messages = analyzedModules.symbolsMissingModule.map(function (s) {
            return "Cannot determine the module for class " + s.name + " in " + s.filePath + "! Add " + s.name + " to the NgModule to fix it.";
        });
        throw syntaxError(messages.join('\n'));
    }
    return analyzedModules;
}
// Analyzes all of the program files,
// including files that are not part of the program
// but are referenced by an NgModule.
function _analyzeFilesIncludingNonProgramFiles(fileNames, host, staticSymbolResolver, metadataResolver) {
    var seenFiles = new Set();
    var files = [];
    var visitFile = function (fileName) {
        if (seenFiles.has(fileName) || !host.isSourceFile(fileName)) {
            return false;
        }
        seenFiles.add(fileName);
        var analyzedFile = analyzeFile(host, staticSymbolResolver, metadataResolver, fileName);
        files.push(analyzedFile);
        analyzedFile.ngModules.forEach(function (ngModule) {
            ngModule.transitiveModule.modules.forEach(function (modMeta) { return visitFile(modMeta.reference.filePath); });
        });
    };
    fileNames.forEach(function (fileName) { return visitFile(fileName); });
    return files;
}
export function analyzeFile(host, staticSymbolResolver, metadataResolver, fileName) {
    var abstractDirectives = [];
    var directives = [];
    var pipes = [];
    var injectables = [];
    var ngModules = [];
    var hasDecorators = staticSymbolResolver.hasDecorators(fileName);
    var exportsNonSourceFiles = false;
    var isDeclarationFile = fileName.endsWith('.d.ts');
    // Don't analyze .d.ts files that have no decorators as a shortcut
    // to speed up the analysis. This prevents us from
    // resolving the references in these files.
    // Note: exportsNonSourceFiles is only needed when compiling with summaries,
    // which is not the case when .d.ts files are treated as input files.
    if (!isDeclarationFile || hasDecorators) {
        staticSymbolResolver.getSymbolsOf(fileName).forEach(function (symbol) {
            var resolvedSymbol = staticSymbolResolver.resolveSymbol(symbol);
            var symbolMeta = resolvedSymbol.metadata;
            if (!symbolMeta || symbolMeta.__symbolic === 'error') {
                return;
            }
            var isNgSymbol = false;
            if (symbolMeta.__symbolic === 'class') {
                if (metadataResolver.isDirective(symbol)) {
                    isNgSymbol = true;
                    if (!isDeclarationFile) {
                        // This directive either has a selector or doesn't. Selector-less directives get tracked
                        // in abstractDirectives, not directives. The compiler doesn't deal with selector-less
                        // directives at all, really, other than to persist their metadata. This is done so that
                        // apps will have an easier time migrating to Ivy, which requires the selector-less
                        // annotations to be applied.
                        if (!metadataResolver.isAbstractDirective(symbol)) {
                            // The directive is an ordinary directive.
                            directives.push(symbol);
                        }
                        else {
                            // The directive has no selector and is an "abstract" directive, so track it
                            // accordingly.
                            abstractDirectives.push(symbol);
                        }
                    }
                    else {
                        directives.push(symbol);
                    }
                }
                else if (metadataResolver.isPipe(symbol)) {
                    isNgSymbol = true;
                    pipes.push(symbol);
                }
                else if (metadataResolver.isNgModule(symbol)) {
                    var ngModule = metadataResolver.getNgModuleMetadata(symbol, false);
                    if (ngModule) {
                        isNgSymbol = true;
                        ngModules.push(ngModule);
                    }
                }
                else if (metadataResolver.isInjectable(symbol)) {
                    isNgSymbol = true;
                    var injectable = metadataResolver.getInjectableMetadata(symbol, null, false);
                    if (injectable) {
                        injectables.push(injectable);
                    }
                }
            }
            if (!isNgSymbol) {
                exportsNonSourceFiles =
                    exportsNonSourceFiles || isValueExportingNonSourceFile(host, symbolMeta);
            }
        });
    }
    return {
        fileName: fileName, directives: directives, abstractDirectives: abstractDirectives, pipes: pipes,
        ngModules: ngModules, injectables: injectables, exportsNonSourceFiles: exportsNonSourceFiles,
    };
}
export function analyzeFileForInjectables(host, staticSymbolResolver, metadataResolver, fileName) {
    var injectables = [];
    var shallowModules = [];
    if (staticSymbolResolver.hasDecorators(fileName)) {
        staticSymbolResolver.getSymbolsOf(fileName).forEach(function (symbol) {
            var resolvedSymbol = staticSymbolResolver.resolveSymbol(symbol);
            var symbolMeta = resolvedSymbol.metadata;
            if (!symbolMeta || symbolMeta.__symbolic === 'error') {
                return;
            }
            if (symbolMeta.__symbolic === 'class') {
                if (metadataResolver.isInjectable(symbol)) {
                    var injectable = metadataResolver.getInjectableMetadata(symbol, null, false);
                    if (injectable) {
                        injectables.push(injectable);
                    }
                }
                else if (metadataResolver.isNgModule(symbol)) {
                    var module = metadataResolver.getShallowModuleMetadata(symbol);
                    if (module) {
                        shallowModules.push(module);
                    }
                }
            }
        });
    }
    return { fileName: fileName, injectables: injectables, shallowModules: shallowModules };
}
function isValueExportingNonSourceFile(host, metadata) {
    var exportsNonSourceFiles = false;
    var Visitor = /** @class */ (function () {
        function Visitor() {
        }
        Visitor.prototype.visitArray = function (arr, context) {
            var _this = this;
            arr.forEach(function (v) { return visitValue(v, _this, context); });
        };
        Visitor.prototype.visitStringMap = function (map, context) {
            var _this = this;
            Object.keys(map).forEach(function (key) { return visitValue(map[key], _this, context); });
        };
        Visitor.prototype.visitPrimitive = function (value, context) { };
        Visitor.prototype.visitOther = function (value, context) {
            if (value instanceof StaticSymbol && !host.isSourceFile(value.filePath)) {
                exportsNonSourceFiles = true;
            }
        };
        return Visitor;
    }());
    visitValue(metadata, new Visitor(), null);
    return exportsNonSourceFiles;
}
export function mergeAnalyzedFiles(analyzedFiles) {
    var allNgModules = [];
    var ngModuleByPipeOrDirective = new Map();
    var allPipesAndDirectives = new Set();
    analyzedFiles.forEach(function (af) {
        af.ngModules.forEach(function (ngModule) {
            allNgModules.push(ngModule);
            ngModule.declaredDirectives.forEach(function (d) { return ngModuleByPipeOrDirective.set(d.reference, ngModule); });
            ngModule.declaredPipes.forEach(function (p) { return ngModuleByPipeOrDirective.set(p.reference, ngModule); });
        });
        af.directives.forEach(function (d) { return allPipesAndDirectives.add(d); });
        af.pipes.forEach(function (p) { return allPipesAndDirectives.add(p); });
    });
    var symbolsMissingModule = [];
    allPipesAndDirectives.forEach(function (ref) {
        if (!ngModuleByPipeOrDirective.has(ref)) {
            symbolsMissingModule.push(ref);
        }
    });
    return {
        ngModules: allNgModules,
        ngModuleByPipeOrDirective: ngModuleByPipeOrDirective,
        symbolsMissingModule: symbolsMissingModule,
        files: analyzedFiles
    };
}
function mergeAndValidateNgFiles(files) {
    return validateAnalyzedModules(mergeAnalyzedFiles(files));
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcGlsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci9zcmMvYW90L2NvbXBpbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7QUFFSCxPQUFPLEVBQThRLG9CQUFvQixFQUFFLE9BQU8sRUFBRSxjQUFjLEVBQUUsaUJBQWlCLEVBQUMsTUFBTSxxQkFBcUIsQ0FBQztBQUVsWCxPQUFPLEVBQUMsWUFBWSxFQUFDLE1BQU0sa0JBQWtCLENBQUM7QUFDOUMsT0FBTyxFQUFDLGlCQUFpQixFQUFDLE1BQU0sU0FBUyxDQUFDO0FBQzFDLE9BQU8sRUFBQyxhQUFhLEVBQUMsTUFBTSx3QkFBd0IsQ0FBQztBQUNyRCxPQUFPLEVBQUMsV0FBVyxFQUFFLCtCQUErQixFQUFDLE1BQU0sZ0JBQWdCLENBQUM7QUFHNUUsT0FBTyxFQUFDLFVBQVUsRUFBQyxNQUFNLDBCQUEwQixDQUFDO0FBQ3BELE9BQU8sRUFBQyxpQkFBaUIsRUFBQyxNQUFNLCtCQUErQixDQUFDO0FBQ2hFLE9BQU8sRUFBQyw0QkFBNEIsRUFBRSxtQkFBbUIsRUFBQyxNQUFNLG1DQUFtQyxDQUFDO0FBR3BHLE9BQU8sS0FBSyxDQUFDLE1BQU0sc0JBQXNCLENBQUM7QUFFMUMsT0FBTyxFQUFDLDBCQUEwQixJQUFJLGVBQWUsRUFBQyxNQUFNLCtCQUErQixDQUFDO0FBQzVGLE9BQU8sRUFBQyxzQkFBc0IsSUFBSSxhQUFhLEVBQUMsTUFBTSw2QkFBNkIsQ0FBQztBQUNwRixPQUFPLEVBQUMsbUJBQW1CLEVBQUMsTUFBTSxrQ0FBa0MsQ0FBQztBQUNyRSxPQUFPLEVBQUMsMkJBQTJCLElBQUksa0JBQWtCLEVBQUUsMkJBQTJCLElBQUksa0JBQWtCLEVBQUMsTUFBTSwwQkFBMEIsQ0FBQztBQUM5SSxPQUFPLEVBQUMsd0JBQXdCLEVBQUMsTUFBTSx1Q0FBdUMsQ0FBQztBQUcv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QXlCLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxTQUFTLEVBQUUsUUFBUSxDQUFDLEVBQXBELENBQW9ELENBQUMsQ0FBQztRQUM1RixDQUFDLENBQUMsQ0FBQztRQUNILEVBQUUsQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLFVBQUEsQ0FBQyxJQUFJLE9BQUEscUJBQXFCLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUE1QixDQUE0QixDQUFDLENBQUM7UUFDekQsRUFBRSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsVUFBQSxDQUFDLElBQUksT0FBQSxxQkFBcUIsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQTVCLENBQTRCLENBQUMsQ0FBQztJQUN0RCxDQUFDLENBQUMsQ0FBQztJQUVILElBQU0sb0JBQW9CLEdBQW1CLEVBQUUsQ0FBQztJQUNoRCxxQkFBcUIsQ0FBQyxPQUFPLENBQUMsVUFBQSxHQUFHO1FBQy9CLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUU7WUFDdkMsb0JBQW9CLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1NBQ2hDO0lBQ0gsQ0FBQyxDQUFDLENBQUM7SUFDSCxPQUFPO1FBQ0wsU0FBUyxFQUFFLFlBQVk7UUFDdkIseUJBQXlCLDJCQUFBO1FBQ3pCLG9CQUFvQixzQkFBQTtRQUNwQixLQUFLLEVBQUUsYUFBYTtLQUNyQixDQUFDO0FBQ0osQ0FBQztBQUVELFNBQVMsdUJBQXVCLENBQUMsS0FBdUI7SUFDdEQsT0FBTyx1QkFBdUIsQ0FBQyxrQkFBa0IsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO0FBQzVELENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7Q29tcGlsZURpcmVjdGl2ZU1ldGFkYXRhLCBDb21waWxlSWRlbnRpZmllck1ldGFkYXRhLCBDb21waWxlSW5qZWN0YWJsZU1ldGFkYXRhLCBDb21waWxlTmdNb2R1bGVNZXRhZGF0YSwgQ29tcGlsZVBpcGVNZXRhZGF0YSwgQ29tcGlsZVBpcGVTdW1tYXJ5LCBDb21waWxlUHJvdmlkZXJNZXRhZGF0YSwgQ29tcGlsZVNoYWxsb3dNb2R1bGVNZXRhZGF0YSwgQ29tcGlsZVN0eWxlc2hlZXRNZXRhZGF0YSwgQ29tcGlsZVR5cGVNZXRhZGF0YSwgQ29tcGlsZVR5cGVTdW1tYXJ5LCBjb21wb25lbnRGYWN0b3J5TmFtZSwgZmxhdHRlbiwgaWRlbnRpZmllck5hbWUsIHRlbXBsYXRlU291cmNlVXJsfSBmcm9tICcuLi9jb21waWxlX21ldGFkYXRhJztcbmltcG9ydCB7Q29tcGlsZXJDb25maWd9IGZyb20gJy4uL2NvbmZpZyc7XG5pbXBvcnQge0NvbnN0YW50UG9vbH0gZnJvbSAnLi4vY29uc3RhbnRfcG9vbCc7XG5pbXBvcnQge1ZpZXdFbmNhcHN1bGF0aW9ufSBmcm9tICcuLi9jb3JlJztcbmltcG9ydCB7TWVzc2FnZUJ1bmRsZX0gZnJvbSAnLi4vaTE4bi9tZXNzYWdlX2J1bmRsZSc7XG5pbXBvcnQge0lkZW50aWZpZXJzLCBjcmVhdGVUb2tlbkZvckV4dGVybmFsUmVmZXJlbmNlfSBmcm9tICcuLi9pZGVudGlmaWVycyc7XG5pbXBvcnQge0luamVjdGFibGVDb21waWxlcn0gZnJvbSAnLi4vaW5qZWN0YWJsZV9jb21waWxlcic7XG5pbXBvcnQge0NvbXBpbGVNZXRhZGF0YVJlc29sdmVyfSBmcm9tICcuLi9tZXRhZGF0YV9yZXNvbHZlcic7XG5pbXBvcnQge0h0bWxQYXJzZXJ9IGZyb20gJy4uL21sX3BhcnNlci9odG1sX3BhcnNlcic7XG5pbXBvcnQge3JlbW92ZVdoaXRlc3BhY2VzfSBmcm9tICcuLi9tbF9wYXJzZXIvaHRtbF93aGl0ZXNwYWNlcyc7XG5pbXBvcnQge0RFRkFVTFRfSU5URVJQT0xBVElPTl9DT05GSUcsIEludGVycG9sYXRpb25Db25maWd9IGZyb20gJy4uL21sX3BhcnNlci9pbnRlcnBvbGF0aW9uX2NvbmZpZyc7XG5pbXBvcnQge05nTW9kdWxlQ29tcGlsZXJ9IGZyb20gJy4uL25nX21vZHVsZV9jb21waWxlcic7XG5pbXBvcnQge091dHB1dEVtaXR0ZXJ9IGZyb20gJy4uL291dHB1dC9hYnN0cmFjdF9lbWl0dGVyJztcbmltcG9ydCAqIGFzIG8gZnJvbSAnLi4vb3V0cHV0L291dHB1dF9hc3QnO1xuaW1wb3J0IHtQYXJzZUVycm9yfSBmcm9tICcuLi9wYXJzZV91dGlsJztcbmltcG9ydCB7Y29tcGlsZU5nTW9kdWxlRnJvbVJlbmRlcjIgYXMgY29tcGlsZVIzTW9kdWxlfSBmcm9tICcuLi9yZW5kZXIzL3IzX21vZHVsZV9jb21waWxlcic7XG5pbXBvcnQge2NvbXBpbGVQaXBlRnJvbVJlbmRlcjIgYXMgY29tcGlsZVIzUGlwZX0gZnJvbSAnLi4vcmVuZGVyMy9yM19waXBlX2NvbXBpbGVyJztcbmltcG9ydCB7aHRtbEFzdFRvUmVuZGVyM0FzdH0gZnJvbSAnLi4vcmVuZGVyMy9yM190ZW1wbGF0ZV90cmFuc2Zvcm0nO1xuaW1wb3J0IHtjb21waWxlQ29tcG9uZW50RnJvbVJlbmRlcjIgYXMgY29tcGlsZVIzQ29tcG9uZW50LCBjb21waWxlRGlyZWN0aXZlRnJvbVJlbmRlcjIgYXMgY29tcGlsZVIzRGlyZWN0aXZlfSBmcm9tICcuLi9yZW5kZXIzL3ZpZXcvY29tcGlsZXInO1xuaW1wb3J0IHtEb21FbGVtZW50U2NoZW1hUmVnaXN0cnl9IGZyb20gJy4uL3NjaGVtYS9kb21fZWxlbWVudF9zY2hlbWFfcmVnaXN0cnknO1xuaW1wb3J0IHtDb21waWxlZFN0eWxlc2hlZXQsIFN0eWxlQ29tcGlsZXJ9IGZyb20gJy4uL3N0eWxlX2NvbXBpbGVyJztcbmltcG9ydCB7U3VtbWFyeVJlc29sdmVyfSBmcm9tICcuLi9zdW1tYXJ5X3Jlc29sdmVyJztcbmltcG9ydCB7QmluZGluZ1BhcnNlcn0gZnJvbSAnLi4vdGVtcGxhdGVfcGFyc2VyL2JpbmRpbmdfcGFyc2VyJztcbmltcG9ydCB7VGVtcGxhdGVBc3R9IGZyb20gJy4uL3RlbXBsYXRlX3BhcnNlci90ZW1wbGF0ZV9hc3QnO1xuaW1wb3J0IHtUZW1wbGF0ZVBhcnNlcn0gZnJvbSAnLi4vdGVtcGxhdGVfcGFyc2VyL3RlbXBsYXRlX3BhcnNlcic7XG5pbXBvcnQge091dHB1dENvbnRleHQsIFZhbHVlVmlzaXRvciwgZXJyb3IsIG5ld0FycmF5LCBzeW50YXhFcnJvciwgdmlzaXRWYWx1ZX0gZnJvbSAnLi4vdXRpbCc7XG5pbXBvcnQge1R5cGVDaGVja0NvbXBpbGVyfSBmcm9tICcuLi92aWV3X2NvbXBpbGVyL3R5cGVfY2hlY2tfY29tcGlsZXInO1xuaW1wb3J0IHtWaWV3Q29tcGlsZVJlc3VsdCwgVmlld0NvbXBpbGVyfSBmcm9tICcuLi92aWV3X2NvbXBpbGVyL3ZpZXdfY29tcGlsZXInO1xuXG5pbXBvcnQge0FvdENvbXBpbGVySG9zdH0gZnJvbSAnLi9jb21waWxlcl9ob3N0JztcbmltcG9ydCB7QW90Q29tcGlsZXJPcHRpb25zfSBmcm9tICcuL2NvbXBpbGVyX29wdGlvbnMnO1xuaW1wb3J0IHtHZW5lcmF0ZWRGaWxlfSBmcm9tICcuL2dlbmVyYXRlZF9maWxlJztcbmltcG9ydCB7TGF6eVJvdXRlLCBsaXN0TGF6eVJvdXRlcywgcGFyc2VMYXp5Um91dGV9IGZyb20gJy4vbGF6eV9yb3V0ZXMnO1xuaW1wb3J0IHtQYXJ0aWFsTW9kdWxlfSBmcm9tICcuL3BhcnRpYWxfbW9kdWxlJztcbmltcG9ydCB7U3RhdGljUmVmbGVjdG9yfSBmcm9tICcuL3N0YXRpY19yZWZsZWN0b3InO1xuaW1wb3J0IHtTdGF0aWNTeW1ib2x9IGZyb20gJy4vc3RhdGljX3N5bWJvbCc7XG5pbXBvcnQge1N0YXRpY1N5bWJvbFJlc29sdmVyfSBmcm9tICcuL3N0YXRpY19zeW1ib2xfcmVzb2x2ZXInO1xuaW1wb3J0IHtjcmVhdGVGb3JKaXRTdHViLCBzZXJpYWxpemVTdW1tYXJpZXN9IGZyb20gJy4vc3VtbWFyeV9zZXJpYWxpemVyJztcbmltcG9ydCB7bmdmYWN0b3J5RmlsZVBhdGgsIG5vcm1hbGl6ZUdlbkZpbGVTdWZmaXgsIHNwbGl0VHlwZXNjcmlwdFN1ZmZpeCwgc3VtbWFyeUZpbGVOYW1lLCBzdW1tYXJ5Rm9ySml0RmlsZU5hbWV9IGZyb20gJy4vdXRpbCc7XG5cbmNvbnN0IGVudW0gU3R1YkVtaXRGbGFncyB7IEJhc2ljID0gMSA8PCAwLCBUeXBlQ2hlY2sgPSAxIDw8IDEsIEFsbCA9IFR5cGVDaGVjayB8IEJhc2ljIH1cblxuZXhwb3J0IGNsYXNzIEFvdENvbXBpbGVyIHtcbiAgcHJpdmF0ZSBfdGVtcGxhdGVBc3RDYWNoZSA9XG4gICAgICBuZXcgTWFwPFN0YXRpY1N5bWJvbCwge3RlbXBsYXRlOiBUZW1wbGF0ZUFzdFtdLCBwaXBlczogQ29tcGlsZVBpcGVTdW1tYXJ5W119PigpO1xuICBwcml2YXRlIF9hbmFseXplZEZpbGVzID0gbmV3IE1hcDxzdHJpbmcsIE5nQW5hbHl6ZWRGaWxlPigpO1xuICBwcml2YXRlIF9hbmFseXplZEZpbGVzRm9ySW5qZWN0YWJsZXMgPSBuZXcgTWFwPHN0cmluZywgTmdBbmFseXplZEZpbGVXaXRoSW5qZWN0YWJsZXM+KCk7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgICBwcml2YXRlIF9jb25maWc6IENvbXBpbGVyQ29uZmlnLCBwcml2YXRlIF9vcHRpb25zOiBBb3RDb21waWxlck9wdGlvbnMsXG4gICAgICBwcml2YXRlIF9ob3N0OiBBb3RDb21waWxlckhvc3QsIHJlYWRvbmx5IHJlZmxlY3RvcjogU3RhdGljUmVmbGVjdG9yLFxuICAgICAgcHJpdmF0ZSBfbWV0YWRhdGFSZXNvbHZlcjogQ29tcGlsZU1ldGFkYXRhUmVzb2x2ZXIsIHByaXZhdGUgX3RlbXBsYXRlUGFyc2VyOiBUZW1wbGF0ZVBhcnNlcixcbiAgICAgIHByaXZhdGUgX3N0eWxlQ29tcGlsZXI6IFN0eWxlQ29tcGlsZXIsIHByaXZhdGUgX3ZpZXdDb21waWxlcjogVmlld0NvbXBpbGVyLFxuICAgICAgcHJpdmF0ZSBfdHlwZUNoZWNrQ29tcGlsZXI6IFR5cGVDaGVja0NvbXBpbGVyLCBwcml2YXRlIF9uZ01vZHVsZUNvbXBpbGVyOiBOZ01vZHVsZUNvbXBpbGVyLFxuICAgICAgcHJpdmF0ZSBfaW5qZWN0YWJsZUNvbXBpbGVyOiBJbmplY3RhYmxlQ29tcGlsZXIsIHByaXZhdGUgX291dHB1dEVtaXR0ZXI6IE91dHB1dEVtaXR0ZXIsXG4gICAgICBwcml2YXRlIF9zdW1tYXJ5UmVzb2x2ZXI6IFN1bW1hcnlSZXNvbHZlcjxTdGF0aWNTeW1ib2w+LFxuICAgICAgcHJpdmF0ZSBfc3ltYm9sUmVzb2x2ZXI6IFN0YXRpY1N5bWJvbFJlc29sdmVyKSB7fVxuXG4gIGNsZWFyQ2FjaGUoKSB7IHRoaXMuX21ldGFkYXRhUmVzb2x2ZXIuY2xlYXJDYWNoZSgpOyB9XG5cbiAgYW5hbHl6ZU1vZHVsZXNTeW5jKHJvb3RGaWxlczogc3RyaW5nW10pOiBOZ0FuYWx5emVkTW9kdWxlcyB7XG4gICAgY29uc3QgYW5hbHl6ZVJlc3VsdCA9IGFuYWx5emVBbmRWYWxpZGF0ZU5nTW9kdWxlcyhcbiAgICAgICAgcm9vdEZpbGVzLCB0aGlzLl9ob3N0LCB0aGlzLl9zeW1ib2xSZXNvbHZlciwgdGhpcy5fbWV0YWRhdGFSZXNvbHZlcik7XG4gICAgYW5hbHl6ZVJlc3VsdC5uZ01vZHVsZXMuZm9yRWFjaChcbiAgICAgICAgbmdNb2R1bGUgPT4gdGhpcy5fbWV0YWRhdGFSZXNvbHZlci5sb2FkTmdNb2R1bGVEaXJlY3RpdmVBbmRQaXBlTWV0YWRhdGEoXG4gICAgICAgICAgICBuZ01vZHVsZS50eXBlLnJlZmVyZW5jZSwgdHJ1ZSkpO1xuICAgIHJldHVybiBhbmFseXplUmVzdWx0O1xuICB9XG5cbiAgYW5hbHl6ZU1vZHVsZXNBc3luYyhyb290RmlsZXM6IHN0cmluZ1tdKTogUHJvbWlzZTxOZ0FuYWx5emVkTW9kdWxlcz4ge1xuICAgIGNvbnN0IGFuYWx5emVSZXN1bHQgPSBhbmFseXplQW5kVmFsaWRhdGVOZ01vZHVsZXMoXG4gICAgICAgIHJvb3RGaWxlcywgdGhpcy5faG9zdCwgdGhpcy5fc3ltYm9sUmVzb2x2ZXIsIHRoaXMuX21ldGFkYXRhUmVzb2x2ZXIpO1xuICAgIHJldHVybiBQcm9taXNlXG4gICAgICAgIC5hbGwoYW5hbHl6ZVJlc3VsdC5uZ01vZHVsZXMubWFwKFxuICAgICAgICAgICAgbmdNb2R1bGUgPT4gdGhpcy5fbWV0YWRhdGFSZXNvbHZlci5sb2FkTmdNb2R1bGVEaXJlY3RpdmVBbmRQaXBlTWV0YWRhdGEoXG4gICAgICAgICAgICAgICAgbmdNb2R1bGUudHlwZS5yZWZlcmVuY2UsIGZhbHNlKSkpXG4gICAgICAgIC50aGVuKCgpID0+IGFuYWx5emVSZXN1bHQpO1xuICB9XG5cbiAgcHJpdmF0ZSBfYW5hbHl6ZUZpbGUoZmlsZU5hbWU6IHN0cmluZyk6IE5nQW5hbHl6ZWRGaWxlIHtcbiAgICBsZXQgYW5hbHl6ZWRGaWxlID0gdGhpcy5fYW5hbHl6ZWRGaWxlcy5nZXQoZmlsZU5hbWUpO1xuICAgIGlmICghYW5hbHl6ZWRGaWxlKSB7XG4gICAgICBhbmFseXplZEZpbGUgPVxuICAgICAgICAgIGFuYWx5emVGaWxlKHRoaXMuX2hvc3QsIHRoaXMuX3N5bWJvbFJlc29sdmVyLCB0aGlzLl9tZXRhZGF0YVJlc29sdmVyLCBmaWxlTmFtZSk7XG4gICAgICB0aGlzLl9hbmFseXplZEZpbGVzLnNldChmaWxlTmFtZSwgYW5hbHl6ZWRGaWxlKTtcbiAgICB9XG4gICAgcmV0dXJuIGFuYWx5emVkRmlsZTtcbiAgfVxuXG4gIHByaXZhdGUgX2FuYWx5emVGaWxlRm9ySW5qZWN0YWJsZXMoZmlsZU5hbWU6IHN0cmluZyk6IE5nQW5hbHl6ZWRGaWxlV2l0aEluamVjdGFibGVzIHtcbiAgICBsZXQgYW5hbHl6ZWRGaWxlID0gdGhpcy5fYW5hbHl6ZWRGaWxlc0ZvckluamVjdGFibGVzLmdldChmaWxlTmFtZSk7XG4gICAgaWYgKCFhbmFseXplZEZpbGUpIHtcbiAgICAgIGFuYWx5emVkRmlsZSA9IGFuYWx5emVGaWxlRm9ySW5qZWN0YWJsZXMoXG4gICAgICAgICAgdGhpcy5faG9zdCwgdGhpcy5fc3ltYm9sUmVzb2x2ZXIsIHRoaXMuX21ldGFkYXRhUmVzb2x2ZXIsIGZpbGVOYW1lKTtcbiAgICAgIHRoaXMuX2FuYWx5emVkRmlsZXNGb3JJbmplY3RhYmxlcy5zZXQoZmlsZU5hbWUsIGFuYWx5emVkRmlsZSk7XG4gICAgfVxuICAgIHJldHVybiBhbmFseXplZEZpbGU7XG4gIH1cblxuICBmaW5kR2VuZXJhdGVkRmlsZU5hbWVzKGZpbGVOYW1lOiBzdHJpbmcpOiBzdHJpbmdbXSB7XG4gICAgY29uc3QgZ2VuRmlsZU5hbWVzOiBzdHJpbmdbXSA9IFtdO1xuICAgIGNvbnN0IGZpbGUgPSB0aGlzLl9hbmFseXplRmlsZShmaWxlTmFtZSk7XG4gICAgLy8gTWFrZSBzdXJlIHdlIGNyZWF0ZSBhIC5uZ2ZhY3RvcnkgaWYgd2UgaGF2ZSBhIGluamVjdGFibGUvZGlyZWN0aXZlL3BpcGUvTmdNb2R1bGVcbiAgICAvLyBvciBhIHJlZmVyZW5jZSB0byBhIG5vbiBzb3VyY2UgZmlsZS5cbiAgICAvLyBOb3RlOiBUaGlzIGlzIG92ZXJlc3RpbWF0aW5nIHRoZSByZXF1aXJlZCAubmdmYWN0b3J5IGZpbGVzIGFzIHRoZSByZWFsIGNhbGN1bGF0aW9uIGlzIGhhcmRlci5cbiAgICAvLyBPbmx5IGRvIHRoaXMgZm9yIFN0dWJFbWl0RmxhZ3MuQmFzaWMsIGFzIGFkZGluZyBhIHR5cGUgY2hlY2sgYmxvY2tcbiAgICAvLyBkb2VzIG5vdCBjaGFuZ2UgdGhpcyBmaWxlIChhcyB3ZSBnZW5lcmF0ZSB0eXBlIGNoZWNrIGJsb2NrcyBiYXNlZCBvbiBOZ01vZHVsZXMpLlxuICAgIGlmICh0aGlzLl9vcHRpb25zLmFsbG93RW1wdHlDb2RlZ2VuRmlsZXMgfHwgZmlsZS5kaXJlY3RpdmVzLmxlbmd0aCB8fCBmaWxlLnBpcGVzLmxlbmd0aCB8fFxuICAgICAgICBmaWxlLmluamVjdGFibGVzLmxlbmd0aCB8fCBmaWxlLm5nTW9kdWxlcy5sZW5ndGggfHwgZmlsZS5leHBvcnRzTm9uU291cmNlRmlsZXMpIHtcbiAgICAgIGdlbkZpbGVOYW1lcy5wdXNoKG5nZmFjdG9yeUZpbGVQYXRoKGZpbGUuZmlsZU5hbWUsIHRydWUpKTtcbiAgICAgIGlmICh0aGlzLl9vcHRpb25zLmVuYWJsZVN1bW1hcmllc0ZvckppdCkge1xuICAgICAgICBnZW5GaWxlTmFtZXMucHVzaChzdW1tYXJ5Rm9ySml0RmlsZU5hbWUoZmlsZS5maWxlTmFtZSwgdHJ1ZSkpO1xuICAgICAgfVxuICAgIH1cbiAgICBjb25zdCBmaWxlU3VmZml4ID0gbm9ybWFsaXplR2VuRmlsZVN1ZmZpeChzcGxpdFR5cGVzY3JpcHRTdWZmaXgoZmlsZS5maWxlTmFtZSwgdHJ1ZSlbMV0pO1xuICAgIGZpbGUuZGlyZWN0aXZlcy5mb3JFYWNoKChkaXJTeW1ib2wpID0+IHtcbiAgICAgIGNvbnN0IGNvbXBNZXRhID1cbiAgICAgICAgICB0aGlzLl9tZXRhZGF0YVJlc29sdmVyLmdldE5vbk5vcm1hbGl6ZWREaXJlY3RpdmVNZXRhZGF0YShkaXJTeW1ib2wpICEubWV0YWRhdGE7XG4gICAgICBpZiAoIWNvbXBNZXRhLmlzQ29tcG9uZW50KSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIC8vIE5vdGU6IGNvbXBNZXRhIGlzIGEgY29tcG9uZW50IGFuZCB0aGVyZWZvcmUgdGVtcGxhdGUgaXMgbm9uIG51bGwuXG4gICAgICBjb21wTWV0YS50ZW1wbGF0ZSAhLnN0eWxlVXJscy5mb3JFYWNoKChzdHlsZVVybCkgPT4ge1xuICAgICAgICBjb25zdCBub3JtYWxpemVkVXJsID0gdGhpcy5faG9zdC5yZXNvdXJjZU5hbWVUb0ZpbGVOYW1lKHN0eWxlVXJsLCBmaWxlLmZpbGVOYW1lKTtcbiAgICAgICAgaWYgKCFub3JtYWxpemVkVXJsKSB7XG4gICAgICAgICAgdGhyb3cgc3ludGF4RXJyb3IoYENvdWxkbid0IHJlc29sdmUgcmVzb3VyY2UgJHtzdHlsZVVybH0gcmVsYXRpdmUgdG8gJHtmaWxlLmZpbGVOYW1lfWApO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IG5lZWRzU2hpbSA9IChjb21wTWV0YS50ZW1wbGF0ZSAhLmVuY2Fwc3VsYXRpb24gfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2NvbmZpZy5kZWZhdWx0RW5jYXBzdWxhdGlvbikgPT09IFZpZXdFbmNhcHN1bGF0aW9uLkVtdWxhdGVkO1xuICAgICAgICBnZW5GaWxlTmFtZXMucHVzaChfc3R5bGVzTW9kdWxlVXJsKG5vcm1hbGl6ZWRVcmwsIG5lZWRzU2hpbSwgZmlsZVN1ZmZpeCkpO1xuICAgICAgICBpZiAodGhpcy5fb3B0aW9ucy5hbGxvd0VtcHR5Q29kZWdlbkZpbGVzKSB7XG4gICAgICAgICAgZ2VuRmlsZU5hbWVzLnB1c2goX3N0eWxlc01vZHVsZVVybChub3JtYWxpemVkVXJsLCAhbmVlZHNTaGltLCBmaWxlU3VmZml4KSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0pO1xuICAgIHJldHVybiBnZW5GaWxlTmFtZXM7XG4gIH1cblxuICBlbWl0QmFzaWNTdHViKGdlbkZpbGVOYW1lOiBzdHJpbmcsIG9yaWdpbmFsRmlsZU5hbWU/OiBzdHJpbmcpOiBHZW5lcmF0ZWRGaWxlIHtcbiAgICBjb25zdCBvdXRwdXRDdHggPSB0aGlzLl9jcmVhdGVPdXRwdXRDb250ZXh0KGdlbkZpbGVOYW1lKTtcbiAgICBpZiAoZ2VuRmlsZU5hbWUuZW5kc1dpdGgoJy5uZ2ZhY3RvcnkudHMnKSkge1xuICAgICAgaWYgKCFvcmlnaW5hbEZpbGVOYW1lKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgIGBBc3NlcnRpb24gZXJyb3I6IHJlcXVpcmUgdGhlIG9yaWdpbmFsIGZpbGUgZm9yIC5uZ2ZhY3RvcnkudHMgc3R1YnMuIEZpbGU6ICR7Z2VuRmlsZU5hbWV9YCk7XG4gICAgICB9XG4gICAgICBjb25zdCBvcmlnaW5hbEZpbGUgPSB0aGlzLl9hbmFseXplRmlsZShvcmlnaW5hbEZpbGVOYW1lKTtcbiAgICAgIHRoaXMuX2NyZWF0ZU5nRmFjdG9yeVN0dWIob3V0cHV0Q3R4LCBvcmlnaW5hbEZpbGUsIFN0dWJFbWl0RmxhZ3MuQmFzaWMpO1xuICAgIH0gZWxzZSBpZiAoZ2VuRmlsZU5hbWUuZW5kc1dpdGgoJy5uZ3N1bW1hcnkudHMnKSkge1xuICAgICAgaWYgKHRoaXMuX29wdGlvbnMuZW5hYmxlU3VtbWFyaWVzRm9ySml0KSB7XG4gICAgICAgIGlmICghb3JpZ2luYWxGaWxlTmFtZSkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgICAgYEFzc2VydGlvbiBlcnJvcjogcmVxdWlyZSB0aGUgb3JpZ2luYWwgZmlsZSBmb3IgLm5nc3VtbWFyeS50cyBzdHVicy4gRmlsZTogJHtnZW5GaWxlTmFtZX1gKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBvcmlnaW5hbEZpbGUgPSB0aGlzLl9hbmFseXplRmlsZShvcmlnaW5hbEZpbGVOYW1lKTtcbiAgICAgICAgX2NyZWF0ZUVtcHR5U3R1YihvdXRwdXRDdHgpO1xuICAgICAgICBvcmlnaW5hbEZpbGUubmdNb2R1bGVzLmZvckVhY2gobmdNb2R1bGUgPT4ge1xuICAgICAgICAgIC8vIGNyZWF0ZSBleHBvcnRzIHRoYXQgdXNlciBjb2RlIGNhbiByZWZlcmVuY2VcbiAgICAgICAgICBjcmVhdGVGb3JKaXRTdHViKG91dHB1dEN0eCwgbmdNb2R1bGUudHlwZS5yZWZlcmVuY2UpO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKGdlbkZpbGVOYW1lLmVuZHNXaXRoKCcubmdzdHlsZS50cycpKSB7XG4gICAgICBfY3JlYXRlRW1wdHlTdHViKG91dHB1dEN0eCk7XG4gICAgfVxuICAgIC8vIE5vdGU6IGZvciB0aGUgc3R1YnMsIHdlIGRvbid0IG5lZWQgYSBwcm9wZXJ0eSBzcmNGaWxlVXJsLFxuICAgIC8vIGFzIGxhdGVyIG9uIGluIGVtaXRBbGxJbXBscyB3ZSB3aWxsIGNyZWF0ZSB0aGUgcHJvcGVyIEdlbmVyYXRlZEZpbGVzIHdpdGggdGhlXG4gICAgLy8gY29ycmVjdCBzcmNGaWxlVXJsLlxuICAgIC8vIFRoaXMgaXMgZ29vZCBhcyBlLmcuIGZvciAubmdzdHlsZS50cyBmaWxlcyB3ZSBjYW4ndCBkZXJpdmVcbiAgICAvLyB0aGUgdXJsIG9mIGNvbXBvbmVudHMgYmFzZWQgb24gdGhlIGdlbkZpbGVVcmwuXG4gICAgcmV0dXJuIHRoaXMuX2NvZGVnZW5Tb3VyY2VNb2R1bGUoJ3Vua25vd24nLCBvdXRwdXRDdHgpO1xuICB9XG5cbiAgZW1pdFR5cGVDaGVja1N0dWIoZ2VuRmlsZU5hbWU6IHN0cmluZywgb3JpZ2luYWxGaWxlTmFtZTogc3RyaW5nKTogR2VuZXJhdGVkRmlsZXxudWxsIHtcbiAgICBjb25zdCBvcmlnaW5hbEZpbGUgPSB0aGlzLl9hbmFseXplRmlsZShvcmlnaW5hbEZpbGVOYW1lKTtcbiAgICBjb25zdCBvdXRwdXRDdHggPSB0aGlzLl9jcmVhdGVPdXRwdXRDb250ZXh0KGdlbkZpbGVOYW1lKTtcbiAgICBpZiAoZ2VuRmlsZU5hbWUuZW5kc1dpdGgoJy5uZ2ZhY3RvcnkudHMnKSkge1xuICAgICAgdGhpcy5fY3JlYXRlTmdGYWN0b3J5U3R1YihvdXRwdXRDdHgsIG9yaWdpbmFsRmlsZSwgU3R1YkVtaXRGbGFncy5UeXBlQ2hlY2spO1xuICAgIH1cbiAgICByZXR1cm4gb3V0cHV0Q3R4LnN0YXRlbWVudHMubGVuZ3RoID4gMCA/XG4gICAgICAgIHRoaXMuX2NvZGVnZW5Tb3VyY2VNb2R1bGUob3JpZ2luYWxGaWxlLmZpbGVOYW1lLCBvdXRwdXRDdHgpIDpcbiAgICAgICAgbnVsbDtcbiAgfVxuXG4gIGxvYWRGaWxlc0FzeW5jKGZpbGVOYW1lczogc3RyaW5nW10sIHRzRmlsZXM6IHN0cmluZ1tdKTogUHJvbWlzZTxcbiAgICAgIHthbmFseXplZE1vZHVsZXM6IE5nQW5hbHl6ZWRNb2R1bGVzLCBhbmFseXplZEluamVjdGFibGVzOiBOZ0FuYWx5emVkRmlsZVdpdGhJbmplY3RhYmxlc1tdfT4ge1xuICAgIGNvbnN0IGZpbGVzID0gZmlsZU5hbWVzLm1hcChmaWxlTmFtZSA9PiB0aGlzLl9hbmFseXplRmlsZShmaWxlTmFtZSkpO1xuICAgIGNvbnN0IGxvYWRpbmdQcm9taXNlczogUHJvbWlzZTxOZ0FuYWx5emVkTW9kdWxlcz5bXSA9IFtdO1xuICAgIGZpbGVzLmZvckVhY2goXG4gICAgICAgIGZpbGUgPT4gZmlsZS5uZ01vZHVsZXMuZm9yRWFjaChcbiAgICAgICAgICAgIG5nTW9kdWxlID0+XG4gICAgICAgICAgICAgICAgbG9hZGluZ1Byb21pc2VzLnB1c2godGhpcy5fbWV0YWRhdGFSZXNvbHZlci5sb2FkTmdNb2R1bGVEaXJlY3RpdmVBbmRQaXBlTWV0YWRhdGEoXG4gICAgICAgICAgICAgICAgICAgIG5nTW9kdWxlLnR5cGUucmVmZXJlbmNlLCBmYWxzZSkpKSk7XG4gICAgY29uc3QgYW5hbHl6ZWRJbmplY3RhYmxlcyA9IHRzRmlsZXMubWFwKHRzRmlsZSA9PiB0aGlzLl9hbmFseXplRmlsZUZvckluamVjdGFibGVzKHRzRmlsZSkpO1xuICAgIHJldHVybiBQcm9taXNlLmFsbChsb2FkaW5nUHJvbWlzZXMpLnRoZW4oXyA9PiAoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbmFseXplZE1vZHVsZXM6IG1lcmdlQW5kVmFsaWRhdGVOZ0ZpbGVzKGZpbGVzKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYW5hbHl6ZWRJbmplY3RhYmxlczogYW5hbHl6ZWRJbmplY3RhYmxlcyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pKTtcbiAgfVxuXG4gIGxvYWRGaWxlc1N5bmMoZmlsZU5hbWVzOiBzdHJpbmdbXSwgdHNGaWxlczogc3RyaW5nW10pOlxuICAgICAge2FuYWx5emVkTW9kdWxlczogTmdBbmFseXplZE1vZHVsZXMsIGFuYWx5emVkSW5qZWN0YWJsZXM6IE5nQW5hbHl6ZWRGaWxlV2l0aEluamVjdGFibGVzW119IHtcbiAgICBjb25zdCBmaWxlcyA9IGZpbGVOYW1lcy5tYXAoZmlsZU5hbWUgPT4gdGhpcy5fYW5hbHl6ZUZpbGUoZmlsZU5hbWUpKTtcbiAgICBmaWxlcy5mb3JFYWNoKFxuICAgICAgICBmaWxlID0+IGZpbGUubmdNb2R1bGVzLmZvckVhY2goXG4gICAgICAgICAgICBuZ01vZHVsZSA9PiB0aGlzLl9tZXRhZGF0YVJlc29sdmVyLmxvYWROZ01vZHVsZURpcmVjdGl2ZUFuZFBpcGVNZXRhZGF0YShcbiAgICAgICAgICAgICAgICBuZ01vZHVsZS50eXBlLnJlZmVyZW5jZSwgdHJ1ZSkpKTtcbiAgICBjb25zdCBhbmFseXplZEluamVjdGFibGVzID0gdHNGaWxlcy5tYXAodHNGaWxlID0+IHRoaXMuX2FuYWx5emVGaWxlRm9ySW5qZWN0YWJsZXModHNGaWxlKSk7XG4gICAgcmV0dXJuIHtcbiAgICAgIGFuYWx5emVkTW9kdWxlczogbWVyZ2VBbmRWYWxpZGF0ZU5nRmlsZXMoZmlsZXMpLFxuICAgICAgYW5hbHl6ZWRJbmplY3RhYmxlczogYW5hbHl6ZWRJbmplY3RhYmxlcyxcbiAgICB9O1xuICB9XG5cbiAgcHJpdmF0ZSBfY3JlYXRlTmdGYWN0b3J5U3R1YihcbiAgICAgIG91dHB1dEN0eDogT3V0cHV0Q29udGV4dCwgZmlsZTogTmdBbmFseXplZEZpbGUsIGVtaXRGbGFnczogU3R1YkVtaXRGbGFncykge1xuICAgIGxldCBjb21wb25lbnRJZCA9IDA7XG4gICAgZmlsZS5uZ01vZHVsZXMuZm9yRWFjaCgobmdNb2R1bGVNZXRhLCBuZ01vZHVsZUluZGV4KSA9PiB7XG4gICAgICAvLyBOb3RlOiB0aGUgY29kZSBiZWxvdyBuZWVkcyB0byBleGVjdXRlZCBmb3IgU3R1YkVtaXRGbGFncy5CYXNpYyBhbmQgU3R1YkVtaXRGbGFncy5UeXBlQ2hlY2ssXG4gICAgICAvLyBzbyB3ZSBkb24ndCBjaGFuZ2UgdGhlIC5uZ2ZhY3RvcnkgZmlsZSB0b28gbXVjaCB3aGVuIGFkZGluZyB0aGUgdHlwZS1jaGVjayBibG9jay5cblxuICAgICAgLy8gY3JlYXRlIGV4cG9ydHMgdGhhdCB1c2VyIGNvZGUgY2FuIHJlZmVyZW5jZVxuICAgICAgdGhpcy5fbmdNb2R1bGVDb21waWxlci5jcmVhdGVTdHViKG91dHB1dEN0eCwgbmdNb2R1bGVNZXRhLnR5cGUucmVmZXJlbmNlKTtcblxuICAgICAgLy8gYWRkIHJlZmVyZW5jZXMgdG8gdGhlIHN5bWJvbHMgZnJvbSB0aGUgbWV0YWRhdGEuXG4gICAgICAvLyBUaGVzZSBjYW4gYmUgdXNlZCBieSB0aGUgdHlwZSBjaGVjayBibG9jayBmb3IgY29tcG9uZW50cyxcbiAgICAgIC8vIGFuZCB0aGV5IGFsc28gY2F1c2UgVHlwZVNjcmlwdCB0byBpbmNsdWRlIHRoZXNlIGZpbGVzIGludG8gdGhlIHByb2dyYW0gdG9vLFxuICAgICAgLy8gd2hpY2ggd2lsbCBtYWtlIHRoZW0gcGFydCBvZiB0aGUgYW5hbHl6ZWRGaWxlcy5cbiAgICAgIGNvbnN0IGV4dGVybmFsUmVmZXJlbmNlczogU3RhdGljU3ltYm9sW10gPSBbXG4gICAgICAgIC8vIEFkZCByZWZlcmVuY2VzIHRoYXQgYXJlIGF2YWlsYWJsZSBmcm9tIGFsbCB0aGUgbW9kdWxlcyBhbmQgaW1wb3J0cy5cbiAgICAgICAgLi4ubmdNb2R1bGVNZXRhLnRyYW5zaXRpdmVNb2R1bGUuZGlyZWN0aXZlcy5tYXAoZCA9PiBkLnJlZmVyZW5jZSksXG4gICAgICAgIC4uLm5nTW9kdWxlTWV0YS50cmFuc2l0aXZlTW9kdWxlLnBpcGVzLm1hcChkID0+IGQucmVmZXJlbmNlKSxcbiAgICAgICAgLi4ubmdNb2R1bGVNZXRhLmltcG9ydGVkTW9kdWxlcy5tYXAobSA9PiBtLnR5cGUucmVmZXJlbmNlKSxcbiAgICAgICAgLi4ubmdNb2R1bGVNZXRhLmV4cG9ydGVkTW9kdWxlcy5tYXAobSA9PiBtLnR5cGUucmVmZXJlbmNlKSxcblxuICAgICAgICAvLyBBZGQgcmVmZXJlbmNlcyB0aGF0IG1pZ2h0IGJlIGluc2VydGVkIGJ5IHRoZSB0ZW1wbGF0ZSBjb21waWxlci5cbiAgICAgICAgLi4udGhpcy5fZXh0ZXJuYWxJZGVudGlmaWVyUmVmZXJlbmNlcyhbSWRlbnRpZmllcnMuVGVtcGxhdGVSZWYsIElkZW50aWZpZXJzLkVsZW1lbnRSZWZdKSxcbiAgICAgIF07XG5cbiAgICAgIGNvbnN0IGV4dGVybmFsUmVmZXJlbmNlVmFycyA9IG5ldyBNYXA8YW55LCBzdHJpbmc+KCk7XG4gICAgICBleHRlcm5hbFJlZmVyZW5jZXMuZm9yRWFjaCgocmVmLCB0eXBlSW5kZXgpID0+IHtcbiAgICAgICAgZXh0ZXJuYWxSZWZlcmVuY2VWYXJzLnNldChyZWYsIGBfZGVjbCR7bmdNb2R1bGVJbmRleH1fJHt0eXBlSW5kZXh9YCk7XG4gICAgICB9KTtcbiAgICAgIGV4dGVybmFsUmVmZXJlbmNlVmFycy5mb3JFYWNoKCh2YXJOYW1lLCByZWZlcmVuY2UpID0+IHtcbiAgICAgICAgb3V0cHV0Q3R4LnN0YXRlbWVudHMucHVzaChcbiAgICAgICAgICAgIG8udmFyaWFibGUodmFyTmFtZSlcbiAgICAgICAgICAgICAgICAuc2V0KG8uTlVMTF9FWFBSLmNhc3Qoby5EWU5BTUlDX1RZUEUpKVxuICAgICAgICAgICAgICAgIC50b0RlY2xTdG10KG8uZXhwcmVzc2lvblR5cGUob3V0cHV0Q3R4LmltcG9ydEV4cHIoXG4gICAgICAgICAgICAgICAgICAgIHJlZmVyZW5jZSwgLyogdHlwZVBhcmFtcyAqLyBudWxsLCAvKiB1c2VTdW1tYXJpZXMgKi8gZmFsc2UpKSkpO1xuICAgICAgfSk7XG5cbiAgICAgIGlmIChlbWl0RmxhZ3MgJiBTdHViRW1pdEZsYWdzLlR5cGVDaGVjaykge1xuICAgICAgICAvLyBhZGQgdGhlIHR5cGUtY2hlY2sgYmxvY2sgZm9yIGFsbCBjb21wb25lbnRzIG9mIHRoZSBOZ01vZHVsZVxuICAgICAgICBuZ01vZHVsZU1ldGEuZGVjbGFyZWREaXJlY3RpdmVzLmZvckVhY2goKGRpcklkKSA9PiB7XG4gICAgICAgICAgY29uc3QgY29tcE1ldGEgPSB0aGlzLl9tZXRhZGF0YVJlc29sdmVyLmdldERpcmVjdGl2ZU1ldGFkYXRhKGRpcklkLnJlZmVyZW5jZSk7XG4gICAgICAgICAgaWYgKCFjb21wTWV0YS5pc0NvbXBvbmVudCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cbiAgICAgICAgICBjb21wb25lbnRJZCsrO1xuICAgICAgICAgIHRoaXMuX2NyZWF0ZVR5cGVDaGVja0Jsb2NrKFxuICAgICAgICAgICAgICBvdXRwdXRDdHgsIGAke2NvbXBNZXRhLnR5cGUucmVmZXJlbmNlLm5hbWV9X0hvc3RfJHtjb21wb25lbnRJZH1gLCBuZ01vZHVsZU1ldGEsXG4gICAgICAgICAgICAgIHRoaXMuX21ldGFkYXRhUmVzb2x2ZXIuZ2V0SG9zdENvbXBvbmVudE1ldGFkYXRhKGNvbXBNZXRhKSwgW2NvbXBNZXRhLnR5cGVdLFxuICAgICAgICAgICAgICBleHRlcm5hbFJlZmVyZW5jZVZhcnMpO1xuICAgICAgICAgIHRoaXMuX2NyZWF0ZVR5cGVDaGVja0Jsb2NrKFxuICAgICAgICAgICAgICBvdXRwdXRDdHgsIGAke2NvbXBNZXRhLnR5cGUucmVmZXJlbmNlLm5hbWV9XyR7Y29tcG9uZW50SWR9YCwgbmdNb2R1bGVNZXRhLCBjb21wTWV0YSxcbiAgICAgICAgICAgICAgbmdNb2R1bGVNZXRhLnRyYW5zaXRpdmVNb2R1bGUuZGlyZWN0aXZlcywgZXh0ZXJuYWxSZWZlcmVuY2VWYXJzKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBpZiAob3V0cHV0Q3R4LnN0YXRlbWVudHMubGVuZ3RoID09PSAwKSB7XG4gICAgICBfY3JlYXRlRW1wdHlTdHViKG91dHB1dEN0eCk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfZXh0ZXJuYWxJZGVudGlmaWVyUmVmZXJlbmNlcyhyZWZlcmVuY2VzOiBvLkV4dGVybmFsUmVmZXJlbmNlW10pOiBTdGF0aWNTeW1ib2xbXSB7XG4gICAgY29uc3QgcmVzdWx0OiBTdGF0aWNTeW1ib2xbXSA9IFtdO1xuICAgIGZvciAobGV0IHJlZmVyZW5jZSBvZiByZWZlcmVuY2VzKSB7XG4gICAgICBjb25zdCB0b2tlbiA9IGNyZWF0ZVRva2VuRm9yRXh0ZXJuYWxSZWZlcmVuY2UodGhpcy5yZWZsZWN0b3IsIHJlZmVyZW5jZSk7XG4gICAgICBpZiAodG9rZW4uaWRlbnRpZmllcikge1xuICAgICAgICByZXN1bHQucHVzaCh0b2tlbi5pZGVudGlmaWVyLnJlZmVyZW5jZSk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICBwcml2YXRlIF9jcmVhdGVUeXBlQ2hlY2tCbG9jayhcbiAgICAgIGN0eDogT3V0cHV0Q29udGV4dCwgY29tcG9uZW50SWQ6IHN0cmluZywgbW9kdWxlTWV0YTogQ29tcGlsZU5nTW9kdWxlTWV0YWRhdGEsXG4gICAgICBjb21wTWV0YTogQ29tcGlsZURpcmVjdGl2ZU1ldGFkYXRhLCBkaXJlY3RpdmVzOiBDb21waWxlSWRlbnRpZmllck1ldGFkYXRhW10sXG4gICAgICBleHRlcm5hbFJlZmVyZW5jZVZhcnM6IE1hcDxhbnksIHN0cmluZz4pIHtcbiAgICBjb25zdCB7dGVtcGxhdGU6IHBhcnNlZFRlbXBsYXRlLCBwaXBlczogdXNlZFBpcGVzfSA9XG4gICAgICAgIHRoaXMuX3BhcnNlVGVtcGxhdGUoY29tcE1ldGEsIG1vZHVsZU1ldGEsIGRpcmVjdGl2ZXMpO1xuICAgIGN0eC5zdGF0ZW1lbnRzLnB1c2goLi4udGhpcy5fdHlwZUNoZWNrQ29tcGlsZXIuY29tcGlsZUNvbXBvbmVudChcbiAgICAgICAgY29tcG9uZW50SWQsIGNvbXBNZXRhLCBwYXJzZWRUZW1wbGF0ZSwgdXNlZFBpcGVzLCBleHRlcm5hbFJlZmVyZW5jZVZhcnMsIGN0eCkpO1xuICB9XG5cbiAgZW1pdE1lc3NhZ2VCdW5kbGUoYW5hbHl6ZVJlc3VsdDogTmdBbmFseXplZE1vZHVsZXMsIGxvY2FsZTogc3RyaW5nfG51bGwpOiBNZXNzYWdlQnVuZGxlIHtcbiAgICBjb25zdCBlcnJvcnM6IFBhcnNlRXJyb3JbXSA9IFtdO1xuICAgIGNvbnN0IGh0bWxQYXJzZXIgPSBuZXcgSHRtbFBhcnNlcigpO1xuXG4gICAgLy8gVE9ETyh2aWNiKTogaW1wbGljaXQgdGFncyAmIGF0dHJpYnV0ZXNcbiAgICBjb25zdCBtZXNzYWdlQnVuZGxlID0gbmV3IE1lc3NhZ2VCdW5kbGUoaHRtbFBhcnNlciwgW10sIHt9LCBsb2NhbGUpO1xuXG4gICAgYW5hbHl6ZVJlc3VsdC5maWxlcy5mb3JFYWNoKGZpbGUgPT4ge1xuICAgICAgY29uc3QgY29tcE1ldGFzOiBDb21waWxlRGlyZWN0aXZlTWV0YWRhdGFbXSA9IFtdO1xuICAgICAgZmlsZS5kaXJlY3RpdmVzLmZvckVhY2goZGlyZWN0aXZlVHlwZSA9PiB7XG4gICAgICAgIGNvbnN0IGRpck1ldGEgPSB0aGlzLl9tZXRhZGF0YVJlc29sdmVyLmdldERpcmVjdGl2ZU1ldGFkYXRhKGRpcmVjdGl2ZVR5cGUpO1xuICAgICAgICBpZiAoZGlyTWV0YSAmJiBkaXJNZXRhLmlzQ29tcG9uZW50KSB7XG4gICAgICAgICAgY29tcE1ldGFzLnB1c2goZGlyTWV0YSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgY29tcE1ldGFzLmZvckVhY2goY29tcE1ldGEgPT4ge1xuICAgICAgICBjb25zdCBodG1sID0gY29tcE1ldGEudGVtcGxhdGUgIS50ZW1wbGF0ZSAhO1xuICAgICAgICAvLyBUZW1wbGF0ZSBVUkwgcG9pbnRzIHRvIGVpdGhlciBhbiBIVE1MIG9yIFRTIGZpbGUgZGVwZW5kaW5nIG9uIHdoZXRoZXJcbiAgICAgICAgLy8gdGhlIGZpbGUgaXMgdXNlZCB3aXRoIGB0ZW1wbGF0ZVVybDpgIG9yIGB0ZW1wbGF0ZTpgLCByZXNwZWN0aXZlbHkuXG4gICAgICAgIGNvbnN0IHRlbXBsYXRlVXJsID0gY29tcE1ldGEudGVtcGxhdGUgIS50ZW1wbGF0ZVVybCAhO1xuICAgICAgICBjb25zdCBpbnRlcnBvbGF0aW9uQ29uZmlnID1cbiAgICAgICAgICAgIEludGVycG9sYXRpb25Db25maWcuZnJvbUFycmF5KGNvbXBNZXRhLnRlbXBsYXRlICEuaW50ZXJwb2xhdGlvbik7XG4gICAgICAgIGVycm9ycy5wdXNoKC4uLm1lc3NhZ2VCdW5kbGUudXBkYXRlRnJvbVRlbXBsYXRlKGh0bWwsIHRlbXBsYXRlVXJsLCBpbnRlcnBvbGF0aW9uQ29uZmlnKSAhKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgaWYgKGVycm9ycy5sZW5ndGgpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihlcnJvcnMubWFwKGUgPT4gZS50b1N0cmluZygpKS5qb2luKCdcXG4nKSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG1lc3NhZ2VCdW5kbGU7XG4gIH1cblxuICBlbWl0QWxsUGFydGlhbE1vZHVsZXMoXG4gICAgICB7bmdNb2R1bGVCeVBpcGVPckRpcmVjdGl2ZSwgZmlsZXN9OiBOZ0FuYWx5emVkTW9kdWxlcyxcbiAgICAgIHIzRmlsZXM6IE5nQW5hbHl6ZWRGaWxlV2l0aEluamVjdGFibGVzW10pOiBQYXJ0aWFsTW9kdWxlW10ge1xuICAgIGNvbnN0IGNvbnRleHRNYXAgPSBuZXcgTWFwPHN0cmluZywgT3V0cHV0Q29udGV4dD4oKTtcblxuICAgIGNvbnN0IGdldENvbnRleHQgPSAoZmlsZU5hbWU6IHN0cmluZyk6IE91dHB1dENvbnRleHQgPT4ge1xuICAgICAgaWYgKCFjb250ZXh0TWFwLmhhcyhmaWxlTmFtZSkpIHtcbiAgICAgICAgY29udGV4dE1hcC5zZXQoZmlsZU5hbWUsIHRoaXMuX2NyZWF0ZU91dHB1dENvbnRleHQoZmlsZU5hbWUpKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBjb250ZXh0TWFwLmdldChmaWxlTmFtZSkgITtcbiAgICB9O1xuXG4gICAgZmlsZXMuZm9yRWFjaChcbiAgICAgICAgZmlsZSA9PiB0aGlzLl9jb21waWxlUGFydGlhbE1vZHVsZShcbiAgICAgICAgICAgIGZpbGUuZmlsZU5hbWUsIG5nTW9kdWxlQnlQaXBlT3JEaXJlY3RpdmUsIGZpbGUuZGlyZWN0aXZlcywgZmlsZS5waXBlcywgZmlsZS5uZ01vZHVsZXMsXG4gICAgICAgICAgICBmaWxlLmluamVjdGFibGVzLCBnZXRDb250ZXh0KGZpbGUuZmlsZU5hbWUpKSk7XG4gICAgcjNGaWxlcy5mb3JFYWNoKFxuICAgICAgICBmaWxlID0+IHRoaXMuX2NvbXBpbGVTaGFsbG93TW9kdWxlcyhcbiAgICAgICAgICAgIGZpbGUuZmlsZU5hbWUsIGZpbGUuc2hhbGxvd01vZHVsZXMsIGdldENvbnRleHQoZmlsZS5maWxlTmFtZSkpKTtcblxuICAgIHJldHVybiBBcnJheS5mcm9tKGNvbnRleHRNYXAudmFsdWVzKCkpXG4gICAgICAgIC5tYXAoY29udGV4dCA9PiAoe1xuICAgICAgICAgICAgICAgZmlsZU5hbWU6IGNvbnRleHQuZ2VuRmlsZVBhdGgsXG4gICAgICAgICAgICAgICBzdGF0ZW1lbnRzOiBbLi4uY29udGV4dC5jb25zdGFudFBvb2wuc3RhdGVtZW50cywgLi4uY29udGV4dC5zdGF0ZW1lbnRzXSxcbiAgICAgICAgICAgICB9KSk7XG4gIH1cblxuICBwcml2YXRlIF9jb21waWxlU2hhbGxvd01vZHVsZXMoXG4gICAgICBmaWxlTmFtZTogc3RyaW5nLCBzaGFsbG93TW9kdWxlczogQ29tcGlsZVNoYWxsb3dNb2R1bGVNZXRhZGF0YVtdLFxuICAgICAgY29udGV4dDogT3V0cHV0Q29udGV4dCk6IHZvaWQge1xuICAgIHNoYWxsb3dNb2R1bGVzLmZvckVhY2gobW9kdWxlID0+IGNvbXBpbGVSM01vZHVsZShjb250ZXh0LCBtb2R1bGUsIHRoaXMuX2luamVjdGFibGVDb21waWxlcikpO1xuICB9XG5cbiAgcHJpdmF0ZSBfY29tcGlsZVBhcnRpYWxNb2R1bGUoXG4gICAgICBmaWxlTmFtZTogc3RyaW5nLCBuZ01vZHVsZUJ5UGlwZU9yRGlyZWN0aXZlOiBNYXA8U3RhdGljU3ltYm9sLCBDb21waWxlTmdNb2R1bGVNZXRhZGF0YT4sXG4gICAgICBkaXJlY3RpdmVzOiBTdGF0aWNTeW1ib2xbXSwgcGlwZXM6IFN0YXRpY1N5bWJvbFtdLCBuZ01vZHVsZXM6IENvbXBpbGVOZ01vZHVsZU1ldGFkYXRhW10sXG4gICAgICBpbmplY3RhYmxlczogQ29tcGlsZUluamVjdGFibGVNZXRhZGF0YVtdLCBjb250ZXh0OiBPdXRwdXRDb250ZXh0KTogdm9pZCB7XG4gICAgY29uc3QgZXJyb3JzOiBQYXJzZUVycm9yW10gPSBbXTtcblxuICAgIGNvbnN0IHNjaGVtYVJlZ2lzdHJ5ID0gbmV3IERvbUVsZW1lbnRTY2hlbWFSZWdpc3RyeSgpO1xuICAgIGNvbnN0IGhvc3RCaW5kaW5nUGFyc2VyID0gbmV3IEJpbmRpbmdQYXJzZXIoXG4gICAgICAgIHRoaXMuX3RlbXBsYXRlUGFyc2VyLmV4cHJlc3Npb25QYXJzZXIsIERFRkFVTFRfSU5URVJQT0xBVElPTl9DT05GSUcsIHNjaGVtYVJlZ2lzdHJ5LCBbXSxcbiAgICAgICAgZXJyb3JzKTtcblxuICAgIC8vIFByb2Nlc3MgYWxsIGNvbXBvbmVudHMgYW5kIGRpcmVjdGl2ZXNcbiAgICBkaXJlY3RpdmVzLmZvckVhY2goZGlyZWN0aXZlVHlwZSA9PiB7XG4gICAgICBjb25zdCBkaXJlY3RpdmVNZXRhZGF0YSA9IHRoaXMuX21ldGFkYXRhUmVzb2x2ZXIuZ2V0RGlyZWN0aXZlTWV0YWRhdGEoZGlyZWN0aXZlVHlwZSk7XG4gICAgICBpZiAoZGlyZWN0aXZlTWV0YWRhdGEuaXNDb21wb25lbnQpIHtcbiAgICAgICAgY29uc3QgbW9kdWxlID0gbmdNb2R1bGVCeVBpcGVPckRpcmVjdGl2ZS5nZXQoZGlyZWN0aXZlVHlwZSkgITtcbiAgICAgICAgbW9kdWxlIHx8XG4gICAgICAgICAgICBlcnJvcihcbiAgICAgICAgICAgICAgICBgQ2Fubm90IGRldGVybWluZSB0aGUgbW9kdWxlIGZvciBjb21wb25lbnQgJyR7aWRlbnRpZmllck5hbWUoZGlyZWN0aXZlTWV0YWRhdGEudHlwZSl9J2ApO1xuXG4gICAgICAgIGxldCBodG1sQXN0ID0gZGlyZWN0aXZlTWV0YWRhdGEudGVtcGxhdGUgIS5odG1sQXN0ICE7XG4gICAgICAgIGNvbnN0IHByZXNlcnZlV2hpdGVzcGFjZXMgPSBkaXJlY3RpdmVNZXRhZGF0YSAhLnRlbXBsYXRlICEucHJlc2VydmVXaGl0ZXNwYWNlcztcblxuICAgICAgICBpZiAoIXByZXNlcnZlV2hpdGVzcGFjZXMpIHtcbiAgICAgICAgICBodG1sQXN0ID0gcmVtb3ZlV2hpdGVzcGFjZXMoaHRtbEFzdCk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgcmVuZGVyM0FzdCA9IGh0bWxBc3RUb1JlbmRlcjNBc3QoaHRtbEFzdC5yb290Tm9kZXMsIGhvc3RCaW5kaW5nUGFyc2VyKTtcblxuICAgICAgICAvLyBNYXAgb2YgU3RhdGljVHlwZSBieSBkaXJlY3RpdmUgc2VsZWN0b3JzXG4gICAgICAgIGNvbnN0IGRpcmVjdGl2ZVR5cGVCeVNlbCA9IG5ldyBNYXA8c3RyaW5nLCBhbnk+KCk7XG5cbiAgICAgICAgY29uc3QgZGlyZWN0aXZlcyA9IG1vZHVsZS50cmFuc2l0aXZlTW9kdWxlLmRpcmVjdGl2ZXMubWFwKFxuICAgICAgICAgICAgZGlyID0+IHRoaXMuX21ldGFkYXRhUmVzb2x2ZXIuZ2V0RGlyZWN0aXZlU3VtbWFyeShkaXIucmVmZXJlbmNlKSk7XG5cbiAgICAgICAgZGlyZWN0aXZlcy5mb3JFYWNoKGRpcmVjdGl2ZSA9PiB7XG4gICAgICAgICAgaWYgKGRpcmVjdGl2ZS5zZWxlY3Rvcikge1xuICAgICAgICAgICAgZGlyZWN0aXZlVHlwZUJ5U2VsLnNldChkaXJlY3RpdmUuc2VsZWN0b3IsIGRpcmVjdGl2ZS50eXBlLnJlZmVyZW5jZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICAvLyBNYXAgb2YgU3RhdGljVHlwZSBieSBwaXBlIG5hbWVzXG4gICAgICAgIGNvbnN0IHBpcGVUeXBlQnlOYW1lID0gbmV3IE1hcDxzdHJpbmcsIGFueT4oKTtcblxuICAgICAgICBjb25zdCBwaXBlcyA9IG1vZHVsZS50cmFuc2l0aXZlTW9kdWxlLnBpcGVzLm1hcChcbiAgICAgICAgICAgIHBpcGUgPT4gdGhpcy5fbWV0YWRhdGFSZXNvbHZlci5nZXRQaXBlU3VtbWFyeShwaXBlLnJlZmVyZW5jZSkpO1xuXG4gICAgICAgIHBpcGVzLmZvckVhY2gocGlwZSA9PiB7IHBpcGVUeXBlQnlOYW1lLnNldChwaXBlLm5hbWUsIHBpcGUudHlwZS5yZWZlcmVuY2UpOyB9KTtcblxuICAgICAgICBjb21waWxlUjNDb21wb25lbnQoXG4gICAgICAgICAgICBjb250ZXh0LCBkaXJlY3RpdmVNZXRhZGF0YSwgcmVuZGVyM0FzdCwgdGhpcy5yZWZsZWN0b3IsIGhvc3RCaW5kaW5nUGFyc2VyLFxuICAgICAgICAgICAgZGlyZWN0aXZlVHlwZUJ5U2VsLCBwaXBlVHlwZUJ5TmFtZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb21waWxlUjNEaXJlY3RpdmUoY29udGV4dCwgZGlyZWN0aXZlTWV0YWRhdGEsIHRoaXMucmVmbGVjdG9yLCBob3N0QmluZGluZ1BhcnNlcik7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBwaXBlcy5mb3JFYWNoKHBpcGVUeXBlID0+IHtcbiAgICAgIGNvbnN0IHBpcGVNZXRhZGF0YSA9IHRoaXMuX21ldGFkYXRhUmVzb2x2ZXIuZ2V0UGlwZU1ldGFkYXRhKHBpcGVUeXBlKTtcbiAgICAgIGlmIChwaXBlTWV0YWRhdGEpIHtcbiAgICAgICAgY29tcGlsZVIzUGlwZShjb250ZXh0LCBwaXBlTWV0YWRhdGEsIHRoaXMucmVmbGVjdG9yKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIGluamVjdGFibGVzLmZvckVhY2goaW5qZWN0YWJsZSA9PiB0aGlzLl9pbmplY3RhYmxlQ29tcGlsZXIuY29tcGlsZShpbmplY3RhYmxlLCBjb250ZXh0KSk7XG4gIH1cblxuICBlbWl0QWxsUGFydGlhbE1vZHVsZXMyKGZpbGVzOiBOZ0FuYWx5emVkRmlsZVdpdGhJbmplY3RhYmxlc1tdKTogUGFydGlhbE1vZHVsZVtdIHtcbiAgICAvLyBVc2luZyByZWR1Y2UgbGlrZSB0aGlzIGlzIGEgc2VsZWN0IG1hbnkgcGF0dGVybiAod2hlcmUgbWFwIGlzIGEgc2VsZWN0IHBhdHRlcm4pXG4gICAgcmV0dXJuIGZpbGVzLnJlZHVjZTxQYXJ0aWFsTW9kdWxlW10+KChyLCBmaWxlKSA9PiB7XG4gICAgICByLnB1c2goLi4udGhpcy5fZW1pdFBhcnRpYWxNb2R1bGUyKGZpbGUuZmlsZU5hbWUsIGZpbGUuaW5qZWN0YWJsZXMpKTtcbiAgICAgIHJldHVybiByO1xuICAgIH0sIFtdKTtcbiAgfVxuXG4gIHByaXZhdGUgX2VtaXRQYXJ0aWFsTW9kdWxlMihmaWxlTmFtZTogc3RyaW5nLCBpbmplY3RhYmxlczogQ29tcGlsZUluamVjdGFibGVNZXRhZGF0YVtdKTpcbiAgICAgIFBhcnRpYWxNb2R1bGVbXSB7XG4gICAgY29uc3QgY29udGV4dCA9IHRoaXMuX2NyZWF0ZU91dHB1dENvbnRleHQoZmlsZU5hbWUpO1xuXG4gICAgaW5qZWN0YWJsZXMuZm9yRWFjaChpbmplY3RhYmxlID0+IHRoaXMuX2luamVjdGFibGVDb21waWxlci5jb21waWxlKGluamVjdGFibGUsIGNvbnRleHQpKTtcblxuICAgIGlmIChjb250ZXh0LnN0YXRlbWVudHMgJiYgY29udGV4dC5zdGF0ZW1lbnRzLmxlbmd0aCA+IDApIHtcbiAgICAgIHJldHVybiBbe2ZpbGVOYW1lLCBzdGF0ZW1lbnRzOiBbLi4uY29udGV4dC5jb25zdGFudFBvb2wuc3RhdGVtZW50cywgLi4uY29udGV4dC5zdGF0ZW1lbnRzXX1dO1xuICAgIH1cbiAgICByZXR1cm4gW107XG4gIH1cblxuICBlbWl0QWxsSW1wbHMoYW5hbHl6ZVJlc3VsdDogTmdBbmFseXplZE1vZHVsZXMpOiBHZW5lcmF0ZWRGaWxlW10ge1xuICAgIGNvbnN0IHtuZ01vZHVsZUJ5UGlwZU9yRGlyZWN0aXZlLCBmaWxlc30gPSBhbmFseXplUmVzdWx0O1xuICAgIGNvbnN0IHNvdXJjZU1vZHVsZXMgPSBmaWxlcy5tYXAoXG4gICAgICAgIGZpbGUgPT4gdGhpcy5fY29tcGlsZUltcGxGaWxlKFxuICAgICAgICAgICAgZmlsZS5maWxlTmFtZSwgbmdNb2R1bGVCeVBpcGVPckRpcmVjdGl2ZSwgZmlsZS5kaXJlY3RpdmVzLCBmaWxlLnBpcGVzLCBmaWxlLm5nTW9kdWxlcyxcbiAgICAgICAgICAgIGZpbGUuaW5qZWN0YWJsZXMpKTtcbiAgICByZXR1cm4gZmxhdHRlbihzb3VyY2VNb2R1bGVzKTtcbiAgfVxuXG4gIHByaXZhdGUgX2NvbXBpbGVJbXBsRmlsZShcbiAgICAgIHNyY0ZpbGVVcmw6IHN0cmluZywgbmdNb2R1bGVCeVBpcGVPckRpcmVjdGl2ZTogTWFwPFN0YXRpY1N5bWJvbCwgQ29tcGlsZU5nTW9kdWxlTWV0YWRhdGE+LFxuICAgICAgZGlyZWN0aXZlczogU3RhdGljU3ltYm9sW10sIHBpcGVzOiBTdGF0aWNTeW1ib2xbXSwgbmdNb2R1bGVzOiBDb21waWxlTmdNb2R1bGVNZXRhZGF0YVtdLFxuICAgICAgaW5qZWN0YWJsZXM6IENvbXBpbGVJbmplY3RhYmxlTWV0YWRhdGFbXSk6IEdlbmVyYXRlZEZpbGVbXSB7XG4gICAgY29uc3QgZmlsZVN1ZmZpeCA9IG5vcm1hbGl6ZUdlbkZpbGVTdWZmaXgoc3BsaXRUeXBlc2NyaXB0U3VmZml4KHNyY0ZpbGVVcmwsIHRydWUpWzFdKTtcbiAgICBjb25zdCBnZW5lcmF0ZWRGaWxlczogR2VuZXJhdGVkRmlsZVtdID0gW107XG5cbiAgICBjb25zdCBvdXRwdXRDdHggPSB0aGlzLl9jcmVhdGVPdXRwdXRDb250ZXh0KG5nZmFjdG9yeUZpbGVQYXRoKHNyY0ZpbGVVcmwsIHRydWUpKTtcblxuICAgIGdlbmVyYXRlZEZpbGVzLnB1c2goXG4gICAgICAgIC4uLnRoaXMuX2NyZWF0ZVN1bW1hcnkoc3JjRmlsZVVybCwgZGlyZWN0aXZlcywgcGlwZXMsIG5nTW9kdWxlcywgaW5qZWN0YWJsZXMsIG91dHB1dEN0eCkpO1xuXG4gICAgLy8gY29tcGlsZSBhbGwgbmcgbW9kdWxlc1xuICAgIG5nTW9kdWxlcy5mb3JFYWNoKChuZ01vZHVsZU1ldGEpID0+IHRoaXMuX2NvbXBpbGVNb2R1bGUob3V0cHV0Q3R4LCBuZ01vZHVsZU1ldGEpKTtcblxuICAgIC8vIGNvbXBpbGUgY29tcG9uZW50c1xuICAgIGRpcmVjdGl2ZXMuZm9yRWFjaCgoZGlyVHlwZSkgPT4ge1xuICAgICAgY29uc3QgY29tcE1ldGEgPSB0aGlzLl9tZXRhZGF0YVJlc29sdmVyLmdldERpcmVjdGl2ZU1ldGFkYXRhKDxhbnk+ZGlyVHlwZSk7XG4gICAgICBpZiAoIWNvbXBNZXRhLmlzQ29tcG9uZW50KSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGNvbnN0IG5nTW9kdWxlID0gbmdNb2R1bGVCeVBpcGVPckRpcmVjdGl2ZS5nZXQoZGlyVHlwZSk7XG4gICAgICBpZiAoIW5nTW9kdWxlKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgIGBJbnRlcm5hbCBFcnJvcjogY2Fubm90IGRldGVybWluZSB0aGUgbW9kdWxlIGZvciBjb21wb25lbnQgJHtpZGVudGlmaWVyTmFtZShjb21wTWV0YS50eXBlKX0hYCk7XG4gICAgICB9XG5cbiAgICAgIC8vIGNvbXBpbGUgc3R5bGVzXG4gICAgICBjb25zdCBjb21wb25lbnRTdHlsZXNoZWV0ID0gdGhpcy5fc3R5bGVDb21waWxlci5jb21waWxlQ29tcG9uZW50KG91dHB1dEN0eCwgY29tcE1ldGEpO1xuICAgICAgLy8gTm90ZTogY29tcE1ldGEgaXMgYSBjb21wb25lbnQgYW5kIHRoZXJlZm9yZSB0ZW1wbGF0ZSBpcyBub24gbnVsbC5cbiAgICAgIGNvbXBNZXRhLnRlbXBsYXRlICEuZXh0ZXJuYWxTdHlsZXNoZWV0cy5mb3JFYWNoKChzdHlsZXNoZWV0TWV0YSkgPT4ge1xuICAgICAgICAvLyBOb3RlOiBmaWxsIG5vbiBzaGltIGFuZCBzaGltIHN0eWxlIGZpbGVzIGFzIHRoZXkgbWlnaHRcbiAgICAgICAgLy8gYmUgc2hhcmVkIGJ5IGNvbXBvbmVudCB3aXRoIGFuZCB3aXRob3V0IFZpZXdFbmNhcHN1bGF0aW9uLlxuICAgICAgICBjb25zdCBzaGltID0gdGhpcy5fc3R5bGVDb21waWxlci5uZWVkc1N0eWxlU2hpbShjb21wTWV0YSk7XG4gICAgICAgIGdlbmVyYXRlZEZpbGVzLnB1c2goXG4gICAgICAgICAgICB0aGlzLl9jb2RlZ2VuU3R5bGVzKHNyY0ZpbGVVcmwsIGNvbXBNZXRhLCBzdHlsZXNoZWV0TWV0YSwgc2hpbSwgZmlsZVN1ZmZpeCkpO1xuICAgICAgICBpZiAodGhpcy5fb3B0aW9ucy5hbGxvd0VtcHR5Q29kZWdlbkZpbGVzKSB7XG4gICAgICAgICAgZ2VuZXJhdGVkRmlsZXMucHVzaChcbiAgICAgICAgICAgICAgdGhpcy5fY29kZWdlblN0eWxlcyhzcmNGaWxlVXJsLCBjb21wTWV0YSwgc3R5bGVzaGVldE1ldGEsICFzaGltLCBmaWxlU3VmZml4KSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICAvLyBjb21waWxlIGNvbXBvbmVudHNcbiAgICAgIGNvbnN0IGNvbXBWaWV3VmFycyA9IHRoaXMuX2NvbXBpbGVDb21wb25lbnQoXG4gICAgICAgICAgb3V0cHV0Q3R4LCBjb21wTWV0YSwgbmdNb2R1bGUsIG5nTW9kdWxlLnRyYW5zaXRpdmVNb2R1bGUuZGlyZWN0aXZlcywgY29tcG9uZW50U3R5bGVzaGVldCxcbiAgICAgICAgICBmaWxlU3VmZml4KTtcbiAgICAgIHRoaXMuX2NvbXBpbGVDb21wb25lbnRGYWN0b3J5KG91dHB1dEN0eCwgY29tcE1ldGEsIG5nTW9kdWxlLCBmaWxlU3VmZml4KTtcbiAgICB9KTtcbiAgICBpZiAob3V0cHV0Q3R4LnN0YXRlbWVudHMubGVuZ3RoID4gMCB8fCB0aGlzLl9vcHRpb25zLmFsbG93RW1wdHlDb2RlZ2VuRmlsZXMpIHtcbiAgICAgIGNvbnN0IHNyY01vZHVsZSA9IHRoaXMuX2NvZGVnZW5Tb3VyY2VNb2R1bGUoc3JjRmlsZVVybCwgb3V0cHV0Q3R4KTtcbiAgICAgIGdlbmVyYXRlZEZpbGVzLnVuc2hpZnQoc3JjTW9kdWxlKTtcbiAgICB9XG4gICAgcmV0dXJuIGdlbmVyYXRlZEZpbGVzO1xuICB9XG5cbiAgcHJpdmF0ZSBfY3JlYXRlU3VtbWFyeShcbiAgICAgIHNyY0ZpbGVOYW1lOiBzdHJpbmcsIGRpcmVjdGl2ZXM6IFN0YXRpY1N5bWJvbFtdLCBwaXBlczogU3RhdGljU3ltYm9sW10sXG4gICAgICBuZ01vZHVsZXM6IENvbXBpbGVOZ01vZHVsZU1ldGFkYXRhW10sIGluamVjdGFibGVzOiBDb21waWxlSW5qZWN0YWJsZU1ldGFkYXRhW10sXG4gICAgICBuZ0ZhY3RvcnlDdHg6IE91dHB1dENvbnRleHQpOiBHZW5lcmF0ZWRGaWxlW10ge1xuICAgIGNvbnN0IHN5bWJvbFN1bW1hcmllcyA9IHRoaXMuX3N5bWJvbFJlc29sdmVyLmdldFN5bWJvbHNPZihzcmNGaWxlTmFtZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLm1hcChzeW1ib2wgPT4gdGhpcy5fc3ltYm9sUmVzb2x2ZXIucmVzb2x2ZVN5bWJvbChzeW1ib2wpKTtcbiAgICBjb25zdCB0eXBlRGF0YToge1xuICAgICAgc3VtbWFyeTogQ29tcGlsZVR5cGVTdW1tYXJ5LFxuICAgICAgbWV0YWRhdGE6IENvbXBpbGVOZ01vZHVsZU1ldGFkYXRhIHwgQ29tcGlsZURpcmVjdGl2ZU1ldGFkYXRhIHwgQ29tcGlsZVBpcGVNZXRhZGF0YSB8XG4gICAgICAgICAgQ29tcGlsZVR5cGVNZXRhZGF0YVxuICAgIH1bXSA9XG4gICAgICAgIFtcbiAgICAgICAgICAuLi5uZ01vZHVsZXMubWFwKFxuICAgICAgICAgICAgICBtZXRhID0+ICh7XG4gICAgICAgICAgICAgICAgc3VtbWFyeTogdGhpcy5fbWV0YWRhdGFSZXNvbHZlci5nZXROZ01vZHVsZVN1bW1hcnkobWV0YS50eXBlLnJlZmVyZW5jZSkgISxcbiAgICAgICAgICAgICAgICBtZXRhZGF0YTogdGhpcy5fbWV0YWRhdGFSZXNvbHZlci5nZXROZ01vZHVsZU1ldGFkYXRhKG1ldGEudHlwZS5yZWZlcmVuY2UpICFcbiAgICAgICAgICAgICAgfSkpLFxuICAgICAgICAgIC4uLmRpcmVjdGl2ZXMubWFwKHJlZiA9PiAoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3VtbWFyeTogdGhpcy5fbWV0YWRhdGFSZXNvbHZlci5nZXREaXJlY3RpdmVTdW1tYXJ5KHJlZikgISxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1ldGFkYXRhOiB0aGlzLl9tZXRhZGF0YVJlc29sdmVyLmdldERpcmVjdGl2ZU1ldGFkYXRhKHJlZikgIVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pKSxcbiAgICAgICAgICAuLi5waXBlcy5tYXAocmVmID0+ICh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgc3VtbWFyeTogdGhpcy5fbWV0YWRhdGFSZXNvbHZlci5nZXRQaXBlU3VtbWFyeShyZWYpICEsXG4gICAgICAgICAgICAgICAgICAgICAgICAgbWV0YWRhdGE6IHRoaXMuX21ldGFkYXRhUmVzb2x2ZXIuZ2V0UGlwZU1ldGFkYXRhKHJlZikgIVxuICAgICAgICAgICAgICAgICAgICAgICB9KSksXG4gICAgICAgICAgLi4uaW5qZWN0YWJsZXMubWFwKFxuICAgICAgICAgICAgICByZWYgPT4gKHtcbiAgICAgICAgICAgICAgICBzdW1tYXJ5OiB0aGlzLl9tZXRhZGF0YVJlc29sdmVyLmdldEluamVjdGFibGVTdW1tYXJ5KHJlZi5zeW1ib2wpICEsXG4gICAgICAgICAgICAgICAgbWV0YWRhdGE6IHRoaXMuX21ldGFkYXRhUmVzb2x2ZXIuZ2V0SW5qZWN0YWJsZVN1bW1hcnkocmVmLnN5bWJvbCkgIS50eXBlXG4gICAgICAgICAgICAgIH0pKVxuICAgICAgICBdO1xuICAgIGNvbnN0IGZvckppdE91dHB1dEN0eCA9IHRoaXMuX29wdGlvbnMuZW5hYmxlU3VtbWFyaWVzRm9ySml0ID9cbiAgICAgICAgdGhpcy5fY3JlYXRlT3V0cHV0Q29udGV4dChzdW1tYXJ5Rm9ySml0RmlsZU5hbWUoc3JjRmlsZU5hbWUsIHRydWUpKSA6XG4gICAgICAgIG51bGw7XG4gICAgY29uc3Qge2pzb24sIGV4cG9ydEFzfSA9IHNlcmlhbGl6ZVN1bW1hcmllcyhcbiAgICAgICAgc3JjRmlsZU5hbWUsIGZvckppdE91dHB1dEN0eCwgdGhpcy5fc3VtbWFyeVJlc29sdmVyLCB0aGlzLl9zeW1ib2xSZXNvbHZlciwgc3ltYm9sU3VtbWFyaWVzLFxuICAgICAgICB0eXBlRGF0YSwgdGhpcy5fb3B0aW9ucy5jcmVhdGVFeHRlcm5hbFN5bWJvbEZhY3RvcnlSZWV4cG9ydHMpO1xuICAgIGV4cG9ydEFzLmZvckVhY2goKGVudHJ5KSA9PiB7XG4gICAgICBuZ0ZhY3RvcnlDdHguc3RhdGVtZW50cy5wdXNoKFxuICAgICAgICAgIG8udmFyaWFibGUoZW50cnkuZXhwb3J0QXMpLnNldChuZ0ZhY3RvcnlDdHguaW1wb3J0RXhwcihlbnRyeS5zeW1ib2wpKS50b0RlY2xTdG10KG51bGwsIFtcbiAgICAgICAgICAgIG8uU3RtdE1vZGlmaWVyLkV4cG9ydGVkXG4gICAgICAgICAgXSkpO1xuICAgIH0pO1xuICAgIGNvbnN0IHN1bW1hcnlKc29uID0gbmV3IEdlbmVyYXRlZEZpbGUoc3JjRmlsZU5hbWUsIHN1bW1hcnlGaWxlTmFtZShzcmNGaWxlTmFtZSksIGpzb24pO1xuICAgIGNvbnN0IHJlc3VsdCA9IFtzdW1tYXJ5SnNvbl07XG4gICAgaWYgKGZvckppdE91dHB1dEN0eCkge1xuICAgICAgcmVzdWx0LnB1c2godGhpcy5fY29kZWdlblNvdXJjZU1vZHVsZShzcmNGaWxlTmFtZSwgZm9ySml0T3V0cHV0Q3R4KSk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICBwcml2YXRlIF9jb21waWxlTW9kdWxlKG91dHB1dEN0eDogT3V0cHV0Q29udGV4dCwgbmdNb2R1bGU6IENvbXBpbGVOZ01vZHVsZU1ldGFkYXRhKTogdm9pZCB7XG4gICAgY29uc3QgcHJvdmlkZXJzOiBDb21waWxlUHJvdmlkZXJNZXRhZGF0YVtdID0gW107XG5cbiAgICBpZiAodGhpcy5fb3B0aW9ucy5sb2NhbGUpIHtcbiAgICAgIGNvbnN0IG5vcm1hbGl6ZWRMb2NhbGUgPSB0aGlzLl9vcHRpb25zLmxvY2FsZS5yZXBsYWNlKC9fL2csICctJyk7XG4gICAgICBwcm92aWRlcnMucHVzaCh7XG4gICAgICAgIHRva2VuOiBjcmVhdGVUb2tlbkZvckV4dGVybmFsUmVmZXJlbmNlKHRoaXMucmVmbGVjdG9yLCBJZGVudGlmaWVycy5MT0NBTEVfSUQpLFxuICAgICAgICB1c2VWYWx1ZTogbm9ybWFsaXplZExvY2FsZSxcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGlmICh0aGlzLl9vcHRpb25zLmkxOG5Gb3JtYXQpIHtcbiAgICAgIHByb3ZpZGVycy5wdXNoKHtcbiAgICAgICAgdG9rZW46IGNyZWF0ZVRva2VuRm9yRXh0ZXJuYWxSZWZlcmVuY2UodGhpcy5yZWZsZWN0b3IsIElkZW50aWZpZXJzLlRSQU5TTEFUSU9OU19GT1JNQVQpLFxuICAgICAgICB1c2VWYWx1ZTogdGhpcy5fb3B0aW9ucy5pMThuRm9ybWF0XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICB0aGlzLl9uZ01vZHVsZUNvbXBpbGVyLmNvbXBpbGUob3V0cHV0Q3R4LCBuZ01vZHVsZSwgcHJvdmlkZXJzKTtcbiAgfVxuXG4gIHByaXZhdGUgX2NvbXBpbGVDb21wb25lbnRGYWN0b3J5KFxuICAgICAgb3V0cHV0Q3R4OiBPdXRwdXRDb250ZXh0LCBjb21wTWV0YTogQ29tcGlsZURpcmVjdGl2ZU1ldGFkYXRhLFxuICAgICAgbmdNb2R1bGU6IENvbXBpbGVOZ01vZHVsZU1ldGFkYXRhLCBmaWxlU3VmZml4OiBzdHJpbmcpOiB2b2lkIHtcbiAgICBjb25zdCBob3N0TWV0YSA9IHRoaXMuX21ldGFkYXRhUmVzb2x2ZXIuZ2V0SG9zdENvbXBvbmVudE1ldGFkYXRhKGNvbXBNZXRhKTtcbiAgICBjb25zdCBob3N0Vmlld0ZhY3RvcnlWYXIgPVxuICAgICAgICB0aGlzLl9jb21waWxlQ29tcG9uZW50KG91dHB1dEN0eCwgaG9zdE1ldGEsIG5nTW9kdWxlLCBbY29tcE1ldGEudHlwZV0sIG51bGwsIGZpbGVTdWZmaXgpXG4gICAgICAgICAgICAudmlld0NsYXNzVmFyO1xuICAgIGNvbnN0IGNvbXBGYWN0b3J5VmFyID0gY29tcG9uZW50RmFjdG9yeU5hbWUoY29tcE1ldGEudHlwZS5yZWZlcmVuY2UpO1xuICAgIGNvbnN0IGlucHV0c0V4cHJzOiBvLkxpdGVyYWxNYXBFbnRyeVtdID0gW107XG4gICAgZm9yIChsZXQgcHJvcE5hbWUgaW4gY29tcE1ldGEuaW5wdXRzKSB7XG4gICAgICBjb25zdCB0ZW1wbGF0ZU5hbWUgPSBjb21wTWV0YS5pbnB1dHNbcHJvcE5hbWVdO1xuICAgICAgLy8gRG9uJ3QgcXVvdGUgc28gdGhhdCB0aGUga2V5IGdldHMgbWluaWZpZWQuLi5cbiAgICAgIGlucHV0c0V4cHJzLnB1c2gobmV3IG8uTGl0ZXJhbE1hcEVudHJ5KHByb3BOYW1lLCBvLmxpdGVyYWwodGVtcGxhdGVOYW1lKSwgZmFsc2UpKTtcbiAgICB9XG4gICAgY29uc3Qgb3V0cHV0c0V4cHJzOiBvLkxpdGVyYWxNYXBFbnRyeVtdID0gW107XG4gICAgZm9yIChsZXQgcHJvcE5hbWUgaW4gY29tcE1ldGEub3V0cHV0cykge1xuICAgICAgY29uc3QgdGVtcGxhdGVOYW1lID0gY29tcE1ldGEub3V0cHV0c1twcm9wTmFtZV07XG4gICAgICAvLyBEb24ndCBxdW90ZSBzbyB0aGF0IHRoZSBrZXkgZ2V0cyBtaW5pZmllZC4uLlxuICAgICAgb3V0cHV0c0V4cHJzLnB1c2gobmV3IG8uTGl0ZXJhbE1hcEVudHJ5KHByb3BOYW1lLCBvLmxpdGVyYWwodGVtcGxhdGVOYW1lKSwgZmFsc2UpKTtcbiAgICB9XG5cbiAgICBvdXRwdXRDdHguc3RhdGVtZW50cy5wdXNoKFxuICAgICAgICBvLnZhcmlhYmxlKGNvbXBGYWN0b3J5VmFyKVxuICAgICAgICAgICAgLnNldChvLmltcG9ydEV4cHIoSWRlbnRpZmllcnMuY3JlYXRlQ29tcG9uZW50RmFjdG9yeSkuY2FsbEZuKFtcbiAgICAgICAgICAgICAgby5saXRlcmFsKGNvbXBNZXRhLnNlbGVjdG9yKSwgb3V0cHV0Q3R4LmltcG9ydEV4cHIoY29tcE1ldGEudHlwZS5yZWZlcmVuY2UpLFxuICAgICAgICAgICAgICBvLnZhcmlhYmxlKGhvc3RWaWV3RmFjdG9yeVZhciksIG5ldyBvLkxpdGVyYWxNYXBFeHByKGlucHV0c0V4cHJzKSxcbiAgICAgICAgICAgICAgbmV3IG8uTGl0ZXJhbE1hcEV4cHIob3V0cHV0c0V4cHJzKSxcbiAgICAgICAgICAgICAgby5saXRlcmFsQXJyKFxuICAgICAgICAgICAgICAgICAgY29tcE1ldGEudGVtcGxhdGUgIS5uZ0NvbnRlbnRTZWxlY3RvcnMubWFwKHNlbGVjdG9yID0+IG8ubGl0ZXJhbChzZWxlY3RvcikpKVxuICAgICAgICAgICAgXSkpXG4gICAgICAgICAgICAudG9EZWNsU3RtdChcbiAgICAgICAgICAgICAgICBvLmltcG9ydFR5cGUoXG4gICAgICAgICAgICAgICAgICAgIElkZW50aWZpZXJzLkNvbXBvbmVudEZhY3RvcnksXG4gICAgICAgICAgICAgICAgICAgIFtvLmV4cHJlc3Npb25UeXBlKG91dHB1dEN0eC5pbXBvcnRFeHByKGNvbXBNZXRhLnR5cGUucmVmZXJlbmNlKSkgIV0sXG4gICAgICAgICAgICAgICAgICAgIFtvLlR5cGVNb2RpZmllci5Db25zdF0pLFxuICAgICAgICAgICAgICAgIFtvLlN0bXRNb2RpZmllci5GaW5hbCwgby5TdG10TW9kaWZpZXIuRXhwb3J0ZWRdKSk7XG4gIH1cblxuICBwcml2YXRlIF9jb21waWxlQ29tcG9uZW50KFxuICAgICAgb3V0cHV0Q3R4OiBPdXRwdXRDb250ZXh0LCBjb21wTWV0YTogQ29tcGlsZURpcmVjdGl2ZU1ldGFkYXRhLFxuICAgICAgbmdNb2R1bGU6IENvbXBpbGVOZ01vZHVsZU1ldGFkYXRhLCBkaXJlY3RpdmVJZGVudGlmaWVyczogQ29tcGlsZUlkZW50aWZpZXJNZXRhZGF0YVtdLFxuICAgICAgY29tcG9uZW50U3R5bGVzOiBDb21waWxlZFN0eWxlc2hlZXR8bnVsbCwgZmlsZVN1ZmZpeDogc3RyaW5nKTogVmlld0NvbXBpbGVSZXN1bHQge1xuICAgIGNvbnN0IHt0ZW1wbGF0ZTogcGFyc2VkVGVtcGxhdGUsIHBpcGVzOiB1c2VkUGlwZXN9ID1cbiAgICAgICAgdGhpcy5fcGFyc2VUZW1wbGF0ZShjb21wTWV0YSwgbmdNb2R1bGUsIGRpcmVjdGl2ZUlkZW50aWZpZXJzKTtcbiAgICBjb25zdCBzdHlsZXNFeHByID0gY29tcG9uZW50U3R5bGVzID8gby52YXJpYWJsZShjb21wb25lbnRTdHlsZXMuc3R5bGVzVmFyKSA6IG8ubGl0ZXJhbEFycihbXSk7XG4gICAgY29uc3Qgdmlld1Jlc3VsdCA9IHRoaXMuX3ZpZXdDb21waWxlci5jb21waWxlQ29tcG9uZW50KFxuICAgICAgICBvdXRwdXRDdHgsIGNvbXBNZXRhLCBwYXJzZWRUZW1wbGF0ZSwgc3R5bGVzRXhwciwgdXNlZFBpcGVzKTtcbiAgICBpZiAoY29tcG9uZW50U3R5bGVzKSB7XG4gICAgICBfcmVzb2x2ZVN0eWxlU3RhdGVtZW50cyhcbiAgICAgICAgICB0aGlzLl9zeW1ib2xSZXNvbHZlciwgY29tcG9uZW50U3R5bGVzLCB0aGlzLl9zdHlsZUNvbXBpbGVyLm5lZWRzU3R5bGVTaGltKGNvbXBNZXRhKSxcbiAgICAgICAgICBmaWxlU3VmZml4KTtcbiAgICB9XG4gICAgcmV0dXJuIHZpZXdSZXN1bHQ7XG4gIH1cblxuICBwcml2YXRlIF9wYXJzZVRlbXBsYXRlKFxuICAgICAgY29tcE1ldGE6IENvbXBpbGVEaXJlY3RpdmVNZXRhZGF0YSwgbmdNb2R1bGU6IENvbXBpbGVOZ01vZHVsZU1ldGFkYXRhLFxuICAgICAgZGlyZWN0aXZlSWRlbnRpZmllcnM6IENvbXBpbGVJZGVudGlmaWVyTWV0YWRhdGFbXSk6XG4gICAgICB7dGVtcGxhdGU6IFRlbXBsYXRlQXN0W10sIHBpcGVzOiBDb21waWxlUGlwZVN1bW1hcnlbXX0ge1xuICAgIGlmICh0aGlzLl90ZW1wbGF0ZUFzdENhY2hlLmhhcyhjb21wTWV0YS50eXBlLnJlZmVyZW5jZSkpIHtcbiAgICAgIHJldHVybiB0aGlzLl90ZW1wbGF0ZUFzdENhY2hlLmdldChjb21wTWV0YS50eXBlLnJlZmVyZW5jZSkgITtcbiAgICB9XG4gICAgY29uc3QgcHJlc2VydmVXaGl0ZXNwYWNlcyA9IGNvbXBNZXRhICEudGVtcGxhdGUgIS5wcmVzZXJ2ZVdoaXRlc3BhY2VzO1xuICAgIGNvbnN0IGRpcmVjdGl2ZXMgPVxuICAgICAgICBkaXJlY3RpdmVJZGVudGlmaWVycy5tYXAoZGlyID0+IHRoaXMuX21ldGFkYXRhUmVzb2x2ZXIuZ2V0RGlyZWN0aXZlU3VtbWFyeShkaXIucmVmZXJlbmNlKSk7XG4gICAgY29uc3QgcGlwZXMgPSBuZ01vZHVsZS50cmFuc2l0aXZlTW9kdWxlLnBpcGVzLm1hcChcbiAgICAgICAgcGlwZSA9PiB0aGlzLl9tZXRhZGF0YVJlc29sdmVyLmdldFBpcGVTdW1tYXJ5KHBpcGUucmVmZXJlbmNlKSk7XG4gICAgY29uc3QgcmVzdWx0ID0gdGhpcy5fdGVtcGxhdGVQYXJzZXIucGFyc2UoXG4gICAgICAgIGNvbXBNZXRhLCBjb21wTWV0YS50ZW1wbGF0ZSAhLmh0bWxBc3QgISwgZGlyZWN0aXZlcywgcGlwZXMsIG5nTW9kdWxlLnNjaGVtYXMsXG4gICAgICAgIHRlbXBsYXRlU291cmNlVXJsKG5nTW9kdWxlLnR5cGUsIGNvbXBNZXRhLCBjb21wTWV0YS50ZW1wbGF0ZSAhKSwgcHJlc2VydmVXaGl0ZXNwYWNlcyk7XG4gICAgdGhpcy5fdGVtcGxhdGVBc3RDYWNoZS5zZXQoY29tcE1ldGEudHlwZS5yZWZlcmVuY2UsIHJlc3VsdCk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIHByaXZhdGUgX2NyZWF0ZU91dHB1dENvbnRleHQoZ2VuRmlsZVBhdGg6IHN0cmluZyk6IE91dHB1dENvbnRleHQge1xuICAgIGNvbnN0IGltcG9ydEV4cHIgPVxuICAgICAgICAoc3ltYm9sOiBTdGF0aWNTeW1ib2wsIHR5cGVQYXJhbXM6IG8uVHlwZVtdIHwgbnVsbCA9IG51bGwsXG4gICAgICAgICB1c2VTdW1tYXJpZXM6IGJvb2xlYW4gPSB0cnVlKSA9PiB7XG4gICAgICAgICAgaWYgKCEoc3ltYm9sIGluc3RhbmNlb2YgU3RhdGljU3ltYm9sKSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBJbnRlcm5hbCBlcnJvcjogdW5rbm93biBpZGVudGlmaWVyICR7SlNPTi5zdHJpbmdpZnkoc3ltYm9sKX1gKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgY29uc3QgYXJpdHkgPSB0aGlzLl9zeW1ib2xSZXNvbHZlci5nZXRUeXBlQXJpdHkoc3ltYm9sKSB8fCAwO1xuICAgICAgICAgIGNvbnN0IHtmaWxlUGF0aCwgbmFtZSwgbWVtYmVyc30gPVxuICAgICAgICAgICAgICB0aGlzLl9zeW1ib2xSZXNvbHZlci5nZXRJbXBvcnRBcyhzeW1ib2wsIHVzZVN1bW1hcmllcykgfHwgc3ltYm9sO1xuICAgICAgICAgIGNvbnN0IGltcG9ydE1vZHVsZSA9IHRoaXMuX2ZpbGVOYW1lVG9Nb2R1bGVOYW1lKGZpbGVQYXRoLCBnZW5GaWxlUGF0aCk7XG5cbiAgICAgICAgICAvLyBJdCBzaG91bGQgYmUgZ29vZCBlbm91Z2ggdG8gY29tcGFyZSBmaWxlUGF0aCB0byBnZW5GaWxlUGF0aCBhbmQgaWYgdGhleSBhcmUgZXF1YWxcbiAgICAgICAgICAvLyB0aGVyZSBpcyBhIHNlbGYgcmVmZXJlbmNlLiBIb3dldmVyLCBuZ2ZhY3RvcnkgZmlsZXMgZ2VuZXJhdGUgdG8gLnRzIGJ1dCB0aGVpclxuICAgICAgICAgIC8vIHN5bWJvbHMgaGF2ZSAuZC50cyBzbyBhIHNpbXBsZSBjb21wYXJlIGlzIGluc3VmZmljaWVudC4gVGhleSBzaG91bGQgYmUgY2Fub25pY2FsXG4gICAgICAgICAgLy8gYW5kIGlzIHRyYWNrZWQgYnkgIzE3NzA1LlxuICAgICAgICAgIGNvbnN0IHNlbGZSZWZlcmVuY2UgPSB0aGlzLl9maWxlTmFtZVRvTW9kdWxlTmFtZShnZW5GaWxlUGF0aCwgZ2VuRmlsZVBhdGgpO1xuICAgICAgICAgIGNvbnN0IG1vZHVsZU5hbWUgPSBpbXBvcnRNb2R1bGUgPT09IHNlbGZSZWZlcmVuY2UgPyBudWxsIDogaW1wb3J0TW9kdWxlO1xuXG4gICAgICAgICAgLy8gSWYgd2UgYXJlIGluIGEgdHlwZSBleHByZXNzaW9uIHRoYXQgcmVmZXJzIHRvIGEgZ2VuZXJpYyB0eXBlIHRoZW4gc3VwcGx5XG4gICAgICAgICAgLy8gdGhlIHJlcXVpcmVkIHR5cGUgcGFyYW1ldGVycy4gSWYgdGhlcmUgd2VyZSBub3QgZW5vdWdoIHR5cGUgcGFyYW1ldGVyc1xuICAgICAgICAgIC8vIHN1cHBsaWVkLCBzdXBwbHkgYW55IGFzIHRoZSB0eXBlLiBPdXRzaWRlIGEgdHlwZSBleHByZXNzaW9uIHRoZSByZWZlcmVuY2VcbiAgICAgICAgICAvLyBzaG91bGQgbm90IHN1cHBseSB0eXBlIHBhcmFtZXRlcnMgYW5kIGJlIHRyZWF0ZWQgYXMgYSBzaW1wbGUgdmFsdWUgcmVmZXJlbmNlXG4gICAgICAgICAgLy8gdG8gdGhlIGNvbnN0cnVjdG9yIGZ1bmN0aW9uIGl0c2VsZi5cbiAgICAgICAgICBjb25zdCBzdXBwbGllZFR5cGVQYXJhbXMgPSB0eXBlUGFyYW1zIHx8IFtdO1xuICAgICAgICAgIGNvbnN0IG1pc3NpbmdUeXBlUGFyYW1zQ291bnQgPSBhcml0eSAtIHN1cHBsaWVkVHlwZVBhcmFtcy5sZW5ndGg7XG4gICAgICAgICAgY29uc3QgYWxsVHlwZVBhcmFtcyA9XG4gICAgICAgICAgICAgIHN1cHBsaWVkVHlwZVBhcmFtcy5jb25jYXQobmV3QXJyYXkobWlzc2luZ1R5cGVQYXJhbXNDb3VudCwgby5EWU5BTUlDX1RZUEUpKTtcbiAgICAgICAgICByZXR1cm4gbWVtYmVycy5yZWR1Y2UoXG4gICAgICAgICAgICAgIChleHByLCBtZW1iZXJOYW1lKSA9PiBleHByLnByb3AobWVtYmVyTmFtZSksXG4gICAgICAgICAgICAgIDxvLkV4cHJlc3Npb24+by5pbXBvcnRFeHByKFxuICAgICAgICAgICAgICAgICAgbmV3IG8uRXh0ZXJuYWxSZWZlcmVuY2UobW9kdWxlTmFtZSwgbmFtZSwgbnVsbCksIGFsbFR5cGVQYXJhbXMpKTtcbiAgICAgICAgfTtcblxuICAgIHJldHVybiB7c3RhdGVtZW50czogW10sIGdlbkZpbGVQYXRoLCBpbXBvcnRFeHByLCBjb25zdGFudFBvb2w6IG5ldyBDb25zdGFudFBvb2woKX07XG4gIH1cblxuICBwcml2YXRlIF9maWxlTmFtZVRvTW9kdWxlTmFtZShpbXBvcnRlZEZpbGVQYXRoOiBzdHJpbmcsIGNvbnRhaW5pbmdGaWxlUGF0aDogc3RyaW5nKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5fc3VtbWFyeVJlc29sdmVyLmdldEtub3duTW9kdWxlTmFtZShpbXBvcnRlZEZpbGVQYXRoKSB8fFxuICAgICAgICB0aGlzLl9zeW1ib2xSZXNvbHZlci5nZXRLbm93bk1vZHVsZU5hbWUoaW1wb3J0ZWRGaWxlUGF0aCkgfHxcbiAgICAgICAgdGhpcy5faG9zdC5maWxlTmFtZVRvTW9kdWxlTmFtZShpbXBvcnRlZEZpbGVQYXRoLCBjb250YWluaW5nRmlsZVBhdGgpO1xuICB9XG5cbiAgcHJpdmF0ZSBfY29kZWdlblN0eWxlcyhcbiAgICAgIHNyY0ZpbGVVcmw6IHN0cmluZywgY29tcE1ldGE6IENvbXBpbGVEaXJlY3RpdmVNZXRhZGF0YSxcbiAgICAgIHN0eWxlc2hlZXRNZXRhZGF0YTogQ29tcGlsZVN0eWxlc2hlZXRNZXRhZGF0YSwgaXNTaGltbWVkOiBib29sZWFuLFxuICAgICAgZmlsZVN1ZmZpeDogc3RyaW5nKTogR2VuZXJhdGVkRmlsZSB7XG4gICAgY29uc3Qgb3V0cHV0Q3R4ID0gdGhpcy5fY3JlYXRlT3V0cHV0Q29udGV4dChcbiAgICAgICAgX3N0eWxlc01vZHVsZVVybChzdHlsZXNoZWV0TWV0YWRhdGEubW9kdWxlVXJsICEsIGlzU2hpbW1lZCwgZmlsZVN1ZmZpeCkpO1xuICAgIGNvbnN0IGNvbXBpbGVkU3R5bGVzaGVldCA9XG4gICAgICAgIHRoaXMuX3N0eWxlQ29tcGlsZXIuY29tcGlsZVN0eWxlcyhvdXRwdXRDdHgsIGNvbXBNZXRhLCBzdHlsZXNoZWV0TWV0YWRhdGEsIGlzU2hpbW1lZCk7XG4gICAgX3Jlc29sdmVTdHlsZVN0YXRlbWVudHModGhpcy5fc3ltYm9sUmVzb2x2ZXIsIGNvbXBpbGVkU3R5bGVzaGVldCwgaXNTaGltbWVkLCBmaWxlU3VmZml4KTtcbiAgICByZXR1cm4gdGhpcy5fY29kZWdlblNvdXJjZU1vZHVsZShzcmNGaWxlVXJsLCBvdXRwdXRDdHgpO1xuICB9XG5cbiAgcHJpdmF0ZSBfY29kZWdlblNvdXJjZU1vZHVsZShzcmNGaWxlVXJsOiBzdHJpbmcsIGN0eDogT3V0cHV0Q29udGV4dCk6IEdlbmVyYXRlZEZpbGUge1xuICAgIHJldHVybiBuZXcgR2VuZXJhdGVkRmlsZShzcmNGaWxlVXJsLCBjdHguZ2VuRmlsZVBhdGgsIGN0eC5zdGF0ZW1lbnRzKTtcbiAgfVxuXG4gIGxpc3RMYXp5Um91dGVzKGVudHJ5Um91dGU/OiBzdHJpbmcsIGFuYWx5emVkTW9kdWxlcz86IE5nQW5hbHl6ZWRNb2R1bGVzKTogTGF6eVJvdXRlW10ge1xuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuICAgIGlmIChlbnRyeVJvdXRlKSB7XG4gICAgICBjb25zdCBzeW1ib2wgPSBwYXJzZUxhenlSb3V0ZShlbnRyeVJvdXRlLCB0aGlzLnJlZmxlY3RvcikucmVmZXJlbmNlZE1vZHVsZTtcbiAgICAgIHJldHVybiB2aXNpdExhenlSb3V0ZShzeW1ib2wpO1xuICAgIH0gZWxzZSBpZiAoYW5hbHl6ZWRNb2R1bGVzKSB7XG4gICAgICBjb25zdCBhbGxMYXp5Um91dGVzOiBMYXp5Um91dGVbXSA9IFtdO1xuICAgICAgZm9yIChjb25zdCBuZ01vZHVsZSBvZiBhbmFseXplZE1vZHVsZXMubmdNb2R1bGVzKSB7XG4gICAgICAgIGNvbnN0IGxhenlSb3V0ZXMgPSBsaXN0TGF6eVJvdXRlcyhuZ01vZHVsZSwgdGhpcy5yZWZsZWN0b3IpO1xuICAgICAgICBmb3IgKGNvbnN0IGxhenlSb3V0ZSBvZiBsYXp5Um91dGVzKSB7XG4gICAgICAgICAgYWxsTGF6eVJvdXRlcy5wdXNoKGxhenlSb3V0ZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBhbGxMYXp5Um91dGVzO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYEVpdGhlciByb3V0ZSBvciBhbmFseXplZE1vZHVsZXMgaGFzIHRvIGJlIHNwZWNpZmllZCFgKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiB2aXNpdExhenlSb3V0ZShcbiAgICAgICAgc3ltYm9sOiBTdGF0aWNTeW1ib2wsIHNlZW5Sb3V0ZXMgPSBuZXcgU2V0PFN0YXRpY1N5bWJvbD4oKSxcbiAgICAgICAgYWxsTGF6eVJvdXRlczogTGF6eVJvdXRlW10gPSBbXSk6IExhenlSb3V0ZVtdIHtcbiAgICAgIC8vIFN1cHBvcnQgcG9pbnRpbmcgdG8gZGVmYXVsdCBleHBvcnRzLCBidXQgc3RvcCByZWN1cnNpbmcgdGhlcmUsXG4gICAgICAvLyBhcyB0aGUgU3RhdGljUmVmbGVjdG9yIGRvZXMgbm90IHlldCBzdXBwb3J0IGRlZmF1bHQgZXhwb3J0cy5cbiAgICAgIGlmIChzZWVuUm91dGVzLmhhcyhzeW1ib2wpIHx8ICFzeW1ib2wubmFtZSkge1xuICAgICAgICByZXR1cm4gYWxsTGF6eVJvdXRlcztcbiAgICAgIH1cbiAgICAgIHNlZW5Sb3V0ZXMuYWRkKHN5bWJvbCk7XG4gICAgICBjb25zdCBsYXp5Um91dGVzID0gbGlzdExhenlSb3V0ZXMoXG4gICAgICAgICAgc2VsZi5fbWV0YWRhdGFSZXNvbHZlci5nZXROZ01vZHVsZU1ldGFkYXRhKHN5bWJvbCwgdHJ1ZSkgISwgc2VsZi5yZWZsZWN0b3IpO1xuICAgICAgZm9yIChjb25zdCBsYXp5Um91dGUgb2YgbGF6eVJvdXRlcykge1xuICAgICAgICBhbGxMYXp5Um91dGVzLnB1c2gobGF6eVJvdXRlKTtcbiAgICAgICAgdmlzaXRMYXp5Um91dGUobGF6eVJvdXRlLnJlZmVyZW5jZWRNb2R1bGUsIHNlZW5Sb3V0ZXMsIGFsbExhenlSb3V0ZXMpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGFsbExhenlSb3V0ZXM7XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIF9jcmVhdGVFbXB0eVN0dWIob3V0cHV0Q3R4OiBPdXRwdXRDb250ZXh0KSB7XG4gIC8vIE5vdGU6IFdlIG5lZWQgdG8gcHJvZHVjZSBhdCBsZWFzdCBvbmUgaW1wb3J0IHN0YXRlbWVudCBzbyB0aGF0XG4gIC8vIFR5cGVTY3JpcHQga25vd3MgdGhhdCB0aGUgZmlsZSBpcyBhbiBlczYgbW9kdWxlLiBPdGhlcndpc2Ugb3VyIGdlbmVyYXRlZFxuICAvLyBleHBvcnRzIC8gaW1wb3J0cyB3b24ndCBiZSBlbWl0dGVkIHByb3Blcmx5IGJ5IFR5cGVTY3JpcHQuXG4gIG91dHB1dEN0eC5zdGF0ZW1lbnRzLnB1c2goby5pbXBvcnRFeHByKElkZW50aWZpZXJzLkNvbXBvbmVudEZhY3RvcnkpLnRvU3RtdCgpKTtcbn1cblxuXG5mdW5jdGlvbiBfcmVzb2x2ZVN0eWxlU3RhdGVtZW50cyhcbiAgICBzeW1ib2xSZXNvbHZlcjogU3RhdGljU3ltYm9sUmVzb2x2ZXIsIGNvbXBpbGVSZXN1bHQ6IENvbXBpbGVkU3R5bGVzaGVldCwgbmVlZHNTaGltOiBib29sZWFuLFxuICAgIGZpbGVTdWZmaXg6IHN0cmluZyk6IHZvaWQge1xuICBjb21waWxlUmVzdWx0LmRlcGVuZGVuY2llcy5mb3JFYWNoKChkZXApID0+IHtcbiAgICBkZXAuc2V0VmFsdWUoc3ltYm9sUmVzb2x2ZXIuZ2V0U3RhdGljU3ltYm9sKFxuICAgICAgICBfc3R5bGVzTW9kdWxlVXJsKGRlcC5tb2R1bGVVcmwsIG5lZWRzU2hpbSwgZmlsZVN1ZmZpeCksIGRlcC5uYW1lKSk7XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBfc3R5bGVzTW9kdWxlVXJsKHN0eWxlc2hlZXRVcmw6IHN0cmluZywgc2hpbTogYm9vbGVhbiwgc3VmZml4OiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gYCR7c3R5bGVzaGVldFVybH0ke3NoaW0gPyAnLnNoaW0nIDogJyd9Lm5nc3R5bGUke3N1ZmZpeH1gO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIE5nQW5hbHl6ZWRNb2R1bGVzIHtcbiAgbmdNb2R1bGVzOiBDb21waWxlTmdNb2R1bGVNZXRhZGF0YVtdO1xuICBuZ01vZHVsZUJ5UGlwZU9yRGlyZWN0aXZlOiBNYXA8U3RhdGljU3ltYm9sLCBDb21waWxlTmdNb2R1bGVNZXRhZGF0YT47XG4gIGZpbGVzOiBOZ0FuYWx5emVkRmlsZVtdO1xuICBzeW1ib2xzTWlzc2luZ01vZHVsZT86IFN0YXRpY1N5bWJvbFtdO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIE5nQW5hbHl6ZWRGaWxlV2l0aEluamVjdGFibGVzIHtcbiAgZmlsZU5hbWU6IHN0cmluZztcbiAgaW5qZWN0YWJsZXM6IENvbXBpbGVJbmplY3RhYmxlTWV0YWRhdGFbXTtcbiAgc2hhbGxvd01vZHVsZXM6IENvbXBpbGVTaGFsbG93TW9kdWxlTWV0YWRhdGFbXTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBOZ0FuYWx5emVkRmlsZSB7XG4gIGZpbGVOYW1lOiBzdHJpbmc7XG4gIGRpcmVjdGl2ZXM6IFN0YXRpY1N5bWJvbFtdO1xuICBhYnN0cmFjdERpcmVjdGl2ZXM6IFN0YXRpY1N5bWJvbFtdO1xuICBwaXBlczogU3RhdGljU3ltYm9sW107XG4gIG5nTW9kdWxlczogQ29tcGlsZU5nTW9kdWxlTWV0YWRhdGFbXTtcbiAgaW5qZWN0YWJsZXM6IENvbXBpbGVJbmplY3RhYmxlTWV0YWRhdGFbXTtcbiAgZXhwb3J0c05vblNvdXJjZUZpbGVzOiBib29sZWFuO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIE5nQW5hbHl6ZU1vZHVsZXNIb3N0IHsgaXNTb3VyY2VGaWxlKGZpbGVQYXRoOiBzdHJpbmcpOiBib29sZWFuOyB9XG5cbmV4cG9ydCBmdW5jdGlvbiBhbmFseXplTmdNb2R1bGVzKFxuICAgIGZpbGVOYW1lczogc3RyaW5nW10sIGhvc3Q6IE5nQW5hbHl6ZU1vZHVsZXNIb3N0LCBzdGF0aWNTeW1ib2xSZXNvbHZlcjogU3RhdGljU3ltYm9sUmVzb2x2ZXIsXG4gICAgbWV0YWRhdGFSZXNvbHZlcjogQ29tcGlsZU1ldGFkYXRhUmVzb2x2ZXIpOiBOZ0FuYWx5emVkTW9kdWxlcyB7XG4gIGNvbnN0IGZpbGVzID0gX2FuYWx5emVGaWxlc0luY2x1ZGluZ05vblByb2dyYW1GaWxlcyhcbiAgICAgIGZpbGVOYW1lcywgaG9zdCwgc3RhdGljU3ltYm9sUmVzb2x2ZXIsIG1ldGFkYXRhUmVzb2x2ZXIpO1xuICByZXR1cm4gbWVyZ2VBbmFseXplZEZpbGVzKGZpbGVzKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGFuYWx5emVBbmRWYWxpZGF0ZU5nTW9kdWxlcyhcbiAgICBmaWxlTmFtZXM6IHN0cmluZ1tdLCBob3N0OiBOZ0FuYWx5emVNb2R1bGVzSG9zdCwgc3RhdGljU3ltYm9sUmVzb2x2ZXI6IFN0YXRpY1N5bWJvbFJlc29sdmVyLFxuICAgIG1ldGFkYXRhUmVzb2x2ZXI6IENvbXBpbGVNZXRhZGF0YVJlc29sdmVyKTogTmdBbmFseXplZE1vZHVsZXMge1xuICByZXR1cm4gdmFsaWRhdGVBbmFseXplZE1vZHVsZXMoXG4gICAgICBhbmFseXplTmdNb2R1bGVzKGZpbGVOYW1lcywgaG9zdCwgc3RhdGljU3ltYm9sUmVzb2x2ZXIsIG1ldGFkYXRhUmVzb2x2ZXIpKTtcbn1cblxuZnVuY3Rpb24gdmFsaWRhdGVBbmFseXplZE1vZHVsZXMoYW5hbHl6ZWRNb2R1bGVzOiBOZ0FuYWx5emVkTW9kdWxlcyk6IE5nQW5hbHl6ZWRNb2R1bGVzIHtcbiAgaWYgKGFuYWx5emVkTW9kdWxlcy5zeW1ib2xzTWlzc2luZ01vZHVsZSAmJiBhbmFseXplZE1vZHVsZXMuc3ltYm9sc01pc3NpbmdNb2R1bGUubGVuZ3RoKSB7XG4gICAgY29uc3QgbWVzc2FnZXMgPSBhbmFseXplZE1vZHVsZXMuc3ltYm9sc01pc3NpbmdNb2R1bGUubWFwKFxuICAgICAgICBzID0+XG4gICAgICAgICAgICBgQ2Fubm90IGRldGVybWluZSB0aGUgbW9kdWxlIGZvciBjbGFzcyAke3MubmFtZX0gaW4gJHtzLmZpbGVQYXRofSEgQWRkICR7cy5uYW1lfSB0byB0aGUgTmdNb2R1bGUgdG8gZml4IGl0LmApO1xuICAgIHRocm93IHN5bnRheEVycm9yKG1lc3NhZ2VzLmpvaW4oJ1xcbicpKTtcbiAgfVxuICByZXR1cm4gYW5hbHl6ZWRNb2R1bGVzO1xufVxuXG4vLyBBbmFseXplcyBhbGwgb2YgdGhlIHByb2dyYW0gZmlsZXMsXG4vLyBpbmNsdWRpbmcgZmlsZXMgdGhhdCBhcmUgbm90IHBhcnQgb2YgdGhlIHByb2dyYW1cbi8vIGJ1dCBhcmUgcmVmZXJlbmNlZCBieSBhbiBOZ01vZHVsZS5cbmZ1bmN0aW9uIF9hbmFseXplRmlsZXNJbmNsdWRpbmdOb25Qcm9ncmFtRmlsZXMoXG4gICAgZmlsZU5hbWVzOiBzdHJpbmdbXSwgaG9zdDogTmdBbmFseXplTW9kdWxlc0hvc3QsIHN0YXRpY1N5bWJvbFJlc29sdmVyOiBTdGF0aWNTeW1ib2xSZXNvbHZlcixcbiAgICBtZXRhZGF0YVJlc29sdmVyOiBDb21waWxlTWV0YWRhdGFSZXNvbHZlcik6IE5nQW5hbHl6ZWRGaWxlW10ge1xuICBjb25zdCBzZWVuRmlsZXMgPSBuZXcgU2V0PHN0cmluZz4oKTtcbiAgY29uc3QgZmlsZXM6IE5nQW5hbHl6ZWRGaWxlW10gPSBbXTtcblxuICBjb25zdCB2aXNpdEZpbGUgPSAoZmlsZU5hbWU6IHN0cmluZykgPT4ge1xuICAgIGlmIChzZWVuRmlsZXMuaGFzKGZpbGVOYW1lKSB8fCAhaG9zdC5pc1NvdXJjZUZpbGUoZmlsZU5hbWUpKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHNlZW5GaWxlcy5hZGQoZmlsZU5hbWUpO1xuICAgIGNvbnN0IGFuYWx5emVkRmlsZSA9IGFuYWx5emVGaWxlKGhvc3QsIHN0YXRpY1N5bWJvbFJlc29sdmVyLCBtZXRhZGF0YVJlc29sdmVyLCBmaWxlTmFtZSk7XG4gICAgZmlsZXMucHVzaChhbmFseXplZEZpbGUpO1xuICAgIGFuYWx5emVkRmlsZS5uZ01vZHVsZXMuZm9yRWFjaChuZ01vZHVsZSA9PiB7XG4gICAgICBuZ01vZHVsZS50cmFuc2l0aXZlTW9kdWxlLm1vZHVsZXMuZm9yRWFjaChtb2RNZXRhID0+IHZpc2l0RmlsZShtb2RNZXRhLnJlZmVyZW5jZS5maWxlUGF0aCkpO1xuICAgIH0pO1xuICB9O1xuICBmaWxlTmFtZXMuZm9yRWFjaCgoZmlsZU5hbWUpID0+IHZpc2l0RmlsZShmaWxlTmFtZSkpO1xuICByZXR1cm4gZmlsZXM7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhbmFseXplRmlsZShcbiAgICBob3N0OiBOZ0FuYWx5emVNb2R1bGVzSG9zdCwgc3RhdGljU3ltYm9sUmVzb2x2ZXI6IFN0YXRpY1N5bWJvbFJlc29sdmVyLFxuICAgIG1ldGFkYXRhUmVzb2x2ZXI6IENvbXBpbGVNZXRhZGF0YVJlc29sdmVyLCBmaWxlTmFtZTogc3RyaW5nKTogTmdBbmFseXplZEZpbGUge1xuICBjb25zdCBhYnN0cmFjdERpcmVjdGl2ZXM6IFN0YXRpY1N5bWJvbFtdID0gW107XG4gIGNvbnN0IGRpcmVjdGl2ZXM6IFN0YXRpY1N5bWJvbFtdID0gW107XG4gIGNvbnN0IHBpcGVzOiBTdGF0aWNTeW1ib2xbXSA9IFtdO1xuICBjb25zdCBpbmplY3RhYmxlczogQ29tcGlsZUluamVjdGFibGVNZXRhZGF0YVtdID0gW107XG4gIGNvbnN0IG5nTW9kdWxlczogQ29tcGlsZU5nTW9kdWxlTWV0YWRhdGFbXSA9IFtdO1xuICBjb25zdCBoYXNEZWNvcmF0b3JzID0gc3RhdGljU3ltYm9sUmVzb2x2ZXIuaGFzRGVjb3JhdG9ycyhmaWxlTmFtZSk7XG4gIGxldCBleHBvcnRzTm9uU291cmNlRmlsZXMgPSBmYWxzZTtcbiAgY29uc3QgaXNEZWNsYXJhdGlvbkZpbGUgPSBmaWxlTmFtZS5lbmRzV2l0aCgnLmQudHMnKTtcbiAgLy8gRG9uJ3QgYW5hbHl6ZSAuZC50cyBmaWxlcyB0aGF0IGhhdmUgbm8gZGVjb3JhdG9ycyBhcyBhIHNob3J0Y3V0XG4gIC8vIHRvIHNwZWVkIHVwIHRoZSBhbmFseXNpcy4gVGhpcyBwcmV2ZW50cyB1cyBmcm9tXG4gIC8vIHJlc29sdmluZyB0aGUgcmVmZXJlbmNlcyBpbiB0aGVzZSBmaWxlcy5cbiAgLy8gTm90ZTogZXhwb3J0c05vblNvdXJjZUZpbGVzIGlzIG9ubHkgbmVlZGVkIHdoZW4gY29tcGlsaW5nIHdpdGggc3VtbWFyaWVzLFxuICAvLyB3aGljaCBpcyBub3QgdGhlIGNhc2Ugd2hlbiAuZC50cyBmaWxlcyBhcmUgdHJlYXRlZCBhcyBpbnB1dCBmaWxlcy5cbiAgaWYgKCFpc0RlY2xhcmF0aW9uRmlsZSB8fCBoYXNEZWNvcmF0b3JzKSB7XG4gICAgc3RhdGljU3ltYm9sUmVzb2x2ZXIuZ2V0U3ltYm9sc09mKGZpbGVOYW1lKS5mb3JFYWNoKChzeW1ib2wpID0+IHtcbiAgICAgIGNvbnN0IHJlc29sdmVkU3ltYm9sID0gc3RhdGljU3ltYm9sUmVzb2x2ZXIucmVzb2x2ZVN5bWJvbChzeW1ib2wpO1xuICAgICAgY29uc3Qgc3ltYm9sTWV0YSA9IHJlc29sdmVkU3ltYm9sLm1ldGFkYXRhO1xuICAgICAgaWYgKCFzeW1ib2xNZXRhIHx8IHN5bWJvbE1ldGEuX19zeW1ib2xpYyA9PT0gJ2Vycm9yJykge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBsZXQgaXNOZ1N5bWJvbCA9IGZhbHNlO1xuICAgICAgaWYgKHN5bWJvbE1ldGEuX19zeW1ib2xpYyA9PT0gJ2NsYXNzJykge1xuICAgICAgICBpZiAobWV0YWRhdGFSZXNvbHZlci5pc0RpcmVjdGl2ZShzeW1ib2wpKSB7XG4gICAgICAgICAgaXNOZ1N5bWJvbCA9IHRydWU7XG4gICAgICAgICAgaWYgKCFpc0RlY2xhcmF0aW9uRmlsZSkge1xuICAgICAgICAgICAgLy8gVGhpcyBkaXJlY3RpdmUgZWl0aGVyIGhhcyBhIHNlbGVjdG9yIG9yIGRvZXNuJ3QuIFNlbGVjdG9yLWxlc3MgZGlyZWN0aXZlcyBnZXQgdHJhY2tlZFxuICAgICAgICAgICAgLy8gaW4gYWJzdHJhY3REaXJlY3RpdmVzLCBub3QgZGlyZWN0aXZlcy4gVGhlIGNvbXBpbGVyIGRvZXNuJ3QgZGVhbCB3aXRoIHNlbGVjdG9yLWxlc3NcbiAgICAgICAgICAgIC8vIGRpcmVjdGl2ZXMgYXQgYWxsLCByZWFsbHksIG90aGVyIHRoYW4gdG8gcGVyc2lzdCB0aGVpciBtZXRhZGF0YS4gVGhpcyBpcyBkb25lIHNvIHRoYXRcbiAgICAgICAgICAgIC8vIGFwcHMgd2lsbCBoYXZlIGFuIGVhc2llciB0aW1lIG1pZ3JhdGluZyB0byBJdnksIHdoaWNoIHJlcXVpcmVzIHRoZSBzZWxlY3Rvci1sZXNzXG4gICAgICAgICAgICAvLyBhbm5vdGF0aW9ucyB0byBiZSBhcHBsaWVkLlxuICAgICAgICAgICAgaWYgKCFtZXRhZGF0YVJlc29sdmVyLmlzQWJzdHJhY3REaXJlY3RpdmUoc3ltYm9sKSkge1xuICAgICAgICAgICAgICAvLyBUaGUgZGlyZWN0aXZlIGlzIGFuIG9yZGluYXJ5IGRpcmVjdGl2ZS5cbiAgICAgICAgICAgICAgZGlyZWN0aXZlcy5wdXNoKHN5bWJvbCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAvLyBUaGUgZGlyZWN0aXZlIGhhcyBubyBzZWxlY3RvciBhbmQgaXMgYW4gXCJhYnN0cmFjdFwiIGRpcmVjdGl2ZSwgc28gdHJhY2sgaXRcbiAgICAgICAgICAgICAgLy8gYWNjb3JkaW5nbHkuXG4gICAgICAgICAgICAgIGFic3RyYWN0RGlyZWN0aXZlcy5wdXNoKHN5bWJvbCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGRpcmVjdGl2ZXMucHVzaChzeW1ib2wpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmIChtZXRhZGF0YVJlc29sdmVyLmlzUGlwZShzeW1ib2wpKSB7XG4gICAgICAgICAgaXNOZ1N5bWJvbCA9IHRydWU7XG4gICAgICAgICAgcGlwZXMucHVzaChzeW1ib2wpO1xuICAgICAgICB9IGVsc2UgaWYgKG1ldGFkYXRhUmVzb2x2ZXIuaXNOZ01vZHVsZShzeW1ib2wpKSB7XG4gICAgICAgICAgY29uc3QgbmdNb2R1bGUgPSBtZXRhZGF0YVJlc29sdmVyLmdldE5nTW9kdWxlTWV0YWRhdGEoc3ltYm9sLCBmYWxzZSk7XG4gICAgICAgICAgaWYgKG5nTW9kdWxlKSB7XG4gICAgICAgICAgICBpc05nU3ltYm9sID0gdHJ1ZTtcbiAgICAgICAgICAgIG5nTW9kdWxlcy5wdXNoKG5nTW9kdWxlKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAobWV0YWRhdGFSZXNvbHZlci5pc0luamVjdGFibGUoc3ltYm9sKSkge1xuICAgICAgICAgIGlzTmdTeW1ib2wgPSB0cnVlO1xuICAgICAgICAgIGNvbnN0IGluamVjdGFibGUgPSBtZXRhZGF0YVJlc29sdmVyLmdldEluamVjdGFibGVNZXRhZGF0YShzeW1ib2wsIG51bGwsIGZhbHNlKTtcbiAgICAgICAgICBpZiAoaW5qZWN0YWJsZSkge1xuICAgICAgICAgICAgaW5qZWN0YWJsZXMucHVzaChpbmplY3RhYmxlKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmICghaXNOZ1N5bWJvbCkge1xuICAgICAgICBleHBvcnRzTm9uU291cmNlRmlsZXMgPVxuICAgICAgICAgICAgZXhwb3J0c05vblNvdXJjZUZpbGVzIHx8IGlzVmFsdWVFeHBvcnRpbmdOb25Tb3VyY2VGaWxlKGhvc3QsIHN5bWJvbE1ldGEpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG4gIHJldHVybiB7XG4gICAgICBmaWxlTmFtZSwgIGRpcmVjdGl2ZXMsICBhYnN0cmFjdERpcmVjdGl2ZXMsICAgIHBpcGVzLFxuICAgICAgbmdNb2R1bGVzLCBpbmplY3RhYmxlcywgZXhwb3J0c05vblNvdXJjZUZpbGVzLFxuICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYW5hbHl6ZUZpbGVGb3JJbmplY3RhYmxlcyhcbiAgICBob3N0OiBOZ0FuYWx5emVNb2R1bGVzSG9zdCwgc3RhdGljU3ltYm9sUmVzb2x2ZXI6IFN0YXRpY1N5bWJvbFJlc29sdmVyLFxuICAgIG1ldGFkYXRhUmVzb2x2ZXI6IENvbXBpbGVNZXRhZGF0YVJlc29sdmVyLCBmaWxlTmFtZTogc3RyaW5nKTogTmdBbmFseXplZEZpbGVXaXRoSW5qZWN0YWJsZXMge1xuICBjb25zdCBpbmplY3RhYmxlczogQ29tcGlsZUluamVjdGFibGVNZXRhZGF0YVtdID0gW107XG4gIGNvbnN0IHNoYWxsb3dNb2R1bGVzOiBDb21waWxlU2hhbGxvd01vZHVsZU1ldGFkYXRhW10gPSBbXTtcbiAgaWYgKHN0YXRpY1N5bWJvbFJlc29sdmVyLmhhc0RlY29yYXRvcnMoZmlsZU5hbWUpKSB7XG4gICAgc3RhdGljU3ltYm9sUmVzb2x2ZXIuZ2V0U3ltYm9sc09mKGZpbGVOYW1lKS5mb3JFYWNoKChzeW1ib2wpID0+IHtcbiAgICAgIGNvbnN0IHJlc29sdmVkU3ltYm9sID0gc3RhdGljU3ltYm9sUmVzb2x2ZXIucmVzb2x2ZVN5bWJvbChzeW1ib2wpO1xuICAgICAgY29uc3Qgc3ltYm9sTWV0YSA9IHJlc29sdmVkU3ltYm9sLm1ldGFkYXRhO1xuICAgICAgaWYgKCFzeW1ib2xNZXRhIHx8IHN5bWJvbE1ldGEuX19zeW1ib2xpYyA9PT0gJ2Vycm9yJykge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBpZiAoc3ltYm9sTWV0YS5fX3N5bWJvbGljID09PSAnY2xhc3MnKSB7XG4gICAgICAgIGlmIChtZXRhZGF0YVJlc29sdmVyLmlzSW5qZWN0YWJsZShzeW1ib2wpKSB7XG4gICAgICAgICAgY29uc3QgaW5qZWN0YWJsZSA9IG1ldGFkYXRhUmVzb2x2ZXIuZ2V0SW5qZWN0YWJsZU1ldGFkYXRhKHN5bWJvbCwgbnVsbCwgZmFsc2UpO1xuICAgICAgICAgIGlmIChpbmplY3RhYmxlKSB7XG4gICAgICAgICAgICBpbmplY3RhYmxlcy5wdXNoKGluamVjdGFibGUpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmIChtZXRhZGF0YVJlc29sdmVyLmlzTmdNb2R1bGUoc3ltYm9sKSkge1xuICAgICAgICAgIGNvbnN0IG1vZHVsZSA9IG1ldGFkYXRhUmVzb2x2ZXIuZ2V0U2hhbGxvd01vZHVsZU1ldGFkYXRhKHN5bWJvbCk7XG4gICAgICAgICAgaWYgKG1vZHVsZSkge1xuICAgICAgICAgICAgc2hhbGxvd01vZHVsZXMucHVzaChtb2R1bGUpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICB9XG4gIHJldHVybiB7ZmlsZU5hbWUsIGluamVjdGFibGVzLCBzaGFsbG93TW9kdWxlc307XG59XG5cbmZ1bmN0aW9uIGlzVmFsdWVFeHBvcnRpbmdOb25Tb3VyY2VGaWxlKGhvc3Q6IE5nQW5hbHl6ZU1vZHVsZXNIb3N0LCBtZXRhZGF0YTogYW55KTogYm9vbGVhbiB7XG4gIGxldCBleHBvcnRzTm9uU291cmNlRmlsZXMgPSBmYWxzZTtcblxuICBjbGFzcyBWaXNpdG9yIGltcGxlbWVudHMgVmFsdWVWaXNpdG9yIHtcbiAgICB2aXNpdEFycmF5KGFycjogYW55W10sIGNvbnRleHQ6IGFueSk6IGFueSB7IGFyci5mb3JFYWNoKHYgPT4gdmlzaXRWYWx1ZSh2LCB0aGlzLCBjb250ZXh0KSk7IH1cbiAgICB2aXNpdFN0cmluZ01hcChtYXA6IHtba2V5OiBzdHJpbmddOiBhbnl9LCBjb250ZXh0OiBhbnkpOiBhbnkge1xuICAgICAgT2JqZWN0LmtleXMobWFwKS5mb3JFYWNoKChrZXkpID0+IHZpc2l0VmFsdWUobWFwW2tleV0sIHRoaXMsIGNvbnRleHQpKTtcbiAgICB9XG4gICAgdmlzaXRQcmltaXRpdmUodmFsdWU6IGFueSwgY29udGV4dDogYW55KTogYW55IHt9XG4gICAgdmlzaXRPdGhlcih2YWx1ZTogYW55LCBjb250ZXh0OiBhbnkpOiBhbnkge1xuICAgICAgaWYgKHZhbHVlIGluc3RhbmNlb2YgU3RhdGljU3ltYm9sICYmICFob3N0LmlzU291cmNlRmlsZSh2YWx1ZS5maWxlUGF0aCkpIHtcbiAgICAgICAgZXhwb3J0c05vblNvdXJjZUZpbGVzID0gdHJ1ZTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICB2aXNpdFZhbHVlKG1ldGFkYXRhLCBuZXcgVmlzaXRvcigpLCBudWxsKTtcbiAgcmV0dXJuIGV4cG9ydHNOb25Tb3VyY2VGaWxlcztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1lcmdlQW5hbHl6ZWRGaWxlcyhhbmFseXplZEZpbGVzOiBOZ0FuYWx5emVkRmlsZVtdKTogTmdBbmFseXplZE1vZHVsZXMge1xuICBjb25zdCBhbGxOZ01vZHVsZXM6IENvbXBpbGVOZ01vZHVsZU1ldGFkYXRhW10gPSBbXTtcbiAgY29uc3QgbmdNb2R1bGVCeVBpcGVPckRpcmVjdGl2ZSA9IG5ldyBNYXA8U3RhdGljU3ltYm9sLCBDb21waWxlTmdNb2R1bGVNZXRhZGF0YT4oKTtcbiAgY29uc3QgYWxsUGlwZXNBbmREaXJlY3RpdmVzID0gbmV3IFNldDxTdGF0aWNTeW1ib2w+KCk7XG5cbiAgYW5hbHl6ZWRGaWxlcy5mb3JFYWNoKGFmID0+IHtcbiAgICBhZi5uZ01vZHVsZXMuZm9yRWFjaChuZ01vZHVsZSA9PiB7XG4gICAgICBhbGxOZ01vZHVsZXMucHVzaChuZ01vZHVsZSk7XG4gICAgICBuZ01vZHVsZS5kZWNsYXJlZERpcmVjdGl2ZXMuZm9yRWFjaChcbiAgICAgICAgICBkID0+IG5nTW9kdWxlQnlQaXBlT3JEaXJlY3RpdmUuc2V0KGQucmVmZXJlbmNlLCBuZ01vZHVsZSkpO1xuICAgICAgbmdNb2R1bGUuZGVjbGFyZWRQaXBlcy5mb3JFYWNoKHAgPT4gbmdNb2R1bGVCeVBpcGVPckRpcmVjdGl2ZS5zZXQocC5yZWZlcmVuY2UsIG5nTW9kdWxlKSk7XG4gICAgfSk7XG4gICAgYWYuZGlyZWN0aXZlcy5mb3JFYWNoKGQgPT4gYWxsUGlwZXNBbmREaXJlY3RpdmVzLmFkZChkKSk7XG4gICAgYWYucGlwZXMuZm9yRWFjaChwID0+IGFsbFBpcGVzQW5kRGlyZWN0aXZlcy5hZGQocCkpO1xuICB9KTtcblxuICBjb25zdCBzeW1ib2xzTWlzc2luZ01vZHVsZTogU3RhdGljU3ltYm9sW10gPSBbXTtcbiAgYWxsUGlwZXNBbmREaXJlY3RpdmVzLmZvckVhY2gocmVmID0+IHtcbiAgICBpZiAoIW5nTW9kdWxlQnlQaXBlT3JEaXJlY3RpdmUuaGFzKHJlZikpIHtcbiAgICAgIHN5bWJvbHNNaXNzaW5nTW9kdWxlLnB1c2gocmVmKTtcbiAgICB9XG4gIH0pO1xuICByZXR1cm4ge1xuICAgIG5nTW9kdWxlczogYWxsTmdNb2R1bGVzLFxuICAgIG5nTW9kdWxlQnlQaXBlT3JEaXJlY3RpdmUsXG4gICAgc3ltYm9sc01pc3NpbmdNb2R1bGUsXG4gICAgZmlsZXM6IGFuYWx5emVkRmlsZXNcbiAgfTtcbn1cblxuZnVuY3Rpb24gbWVyZ2VBbmRWYWxpZGF0ZU5nRmlsZXMoZmlsZXM6IE5nQW5hbHl6ZWRGaWxlW10pOiBOZ0FuYWx5emVkTW9kdWxlcyB7XG4gIHJldHVybiB2YWxpZGF0ZUFuYWx5emVkTW9kdWxlcyhtZXJnZUFuYWx5emVkRmlsZXMoZmlsZXMpKTtcbn1cbiJdfQ==