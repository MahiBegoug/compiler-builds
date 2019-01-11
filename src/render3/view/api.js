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
        define("@angular/compiler/src/render3/view/api", ["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXIvc3JjL3JlbmRlcjMvdmlldy9hcGkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0NoYW5nZURldGVjdGlvblN0cmF0ZWd5LCBWaWV3RW5jYXBzdWxhdGlvbn0gZnJvbSAnLi4vLi4vY29yZSc7XG5pbXBvcnQge0ludGVycG9sYXRpb25Db25maWd9IGZyb20gJy4uLy4uL21sX3BhcnNlci9pbnRlcnBvbGF0aW9uX2NvbmZpZyc7XG5pbXBvcnQgKiBhcyBvIGZyb20gJy4uLy4uL291dHB1dC9vdXRwdXRfYXN0JztcbmltcG9ydCB7UGFyc2VTb3VyY2VTcGFufSBmcm9tICcuLi8uLi9wYXJzZV91dGlsJztcbmltcG9ydCAqIGFzIHQgZnJvbSAnLi4vcjNfYXN0JztcbmltcG9ydCB7UjNEZXBlbmRlbmN5TWV0YWRhdGF9IGZyb20gJy4uL3IzX2ZhY3RvcnknO1xuXG5cbi8qKlxuICogSW5mb3JtYXRpb24gbmVlZGVkIHRvIGNvbXBpbGUgYSBkaXJlY3RpdmUgZm9yIHRoZSByZW5kZXIzIHJ1bnRpbWUuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgUjNEaXJlY3RpdmVNZXRhZGF0YSB7XG4gIC8qKlxuICAgKiBOYW1lIG9mIHRoZSBkaXJlY3RpdmUgdHlwZS5cbiAgICovXG4gIG5hbWU6IHN0cmluZztcblxuICAvKipcbiAgICogQW4gZXhwcmVzc2lvbiByZXByZXNlbnRpbmcgYSByZWZlcmVuY2UgdG8gdGhlIGRpcmVjdGl2ZSBpdHNlbGYuXG4gICAqL1xuICB0eXBlOiBvLkV4cHJlc3Npb247XG5cbiAgLyoqXG4gICAqIE51bWJlciBvZiBnZW5lcmljIHR5cGUgcGFyYW1ldGVycyBvZiB0aGUgdHlwZSBpdHNlbGYuXG4gICAqL1xuICB0eXBlQXJndW1lbnRDb3VudDogbnVtYmVyO1xuXG4gIC8qKlxuICAgKiBBIHNvdXJjZSBzcGFuIGZvciB0aGUgZGlyZWN0aXZlIHR5cGUuXG4gICAqL1xuICB0eXBlU291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFuO1xuXG4gIC8qKlxuICAgKiBEZXBlbmRlbmNpZXMgb2YgdGhlIGRpcmVjdGl2ZSdzIGNvbnN0cnVjdG9yLlxuICAgKi9cbiAgZGVwczogUjNEZXBlbmRlbmN5TWV0YWRhdGFbXXxudWxsO1xuXG4gIC8qKlxuICAgKiBVbnBhcnNlZCBzZWxlY3RvciBvZiB0aGUgZGlyZWN0aXZlLCBvciBgbnVsbGAgaWYgdGhlcmUgd2FzIG5vIHNlbGVjdG9yLlxuICAgKi9cbiAgc2VsZWN0b3I6IHN0cmluZ3xudWxsO1xuXG4gIC8qKlxuICAgKiBJbmZvcm1hdGlvbiBhYm91dCB0aGUgY29udGVudCBxdWVyaWVzIG1hZGUgYnkgdGhlIGRpcmVjdGl2ZS5cbiAgICovXG4gIHF1ZXJpZXM6IFIzUXVlcnlNZXRhZGF0YVtdO1xuXG4gIC8qKlxuICAgKiBNYXBwaW5ncyBpbmRpY2F0aW5nIGhvdyB0aGUgZGlyZWN0aXZlIGludGVyYWN0cyB3aXRoIGl0cyBob3N0IGVsZW1lbnQgKGhvc3QgYmluZGluZ3MsXG4gICAqIGxpc3RlbmVycywgZXRjKS5cbiAgICovXG4gIGhvc3Q6IHtcbiAgICAvKipcbiAgICAgKiBBIG1hcHBpbmcgb2YgYXR0cmlidXRlIGJpbmRpbmcga2V5cyB0byB1bnBhcnNlZCBleHByZXNzaW9ucy5cbiAgICAgKi9cbiAgICBhdHRyaWJ1dGVzOiB7W2tleTogc3RyaW5nXTogc3RyaW5nfTtcblxuICAgIC8qKlxuICAgICAqIEEgbWFwcGluZyBvZiBldmVudCBiaW5kaW5nIGtleXMgdG8gdW5wYXJzZWQgZXhwcmVzc2lvbnMuXG4gICAgICovXG4gICAgbGlzdGVuZXJzOiB7W2tleTogc3RyaW5nXTogc3RyaW5nfTtcblxuICAgIC8qKlxuICAgICAqIEEgbWFwcGluZyBvZiBwcm9wZXJ0eSBiaW5kaW5nIGtleXMgdG8gdW5wYXJzZWQgZXhwcmVzc2lvbnMuXG4gICAgICovXG4gICAgcHJvcGVydGllczoge1trZXk6IHN0cmluZ106IHN0cmluZ307XG4gIH07XG5cbiAgLyoqXG4gICAqIEEgbWFwcGluZyBvZiBpbnB1dCBmaWVsZCBuYW1lcyB0byB0aGUgcHJvcGVydHkgbmFtZXMuXG4gICAqL1xuICBpbnB1dHM6IHtbZmllbGQ6IHN0cmluZ106IHN0cmluZyB8IFtzdHJpbmcsIHN0cmluZ119O1xuXG4gIC8qKlxuICAgKiBBIG1hcHBpbmcgb2Ygb3V0cHV0IGZpZWxkIG5hbWVzIHRvIHRoZSBwcm9wZXJ0eSBuYW1lcy5cbiAgICovXG4gIG91dHB1dHM6IHtbZmllbGQ6IHN0cmluZ106IHN0cmluZ307XG5cbiAgLyoqXG4gICAqIFdoZXRoZXIgb3Igbm90IHRoZSBjb21wb25lbnQgb3IgZGlyZWN0aXZlIGluaGVyaXRzIGZyb20gYW5vdGhlciBjbGFzc1xuICAgKi9cbiAgdXNlc0luaGVyaXRhbmNlOiBib29sZWFuO1xuXG4gIC8qKlxuICAgKiBSZWZlcmVuY2UgbmFtZSB1bmRlciB3aGljaCB0byBleHBvcnQgdGhlIGRpcmVjdGl2ZSdzIHR5cGUgaW4gYSB0ZW1wbGF0ZSxcbiAgICogaWYgYW55LlxuICAgKi9cbiAgZXhwb3J0QXM6IHN0cmluZ1tdfG51bGw7XG5cbiAgLyoqXG4gICAqIFRoZSBsaXN0IG9mIHByb3ZpZGVycyBkZWZpbmVkIGluIHRoZSBkaXJlY3RpdmUuXG4gICAqL1xuICBwcm92aWRlcnM6IG8uRXhwcmVzc2lvbnxudWxsO1xufVxuXG4vKipcbiAqIEluZm9ybWF0aW9uIG5lZWRlZCB0byBjb21waWxlIGEgY29tcG9uZW50IGZvciB0aGUgcmVuZGVyMyBydW50aW1lLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIFIzQ29tcG9uZW50TWV0YWRhdGEgZXh0ZW5kcyBSM0RpcmVjdGl2ZU1ldGFkYXRhIHtcbiAgLyoqXG4gICAqIEluZm9ybWF0aW9uIGFib3V0IHRoZSBjb21wb25lbnQncyB0ZW1wbGF0ZS5cbiAgICovXG4gIHRlbXBsYXRlOiB7XG4gICAgLyoqXG4gICAgICogUGFyc2VkIG5vZGVzIG9mIHRoZSB0ZW1wbGF0ZS5cbiAgICAgKi9cbiAgICBub2RlczogdC5Ob2RlW107XG4gIH07XG5cbiAgLyoqXG4gICAqIEluZm9ybWF0aW9uIGFib3V0IHRoZSB2aWV3IHF1ZXJpZXMgbWFkZSBieSB0aGUgY29tcG9uZW50LlxuICAgKi9cbiAgdmlld1F1ZXJpZXM6IFIzUXVlcnlNZXRhZGF0YVtdO1xuXG4gIC8qKlxuICAgKiBBIG1hcCBvZiBwaXBlIG5hbWVzIHRvIGFuIGV4cHJlc3Npb24gcmVmZXJlbmNpbmcgdGhlIHBpcGUgdHlwZSB3aGljaCBhcmUgaW4gdGhlIHNjb3BlIG9mIHRoZVxuICAgKiBjb21waWxhdGlvbi5cbiAgICovXG4gIHBpcGVzOiBNYXA8c3RyaW5nLCBvLkV4cHJlc3Npb24+O1xuXG4gIC8qKlxuICAgKiBBIGxpc3Qgb2YgZGlyZWN0aXZlIHNlbGVjdG9ycyBhbmQgYW4gZXhwcmVzc2lvbiByZWZlcmVuY2luZyB0aGUgZGlyZWN0aXZlIHR5cGUgd2hpY2ggYXJlIGluIHRoZVxuICAgKiBzY29wZSBvZiB0aGUgY29tcGlsYXRpb24uXG4gICAqL1xuICBkaXJlY3RpdmVzOiB7c2VsZWN0b3I6IHN0cmluZywgZXhwcmVzc2lvbjogby5FeHByZXNzaW9ufVtdO1xuXG4gIC8qKlxuICAgKiBXaGV0aGVyIHRvIHdyYXAgdGhlICdkaXJlY3RpdmVzJyBhbmQvb3IgYHBpcGVzYCBhcnJheSwgaWYgb25lIGlzIGdlbmVyYXRlZCwgaW4gYSBjbG9zdXJlLlxuICAgKlxuICAgKiBUaGlzIGlzIGRvbmUgd2hlbiB0aGUgZGlyZWN0aXZlcyBvciBwaXBlcyBjb250YWluIGZvcndhcmQgcmVmZXJlbmNlcy5cbiAgICovXG4gIHdyYXBEaXJlY3RpdmVzQW5kUGlwZXNJbkNsb3N1cmU6IGJvb2xlYW47XG5cbiAgLyoqXG4gICAqIEEgY29sbGVjdGlvbiBvZiBzdHlsaW5nIGRhdGEgdGhhdCB3aWxsIGJlIGFwcGxpZWQgYW5kIHNjb3BlZCB0byB0aGUgY29tcG9uZW50LlxuICAgKi9cbiAgc3R5bGVzOiBzdHJpbmdbXTtcblxuICAvKipcbiAgICogQW4gZW5jYXBzdWxhdGlvbiBwb2xpY3kgZm9yIHRoZSB0ZW1wbGF0ZSBhbmQgQ1NTIHN0eWxlcy4gT25lIG9mOlxuICAgKiAtIGBWaWV3RW5jYXBzdWxhdGlvbi5OYXRpdmVgOiBVc2Ugc2hhZG93IHJvb3RzLiBUaGlzIHdvcmtzIG9ubHkgaWYgbmF0aXZlbHkgYXZhaWxhYmxlIG9uIHRoZVxuICAgKiAgIHBsYXRmb3JtIChub3RlIHRoYXQgdGhpcyBpcyBtYXJrZWQgdGhlIGFzIHRoZSBcImRlcHJlY2F0ZWQgc2hhZG93IERPTVwiIGFzIG9mIEFuZ3VsYXIgdjYuMS5cbiAgICogLSBgVmlld0VuY2Fwc3VsYXRpb24uRW11bGF0ZWRgOiBVc2Ugc2hpbW1lZCBDU1MgdGhhdCBlbXVsYXRlcyB0aGUgbmF0aXZlIGJlaGF2aW9yLlxuICAgKiAtIGBWaWV3RW5jYXBzdWxhdGlvbi5Ob25lYDogVXNlIGdsb2JhbCBDU1Mgd2l0aG91dCBhbnkgZW5jYXBzdWxhdGlvbi5cbiAgICogLSBgVmlld0VuY2Fwc3VsYXRpb24uU2hhZG93RG9tYDogVXNlIHRoZSBsYXRlc3QgU2hhZG93RE9NIEFQSSB0byBuYXRpdmVseSBlbmNhcHN1bGF0ZSBzdHlsZXNcbiAgICogaW50byBhIHNoYWRvdyByb290LlxuICAgKi9cbiAgZW5jYXBzdWxhdGlvbjogVmlld0VuY2Fwc3VsYXRpb247XG5cbiAgLyoqXG4gICAqIEEgY29sbGVjdGlvbiBvZiBhbmltYXRpb24gdHJpZ2dlcnMgdGhhdCB3aWxsIGJlIHVzZWQgaW4gdGhlIGNvbXBvbmVudCB0ZW1wbGF0ZS5cbiAgICovXG4gIGFuaW1hdGlvbnM6IG8uRXhwcmVzc2lvbnxudWxsO1xuXG4gIC8qKlxuICAgKiBUaGUgbGlzdCBvZiB2aWV3IHByb3ZpZGVycyBkZWZpbmVkIGluIHRoZSBjb21wb25lbnQuXG4gICAqL1xuICB2aWV3UHJvdmlkZXJzOiBvLkV4cHJlc3Npb258bnVsbDtcblxuICAvKipcbiAgICogUGF0aCB0byB0aGUgLnRzIGZpbGUgaW4gd2hpY2ggdGhpcyB0ZW1wbGF0ZSdzIGdlbmVyYXRlZCBjb2RlIHdpbGwgYmUgaW5jbHVkZWQsIHJlbGF0aXZlIHRvXG4gICAqIHRoZSBjb21waWxhdGlvbiByb290LiBUaGlzIHdpbGwgYmUgdXNlZCB0byBnZW5lcmF0ZSBpZGVudGlmaWVycyB0aGF0IG5lZWQgdG8gYmUgZ2xvYmFsbHlcbiAgICogdW5pcXVlIGluIGNlcnRhaW4gY29udGV4dHMgKHN1Y2ggYXMgZzMpLlxuICAgKi9cbiAgcmVsYXRpdmVDb250ZXh0RmlsZVBhdGg6IHN0cmluZztcblxuICAvKipcbiAgICogV2hldGhlciB0cmFuc2xhdGlvbiB2YXJpYWJsZSBuYW1lIHNob3VsZCBjb250YWluIGV4dGVybmFsIG1lc3NhZ2UgaWRcbiAgICogKHVzZWQgYnkgQ2xvc3VyZSBDb21waWxlcidzIG91dHB1dCBvZiBgZ29vZy5nZXRNc2dgIGZvciB0cmFuc2l0aW9uIHBlcmlvZCkuXG4gICAqL1xuICBpMThuVXNlRXh0ZXJuYWxJZHM6IGJvb2xlYW47XG5cbiAgLyoqXG4gICAqIE92ZXJyaWRlcyB0aGUgZGVmYXVsdCBpbnRlcnBvbGF0aW9uIHN0YXJ0IGFuZCBlbmQgZGVsaW1pdGVycyAoe3sgYW5kIH19KS5cbiAgICovXG4gIGludGVycG9sYXRpb246IEludGVycG9sYXRpb25Db25maWc7XG5cbiAgLyoqXG4gICAqIFN0cmF0ZWd5IHVzZWQgZm9yIGRldGVjdGluZyBjaGFuZ2VzIGluIHRoZSBjb21wb25lbnQuXG4gICAqL1xuICBjaGFuZ2VEZXRlY3Rpb24/OiBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneTtcbn1cblxuLyoqXG4gKiBJbmZvcm1hdGlvbiBuZWVkZWQgdG8gY29tcGlsZSBhIHF1ZXJ5ICh2aWV3IG9yIGNvbnRlbnQpLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIFIzUXVlcnlNZXRhZGF0YSB7XG4gIC8qKlxuICAgKiBOYW1lIG9mIHRoZSBwcm9wZXJ0eSBvbiB0aGUgY2xhc3MgdG8gdXBkYXRlIHdpdGggcXVlcnkgcmVzdWx0cy5cbiAgICovXG4gIHByb3BlcnR5TmFtZTogc3RyaW5nO1xuXG4gIC8qKlxuICAgKiBXaGV0aGVyIHRvIHJlYWQgb25seSB0aGUgZmlyc3QgbWF0Y2hpbmcgcmVzdWx0LCBvciBhbiBhcnJheSBvZiByZXN1bHRzLlxuICAgKi9cbiAgZmlyc3Q6IGJvb2xlYW47XG5cbiAgLyoqXG4gICAqIEVpdGhlciBhbiBleHByZXNzaW9uIHJlcHJlc2VudGluZyBhIHR5cGUgZm9yIHRoZSBxdWVyeSBwcmVkaWNhdGUsIG9yIGEgc2V0IG9mIHN0cmluZyBzZWxlY3RvcnMuXG4gICAqL1xuICBwcmVkaWNhdGU6IG8uRXhwcmVzc2lvbnxzdHJpbmdbXTtcblxuICAvKipcbiAgICogV2hldGhlciB0byBpbmNsdWRlIG9ubHkgZGlyZWN0IGNoaWxkcmVuIG9yIGFsbCBkZXNjZW5kYW50cy5cbiAgICovXG4gIGRlc2NlbmRhbnRzOiBib29sZWFuO1xuXG4gIC8qKlxuICAgKiBBbiBleHByZXNzaW9uIHJlcHJlc2VudGluZyBhIHR5cGUgdG8gcmVhZCBmcm9tIGVhY2ggbWF0Y2hlZCBub2RlLCBvciBudWxsIGlmIHRoZSBkZWZhdWx0IHZhbHVlXG4gICAqIGZvciBhIGdpdmVuIG5vZGUgaXMgdG8gYmUgcmV0dXJuZWQuXG4gICAqL1xuICByZWFkOiBvLkV4cHJlc3Npb258bnVsbDtcbn1cblxuLyoqXG4gKiBPdXRwdXQgb2YgcmVuZGVyMyBkaXJlY3RpdmUgY29tcGlsYXRpb24uXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgUjNEaXJlY3RpdmVEZWYge1xuICBleHByZXNzaW9uOiBvLkV4cHJlc3Npb247XG4gIHR5cGU6IG8uVHlwZTtcbiAgc3RhdGVtZW50czogby5TdGF0ZW1lbnRbXTtcbn1cblxuLyoqXG4gKiBPdXRwdXQgb2YgcmVuZGVyMyBjb21wb25lbnQgY29tcGlsYXRpb24uXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgUjNDb21wb25lbnREZWYge1xuICBleHByZXNzaW9uOiBvLkV4cHJlc3Npb247XG4gIHR5cGU6IG8uVHlwZTtcbiAgc3RhdGVtZW50czogby5TdGF0ZW1lbnRbXTtcbn1cbiJdfQ==