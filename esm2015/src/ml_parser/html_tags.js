/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { TagContentType } from './tags';
export class HtmlTagDefinition {
    constructor({ closedByChildren, requiredParents, implicitNamespacePrefix, contentType = TagContentType.PARSABLE_DATA, closedByParent = false, isVoid = false, ignoreFirstLf = false } = {}) {
        this.closedByChildren = {};
        this.closedByParent = false;
        this.canSelfClose = false;
        if (closedByChildren && closedByChildren.length > 0) {
            closedByChildren.forEach(tagName => this.closedByChildren[tagName] = true);
        }
        this.isVoid = isVoid;
        this.closedByParent = closedByParent || isVoid;
        if (requiredParents && requiredParents.length > 0) {
            this.requiredParents = {};
            // The first parent is the list is automatically when none of the listed parents are present
            this.parentToAdd = requiredParents[0];
            requiredParents.forEach(tagName => this.requiredParents[tagName] = true);
        }
        this.implicitNamespacePrefix = implicitNamespacePrefix || null;
        this.contentType = contentType;
        this.ignoreFirstLf = ignoreFirstLf;
    }
    requireExtraParent(currentParent) {
        if (!this.requiredParents) {
            return false;
        }
        if (!currentParent) {
            return true;
        }
        const lcParent = currentParent.toLowerCase();
        const isParentTemplate = lcParent === 'template' || currentParent === 'ng-template';
        return !isParentTemplate && this.requiredParents[lcParent] != true;
    }
    isClosedByChild(name) {
        return this.isVoid || name.toLowerCase() in this.closedByChildren;
    }
}
// see http://www.w3.org/TR/html51/syntax.html#optional-tags
// This implementation does not fully conform to the HTML5 spec.
const TAG_DEFINITIONS = {
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
            'address', 'article', 'aside', 'blockquote', 'div', 'dl', 'fieldset', 'footer', 'form',
            'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'header', 'hgroup', 'hr',
            'main', 'nav', 'ol', 'p', 'pre', 'section', 'table', 'ul'
        ],
        closedByParent: true
    }),
    'thead': new HtmlTagDefinition({ closedByChildren: ['tbody', 'tfoot'] }),
    'tbody': new HtmlTagDefinition({ closedByChildren: ['tbody', 'tfoot'], closedByParent: true }),
    'tfoot': new HtmlTagDefinition({ closedByChildren: ['tbody'], closedByParent: true }),
    'tr': new HtmlTagDefinition({
        closedByChildren: ['tr'],
        requiredParents: ['tbody', 'tfoot', 'thead'],
        closedByParent: true
    }),
    'td': new HtmlTagDefinition({ closedByChildren: ['td', 'th'], closedByParent: true }),
    'th': new HtmlTagDefinition({ closedByChildren: ['td', 'th'], closedByParent: true }),
    'col': new HtmlTagDefinition({ requiredParents: ['colgroup'], isVoid: true }),
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
    'style': new HtmlTagDefinition({ contentType: TagContentType.RAW_TEXT }),
    'script': new HtmlTagDefinition({ contentType: TagContentType.RAW_TEXT }),
    'title': new HtmlTagDefinition({ contentType: TagContentType.ESCAPABLE_RAW_TEXT }),
    'textarea': new HtmlTagDefinition({ contentType: TagContentType.ESCAPABLE_RAW_TEXT, ignoreFirstLf: true }),
};
const _DEFAULT_TAG_DEFINITION = new HtmlTagDefinition();
export function getHtmlTagDefinition(tagName) {
    return TAG_DEFINITIONS[tagName.toLowerCase()] || _DEFAULT_TAG_DEFINITION;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaHRtbF90YWdzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXIvc3JjL21sX3BhcnNlci9odG1sX3RhZ3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLGNBQWMsRUFBZ0IsTUFBTSxRQUFRLENBQUM7QUFFckQsTUFBTTtJQVlKLFlBQ0ksRUFBQyxnQkFBZ0IsRUFBRSxlQUFlLEVBQUUsdUJBQXVCLEVBQzFELFdBQVcsR0FBRyxjQUFjLENBQUMsYUFBYSxFQUFFLGNBQWMsR0FBRyxLQUFLLEVBQUUsTUFBTSxHQUFHLEtBQUssRUFDbEYsYUFBYSxHQUFHLEtBQUssS0FRbEIsRUFBRTtRQXRCRixxQkFBZ0IsR0FBNkIsRUFBRSxDQUFDO1FBRXhELG1CQUFjLEdBQVksS0FBSyxDQUFDO1FBT2hDLGlCQUFZLEdBQVksS0FBSyxDQUFDO1FBYzVCLElBQUksZ0JBQWdCLElBQUksZ0JBQWdCLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtZQUNuRCxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUM7U0FDNUU7UUFDRCxJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztRQUNyQixJQUFJLENBQUMsY0FBYyxHQUFHLGNBQWMsSUFBSSxNQUFNLENBQUM7UUFDL0MsSUFBSSxlQUFlLElBQUksZUFBZSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7WUFDakQsSUFBSSxDQUFDLGVBQWUsR0FBRyxFQUFFLENBQUM7WUFDMUIsNEZBQTRGO1lBQzVGLElBQUksQ0FBQyxXQUFXLEdBQUcsZUFBZSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3RDLGVBQWUsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMs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Q0FBQyxFQUFDLGdCQUFnQixFQUFFLENBQUMsUUFBUSxFQUFFLFVBQVUsQ0FBQyxFQUFFLGNBQWMsRUFBRSxJQUFJLEVBQUMsQ0FBQztJQUNqRyxLQUFLLEVBQUUsSUFBSSxpQkFBaUIsQ0FBQyxFQUFDLGFBQWEsRUFBRSxJQUFJLEVBQUMsQ0FBQztJQUNuRCxTQUFTLEVBQUUsSUFBSSxpQkFBaUIsQ0FBQyxFQUFDLGFBQWEsRUFBRSxJQUFJLEVBQUMsQ0FBQztJQUN2RCxPQUFPLEVBQUUsSUFBSSxpQkFBaUIsQ0FBQyxFQUFDLFdBQVcsRUFBRSxjQUFjLENBQUMsUUFBUSxFQUFDLENBQUM7SUFDdEUsUUFBUSxFQUFFLElBQUksaUJBQWlCLENBQUMsRUFBQyxXQUFXLEVBQUUsY0FBYyxDQUFDLFFBQVEsRUFBQyxDQUFDO0lBQ3ZFLE9BQU8sRUFBRSxJQUFJLGlCQUFpQixDQUFDLEVBQUMsV0FBVyxFQUFFLGNBQWMsQ0FBQyxrQkFBa0IsRUFBQyxDQUFDO0lBQ2hGLFVBQVUsRUFDTixJQUFJLGlCQUFpQixDQUFDLEVBQUMsV0FBVyxFQUFFLGNBQWMsQ0FBQyxrQkFBa0IsRUFBRSxhQUFhLEVBQUUsSUFBSSxFQUFDLENBQUM7Q0FDakcsQ0FBQztBQUVGLE1BQU0sdUJBQXVCLEdBQUcsSUFBSSxpQkFBaUIsRUFBRSxDQUFDO0FBRXhELE1BQU0sK0JBQStCLE9BQWU7SUFDbEQsT0FBTyxlQUFlLENBQUMsT0FBTyxDQUFDLFdBQVcsRUFBRSxDQUFDLElBQUksdUJBQXVCLENBQUM7QUFDM0UsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtUYWdDb250ZW50VHlwZSwgVGFnRGVmaW5pdGlvbn0gZnJvbSAnLi90YWdzJztcblxuZXhwb3J0IGNsYXNzIEh0bWxUYWdEZWZpbml0aW9uIGltcGxlbWVudHMgVGFnRGVmaW5pdGlvbiB7XG4gIHByaXZhdGUgY2xvc2VkQnlDaGlsZHJlbjoge1trZXk6IHN0cmluZ106IGJvb2xlYW59ID0ge307XG5cbiAgY2xvc2VkQnlQYXJlbnQ6IGJvb2xlYW4gPSBmYWxzZTtcbiAgcmVxdWlyZWRQYXJlbnRzOiB7W2tleTogc3RyaW5nXTogYm9vbGVhbn07XG4gIHBhcmVudFRvQWRkOiBzdHJpbmc7XG4gIGltcGxpY2l0TmFtZXNwYWNlUHJlZml4OiBzdHJpbmd8bnVsbDtcbiAgY29udGVudFR5cGU6IFRhZ0NvbnRlbnRUeXBlO1xuICBpc1ZvaWQ6IGJvb2xlYW47XG4gIGlnbm9yZUZpcnN0TGY6IGJvb2xlYW47XG4gIGNhblNlbGZDbG9zZTogYm9vbGVhbiA9IGZhbHNlO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgICAge2Nsb3NlZEJ5Q2hpbGRyZW4sIHJlcXVpcmVkUGFyZW50cywgaW1wbGljaXROYW1lc3BhY2VQcmVmaXgsXG4gICAgICAgY29udGVudFR5cGUgPSBUYWdDb250ZW50VHlwZS5QQVJTQUJMRV9EQVRBLCBjbG9zZWRCeVBhcmVudCA9IGZhbHNlLCBpc1ZvaWQgPSBmYWxzZSxcbiAgICAgICBpZ25vcmVGaXJzdExmID0gZmFsc2V9OiB7XG4gICAgICAgIGNsb3NlZEJ5Q2hpbGRyZW4/OiBzdHJpbmdbXSxcbiAgICAgICAgY2xvc2VkQnlQYXJlbnQ/OiBib29sZWFuLFxuICAgICAgICByZXF1aXJlZFBhcmVudHM/OiBzdHJpbmdbXSxcbiAgICAgICAgaW1wbGljaXROYW1lc3BhY2VQcmVmaXg/OiBzdHJpbmcsXG4gICAgICAgIGNvbnRlbnRUeXBlPzogVGFnQ29udGVudFR5cGUsXG4gICAgICAgIGlzVm9pZD86IGJvb2xlYW4sXG4gICAgICAgIGlnbm9yZUZpcnN0TGY/OiBib29sZWFuXG4gICAgICB9ID0ge30pIHtcbiAgICBpZiAoY2xvc2VkQnlDaGlsZHJlbiAmJiBjbG9zZWRCeUNoaWxkcmVuLmxlbmd0aCA+IDApIHtcbiAgICAgIGNsb3NlZEJ5Q2hpbGRyZW4uZm9yRWFjaCh0YWdOYW1lID0+IHRoaXMuY2xvc2VkQnlDaGlsZHJlblt0YWdOYW1lXSA9IHRydWUpO1xuICAgIH1cbiAgICB0aGlzLmlzVm9pZCA9IGlzVm9pZDtcbiAgICB0aGlzLmNsb3NlZEJ5UGFyZW50ID0gY2xvc2VkQnlQYXJlbnQgfHwgaXNWb2lkO1xuICAgIGlmIChyZXF1aXJlZFBhcmVudHMgJiYgcmVxdWlyZWRQYXJlbnRzLmxlbmd0aCA+IDApIHtcbiAgICAgIHRoaXMucmVxdWlyZWRQYXJlbnRzID0ge307XG4gICAgICAvLyBUaGUgZmlyc3QgcGFyZW50IGlzIHRoZSBsaXN0IGlzIGF1dG9tYXRpY2FsbHkgd2hlbiBub25lIG9mIHRoZSBsaXN0ZWQgcGFyZW50cyBhcmUgcHJlc2VudFxuICAgICAgdGhpcy5wYXJlbnRUb0FkZCA9IHJlcXVpcmVkUGFyZW50c1swXTtcbiAgICAgIHJlcXVpcmVkUGFyZW50cy5mb3JFYWNoKHRhZ05hbWUgPT4gdGhpcy5yZXF1aXJlZFBhcmVudHNbdGFnTmFtZV0gPSB0cnVlKTtcbiAgICB9XG4gICAgdGhpcy5pbXBsaWNpdE5hbWVzcGFjZVByZWZpeCA9IGltcGxpY2l0TmFtZXNwYWNlUHJlZml4IHx8IG51bGw7XG4gICAgdGhpcy5jb250ZW50VHlwZSA9IGNvbnRlbnRUeXBlO1xuICAgIHRoaXMuaWdub3JlRmlyc3RMZiA9IGlnbm9yZUZpcnN0TGY7XG4gIH1cblxuICByZXF1aXJlRXh0cmFQYXJlbnQoY3VycmVudFBhcmVudDogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgaWYgKCF0aGlzLnJlcXVpcmVkUGFyZW50cykge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGlmICghY3VycmVudFBhcmVudCkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgY29uc3QgbGNQYXJlbnQgPSBjdXJyZW50UGFyZW50LnRvTG93ZXJDYXNlKCk7XG4gICAgY29uc3QgaXNQYXJlbnRUZW1wbGF0ZSA9IGxjUGFyZW50ID09PSAndGVtcGxhdGUnIHx8IGN1cnJlbnRQYXJlbnQgPT09ICduZy10ZW1wbGF0ZSc7XG4gICAgcmV0dXJuICFpc1BhcmVudFRlbXBsYXRlICYmIHRoaXMucmVxdWlyZWRQYXJlbnRzW2xjUGFyZW50XSAhPSB0cnVlO1xuICB9XG5cbiAgaXNDbG9zZWRCeUNoaWxkKG5hbWU6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmlzVm9pZCB8fCBuYW1lLnRvTG93ZXJDYXNlKCkgaW4gdGhpcy5jbG9zZWRCeUNoaWxkcmVuO1xuICB9XG59XG5cbi8vIHNlZSBodHRwOi8vd3d3LnczLm9yZy9UUi9odG1sNTEvc3ludGF4Lmh0bWwjb3B0aW9uYWwtdGFnc1xuLy8gVGhpcyBpbXBsZW1lbnRhdGlvbiBkb2VzIG5vdCBmdWxseSBjb25mb3JtIHRvIHRoZSBIVE1MNSBzcGVjLlxuY29uc3QgVEFHX0RFRklOSVRJT05TOiB7W2tleTogc3RyaW5nXTogSHRtbFRhZ0RlZmluaXRpb259ID0ge1xuICAnYmFzZSc6IG5ldyBIdG1sVGFnRGVmaW5pdGlvbih7aXNWb2lkOiB0cnVlfSksXG4gICdtZXRhJzogbmV3IEh0bWxUYWdEZWZpbml0aW9uKHtpc1ZvaWQ6IHRydWV9KSxcbiAgJ2FyZWEnOiBuZXcgSHRtbFRhZ0RlZmluaXRpb24oe2lzVm9pZDogdHJ1ZX0pLFxuICAnZW1iZWQnOiBuZXcgSHRtbFRhZ0RlZmluaXRpb24oe2lzVm9pZDogdHJ1ZX0pLFxuICAnbGluayc6IG5ldyBIdG1sVGFnRGVmaW5pdGlvbih7aXNWb2lkOiB0cnVlfSksXG4gICdpbWcnOiBuZXcgSHRtbFRhZ0RlZmluaXRpb24oe2lzVm9pZDogdHJ1ZX0pLFxuICAnaW5wdXQnOiBuZXcgSHRtbFRhZ0RlZmluaXRpb24oe2lzVm9pZDogdHJ1ZX0pLFxuICAncGFyYW0nOiBuZXcgSHRtbFRhZ0RlZmluaXRpb24oe2lzVm9pZDogdHJ1ZX0pLFxuICAnaHInOiBuZXcgSHRtbFRhZ0RlZmluaXRpb24oe2lzVm9pZDogdHJ1ZX0pLFxuICAnYnInOiBuZXcgSHRtbFRhZ0RlZmluaXRpb24oe2lzVm9pZDogdHJ1ZX0pLFxuICAnc291cmNlJzogbmV3IEh0bWxUYWdEZWZpbml0aW9uKHtpc1ZvaWQ6IHRydWV9KSxcbiAgJ3RyYWNrJzogbmV3IEh0bWxUYWdEZWZpbml0aW9uKHtpc1ZvaWQ6IHRydWV9KSxcbiAgJ3dicic6IG5ldyBIdG1sVGFnRGVmaW5pdGlvbih7aXNWb2lkOiB0cnVlfSksXG4gICdwJzogbmV3IEh0bWxUYWdEZWZpbml0aW9uKHtcbiAgICBjbG9zZWRCeUNoaWxkcmVuOiBbXG4gICAgICAnYWRkcmVzcycsICdhcnRpY2xlJywgJ2FzaWRlJywgJ2Jsb2NrcXVvdGUnLCAnZGl2JywgJ2RsJywgICAgICAnZmllbGRzZXQnLCAnZm9vdGVyJywgJ2Zvcm0nLFxuICAgICAgJ2gxJywgICAgICAnaDInLCAgICAgICdoMycsICAgICdoNCcsICAgICAgICAgJ2g1JywgICdoNicsICAgICAgJ2hlYWRlcicsICAgJ2hncm91cCcsICdocicsXG4gICAgICAnbWFpbicsICAgICduYXYnLCAgICAgJ29sJywgICAgJ3AnLCAgICAgICAgICAncHJlJywgJ3NlY3Rpb24nLCAndGFibGUnLCAgICAndWwnXG4gICAgXSxcbiAgICBjbG9zZWRCeVBhcmVudDogdHJ1ZVxuICB9KSxcbiAgJ3RoZWFkJzogbmV3IEh0bWxUYWdEZWZpbml0aW9uKHtjbG9zZWRCeUNoaWxkcmVuOiBbJ3Rib2R5JywgJ3Rmb290J119KSxcbiAgJ3Rib2R5JzogbmV3IEh0bWxUYWdEZWZpbml0aW9uKHtjbG9zZWRCeUNoaWxkcmVuOiBbJ3Rib2R5JywgJ3Rmb290J10sIGNsb3NlZEJ5UGFyZW50OiB0cnVlfSksXG4gICd0Zm9vdCc6IG5ldyBIdG1sVGFnRGVmaW5pdGlvbih7Y2xvc2VkQnlDaGlsZHJlbjogWyd0Ym9keSddLCBjbG9zZWRCeVBhcmVudDogdHJ1ZX0pLFxuICAndHInOiBuZXcgSHRtbFRhZ0RlZmluaXRpb24oe1xuICAgIGNsb3NlZEJ5Q2hpbGRyZW46IFsndHInXSxcbiAgICByZXF1aXJlZFBhcmVudHM6IFsndGJvZHknLCAndGZvb3QnLCAndGhlYWQnXSxcbiAgICBjbG9zZWRCeVBhcmVudDogdHJ1ZVxuICB9KSxcbiAgJ3RkJzogbmV3IEh0bWxUYWdEZWZpbml0aW9uKHtjbG9zZWRCeUNoaWxkcmVuOiBbJ3RkJywgJ3RoJ10sIGNsb3NlZEJ5UGFyZW50OiB0cnVlfSksXG4gICd0aCc6IG5ldyBIdG1sVGFnRGVmaW5pdGlvbih7Y2xvc2VkQnlDaGlsZHJlbjogWyd0ZCcsICd0aCddLCBjbG9zZWRCeVBhcmVudDogdHJ1ZX0pLFxuICAnY29sJzogbmV3IEh0bWxUYWdEZWZpbml0aW9uKHtyZXF1aXJlZFBhcmVudHM6IFsnY29sZ3JvdXAnXSwgaXNWb2lkOiB0cnVlfSksXG4gICdzdmcnOiBuZXcgSHRtbFRhZ0RlZmluaXRpb24oe2ltcGxpY2l0TmFtZXNwYWNlUHJlZml4OiAnc3ZnJ30pLFxuICAnbWF0aCc6IG5ldyBIdG1sVGFnRGVmaW5pdGlvbih7aW1wbGljaXROYW1lc3BhY2VQcmVmaXg6ICdtYXRoJ30pLFxuICAnbGknOiBuZXcgSHRtbFRhZ0RlZmluaXRpb24oe2Nsb3NlZEJ5Q2hpbGRyZW46IFsnbGknXSwgY2xvc2VkQnlQYXJlbnQ6IHRydWV9KSxcbiAgJ2R0JzogbmV3IEh0bWxUYWdEZWZpbml0aW9uKHtjbG9zZWRCeUNoaWxkcmVuOiBbJ2R0JywgJ2RkJ119KSxcbiAgJ2RkJzogbmV3IEh0bWxUYWdEZWZpbml0aW9uKHtjbG9zZWRCeUNoaWxkcmVuOiBbJ2R0JywgJ2RkJ10sIGNsb3NlZEJ5UGFyZW50OiB0cnVlfSksXG4gICdyYic6IG5ldyBIdG1sVGFnRGVmaW5pdGlvbih7Y2xvc2VkQnlDaGlsZHJlbjogWydyYicsICdydCcsICdydGMnLCAncnAnXSwgY2xvc2VkQnlQYXJlbnQ6IHRydWV9KSxcbiAgJ3J0JzogbmV3IEh0bWxUYWdEZWZpbml0aW9uKHtjbG9zZWRCeUNoaWxkcmVuOiBbJ3JiJywgJ3J0JywgJ3J0YycsICdycCddLCBjbG9zZWRCeVBhcmVudDogdHJ1ZX0pLFxuICAncnRjJzogbmV3IEh0bWxUYWdEZWZpbml0aW9uKHtjbG9zZWRCeUNoaWxkcmVuOiBbJ3JiJywgJ3J0YycsICdycCddLCBjbG9zZWRCeVBhcmVudDogdHJ1ZX0pLFxuICAncnAnOiBuZXcgSHRtbFRhZ0RlZmluaXRpb24oe2Nsb3NlZEJ5Q2hpbGRyZW46IFsncmInLCAncnQnLCAncnRjJywgJ3JwJ10sIGNsb3NlZEJ5UGFyZW50OiB0cnVlfSksXG4gICdvcHRncm91cCc6IG5ldyBIdG1sVGFnRGVmaW5pdGlvbih7Y2xvc2VkQnlDaGlsZHJlbjogWydvcHRncm91cCddLCBjbG9zZWRCeVBhcmVudDogdHJ1ZX0pLFxuICAnb3B0aW9uJzogbmV3IEh0bWxUYWdEZWZpbml0aW9uKHtjbG9zZWRCeUNoaWxkcmVuOiBbJ29wdGlvbicsICdvcHRncm91cCddLCBjbG9zZWRCeVBhcmVudDogdHJ1ZX0pLFxuICAncHJlJzogbmV3IEh0bWxUYWdEZWZpbml0aW9uKHtpZ25vcmVGaXJzdExmOiB0cnVlfSksXG4gICdsaXN0aW5nJzogbmV3IEh0bWxUYWdEZWZpbml0aW9uKHtpZ25vcmVGaXJzdExmOiB0cnVlfSksXG4gICdzdHlsZSc6IG5ldyBIdG1sVGFnRGVmaW5pdGlvbih7Y29udGVudFR5cGU6IFRhZ0NvbnRlbnRUeXBlLlJBV19URVhUfSksXG4gICdzY3JpcHQnOiBuZXcgSHRtbFRhZ0RlZmluaXRpb24oe2NvbnRlbnRUeXBlOiBUYWdDb250ZW50VHlwZS5SQVdfVEVYVH0pLFxuICAndGl0bGUnOiBuZXcgSHRtbFRhZ0RlZmluaXRpb24oe2NvbnRlbnRUeXBlOiBUYWdDb250ZW50VHlwZS5FU0NBUEFCTEVfUkFXX1RFWFR9KSxcbiAgJ3RleHRhcmVhJzpcbiAgICAgIG5ldyBIdG1sVGFnRGVmaW5pdGlvbih7Y29udGVudFR5cGU6IFRhZ0NvbnRlbnRUeXBlLkVTQ0FQQUJMRV9SQVdfVEVYVCwgaWdub3JlRmlyc3RMZjogdHJ1ZX0pLFxufTtcblxuY29uc3QgX0RFRkFVTFRfVEFHX0RFRklOSVRJT04gPSBuZXcgSHRtbFRhZ0RlZmluaXRpb24oKTtcblxuZXhwb3J0IGZ1bmN0aW9uIGdldEh0bWxUYWdEZWZpbml0aW9uKHRhZ05hbWU6IHN0cmluZyk6IEh0bWxUYWdEZWZpbml0aW9uIHtcbiAgcmV0dXJuIFRBR19ERUZJTklUSU9OU1t0YWdOYW1lLnRvTG93ZXJDYXNlKCldIHx8IF9ERUZBVUxUX1RBR19ERUZJTklUSU9OO1xufVxuIl19