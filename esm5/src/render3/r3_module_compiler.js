/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as tslib_1 from "tslib";
import { identifierName } from '../compile_metadata';
import { mapLiteral } from '../output/map_util';
import * as o from '../output/output_ast';
import { compileFactoryFunction } from './r3_factory';
import { Identifiers as R3 } from './r3_identifiers';
import { convertMetaToOutput, mapToMapExpression } from './util';
/**
 * Construct an `R3NgModuleDef` for the given `R3NgModuleMetadata`.
 */
export function compileNgModule(meta) {
    var moduleType = meta.type, bootstrap = meta.bootstrap, declarations = meta.declarations, imports = meta.imports, exports = meta.exports;
    var expression = o.importExpr(R3.defineNgModule).callFn([mapToMapExpression({
            type: moduleType,
            bootstrap: o.literalArr(bootstrap),
            declarations: o.literalArr(declarations.map(function (ref) { return ref.value; })),
            imports: o.literalArr(imports.map(function (ref) { return ref.value; })),
            exports: o.literalArr(exports.map(function (ref) { return ref.value; })),
        })]);
    var type = new o.ExpressionType(o.importExpr(R3.NgModuleDef, [
        new o.ExpressionType(moduleType), tupleTypeOf(declarations), tupleTypeOf(imports),
        tupleTypeOf(exports)
    ]));
    var additionalStatements = [];
    return { expression: expression, type: type, additionalStatements: additionalStatements };
}
export function compileInjector(meta) {
    var expression = o.importExpr(R3.defineInjector).callFn([mapToMapExpression({
            factory: compileFactoryFunction({
                name: meta.name,
                fnOrClass: meta.type,
                deps: meta.deps,
                useNew: true,
                injectFn: R3.inject,
            }),
            providers: meta.providers,
            imports: meta.imports,
        })]);
    var type = new o.ExpressionType(o.importExpr(R3.InjectorDef, [new o.ExpressionType(meta.type)]));
    return { expression: expression, type: type };
}
// TODO(alxhub): integrate this with `compileNgModule`. Currently the two are separate operations.
export function compileNgModuleFromRender2(ctx, ngModule, injectableCompiler) {
    var className = identifierName(ngModule.type);
    var rawImports = ngModule.rawImports ? [ngModule.rawImports] : [];
    var rawExports = ngModule.rawExports ? [ngModule.rawExports] : [];
    var injectorDefArg = mapLiteral({
        'factory': injectableCompiler.factoryFor({ type: ngModule.type, symbol: ngModule.type.reference }, ctx),
        'providers': convertMetaToOutput(ngModule.rawProviders, ctx),
        'imports': convertMetaToOutput(tslib_1.__spread(rawImports, rawExports), ctx),
    });
    var injectorDef = o.importExpr(R3.defineInjector).callFn([injectorDefArg]);
    ctx.statements.push(new o.ClassStmt(
    /* name */ className, 
    /* parent */ null, 
    /* fields */ [new o.ClassField(
        /* name */ 'ngInjectorDef', 
        /* type */ o.INFERRED_TYPE, 
        /* modifiers */ [o.StmtModifier.Static], 
        /* initializer */ injectorDef)], 
    /* getters */ [], 
    /* constructorMethod */ new o.ClassMethod(null, [], []), 
    /* methods */ []));
}
function accessExportScope(module) {
    var selectorScope = new o.ReadPropExpr(module, 'ngModuleDef');
    return new o.ReadPropExpr(selectorScope, 'exported');
}
function tupleTypeOf(exp) {
    var types = exp.map(function (ref) { return o.typeofExpr(ref.type); });
    return exp.length > 0 ? o.expressionType(o.literalArr(types)) : o.NONE_TYPE;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicjNfbW9kdWxlX2NvbXBpbGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXIvc3JjL3JlbmRlcjMvcjNfbW9kdWxlX2NvbXBpbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7QUFHSCxPQUFPLEVBQStCLGNBQWMsRUFBQyxNQUFNLHFCQUFxQixDQUFDO0FBRWpGLE9BQU8sRUFBQyxVQUFVLEVBQUMsTUFBTSxvQkFBb0IsQ0FBQztBQUM5QyxPQUFPLEtBQUssQ0FBQyxNQUFNLHNCQUFzQixDQUFDO0FBRzFDLE9BQU8sRUFBdUIsc0JBQXNCLEVBQUMsTUFBTSxjQUFjLENBQUM7QUFDMUUsT0FBTyxFQUFDLFdBQVcsSUFBSSxFQUFFLEVBQUMsTUFBTSxrQkFBa0IsQ0FBQztBQUNuRCxPQUFPLEVBQWMsbUJBQW1CLEVBQUUsa0JBQWtCLEVBQUMsTUFBTSxRQUFRLENBQUM7QUE2QzVFOztHQUVHO0FBQ0gsTUFBTSwwQkFBMEIsSUFBd0I7SUFDL0MsSUFBQSxzQkFBZ0IsRUFBRSwwQkFBUyxFQUFFLGdDQUFZLEVBQUUsc0JBQU8sRUFBRSxzQkFBTyxDQUFTO0lBQzNFLElBQU0sVUFBVSxHQUFHLENBQUMsQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLGNBQWMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLGtCQUFrQixDQUFDO1lBQzVFLElBQUksRUFBRSxVQUFVO1lBQ2hCLFNBQVMsRUFBRSxDQUFDLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQztZQUNsQyxZQUFZLEVBQUUsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLFVBQUEsR0FBRyxJQUFJLE9BQUEsR0FBRyxDQUFDLEtBQUssRUFBVCxDQUFTLENBQUMsQ0FBQztZQUM5RCxPQUFPLEVBQUUsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFD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QyxDQUFDLENBQUMsU0FBUyxDQUFDO0FBQzlFLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7U3RhdGljU3ltYm9sfSBmcm9tICcuLi9hb3Qvc3RhdGljX3N5bWJvbCc7XG5pbXBvcnQge0NvbXBpbGVTaGFsbG93TW9kdWxlTWV0YWRhdGEsIGlkZW50aWZpZXJOYW1lfSBmcm9tICcuLi9jb21waWxlX21ldGFkYXRhJztcbmltcG9ydCB7SW5qZWN0YWJsZUNvbXBpbGVyfSBmcm9tICcuLi9pbmplY3RhYmxlX2NvbXBpbGVyJztcbmltcG9ydCB7bWFwTGl0ZXJhbH0gZnJvbSAnLi4vb3V0cHV0L21hcF91dGlsJztcbmltcG9ydCAqIGFzIG8gZnJvbSAnLi4vb3V0cHV0L291dHB1dF9hc3QnO1xuaW1wb3J0IHtPdXRwdXRDb250ZXh0fSBmcm9tICcuLi91dGlsJztcblxuaW1wb3J0IHtSM0RlcGVuZGVuY3lNZXRhZGF0YSwgY29tcGlsZUZhY3RvcnlGdW5jdGlvbn0gZnJvbSAnLi9yM19mYWN0b3J5JztcbmltcG9ydCB7SWRlbnRpZmllcnMgYXMgUjN9IGZyb20gJy4vcjNfaWRlbnRpZmllcnMnO1xuaW1wb3J0IHtSM1JlZmVyZW5jZSwgY29udmVydE1ldGFUb091dHB1dCwgbWFwVG9NYXBFeHByZXNzaW9ufSBmcm9tICcuL3V0aWwnO1xuXG5leHBvcnQgaW50ZXJmYWNlIFIzTmdNb2R1bGVEZWYge1xuICBleHByZXNzaW9uOiBvLkV4cHJlc3Npb247XG4gIHR5cGU6IG8uVHlwZTtcbiAgYWRkaXRpb25hbFN0YXRlbWVudHM6IG8uU3RhdGVtZW50W107XG59XG5cbi8qKlxuICogTWV0YWRhdGEgcmVxdWlyZWQgYnkgdGhlIG1vZHVsZSBjb21waWxlciB0byBnZW5lcmF0ZSBhIGBuZ01vZHVsZURlZmAgZm9yIGEgdHlwZS5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBSM05nTW9kdWxlTWV0YWRhdGEge1xuICAvKipcbiAgICogQW4gZXhwcmVzc2lvbiByZXByZXNlbnRpbmcgdGhlIG1vZHVsZSB0eXBlIGJlaW5nIGNvbXBpbGVkLlxuICAgKi9cbiAgdHlwZTogby5FeHByZXNzaW9uO1xuXG4gIC8qKlxuICAgKiBBbiBhcnJheSBvZiBleHByZXNzaW9ucyByZXByZXNlbnRpbmcgdGhlIGJvb3RzdHJhcCBjb21wb25lbnRzIHNwZWNpZmllZCBieSB0aGUgbW9kdWxlLlxuICAgKi9cbiAgYm9vdHN0cmFwOiBvLkV4cHJlc3Npb25bXTtcblxuICAvKipcbiAgICogQW4gYXJyYXkgb2YgZXhwcmVzc2lvbnMgcmVwcmVzZW50aW5nIHRoZSBkaXJlY3RpdmVzIGFuZCBwaXBlcyBkZWNsYXJlZCBieSB0aGUgbW9kdWxlLlxuICAgKi9cbiAgZGVjbGFyYXRpb25zOiBSM1JlZmVyZW5jZVtdO1xuXG4gIC8qKlxuICAgKiBBbiBhcnJheSBvZiBleHByZXNzaW9ucyByZXByZXNlbnRpbmcgdGhlIGltcG9ydHMgb2YgdGhlIG1vZHVsZS5cbiAgICovXG4gIGltcG9ydHM6IFIzUmVmZXJlbmNlW107XG5cbiAgLyoqXG4gICAqIEFuIGFycmF5IG9mIGV4cHJlc3Npb25zIHJlcHJlc2VudGluZyB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlLlxuICAgKi9cbiAgZXhwb3J0czogUjNSZWZlcmVuY2VbXTtcblxuICAvKipcbiAgICogV2hldGhlciB0byBlbWl0IHRoZSBzZWxlY3RvciBzY29wZSB2YWx1ZXMgKGRlY2xhcmF0aW9ucywgaW1wb3J0cywgZXhwb3J0cykgaW5saW5lIGludG8gdGhlXG4gICAqIG1vZHVsZSBkZWZpbml0aW9uLCBvciB0byBnZW5lcmF0ZSBhZGRpdGlvbmFsIHN0YXRlbWVudHMgd2hpY2ggcGF0Y2ggdGhlbSBvbi4gSW5saW5lIGVtaXNzaW9uXG4gICAqIGRvZXMgbm90IGFsbG93IGNvbXBvbmVudHMgdG8gYmUgdHJlZS1zaGFrZW4sIGJ1dCBpcyB1c2VmdWwgZm9yIEpJVCBtb2RlLlxuICAgKi9cbiAgZW1pdElubGluZTogYm9vbGVhbjtcbn1cblxuLyoqXG4gKiBDb25zdHJ1Y3QgYW4gYFIzTmdNb2R1bGVEZWZgIGZvciB0aGUgZ2l2ZW4gYFIzTmdNb2R1bGVNZXRhZGF0YWAuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjb21waWxlTmdNb2R1bGUobWV0YTogUjNOZ01vZHVsZU1ldGFkYXRhKTogUjNOZ01vZHVsZURlZiB7XG4gIGNvbnN0IHt0eXBlOiBtb2R1bGVUeXBlLCBib290c3RyYXAsIGRlY2xhcmF0aW9ucywgaW1wb3J0cywgZXhwb3J0c30gPSBtZXRhO1xuICBjb25zdCBleHByZXNzaW9uID0gby5pbXBvcnRFeHByKFIzLmRlZmluZU5nTW9kdWxlKS5jYWxsRm4oW21hcFRvTWFwRXhwcmVzc2lvbih7XG4gICAgdHlwZTogbW9kdWxlVHlwZSxcbiAgICBib290c3RyYXA6IG8ubGl0ZXJhbEFycihib290c3RyYXApLFxuICAgIGRlY2xhcmF0aW9uczogby5saXRlcmFsQXJyKGRlY2xhcmF0aW9ucy5tYXAocmVmID0+IHJlZi52YWx1ZSkpLFxuICAgIGltcG9ydHM6IG8ubGl0ZXJhbEFycihpbXBvcnRzLm1hcChyZWYgPT4gcmVmLnZhbHVlKSksXG4gICAgZXhwb3J0czogby5saXRlcmFsQXJyKGV4cG9ydHMubWFwKHJlZiA9PiByZWYudmFsdWUpKSxcbiAgfSldKTtcblxuICBjb25zdCB0eXBlID0gbmV3IG8uRXhwcmVzc2lvblR5cGUoby5pbXBvcnRFeHByKFIzLk5nTW9kdWxlRGVmLCBbXG4gICAgbmV3IG8uRXhwcmVzc2lvblR5cGUobW9kdWxlVHlwZSksIHR1cGxlVHlwZU9mKGRlY2xhcmF0aW9ucyksIHR1cGxlVHlwZU9mKGltcG9ydHMpLFxuICAgIHR1cGxlVHlwZU9mKGV4cG9ydHMpXG4gIF0pKTtcblxuICBjb25zdCBhZGRpdGlvbmFsU3RhdGVtZW50czogby5TdGF0ZW1lbnRbXSA9IFtdO1xuICByZXR1cm4ge2V4cHJlc3Npb24sIHR5cGUsIGFkZGl0aW9uYWxTdGF0ZW1lbnRzfTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBSM0luamVjdG9yRGVmIHtcbiAgZXhwcmVzc2lvbjogby5FeHByZXNzaW9uO1xuICB0eXBlOiBvLlR5cGU7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgUjNJbmplY3Rvck1ldGFkYXRhIHtcbiAgbmFtZTogc3RyaW5nO1xuICB0eXBlOiBvLkV4cHJlc3Npb247XG4gIGRlcHM6IFIzRGVwZW5kZW5jeU1ldGFkYXRhW107XG4gIHByb3ZpZGVyczogby5FeHByZXNzaW9uO1xuICBpbXBvcnRzOiBvLkV4cHJlc3Npb247XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjb21waWxlSW5qZWN0b3IobWV0YTogUjNJbmplY3Rvck1ldGFkYXRhKTogUjNJbmplY3RvckRlZiB7XG4gIGNvbnN0IGV4cHJlc3Npb24gPSBvLmltcG9ydEV4cHIoUjMuZGVmaW5lSW5qZWN0b3IpLmNhbGxGbihbbWFwVG9NYXBFeHByZXNzaW9uKHtcbiAgICBmYWN0b3J5OiBjb21waWxlRmFjdG9yeUZ1bmN0aW9uKHtcbiAgICAgIG5hbWU6IG1ldGEubmFtZSxcbiAgICAgIGZuT3JDbGFzczogbWV0YS50eXBlLFxuICAgICAgZGVwczogbWV0YS5kZXBzLFxuICAgICAgdXNlTmV3OiB0cnVlLFxuICAgICAgaW5qZWN0Rm46IFIzLmluamVjdCxcbiAgICB9KSxcbiAgICBwcm92aWRlcnM6IG1ldGEucHJvdmlkZXJzLFxuICAgIGltcG9ydHM6IG1ldGEuaW1wb3J0cyxcbiAgfSldKTtcbiAgY29uc3QgdHlwZSA9XG4gICAgICBuZXcgby5FeHByZXNzaW9uVHlwZShvLmltcG9ydEV4cHIoUjMuSW5qZWN0b3JEZWYsIFtuZXcgby5FeHByZXNzaW9uVHlwZShtZXRhLnR5cGUpXSkpO1xuICByZXR1cm4ge2V4cHJlc3Npb24sIHR5cGV9O1xufVxuXG4vLyBUT0RPKGFseGh1Yik6IGludGVncmF0ZSB0aGlzIHdpdGggYGNvbXBpbGVOZ01vZHVsZWAuIEN1cnJlbnRseSB0aGUgdHdvIGFyZSBzZXBhcmF0ZSBvcGVyYXRpb25zLlxuZXhwb3J0IGZ1bmN0aW9uIGNvbXBpbGVOZ01vZHVsZUZyb21SZW5kZXIyKFxuICAgIGN0eDogT3V0cHV0Q29udGV4dCwgbmdNb2R1bGU6IENvbXBpbGVTaGFsbG93TW9kdWxlTWV0YWRhdGEsXG4gICAgaW5qZWN0YWJsZUNvbXBpbGVyOiBJbmplY3RhYmxlQ29tcGlsZXIpOiB2b2lkIHtcbiAgY29uc3QgY2xhc3NOYW1lID0gaWRlbnRpZmllck5hbWUobmdNb2R1bGUudHlwZSkgITtcblxuICBjb25zdCByYXdJbXBvcnRzID0gbmdNb2R1bGUucmF3SW1wb3J0cyA/IFtuZ01vZHVsZS5yYXdJbXBvcnRzXSA6IFtdO1xuICBjb25zdCByYXdFeHBvcnRzID0gbmdNb2R1bGUucmF3RXhwb3J0cyA/IFtuZ01vZHVsZS5yYXdFeHBvcnRzXSA6IFtdO1xuXG4gIGNvbnN0IGluamVjdG9yRGVmQXJnID0gbWFwTGl0ZXJhbCh7XG4gICAgJ2ZhY3RvcnknOlxuICAgICAgICBpbmplY3RhYmxlQ29tcGlsZXIuZmFjdG9yeUZvcih7dHlwZTogbmdNb2R1bGUudHlwZSwgc3ltYm9sOiBuZ01vZHVsZS50eXBlLnJlZmVyZW5jZX0sIGN0eCksXG4gICAgJ3Byb3ZpZGVycyc6IGNvbnZlcnRNZXRhVG9PdXRwdXQobmdNb2R1bGUucmF3UHJvdmlkZXJzLCBjdHgpLFxuICAgICdpbXBvcnRzJzogY29udmVydE1ldGFUb091dHB1dChbLi4ucmF3SW1wb3J0cywgLi4ucmF3RXhwb3J0c10sIGN0eCksXG4gIH0pO1xuXG4gIGNvbnN0IGluamVjdG9yRGVmID0gby5pbXBvcnRFeHByKFIzLmRlZmluZUluamVjdG9yKS5jYWxsRm4oW2luamVjdG9yRGVmQXJnXSk7XG5cbiAgY3R4LnN0YXRlbWVudHMucHVzaChuZXcgby5DbGFzc1N0bXQoXG4gICAgICAvKiBuYW1lICovIGNsYXNzTmFtZSxcbiAgICAgIC8qIHBhcmVudCAqLyBudWxsLFxuICAgICAgLyogZmllbGRzICovW25ldyBvLkNsYXNzRmllbGQoXG4gICAgICAgICAgLyogbmFtZSAqLyAnbmdJbmplY3RvckRlZicsXG4gICAgICAgICAgLyogdHlwZSAqLyBvLklORkVSUkVEX1RZUEUsXG4gICAgICAgICAgLyogbW9kaWZpZXJzICovW28uU3RtdE1vZGlmaWVyLlN0YXRpY10sXG4gICAgICAgICAgLyogaW5pdGlhbGl6ZXIgKi8gaW5qZWN0b3JEZWYsICldLFxuICAgICAgLyogZ2V0dGVycyAqL1tdLFxuICAgICAgLyogY29uc3RydWN0b3JNZXRob2QgKi8gbmV3IG8uQ2xhc3NNZXRob2QobnVsbCwgW10sIFtdKSxcbiAgICAgIC8qIG1ldGhvZHMgKi9bXSkpO1xufVxuXG5mdW5jdGlvbiBhY2Nlc3NFeHBvcnRTY29wZShtb2R1bGU6IG8uRXhwcmVzc2lvbik6IG8uRXhwcmVzc2lvbiB7XG4gIGNvbnN0IHNlbGVjdG9yU2NvcGUgPSBuZXcgby5SZWFkUHJvcEV4cHIobW9kdWxlLCAnbmdNb2R1bGVEZWYnKTtcbiAgcmV0dXJuIG5ldyBvLlJlYWRQcm9wRXhwcihzZWxlY3RvclNjb3BlLCAnZXhwb3J0ZWQnKTtcbn1cblxuZnVuY3Rpb24gdHVwbGVUeXBlT2YoZXhwOiBSM1JlZmVyZW5jZVtdKTogby5UeXBlIHtcbiAgY29uc3QgdHlwZXMgPSBleHAubWFwKHJlZiA9PiBvLnR5cGVvZkV4cHIocmVmLnR5cGUpKTtcbiAgcmV0dXJuIGV4cC5sZW5ndGggPiAwID8gby5leHByZXNzaW9uVHlwZShvLmxpdGVyYWxBcnIodHlwZXMpKSA6IG8uTk9ORV9UWVBFO1xufSJdfQ==