/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as tslib_1 from "tslib";
// Attention:
// This file duplicates types and values from @angular/core
// so that we are able to make @angular/compiler independent of @angular/core.
// This is important to prevent a build cycle, as @angular/core needs to
// be compiled with the compiler.
import { CssSelector } from './selector';
export var createInject = makeMetadataFactory('Inject', function (token) { return ({ token: token }); });
export var createInjectionToken = makeMetadataFactory('InjectionToken', function (desc) { return ({ _desc: desc, ngInjectableDef: undefined }); });
export var createAttribute = makeMetadataFactory('Attribute', function (attributeName) { return ({ attributeName: attributeName }); });
export var createContentChildren = makeMetadataFactory('ContentChildren', function (selector, data) {
    if (data === void 0) { data = {}; }
    return (tslib_1.__assign({ selector: selector, first: false, isViewQuery: false, descendants: false }, data));
});
export var createContentChild = makeMetadataFactory('ContentChild', function (selector, data) {
    if (data === void 0) { data = {}; }
    return (tslib_1.__assign({ selector: selector, first: true, isViewQuery: false, descendants: true }, data));
});
export var createViewChildren = makeMetadataFactory('ViewChildren', function (selector, data) {
    if (data === void 0) { data = {}; }
    return (tslib_1.__assign({ selector: selector, first: false, isViewQuery: true, descendants: true }, data));
});
export var createViewChild = makeMetadataFactory('ViewChild', function (selector, data) {
    return (tslib_1.__assign({ selector: selector, first: true, isViewQuery: true, descendants: true }, data));
});
export var createDirective = makeMetadataFactory('Directive', function (dir) {
    if (dir === void 0) { dir = {}; }
    return dir;
});
export var ViewEncapsulation;
(function (ViewEncapsulation) {
    ViewEncapsulation[ViewEncapsulation["Emulated"] = 0] = "Emulated";
    ViewEncapsulation[ViewEncapsulation["Native"] = 1] = "Native";
    ViewEncapsulation[ViewEncapsulation["None"] = 2] = "None";
    ViewEncapsulation[ViewEncapsulation["ShadowDom"] = 3] = "ShadowDom";
})(ViewEncapsulation || (ViewEncapsulation = {}));
export var ChangeDetectionStrategy;
(function (ChangeDetectionStrategy) {
    ChangeDetectionStrategy[ChangeDetectionStrategy["OnPush"] = 0] = "OnPush";
    ChangeDetectionStrategy[ChangeDetectionStrategy["Default"] = 1] = "Default";
})(ChangeDetectionStrategy || (ChangeDetectionStrategy = {}));
export var createComponent = makeMetadataFactory('Component', function (c) {
    if (c === void 0) { c = {}; }
    return (tslib_1.__assign({ changeDetection: ChangeDetectionStrategy.Default }, c));
});
export var createPipe = makeMetadataFactory('Pipe', function (p) { return (tslib_1.__assign({ pure: true }, p)); });
export var createInput = makeMetadataFactory('Input', function (bindingPropertyName) { return ({ bindingPropertyName: bindingPropertyName }); });
export var createOutput = makeMetadataFactory('Output', function (bindingPropertyName) { return ({ bindingPropertyName: bindingPropertyName }); });
export var createHostBinding = makeMetadataFactory('HostBinding', function (hostPropertyName) { return ({ hostPropertyName: hostPropertyName }); });
export var createHostListener = makeMetadataFactory('HostListener', function (eventName, args) { return ({ eventName: eventName, args: args }); });
export var createNgModule = makeMetadataFactory('NgModule', function (ngModule) { return ngModule; });
export var createInjectable = makeMetadataFactory('Injectable', function (injectable) {
    if (injectable === void 0) { injectable = {}; }
    return injectable;
});
export var CUSTOM_ELEMENTS_SCHEMA = {
    name: 'custom-elements'
};
export var NO_ERRORS_SCHEMA = {
    name: 'no-errors-schema'
};
export var createOptional = makeMetadataFactory('Optional');
export var createSelf = makeMetadataFactory('Self');
export var createSkipSelf = makeMetadataFactory('SkipSelf');
export var createHost = makeMetadataFactory('Host');
export var Type = Function;
export var SecurityContext;
(function (SecurityContext) {
    SecurityContext[SecurityContext["NONE"] = 0] = "NONE";
    SecurityContext[SecurityContext["HTML"] = 1] = "HTML";
    SecurityContext[SecurityContext["STYLE"] = 2] = "STYLE";
    SecurityContext[SecurityContext["SCRIPT"] = 3] = "SCRIPT";
    SecurityContext[SecurityContext["URL"] = 4] = "URL";
    SecurityContext[SecurityContext["RESOURCE_URL"] = 5] = "RESOURCE_URL";
})(SecurityContext || (SecurityContext = {}));
export var MissingTranslationStrategy;
(function (MissingTranslationStrategy) {
    MissingTranslationStrategy[MissingTranslationStrategy["Error"] = 0] = "Error";
    MissingTranslationStrategy[MissingTranslationStrategy["Warning"] = 1] = "Warning";
    MissingTranslationStrategy[MissingTranslationStrategy["Ignore"] = 2] = "Ignore";
})(MissingTranslationStrategy || (MissingTranslationStrategy = {}));
function makeMetadataFactory(name, props) {
    var factory = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var values = props ? props.apply(void 0, tslib_1.__spread(args)) : {};
        return tslib_1.__assign({ ngMetadataName: name }, values);
    };
    factory.isTypeOf = function (obj) { return obj && obj.ngMetadataName === name; };
    factory.ngMetadataName = name;
    return factory;
}
function parserSelectorToSimpleSelector(selector) {
    var classes = selector.classNames && selector.classNames.length ? tslib_1.__spread([8 /* CLASS */], selector.classNames) :
        [];
    var elementName = selector.element && selector.element !== '*' ? selector.element : '';
    return tslib_1.__spread([elementName], selector.attrs, classes);
}
function parserSelectorToNegativeSelector(selector) {
    var classes = selector.classNames && selector.classNames.length ? tslib_1.__spread([8 /* CLASS */], selector.classNames) :
        [];
    if (selector.element) {
        return tslib_1.__spread([
            1 /* NOT */ | 4 /* ELEMENT */, selector.element
        ], selector.attrs, classes);
    }
    else if (selector.attrs.length) {
        return tslib_1.__spread([1 /* NOT */ | 2 /* ATTRIBUTE */], selector.attrs, classes);
    }
    else {
        return selector.classNames && selector.classNames.length ? tslib_1.__spread([1 /* NOT */ | 8 /* CLASS */], selector.classNames) :
            [];
    }
}
function parserSelectorToR3Selector(selector) {
    var positive = parserSelectorToSimpleSelector(selector);
    var negative = selector.notSelectors && selector.notSelectors.length ?
        selector.notSelectors.map(function (notSelector) { return parserSelectorToNegativeSelector(notSelector); }) :
        [];
    return positive.concat.apply(positive, tslib_1.__spread(negative));
}
export function parseSelectorToR3Selector(selector) {
    var selectors = CssSelector.parse(selector);
    return selectors.map(parserSelectorToR3Selector);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29yZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyL3NyYy9jb3JlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7QUFFSCxhQUFhO0FBQ2IsMkRBQTJEO0FBQzNELDhFQUE4RTtBQUM5RSx3RUFBd0U7QUFDeEUsaUNBQWlDO0FBRWpDLE9BQU8sRUFBQyxXQUFXLEVBQUMsTUFBTSxZQUFZLENBQUM7QUFHdkMsTUFBTSxDQUFDLElBQU0sWUFBWSxHQUFHLG1CQUFtQixDQUFTLFFBQVEsRUFBRSxVQUFDLEtBQVUsSUFBSyxPQUFBLENBQUMsRUFBQyxLQUFLLE9BQUEsRUFBQyxDQUFDLEVBQVQsQ0FBUyxDQUFDLENBQUM7QUFDN0YsTUFBTSxDQUFDLElBQU0sb0JBQW9CLEdBQUcsbUJBQW1CLENBQ25ELGdCQUFnQixFQUFFLFVBQUMsSUFBWSxJQUFLLE9BQUEsQ0FBQyxFQUFDLEtBQUssRUFBRSxJQUFJLEVBQUUsZUFBZSxFQUFFLFNBQVMsRUFBQyxDQUFDLEVBQTNDLENBQTJDLENBQUMsQ0FBQztBQUdyRixNQUFNLENBQUMsSUFBTSxlQUFlLEdBQ3hCLG1CQUFtQixDQUFZLFdBQVcsRUFBRSxVQUFDLGFBQXNCLElBQUssT0FBQSxDQUFDLEVBQUMsYUFBYSxlQUFBLEVBQUMsQ0FBQyxFQUFqQixDQUFpQixDQUFDLENBQUM7QUFVL0YsTUFBTSxDQUFDLElBQU0scUJBQXFCLEdBQUcsbUJBQW1CLENBQ3BELGlCQUFpQixFQUNqQixVQUFDLFFBQWMsRUFBRSxJQUFjO0lBQWQscUJBQUEsRUFBQSxTQUFjO0lBQzNCLE9BQUEsb0JBQUUsUUFBUSxVQUFBLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxXQUFXLEVBQUUsS0FBSyxFQUFFLFdBQVcsRUFBRSxLQUFLLElBQUssSUFBSSxFQUFFO0FBQTNFLENBQTJFLENBQUMsQ0FBQztBQUNyRixNQUFNLENB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LCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbi8vIEF0dGVudGlvbjpcbi8vIFRoaXMgZmlsZSBkdXBsaWNhdGVzIHR5cGVzIGFuZCB2YWx1ZXMgZnJvbSBAYW5ndWxhci9jb3JlXG4vLyBzbyB0aGF0IHdlIGFyZSBhYmxlIHRvIG1ha2UgQGFuZ3VsYXIvY29tcGlsZXIgaW5kZXBlbmRlbnQgb2YgQGFuZ3VsYXIvY29yZS5cbi8vIFRoaXMgaXMgaW1wb3J0YW50IHRvIHByZXZlbnQgYSBidWlsZCBjeWNsZSwgYXMgQGFuZ3VsYXIvY29yZSBuZWVkcyB0b1xuLy8gYmUgY29tcGlsZWQgd2l0aCB0aGUgY29tcGlsZXIuXG5cbmltcG9ydCB7Q3NzU2VsZWN0b3J9IGZyb20gJy4vc2VsZWN0b3InO1xuXG5leHBvcnQgaW50ZXJmYWNlIEluamVjdCB7IHRva2VuOiBhbnk7IH1cbmV4cG9ydCBjb25zdCBjcmVhdGVJbmplY3QgPSBtYWtlTWV0YWRhdGFGYWN0b3J5PEluamVjdD4oJ0luamVjdCcsICh0b2tlbjogYW55KSA9PiAoe3Rva2VufSkpO1xuZXhwb3J0IGNvbnN0IGNyZWF0ZUluamVjdGlvblRva2VuID0gbWFrZU1ldGFkYXRhRmFjdG9yeTxvYmplY3Q+KFxuICAgICdJbmplY3Rpb25Ub2tlbicsIChkZXNjOiBzdHJpbmcpID0+ICh7X2Rlc2M6IGRlc2MsIG5nSW5qZWN0YWJsZURlZjogdW5kZWZpbmVkfSkpO1xuXG5leHBvcnQgaW50ZXJmYWNlIEF0dHJpYnV0ZSB7IGF0dHJpYnV0ZU5hbWU/OiBzdHJpbmc7IH1cbmV4cG9ydCBjb25zdCBjcmVhdGVBdHRyaWJ1dGUgPVxuICAgIG1ha2VNZXRhZGF0YUZhY3Rvcnk8QXR0cmlidXRlPignQXR0cmlidXRlJywgKGF0dHJpYnV0ZU5hbWU/OiBzdHJpbmcpID0+ICh7YXR0cmlidXRlTmFtZX0pKTtcblxuZXhwb3J0IGludGVyZmFjZSBRdWVyeSB7XG4gIGRlc2NlbmRhbnRzOiBib29sZWFuO1xuICBmaXJzdDogYm9vbGVhbjtcbiAgcmVhZDogYW55O1xuICBpc1ZpZXdRdWVyeTogYm9vbGVhbjtcbiAgc2VsZWN0b3I6IGFueTtcbn1cblxuZXhwb3J0IGNvbnN0IGNyZWF0ZUNvbnRlbnRDaGlsZHJlbiA9IG1ha2VNZXRhZGF0YUZhY3Rvcnk8UXVlcnk+KFxuICAgICdDb250ZW50Q2hpbGRyZW4nLFxuICAgIChzZWxlY3Rvcj86IGFueSwgZGF0YTogYW55ID0ge30pID0+XG4gICAgICAgICh7c2VsZWN0b3IsIGZpcnN0OiBmYWxzZSwgaXNWaWV3UXVlcnk6IGZhbHNlLCBkZXNjZW5kYW50czogZmFsc2UsIC4uLmRhdGF9KSk7XG5leHBvcnQgY29uc3QgY3JlYXRlQ29udGVudENoaWxkID0gbWFrZU1ldGFkYXRhRmFjdG9yeTxRdWVyeT4oXG4gICAgJ0NvbnRlbnRDaGlsZCcsIChzZWxlY3Rvcj86IGFueSwgZGF0YTogYW55ID0ge30pID0+XG4gICAgICAgICAgICAgICAgICAgICAgICAoe3NlbGVjdG9yLCBmaXJzdDogdHJ1ZSwgaXNWaWV3UXVlcnk6IGZhbHNlLCBkZXNjZW5kYW50czogdHJ1ZSwgLi4uZGF0YX0pKTtcbmV4cG9ydCBjb25zdCBjcmVhdGVWaWV3Q2hpbGRyZW4gPSBtYWtlTWV0YWRhdGFGYWN0b3J5PFF1ZXJ5PihcbiAgICAnVmlld0NoaWxkcmVuJywgKHNlbGVjdG9yPzogYW55LCBkYXRhOiBhbnkgPSB7fSkgPT5cbiAgICAgICAgICAgICAgICAgICAgICAgICh7c2VsZWN0b3IsIGZpcnN0OiBmYWxzZSwgaXNWaWV3UXVlcnk6IHRydWUsIGRlc2NlbmRhbnRzOiB0cnVlLCAuLi5kYXRhfSkpO1xuZXhwb3J0IGNvbnN0IGNyZWF0ZVZpZXdDaGlsZCA9IG1ha2VNZXRhZGF0YUZhY3Rvcnk8UXVlcnk+KFxuICAgICdWaWV3Q2hpbGQnLCAoc2VsZWN0b3I6IGFueSwgZGF0YTogYW55KSA9PlxuICAgICAgICAgICAgICAgICAgICAgKHtzZWxlY3RvciwgZmlyc3Q6IHRydWUsIGlzVmlld1F1ZXJ5OiB0cnVlLCBkZXNjZW5kYW50czogdHJ1ZSwgLi4uZGF0YX0pKTtcblxuZXhwb3J0IGludGVyZmFjZSBEaXJlY3RpdmUge1xuICBzZWxlY3Rvcj86IHN0cmluZztcbiAgaW5wdXRzPzogc3RyaW5nW107XG4gIG91dHB1dHM/OiBzdHJpbmdbXTtcbiAgaG9zdD86IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9O1xuICBwcm92aWRlcnM/OiBQcm92aWRlcltdO1xuICBleHBvcnRBcz86IHN0cmluZztcbiAgcXVlcmllcz86IHtba2V5OiBzdHJpbmddOiBhbnl9O1xuICBndWFyZHM/OiB7W2tleTogc3RyaW5nXTogYW55fTtcbn1cbmV4cG9ydCBjb25zdCBjcmVhdGVEaXJlY3RpdmUgPVxuICAgIG1ha2VNZXRhZGF0YUZhY3Rvcnk8RGlyZWN0aXZlPignRGlyZWN0aXZlJywgKGRpcjogRGlyZWN0aXZlID0ge30pID0+IGRpcik7XG5cbmV4cG9ydCBpbnRlcmZhY2UgQ29tcG9uZW50IGV4dGVuZHMgRGlyZWN0aXZlIHtcbiAgY2hhbmdlRGV0ZWN0aW9uPzogQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3k7XG4gIHZpZXdQcm92aWRlcnM/OiBQcm92aWRlcltdO1xuICBtb2R1bGVJZD86IHN0cmluZztcbiAgdGVtcGxhdGVVcmw/OiBzdHJpbmc7XG4gIHRlbXBsYXRlPzogc3RyaW5nO1xuICBzdHlsZVVybHM/OiBzdHJpbmdbXTtcbiAgc3R5bGVzPzogc3RyaW5nW107XG4gIGFuaW1hdGlvbnM/OiBhbnlbXTtcbiAgZW5jYXBzdWxhdGlvbj86IFZpZXdFbmNhcHN1bGF0aW9uO1xuICBpbnRlcnBvbGF0aW9uPzogW3N0cmluZywgc3RyaW5nXTtcbiAgZW50cnlDb21wb25lbnRzPzogQXJyYXk8VHlwZXxhbnlbXT47XG4gIHByZXNlcnZlV2hpdGVzcGFjZXM/OiBib29sZWFuO1xufVxuZXhwb3J0IGVudW0gVmlld0VuY2Fwc3VsYXRpb24ge1xuICBFbXVsYXRlZCA9IDAsXG4gIE5hdGl2ZSA9IDEsXG4gIE5vbmUgPSAyLFxuICBTaGFkb3dEb20gPSAzXG59XG5cbmV4cG9ydCBlbnVtIENoYW5nZURldGVjdGlvblN0cmF0ZWd5IHtcbiAgT25QdXNoID0gMCxcbiAgRGVmYXVsdCA9IDFcbn1cblxuZXhwb3J0IGNvbnN0IGNyZWF0ZUNvbXBvbmVudCA9IG1ha2VNZXRhZGF0YUZhY3Rvcnk8Q29tcG9uZW50PihcbiAgICAnQ29tcG9uZW50JywgKGM6IENvbXBvbmVudCA9IHt9KSA9PiAoe2NoYW5nZURldGVjdGlvbjogQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kuRGVmYXVsdCwgLi4uY30pKTtcblxuZXhwb3J0IGludGVyZmFjZSBQaXBlIHtcbiAgbmFtZTogc3RyaW5nO1xuICBwdXJlPzogYm9vbGVhbjtcbn1cbmV4cG9ydCBjb25zdCBjcmVhdGVQaXBlID0gbWFrZU1ldGFkYXRhRmFjdG9yeTxQaXBlPignUGlwZScsIChwOiBQaXBlKSA9PiAoe3B1cmU6IHRydWUsIC4uLnB9KSk7XG5cbmV4cG9ydCBpbnRlcmZhY2UgSW5wdXQgeyBiaW5kaW5nUHJvcGVydHlOYW1lPzogc3RyaW5nOyB9XG5leHBvcnQgY29uc3QgY3JlYXRlSW5wdXQgPVxuICAgIG1ha2VNZXRhZGF0YUZhY3Rvcnk8SW5wdXQ+KCdJbnB1dCcsIChiaW5kaW5nUHJvcGVydHlOYW1lPzogc3RyaW5nKSA9PiAoe2JpbmRpbmdQcm9wZXJ0eU5hbWV9KSk7XG5cbmV4cG9ydCBpbnRlcmZhY2UgT3V0cHV0IHsgYmluZGluZ1Byb3BlcnR5TmFtZT86IHN0cmluZzsgfVxuZXhwb3J0IGNvbnN0IGNyZWF0ZU91dHB1dCA9IG1ha2VNZXRhZGF0YUZhY3Rvcnk8T3V0cHV0PihcbiAgICAnT3V0cHV0JywgKGJpbmRpbmdQcm9wZXJ0eU5hbWU/OiBzdHJpbmcpID0+ICh7YmluZGluZ1Byb3BlcnR5TmFtZX0pKTtcblxuZXhwb3J0IGludGVyZmFjZSBIb3N0QmluZGluZyB7IGhvc3RQcm9wZXJ0eU5hbWU/OiBzdHJpbmc7IH1cbmV4cG9ydCBjb25zdCBjcmVhdGVIb3N0QmluZGluZyA9IG1ha2VNZXRhZGF0YUZhY3Rvcnk8SG9zdEJpbmRpbmc+KFxuICAgICdIb3N0QmluZGluZycsIChob3N0UHJvcGVydHlOYW1lPzogc3RyaW5nKSA9PiAoe2hvc3RQcm9wZXJ0eU5hbWV9KSk7XG5cbmV4cG9ydCBpbnRlcmZhY2UgSG9zdExpc3RlbmVyIHtcbiAgZXZlbnROYW1lPzogc3RyaW5nO1xuICBhcmdzPzogc3RyaW5nW107XG59XG5leHBvcnQgY29uc3QgY3JlYXRlSG9zdExpc3RlbmVyID0gbWFrZU1ldGFkYXRhRmFjdG9yeTxIb3N0TGlzdGVuZXI+KFxuICAgICdIb3N0TGlzdGVuZXInLCAoZXZlbnROYW1lPzogc3RyaW5nLCBhcmdzPzogc3RyaW5nW10pID0+ICh7ZXZlbnROYW1lLCBhcmdzfSkpO1xuXG5leHBvcnQgaW50ZXJmYWNlIE5nTW9kdWxlIHtcbiAgcHJvdmlkZXJzPzogUHJvdmlkZXJbXTtcbiAgZGVjbGFyYXRpb25zPzogQXJyYXk8VHlwZXxhbnlbXT47XG4gIGltcG9ydHM/OiBBcnJheTxUeXBlfE1vZHVsZVdpdGhQcm92aWRlcnN8YW55W10+O1xuICBleHBvcnRzPzogQXJyYXk8VHlwZXxhbnlbXT47XG4gIGVudHJ5Q29tcG9uZW50cz86IEFycmF5PFR5cGV8YW55W10+O1xuICBib290c3RyYXA/OiBBcnJheTxUeXBlfGFueVtdPjtcbiAgc2NoZW1hcz86IEFycmF5PFNjaGVtYU1ldGFkYXRhfGFueVtdPjtcbiAgaWQ/OiBzdHJpbmc7XG59XG5leHBvcnQgY29uc3QgY3JlYXRlTmdNb2R1bGUgPVxuICAgIG1ha2VNZXRhZGF0YUZhY3Rvcnk8TmdNb2R1bGU+KCdOZ01vZHVsZScsIChuZ01vZHVsZTogTmdNb2R1bGUpID0+IG5nTW9kdWxlKTtcblxuZXhwb3J0IGludGVyZmFjZSBNb2R1bGVXaXRoUHJvdmlkZXJzIHtcbiAgbmdNb2R1bGU6IFR5cGU7XG4gIHByb3ZpZGVycz86IFByb3ZpZGVyW107XG59XG5leHBvcnQgaW50ZXJmYWNlIEluamVjdGFibGUge1xuICBwcm92aWRlZEluPzogVHlwZXwncm9vdCd8YW55O1xuICB1c2VDbGFzcz86IFR5cGV8YW55O1xuICB1c2VFeGlzdGluZz86IFR5cGV8YW55O1xuICB1c2VWYWx1ZT86IGFueTtcbiAgdXNlRmFjdG9yeT86IFR5cGV8YW55O1xuICBkZXBzPzogQXJyYXk8VHlwZXxhbnlbXT47XG59XG5leHBvcnQgY29uc3QgY3JlYXRlSW5qZWN0YWJsZSA9XG4gICAgbWFrZU1ldGFkYXRhRmFjdG9yeSgnSW5qZWN0YWJsZScsIChpbmplY3RhYmxlOiBJbmplY3RhYmxlID0ge30pID0+IGluamVjdGFibGUpO1xuZXhwb3J0IGludGVyZmFjZSBTY2hlbWFNZXRhZGF0YSB7IG5hbWU6IHN0cmluZzsgfVxuXG5leHBvcnQgY29uc3QgQ1VTVE9NX0VMRU1FTlRTX1NDSEVNQTogU2NoZW1hTWV0YWRhdGEgPSB7XG4gIG5hbWU6ICdjdXN0b20tZWxlbWVudHMnXG59O1xuXG5leHBvcnQgY29uc3QgTk9fRVJST1JTX1NDSEVNQTogU2NoZW1hTWV0YWRhdGEgPSB7XG4gIG5hbWU6ICduby1lcnJvcnMtc2NoZW1hJ1xufTtcblxuZXhwb3J0IGNvbnN0IGNyZWF0ZU9wdGlvbmFsID0gbWFrZU1ldGFkYXRhRmFjdG9yeSgnT3B0aW9uYWwnKTtcbmV4cG9ydCBjb25zdCBjcmVhdGVTZWxmID0gbWFrZU1ldGFkYXRhRmFjdG9yeSgnU2VsZicpO1xuZXhwb3J0IGNvbnN0IGNyZWF0ZVNraXBTZWxmID0gbWFrZU1ldGFkYXRhRmFjdG9yeSgnU2tpcFNlbGYnKTtcbmV4cG9ydCBjb25zdCBjcmVhdGVIb3N0ID0gbWFrZU1ldGFkYXRhRmFjdG9yeSgnSG9zdCcpO1xuXG5leHBvcnQgaW50ZXJmYWNlIFR5cGUgZXh0ZW5kcyBGdW5jdGlvbiB7IG5ldyAoLi4uYXJnczogYW55W10pOiBhbnk7IH1cbmV4cG9ydCBjb25zdCBUeXBlID0gRnVuY3Rpb247XG5cbmV4cG9ydCBlbnVtIFNlY3VyaXR5Q29udGV4dCB7XG4gIE5PTkUgPSAwLFxuICBIVE1MID0gMSxcbiAgU1RZTEUgPSAyLFxuICBTQ1JJUFQgPSAzLFxuICBVUkwgPSA0LFxuICBSRVNPVVJDRV9VUkwgPSA1LFxufVxuXG5leHBvcnQgdHlwZSBQcm92aWRlciA9IGFueTtcblxuZXhwb3J0IGNvbnN0IGVudW0gTm9kZUZsYWdzIHtcbiAgTm9uZSA9IDAsXG4gIFR5cGVFbGVtZW50ID0gMSA8PCAwLFxuICBUeXBlVGV4dCA9IDEgPDwgMSxcbiAgUHJvamVjdGVkVGVtcGxhdGUgPSAxIDw8IDIsXG4gIENhdFJlbmRlck5vZGUgPSBUeXBlRWxlbWVudCB8IFR5cGVUZXh0LFxuICBUeXBlTmdDb250ZW50ID0gMSA8PCAzLFxuICBUeXBlUGlwZSA9IDEgPDwgNCxcbiAgVHlwZVB1cmVBcnJheSA9IDEgPDwgNSxcbiAgVHlwZVB1cmVPYmplY3QgPSAxIDw8IDYsXG4gIFR5cGVQdXJlUGlwZSA9IDEgPDwgNyxcbiAgQ2F0UHVyZUV4cHJlc3Npb24gPSBUeXBlUHVyZUFycmF5IHwgVHlwZVB1cmVPYmplY3QgfCBUeXBlUHVyZVBpcGUsXG4gIFR5cGVWYWx1ZVByb3ZpZGVyID0gMSA8PCA4LFxuICBUeXBlQ2xhc3NQcm92aWRlciA9IDEgPDwgOSxcbiAgVHlwZUZhY3RvcnlQcm92aWRlciA9IDEgPDwgMTAsXG4gIFR5cGVVc2VFeGlzdGluZ1Byb3ZpZGVyID0gMSA8PCAxMSxcbiAgTGF6eVByb3ZpZGVyID0gMSA8PCAxMixcbiAgUHJpdmF0ZVByb3ZpZGVyID0gMSA8PCAxMyxcbiAgVHlwZURpcmVjdGl2ZSA9IDEgPDwgMTQsXG4gIENvbXBvbmVudCA9IDEgPDwgMTUsXG4gIENhdFByb3ZpZGVyTm9EaXJlY3RpdmUgPVxuICAgICAgVHlwZVZhbHVlUHJvdmlkZXIgfCBUeXBlQ2xhc3NQcm92aWRlciB8IFR5cGVGYWN0b3J5UHJvdmlkZXIgfCBUeXBlVXNlRXhpc3RpbmdQcm92aWRlcixcbiAgQ2F0UHJvdmlkZXIgPSBDYXRQcm92aWRlck5vRGlyZWN0aXZlIHwgVHlwZURpcmVjdGl2ZSxcbiAgT25Jbml0ID0gMSA8PCAxNixcbiAgT25EZXN0cm95ID0gMSA8PCAxNyxcbiAgRG9DaGVjayA9IDEgPDwgMTgsXG4gIE9uQ2hhbmdlcyA9IDEgPDwgMTksXG4gIEFmdGVyQ29udGVudEluaXQgPSAxIDw8IDIwLFxuICBBZnRlckNvbnRlbnRDaGVja2VkID0gMSA8PCAyMSxcbiAgQWZ0ZXJWaWV3SW5pdCA9IDEgPDwgMjIsXG4gIEFmdGVyVmlld0NoZWNrZWQgPSAxIDw8IDIzLFxuICBFbWJlZGRlZFZpZXdzID0gMSA8PCAyNCxcbiAgQ29tcG9uZW50VmlldyA9IDEgPDwgMjUsXG4gIFR5cGVDb250ZW50UXVlcnkgPSAxIDw8IDI2LFxuICBUeXBlVmlld1F1ZXJ5ID0gMSA8PCAyNyxcbiAgU3RhdGljUXVlcnkgPSAxIDw8IDI4LFxuICBEeW5hbWljUXVlcnkgPSAxIDw8IDI5LFxuICBUeXBlTW9kdWxlUHJvdmlkZXIgPSAxIDw8IDMwLFxuICBDYXRRdWVyeSA9IFR5cGVDb250ZW50UXVlcnkgfCBUeXBlVmlld1F1ZXJ5LFxuXG4gIC8vIG11dHVhbGx5IGV4Y2x1c2l2ZSB2YWx1ZXMuLi5cbiAgVHlwZXMgPSBDYXRSZW5kZXJOb2RlIHwgVHlwZU5nQ29udGVudCB8IFR5cGVQaXBlIHwgQ2F0UHVyZUV4cHJlc3Npb24gfCBDYXRQcm92aWRlciB8IENhdFF1ZXJ5XG59XG5cbmV4cG9ydCBjb25zdCBlbnVtIERlcEZsYWdzIHtcbiAgTm9uZSA9IDAsXG4gIFNraXBTZWxmID0gMSA8PCAwLFxuICBPcHRpb25hbCA9IDEgPDwgMSxcbiAgU2VsZiA9IDEgPDwgMixcbiAgVmFsdWUgPSAxIDw8IDMsXG59XG5cbi8qKlxuICogSW5qZWN0aW9uIGZsYWdzIGZvciBESS5cbiAqL1xuZXhwb3J0IGNvbnN0IGVudW0gSW5qZWN0RmxhZ3Mge1xuICBEZWZhdWx0ID0gMCxcblxuICAvKipcbiAgICogU3BlY2lmaWVzIHRoYXQgYW4gaW5qZWN0b3Igc2hvdWxkIHJldHJpZXZlIGEgZGVwZW5kZW5jeSBmcm9tIGFueSBpbmplY3RvciB1bnRpbCByZWFjaGluZyB0aGVcbiAgICogaG9zdCBlbGVtZW50IG9mIHRoZSBjdXJyZW50IGNvbXBvbmVudC4gKE9ubHkgdXNlZCB3aXRoIEVsZW1lbnQgSW5qZWN0b3IpXG4gICAqL1xuICBIb3N0ID0gMSA8PCAwLFxuICAvKiogRG9uJ3QgZGVzY2VuZCBpbnRvIGFuY2VzdG9ycyBvZiB0aGUgbm9kZSByZXF1ZXN0aW5nIGluamVjdGlvbi4gKi9cbiAgU2VsZiA9IDEgPDwgMSxcbiAgLyoqIFNraXAgdGhlIG5vZGUgdGhhdCBpcyByZXF1ZXN0aW5nIGluamVjdGlvbi4gKi9cbiAgU2tpcFNlbGYgPSAxIDw8IDIsXG4gIC8qKiBJbmplY3QgYGRlZmF1bHRWYWx1ZWAgaW5zdGVhZCBpZiB0b2tlbiBub3QgZm91bmQuICovXG4gIE9wdGlvbmFsID0gMSA8PCAzLFxufVxuXG5leHBvcnQgY29uc3QgZW51bSBBcmd1bWVudFR5cGUge0lubGluZSA9IDAsIER5bmFtaWMgPSAxfVxuXG5leHBvcnQgY29uc3QgZW51bSBCaW5kaW5nRmxhZ3Mge1xuICBUeXBlRWxlbWVudEF0dHJpYnV0ZSA9IDEgPDwgMCxcbiAgVHlwZUVsZW1lbnRDbGFzcyA9IDEgPDwgMSxcbiAgVHlwZUVsZW1lbnRTdHlsZSA9IDEgPDwgMixcbiAgVHlwZVByb3BlcnR5ID0gMSA8PCAzLFxuICBTeW50aGV0aWNQcm9wZXJ0eSA9IDEgPDwgNCxcbiAgU3ludGhldGljSG9zdFByb3BlcnR5ID0gMSA8PCA1LFxuICBDYXRTeW50aGV0aWNQcm9wZXJ0eSA9IFN5bnRoZXRpY1Byb3BlcnR5IHwgU3ludGhldGljSG9zdFByb3BlcnR5LFxuXG4gIC8vIG11dHVhbGx5IGV4Y2x1c2l2ZSB2YWx1ZXMuLi5cbiAgVHlwZXMgPSBUeXBlRWxlbWVudEF0dHJpYnV0ZSB8IFR5cGVFbGVtZW50Q2xhc3MgfCBUeXBlRWxlbWVudFN0eWxlIHwgVHlwZVByb3BlcnR5XG59XG5cbmV4cG9ydCBjb25zdCBlbnVtIFF1ZXJ5QmluZGluZ1R5cGUge0ZpcnN0ID0gMCwgQWxsID0gMX1cblxuZXhwb3J0IGNvbnN0IGVudW0gUXVlcnlWYWx1ZVR5cGUge1xuICBFbGVtZW50UmVmID0gMCxcbiAgUmVuZGVyRWxlbWVudCA9IDEsXG4gIFRlbXBsYXRlUmVmID0gMixcbiAgVmlld0NvbnRhaW5lclJlZiA9IDMsXG4gIFByb3ZpZGVyID0gNFxufVxuXG5leHBvcnQgY29uc3QgZW51bSBWaWV3RmxhZ3Mge1xuICBOb25lID0gMCxcbiAgT25QdXNoID0gMSA8PCAxLFxufVxuXG5leHBvcnQgZW51bSBNaXNzaW5nVHJhbnNsYXRpb25TdHJhdGVneSB7XG4gIEVycm9yID0gMCxcbiAgV2FybmluZyA9IDEsXG4gIElnbm9yZSA9IDIsXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgTWV0YWRhdGFGYWN0b3J5PFQ+IHtcbiAgKC4uLmFyZ3M6IGFueVtdKTogVDtcbiAgaXNUeXBlT2Yob2JqOiBhbnkpOiBvYmogaXMgVDtcbiAgbmdNZXRhZGF0YU5hbWU6IHN0cmluZztcbn1cblxuZnVuY3Rpb24gbWFrZU1ldGFkYXRhRmFjdG9yeTxUPihuYW1lOiBzdHJpbmcsIHByb3BzPzogKC4uLmFyZ3M6IGFueVtdKSA9PiBUKTogTWV0YWRhdGFGYWN0b3J5PFQ+IHtcbiAgY29uc3QgZmFjdG9yeTogYW55ID0gKC4uLmFyZ3M6IGFueVtdKSA9PiB7XG4gICAgY29uc3QgdmFsdWVzID0gcHJvcHMgPyBwcm9wcyguLi5hcmdzKSA6IHt9O1xuICAgIHJldHVybiB7XG4gICAgICBuZ01ldGFkYXRhTmFtZTogbmFtZSxcbiAgICAgIC4uLnZhbHVlcyxcbiAgICB9O1xuICB9O1xuICBmYWN0b3J5LmlzVHlwZU9mID0gKG9iajogYW55KSA9PiBvYmogJiYgb2JqLm5nTWV0YWRhdGFOYW1lID09PSBuYW1lO1xuICBmYWN0b3J5Lm5nTWV0YWRhdGFOYW1lID0gbmFtZTtcbiAgcmV0dXJuIGZhY3Rvcnk7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgUm91dGUge1xuICBjaGlsZHJlbj86IFJvdXRlW107XG4gIGxvYWRDaGlsZHJlbj86IHN0cmluZ3xUeXBlfGFueTtcbn1cblxuLyoqXG4gKiBGbGFncyB1c2VkIHRvIGdlbmVyYXRlIFIzLXN0eWxlIENTUyBTZWxlY3RvcnMuIFRoZXkgYXJlIHBhc3RlZCBmcm9tXG4gKiBjb3JlL3NyYy9yZW5kZXIzL3Byb2plY3Rpb24udHMgYmVjYXVzZSB0aGV5IGNhbm5vdCBiZSByZWZlcmVuY2VkIGRpcmVjdGx5LlxuICovXG5leHBvcnQgY29uc3QgZW51bSBTZWxlY3RvckZsYWdzIHtcbiAgLyoqIEluZGljYXRlcyB0aGlzIGlzIHRoZSBiZWdpbm5pbmcgb2YgYSBuZXcgbmVnYXRpdmUgc2VsZWN0b3IgKi9cbiAgTk9UID0gMGIwMDAxLFxuXG4gIC8qKiBNb2RlIGZvciBtYXRjaGluZyBhdHRyaWJ1dGVzICovXG4gIEFUVFJJQlVURSA9IDBiMDAxMCxcblxuICAvKiogTW9kZSBmb3IgbWF0Y2hpbmcgdGFnIG5hbWVzICovXG4gIEVMRU1FTlQgPSAwYjAxMDAsXG5cbiAgLyoqIE1vZGUgZm9yIG1hdGNoaW5nIGNsYXNzIG5hbWVzICovXG4gIENMQVNTID0gMGIxMDAwLFxufVxuXG4vLyBUaGVzZSBhcmUgYSBjb3B5IHRoZSBDU1MgdHlwZXMgZnJvbSBjb3JlL3NyYy9yZW5kZXIzL2ludGVyZmFjZXMvcHJvamVjdGlvbi50c1xuLy8gVGhleSBhcmUgZHVwbGljYXRlZCBoZXJlIGFzIHRoZXkgY2Fubm90IGJlIGRpcmVjdGx5IHJlZmVyZW5jZWQgZnJvbSBjb3JlLlxuZXhwb3J0IHR5cGUgUjNDc3NTZWxlY3RvciA9IChzdHJpbmcgfCBTZWxlY3RvckZsYWdzKVtdO1xuZXhwb3J0IHR5cGUgUjNDc3NTZWxlY3Rvckxpc3QgPSBSM0Nzc1NlbGVjdG9yW107XG5cbmZ1bmN0aW9uIHBhcnNlclNlbGVjdG9yVG9TaW1wbGVTZWxlY3RvcihzZWxlY3RvcjogQ3NzU2VsZWN0b3IpOiBSM0Nzc1NlbGVjdG9yIHtcbiAgY29uc3QgY2xhc3NlcyA9IHNlbGVjdG9yLmNsYXNzTmFtZXMgJiYgc2VsZWN0b3IuY2xhc3NOYW1lcy5sZW5ndGggP1xuICAgICAgW1NlbGVjdG9yRmxhZ3MuQ0xBU1MsIC4uLnNlbGVjdG9yLmNsYXNzTmFtZXNdIDpcbiAgICAgIFtdO1xuICBjb25zdCBlbGVtZW50TmFtZSA9IHNlbGVjdG9yLmVsZW1lbnQgJiYgc2VsZWN0b3IuZWxlbWVudCAhPT0gJyonID8gc2VsZWN0b3IuZWxlbWVudCA6ICcnO1xuICByZXR1cm4gW2VsZW1lbnROYW1lLCAuLi5zZWxlY3Rvci5hdHRycywgLi4uY2xhc3Nlc107XG59XG5cbmZ1bmN0aW9uIHBhcnNlclNlbGVjdG9yVG9OZWdhdGl2ZVNlbGVjdG9yKHNlbGVjdG9yOiBDc3NTZWxlY3Rvcik6IFIzQ3NzU2VsZWN0b3Ige1xuICBjb25zdCBjbGFzc2VzID0gc2VsZWN0b3IuY2xhc3NOYW1lcyAmJiBzZWxlY3Rvci5jbGFzc05hbWVzLmxlbmd0aCA/XG4gICAgICBbU2VsZWN0b3JGbGFncy5DTEFTUywgLi4uc2VsZWN0b3IuY2xhc3NOYW1lc10gOlxuICAgICAgW107XG5cbiAgaWYgKHNlbGVjdG9yLmVsZW1lbnQpIHtcbiAgICByZXR1cm4gW1xuICAgICAgU2VsZWN0b3JGbGFncy5OT1QgfCBTZWxlY3RvckZsYWdzLkVMRU1FTlQsIHNlbGVjdG9yLmVsZW1lbnQsIC4uLnNlbGVjdG9yLmF0dHJzLCAuLi5jbGFzc2VzXG4gICAgXTtcbiAgfSBlbHNlIGlmIChzZWxlY3Rvci5hdHRycy5sZW5ndGgpIHtcbiAgICByZXR1cm4gW1NlbGVjdG9yRmxhZ3MuTk9UIHwgU2VsZWN0b3JGbGFncy5BVFRSSUJVVEUsIC4uLnNlbGVjdG9yLmF0dHJzLCAuLi5jbGFzc2VzXTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gc2VsZWN0b3IuY2xhc3NOYW1lcyAmJiBzZWxlY3Rvci5jbGFzc05hbWVzLmxlbmd0aCA/XG4gICAgICAgIFtTZWxlY3RvckZsYWdzLk5PVCB8IFNlbGVjdG9yRmxhZ3MuQ0xBU1MsIC4uLnNlbGVjdG9yLmNsYXNzTmFtZXNdIDpcbiAgICAgICAgW107XG4gIH1cbn1cblxuZnVuY3Rpb24gcGFyc2VyU2VsZWN0b3JUb1IzU2VsZWN0b3Ioc2VsZWN0b3I6IENzc1NlbGVjdG9yKTogUjNDc3NTZWxlY3RvciB7XG4gIGNvbnN0IHBvc2l0aXZlID0gcGFyc2VyU2VsZWN0b3JUb1NpbXBsZVNlbGVjdG9yKHNlbGVjdG9yKTtcblxuICBjb25zdCBuZWdhdGl2ZTogUjNDc3NTZWxlY3Rvckxpc3QgPSBzZWxlY3Rvci5ub3RTZWxlY3RvcnMgJiYgc2VsZWN0b3Iubm90U2VsZWN0b3JzLmxlbmd0aCA/XG4gICAgICBzZWxlY3Rvci5ub3RTZWxlY3RvcnMubWFwKG5vdFNlbGVjdG9yID0+IHBhcnNlclNlbGVjdG9yVG9OZWdhdGl2ZVNlbGVjdG9yKG5vdFNlbGVjdG9yKSkgOlxuICAgICAgW107XG5cbiAgcmV0dXJuIHBvc2l0aXZlLmNvbmNhdCguLi5uZWdhdGl2ZSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZVNlbGVjdG9yVG9SM1NlbGVjdG9yKHNlbGVjdG9yOiBzdHJpbmcpOiBSM0Nzc1NlbGVjdG9yTGlzdCB7XG4gIGNvbnN0IHNlbGVjdG9ycyA9IENzc1NlbGVjdG9yLnBhcnNlKHNlbGVjdG9yKTtcbiAgcmV0dXJuIHNlbGVjdG9ycy5tYXAocGFyc2VyU2VsZWN0b3JUb1IzU2VsZWN0b3IpO1xufVxuXG4vLyBQYXN0ZWQgZnJvbSByZW5kZXIzL2ludGVyZmFjZXMvZGVmaW5pdGlvbiBzaW5jZSBpdCBjYW5ub3QgYmUgcmVmZXJlbmNlZCBkaXJlY3RseVxuLyoqXG4gKiBGbGFncyBwYXNzZWQgaW50byB0ZW1wbGF0ZSBmdW5jdGlvbnMgdG8gZGV0ZXJtaW5lIHdoaWNoIGJsb2NrcyAoaS5lLiBjcmVhdGlvbiwgdXBkYXRlKVxuICogc2hvdWxkIGJlIGV4ZWN1dGVkLlxuICpcbiAqIFR5cGljYWxseSwgYSB0ZW1wbGF0ZSBydW5zIGJvdGggdGhlIGNyZWF0aW9uIGJsb2NrIGFuZCB0aGUgdXBkYXRlIGJsb2NrIG9uIGluaXRpYWxpemF0aW9uIGFuZFxuICogc3Vic2VxdWVudCBydW5zIG9ubHkgZXhlY3V0ZSB0aGUgdXBkYXRlIGJsb2NrLiBIb3dldmVyLCBkeW5hbWljYWxseSBjcmVhdGVkIHZpZXdzIHJlcXVpcmUgdGhhdFxuICogdGhlIGNyZWF0aW9uIGJsb2NrIGJlIGV4ZWN1dGVkIHNlcGFyYXRlbHkgZnJvbSB0aGUgdXBkYXRlIGJsb2NrIChmb3IgYmFja3dhcmRzIGNvbXBhdCkuXG4gKi9cbmV4cG9ydCBjb25zdCBlbnVtIFJlbmRlckZsYWdzIHtcbiAgLyogV2hldGhlciB0byBydW4gdGhlIGNyZWF0aW9uIGJsb2NrIChlLmcuIGNyZWF0ZSBlbGVtZW50cyBhbmQgZGlyZWN0aXZlcykgKi9cbiAgQ3JlYXRlID0gMGIwMSxcblxuICAvKiBXaGV0aGVyIHRvIHJ1biB0aGUgdXBkYXRlIGJsb2NrIChlLmcuIHJlZnJlc2ggYmluZGluZ3MpICovXG4gIFVwZGF0ZSA9IDBiMTBcbn1cblxuLy8gTm90ZSB0aGlzIHdpbGwgZXhwYW5kIG9uY2UgYGNsYXNzYCBpcyBpbnRyb2R1Y2VkIHRvIHN0eWxpbmdcbmV4cG9ydCBjb25zdCBlbnVtIEluaXRpYWxTdHlsaW5nRmxhZ3Mge1xuICAvKiogTW9kZSBmb3IgbWF0Y2hpbmcgaW5pdGlhbCBzdHlsZSB2YWx1ZXMgKi9cbiAgSU5JVElBTF9TVFlMRVMgPSAwYjAwLFxufVxuIl19