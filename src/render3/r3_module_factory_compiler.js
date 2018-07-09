/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler/src/render3/r3_module_factory_compiler", ["require", "exports", "@angular/compiler/src/compile_metadata", "@angular/compiler/src/output/output_ast", "@angular/compiler/src/render3/r3_identifiers"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var compile_metadata_1 = require("@angular/compiler/src/compile_metadata");
    var o = require("@angular/compiler/src/output/output_ast");
    var r3_identifiers_1 = require("@angular/compiler/src/render3/r3_identifiers");
    /**
     * Write a Renderer2 compatibility module factory to the output context.
     */
    function compileModuleFactory(outputCtx, module, backPatchReferenceOf, resolver) {
        var ngModuleFactoryVar = compile_metadata_1.identifierName(module.type) + "NgFactory";
        var parentInjector = 'parentInjector';
        var createFunction = o.fn([new o.FnParam(parentInjector, o.DYNAMIC_TYPE)], [new o.IfStmt(o.THIS_EXPR.prop(r3_identifiers_1.Identifiers.PATCH_DEPS).notIdentical(o.literal(true, o.INFERRED_TYPE)), [
                o.THIS_EXPR.prop(r3_identifiers_1.Identifiers.PATCH_DEPS).set(o.literal(true, o.INFERRED_TYPE)).toStmt(),
                backPatchReferenceOf(module.type).callFn([]).toStmt()
            ])], o.INFERRED_TYPE, null, ngModuleFactoryVar + "_Create");
        var moduleFactoryLiteral = o.literalMap([
            { key: 'moduleType', value: outputCtx.importExpr(module.type.reference), quoted: false },
            { key: 'create', value: createFunction, quoted: false }
        ]);
        outputCtx.statements.push(o.variable(ngModuleFactoryVar).set(moduleFactoryLiteral).toDeclStmt(o.DYNAMIC_TYPE, [
            o.StmtModifier.Exported, o.StmtModifier.Final
        ]));
    }
    exports.compileModuleFactory = compileModuleFactory;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicjNfbW9kdWxlX2ZhY3RvcnlfY29tcGlsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci9zcmMvcmVuZGVyMy9yM19tb2R1bGVfZmFjdG9yeV9jb21waWxlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7OztJQUVILDJFQUFpRztJQUVqRywyREFBMEM7SUFHMUMsK0VBQW1EO0lBRW5EOztPQUVHO0lBQ0gsOEJBQ0ksU0FBd0IsRUFBRSxNQUErQixFQUN6RCxvQkFBbUUsRUFDbkUsUUFBaUM7UUFDbkMsSUFBTSxrQkFBa0IsR0FBTSxpQ0FBYyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsY0FBVyxDQUFDO1FBRXJFLElBQU0sY0FBYyxHQUFHLGdCQUFnQixDQUFDO1FBQ3hDLElBQU0sY0FBYyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQ3ZCLENBQUMsSUFBSSxDQUFDLENBQUMsT0FBTyxDQUFDLGNBQWMsRUFBRSxDQUFDLENBQUMsWUFBWSxDQUFDLENBQUMsRUFDL0MsQ0FBQyxJQUFJLENBQUMsQ0FBQyxNQUFNLENBQ1QsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsNEJBQUUsQ0FBQyxVQUFVLENBQUMsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxDQUFDLEVBQzlFO2dCQUNFLENBQUMsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLDRCQUFFLENBQUMsVUFBVSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBRTtnQkFDOUUsb0JBQW9CLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQyxNQUFNLEVBQUU7YUFDdEQsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLGFBQWEsRUFBRSxJQUFJLEVBQUssa0JBQWtCLFlBQVMsQ0FBQyxDQUFDO1FBRTNELElBQU0sb0JBQW9CLEdBQUcsQ0FBQyxDQUFDLFVBQVUsQ0FBQztZQUN4QyxFQUFDLEdBQUcsRUFBRSxZQUFZLEVBQUUsS0FBSyxFQUFFLFNBQVMsQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFDO1lBQ3RGLEVBQUMsR0FBRyxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUUsY0FBYyxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUM7U0FDdEQsQ0FBQyxDQUFDO1FBRUgsU0FBUyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQ3JCLENBQUMsQ0FBQyxRQUFRLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxHQUFHLENBQUMsb0JBQW9CLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLFlBQVksRUFBRTtZQUNsRixDQUFDLENBQUMsWUFBWSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsWUFBWSxDQUFDLEtBQUs7U0FDOUMsQ0FBQyxDQUFDLENBQUM7SUFDVixDQUFDO0lBMUJELG9EQTBCQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtDb21waWxlTmdNb2R1bGVNZXRhZGF0YSwgQ29tcGlsZVR5cGVNZXRhZGF0YSwgaWRlbnRpZmllck5hbWV9IGZyb20gJy4uL2NvbXBpbGVfbWV0YWRhdGEnO1xuaW1wb3J0IHtDb21waWxlTWV0YWRhdGFSZXNvbHZlcn0gZnJvbSAnLi4vbWV0YWRhdGFfcmVzb2x2ZXInO1xuaW1wb3J0ICogYXMgbyBmcm9tICcuLi9vdXRwdXQvb3V0cHV0X2FzdCc7XG5pbXBvcnQge091dHB1dENvbnRleHR9IGZyb20gJy4uL3V0aWwnO1xuXG5pbXBvcnQge0lkZW50aWZpZXJzIGFzIFIzfSBmcm9tICcuL3IzX2lkZW50aWZpZXJzJztcblxuLyoqXG4gKiBXcml0ZSBhIFJlbmRlcmVyMiBjb21wYXRpYmlsaXR5IG1vZHVsZSBmYWN0b3J5IHRvIHRoZSBvdXRwdXQgY29udGV4dC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNvbXBpbGVNb2R1bGVGYWN0b3J5KFxuICAgIG91dHB1dEN0eDogT3V0cHV0Q29udGV4dCwgbW9kdWxlOiBDb21waWxlTmdNb2R1bGVNZXRhZGF0YSxcbiAgICBiYWNrUGF0Y2hSZWZlcmVuY2VPZjogKG1vZHVsZTogQ29tcGlsZVR5cGVNZXRhZGF0YSkgPT4gby5FeHByZXNzaW9uLFxuICAgIHJlc29sdmVyOiBDb21waWxlTWV0YWRhdGFSZXNvbHZlcikge1xuICBjb25zdCBuZ01vZHVsZUZhY3RvcnlWYXIgPSBgJHtpZGVudGlmaWVyTmFtZShtb2R1bGUudHlwZSl9TmdGYWN0b3J5YDtcblxuICBjb25zdCBwYXJlbnRJbmplY3RvciA9ICdwYXJlbnRJbmplY3Rvcic7XG4gIGNvbnN0IGNyZWF0ZUZ1bmN0aW9uID0gby5mbihcbiAgICAgIFtuZXcgby5GblBhcmFtKHBhcmVudEluamVjdG9yLCBvLkRZTkFNSUNfVFlQRSldLFxuICAgICAgW25ldyBvLklmU3RtdChcbiAgICAgICAgICBvLlRISVNfRVhQUi5wcm9wKFIzLlBBVENIX0RFUFMpLm5vdElkZW50aWNhbChvLmxpdGVyYWwodHJ1ZSwgby5JTkZFUlJFRF9UWVBFKSksXG4gICAgICAgICAgW1xuICAgICAgICAgICAgby5USElTX0VYUFIucHJvcChSMy5QQVRDSF9ERVBTKS5zZXQoby5saXRlcmFsKHRydWUsIG8uSU5GRVJSRURfVFlQRSkpLnRvU3RtdCgpLFxuICAgICAgICAgICAgYmFja1BhdGNoUmVmZXJlbmNlT2YobW9kdWxlLnR5cGUpLmNhbGxGbihbXSkudG9TdG10KClcbiAgICAgICAgICBdKV0sXG4gICAgICBvLklORkVSUkVEX1RZUEUsIG51bGwsIGAke25nTW9kdWxlRmFjdG9yeVZhcn1fQ3JlYXRlYCk7XG5cbiAgY29uc3QgbW9kdWxlRmFjdG9yeUxpdGVyYWwgPSBvLmxpdGVyYWxNYXAoW1xuICAgIHtrZXk6ICdtb2R1bGVUeXBlJywgdmFsdWU6IG91dHB1dEN0eC5pbXBvcnRFeHByKG1vZHVsZS50eXBlLnJlZmVyZW5jZSksIHF1b3RlZDogZmFsc2V9LFxuICAgIHtrZXk6ICdjcmVhdGUnLCB2YWx1ZTogY3JlYXRlRnVuY3Rpb24sIHF1b3RlZDogZmFsc2V9XG4gIF0pO1xuXG4gIG91dHB1dEN0eC5zdGF0ZW1lbnRzLnB1c2goXG4gICAgICBvLnZhcmlhYmxlKG5nTW9kdWxlRmFjdG9yeVZhcikuc2V0KG1vZHVsZUZhY3RvcnlMaXRlcmFsKS50b0RlY2xTdG10KG8uRFlOQU1JQ19UWVBFLCBbXG4gICAgICAgIG8uU3RtdE1vZGlmaWVyLkV4cG9ydGVkLCBvLlN0bXRNb2RpZmllci5GaW5hbFxuICAgICAgXSkpO1xufVxuIl19