/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as tslib_1 from "tslib";
import { ConstantPool } from './constant_pool';
import { compileInjectable } from './injectable_compiler_2';
import { DEFAULT_INTERPOLATION_CONFIG, InterpolationConfig } from './ml_parser/interpolation_config';
import { DeclareVarStmt, LiteralExpr, StmtModifier, WrappedNodeExpr } from './output/output_ast';
import { JitEvaluator } from './output/output_jit';
import { r3JitTypeSourceSpan } from './parse_util';
import { R3ResolvedDependencyType } from './render3/r3_factory';
import { R3JitReflector } from './render3/r3_jit';
import { compileInjector, compileNgModule } from './render3/r3_module_compiler';
import { compilePipeFromMetadata } from './render3/r3_pipe_compiler';
import { compileComponentFromMetadata, compileDirectiveFromMetadata, parseHostBindings, verifyHostBindings } from './render3/view/compiler';
import { makeBindingParser, parseTemplate } from './render3/view/template';
import { ResourceLoader } from './resource_loader';
import { DomElementSchemaRegistry } from './schema/dom_element_schema_registry';
var CompilerFacadeImpl = /** @class */ (function () {
    function CompilerFacadeImpl(jitEvaluator) {
        if (jitEvaluator === void 0) { jitEvaluator = new JitEvaluator(); }
        this.jitEvaluator = jitEvaluator;
        this.R3ResolvedDependencyType = R3ResolvedDependencyType;
        this.ResourceLoader = ResourceLoader;
        this.elementSchemaRegistry = new DomElementSchemaRegistry();
    }
    CompilerFacadeImpl.prototype.compilePipe = function (angularCoreEnv, sourceMapUrl, facade) {
        var res = compilePipeFromMetadata({
            name: facade.name,
            type: new WrappedNodeExpr(facade.type),
            typeArgumentCount: facade.typeArgumentCount,
            deps: convertR3DependencyMetadataArray(facade.deps),
            pipeName: facade.pipeName,
            pure: facade.pure,
        });
        return this.jitExpression(res.expression, angularCoreEnv, sourceMapUrl, res.statements);
    };
    CompilerFacadeImpl.prototype.compileInjectable = function (angularCoreEnv, sourceMapUrl, facade) {
        var _a = compileInjectable({
            name: facade.name,
            type: new WrappedNodeExpr(facade.type),
            typeArgumentCount: facade.typeArgumentCount,
            providedIn: computeProvidedIn(facade.providedIn),
            useClass: wrapExpression(facade, USE_CLASS),
            useFactory: wrapExpression(facade, USE_FACTORY),
            useValue: wrapExpression(facade, USE_VALUE),
            useExisting: wrapExpression(facade, USE_EXISTING),
            ctorDeps: convertR3DependencyMetadataArray(facade.ctorDeps),
            userDeps: convertR3DependencyMetadataArray(facade.userDeps) || undefined,
        }), expression = _a.expression, statements = _a.statements;
        return this.jitExpression(expression, angularCoreEnv, sourceMapUrl, statements);
    };
    CompilerFacadeImpl.prototype.compileInjector = function (angularCoreEnv, sourceMapUrl, facade) {
        var meta = {
            name: facade.name,
            type: new WrappedNodeExpr(facade.type),
            deps: convertR3DependencyMetadataArray(facade.deps),
            providers: new WrappedNodeExpr(facade.providers),
            imports: new WrappedNodeExpr(facade.imports),
        };
        var res = compileInjector(meta);
        return this.jitExpression(res.expression, angularCoreEnv, sourceMapUrl, res.statements);
    };
    CompilerFacadeImpl.prototype.compileNgModule = function (angularCoreEnv, sourceMapUrl, facade) {
        var meta = {
            type: new WrappedNodeExpr(facade.type),
            bootstrap: facade.bootstrap.map(wrapReference),
            declarations: facade.declarations.map(wrapReference),
            imports: facade.imports.map(wrapReference),
            exports: facade.exports.map(wrapReference),
            emitInline: true,
            containsForwardDecls: false,
            schemas: facade.schemas ? facade.schemas.map(wrapReference) : null,
        };
        var res = compileNgModule(meta);
        return this.jitExpression(res.expression, angularCoreEnv, sourceMapUrl, []);
    };
    CompilerFacadeImpl.prototype.compileDirective = function (angularCoreEnv, sourceMapUrl, facade) {
        var constantPool = new ConstantPool();
        var bindingParser = makeBindingParser();
        var meta = convertDirectiveFacadeToMetadata(facade);
        var res = compileDirectiveFromMetadata(meta, constantPool, bindingParser);
        var preStatements = tslib_1.__spread(constantPool.statements, res.statements);
        return this.jitExpression(res.expression, angularCoreEnv, sourceMapUrl, preStatements);
    };
    CompilerFacadeImpl.prototype.compileComponent = function (angularCoreEnv, sourceMapUrl, facade) {
        // The ConstantPool is a requirement of the JIT'er.
        var constantPool = new ConstantPool();
        var interpolationConfig = facade.interpolation ?
            InterpolationConfig.fromArray(facade.interpolation) :
            DEFAULT_INTERPOLATION_CONFIG;
        // Parse the template and check for errors.
        var template = parseTemplate(facade.template, sourceMapUrl, { preserveWhitespaces: facade.preserveWhitespaces, interpolationConfig: interpolationConfig });
        if (template.errors !== undefined) {
            var errors = template.errors.map(function (err) { return err.toString(); }).join(', ');
            throw new Error("Errors during JIT compilation of template for " + facade.name + ": " + errors);
        }
        // Compile the component metadata, including template, into an expression.
        // TODO(alxhub): implement inputs, outputs, queries, etc.
        var res = compileComponentFromMetadata(tslib_1.__assign({}, facade, convertDirectiveFacadeToMetadata(facade), { selector: facade.selector || this.elementSchemaRegistry.getDefaultComponentElementName(), template: template, wrapDirectivesAndPipesInClosure: false, styles: facade.styles || [], encapsulation: facade.encapsulation, interpolation: interpolationConfig, changeDetection: facade.changeDetection, animations: facade.animations != null ? new WrappedNodeExpr(facade.animations) : null, viewProviders: facade.viewProviders != null ? new WrappedNodeExpr(facade.viewProviders) :
                null, relativeContextFilePath: '', i18nUseExternalIds: true }), constantPool, makeBindingParser(interpolationConfig));
        var preStatements = tslib_1.__spread(constantPool.statements, res.statements);
        return this.jitExpression(res.expression, angularCoreEnv, "ng:///" + facade.name + ".js", preStatements);
    };
    CompilerFacadeImpl.prototype.createParseSourceSpan = function (kind, typeName, sourceUrl) {
        return r3JitTypeSourceSpan(kind, typeName, sourceUrl);
    };
    /**
     * JIT compiles an expression and returns the result of executing that expression.
     *
     * @param def the definition which will be compiled and executed to get the value to patch
     * @param context an object map of @angular/core symbol names to symbols which will be available
     * in the context of the compiled expression
     * @param sourceUrl a URL to use for the source map of the compiled expression
     * @param preStatements a collection of statements that should be evaluated before the expression.
     */
    CompilerFacadeImpl.prototype.jitExpression = function (def, context, sourceUrl, preStatements) {
        // The ConstantPool may contain Statements which declare variables used in the final expression.
        // Therefore, its statements need to precede the actual JIT operation. The final statement is a
        // declaration of $def which is set to the expression being compiled.
        var statements = tslib_1.__spread(preStatements, [
            new DeclareVarStmt('$def', def, undefined, [StmtModifier.Exported]),
        ]);
        var res = this.jitEvaluator.evaluateStatements(sourceUrl, statements, new R3JitReflector(context), /* enableSourceMaps */ true);
        return res['$def'];
    };
    return CompilerFacadeImpl;
}());
export { CompilerFacadeImpl };
var USE_CLASS = Object.keys({ useClass: null })[0];
var USE_FACTORY = Object.keys({ useFactory: null })[0];
var USE_VALUE = Object.keys({ useValue: null })[0];
var USE_EXISTING = Object.keys({ useExisting: null })[0];
var wrapReference = function (value) {
    var wrapped = new WrappedNodeExpr(value);
    return { value: wrapped, type: wrapped };
};
function convertToR3QueryMetadata(facade) {
    return tslib_1.__assign({}, facade, { predicate: Array.isArray(facade.predicate) ? facade.predicate :
            new WrappedNodeExpr(facade.predicate), read: facade.read ? new WrappedNodeExpr(facade.read) : null, static: facade.static });
}
function convertDirectiveFacadeToMetadata(facade) {
    var inputsFromMetadata = parseInputOutputs(facade.inputs || []);
    var outputsFromMetadata = parseInputOutputs(facade.outputs || []);
    var propMetadata = facade.propMetadata;
    var inputsFromType = {};
    var outputsFromType = {};
    var _loop_1 = function (field) {
        if (propMetadata.hasOwnProperty(field)) {
            propMetadata[field].forEach(function (ann) {
                if (isInput(ann)) {
                    inputsFromType[field] =
                        ann.bindingPropertyName ? [ann.bindingPropertyName, field] : field;
                }
                else if (isOutput(ann)) {
                    outputsFromType[field] = ann.bindingPropertyName || field;
                }
            });
        }
    };
    for (var field in propMetadata) {
        _loop_1(field);
    }
    return tslib_1.__assign({}, facade, { typeSourceSpan: facade.typeSourceSpan, type: new WrappedNodeExpr(facade.type), deps: convertR3DependencyMetadataArray(facade.deps), host: extractHostBindings(facade.host, facade.propMetadata, facade.typeSourceSpan), inputs: tslib_1.__assign({}, inputsFromMetadata, inputsFromType), outputs: tslib_1.__assign({}, outputsFromMetadata, outputsFromType), queries: facade.queries.map(convertToR3QueryMetadata), providers: facade.providers != null ? new WrappedNodeExpr(facade.providers) : null, viewQueries: facade.viewQueries.map(convertToR3QueryMetadata) });
}
function wrapExpression(obj, property) {
    if (obj.hasOwnProperty(property)) {
        return new WrappedNodeExpr(obj[property]);
    }
    else {
        return undefined;
    }
}
function computeProvidedIn(providedIn) {
    if (providedIn == null || typeof providedIn === 'string') {
        return new LiteralExpr(providedIn);
    }
    else {
        return new WrappedNodeExpr(providedIn);
    }
}
function convertR3DependencyMetadata(facade) {
    var tokenExpr;
    if (facade.token === null) {
        tokenExpr = new LiteralExpr(null);
    }
    else if (facade.resolved === R3ResolvedDependencyType.Attribute) {
        tokenExpr = new LiteralExpr(facade.token);
    }
    else {
        tokenExpr = new WrappedNodeExpr(facade.token);
    }
    return {
        token: tokenExpr,
        resolved: facade.resolved,
        host: facade.host,
        optional: facade.optional,
        self: facade.self,
        skipSelf: facade.skipSelf
    };
}
function convertR3DependencyMetadataArray(facades) {
    return facades == null ? null : facades.map(convertR3DependencyMetadata);
}
function extractHostBindings(host, propMetadata, sourceSpan) {
    // First parse the declarations from the metadata.
    var bindings = parseHostBindings(host || {});
    // After that check host bindings for errors
    var errors = verifyHostBindings(bindings, sourceSpan);
    if (errors.length) {
        throw new Error(errors.map(function (error) { return error.msg; }).join('\n'));
    }
    var _loop_2 = function (field) {
        if (propMetadata.hasOwnProperty(field)) {
            propMetadata[field].forEach(function (ann) {
                if (isHostBinding(ann)) {
                    bindings.properties[ann.hostPropertyName || field] = field;
                }
                else if (isHostListener(ann)) {
                    bindings.listeners[ann.eventName || field] = field + "(" + (ann.args || []).join(',') + ")";
                }
            });
        }
    };
    // Next, loop over the properties of the object, looking for @HostBinding and @HostListener.
    for (var field in propMetadata) {
        _loop_2(field);
    }
    return bindings;
}
function isHostBinding(value) {
    return value.ngMetadataName === 'HostBinding';
}
function isHostListener(value) {
    return value.ngMetadataName === 'HostListener';
}
function isInput(value) {
    return value.ngMetadataName === 'Input';
}
function isOutput(value) {
    return value.ngMetadataName === 'Output';
}
function parseInputOutputs(values) {
    return values.reduce(function (map, value) {
        var _a = tslib_1.__read(value.split(',').map(function (piece) { return piece.trim(); }), 2), field = _a[0], property = _a[1];
        map[field] = property || field;
        return map;
    }, {});
}
export function publishFacade(global) {
    var ng = global.ng || (global.ng = {});
    ng.ɵcompilerFacade = new CompilerFacadeImpl();
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaml0X2NvbXBpbGVyX2ZhY2FkZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyL3NyYy9qaXRfY29tcGlsZXJfZmFjYWRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7QUFJSCxPQUFPLEVBQUMsWUFBWSxFQUFDLE1BQU0saUJBQWlCLENBQUM7QUFFN0MsT0FBTyxFQUFDLGlCQUFpQixFQUFDLE1BQU0seUJBQXlCLENBQUM7QUFDMUQsT0FBTyxFQUFDLDRCQUE0QixFQUFFLG1CQUFtQixFQUFDLE1BQU0sa0NBQWtDLENBQUM7QUFDbkcsT0FBTyxFQUFDLGNBQWMsRUFBYyxXQUFXLEVBQWEsWUFBWSxFQUFFLGVBQWUsRUFBQyxNQUFNLHFCQUFxQixDQUFDO0FBQ3RILE9BQU8sRUFBQyxZQUFZLEVBQUMsTUFBTSxxQkFBcUIsQ0FBQztBQUNqRCxPQUFPLEVBQThCLG1CQUFtQixFQUFDLE1BQU0sY0FBYyxDQUFDO0FBQzlFLE9BQU8sRUFBdUIsd0JBQXdCLEVBQUMsTUFBTSxzQkFBc0IsQ0FBQztBQUNwRixPQUFPLEVBQUMsY0FBYyxFQUFDLE1BQU0sa0JBQWtCLENBQUM7QUFDaEQsT0FBTyxFQUF5QyxlQUFlLEVBQUUsZUFBZSxFQUFDLE1BQU0sOEJBQThCLENBQUM7QUFDdEgsT0FBTyxFQUFDLHVCQUF1QixFQUFDLE1BQU0sNEJBQTRCLENBQUM7QUFHbkUsT0FBTyxFQUFxQiw0QkFBNEIsRUFBRSw0QkFBNEIsRUFBRSxpQkFBaUIsRUFBRSxrQkFBa0IsRUFBQyxNQUFNLHlCQUF5QixDQUFDO0FBQzlKLE9BQU8sRUFBQyxpQkFBaUIsRUFBRSxhQUFhLEVBQUMsTUFBTSx5QkFBeUIsQ0FBQztBQUN6RSxPQUFPLEVBQUMsY0FBYyxFQUFDLE1BQU0sbUJBQW1CLENBQUM7QUFDakQsT0FBTyxFQUFDLHdCQUF3QixFQUFDLE1BQU0sc0NBQXNDLENB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Q0FBQyxNQUFXO0lBQ3ZDLElBQU0sRUFBRSxHQUEyQixNQUFNLENBQUMsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQztJQUNqRSxFQUFFLENBQUMsZUFBZSxHQUFHLElBQUksa0JBQWtCLEVBQUUsQ0FBQztBQUNoRCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5cbmltcG9ydCB7Q29tcGlsZXJGYWNhZGUsIENvcmVFbnZpcm9ubWVudCwgRXhwb3J0ZWRDb21waWxlckZhY2FkZSwgUjNDb21wb25lbnRNZXRhZGF0YUZhY2FkZSwgUjNEZXBlbmRlbmN5TWV0YWRhdGFGYWNhZGUsIFIzRGlyZWN0aXZlTWV0YWRhdGFGYWNhZGUsIFIzSW5qZWN0YWJsZU1ldGFkYXRhRmFjYWRlLCBSM0luamVjdG9yTWV0YWRhdGFGYWNhZGUsIFIzTmdNb2R1bGVNZXRhZGF0YUZhY2FkZSwgUjNQaXBlTWV0YWRhdGFGYWNhZGUsIFIzUXVlcnlNZXRhZGF0YUZhY2FkZSwgU3RyaW5nTWFwLCBTdHJpbmdNYXBXaXRoUmVuYW1lfSBmcm9tICcuL2NvbXBpbGVyX2ZhY2FkZV9pbnRlcmZhY2UnO1xuaW1wb3J0IHtDb25zdGFudFBvb2x9IGZyb20gJy4vY29uc3RhbnRfcG9vbCc7XG5pbXBvcnQge0hvc3RCaW5kaW5nLCBIb3N0TGlzdGVuZXIsIElucHV0LCBPdXRwdXQsIFR5cGV9IGZyb20gJy4vY29yZSc7XG5pbXBvcnQge2NvbXBpbGVJbmplY3RhYmxlfSBmcm9tICcuL2luamVjdGFibGVfY29tcGlsZXJfMic7XG5pbXBvcnQge0RFRkFVTFRfSU5URVJQT0xBVElPTl9DT05GSUcsIEludGVycG9sYXRpb25Db25maWd9IGZyb20gJy4vbWxfcGFyc2VyL2ludGVycG9sYXRpb25fY29uZmlnJztcbmltcG9ydCB7RGVjbGFyZVZhclN0bXQsIEV4cHJlc3Npb24sIExpdGVyYWxFeHByLCBTdGF0ZW1lbnQsIFN0bXRNb2RpZmllciwgV3JhcHBlZE5vZGVFeHByfSBmcm9tICcuL291dHB1dC9vdXRwdXRfYXN0JztcbmltcG9ydCB7Sml0RXZhbHVhdG9yfSBmcm9tICcuL291dHB1dC9vdXRwdXRfaml0JztcbmltcG9ydCB7UGFyc2VFcnJvciwgUGFyc2VTb3VyY2VTcGFuLCByM0ppdFR5cGVTb3VyY2VTcGFufSBmcm9tICcuL3BhcnNlX3V0aWwnO1xuaW1wb3J0IHtSM0RlcGVuZGVuY3lNZXRhZGF0YSwgUjNSZXNvbHZlZERlcGVuZGVuY3lUeXBlfSBmcm9tICcuL3JlbmRlcjMvcjNfZmFjdG9yeSc7XG5pbXBvcnQge1IzSml0UmVmbGVjdG9yfSBmcm9tICcuL3JlbmRlcjMvcjNfaml0JztcbmltcG9ydCB7UjNJbmplY3Rvck1ldGFkYXRhLCBSM05nTW9kdWxlTWV0YWRhdGEsIGNvbXBpbGVJbmplY3RvciwgY29tcGlsZU5nTW9kdWxlfSBmcm9tICcuL3JlbmRlcjMvcjNfbW9kdWxlX2NvbXBpbGVyJztcbmltcG9ydCB7Y29tcGlsZVBpcGVGcm9tTWV0YWRhdGF9IGZyb20gJy4vcmVuZGVyMy9yM19waXBlX2NvbXBpbGVyJztcbmltcG9ydCB7UjNSZWZlcmVuY2V9IGZyb20gJy4vcmVuZGVyMy91dGlsJztcbmltcG9ydCB7UjNEaXJlY3RpdmVNZXRhZGF0YSwgUjNRdWVyeU1ldGFkYXRhfSBmcm9tICcuL3JlbmRlcjMvdmlldy9hcGknO1xuaW1wb3J0IHtQYXJzZWRIb3N0QmluZGluZ3MsIGNvbXBpbGVDb21wb25lbnRGcm9tTWV0YWRhdGEsIGNvbXBpbGVEaXJlY3RpdmVGcm9tTWV0YWRhdGEsIHBhcnNlSG9zdEJpbmRpbmdzLCB2ZXJpZnlIb3N0QmluZGluZ3N9IGZyb20gJy4vcmVuZGVyMy92aWV3L2NvbXBpbGVyJztcbmltcG9ydCB7bWFrZUJpbmRpbmdQYXJzZXIsIHBhcnNlVGVtcGxhdGV9IGZyb20gJy4vcmVuZGVyMy92aWV3L3RlbXBsYXRlJztcbmltcG9ydCB7UmVzb3VyY2VMb2FkZXJ9IGZyb20gJy4vcmVzb3VyY2VfbG9hZGVyJztcbmltcG9ydCB7RG9tRWxlbWVudFNjaGVtYVJlZ2lzdHJ5fSBmcm9tICcuL3NjaGVtYS9kb21fZWxlbWVudF9zY2hlbWFfcmVnaXN0cnknO1xuXG5leHBvcnQgY2xhc3MgQ29tcGlsZXJGYWNhZGVJbXBsIGltcGxlbWVudHMgQ29tcGlsZXJGYWNhZGUge1xuICBSM1Jlc29sdmVkRGVwZW5kZW5jeVR5cGUgPSBSM1Jlc29sdmVkRGVwZW5kZW5jeVR5cGUgYXMgYW55O1xuICBSZXNvdXJjZUxvYWRlciA9IFJlc291cmNlTG9hZGVyO1xuICBwcml2YXRlIGVsZW1lbnRTY2hlbWFSZWdpc3RyeSA9IG5ldyBEb21FbGVtZW50U2NoZW1hUmVnaXN0cnkoKTtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIGppdEV2YWx1YXRvciA9IG5ldyBKaXRFdmFsdWF0b3IoKSkge31cblxuICBjb21waWxlUGlwZShhbmd1bGFyQ29yZUVudjogQ29yZUVudmlyb25tZW50LCBzb3VyY2VNYXBVcmw6IHN0cmluZywgZmFjYWRlOiBSM1BpcGVNZXRhZGF0YUZhY2FkZSk6XG4gICAgICBhbnkge1xuICAgIGNvbnN0IHJlcyA9IGNvbXBpbGVQaXBlRnJvbU1ldGFkYXRhKHtcbiAgICAgIG5hbWU6IGZhY2FkZS5uYW1lLFxuICAgICAgdHlwZTogbmV3IFdyYXBwZWROb2RlRXhwcihmYWNhZGUudHlwZSksXG4gICAgICB0eXBlQXJndW1lbnRDb3VudDogZmFjYWRlLnR5cGVBcmd1bWVudENvdW50LFxuICAgICAgZGVwczogY29udmVydFIzRGVwZW5kZW5jeU1ldGFkYXRhQXJyYXkoZmFjYWRlLmRlcHMpLFxuICAgICAgcGlwZU5hbWU6IGZhY2FkZS5waXBlTmFtZSxcbiAgICAgIHB1cmU6IGZhY2FkZS5wdXJlLFxuICAgIH0pO1xuICAgIHJldHVybiB0aGlzLmppdEV4cHJlc3Npb24ocmVzLmV4cHJlc3Npb24sIGFuZ3VsYXJDb3JlRW52LCBzb3VyY2VNYXBVcmwsIHJlcy5zdGF0ZW1lbnRzKTtcbiAgfVxuXG4gIGNvbXBpbGVJbmplY3RhYmxlKFxuICAgICAgYW5ndWxhckNvcmVFbnY6IENvcmVFbnZpcm9ubWVudCwgc291cmNlTWFwVXJsOiBzdHJpbmcsXG4gICAgICBmYWNhZGU6IFIzSW5qZWN0YWJsZU1ldGFkYXRhRmFjYWRlKTogYW55IHtcbiAgICBjb25zdCB7ZXhwcmVzc2lvbiwgc3RhdGVtZW50c30gPSBjb21waWxlSW5qZWN0YWJsZSh7XG4gICAgICBuYW1lOiBmYWNhZGUubmFtZSxcbiAgICAgIHR5cGU6IG5ldyBXcmFwcGVkTm9kZUV4cHIoZmFjYWRlLnR5cGUpLFxuICAgICAgdHlwZUFyZ3VtZW50Q291bnQ6IGZhY2FkZS50eXBlQXJndW1lbnRDb3VudCxcbiAgICAgIHByb3ZpZGVkSW46IGNvbXB1dGVQcm92aWRlZEluKGZhY2FkZS5wcm92aWRlZEluKSxcbiAgICAgIHVzZUNsYXNzOiB3cmFwRXhwcmVzc2lvbihmYWNhZGUsIFVTRV9DTEFTUyksXG4gICAgICB1c2VGYWN0b3J5OiB3cmFwRXhwcmVzc2lvbihmYWNhZGUsIFVTRV9GQUNUT1JZKSxcbiAgICAgIHVzZVZhbHVlOiB3cmFwRXhwcmVzc2lvbihmYWNhZGUsIFVTRV9WQUxVRSksXG4gICAgICB1c2VFeGlzdGluZzogd3JhcEV4cHJlc3Npb24oZmFjYWRlLCBVU0VfRVhJU1RJTkcpLFxuICAgICAgY3RvckRlcHM6IGNvbnZlcnRSM0RlcGVuZGVuY3lNZXRhZGF0YUFycmF5KGZhY2FkZS5jdG9yRGVwcyksXG4gICAgICB1c2VyRGVwczogY29udmVydFIzRGVwZW5kZW5jeU1ldGFkYXRhQXJyYXkoZmFjYWRlLnVzZXJEZXBzKSB8fCB1bmRlZmluZWQsXG4gICAgfSk7XG5cbiAgICByZXR1cm4gdGhpcy5qaXRFeHByZXNzaW9uKGV4cHJlc3Npb24sIGFuZ3VsYXJDb3JlRW52LCBzb3VyY2VNYXBVcmwsIHN0YXRlbWVudHMpO1xuICB9XG5cbiAgY29tcGlsZUluamVjdG9yKFxuICAgICAgYW5ndWxhckNvcmVFbnY6IENvcmVFbnZpcm9ubWVudCwgc291cmNlTWFwVXJsOiBzdHJpbmcsXG4gICAgICBmYWNhZGU6IFIzSW5qZWN0b3JNZXRhZGF0YUZhY2FkZSk6IGFueSB7XG4gICAgY29uc3QgbWV0YTogUjNJbmplY3Rvck1ldGFkYXRhID0ge1xuICAgICAgbmFtZTogZmFjYWRlLm5hbWUsXG4gICAgICB0eXBlOiBuZXcgV3JhcHBlZE5vZGVFeHByKGZhY2FkZS50eXBlKSxcbiAgICAgIGRlcHM6IGNvbnZlcnRSM0RlcGVuZGVuY3lNZXRhZGF0YUFycmF5KGZhY2FkZS5kZXBzKSxcbiAgICAgIHByb3ZpZGVyczogbmV3IFdyYXBwZWROb2RlRXhwcihmYWNhZGUucHJvdmlkZXJzKSxcbiAgICAgIGltcG9ydHM6IG5ldyBXcmFwcGVkTm9kZUV4cHIoZmFjYWRlLmltcG9ydHMpLFxuICAgIH07XG4gICAgY29uc3QgcmVzID0gY29tcGlsZUluamVjdG9yKG1ldGEpO1xuICAgIHJldHVybiB0aGlzLmppdEV4cHJlc3Npb24ocmVzLmV4cHJlc3Npb24sIGFuZ3VsYXJDb3JlRW52LCBzb3VyY2VNYXBVcmwsIHJlcy5zdGF0ZW1lbnRzKTtcbiAgfVxuXG4gIGNvbXBpbGVOZ01vZHVsZShcbiAgICAgIGFuZ3VsYXJDb3JlRW52OiBDb3JlRW52aXJvbm1lbnQsIHNvdXJjZU1hcFVybDogc3RyaW5nLFxuICAgICAgZmFjYWRlOiBSM05nTW9kdWxlTWV0YWRhdGFGYWNhZGUpOiBhbnkge1xuICAgIGNvbnN0IG1ldGE6IFIzTmdNb2R1bGVNZXRhZGF0YSA9IHtcbiAgICAgIHR5cGU6IG5ldyBXcmFwcGVkTm9kZUV4cHIoZmFjYWRlLnR5cGUpLFxuICAgICAgYm9vdHN0cmFwOiBmYWNhZGUuYm9vdHN0cmFwLm1hcCh3cmFwUmVmZXJlbmNlKSxcbiAgICAgIGRlY2xhcmF0aW9uczogZmFjYWRlLmRlY2xhcmF0aW9ucy5tYXAod3JhcFJlZmVyZW5jZSksXG4gICAgICBpbXBvcnRzOiBmYWNhZGUuaW1wb3J0cy5tYXAod3JhcFJlZmVyZW5jZSksXG4gICAgICBleHBvcnRzOiBmYWNhZGUuZXhwb3J0cy5tYXAod3JhcFJlZmVyZW5jZSksXG4gICAgICBlbWl0SW5saW5lOiB0cnVlLFxuICAgICAgY29udGFpbnNGb3J3YXJkRGVjbHM6IGZhbHNlLFxuICAgICAgc2NoZW1hczogZmFjYWRlLnNjaGVtYXMgPyBmYWNhZGUuc2NoZW1hcy5tYXAod3JhcFJlZmVyZW5jZSkgOiBudWxsLFxuICAgIH07XG4gICAgY29uc3QgcmVzID0gY29tcGlsZU5nTW9kdWxlKG1ldGEpO1xuICAgIHJldHVybiB0aGlzLmppdEV4cHJlc3Npb24ocmVzLmV4cHJlc3Npb24sIGFuZ3VsYXJDb3JlRW52LCBzb3VyY2VNYXBVcmwsIFtdKTtcbiAgfVxuXG4gIGNvbXBpbGVEaXJlY3RpdmUoXG4gICAgICBhbmd1bGFyQ29yZUVudjogQ29yZUVudmlyb25tZW50LCBzb3VyY2VNYXBVcmw6IHN0cmluZyxcbiAgICAgIGZhY2FkZTogUjNEaXJlY3RpdmVNZXRhZGF0YUZhY2FkZSk6IGFueSB7XG4gICAgY29uc3QgY29uc3RhbnRQb29sID0gbmV3IENvbnN0YW50UG9vbCgpO1xuICAgIGNvbnN0IGJpbmRpbmdQYXJzZXIgPSBtYWtlQmluZGluZ1BhcnNlcigpO1xuXG4gICAgY29uc3QgbWV0YTogUjNEaXJlY3RpdmVNZXRhZGF0YSA9IGNvbnZlcnREaXJlY3RpdmVGYWNhZGVUb01ldGFkYXRhKGZhY2FkZSk7XG4gICAgY29uc3QgcmVzID0gY29tcGlsZURpcmVjdGl2ZUZyb21NZXRhZGF0YShtZXRhLCBjb25zdGFudFBvb2wsIGJpbmRpbmdQYXJzZXIpO1xuICAgIGNvbnN0IHByZVN0YXRlbWVudHMgPSBbLi4uY29uc3RhbnRQb29sLnN0YXRlbWVudHMsIC4uLnJlcy5zdGF0ZW1lbnRzXTtcbiAgICByZXR1cm4gdGhpcy5qaXRFeHByZXNzaW9uKHJlcy5leHByZXNzaW9uLCBhbmd1bGFyQ29yZUVudiwgc291cmNlTWFwVXJsLCBwcmVTdGF0ZW1lbnRzKTtcbiAgfVxuXG4gIGNvbXBpbGVDb21wb25lbnQoXG4gICAgICBhbmd1bGFyQ29yZUVudjogQ29yZUVudmlyb25tZW50LCBzb3VyY2VNYXBVcmw6IHN0cmluZyxcbiAgICAgIGZhY2FkZTogUjNDb21wb25lbnRNZXRhZGF0YUZhY2FkZSk6IGFueSB7XG4gICAgLy8gVGhlIENvbnN0YW50UG9vbCBpcyBhIHJlcXVpcmVtZW50IG9mIHRoZSBKSVQnZXIuXG4gICAgY29uc3QgY29uc3RhbnRQb29sID0gbmV3IENvbnN0YW50UG9vbCgpO1xuXG4gICAgY29uc3QgaW50ZXJwb2xhdGlvbkNvbmZpZyA9IGZhY2FkZS5pbnRlcnBvbGF0aW9uID9cbiAgICAgICAgSW50ZXJwb2xhdGlvbkNvbmZpZy5mcm9tQXJyYXkoZmFjYWRlLmludGVycG9sYXRpb24pIDpcbiAgICAgICAgREVGQVVMVF9JTlRFUlBPTEFUSU9OX0NPTkZJRztcbiAgICAvLyBQYXJzZSB0aGUgdGVtcGxhdGUgYW5kIGNoZWNrIGZvciBlcnJvcnMuXG4gICAgY29uc3QgdGVtcGxhdGUgPSBwYXJzZVRlbXBsYXRlKFxuICAgICAgICBmYWNhZGUudGVtcGxhdGUsIHNvdXJjZU1hcFVybCxcbiAgICAgICAge3ByZXNlcnZlV2hpdGVzcGFjZXM6IGZhY2FkZS5wcmVzZXJ2ZVdoaXRlc3BhY2VzLCBpbnRlcnBvbGF0aW9uQ29uZmlnfSk7XG4gICAgaWYgKHRlbXBsYXRlLmVycm9ycyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBjb25zdCBlcnJvcnMgPSB0ZW1wbGF0ZS5lcnJvcnMubWFwKGVyciA9PiBlcnIudG9TdHJpbmcoKSkuam9pbignLCAnKTtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgRXJyb3JzIGR1cmluZyBKSVQgY29tcGlsYXRpb24gb2YgdGVtcGxhdGUgZm9yICR7ZmFjYWRlLm5hbWV9OiAke2Vycm9yc31gKTtcbiAgICB9XG5cbiAgICAvLyBDb21waWxlIHRoZSBjb21wb25lbnQgbWV0YWRhdGEsIGluY2x1ZGluZyB0ZW1wbGF0ZSwgaW50byBhbiBleHByZXNzaW9uLlxuICAgIC8vIFRPRE8oYWx4aHViKTogaW1wbGVtZW50IGlucHV0cywgb3V0cHV0cywgcXVlcmllcywgZXRjLlxuICAgIGNvbnN0IHJlcyA9IGNvbXBpbGVDb21wb25lbnRGcm9tTWV0YWRhdGEoXG4gICAgICAgIHtcbiAgICAgICAgICAuLi5mYWNhZGUgYXMgUjNDb21wb25lbnRNZXRhZGF0YUZhY2FkZU5vUHJvcEFuZFdoaXRlc3BhY2UsXG4gICAgICAgICAgLi4uY29udmVydERpcmVjdGl2ZUZhY2FkZVRvTWV0YWRhdGEoZmFjYWRlKSxcbiAgICAgICAgICBzZWxlY3RvcjogZmFjYWRlLnNlbGVjdG9yIHx8IHRoaXMuZWxlbWVudFNjaGVtYVJlZ2lzdHJ5LmdldERlZmF1bHRDb21wb25lbnRFbGVtZW50TmFtZSgpLFxuICAgICAgICAgIHRlbXBsYXRlLFxuICAgICAgICAgIHdyYXBEaXJlY3RpdmVzQW5kUGlwZXNJbkNsb3N1cmU6IGZhbHNlLFxuICAgICAgICAgIHN0eWxlczogZmFjYWRlLnN0eWxlcyB8fCBbXSxcbiAgICAgICAgICBlbmNhcHN1bGF0aW9uOiBmYWNhZGUuZW5jYXBzdWxhdGlvbiBhcyBhbnksXG4gICAgICAgICAgaW50ZXJwb2xhdGlvbjogaW50ZXJwb2xhdGlvbkNvbmZpZyxcbiAgICAgICAgICBjaGFuZ2VEZXRlY3Rpb246IGZhY2FkZS5jaGFuZ2VEZXRlY3Rpb24sXG4gICAgICAgICAgYW5pbWF0aW9uczogZmFjYWRlLmFuaW1hdGlvbnMgIT0gbnVsbCA/IG5ldyBXcmFwcGVkTm9kZUV4cHIoZmFjYWRlLmFuaW1hdGlvbnMpIDogbnVsbCxcbiAgICAgICAgICB2aWV3UHJvdmlkZXJzOiBmYWNhZGUudmlld1Byb3ZpZGVycyAhPSBudWxsID8gbmV3IFdyYXBwZWROb2RlRXhwcihmYWNhZGUudmlld1Byb3ZpZGVycykgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBudWxsLFxuICAgICAgICAgIHJlbGF0aXZlQ29udGV4dEZpbGVQYXRoOiAnJyxcbiAgICAgICAgICBpMThuVXNlRXh0ZXJuYWxJZHM6IHRydWUsXG4gICAgICAgIH0sXG4gICAgICAgIGNvbnN0YW50UG9vbCwgbWFrZUJpbmRpbmdQYXJzZXIoaW50ZXJwb2xhdGlvbkNvbmZpZykpO1xuICAgIGNvbnN0IHByZVN0YXRlbWVudHMgPSBbLi4uY29uc3RhbnRQb29sLnN0YXRlbWVudHMsIC4uLnJlcy5zdGF0ZW1lbnRzXTtcbiAgICByZXR1cm4gdGhpcy5qaXRFeHByZXNzaW9uKFxuICAgICAgICByZXMuZXhwcmVzc2lvbiwgYW5ndWxhckNvcmVFbnYsIGBuZzovLy8ke2ZhY2FkZS5uYW1lfS5qc2AsIHByZVN0YXRlbWVudHMpO1xuICB9XG5cbiAgY3JlYXRlUGFyc2VTb3VyY2VTcGFuKGtpbmQ6IHN0cmluZywgdHlwZU5hbWU6IHN0cmluZywgc291cmNlVXJsOiBzdHJpbmcpOiBQYXJzZVNvdXJjZVNwYW4ge1xuICAgIHJldHVybiByM0ppdFR5cGVTb3VyY2VTcGFuKGtpbmQsIHR5cGVOYW1lLCBzb3VyY2VVcmwpO1xuICB9XG5cbiAgLyoqXG4gICAqIEpJVCBjb21waWxlcyBhbiBleHByZXNzaW9uIGFuZCByZXR1cm5zIHRoZSByZXN1bHQgb2YgZXhlY3V0aW5nIHRoYXQgZXhwcmVzc2lvbi5cbiAgICpcbiAgICogQHBhcmFtIGRlZiB0aGUgZGVmaW5pdGlvbiB3aGljaCB3aWxsIGJlIGNvbXBpbGVkIGFuZCBleGVjdXRlZCB0byBnZXQgdGhlIHZhbHVlIHRvIHBhdGNoXG4gICAqIEBwYXJhbSBjb250ZXh0IGFuIG9iamVjdCBtYXAgb2YgQGFuZ3VsYXIvY29yZSBzeW1ib2wgbmFtZXMgdG8gc3ltYm9scyB3aGljaCB3aWxsIGJlIGF2YWlsYWJsZVxuICAgKiBpbiB0aGUgY29udGV4dCBvZiB0aGUgY29tcGlsZWQgZXhwcmVzc2lvblxuICAgKiBAcGFyYW0gc291cmNlVXJsIGEgVVJMIHRvIHVzZSBmb3IgdGhlIHNvdXJjZSBtYXAgb2YgdGhlIGNvbXBpbGVkIGV4cHJlc3Npb25cbiAgICogQHBhcmFtIHByZVN0YXRlbWVudHMgYSBjb2xsZWN0aW9uIG9mIHN0YXRlbWVudHMgdGhhdCBzaG91bGQgYmUgZXZhbHVhdGVkIGJlZm9yZSB0aGUgZXhwcmVzc2lvbi5cbiAgICovXG4gIHByaXZhdGUgaml0RXhwcmVzc2lvbihcbiAgICAgIGRlZjogRXhwcmVzc2lvbiwgY29udGV4dDoge1trZXk6IHN0cmluZ106IGFueX0sIHNvdXJjZVVybDogc3RyaW5nLFxuICAgICAgcHJlU3RhdGVtZW50czogU3RhdGVtZW50W10pOiBhbnkge1xuICAgIC8vIFRoZSBDb25zdGFudFBvb2wgbWF5IGNvbnRhaW4gU3RhdGVtZW50cyB3aGljaCBkZWNsYXJlIHZhcmlhYmxlcyB1c2VkIGluIHRoZSBmaW5hbCBleHByZXNzaW9uLlxuICAgIC8vIFRoZXJlZm9yZSwgaXRzIHN0YXRlbWVudHMgbmVlZCB0byBwcmVjZWRlIHRoZSBhY3R1YWwgSklUIG9wZXJhdGlvbi4gVGhlIGZpbmFsIHN0YXRlbWVudCBpcyBhXG4gICAgLy8gZGVjbGFyYXRpb24gb2YgJGRlZiB3aGljaCBpcyBzZXQgdG8gdGhlIGV4cHJlc3Npb24gYmVpbmcgY29tcGlsZWQuXG4gICAgY29uc3Qgc3RhdGVtZW50czogU3RhdGVtZW50W10gPSBbXG4gICAgICAuLi5wcmVTdGF0ZW1lbnRzLFxuICAgICAgbmV3IERlY2xhcmVWYXJTdG10KCckZGVmJywgZGVmLCB1bmRlZmluZWQsIFtTdG10TW9kaWZpZXIuRXhwb3J0ZWRdKSxcbiAgICBdO1xuXG4gICAgY29uc3QgcmVzID0gdGhpcy5qaXRFdmFsdWF0b3IuZXZhbHVhdGVTdGF0ZW1lbnRzKFxuICAgICAgICBzb3VyY2VVcmwsIHN0YXRlbWVudHMsIG5ldyBSM0ppdFJlZmxlY3Rvcihjb250ZXh0KSwgLyogZW5hYmxlU291cmNlTWFwcyAqLyB0cnVlKTtcbiAgICByZXR1cm4gcmVzWyckZGVmJ107XG4gIH1cbn1cblxuLy8gVGhpcyBzZWVtcyB0byBiZSBuZWVkZWQgdG8gcGxhY2F0ZSBUUyB2My4wIG9ubHlcbnR5cGUgUjNDb21wb25lbnRNZXRhZGF0YUZhY2FkZU5vUHJvcEFuZFdoaXRlc3BhY2UgPSBQaWNrPFxuICAgIFIzQ29tcG9uZW50TWV0YWRhdGFGYWNhZGUsXG4gICAgRXhjbHVkZTxFeGNsdWRlPGtleW9mIFIzQ29tcG9uZW50TWV0YWRhdGFGYWNhZGUsICdwcmVzZXJ2ZVdoaXRlc3BhY2VzJz4sICdwcm9wTWV0YWRhdGEnPj47XG5cbmNvbnN0IFVTRV9DTEFTUyA9IE9iamVjdC5rZXlzKHt1c2VDbGFzczogbnVsbH0pWzBdO1xuY29uc3QgVVNFX0ZBQ1RPUlkgPSBPYmplY3Qua2V5cyh7dXNlRmFjdG9yeTogbnVsbH0pWzBdO1xuY29uc3QgVVNFX1ZBTFVFID0gT2JqZWN0LmtleXMoe3VzZVZhbHVlOiBudWxsfSlbMF07XG5jb25zdCBVU0VfRVhJU1RJTkcgPSBPYmplY3Qua2V5cyh7dXNlRXhpc3Rpbmc6IG51bGx9KVswXTtcblxuY29uc3Qgd3JhcFJlZmVyZW5jZSA9IGZ1bmN0aW9uKHZhbHVlOiBUeXBlKTogUjNSZWZlcmVuY2Uge1xuICBjb25zdCB3cmFwcGVkID0gbmV3IFdyYXBwZWROb2RlRXhwcih2YWx1ZSk7XG4gIHJldHVybiB7dmFsdWU6IHdyYXBwZWQsIHR5cGU6IHdyYXBwZWR9O1xufTtcblxuZnVuY3Rpb24gY29udmVydFRvUjNRdWVyeU1ldGFkYXRhKGZhY2FkZTogUjNRdWVyeU1ldGFkYXRhRmFjYWRlKTogUjNRdWVyeU1ldGFkYXRhIHtcbiAgcmV0dXJuIHtcbiAgICAuLi5mYWNhZGUsXG4gICAgcHJlZGljYXRlOiBBcnJheS5pc0FycmF5KGZhY2FkZS5wcmVkaWNhdGUpID8gZmFjYWRlLnByZWRpY2F0ZSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3IFdyYXBwZWROb2RlRXhwcihmYWNhZGUucHJlZGljYXRlKSxcbiAgICByZWFkOiBmYWNhZGUucmVhZCA/IG5ldyBXcmFwcGVkTm9kZUV4cHIoZmFjYWRlLnJlYWQpIDogbnVsbCxcbiAgICBzdGF0aWM6IGZhY2FkZS5zdGF0aWNcbiAgfTtcbn1cblxuZnVuY3Rpb24gY29udmVydERpcmVjdGl2ZUZhY2FkZVRvTWV0YWRhdGEoZmFjYWRlOiBSM0RpcmVjdGl2ZU1ldGFkYXRhRmFjYWRlKTogUjNEaXJlY3RpdmVNZXRhZGF0YSB7XG4gIGNvbnN0IGlucHV0c0Zyb21NZXRhZGF0YSA9IHBhcnNlSW5wdXRPdXRwdXRzKGZhY2FkZS5pbnB1dHMgfHwgW10pO1xuICBjb25zdCBvdXRwdXRzRnJvbU1ldGFkYXRhID0gcGFyc2VJbnB1dE91dHB1dHMoZmFjYWRlLm91dHB1dHMgfHwgW10pO1xuICBjb25zdCBwcm9wTWV0YWRhdGEgPSBmYWNhZGUucHJvcE1ldGFkYXRhO1xuICBjb25zdCBpbnB1dHNGcm9tVHlwZTogU3RyaW5nTWFwV2l0aFJlbmFtZSA9IHt9O1xuICBjb25zdCBvdXRwdXRzRnJvbVR5cGU6IFN0cmluZ01hcCA9IHt9O1xuICBmb3IgKGNvbnN0IGZpZWxkIGluIHByb3BNZXRhZGF0YSkge1xuICAgIGlmIChwcm9wTWV0YWRhdGEuaGFzT3duUHJvcGVydHkoZmllbGQpKSB7XG4gICAgICBwcm9wTWV0YWRhdGFbZmllbGRdLmZvckVhY2goYW5uID0+IHtcbiAgICAgICAgaWYgKGlzSW5wdXQoYW5uKSkge1xuICAgICAgICAgIGlucHV0c0Zyb21UeXBlW2ZpZWxkXSA9XG4gICAgICAgICAgICAgIGFubi5iaW5kaW5nUHJvcGVydHlOYW1lID8gW2Fubi5iaW5kaW5nUHJvcGVydHlOYW1lLCBmaWVsZF0gOiBmaWVsZDtcbiAgICAgICAgfSBlbHNlIGlmIChpc091dHB1dChhbm4pKSB7XG4gICAgICAgICAgb3V0cHV0c0Zyb21UeXBlW2ZpZWxkXSA9IGFubi5iaW5kaW5nUHJvcGVydHlOYW1lIHx8IGZpZWxkO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4ge1xuICAgIC4uLmZhY2FkZSBhcyBSM0RpcmVjdGl2ZU1ldGFkYXRhRmFjYWRlTm9Qcm9wQW5kV2hpdGVzcGFjZSxcbiAgICB0eXBlU291cmNlU3BhbjogZmFjYWRlLnR5cGVTb3VyY2VTcGFuLFxuICAgIHR5cGU6IG5ldyBXcmFwcGVkTm9kZUV4cHIoZmFjYWRlLnR5cGUpLFxuICAgIGRlcHM6IGNvbnZlcnRSM0RlcGVuZGVuY3lNZXRhZGF0YUFycmF5KGZhY2FkZS5kZXBzKSxcbiAgICBob3N0OiBleHRyYWN0SG9zdEJpbmRpbmdzKGZhY2FkZS5ob3N0LCBmYWNhZGUucHJvcE1ldGFkYXRhLCBmYWNhZGUudHlwZVNvdXJjZVNwYW4pLFxuICAgIGlucHV0czogey4uLmlucHV0c0Zyb21NZXRhZGF0YSwgLi4uaW5wdXRzRnJvbVR5cGV9LFxuICAgIG91dHB1dHM6IHsuLi5vdXRwdXRzRnJvbU1ldGFkYXRhLCAuLi5vdXRwdXRzRnJvbVR5cGV9LFxuICAgIHF1ZXJpZXM6IGZhY2FkZS5xdWVyaWVzLm1hcChjb252ZXJ0VG9SM1F1ZXJ5TWV0YWRhdGEpLFxuICAgIHByb3ZpZGVyczogZmFjYWRlLnByb3ZpZGVycyAhPSBudWxsID8gbmV3IFdyYXBwZWROb2RlRXhwcihmYWNhZGUucHJvdmlkZXJzKSA6IG51bGwsXG4gICAgdmlld1F1ZXJpZXM6IGZhY2FkZS52aWV3UXVlcmllcy5tYXAoY29udmVydFRvUjNRdWVyeU1ldGFkYXRhKSxcbiAgfTtcbn1cblxuLy8gVGhpcyBzZWVtcyB0byBiZSBuZWVkZWQgdG8gcGxhY2F0ZSBUUyB2My4wIG9ubHlcbnR5cGUgUjNEaXJlY3RpdmVNZXRhZGF0YUZhY2FkZU5vUHJvcEFuZFdoaXRlc3BhY2UgPVxuICAgIFBpY2s8UjNEaXJlY3RpdmVNZXRhZGF0YUZhY2FkZSwgRXhjbHVkZTxrZXlvZiBSM0RpcmVjdGl2ZU1ldGFkYXRhRmFjYWRlLCAncHJvcE1ldGFkYXRhJz4+O1xuXG5mdW5jdGlvbiB3cmFwRXhwcmVzc2lvbihvYmo6IGFueSwgcHJvcGVydHk6IHN0cmluZyk6IFdyYXBwZWROb2RlRXhwcjxhbnk+fHVuZGVmaW5lZCB7XG4gIGlmIChvYmouaGFzT3duUHJvcGVydHkocHJvcGVydHkpKSB7XG4gICAgcmV0dXJuIG5ldyBXcmFwcGVkTm9kZUV4cHIob2JqW3Byb3BlcnR5XSk7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgfVxufVxuXG5mdW5jdGlvbiBjb21wdXRlUHJvdmlkZWRJbihwcm92aWRlZEluOiBUeXBlIHwgc3RyaW5nIHwgbnVsbCB8IHVuZGVmaW5lZCk6IEV4cHJlc3Npb24ge1xuICBpZiAocHJvdmlkZWRJbiA9PSBudWxsIHx8IHR5cGVvZiBwcm92aWRlZEluID09PSAnc3RyaW5nJykge1xuICAgIHJldHVybiBuZXcgTGl0ZXJhbEV4cHIocHJvdmlkZWRJbik7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIG5ldyBXcmFwcGVkTm9kZUV4cHIocHJvdmlkZWRJbik7XG4gIH1cbn1cblxuZnVuY3Rpb24gY29udmVydFIzRGVwZW5kZW5jeU1ldGFkYXRhKGZhY2FkZTogUjNEZXBlbmRlbmN5TWV0YWRhdGFGYWNhZGUpOiBSM0RlcGVuZGVuY3lNZXRhZGF0YSB7XG4gIGxldCB0b2tlbkV4cHI7XG4gIGlmIChmYWNhZGUudG9rZW4gPT09IG51bGwpIHtcbiAgICB0b2tlbkV4cHIgPSBuZXcgTGl0ZXJhbEV4cHIobnVsbCk7XG4gIH0gZWxzZSBpZiAoZmFjYWRlLnJlc29sdmVkID09PSBSM1Jlc29sdmVkRGVwZW5kZW5jeVR5cGUuQXR0cmlidXRlKSB7XG4gICAgdG9rZW5FeHByID0gbmV3IExpdGVyYWxFeHByKGZhY2FkZS50b2tlbik7XG4gIH0gZWxzZSB7XG4gICAgdG9rZW5FeHByID0gbmV3IFdyYXBwZWROb2RlRXhwcihmYWNhZGUudG9rZW4pO1xuICB9XG4gIHJldHVybiB7XG4gICAgdG9rZW46IHRva2VuRXhwcixcbiAgICByZXNvbHZlZDogZmFjYWRlLnJlc29sdmVkLFxuICAgIGhvc3Q6IGZhY2FkZS5ob3N0LFxuICAgIG9wdGlvbmFsOiBmYWNhZGUub3B0aW9uYWwsXG4gICAgc2VsZjogZmFjYWRlLnNlbGYsXG4gICAgc2tpcFNlbGY6IGZhY2FkZS5za2lwU2VsZlxuICB9O1xufVxuXG5mdW5jdGlvbiBjb252ZXJ0UjNEZXBlbmRlbmN5TWV0YWRhdGFBcnJheShmYWNhZGVzOiBSM0RlcGVuZGVuY3lNZXRhZGF0YUZhY2FkZVtdIHwgbnVsbCB8IHVuZGVmaW5lZCk6XG4gICAgUjNEZXBlbmRlbmN5TWV0YWRhdGFbXXxudWxsIHtcbiAgcmV0dXJuIGZhY2FkZXMgPT0gbnVsbCA/IG51bGwgOiBmYWNhZGVzLm1hcChjb252ZXJ0UjNEZXBlbmRlbmN5TWV0YWRhdGEpO1xufVxuXG5mdW5jdGlvbiBleHRyYWN0SG9zdEJpbmRpbmdzKFxuICAgIGhvc3Q6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9LCBwcm9wTWV0YWRhdGE6IHtba2V5OiBzdHJpbmddOiBhbnlbXX0sXG4gICAgc291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFuKTogUGFyc2VkSG9zdEJpbmRpbmdzIHtcbiAgLy8gRmlyc3QgcGFyc2UgdGhlIGRlY2xhcmF0aW9ucyBmcm9tIHRoZSBtZXRhZGF0YS5cbiAgY29uc3QgYmluZGluZ3MgPSBwYXJzZUhvc3RCaW5kaW5ncyhob3N0IHx8IHt9KTtcblxuICAvLyBBZnRlciB0aGF0IGNoZWNrIGhvc3QgYmluZGluZ3MgZm9yIGVycm9yc1xuICBjb25zdCBlcnJvcnMgPSB2ZXJpZnlIb3N0QmluZGluZ3MoYmluZGluZ3MsIHNvdXJjZVNwYW4pO1xuICBpZiAoZXJyb3JzLmxlbmd0aCkge1xuICAgIHRocm93IG5ldyBFcnJvcihlcnJvcnMubWFwKChlcnJvcjogUGFyc2VFcnJvcikgPT4gZXJyb3IubXNnKS5qb2luKCdcXG4nKSk7XG4gIH1cblxuICAvLyBOZXh0LCBsb29wIG92ZXIgdGhlIHByb3BlcnRpZXMgb2YgdGhlIG9iamVjdCwgbG9va2luZyBmb3IgQEhvc3RCaW5kaW5nIGFuZCBASG9zdExpc3RlbmVyLlxuICBmb3IgKGNvbnN0IGZpZWxkIGluIHByb3BNZXRhZGF0YSkge1xuICAgIGlmIChwcm9wTWV0YWRhdGEuaGFzT3duUHJvcGVydHkoZmllbGQpKSB7XG4gICAgICBwcm9wTWV0YWRhdGFbZmllbGRdLmZvckVhY2goYW5uID0+IHtcbiAgICAgICAgaWYgKGlzSG9zdEJpbmRpbmcoYW5uKSkge1xuICAgICAgICAgIGJpbmRpbmdzLnByb3BlcnRpZXNbYW5uLmhvc3RQcm9wZXJ0eU5hbWUgfHwgZmllbGRdID0gZmllbGQ7XG4gICAgICAgIH0gZWxzZSBpZiAoaXNIb3N0TGlzdGVuZXIoYW5uKSkge1xuICAgICAgICAgIGJpbmRpbmdzLmxpc3RlbmVyc1thbm4uZXZlbnROYW1lIHx8IGZpZWxkXSA9IGAke2ZpZWxkfSgkeyhhbm4uYXJncyB8fCBbXSkuam9pbignLCcpfSlgO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gYmluZGluZ3M7XG59XG5cbmZ1bmN0aW9uIGlzSG9zdEJpbmRpbmcodmFsdWU6IGFueSk6IHZhbHVlIGlzIEhvc3RCaW5kaW5nIHtcbiAgcmV0dXJuIHZhbHVlLm5nTWV0YWRhdGFOYW1lID09PSAnSG9zdEJpbmRpbmcnO1xufVxuXG5mdW5jdGlvbiBpc0hvc3RMaXN0ZW5lcih2YWx1ZTogYW55KTogdmFsdWUgaXMgSG9zdExpc3RlbmVyIHtcbiAgcmV0dXJuIHZhbHVlLm5nTWV0YWRhdGFOYW1lID09PSAnSG9zdExpc3RlbmVyJztcbn1cblxuXG5mdW5jdGlvbiBpc0lucHV0KHZhbHVlOiBhbnkpOiB2YWx1ZSBpcyBJbnB1dCB7XG4gIHJldHVybiB2YWx1ZS5uZ01ldGFkYXRhTmFtZSA9PT0gJ0lucHV0Jztcbn1cblxuZnVuY3Rpb24gaXNPdXRwdXQodmFsdWU6IGFueSk6IHZhbHVlIGlzIE91dHB1dCB7XG4gIHJldHVybiB2YWx1ZS5uZ01ldGFkYXRhTmFtZSA9PT0gJ091dHB1dCc7XG59XG5cbmZ1bmN0aW9uIHBhcnNlSW5wdXRPdXRwdXRzKHZhbHVlczogc3RyaW5nW10pOiBTdHJpbmdNYXAge1xuICByZXR1cm4gdmFsdWVzLnJlZHVjZShcbiAgICAgIChtYXAsIHZhbHVlKSA9PiB7XG4gICAgICAgIGNvbnN0IFtmaWVsZCwgcHJvcGVydHldID0gdmFsdWUuc3BsaXQoJywnKS5tYXAocGllY2UgPT4gcGllY2UudHJpbSgpKTtcbiAgICAgICAgbWFwW2ZpZWxkXSA9IHByb3BlcnR5IHx8IGZpZWxkO1xuICAgICAgICByZXR1cm4gbWFwO1xuICAgICAgfSxcbiAgICAgIHt9IGFzIFN0cmluZ01hcCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwdWJsaXNoRmFjYWRlKGdsb2JhbDogYW55KSB7XG4gIGNvbnN0IG5nOiBFeHBvcnRlZENvbXBpbGVyRmFjYWRlID0gZ2xvYmFsLm5nIHx8IChnbG9iYWwubmcgPSB7fSk7XG4gIG5nLsm1Y29tcGlsZXJGYWNhZGUgPSBuZXcgQ29tcGlsZXJGYWNhZGVJbXBsKCk7XG59XG4iXX0=