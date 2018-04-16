/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as tslib_1 from "tslib";
import { flatten, identifierName, sanitizeIdentifier, tokenReference } from '../compile_metadata';
import { BindingForm, BuiltinFunctionCall, convertActionBinding, convertPropertyBinding } from '../compiler_util/expression_converter';
import { AstMemoryEfficientTransformer, FunctionCall, ImplicitReceiver, LiteralPrimitive, PropertyRead } from '../expression_parser/ast';
import { Identifiers } from '../identifiers';
import { LifecycleHooks } from '../lifecycle_reflector';
import * as o from '../output/output_ast';
import { typeSourceSpan } from '../parse_util';
import { CssSelector } from '../selector';
import { PropertyBindingType, RecursiveTemplateAstVisitor, TextAst, templateVisitAll } from '../template_parser/template_ast';
import { error } from '../util';
import { Identifiers as R3 } from './r3_identifiers';
import { BUILD_OPTIMIZER_COLOCATE } from './r3_types';
/**
 * Name of the context parameter passed into a template function
 */
var /** @type {?} */ CONTEXT_NAME = 'ctx';
/**
 * Name of the RenderFlag passed into a template function
 */
var /** @type {?} */ RENDER_FLAGS = 'rf';
/**
 * Name of the temporary to use during data binding
 */
var /** @type {?} */ TEMPORARY_NAME = '_t';
/**
 * The prefix reference variables
 */
var /** @type {?} */ REFERENCE_PREFIX = '_r';
/**
 * The name of the implicit context reference
 */
var /** @type {?} */ IMPLICIT_REFERENCE = '$implicit';
/**
 * Name of the i18n attributes *
 */
var /** @type {?} */ I18N_ATTR = 'i18n';
var /** @type {?} */ I18N_ATTR_PREFIX = 'i18n-';
/**
 * I18n separators for metadata *
 */
var /** @type {?} */ MEANING_SEPARATOR = '|';
var /** @type {?} */ ID_SEPARATOR = '@@';
/**
 * @param {?} outputCtx
 * @param {?} directive
 * @param {?} reflector
 * @param {?} bindingParser
 * @param {?} mode
 * @return {?}
 */
export function compileDirective(outputCtx, directive, reflector, bindingParser, mode) {
    var /** @type {?} */ definitionMapValues = [];
    var /** @type {?} */ field = function (key, value) {
        if (value) {
            definitionMapValues.push({ key: key, value: value, quoted: false });
        }
    };
    // e.g. 'type: MyDirective`
    field('type', outputCtx.importExpr(directive.type.reference));
    // e.g. `selectors: [['', 'someDir', '']]`
    field('selectors', createDirectiveSelector(/** @type {?} */ ((directive.selector))));
    // e.g. `factory: () => new MyApp(injectElementRef())`
    field('factory', createFactory(directive.type, outputCtx, reflector, directive.queries));
    // e.g. `hostBindings: (dirIndex, elIndex) => { ... }
    field('hostBindings', createHostBindingsFunction(directive, outputCtx, bindingParser));
    // e.g. `attributes: ['role', 'listbox']`
    field('attributes', createHostAttributesArray(directive, outputCtx));
    // e.g 'inputs: {a: 'a'}`
    field('inputs', conditionallyCreateMapObjectLiteral(directive.inputs, outputCtx));
    // e.g 'outputs: {a: 'a'}`
    field('outputs', conditionallyCreateMapObjectLiteral(directive.outputs, outputCtx));
    var /** @type {?} */ className = /** @type {?} */ ((identifierName(directive.type)));
    className || error("Cannot resolver the name of " + directive.type);
    var /** @type {?} */ definitionField = outputCtx.constantPool.propertyNameOf(1 /* Directive */);
    var /** @type {?} */ definitionFunction = o.importExpr(R3.defineDirective).callFn([o.literalMap(definitionMapValues)]);
    if (mode === 0 /* PartialClass */) {
        // Create the partial class to be merged with the actual class.
        outputCtx.statements.push(new o.ClassStmt(className, null, /* fields */ [new o.ClassField(definitionField, /* type */ o.INFERRED_TYPE, /* modifiers */ [o.StmtModifier.Static], definitionFunction)], /* getters */ [], /* constructorMethod */ new o.ClassMethod(null, [], []), /* methods */ []));
    }
    else {
        // Create back-patch definition.
        var /** @type {?} */ classReference = outputCtx.importExpr(directive.type.reference);
        // Create the back-patch statement
        outputCtx.statements.push(new o.CommentStmt(BUILD_OPTIMIZER_COLOCATE));
        outputCtx.statements.push(classReference.prop(definitionField).set(definitionFunction).toStmt());
    }
}
/**
 * @param {?} outputCtx
 * @param {?} component
 * @param {?} pipeSummaries
 * @param {?} template
 * @param {?} reflector
 * @param {?} bindingParser
 * @param {?} mode
 * @return {?}
 */
export function compileComponent(outputCtx, component, pipeSummaries, template, reflector, bindingParser, mode) {
    var /** @type {?} */ definitionMapValues = [];
    // Pipes and Directives found in the template
    var /** @type {?} */ pipes = new Set();
    var /** @type {?} */ directives = new Set();
    var /** @type {?} */ field = function (key, value) {
        if (value) {
            definitionMapValues.push({ key: key, value: value, quoted: false });
        }
    };
    // e.g. `type: MyApp`
    field('type', outputCtx.importExpr(component.type.reference));
    // e.g. `selectors: [['my-app']]`
    field('selectors', createDirectiveSelector(/** @type {?} */ ((component.selector))));
    var /** @type {?} */ selector = component.selector && CssSelector.parse(component.selector);
    var /** @type {?} */ firstSelector = selector && selector[0];
    // e.g. `attr: ["class", ".my.app"]
    // This is optional an only included if the first selector of a component specifies attributes.
    if (firstSelector) {
        var /** @type {?} */ selectorAttributes = firstSelector.getAttrs();
        if (selectorAttributes.length) {
            field('attrs', outputCtx.constantPool.getConstLiteral(o.literalArr(selectorAttributes.map(function (value) { return value != null ? o.literal(value) : o.literal(undefined); })), /* forceShared */ true));
        }
    }
    // e.g. `factory: function MyApp_Factory() { return new MyApp(injectElementRef()); }`
    field('factory', createFactory(component.type, outputCtx, reflector, component.queries));
    // e.g `hostBindings: function MyApp_HostBindings { ... }
    field('hostBindings', createHostBindingsFunction(component, outputCtx, bindingParser));
    // e.g. `template: function MyComponent_Template(_ctx, _cm) {...}`
    var /** @type {?} */ templateTypeName = component.type.reference.name;
    var /** @type {?} */ templateName = templateTypeName ? templateTypeName + "_Template" : null;
    var /** @type {?} */ pipeMap = new Map(pipeSummaries.map(function (pipe) { return [pipe.name, pipe]; }));
    var /** @type {?} */ templateFunctionExpression = new TemplateDefinitionBuilder(outputCtx, outputCtx.constantPool, reflector, CONTEXT_NAME, BindingScope.ROOT_SCOPE, 0, /** @type {?} */ ((component.template)).ngContentSelectors, templateTypeName, templateName, pipeMap, component.viewQueries, directives, pipes)
        .buildTemplateFunction(template, []);
    field('template', templateFunctionExpression);
    // e.g. `directives: [MyDirective]`
    if (directives.size) {
        var /** @type {?} */ expressions = Array.from(directives).map(function (d) { return outputCtx.importExpr(d); });
        field('directives', o.literalArr(expressions));
    }
    // e.g. `pipes: [MyPipe]`
    if (pipes.size) {
        var /** @type {?} */ expressions = Array.from(pipes).map(function (p) { return outputCtx.importExpr(p); });
        field('pipes', o.literalArr(expressions));
    }
    // e.g `inputs: {a: 'a'}`
    field('inputs', conditionallyCreateMapObjectLiteral(component.inputs, outputCtx));
    // e.g 'outputs: {a: 'a'}`
    field('outputs', conditionallyCreateMapObjectLiteral(component.outputs, outputCtx));
    // e.g. `features: [NgOnChangesFeature(MyComponent)]`
    var /** @type {?} */ features = [];
    if (component.type.lifecycleHooks.some(function (lifecycle) { return lifecycle == LifecycleHooks.OnChanges; })) {
        features.push(o.importExpr(R3.NgOnChangesFeature, null, null).callFn([outputCtx.importExpr(component.type.reference)]));
    }
    if (features.length) {
        field('features', o.literalArr(features));
    }
    var /** @type {?} */ definitionField = outputCtx.constantPool.propertyNameOf(2 /* Component */);
    var /** @type {?} */ definitionFunction = o.importExpr(R3.defineComponent).callFn([o.literalMap(definitionMapValues)]);
    if (mode === 0 /* PartialClass */) {
        var /** @type {?} */ className = /** @type {?} */ ((identifierName(component.type)));
        className || error("Cannot resolver the name of " + component.type);
        // Create the partial class to be merged with the actual class.
        outputCtx.statements.push(new o.ClassStmt(className, null, /* fields */ [new o.ClassField(definitionField, /* type */ o.INFERRED_TYPE, /* modifiers */ [o.StmtModifier.Static], definitionFunction)], /* getters */ [], /* constructorMethod */ new o.ClassMethod(null, [], []), /* methods */ []));
    }
    else {
        var /** @type {?} */ classReference = outputCtx.importExpr(component.type.reference);
        // Create the back-patch statement
        outputCtx.statements.push(new o.CommentStmt(BUILD_OPTIMIZER_COLOCATE), classReference.prop(definitionField).set(definitionFunction).toStmt());
    }
}
/**
 * @template T
 * @param {?} arg
 * @return {?}
 */
