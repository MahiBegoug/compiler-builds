/**
 * @license
 * Copyright Google LLC All Rights Reserved.
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
        define("@angular/compiler/src/output/output_jit_trusted_types", ["require", "exports", "tslib", "@angular/compiler/src/util"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.newTrustedFunctionForJIT = void 0;
    var tslib_1 = require("tslib");
    /**
     * @fileoverview
     * A module to facilitate use of a Trusted Types policy within the JIT
     * compiler. It lazily constructs the Trusted Types policy, providing helper
     * utilities for promoting strings to Trusted Types. When Trusted Types are not
     * available, strings are used as a fallback.
     * @security All use of this module is security-sensitive and should go through
     * security review.
     */
    var util_1 = require("@angular/compiler/src/util");
    /**
     * The Trusted Types policy, or null if Trusted Types are not
     * enabled/supported, or undefined if the policy has not been created yet.
     */
    var policy;
    /**
     * Returns the Trusted Types policy, or null if Trusted Types are not
     * enabled/supported. The first call to this function will create the policy.
     */
    function getPolicy() {
        if (policy === undefined) {
            policy = null;
            if (util_1.global.trustedTypes) {
                try {
                    policy =
                        util_1.global.trustedTypes.createPolicy('angular#unsafe-jit', {
                            createScript: function (s) { return s; },
                        });
                }
                catch (_a) {
                    // trustedTypes.createPolicy throws if called with a name that is
                    // already registered, even in report-only mode. Until the API changes,
                    // catch the error not to break the applications functionally. In such
                    // cases, the code will fall back to using strings.
                }
            }
        }
        return policy;
    }
    /**
     * Unsafely promote a string to a TrustedScript, falling back to strings when
     * Trusted Types are not available.
     * @security In particular, it must be assured that the provided string will
     * never cause an XSS vulnerability if used in a context that will be
     * interpreted and executed as a script by a browser, e.g. when calling eval.
     */
    function trustedScriptFromString(script) {
        var _a;
        return ((_a = getPolicy()) === null || _a === void 0 ? void 0 : _a.createScript(script)) || script;
    }
    /**
     * Unsafely call the Function constructor with the given string arguments. It
     * is only available in development mode, and should be stripped out of
     * production code.
     * @security This is a security-sensitive function; any use of this function
     * must go through security review. In particular, it must be assured that it
     * is only called from the JIT compiler, as use in other code can lead to XSS
     * vulnerabilities.
     */
    function newTrustedFunctionForJIT() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (!util_1.global.trustedTypes) {
            // In environments that don't support Trusted Types, fall back to the most
            // straightforward implementation:
            return new (Function.bind.apply(Function, tslib_1.__spread([void 0], args)))();
        }
        // Chrome currently does not support passing TrustedScript to the Function
        // constructor. The following implements the workaround proposed on the page
        // below, where the Chromium bug is also referenced:
        // https://github.com/w3c/webappsec-trusted-types/wiki/Trusted-Types-for-function-constructor
        var fnArgs = args.slice(0, -1).join(',');
        var fnBody = args.pop().toString();
        var body = "(function anonymous(" + fnArgs + "\n) { " + fnBody + "\n})";
        // Using eval directly confuses the compiler and prevents this module from
        // being stripped out of JS binaries even if not used. The global['eval']
        // indirection fixes that.
        var fn = util_1.global['eval'](trustedScriptFromString(body));
        // To completely mimic the behavior of calling "new Function", two more
        // things need to happen:
        // 1. Stringifying the resulting function should return its source code
        fn.toString = function () { return body; };
        // 2. When calling the resulting function, `this` should refer to `global`
        return fn.bind(util_1.global);
        // When Trusted Types support in Function constructors is widely available,
        // the implementation of this function can be simplified to:
        // return new Function(...args.map(a => trustedScriptFromString(a)));
    }
    exports.newTrustedFunctionForJIT = newTrustedFunctionForJIT;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3V0cHV0X2ppdF90cnVzdGVkX3R5cGVzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXIvc3JjL291dHB1dC9vdXRwdXRfaml0X3RydXN0ZWRfdHlwZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7OztJQUVIOzs7Ozs7OztPQVFHO0lBRUgsbURBQStCO0lBbUMvQjs7O09BR0c7SUFDSCxJQUFJLE1BQXdDLENBQUM7SUFFN0M7OztPQUdHO0lBQ0gsU0FBUyxTQUFTO1FBQ2hCLElBQUksTUFBTSxLQUFLLFNBQVMsRUFBRTtZQUN4QixNQUFNLEdBQUcsSUFBSSxDQUFDO1lBQ2QsSUFBSSxhQUFNLENBQUMsWUFBWSxFQUFFO2dCQUN2QixJQUFJO29CQUNGLE1BQU07d0JBQ0QsYUFBTSxDQUFDLFlBQXlDLENBQUMsWUFBWSxDQUFDLG9CQUFvQixFQUFFOzRCQUNuRixZQUFZLEVBQUUsVUFBQyxDQUFTLElBQUssT0FBQSxDQUFDLEVBQUQsQ0FBQzt5QkFDL0IsQ0FBQyxDQUFDO2lCQUNSO2dCQUFDLFdBQU07b0JBQ04saUVBQWlFO29CQUNqRSx1RUFBdUU7b0JBQ3ZFLHNFQUFzRTtvQkFDdEUsbURBQW1EO2lCQUNwRDthQUNGO1NBQ0Y7UUFDRCxPQUFPLE1BQU0sQ0FBQztJQUNoQixDQUFDO0lBRUQ7Ozs7OztPQU1HO0lBQ0gsU0FBUyx1QkFBdUIsQ0FBQyxNQUFjOztRQUM3QyxPQUFPLE9BQUEsU0FBUyxFQUFFLDBDQUFFLFlBQVksQ0FBQyxNQUFNLE1BQUssTUFBTSxDQUFDO0lBQ3JELENBQUM7SUFFRDs7Ozs7Ozs7T0FRRztJQUNILFNBQWdCLHdCQUF3QjtRQUFDLGNBQWlCO2FBQWpCLFVBQWlCLEVBQWpCLHFCQUFpQixFQUFqQixJQUFpQjtZQUFqQix5QkFBaUI7O1FBQ3hELElBQUksQ0FBQyxhQUFNLENBQUMsWUFBWSxFQUFFO1lBQ3hCLDBFQUEwRTtZQUMxRSxrQ0FBa0M7WUFDbEMsWUFBVyxRQUFRLFlBQVIsUUFBUSw2QkFBSSxJQUFJLE1BQUU7U0FDOUI7UUFFRCwwRUFBMEU7UUFDMUUsNEVBQTRFO1FBQzVFLG9EQUFvRDtRQUNwRCw2RkFBNkY7UUFDN0YsSUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDM0MsSUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRyxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQ3RDLElBQU0sSUFBSSxHQUFHLHlCQUF1QixNQUFNLGNBQ3RDLE1BQU0sU0FDVCxDQUFDO1FBRUYsMEVBQTBFO1FBQzFFLHlFQUF5RTtRQUN6RSwwQkFBMEI7UUFDMUIsSUFBTSxFQUFFLEdBQUcsYUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLHVCQUF1QixDQUFDLElBQUksQ0FBVyxDQUFhLENBQUM7UUFFL0UsdUVBQXVFO1FBQ3ZFLHlCQUF5QjtRQUN6Qix1RUFBdUU7UUFDdkUsRUFBRSxDQUFDLFFBQVEsR0FBRyxjQUFNLE9BQUEsSUFBSSxFQUFKLENBQUksQ0FBQztRQUN6QiwwRUFBMEU7UUFDMUUsT0FBTyxFQUFFLENBQUMsSUFBSSxDQUFDLGFBQU0sQ0FBQyxDQUFDO1FBRXZCLDJFQUEyRTtRQUMzRSw0REFBNEQ7UUFDNUQscUVBQXFFO0lBQ3ZFLENBQUM7SUFoQ0QsNERBZ0NDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbi8qKlxuICogQGZpbGVvdmVydmlld1xuICogQSBtb2R1bGUgdG8gZmFjaWxpdGF0ZSB1c2Ugb2YgYSBUcnVzdGVkIFR5cGVzIHBvbGljeSB3aXRoaW4gdGhlIEpJVFxuICogY29tcGlsZXIuIEl0IGxhemlseSBjb25zdHJ1Y3RzIHRoZSBUcnVzdGVkIFR5cGVzIHBvbGljeSwgcHJvdmlkaW5nIGhlbHBlclxuICogdXRpbGl0aWVzIGZvciBwcm9tb3Rpbmcgc3RyaW5ncyB0byBUcnVzdGVkIFR5cGVzLiBXaGVuIFRydXN0ZWQgVHlwZXMgYXJlIG5vdFxuICogYXZhaWxhYmxlLCBzdHJpbmdzIGFyZSB1c2VkIGFzIGEgZmFsbGJhY2suXG4gKiBAc2VjdXJpdHkgQWxsIHVzZSBvZiB0aGlzIG1vZHVsZSBpcyBzZWN1cml0eS1zZW5zaXRpdmUgYW5kIHNob3VsZCBnbyB0aHJvdWdoXG4gKiBzZWN1cml0eSByZXZpZXcuXG4gKi9cblxuaW1wb3J0IHtnbG9iYWx9IGZyb20gJy4uL3V0aWwnO1xuXG4vKipcbiAqIFdoaWxlIEFuZ3VsYXIgb25seSB1c2VzIFRydXN0ZWQgVHlwZXMgaW50ZXJuYWxseSBmb3IgdGhlIHRpbWUgYmVpbmcsXG4gKiByZWZlcmVuY2VzIHRvIFRydXN0ZWQgVHlwZXMgY291bGQgbGVhayBpbnRvIG91ciBjb3JlLmQudHMsIHdoaWNoIHdvdWxkIGZvcmNlXG4gKiBhbnlvbmUgY29tcGlsaW5nIGFnYWluc3QgQGFuZ3VsYXIvY29yZSB0byBwcm92aWRlIHRoZSBAdHlwZXMvdHJ1c3RlZC10eXBlc1xuICogcGFja2FnZSBpbiB0aGVpciBjb21waWxhdGlvbiB1bml0LlxuICpcbiAqIFVudGlsIGh0dHBzOi8vZ2l0aHViLmNvbS9taWNyb3NvZnQvVHlwZVNjcmlwdC9pc3N1ZXMvMzAwMjQgaXMgcmVzb2x2ZWQsIHdlXG4gKiB3aWxsIGtlZXAgQW5ndWxhcidzIHB1YmxpYyBBUEkgc3VyZmFjZSBmcmVlIG9mIHJlZmVyZW5jZXMgdG8gVHJ1c3RlZCBUeXBlcy5cbiAqIEZvciBpbnRlcm5hbCBhbmQgc2VtaS1wcml2YXRlIEFQSXMgdGhhdCBuZWVkIHRvIHJlZmVyZW5jZSBUcnVzdGVkIFR5cGVzLCB0aGVcbiAqIG1pbmltYWwgdHlwZSBkZWZpbml0aW9ucyBmb3IgdGhlIFRydXN0ZWQgVHlwZXMgQVBJIHByb3ZpZGVkIGJ5IHRoaXMgbW9kdWxlXG4gKiBzaG91bGQgYmUgdXNlZCBpbnN0ZWFkLiBUaGV5IGFyZSBtYXJrZWQgYXMgXCJkZWNsYXJlXCIgdG8gcHJldmVudCB0aGVtIGZyb21cbiAqIGJlaW5nIHJlbmFtZWQgYnkgY29tcGlsZXIgb3B0aW1pemF0aW9uLlxuICpcbiAqIEFkYXB0ZWQgZnJvbVxuICogaHR0cHM6Ly9naXRodWIuY29tL0RlZmluaXRlbHlUeXBlZC9EZWZpbml0ZWx5VHlwZWQvYmxvYi9tYXN0ZXIvdHlwZXMvdHJ1c3RlZC10eXBlcy9pbmRleC5kLnRzXG4gKiBidXQgcmVzdHJpY3RlZCB0byB0aGUgQVBJIHN1cmZhY2UgdXNlZCB3aXRoaW4gQW5ndWxhci5cbiAqL1xuXG5leHBvcnQgZGVjbGFyZSBpbnRlcmZhY2UgVHJ1c3RlZFNjcmlwdCB7XG4gIF9fYnJhbmRfXzogJ1RydXN0ZWRTY3JpcHQnO1xufVxuXG5leHBvcnQgZGVjbGFyZSBpbnRlcmZhY2UgVHJ1c3RlZFR5cGVQb2xpY3lGYWN0b3J5IHtcbiAgY3JlYXRlUG9saWN5KHBvbGljeU5hbWU6IHN0cmluZywgcG9saWN5T3B0aW9uczoge1xuICAgIGNyZWF0ZVNjcmlwdD86IChpbnB1dDogc3RyaW5nKSA9PiBzdHJpbmcsXG4gIH0pOiBUcnVzdGVkVHlwZVBvbGljeTtcbn1cblxuZXhwb3J0IGRlY2xhcmUgaW50ZXJmYWNlIFRydXN0ZWRUeXBlUG9saWN5IHtcbiAgY3JlYXRlU2NyaXB0KGlucHV0OiBzdHJpbmcpOiBUcnVzdGVkU2NyaXB0O1xufVxuXG5cbi8qKlxuICogVGhlIFRydXN0ZWQgVHlwZXMgcG9saWN5LCBvciBudWxsIGlmIFRydXN0ZWQgVHlwZXMgYXJlIG5vdFxuICogZW5hYmxlZC9zdXBwb3J0ZWQsIG9yIHVuZGVmaW5lZCBpZiB0aGUgcG9saWN5IGhhcyBub3QgYmVlbiBjcmVhdGVkIHlldC5cbiAqL1xubGV0IHBvbGljeTogVHJ1c3RlZFR5cGVQb2xpY3l8bnVsbHx1bmRlZmluZWQ7XG5cbi8qKlxuICogUmV0dXJucyB0aGUgVHJ1c3RlZCBUeXBlcyBwb2xpY3ksIG9yIG51bGwgaWYgVHJ1c3RlZCBUeXBlcyBhcmUgbm90XG4gKiBlbmFibGVkL3N1cHBvcnRlZC4gVGhlIGZpcnN0IGNhbGwgdG8gdGhpcyBmdW5jdGlvbiB3aWxsIGNyZWF0ZSB0aGUgcG9saWN5LlxuICovXG5mdW5jdGlvbiBnZXRQb2xpY3koKTogVHJ1c3RlZFR5cGVQb2xpY3l8bnVsbCB7XG4gIGlmIChwb2xpY3kgPT09IHVuZGVmaW5lZCkge1xuICAgIHBvbGljeSA9IG51bGw7XG4gICAgaWYgKGdsb2JhbC50cnVzdGVkVHlwZXMpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIHBvbGljeSA9XG4gICAgICAgICAgICAoZ2xvYmFsLnRydXN0ZWRUeXBlcyBhcyBUcnVzdGVkVHlwZVBvbGljeUZhY3RvcnkpLmNyZWF0ZVBvbGljeSgnYW5ndWxhciN1bnNhZmUtaml0Jywge1xuICAgICAgICAgICAgICBjcmVhdGVTY3JpcHQ6IChzOiBzdHJpbmcpID0+IHMsXG4gICAgICAgICAgICB9KTtcbiAgICAgIH0gY2F0Y2gge1xuICAgICAgICAvLyB0cnVzdGVkVHlwZXMuY3JlYXRlUG9saWN5IHRocm93cyBpZiBjYWxsZWQgd2l0aCBhIG5hbWUgdGhhdCBpc1xuICAgICAgICAvLyBhbHJlYWR5IHJlZ2lzdGVyZWQsIGV2ZW4gaW4gcmVwb3J0LW9ubHkgbW9kZS4gVW50aWwgdGhlIEFQSSBjaGFuZ2VzLFxuICAgICAgICAvLyBjYXRjaCB0aGUgZXJyb3Igbm90IHRvIGJyZWFrIHRoZSBhcHBsaWNhdGlvbnMgZnVuY3Rpb25hbGx5LiBJbiBzdWNoXG4gICAgICAgIC8vIGNhc2VzLCB0aGUgY29kZSB3aWxsIGZhbGwgYmFjayB0byB1c2luZyBzdHJpbmdzLlxuICAgICAgfVxuICAgIH1cbiAgfVxuICByZXR1cm4gcG9saWN5O1xufVxuXG4vKipcbiAqIFVuc2FmZWx5IHByb21vdGUgYSBzdHJpbmcgdG8gYSBUcnVzdGVkU2NyaXB0LCBmYWxsaW5nIGJhY2sgdG8gc3RyaW5ncyB3aGVuXG4gKiBUcnVzdGVkIFR5cGVzIGFyZSBub3QgYXZhaWxhYmxlLlxuICogQHNlY3VyaXR5IEluIHBhcnRpY3VsYXIsIGl0IG11c3QgYmUgYXNzdXJlZCB0aGF0IHRoZSBwcm92aWRlZCBzdHJpbmcgd2lsbFxuICogbmV2ZXIgY2F1c2UgYW4gWFNTIHZ1bG5lcmFiaWxpdHkgaWYgdXNlZCBpbiBhIGNvbnRleHQgdGhhdCB3aWxsIGJlXG4gKiBpbnRlcnByZXRlZCBhbmQgZXhlY3V0ZWQgYXMgYSBzY3JpcHQgYnkgYSBicm93c2VyLCBlLmcuIHdoZW4gY2FsbGluZyBldmFsLlxuICovXG5mdW5jdGlvbiB0cnVzdGVkU2NyaXB0RnJvbVN0cmluZyhzY3JpcHQ6IHN0cmluZyk6IFRydXN0ZWRTY3JpcHR8c3RyaW5nIHtcbiAgcmV0dXJuIGdldFBvbGljeSgpPy5jcmVhdGVTY3JpcHQoc2NyaXB0KSB8fCBzY3JpcHQ7XG59XG5cbi8qKlxuICogVW5zYWZlbHkgY2FsbCB0aGUgRnVuY3Rpb24gY29uc3RydWN0b3Igd2l0aCB0aGUgZ2l2ZW4gc3RyaW5nIGFyZ3VtZW50cy4gSXRcbiAqIGlzIG9ubHkgYXZhaWxhYmxlIGluIGRldmVsb3BtZW50IG1vZGUsIGFuZCBzaG91bGQgYmUgc3RyaXBwZWQgb3V0IG9mXG4gKiBwcm9kdWN0aW9uIGNvZGUuXG4gKiBAc2VjdXJpdHkgVGhpcyBpcyBhIHNlY3VyaXR5LXNlbnNpdGl2ZSBmdW5jdGlvbjsgYW55IHVzZSBvZiB0aGlzIGZ1bmN0aW9uXG4gKiBtdXN0IGdvIHRocm91Z2ggc2VjdXJpdHkgcmV2aWV3LiBJbiBwYXJ0aWN1bGFyLCBpdCBtdXN0IGJlIGFzc3VyZWQgdGhhdCBpdFxuICogaXMgb25seSBjYWxsZWQgZnJvbSB0aGUgSklUIGNvbXBpbGVyLCBhcyB1c2UgaW4gb3RoZXIgY29kZSBjYW4gbGVhZCB0byBYU1NcbiAqIHZ1bG5lcmFiaWxpdGllcy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG5ld1RydXN0ZWRGdW5jdGlvbkZvckpJVCguLi5hcmdzOiBzdHJpbmdbXSk6IEZ1bmN0aW9uIHtcbiAgaWYgKCFnbG9iYWwudHJ1c3RlZFR5cGVzKSB7XG4gICAgLy8gSW4gZW52aXJvbm1lbnRzIHRoYXQgZG9uJ3Qgc3VwcG9ydCBUcnVzdGVkIFR5cGVzLCBmYWxsIGJhY2sgdG8gdGhlIG1vc3RcbiAgICAvLyBzdHJhaWdodGZvcndhcmQgaW1wbGVtZW50YXRpb246XG4gICAgcmV0dXJuIG5ldyBGdW5jdGlvbiguLi5hcmdzKTtcbiAgfVxuXG4gIC8vIENocm9tZSBjdXJyZW50bHkgZG9lcyBub3Qgc3VwcG9ydCBwYXNzaW5nIFRydXN0ZWRTY3JpcHQgdG8gdGhlIEZ1bmN0aW9uXG4gIC8vIGNvbnN0cnVjdG9yLiBUaGUgZm9sbG93aW5nIGltcGxlbWVudHMgdGhlIHdvcmthcm91bmQgcHJvcG9zZWQgb24gdGhlIHBhZ2VcbiAgLy8gYmVsb3csIHdoZXJlIHRoZSBDaHJvbWl1bSBidWcgaXMgYWxzbyByZWZlcmVuY2VkOlxuICAvLyBodHRwczovL2dpdGh1Yi5jb20vdzNjL3dlYmFwcHNlYy10cnVzdGVkLXR5cGVzL3dpa2kvVHJ1c3RlZC1UeXBlcy1mb3ItZnVuY3Rpb24tY29uc3RydWN0b3JcbiAgY29uc3QgZm5BcmdzID0gYXJncy5zbGljZSgwLCAtMSkuam9pbignLCcpO1xuICBjb25zdCBmbkJvZHkgPSBhcmdzLnBvcCgpIS50b1N0cmluZygpO1xuICBjb25zdCBib2R5ID0gYChmdW5jdGlvbiBhbm9ueW1vdXMoJHtmbkFyZ3N9XG4pIHsgJHtmbkJvZHl9XG59KWA7XG5cbiAgLy8gVXNpbmcgZXZhbCBkaXJlY3RseSBjb25mdXNlcyB0aGUgY29tcGlsZXIgYW5kIHByZXZlbnRzIHRoaXMgbW9kdWxlIGZyb21cbiAgLy8gYmVpbmcgc3RyaXBwZWQgb3V0IG9mIEpTIGJpbmFyaWVzIGV2ZW4gaWYgbm90IHVzZWQuIFRoZSBnbG9iYWxbJ2V2YWwnXVxuICAvLyBpbmRpcmVjdGlvbiBmaXhlcyB0aGF0LlxuICBjb25zdCBmbiA9IGdsb2JhbFsnZXZhbCddKHRydXN0ZWRTY3JpcHRGcm9tU3RyaW5nKGJvZHkpIGFzIHN0cmluZykgYXMgRnVuY3Rpb247XG5cbiAgLy8gVG8gY29tcGxldGVseSBtaW1pYyB0aGUgYmVoYXZpb3Igb2YgY2FsbGluZyBcIm5ldyBGdW5jdGlvblwiLCB0d28gbW9yZVxuICAvLyB0aGluZ3MgbmVlZCB0byBoYXBwZW46XG4gIC8vIDEuIFN0cmluZ2lmeWluZyB0aGUgcmVzdWx0aW5nIGZ1bmN0aW9uIHNob3VsZCByZXR1cm4gaXRzIHNvdXJjZSBjb2RlXG4gIGZuLnRvU3RyaW5nID0gKCkgPT4gYm9keTtcbiAgLy8gMi4gV2hlbiBjYWxsaW5nIHRoZSByZXN1bHRpbmcgZnVuY3Rpb24sIGB0aGlzYCBzaG91bGQgcmVmZXIgdG8gYGdsb2JhbGBcbiAgcmV0dXJuIGZuLmJpbmQoZ2xvYmFsKTtcblxuICAvLyBXaGVuIFRydXN0ZWQgVHlwZXMgc3VwcG9ydCBpbiBGdW5jdGlvbiBjb25zdHJ1Y3RvcnMgaXMgd2lkZWx5IGF2YWlsYWJsZSxcbiAgLy8gdGhlIGltcGxlbWVudGF0aW9uIG9mIHRoaXMgZnVuY3Rpb24gY2FuIGJlIHNpbXBsaWZpZWQgdG86XG4gIC8vIHJldHVybiBuZXcgRnVuY3Rpb24oLi4uYXJncy5tYXAoYSA9PiB0cnVzdGVkU2NyaXB0RnJvbVN0cmluZyhhKSkpO1xufVxuIl19