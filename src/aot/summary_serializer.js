(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler/src/aot/summary_serializer", ["require", "exports", "tslib", "@angular/compiler/src/compile_metadata", "@angular/compiler/src/output/output_ast", "@angular/compiler/src/util", "@angular/compiler/src/aot/static_symbol", "@angular/compiler/src/aot/static_symbol_resolver", "@angular/compiler/src/aot/util"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require("tslib");
    /**
     * @license
     * Copyright Google Inc. All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var compile_metadata_1 = require("@angular/compiler/src/compile_metadata");
    var o = require("@angular/compiler/src/output/output_ast");
    var util_1 = require("@angular/compiler/src/util");
    var static_symbol_1 = require("@angular/compiler/src/aot/static_symbol");
    var static_symbol_resolver_1 = require("@angular/compiler/src/aot/static_symbol_resolver");
    var util_2 = require("@angular/compiler/src/aot/util");
    function serializeSummaries(srcFileName, forJitCtx, summaryResolver, symbolResolver, symbols, types, createExternalSymbolReexports) {
        if (createExternalSymbolReexports === void 0) { createExternalSymbolReexports = false; }
        var toJsonSerializer = new ToJsonSerializer(symbolResolver, summaryResolver, srcFileName);
        // for symbols, we use everything except for the class metadata itself
        // (we keep the statics though), as the class metadata is contained in the
        // CompileTypeSummary.
        symbols.forEach(function (resolvedSymbol) { return toJsonSerializer.addSummary({ symbol: resolvedSymbol.symbol, metadata: resolvedSymbol.metadata }); });
        // Add type summaries.
        types.forEach(function (_a) {
            var summary = _a.summary, metadata = _a.metadata;
            toJsonSerializer.addSummary({ symbol: summary.type.reference, metadata: undefined, type: summary });
        });
        var _a = toJsonSerializer.serialize(createExternalSymbolReexports), json = _a.json, exportAs = _a.exportAs;
        if (forJitCtx) {
            var forJitSerializer_1 = new ForJitSerializer(forJitCtx, symbolResolver, summaryResolver);
            types.forEach(function (_a) {
                var summary = _a.summary, metadata = _a.metadata;
                forJitSerializer_1.addSourceType(summary, metadata);
            });
            toJsonSerializer.unprocessedSymbolSummariesBySymbol.forEach(function (summary) {
                if (summaryResolver.isLibraryFile(summary.symbol.filePath) && summary.type) {
                    forJitSerializer_1.addLibType(summary.type);
                }
            });
            forJitSerializer_1.serialize(exportAs);
        }
        return { json: json, exportAs: exportAs };
    }
    exports.serializeSummaries = serializeSummaries;
    function deserializeSummaries(symbolCache, summaryResolver, libraryFileName, json) {
        var deserializer = new FromJsonDeserializer(symbolCache, summaryResolver);
        return deserializer.deserialize(libraryFileName, json);
    }
    exports.deserializeSummaries = deserializeSummaries;
    function createForJitStub(outputCtx, reference) {
        return createSummaryForJitFunction(outputCtx, reference, o.NULL_EXPR);
    }
    exports.createForJitStub = createForJitStub;
    function createSummaryForJitFunction(outputCtx, reference, value) {
        var fnName = util_2.summaryForJitName(reference.name);
        outputCtx.statements.push(o.fn([], [new o.ReturnStatement(value)], new o.ArrayType(o.DYNAMIC_TYPE)).toDeclStmt(fnName, [
            o.StmtModifier.Final, o.StmtModifier.Exported
        ]));
    }
    var ToJsonSerializer = /** @class */ (function (_super) {
        tslib_1.__extends(ToJsonSerializer, _super);
        function ToJsonSerializer(symbolResolver, summaryResolver, srcFileName) {
            var _this = _super.call(this) || this;
            _this.symbolResolver = symbolResolver;
            _this.summaryResolver = summaryResolver;
            _this.srcFileName = srcFileName;
            // Note: This only contains symbols without members.
            _this.symbols = [];
            _this.indexBySymbol = new Map();
            _this.reexportedBy = new Map();
            // This now contains a `__symbol: number` in the place of
            // StaticSymbols, but otherwise has the same shape as the original objects.
            _this.processedSummaryBySymbol = new Map();
            _this.processedSummaries = [];
            _this.unprocessedSymbolSummariesBySymbol = new Map();
            _this.moduleName = symbolResolver.getKnownModuleName(srcFileName);
            return _this;
        }
        ToJsonSerializer.prototype.addSummary = function (summary) {
            var _this = this;
            var unprocessedSummary = this.unprocessedSymbolSummariesBySymbol.get(summary.symbol);
            var processedSummary = this.processedSummaryBySymbol.get(summary.symbol);
            if (!unprocessedSummary) {
                unprocessedSummary = { symbol: summary.symbol, metadata: undefined };
                this.unprocessedSymbolSummariesBySymbol.set(summary.symbol, unprocessedSummary);
                processedSummary = { symbol: this.processValue(summary.symbol, 0 /* None */) };
                this.processedSummaries.push(processedSummary);
                this.processedSummaryBySymbol.set(summary.symbol, processedSummary);
            }
            if (!unprocessedSummary.metadata && summary.metadata) {
                var metadata_1 = summary.metadata || {};
                if (metadata_1.__symbolic === 'class') {
                    // For classes, we keep everything except their class decorators.
                    // We need to keep e.g. the ctor args, method names, method decorators
                    // so that the class can be extended in another compilation unit.
                    // We don't keep the class decorators as
                    // 1) they refer to data
                    //   that should not cause a rebuild of downstream compilation units
                    //   (e.g. inline templates of @Component, or @NgModule.declarations)
                    // 2) their data is already captured in TypeSummaries, e.g. DirectiveSummary.
                    var clone_1 = {};
                    Object.keys(metadata_1).forEach(function (propName) {
                        if (propName !== 'decorators') {
                            clone_1[propName] = metadata_1[propName];
                        }
                    });
                    metadata_1 = clone_1;
                }
                else if (isCall(metadata_1)) {
                    if (!isFunctionCall(metadata_1) && !isMethodCallOnVariable(metadata_1)) {
                        // Don't store complex calls as we won't be able to simplify them anyways later on.
                        metadata_1 = {
                            __symbolic: 'error',
                            message: 'Complex function calls are not supported.',
                        };
                    }
                }
                // Note: We need to keep storing ctor calls for e.g.
                // `export const x = new InjectionToken(...)`
                unprocessedSummary.metadata = metadata_1;
                processedSummary.metadata = this.processValue(metadata_1, 1 /* ResolveValue */);
                if (metadata_1 instanceof static_symbol_1.StaticSymbol &&
                    this.summaryResolver.isLibraryFile(metadata_1.filePath)) {
                    var declarationSymbol = this.symbols[this.indexBySymbol.get(metadata_1)];
                    if (!util_2.isLoweredSymbol(declarationSymbol.name)) {
                        // Note: symbols that were introduced during codegen in the user file can have a reexport
                        // if a user used `export *`. However, we can't rely on this as tsickle will change
                        // `export *` into named exports, using only the information from the typechecker.
                        // As we introduce the new symbols after typecheck, Tsickle does not know about them,
                        // and omits them when expanding `export *`.
                        // So we have to keep reexporting these symbols manually via .ngfactory files.
                        this.reexportedBy.set(declarationSymbol, summary.symbol);
                    }
                }
            }
            if (!unprocessedSummary.type && summary.type) {
                unprocessedSummary.type = summary.type;
                // Note: We don't add the summaries of all referenced symbols as for the ResolvedSymbols,
                // as the type summaries already contain the transitive data that they require
                // (in a minimal way).
                processedSummary.type = this.processValue(summary.type, 0 /* None */);
                // except for reexported directives / pipes, so we need to store
                // their summaries explicitly.
                if (summary.type.summaryKind === compile_metadata_1.CompileSummaryKind.NgModule) {
                    var ngModuleSummary = summary.type;
                    ngModuleSummary.exportedDirectives.concat(ngModuleSummary.exportedPipes).forEach(function (id) {
                        var symbol = id.reference;
                        if (_this.summaryResolver.isLibraryFile(symbol.filePath) &&
                            !_this.unprocessedSymbolSummariesBySymbol.has(symbol)) {
                            var summary_1 = _this.summaryResolver.resolveSummary(symbol);
                            if (summary_1) {
                                _this.addSummary(summary_1);
                            }
                        }
                    });
                }
            }
        };
        /**
         * @param createExternalSymbolReexports Whether external static symbols should be re-exported.
         * This can be enabled if external symbols should be re-exported by the current module in
         * order to avoid dynamically generated module dependencies which can break strict dependency
         * enforcements (as in Google3). Read more here: https://github.com/angular/angular/issues/25644
         */
        ToJsonSerializer.prototype.serialize = function (createExternalSymbolReexports) {
            var _this = this;
            var exportAs = [];
            var json = JSON.stringify({
                moduleName: this.moduleName,
                summaries: this.processedSummaries,
                symbols: this.symbols.map(function (symbol, index) {
                    symbol.assertNoMembers();
                    var importAs = undefined;
                    if (_this.summaryResolver.isLibraryFile(symbol.filePath)) {
                        var reexportSymbol = _this.reexportedBy.get(symbol);
                        if (reexportSymbol) {
                            // In case the given external static symbol is already manually exported by the
                            // user, we just proxy the external static symbol reference to the manual export.
                            // This ensures that the AOT compiler imports the external symbol through the
                            // user export and does not introduce another dependency which is not needed.
                            importAs = _this.indexBySymbol.get(reexportSymbol);
                        }
                        else if (createExternalSymbolReexports) {
                            // In this case, the given external static symbol is *not* manually exported by
                            // the user, and we manually create a re-export in the factory file so that we
                            // don't introduce another module dependency. This is useful when running within
                            // Bazel so that the AOT compiler does not introduce any module dependencies
                            // which can break the strict dependency enforcement. (e.g. as in Google3)
                            // Read more about this here: https://github.com/angular/angular/issues/25644
                            var summary = _this.unprocessedSymbolSummariesBySymbol.get(symbol);
                            if (!summary || !summary.metadata || summary.metadata.__symbolic !== 'interface') {
                                importAs = symbol.name + "_" + index;
                                exportAs.push({ symbol: symbol, exportAs: importAs });
                            }
                        }
                    }
                    return {
                        __symbol: index,
                        name: symbol.name,
                        filePath: _this.summaryResolver.toSummaryFileName(symbol.filePath, _this.srcFileName),
                        importAs: importAs
                    };
                })
            });
            return { json: json, exportAs: exportAs };
        };
        ToJsonSerializer.prototype.processValue = function (value, flags) {
            return util_1.visitValue(value, this, flags);
        };
        ToJsonSerializer.prototype.visitOther = function (value, context) {
            if (value instanceof static_symbol_1.StaticSymbol) {
                var baseSymbol = this.symbolResolver.getStaticSymbol(value.filePath, value.name);
                var index = this.visitStaticSymbol(baseSymbol, context);
                return { __symbol: index, members: value.members };
            }
        };
        /**
         * Strip line and character numbers from ngsummaries.
         * Emitting them causes white spaces changes to retrigger upstream
         * recompilations in bazel.
         * TODO: find out a way to have line and character numbers in errors without
         * excessive recompilation in bazel.
         */
        ToJsonSerializer.prototype.visitStringMap = function (map, context) {
            if (map['__symbolic'] === 'resolved') {
                return util_1.visitValue(map.symbol, this, context);
            }
            if (map['__symbolic'] === 'error') {
                delete map['line'];
                delete map['character'];
            }
            return _super.prototype.visitStringMap.call(this, map, context);
        };
        /**
         * Returns null if the options.resolveValue is true, and the summary for the symbol
         * resolved to a type or could not be resolved.
         */
        ToJsonSerializer.prototype.visitStaticSymbol = function (baseSymbol, flags) {
            var index = this.indexBySymbol.get(baseSymbol);
            var summary = null;
            if (flags & 1 /* ResolveValue */ &&
                this.summaryResolver.isLibraryFile(baseSymbol.filePath)) {
                if (this.unprocessedSymbolSummariesBySymbol.has(baseSymbol)) {
                    // the summary for this symbol was already added
                    // -> nothing to do.
                    return index;
                }
                summary = this.loadSummary(baseSymbol);
                if (summary && summary.metadata instanceof static_symbol_1.StaticSymbol) {
                    // The summary is a reexport
                    index = this.visitStaticSymbol(summary.metadata, flags);
                    // reset the summary as it is just a reexport, so we don't want to store it.
                    summary = null;
                }
            }
            else if (index != null) {
                // Note: == on purpose to compare with undefined!
                // No summary and the symbol is already added -> nothing to do.
                return index;
            }
            // Note: == on purpose to compare with undefined!
            if (index == null) {
                index = this.symbols.length;
                this.symbols.push(baseSymbol);
            }
            this.indexBySymbol.set(baseSymbol, index);
            if (summary) {
                this.addSummary(summary);
            }
            return index;
        };
        ToJsonSerializer.prototype.loadSummary = function (symbol) {
            var summary = this.summaryResolver.resolveSummary(symbol);
            if (!summary) {
                // some symbols might originate from a plain typescript library
                // that just exported .d.ts and .metadata.json files, i.e. where no summary
                // files were created.
                var resolvedSymbol = this.symbolResolver.resolveSymbol(symbol);
                if (resolvedSymbol) {
                    summary = { symbol: resolvedSymbol.symbol, metadata: resolvedSymbol.metadata };
                }
            }
            return summary;
        };
        return ToJsonSerializer;
    }(util_1.ValueTransformer));
    var ForJitSerializer = /** @class */ (function () {
        function ForJitSerializer(outputCtx, symbolResolver, summaryResolver) {
            this.outputCtx = outputCtx;
            this.symbolResolver = symbolResolver;
            this.summaryResolver = summaryResolver;
            this.data = [];
        }
        ForJitSerializer.prototype.addSourceType = function (summary, metadata) {
            this.data.push({ summary: summary, metadata: metadata, isLibrary: false });
        };
        ForJitSerializer.prototype.addLibType = function (summary) {
            this.data.push({ summary: summary, metadata: null, isLibrary: true });
        };
        ForJitSerializer.prototype.serialize = function (exportAsArr) {
            var _this = this;
            var e_1, _a, e_2, _b, e_3, _c;
            var exportAsBySymbol = new Map();
            try {
                for (var exportAsArr_1 = tslib_1.__values(exportAsArr), exportAsArr_1_1 = exportAsArr_1.next(); !exportAsArr_1_1.done; exportAsArr_1_1 = exportAsArr_1.next()) {
                    var _d = exportAsArr_1_1.value, symbol = _d.symbol, exportAs = _d.exportAs;
                    exportAsBySymbol.set(symbol, exportAs);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (exportAsArr_1_1 && !exportAsArr_1_1.done && (_a = exportAsArr_1.return)) _a.call(exportAsArr_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
            var ngModuleSymbols = new Set();
            try {
                for (var _e = tslib_1.__values(this.data), _f = _e.next(); !_f.done; _f = _e.next()) {
                    var _g = _f.value, summary = _g.summary, metadata = _g.metadata, isLibrary = _g.isLibrary;
                    if (summary.summaryKind === compile_metadata_1.CompileSummaryKind.NgModule) {
                        // collect the symbols that refer to NgModule classes.
                        // Note: we can't just rely on `summary.type.summaryKind` to determine this as
                        // we don't add the summaries of all referenced symbols when we serialize type summaries.
                        // See serializeSummaries for details.
                        ngModuleSymbols.add(summary.type.reference);
                        var modSummary = summary;
                        try {
                            for (var _h = tslib_1.__values(modSummary.modules), _j = _h.next(); !_j.done; _j = _h.next()) {
                                var mod = _j.value;
                                ngModuleSymbols.add(mod.reference);
                            }
                        }
                        catch (e_3_1) { e_3 = { error: e_3_1 }; }
                        finally {
                            try {
                                if (_j && !_j.done && (_c = _h.return)) _c.call(_h);
                            }
                            finally { if (e_3) throw e_3.error; }
                        }
                    }
                    if (!isLibrary) {
                        var fnName = util_2.summaryForJitName(summary.type.reference.name);
                        createSummaryForJitFunction(this.outputCtx, summary.type.reference, this.serializeSummaryWithDeps(summary, metadata));
                    }
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (_f && !_f.done && (_b = _e.return)) _b.call(_e);
                }
                finally { if (e_2) throw e_2.error; }
            }
            ngModuleSymbols.forEach(function (ngModuleSymbol) {
                if (_this.summaryResolver.isLibraryFile(ngModuleSymbol.filePath)) {
                    var exportAs = exportAsBySymbol.get(ngModuleSymbol) || ngModuleSymbol.name;
                    var jitExportAsName = util_2.summaryForJitName(exportAs);
                    _this.outputCtx.statements.push(o.variable(jitExportAsName)
                        .set(_this.serializeSummaryRef(ngModuleSymbol))
                        .toDeclStmt(null, [o.StmtModifier.Exported]));
                }
            });
        };
        ForJitSerializer.prototype.serializeSummaryWithDeps = function (summary, metadata) {
            var _this = this;
            var expressions = [this.serializeSummary(summary)];
            var providers = [];
            if (metadata instanceof compile_metadata_1.CompileNgModuleMetadata) {
                expressions.push.apply(expressions, tslib_1.__spread(
                // For directives / pipes, we only add the declared ones,
                // and rely on transitively importing NgModules to get the transitive
                // summaries.
                metadata.declaredDirectives.concat(metadata.declaredPipes)
                    .map(function (type) { return type.reference; })
                    // For modules,
                    // we also add the summaries for modules
                    // from libraries.
                    // This is ok as we produce reexports for all transitive modules.
                    .concat(metadata.transitiveModule.modules.map(function (type) { return type.reference; })
                    .filter(function (ref) { return ref !== metadata.type.reference; }))
                    .map(function (ref) { return _this.serializeSummaryRef(ref); })));
                // Note: We don't use `NgModuleSummary.providers`, as that one is transitive,
                // and we already have transitive modules.
                providers = metadata.providers;
            }
            else if (summary.summaryKind === compile_metadata_1.CompileSummaryKind.Directive) {
                var dirSummary = summary;
                providers = dirSummary.providers.concat(dirSummary.viewProviders);
            }
            // Note: We can't just refer to the `ngsummary.ts` files for `useClass` providers (as we do for
            // declaredDirectives / declaredPipes), as we allow
            // providers without ctor arguments to skip the `@Injectable` decorator,
            // i.e. we didn't generate .ngsummary.ts files for these.
            expressions.push.apply(expressions, tslib_1.__spread(providers.filter(function (provider) { return !!provider.useClass; }).map(function (provider) { return _this.serializeSummary({
                summaryKind: compile_metadata_1.CompileSummaryKind.Injectable, type: provider.useClass
            }); })));
            return o.literalArr(expressions);
        };
        ForJitSerializer.prototype.serializeSummaryRef = function (typeSymbol) {
            var jitImportedSymbol = this.symbolResolver.getStaticSymbol(util_2.summaryForJitFileName(typeSymbol.filePath), util_2.summaryForJitName(typeSymbol.name));
            return this.outputCtx.importExpr(jitImportedSymbol);
        };
        ForJitSerializer.prototype.serializeSummary = function (data) {
            var outputCtx = this.outputCtx;
            var Transformer = /** @class */ (function () {
                function Transformer() {
                }
                Transformer.prototype.visitArray = function (arr, context) {
                    var _this = this;
                    return o.literalArr(arr.map(function (entry) { return util_1.visitValue(entry, _this, context); }));
                };
                Transformer.prototype.visitStringMap = function (map, context) {
                    var _this = this;
                    return new o.LiteralMapExpr(Object.keys(map).map(function (key) { return new o.LiteralMapEntry(key, util_1.visitValue(map[key], _this, context), false); }));
                };
                Transformer.prototype.visitPrimitive = function (value, context) { return o.literal(value); };
                Transformer.prototype.visitOther = function (value, context) {
                    if (value instanceof static_symbol_1.StaticSymbol) {
                        return outputCtx.importExpr(value);
                    }
                    else {
                        throw new Error("Illegal State: Encountered value " + value);
                    }
                };
                return Transformer;
            }());
            return util_1.visitValue(data, new Transformer(), null);
        };
        return ForJitSerializer;
    }());
    var FromJsonDeserializer = /** @class */ (function (_super) {
        tslib_1.__extends(FromJsonDeserializer, _super);
        function FromJsonDeserializer(symbolCache, summaryResolver) {
            var _this = _super.call(this) || this;
            _this.symbolCache = symbolCache;
            _this.summaryResolver = summaryResolver;
            return _this;
        }
        FromJsonDeserializer.prototype.deserialize = function (libraryFileName, json) {
            var _this = this;
            var data = JSON.parse(json);
            var allImportAs = [];
            this.symbols = data.symbols.map(function (serializedSymbol) { return _this.symbolCache.get(_this.summaryResolver.fromSummaryFileName(serializedSymbol.filePath, libraryFileName), serializedSymbol.name); });
            data.symbols.forEach(function (serializedSymbol, index) {
                var symbol = _this.symbols[index];
                var importAs = serializedSymbol.importAs;
                if (typeof importAs === 'number') {
                    allImportAs.push({ symbol: symbol, importAs: _this.symbols[importAs] });
                }
                else if (typeof importAs === 'string') {
                    allImportAs.push({ symbol: symbol, importAs: _this.symbolCache.get(util_2.ngfactoryFilePath(libraryFileName), importAs) });
                }
            });
            var summaries = util_1.visitValue(data.summaries, this, null);
            return { moduleName: data.moduleName, summaries: summaries, importAs: allImportAs };
        };
        FromJsonDeserializer.prototype.visitStringMap = function (map, context) {
            if ('__symbol' in map) {
                var baseSymbol = this.symbols[map['__symbol']];
                var members = map['members'];
                return members.length ? this.symbolCache.get(baseSymbol.filePath, baseSymbol.name, members) :
                    baseSymbol;
            }
            else {
                return _super.prototype.visitStringMap.call(this, map, context);
            }
        };
        return FromJsonDeserializer;
    }(util_1.ValueTransformer));
    function isCall(metadata) {
        return metadata && metadata.__symbolic === 'call';
    }
    function isFunctionCall(metadata) {
        return isCall(metadata) && static_symbol_resolver_1.unwrapResolvedMetadata(metadata.expression) instanceof static_symbol_1.StaticSymbol;
    }
    function isMethodCallOnVariable(metadata) {
        return isCall(metadata) && metadata.expression && metadata.expression.__symbolic === 'select' &&
            static_symbol_resolver_1.unwrapResolvedMetadata(metadata.expression.expression) instanceof static_symbol_1.StaticSymbol;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3VtbWFyeV9zZXJpYWxpemVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXIvc3JjL2FvdC9zdW1tYXJ5X3NlcmlhbGl6ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0lBQUE7Ozs7OztPQU1HO0lBQ0gsMkVBQWtQO0lBQ2xQLDJEQUEwQztJQUUxQyxtREFBa0Y7SUFFbEYseUVBQWdFO0lBQ2hFLDJGQUE0RztJQUM1Ryx1REFBb0c7SUFFcEcsU0FBZ0Isa0JBQWtCLENBQzlCLFdBQW1CLEVBQUUsU0FBK0IsRUFDcEQsZUFBOEMsRUFBRSxjQUFvQyxFQUNwRixPQUErQixFQUFFLEtBSTlCLEVBQ0gsNkJBQ1M7UUFEVCw4Q0FBQSxFQUFBLHFDQUNTO1FBQ1gsSUFBTSxnQkFBZ0IsR0FBRyxJQUFJLGdCQUFnQixDQUFDLGNBQWMsRUFBRSxlQUFlLEVBQUUsV0FBVyxDQUFDLENBQUM7UUFFNUYsc0VBQXNFO1FBQ3RFLDBFQUEwRTtRQUMxRSxzQkFBc0I7UUFDdEIsT0FBTyxDQUFDLE9BQU8sQ0FDWCxVQUFDLGNBQWMsSUFBSyxPQUFBLGdCQUFnQixDQUFDLFVBQVUsQ0FDM0MsRUFBQyxNQUFNLEVBQUUsY0FBYyxDQUFDLE1BQU0sRUFBRSxRQUFRLEVBQUUsY0FBYyxDQUFDLFFBQVEsRUFBQyxDQUFDLEVBRG5ELENBQ21ELENBQUMsQ0FBQztRQUU3RSxzQkFBc0I7UUFDdEIsS0FBSyxDQUFDLE9BQU8sQ0FBQyxVQUFDLEVBQW1CO2dCQUFsQixvQkFBTyxFQUFFLHNCQUFRO1lBQy9CLGdCQUFnQixDQUFDLFVBQVUsQ0FDdkIsRUFBQyxNQUFNLEVBQUUsT0FBTyxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsUUFBUSxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFDLENBQUMsQ0FBQztRQUM1RSxDQUFDLENBQUMsQ0FBQztRQUNHLElBQUEsOERBQTRF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O1FBQzNDLE9BQU8sTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLFFBQVEsQ0FBQyxVQUFVLElBQUksUUFBUSxDQUFDLFVBQVUsQ0FBQyxVQUFVLEtBQUssUUFBUTtZQUN6RiwrQ0FBc0IsQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxZQUFZLDRCQUFZLENBQUM7SUFDckYsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCB7Q29tcGlsZURpcmVjdGl2ZU1ldGFkYXRhLCBDb21waWxlRGlyZWN0aXZlU3VtbWFyeSwgQ29tcGlsZU5nTW9kdWxlTWV0YWRhdGEsIENvbXBpbGVOZ01vZHVsZVN1bW1hcnksIENvbXBpbGVQaXBlTWV0YWRhdGEsIENvbXBpbGVQcm92aWRlck1ldGFkYXRhLCBDb21waWxlU3VtbWFyeUtpbmQsIENvbXBpbGVUeXBlTWV0YWRhdGEsIENvbXBpbGVUeXBlU3VtbWFyeX0gZnJvbSAnLi4vY29tcGlsZV9tZXRhZGF0YSc7XG5pbXBvcnQgKiBhcyBvIGZyb20gJy4uL291dHB1dC9vdXRwdXRfYXN0JztcbmltcG9ydCB7U3VtbWFyeSwgU3VtbWFyeVJlc29sdmVyfSBmcm9tICcuLi9zdW1tYXJ5X3Jlc29sdmVyJztcbmltcG9ydCB7T3V0cHV0Q29udGV4dCwgVmFsdWVUcmFuc2Zvcm1lciwgVmFsdWVWaXNpdG9yLCB2aXNpdFZhbHVlfSBmcm9tICcuLi91dGlsJztcblxuaW1wb3J0IHtTdGF0aWNTeW1ib2wsIFN0YXRpY1N5bWJvbENhY2hlfSBmcm9tICcuL3N0YXRpY19zeW1ib2wnO1xuaW1wb3J0IHtSZXNvbHZlZFN0YXRpY1N5bWJvbCwgU3RhdGljU3ltYm9sUmVzb2x2ZXIsIHVud3JhcFJlc29sdmVkTWV0YWRhdGF9IGZyb20gJy4vc3RhdGljX3N5bWJvbF9yZXNvbHZlcic7XG5pbXBvcnQge2lzTG93ZXJlZFN5bWJvbCwgbmdmYWN0b3J5RmlsZVBhdGgsIHN1bW1hcnlGb3JKaXRGaWxlTmFtZSwgc3VtbWFyeUZvckppdE5hbWV9IGZyb20gJy4vdXRpbCc7XG5cbmV4cG9ydCBmdW5jdGlvbiBzZXJpYWxpemVTdW1tYXJpZXMoXG4gICAgc3JjRmlsZU5hbWU6IHN0cmluZywgZm9ySml0Q3R4OiBPdXRwdXRDb250ZXh0IHwgbnVsbCxcbiAgICBzdW1tYXJ5UmVzb2x2ZXI6IFN1bW1hcnlSZXNvbHZlcjxTdGF0aWNTeW1ib2w+LCBzeW1ib2xSZXNvbHZlcjogU3RhdGljU3ltYm9sUmVzb2x2ZXIsXG4gICAgc3ltYm9sczogUmVzb2x2ZWRTdGF0aWNTeW1ib2xbXSwgdHlwZXM6IHtcbiAgICAgIHN1bW1hcnk6IENvbXBpbGVUeXBlU3VtbWFyeSxcbiAgICAgIG1ldGFkYXRhOiBDb21waWxlTmdNb2R1bGVNZXRhZGF0YSB8IENvbXBpbGVEaXJlY3RpdmVNZXRhZGF0YSB8IENvbXBpbGVQaXBlTWV0YWRhdGEgfFxuICAgICAgICAgIENvbXBpbGVUeXBlTWV0YWRhdGFcbiAgICB9W10sXG4gICAgY3JlYXRlRXh0ZXJuYWxTeW1ib2xSZWV4cG9ydHMgPVxuICAgICAgICBmYWxzZSk6IHtqc29uOiBzdHJpbmcsIGV4cG9ydEFzOiB7c3ltYm9sOiBTdGF0aWNTeW1ib2wsIGV4cG9ydEFzOiBzdHJpbmd9W119IHtcbiAgY29uc3QgdG9Kc29uU2VyaWFsaXplciA9IG5ldyBUb0pzb25TZXJpYWxpemVyKHN5bWJvbFJlc29sdmVyLCBzdW1tYXJ5UmVzb2x2ZXIsIHNyY0ZpbGVOYW1lKTtcblxuICAvLyBmb3Igc3ltYm9scywgd2UgdXNlIGV2ZXJ5dGhpbmcgZXhjZXB0IGZvciB0aGUgY2xhc3MgbWV0YWRhdGEgaXRzZWxmXG4gIC8vICh3ZSBrZWVwIHRoZSBzdGF0aWNzIHRob3VnaCksIGFzIHRoZSBjbGFzcyBtZXRhZGF0YSBpcyBjb250YWluZWQgaW4gdGhlXG4gIC8vIENvbXBpbGVUeXBlU3VtbWFyeS5cbiAgc3ltYm9scy5mb3JFYWNoKFxuICAgICAgKHJlc29sdmVkU3ltYm9sKSA9PiB0b0pzb25TZXJpYWxpemVyLmFkZFN1bW1hcnkoXG4gICAgICAgICAge3N5bWJvbDogcmVzb2x2ZWRTeW1ib2wuc3ltYm9sLCBtZXRhZGF0YTogcmVzb2x2ZWRTeW1ib2wubWV0YWRhdGF9KSk7XG5cbiAgLy8gQWRkIHR5cGUgc3VtbWFyaWVzLlxuICB0eXBlcy5mb3JFYWNoKCh7c3VtbWFyeSwgbWV0YWRhdGF9KSA9PiB7XG4gICAgdG9Kc29uU2VyaWFsaXplci5hZGRTdW1tYXJ5KFxuICAgICAgICB7c3ltYm9sOiBzdW1tYXJ5LnR5cGUucmVmZXJlbmNlLCBtZXRhZGF0YTogdW5kZWZpbmVkLCB0eXBlOiBzdW1tYXJ5fSk7XG4gIH0pO1xuICBjb25zdCB7anNvbiwgZXhwb3J0QXN9ID0gdG9Kc29uU2VyaWFsaXplci5zZXJpYWxpemUoY3JlYXRlRXh0ZXJuYWxTeW1ib2xSZWV4cG9ydHMpO1xuICBpZiAoZm9ySml0Q3R4KSB7XG4gICAgY29uc3QgZm9ySml0U2VyaWFsaXplciA9IG5ldyBGb3JKaXRTZXJpYWxpemVyKGZvckppdEN0eCwgc3ltYm9sUmVzb2x2ZXIsIHN1bW1hcnlSZXNvbHZlcik7XG4gICAgdHlwZXMuZm9yRWFjaCgoe3N1bW1hcnksIG1ldGFkYXRhfSkgPT4geyBmb3JKaXRTZXJpYWxpemVyLmFkZFNvdXJjZVR5cGUoc3VtbWFyeSwgbWV0YWRhdGEpOyB9KTtcbiAgICB0b0pzb25TZXJpYWxpemVyLnVucHJvY2Vzc2VkU3ltYm9sU3VtbWFyaWVzQnlTeW1ib2wuZm9yRWFjaCgoc3VtbWFyeSkgPT4ge1xuICAgICAgaWYgKHN1bW1hcnlSZXNvbHZlci5pc0xpYnJhcnlGaWxlKHN1bW1hcnkuc3ltYm9sLmZpbGVQYXRoKSAmJiBzdW1tYXJ5LnR5cGUpIHtcbiAgICAgICAgZm9ySml0U2VyaWFsaXplci5hZGRMaWJUeXBlKHN1bW1hcnkudHlwZSk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgZm9ySml0U2VyaWFsaXplci5zZXJpYWxpemUoZXhwb3J0QXMpO1xuICB9XG4gIHJldHVybiB7anNvbiwgZXhwb3J0QXN9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZGVzZXJpYWxpemVTdW1tYXJpZXMoXG4gICAgc3ltYm9sQ2FjaGU6IFN0YXRpY1N5bWJvbENhY2hlLCBzdW1tYXJ5UmVzb2x2ZXI6IFN1bW1hcnlSZXNvbHZlcjxTdGF0aWNTeW1ib2w+LFxuICAgIGxpYnJhcnlGaWxlTmFtZTogc3RyaW5nLCBqc29uOiBzdHJpbmcpOiB7XG4gIG1vZHVsZU5hbWU6IHN0cmluZyB8IG51bGwsXG4gIHN1bW1hcmllczogU3VtbWFyeTxTdGF0aWNTeW1ib2w+W10sXG4gIGltcG9ydEFzOiB7c3ltYm9sOiBTdGF0aWNTeW1ib2wsIGltcG9ydEFzOiBTdGF0aWNTeW1ib2x9W11cbn0ge1xuICBjb25zdCBkZXNlcmlhbGl6ZXIgPSBuZXcgRnJvbUpzb25EZXNlcmlhbGl6ZXIoc3ltYm9sQ2FjaGUsIHN1bW1hcnlSZXNvbHZlcik7XG4gIHJldHVybiBkZXNlcmlhbGl6ZXIuZGVzZXJpYWxpemUobGlicmFyeUZpbGVOYW1lLCBqc29uKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUZvckppdFN0dWIob3V0cHV0Q3R4OiBPdXRwdXRDb250ZXh0LCByZWZlcmVuY2U6IFN0YXRpY1N5bWJvbCkge1xuICByZXR1cm4gY3JlYXRlU3VtbWFyeUZvckppdEZ1bmN0aW9uKG91dHB1dEN0eCwgcmVmZXJlbmNlLCBvLk5VTExfRVhQUik7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZVN1bW1hcnlGb3JKaXRGdW5jdGlvbihcbiAgICBvdXRwdXRDdHg6IE91dHB1dENvbnRleHQsIHJlZmVyZW5jZTogU3RhdGljU3ltYm9sLCB2YWx1ZTogby5FeHByZXNzaW9uKSB7XG4gIGNvbnN0IGZuTmFtZSA9IHN1bW1hcnlGb3JKaXROYW1lKHJlZmVyZW5jZS5uYW1lKTtcbiAgb3V0cHV0Q3R4LnN0YXRlbWVudHMucHVzaChcbiAgICAgIG8uZm4oW10sIFtuZXcgby5SZXR1cm5TdGF0ZW1lbnQodmFsdWUpXSwgbmV3IG8uQXJyYXlUeXBlKG8uRFlOQU1JQ19UWVBFKSkudG9EZWNsU3RtdChmbk5hbWUsIFtcbiAgICAgICAgby5TdG10TW9kaWZpZXIuRmluYWwsIG8uU3RtdE1vZGlmaWVyLkV4cG9ydGVkXG4gICAgICBdKSk7XG59XG5cbmNvbnN0IGVudW0gU2VyaWFsaXphdGlvbkZsYWdzIHtcbiAgTm9uZSA9IDAsXG4gIFJlc29sdmVWYWx1ZSA9IDEsXG59XG5cbmNsYXNzIFRvSnNvblNlcmlhbGl6ZXIgZXh0ZW5kcyBWYWx1ZVRyYW5zZm9ybWVyIHtcbiAgLy8gTm90ZTogVGhpcyBvbmx5IGNvbnRhaW5zIHN5bWJvbHMgd2l0aG91dCBtZW1iZXJzLlxuICBwcml2YXRlIHN5bWJvbHM6IFN0YXRpY1N5bWJvbFtdID0gW107XG4gIHByaXZhdGUgaW5kZXhCeVN5bWJvbCA9IG5ldyBNYXA8U3RhdGljU3ltYm9sLCBudW1iZXI+KCk7XG4gIHByaXZhdGUgcmVleHBvcnRlZEJ5ID0gbmV3IE1hcDxTdGF0aWNTeW1ib2wsIFN0YXRpY1N5bWJvbD4oKTtcbiAgLy8gVGhpcyBub3cgY29udGFpbnMgYSBgX19zeW1ib2w6IG51bWJlcmAgaW4gdGhlIHBsYWNlIG9mXG4gIC8vIFN0YXRpY1N5bWJvbHMsIGJ1dCBvdGhlcndpc2UgaGFzIHRoZSBzYW1lIHNoYXBlIGFzIHRoZSBvcmlnaW5hbCBvYmplY3RzLlxuICBwcml2YXRlIHByb2Nlc3NlZFN1bW1hcnlCeVN5bWJvbCA9IG5ldyBNYXA8U3RhdGljU3ltYm9sLCBhbnk+KCk7XG4gIHByaXZhdGUgcHJvY2Vzc2VkU3VtbWFyaWVzOiBhbnlbXSA9IFtdO1xuICBwcml2YXRlIG1vZHVsZU5hbWU6IHN0cmluZ3xudWxsO1xuXG4gIHVucHJvY2Vzc2VkU3ltYm9sU3VtbWFyaWVzQnlTeW1ib2wgPSBuZXcgTWFwPFN0YXRpY1N5bWJvbCwgU3VtbWFyeTxTdGF0aWNTeW1ib2w+PigpO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcHJpdmF0ZSBzeW1ib2xSZXNvbHZlcjogU3RhdGljU3ltYm9sUmVzb2x2ZXIsXG4gICAgICBwcml2YXRlIHN1bW1hcnlSZXNvbHZlcjogU3VtbWFyeVJlc29sdmVyPFN0YXRpY1N5bWJvbD4sIHByaXZhdGUgc3JjRmlsZU5hbWU6IHN0cmluZykge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5tb2R1bGVOYW1lID0gc3ltYm9sUmVzb2x2ZXIuZ2V0S25vd25Nb2R1bGVOYW1lKHNyY0ZpbGVOYW1lKTtcbiAgfVxuXG4gIGFkZFN1bW1hcnkoc3VtbWFyeTogU3VtbWFyeTxTdGF0aWNTeW1ib2w+KSB7XG4gICAgbGV0IHVucHJvY2Vzc2VkU3VtbWFyeSA9IHRoaXMudW5wcm9jZXNzZWRTeW1ib2xTdW1tYXJpZXNCeVN5bWJvbC5nZXQoc3VtbWFyeS5zeW1ib2wpO1xuICAgIGxldCBwcm9jZXNzZWRTdW1tYXJ5ID0gdGhpcy5wcm9jZXNzZWRTdW1tYXJ5QnlTeW1ib2wuZ2V0KHN1bW1hcnkuc3ltYm9sKTtcbiAgICBpZiAoIXVucHJvY2Vzc2VkU3VtbWFyeSkge1xuICAgICAgdW5wcm9jZXNzZWRTdW1tYXJ5ID0ge3N5bWJvbDogc3VtbWFyeS5zeW1ib2wsIG1ldGFkYXRhOiB1bmRlZmluZWR9O1xuICAgICAgdGhpcy51bnByb2Nlc3NlZFN5bWJvbFN1bW1hcmllc0J5U3ltYm9sLnNldChzdW1tYXJ5LnN5bWJvbCwgdW5wcm9jZXNzZWRTdW1tYXJ5KTtcbiAgICAgIHByb2Nlc3NlZFN1bW1hcnkgPSB7c3ltYm9sOiB0aGlzLnByb2Nlc3NWYWx1ZShzdW1tYXJ5LnN5bWJvbCwgU2VyaWFsaXphdGlvbkZsYWdzLk5vbmUpfTtcbiAgICAgIHRoaXMucHJvY2Vzc2VkU3VtbWFyaWVzLnB1c2gocHJvY2Vzc2VkU3VtbWFyeSk7XG4gICAgICB0aGlzLnByb2Nlc3NlZFN1bW1hcnlCeVN5bWJvbC5zZXQoc3VtbWFyeS5zeW1ib2wsIHByb2Nlc3NlZFN1bW1hcnkpO1xuICAgIH1cbiAgICBpZiAoIXVucHJvY2Vzc2VkU3VtbWFyeS5tZXRhZGF0YSAmJiBzdW1tYXJ5Lm1ldGFkYXRhKSB7XG4gICAgICBsZXQgbWV0YWRhdGEgPSBzdW1tYXJ5Lm1ldGFkYXRhIHx8IHt9O1xuICAgICAgaWYgKG1ldGFkYXRhLl9fc3ltYm9saWMgPT09ICdjbGFzcycpIHtcbiAgICAgICAgLy8gRm9yIGNsYXNzZXMsIHdlIGtlZXAgZXZlcnl0aGluZyBleGNlcHQgdGhlaXIgY2xhc3MgZGVjb3JhdG9ycy5cbiAgICAgICAgLy8gV2UgbmVlZCB0byBrZWVwIGUuZy4gdGhlIGN0b3IgYXJncywgbWV0aG9kIG5hbWVzLCBtZXRob2QgZGVjb3JhdG9yc1xuICAgICAgICAvLyBzbyB0aGF0IHRoZSBjbGFzcyBjYW4gYmUgZXh0ZW5kZWQgaW4gYW5vdGhlciBjb21waWxhdGlvbiB1bml0LlxuICAgICAgICAvLyBXZSBkb24ndCBrZWVwIHRoZSBjbGFzcyBkZWNvcmF0b3JzIGFzXG4gICAgICAgIC8vIDEpIHRoZXkgcmVmZXIgdG8gZGF0YVxuICAgICAgICAvLyAgIHRoYXQgc2hvdWxkIG5vdCBjYXVzZSBhIHJlYnVpbGQgb2YgZG93bnN0cmVhbSBjb21waWxhdGlvbiB1bml0c1xuICAgICAgICAvLyAgIChlLmcuIGlubGluZSB0ZW1wbGF0ZXMgb2YgQENvbXBvbmVudCwgb3IgQE5nTW9kdWxlLmRlY2xhcmF0aW9ucylcbiAgICAgICAgLy8gMikgdGhlaXIgZGF0YSBpcyBhbHJlYWR5IGNhcHR1cmVkIGluIFR5cGVTdW1tYXJpZXMsIGUuZy4gRGlyZWN0aXZlU3VtbWFyeS5cbiAgICAgICAgY29uc3QgY2xvbmU6IHtba2V5OiBzdHJpbmddOiBhbnl9ID0ge307XG4gICAgICAgIE9iamVjdC5rZXlzKG1ldGFkYXRhKS5mb3JFYWNoKChwcm9wTmFtZSkgPT4ge1xuICAgICAgICAgIGlmIChwcm9wTmFtZSAhPT0gJ2RlY29yYXRvcnMnKSB7XG4gICAgICAgICAgICBjbG9uZVtwcm9wTmFtZV0gPSBtZXRhZGF0YVtwcm9wTmFtZV07XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgbWV0YWRhdGEgPSBjbG9uZTtcbiAgICAgIH0gZWxzZSBpZiAoaXNDYWxsKG1ldGFkYXRhKSkge1xuICAgICAgICBpZiAoIWlzRnVuY3Rpb25DYWxsKG1ldGFkYXRhKSAmJiAhaXNNZXRob2RDYWxsT25WYXJpYWJsZShtZXRhZGF0YSkpIHtcbiAgICAgICAgICAvLyBEb24ndCBzdG9yZSBjb21wbGV4IGNhbGxzIGFzIHdlIHdvbid0IGJlIGFibGUgdG8gc2ltcGxpZnkgdGhlbSBhbnl3YXlzIGxhdGVyIG9uLlxuICAgICAgICAgIG1ldGFkYXRhID0ge1xuICAgICAgICAgICAgX19zeW1ib2xpYzogJ2Vycm9yJyxcbiAgICAgICAgICAgIG1lc3NhZ2U6ICdDb21wbGV4IGZ1bmN0aW9uIGNhbGxzIGFyZSBub3Qgc3VwcG9ydGVkLicsXG4gICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgLy8gTm90ZTogV2UgbmVlZCB0byBrZWVwIHN0b3JpbmcgY3RvciBjYWxscyBmb3IgZS5nLlxuICAgICAgLy8gYGV4cG9ydCBjb25zdCB4ID0gbmV3IEluamVjdGlvblRva2VuKC4uLilgXG4gICAgICB1bnByb2Nlc3NlZFN1bW1hcnkubWV0YWRhdGEgPSBtZXRhZGF0YTtcbiAgICAgIHByb2Nlc3NlZFN1bW1hcnkubWV0YWRhdGEgPSB0aGlzLnByb2Nlc3NWYWx1ZShtZXRhZGF0YSwgU2VyaWFsaXphdGlvbkZsYWdzLlJlc29sdmVWYWx1ZSk7XG4gICAgICBpZiAobWV0YWRhdGEgaW5zdGFuY2VvZiBTdGF0aWNTeW1ib2wgJiZcbiAgICAgICAgICB0aGlzLnN1bW1hcnlSZXNvbHZlci5pc0xpYnJhcnlGaWxlKG1ldGFkYXRhLmZpbGVQYXRoKSkge1xuICAgICAgICBjb25zdCBkZWNsYXJhdGlvblN5bWJvbCA9IHRoaXMuc3ltYm9sc1t0aGlzLmluZGV4QnlTeW1ib2wuZ2V0KG1ldGFkYXRhKSAhXTtcbiAgICAgICAgaWYgKCFpc0xvd2VyZWRTeW1ib2woZGVjbGFyYXRpb25TeW1ib2wubmFtZSkpIHtcbiAgICAgICAgICAvLyBOb3RlOiBzeW1ib2xzIHRoYXQgd2VyZSBpbnRyb2R1Y2VkIGR1cmluZyBjb2RlZ2VuIGluIHRoZSB1c2VyIGZpbGUgY2FuIGhhdmUgYSByZWV4cG9ydFxuICAgICAgICAgIC8vIGlmIGEgdXNlciB1c2VkIGBleHBvcnQgKmAuIEhvd2V2ZXIsIHdlIGNhbid0IHJlbHkgb24gdGhpcyBhcyB0c2lja2xlIHdpbGwgY2hhbmdlXG4gICAgICAgICAgLy8gYGV4cG9ydCAqYCBpbnRvIG5hbWVkIGV4cG9ydHMsIHVzaW5nIG9ubHkgdGhlIGluZm9ybWF0aW9uIGZyb20gdGhlIHR5cGVjaGVja2VyLlxuICAgICAgICAgIC8vIEFzIHdlIGludHJvZHVjZSB0aGUgbmV3IHN5bWJvbHMgYWZ0ZXIgdHlwZWNoZWNrLCBUc2lja2xlIGRvZXMgbm90IGtub3cgYWJvdXQgdGhlbSxcbiAgICAgICAgICAvLyBhbmQgb21pdHMgdGhlbSB3aGVuIGV4cGFuZGluZyBgZXhwb3J0ICpgLlxuICAgICAgICAgIC8vIFNvIHdlIGhhdmUgdG8ga2VlcCByZWV4cG9ydGluZyB0aGVzZSBzeW1ib2xzIG1hbnVhbGx5IHZpYSAubmdmYWN0b3J5IGZpbGVzLlxuICAgICAgICAgIHRoaXMucmVleHBvcnRlZEJ5LnNldChkZWNsYXJhdGlvblN5bWJvbCwgc3VtbWFyeS5zeW1ib2wpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIGlmICghdW5wcm9jZXNzZWRTdW1tYXJ5LnR5cGUgJiYgc3VtbWFyeS50eXBlKSB7XG4gICAgICB1bnByb2Nlc3NlZFN1bW1hcnkudHlwZSA9IHN1bW1hcnkudHlwZTtcbiAgICAgIC8vIE5vdGU6IFdlIGRvbid0IGFkZCB0aGUgc3VtbWFyaWVzIG9mIGFsbCByZWZlcmVuY2VkIHN5bWJvbHMgYXMgZm9yIHRoZSBSZXNvbHZlZFN5bWJvbHMsXG4gICAgICAvLyBhcyB0aGUgdHlwZSBzdW1tYXJpZXMgYWxyZWFkeSBjb250YWluIHRoZSB0cmFuc2l0aXZlIGRhdGEgdGhhdCB0aGV5IHJlcXVpcmVcbiAgICAgIC8vIChpbiBhIG1pbmltYWwgd2F5KS5cbiAgICAgIHByb2Nlc3NlZFN1bW1hcnkudHlwZSA9IHRoaXMucHJvY2Vzc1ZhbHVlKHN1bW1hcnkudHlwZSwgU2VyaWFsaXphdGlvbkZsYWdzLk5vbmUpO1xuICAgICAgLy8gZXhjZXB0IGZvciByZWV4cG9ydGVkIGRpcmVjdGl2ZXMgLyBwaXBlcywgc28gd2UgbmVlZCB0byBzdG9yZVxuICAgICAgLy8gdGhlaXIgc3VtbWFyaWVzIGV4cGxpY2l0bHkuXG4gICAgICBpZiAoc3VtbWFyeS50eXBlLnN1bW1hcnlLaW5kID09PSBDb21waWxlU3VtbWFyeUtpbmQuTmdNb2R1bGUpIHtcbiAgICAgICAgY29uc3QgbmdNb2R1bGVTdW1tYXJ5ID0gPENvbXBpbGVOZ01vZHVsZVN1bW1hcnk+c3VtbWFyeS50eXBlO1xuICAgICAgICBuZ01vZHVsZVN1bW1hcnkuZXhwb3J0ZWREaXJlY3RpdmVzLmNvbmNhdChuZ01vZHVsZVN1bW1hcnkuZXhwb3J0ZWRQaXBlcykuZm9yRWFjaCgoaWQpID0+IHtcbiAgICAgICAgICBjb25zdCBzeW1ib2w6IFN0YXRpY1N5bWJvbCA9IGlkLnJlZmVyZW5jZTtcbiAgICAgICAgICBpZiAodGhpcy5zdW1tYXJ5UmVzb2x2ZXIuaXNMaWJyYXJ5RmlsZShzeW1ib2wuZmlsZVBhdGgpICYmXG4gICAgICAgICAgICAgICF0aGlzLnVucHJvY2Vzc2VkU3ltYm9sU3VtbWFyaWVzQnlTeW1ib2wuaGFzKHN5bWJvbCkpIHtcbiAgICAgICAgICAgIGNvbnN0IHN1bW1hcnkgPSB0aGlzLnN1bW1hcnlSZXNvbHZlci5yZXNvbHZlU3VtbWFyeShzeW1ib2wpO1xuICAgICAgICAgICAgaWYgKHN1bW1hcnkpIHtcbiAgICAgICAgICAgICAgdGhpcy5hZGRTdW1tYXJ5KHN1bW1hcnkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSBjcmVhdGVFeHRlcm5hbFN5bWJvbFJlZXhwb3J0cyBXaGV0aGVyIGV4dGVybmFsIHN0YXRpYyBzeW1ib2xzIHNob3VsZCBiZSByZS1leHBvcnRlZC5cbiAgICogVGhpcyBjYW4gYmUgZW5hYmxlZCBpZiBleHRlcm5hbCBzeW1ib2xzIHNob3VsZCBiZSByZS1leHBvcnRlZCBieSB0aGUgY3VycmVudCBtb2R1bGUgaW5cbiAgICogb3JkZXIgdG8gYXZvaWQgZHluYW1pY2FsbHkgZ2VuZXJhdGVkIG1vZHVsZSBkZXBlbmRlbmNpZXMgd2hpY2ggY2FuIGJyZWFrIHN0cmljdCBkZXBlbmRlbmN5XG4gICAqIGVuZm9yY2VtZW50cyAoYXMgaW4gR29vZ2xlMykuIFJlYWQgbW9yZSBoZXJlOiBodHRwczovL2dpdGh1Yi5jb20vYW5ndWxhci9hbmd1bGFyL2lzc3Vlcy8yNTY0NFxuICAgKi9cbiAgc2VyaWFsaXplKGNyZWF0ZUV4dGVybmFsU3ltYm9sUmVleHBvcnRzOiBib29sZWFuKTpcbiAgICAgIHtqc29uOiBzdHJpbmcsIGV4cG9ydEFzOiB7c3ltYm9sOiBTdGF0aWNTeW1ib2wsIGV4cG9ydEFzOiBzdHJpbmd9W119IHtcbiAgICBjb25zdCBleHBvcnRBczoge3N5bWJvbDogU3RhdGljU3ltYm9sLCBleHBvcnRBczogc3RyaW5nfVtdID0gW107XG4gICAgY29uc3QganNvbiA9IEpTT04uc3RyaW5naWZ5KHtcbiAgICAgIG1vZHVsZU5hbWU6IHRoaXMubW9kdWxlTmFtZSxcbiAgICAgIHN1bW1hcmllczogdGhpcy5wcm9jZXNzZWRTdW1tYXJpZXMsXG4gICAgICBzeW1ib2xzOiB0aGlzLnN5bWJvbHMubWFwKChzeW1ib2wsIGluZGV4KSA9PiB7XG4gICAgICAgIHN5bWJvbC5hc3NlcnROb01lbWJlcnMoKTtcbiAgICAgICAgbGV0IGltcG9ydEFzOiBzdHJpbmd8bnVtYmVyID0gdW5kZWZpbmVkICE7XG4gICAgICAgIGlmICh0aGlzLnN1bW1hcnlSZXNvbHZlci5pc0xpYnJhcnlGaWxlKHN5bWJvbC5maWxlUGF0aCkpIHtcbiAgICAgICAgICBjb25zdCByZWV4cG9ydFN5bWJvbCA9IHRoaXMucmVleHBvcnRlZEJ5LmdldChzeW1ib2wpO1xuICAgICAgICAgIGlmIChyZWV4cG9ydFN5bWJvbCkge1xuICAgICAgICAgICAgLy8gSW4gY2FzZSB0aGUgZ2l2ZW4gZXh0ZXJuYWwgc3RhdGljIHN5bWJvbCBpcyBhbHJlYWR5IG1hbnVhbGx5IGV4cG9ydGVkIGJ5IHRoZVxuICAgICAgICAgICAgLy8gdXNlciwgd2UganVzdCBwcm94eSB0aGUgZXh0ZXJuYWwgc3RhdGljIHN5bWJvbCByZWZlcmVuY2UgdG8gdGhlIG1hbnVhbCBleHBvcnQuXG4gICAgICAgICAgICAvLyBUaGlzIGVuc3VyZXMgdGhhdCB0aGUgQU9UIGNvbXBpbGVyIGltcG9ydHMgdGhlIGV4dGVybmFsIHN5bWJvbCB0aHJvdWdoIHRoZVxuICAgICAgICAgICAgLy8gdXNlciBleHBvcnQgYW5kIGRvZXMgbm90IGludHJvZHVjZSBhbm90aGVyIGRlcGVuZGVuY3kgd2hpY2ggaXMgbm90IG5lZWRlZC5cbiAgICAgICAgICAgIGltcG9ydEFzID0gdGhpcy5pbmRleEJ5U3ltYm9sLmdldChyZWV4cG9ydFN5bWJvbCkgITtcbiAgICAgICAgICB9IGVsc2UgaWYgKGNyZWF0ZUV4dGVybmFsU3ltYm9sUmVleHBvcnRzKSB7XG4gICAgICAgICAgICAvLyBJbiB0aGlzIGNhc2UsIHRoZSBnaXZlbiBleHRlcm5hbCBzdGF0aWMgc3ltYm9sIGlzICpub3QqIG1hbnVhbGx5IGV4cG9ydGVkIGJ5XG4gICAgICAgICAgICAvLyB0aGUgdXNlciwgYW5kIHdlIG1hbnVhbGx5IGNyZWF0ZSBhIHJlLWV4cG9ydCBpbiB0aGUgZmFjdG9yeSBmaWxlIHNvIHRoYXQgd2VcbiAgICAgICAgICAgIC8vIGRvbid0IGludHJvZHVjZSBhbm90aGVyIG1vZHVsZSBkZXBlbmRlbmN5LiBUaGlzIGlzIHVzZWZ1bCB3aGVuIHJ1bm5pbmcgd2l0aGluXG4gICAgICAgICAgICAvLyBCYXplbCBzbyB0aGF0IHRoZSBBT1QgY29tcGlsZXIgZG9lcyBub3QgaW50cm9kdWNlIGFueSBtb2R1bGUgZGVwZW5kZW5jaWVzXG4gICAgICAgICAgICAvLyB3aGljaCBjYW4gYnJlYWsgdGhlIHN0cmljdCBkZXBlbmRlbmN5IGVuZm9yY2VtZW50LiAoZS5nLiBhcyBpbiBHb29nbGUzKVxuICAgICAgICAgICAgLy8gUmVhZCBtb3JlIGFib3V0IHRoaXMgaGVyZTogaHR0cHM6Ly9naXRodWIuY29tL2FuZ3VsYXIvYW5ndWxhci9pc3N1ZXMvMjU2NDRcbiAgICAgICAgICAgIGNvbnN0IHN1bW1hcnkgPSB0aGlzLnVucHJvY2Vzc2VkU3ltYm9sU3VtbWFyaWVzQnlTeW1ib2wuZ2V0KHN5bWJvbCk7XG4gICAgICAgICAgICBpZiAoIXN1bW1hcnkgfHwgIXN1bW1hcnkubWV0YWRhdGEgfHwgc3VtbWFyeS5tZXRhZGF0YS5fX3N5bWJvbGljICE9PSAnaW50ZXJmYWNlJykge1xuICAgICAgICAgICAgICBpbXBvcnRBcyA9IGAke3N5bWJvbC5uYW1lfV8ke2luZGV4fWA7XG4gICAgICAgICAgICAgIGV4cG9ydEFzLnB1c2goe3N5bWJvbCwgZXhwb3J0QXM6IGltcG9ydEFzfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgX19zeW1ib2w6IGluZGV4LFxuICAgICAgICAgIG5hbWU6IHN5bWJvbC5uYW1lLFxuICAgICAgICAgIGZpbGVQYXRoOiB0aGlzLnN1bW1hcnlSZXNvbHZlci50b1N1bW1hcnlGaWxlTmFtZShzeW1ib2wuZmlsZVBhdGgsIHRoaXMuc3JjRmlsZU5hbWUpLFxuICAgICAgICAgIGltcG9ydEFzOiBpbXBvcnRBc1xuICAgICAgICB9O1xuICAgICAgfSlcbiAgICB9KTtcbiAgICByZXR1cm4ge2pzb24sIGV4cG9ydEFzfTtcbiAgfVxuXG4gIHByaXZhdGUgcHJvY2Vzc1ZhbHVlKHZhbHVlOiBhbnksIGZsYWdzOiBTZXJpYWxpemF0aW9uRmxhZ3MpOiBhbnkge1xuICAgIHJldHVybiB2aXNpdFZhbHVlKHZhbHVlLCB0aGlzLCBmbGFncyk7XG4gIH1cblxuICB2aXNpdE90aGVyKHZhbHVlOiBhbnksIGNvbnRleHQ6IGFueSk6IGFueSB7XG4gICAgaWYgKHZhbHVlIGluc3RhbmNlb2YgU3RhdGljU3ltYm9sKSB7XG4gICAgICBsZXQgYmFzZVN5bWJvbCA9IHRoaXMuc3ltYm9sUmVzb2x2ZXIuZ2V0U3RhdGljU3ltYm9sKHZhbHVlLmZpbGVQYXRoLCB2YWx1ZS5uYW1lKTtcbiAgICAgIGNvbnN0IGluZGV4ID0gdGhpcy52aXNpdFN0YXRpY1N5bWJvbChiYXNlU3ltYm9sLCBjb250ZXh0KTtcbiAgICAgIHJldHVybiB7X19zeW1ib2w6IGluZGV4LCBtZW1iZXJzOiB2YWx1ZS5tZW1iZXJzfTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogU3RyaXAgbGluZSBhbmQgY2hhcmFjdGVyIG51bWJlcnMgZnJvbSBuZ3N1bW1hcmllcy5cbiAgICogRW1pdHRpbmcgdGhlbSBjYXVzZXMgd2hpdGUgc3BhY2VzIGNoYW5nZXMgdG8gcmV0cmlnZ2VyIHVwc3RyZWFtXG4gICAqIHJlY29tcGlsYXRpb25zIGluIGJhemVsLlxuICAgKiBUT0RPOiBmaW5kIG91dCBhIHdheSB0byBoYXZlIGxpbmUgYW5kIGNoYXJhY3RlciBudW1iZXJzIGluIGVycm9ycyB3aXRob3V0XG4gICAqIGV4Y2Vzc2l2ZSByZWNvbXBpbGF0aW9uIGluIGJhemVsLlxuICAgKi9cbiAgdmlzaXRTdHJpbmdNYXAobWFwOiB7W2tleTogc3RyaW5nXTogYW55fSwgY29udGV4dDogYW55KTogYW55IHtcbiAgICBpZiAobWFwWydfX3N5bWJvbGljJ10gPT09ICdyZXNvbHZlZCcpIHtcbiAgICAgIHJldHVybiB2aXNpdFZhbHVlKG1hcC5zeW1ib2wsIHRoaXMsIGNvbnRleHQpO1xuICAgIH1cbiAgICBpZiAobWFwWydfX3N5bWJvbGljJ10gPT09ICdlcnJvcicpIHtcbiAgICAgIGRlbGV0ZSBtYXBbJ2xpbmUnXTtcbiAgICAgIGRlbGV0ZSBtYXBbJ2NoYXJhY3RlciddO1xuICAgIH1cbiAgICByZXR1cm4gc3VwZXIudmlzaXRTdHJpbmdNYXAobWFwLCBjb250ZXh0KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIG51bGwgaWYgdGhlIG9wdGlvbnMucmVzb2x2ZVZhbHVlIGlzIHRydWUsIGFuZCB0aGUgc3VtbWFyeSBmb3IgdGhlIHN5bWJvbFxuICAgKiByZXNvbHZlZCB0byBhIHR5cGUgb3IgY291bGQgbm90IGJlIHJlc29sdmVkLlxuICAgKi9cbiAgcHJpdmF0ZSB2aXNpdFN0YXRpY1N5bWJvbChiYXNlU3ltYm9sOiBTdGF0aWNTeW1ib2wsIGZsYWdzOiBTZXJpYWxpemF0aW9uRmxhZ3MpOiBudW1iZXIge1xuICAgIGxldCBpbmRleDogbnVtYmVyfHVuZGVmaW5lZHxudWxsID0gdGhpcy5pbmRleEJ5U3ltYm9sLmdldChiYXNlU3ltYm9sKTtcbiAgICBsZXQgc3VtbWFyeTogU3VtbWFyeTxTdGF0aWNTeW1ib2w+fG51bGwgPSBudWxsO1xuICAgIGlmIChmbGFncyAmIFNlcmlhbGl6YXRpb25GbGFncy5SZXNvbHZlVmFsdWUgJiZcbiAgICAgICAgdGhpcy5zdW1tYXJ5UmVzb2x2ZXIuaXNMaWJyYXJ5RmlsZShiYXNlU3ltYm9sLmZpbGVQYXRoKSkge1xuICAgICAgaWYgKHRoaXMudW5wcm9jZXNzZWRTeW1ib2xTdW1tYXJpZXNCeVN5bWJvbC5oYXMoYmFzZVN5bWJvbCkpIHtcbiAgICAgICAgLy8gdGhlIHN1bW1hcnkgZm9yIHRoaXMgc3ltYm9sIHdhcyBhbHJlYWR5IGFkZGVkXG4gICAgICAgIC8vIC0+IG5vdGhpbmcgdG8gZG8uXG4gICAgICAgIHJldHVybiBpbmRleCAhO1xuICAgICAgfVxuICAgICAgc3VtbWFyeSA9IHRoaXMubG9hZFN1bW1hcnkoYmFzZVN5bWJvbCk7XG4gICAgICBpZiAoc3VtbWFyeSAmJiBzdW1tYXJ5Lm1ldGFkYXRhIGluc3RhbmNlb2YgU3RhdGljU3ltYm9sKSB7XG4gICAgICAgIC8vIFRoZSBzdW1tYXJ5IGlzIGEgcmVleHBvcnRcbiAgICAgICAgaW5kZXggPSB0aGlzLnZpc2l0U3RhdGljU3ltYm9sKHN1bW1hcnkubWV0YWRhdGEsIGZsYWdzKTtcbiAgICAgICAgLy8gcmVzZXQgdGhlIHN1bW1hcnkgYXMgaXQgaXMganVzdCBhIHJlZXhwb3J0LCBzbyB3ZSBkb24ndCB3YW50IHRvIHN0b3JlIGl0LlxuICAgICAgICBzdW1tYXJ5ID0gbnVsbDtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKGluZGV4ICE9IG51bGwpIHtcbiAgICAgIC8vIE5vdGU6ID09IG9uIHB1cnBvc2UgdG8gY29tcGFyZSB3aXRoIHVuZGVmaW5lZCFcbiAgICAgIC8vIE5vIHN1bW1hcnkgYW5kIHRoZSBzeW1ib2wgaXMgYWxyZWFkeSBhZGRlZCAtPiBub3RoaW5nIHRvIGRvLlxuICAgICAgcmV0dXJuIGluZGV4O1xuICAgIH1cbiAgICAvLyBOb3RlOiA9PSBvbiBwdXJwb3NlIHRvIGNvbXBhcmUgd2l0aCB1bmRlZmluZWQhXG4gICAgaWYgKGluZGV4ID09IG51bGwpIHtcbiAgICAgIGluZGV4ID0gdGhpcy5zeW1ib2xzLmxlbmd0aDtcbiAgICAgIHRoaXMuc3ltYm9scy5wdXNoKGJhc2VTeW1ib2wpO1xuICAgIH1cbiAgICB0aGlzLmluZGV4QnlTeW1ib2wuc2V0KGJhc2VTeW1ib2wsIGluZGV4KTtcbiAgICBpZiAoc3VtbWFyeSkge1xuICAgICAgdGhpcy5hZGRTdW1tYXJ5KHN1bW1hcnkpO1xuICAgIH1cbiAgICByZXR1cm4gaW5kZXg7XG4gIH1cblxuICBwcml2YXRlIGxvYWRTdW1tYXJ5KHN5bWJvbDogU3RhdGljU3ltYm9sKTogU3VtbWFyeTxTdGF0aWNTeW1ib2w+fG51bGwge1xuICAgIGxldCBzdW1tYXJ5ID0gdGhpcy5zdW1tYXJ5UmVzb2x2ZXIucmVzb2x2ZVN1bW1hcnkoc3ltYm9sKTtcbiAgICBpZiAoIXN1bW1hcnkpIHtcbiAgICAgIC8vIHNvbWUgc3ltYm9scyBtaWdodCBvcmlnaW5hdGUgZnJvbSBhIHBsYWluIHR5cGVzY3JpcHQgbGlicmFyeVxuICAgICAgLy8gdGhhdCBqdXN0IGV4cG9ydGVkIC5kLnRzIGFuZCAubWV0YWRhdGEuanNvbiBmaWxlcywgaS5lLiB3aGVyZSBubyBzdW1tYXJ5XG4gICAgICAvLyBmaWxlcyB3ZXJlIGNyZWF0ZWQuXG4gICAgICBjb25zdCByZXNvbHZlZFN5bWJvbCA9IHRoaXMuc3ltYm9sUmVzb2x2ZXIucmVzb2x2ZVN5bWJvbChzeW1ib2wpO1xuICAgICAgaWYgKHJlc29sdmVkU3ltYm9sKSB7XG4gICAgICAgIHN1bW1hcnkgPSB7c3ltYm9sOiByZXNvbHZlZFN5bWJvbC5zeW1ib2wsIG1ldGFkYXRhOiByZXNvbHZlZFN5bWJvbC5tZXRhZGF0YX07XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBzdW1tYXJ5O1xuICB9XG59XG5cbmNsYXNzIEZvckppdFNlcmlhbGl6ZXIge1xuICBwcml2YXRlIGRhdGE6IEFycmF5PHtcbiAgICBzdW1tYXJ5OiBDb21waWxlVHlwZVN1bW1hcnksXG4gICAgbWV0YWRhdGE6IENvbXBpbGVOZ01vZHVsZU1ldGFkYXRhfENvbXBpbGVEaXJlY3RpdmVNZXRhZGF0YXxDb21waWxlUGlwZU1ldGFkYXRhfFxuICAgIENvbXBpbGVUeXBlTWV0YWRhdGF8bnVsbCxcbiAgICBpc0xpYnJhcnk6IGJvb2xlYW5cbiAgfT4gPSBbXTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICAgIHByaXZhdGUgb3V0cHV0Q3R4OiBPdXRwdXRDb250ZXh0LCBwcml2YXRlIHN5bWJvbFJlc29sdmVyOiBTdGF0aWNTeW1ib2xSZXNvbHZlcixcbiAgICAgIHByaXZhdGUgc3VtbWFyeVJlc29sdmVyOiBTdW1tYXJ5UmVzb2x2ZXI8U3RhdGljU3ltYm9sPikge31cblxuICBhZGRTb3VyY2VUeXBlKFxuICAgICAgc3VtbWFyeTogQ29tcGlsZVR5cGVTdW1tYXJ5LCBtZXRhZGF0YTogQ29tcGlsZU5nTW9kdWxlTWV0YWRhdGF8Q29tcGlsZURpcmVjdGl2ZU1ldGFkYXRhfFxuICAgICAgQ29tcGlsZVBpcGVNZXRhZGF0YXxDb21waWxlVHlwZU1ldGFkYXRhKSB7XG4gICAgdGhpcy5kYXRhLnB1c2goe3N1bW1hcnksIG1ldGFkYXRhLCBpc0xpYnJhcnk6IGZhbHNlfSk7XG4gIH1cblxuICBhZGRMaWJUeXBlKHN1bW1hcnk6IENvbXBpbGVUeXBlU3VtbWFyeSkge1xuICAgIHRoaXMuZGF0YS5wdXNoKHtzdW1tYXJ5LCBtZXRhZGF0YTogbnVsbCwgaXNMaWJyYXJ5OiB0cnVlfSk7XG4gIH1cblxuICBzZXJpYWxpemUoZXhwb3J0QXNBcnI6IHtzeW1ib2w6IFN0YXRpY1N5bWJvbCwgZXhwb3J0QXM6IHN0cmluZ31bXSk6IHZvaWQge1xuICAgIGNvbnN0IGV4cG9ydEFzQnlTeW1ib2wgPSBuZXcgTWFwPFN0YXRpY1N5bWJvbCwgc3RyaW5nPigpO1xuICAgIGZvciAoY29uc3Qge3N5bWJvbCwgZXhwb3J0QXN9IG9mIGV4cG9ydEFzQXJyKSB7XG4gICAgICBleHBvcnRBc0J5U3ltYm9sLnNldChzeW1ib2wsIGV4cG9ydEFzKTtcbiAgICB9XG4gICAgY29uc3QgbmdNb2R1bGVTeW1ib2xzID0gbmV3IFNldDxTdGF0aWNTeW1ib2w+KCk7XG5cbiAgICBmb3IgKGNvbnN0IHtzdW1tYXJ5LCBtZXRhZGF0YSwgaXNMaWJyYXJ5fSBvZiB0aGlzLmRhdGEpIHtcbiAgICAgIGlmIChzdW1tYXJ5LnN1bW1hcnlLaW5kID09PSBDb21waWxlU3VtbWFyeUtpbmQuTmdNb2R1bGUpIHtcbiAgICAgICAgLy8gY29sbGVjdCB0aGUgc3ltYm9scyB0aGF0IHJlZmVyIHRvIE5nTW9kdWxlIGNsYXNzZXMuXG4gICAgICAgIC8vIE5vdGU6IHdlIGNhbid0IGp1c3QgcmVseSBvbiBgc3VtbWFyeS50eXBlLnN1bW1hcnlLaW5kYCB0byBkZXRlcm1pbmUgdGhpcyBhc1xuICAgICAgICAvLyB3ZSBkb24ndCBhZGQgdGhlIHN1bW1hcmllcyBvZiBhbGwgcmVmZXJlbmNlZCBzeW1ib2xzIHdoZW4gd2Ugc2VyaWFsaXplIHR5cGUgc3VtbWFyaWVzLlxuICAgICAgICAvLyBTZWUgc2VyaWFsaXplU3VtbWFyaWVzIGZvciBkZXRhaWxzLlxuICAgICAgICBuZ01vZHVsZVN5bWJvbHMuYWRkKHN1bW1hcnkudHlwZS5yZWZlcmVuY2UpO1xuICAgICAgICBjb25zdCBtb2RTdW1tYXJ5ID0gPENvbXBpbGVOZ01vZHVsZVN1bW1hcnk+c3VtbWFyeTtcbiAgICAgICAgZm9yIChjb25zdCBtb2Qgb2YgbW9kU3VtbWFyeS5tb2R1bGVzKSB7XG4gICAgICAgICAgbmdNb2R1bGVTeW1ib2xzLmFkZChtb2QucmVmZXJlbmNlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKCFpc0xpYnJhcnkpIHtcbiAgICAgICAgY29uc3QgZm5OYW1lID0gc3VtbWFyeUZvckppdE5hbWUoc3VtbWFyeS50eXBlLnJlZmVyZW5jZS5uYW1lKTtcbiAgICAgICAgY3JlYXRlU3VtbWFyeUZvckppdEZ1bmN0aW9uKFxuICAgICAgICAgICAgdGhpcy5vdXRwdXRDdHgsIHN1bW1hcnkudHlwZS5yZWZlcmVuY2UsXG4gICAgICAgICAgICB0aGlzLnNlcmlhbGl6ZVN1bW1hcnlXaXRoRGVwcyhzdW1tYXJ5LCBtZXRhZGF0YSAhKSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgbmdNb2R1bGVTeW1ib2xzLmZvckVhY2goKG5nTW9kdWxlU3ltYm9sKSA9PiB7XG4gICAgICBpZiAodGhpcy5zdW1tYXJ5UmVzb2x2ZXIuaXNMaWJyYXJ5RmlsZShuZ01vZHVsZVN5bWJvbC5maWxlUGF0aCkpIHtcbiAgICAgICAgbGV0IGV4cG9ydEFzID0gZXhwb3J0QXNCeVN5bWJvbC5nZXQobmdNb2R1bGVTeW1ib2wpIHx8IG5nTW9kdWxlU3ltYm9sLm5hbWU7XG4gICAgICAgIGNvbnN0IGppdEV4cG9ydEFzTmFtZSA9IHN1bW1hcnlGb3JKaXROYW1lKGV4cG9ydEFzKTtcbiAgICAgICAgdGhpcy5vdXRwdXRDdHguc3RhdGVtZW50cy5wdXNoKG8udmFyaWFibGUoaml0RXhwb3J0QXNOYW1lKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5zZXQodGhpcy5zZXJpYWxpemVTdW1tYXJ5UmVmKG5nTW9kdWxlU3ltYm9sKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAudG9EZWNsU3RtdChudWxsLCBbby5TdG10TW9kaWZpZXIuRXhwb3J0ZWRdKSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBwcml2YXRlIHNlcmlhbGl6ZVN1bW1hcnlXaXRoRGVwcyhcbiAgICAgIHN1bW1hcnk6IENvbXBpbGVUeXBlU3VtbWFyeSwgbWV0YWRhdGE6IENvbXBpbGVOZ01vZHVsZU1ldGFkYXRhfENvbXBpbGVEaXJlY3RpdmVNZXRhZGF0YXxcbiAgICAgIENvbXBpbGVQaXBlTWV0YWRhdGF8Q29tcGlsZVR5cGVNZXRhZGF0YSk6IG8uRXhwcmVzc2lvbiB7XG4gICAgY29uc3QgZXhwcmVzc2lvbnM6IG8uRXhwcmVzc2lvbltdID0gW3RoaXMuc2VyaWFsaXplU3VtbWFyeShzdW1tYXJ5KV07XG4gICAgbGV0IHByb3ZpZGVyczogQ29tcGlsZVByb3ZpZGVyTWV0YWRhdGFbXSA9IFtdO1xuICAgIGlmIChtZXRhZGF0YSBpbnN0YW5jZW9mIENvbXBpbGVOZ01vZHVsZU1ldGFkYXRhKSB7XG4gICAgICBleHByZXNzaW9ucy5wdXNoKC4uLlxuICAgICAgICAgICAgICAgICAgICAgICAvLyBGb3IgZGlyZWN0aXZlcyAvIHBpcGVzLCB3ZSBvbmx5IGFkZCB0aGUgZGVjbGFyZWQgb25lcyxcbiAgICAgICAgICAgICAgICAgICAgICAgLy8gYW5kIHJlbHkgb24gdHJhbnNpdGl2ZWx5IGltcG9ydGluZyBOZ01vZHVsZXMgdG8gZ2V0IHRoZSB0cmFuc2l0aXZlXG4gICAgICAgICAgICAgICAgICAgICAgIC8vIHN1bW1hcmllcy5cbiAgICAgICAgICAgICAgICAgICAgICAgbWV0YWRhdGEuZGVjbGFyZWREaXJlY3RpdmVzLmNvbmNhdChtZXRhZGF0YS5kZWNsYXJlZFBpcGVzKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgLm1hcCh0eXBlID0+IHR5cGUucmVmZXJlbmNlKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gRm9yIG1vZHVsZXMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAvLyB3ZSBhbHNvIGFkZCB0aGUgc3VtbWFyaWVzIGZvciBtb2R1bGVzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBmcm9tIGxpYnJhcmllcy5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRoaXMgaXMgb2sgYXMgd2UgcHJvZHVjZSByZWV4cG9ydHMgZm9yIGFsbCB0cmFuc2l0aXZlIG1vZHVsZXMuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAuY29uY2F0KG1ldGFkYXRhLnRyYW5zaXRpdmVNb2R1bGUubW9kdWxlcy5tYXAodHlwZSA9PiB0eXBlLnJlZmVyZW5jZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5maWx0ZXIocmVmID0+IHJlZiAhPT0gbWV0YWRhdGEudHlwZS5yZWZlcmVuY2UpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgLm1hcCgocmVmKSA9PiB0aGlzLnNlcmlhbGl6ZVN1bW1hcnlSZWYocmVmKSkpO1xuICAgICAgLy8gTm90ZTogV2UgZG9uJ3QgdXNlIGBOZ01vZHVsZVN1bW1hcnkucHJvdmlkZXJzYCwgYXMgdGhhdCBvbmUgaXMgdHJhbnNpdGl2ZSxcbiAgICAgIC8vIGFuZCB3ZSBhbHJlYWR5IGhhdmUgdHJhbnNpdGl2ZSBtb2R1bGVzLlxuICAgICAgcHJvdmlkZXJzID0gbWV0YWRhdGEucHJvdmlkZXJzO1xuICAgIH0gZWxzZSBpZiAoc3VtbWFyeS5zdW1tYXJ5S2luZCA9PT0gQ29tcGlsZVN1bW1hcnlLaW5kLkRpcmVjdGl2ZSkge1xuICAgICAgY29uc3QgZGlyU3VtbWFyeSA9IDxDb21waWxlRGlyZWN0aXZlU3VtbWFyeT5zdW1tYXJ5O1xuICAgICAgcHJvdmlkZXJzID0gZGlyU3VtbWFyeS5wcm92aWRlcnMuY29uY2F0KGRpclN1bW1hcnkudmlld1Byb3ZpZGVycyk7XG4gICAgfVxuICAgIC8vIE5vdGU6IFdlIGNhbid0IGp1c3QgcmVmZXIgdG8gdGhlIGBuZ3N1bW1hcnkudHNgIGZpbGVzIGZvciBgdXNlQ2xhc3NgIHByb3ZpZGVycyAoYXMgd2UgZG8gZm9yXG4gICAgLy8gZGVjbGFyZWREaXJlY3RpdmVzIC8gZGVjbGFyZWRQaXBlcyksIGFzIHdlIGFsbG93XG4gICAgLy8gcHJvdmlkZXJzIHdpdGhvdXQgY3RvciBhcmd1bWVudHMgdG8gc2tpcCB0aGUgYEBJbmplY3RhYmxlYCBkZWNvcmF0b3IsXG4gICAgLy8gaS5lLiB3ZSBkaWRuJ3QgZ2VuZXJhdGUgLm5nc3VtbWFyeS50cyBmaWxlcyBmb3IgdGhlc2UuXG4gICAgZXhwcmVzc2lvbnMucHVzaChcbiAgICAgICAgLi4ucHJvdmlkZXJzLmZpbHRlcihwcm92aWRlciA9PiAhIXByb3ZpZGVyLnVzZUNsYXNzKS5tYXAocHJvdmlkZXIgPT4gdGhpcy5zZXJpYWxpemVTdW1tYXJ5KHtcbiAgICAgICAgICBzdW1tYXJ5S2luZDogQ29tcGlsZVN1bW1hcnlLaW5kLkluamVjdGFibGUsIHR5cGU6IHByb3ZpZGVyLnVzZUNsYXNzXG4gICAgICAgIH0gYXMgQ29tcGlsZVR5cGVTdW1tYXJ5KSkpO1xuICAgIHJldHVybiBvLmxpdGVyYWxBcnIoZXhwcmVzc2lvbnMpO1xuICB9XG5cbiAgcHJpdmF0ZSBzZXJpYWxpemVTdW1tYXJ5UmVmKHR5cGVTeW1ib2w6IFN0YXRpY1N5bWJvbCk6IG8uRXhwcmVzc2lvbiB7XG4gICAgY29uc3Qgaml0SW1wb3J0ZWRTeW1ib2wgPSB0aGlzLnN5bWJvbFJlc29sdmVyLmdldFN0YXRpY1N5bWJvbChcbiAgICAgICAgc3VtbWFyeUZvckppdEZpbGVOYW1lKHR5cGVTeW1ib2wuZmlsZVBhdGgpLCBzdW1tYXJ5Rm9ySml0TmFtZSh0eXBlU3ltYm9sLm5hbWUpKTtcbiAgICByZXR1cm4gdGhpcy5vdXRwdXRDdHguaW1wb3J0RXhwcihqaXRJbXBvcnRlZFN5bWJvbCk7XG4gIH1cblxuICBwcml2YXRlIHNlcmlhbGl6ZVN1bW1hcnkoZGF0YToge1trZXk6IHN0cmluZ106IGFueX0pOiBvLkV4cHJlc3Npb24ge1xuICAgIGNvbnN0IG91dHB1dEN0eCA9IHRoaXMub3V0cHV0Q3R4O1xuXG4gICAgY2xhc3MgVHJhbnNmb3JtZXIgaW1wbGVtZW50cyBWYWx1ZVZpc2l0b3Ige1xuICAgICAgdmlzaXRBcnJheShhcnI6IGFueVtdLCBjb250ZXh0OiBhbnkpOiBhbnkge1xuICAgICAgICByZXR1cm4gby5saXRlcmFsQXJyKGFyci5tYXAoZW50cnkgPT4gdmlzaXRWYWx1ZShlbnRyeSwgdGhpcywgY29udGV4dCkpKTtcbiAgICAgIH1cbiAgICAgIHZpc2l0U3RyaW5nTWFwKG1hcDoge1trZXk6IHN0cmluZ106IGFueX0sIGNvbnRleHQ6IGFueSk6IGFueSB7XG4gICAgICAgIHJldHVybiBuZXcgby5MaXRlcmFsTWFwRXhwcihPYmplY3Qua2V5cyhtYXApLm1hcChcbiAgICAgICAgICAgIChrZXkpID0+IG5ldyBvLkxpdGVyYWxNYXBFbnRyeShrZXksIHZpc2l0VmFsdWUobWFwW2tleV0sIHRoaXMsIGNvbnRleHQpLCBmYWxzZSkpKTtcbiAgICAgIH1cbiAgICAgIHZpc2l0UHJpbWl0aXZlKHZhbHVlOiBhbnksIGNvbnRleHQ6IGFueSk6IGFueSB7IHJldHVybiBvLmxpdGVyYWwodmFsdWUpOyB9XG4gICAgICB2aXNpdE90aGVyKHZhbHVlOiBhbnksIGNvbnRleHQ6IGFueSk6IGFueSB7XG4gICAgICAgIGlmICh2YWx1ZSBpbnN0YW5jZW9mIFN0YXRpY1N5bWJvbCkge1xuICAgICAgICAgIHJldHVybiBvdXRwdXRDdHguaW1wb3J0RXhwcih2YWx1ZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBJbGxlZ2FsIFN0YXRlOiBFbmNvdW50ZXJlZCB2YWx1ZSAke3ZhbHVlfWApO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHZpc2l0VmFsdWUoZGF0YSwgbmV3IFRyYW5zZm9ybWVyKCksIG51bGwpO1xuICB9XG59XG5cbmNsYXNzIEZyb21Kc29uRGVzZXJpYWxpemVyIGV4dGVuZHMgVmFsdWVUcmFuc2Zvcm1lciB7XG4gIC8vIFRPRE8oaXNzdWUvMjQ1NzEpOiByZW1vdmUgJyEnLlxuICBwcml2YXRlIHN5bWJvbHMgITogU3RhdGljU3ltYm9sW107XG5cbiAgY29uc3RydWN0b3IoXG4gICAgICBwcml2YXRlIHN5bWJvbENhY2hlOiBTdGF0aWNTeW1ib2xDYWNoZSxcbiAgICAgIHByaXZhdGUgc3VtbWFyeVJlc29sdmVyOiBTdW1tYXJ5UmVzb2x2ZXI8U3RhdGljU3ltYm9sPikge1xuICAgIHN1cGVyKCk7XG4gIH1cblxuICBkZXNlcmlhbGl6ZShsaWJyYXJ5RmlsZU5hbWU6IHN0cmluZywganNvbjogc3RyaW5nKToge1xuICAgIG1vZHVsZU5hbWU6IHN0cmluZyB8IG51bGwsXG4gICAgc3VtbWFyaWVzOiBTdW1tYXJ5PFN0YXRpY1N5bWJvbD5bXSxcbiAgICBpbXBvcnRBczoge3N5bWJvbDogU3RhdGljU3ltYm9sLCBpbXBvcnRBczogU3RhdGljU3ltYm9sfVtdXG4gIH0ge1xuICAgIGNvbnN0IGRhdGE6IHttb2R1bGVOYW1lOiBzdHJpbmcgfCBudWxsLCBzdW1tYXJpZXM6IGFueVtdLCBzeW1ib2xzOiBhbnlbXX0gPSBKU09OLnBhcnNlKGpzb24pO1xuICAgIGNvbnN0IGFsbEltcG9ydEFzOiB7c3ltYm9sOiBTdGF0aWNTeW1ib2wsIGltcG9ydEFzOiBTdGF0aWNTeW1ib2x9W10gPSBbXTtcbiAgICB0aGlzLnN5bWJvbHMgPSBkYXRhLnN5bWJvbHMubWFwKFxuICAgICAgICAoc2VyaWFsaXplZFN5bWJvbCkgPT4gdGhpcy5zeW1ib2xDYWNoZS5nZXQoXG4gICAgICAgICAgICB0aGlzLnN1bW1hcnlSZXNvbHZlci5mcm9tU3VtbWFyeUZpbGVOYW1lKHNlcmlhbGl6ZWRTeW1ib2wuZmlsZVBhdGgsIGxpYnJhcnlGaWxlTmFtZSksXG4gICAgICAgICAgICBzZXJpYWxpemVkU3ltYm9sLm5hbWUpKTtcbiAgICBkYXRhLnN5bWJvbHMuZm9yRWFjaCgoc2VyaWFsaXplZFN5bWJvbCwgaW5kZXgpID0+IHtcbiAgICAgIGNvbnN0IHN5bWJvbCA9IHRoaXMuc3ltYm9sc1tpbmRleF07XG4gICAgICBjb25zdCBpbXBvcnRBcyA9IHNlcmlhbGl6ZWRTeW1ib2wuaW1wb3J0QXM7XG4gICAgICBpZiAodHlwZW9mIGltcG9ydEFzID09PSAnbnVtYmVyJykge1xuICAgICAgICBhbGxJbXBvcnRBcy5wdXNoKHtzeW1ib2wsIGltcG9ydEFzOiB0aGlzLnN5bWJvbHNbaW1wb3J0QXNdfSk7XG4gICAgICB9IGVsc2UgaWYgKHR5cGVvZiBpbXBvcnRBcyA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgYWxsSW1wb3J0QXMucHVzaChcbiAgICAgICAgICAgIHtzeW1ib2wsIGltcG9ydEFzOiB0aGlzLnN5bWJvbENhY2hlLmdldChuZ2ZhY3RvcnlGaWxlUGF0aChsaWJyYXJ5RmlsZU5hbWUpLCBpbXBvcnRBcyl9KTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICBjb25zdCBzdW1tYXJpZXMgPSB2aXNpdFZhbHVlKGRhdGEuc3VtbWFyaWVzLCB0aGlzLCBudWxsKSBhcyBTdW1tYXJ5PFN0YXRpY1N5bWJvbD5bXTtcbiAgICByZXR1cm4ge21vZHVsZU5hbWU6IGRhdGEubW9kdWxlTmFtZSwgc3VtbWFyaWVzLCBpbXBvcnRBczogYWxsSW1wb3J0QXN9O1xuICB9XG5cbiAgdmlzaXRTdHJpbmdNYXAobWFwOiB7W2tleTogc3RyaW5nXTogYW55fSwgY29udGV4dDogYW55KTogYW55IHtcbiAgICBpZiAoJ19fc3ltYm9sJyBpbiBtYXApIHtcbiAgICAgIGNvbnN0IGJhc2VTeW1ib2wgPSB0aGlzLnN5bWJvbHNbbWFwWydfX3N5bWJvbCddXTtcbiAgICAgIGNvbnN0IG1lbWJlcnMgPSBtYXBbJ21lbWJlcnMnXTtcbiAgICAgIHJldHVybiBtZW1iZXJzLmxlbmd0aCA/IHRoaXMuc3ltYm9sQ2FjaGUuZ2V0KGJhc2VTeW1ib2wuZmlsZVBhdGgsIGJhc2VTeW1ib2wubmFtZSwgbWVtYmVycykgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYmFzZVN5bWJvbDtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHN1cGVyLnZpc2l0U3RyaW5nTWFwKG1hcCwgY29udGV4dCk7XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIGlzQ2FsbChtZXRhZGF0YTogYW55KTogYm9vbGVhbiB7XG4gIHJldHVybiBtZXRhZGF0YSAmJiBtZXRhZGF0YS5fX3N5bWJvbGljID09PSAnY2FsbCc7XG59XG5cbmZ1bmN0aW9uIGlzRnVuY3Rpb25DYWxsKG1ldGFkYXRhOiBhbnkpOiBib29sZWFuIHtcbiAgcmV0dXJuIGlzQ2FsbChtZXRhZGF0YSkgJiYgdW53cmFwUmVzb2x2ZWRNZXRhZGF0YShtZXRhZGF0YS5leHByZXNzaW9uKSBpbnN0YW5jZW9mIFN0YXRpY1N5bWJvbDtcbn1cblxuZnVuY3Rpb24gaXNNZXRob2RDYWxsT25WYXJpYWJsZShtZXRhZGF0YTogYW55KTogYm9vbGVhbiB7XG4gIHJldHVybiBpc0NhbGwobWV0YWRhdGEpICYmIG1ldGFkYXRhLmV4cHJlc3Npb24gJiYgbWV0YWRhdGEuZXhwcmVzc2lvbi5fX3N5bWJvbGljID09PSAnc2VsZWN0JyAmJlxuICAgICAgdW53cmFwUmVzb2x2ZWRNZXRhZGF0YShtZXRhZGF0YS5leHByZXNzaW9uLmV4cHJlc3Npb24pIGluc3RhbmNlb2YgU3RhdGljU3ltYm9sO1xufVxuIl19