function unknown(arg) {
    throw new Error("Builder " + this.constructor.name + " is unable to handle " + arg.constructor.name + " yet");
}
/**
 * @param {?} feature
 * @return {?}
 */
function unsupported(feature) {
    if (this) {
        throw new Error("Builder " + this.constructor.name + " doesn't support " + feature + " yet");
    }
    throw new Error("Feature " + feature + " is not supported yet");
}
var /** @type {?} */ BINDING_INSTRUCTION_MAP = (_a = {},
    _a[PropertyBindingType.Property] = R3.elementProperty,
    _a[PropertyBindingType.Attribute] = R3.elementAttribute,
    _a[PropertyBindingType.Class] = R3.elementClassNamed,
    _a[PropertyBindingType.Style] = R3.elementStyleNamed,
    _a);
/**
 * @param {?} args
 * @return {?}
 */
function interpolate(args) {
    args = args.slice(1); // Ignore the length prefix added for render2
    switch (args.length) {
        case 3:
            return o.importExpr(R3.interpolation1).callFn(args);
        case 5:
            return o.importExpr(R3.interpolation2).callFn(args);
        case 7:
            return o.importExpr(R3.interpolation3).callFn(args);
        case 9:
            return o.importExpr(R3.interpolation4).callFn(args);
        case 11:
            return o.importExpr(R3.interpolation5).callFn(args);
        case 13:
            return o.importExpr(R3.interpolation6).callFn(args);
        case 15:
            return o.importExpr(R3.interpolation7).callFn(args);
        case 17:
            return o.importExpr(R3.interpolation8).callFn(args);
    }
    (args.length >= 19 && args.length % 2 == 1) ||
        error("Invalid interpolation argument length " + args.length);
    return o.importExpr(R3.interpolationV).callFn([o.literalArr(args)]);
}
/**
 * @param {?} args
 * @return {?}
 */
function pipeBinding(args) {
    switch (args.length) {
        case 0:
            // The first parameter to pipeBind is always the value to be transformed followed
            // by arg.length arguments so the total number of arguments to pipeBind are
            // arg.length + 1.
            return R3.pipeBind1;
        case 1:
            return R3.pipeBind2;
        case 2:
            return R3.pipeBind3;
        default:
            return R3.pipeBindV;
    }
}
var /** @type {?} */ pureFunctionIdentifiers = [
    R3.pureFunction0, R3.pureFunction1, R3.pureFunction2, R3.pureFunction3, R3.pureFunction4,
    R3.pureFunction5, R3.pureFunction6, R3.pureFunction7, R3.pureFunction8
];
/**
 * @param {?} outputContext
 * @param {?} literal
 * @return {?}
 */
function getLiteralFactory(outputContext, literal) {
    var _a = outputContext.constantPool.getLiteralFactory(literal), literalFactory = _a.literalFactory, literalFactoryArguments = _a.literalFactoryArguments;
    literalFactoryArguments.length > 0 || error("Expected arguments to a literal factory function");
    var /** @type {?} */ pureFunctionIdent = pureFunctionIdentifiers[literalFactoryArguments.length] || R3.pureFunctionV;
    // Literal factories are pure functions that only need to be re-invoked when the parameters
    // change.
    return o.importExpr(pureFunctionIdent).callFn([literalFactory].concat(literalFactoryArguments));
}
/**
 * @return {?}
 */
