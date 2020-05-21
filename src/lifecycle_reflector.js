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
        define("@angular/compiler/src/lifecycle_reflector", ["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getAllLifecycleHooks = exports.hasLifecycleHook = exports.LIFECYCLE_HOOKS_VALUES = exports.LifecycleHooks = void 0;
    var LifecycleHooks;
    (function (LifecycleHooks) {
        LifecycleHooks[LifecycleHooks["OnInit"] = 0] = "OnInit";
        LifecycleHooks[LifecycleHooks["OnDestroy"] = 1] = "OnDestroy";
        LifecycleHooks[LifecycleHooks["DoCheck"] = 2] = "DoCheck";
        LifecycleHooks[LifecycleHooks["OnChanges"] = 3] = "OnChanges";
        LifecycleHooks[LifecycleHooks["AfterContentInit"] = 4] = "AfterContentInit";
        LifecycleHooks[LifecycleHooks["AfterContentChecked"] = 5] = "AfterContentChecked";
        LifecycleHooks[LifecycleHooks["AfterViewInit"] = 6] = "AfterViewInit";
        LifecycleHooks[LifecycleHooks["AfterViewChecked"] = 7] = "AfterViewChecked";
    })(LifecycleHooks = exports.LifecycleHooks || (exports.LifecycleHooks = {}));
    exports.LIFECYCLE_HOOKS_VALUES = [
        LifecycleHooks.OnInit, LifecycleHooks.OnDestroy, LifecycleHooks.DoCheck, LifecycleHooks.OnChanges,
        LifecycleHooks.AfterContentInit, LifecycleHooks.AfterContentChecked, LifecycleHooks.AfterViewInit,
        LifecycleHooks.AfterViewChecked
    ];
    function hasLifecycleHook(reflector, hook, token) {
        return reflector.hasLifecycleHook(token, getHookName(hook));
    }
    exports.hasLifecycleHook = hasLifecycleHook;
    function getAllLifecycleHooks(reflector, token) {
        return exports.LIFECYCLE_HOOKS_VALUES.filter(function (hook) { return hasLifecycleHook(reflector, hook, token); });
    }
    exports.getAllLifecycleHooks = getAllLifecycleHooks;
    function getHookName(hook) {
        switch (hook) {
            case LifecycleHooks.OnInit:
                return 'ngOnInit';
            case LifecycleHooks.OnDestroy:
                return 'ngOnDestroy';
            case LifecycleHooks.DoCheck:
                return 'ngDoCheck';
            case LifecycleHooks.OnChanges:
                return 'ngOnChanges';
            case LifecycleHooks.AfterContentInit:
                return 'ngAfterContentInit';
            case LifecycleHooks.AfterContentChecked:
                return 'ngAfterContentChecked';
            case LifecycleHooks.AfterViewInit:
                return 'ngAfterViewInit';
            case LifecycleHooks.AfterViewChecked:
                return 'ngAfterViewChecked';
            default:
                // This default case is not needed by TypeScript compiler, as the switch is exhaustive.
                // However Closure Compiler does not understand that and reports an error in typed mode.
                // The `throw new Error` below works around the problem, and the unexpected: never variable
                // makes sure tsc still checks this code is unreachable.
                var unexpected = hook;
                throw new Error("unexpected " + unexpected);
        }
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlmZWN5Y2xlX3JlZmxlY3Rvci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyL3NyYy9saWZlY3ljbGVfcmVmbGVjdG9yLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7OztJQUlILElBQVksY0FTWDtJQVRELFdBQVksY0FBYztRQUN4Qix1REFBTSxDQUFBO1FBQ04sNkRBQVMsQ0FBQTtRQUNULHlEQUFPLENBQUE7UUFDUCw2REFBUyxDQUFBO1FBQ1QsMkVBQWdCLENBQUE7UUFDaEIsaUZBQW1CLENBQUE7UUFDbkIscUVBQWEsQ0FBQTtRQUNiLDJFQUFnQixDQUFBO0lBQ2xCLENBQUMsRUFUVyxjQUFjLEdBQWQsc0JBQWMsS0FBZCxzQkFBYyxRQVN6QjtJQUVZLFFBQUEsc0JBQXNCLEdBQUc7UUFDcEMsY0FBYyxDQUFDLE1BQU0sRUFBRSxjQUFjLENBQUMsU0FBUyxFQUFFLGNBQWMsQ0FBQyxPQUFPLEVBQUUsY0FBYyxDQUFDLFNBQVM7UUFDakcsY0FBYyxDQUFDLGdCQUFnQixFQUFFLGNBQWMsQ0FBQyxtQkFBbUIsRUFBRSxjQUFjLENBQUMsYUFBYTtRQUNqRyxjQUFjLENBQUMsZ0JBQWdCO0tBQ2hDLENBQUM7SUFFRixTQUFnQixnQkFBZ0IsQ0FDNUIsU0FBMkIsRUFBRSxJQUFvQixFQUFFLEtBQVU7UUFDL0QsT0FBTyxTQUFTLENBQUMsZ0JBQWdCLENBQUMsS0FBSyxFQUFFLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQzlELENBQUM7SUFIRCw0Q0FHQztJQUVELFNBQWdCLG9CQUFvQixDQUFDLFNBQTJCLEVBQUUsS0FBVTtRQUMxRSxPQUFPLDhCQUFzQixDQUFDLE1BQU0sQ0FBQyxVQUFBLElBQUksSUFBSSxPQUFBLGdCQUFnQixDQUFDLFNBQVMsRUFBRSxJQUFJLEVBQUUsS0FBSyxDQUFDLEVBQXhDLENBQXdDLENBQUMsQ0FBQztJQUN6RixDQUFDO0lBRkQsb0RBRUM7SUFFRCxTQUFTLFdBQVcsQ0FBQyxJQUFvQjtRQUN2QyxRQUFRLElBQUksRUFBRTtZQUNaLEtBQUssY0FBYyxDQUFDLE1BQU07Z0JBQ3hCLE9BQU8sVUFBVSxDQUFDO1lBQ3BCLEtBQUssY0FBYyxDQUFDLFNBQVM7Z0JBQzNCLE9BQU8sYUFBYSxDQUFDO1lBQ3ZCLEtBQUssY0FBYyxDQUFDLE9BQU87Z0JBQ3pCLE9BQU8sV0FBVyxDQUFDO1lBQ3JCLEtBQUssY0FBYyxDQUFDLFNBQVM7Z0JBQzNCLE9BQU8sYUFBYSxDQUFDO1lBQ3ZCLEtBQUssY0FBYyxDQUFDLGdCQUFnQjtnQkFDbEMsT0FBTyxvQkFBb0IsQ0FBQztZQUM5QixLQUFLLGNBQWMsQ0FBQyxtQkFBbUI7Z0JBQ3JDLE9BQU8sdUJBQXVCLENBQUM7WUFDakMsS0FBSyxjQUFjLENBQUMsYUFBYTtnQkFDL0IsT0FBTyxpQkFBaUIsQ0FBQztZQUMzQixLQUFLLGNBQWMsQ0FBQyxnQkFBZ0I7Z0JBQ2xDLE9BQU8sb0JBQW9CLENBQUM7WUFDOUI7Z0JBQ0UsdUZBQXVGO2dCQUN2Rix3RkFBd0Y7Z0JBQ3hGLDJGQUEyRjtnQkFDM0Ysd0RBQXdEO2dCQUN4RCxJQUFNLFVBQVUsR0FBVSxJQUFJLENBQUM7Z0JBQy9CLE1BQU0sSUFBSSxLQUFLLENBQUMsZ0JBQWMsVUFBWSxDQUFDLENBQUM7U0FDL0M7SUFDSCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0NvbXBpbGVSZWZsZWN0b3J9IGZyb20gJy4vY29tcGlsZV9yZWZsZWN0b3InO1xuXG5leHBvcnQgZW51bSBMaWZlY3ljbGVIb29rcyB7XG4gIE9uSW5pdCxcbiAgT25EZXN0cm95LFxuICBEb0NoZWNrLFxuICBPbkNoYW5nZXMsXG4gIEFmdGVyQ29udGVudEluaXQsXG4gIEFmdGVyQ29udGVudENoZWNrZWQsXG4gIEFmdGVyVmlld0luaXQsXG4gIEFmdGVyVmlld0NoZWNrZWRcbn1cblxuZXhwb3J0IGNvbnN0IExJRkVDWUNMRV9IT09LU19WQUxVRVMgPSBbXG4gIExpZmVjeWNsZUhvb2tzLk9uSW5pdCwgTGlmZWN5Y2xlSG9va3MuT25EZXN0cm95LCBMaWZlY3ljbGVIb29rcy5Eb0NoZWNrLCBMaWZlY3ljbGVIb29rcy5PbkNoYW5nZXMsXG4gIExpZmVjeWNsZUhvb2tzLkFmdGVyQ29udGVudEluaXQsIExpZmVjeWNsZUhvb2tzLkFmdGVyQ29udGVudENoZWNrZWQsIExpZmVjeWNsZUhvb2tzLkFmdGVyVmlld0luaXQsXG4gIExpZmVjeWNsZUhvb2tzLkFmdGVyVmlld0NoZWNrZWRcbl07XG5cbmV4cG9ydCBmdW5jdGlvbiBoYXNMaWZlY3ljbGVIb29rKFxuICAgIHJlZmxlY3RvcjogQ29tcGlsZVJlZmxlY3RvciwgaG9vazogTGlmZWN5Y2xlSG9va3MsIHRva2VuOiBhbnkpOiBib29sZWFuIHtcbiAgcmV0dXJuIHJlZmxlY3Rvci5oYXNMaWZlY3ljbGVIb29rKHRva2VuLCBnZXRIb29rTmFtZShob29rKSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRBbGxMaWZlY3ljbGVIb29rcyhyZWZsZWN0b3I6IENvbXBpbGVSZWZsZWN0b3IsIHRva2VuOiBhbnkpOiBMaWZlY3ljbGVIb29rc1tdIHtcbiAgcmV0dXJuIExJRkVDWUNMRV9IT09LU19WQUxVRVMuZmlsdGVyKGhvb2sgPT4gaGFzTGlmZWN5Y2xlSG9vayhyZWZsZWN0b3IsIGhvb2ssIHRva2VuKSk7XG59XG5cbmZ1bmN0aW9uIGdldEhvb2tOYW1lKGhvb2s6IExpZmVjeWNsZUhvb2tzKTogc3RyaW5nIHtcbiAgc3dpdGNoIChob29rKSB7XG4gICAgY2FzZSBMaWZlY3ljbGVIb29rcy5PbkluaXQ6XG4gICAgICByZXR1cm4gJ25nT25Jbml0JztcbiAgICBjYXNlIExpZmVjeWNsZUhvb2tzLk9uRGVzdHJveTpcbiAgICAgIHJldHVybiAnbmdPbkRlc3Ryb3knO1xuICAgIGNhc2UgTGlmZWN5Y2xlSG9va3MuRG9DaGVjazpcbiAgICAgIHJldHVybiAnbmdEb0NoZWNrJztcbiAgICBjYXNlIExpZmVjeWNsZUhvb2tzLk9uQ2hhbmdlczpcbiAgICAgIHJldHVybiAnbmdPbkNoYW5nZXMnO1xuICAgIGNhc2UgTGlmZWN5Y2xlSG9va3MuQWZ0ZXJDb250ZW50SW5pdDpcbiAgICAgIHJldHVybiAnbmdBZnRlckNvbnRlbnRJbml0JztcbiAgICBjYXNlIExpZmVjeWNsZUhvb2tzLkFmdGVyQ29udGVudENoZWNrZWQ6XG4gICAgICByZXR1cm4gJ25nQWZ0ZXJDb250ZW50Q2hlY2tlZCc7XG4gICAgY2FzZSBMaWZlY3ljbGVIb29rcy5BZnRlclZpZXdJbml0OlxuICAgICAgcmV0dXJuICduZ0FmdGVyVmlld0luaXQnO1xuICAgIGNhc2UgTGlmZWN5Y2xlSG9va3MuQWZ0ZXJWaWV3Q2hlY2tlZDpcbiAgICAgIHJldHVybiAnbmdBZnRlclZpZXdDaGVja2VkJztcbiAgICBkZWZhdWx0OlxuICAgICAgLy8gVGhpcyBkZWZhdWx0IGNhc2UgaXMgbm90IG5lZWRlZCBieSBUeXBlU2NyaXB0IGNvbXBpbGVyLCBhcyB0aGUgc3dpdGNoIGlzIGV4aGF1c3RpdmUuXG4gICAgICAvLyBIb3dldmVyIENsb3N1cmUgQ29tcGlsZXIgZG9lcyBub3QgdW5kZXJzdGFuZCB0aGF0IGFuZCByZXBvcnRzIGFuIGVycm9yIGluIHR5cGVkIG1vZGUuXG4gICAgICAvLyBUaGUgYHRocm93IG5ldyBFcnJvcmAgYmVsb3cgd29ya3MgYXJvdW5kIHRoZSBwcm9ibGVtLCBhbmQgdGhlIHVuZXhwZWN0ZWQ6IG5ldmVyIHZhcmlhYmxlXG4gICAgICAvLyBtYWtlcyBzdXJlIHRzYyBzdGlsbCBjaGVja3MgdGhpcyBjb2RlIGlzIHVucmVhY2hhYmxlLlxuICAgICAgY29uc3QgdW5leHBlY3RlZDogbmV2ZXIgPSBob29rO1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGB1bmV4cGVjdGVkICR7dW5leHBlY3RlZH1gKTtcbiAgfVxufVxuIl19