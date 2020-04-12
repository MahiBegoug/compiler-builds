/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ValueTransformer, visitValue } from '../util';
import { StaticSymbol } from './static_symbol';
import { isGeneratedFile, stripSummaryForJitFileSuffix, stripSummaryForJitNameSuffix, summaryForJitFileName, summaryForJitName } from './util';
const TS = /^(?!.*\.d\.ts$).*\.ts$/;
export class ResolvedStaticSymbol {
    constructor(symbol, metadata) {
        this.symbol = symbol;
        this.metadata = metadata;
    }
}
const SUPPORTED_SCHEMA_VERSION = 4;
/**
 * This class is responsible for loading metadata per symbol,
 * and normalizing references between symbols.
 *
 * Internally, it only uses symbols without members,
 * and deduces the values for symbols with members based
 * on these symbols.
 */
export class StaticSymbolResolver {
    constructor(host, staticSymbolCache, summaryResolver, errorRecorder) {
        this.host = host;
        this.staticSymbolCache = staticSymbolCache;
        this.summaryResolver = summaryResolver;
        this.errorRecorder = errorRecorder;
        this.metadataCache = new Map();
        // Note: this will only contain StaticSymbols without members!
        this.resolvedSymbols = new Map();
        // Note: this will only contain StaticSymbols without members!
        this.importAs = new Map();
        this.symbolResourcePaths = new Map();
        this.symbolFromFile = new Map();
        this.knownFileNameToModuleNames = new Map();
    }
    resolveSymbol(staticSymbol) {
        if (staticSymbol.members.length > 0) {
            return this._resolveSymbolMembers(staticSymbol);
        }
        // Note: always ask for a summary first,
        // as we might have read shallow metadata via a .d.ts file
        // for the symbol.
        const resultFromSummary = this._resolveSymbolFromSummary(staticSymbol);
        if (resultFromSummary) {
            return resultFromSummary;
        }
        const resultFromCache = this.resolvedSymbols.get(staticSymbol);
        if (resultFromCache) {
            return resultFromCache;
        }
        // Note: Some users use libraries that were not compiled with ngc, i.e. they don't
        // have summaries, only .d.ts files. So we always need to check both, the summary
        // and metadata.
        this._createSymbolsOf(staticSymbol.filePath);
        return this.resolvedSymbols.get(staticSymbol);
    }
    /**
     * getImportAs produces a symbol that can be used to import the given symbol.
     * The import might be different than the symbol if the symbol is exported from
     * a library with a summary; in which case we want to import the symbol from the
     * ngfactory re-export instead of directly to avoid introducing a direct dependency
     * on an otherwise indirect dependency.
     *
     * @param staticSymbol the symbol for which to generate a import symbol
     */
    getImportAs(staticSymbol, useSummaries = true) {
        if (staticSymbol.members.length) {
            const baseSymbol = this.getStaticSymbol(staticSymbol.filePath, staticSymbol.name);
            const baseImportAs = this.getImportAs(baseSymbol, useSummaries);
            return baseImportAs ?
                this.getStaticSymbol(baseImportAs.filePath, baseImportAs.name, staticSymbol.members) :
                null;
        }
        const summarizedFileName = stripSummaryForJitFileSuffix(staticSymbol.filePath);
        if (summarizedFileName !== staticSymbol.filePath) {
            const summarizedName = stripSummaryForJitNameSuffix(staticSymbol.name);
            const baseSymbol = this.getStaticSymbol(summarizedFileName, summarizedName, staticSymbol.members);
            const baseImportAs = this.getImportAs(baseSymbol, useSummaries);
            return baseImportAs ?
                this.getStaticSymbol(summaryForJitFileName(baseImportAs.filePath), summaryForJitName(baseImportAs.name), baseSymbol.members) :
                null;
        }
        let result = (useSummaries && this.summaryResolver.getImportAs(staticSymbol)) || null;
        if (!result) {
            result = this.importAs.get(staticSymbol);
        }
        return result;
    }
    /**
     * getResourcePath produces the path to the original location of the symbol and should
     * be used to determine the relative location of resource references recorded in
     * symbol metadata.
     */
    getResourcePath(staticSymbol) {
        return this.symbolResourcePaths.get(staticSymbol) || staticSymbol.filePath;
    }
    /**
     * getTypeArity returns the number of generic type parameters the given symbol
     * has. If the symbol is not a type the result is null.
     */
    getTypeArity(staticSymbol) {
        // If the file is a factory/ngsummary file, don't resolve the symbol as doing so would
        // cause the metadata for an factory/ngsummary file to be loaded which doesn't exist.
        // All references to generated classes must include the correct arity whenever
        // generating code.
        if (isGeneratedFile(staticSymbol.filePath)) {
            return null;
        }
        let resolvedSymbol = unwrapResolvedMetadata(this.resolveSymbol(staticSymbol));
        while (resolvedSymbol && resolvedSymbol.metadata instanceof StaticSymbol) {
            resolvedSymbol = unwrapResolvedMetadata(this.resolveSymbol(resolvedSymbol.metadata));
        }
        return (resolvedSymbol && resolvedSymbol.metadata && resolvedSymbol.metadata.arity) || null;
    }
    getKnownModuleName(filePath) {
        return this.knownFileNameToModuleNames.get(filePath) || null;
    }
    recordImportAs(sourceSymbol, targetSymbol) {
        sourceSymbol.assertNoMembers();
        targetSymbol.assertNoMembers();
        this.importAs.set(sourceSymbol, targetSymbol);
    }
    recordModuleNameForFileName(fileName, moduleName) {
        this.knownFileNameToModuleNames.set(fileName, moduleName);
    }
    /**
     * Invalidate all information derived from the given file and return the
     * static symbols contained in the file.
     *
     * @param fileName the file to invalidate
     */
    invalidateFile(fileName) {
        this.metadataCache.delete(fileName);
        const symbols = this.symbolFromFile.get(fileName);
        if (!symbols) {
            return [];
        }
        this.symbolFromFile.delete(fileName);
        for (const symbol of symbols) {
            this.resolvedSymbols.delete(symbol);
            this.importAs.delete(symbol);
            this.symbolResourcePaths.delete(symbol);
        }
        return symbols;
    }
    /** @internal */
    ignoreErrorsFor(cb) {
        const recorder = this.errorRecorder;
        this.errorRecorder = () => { };
        try {
            return cb();
        }
        finally {
            this.errorRecorder = recorder;
        }
    }
    _resolveSymbolMembers(staticSymbol) {
        const members = staticSymbol.members;
        const baseResolvedSymbol = this.resolveSymbol(this.getStaticSymbol(staticSymbol.filePath, staticSymbol.name));
        if (!baseResolvedSymbol) {
            return null;
        }
        let baseMetadata = unwrapResolvedMetadata(baseResolvedSymbol.metadata);
        if (baseMetadata instanceof StaticSymbol) {
            return new ResolvedStaticSymbol(staticSymbol, this.getStaticSymbol(baseMetadata.filePath, baseMetadata.name, members));
        }
        else if (baseMetadata && baseMetadata.__symbolic === 'class') {
            if (baseMetadata.statics && members.length === 1) {
                return new ResolvedStaticSymbol(staticSymbol, baseMetadata.statics[members[0]]);
            }
        }
        else {
            let value = baseMetadata;
            for (let i = 0; i < members.length && value; i++) {
                value = value[members[i]];
            }
            return new ResolvedStaticSymbol(staticSymbol, value);
        }
        return null;
    }
    _resolveSymbolFromSummary(staticSymbol) {
        const summary = this.summaryResolver.resolveSummary(staticSymbol);
        return summary ? new ResolvedStaticSymbol(staticSymbol, summary.metadata) : null;
    }
    /**
     * getStaticSymbol produces a Type whose metadata is known but whose implementation is not loaded.
     * All types passed to the StaticResolver should be pseudo-types returned by this method.
     *
     * @param declarationFile the absolute path of the file where the symbol is declared
     * @param name the name of the type.
     * @param members a symbol for a static member of the named type
     */
    getStaticSymbol(declarationFile, name, members) {
        return this.staticSymbolCache.get(declarationFile, name, members);
    }
    /**
     * hasDecorators checks a file's metadata for the presence of decorators without evaluating the
     * metadata.
     *
     * @param filePath the absolute path to examine for decorators.
     * @returns true if any class in the file has a decorator.
     */
    hasDecorators(filePath) {
        const metadata = this.getModuleMetadata(filePath);
        if (metadata['metadata']) {
            return Object.keys(metadata['metadata']).some((metadataKey) => {
                const entry = metadata['metadata'][metadataKey];
                return entry && entry.__symbolic === 'class' && entry.decorators;
            });
        }
        return false;
    }
    getSymbolsOf(filePath) {
        const summarySymbols = this.summaryResolver.getSymbolsOf(filePath);
        if (summarySymbols) {
            return summarySymbols;
        }
        // Note: Some users use libraries that were not compiled with ngc, i.e. they don't
        // have summaries, only .d.ts files, but `summaryResolver.isLibraryFile` returns true.
        this._createSymbolsOf(filePath);
        return this.symbolFromFile.get(filePath) || [];
    }
    _createSymbolsOf(filePath) {
        if (this.symbolFromFile.has(filePath)) {
            return;
        }
        const resolvedSymbols = [];
        const metadata = this.getModuleMetadata(filePath);
        if (metadata['importAs']) {
            // Index bundle indices should use the importAs module name defined
            // in the bundle.
            this.knownFileNameToModuleNames.set(filePath, metadata['importAs']);
        }
        // handle the symbols in one of the re-export location
        if (metadata['exports']) {
            for (const moduleExport of metadata['exports']) {
                // handle the symbols in the list of explicitly re-exported symbols.
                if (moduleExport.export) {
                    moduleExport.export.forEach((exportSymbol) => {
                        let symbolName;
                        if (typeof exportSymbol === 'string') {
                            symbolName = exportSymbol;
                        }
                        else {
                            symbolName = exportSymbol.as;
                        }
                        symbolName = unescapeIdentifier(symbolName);
                        let symName = symbolName;
                        if (typeof exportSymbol !== 'string') {
                            symName = unescapeIdentifier(exportSymbol.name);
                        }
                        const resolvedModule = this.resolveModule(moduleExport.from, filePath);
                        if (resolvedModule) {
                            const targetSymbol = this.getStaticSymbol(resolvedModule, symName);
                            const sourceSymbol = this.getStaticSymbol(filePath, symbolName);
                            resolvedSymbols.push(this.createExport(sourceSymbol, targetSymbol));
                        }
                    });
                }
                else {
                    // Handle the symbols loaded by 'export *' directives.
                    const resolvedModule = this.resolveModule(moduleExport.from, filePath);
                    if (resolvedModule && resolvedModule !== filePath) {
                        const nestedExports = this.getSymbolsOf(resolvedModule);
                        nestedExports.forEach((targetSymbol) => {
                            const sourceSymbol = this.getStaticSymbol(filePath, targetSymbol.name);
                            resolvedSymbols.push(this.createExport(sourceSymbol, targetSymbol));
                        });
                    }
                }
            }
        }
        // handle the actual metadata. Has to be after the exports
        // as there might be collisions in the names, and we want the symbols
        // of the current module to win ofter reexports.
        if (metadata['metadata']) {
            // handle direct declarations of the symbol
            const topLevelSymbolNames = new Set(Object.keys(metadata['metadata']).map(unescapeIdentifier));
            const origins = metadata['origins'] || {};
            Object.keys(metadata['metadata']).forEach((metadataKey) => {
                const symbolMeta = metadata['metadata'][metadataKey];
                const name = unescapeIdentifier(metadataKey);
                const symbol = this.getStaticSymbol(filePath, name);
                const origin = origins.hasOwnProperty(metadataKey) && origins[metadataKey];
                if (origin) {
                    // If the symbol is from a bundled index, use the declaration location of the
                    // symbol so relative references (such as './my.html') will be calculated
                    // correctly.
                    const originFilePath = this.resolveModule(origin, filePath);
                    if (!originFilePath) {
                        this.reportError(new Error(`Couldn't resolve original symbol for ${origin} from ${this.host.getOutputName(filePath)}`));
                    }
                    else {
                        this.symbolResourcePaths.set(symbol, originFilePath);
                    }
                }
                resolvedSymbols.push(this.createResolvedSymbol(symbol, filePath, topLevelSymbolNames, symbolMeta));
            });
        }
        const uniqueSymbols = new Set();
        for (const resolvedSymbol of resolvedSymbols) {
            this.resolvedSymbols.set(resolvedSymbol.symbol, resolvedSymbol);
            uniqueSymbols.add(resolvedSymbol.symbol);
        }
        this.symbolFromFile.set(filePath, Array.from(uniqueSymbols));
    }
    createResolvedSymbol(sourceSymbol, topLevelPath, topLevelSymbolNames, metadata) {
        // For classes that don't have Angular summaries / metadata,
        // we only keep their arity, but nothing else
        // (e.g. their constructor parameters).
        // We do this to prevent introducing deep imports
        // as we didn't generate .ngfactory.ts files with proper reexports.
        const isTsFile = TS.test(sourceSymbol.filePath);
        if (this.summaryResolver.isLibraryFile(sourceSymbol.filePath) && !isTsFile && metadata &&
            metadata['__symbolic'] === 'class') {
            const transformedMeta = { __symbolic: 'class', arity: metadata.arity };
            return new ResolvedStaticSymbol(sourceSymbol, transformedMeta);
        }
        let _originalFileMemo;
        const getOriginalName = () => {
            if (!_originalFileMemo) {
                // Guess what the original file name is from the reference. If it has a `.d.ts` extension
                // replace it with `.ts`. If it already has `.ts` just leave it in place. If it doesn't have
                // .ts or .d.ts, append `.ts'. Also, if it is in `node_modules`, trim the `node_module`
                // location as it is not important to finding the file.
                _originalFileMemo =
                    this.host.getOutputName(topLevelPath.replace(/((\.ts)|(\.d\.ts)|)$/, '.ts')
                        .replace(/^.*node_modules[/\\]/, ''));
            }
            return _originalFileMemo;
        };
        const self = this;
        class ReferenceTransformer extends ValueTransformer {
            visitStringMap(map, functionParams) {
                const symbolic = map['__symbolic'];
                if (symbolic === 'function') {
                    const oldLen = functionParams.length;
                    functionParams.push(...(map['parameters'] || []));
                    const result = super.visitStringMap(map, functionParams);
                    functionParams.length = oldLen;
                    return result;
                }
                else if (symbolic === 'reference') {
                    const module = map['module'];
                    const name = map['name'] ? unescapeIdentifier(map['name']) : map['name'];
                    if (!name) {
                        return null;
                    }
                    let filePath;
                    if (module) {
                        filePath = self.resolveModule(module, sourceSymbol.filePath);
                        if (!filePath) {
                            return {
                                __symbolic: 'error',
                                message: `Could not resolve ${module} relative to ${self.host.getMetadataFor(sourceSymbol.filePath)}.`,
                                line: map['line'],
                                character: map['character'],
                                fileName: getOriginalName()
                            };
                        }
                        return {
                            __symbolic: 'resolved',
                            symbol: self.getStaticSymbol(filePath, name),
                            line: map['line'],
                            character: map['character'],
                            fileName: getOriginalName()
                        };
                    }
                    else if (functionParams.indexOf(name) >= 0) {
                        // reference to a function parameter
                        return { __symbolic: 'reference', name: name };
                    }
                    else {
                        if (topLevelSymbolNames.has(name)) {
                            return self.getStaticSymbol(topLevelPath, name);
                        }
                        // ambient value
                        null;
                    }
                }
                else if (symbolic === 'error') {
                    return Object.assign(Object.assign({}, map), { fileName: getOriginalName() });
                }
                else {
                    return super.visitStringMap(map, functionParams);
                }
            }
        }
        const transformedMeta = visitValue(metadata, new ReferenceTransformer(), []);
        let unwrappedTransformedMeta = unwrapResolvedMetadata(transformedMeta);
        if (unwrappedTransformedMeta instanceof StaticSymbol) {
            return this.createExport(sourceSymbol, unwrappedTransformedMeta);
        }
        return new ResolvedStaticSymbol(sourceSymbol, transformedMeta);
    }
    createExport(sourceSymbol, targetSymbol) {
        sourceSymbol.assertNoMembers();
        targetSymbol.assertNoMembers();
        if (this.summaryResolver.isLibraryFile(sourceSymbol.filePath) &&
            this.summaryResolver.isLibraryFile(targetSymbol.filePath)) {
            // This case is for an ng library importing symbols from a plain ts library
            // transitively.
            // Note: We rely on the fact that we discover symbols in the direction
            // from source files to library files
            this.importAs.set(targetSymbol, this.getImportAs(sourceSymbol) || sourceSymbol);
        }
        return new ResolvedStaticSymbol(sourceSymbol, targetSymbol);
    }
    reportError(error, context, path) {
        if (this.errorRecorder) {
            this.errorRecorder(error, (context && context.filePath) || path);
        }
        else {
            throw error;
        }
    }
    /**
     * @param module an absolute path to a module file.
     */
    getModuleMetadata(module) {
        let moduleMetadata = this.metadataCache.get(module);
        if (!moduleMetadata) {
            const moduleMetadatas = this.host.getMetadataFor(module);
            if (moduleMetadatas) {
                let maxVersion = -1;
                moduleMetadatas.forEach((md) => {
                    if (md && md['version'] > maxVersion) {
                        maxVersion = md['version'];
                        moduleMetadata = md;
                    }
                });
            }
            if (!moduleMetadata) {
                moduleMetadata =
                    { __symbolic: 'module', version: SUPPORTED_SCHEMA_VERSION, module: module, metadata: {} };
            }
            if (moduleMetadata['version'] != SUPPORTED_SCHEMA_VERSION) {
                const errorMessage = moduleMetadata['version'] == 2 ?
                    `Unsupported metadata version ${moduleMetadata['version']} for module ${module}. This module should be compiled with a newer version of ngc` :
                    `Metadata version mismatch for module ${this.host.getOutputName(module)}, found version ${moduleMetadata['version']}, expected ${SUPPORTED_SCHEMA_VERSION}`;
                this.reportError(new Error(errorMessage));
            }
            this.metadataCache.set(module, moduleMetadata);
        }
        return moduleMetadata;
    }
    getSymbolByModule(module, symbolName, containingFile) {
        const filePath = this.resolveModule(module, containingFile);
        if (!filePath) {
            this.reportError(new Error(`Could not resolve module ${module}${containingFile ? ' relative to ' + this.host.getOutputName(containingFile) : ''}`));
            return this.getStaticSymbol(`ERROR:${module}`, symbolName);
        }
        return this.getStaticSymbol(filePath, symbolName);
    }
    resolveModule(module, containingFile) {
        try {
            return this.host.moduleNameToFileName(module, containingFile);
        }
        catch (e) {
            console.error(`Could not resolve module '${module}' relative to file ${containingFile}`);
            this.reportError(e, undefined, containingFile);
        }
        return null;
    }
}
// Remove extra underscore from escaped identifier.
// See https://github.com/Microsoft/TypeScript/blob/master/src/compiler/utilities.ts
export function unescapeIdentifier(identifier) {
    return identifier.startsWith('___') ? identifier.substr(1) : identifier;
}
export function unwrapResolvedMetadata(metadata) {
    if (metadata && metadata.__symbolic === 'resolved') {
        return metadata.symbol;
    }
    return metadata;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RhdGljX3N5bWJvbF9yZXNvbHZlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyL3NyYy9hb3Qvc3RhdGljX3N5bWJvbF9yZXNvbHZlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFHSCxPQUFPLEVBQUMsZ0JBQWdCLEVBQUUsVUFBVSxFQUFDLE1BQU0sU0FBUyxDQUFDO0FBRXJELE9BQU8sRUFBQyxZQUFZLEVBQW9CLE1BQU0saUJBQWlCLENBQUM7QUFDaEUsT0FBTyxFQUFDLGVBQWUsRUFBRSw0QkFBNEIsRUFBRSw0QkFBNEIsRUFBRSxxQkFBcUIsRUFBRSxpQkFBaUIsRUFBQyxNQUFNLFFBQVEsQ0FBQztBQUU3SSxNQUFNLEVBQUUsR0FBRyx3QkFBd0IsQ0FBQztBQUVwQyxNQUFNLE9BQU8sb0JBQW9CO0lBQy9CLFlBQW1CLE1BQW9CLEVBQVMsUUFBYTtRQUExQyxXQUFNLEdBQU4sTUFBTSxDQUFjO1FBQVMsYUFBUSxHQUFSLFFBQVEsQ0FBSztJQUFHLENBQUM7Q0FDbEU7QUFpQ0QsTUFBTSx3QkFBd0IsR0FBRyxDQUFDLENBQUM7QUFFbkM7Ozs7Ozs7R0FPRztBQUNILE1BQU0sT0FBTyxvQkFBb0I7SUFVL0IsWUFDWSxJQUE4QixFQUFVLGlCQUFvQyxFQUM1RSxlQUE4QyxFQUM5QyxhQUF1RDtRQUZ2RCxTQUFJLEdBQUosSUFBSSxDQUEwQjtRQUFVLHNCQUFpQixHQUFqQixpQkFBaUIsQ0FBbUI7UUFDNUUsb0JBQWUsR0FBZixlQUFlLENBQStCO1FBQzlDLGtCQUFhLEdBQWIsYUFBYSxDQUEwQztRQVozRCxrQkFBYSxHQUFHLElBQUksR0FBRyxFQUFnQyxDQUFDO1FBQ2hFLDhEQUE4RDtRQUN0RCxvQkFBZSxHQUFHLElBQUksR0FBRyxFQUFzQyxDQUFDO1FBQ3hFLDhEQUE4RDtRQUN0RCxhQUFRLEdBQUcsSUFBSSxHQUFHLEVBQThCLENBQUM7UUFDakQsd0JBQW1CLEdBQUcsSUFBSSxHQUFHLEVBQXdCLENBQUM7UUFDdEQsbUJBQWMsR0FBRyxJQUFJLEdBQUcsRUFBMEIsQ0FBQztRQUNuRCwrQkFBMEIsR0FBRyxJQUFJLEdBQUcsRUFBa0IsQ0FBQztJQUtPLENBQUM7SUFFdkUsYUFBYSxDQUFDLFlBQTBCO1FBQ3RDLElBQUksWUFBWSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO1lBQ25DLE9BQU8sSUFBSSxDQUFDLHFCQUFxQixDQUFDLFlBQVksQ0FBRyxDQUFDO1NBQ25EO1FBQ0Qsd0NBQXdDO1FBQ3hDLDBEQUEwRDtRQUMxRCxrQkFBa0I7UUFDbEIsTUFBTSxpQkFBaUIsR0FBRyxJQUFJLENBQUMseUJBQXlCLENBQUMsWUFBWSxDQUFHLENBQUM7UUFDekUsSUFBSSxpQkFBaUIsRUFBRTtZQUNyQixPQUFPLGlCQUFpQixDQUFDO1NBQzFCO1FBQ0QsTUFBTSxlQUFlLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDL0QsSUFBSSxlQUFlLEVBQUU7WUFDbkIsT0FBTyxlQUFlLENBQUM7U0FDeEI7UUFDRCxrRkFBa0Y7UUFDbEYsaUZBQWlGO1FBQ2pGLGdCQUFnQjtRQUNoQixJQUFJLENBQUMsZ0JBQWdCLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQzdDLE9BQU8sSUFBSSxDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFHLENBQUM7SUFDbEQsQ0FBQztJQUVEOzs7Ozs7OztPQVFHO0lBQ0gsV0FBVyxDQUFDLFlBQTBCLEVBQUUsZUFBd0IsSUFBSTtRQUNsRSxJQUFJLFlBQVksQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFO1lBQy9CLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsWUFBWSxDQUFDLFFBQVEsRUFBRSxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDbEYsTUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxVQUFVLEVBQUUsWUFBWSxDQUFDLENBQUM7WUFDaEUsT0FBTyxZQUFZLENBQUMsQ0FBQztnQkFDakIsSUFBSSxDQUFDLGVBQWUsQ0FBQyxZQUFZLENBQUMsUUFBUSxFQUFFLFlBQVksQ0FBQyxJQUFJLEVBQUUsWUFBWSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7Z0JBQ3RGLElBQUksQ0FBQztTQUNWO1FBQ0QsTUFBTSxrQkFBa0IsR0FBRyw0QkFBNEIsQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDL0UsSUFBSSxrQkFBa0IsS0FBSyxZQUFZLENBQUMsUUFBUSxFQUFFO1lBQ2hELE1BQU0sY0FBYyxHQUFHLDRCQUE0QixDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUN2RSxNQUFNLFVBQVUsR0FDWixJQUFJLENBQUMsZUFBZSxDQUFDLGtCQUFrQixFQUFFLGNBQWMsRUFBRSxZQUFZLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDbkYsTUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxVQUFVLEVBQUUsWUFBWSxDQUFDLENBQUM7WUFDaEUsT0FBTyxZQUFZLENBQUMsQ0FBQztnQkFDakIsSUFBSSxDQUFDLGVBQWUsQ0FDaEIscUJBQXFCLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQyxFQUFFLGlCQUFpQixDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsRUFDbEYsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7Z0JBQ3pCLElBQUksQ0FBQztTQUNWO1FBQ0QsSUFBSSxNQUFNLEdBQUcsQ0FBQyxZQUFZLElBQUksSUFBSSxDQUFDLGVBQWUsQ0FBQyxXQUFXLENBQUMsWUFBWSxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUM7UUFDdEYsSUFBSSxDQUFDLE1BQU0sRUFBRTtZQUNYLE1BQU0sR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUcsQ0FBQztTQUM1QztRQUNELE9BQU8sTUFBTSxDQUFDO0lBQ2hCLENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsZUFBZSxDQUFDLFlBQTBCO1FBQ3hDLE9BQU8sSUFBSSxDQUFDLG1CQUFtQixDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsSUFBSSxZQUFZLENBQUMsUUFBUSxDQUFDO0lBQzdFLENBQUM7SUFFRDs7O09BR0c7SUFDSCxZQUFZLENBQUMsWUFBMEI7UUFDckMsc0ZBQXNGO1FBQ3RGLHFGQUFxRjtRQUNyRiw4RUFBOEU7UUFDOUUsbUJBQW1CO1FBQ25CLElBQUksZUFBZSxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUMsRUFBRTtZQUMxQyxPQUFPLElBQUksQ0FBQztTQUNiO1FBQ0QsSUFBSSxjQUFjLEdBQUcsc0JBQXNCLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDO1FBQzlFLE9BQU8sY0FBYyxJQUFJLGNBQWMsQ0FBQyxRQUFRLFlBQVksWUFBWSxFQUFFO1lBQ3hFLGNBQWMsR0FBRyxzQkFBc0IsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLGNBQWMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO1NBQ3RGO1FBQ0QsT0FBTyxDQUFDLGNBQWMsSUFBSSxjQUFjLENBQUMsUUFBUSxJQUFJLGNBQWMsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLElBQUksSUFBSSxDQUFDO0lBQzlGLENBQUM7SUFFRCxrQkFBa0IsQ0FBQyxRQUFnQjtRQUNqQyxPQUFPLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLElBQUksSUFBSSxDQUFDO0lBQy9ELENBQUM7SUFFRCxjQUFjLENBQUMsWUFBMEIsRUFBRSxZQUEwQjtRQUNuRSxZQUFZLENBQUMsZUFBZSxFQUFFLENBQUM7UUFDL0IsWUFBWSxDQUFDLGVBQWUsRUFBRSxDQUFDO1FBQy9CLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLFlBQVksRUFBRSxZQUFZLENBQUMsQ0FBQztJQUNoRCxDQUFDO0lBRUQsMkJBQTJCLENBQUMsUUFBZ0IsRUFBRSxVQUFrQjtRQUM5RCxJQUFJLENBQUMsMEJBQTBCLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxVQUFVLENBQUMsQ0FBQztJQUM1RCxDQUFDO0lBRUQ7Ozs7O09BS0c7SUFDSCxjQUFjLENBQUMsUUFBZ0I7UUFDN0IsSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDcEMsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDbEQsSUFBSSxDQUFDLE9BQU8sRUFBRTtZQUNaLE9BQU8sRUFBRSxDQUFDO1NBQ1g7UUFDRCxJQUFJLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUNyQyxLQUFLLE1BQU0sTUFBTSxJQUFJLE9BQU8sRUFBRTtZQUM1QixJQUFJLENBQUMsZUFBZSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUNwQyxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUM3QixJQUFJLENBQUMsbUJBQW1CLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1NBQ3pDO1FBQ0QsT0FBTyxPQUFPLENBQUM7SUFDakIsQ0FBQztJQUVELGdCQUFnQjtJQUNoQixlQUFlLENBQUksRUFBVztRQUM1QixNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDO1FBQ3BDLElBQUksQ0FBQyxhQUFhLEdBQUcsR0FBRyxFQUFFLEdBQUUsQ0FBQyxDQUFDO1FBQzlCLElBQUk7WUFDRixPQUFPLEVBQUUsRUFBRSxDQUFDO1NBQ2I7Z0JBQVM7WUFDUixJQUFJLENBQUMsYUFBYSxHQUFHLFFBQVEsQ0FBQztTQUMvQjtJQUNILENBQUM7SUFFTyxxQkFBcUIsQ0FBQyxZQUEwQjtRQUN0RCxNQUFNLE9BQU8sR0FBRyxZQUFZLENBQUMsT0FBTyxDQUFDO1FBQ3JDLE1BQU0sa0JBQWtCLEdBQ3BCLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxZQUFZLENBQUMsUUFBUSxFQUFFLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQ3ZGLElBQUksQ0FBQyxrQkFBa0IsRUFBRTtZQUN2QixPQUFPLElBQUksQ0FBQztTQUNiO1FBQ0QsSUFBSSxZQUFZLEdBQUcsc0JBQXNCLENBQUMsa0JBQWtCLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDdkUsSUFBSSxZQUFZLFlBQVksWUFBWSxFQUFFO1lBQ3hDLE9BQU8sSUFBSSxvQkFBb0IsQ0FDM0IsWUFBWSxFQUFFLElBQUksQ0FBQyxlQUFlLENBQUMsWUFBWSxDQUFDLFFBQVEsRUFBRSxZQUFZLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUM7U0FDNUY7YUFBTSxJQUFJLFlBQVksSUFBSSxZQUFZLENBQUMsVUFBVSxLQUFLLE9BQU8sRUFBRTtZQUM5RCxJQUFJLFlBQVksQ0FBQyxPQUFPLElBQUksT0FBTyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7Z0JBQ2hELE9BQU8sSUFBSSxvQkFBb0IsQ0FBQyxZQUFZLEVBQUUsWUFBWSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQ2pGO1NBQ0Y7YUFBTTtZQUNMLElBQUksS0FBSyxHQUFHLFlBQVksQ0FBQztZQUN6QixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsT0FBTyxDQUFDLE1BQU0sSUFBSSxLQUFLLEVBQUUsQ0FBQyxFQUFFLEVBQUU7Z0JBQ2hELEtBQUssR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7YUFDM0I7WUFDRCxPQUFPLElBQUksb0JBQW9CLENBQUMsWUFBWSxFQUFFLEtBQUssQ0FBQyxDQUFDO1NBQ3REO1FBQ0QsT0FBTyxJQUFJLENBQUM7SUFDZCxDQUFDO0lBRU8seUJBQXlCLENBQUMsWUFBMEI7UUFDMUQsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxjQUFjLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDbEUsT0FBTyxPQUFPLENBQUMsQ0FBQyxDQUFDLElBQUksb0JBQW9CLENBQUMsWUFBWSxFQUFFLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO0lBQ25GLENBQUM7SUFFRDs7Ozs7OztPQU9HO0lBQ0gsZUFBZSxDQUFDLGVBQXVCLEVBQUUsSUFBWSxFQUFFLE9BQWtCO1FBQ3ZFLE9BQU8sSUFBSSxDQUFDLGlCQUFpQixDQUFDLEdBQUcsQ0FBQyxlQUFlLEVBQUUsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQ3BFLENBQUM7SUFFRDs7Ozs7O09BTUc7SUFDSCxhQUFhLENBQUMsUUFBZ0I7UUFDNUIsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ2xELElBQUksUUFBUSxDQUFDLFVBQVUsQ0FBQyxFQUFFO1lBQ3hCLE9BQU8sTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxXQUFXLEVBQUUsRUFBRTtnQkFDNUQsTUFBTSxLQUFLLEdBQUcsUUFBUSxDQUFDLFVBQVUsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxDQUFDO2dCQUNoRCxPQUFPLEtBQUssSUFBSSxLQUFLLENBQUMsVUFBVSxLQUFLLE9BQU8sSUFBSSxLQUFLLENBQUMsVUFBVSxDQUFDO1lBQ25FLENBQUMsQ0FBQyxDQUFDO1NBQ0o7UUFDRCxPQUFPLEtBQUssQ0FBQztJQUNmLENBQUM7SUFFRCxZQUFZLENBQUMsUUFBZ0I7UUFDM0IsTUFBTSxjQUFjLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDbkUsSUFBSSxjQUFjLEVBQUU7WUFDbEIsT0FBTyxjQUFjLENBQUM7U0FDdkI7UUFDRCxrRkFBa0Y7UUFDbEYsc0ZBQXNGO1FBQ3RGLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUNoQyxPQUFPLElBQUksQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUNqRCxDQUFDO0lBRU8sZ0JBQWdCLENBQUMsUUFBZ0I7UUFDdkMsSUFBSSxJQUFJLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsRUFBRTtZQUNyQyxPQUFPO1NBQ1I7UUFDRCxNQUFNLGVBQWUsR0FBMkIsRUFBRSxDQUFDO1FBQ25ELE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUNsRCxJQUFJLFFBQVEsQ0FBQyxVQUFVLENBQUMsRUFBRTtZQUN4QixtRUFBbUU7WUFDbkUsaUJBQWlCO1lBQ2pCLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLFFBQVEsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO1NBQ3JFO1FBQ0Qsc0RBQXNEO1FBQ3RELElBQUksUUFBUSxDQUFDLFNBQVMsQ0FBQyxFQUFFO1lBQ3ZCLEtBQUssTUFBTSxZQUFZLElBQUksUUFBUSxDQUFDLFNBQVMsQ0FBQyxFQUFFO2dCQUM5QyxvRUFBb0U7Z0JBQ3BFLElBQUksWUFBWSxDQUFDLE1BQU0sRUFBRTtvQkFDdkIsWUFBWSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxZQUFpQixFQUFFLEVBQUU7d0JBQ2hELElBQUksVUFBa0IsQ0FBQzt3QkFDdkIsSUFBSSxPQUFPLFlBQVksS0FBSyxRQUFRLEVBQUU7NEJBQ3BDLFVBQVUsR0FBRyxZQUFZLENBQUM7eUJBQzNCOzZCQUFNOzRCQUNMLFVBQVUsR0FBRyxZQUFZLENBQUMsRUFBRSxDQUFDO3lCQUM5Qjt3QkFDRCxVQUFVLEdBQUcsa0JBQWtCLENBQUMsVUFBVSxDQUFDLENBQUM7d0JBQzVDLElBQUksT0FBTyxHQUFHLFVBQVUsQ0FBQzt3QkFDekIsSUFBSSxPQUFPLFlBQVksS0FBSyxRQUFRLEVBQUU7NEJBQ3BDLE9BQU8sR0FBRyxrQkFBa0IsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUM7eUJBQ2pEO3dCQUNELE1BQU0sY0FBYyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxRQUFRLENBQUMsQ0FBQzt3QkFDdkUsSUFBSSxjQUFjLEVBQUU7NEJBQ2xCLE1BQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsY0FBYyxFQUFFLE9BQU8sQ0FBQyxDQUFDOzRCQUNuRSxNQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLFFBQVEsRUFBRSxVQUFVLENBQUMsQ0FBQzs0QkFDaEUsZUFBZSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLFlBQVksRUFBRSxZQUFZLENBQUMsQ0FBQyxDQUFDO3lCQUNyRTtvQkFDSCxDQUFDLENBQUMsQ0FBQztpQkFDSjtxQkFBTTtvQkFDTCxzREFBc0Q7b0JBQ3RELE1BQU0sY0FBYyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxRQUFRLENBQUMsQ0FBQztvQkFDdkUsSUFBSSxjQUFjLElBQUksY0FBYyxLQUFLLFFBQVEsRUFBRTt3QkFDakQsTUFBTSxhQUFhLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxjQUFjLENBQUMsQ0FBQzt3QkFDeEQsYUFBYSxDQUFDLE9BQU8sQ0FBQyxDQUFDLFlBQVksRUFBRSxFQUFFOzRCQUNyQyxNQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLFFBQVEsRUFBRSxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUM7NEJBQ3ZFLGVBQWUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxZQUFZLEVBQUUsWUFBWSxDQUFDLENBQUMsQ0FBQzt3QkFDdEUsQ0FBQyxDQUFDLENBQUM7cUJBQ0o7aUJBQ0Y7YUFDRjtTQUNGO1FBRUQsMERBQTBEO1FBQzFELHFFQUFxRTtRQUNyRSxnREFBZ0Q7UUFDaEQsSUFBSSxRQUFRLENBQUMsVUFBVSxDQUFDLEVBQUU7WUFDeEIsMkNBQTJDO1lBQzNDLE1BQU0sbUJBQW1CLEdBQ3JCLElBQUksR0FBRyxDQUFTLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLGtCQUFrQixDQUFDLENBQUMsQ0FBQztZQUMvRSxNQUFNLE9BQU8sR0FBOEIsUUFBUSxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUNyRSxNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLFdBQVcsRUFBRSxFQUFFO2dCQUN4RCxNQUFNLFVBQVUsR0FBRyxRQUFRLENBQUMsVUFBVSxDQUFDLENBQUMsV0FBVyxDQUFDLENBQUM7Z0JBQ3JELE1BQU0sSUFBSSxHQUFHLGtCQUFrQixDQUFDLFdBQVcsQ0FBQyxDQUFDO2dCQUU3QyxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsQ0FBQztnQkFFcEQsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLGNBQWMsQ0FBQyxXQUFXLENBQUMsSUFBSSxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUM7Z0JBQzNFLElBQUksTUFBTSxFQUFFO29CQUNWLDZFQUE2RTtvQkFDN0UseUVBQXlFO29CQUN6RSxhQUFhO29CQUNiLE1BQU0sY0FBYyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsTUFBTSxFQUFFLFFBQVEsQ0FBQyxDQUFDO29CQUM1RCxJQUFJLENBQUMsY0FBYyxFQUFFO3dCQUNuQixJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksS0FBSyxDQUFDLHdDQUF3QyxNQUFNLFNBQ3JFLElBQUksQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO3FCQUMzQzt5QkFBTTt3QkFDTCxJQUFJLENBQUMsbUJBQW1CLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxjQUFjLENBQUMsQ0FBQztxQkFDdEQ7aUJBQ0Y7Z0JBQ0QsZUFBZSxDQUFDLElBQUksQ0FDaEIsSUFBSSxDQUFDLG9CQUFvQixDQUFDLE1BQU0sRUFBRSxRQUFRLEVBQUUsbUJBQW1CLEVBQUUsVUFBVSxDQUFDLENBQUMsQ0FBQztZQUNwRixDQUFDLENBQUMsQ0FBQztTQUNKO1FBQ0QsTUFBTSxhQUFhLEdBQUcsSUFBSSxHQUFHLEVBQWdCLENBQUM7UUFDOUMsS0FBSyxNQUFNLGNBQWMsSUFBSSxlQUFlLEVBQUU7WUFDNUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDLE1BQU0sRUFBRSxjQUFjLENBQUMsQ0FBQztZQUNoRSxhQUFhLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUMsQ0FBQztTQUMxQztRQUNELElBQUksQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxLQUFLLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUM7SUFDL0QsQ0FBQztJQUVPLG9CQUFvQixDQUN4QixZQUEwQixFQUFFLFlBQW9CLEVBQUUsbUJBQWdDLEVBQ2xGLFFBQWE7UUFDZiw0REFBNEQ7UUFDNUQsNkNBQTZDO1FBQzdDLHVDQUF1QztRQUN2QyxpREFBaUQ7UUFDakQsbUVBQW1FO1FBQ25FLE1BQU0sUUFBUSxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ2hELElBQUksSUFBSSxDQUFDLGVBQWUsQ0FBQyxhQUFhLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsUUFBUSxJQUFJLFFBQVE7WUFDbEYsUUFBUSxDQUFDLFlBQVksQ0FBQyxLQUFLLE9BQU8sRUFBRTtZQUN0QyxNQUFNLGVBQWUsR0FBRyxFQUFDLFVBQVUsRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLFFBQVEsQ0FBQyxLQUFLLEVBQUMsQ0FBQztZQUNyRSxPQUFPLElBQUksb0JBQW9CLENBQUMsWUFBWSxFQUFFLGVBQWUsQ0FBQyxDQUFDO1NBQ2hFO1FBRUQsSUFBSSxpQkFBbUMsQ0FBQztRQUN4QyxNQUFNLGVBQWUsR0FBaUIsR0FBRyxFQUFFO1lBQ3pDLElBQUksQ0FBQyxpQkFBaUIsRUFBRTtnQkFDdEIseUZBQXlGO2dCQUN6Riw0RkFBNEY7Z0JBQzVGLHVGQUF1RjtnQkFDdkYsdURBQXVEO2dCQUN2RCxpQkFBaUI7b0JBQ2IsSUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxzQkFBc0IsRUFBRSxLQUFLLENBQUM7eUJBQzlDLE9BQU8sQ0FBQyxzQkFBc0IsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO2FBQ3ZFO1lBQ0QsT0FBTyxpQkFBaUIsQ0FBQztRQUMzQixDQUFDLENBQUM7UUFFRixNQUFNLElBQUksR0FBRyxJQUFJLENBQUM7UUFFbEIsTUFBTSxvQkFBcUIsU0FBUSxnQkFBZ0I7WUFDakQsY0FBYyxDQUFDLEdBQXlCLEVBQUUsY0FBd0I7Z0JBQ2hFLE1BQU0sUUFBUSxHQUFHLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztnQkFDbkMsSUFBSSxRQUFRLEtBQUssVUFBVSxFQUFFO29CQUMzQixNQUFNLE1BQU0sR0FBRyxjQUFjLENBQUMsTUFBTSxDQUFDO29CQUNyQyxjQUFjLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQztvQkFDbEQsTUFBTSxNQUFNLEdBQUcsS0FBSyxDQUFDLGNBQWMsQ0FBQyxHQUFHLEVBQUUsY0FBYyxDQUFDLENBQUM7b0JBQ3pELGNBQWMsQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO29CQUMvQixPQUFPLE1BQU0sQ0FBQztpQkFDZjtxQkFBTSxJQUFJLFFBQVEsS0FBSyxXQUFXLEVBQUU7b0JBQ25DLE1BQU0sTUFBTSxHQUFHLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQztvQkFDN0IsTUFBTSxJQUFJLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxrQkFBa0IsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO29CQUN6RSxJQUFJLENBQUMsSUFBSSxFQUFFO3dCQUNULE9BQU8sSUFBSSxDQUFDO3FCQUNiO29CQUNELElBQUksUUFBZ0IsQ0FBQztvQkFDckIsSUFBSSxNQUFNLEVBQUU7d0JBQ1YsUUFBUSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsTUFBTSxFQUFFLFlBQVksQ0FBQyxRQUFRLENBQUcsQ0FBQzt3QkFDL0QsSUFBSSxDQUFDLFFBQVEsRUFBRTs0QkFDYixPQUFPO2dDQUNMLFVBQVUsRUFBRSxPQUFPO2dDQUNuQixPQUFPLEVBQUUscUJBQXFCLE1BQU0sZ0JBQ2hDLElBQUksQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUMsR0FBRztnQ0FDdEQsSUFBSSxFQUFFLEdBQUcsQ0FBQyxNQUFNLENBQUM7Z0NBQ2pCLFNBQVMsRUFBRSxHQUFHLENBQUMsV0FBVyxDQUFDO2dDQUMzQixRQUFRLEVBQUUsZUFBZSxFQUFFOzZCQUM1QixDQUFDO3lCQUNIO3dCQUNELE9BQU87NEJBQ0wsVUFBVSxFQUFFLFVBQVU7NEJBQ3RCLE1BQU0sRUFBRSxJQUFJLENBQUMsZUFBZSxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUM7NEJBQzVDLElBQUksRUFBRSxHQUFHLENBQUMsTUFBTSxDQUFDOzRCQUNqQixTQUFTLEVBQUUsR0FBRyxDQUFDLFdBQVcsQ0FBQzs0QkFDM0IsUUFBUSxFQUFFLGVBQWUsRUFBRTt5QkFDNUIsQ0FBQztxQkFDSDt5QkFBTSxJQUFJLGNBQWMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFO3dCQUM1QyxvQ0FBb0M7d0JBQ3BDLE9BQU8sRUFBQyxVQUFVLEVBQUUsV0FBVyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUMsQ0FBQztxQkFDOUM7eUJBQU07d0JBQ0wsSUFBSSxtQkFBbUIsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUU7NEJBQ2pDLE9BQU8sSUFBSSxDQUFDLGVBQWUsQ0FBQyxZQUFZLEVBQUUsSUFBSSxDQUFDLENBQUM7eUJBQ2pEO3dCQUNELGdCQUFnQjt3QkFDaEIsSUFBSSxDQUFDO3FCQUNOO2lCQUNGO3FCQUFNLElBQUksUUFBUSxLQUFLLE9BQU8sRUFBRTtvQkFDL0IsdUNBQVcsR0FBRyxLQUFFLFFBQVEsRUFBRSxlQUFlLEVBQUUsSUFBRTtpQkFDOUM7cUJBQU07b0JBQ0wsT0FBTyxLQUFLLENBQUMsY0FBYyxDQUFDLEdBQUcsRUFBRSxjQUFjLENBQUMsQ0FBQztpQkFDbEQ7WUFDSCxDQUFDO1NBQ0Y7UUFDRCxNQUFNLGVBQWUsR0FBRyxVQUFVLENBQUMsUUFBUSxFQUFFLElBQUksb0JBQW9CLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUM3RSxJQUFJLHdCQUF3QixHQUFHLHNCQUFzQixDQUFDLGVBQWUsQ0FBQyxDQUFDO1FBQ3ZFLElBQUksd0JBQXdCLFlBQVksWUFBWSxFQUFFO1lBQ3BELE9BQU8sSUFBSSxDQUFDLFlBQVksQ0FBQyxZQUFZLEVBQUUsd0JBQXdCLENBQUMsQ0FBQztTQUNsRTtRQUNELE9BQU8sSUFBSSxvQkFBb0IsQ0FBQyxZQUFZLEVBQUUsZUFBZSxDQUFDLENBQUM7SUFDakUsQ0FBQztJQUVPLFlBQVksQ0FBQyxZQUEwQixFQUFFLFlBQTBCO1FBRXpFLFlBQVksQ0FBQyxlQUFlLEVBQUUsQ0FBQztRQUMvQixZQUFZLENBQUMsZUFBZSxFQUFFLENBQUM7UUFDL0IsSUFBSSxJQUFJLENBQUMsZUFBZSxDQUFDLGFBQWEsQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDO1lBQ3pELElBQUksQ0FBQyxlQUFlLENBQUMsYUFBYSxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUMsRUFBRTtZQUM3RCwyRUFBMkU7WUFDM0UsZ0JBQWdCO1lBQ2hCLHNFQUFzRTtZQUN0RSxxQ0FBcUM7WUFDckMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsWUFBWSxFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsWUFBWSxDQUFDLElBQUksWUFBWSxDQUFDLENBQUM7U0FDakY7UUFDRCxPQUFPLElBQUksb0JBQW9CLENBQUMsWUFBWSxFQUFFLFlBQVksQ0FBQyxDQUFDO0lBQzlELENBQUM7SUFFTyxXQUFXLENBQUMsS0FBWSxFQUFFLE9BQXNCLEVBQUUsSUFBYTtRQUNyRSxJQUFJLElBQUksQ0FBQyxhQUFhLEVBQUU7WUFDdEIsSUFBSSxDQUFDLGFBQWEsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxPQUFPLElBQUksT0FBTyxDQUFDLFFBQVEsQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDO1NBQ2xFO2FBQU07WUFDTCxNQUFNLEtBQUssQ0FBQztTQUNiO0lBQ0gsQ0FBQztJQUVEOztPQUVHO0lBQ0ssaUJBQWlCLENBQUMsTUFBYztRQUN0QyxJQUFJLGNBQWMsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNwRCxJQUFJLENBQUMsY0FBYyxFQUFFO1lBQ25CLE1BQU0sZUFBZSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ3pELElBQUksZUFBZSxFQUFFO2dCQUNuQixJQUFJLFVBQVUsR0FBRyxDQUFDLENBQUMsQ0FBQztnQkFDcEIsZUFBZSxDQUFDLE9BQU8sQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFO29CQUM3QixJQUFJLEVBQUUsSUFBSSxFQUFFLENBQUMsU0FBUyxDQUFDLEdBQUcsVUFBVSxFQUFFO3dCQUNwQyxVQUFVLEdBQUcsRUFBRSxDQUFDLFNBQVMsQ0FBQyxDQUFDO3dCQUMzQixjQUFjLEdBQUcsRUFBRSxDQUFDO3FCQUNyQjtnQkFDSCxDQUFDLENBQUMsQ0FBQzthQUNKO1lBQ0QsSUFBSSxDQUFDLGNBQWMsRUFBRTtnQkFDbkIsY0FBYztvQkFDVixFQUFDLFVBQVUsRUFBRSxRQUFRLEVBQUUsT0FBTyxFQUFFLHdCQUF3QixFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLEVBQUUsRUFBQyxDQUFDO2FBQzdGO1lBQ0QsSUFBSSxjQUFjLENBQUMsU0FBUyxDQUFDLElBQUksd0JBQXdCLEVBQUU7Z0JBQ3pELE1BQU0sWUFBWSxHQUFHLGNBQWMsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztvQkFDakQsZ0NBQWdDLGNBQWMsQ0FBQyxTQUFTLENBQUMsZUFDckQsTUFBTSw4REFBOEQsQ0FBQyxDQUFDO29CQUMxRSx3Q0FDSSxJQUFJLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsbUJBQy9CLGNBQWMsQ0FBQyxTQUFTLENBQUMsY0FBYyx3QkFBd0IsRUFBRSxDQUFDO2dCQUMxRSxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksS0FBSyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUM7YUFDM0M7WUFDRCxJQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsY0FBYyxDQUFDLENBQUM7U0FDaEQ7UUFDRCxPQUFPLGNBQWMsQ0FBQztJQUN4QixDQUFDO0lBR0QsaUJBQWlCLENBQUMsTUFBYyxFQUFFLFVBQWtCLEVBQUUsY0FBdUI7UUFDM0UsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNLEVBQUUsY0FBYyxDQUFDLENBQUM7UUFDNUQsSUFBSSxDQUFDLFFBQVEsRUFBRTtZQUNiLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxLQUFLLENBQUMsNEJBQTRCLE1BQU0sR0FDekQsY0FBYyxDQUFDLENBQUMsQ0FBQyxlQUFlLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUN4RixPQUFPLElBQUksQ0FBQyxlQUFlLENBQUMsU0FBUyxNQUFNLEVBQUUsRUFBRSxVQUFVLENBQUMsQ0FBQztTQUM1RDtRQUNELE9BQU8sSUFBSSxDQUFDLGVBQWUsQ0FBQyxRQUFRLEVBQUUsVUFBVSxDQUFDLENBQUM7SUFDcEQsQ0FBQztJQUVPLGFBQWEsQ0FBQyxNQUFjLEVBQUUsY0FBdUI7UUFDM0QsSUFBSTtZQUNGLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxNQUFNLEVBQUUsY0FBYyxDQUFDLENBQUM7U0FDL0Q7UUFBQyxPQUFPLENBQUMsRUFBRTtZQUNWLE9BQU8sQ0FBQyxLQUFLLENBQUMsNkJBQTZCLE1BQU0sc0JBQXNCLGNBQWMsRUFBRSxDQUFDLENBQUM7WUFDekYsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLEVBQUUsU0FBUyxFQUFFLGNBQWMsQ0FBQyxDQUFDO1NBQ2hEO1FBQ0QsT0FBTyxJQUFJLENBQUM7SUFDZCxDQUFDO0NBQ0Y7QUFFRCxtREFBbUQ7QUFDbkQsb0ZBQW9GO0FBQ3BGLE1BQU0sVUFBVSxrQkFBa0IsQ0FBQyxVQUFrQjtJQUNuRCxPQUFPLFVBQVUsQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQztBQUMxRSxDQUFDO0FBRUQsTUFBTSxVQUFVLHNCQUFzQixDQUFDLFFBQWE7SUFDbEQsSUFBSSxRQUFRLElBQUksUUFBUSxDQUFDLFVBQVUsS0FBSyxVQUFVLEVBQUU7UUFDbEQsT0FBTyxRQUFRLENBQUMsTUFBTSxDQUFDO0tBQ3hCO0lBQ0QsT0FBTyxRQUFRLENBQUM7QUFDbEIsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtTdW1tYXJ5UmVzb2x2ZXJ9IGZyb20gJy4uL3N1bW1hcnlfcmVzb2x2ZXInO1xuaW1wb3J0IHtWYWx1ZVRyYW5zZm9ybWVyLCB2aXNpdFZhbHVlfSBmcm9tICcuLi91dGlsJztcblxuaW1wb3J0IHtTdGF0aWNTeW1ib2wsIFN0YXRpY1N5bWJvbENhY2hlfSBmcm9tICcuL3N0YXRpY19zeW1ib2wnO1xuaW1wb3J0IHtpc0dlbmVyYXRlZEZpbGUsIHN0cmlwU3VtbWFyeUZvckppdEZpbGVTdWZmaXgsIHN0cmlwU3VtbWFyeUZvckppdE5hbWVTdWZmaXgsIHN1bW1hcnlGb3JKaXRGaWxlTmFtZSwgc3VtbWFyeUZvckppdE5hbWV9IGZyb20gJy4vdXRpbCc7XG5cbmNvbnN0IFRTID0gL14oPyEuKlxcLmRcXC50cyQpLipcXC50cyQvO1xuXG5leHBvcnQgY2xhc3MgUmVzb2x2ZWRTdGF0aWNTeW1ib2wge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgc3ltYm9sOiBTdGF0aWNTeW1ib2wsIHB1YmxpYyBtZXRhZGF0YTogYW55KSB7fVxufVxuXG4vKipcbiAqIFRoZSBob3N0IG9mIHRoZSBTeW1ib2xSZXNvbHZlckhvc3QgZGlzY29ubmVjdHMgdGhlIGltcGxlbWVudGF0aW9uIGZyb20gVHlwZVNjcmlwdCAvIG90aGVyXG4gKiBsYW5ndWFnZVxuICogc2VydmljZXMgYW5kIGZyb20gdW5kZXJseWluZyBmaWxlIHN5c3RlbXMuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgU3RhdGljU3ltYm9sUmVzb2x2ZXJIb3N0IHtcbiAgLyoqXG4gICAqIFJldHVybiBhIE1vZHVsZU1ldGFkYXRhIGZvciB0aGUgZ2l2ZW4gbW9kdWxlLlxuICAgKiBBbmd1bGFyIENMSSB3aWxsIHByb2R1Y2UgdGhpcyBtZXRhZGF0YSBmb3IgYSBtb2R1bGUgd2hlbmV2ZXIgYSAuZC50cyBmaWxlcyBpc1xuICAgKiBwcm9kdWNlZCBhbmQgdGhlIG1vZHVsZSBoYXMgZXhwb3J0ZWQgdmFyaWFibGVzIG9yIGNsYXNzZXMgd2l0aCBkZWNvcmF0b3JzLiBNb2R1bGUgbWV0YWRhdGEgY2FuXG4gICAqIGFsc28gYmUgcHJvZHVjZWQgZGlyZWN0bHkgZnJvbSBUeXBlU2NyaXB0IHNvdXJjZXMgYnkgdXNpbmcgTWV0YWRhdGFDb2xsZWN0b3IgaW4gdG9vbHMvbWV0YWRhdGEuXG4gICAqXG4gICAqIEBwYXJhbSBtb2R1bGVQYXRoIGlzIGEgc3RyaW5nIGlkZW50aWZpZXIgZm9yIGEgbW9kdWxlIGFzIGFuIGFic29sdXRlIHBhdGguXG4gICAqIEByZXR1cm5zIHRoZSBtZXRhZGF0YSBmb3IgdGhlIGdpdmVuIG1vZHVsZS5cbiAgICovXG4gIGdldE1ldGFkYXRhRm9yKG1vZHVsZVBhdGg6IHN0cmluZyk6IHtba2V5OiBzdHJpbmddOiBhbnl9W118dW5kZWZpbmVkO1xuXG4gIC8qKlxuICAgKiBDb252ZXJ0cyBhIG1vZHVsZSBuYW1lIHRoYXQgaXMgdXNlZCBpbiBhbiBgaW1wb3J0YCB0byBhIGZpbGUgcGF0aC5cbiAgICogSS5lLlxuICAgKiBgcGF0aC90by9jb250YWluaW5nRmlsZS50c2AgY29udGFpbmluZyBgaW1wb3J0IHsuLi59IGZyb20gJ21vZHVsZS1uYW1lJ2AuXG4gICAqL1xuICBtb2R1bGVOYW1lVG9GaWxlTmFtZShtb2R1bGVOYW1lOiBzdHJpbmcsIGNvbnRhaW5pbmdGaWxlPzogc3RyaW5nKTogc3RyaW5nfG51bGw7XG5cbiAgLyoqXG4gICAqIEdldCBhIGZpbGUgc3VpdGFibGUgZm9yIGRpc3BsYXkgdG8gdGhlIHVzZXIgdGhhdCBzaG91bGQgYmUgcmVsYXRpdmUgdG8gdGhlIHByb2plY3QgZGlyZWN0b3J5XG4gICAqIG9yIHRoZSBjdXJyZW50IGRpcmVjdG9yeS5cbiAgICovXG4gIGdldE91dHB1dE5hbWUoZmlsZVBhdGg6IHN0cmluZyk6IHN0cmluZztcbn1cblxuY29uc3QgU1VQUE9SVEVEX1NDSEVNQV9WRVJTSU9OID0gNDtcblxuLyoqXG4gKiBUaGlzIGNsYXNzIGlzIHJlc3BvbnNpYmxlIGZvciBsb2FkaW5nIG1ldGFkYXRhIHBlciBzeW1ib2wsXG4gKiBhbmQgbm9ybWFsaXppbmcgcmVmZXJlbmNlcyBiZXR3ZWVuIHN5bWJvbHMuXG4gKlxuICogSW50ZXJuYWxseSwgaXQgb25seSB1c2VzIHN5bWJvbHMgd2l0aG91dCBtZW1iZXJzLFxuICogYW5kIGRlZHVjZXMgdGhlIHZhbHVlcyBmb3Igc3ltYm9scyB3aXRoIG1lbWJlcnMgYmFzZWRcbiAqIG9uIHRoZXNlIHN5bWJvbHMuXG4gKi9cbmV4cG9ydCBjbGFzcyBTdGF0aWNTeW1ib2xSZXNvbHZlciB7XG4gIHByaXZhdGUgbWV0YWRhdGFDYWNoZSA9IG5ldyBNYXA8c3RyaW5nLCB7W2tleTogc3RyaW5nXTogYW55fT4oKTtcbiAgLy8gTm90ZTogdGhpcyB3aWxsIG9ubHkgY29udGFpbiBTdGF0aWNTeW1ib2xzIHdpdGhvdXQgbWVtYmVycyFcbiAgcHJpdmF0ZSByZXNvbHZlZFN5bWJvbHMgPSBuZXcgTWFwPFN0YXRpY1N5bWJvbCwgUmVzb2x2ZWRTdGF0aWNTeW1ib2w+KCk7XG4gIC8vIE5vdGU6IHRoaXMgd2lsbCBvbmx5IGNvbnRhaW4gU3RhdGljU3ltYm9scyB3aXRob3V0IG1lbWJlcnMhXG4gIHByaXZhdGUgaW1wb3J0QXMgPSBuZXcgTWFwPFN0YXRpY1N5bWJvbCwgU3RhdGljU3ltYm9sPigpO1xuICBwcml2YXRlIHN5bWJvbFJlc291cmNlUGF0aHMgPSBuZXcgTWFwPFN0YXRpY1N5bWJvbCwgc3RyaW5nPigpO1xuICBwcml2YXRlIHN5bWJvbEZyb21GaWxlID0gbmV3IE1hcDxzdHJpbmcsIFN0YXRpY1N5bWJvbFtdPigpO1xuICBwcml2YXRlIGtub3duRmlsZU5hbWVUb01vZHVsZU5hbWVzID0gbmV3IE1hcDxzdHJpbmcsIHN0cmluZz4oKTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICAgIHByaXZhdGUgaG9zdDogU3RhdGljU3ltYm9sUmVzb2x2ZXJIb3N0LCBwcml2YXRlIHN0YXRpY1N5bWJvbENhY2hlOiBTdGF0aWNTeW1ib2xDYWNoZSxcbiAgICAgIHByaXZhdGUgc3VtbWFyeVJlc29sdmVyOiBTdW1tYXJ5UmVzb2x2ZXI8U3RhdGljU3ltYm9sPixcbiAgICAgIHByaXZhdGUgZXJyb3JSZWNvcmRlcj86IChlcnJvcjogYW55LCBmaWxlTmFtZT86IHN0cmluZykgPT4gdm9pZCkge31cblxuICByZXNvbHZlU3ltYm9sKHN0YXRpY1N5bWJvbDogU3RhdGljU3ltYm9sKTogUmVzb2x2ZWRTdGF0aWNTeW1ib2wge1xuICAgIGlmIChzdGF0aWNTeW1ib2wubWVtYmVycy5sZW5ndGggPiAwKSB7XG4gICAgICByZXR1cm4gdGhpcy5fcmVzb2x2ZVN5bWJvbE1lbWJlcnMoc3RhdGljU3ltYm9sKSAhO1xuICAgIH1cbiAgICAvLyBOb3RlOiBhbHdheXMgYXNrIGZvciBhIHN1bW1hcnkgZmlyc3QsXG4gICAgLy8gYXMgd2UgbWlnaHQgaGF2ZSByZWFkIHNoYWxsb3cgbWV0YWRhdGEgdmlhIGEgLmQudHMgZmlsZVxuICAgIC8vIGZvciB0aGUgc3ltYm9sLlxuICAgIGNvbnN0IHJlc3VsdEZyb21TdW1tYXJ5ID0gdGhpcy5fcmVzb2x2ZVN5bWJvbEZyb21TdW1tYXJ5KHN0YXRpY1N5bWJvbCkgITtcbiAgICBpZiAocmVzdWx0RnJvbVN1bW1hcnkpIHtcbiAgICAgIHJldHVybiByZXN1bHRGcm9tU3VtbWFyeTtcbiAgICB9XG4gICAgY29uc3QgcmVzdWx0RnJvbUNhY2hlID0gdGhpcy5yZXNvbHZlZFN5bWJvbHMuZ2V0KHN0YXRpY1N5bWJvbCk7XG4gICAgaWYgKHJlc3VsdEZyb21DYWNoZSkge1xuICAgICAgcmV0dXJuIHJlc3VsdEZyb21DYWNoZTtcbiAgICB9XG4gICAgLy8gTm90ZTogU29tZSB1c2VycyB1c2UgbGlicmFyaWVzIHRoYXQgd2VyZSBub3QgY29tcGlsZWQgd2l0aCBuZ2MsIGkuZS4gdGhleSBkb24ndFxuICAgIC8vIGhhdmUgc3VtbWFyaWVzLCBvbmx5IC5kLnRzIGZpbGVzLiBTbyB3ZSBhbHdheXMgbmVlZCB0byBjaGVjayBib3RoLCB0aGUgc3VtbWFyeVxuICAgIC8vIGFuZCBtZXRhZGF0YS5cbiAgICB0aGlzLl9jcmVhdGVTeW1ib2xzT2Yoc3RhdGljU3ltYm9sLmZpbGVQYXRoKTtcbiAgICByZXR1cm4gdGhpcy5yZXNvbHZlZFN5bWJvbHMuZ2V0KHN0YXRpY1N5bWJvbCkgITtcbiAgfVxuXG4gIC8qKlxuICAgKiBnZXRJbXBvcnRBcyBwcm9kdWNlcyBhIHN5bWJvbCB0aGF0IGNhbiBiZSB1c2VkIHRvIGltcG9ydCB0aGUgZ2l2ZW4gc3ltYm9sLlxuICAgKiBUaGUgaW1wb3J0IG1pZ2h0IGJlIGRpZmZlcmVudCB0aGFuIHRoZSBzeW1ib2wgaWYgdGhlIHN5bWJvbCBpcyBleHBvcnRlZCBmcm9tXG4gICAqIGEgbGlicmFyeSB3aXRoIGEgc3VtbWFyeTsgaW4gd2hpY2ggY2FzZSB3ZSB3YW50IHRvIGltcG9ydCB0aGUgc3ltYm9sIGZyb20gdGhlXG4gICAqIG5nZmFjdG9yeSByZS1leHBvcnQgaW5zdGVhZCBvZiBkaXJlY3RseSB0byBhdm9pZCBpbnRyb2R1Y2luZyBhIGRpcmVjdCBkZXBlbmRlbmN5XG4gICAqIG9uIGFuIG90aGVyd2lzZSBpbmRpcmVjdCBkZXBlbmRlbmN5LlxuICAgKlxuICAgKiBAcGFyYW0gc3RhdGljU3ltYm9sIHRoZSBzeW1ib2wgZm9yIHdoaWNoIHRvIGdlbmVyYXRlIGEgaW1wb3J0IHN5bWJvbFxuICAgKi9cbiAgZ2V0SW1wb3J0QXMoc3RhdGljU3ltYm9sOiBTdGF0aWNTeW1ib2wsIHVzZVN1bW1hcmllczogYm9vbGVhbiA9IHRydWUpOiBTdGF0aWNTeW1ib2x8bnVsbCB7XG4gICAgaWYgKHN0YXRpY1N5bWJvbC5tZW1iZXJzLmxlbmd0aCkge1xuICAgICAgY29uc3QgYmFzZVN5bWJvbCA9IHRoaXMuZ2V0U3RhdGljU3ltYm9sKHN0YXRpY1N5bWJvbC5maWxlUGF0aCwgc3RhdGljU3ltYm9sLm5hbWUpO1xuICAgICAgY29uc3QgYmFzZUltcG9ydEFzID0gdGhpcy5nZXRJbXBvcnRBcyhiYXNlU3ltYm9sLCB1c2VTdW1tYXJpZXMpO1xuICAgICAgcmV0dXJuIGJhc2VJbXBvcnRBcyA/XG4gICAgICAgICAgdGhpcy5nZXRTdGF0aWNTeW1ib2woYmFzZUltcG9ydEFzLmZpbGVQYXRoLCBiYXNlSW1wb3J0QXMubmFtZSwgc3RhdGljU3ltYm9sLm1lbWJlcnMpIDpcbiAgICAgICAgICBudWxsO1xuICAgIH1cbiAgICBjb25zdCBzdW1tYXJpemVkRmlsZU5hbWUgPSBzdHJpcFN1bW1hcnlGb3JKaXRGaWxlU3VmZml4KHN0YXRpY1N5bWJvbC5maWxlUGF0aCk7XG4gICAgaWYgKHN1bW1hcml6ZWRGaWxlTmFtZSAhPT0gc3RhdGljU3ltYm9sLmZpbGVQYXRoKSB7XG4gICAgICBjb25zdCBzdW1tYXJpemVkTmFtZSA9IHN0cmlwU3VtbWFyeUZvckppdE5hbWVTdWZmaXgoc3RhdGljU3ltYm9sLm5hbWUpO1xuICAgICAgY29uc3QgYmFzZVN5bWJvbCA9XG4gICAgICAgICAgdGhpcy5nZXRTdGF0aWNTeW1ib2woc3VtbWFyaXplZEZpbGVOYW1lLCBzdW1tYXJpemVkTmFtZSwgc3RhdGljU3ltYm9sLm1lbWJlcnMpO1xuICAgICAgY29uc3QgYmFzZUltcG9ydEFzID0gdGhpcy5nZXRJbXBvcnRBcyhiYXNlU3ltYm9sLCB1c2VTdW1tYXJpZXMpO1xuICAgICAgcmV0dXJuIGJhc2VJbXBvcnRBcyA/XG4gICAgICAgICAgdGhpcy5nZXRTdGF0aWNTeW1ib2woXG4gICAgICAgICAgICAgIHN1bW1hcnlGb3JKaXRGaWxlTmFtZShiYXNlSW1wb3J0QXMuZmlsZVBhdGgpLCBzdW1tYXJ5Rm9ySml0TmFtZShiYXNlSW1wb3J0QXMubmFtZSksXG4gICAgICAgICAgICAgIGJhc2VTeW1ib2wubWVtYmVycykgOlxuICAgICAgICAgIG51bGw7XG4gICAgfVxuICAgIGxldCByZXN1bHQgPSAodXNlU3VtbWFyaWVzICYmIHRoaXMuc3VtbWFyeVJlc29sdmVyLmdldEltcG9ydEFzKHN0YXRpY1N5bWJvbCkpIHx8IG51bGw7XG4gICAgaWYgKCFyZXN1bHQpIHtcbiAgICAgIHJlc3VsdCA9IHRoaXMuaW1wb3J0QXMuZ2V0KHN0YXRpY1N5bWJvbCkgITtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIC8qKlxuICAgKiBnZXRSZXNvdXJjZVBhdGggcHJvZHVjZXMgdGhlIHBhdGggdG8gdGhlIG9yaWdpbmFsIGxvY2F0aW9uIG9mIHRoZSBzeW1ib2wgYW5kIHNob3VsZFxuICAgKiBiZSB1c2VkIHRvIGRldGVybWluZSB0aGUgcmVsYXRpdmUgbG9jYXRpb24gb2YgcmVzb3VyY2UgcmVmZXJlbmNlcyByZWNvcmRlZCBpblxuICAgKiBzeW1ib2wgbWV0YWRhdGEuXG4gICAqL1xuICBnZXRSZXNvdXJjZVBhdGgoc3RhdGljU3ltYm9sOiBTdGF0aWNTeW1ib2wpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLnN5bWJvbFJlc291cmNlUGF0aHMuZ2V0KHN0YXRpY1N5bWJvbCkgfHwgc3RhdGljU3ltYm9sLmZpbGVQYXRoO1xuICB9XG5cbiAgLyoqXG4gICAqIGdldFR5cGVBcml0eSByZXR1cm5zIHRoZSBudW1iZXIgb2YgZ2VuZXJpYyB0eXBlIHBhcmFtZXRlcnMgdGhlIGdpdmVuIHN5bWJvbFxuICAgKiBoYXMuIElmIHRoZSBzeW1ib2wgaXMgbm90IGEgdHlwZSB0aGUgcmVzdWx0IGlzIG51bGwuXG4gICAqL1xuICBnZXRUeXBlQXJpdHkoc3RhdGljU3ltYm9sOiBTdGF0aWNTeW1ib2wpOiBudW1iZXJ8bnVsbCB7XG4gICAgLy8gSWYgdGhlIGZpbGUgaXMgYSBmYWN0b3J5L25nc3VtbWFyeSBmaWxlLCBkb24ndCByZXNvbHZlIHRoZSBzeW1ib2wgYXMgZG9pbmcgc28gd291bGRcbiAgICAvLyBjYXVzZSB0aGUgbWV0YWRhdGEgZm9yIGFuIGZhY3RvcnkvbmdzdW1tYXJ5IGZpbGUgdG8gYmUgbG9hZGVkIHdoaWNoIGRvZXNuJ3QgZXhpc3QuXG4gICAgLy8gQWxsIHJlZmVyZW5jZXMgdG8gZ2VuZXJhdGVkIGNsYXNzZXMgbXVzdCBpbmNsdWRlIHRoZSBjb3JyZWN0IGFyaXR5IHdoZW5ldmVyXG4gICAgLy8gZ2VuZXJhdGluZyBjb2RlLlxuICAgIGlmIChpc0dlbmVyYXRlZEZpbGUoc3RhdGljU3ltYm9sLmZpbGVQYXRoKSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGxldCByZXNvbHZlZFN5bWJvbCA9IHVud3JhcFJlc29sdmVkTWV0YWRhdGEodGhpcy5yZXNvbHZlU3ltYm9sKHN0YXRpY1N5bWJvbCkpO1xuICAgIHdoaWxlIChyZXNvbHZlZFN5bWJvbCAmJiByZXNvbHZlZFN5bWJvbC5tZXRhZGF0YSBpbnN0YW5jZW9mIFN0YXRpY1N5bWJvbCkge1xuICAgICAgcmVzb2x2ZWRTeW1ib2wgPSB1bndyYXBSZXNvbHZlZE1ldGFkYXRhKHRoaXMucmVzb2x2ZVN5bWJvbChyZXNvbHZlZFN5bWJvbC5tZXRhZGF0YSkpO1xuICAgIH1cbiAgICByZXR1cm4gKHJlc29sdmVkU3ltYm9sICYmIHJlc29sdmVkU3ltYm9sLm1ldGFkYXRhICYmIHJlc29sdmVkU3ltYm9sLm1ldGFkYXRhLmFyaXR5KSB8fCBudWxsO1xuICB9XG5cbiAgZ2V0S25vd25Nb2R1bGVOYW1lKGZpbGVQYXRoOiBzdHJpbmcpOiBzdHJpbmd8bnVsbCB7XG4gICAgcmV0dXJuIHRoaXMua25vd25GaWxlTmFtZVRvTW9kdWxlTmFtZXMuZ2V0KGZpbGVQYXRoKSB8fCBudWxsO1xuICB9XG5cbiAgcmVjb3JkSW1wb3J0QXMoc291cmNlU3ltYm9sOiBTdGF0aWNTeW1ib2wsIHRhcmdldFN5bWJvbDogU3RhdGljU3ltYm9sKSB7XG4gICAgc291cmNlU3ltYm9sLmFzc2VydE5vTWVtYmVycygpO1xuICAgIHRhcmdldFN5bWJvbC5hc3NlcnROb01lbWJlcnMoKTtcbiAgICB0aGlzLmltcG9ydEFzLnNldChzb3VyY2VTeW1ib2wsIHRhcmdldFN5bWJvbCk7XG4gIH1cblxuICByZWNvcmRNb2R1bGVOYW1lRm9yRmlsZU5hbWUoZmlsZU5hbWU6IHN0cmluZywgbW9kdWxlTmFtZTogc3RyaW5nKSB7XG4gICAgdGhpcy5rbm93bkZpbGVOYW1lVG9Nb2R1bGVOYW1lcy5zZXQoZmlsZU5hbWUsIG1vZHVsZU5hbWUpO1xuICB9XG5cbiAgLyoqXG4gICAqIEludmFsaWRhdGUgYWxsIGluZm9ybWF0aW9uIGRlcml2ZWQgZnJvbSB0aGUgZ2l2ZW4gZmlsZSBhbmQgcmV0dXJuIHRoZVxuICAgKiBzdGF0aWMgc3ltYm9scyBjb250YWluZWQgaW4gdGhlIGZpbGUuXG4gICAqXG4gICAqIEBwYXJhbSBmaWxlTmFtZSB0aGUgZmlsZSB0byBpbnZhbGlkYXRlXG4gICAqL1xuICBpbnZhbGlkYXRlRmlsZShmaWxlTmFtZTogc3RyaW5nKTogU3RhdGljU3ltYm9sW10ge1xuICAgIHRoaXMubWV0YWRhdGFDYWNoZS5kZWxldGUoZmlsZU5hbWUpO1xuICAgIGNvbnN0IHN5bWJvbHMgPSB0aGlzLnN5bWJvbEZyb21GaWxlLmdldChmaWxlTmFtZSk7XG4gICAgaWYgKCFzeW1ib2xzKSB7XG4gICAgICByZXR1cm4gW107XG4gICAgfVxuICAgIHRoaXMuc3ltYm9sRnJvbUZpbGUuZGVsZXRlKGZpbGVOYW1lKTtcbiAgICBmb3IgKGNvbnN0IHN5bWJvbCBvZiBzeW1ib2xzKSB7XG4gICAgICB0aGlzLnJlc29sdmVkU3ltYm9scy5kZWxldGUoc3ltYm9sKTtcbiAgICAgIHRoaXMuaW1wb3J0QXMuZGVsZXRlKHN5bWJvbCk7XG4gICAgICB0aGlzLnN5bWJvbFJlc291cmNlUGF0aHMuZGVsZXRlKHN5bWJvbCk7XG4gICAgfVxuICAgIHJldHVybiBzeW1ib2xzO1xuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBpZ25vcmVFcnJvcnNGb3I8VD4oY2I6ICgpID0+IFQpIHtcbiAgICBjb25zdCByZWNvcmRlciA9IHRoaXMuZXJyb3JSZWNvcmRlcjtcbiAgICB0aGlzLmVycm9yUmVjb3JkZXIgPSAoKSA9PiB7fTtcbiAgICB0cnkge1xuICAgICAgcmV0dXJuIGNiKCk7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHRoaXMuZXJyb3JSZWNvcmRlciA9IHJlY29yZGVyO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX3Jlc29sdmVTeW1ib2xNZW1iZXJzKHN0YXRpY1N5bWJvbDogU3RhdGljU3ltYm9sKTogUmVzb2x2ZWRTdGF0aWNTeW1ib2x8bnVsbCB7XG4gICAgY29uc3QgbWVtYmVycyA9IHN0YXRpY1N5bWJvbC5tZW1iZXJzO1xuICAgIGNvbnN0IGJhc2VSZXNvbHZlZFN5bWJvbCA9XG4gICAgICAgIHRoaXMucmVzb2x2ZVN5bWJvbCh0aGlzLmdldFN0YXRpY1N5bWJvbChzdGF0aWNTeW1ib2wuZmlsZVBhdGgsIHN0YXRpY1N5bWJvbC5uYW1lKSk7XG4gICAgaWYgKCFiYXNlUmVzb2x2ZWRTeW1ib2wpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBsZXQgYmFzZU1ldGFkYXRhID0gdW53cmFwUmVzb2x2ZWRNZXRhZGF0YShiYXNlUmVzb2x2ZWRTeW1ib2wubWV0YWRhdGEpO1xuICAgIGlmIChiYXNlTWV0YWRhdGEgaW5zdGFuY2VvZiBTdGF0aWNTeW1ib2wpIHtcbiAgICAgIHJldHVybiBuZXcgUmVzb2x2ZWRTdGF0aWNTeW1ib2woXG4gICAgICAgICAgc3RhdGljU3ltYm9sLCB0aGlzLmdldFN0YXRpY1N5bWJvbChiYXNlTWV0YWRhdGEuZmlsZVBhdGgsIGJhc2VNZXRhZGF0YS5uYW1lLCBtZW1iZXJzKSk7XG4gICAgfSBlbHNlIGlmIChiYXNlTWV0YWRhdGEgJiYgYmFzZU1ldGFkYXRhLl9fc3ltYm9saWMgPT09ICdjbGFzcycpIHtcbiAgICAgIGlmIChiYXNlTWV0YWRhdGEuc3RhdGljcyAmJiBtZW1iZXJzLmxlbmd0aCA9PT0gMSkge1xuICAgICAgICByZXR1cm4gbmV3IFJlc29sdmVkU3RhdGljU3ltYm9sKHN0YXRpY1N5bWJvbCwgYmFzZU1ldGFkYXRhLnN0YXRpY3NbbWVtYmVyc1swXV0pO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBsZXQgdmFsdWUgPSBiYXNlTWV0YWRhdGE7XG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG1lbWJlcnMubGVuZ3RoICYmIHZhbHVlOyBpKyspIHtcbiAgICAgICAgdmFsdWUgPSB2YWx1ZVttZW1iZXJzW2ldXTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBuZXcgUmVzb2x2ZWRTdGF0aWNTeW1ib2woc3RhdGljU3ltYm9sLCB2YWx1ZSk7XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgcHJpdmF0ZSBfcmVzb2x2ZVN5bWJvbEZyb21TdW1tYXJ5KHN0YXRpY1N5bWJvbDogU3RhdGljU3ltYm9sKTogUmVzb2x2ZWRTdGF0aWNTeW1ib2x8bnVsbCB7XG4gICAgY29uc3Qgc3VtbWFyeSA9IHRoaXMuc3VtbWFyeVJlc29sdmVyLnJlc29sdmVTdW1tYXJ5KHN0YXRpY1N5bWJvbCk7XG4gICAgcmV0dXJuIHN1bW1hcnkgPyBuZXcgUmVzb2x2ZWRTdGF0aWNTeW1ib2woc3RhdGljU3ltYm9sLCBzdW1tYXJ5Lm1ldGFkYXRhKSA6IG51bGw7XG4gIH1cblxuICAvKipcbiAgICogZ2V0U3RhdGljU3ltYm9sIHByb2R1Y2VzIGEgVHlwZSB3aG9zZSBtZXRhZGF0YSBpcyBrbm93biBidXQgd2hvc2UgaW1wbGVtZW50YXRpb24gaXMgbm90IGxvYWRlZC5cbiAgICogQWxsIHR5cGVzIHBhc3NlZCB0byB0aGUgU3RhdGljUmVzb2x2ZXIgc2hvdWxkIGJlIHBzZXVkby10eXBlcyByZXR1cm5lZCBieSB0aGlzIG1ldGhvZC5cbiAgICpcbiAgICogQHBhcmFtIGRlY2xhcmF0aW9uRmlsZSB0aGUgYWJzb2x1dGUgcGF0aCBvZiB0aGUgZmlsZSB3aGVyZSB0aGUgc3ltYm9sIGlzIGRlY2xhcmVkXG4gICAqIEBwYXJhbSBuYW1lIHRoZSBuYW1lIG9mIHRoZSB0eXBlLlxuICAgKiBAcGFyYW0gbWVtYmVycyBhIHN5bWJvbCBmb3IgYSBzdGF0aWMgbWVtYmVyIG9mIHRoZSBuYW1lZCB0eXBlXG4gICAqL1xuICBnZXRTdGF0aWNTeW1ib2woZGVjbGFyYXRpb25GaWxlOiBzdHJpbmcsIG5hbWU6IHN0cmluZywgbWVtYmVycz86IHN0cmluZ1tdKTogU3RhdGljU3ltYm9sIHtcbiAgICByZXR1cm4gdGhpcy5zdGF0aWNTeW1ib2xDYWNoZS5nZXQoZGVjbGFyYXRpb25GaWxlLCBuYW1lLCBtZW1iZXJzKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBoYXNEZWNvcmF0b3JzIGNoZWNrcyBhIGZpbGUncyBtZXRhZGF0YSBmb3IgdGhlIHByZXNlbmNlIG9mIGRlY29yYXRvcnMgd2l0aG91dCBldmFsdWF0aW5nIHRoZVxuICAgKiBtZXRhZGF0YS5cbiAgICpcbiAgICogQHBhcmFtIGZpbGVQYXRoIHRoZSBhYnNvbHV0ZSBwYXRoIHRvIGV4YW1pbmUgZm9yIGRlY29yYXRvcnMuXG4gICAqIEByZXR1cm5zIHRydWUgaWYgYW55IGNsYXNzIGluIHRoZSBmaWxlIGhhcyBhIGRlY29yYXRvci5cbiAgICovXG4gIGhhc0RlY29yYXRvcnMoZmlsZVBhdGg6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIGNvbnN0IG1ldGFkYXRhID0gdGhpcy5nZXRNb2R1bGVNZXRhZGF0YShmaWxlUGF0aCk7XG4gICAgaWYgKG1ldGFkYXRhWydtZXRhZGF0YSddKSB7XG4gICAgICByZXR1cm4gT2JqZWN0LmtleXMobWV0YWRhdGFbJ21ldGFkYXRhJ10pLnNvbWUoKG1ldGFkYXRhS2V5KSA9PiB7XG4gICAgICAgIGNvbnN0IGVudHJ5ID0gbWV0YWRhdGFbJ21ldGFkYXRhJ11bbWV0YWRhdGFLZXldO1xuICAgICAgICByZXR1cm4gZW50cnkgJiYgZW50cnkuX19zeW1ib2xpYyA9PT0gJ2NsYXNzJyAmJiBlbnRyeS5kZWNvcmF0b3JzO1xuICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGdldFN5bWJvbHNPZihmaWxlUGF0aDogc3RyaW5nKTogU3RhdGljU3ltYm9sW10ge1xuICAgIGNvbnN0IHN1bW1hcnlTeW1ib2xzID0gdGhpcy5zdW1tYXJ5UmVzb2x2ZXIuZ2V0U3ltYm9sc09mKGZpbGVQYXRoKTtcbiAgICBpZiAoc3VtbWFyeVN5bWJvbHMpIHtcbiAgICAgIHJldHVybiBzdW1tYXJ5U3ltYm9scztcbiAgICB9XG4gICAgLy8gTm90ZTogU29tZSB1c2VycyB1c2UgbGlicmFyaWVzIHRoYXQgd2VyZSBub3QgY29tcGlsZWQgd2l0aCBuZ2MsIGkuZS4gdGhleSBkb24ndFxuICAgIC8vIGhhdmUgc3VtbWFyaWVzLCBvbmx5IC5kLnRzIGZpbGVzLCBidXQgYHN1bW1hcnlSZXNvbHZlci5pc0xpYnJhcnlGaWxlYCByZXR1cm5zIHRydWUuXG4gICAgdGhpcy5fY3JlYXRlU3ltYm9sc09mKGZpbGVQYXRoKTtcbiAgICByZXR1cm4gdGhpcy5zeW1ib2xGcm9tRmlsZS5nZXQoZmlsZVBhdGgpIHx8IFtdO1xuICB9XG5cbiAgcHJpdmF0ZSBfY3JlYXRlU3ltYm9sc09mKGZpbGVQYXRoOiBzdHJpbmcpIHtcbiAgICBpZiAodGhpcy5zeW1ib2xGcm9tRmlsZS5oYXMoZmlsZVBhdGgpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IHJlc29sdmVkU3ltYm9sczogUmVzb2x2ZWRTdGF0aWNTeW1ib2xbXSA9IFtdO1xuICAgIGNvbnN0IG1ldGFkYXRhID0gdGhpcy5nZXRNb2R1bGVNZXRhZGF0YShmaWxlUGF0aCk7XG4gICAgaWYgKG1ldGFkYXRhWydpbXBvcnRBcyddKSB7XG4gICAgICAvLyBJbmRleCBidW5kbGUgaW5kaWNlcyBzaG91bGQgdXNlIHRoZSBpbXBvcnRBcyBtb2R1bGUgbmFtZSBkZWZpbmVkXG4gICAgICAvLyBpbiB0aGUgYnVuZGxlLlxuICAgICAgdGhpcy5rbm93bkZpbGVOYW1lVG9Nb2R1bGVOYW1lcy5zZXQoZmlsZVBhdGgsIG1ldGFkYXRhWydpbXBvcnRBcyddKTtcbiAgICB9XG4gICAgLy8gaGFuZGxlIHRoZSBzeW1ib2xzIGluIG9uZSBvZiB0aGUgcmUtZXhwb3J0IGxvY2F0aW9uXG4gICAgaWYgKG1ldGFkYXRhWydleHBvcnRzJ10pIHtcbiAgICAgIGZvciAoY29uc3QgbW9kdWxlRXhwb3J0IG9mIG1ldGFkYXRhWydleHBvcnRzJ10pIHtcbiAgICAgICAgLy8gaGFuZGxlIHRoZSBzeW1ib2xzIGluIHRoZSBsaXN0IG9mIGV4cGxpY2l0bHkgcmUtZXhwb3J0ZWQgc3ltYm9scy5cbiAgICAgICAgaWYgKG1vZHVsZUV4cG9ydC5leHBvcnQpIHtcbiAgICAgICAgICBtb2R1bGVFeHBvcnQuZXhwb3J0LmZvckVhY2goKGV4cG9ydFN5bWJvbDogYW55KSA9PiB7XG4gICAgICAgICAgICBsZXQgc3ltYm9sTmFtZTogc3RyaW5nO1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBleHBvcnRTeW1ib2wgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICAgIHN5bWJvbE5hbWUgPSBleHBvcnRTeW1ib2w7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBzeW1ib2xOYW1lID0gZXhwb3J0U3ltYm9sLmFzO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc3ltYm9sTmFtZSA9IHVuZXNjYXBlSWRlbnRpZmllcihzeW1ib2xOYW1lKTtcbiAgICAgICAgICAgIGxldCBzeW1OYW1lID0gc3ltYm9sTmFtZTtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgZXhwb3J0U3ltYm9sICE9PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgICBzeW1OYW1lID0gdW5lc2NhcGVJZGVudGlmaWVyKGV4cG9ydFN5bWJvbC5uYW1lKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IHJlc29sdmVkTW9kdWxlID0gdGhpcy5yZXNvbHZlTW9kdWxlKG1vZHVsZUV4cG9ydC5mcm9tLCBmaWxlUGF0aCk7XG4gICAgICAgICAgICBpZiAocmVzb2x2ZWRNb2R1bGUpIHtcbiAgICAgICAgICAgICAgY29uc3QgdGFyZ2V0U3ltYm9sID0gdGhpcy5nZXRTdGF0aWNTeW1ib2wocmVzb2x2ZWRNb2R1bGUsIHN5bU5hbWUpO1xuICAgICAgICAgICAgICBjb25zdCBzb3VyY2VTeW1ib2wgPSB0aGlzLmdldFN0YXRpY1N5bWJvbChmaWxlUGF0aCwgc3ltYm9sTmFtZSk7XG4gICAgICAgICAgICAgIHJlc29sdmVkU3ltYm9scy5wdXNoKHRoaXMuY3JlYXRlRXhwb3J0KHNvdXJjZVN5bWJvbCwgdGFyZ2V0U3ltYm9sKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gSGFuZGxlIHRoZSBzeW1ib2xzIGxvYWRlZCBieSAnZXhwb3J0IConIGRpcmVjdGl2ZXMuXG4gICAgICAgICAgY29uc3QgcmVzb2x2ZWRNb2R1bGUgPSB0aGlzLnJlc29sdmVNb2R1bGUobW9kdWxlRXhwb3J0LmZyb20sIGZpbGVQYXRoKTtcbiAgICAgICAgICBpZiAocmVzb2x2ZWRNb2R1bGUgJiYgcmVzb2x2ZWRNb2R1bGUgIT09IGZpbGVQYXRoKSB7XG4gICAgICAgICAgICBjb25zdCBuZXN0ZWRFeHBvcnRzID0gdGhpcy5nZXRTeW1ib2xzT2YocmVzb2x2ZWRNb2R1bGUpO1xuICAgICAgICAgICAgbmVzdGVkRXhwb3J0cy5mb3JFYWNoKCh0YXJnZXRTeW1ib2wpID0+IHtcbiAgICAgICAgICAgICAgY29uc3Qgc291cmNlU3ltYm9sID0gdGhpcy5nZXRTdGF0aWNTeW1ib2woZmlsZVBhdGgsIHRhcmdldFN5bWJvbC5uYW1lKTtcbiAgICAgICAgICAgICAgcmVzb2x2ZWRTeW1ib2xzLnB1c2godGhpcy5jcmVhdGVFeHBvcnQoc291cmNlU3ltYm9sLCB0YXJnZXRTeW1ib2wpKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIC8vIGhhbmRsZSB0aGUgYWN0dWFsIG1ldGFkYXRhLiBIYXMgdG8gYmUgYWZ0ZXIgdGhlIGV4cG9ydHNcbiAgICAvLyBhcyB0aGVyZSBtaWdodCBiZSBjb2xsaXNpb25zIGluIHRoZSBuYW1lcywgYW5kIHdlIHdhbnQgdGhlIHN5bWJvbHNcbiAgICAvLyBvZiB0aGUgY3VycmVudCBtb2R1bGUgdG8gd2luIG9mdGVyIHJlZXhwb3J0cy5cbiAgICBpZiAobWV0YWRhdGFbJ21ldGFkYXRhJ10pIHtcbiAgICAgIC8vIGhhbmRsZSBkaXJlY3QgZGVjbGFyYXRpb25zIG9mIHRoZSBzeW1ib2xcbiAgICAgIGNvbnN0IHRvcExldmVsU3ltYm9sTmFtZXMgPVxuICAgICAgICAgIG5ldyBTZXQ8c3RyaW5nPihPYmplY3Qua2V5cyhtZXRhZGF0YVsnbWV0YWRhdGEnXSkubWFwKHVuZXNjYXBlSWRlbnRpZmllcikpO1xuICAgICAgY29uc3Qgb3JpZ2luczoge1tpbmRleDogc3RyaW5nXTogc3RyaW5nfSA9IG1ldGFkYXRhWydvcmlnaW5zJ10gfHwge307XG4gICAgICBPYmplY3Qua2V5cyhtZXRhZGF0YVsnbWV0YWRhdGEnXSkuZm9yRWFjaCgobWV0YWRhdGFLZXkpID0+IHtcbiAgICAgICAgY29uc3Qgc3ltYm9sTWV0YSA9IG1ldGFkYXRhWydtZXRhZGF0YSddW21ldGFkYXRhS2V5XTtcbiAgICAgICAgY29uc3QgbmFtZSA9IHVuZXNjYXBlSWRlbnRpZmllcihtZXRhZGF0YUtleSk7XG5cbiAgICAgICAgY29uc3Qgc3ltYm9sID0gdGhpcy5nZXRTdGF0aWNTeW1ib2woZmlsZVBhdGgsIG5hbWUpO1xuXG4gICAgICAgIGNvbnN0IG9yaWdpbiA9IG9yaWdpbnMuaGFzT3duUHJvcGVydHkobWV0YWRhdGFLZXkpICYmIG9yaWdpbnNbbWV0YWRhdGFLZXldO1xuICAgICAgICBpZiAob3JpZ2luKSB7XG4gICAgICAgICAgLy8gSWYgdGhlIHN5bWJvbCBpcyBmcm9tIGEgYnVuZGxlZCBpbmRleCwgdXNlIHRoZSBkZWNsYXJhdGlvbiBsb2NhdGlvbiBvZiB0aGVcbiAgICAgICAgICAvLyBzeW1ib2wgc28gcmVsYXRpdmUgcmVmZXJlbmNlcyAoc3VjaCBhcyAnLi9teS5odG1sJykgd2lsbCBiZSBjYWxjdWxhdGVkXG4gICAgICAgICAgLy8gY29ycmVjdGx5LlxuICAgICAgICAgIGNvbnN0IG9yaWdpbkZpbGVQYXRoID0gdGhpcy5yZXNvbHZlTW9kdWxlKG9yaWdpbiwgZmlsZVBhdGgpO1xuICAgICAgICAgIGlmICghb3JpZ2luRmlsZVBhdGgpIHtcbiAgICAgICAgICAgIHRoaXMucmVwb3J0RXJyb3IobmV3IEVycm9yKGBDb3VsZG4ndCByZXNvbHZlIG9yaWdpbmFsIHN5bWJvbCBmb3IgJHtvcmlnaW59IGZyb20gJHtcbiAgICAgICAgICAgICAgICB0aGlzLmhvc3QuZ2V0T3V0cHV0TmFtZShmaWxlUGF0aCl9YCkpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnN5bWJvbFJlc291cmNlUGF0aHMuc2V0KHN5bWJvbCwgb3JpZ2luRmlsZVBhdGgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXNvbHZlZFN5bWJvbHMucHVzaChcbiAgICAgICAgICAgIHRoaXMuY3JlYXRlUmVzb2x2ZWRTeW1ib2woc3ltYm9sLCBmaWxlUGF0aCwgdG9wTGV2ZWxTeW1ib2xOYW1lcywgc3ltYm9sTWV0YSkpO1xuICAgICAgfSk7XG4gICAgfVxuICAgIGNvbnN0IHVuaXF1ZVN5bWJvbHMgPSBuZXcgU2V0PFN0YXRpY1N5bWJvbD4oKTtcbiAgICBmb3IgKGNvbnN0IHJlc29sdmVkU3ltYm9sIG9mIHJlc29sdmVkU3ltYm9scykge1xuICAgICAgdGhpcy5yZXNvbHZlZFN5bWJvbHMuc2V0KHJlc29sdmVkU3ltYm9sLnN5bWJvbCwgcmVzb2x2ZWRTeW1ib2wpO1xuICAgICAgdW5pcXVlU3ltYm9scy5hZGQocmVzb2x2ZWRTeW1ib2wuc3ltYm9sKTtcbiAgICB9XG4gICAgdGhpcy5zeW1ib2xGcm9tRmlsZS5zZXQoZmlsZVBhdGgsIEFycmF5LmZyb20odW5pcXVlU3ltYm9scykpO1xuICB9XG5cbiAgcHJpdmF0ZSBjcmVhdGVSZXNvbHZlZFN5bWJvbChcbiAgICAgIHNvdXJjZVN5bWJvbDogU3RhdGljU3ltYm9sLCB0b3BMZXZlbFBhdGg6IHN0cmluZywgdG9wTGV2ZWxTeW1ib2xOYW1lczogU2V0PHN0cmluZz4sXG4gICAgICBtZXRhZGF0YTogYW55KTogUmVzb2x2ZWRTdGF0aWNTeW1ib2wge1xuICAgIC8vIEZvciBjbGFzc2VzIHRoYXQgZG9uJ3QgaGF2ZSBBbmd1bGFyIHN1bW1hcmllcyAvIG1ldGFkYXRhLFxuICAgIC8vIHdlIG9ubHkga2VlcCB0aGVpciBhcml0eSwgYnV0IG5vdGhpbmcgZWxzZVxuICAgIC8vIChlLmcuIHRoZWlyIGNvbnN0cnVjdG9yIHBhcmFtZXRlcnMpLlxuICAgIC8vIFdlIGRvIHRoaXMgdG8gcHJldmVudCBpbnRyb2R1Y2luZyBkZWVwIGltcG9ydHNcbiAgICAvLyBhcyB3ZSBkaWRuJ3QgZ2VuZXJhdGUgLm5nZmFjdG9yeS50cyBmaWxlcyB3aXRoIHByb3BlciByZWV4cG9ydHMuXG4gICAgY29uc3QgaXNUc0ZpbGUgPSBUUy50ZXN0KHNvdXJjZVN5bWJvbC5maWxlUGF0aCk7XG4gICAgaWYgKHRoaXMuc3VtbWFyeVJlc29sdmVyLmlzTGlicmFyeUZpbGUoc291cmNlU3ltYm9sLmZpbGVQYXRoKSAmJiAhaXNUc0ZpbGUgJiYgbWV0YWRhdGEgJiZcbiAgICAgICAgbWV0YWRhdGFbJ19fc3ltYm9saWMnXSA9PT0gJ2NsYXNzJykge1xuICAgICAgY29uc3QgdHJhbnNmb3JtZWRNZXRhID0ge19fc3ltYm9saWM6ICdjbGFzcycsIGFyaXR5OiBtZXRhZGF0YS5hcml0eX07XG4gICAgICByZXR1cm4gbmV3IFJlc29sdmVkU3RhdGljU3ltYm9sKHNvdXJjZVN5bWJvbCwgdHJhbnNmb3JtZWRNZXRhKTtcbiAgICB9XG5cbiAgICBsZXQgX29yaWdpbmFsRmlsZU1lbW86IHN0cmluZ3x1bmRlZmluZWQ7XG4gICAgY29uc3QgZ2V0T3JpZ2luYWxOYW1lOiAoKSA9PiBzdHJpbmcgPSAoKSA9PiB7XG4gICAgICBpZiAoIV9vcmlnaW5hbEZpbGVNZW1vKSB7XG4gICAgICAgIC8vIEd1ZXNzIHdoYXQgdGhlIG9yaWdpbmFsIGZpbGUgbmFtZSBpcyBmcm9tIHRoZSByZWZlcmVuY2UuIElmIGl0IGhhcyBhIGAuZC50c2AgZXh0ZW5zaW9uXG4gICAgICAgIC8vIHJlcGxhY2UgaXQgd2l0aCBgLnRzYC4gSWYgaXQgYWxyZWFkeSBoYXMgYC50c2AganVzdCBsZWF2ZSBpdCBpbiBwbGFjZS4gSWYgaXQgZG9lc24ndCBoYXZlXG4gICAgICAgIC8vIC50cyBvciAuZC50cywgYXBwZW5kIGAudHMnLiBBbHNvLCBpZiBpdCBpcyBpbiBgbm9kZV9tb2R1bGVzYCwgdHJpbSB0aGUgYG5vZGVfbW9kdWxlYFxuICAgICAgICAvLyBsb2NhdGlvbiBhcyBpdCBpcyBub3QgaW1wb3J0YW50IHRvIGZpbmRpbmcgdGhlIGZpbGUuXG4gICAgICAgIF9vcmlnaW5hbEZpbGVNZW1vID1cbiAgICAgICAgICAgIHRoaXMuaG9zdC5nZXRPdXRwdXROYW1lKHRvcExldmVsUGF0aC5yZXBsYWNlKC8oKFxcLnRzKXwoXFwuZFxcLnRzKXwpJC8sICcudHMnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9eLipub2RlX21vZHVsZXNbL1xcXFxdLywgJycpKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBfb3JpZ2luYWxGaWxlTWVtbztcbiAgICB9O1xuXG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XG5cbiAgICBjbGFzcyBSZWZlcmVuY2VUcmFuc2Zvcm1lciBleHRlbmRzIFZhbHVlVHJhbnNmb3JtZXIge1xuICAgICAgdmlzaXRTdHJpbmdNYXAobWFwOiB7W2tleTogc3RyaW5nXTogYW55fSwgZnVuY3Rpb25QYXJhbXM6IHN0cmluZ1tdKTogYW55IHtcbiAgICAgICAgY29uc3Qgc3ltYm9saWMgPSBtYXBbJ19fc3ltYm9saWMnXTtcbiAgICAgICAgaWYgKHN5bWJvbGljID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgY29uc3Qgb2xkTGVuID0gZnVuY3Rpb25QYXJhbXMubGVuZ3RoO1xuICAgICAgICAgIGZ1bmN0aW9uUGFyYW1zLnB1c2goLi4uKG1hcFsncGFyYW1ldGVycyddIHx8IFtdKSk7XG4gICAgICAgICAgY29uc3QgcmVzdWx0ID0gc3VwZXIudmlzaXRTdHJpbmdNYXAobWFwLCBmdW5jdGlvblBhcmFtcyk7XG4gICAgICAgICAgZnVuY3Rpb25QYXJhbXMubGVuZ3RoID0gb2xkTGVuO1xuICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgIH0gZWxzZSBpZiAoc3ltYm9saWMgPT09ICdyZWZlcmVuY2UnKSB7XG4gICAgICAgICAgY29uc3QgbW9kdWxlID0gbWFwWydtb2R1bGUnXTtcbiAgICAgICAgICBjb25zdCBuYW1lID0gbWFwWyduYW1lJ10gPyB1bmVzY2FwZUlkZW50aWZpZXIobWFwWyduYW1lJ10pIDogbWFwWyduYW1lJ107XG4gICAgICAgICAgaWYgKCFuYW1lKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICB9XG4gICAgICAgICAgbGV0IGZpbGVQYXRoOiBzdHJpbmc7XG4gICAgICAgICAgaWYgKG1vZHVsZSkge1xuICAgICAgICAgICAgZmlsZVBhdGggPSBzZWxmLnJlc29sdmVNb2R1bGUobW9kdWxlLCBzb3VyY2VTeW1ib2wuZmlsZVBhdGgpICE7XG4gICAgICAgICAgICBpZiAoIWZpbGVQYXRoKSB7XG4gICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgX19zeW1ib2xpYzogJ2Vycm9yJyxcbiAgICAgICAgICAgICAgICBtZXNzYWdlOiBgQ291bGQgbm90IHJlc29sdmUgJHttb2R1bGV9IHJlbGF0aXZlIHRvICR7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYuaG9zdC5nZXRNZXRhZGF0YUZvcihzb3VyY2VTeW1ib2wuZmlsZVBhdGgpfS5gLFxuICAgICAgICAgICAgICAgIGxpbmU6IG1hcFsnbGluZSddLFxuICAgICAgICAgICAgICAgIGNoYXJhY3RlcjogbWFwWydjaGFyYWN0ZXInXSxcbiAgICAgICAgICAgICAgICBmaWxlTmFtZTogZ2V0T3JpZ2luYWxOYW1lKClcbiAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgIF9fc3ltYm9saWM6ICdyZXNvbHZlZCcsXG4gICAgICAgICAgICAgIHN5bWJvbDogc2VsZi5nZXRTdGF0aWNTeW1ib2woZmlsZVBhdGgsIG5hbWUpLFxuICAgICAgICAgICAgICBsaW5lOiBtYXBbJ2xpbmUnXSxcbiAgICAgICAgICAgICAgY2hhcmFjdGVyOiBtYXBbJ2NoYXJhY3RlciddLFxuICAgICAgICAgICAgICBmaWxlTmFtZTogZ2V0T3JpZ2luYWxOYW1lKClcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgfSBlbHNlIGlmIChmdW5jdGlvblBhcmFtcy5pbmRleE9mKG5hbWUpID49IDApIHtcbiAgICAgICAgICAgIC8vIHJlZmVyZW5jZSB0byBhIGZ1bmN0aW9uIHBhcmFtZXRlclxuICAgICAgICAgICAgcmV0dXJuIHtfX3N5bWJvbGljOiAncmVmZXJlbmNlJywgbmFtZTogbmFtZX07XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmICh0b3BMZXZlbFN5bWJvbE5hbWVzLmhhcyhuYW1lKSkge1xuICAgICAgICAgICAgICByZXR1cm4gc2VsZi5nZXRTdGF0aWNTeW1ib2wodG9wTGV2ZWxQYXRoLCBuYW1lKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIGFtYmllbnQgdmFsdWVcbiAgICAgICAgICAgIG51bGw7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKHN5bWJvbGljID09PSAnZXJyb3InKSB7XG4gICAgICAgICAgcmV0dXJuIHsuLi5tYXAsIGZpbGVOYW1lOiBnZXRPcmlnaW5hbE5hbWUoKX07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIHN1cGVyLnZpc2l0U3RyaW5nTWFwKG1hcCwgZnVuY3Rpb25QYXJhbXMpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIGNvbnN0IHRyYW5zZm9ybWVkTWV0YSA9IHZpc2l0VmFsdWUobWV0YWRhdGEsIG5ldyBSZWZlcmVuY2VUcmFuc2Zvcm1lcigpLCBbXSk7XG4gICAgbGV0IHVud3JhcHBlZFRyYW5zZm9ybWVkTWV0YSA9IHVud3JhcFJlc29sdmVkTWV0YWRhdGEodHJhbnNmb3JtZWRNZXRhKTtcbiAgICBpZiAodW53cmFwcGVkVHJhbnNmb3JtZWRNZXRhIGluc3RhbmNlb2YgU3RhdGljU3ltYm9sKSB7XG4gICAgICByZXR1cm4gdGhpcy5jcmVhdGVFeHBvcnQoc291cmNlU3ltYm9sLCB1bndyYXBwZWRUcmFuc2Zvcm1lZE1ldGEpO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IFJlc29sdmVkU3RhdGljU3ltYm9sKHNvdXJjZVN5bWJvbCwgdHJhbnNmb3JtZWRNZXRhKTtcbiAgfVxuXG4gIHByaXZhdGUgY3JlYXRlRXhwb3J0KHNvdXJjZVN5bWJvbDogU3RhdGljU3ltYm9sLCB0YXJnZXRTeW1ib2w6IFN0YXRpY1N5bWJvbCk6XG4gICAgICBSZXNvbHZlZFN0YXRpY1N5bWJvbCB7XG4gICAgc291cmNlU3ltYm9sLmFzc2VydE5vTWVtYmVycygpO1xuICAgIHRhcmdldFN5bWJvbC5hc3NlcnROb01lbWJlcnMoKTtcbiAgICBpZiAodGhpcy5zdW1tYXJ5UmVzb2x2ZXIuaXNMaWJyYXJ5RmlsZShzb3VyY2VTeW1ib2wuZmlsZVBhdGgpICYmXG4gICAgICAgIHRoaXMuc3VtbWFyeVJlc29sdmVyLmlzTGlicmFyeUZpbGUodGFyZ2V0U3ltYm9sLmZpbGVQYXRoKSkge1xuICAgICAgLy8gVGhpcyBjYXNlIGlzIGZvciBhbiBuZyBsaWJyYXJ5IGltcG9ydGluZyBzeW1ib2xzIGZyb20gYSBwbGFpbiB0cyBsaWJyYXJ5XG4gICAgICAvLyB0cmFuc2l0aXZlbHkuXG4gICAgICAvLyBOb3RlOiBXZSByZWx5IG9uIHRoZSBmYWN0IHRoYXQgd2UgZGlzY292ZXIgc3ltYm9scyBpbiB0aGUgZGlyZWN0aW9uXG4gICAgICAvLyBmcm9tIHNvdXJjZSBmaWxlcyB0byBsaWJyYXJ5IGZpbGVzXG4gICAgICB0aGlzLmltcG9ydEFzLnNldCh0YXJnZXRTeW1ib2wsIHRoaXMuZ2V0SW1wb3J0QXMoc291cmNlU3ltYm9sKSB8fCBzb3VyY2VTeW1ib2wpO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IFJlc29sdmVkU3RhdGljU3ltYm9sKHNvdXJjZVN5bWJvbCwgdGFyZ2V0U3ltYm9sKTtcbiAgfVxuXG4gIHByaXZhdGUgcmVwb3J0RXJyb3IoZXJyb3I6IEVycm9yLCBjb250ZXh0PzogU3RhdGljU3ltYm9sLCBwYXRoPzogc3RyaW5nKSB7XG4gICAgaWYgKHRoaXMuZXJyb3JSZWNvcmRlcikge1xuICAgICAgdGhpcy5lcnJvclJlY29yZGVyKGVycm9yLCAoY29udGV4dCAmJiBjb250ZXh0LmZpbGVQYXRoKSB8fCBwYXRoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgZXJyb3I7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSBtb2R1bGUgYW4gYWJzb2x1dGUgcGF0aCB0byBhIG1vZHVsZSBmaWxlLlxuICAgKi9cbiAgcHJpdmF0ZSBnZXRNb2R1bGVNZXRhZGF0YShtb2R1bGU6IHN0cmluZyk6IHtba2V5OiBzdHJpbmddOiBhbnl9IHtcbiAgICBsZXQgbW9kdWxlTWV0YWRhdGEgPSB0aGlzLm1ldGFkYXRhQ2FjaGUuZ2V0KG1vZHVsZSk7XG4gICAgaWYgKCFtb2R1bGVNZXRhZGF0YSkge1xuICAgICAgY29uc3QgbW9kdWxlTWV0YWRhdGFzID0gdGhpcy5ob3N0LmdldE1ldGFkYXRhRm9yKG1vZHVsZSk7XG4gICAgICBpZiAobW9kdWxlTWV0YWRhdGFzKSB7XG4gICAgICAgIGxldCBtYXhWZXJzaW9uID0gLTE7XG4gICAgICAgIG1vZHVsZU1ldGFkYXRhcy5mb3JFYWNoKChtZCkgPT4ge1xuICAgICAgICAgIGlmIChtZCAmJiBtZFsndmVyc2lvbiddID4gbWF4VmVyc2lvbikge1xuICAgICAgICAgICAgbWF4VmVyc2lvbiA9IG1kWyd2ZXJzaW9uJ107XG4gICAgICAgICAgICBtb2R1bGVNZXRhZGF0YSA9IG1kO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICBpZiAoIW1vZHVsZU1ldGFkYXRhKSB7XG4gICAgICAgIG1vZHVsZU1ldGFkYXRhID1cbiAgICAgICAgICAgIHtfX3N5bWJvbGljOiAnbW9kdWxlJywgdmVyc2lvbjogU1VQUE9SVEVEX1NDSEVNQV9WRVJTSU9OLCBtb2R1bGU6IG1vZHVsZSwgbWV0YWRhdGE6IHt9fTtcbiAgICAgIH1cbiAgICAgIGlmIChtb2R1bGVNZXRhZGF0YVsndmVyc2lvbiddICE9IFNVUFBPUlRFRF9TQ0hFTUFfVkVSU0lPTikge1xuICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBtb2R1bGVNZXRhZGF0YVsndmVyc2lvbiddID09IDIgP1xuICAgICAgICAgICAgYFVuc3VwcG9ydGVkIG1ldGFkYXRhIHZlcnNpb24gJHttb2R1bGVNZXRhZGF0YVsndmVyc2lvbiddfSBmb3IgbW9kdWxlICR7XG4gICAgICAgICAgICAgICAgbW9kdWxlfS4gVGhpcyBtb2R1bGUgc2hvdWxkIGJlIGNvbXBpbGVkIHdpdGggYSBuZXdlciB2ZXJzaW9uIG9mIG5nY2AgOlxuICAgICAgICAgICAgYE1ldGFkYXRhIHZlcnNpb24gbWlzbWF0Y2ggZm9yIG1vZHVsZSAke1xuICAgICAgICAgICAgICAgIHRoaXMuaG9zdC5nZXRPdXRwdXROYW1lKG1vZHVsZSl9LCBmb3VuZCB2ZXJzaW9uICR7XG4gICAgICAgICAgICAgICAgbW9kdWxlTWV0YWRhdGFbJ3ZlcnNpb24nXX0sIGV4cGVjdGVkICR7U1VQUE9SVEVEX1NDSEVNQV9WRVJTSU9OfWA7XG4gICAgICAgIHRoaXMucmVwb3J0RXJyb3IobmV3IEVycm9yKGVycm9yTWVzc2FnZSkpO1xuICAgICAgfVxuICAgICAgdGhpcy5tZXRhZGF0YUNhY2hlLnNldChtb2R1bGUsIG1vZHVsZU1ldGFkYXRhKTtcbiAgICB9XG4gICAgcmV0dXJuIG1vZHVsZU1ldGFkYXRhO1xuICB9XG5cblxuICBnZXRTeW1ib2xCeU1vZHVsZShtb2R1bGU6IHN0cmluZywgc3ltYm9sTmFtZTogc3RyaW5nLCBjb250YWluaW5nRmlsZT86IHN0cmluZyk6IFN0YXRpY1N5bWJvbCB7XG4gICAgY29uc3QgZmlsZVBhdGggPSB0aGlzLnJlc29sdmVNb2R1bGUobW9kdWxlLCBjb250YWluaW5nRmlsZSk7XG4gICAgaWYgKCFmaWxlUGF0aCkge1xuICAgICAgdGhpcy5yZXBvcnRFcnJvcihuZXcgRXJyb3IoYENvdWxkIG5vdCByZXNvbHZlIG1vZHVsZSAke21vZHVsZX0ke1xuICAgICAgICAgIGNvbnRhaW5pbmdGaWxlID8gJyByZWxhdGl2ZSB0byAnICsgdGhpcy5ob3N0LmdldE91dHB1dE5hbWUoY29udGFpbmluZ0ZpbGUpIDogJyd9YCkpO1xuICAgICAgcmV0dXJuIHRoaXMuZ2V0U3RhdGljU3ltYm9sKGBFUlJPUjoke21vZHVsZX1gLCBzeW1ib2xOYW1lKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuZ2V0U3RhdGljU3ltYm9sKGZpbGVQYXRoLCBzeW1ib2xOYW1lKTtcbiAgfVxuXG4gIHByaXZhdGUgcmVzb2x2ZU1vZHVsZShtb2R1bGU6IHN0cmluZywgY29udGFpbmluZ0ZpbGU/OiBzdHJpbmcpOiBzdHJpbmd8bnVsbCB7XG4gICAgdHJ5IHtcbiAgICAgIHJldHVybiB0aGlzLmhvc3QubW9kdWxlTmFtZVRvRmlsZU5hbWUobW9kdWxlLCBjb250YWluaW5nRmlsZSk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgY29uc29sZS5lcnJvcihgQ291bGQgbm90IHJlc29sdmUgbW9kdWxlICcke21vZHVsZX0nIHJlbGF0aXZlIHRvIGZpbGUgJHtjb250YWluaW5nRmlsZX1gKTtcbiAgICAgIHRoaXMucmVwb3J0RXJyb3IoZSwgdW5kZWZpbmVkLCBjb250YWluaW5nRmlsZSk7XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xuICB9XG59XG5cbi8vIFJlbW92ZSBleHRyYSB1bmRlcnNjb3JlIGZyb20gZXNjYXBlZCBpZGVudGlmaWVyLlxuLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9NaWNyb3NvZnQvVHlwZVNjcmlwdC9ibG9iL21hc3Rlci9zcmMvY29tcGlsZXIvdXRpbGl0aWVzLnRzXG5leHBvcnQgZnVuY3Rpb24gdW5lc2NhcGVJZGVudGlmaWVyKGlkZW50aWZpZXI6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiBpZGVudGlmaWVyLnN0YXJ0c1dpdGgoJ19fXycpID8gaWRlbnRpZmllci5zdWJzdHIoMSkgOiBpZGVudGlmaWVyO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdW53cmFwUmVzb2x2ZWRNZXRhZGF0YShtZXRhZGF0YTogYW55KTogYW55IHtcbiAgaWYgKG1ldGFkYXRhICYmIG1ldGFkYXRhLl9fc3ltYm9saWMgPT09ICdyZXNvbHZlZCcpIHtcbiAgICByZXR1cm4gbWV0YWRhdGEuc3ltYm9sO1xuICB9XG4gIHJldHVybiBtZXRhZGF0YTtcbn1cbiJdfQ==