function noop() { }
var BindingScope = /** @class */ (function () {
    function BindingScope(parent, declareLocalVarCallback) {
        if (parent === void 0) { parent = null; }
        if (declareLocalVarCallback === void 0) { declareLocalVarCallback = noop; }
        this.parent = parent;
        this.declareLocalVarCallback = declareLocalVarCallback;
        /**
         * Keeps a map from local variables to their expressions.
         *
         * This is used when one refers to variable such as: 'let abc = a.b.c`.
         * - key to the map is the string literal `"abc"`.
         * - value `lhs` is the left hand side which is an AST representing `abc`.
         * - value `rhs` is the right hand side which is an AST representing `a.b.c`.
         * - value `declared` is true if the `declareLocalVarCallback` has been called for this scope
         * already.
         */
        this.map = new Map();
        this.referenceNameIndex = 0;
    }
    /**
     * @param {?} name
     * @return {?}
     */
    BindingScope.prototype.get = /**
     * @param {?} name
     * @return {?}
     */
    function (name) {
        var /** @type {?} */ current = this;
        while (current) {
            var /** @type {?} */ value = current.map.get(name);
            if (value != null) {
                if (current !== this) {
                    // make a local copy and reset the `declared` state.
                    value = { lhs: value.lhs, rhs: value.rhs, declared: false };
                    // Cache the value locally.
                    this.map.set(name, value);
                }
                if (value.rhs && !value.declared) {
                    // if it is first time we are referencing the variable in the scope
                    // than invoke the callback to insert variable declaration.
                    this.declareLocalVarCallback(value.lhs, value.rhs);
                    value.declared = true;
                }
                return value.lhs;
            }
            current = current.parent;
        }
        return null;
    };
    /**
     * Create a local variable for later reference.
     *
     * @param name Name of the variable.
     * @param lhs AST representing the left hand side of the `let lhs = rhs;`.
     * @param rhs AST representing the right hand side of the `let lhs = rhs;`. The `rhs` can be
     * `undefined` for variable that are ambient such as `$event` and which don't have `rhs`
     * declaration.
     */
    /**
     * Create a local variable for later reference.
     *
     * @param {?} name Name of the variable.
     * @param {?} lhs AST representing the left hand side of the `let lhs = rhs;`.
     * @param {?=} rhs AST representing the right hand side of the `let lhs = rhs;`. The `rhs` can be
     * `undefined` for variable that are ambient such as `$event` and which don't have `rhs`
     * declaration.
     * @return {?}
     */
    BindingScope.prototype.set = /**
     * Create a local variable for later reference.
     *
     * @param {?} name Name of the variable.
     * @param {?} lhs AST representing the left hand side of the `let lhs = rhs;`.
     * @param {?=} rhs AST representing the right hand side of the `let lhs = rhs;`. The `rhs` can be
     * `undefined` for variable that are ambient such as `$event` and which don't have `rhs`
     * declaration.
     * @return {?}
     */
    function (name, lhs, rhs) {
        !this.map.has(name) ||
            error("The name " + name + " is already defined in scope to be " + this.map.get(name));
        this.map.set(name, { lhs: lhs, rhs: rhs, declared: false });
        return this;
    };
    /**
     * @param {?} name
     * @return {?}
     */
    BindingScope.prototype.getLocal = /**
     * @param {?} name
     * @return {?}
     */
    function (name) { return this.get(name); };
    /**
     * @param {?} declareCallback
     * @return {?}
     */
    BindingScope.prototype.nestedScope = /**
     * @param {?} declareCallback
     * @return {?}
     */
    function (declareCallback) {
        return new BindingScope(this, declareCallback);
    };
    /**
     * @return {?}
     */
    BindingScope.prototype.freshReferenceName = /**
     * @return {?}
     */
    function () {
        var /** @type {?} */ current = this;
        // Find the top scope as it maintains the global reference count
        while (current.parent)
            current = current.parent;
        var /** @type {?} */ ref = "" + REFERENCE_PREFIX + current.referenceNameIndex++;
        return ref;
    };
    BindingScope.ROOT_SCOPE = new BindingScope().set('$event', o.variable('$event'));
    return BindingScope;
}());
function BindingScope_tsickle_Closure_declarations() {
    /** @type {?} */
    BindingScope.ROOT_SCOPE;
    /**
     * Keeps a map from local variables to their expressions.
     *
     * This is used when one refers to variable such as: 'let abc = a.b.c`.
     * - key to the map is the string literal `"abc"`.
     * - value `lhs` is the left hand side which is an AST representing `abc`.
     * - value `rhs` is the right hand side which is an AST representing `a.b.c`.
     * - value `declared` is true if the `declareLocalVarCallback` has been called for this scope
     * already.
     * @type {?}
     */
    BindingScope.prototype.map;
    /** @type {?} */
    BindingScope.prototype.referenceNameIndex;
    /** @type {?} */
    BindingScope.prototype.parent;
    /** @type {?} */
    BindingScope.prototype.declareLocalVarCallback;
}
/** @enum {number} */
var RenderFlags = {
    /* Whether to run the creation block (e.g. create elements and directives) */
    Create: 1,
    /* Whether to run the update block (e.g. refresh bindings) */
    Update: 2,
};
export { RenderFlags };
var TemplateDefinitionBuilder = /** @class */ (function () {
    function TemplateDefinitionBuilder(outputCtx, constantPool, reflector, contextParameter, parentBindingScope, level, ngContentSelectors, contextName, templateName, pipeMap, viewQueries, directives, pipes) {
        if (level === void 0) { level = 0; }
        var _this = this;
        this.outputCtx = outputCtx;
        this.constantPool = constantPool;
        this.reflector = reflector;
        this.contextParameter = contextParameter;
        this.level = level;
        this.ngContentSelectors = ngContentSelectors;
        this.contextName = contextName;
        this.templateName = templateName;
        this.pipeMap = pipeMap;
        this.viewQueries = viewQueries;
        this.directives = directives;
        this.pipes = pipes;
        this._dataIndex = 0;
        this._bindingContext = 0;
        this._temporaryAllocated = false;
        this._prefix = [];
        this._creationMode = [];
        this._variableMode = [];
        this._bindingMode = [];
        this._postfix = [];
        this._projectionDefinitionIndex = 0;
        this.unsupported = unsupported;
        this.invalid = invalid;
        this._inI18nSection = false;
        this._i18nSectionIndex = -1;
        this._phToNodeIdxes = [{}];
        // These should be handled in the template or element directly.
        this.visitReference = invalid;
        this.visitVariable = invalid;
        this.visitEvent = invalid;
        this.visitElementProperty = invalid;
        this.visitAttr = invalid;
        // These should be handled in the template or element directly
        this.visitDirective = invalid;
        this.visitDirectiveProperty = invalid;
        this.bindingScope =
            parentBindingScope.nestedScope(function (lhsVar, expression) {
                _this._bindingMode.push(lhsVar.set(expression).toDeclStmt(o.INFERRED_TYPE, [o.StmtModifier.Final]));
            });
        this._valueConverter = new ValueConverter(outputCtx, function () { return _this.allocateDataSlot(); }, function (name, localName, slot, value) {
            _this.bindingScope.set(localName, value);
            var /** @type {?} */ pipe = /** @type {?} */ ((pipeMap.get(name)));
            pipe || error("Could not find pipe " + name);
            _this.pipes.add(pipe.type.reference);
            _this._creationMode.push(o.importExpr(R3.pipe).callFn([o.literal(slot), o.literal(name)]).toStmt());
        });
    }
    /**
     * @param {?} nodes
     * @param {?} variables
     * @return {?}
     */
    TemplateDefinitionBuilder.prototype.buildTemplateFunction = /**
     * @param {?} nodes
     * @param {?} variables
     * @return {?}
     */
    function (nodes, variables) {
        // Create variable bindings
        for (var _i = 0, variables_1 = variables; _i < variables_1.length; _i++) {
            var variable = variables_1[_i];
            var /** @type {?} */ variableName = variable.name;
            var /** @type {?} */ expression = o.variable(this.contextParameter).prop(variable.value || IMPLICIT_REFERENCE);
            var /** @type {?} */ scopedName = this.bindingScope.freshReferenceName();
            // Add the reference to the local scope.
            this.bindingScope.set(variableName, o.variable(variableName + scopedName), expression);
        }
        // Collect content projections
        if (this.ngContentSelectors && this.ngContentSelectors.length > 0) {
            var /** @type {?} */ contentProjections = getContentProjection(nodes, this.ngContentSelectors);
            this._contentProjections = contentProjections;
            if (contentProjections.size > 0) {
                var /** @type {?} */ selectors_1 = [];
                Array.from(contentProjections.values()).forEach(function (info) {
                    if (info.selector) {
                        selectors_1[info.index - 1] = info.selector;
                    }
                });
                var /** @type {?} */ projectionIndex = this._projectionDefinitionIndex = this.allocateDataSlot();
                var /** @type {?} */ parameters = [o.literal(projectionIndex)];
                if (selectors_1.some(function (value) { return !value; })) {
                    error("content project information skipped an index");
                }
                if (selectors_1.length > 1) {
                    var /** @type {?} */ r3Selectors = selectors_1.map(function (s) { return parseSelectorToR3Selector(s); });
                    // `projectionDef` needs both the parsed and raw value of the selectors
                    var /** @type {?} */ parsed = this.outputCtx.constantPool.getConstLiteral(asLiteral(r3Selectors), true);
                    var /** @type {?} */ unParsed = this.outputCtx.constantPool.getConstLiteral(asLiteral(selectors_1), true);
                    parameters.push(parsed, unParsed);
                }
                this.instruction.apply(this, [this._creationMode, null, R3.projectionDef].concat(parameters));
            }
        }
        // Define and update any view queries
        for (var _a = 0, _b = this.viewQueries; _a < _b.length; _a++) {
            var query = _b[_a];
            // e.g. r3.Q(0, somePredicate, true);
            var /** @type {?} */ querySlot = this.allocateDataSlot();
            var /** @type {?} */ predicate = getQueryPredicate(query, this.outputCtx);
            var /** @type {?} */ args = [
                /* memoryIndex */ o.literal(querySlot, o.INFERRED_TYPE),
                predicate,
                /* descend */ o.literal(query.descendants, o.INFERRED_TYPE)
            ];
            if (query.read) {
                args.push(this.outputCtx.importExpr(/** @type {?} */ ((query.read.identifier)).reference));
            }
            this.instruction.apply(this, [this._creationMode, null, R3.query].concat(args));
            // (r3.qR(tmp = r3.ɵld(0)) && (ctx.someDir = tmp));
            var /** @type {?} */ temporary = this.temp();
            var /** @type {?} */ getQueryList = o.importExpr(R3.load).callFn([o.literal(querySlot)]);
            var /** @type {?} */ refresh = o.importExpr(R3.queryRefresh).callFn([temporary.set(getQueryList)]);
            var /** @type {?} */ updateDirective = o.variable(CONTEXT_NAME)
                .prop(query.propertyName)
                .set(query.first ? temporary.prop('first') : temporary);
            this._bindingMode.push(refresh.and(updateDirective).toStmt());
        }
        templateVisitAll(this, nodes);
        var /** @type {?} */ creationMode = this._creationMode.length > 0 ?
            [o.ifStmt(o.variable(RENDER_FLAGS).bitwiseAnd(o.literal(1 /* Create */), null, false), this._creationMode)] :
            [];
        var /** @type {?} */ updateMode = this._bindingMode.length > 0 ?
            [o.ifStmt(o.variable(RENDER_FLAGS).bitwiseAnd(o.literal(2 /* Update */), null, false), this._bindingMode)] :
            [];
        // Generate maps of placeholder name to node indexes
        // TODO(vicb): This is a WIP, not fully supported yet
        for (var _c = 0, _d = this._phToNodeIdxes; _c < _d.length; _c++) {
            var phToNodeIdx = _d[_c];
            if (Object.keys(phToNodeIdx).length > 0) {
                var /** @type {?} */ scopedName = this.bindingScope.freshReferenceName();
                var /** @type {?} */ phMap = o.variable(scopedName)
                    .set(mapToExpression(phToNodeIdx, true))
                    .toDeclStmt(o.INFERRED_TYPE, [o.StmtModifier.Final]);
                this._prefix.push(phMap);
            }
        }
        return o.fn([new o.FnParam(RENDER_FLAGS, o.NUMBER_TYPE), new o.FnParam(this.contextParameter, null)], this._prefix.concat(creationMode, this._variableMode, updateMode, this._postfix), o.INFERRED_TYPE, null, this.templateName);
    };
    // LocalResolver
    /**
     * @param {?} name
     * @return {?}
     */
    TemplateDefinitionBuilder.prototype.getLocal = /**
     * @param {?} name
     * @return {?}
     */
    function (name) { return this.bindingScope.get(name); };
    // TemplateAstVisitor
    /**
     * @param {?} ngContent
     * @return {?}
     */
    TemplateDefinitionBuilder.prototype.visitNgContent = /**
     * @param {?} ngContent
     * @return {?}
     */
    function (ngContent) {
        var /** @type {?} */ info = /** @type {?} */ ((this._contentProjections.get(ngContent)));
        info ||
            error("Expected " + ngContent.sourceSpan + " to be included in content projection collection");
        var /** @type {?} */ slot = this.allocateDataSlot();
        var /** @type {?} */ parameters = [o.literal(slot), o.literal(this._projectionDefinitionIndex)];
        if (info.index !== 0) {
            parameters.push(o.literal(info.index));
        }
        this.instruction.apply(this, [this._creationMode, ngContent.sourceSpan, R3.projection].concat(parameters));
    };
    // TemplateAstVisitor
    /**
     * @param {?} element
     * @return {?}
     */
    TemplateDefinitionBuilder.prototype.visitElement = /**
     * @param {?} element
     * @return {?}
     */
    function (element) {
        var _this = this;
        var /** @type {?} */ elementIndex = this.allocateDataSlot();
        var /** @type {?} */ referenceDataSlots = new Map();
        var /** @type {?} */ wasInI18nSection = this._inI18nSection;
        var /** @type {?} */ outputAttrs = {};
        var /** @type {?} */ attrI18nMetas = {};
        var /** @type {?} */ i18nMeta = '';
        // Elements inside i18n sections are replaced with placeholders
        // TODO(vicb): nested elements are a WIP in this phase
        if (this._inI18nSection) {
            var /** @type {?} */ phName = element.name.toLowerCase();
            if (!this._phToNodeIdxes[this._i18nSectionIndex][phName]) {
                this._phToNodeIdxes[this._i18nSectionIndex][phName] = [];
            }
            this._phToNodeIdxes[this._i18nSectionIndex][phName].push(elementIndex);
        }
        // Handle i18n attributes
        for (var _i = 0, _a = element.attrs; _i < _a.length; _i++) {
            var attr = _a[_i];
            var /** @type {?} */ name_1 = attr.name;
            var /** @type {?} */ value = attr.value;
            if (name_1 === I18N_ATTR) {
                if (this._inI18nSection) {
                    throw new Error("Could not mark an element as translatable inside of a translatable section");
                }
                this._inI18nSection = true;
                this._i18nSectionIndex++;
                this._phToNodeIdxes[this._i18nSectionIndex] = {};
                i18nMeta = value;
            }
            else if (name_1.startsWith(I18N_ATTR_PREFIX)) {
                attrI18nMetas[name_1.slice(I18N_ATTR_PREFIX.length)] = value;
            }
            else {
                outputAttrs[name_1] = value;
            }
        }
        // Element creation mode
        var /** @type {?} */ parameters = [
            o.literal(elementIndex),
            o.literal(element.name),
        ];
        element.directives.forEach(function (directive) { return _this.directives.add(directive.directive.type.reference); });
        // Add the attributes
        var /** @type {?} */ i18nMessages = [];
        var /** @type {?} */ attributes = [];
        var /** @type {?} */ hasI18nAttr = false;
        Object.getOwnPropertyNames(outputAttrs).forEach(function (name) {
            var /** @type {?} */ value = outputAttrs[name];
            attributes.push(o.literal(name));
            if (attrI18nMetas.hasOwnProperty(name)) {
                hasI18nAttr = true;
                var /** @type {?} */ meta = parseI18nMeta(attrI18nMetas[name]);
                var /** @type {?} */ variable = _this.constantPool.getTranslation(value, meta);
                attributes.push(variable);
            }
            else {
                attributes.push(o.literal(value));
            }
        });
        var /** @type {?} */ attrArg = o.TYPED_NULL_EXPR;
        if (attributes.length > 0) {
            attrArg = hasI18nAttr ? getLiteralFactory(this.outputCtx, o.literalArr(attributes)) :
                this.constantPool.getConstLiteral(o.literalArr(attributes), true);
        }
        parameters.push(attrArg);
        if (element.references && element.references.length > 0) {
            var /** @type {?} */ references = flatten(element.references.map(function (reference) {
                var /** @type {?} */ slot = _this.allocateDataSlot();
                referenceDataSlots.set(reference.name, slot);
                // Generate the update temporary.
                var /** @type {?} */ variableName = _this.bindingScope.freshReferenceName();
                _this._variableMode.push(o.variable(variableName, o.INFERRED_TYPE)
                    .set(o.importExpr(R3.load).callFn([o.literal(slot)]))
                    .toDeclStmt(o.INFERRED_TYPE, [o.StmtModifier.Final]));
                _this.bindingScope.set(reference.name, o.variable(variableName));
                return [reference.name, reference.originalValue];
            })).map(function (value) { return o.literal(value); });
            parameters.push(this.constantPool.getConstLiteral(o.literalArr(references), /* forceShared */ /* forceShared */ true));
        }
        else {
            parameters.push(o.TYPED_NULL_EXPR);
        }
        // Generate the instruction create element instruction
        if (i18nMessages.length > 0) {
            (_b = this._creationMode).push.apply(_b, i18nMessages);
        }
        this.instruction.apply(this, [this._creationMode, element.sourceSpan, R3.createElement].concat(trimTrailingNulls(parameters)));
        var /** @type {?} */ implicit = o.variable(CONTEXT_NAME);
        // Generate Listeners (outputs)
        element.outputs.forEach(function (outputAst) {
            var /** @type {?} */ functionName = _this.templateName + "_" + element.name + "_" + outputAst.name + "_listener";
            var /** @type {?} */ localVars = [];
            var /** @type {?} */ bindingScope = _this.bindingScope.nestedScope(function (lhsVar, rhsExpression) {
                localVars.push(lhsVar.set(rhsExpression).toDeclStmt(o.INFERRED_TYPE, [o.StmtModifier.Final]));
            });
            var /** @type {?} */ bindingExpr = convertActionBinding(bindingScope, o.variable(CONTEXT_NAME), outputAst.handler, 'b', function () { return error('Unexpected interpolation'); });
            var /** @type {?} */ handler = o.fn([new o.FnParam('$event', o.DYNAMIC_TYPE)], localVars.concat(bindingExpr.render3Stmts), o.INFERRED_TYPE, null, functionName);
            _this.instruction(_this._creationMode, outputAst.sourceSpan, R3.listener, o.literal(outputAst.name), handler);
        });
        // Generate element input bindings
        for (var _c = 0, _d = element.inputs; _c < _d.length; _c++) {
            var input = _d[_c];
            if (input.isAnimation) {
                this.unsupported('animations');
            }
            var /** @type {?} */ convertedBinding = this.convertPropertyBinding(implicit, input.value);
            var /** @type {?} */ instruction = BINDING_INSTRUCTION_MAP[input.type];
            if (instruction) {
                // TODO(chuckj): runtime: security context?
                this.instruction(this._bindingMode, input.sourceSpan, instruction, o.literal(elementIndex), o.literal(input.name), convertedBinding);
            }
            else {
                this.unsupported("binding " + PropertyBindingType[input.type]);
            }
        }
        // Generate directives input bindings
        this._visitDirectives(element.directives, implicit, elementIndex);
        // Traverse element child nodes
        if (this._inI18nSection && element.children.length == 1 &&
            element.children[0] instanceof TextAst) {
            var /** @type {?} */ text = /** @type {?} */ (element.children[0]);
            this.visitSingleI18nTextChild(text, i18nMeta);
        }
        else {
            templateVisitAll(this, element.children);
        }
        // Finish element construction mode.
        this.instruction(this._creationMode, element.endSourceSpan || element.sourceSpan, R3.elementEnd);
        // Restore the state before exiting this node
        this._inI18nSection = wasInI18nSection;
        var _b;
    };
    /**
     * @param {?} directives
     * @param {?} implicit
     * @param {?} nodeIndex
     * @return {?}
     */
    TemplateDefinitionBuilder.prototype._visitDirectives = /**
     * @param {?} directives
     * @param {?} implicit
     * @param {?} nodeIndex
     * @return {?}
     */
    function (directives, implicit, nodeIndex) {
        for (var _i = 0, directives_1 = directives; _i < directives_1.length; _i++) {
            var directive = directives_1[_i];
            // Creation mode
            // e.g. D(0, TodoComponentDef.n(), TodoComponentDef);
            var /** @type {?} */ directiveType = directive.directive.type.reference;
            var /** @type {?} */ kind = directive.directive.isComponent ? 2 /* Component */ : 1 /* Directive */;
            // Note: *do not cache* calls to this.directiveOf() as the constant pool needs to know if the
            // node is referenced multiple times to know that it must generate the reference into a
            // temporary.
            // Bindings
            for (var _a = 0, _b = directive.inputs; _a < _b.length; _a++) {
                var input = _b[_a];
                var /** @type {?} */ convertedBinding = this.convertPropertyBinding(implicit, input.value);
                this.instruction(this._bindingMode, directive.sourceSpan, R3.elementProperty, o.literal(nodeIndex), o.literal(input.templateName), o.importExpr(R3.bind).callFn([convertedBinding]));
            }
        }
    };
    // TemplateAstVisitor
    /**
     * @param {?} template
     * @return {?}
     */
    TemplateDefinitionBuilder.prototype.visitEmbeddedTemplate = /**
     * @param {?} template
     * @return {?}
     */
    function (template) {
        var _this = this;
        var /** @type {?} */ templateIndex = this.allocateDataSlot();
        var /** @type {?} */ templateRef = this.reflector.resolveExternalReference(Identifiers.TemplateRef);
        var /** @type {?} */ templateDirective = template.directives.find(function (directive) {
            return directive.directive.type.diDeps.some(function (dependency) {
                return dependency.token != null && (tokenReference(dependency.token) == templateRef);
            });
        });
        var /** @type {?} */ contextName = this.contextName && templateDirective && templateDirective.directive.type.reference.name ?
            this.contextName + "_" + templateDirective.directive.type.reference.name :
            null;
        var /** @type {?} */ templateName = contextName ? contextName + "_Template_" + templateIndex : "Template_" + templateIndex;
        var /** @type {?} */ templateContext = "ctx" + this.level;
        var /** @type {?} */ parameters = [o.variable(templateName), o.literal(null, o.INFERRED_TYPE)];
        var /** @type {?} */ attributeNames = [];
        template.directives.forEach(function (directiveAst) {
            _this.directives.add(directiveAst.directive.type.reference);
            CssSelector.parse(/** @type {?} */ ((directiveAst.directive.selector))).forEach(function (selector) {
                selector.attrs.forEach(function (value) {
                    // Convert '' (falsy) strings into `null`. This is needed because we want
                    // to communicate to runtime that these attributes are present for
                    // selector matching, but should not actually be added to the DOM.
                    // attributeNames.push(o.literal(value ? value : null));
                    // TODO(misko): make the above comment true, for now just write to DOM because
                    // the runtime selectors have not been updated.
                    attributeNames.push(o.literal(value));
                });
            });
        });
        if (attributeNames.length) {
            parameters.push(this.constantPool.getConstLiteral(o.literalArr(attributeNames), /* forcedShared */ /* forcedShared */ true));
        }
        // e.g. C(1, C1Template)
        this.instruction.apply(this, [this._creationMode, template.sourceSpan, R3.containerCreate, o.literal(templateIndex)].concat(trimTrailingNulls(parameters)));
        // Generate directives
        this._visitDirectives(template.directives, o.variable(CONTEXT_NAME), templateIndex);
        // Create the template function
        var /** @type {?} */ templateVisitor = new TemplateDefinitionBuilder(this.outputCtx, this.constantPool, this.reflector, templateContext, this.bindingScope, this.level + 1, this.ngContentSelectors, contextName, templateName, this.pipeMap, [], this.directives, this.pipes);
        var /** @type {?} */ templateFunctionExpr = templateVisitor.buildTemplateFunction(template.children, template.variables);
        this._postfix.push(templateFunctionExpr.toDeclStmt(templateName, null));
    };
    // TemplateAstVisitor
    /**
     * @param {?} text
     * @return {?}
     */
    TemplateDefinitionBuilder.prototype.visitBoundText = /**
     * @param {?} text
     * @return {?}
     */
    function (text) {
        var /** @type {?} */ nodeIndex = this.allocateDataSlot();
        // Creation mode
        this.instruction(this._creationMode, text.sourceSpan, R3.text, o.literal(nodeIndex));
        this.instruction(this._bindingMode, text.sourceSpan, R3.textCreateBound, o.literal(nodeIndex), this.convertPropertyBinding(o.variable(CONTEXT_NAME), text.value));
    };
    // TemplateAstVisitor
    /**
     * @param {?} text
     * @return {?}
     */
    TemplateDefinitionBuilder.prototype.visitText = /**
     * @param {?} text
     * @return {?}
     */
    function (text) {
        // Text is defined in creation mode only.
        this.instruction(this._creationMode, text.sourceSpan, R3.text, o.literal(this.allocateDataSlot()), o.literal(text.value));
    };
    // When the content of the element is a single text node the translation can be inlined:
    //
    // `<p i18n="desc|mean">some content</p>`
    // compiles to
    // ```
    // /**
    // * @desc desc
    // * @meaning mean
    // */
    // const MSG_XYZ = goog.getMsg('some content');
    // i0.ɵT(1, MSG_XYZ);
    // ```
    /**
     * @param {?} text
     * @param {?} i18nMeta
     * @return {?}
     */
    TemplateDefinitionBuilder.prototype.visitSingleI18nTextChild = /**
     * @param {?} text
     * @param {?} i18nMeta
     * @return {?}
     */
    function (text, i18nMeta) {
        var /** @type {?} */ meta = parseI18nMeta(i18nMeta);
        var /** @type {?} */ variable = this.constantPool.getTranslation(text.value, meta);
        this.instruction(this._creationMode, text.sourceSpan, R3.text, o.literal(this.allocateDataSlot()), variable);
    };
    /**
     * @return {?}
     */
    TemplateDefinitionBuilder.prototype.allocateDataSlot = /**
     * @return {?}
     */
    function () { return this._dataIndex++; };
    /**
     * @return {?}
     */
    TemplateDefinitionBuilder.prototype.bindingContext = /**
     * @return {?}
     */
    function () { return "" + this._bindingContext++; };
    /**
     * @param {?} statements
     * @param {?} span
     * @param {?} reference
     * @param {...?} params
     * @return {?}
     */
    TemplateDefinitionBuilder.prototype.instruction = /**
     * @param {?} statements
     * @param {?} span
     * @param {?} reference
     * @param {...?} params
     * @return {?}
     */
    function (statements, span, reference) {
        var params = [];
        for (var _i = 3; _i < arguments.length; _i++) {
            params[_i - 3] = arguments[_i];
        }
        statements.push(o.importExpr(reference, null, span).callFn(params, span).toStmt());
    };
    /**
     * @param {?} type
     * @param {?} kind
     * @return {?}
     */
    TemplateDefinitionBuilder.prototype.definitionOf = /**
     * @param {?} type
     * @param {?} kind
     * @return {?}
     */
    function (type, kind) {
        return this.constantPool.getDefinition(type, kind, this.outputCtx);
    };
    /**
     * @return {?}
     */
    TemplateDefinitionBuilder.prototype.temp = /**
     * @return {?}
     */
    function () {
        if (!this._temporaryAllocated) {
            this._prefix.push(new o.DeclareVarStmt(TEMPORARY_NAME, undefined, o.DYNAMIC_TYPE));
            this._temporaryAllocated = true;
        }
        return o.variable(TEMPORARY_NAME);
    };
    /**
     * @param {?} implicit
     * @param {?} value
     * @return {?}
     */
    TemplateDefinitionBuilder.prototype.convertPropertyBinding = /**
     * @param {?} implicit
     * @param {?} value
     * @return {?}
     */
    function (implicit, value) {
        var /** @type {?} */ pipesConvertedValue = value.visit(this._valueConverter);
        var /** @type {?} */ convertedPropertyBinding = convertPropertyBinding(this, implicit, pipesConvertedValue, this.bindingContext(), BindingForm.TrySimple, interpolate);
        (_a = this._bindingMode).push.apply(_a, convertedPropertyBinding.stmts);
        return convertedPropertyBinding.currValExpr;
        var _a;
    };
    return TemplateDefinitionBuilder;
}());
function TemplateDefinitionBuilder_tsickle_Closure_declarations() {
    /** @type {?} */
    TemplateDefinitionBuilder.prototype._dataIndex;
    /** @type {?} */
    TemplateDefinitionBuilder.prototype._bindingContext;
    /** @type {?} */
    TemplateDefinitionBuilder.prototype._temporaryAllocated;
    /** @type {?} */
    TemplateDefinitionBuilder.prototype._prefix;
    /** @type {?} */
    TemplateDefinitionBuilder.prototype._creationMode;
    /** @type {?} */
    TemplateDefinitionBuilder.prototype._variableMode;
    /** @type {?} */
    TemplateDefinitionBuilder.prototype._bindingMode;
    /** @type {?} */
    TemplateDefinitionBuilder.prototype._postfix;
    /** @type {?} */
    TemplateDefinitionBuilder.prototype._contentProjections;
    /** @type {?} */
    TemplateDefinitionBuilder.prototype._projectionDefinitionIndex;
    /** @type {?} */
    TemplateDefinitionBuilder.prototype._valueConverter;
    /** @type {?} */
    TemplateDefinitionBuilder.prototype.unsupported;
    /** @type {?} */
    TemplateDefinitionBuilder.prototype.invalid;
    /** @type {?} */
    TemplateDefinitionBuilder.prototype.bindingScope;
    /** @type {?} */
    TemplateDefinitionBuilder.prototype._inI18nSection;
    /** @type {?} */
    TemplateDefinitionBuilder.prototype._i18nSectionIndex;
    /** @type {?} */
    TemplateDefinitionBuilder.prototype._phToNodeIdxes;
    /** @type {?} */
    TemplateDefinitionBuilder.prototype.visitReference;
    /** @type {?} */
    TemplateDefinitionBuilder.prototype.visitVariable;
    /** @type {?} */
    TemplateDefinitionBuilder.prototype.visitEvent;
    /** @type {?} */
    TemplateDefinitionBuilder.prototype.visitElementProperty;
    /** @type {?} */
    TemplateDefinitionBuilder.prototype.visitAttr;
    /** @type {?} */
    TemplateDefinitionBuilder.prototype.visitDirective;
    /** @type {?} */
    TemplateDefinitionBuilder.prototype.visitDirectiveProperty;
    /** @type {?} */
    TemplateDefinitionBuilder.prototype.outputCtx;
    /** @type {?} */
    TemplateDefinitionBuilder.prototype.constantPool;
    /** @type {?} */
    TemplateDefinitionBuilder.prototype.reflector;
    /** @type {?} */
    TemplateDefinitionBuilder.prototype.contextParameter;
    /** @type {?} */
    TemplateDefinitionBuilder.prototype.level;
    /** @type {?} */
    TemplateDefinitionBuilder.prototype.ngContentSelectors;
    /** @type {?} */
    TemplateDefinitionBuilder.prototype.contextName;
    /** @type {?} */
    TemplateDefinitionBuilder.prototype.templateName;
    /** @type {?} */
    TemplateDefinitionBuilder.prototype.pipeMap;
    /** @type {?} */
    TemplateDefinitionBuilder.prototype.viewQueries;
    /** @type {?} */
    TemplateDefinitionBuilder.prototype.directives;
    /** @type {?} */
    TemplateDefinitionBuilder.prototype.pipes;
}
/**
 * @param {?} query
 * @param {?} outputCtx
 * @return {?}
 */
