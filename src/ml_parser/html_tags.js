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
        define("@angular/compiler/src/ml_parser/html_tags", ["require", "exports", "@angular/compiler/src/ml_parser/tags"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getHtmlTagDefinition = exports.HtmlTagDefinition = void 0;
    var tags_1 = require("@angular/compiler/src/ml_parser/tags");
    var HtmlTagDefinition = /** @class */ (function () {
        function HtmlTagDefinition(_a) {
            var _this = this;
            var _b = _a === void 0 ? {} : _a, closedByChildren = _b.closedByChildren, implicitNamespacePrefix = _b.implicitNamespacePrefix, _c = _b.contentType, contentType = _c === void 0 ? tags_1.TagContentType.PARSABLE_DATA : _c, _d = _b.closedByParent, closedByParent = _d === void 0 ? false : _d, _e = _b.isVoid, isVoid = _e === void 0 ? false : _e, _f = _b.ignoreFirstLf, ignoreFirstLf = _f === void 0 ? false : _f;
            this.closedByChildren = {};
            this.closedByParent = false;
            this.canSelfClose = false;
            if (closedByChildren && closedByChildren.length > 0) {
                closedByChildren.forEach(function (tagName) { return _this.closedByChildren[tagName] = true; });
            }
            this.isVoid = isVoid;
            this.closedByParent = closedByParent || isVoid;
            this.implicitNamespacePrefix = implicitNamespacePrefix || null;
            this.contentType = contentType;
            this.ignoreFirstLf = ignoreFirstLf;
        }
        HtmlTagDefinition.prototype.isClosedByChild = function (name) {
            return this.isVoid || name.toLowerCase() in this.closedByChildren;
        };
        return HtmlTagDefinition;
    }());
    exports.HtmlTagDefinition = HtmlTagDefinition;
    var _DEFAULT_TAG_DEFINITION;
    // see http://www.w3.org/TR/html51/syntax.html#optional-tags
    // This implementation does not fully conform to the HTML5 spec.
    var TAG_DEFINITIONS;
    function getHtmlTagDefinition(tagName) {
        if (!TAG_DEFINITIONS) {
            _DEFAULT_TAG_DEFINITION = new HtmlTagDefinition();
            TAG_DEFINITIONS = {
                'base': new HtmlTagDefinition({ isVoid: true }),
                'meta': new HtmlTagDefinition({ isVoid: true }),
                'area': new HtmlTagDefinition({ isVoid: true }),
                'embed': new HtmlTagDefinition({ isVoid: true }),
                'link': new HtmlTagDefinition({ isVoid: true }),
                'img': new HtmlTagDefinition({ isVoid: true }),
                'input': new HtmlTagDefinition({ isVoid: true }),
                'param': new HtmlTagDefinition({ isVoid: true }),
                'hr': new HtmlTagDefinition({ isVoid: true }),
                'br': new HtmlTagDefinition({ isVoid: true }),
                'source': new HtmlTagDefinition({ isVoid: true }),
                'track': new HtmlTagDefinition({ isVoid: true }),
                'wbr': new HtmlTagDefinition({ isVoid: true }),
                'p': new HtmlTagDefinition({
                    closedByChildren: [
                        'address', 'article', 'aside', 'blockquote', 'div', 'dl', 'fieldset',
                        'footer', 'form', 'h1', 'h2', 'h3', 'h4', 'h5',
                        'h6', 'header', 'hgroup', 'hr', 'main', 'nav', 'ol',
                        'p', 'pre', 'section', 'table', 'ul'
                    ],
                    closedByParent: true
                }),
                'thead': new HtmlTagDefinition({ closedByChildren: ['tbody', 'tfoot'] }),
                'tbody': new HtmlTagDefinition({ closedByChildren: ['tbody', 'tfoot'], closedByParent: true }),
                'tfoot': new HtmlTagDefinition({ closedByChildren: ['tbody'], closedByParent: true }),
                'tr': new HtmlTagDefinition({ closedByChildren: ['tr'], closedByParent: true }),
                'td': new HtmlTagDefinition({ closedByChildren: ['td', 'th'], closedByParent: true }),
                'th': new HtmlTagDefinition({ closedByChildren: ['td', 'th'], closedByParent: true }),
                'col': new HtmlTagDefinition({ isVoid: true }),
                'svg': new HtmlTagDefinition({ implicitNamespacePrefix: 'svg' }),
                'math': new HtmlTagDefinition({ implicitNamespacePrefix: 'math' }),
                'li': new HtmlTagDefinition({ closedByChildren: ['li'], closedByParent: true }),
                'dt': new HtmlTagDefinition({ closedByChildren: ['dt', 'dd'] }),
                'dd': new HtmlTagDefinition({ closedByChildren: ['dt', 'dd'], closedByParent: true }),
                'rb': new HtmlTagDefinition({ closedByChildren: ['rb', 'rt', 'rtc', 'rp'], closedByParent: true }),
                'rt': new HtmlTagDefinition({ closedByChildren: ['rb', 'rt', 'rtc', 'rp'], closedByParent: true }),
                'rtc': new HtmlTagDefinition({ closedByChildren: ['rb', 'rtc', 'rp'], closedByParent: true }),
                'rp': new HtmlTagDefinition({ closedByChildren: ['rb', 'rt', 'rtc', 'rp'], closedByParent: true }),
                'optgroup': new HtmlTagDefinition({ closedByChildren: ['optgroup'], closedByParent: true }),
                'option': new HtmlTagDefinition({ closedByChildren: ['option', 'optgroup'], closedByParent: true }),
                'pre': new HtmlTagDefinition({ ignoreFirstLf: true }),
                'listing': new HtmlTagDefinition({ ignoreFirstLf: true }),
                'style': new HtmlTagDefinition({ contentType: tags_1.TagContentType.RAW_TEXT }),
                'script': new HtmlTagDefinition({ contentType: tags_1.TagContentType.RAW_TEXT }),
                'title': new HtmlTagDefinition({ contentType: tags_1.TagContentType.ESCAPABLE_RAW_TEXT }),
                'textarea': new HtmlTagDefinition({ contentType: tags_1.TagContentType.ESCAPABLE_RAW_TEXT, ignoreFirstLf: true }),
            };
        }
        return TAG_DEFINITIONS[tagName.toLowerCase()] || _DEFAULT_TAG_DEFINITION;
    }
    exports.getHtmlTagDefinition = getHtmlTagDefinition;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaHRtbF90YWdzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXIvc3JjL21sX3BhcnNlci9odG1sX3RhZ3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7O0lBRUgsNkRBQXFEO0lBRXJEO1FBVUUsMkJBQVksRUFjTjtZQWROLGlCQXVCQztnQkF2QlcscUJBY1IsRUFBRSxLQUFBLEVBYkosZ0JBQWdCLHNCQUFBLEVBQ2hCLHVCQUF1Qiw2QkFBQSxFQUN2QixtQkFBMEMsRUFBMUMsV0FBVyxtQkFBRyxxQkFBYyxDQUFDLGFBQWEsS0FBQSxFQUMxQyxzQkFBc0IsRUFBdEIsY0FBYyxtQkFBRyxLQUFLLEtBQUEsRUFDdEIsY0FBYyxFQUFkLE1BQU0sbUJBQUcsS0FBSyxLQUFBLEVBQ2QscUJBQXFCLEVBQXJCLGFBQWEsbUJBQUcsS0FBSyxLQUFBO1lBZmYscUJBQWdCLEdBQTZCLEVBQUUsQ0FBQztZQUV4RCxtQkFBYyxHQUFZLEtBQUssQ0FBQztZQUtoQyxpQkFBWSxHQUFZLEtBQUssQ0FBQztZQWlCNUIsSUFBSSxnQkFBZ0IsSUFBSSxnQkFBZ0IsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO2dCQUNuRCxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsVUFBQSxPQUFPLElBQUksT0FBQSxLQUFJLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxDQUFDLEdBQUcsSUFBSSxFQUFyQyxDQUFxQyxDQUFDLENBQUM7YUFDNUU7WUFDRCxJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztZQUNyQixJQUFJLENBQUMsY0FBYyxHQUFHLGNBQWMsSUFBSSxNQUFNLENBQUM7WUFDL0MsSUFBSSxDQUFDLHVCQUF1QixHQUFHLHVCQUF1QixJQUFJLElBQUksQ0FBQztZQUMvRCxJQUFJLENBQUMsV0FBVyxHQUFHLFdBQVcsQ0FBQztZQUMvQixJQUFJLENBQUMsYUFBYSxH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QUFDLFFBQVEsRUFBQyxDQUFDO2dCQUN2RSxPQUFPLEVBQUUsSUFBSSxpQkFBaUIsQ0FBQyxFQUFDLFdBQVcsRUFBRSxxQkFBYyxDQUFDLGtCQUFrQixFQUFDLENBQUM7Z0JBQ2hGLFVBQVUsRUFBRSxJQUFJLGlCQUFpQixDQUM3QixFQUFDLFdBQVcsRUFBRSxxQkFBYyxDQUFDLGtCQUFrQixFQUFFLGFBQWEsRUFBRSxJQUFJLEVBQUMsQ0FBQzthQUMzRSxDQUFDO1NBQ0g7UUFDRCxPQUFPLGVBQWUsQ0FBQyxPQUFPLENBQUMsV0FBVyxFQUFFLENBQUMsSUFBSSx1QkFBdUIsQ0FBQztJQUMzRSxDQUFDO0lBMURELG9EQTBEQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtUYWdDb250ZW50VHlwZSwgVGFnRGVmaW5pdGlvbn0gZnJvbSAnLi90YWdzJztcblxuZXhwb3J0IGNsYXNzIEh0bWxUYWdEZWZpbml0aW9uIGltcGxlbWVudHMgVGFnRGVmaW5pdGlvbiB7XG4gIHByaXZhdGUgY2xvc2VkQnlDaGlsZHJlbjoge1trZXk6IHN0cmluZ106IGJvb2xlYW59ID0ge307XG5cbiAgY2xvc2VkQnlQYXJlbnQ6IGJvb2xlYW4gPSBmYWxzZTtcbiAgaW1wbGljaXROYW1lc3BhY2VQcmVmaXg6IHN0cmluZ3xudWxsO1xuICBjb250ZW50VHlwZTogVGFnQ29udGVudFR5cGU7XG4gIGlzVm9pZDogYm9vbGVhbjtcbiAgaWdub3JlRmlyc3RMZjogYm9vbGVhbjtcbiAgY2FuU2VsZkNsb3NlOiBib29sZWFuID0gZmFsc2U7XG5cbiAgY29uc3RydWN0b3Ioe1xuICAgIGNsb3NlZEJ5Q2hpbGRyZW4sXG4gICAgaW1wbGljaXROYW1lc3BhY2VQcmVmaXgsXG4gICAgY29udGVudFR5cGUgPSBUYWdDb250ZW50VHlwZS5QQVJTQUJMRV9EQVRBLFxuICAgIGNsb3NlZEJ5UGFyZW50ID0gZmFsc2UsXG4gICAgaXNWb2lkID0gZmFsc2UsXG4gICAgaWdub3JlRmlyc3RMZiA9IGZhbHNlXG4gIH06IHtcbiAgICBjbG9zZWRCeUNoaWxkcmVuPzogc3RyaW5nW10sXG4gICAgY2xvc2VkQnlQYXJlbnQ/OiBib29sZWFuLFxuICAgIGltcGxpY2l0TmFtZXNwYWNlUHJlZml4Pzogc3RyaW5nLFxuICAgIGNvbnRlbnRUeXBlPzogVGFnQ29udGVudFR5cGUsXG4gICAgaXNWb2lkPzogYm9vbGVhbixcbiAgICBpZ25vcmVGaXJzdExmPzogYm9vbGVhblxuICB9ID0ge30pIHtcbiAgICBpZiAoY2xvc2VkQnlDaGlsZHJlbiAmJiBjbG9zZWRCeUNoaWxkcmVuLmxlbmd0aCA+IDApIHtcbiAgICAgIGNsb3NlZEJ5Q2hpbGRyZW4uZm9yRWFjaCh0YWdOYW1lID0+IHRoaXMuY2xvc2VkQnlDaGlsZHJlblt0YWdOYW1lXSA9IHRydWUpO1xuICAgIH1cbiAgICB0aGlzLmlzVm9pZCA9IGlzVm9pZDtcbiAgICB0aGlzLmNsb3NlZEJ5UGFyZW50ID0gY2xvc2VkQnlQYXJlbnQgfHwgaXNWb2lkO1xuICAgIHRoaXMuaW1wbGljaXROYW1lc3BhY2VQcmVmaXggPSBpbXBsaWNpdE5hbWVzcGFjZVByZWZpeCB8fCBudWxsO1xuICAgIHRoaXMuY29udGVudFR5cGUgPSBjb250ZW50VHlwZTtcbiAgICB0aGlzLmlnbm9yZUZpcnN0TGYgPSBpZ25vcmVGaXJzdExmO1xuICB9XG5cbiAgaXNDbG9zZWRCeUNoaWxkKG5hbWU6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmlzVm9pZCB8fCBuYW1lLnRvTG93ZXJDYXNlKCkgaW4gdGhpcy5jbG9zZWRCeUNoaWxkcmVuO1xuICB9XG59XG5cbmxldCBfREVGQVVMVF9UQUdfREVGSU5JVElPTiE6IEh0bWxUYWdEZWZpbml0aW9uO1xuXG4vLyBzZWUgaHR0cDovL3d3dy53My5vcmcvVFIvaHRtbDUxL3N5bnRheC5odG1sI29wdGlvbmFsLXRhZ3Ncbi8vIFRoaXMgaW1wbGVtZW50YXRpb24gZG9lcyBub3QgZnVsbHkgY29uZm9ybSB0byB0aGUgSFRNTDUgc3BlYy5cbmxldCBUQUdfREVGSU5JVElPTlMhOiB7W2tleTogc3RyaW5nXTogSHRtbFRhZ0RlZmluaXRpb259O1xuXG5leHBvcnQgZnVuY3Rpb24gZ2V0SHRtbFRhZ0RlZmluaXRpb24odGFnTmFtZTogc3RyaW5nKTogSHRtbFRhZ0RlZmluaXRpb24ge1xuICBpZiAoIVRBR19ERUZJTklUSU9OUykge1xuICAgIF9ERUZBVUxUX1RBR19ERUZJTklUSU9OID0gbmV3IEh0bWxUYWdEZWZpbml0aW9uKCk7XG4gICAgVEFHX0RFRklOSVRJT05TID0ge1xuICAgICAgJ2Jhc2UnOiBuZXcgSHRtbFRhZ0RlZmluaXRpb24oe2lzVm9pZDogdHJ1ZX0pLFxuICAgICAgJ21ldGEnOiBuZXcgSHRtbFRhZ0RlZmluaXRpb24oe2lzVm9pZDogdHJ1ZX0pLFxuICAgICAgJ2FyZWEnOiBuZXcgSHRtbFRhZ0RlZmluaXRpb24oe2lzVm9pZDogdHJ1ZX0pLFxuICAgICAgJ2VtYmVkJzogbmV3IEh0bWxUYWdEZWZpbml0aW9uKHtpc1ZvaWQ6IHRydWV9KSxcbiAgICAgICdsaW5rJzogbmV3IEh0bWxUYWdEZWZpbml0aW9uKHtpc1ZvaWQ6IHRydWV9KSxcbiAgICAgICdpbWcnOiBuZXcgSHRtbFRhZ0RlZmluaXRpb24oe2lzVm9pZDogdHJ1ZX0pLFxuICAgICAgJ2lucHV0JzogbmV3IEh0bWxUYWdEZWZpbml0aW9uKHtpc1ZvaWQ6IHRydWV9KSxcbiAgICAgICdwYXJhbSc6IG5ldyBIdG1sVGFnRGVmaW5pdGlvbih7aXNWb2lkOiB0cnVlfSksXG4gICAgICAnaHInOiBuZXcgSHRtbFRhZ0RlZmluaXRpb24oe2lzVm9pZDogdHJ1ZX0pLFxuICAgICAgJ2JyJzogbmV3IEh0bWxUYWdEZWZpbml0aW9uKHtpc1ZvaWQ6IHRydWV9KSxcbiAgICAgICdzb3VyY2UnOiBuZXcgSHRtbFRhZ0RlZmluaXRpb24oe2lzVm9pZDogdHJ1ZX0pLFxuICAgICAgJ3RyYWNrJzogbmV3IEh0bWxUYWdEZWZpbml0aW9uKHtpc1ZvaWQ6IHRydWV9KSxcbiAgICAgICd3YnInOiBuZXcgSHRtbFRhZ0RlZmluaXRpb24oe2lzVm9pZDogdHJ1ZX0pLFxuICAgICAgJ3AnOiBuZXcgSHRtbFRhZ0RlZmluaXRpb24oe1xuICAgICAgICBjbG9zZWRCeUNoaWxkcmVuOiBbXG4gICAgICAgICAgJ2FkZHJlc3MnLCAnYXJ0aWNsZScsICdhc2lkZScsICAgJ2Jsb2NrcXVvdGUnLCAnZGl2JywgICdkbCcsICAnZmllbGRzZXQnLFxuICAgICAgICAgICdmb290ZXInLCAgJ2Zvcm0nLCAgICAnaDEnLCAgICAgICdoMicsICAgICAgICAgJ2gzJywgICAnaDQnLCAgJ2g1JyxcbiAgICAgICAgICAnaDYnLCAgICAgICdoZWFkZXInLCAgJ2hncm91cCcsICAnaHInLCAgICAgICAgICdtYWluJywgJ25hdicsICdvbCcsXG4gICAgICAgICAgJ3AnLCAgICAgICAncHJlJywgICAgICdzZWN0aW9uJywgJ3RhYmxlJywgICAgICAndWwnXG4gICAgICAgIF0sXG4gICAgICAgIGNsb3NlZEJ5UGFyZW50OiB0cnVlXG4gICAgICB9KSxcbiAgICAgICd0aGVhZCc6IG5ldyBIdG1sVGFnRGVmaW5pdGlvbih7Y2xvc2VkQnlDaGlsZHJlbjogWyd0Ym9keScsICd0Zm9vdCddfSksXG4gICAgICAndGJvZHknOiBuZXcgSHRtbFRhZ0RlZmluaXRpb24oe2Nsb3NlZEJ5Q2hpbGRyZW46IFsndGJvZHknLCAndGZvb3QnXSwgY2xvc2VkQnlQYXJlbnQ6IHRydWV9KSxcbiAgICAgICd0Zm9vdCc6IG5ldyBIdG1sVGFnRGVmaW5pdGlvbih7Y2xvc2VkQnlDaGlsZHJlbjogWyd0Ym9keSddLCBjbG9zZWRCeVBhcmVudDogdHJ1ZX0pLFxuICAgICAgJ3RyJzogbmV3IEh0bWxUYWdEZWZpbml0aW9uKHtjbG9zZWRCeUNoaWxkcmVuOiBbJ3RyJ10sIGNsb3NlZEJ5UGFyZW50OiB0cnVlfSksXG4gICAgICAndGQnOiBuZXcgSHRtbFRhZ0RlZmluaXRpb24oe2Nsb3NlZEJ5Q2hpbGRyZW46IFsndGQnLCAndGgnXSwgY2xvc2VkQnlQYXJlbnQ6IHRydWV9KSxcbiAgICAgICd0aCc6IG5ldyBIdG1sVGFnRGVmaW5pdGlvbih7Y2xvc2VkQnlDaGlsZHJlbjogWyd0ZCcsICd0aCddLCBjbG9zZWRCeVBhcmVudDogdHJ1ZX0pLFxuICAgICAgJ2NvbCc6IG5ldyBIdG1sVGFnRGVmaW5pdGlvbih7aXNWb2lkOiB0cnVlfSksXG4gICAgICAnc3ZnJzogbmV3IEh0bWxUYWdEZWZpbml0aW9uKHtpbXBsaWNpdE5hbWVzcGFjZVByZWZpeDogJ3N2Zyd9KSxcbiAgICAgICdtYXRoJzogbmV3IEh0bWxUYWdEZWZpbml0aW9uKHtpbXBsaWNpdE5hbWVzcGFjZVByZWZpeDogJ21hdGgnfSksXG4gICAgICAnbGknOiBuZXcgSHRtbFRhZ0RlZmluaXRpb24oe2Nsb3NlZEJ5Q2hpbGRyZW46IFsnbGknXSwgY2xvc2VkQnlQYXJlbnQ6IHRydWV9KSxcbiAgICAgICdkdCc6IG5ldyBIdG1sVGFnRGVmaW5pdGlvbih7Y2xvc2VkQnlDaGlsZHJlbjogWydkdCcsICdkZCddfSksXG4gICAgICAnZGQnOiBuZXcgSHRtbFRhZ0RlZmluaXRpb24oe2Nsb3NlZEJ5Q2hpbGRyZW46IFsnZHQnLCAnZGQnXSwgY2xvc2VkQnlQYXJlbnQ6IHRydWV9KSxcbiAgICAgICdyYic6IG5ldyBIdG1sVGFnRGVmaW5pdGlvbihcbiAgICAgICAgICB7Y2xvc2VkQnlDaGlsZHJlbjogWydyYicsICdydCcsICdydGMnLCAncnAnXSwgY2xvc2VkQnlQYXJlbnQ6IHRydWV9KSxcbiAgICAgICdydCc6IG5ldyBIdG1sVGFnRGVmaW5pdGlvbihcbiAgICAgICAgICB7Y2xvc2VkQnlDaGlsZHJlbjogWydyYicsICdydCcsICdydGMnLCAncnAnXSwgY2xvc2VkQnlQYXJlbnQ6IHRydWV9KSxcbiAgICAgICdydGMnOiBuZXcgSHRtbFRhZ0RlZmluaXRpb24oe2Nsb3NlZEJ5Q2hpbGRyZW46IFsncmInLCAncnRjJywgJ3JwJ10sIGNsb3NlZEJ5UGFyZW50OiB0cnVlfSksXG4gICAgICAncnAnOiBuZXcgSHRtbFRhZ0RlZmluaXRpb24oXG4gICAgICAgICAge2Nsb3NlZEJ5Q2hpbGRyZW46IFsncmInLCAncnQnLCAncnRjJywgJ3JwJ10sIGNsb3NlZEJ5UGFyZW50OiB0cnVlfSksXG4gICAgICAnb3B0Z3JvdXAnOiBuZXcgSHRtbFRhZ0RlZmluaXRpb24oe2Nsb3NlZEJ5Q2hpbGRyZW46IFsnb3B0Z3JvdXAnXSwgY2xvc2VkQnlQYXJlbnQ6IHRydWV9KSxcbiAgICAgICdvcHRpb24nOlxuICAgICAgICAgIG5ldyBIdG1sVGFnRGVmaW5pdGlvbih7Y2xvc2VkQnlDaGlsZHJlbjogWydvcHRpb24nLCAnb3B0Z3JvdXAnXSwgY2xvc2VkQnlQYXJlbnQ6IHRydWV9KSxcbiAgICAgICdwcmUnOiBuZXcgSHRtbFRhZ0RlZmluaXRpb24oe2lnbm9yZUZpcnN0TGY6IHRydWV9KSxcbiAgICAgICdsaXN0aW5nJzogbmV3IEh0bWxUYWdEZWZpbml0aW9uKHtpZ25vcmVGaXJzdExmOiB0cnVlfSksXG4gICAgICAnc3R5bGUnOiBuZXcgSHRtbFRhZ0RlZmluaXRpb24oe2NvbnRlbnRUeXBlOiBUYWdDb250ZW50VHlwZS5SQVdfVEVYVH0pLFxuICAgICAgJ3NjcmlwdCc6IG5ldyBIdG1sVGFnRGVmaW5pdGlvbih7Y29udGVudFR5cGU6IFRhZ0NvbnRlbnRUeXBlLlJBV19URVhUfSksXG4gICAgICAndGl0bGUnOiBuZXcgSHRtbFRhZ0RlZmluaXRpb24oe2NvbnRlbnRUeXBlOiBUYWdDb250ZW50VHlwZS5FU0NBUEFCTEVfUkFXX1RFWFR9KSxcbiAgICAgICd0ZXh0YXJlYSc6IG5ldyBIdG1sVGFnRGVmaW5pdGlvbihcbiAgICAgICAgICB7Y29udGVudFR5cGU6IFRhZ0NvbnRlbnRUeXBlLkVTQ0FQQUJMRV9SQVdfVEVYVCwgaWdub3JlRmlyc3RMZjogdHJ1ZX0pLFxuICAgIH07XG4gIH1cbiAgcmV0dXJuIFRBR19ERUZJTklUSU9OU1t0YWdOYW1lLnRvTG93ZXJDYXNlKCldIHx8IF9ERUZBVUxUX1RBR19ERUZJTklUSU9OO1xufVxuIl19