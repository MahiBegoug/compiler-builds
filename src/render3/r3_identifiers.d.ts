/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as o from '../output/output_ast';
export declare class Identifiers {
    static NEW_METHOD: string;
    static TRANSFORM_METHOD: string;
    static PATCH_DEPS: string;
    static namespaceHTML: o.ExternalReference;
    static namespaceMathML: o.ExternalReference;
    static namespaceSVG: o.ExternalReference;
    static element: o.ExternalReference;
    static elementStart: o.ExternalReference;
    static elementEnd: o.ExternalReference;
    static select: o.ExternalReference;
    static advance: o.ExternalReference;
    static updateSyntheticHostBinding: o.ExternalReference;
    static componentHostSyntheticListener: o.ExternalReference;
    static attribute: o.ExternalReference;
    static attributeInterpolate1: o.ExternalReference;
    static attributeInterpolate2: o.ExternalReference;
    static attributeInterpolate3: o.ExternalReference;
    static attributeInterpolate4: o.ExternalReference;
    static attributeInterpolate5: o.ExternalReference;
    static attributeInterpolate6: o.ExternalReference;
    static attributeInterpolate7: o.ExternalReference;
    static attributeInterpolate8: o.ExternalReference;
    static attributeInterpolateV: o.ExternalReference;
    static classProp: o.ExternalReference;
    static elementContainerStart: o.ExternalReference;
    static elementContainerEnd: o.ExternalReference;
    static elementContainer: o.ExternalReference;
    static styleMap: o.ExternalReference;
    static classMap: o.ExternalReference;
    static classMapInterpolate1: o.ExternalReference;
    static classMapInterpolate2: o.ExternalReference;
    static classMapInterpolate3: o.ExternalReference;
    static classMapInterpolate4: o.ExternalReference;
    static classMapInterpolate5: o.ExternalReference;
    static classMapInterpolate6: o.ExternalReference;
    static classMapInterpolate7: o.ExternalReference;
    static classMapInterpolate8: o.ExternalReference;
    static classMapInterpolateV: o.ExternalReference;
    static styleProp: o.ExternalReference;
    static stylePropInterpolate1: o.ExternalReference;
    static stylePropInterpolate2: o.ExternalReference;
    static stylePropInterpolate3: o.ExternalReference;
    static stylePropInterpolate4: o.ExternalReference;
    static stylePropInterpolate5: o.ExternalReference;
    static stylePropInterpolate6: o.ExternalReference;
    static stylePropInterpolate7: o.ExternalReference;
    static stylePropInterpolate8: o.ExternalReference;
    static stylePropInterpolateV: o.ExternalReference;
    static styleSanitizer: o.ExternalReference;
    static elementHostAttrs: o.ExternalReference;
    static containerCreate: o.ExternalReference;
    static nextContext: o.ExternalReference;
    static templateCreate: o.ExternalReference;
    static text: o.ExternalReference;
    static enableBindings: o.ExternalReference;
    static disableBindings: o.ExternalReference;
    static allocHostVars: o.ExternalReference;
    static getCurrentView: o.ExternalReference;
    static textInterpolate: o.ExternalReference;
    static textInterpolate1: o.ExternalReference;
    static textInterpolate2: o.ExternalReference;
    static textInterpolate3: o.ExternalReference;
    static textInterpolate4: o.ExternalReference;
    static textInterpolate5: o.ExternalReference;
    static textInterpolate6: o.ExternalReference;
    static textInterpolate7: o.ExternalReference;
    static textInterpolate8: o.ExternalReference;
    static textInterpolateV: o.ExternalReference;
    static restoreView: o.ExternalReference;
    static pureFunction0: o.ExternalReference;
    static pureFunction1: o.ExternalReference;
    static pureFunction2: o.ExternalReference;
    static pureFunction3: o.ExternalReference;
    static pureFunction4: o.ExternalReference;
    static pureFunction5: o.ExternalReference;
    static pureFunction6: o.ExternalReference;
    static pureFunction7: o.ExternalReference;
    static pureFunction8: o.ExternalReference;
    static pureFunctionV: o.ExternalReference;
    static pipeBind1: o.ExternalReference;
    static pipeBind2: o.ExternalReference;
    static pipeBind3: o.ExternalReference;
    static pipeBind4: o.ExternalReference;
    static pipeBindV: o.ExternalReference;
    static hostProperty: o.ExternalReference;
    static property: o.ExternalReference;
    static propertyInterpolate: o.ExternalReference;
    static propertyInterpolate1: o.ExternalReference;
    static propertyInterpolate2: o.ExternalReference;
    static propertyInterpolate3: o.ExternalReference;
    static propertyInterpolate4: o.ExternalReference;
    static propertyInterpolate5: o.ExternalReference;
    static propertyInterpolate6: o.ExternalReference;
    static propertyInterpolate7: o.ExternalReference;
    static propertyInterpolate8: o.ExternalReference;
    static propertyInterpolateV: o.ExternalReference;
    static i18n: o.ExternalReference;
    static i18nAttributes: o.ExternalReference;
    static i18nExp: o.ExternalReference;
    static i18nStart: o.ExternalReference;
    static i18nEnd: o.ExternalReference;
    static i18nApply: o.ExternalReference;
    static i18nPostprocess: o.ExternalReference;
    static pipe: o.ExternalReference;
    static projection: o.ExternalReference;
    static projectionDef: o.ExternalReference;
    static reference: o.ExternalReference;
    static inject: o.ExternalReference;
    static injectAttribute: o.ExternalReference;
    static injectPipeChangeDetectorRef: o.ExternalReference;
    static directiveInject: o.ExternalReference;
    static invalidFactory: o.ExternalReference;
    static templateRefExtractor: o.ExternalReference;
    static resolveWindow: o.ExternalReference;
    static resolveDocument: o.ExternalReference;
    static resolveBody: o.ExternalReference;
    static defineComponent: o.ExternalReference;
    static setComponentScope: o.ExternalReference;
    static ComponentDefWithMeta: o.ExternalReference;
    static FactoryDef: o.ExternalReference;
    static defineDirective: o.ExternalReference;
    static DirectiveDefWithMeta: o.ExternalReference;
    static InjectorDef: o.ExternalReference;
    static defineInjector: o.ExternalReference;
    static NgModuleDefWithMeta: o.ExternalReference;
    static defineNgModule: o.ExternalReference;
    static setNgModuleScope: o.ExternalReference;
    static PipeDefWithMeta: o.ExternalReference;
    static definePipe: o.ExternalReference;
    static queryRefresh: o.ExternalReference;
    static viewQuery: o.ExternalReference;
    static staticViewQuery: o.ExternalReference;
    static staticContentQuery: o.ExternalReference;
    static loadQuery: o.ExternalReference;
    static contentQuery: o.ExternalReference;
    static NgOnChangesFeature: o.ExternalReference;
    static InheritDefinitionFeature: o.ExternalReference;
    static CopyDefinitionFeature: o.ExternalReference;
    static ProvidersFeature: o.ExternalReference;
    static listener: o.ExternalReference;
    static getFactoryOf: o.ExternalReference;
    static getInheritedFactory: o.ExternalReference;
    static sanitizeHtml: o.ExternalReference;
    static sanitizeStyle: o.ExternalReference;
    static defaultStyleSanitizer: o.ExternalReference;
    static sanitizeResourceUrl: o.ExternalReference;
    static sanitizeScript: o.ExternalReference;
    static sanitizeUrl: o.ExternalReference;
    static sanitizeUrlOrResourceUrl: o.ExternalReference;
}