function getQueryPredicate(query, outputCtx) {
    if (query.selectors.length > 1 || (query.selectors.length == 1 && query.selectors[0].value)) {
        var /** @type {?} */ selectors = query.selectors.map(function (value) { return (value.value); });
        selectors.some(function (value) { return !value; }) && error('Found a type among the string selectors expected');
        return outputCtx.constantPool.getConstLiteral(o.literalArr(selectors.map(function (value) { return o.literal(value); })));
    }
    if (query.selectors.length == 1) {
        var /** @type {?} */ first = query.selectors[0];
        if (first.identifier) {
            return outputCtx.importExpr(first.identifier.reference);
        }
    }
    error('Unexpected query form');
    return o.NULL_EXPR;
}
/**
 * @param {?} type
 * @param {?} outputCtx
 * @param {?} reflector
 * @param {?} queries
 * @return {?}
 */
export function createFactory(type, outputCtx, reflector, queries) {
    var /** @type {?} */ args = [];
    var /** @type {?} */ elementRef = reflector.resolveExternalReference(Identifiers.ElementRef);
    var /** @type {?} */ templateRef = reflector.resolveExternalReference(Identifiers.TemplateRef);
    var /** @type {?} */ viewContainerRef = reflector.resolveExternalReference(Identifiers.ViewContainerRef);
    for (var _i = 0, _a = type.diDeps; _i < _a.length; _i++) {
        var dependency = _a[_i];
        var /** @type {?} */ token = dependency.token;
        if (token) {
            var /** @type {?} */ tokenRef = tokenReference(token);
            if (tokenRef === elementRef) {
                args.push(o.importExpr(R3.injectElementRef).callFn([]));
            }
            else if (tokenRef === templateRef) {
                args.push(o.importExpr(R3.injectTemplateRef).callFn([]));
            }
            else if (tokenRef === viewContainerRef) {
                args.push(o.importExpr(R3.injectViewContainerRef).callFn([]));
            }
            else if (dependency.isAttribute) {
                args.push(o.importExpr(R3.injectAttribute).callFn([o.literal(/** @type {?} */ ((dependency.token)).value)]));
            }
            else {
                var /** @type {?} */ tokenValue = token.identifier != null ? outputCtx.importExpr(tokenRef) : o.literal(tokenRef);
                var /** @type {?} */ directiveInjectArgs = [tokenValue];
                var /** @type {?} */ flags = extractFlags(dependency);
                if (flags != 0 /* Default */) {
                    // Append flag information if other than default.
                    directiveInjectArgs.push(o.literal(flags));
                }
                args.push(o.importExpr(R3.directiveInject).callFn(directiveInjectArgs));
            }
        }
        else {
            unsupported('dependency without a token');
        }
    }
    var /** @type {?} */ queryDefinitions = [];
    for (var _b = 0, queries_1 = queries; _b < queries_1.length; _b++) {
        var query = queries_1[_b];
        var /** @type {?} */ predicate = getQueryPredicate(query, outputCtx);
        // e.g. r3.Q(null, somePredicate, false) or r3.Q(null, ['div'], false)
        var /** @type {?} */ parameters = [
            /* memoryIndex */ o.literal(null, o.INFERRED_TYPE),
            predicate,
            /* descend */ o.literal(query.descendants)
        ];
        if (query.read) {
            parameters.push(outputCtx.importExpr(/** @type {?} */ ((query.read.identifier)).reference));
        }
        queryDefinitions.push(o.importExpr(R3.query).callFn(parameters));
    }
    var /** @type {?} */ createInstance = new o.InstantiateExpr(outputCtx.importExpr(type.reference), args);
    var /** @type {?} */ result = queryDefinitions.length > 0 ? o.literalArr([createInstance].concat(queryDefinitions)) :
        createInstance;
    return o.fn([], [new o.ReturnStatement(result)], o.INFERRED_TYPE, null, type.reference.name ? type.reference.name + "_Factory" : null);
}
/**
 * @param {?} dependency
 * @return {?}
 */
