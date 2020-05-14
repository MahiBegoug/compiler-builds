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
        define("@angular/compiler/src/schema/element_schema_registry", ["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ElementSchemaRegistry = void 0;
    var ElementSchemaRegistry = /** @class */ (function () {
        function ElementSchemaRegistry() {
        }
        return ElementSchemaRegistry;
    }());
    exports.ElementSchemaRegistry = ElementSchemaRegistry;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWxlbWVudF9zY2hlbWFfcmVnaXN0cnkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci9zcmMvc2NoZW1hL2VsZW1lbnRfc2NoZW1hX3JlZ2lzdHJ5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7OztJQUlIO1FBQUE7UUFjQSxDQUFDO1FBQUQsNEJBQUM7SUFBRCxDQUFDLEFBZEQsSUFjQztJQWRxQixzREFBcUIiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7U2NoZW1hTWV0YWRhdGEsIFNlY3VyaXR5Q29udGV4dH0gZnJvbSAnLi4vY29yZSc7XG5cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBFbGVtZW50U2NoZW1hUmVnaXN0cnkge1xuICBhYnN0cmFjdCBoYXNQcm9wZXJ0eSh0YWdOYW1lOiBzdHJpbmcsIHByb3BOYW1lOiBzdHJpbmcsIHNjaGVtYU1ldGFzOiBTY2hlbWFNZXRhZGF0YVtdKTogYm9vbGVhbjtcbiAgYWJzdHJhY3QgaGFzRWxlbWVudCh0YWdOYW1lOiBzdHJpbmcsIHNjaGVtYU1ldGFzOiBTY2hlbWFNZXRhZGF0YVtdKTogYm9vbGVhbjtcbiAgYWJzdHJhY3Qgc2VjdXJpdHlDb250ZXh0KGVsZW1lbnROYW1lOiBzdHJpbmcsIHByb3BOYW1lOiBzdHJpbmcsIGlzQXR0cmlidXRlOiBib29sZWFuKTpcbiAgICAgIFNlY3VyaXR5Q29udGV4dDtcbiAgYWJzdHJhY3QgYWxsS25vd25FbGVtZW50TmFtZXMoKTogc3RyaW5nW107XG4gIGFic3RyYWN0IGdldE1hcHBlZFByb3BOYW1lKHByb3BOYW1lOiBzdHJpbmcpOiBzdHJpbmc7XG4gIGFic3RyYWN0IGdldERlZmF1bHRDb21wb25lbnRFbGVtZW50TmFtZSgpOiBzdHJpbmc7XG4gIGFic3RyYWN0IHZhbGlkYXRlUHJvcGVydHkobmFtZTogc3RyaW5nKToge2Vycm9yOiBib29sZWFuLCBtc2c/OiBzdHJpbmd9O1xuICBhYnN0cmFjdCB2YWxpZGF0ZUF0dHJpYnV0ZShuYW1lOiBzdHJpbmcpOiB7ZXJyb3I6IGJvb2xlYW4sIG1zZz86IHN0cmluZ307XG4gIGFic3RyYWN0IG5vcm1hbGl6ZUFuaW1hdGlvblN0eWxlUHJvcGVydHkocHJvcE5hbWU6IHN0cmluZyk6IHN0cmluZztcbiAgYWJzdHJhY3Qgbm9ybWFsaXplQW5pbWF0aW9uU3R5bGVWYWx1ZShcbiAgICAgIGNhbWVsQ2FzZVByb3A6IHN0cmluZywgdXNlclByb3ZpZGVkUHJvcDogc3RyaW5nLFxuICAgICAgdmFsOiBzdHJpbmd8bnVtYmVyKToge2Vycm9yOiBzdHJpbmcsIHZhbHVlOiBzdHJpbmd9O1xufVxuIl19