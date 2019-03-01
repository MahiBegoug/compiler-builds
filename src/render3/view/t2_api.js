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
        define("@angular/compiler/src/render3/view/t2_api", ["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidDJfYXBpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXIvc3JjL3JlbmRlcjMvdmlldy90Ml9hcGkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0FTVH0gZnJvbSAnLi4vLi4vZXhwcmVzc2lvbl9wYXJzZXIvYXN0JztcblxuaW1wb3J0IHtCb3VuZEF0dHJpYnV0ZSwgQm91bmRFdmVudCwgRWxlbWVudCwgTm9kZSwgUmVmZXJlbmNlLCBUZW1wbGF0ZSwgVGV4dEF0dHJpYnV0ZSwgVmFyaWFibGV9IGZyb20gJy4uL3IzX2FzdCc7XG5cbi8qXG4gKiB0MiBpcyB0aGUgcmVwbGFjZW1lbnQgZm9yIHRoZSBgVGVtcGxhdGVEZWZpbml0aW9uQnVpbGRlcmAuIEl0IGhhbmRsZXMgdGhlIG9wZXJhdGlvbnMgb2ZcbiAqIGFuYWx5emluZyBBbmd1bGFyIHRlbXBsYXRlcywgZXh0cmFjdGluZyBzZW1hbnRpYyBpbmZvLCBhbmQgdWx0aW1hdGVseSBwcm9kdWNpbmcgYSB0ZW1wbGF0ZVxuICogZGVmaW5pdGlvbiBmdW5jdGlvbiB3aGljaCByZW5kZXJzIHRoZSB0ZW1wbGF0ZSB1c2luZyBJdnkgaW5zdHJ1Y3Rpb25zLlxuICpcbiAqIHQyIGRhdGEgaXMgYWxzbyB1dGlsaXplZCBieSB0aGUgdGVtcGxhdGUgdHlwZS1jaGVja2luZyBmYWNpbGl0aWVzIHRvIHVuZGVyc3RhbmQgYSB0ZW1wbGF0ZSBlbm91Z2hcbiAqIHRvIGdlbmVyYXRlIHR5cGUtY2hlY2tpbmcgY29kZSBmb3IgaXQuXG4gKi9cblxuLyoqXG4gKiBBIGxvZ2ljYWwgdGFyZ2V0IGZvciBhbmFseXNpcywgd2hpY2ggY291bGQgY29udGFpbiBhIHRlbXBsYXRlIG9yIG90aGVyIHR5cGVzIG9mIGJpbmRpbmdzLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIFRhcmdldCB7IHRlbXBsYXRlPzogTm9kZVtdOyB9XG5cbi8qKlxuICogTWV0YWRhdGEgcmVnYXJkaW5nIGEgZGlyZWN0aXZlIHRoYXQncyBuZWVkZWQgdG8gbWF0Y2ggaXQgYWdhaW5zdCB0ZW1wbGF0ZSBlbGVtZW50cy4gVGhpcyBpc1xuICogcHJvdmlkZWQgYnkgYSBjb25zdW1lciBvZiB0aGUgdDIgQVBJcy5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBEaXJlY3RpdmVNZXRhIHtcbiAgLyoqXG4gICAqIE5hbWUgb2YgdGhlIGRpcmVjdGl2ZSBjbGFzcyAodXNlZCBmb3IgZGVidWdnaW5nKS5cbiAgICovXG4gIG5hbWU6IHN0cmluZztcblxuICAvKipcbiAgICogV2hldGhlciB0aGUgZGlyZWN0aXZlIGlzIGEgY29tcG9uZW50LlxuICAgKi9cbiAgaXNDb21wb25lbnQ6IGJvb2xlYW47XG5cbiAgLyoqXG4gICAqIFNldCBvZiBpbnB1dHMgd2hpY2ggdGhpcyBkaXJlY3RpdmUgY2xhaW1zLlxuICAgKlxuICAgKiBHb2VzIGZyb20gcHJvcGVydHkgbmFtZXMgdG8gZmllbGQgbmFtZXMuXG4gICAqL1xuICBpbnB1dHM6IHtbcHJvcGVydHk6IHN0cmluZ106IHN0cmluZyB8IFtzdHJpbmcsIHN0cmluZ119O1xuXG4gIC8qKlxuICAgKiBTZXQgb2Ygb3V0cHV0cyB3aGljaCB0aGlzIGRpcmVjdGl2ZSBjbGFpbXMuXG4gICAqXG4gICAqIEdvZXMgZnJvbSBwcm9wZXJ0eSBuYW1lcyB0byBmaWVsZCBuYW1lcy5cbiAgICovXG4gIG91dHB1dHM6IHtbcHJvcGVydHk6IHN0cmluZ106IHN0cmluZ307XG5cbiAgLyoqXG4gICAqIE5hbWUgdW5kZXIgd2hpY2ggdGhlIGRpcmVjdGl2ZSBpcyBleHBvcnRlZCwgaWYgYW55IChleHBvcnRBcyBpbiBBbmd1bGFyKS5cbiAgICpcbiAgICogTnVsbCBvdGhlcndpc2VcbiAgICovXG4gIGV4cG9ydEFzOiBzdHJpbmdbXXxudWxsO1xufVxuXG4vKipcbiAqIEludGVyZmFjZSB0byB0aGUgYmluZGluZyBBUEksIHdoaWNoIHByb2Nlc3NlcyBhIHRlbXBsYXRlIGFuZCByZXR1cm5zIGFuIG9iamVjdCBzaW1pbGFyIHRvIHRoZVxuICogYHRzLlR5cGVDaGVja2VyYC5cbiAqXG4gKiBUaGUgcmV0dXJuZWQgYEJvdW5kVGFyZ2V0YCBoYXMgYW4gQVBJIGZvciBleHRyYWN0aW5nIGluZm9ybWF0aW9uIGFib3V0IHRoZSBwcm9jZXNzZWQgdGFyZ2V0LlxuICovXG5leHBvcnQgaW50ZXJmYWNlIFRhcmdldEJpbmRlcjxEIGV4dGVuZHMgRGlyZWN0aXZlTWV0YT4geyBiaW5kKHRhcmdldDogVGFyZ2V0KTogQm91bmRUYXJnZXQ8RD47IH1cblxuLyoqXG4gKiBSZXN1bHQgb2YgcGVyZm9ybWluZyB0aGUgYmluZGluZyBvcGVyYXRpb24gYWdhaW5zdCBhIGBUYXJnZXRgLlxuICpcbiAqIFRoZSBvcmlnaW5hbCBgVGFyZ2V0YCBpcyBhY2Nlc3NpYmxlLCBhcyB3ZWxsIGFzIGEgc3VpdGUgb2YgbWV0aG9kcyBmb3IgZXh0cmFjdGluZyBiaW5kaW5nXG4gKiBpbmZvcm1hdGlvbiByZWdhcmRpbmcgdGhlIGBUYXJnZXRgLlxuICpcbiAqIEBwYXJhbSBEaXJlY3RpdmVUIGRpcmVjdGl2ZSBtZXRhZGF0YSB0eXBlXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQm91bmRUYXJnZXQ8RGlyZWN0aXZlVCBleHRlbmRzIERpcmVjdGl2ZU1ldGE+IHtcbiAgLyoqXG4gICAqIEdldCB0aGUgb3JpZ2luYWwgYFRhcmdldGAgdGhhdCB3YXMgYm91bmQuXG4gICAqL1xuICByZWFkb25seSB0YXJnZXQ6IFRhcmdldDtcblxuICAvKipcbiAgICogRm9yIGEgZ2l2ZW4gdGVtcGxhdGUgbm9kZSAoZWl0aGVyIGFuIGBFbGVtZW50YCBvciBhIGBUZW1wbGF0ZWApLCBnZXQgdGhlIHNldCBvZiBkaXJlY3RpdmVzXG4gICAqIHdoaWNoIG1hdGNoZWQgdGhlIG5vZGUsIGlmIGFueS5cbiAgICovXG4gIGdldERpcmVjdGl2ZXNPZk5vZGUobm9kZTogRWxlbWVudHxUZW1wbGF0ZSk6IERpcmVjdGl2ZVRbXXxudWxsO1xuXG4gIC8qKlxuICAgKiBGb3IgYSBnaXZlbiBgUmVmZXJlbmNlYCwgZ2V0IHRoZSByZWZlcmVuY2UncyB0YXJnZXQgLSBlaXRoZXIgYW4gYEVsZW1lbnRgLCBhIGBUZW1wbGF0ZWAsIG9yXG4gICAqIGEgZGlyZWN0aXZlIG9uIGEgcGFydGljdWxhciBub2RlLlxuICAgKi9cbiAgZ2V0UmVmZXJlbmNlVGFyZ2V0KHJlZjogUmVmZXJlbmNlKToge2RpcmVjdGl2ZTogRGlyZWN0aXZlVCwgbm9kZTogRWxlbWVudHxUZW1wbGF0ZX18RWxlbWVudFxuICAgICAgfFRlbXBsYXRlfG51bGw7XG5cbiAgLyoqXG4gICAqIEZvciBhIGdpdmVuIGJpbmRpbmcsIGdldCB0aGUgZW50aXR5IHRvIHdoaWNoIHRoZSBiaW5kaW5nIGlzIGJlaW5nIG1hZGUuXG4gICAqXG4gICAqIFRoaXMgd2lsbCBlaXRoZXIgYmUgYSBkaXJlY3RpdmUgb3IgdGhlIG5vZGUgaXRzZWxmLlxuICAgKi9cbiAgZ2V0Q29uc3VtZXJPZkJpbmRpbmcoYmluZGluZzogQm91bmRBdHRyaWJ1dGV8Qm91bmRFdmVudHxUZXh0QXR0cmlidXRlKTogRGlyZWN0aXZlVHxFbGVtZW50XG4gICAgICB8VGVtcGxhdGV8bnVsbDtcblxuICAvKipcbiAgICogSWYgdGhlIGdpdmVuIGBBU1RgIGV4cHJlc3Npb24gcmVmZXJzIHRvIGEgYFJlZmVyZW5jZWAgb3IgYFZhcmlhYmxlYCB3aXRoaW4gdGhlIGBUYXJnZXRgLCB0aGVuXG4gICAqIHJldHVybiB0aGF0LlxuICAgKlxuICAgKiBPdGhlcndpc2UsIHJldHVybnMgYG51bGxgLlxuICAgKlxuICAgKiBUaGlzIGlzIG9ubHkgZGVmaW5lZCBmb3IgYEFTVGAgZXhwcmVzc2lvbnMgdGhhdCByZWFkIG9yIHdyaXRlIHRvIGEgcHJvcGVydHkgb2YgYW5cbiAgICogYEltcGxpY2l0UmVjZWl2ZXJgLlxuICAgKi9cbiAgZ2V0RXhwcmVzc2lvblRhcmdldChleHByOiBBU1QpOiBSZWZlcmVuY2V8VmFyaWFibGV8bnVsbDtcblxuICAvKipcbiAgICogR2l2ZW4gYSBwYXJ0aWN1bGFyIGBSZWZlcmVuY2VgIG9yIGBWYXJpYWJsZWAsIGdldCB0aGUgYFRlbXBsYXRlYCB3aGljaCBjcmVhdGVkIGl0LlxuICAgKlxuICAgKiBBbGwgYFZhcmlhYmxlYHMgYXJlIGRlZmluZWQgb24gdGVtcGxhdGVzLCBzbyB0aGlzIHdpbGwgYWx3YXlzIHJldHVybiBhIHZhbHVlIGZvciBhIGBWYXJpYWJsZWBcbiAgICogZnJvbSB0aGUgYFRhcmdldGAuIEZvciBgUmVmZXJlbmNlYHMgdGhpcyBvbmx5IHJldHVybnMgYSB2YWx1ZSBpZiB0aGUgYFJlZmVyZW5jZWAgcG9pbnRzIHRvIGFcbiAgICogYFRlbXBsYXRlYC4gUmV0dXJucyBgbnVsbGAgb3RoZXJ3aXNlLlxuICAgKi9cbiAgZ2V0VGVtcGxhdGVPZlN5bWJvbChzeW1ib2w6IFJlZmVyZW5jZXxWYXJpYWJsZSk6IFRlbXBsYXRlfG51bGw7XG5cbiAgLyoqXG4gICAqIEdldCB0aGUgbmVzdGluZyBsZXZlbCBvZiBhIHBhcnRpY3VsYXIgYFRlbXBsYXRlYC5cbiAgICpcbiAgICogVGhpcyBzdGFydHMgYXQgMSBmb3IgdG9wLWxldmVsIGBUZW1wbGF0ZWBzIHdpdGhpbiB0aGUgYFRhcmdldGAgYW5kIGluY3JlYXNlcyBmb3IgYFRlbXBsYXRlYHNcbiAgICogbmVzdGVkIGF0IGRlZXBlciBsZXZlbHMuXG4gICAqL1xuICBnZXROZXN0aW5nTGV2ZWwodGVtcGxhdGU6IFRlbXBsYXRlKTogbnVtYmVyO1xuXG4gIC8qKlxuICAgKiBHZXQgYSBsaXN0IG9mIGFsbCB0aGUgZGlyZWN0aXZlcyB1c2VkIGJ5IHRoZSB0YXJnZXQuXG4gICAqL1xuICBnZXRVc2VkRGlyZWN0aXZlcygpOiBEaXJlY3RpdmVUW107XG5cbiAgLyoqXG4gICAqIEdldCBhIGxpc3Qgb2YgYWxsIHRoZSBwaXBlcyB1c2VkIGJ5IHRoZSB0YXJnZXQuXG4gICAqL1xuICBnZXRVc2VkUGlwZXMoKTogc3RyaW5nW107XG59XG4iXX0=