function extractFlags(dependency) {
    var /** @type {?} */ flags = 0 /* Default */;
    if (dependency.isHost) {
        flags |= 1 /* Host */;
    }
    if (dependency.isOptional) {
        flags |= 8 /* Optional */;
    }
    if (dependency.isSelf) {
        flags |= 2 /* Self */;
    }
    if (dependency.isSkipSelf) {
        flags |= 4 /* SkipSelf */;
    }
    if (dependency.isValue) {
        unsupported('value dependencies');
    }
    return flags;
}
/**
 *  Remove trailing null nodes as they are implied.
 * @param {?} parameters
 * @return {?}
 */
function trimTrailingNulls(parameters) {
    while (o.isNull(parameters[parameters.length - 1])) {
        parameters.pop();
    }
    return parameters;
}
/**
 * @param {?} selector
 * @return {?}
 */
function createDirectiveSelector(selector) {
    return asLiteral(parseSelectorToR3Selector(selector));
}
/**
 * @param {?} directiveMetadata
 * @param {?} outputCtx
 * @return {?}
 */
function createHostAttributesArray(directiveMetadata, outputCtx) {
    var /** @type {?} */ values = [];
    var /** @type {?} */ attributes = directiveMetadata.hostAttributes;
    for (var _i = 0, _a = Object.getOwnPropertyNames(attributes); _i < _a.length; _i++) {
        var key = _a[_i];
        var /** @type {?} */ value = attributes[key];
        values.push(o.literal(key), o.literal(value));
    }
    if (values.length > 0) {
        return outputCtx.constantPool.getConstLiteral(o.literalArr(values));
    }
    return null;
}
/**
 * @param {?} directiveMetadata
 * @param {?} outputCtx
 * @param {?} bindingParser
 * @return {?}
 */
