/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
var CORE = '@angular/core';
var Identifiers = /** @class */ (function () {
    function Identifiers() {
    }
    Identifiers.ANALYZE_FOR_ENTRY_COMPONENTS = {
        name: 'ANALYZE_FOR_ENTRY_COMPONENTS',
        moduleName: CORE,
    };
    Identifiers.ElementRef = { name: 'ElementRef', moduleName: CORE };
    Identifiers.NgModuleRef = { name: 'NgModuleRef', moduleName: CORE };
    Identifiers.ViewContainerRef = { name: 'ViewContainerRef', moduleName: CORE };
    Identifiers.ChangeDetectorRef = {
        name: 'ChangeDetectorRef',
        moduleName: CORE,
    };
    Identifiers.QueryList = { name: 'QueryList', moduleName: CORE };
    Identifiers.TemplateRef = { name: 'TemplateRef', moduleName: CORE };
    Identifiers.Renderer2 = { name: 'Renderer2', moduleName: CORE };
    Identifiers.CodegenComponentFactoryResolver = {
        name: 'ɵCodegenComponentFactoryResolver',
        moduleName: CORE,
    };
    Identifiers.ComponentFactoryResolver = {
        name: 'ComponentFactoryResolver',
        moduleName: CORE,
    };
    Identifiers.ComponentFactory = { name: 'ComponentFactory', moduleName: CORE };
    Identifiers.ComponentRef = { name: 'ComponentRef', moduleName: CORE };
    Identifiers.NgModuleFactory = { name: 'NgModuleFactory', moduleName: CORE };
    Identifiers.createModuleFactory = {
        name: 'ɵcmf',
        moduleName: CORE,
    };
    Identifiers.moduleDef = {
        name: 'ɵmod',
        moduleName: CORE,
    };
    Identifiers.moduleProviderDef = {
        name: 'ɵmpd',
        moduleName: CORE,
    };
    Identifiers.RegisterModuleFactoryFn = {
        name: 'ɵregisterModuleFactory',
        moduleName: CORE,
    };
    Identifiers.inject = { name: 'inject', moduleName: CORE };
    Identifiers.INJECTOR = { name: 'INJECTOR', moduleName: CORE };
    Identifiers.Injector = { name: 'Injector', moduleName: CORE };
    Identifiers.defineInjectable = { name: 'defineInjectable', moduleName: CORE };
    Identifiers.InjectableDef = { name: 'ɵInjectableDef', moduleName: CORE };
    Identifiers.ViewEncapsulation = {
        name: 'ViewEncapsulation',
        moduleName: CORE,
    };
    Identifiers.ChangeDetectionStrategy = {
        name: 'ChangeDetectionStrategy',
        moduleName: CORE,
    };
    Identifiers.SecurityContext = {
        name: 'SecurityContext',
        moduleName: CORE,
    };
    Identifiers.LOCALE_ID = { name: 'LOCALE_ID', moduleName: CORE };
    Identifiers.TRANSLATIONS_FORMAT = {
        name: 'TRANSLATIONS_FORMAT',
        moduleName: CORE,
    };
    Identifiers.inlineInterpolate = {
        name: 'ɵinlineInterpolate',
        moduleName: CORE,
    };
    Identifiers.interpolate = { name: 'ɵinterpolate', moduleName: CORE };
    Identifiers.EMPTY_ARRAY = { name: 'ɵEMPTY_ARRAY', moduleName: CORE };
    Identifiers.EMPTY_MAP = { name: 'ɵEMPTY_MAP', moduleName: CORE };
    Identifiers.Renderer = { name: 'Renderer', moduleName: CORE };
    Identifiers.viewDef = { name: 'ɵvid', moduleName: CORE };
    Identifiers.elementDef = { name: 'ɵeld', moduleName: CORE };
    Identifiers.anchorDef = { name: 'ɵand', moduleName: CORE };
    Identifiers.textDef = { name: 'ɵted', moduleName: CORE };
    Identifiers.directiveDef = { name: 'ɵdid', moduleName: CORE };
    Identifiers.providerDef = { name: 'ɵprd', moduleName: CORE };
    Identifiers.queryDef = { name: 'ɵqud', moduleName: CORE };
    Identifiers.pureArrayDef = { name: 'ɵpad', moduleName: CORE };
    Identifiers.pureObjectDef = { name: 'ɵpod', moduleName: CORE };
    Identifiers.purePipeDef = { name: 'ɵppd', moduleName: CORE };
    Identifiers.pipeDef = { name: 'ɵpid', moduleName: CORE };
    Identifiers.nodeValue = { name: 'ɵnov', moduleName: CORE };
    Identifiers.ngContentDef = { name: 'ɵncd', moduleName: CORE };
    Identifiers.unwrapValue = { name: 'ɵunv', moduleName: CORE };
    Identifiers.createRendererType2 = { name: 'ɵcrt', moduleName: CORE };
    // type only
    Identifiers.RendererType2 = {
        name: 'RendererType2',
        moduleName: CORE,
    };
    // type only
    Identifiers.ViewDefinition = {
        name: 'ɵViewDefinition',
        moduleName: CORE,
    };
    Identifiers.createComponentFactory = { name: 'ɵccf', moduleName: CORE };
    Identifiers.setClassMetadata = { name: 'ɵsetClassMetadata', moduleName: CORE };
    return Identifiers;
}());
export { Identifiers };
export function createTokenForReference(reference) {
    return { identifier: { reference: reference } };
}
export function createTokenForExternalReference(reflector, reference) {
    return createTokenForReference(reflector.resolveExternalReference(reference));
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaWRlbnRpZmllcnMuanMiLCJzb3VyY2VSb290IjoiLi4vLi4vIiwic291cmNlcyI6WyJwYWNrYWdlcy9jb21waWxlci9zcmMvaWRlbnRpZmllcnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBTUgsSUFBTSxJQUFJLEdBQUcsZUFBZSxDQUFDO0FBRTdCO0lBQUE7SUFnSEEsQ0FBQztJQS9HUSx3Q0FBNEIsR0FBd0I7UUFDekQsSUFBSSxFQUFFLDhCQUE4QjtRQUNwQyxVQUFVLEVBQUUsSUFBSTtLQUVqQixDQUFDO0lBQ0ssc0JBQVUsR0FBd0IsRUFBQyxJQUFJLEVBQUUsWUFBWSxFQUFFLFVBQVUsRUFBRSxJQUFJLEVBQUMsQ0FBQztJQUN6RSx1QkFBVyxHQUF3QixFQUFDLElBQUksRUFBRSxhQUFhLEVBQUUsVUFBVSxFQUFFLElBQUksRUFBQyxDQUFDO0lBQzNFLDRCQUFnQixHQUF3QixFQUFDLElBQUksRUFBRSxrQkFBa0IsRUFBRSxVQUFVLEVBQUUsSUFBSSxFQUFDLENBQUM7SUFDckYsNkJBQWlCLEdBQXdCO1FBQzlDLElBQUksRUFBRSxtQkFBbUI7UUFDekIsVUFBVSxFQUFFLElBQUk7S0FFakIsQ0FBQztJQUNLLHFCQUFTLEdBQXdCLEVBQUMsSUFBSSxFQUFFLFdBQVcsRUFBRSxVQUFVLEVBQUUsSUFBSSxFQUFDLENBQUM7SUFDdkUsdUJBQVcsR0FBd0IsRUFBQyxJQUFJLEVBQUUsYUFBYSxFQUFFLFVBQVUsRUFBRSxJQUFJLEVBQUMsQ0FBQztJQUMzRSxxQkFBUyxHQUF3QixFQUFDLElBQUksRUFBRSxXQUFXLEVBQUUsVUFBVSxFQUFFLElBQUksRUFBQyxDQUFDO0lBQ3ZFLDJDQUErQixHQUF3QjtRQUM1RCxJQUFJLEVBQUUsa0NBQWtDO1FBQ3hDLFVBQVUsRUFBRSxJQUFJO0tBRWpCLENBQUM7SUFDSyxvQ0FBd0IsR0FBd0I7UUFDckQsSUFBSSxFQUFFLDBCQUEwQjtRQUNoQyxVQUFVLEVBQUUsSUFBSTtLQUVqQixD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LFVBQVUsRUFBRSxJQUFJO0tBQ2pCLENBQUM7SUFDSyxrQ0FBc0IsR0FBd0IsRUFBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLFVBQVUsRUFBRSxJQUFJLEVBQUMsQ0FBQztJQUMvRSw0QkFBZ0IsR0FBd0IsRUFBQyxJQUFJLEVBQUUsbUJBQW1CLEVBQUUsVUFBVSxFQUFFLElBQUksRUFBQyxDQUFDO0lBQy9GLGtCQUFDO0NBQUEsQUFoSEQsSUFnSEM7U0FoSFksV0FBVztBQWtIeEIsTUFBTSxVQUFVLHVCQUF1QixDQUFDLFNBQWM7SUFDcEQsT0FBTyxFQUFDLFVBQVUsRUFBRSxFQUFDLFNBQVMsRUFBRSxTQUFTLEVBQUMsRUFBQyxDQUFDO0FBQzlDLENBQUM7QUFFRCxNQUFNLFVBQVUsK0JBQStCLENBQzNDLFNBQTJCLEVBQUUsU0FBOEI7SUFDN0QsT0FBTyx1QkFBdUIsQ0FBQyxTQUFTLENBQUMsd0JBQXdCLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztBQUNoRixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0NvbXBpbGVUb2tlbk1ldGFkYXRhfSBmcm9tICcuL2NvbXBpbGVfbWV0YWRhdGEnO1xuaW1wb3J0IHtDb21waWxlUmVmbGVjdG9yfSBmcm9tICcuL2NvbXBpbGVfcmVmbGVjdG9yJztcbmltcG9ydCAqIGFzIG8gZnJvbSAnLi9vdXRwdXQvb3V0cHV0X2FzdCc7XG5cbmNvbnN0IENPUkUgPSAnQGFuZ3VsYXIvY29yZSc7XG5cbmV4cG9ydCBjbGFzcyBJZGVudGlmaWVycyB7XG4gIHN0YXRpYyBBTkFMWVpFX0ZPUl9FTlRSWV9DT01QT05FTlRTOiBvLkV4dGVybmFsUmVmZXJlbmNlID0ge1xuICAgIG5hbWU6ICdBTkFMWVpFX0ZPUl9FTlRSWV9DT01QT05FTlRTJyxcbiAgICBtb2R1bGVOYW1lOiBDT1JFLFxuXG4gIH07XG4gIHN0YXRpYyBFbGVtZW50UmVmOiBvLkV4dGVybmFsUmVmZXJlbmNlID0ge25hbWU6ICdFbGVtZW50UmVmJywgbW9kdWxlTmFtZTogQ09SRX07XG4gIHN0YXRpYyBOZ01vZHVsZVJlZjogby5FeHRlcm5hbFJlZmVyZW5jZSA9IHtuYW1lOiAnTmdNb2R1bGVSZWYnLCBtb2R1bGVOYW1lOiBDT1JFfTtcbiAgc3RhdGljIFZpZXdDb250YWluZXJSZWY6IG8uRXh0ZXJuYWxSZWZlcmVuY2UgPSB7bmFtZTogJ1ZpZXdDb250YWluZXJSZWYnLCBtb2R1bGVOYW1lOiBDT1JFfTtcbiAgc3RhdGljIENoYW5nZURldGVjdG9yUmVmOiBvLkV4dGVybmFsUmVmZXJlbmNlID0ge1xuICAgIG5hbWU6ICdDaGFuZ2VEZXRlY3RvclJlZicsXG4gICAgbW9kdWxlTmFtZTogQ09SRSxcblxuICB9O1xuICBzdGF0aWMgUXVlcnlMaXN0OiBvLkV4dGVybmFsUmVmZXJlbmNlID0ge25hbWU6ICdRdWVyeUxpc3QnLCBtb2R1bGVOYW1lOiBDT1JFfTtcbiAgc3RhdGljIFRlbXBsYXRlUmVmOiBvLkV4dGVybmFsUmVmZXJlbmNlID0ge25hbWU6ICdUZW1wbGF0ZVJlZicsIG1vZHVsZU5hbWU6IENPUkV9O1xuICBzdGF0aWMgUmVuZGVyZXIyOiBvLkV4dGVybmFsUmVmZXJlbmNlID0ge25hbWU6ICdSZW5kZXJlcjInLCBtb2R1bGVOYW1lOiBDT1JFfTtcbiAgc3RhdGljIENvZGVnZW5Db21wb25lbnRGYWN0b3J5UmVzb2x2ZXI6IG8uRXh0ZXJuYWxSZWZlcmVuY2UgPSB7XG4gICAgbmFtZTogJ8m1Q29kZWdlbkNvbXBvbmVudEZhY3RvcnlSZXNvbHZlcicsXG4gICAgbW9kdWxlTmFtZTogQ09SRSxcblxuICB9O1xuICBzdGF0aWMgQ29tcG9uZW50RmFjdG9yeVJlc29sdmVyOiBvLkV4dGVybmFsUmVmZXJlbmNlID0ge1xuICAgIG5hbWU6ICdDb21wb25lbnRGYWN0b3J5UmVzb2x2ZXInLFxuICAgIG1vZHVsZU5hbWU6IENPUkUsXG5cbiAgfTtcbiAgc3RhdGljIENvbXBvbmVudEZhY3Rvcnk6IG8uRXh0ZXJuYWxSZWZlcmVuY2UgPSB7bmFtZTogJ0NvbXBvbmVudEZhY3RvcnknLCBtb2R1bGVOYW1lOiBDT1JFfTtcbiAgc3RhdGljIENvbXBvbmVudFJlZjogby5FeHRlcm5hbFJlZmVyZW5jZSA9IHtuYW1lOiAnQ29tcG9uZW50UmVmJywgbW9kdWxlTmFtZTogQ09SRX07XG4gIHN0YXRpYyBOZ01vZHVsZUZhY3Rvcnk6IG8uRXh0ZXJuYWxSZWZlcmVuY2UgPSB7bmFtZTogJ05nTW9kdWxlRmFjdG9yeScsIG1vZHVsZU5hbWU6IENPUkV9O1xuICBzdGF0aWMgY3JlYXRlTW9kdWxlRmFjdG9yeTogby5FeHRlcm5hbFJlZmVyZW5jZSA9IHtcbiAgICBuYW1lOiAnybVjbWYnLFxuICAgIG1vZHVsZU5hbWU6IENPUkUsXG5cbiAgfTtcbiAgc3RhdGljIG1vZHVsZURlZjogby5FeHRlcm5hbFJlZmVyZW5jZSA9IHtcbiAgICBuYW1lOiAnybVtb2QnLFxuICAgIG1vZHVsZU5hbWU6IENPUkUsXG5cbiAgfTtcbiAgc3RhdGljIG1vZHVsZVByb3ZpZGVyRGVmOiBvLkV4dGVybmFsUmVmZXJlbmNlID0ge1xuICAgIG5hbWU6ICfJtW1wZCcsXG4gICAgbW9kdWxlTmFtZTogQ09SRSxcblxuICB9O1xuICBzdGF0aWMgUmVnaXN0ZXJNb2R1bGVGYWN0b3J5Rm46IG8uRXh0ZXJuYWxSZWZlcmVuY2UgPSB7XG4gICAgbmFtZTogJ8m1cmVnaXN0ZXJNb2R1bGVGYWN0b3J5JyxcbiAgICBtb2R1bGVOYW1lOiBDT1JFLFxuXG4gIH07XG4gIHN0YXRpYyBpbmplY3Q6IG8uRXh0ZXJuYWxSZWZlcmVuY2UgPSB7bmFtZTogJ2luamVjdCcsIG1vZHVsZU5hbWU6IENPUkV9O1xuICBzdGF0aWMgSU5KRUNUT1I6IG8uRXh0ZXJuYWxSZWZlcmVuY2UgPSB7bmFtZTogJ0lOSkVDVE9SJywgbW9kdWxlTmFtZTogQ09SRX07XG4gIHN0YXRpYyBJbmplY3Rvcjogby5FeHRlcm5hbFJlZmVyZW5jZSA9IHtuYW1lOiAnSW5qZWN0b3InLCBtb2R1bGVOYW1lOiBDT1JFfTtcbiAgc3RhdGljIGRlZmluZUluamVjdGFibGU6IG8uRXh0ZXJuYWxSZWZlcmVuY2UgPSB7bmFtZTogJ2RlZmluZUluamVjdGFibGUnLCBtb2R1bGVOYW1lOiBDT1JFfTtcbiAgc3RhdGljIEluamVjdGFibGVEZWY6IG8uRXh0ZXJuYWxSZWZlcmVuY2UgPSB7bmFtZTogJ8m1SW5qZWN0YWJsZURlZicsIG1vZHVsZU5hbWU6IENPUkV9O1xuICBzdGF0aWMgVmlld0VuY2Fwc3VsYXRpb246IG8uRXh0ZXJuYWxSZWZlcmVuY2UgPSB7XG4gICAgbmFtZTogJ1ZpZXdFbmNhcHN1bGF0aW9uJyxcbiAgICBtb2R1bGVOYW1lOiBDT1JFLFxuXG4gIH07XG4gIHN0YXRpYyBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneTogby5FeHRlcm5hbFJlZmVyZW5jZSA9IHtcbiAgICBuYW1lOiAnQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3knLFxuICAgIG1vZHVsZU5hbWU6IENPUkUsXG5cbiAgfTtcbiAgc3RhdGljIFNlY3VyaXR5Q29udGV4dDogby5FeHRlcm5hbFJlZmVyZW5jZSA9IHtcbiAgICBuYW1lOiAnU2VjdXJpdHlDb250ZXh0JyxcbiAgICBtb2R1bGVOYW1lOiBDT1JFLFxuXG4gIH07XG4gIHN0YXRpYyBMT0NBTEVfSUQ6IG8uRXh0ZXJuYWxSZWZlcmVuY2UgPSB7bmFtZTogJ0xPQ0FMRV9JRCcsIG1vZHVsZU5hbWU6IENPUkV9O1xuICBzdGF0aWMgVFJBTlNMQVRJT05TX0ZPUk1BVDogby5FeHRlcm5hbFJlZmVyZW5jZSA9IHtcbiAgICBuYW1lOiAnVFJBTlNMQVRJT05TX0ZPUk1BVCcsXG4gICAgbW9kdWxlTmFtZTogQ09SRSxcblxuICB9O1xuICBzdGF0aWMgaW5saW5lSW50ZXJwb2xhdGU6IG8uRXh0ZXJuYWxSZWZlcmVuY2UgPSB7XG4gICAgbmFtZTogJ8m1aW5saW5lSW50ZXJwb2xhdGUnLFxuICAgIG1vZHVsZU5hbWU6IENPUkUsXG4gIH07XG4gIHN0YXRpYyBpbnRlcnBvbGF0ZTogby5FeHRlcm5hbFJlZmVyZW5jZSA9IHtuYW1lOiAnybVpbnRlcnBvbGF0ZScsIG1vZHVsZU5hbWU6IENPUkV9O1xuICBzdGF0aWMgRU1QVFlfQVJSQVk6IG8uRXh0ZXJuYWxSZWZlcmVuY2UgPSB7bmFtZTogJ8m1RU1QVFlfQVJSQVknLCBtb2R1bGVOYW1lOiBDT1JFfTtcbiAgc3RhdGljIEVNUFRZX01BUDogby5FeHRlcm5hbFJlZmVyZW5jZSA9IHtuYW1lOiAnybVFTVBUWV9NQVAnLCBtb2R1bGVOYW1lOiBDT1JFfTtcbiAgc3RhdGljIFJlbmRlcmVyOiBvLkV4dGVybmFsUmVmZXJlbmNlID0ge25hbWU6ICdSZW5kZXJlcicsIG1vZHVsZU5hbWU6IENPUkV9O1xuICBzdGF0aWMgdmlld0RlZjogby5FeHRlcm5hbFJlZmVyZW5jZSA9IHtuYW1lOiAnybV2aWQnLCBtb2R1bGVOYW1lOiBDT1JFfTtcbiAgc3RhdGljIGVsZW1lbnREZWY6IG8uRXh0ZXJuYWxSZWZlcmVuY2UgPSB7bmFtZTogJ8m1ZWxkJywgbW9kdWxlTmFtZTogQ09SRX07XG4gIHN0YXRpYyBhbmNob3JEZWY6IG8uRXh0ZXJuYWxSZWZlcmVuY2UgPSB7bmFtZTogJ8m1YW5kJywgbW9kdWxlTmFtZTogQ09SRX07XG4gIHN0YXRpYyB0ZXh0RGVmOiBvLkV4dGVybmFsUmVmZXJlbmNlID0ge25hbWU6ICfJtXRlZCcsIG1vZHVsZU5hbWU6IENPUkV9O1xuICBzdGF0aWMgZGlyZWN0aXZlRGVmOiBvLkV4dGVybmFsUmVmZXJlbmNlID0ge25hbWU6ICfJtWRpZCcsIG1vZHVsZU5hbWU6IENPUkV9O1xuICBzdGF0aWMgcHJvdmlkZXJEZWY6IG8uRXh0ZXJuYWxSZWZlcmVuY2UgPSB7bmFtZTogJ8m1cHJkJywgbW9kdWxlTmFtZTogQ09SRX07XG4gIHN0YXRpYyBxdWVyeURlZjogby5FeHRlcm5hbFJlZmVyZW5jZSA9IHtuYW1lOiAnybVxdWQnLCBtb2R1bGVOYW1lOiBDT1JFfTtcbiAgc3RhdGljIHB1cmVBcnJheURlZjogby5FeHRlcm5hbFJlZmVyZW5jZSA9IHtuYW1lOiAnybVwYWQnLCBtb2R1bGVOYW1lOiBDT1JFfTtcbiAgc3RhdGljIHB1cmVPYmplY3REZWY6IG8uRXh0ZXJuYWxSZWZlcmVuY2UgPSB7bmFtZTogJ8m1cG9kJywgbW9kdWxlTmFtZTogQ09SRX07XG4gIHN0YXRpYyBwdXJlUGlwZURlZjogby5FeHRlcm5hbFJlZmVyZW5jZSA9IHtuYW1lOiAnybVwcGQnLCBtb2R1bGVOYW1lOiBDT1JFfTtcbiAgc3RhdGljIHBpcGVEZWY6IG8uRXh0ZXJuYWxSZWZlcmVuY2UgPSB7bmFtZTogJ8m1cGlkJywgbW9kdWxlTmFtZTogQ09SRX07XG4gIHN0YXRpYyBub2RlVmFsdWU6IG8uRXh0ZXJuYWxSZWZlcmVuY2UgPSB7bmFtZTogJ8m1bm92JywgbW9kdWxlTmFtZTogQ09SRX07XG4gIHN0YXRpYyBuZ0NvbnRlbnREZWY6IG8uRXh0ZXJuYWxSZWZlcmVuY2UgPSB7bmFtZTogJ8m1bmNkJywgbW9kdWxlTmFtZTogQ09SRX07XG4gIHN0YXRpYyB1bndyYXBWYWx1ZTogby5FeHRlcm5hbFJlZmVyZW5jZSA9IHtuYW1lOiAnybV1bnYnLCBtb2R1bGVOYW1lOiBDT1JFfTtcbiAgc3RhdGljIGNyZWF0ZVJlbmRlcmVyVHlwZTI6IG8uRXh0ZXJuYWxSZWZlcmVuY2UgPSB7bmFtZTogJ8m1Y3J0JywgbW9kdWxlTmFtZTogQ09SRX07XG4gIC8vIHR5cGUgb25seVxuICBzdGF0aWMgUmVuZGVyZXJUeXBlMjogby5FeHRlcm5hbFJlZmVyZW5jZSA9IHtcbiAgICBuYW1lOiAnUmVuZGVyZXJUeXBlMicsXG4gICAgbW9kdWxlTmFtZTogQ09SRSxcblxuICB9O1xuICAvLyB0eXBlIG9ubHlcbiAgc3RhdGljIFZpZXdEZWZpbml0aW9uOiBvLkV4dGVybmFsUmVmZXJlbmNlID0ge1xuICAgIG5hbWU6ICfJtVZpZXdEZWZpbml0aW9uJyxcbiAgICBtb2R1bGVOYW1lOiBDT1JFLFxuICB9O1xuICBzdGF0aWMgY3JlYXRlQ29tcG9uZW50RmFjdG9yeTogby5FeHRlcm5hbFJlZmVyZW5jZSA9IHtuYW1lOiAnybVjY2YnLCBtb2R1bGVOYW1lOiBDT1JFfTtcbiAgc3RhdGljIHNldENsYXNzTWV0YWRhdGE6IG8uRXh0ZXJuYWxSZWZlcmVuY2UgPSB7bmFtZTogJ8m1c2V0Q2xhc3NNZXRhZGF0YScsIG1vZHVsZU5hbWU6IENPUkV9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlVG9rZW5Gb3JSZWZlcmVuY2UocmVmZXJlbmNlOiBhbnkpOiBDb21waWxlVG9rZW5NZXRhZGF0YSB7XG4gIHJldHVybiB7aWRlbnRpZmllcjoge3JlZmVyZW5jZTogcmVmZXJlbmNlfX07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVUb2tlbkZvckV4dGVybmFsUmVmZXJlbmNlKFxuICAgIHJlZmxlY3RvcjogQ29tcGlsZVJlZmxlY3RvciwgcmVmZXJlbmNlOiBvLkV4dGVybmFsUmVmZXJlbmNlKTogQ29tcGlsZVRva2VuTWV0YWRhdGEge1xuICByZXR1cm4gY3JlYXRlVG9rZW5Gb3JSZWZlcmVuY2UocmVmbGVjdG9yLnJlc29sdmVFeHRlcm5hbFJlZmVyZW5jZShyZWZlcmVuY2UpKTtcbn1cbiJdfQ==