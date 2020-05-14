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
        define("@angular/compiler/src/compile_reflector", ["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CompileReflector = void 0;
    /**
     * Provides access to reflection data about symbols that the compiler needs.
     */
    var CompileReflector = /** @class */ (function () {
        function CompileReflector() {
        }
        return CompileReflector;
    }());
    exports.CompileReflector = CompileReflector;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcGlsZV9yZWZsZWN0b3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci9zcmMvY29tcGlsZV9yZWZsZWN0b3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7O0lBS0g7O09BRUc7SUFDSDtRQUFBO1FBVUEsQ0FBQztRQUFELHVCQUFDO0lBQUQsQ0FBQyxBQVZELElBVUM7SUFWcUIsNENBQWdCIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0NvbXBvbmVudH0gZnJvbSAnLi9jb3JlJztcbmltcG9ydCAqIGFzIG8gZnJvbSAnLi9vdXRwdXQvb3V0cHV0X2FzdCc7XG5cbi8qKlxuICogUHJvdmlkZXMgYWNjZXNzIHRvIHJlZmxlY3Rpb24gZGF0YSBhYm91dCBzeW1ib2xzIHRoYXQgdGhlIGNvbXBpbGVyIG5lZWRzLlxuICovXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgQ29tcGlsZVJlZmxlY3RvciB7XG4gIGFic3RyYWN0IHBhcmFtZXRlcnModHlwZU9yRnVuYzogLypUeXBlKi8gYW55KTogYW55W11bXTtcbiAgYWJzdHJhY3QgYW5ub3RhdGlvbnModHlwZU9yRnVuYzogLypUeXBlKi8gYW55KTogYW55W107XG4gIGFic3RyYWN0IHNoYWxsb3dBbm5vdGF0aW9ucyh0eXBlT3JGdW5jOiAvKlR5cGUqLyBhbnkpOiBhbnlbXTtcbiAgYWJzdHJhY3QgdHJ5QW5ub3RhdGlvbnModHlwZU9yRnVuYzogLypUeXBlKi8gYW55KTogYW55W107XG4gIGFic3RyYWN0IHByb3BNZXRhZGF0YSh0eXBlT3JGdW5jOiAvKlR5cGUqLyBhbnkpOiB7W2tleTogc3RyaW5nXTogYW55W119O1xuICBhYnN0cmFjdCBoYXNMaWZlY3ljbGVIb29rKHR5cGU6IGFueSwgbGNQcm9wZXJ0eTogc3RyaW5nKTogYm9vbGVhbjtcbiAgYWJzdHJhY3QgZ3VhcmRzKHR5cGVPckZ1bmM6IC8qIFR5cGUgKi8gYW55KToge1trZXk6IHN0cmluZ106IGFueX07XG4gIGFic3RyYWN0IGNvbXBvbmVudE1vZHVsZVVybCh0eXBlOiAvKlR5cGUqLyBhbnksIGNtcE1ldGFkYXRhOiBDb21wb25lbnQpOiBzdHJpbmc7XG4gIGFic3RyYWN0IHJlc29sdmVFeHRlcm5hbFJlZmVyZW5jZShyZWY6IG8uRXh0ZXJuYWxSZWZlcmVuY2UpOiBhbnk7XG59XG4iXX0=