function createHostBindingsFunction(directiveMetadata, outputCtx, bindingParser) {
    var /** @type {?} */ statements = [];
    var /** @type {?} */ temporary = function () {
        var /** @type {?} */ declared = false;
        return function () {
            if (!declared) {
                statements.push(new o.DeclareVarStmt(TEMPORARY_NAME, undefined, o.DYNAMIC_TYPE));
                declared = true;
            }
            return o.variable(TEMPORARY_NAME);
        };
    }();
    var /** @type {?} */ hostBindingSourceSpan = typeSourceSpan(directiveMetadata.isComponent ? 'Component' : 'Directive', directiveMetadata.type);
    // Calculate the queries
    for (var /** @type {?} */ index = 0; index < directiveMetadata.queries.length; index++) {
        var /** @type {?} */ query = directiveMetadata.queries[index];
        // e.g. r3.qR(tmp = r3.ld(dirIndex)[1]) && (r3.ld(dirIndex)[0].someDir = tmp);
        var /** @type {?} */ getDirectiveMemory = o.importExpr(R3.load).callFn([o.variable('dirIndex')]);
        // The query list is at the query index + 1 because the directive itself is in slot 0.
        var /** @type {?} */ getQueryList = getDirectiveMemory.key(o.literal(index + 1));
        var /** @type {?} */ assignToTemporary = temporary().set(getQueryList);
        var /** @type {?} */ callQueryRefresh = o.importExpr(R3.queryRefresh).callFn([assignToTemporary]);
        var /** @type {?} */ updateDirective = getDirectiveMemory.key(o.literal(0, o.INFERRED_TYPE))
            .prop(query.propertyName)
            .set(query.first ? temporary().prop('first') : temporary());
        var /** @type {?} */ andExpression = callQueryRefresh.and(updateDirective);
        statements.push(andExpression.toStmt());
    }
    var /** @type {?} */ directiveSummary = directiveMetadata.toSummary();
    // Calculate the host property bindings
    var /** @type {?} */ bindings = bindingParser.createBoundHostProperties(directiveSummary, hostBindingSourceSpan);
    var /** @type {?} */ bindingContext = o.importExpr(R3.load).callFn([o.variable('dirIndex')]);
    if (bindings) {
        for (var _i = 0, bindings_1 = bindings; _i < bindings_1.length; _i++) {
            var binding = bindings_1[_i];
            var /** @type {?} */ bindingExpr = convertPropertyBinding(null, bindingContext, binding.expression, 'b', BindingForm.TrySimple, function () { return error('Unexpected interpolation'); });
            statements.push.apply(statements, bindingExpr.stmts);
            statements.push(o.importExpr(R3.elementProperty)
                .callFn([
                o.variable('elIndex'), o.literal(binding.name),
                o.importExpr(R3.bind).callFn([bindingExpr.currValExpr])
            ])
                .toStmt());
        }
    }
    // Calculate host event bindings
    var /** @type {?} */ eventBindings = bindingParser.createDirectiveHostEventAsts(directiveSummary, hostBindingSourceSpan);
    if (eventBindings) {
        for (var _a = 0, eventBindings_1 = eventBindings; _a < eventBindings_1.length; _a++) {
            var binding = eventBindings_1[_a];
            var /** @type {?} */ bindingExpr = convertActionBinding(null, bindingContext, binding.handler, 'b', function () { return error('Unexpected interpolation'); });
            var /** @type {?} */ bindingName = binding.name && sanitizeIdentifier(binding.name);
            var /** @type {?} */ typeName = identifierName(directiveMetadata.type);
            var /** @type {?} */ functionName = typeName && bindingName ? typeName + "_" + bindingName + "_HostBindingHandler" : null;
            var /** @type {?} */ handler = o.fn([new o.FnParam('$event', o.DYNAMIC_TYPE)], bindingExpr.stmts.concat([new o.ReturnStatement(bindingExpr.allowDefault)]), o.INFERRED_TYPE, null, functionName);
            statements.push(o.importExpr(R3.listener).callFn([o.literal(binding.name), handler]).toStmt());
        }
    }
    if (statements.length > 0) {
        var /** @type {?} */ typeName = directiveMetadata.type.reference.name;
        return o.fn([new o.FnParam('dirIndex', o.NUMBER_TYPE), new o.FnParam('elIndex', o.NUMBER_TYPE)], statements, o.INFERRED_TYPE, null, typeName ? typeName + "_HostBindings" : null);
    }
    return null;
}
/**
 * @param {?} keys
 * @param {?} outputCtx
 * @return {?}
 */
function conditionallyCreateMapObjectLiteral(keys, outputCtx) {
    if (Object.getOwnPropertyNames(keys).length > 0) {
        return mapToExpression(keys);
    }
    return null;
}
var ValueConverter = /** @class */ (function (_super) {
    tslib_1.__extends(ValueConverter, _super);
    function ValueConverter(outputCtx, allocateSlot, definePipe) {
        var _this = _super.call(this) || this;
        _this.outputCtx = outputCtx;
        _this.allocateSlot = allocateSlot;
        _this.definePipe = definePipe;
        _this.pipeSlots = new Map();
        return _this;
    }
    // AstMemoryEfficientTransformer
    /**
     * @param {?} pipe
     * @param {?} context
     * @return {?}
     */
    ValueConverter.prototype.visitPipe = /**
     * @param {?} pipe
     * @param {?} context
     * @return {?}
     */
    function (pipe, context) {
        // Allocate a slot to create the pipe
        var /** @type {?} */ slot = this.allocateSlot();
        var /** @type {?} */ slotPseudoLocal = "PIPE:" + slot;
        var /** @type {?} */ target = new PropertyRead(pipe.span, new ImplicitReceiver(pipe.span), slotPseudoLocal);
        var /** @type {?} */ bindingId = pipeBinding(pipe.args);
        this.definePipe(pipe.name, slotPseudoLocal, slot, o.importExpr(bindingId));
        var /** @type {?} */ value = pipe.exp.visit(this);
        var /** @type {?} */ args = this.visitAll(pipe.args);
        return new FunctionCall(pipe.span, target, [new LiteralPrimitive(pipe.span, slot), value].concat(args));
    };
    /**
     * @param {?} array
     * @param {?} context
     * @return {?}
     */
    ValueConverter.prototype.visitLiteralArray = /**
     * @param {?} array
     * @param {?} context
     * @return {?}
     */
    function (array, context) {
        var _this = this;
        return new BuiltinFunctionCall(array.span, this.visitAll(array.expressions), function (values) {
            // If the literal has calculated (non-literal) elements transform it into
            // calls to literal factories that compose the literal and will cache intermediate
            // values. Otherwise, just return an literal array that contains the values.
            var /** @type {?} */ literal = o.literalArr(values);
            return values.every(function (a) { return a.isConstant(); }) ?
                _this.outputCtx.constantPool.getConstLiteral(literal, true) :
                getLiteralFactory(_this.outputCtx, literal);
        });
    };
    /**
     * @param {?} map
     * @param {?} context
     * @return {?}
     */
    ValueConverter.prototype.visitLiteralMap = /**
     * @param {?} map
     * @param {?} context
     * @return {?}
     */
    function (map, context) {
        var _this = this;
        return new BuiltinFunctionCall(map.span, this.visitAll(map.values), function (values) {
            // If the literal has calculated (non-literal) elements  transform it into
            // calls to literal factories that compose the literal and will cache intermediate
            // values. Otherwise, just return an literal array that contains the values.
            var /** @type {?} */ literal = o.literalMap(values.map(function (value, index) { return ({ key: map.keys[index].key, value: value, quoted: map.keys[index].quoted }); }));
            return values.every(function (a) { return a.isConstant(); }) ?
                _this.outputCtx.constantPool.getConstLiteral(literal, true) :
                getLiteralFactory(_this.outputCtx, literal);
        });
    };
    return ValueConverter;
}(AstMemoryEfficientTransformer));
function ValueConverter_tsickle_Closure_declarations() {
    /** @type {?} */
    ValueConverter.prototype.pipeSlots;
    /** @type {?} */
    ValueConverter.prototype.outputCtx;
    /** @type {?} */
    ValueConverter.prototype.allocateSlot;
    /** @type {?} */
    ValueConverter.prototype.definePipe;
}
/**
 * @template T
 * @param {?} arg
 * @return {?}
 */
function invalid(arg) {
    throw new Error("Invalid state: Visitor " + this.constructor.name + " doesn't handle " + o.constructor.name);
}
/**
 * @record
 */
function NgContentInfo() { }
function NgContentInfo_tsickle_Closure_declarations() {
    /** @type {?} */
    NgContentInfo.prototype.index;
    /** @type {?|undefined} */
    NgContentInfo.prototype.selector;
}
var ContentProjectionVisitor = /** @class */ (function (_super) {
    tslib_1.__extends(ContentProjectionVisitor, _super);
    function ContentProjectionVisitor(projectionMap, ngContentSelectors) {
        var _this = _super.call(this) || this;
        _this.projectionMap = projectionMap;
        _this.ngContentSelectors = ngContentSelectors;
        _this.index = 1;
        return _this;
    }
    /**
     * @param {?} ngContent
     * @return {?}
     */
    ContentProjectionVisitor.prototype.visitNgContent = /**
     * @param {?} ngContent
     * @return {?}
     */
    function (ngContent) {
        var /** @type {?} */ selector = this.ngContentSelectors[ngContent.index];
        if (selector == null) {
            error("could not find selector for index " + ngContent.index + " in " + ngContent);
        }
        if (!selector || selector === '*') {
            this.projectionMap.set(ngContent, { index: 0 });
        }
        else {
            this.projectionMap.set(ngContent, { index: this.index++, selector: selector });
        }
    };
    return ContentProjectionVisitor;
}(RecursiveTemplateAstVisitor));
function ContentProjectionVisitor_tsickle_Closure_declarations() {
    /** @type {?} */
    ContentProjectionVisitor.prototype.index;
    /** @type {?} */
    ContentProjectionVisitor.prototype.projectionMap;
    /** @type {?} */
    ContentProjectionVisitor.prototype.ngContentSelectors;
}
/**
 * @param {?} nodes
 * @param {?} ngContentSelectors
 * @return {?}
 */
function getContentProjection(nodes, ngContentSelectors) {
    var /** @type {?} */ projectIndexMap = new Map();
    var /** @type {?} */ visitor = new ContentProjectionVisitor(projectIndexMap, ngContentSelectors);
    templateVisitAll(visitor, nodes);
    return projectIndexMap;
}
/** @enum {number} */
var SelectorFlags = {
    /** Indicates this is the beginning of a new negative selector */
    NOT: 1,
    /** Mode for matching attributes */
    ATTRIBUTE: 2,
    /** Mode for matching tag names */
    ELEMENT: 4,
    /** Mode for matching class names */
    CLASS: 8,
};
/**
 * @param {?} selector
 * @return {?}
 */
function parserSelectorToSimpleSelector(selector) {
    var /** @type {?} */ classes = selector.classNames && selector.classNames.length ? [8 /* CLASS */].concat(selector.classNames) :
        [];
    var /** @type {?} */ elementName = selector.element && selector.element !== '*' ? selector.element : '';
    return [elementName].concat(selector.attrs, classes);
}
/**
 * @param {?} selector
 * @return {?}
 */
function parserSelectorToNegativeSelector(selector) {
    var /** @type {?} */ classes = selector.classNames && selector.classNames.length ? [8 /* CLASS */].concat(selector.classNames) :
        [];
    if (selector.element) {
        return [
            1 /* NOT */ | 4 /* ELEMENT */, selector.element
        ].concat(selector.attrs, classes);
    }
    else if (selector.attrs.length) {
        return [1 /* NOT */ | 2 /* ATTRIBUTE */].concat(selector.attrs, classes);
    }
    else {
        return selector.classNames && selector.classNames.length ? [1 /* NOT */ | 8 /* CLASS */].concat(selector.classNames) :
            [];
    }
}
/**
 * @param {?} selector
 * @return {?}
 */
function parserSelectorToR3Selector(selector) {
    var /** @type {?} */ positive = parserSelectorToSimpleSelector(selector);
    var /** @type {?} */ negative = selector.notSelectors && selector.notSelectors.length ?
        selector.notSelectors.map(function (notSelector) { return parserSelectorToNegativeSelector(notSelector); }) :
        [];
    return positive.concat.apply(positive, negative);
}
/**
 * @param {?} selector
 * @return {?}
 */
function parseSelectorToR3Selector(selector) {
    var /** @type {?} */ selectors = CssSelector.parse(selector);
    return selectors.map(parserSelectorToR3Selector);
}
/**
 * @param {?} value
 * @return {?}
 */
function asLiteral(value) {
    if (Array.isArray(value)) {
        return o.literalArr(value.map(asLiteral));
    }
    return o.literal(value, o.INFERRED_TYPE);
}
/**
 * @param {?} map
 * @param {?=} quoted
 * @return {?}
 */
function mapToExpression(map, quoted) {
    if (quoted === void 0) { quoted = false; }
    return o.literalMap(Object.getOwnPropertyNames(map).map(function (key) { return ({ key: key, quoted: quoted, value: asLiteral(map[key]) }); }));
}
/**
 * @param {?=} i18n
 * @return {?}
 */
function parseI18nMeta(i18n) {
    var /** @type {?} */ meaning;
    var /** @type {?} */ description;
    var /** @type {?} */ id;
    if (i18n) {
        // TODO(vicb): figure out how to force a message ID with closure ?
        var /** @type {?} */ idIndex = i18n.indexOf(ID_SEPARATOR);
        var /** @type {?} */ descIndex = i18n.indexOf(MEANING_SEPARATOR);
        var /** @type {?} */ meaningAndDesc = void 0;
        _a = (idIndex > -1) ? [i18n.slice(0, idIndex), i18n.slice(idIndex + 2)] : [i18n, ''], meaningAndDesc = _a[0], id = _a[1];
        _b = (descIndex > -1) ?
            [meaningAndDesc.slice(0, descIndex), meaningAndDesc.slice(descIndex + 1)] :
            ['', meaningAndDesc], meaning = _b[0], description = _b[1];
    }
    return { description: description, id: id, meaning: meaning };
    var _a, _b;
}
var _a;
//# sourceMappingURL=r3_view_compiler.js.map