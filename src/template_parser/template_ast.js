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
        define("@angular/compiler/src/template_parser/template_ast", ["require", "exports", "tslib"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require("tslib");
    /**
     * A segment of text within the template.
     */
    var TextAst = /** @class */ (function () {
        function TextAst(value, ngContentIndex, sourceSpan) {
            this.value = value;
            this.ngContentIndex = ngContentIndex;
            this.sourceSpan = sourceSpan;
        }
        TextAst.prototype.visit = function (visitor, context) { return visitor.visitText(this, context); };
        return TextAst;
    }());
    exports.TextAst = TextAst;
    /**
     * A bound expression within the text of a template.
     */
    var BoundTextAst = /** @class */ (function () {
        function BoundTextAst(value, ngContentIndex, sourceSpan) {
            this.value = value;
            this.ngContentIndex = ngContentIndex;
            this.sourceSpan = sourceSpan;
        }
        BoundTextAst.prototype.visit = function (visitor, context) {
            return visitor.visitBoundText(this, context);
        };
        return BoundTextAst;
    }());
    exports.BoundTextAst = BoundTextAst;
    /**
     * A plain attribute on an element.
     */
    var AttrAst = /** @class */ (function () {
        function AttrAst(name, value, sourceSpan) {
            this.name = name;
            this.value = value;
            this.sourceSpan = sourceSpan;
        }
        AttrAst.prototype.visit = function (visitor, context) { return visitor.visitAttr(this, context); };
        return AttrAst;
    }());
    exports.AttrAst = AttrAst;
    var PropertyBindingType;
    (function (PropertyBindingType) {
        // A normal binding to a property (e.g. `[property]="expression"`).
        PropertyBindingType[PropertyBindingType["Property"] = 0] = "Property";
        // A binding to an element attribute (e.g. `[attr.name]="expression"`).
        PropertyBindingType[PropertyBindingType["Attribute"] = 1] = "Attribute";
        // A binding to a CSS class (e.g. `[class.name]="condition"`).
        PropertyBindingType[PropertyBindingType["Class"] = 2] = "Class";
        // A binding to a style rule (e.g. `[style.rule]="expression"`).
        PropertyBindingType[PropertyBindingType["Style"] = 3] = "Style";
        // A binding to an animation reference (e.g. `[animate.key]="expression"`).
        PropertyBindingType[PropertyBindingType["Animation"] = 4] = "Animation";
    })(PropertyBindingType = exports.PropertyBindingType || (exports.PropertyBindingType = {}));
    var BoundPropertyMapping = (_a = {},
        _a[4 /* Animation */] = PropertyBindingType.Animation,
        _a[1 /* Attribute */] = PropertyBindingType.Attribute,
        _a[2 /* Class */] = PropertyBindingType.Class,
        _a[0 /* Property */] = PropertyBindingType.Property,
        _a[3 /* Style */] = PropertyBindingType.Style,
        _a);
    /**
     * A binding for an element property (e.g. `[property]="expression"`) or an animation trigger (e.g.
     * `[@trigger]="stateExp"`)
     */
    var BoundElementPropertyAst = /** @class */ (function () {
        function BoundElementPropertyAst(name, type, securityContext, value, unit, sourceSpan) {
            this.name = name;
            this.type = type;
            this.securityContext = securityContext;
            this.value = value;
            this.unit = unit;
            this.sourceSpan = sourceSpan;
            this.isAnimation = this.type === PropertyBindingType.Animation;
        }
        BoundElementPropertyAst.fromBoundProperty = function (prop) {
            var type = BoundPropertyMapping[prop.type];
            return new BoundElementPropertyAst(prop.name, type, prop.securityContext, prop.value, prop.unit, prop.sourceSpan);
        };
        BoundElementPropertyAst.prototype.visit = function (visitor, context) {
            return visitor.visitElementProperty(this, context);
        };
        return BoundElementPropertyAst;
    }());
    exports.BoundElementPropertyAst = BoundElementPropertyAst;
    /**
     * A binding for an element event (e.g. `(event)="handler()"`) or an animation trigger event (e.g.
     * `(@trigger.phase)="callback($event)"`).
     */
    var BoundEventAst = /** @class */ (function () {
        function BoundEventAst(name, target, phase, handler, sourceSpan) {
            this.name = name;
            this.target = target;
            this.phase = phase;
            this.handler = handler;
            this.sourceSpan = sourceSpan;
            this.fullName = BoundEventAst.calcFullName(this.name, this.target, this.phase);
            this.isAnimation = !!this.phase;
        }
        BoundEventAst.calcFullName = function (name, target, phase) {
            if (target) {
                return target + ":" + name;
            }
            if (phase) {
                return "@" + name + "." + phase;
            }
            return name;
        };
        BoundEventAst.fromParsedEvent = function (event) {
            var target = event.type === 0 /* Regular */ ? event.targetOrPhase : null;
            var phase = event.type === 1 /* Animation */ ? event.targetOrPhase : null;
            return new BoundEventAst(event.name, target, phase, event.handler, event.sourceSpan);
        };
        BoundEventAst.prototype.visit = function (visitor, context) {
            return visitor.visitEvent(this, context);
        };
        return BoundEventAst;
    }());
    exports.BoundEventAst = BoundEventAst;
    /**
     * A reference declaration on an element (e.g. `let someName="expression"`).
     */
    var ReferenceAst = /** @class */ (function () {
        function ReferenceAst(name, value, originalValue, sourceSpan) {
            this.name = name;
            this.value = value;
            this.originalValue = originalValue;
            this.sourceSpan = sourceSpan;
        }
        ReferenceAst.prototype.visit = function (visitor, context) {
            return visitor.visitReference(this, context);
        };
        return ReferenceAst;
    }());
    exports.ReferenceAst = ReferenceAst;
    /**
     * A variable declaration on a <ng-template> (e.g. `var-someName="someLocalName"`).
     */
    var VariableAst = /** @class */ (function () {
        function VariableAst(name, value, sourceSpan) {
            this.name = name;
            this.value = value;
            this.sourceSpan = sourceSpan;
        }
        VariableAst.fromParsedVariable = function (v) {
            return new VariableAst(v.name, v.value, v.sourceSpan);
        };
        VariableAst.prototype.visit = function (visitor, context) {
            return visitor.visitVariable(this, context);
        };
        return VariableAst;
    }());
    exports.VariableAst = VariableAst;
    /**
     * An element declaration in a template.
     */
    var ElementAst = /** @class */ (function () {
        function ElementAst(name, attrs, inputs, outputs, references, directives, providers, hasViewContainer, queryMatches, children, ngContentIndex, sourceSpan, endSourceSpan) {
            this.name = name;
            this.attrs = attrs;
            this.inputs = inputs;
            this.outputs = outputs;
            this.references = references;
            this.directives = directives;
            this.providers = providers;
            this.hasViewContainer = hasViewContainer;
            this.queryMatches = queryMatches;
            this.children = children;
            this.ngContentIndex = ngContentIndex;
            this.sourceSpan = sourceSpan;
            this.endSourceSpan = endSourceSpan;
        }
        ElementAst.prototype.visit = function (visitor, context) {
            return visitor.visitElement(this, context);
        };
        return ElementAst;
    }());
    exports.ElementAst = ElementAst;
    /**
     * A `<ng-template>` element included in an Angular template.
     */
    var EmbeddedTemplateAst = /** @class */ (function () {
        function EmbeddedTemplateAst(attrs, outputs, references, variables, directives, providers, hasViewContainer, queryMatches, children, ngContentIndex, sourceSpan) {
            this.attrs = attrs;
            this.outputs = outputs;
            this.references = references;
            this.variables = variables;
            this.directives = directives;
            this.providers = providers;
            this.hasViewContainer = hasViewContainer;
            this.queryMatches = queryMatches;
            this.children = children;
            this.ngContentIndex = ngContentIndex;
            this.sourceSpan = sourceSpan;
        }
        EmbeddedTemplateAst.prototype.visit = function (visitor, context) {
            return visitor.visitEmbeddedTemplate(this, context);
        };
        return EmbeddedTemplateAst;
    }());
    exports.EmbeddedTemplateAst = EmbeddedTemplateAst;
    /**
     * A directive property with a bound value (e.g. `*ngIf="condition").
     */
    var BoundDirectivePropertyAst = /** @class */ (function () {
        function BoundDirectivePropertyAst(directiveName, templateName, value, sourceSpan) {
            this.directiveName = directiveName;
            this.templateName = templateName;
            this.value = value;
            this.sourceSpan = sourceSpan;
        }
        BoundDirectivePropertyAst.prototype.visit = function (visitor, context) {
            return visitor.visitDirectiveProperty(this, context);
        };
        return BoundDirectivePropertyAst;
    }());
    exports.BoundDirectivePropertyAst = BoundDirectivePropertyAst;
    /**
     * A directive declared on an element.
     */
    var DirectiveAst = /** @class */ (function () {
        function DirectiveAst(directive, inputs, hostProperties, hostEvents, contentQueryStartId, sourceSpan) {
            this.directive = directive;
            this.inputs = inputs;
            this.hostProperties = hostProperties;
            this.hostEvents = hostEvents;
            this.contentQueryStartId = contentQueryStartId;
            this.sourceSpan = sourceSpan;
        }
        DirectiveAst.prototype.visit = function (visitor, context) {
            return visitor.visitDirective(this, context);
        };
        return DirectiveAst;
    }());
    exports.DirectiveAst = DirectiveAst;
    /**
     * A provider declared on an element
     */
    var ProviderAst = /** @class */ (function () {
        function ProviderAst(token, multiProvider, eager, providers, providerType, lifecycleHooks, sourceSpan, isModule) {
            this.token = token;
            this.multiProvider = multiProvider;
            this.eager = eager;
            this.providers = providers;
            this.providerType = providerType;
            this.lifecycleHooks = lifecycleHooks;
            this.sourceSpan = sourceSpan;
            this.isModule = isModule;
        }
        ProviderAst.prototype.visit = function (visitor, context) {
            // No visit method in the visitor for now...
            return null;
        };
        return ProviderAst;
    }());
    exports.ProviderAst = ProviderAst;
    var ProviderAstType;
    (function (ProviderAstType) {
        ProviderAstType[ProviderAstType["PublicService"] = 0] = "PublicService";
        ProviderAstType[ProviderAstType["PrivateService"] = 1] = "PrivateService";
        ProviderAstType[ProviderAstType["Component"] = 2] = "Component";
        ProviderAstType[ProviderAstType["Directive"] = 3] = "Directive";
        ProviderAstType[ProviderAstType["Builtin"] = 4] = "Builtin";
    })(ProviderAstType = exports.ProviderAstType || (exports.ProviderAstType = {}));
    /**
     * Position where content is to be projected (instance of `<ng-content>` in a template).
     */
    var NgContentAst = /** @class */ (function () {
        function NgContentAst(index, ngContentIndex, sourceSpan) {
            this.index = index;
            this.ngContentIndex = ngContentIndex;
            this.sourceSpan = sourceSpan;
        }
        NgContentAst.prototype.visit = function (visitor, context) {
            return visitor.visitNgContent(this, context);
        };
        return NgContentAst;
    }());
    exports.NgContentAst = NgContentAst;
    /**
     * A visitor that accepts each node but doesn't do anything. It is intended to be used
     * as the base class for a visitor that is only interested in a subset of the node types.
     */
    var NullTemplateVisitor = /** @class */ (function () {
        function NullTemplateVisitor() {
        }
        NullTemplateVisitor.prototype.visitNgContent = function (ast, context) { };
        NullTemplateVisitor.prototype.visitEmbeddedTemplate = function (ast, context) { };
        NullTemplateVisitor.prototype.visitElement = function (ast, context) { };
        NullTemplateVisitor.prototype.visitReference = function (ast, context) { };
        NullTemplateVisitor.prototype.visitVariable = function (ast, context) { };
        NullTemplateVisitor.prototype.visitEvent = function (ast, context) { };
        NullTemplateVisitor.prototype.visitElementProperty = function (ast, context) { };
        NullTemplateVisitor.prototype.visitAttr = function (ast, context) { };
        NullTemplateVisitor.prototype.visitBoundText = function (ast, context) { };
        NullTemplateVisitor.prototype.visitText = function (ast, context) { };
        NullTemplateVisitor.prototype.visitDirective = function (ast, context) { };
        NullTemplateVisitor.prototype.visitDirectiveProperty = function (ast, context) { };
        return NullTemplateVisitor;
    }());
    exports.NullTemplateVisitor = NullTemplateVisitor;
    /**
     * Base class that can be used to build a visitor that visits each node
     * in an template ast recursively.
     */
    var RecursiveTemplateAstVisitor = /** @class */ (function (_super) {
        tslib_1.__extends(RecursiveTemplateAstVisitor, _super);
        function RecursiveTemplateAstVisitor() {
            return _super.call(this) || this;
        }
        // Nodes with children
        RecursiveTemplateAstVisitor.prototype.visitEmbeddedTemplate = function (ast, context) {
            return this.visitChildren(context, function (visit) {
                visit(ast.attrs);
                visit(ast.references);
                visit(ast.variables);
                visit(ast.directives);
                visit(ast.providers);
                visit(ast.children);
            });
        };
        RecursiveTemplateAstVisitor.prototype.visitElement = function (ast, context) {
            return this.visitChildren(context, function (visit) {
                visit(ast.attrs);
                visit(ast.inputs);
                visit(ast.outputs);
                visit(ast.references);
                visit(ast.directives);
                visit(ast.providers);
                visit(ast.children);
            });
        };
        RecursiveTemplateAstVisitor.prototype.visitDirective = function (ast, context) {
            return this.visitChildren(context, function (visit) {
                visit(ast.inputs);
                visit(ast.hostProperties);
                visit(ast.hostEvents);
            });
        };
        RecursiveTemplateAstVisitor.prototype.visitChildren = function (context, cb) {
            var results = [];
            var t = this;
            function visit(children) {
                if (children && children.length)
                    results.push(templateVisitAll(t, children, context));
            }
            cb(visit);
            return [].concat.apply([], results);
        };
        return RecursiveTemplateAstVisitor;
    }(NullTemplateVisitor));
    exports.RecursiveTemplateAstVisitor = RecursiveTemplateAstVisitor;
    /**
     * Visit every node in a list of {@link TemplateAst}s with the given {@link TemplateAstVisitor}.
     */
    function templateVisitAll(visitor, asts, context) {
        if (context === void 0) { context = null; }
        var result = [];
        var visit = visitor.visit ?
            function (ast) { return visitor.visit(ast, context) || ast.visit(visitor, context); } :
            function (ast) { return ast.visit(visitor, context); };
        asts.forEach(function (ast) {
            var astResult = visit(ast);
            if (astResult) {
                result.push(astResult);
            }
        });
        return result;
    }
    exports.templateVisitAll = templateVisitAll;
    var _a;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVtcGxhdGVfYXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXIvc3JjL3RlbXBsYXRlX3BhcnNlci90ZW1wbGF0ZV9hc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7O0lBMEJIOztPQUVHO0lBQ0g7UUFDRSxpQkFDVyxLQUFhLEVBQVMsY0FBc0IsRUFBUyxVQUEyQjtZQUFoRixVQUFLLEdBQUwsS0FBSyxDQUFRO1lBQVMsbUJBQWMsR0FBZCxjQUFjLENBQVE7WUFBUyxlQUFVLEdBQVYsVUFBVSxDQUFpQjtRQUFHLENBQUM7UUFDL0YsdUJBQUssR0FBTCxVQUFNLE9BQTJCLEVBQUUsT0FBWSxJQUFTLE9BQU8sT0FBTyxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3BHLGNBQUM7SUFBRCxDQUFDLEFBSkQsSUFJQztJQUpZLDBCQUFPO0lBTXBCOztPQUVHO0lBQ0g7UUFDRSxzQkFDVyxLQUFVLEVBQVMsY0FBc0IsRUFBUyxVQUEyQjtZQUE3RSxVQUFLLEdBQUwsS0FBSyxDQUFLO1lBQVMsbUJBQWMsR0FBZCxjQUFjLENBQVE7WUFBUyxlQUFVLEdBQVYsVUFBVSxDQUFpQjtRQUFHLENBQUM7UUFDNUYsNEJBQUssR0FBTCxVQUFNLE9BQTJCLEVBQUUsT0FBWTtZQUM3QyxPQUFPLE9BQU8sQ0FBQyxjQUFjLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQy9DLENBQUM7UUFDSCxtQkFBQztJQUFELENBQUMsQUFORCxJQU1DO0lBTlksb0NBQVk7SUFRekI7O09BRUc7SUFDSDtRQUNFLGlCQUFtQixJQUFZLEVBQVMsS0FBYSxFQUFTLFVBQTJCO1lBQXRFLFNBQUksR0FBSixJQUFJLENBQVE7WUFBUyxVQUFLLEdBQUwsS0FBSyxDQUFRO1lBQVMsZUFBVSxHQUFWLFVBQVUsQ0FB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LENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxFQUFFLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDdEMsQ0FBQztRQUNILGtDQUFDO0lBQUQsQ0FBQyxBQTlDRCxDQUFpRCxtQkFBbUIsR0E4Q25FO0lBOUNZLGtFQUEyQjtJQWdEeEM7O09BRUc7SUFDSCwwQkFDSSxPQUEyQixFQUFFLElBQW1CLEVBQUUsT0FBbUI7UUFBbkIsd0JBQUEsRUFBQSxjQUFtQjtRQUN2RSxJQUFNLE1BQU0sR0FBVSxFQUFFLENBQUM7UUFDekIsSUFBTSxLQUFLLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ3pCLFVBQUMsR0FBZ0IsSUFBSyxPQUFBLE9BQU8sQ0FBQyxLQUFPLENBQUMsR0FBRyxFQUFFLE9BQU8sQ0FBQyxJQUFJLEdBQUcsQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxFQUE1RCxDQUE0RCxDQUFDLENBQUM7WUFDcEYsVUFBQyxHQUFnQixJQUFLLE9BQUEsR0FBRyxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDLEVBQTNCLENBQTJCLENBQUM7UUFDdEQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFBLEdBQUc7WUFDZCxJQUFNLFNBQVMsR0FBRyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDN0IsSUFBSSxTQUFTLEVBQUU7Z0JBQ2IsTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQzthQUN4QjtRQUNILENBQUMsQ0FBQyxDQUFDO1FBQ0gsT0FBTyxNQUFNLENBQUM7SUFDaEIsQ0FBQztJQWJELDRDQWFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0FzdFBhdGh9IGZyb20gJy4uL2FzdF9wYXRoJztcbmltcG9ydCB7Q29tcGlsZURpcmVjdGl2ZVN1bW1hcnksIENvbXBpbGVQcm92aWRlck1ldGFkYXRhLCBDb21waWxlVG9rZW5NZXRhZGF0YX0gZnJvbSAnLi4vY29tcGlsZV9tZXRhZGF0YSc7XG5pbXBvcnQge1NlY3VyaXR5Q29udGV4dH0gZnJvbSAnLi4vY29yZSc7XG5pbXBvcnQge0FTVCwgQmluZGluZ1R5cGUsIEJvdW5kRWxlbWVudFByb3BlcnR5LCBQYXJzZWRFdmVudCwgUGFyc2VkRXZlbnRUeXBlLCBQYXJzZWRWYXJpYWJsZX0gZnJvbSAnLi4vZXhwcmVzc2lvbl9wYXJzZXIvYXN0JztcbmltcG9ydCB7TGlmZWN5Y2xlSG9va3N9IGZyb20gJy4uL2xpZmVjeWNsZV9yZWZsZWN0b3InO1xuaW1wb3J0IHtQYXJzZVNvdXJjZVNwYW59IGZyb20gJy4uL3BhcnNlX3V0aWwnO1xuXG5cblxuLyoqXG4gKiBBbiBBYnN0cmFjdCBTeW50YXggVHJlZSBub2RlIHJlcHJlc2VudGluZyBwYXJ0IG9mIGEgcGFyc2VkIEFuZ3VsYXIgdGVtcGxhdGUuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgVGVtcGxhdGVBc3Qge1xuICAvKipcbiAgICogVGhlIHNvdXJjZSBzcGFuIGZyb20gd2hpY2ggdGhpcyBub2RlIHdhcyBwYXJzZWQuXG4gICAqL1xuICBzb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW47XG5cbiAgLyoqXG4gICAqIFZpc2l0IHRoaXMgbm9kZSBhbmQgcG9zc2libHkgdHJhbnNmb3JtIGl0LlxuICAgKi9cbiAgdmlzaXQodmlzaXRvcjogVGVtcGxhdGVBc3RWaXNpdG9yLCBjb250ZXh0OiBhbnkpOiBhbnk7XG59XG5cbi8qKlxuICogQSBzZWdtZW50IG9mIHRleHQgd2l0aGluIHRoZSB0ZW1wbGF0ZS5cbiAqL1xuZXhwb3J0IGNsYXNzIFRleHRBc3QgaW1wbGVtZW50cyBUZW1wbGF0ZUFzdCB7XG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcHVibGljIHZhbHVlOiBzdHJpbmcsIHB1YmxpYyBuZ0NvbnRlbnRJbmRleDogbnVtYmVyLCBwdWJsaWMgc291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFuKSB7fVxuICB2aXNpdCh2aXNpdG9yOiBUZW1wbGF0ZUFzdFZpc2l0b3IsIGNvbnRleHQ6IGFueSk6IGFueSB7IHJldHVybiB2aXNpdG9yLnZpc2l0VGV4dCh0aGlzLCBjb250ZXh0KTsgfVxufVxuXG4vKipcbiAqIEEgYm91bmQgZXhwcmVzc2lvbiB3aXRoaW4gdGhlIHRleHQgb2YgYSB0ZW1wbGF0ZS5cbiAqL1xuZXhwb3J0IGNsYXNzIEJvdW5kVGV4dEFzdCBpbXBsZW1lbnRzIFRlbXBsYXRlQXN0IHtcbiAgY29uc3RydWN0b3IoXG4gICAgICBwdWJsaWMgdmFsdWU6IEFTVCwgcHVibGljIG5nQ29udGVudEluZGV4OiBudW1iZXIsIHB1YmxpYyBzb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4pIHt9XG4gIHZpc2l0KHZpc2l0b3I6IFRlbXBsYXRlQXN0VmlzaXRvciwgY29udGV4dDogYW55KTogYW55IHtcbiAgICByZXR1cm4gdmlzaXRvci52aXNpdEJvdW5kVGV4dCh0aGlzLCBjb250ZXh0KTtcbiAgfVxufVxuXG4vKipcbiAqIEEgcGxhaW4gYXR0cmlidXRlIG9uIGFuIGVsZW1lbnQuXG4gKi9cbmV4cG9ydCBjbGFzcyBBdHRyQXN0IGltcGxlbWVudHMgVGVtcGxhdGVBc3Qge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgbmFtZTogc3RyaW5nLCBwdWJsaWMgdmFsdWU6IHN0cmluZywgcHVibGljIHNvdXJjZVNwYW46IFBhcnNlU291cmNlU3Bhbikge31cbiAgdmlzaXQodmlzaXRvcjogVGVtcGxhdGVBc3RWaXNpdG9yLCBjb250ZXh0OiBhbnkpOiBhbnkgeyByZXR1cm4gdmlzaXRvci52aXNpdEF0dHIodGhpcywgY29udGV4dCk7IH1cbn1cblxuZXhwb3J0IGVudW0gUHJvcGVydHlCaW5kaW5nVHlwZSB7XG4gIC8vIEEgbm9ybWFsIGJpbmRpbmcgdG8gYSBwcm9wZXJ0eSAoZS5nLiBgW3Byb3BlcnR5XT1cImV4cHJlc3Npb25cImApLlxuICBQcm9wZXJ0eSxcbiAgLy8gQSBiaW5kaW5nIHRvIGFuIGVsZW1lbnQgYXR0cmlidXRlIChlLmcuIGBbYXR0ci5uYW1lXT1cImV4cHJlc3Npb25cImApLlxuICBBdHRyaWJ1dGUsXG4gIC8vIEEgYmluZGluZyB0byBhIENTUyBjbGFzcyAoZS5nLiBgW2NsYXNzLm5hbWVdPVwiY29uZGl0aW9uXCJgKS5cbiAgQ2xhc3MsXG4gIC8vIEEgYmluZGluZyB0byBhIHN0eWxlIHJ1bGUgKGUuZy4gYFtzdHlsZS5ydWxlXT1cImV4cHJlc3Npb25cImApLlxuICBTdHlsZSxcbiAgLy8gQSBiaW5kaW5nIHRvIGFuIGFuaW1hdGlvbiByZWZlcmVuY2UgKGUuZy4gYFthbmltYXRlLmtleV09XCJleHByZXNzaW9uXCJgKS5cbiAgQW5pbWF0aW9uLFxufVxuXG5jb25zdCBCb3VuZFByb3BlcnR5TWFwcGluZyA9IHtcbiAgW0JpbmRpbmdUeXBlLkFuaW1hdGlvbl06IFByb3BlcnR5QmluZGluZ1R5cGUuQW5pbWF0aW9uLFxuICBbQmluZGluZ1R5cGUuQXR0cmlidXRlXTogUHJvcGVydHlCaW5kaW5nVHlwZS5BdHRyaWJ1dGUsXG4gIFtCaW5kaW5nVHlwZS5DbGFzc106IFByb3BlcnR5QmluZGluZ1R5cGUuQ2xhc3MsXG4gIFtCaW5kaW5nVHlwZS5Qcm9wZXJ0eV06IFByb3BlcnR5QmluZGluZ1R5cGUuUHJvcGVydHksXG4gIFtCaW5kaW5nVHlwZS5TdHlsZV06IFByb3BlcnR5QmluZGluZ1R5cGUuU3R5bGUsXG59O1xuXG4vKipcbiAqIEEgYmluZGluZyBmb3IgYW4gZWxlbWVudCBwcm9wZXJ0eSAoZS5nLiBgW3Byb3BlcnR5XT1cImV4cHJlc3Npb25cImApIG9yIGFuIGFuaW1hdGlvbiB0cmlnZ2VyIChlLmcuXG4gKiBgW0B0cmlnZ2VyXT1cInN0YXRlRXhwXCJgKVxuICovXG5leHBvcnQgY2xhc3MgQm91bmRFbGVtZW50UHJvcGVydHlBc3QgaW1wbGVtZW50cyBUZW1wbGF0ZUFzdCB7XG4gIHJlYWRvbmx5IGlzQW5pbWF0aW9uOiBib29sZWFuO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcHVibGljIG5hbWU6IHN0cmluZywgcHVibGljIHR5cGU6IFByb3BlcnR5QmluZGluZ1R5cGUsXG4gICAgICBwdWJsaWMgc2VjdXJpdHlDb250ZXh0OiBTZWN1cml0eUNvbnRleHQsIHB1YmxpYyB2YWx1ZTogQVNULCBwdWJsaWMgdW5pdDogc3RyaW5nfG51bGwsXG4gICAgICBwdWJsaWMgc291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFuKSB7XG4gICAgdGhpcy5pc0FuaW1hdGlvbiA9IHRoaXMudHlwZSA9PT0gUHJvcGVydHlCaW5kaW5nVHlwZS5BbmltYXRpb247XG4gIH1cblxuICBzdGF0aWMgZnJvbUJvdW5kUHJvcGVydHkocHJvcDogQm91bmRFbGVtZW50UHJvcGVydHkpIHtcbiAgICBjb25zdCB0eXBlID0gQm91bmRQcm9wZXJ0eU1hcHBpbmdbcHJvcC50eXBlXTtcbiAgICByZXR1cm4gbmV3IEJvdW5kRWxlbWVudFByb3BlcnR5QXN0KFxuICAgICAgICBwcm9wLm5hbWUsIHR5cGUsIHByb3Auc2VjdXJpdHlDb250ZXh0LCBwcm9wLnZhbHVlLCBwcm9wLnVuaXQsIHByb3Auc291cmNlU3Bhbik7XG4gIH1cblxuICB2aXNpdCh2aXNpdG9yOiBUZW1wbGF0ZUFzdFZpc2l0b3IsIGNvbnRleHQ6IGFueSk6IGFueSB7XG4gICAgcmV0dXJuIHZpc2l0b3IudmlzaXRFbGVtZW50UHJvcGVydHkodGhpcywgY29udGV4dCk7XG4gIH1cbn1cblxuLyoqXG4gKiBBIGJpbmRpbmcgZm9yIGFuIGVsZW1lbnQgZXZlbnQgKGUuZy4gYChldmVudCk9XCJoYW5kbGVyKClcImApIG9yIGFuIGFuaW1hdGlvbiB0cmlnZ2VyIGV2ZW50IChlLmcuXG4gKiBgKEB0cmlnZ2VyLnBoYXNlKT1cImNhbGxiYWNrKCRldmVudClcImApLlxuICovXG5leHBvcnQgY2xhc3MgQm91bmRFdmVudEFzdCBpbXBsZW1lbnRzIFRlbXBsYXRlQXN0IHtcbiAgcmVhZG9ubHkgZnVsbE5hbWU6IHN0cmluZztcbiAgcmVhZG9ubHkgaXNBbmltYXRpb246IGJvb2xlYW47XG5cbiAgY29uc3RydWN0b3IoXG4gICAgICBwdWJsaWMgbmFtZTogc3RyaW5nLCBwdWJsaWMgdGFyZ2V0OiBzdHJpbmd8bnVsbCwgcHVibGljIHBoYXNlOiBzdHJpbmd8bnVsbCxcbiAgICAgIHB1YmxpYyBoYW5kbGVyOiBBU1QsIHB1YmxpYyBzb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4pIHtcbiAgICB0aGlzLmZ1bGxOYW1lID0gQm91bmRFdmVudEFzdC5jYWxjRnVsbE5hbWUodGhpcy5uYW1lLCB0aGlzLnRhcmdldCwgdGhpcy5waGFzZSk7XG4gICAgdGhpcy5pc0FuaW1hdGlvbiA9ICEhdGhpcy5waGFzZTtcbiAgfVxuXG4gIHN0YXRpYyBjYWxjRnVsbE5hbWUobmFtZTogc3RyaW5nLCB0YXJnZXQ6IHN0cmluZ3xudWxsLCBwaGFzZTogc3RyaW5nfG51bGwpOiBzdHJpbmcge1xuICAgIGlmICh0YXJnZXQpIHtcbiAgICAgIHJldHVybiBgJHt0YXJnZXR9OiR7bmFtZX1gO1xuICAgIH1cbiAgICBpZiAocGhhc2UpIHtcbiAgICAgIHJldHVybiBgQCR7bmFtZX0uJHtwaGFzZX1gO1xuICAgIH1cblxuICAgIHJldHVybiBuYW1lO1xuICB9XG5cbiAgc3RhdGljIGZyb21QYXJzZWRFdmVudChldmVudDogUGFyc2VkRXZlbnQpIHtcbiAgICBjb25zdCB0YXJnZXQ6IHN0cmluZ3xudWxsID0gZXZlbnQudHlwZSA9PT0gUGFyc2VkRXZlbnRUeXBlLlJlZ3VsYXIgPyBldmVudC50YXJnZXRPclBoYXNlIDogbnVsbDtcbiAgICBjb25zdCBwaGFzZTogc3RyaW5nfG51bGwgPVxuICAgICAgICBldmVudC50eXBlID09PSBQYXJzZWRFdmVudFR5cGUuQW5pbWF0aW9uID8gZXZlbnQudGFyZ2V0T3JQaGFzZSA6IG51bGw7XG4gICAgcmV0dXJuIG5ldyBCb3VuZEV2ZW50QXN0KGV2ZW50Lm5hbWUsIHRhcmdldCwgcGhhc2UsIGV2ZW50LmhhbmRsZXIsIGV2ZW50LnNvdXJjZVNwYW4pO1xuICB9XG5cbiAgdmlzaXQodmlzaXRvcjogVGVtcGxhdGVBc3RWaXNpdG9yLCBjb250ZXh0OiBhbnkpOiBhbnkge1xuICAgIHJldHVybiB2aXNpdG9yLnZpc2l0RXZlbnQodGhpcywgY29udGV4dCk7XG4gIH1cbn1cblxuLyoqXG4gKiBBIHJlZmVyZW5jZSBkZWNsYXJhdGlvbiBvbiBhbiBlbGVtZW50IChlLmcuIGBsZXQgc29tZU5hbWU9XCJleHByZXNzaW9uXCJgKS5cbiAqL1xuZXhwb3J0IGNsYXNzIFJlZmVyZW5jZUFzdCBpbXBsZW1lbnRzIFRlbXBsYXRlQXN0IHtcbiAgY29uc3RydWN0b3IoXG4gICAgICBwdWJsaWMgbmFtZTogc3RyaW5nLCBwdWJsaWMgdmFsdWU6IENvbXBpbGVUb2tlbk1ldGFkYXRhLCBwdWJsaWMgb3JpZ2luYWxWYWx1ZTogc3RyaW5nLFxuICAgICAgcHVibGljIHNvdXJjZVNwYW46IFBhcnNlU291cmNlU3Bhbikge31cbiAgdmlzaXQodmlzaXRvcjogVGVtcGxhdGVBc3RWaXNpdG9yLCBjb250ZXh0OiBhbnkpOiBhbnkge1xuICAgIHJldHVybiB2aXNpdG9yLnZpc2l0UmVmZXJlbmNlKHRoaXMsIGNvbnRleHQpO1xuICB9XG59XG5cbi8qKlxuICogQSB2YXJpYWJsZSBkZWNsYXJhdGlvbiBvbiBhIDxuZy10ZW1wbGF0ZT4gKGUuZy4gYHZhci1zb21lTmFtZT1cInNvbWVMb2NhbE5hbWVcImApLlxuICovXG5leHBvcnQgY2xhc3MgVmFyaWFibGVBc3QgaW1wbGVtZW50cyBUZW1wbGF0ZUFzdCB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBuYW1lOiBzdHJpbmcsIHB1YmxpYyB2YWx1ZTogc3RyaW5nLCBwdWJsaWMgc291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFuKSB7fVxuXG4gIHN0YXRpYyBmcm9tUGFyc2VkVmFyaWFibGUodjogUGFyc2VkVmFyaWFibGUpIHtcbiAgICByZXR1cm4gbmV3IFZhcmlhYmxlQXN0KHYubmFtZSwgdi52YWx1ZSwgdi5zb3VyY2VTcGFuKTtcbiAgfVxuXG4gIHZpc2l0KHZpc2l0b3I6IFRlbXBsYXRlQXN0VmlzaXRvciwgY29udGV4dDogYW55KTogYW55IHtcbiAgICByZXR1cm4gdmlzaXRvci52aXNpdFZhcmlhYmxlKHRoaXMsIGNvbnRleHQpO1xuICB9XG59XG5cbi8qKlxuICogQW4gZWxlbWVudCBkZWNsYXJhdGlvbiBpbiBhIHRlbXBsYXRlLlxuICovXG5leHBvcnQgY2xhc3MgRWxlbWVudEFzdCBpbXBsZW1lbnRzIFRlbXBsYXRlQXN0IHtcbiAgY29uc3RydWN0b3IoXG4gICAgICBwdWJsaWMgbmFtZTogc3RyaW5nLCBwdWJsaWMgYXR0cnM6IEF0dHJBc3RbXSwgcHVibGljIGlucHV0czogQm91bmRFbGVtZW50UHJvcGVydHlBc3RbXSxcbiAgICAgIHB1YmxpYyBvdXRwdXRzOiBCb3VuZEV2ZW50QXN0W10sIHB1YmxpYyByZWZlcmVuY2VzOiBSZWZlcmVuY2VBc3RbXSxcbiAgICAgIHB1YmxpYyBkaXJlY3RpdmVzOiBEaXJlY3RpdmVBc3RbXSwgcHVibGljIHByb3ZpZGVyczogUHJvdmlkZXJBc3RbXSxcbiAgICAgIHB1YmxpYyBoYXNWaWV3Q29udGFpbmVyOiBib29sZWFuLCBwdWJsaWMgcXVlcnlNYXRjaGVzOiBRdWVyeU1hdGNoW10sXG4gICAgICBwdWJsaWMgY2hpbGRyZW46IFRlbXBsYXRlQXN0W10sIHB1YmxpYyBuZ0NvbnRlbnRJbmRleDogbnVtYmVyfG51bGwsXG4gICAgICBwdWJsaWMgc291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFuLCBwdWJsaWMgZW5kU291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFufG51bGwpIHt9XG5cbiAgdmlzaXQodmlzaXRvcjogVGVtcGxhdGVBc3RWaXNpdG9yLCBjb250ZXh0OiBhbnkpOiBhbnkge1xuICAgIHJldHVybiB2aXNpdG9yLnZpc2l0RWxlbWVudCh0aGlzLCBjb250ZXh0KTtcbiAgfVxufVxuXG4vKipcbiAqIEEgYDxuZy10ZW1wbGF0ZT5gIGVsZW1lbnQgaW5jbHVkZWQgaW4gYW4gQW5ndWxhciB0ZW1wbGF0ZS5cbiAqL1xuZXhwb3J0IGNsYXNzIEVtYmVkZGVkVGVtcGxhdGVBc3QgaW1wbGVtZW50cyBUZW1wbGF0ZUFzdCB7XG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcHVibGljIGF0dHJzOiBBdHRyQXN0W10sIHB1YmxpYyBvdXRwdXRzOiBCb3VuZEV2ZW50QXN0W10sIHB1YmxpYyByZWZlcmVuY2VzOiBSZWZlcmVuY2VBc3RbXSxcbiAgICAgIHB1YmxpYyB2YXJpYWJsZXM6IFZhcmlhYmxlQXN0W10sIHB1YmxpYyBkaXJlY3RpdmVzOiBEaXJlY3RpdmVBc3RbXSxcbiAgICAgIHB1YmxpYyBwcm92aWRlcnM6IFByb3ZpZGVyQXN0W10sIHB1YmxpYyBoYXNWaWV3Q29udGFpbmVyOiBib29sZWFuLFxuICAgICAgcHVibGljIHF1ZXJ5TWF0Y2hlczogUXVlcnlNYXRjaFtdLCBwdWJsaWMgY2hpbGRyZW46IFRlbXBsYXRlQXN0W10sXG4gICAgICBwdWJsaWMgbmdDb250ZW50SW5kZXg6IG51bWJlciwgcHVibGljIHNvdXJjZVNwYW46IFBhcnNlU291cmNlU3Bhbikge31cblxuICB2aXNpdCh2aXNpdG9yOiBUZW1wbGF0ZUFzdFZpc2l0b3IsIGNvbnRleHQ6IGFueSk6IGFueSB7XG4gICAgcmV0dXJuIHZpc2l0b3IudmlzaXRFbWJlZGRlZFRlbXBsYXRlKHRoaXMsIGNvbnRleHQpO1xuICB9XG59XG5cbi8qKlxuICogQSBkaXJlY3RpdmUgcHJvcGVydHkgd2l0aCBhIGJvdW5kIHZhbHVlIChlLmcuIGAqbmdJZj1cImNvbmRpdGlvblwiKS5cbiAqL1xuZXhwb3J0IGNsYXNzIEJvdW5kRGlyZWN0aXZlUHJvcGVydHlBc3QgaW1wbGVtZW50cyBUZW1wbGF0ZUFzdCB7XG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcHVibGljIGRpcmVjdGl2ZU5hbWU6IHN0cmluZywgcHVibGljIHRlbXBsYXRlTmFtZTogc3RyaW5nLCBwdWJsaWMgdmFsdWU6IEFTVCxcbiAgICAgIHB1YmxpYyBzb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4pIHt9XG4gIHZpc2l0KHZpc2l0b3I6IFRlbXBsYXRlQXN0VmlzaXRvciwgY29udGV4dDogYW55KTogYW55IHtcbiAgICByZXR1cm4gdmlzaXRvci52aXNpdERpcmVjdGl2ZVByb3BlcnR5KHRoaXMsIGNvbnRleHQpO1xuICB9XG59XG5cbi8qKlxuICogQSBkaXJlY3RpdmUgZGVjbGFyZWQgb24gYW4gZWxlbWVudC5cbiAqL1xuZXhwb3J0IGNsYXNzIERpcmVjdGl2ZUFzdCBpbXBsZW1lbnRzIFRlbXBsYXRlQXN0IHtcbiAgY29uc3RydWN0b3IoXG4gICAgICBwdWJsaWMgZGlyZWN0aXZlOiBDb21waWxlRGlyZWN0aXZlU3VtbWFyeSwgcHVibGljIGlucHV0czogQm91bmREaXJlY3RpdmVQcm9wZXJ0eUFzdFtdLFxuICAgICAgcHVibGljIGhvc3RQcm9wZXJ0aWVzOiBCb3VuZEVsZW1lbnRQcm9wZXJ0eUFzdFtdLCBwdWJsaWMgaG9zdEV2ZW50czogQm91bmRFdmVudEFzdFtdLFxuICAgICAgcHVibGljIGNvbnRlbnRRdWVyeVN0YXJ0SWQ6IG51bWJlciwgcHVibGljIHNvdXJjZVNwYW46IFBhcnNlU291cmNlU3Bhbikge31cbiAgdmlzaXQodmlzaXRvcjogVGVtcGxhdGVBc3RWaXNpdG9yLCBjb250ZXh0OiBhbnkpOiBhbnkge1xuICAgIHJldHVybiB2aXNpdG9yLnZpc2l0RGlyZWN0aXZlKHRoaXMsIGNvbnRleHQpO1xuICB9XG59XG5cbi8qKlxuICogQSBwcm92aWRlciBkZWNsYXJlZCBvbiBhbiBlbGVtZW50XG4gKi9cbmV4cG9ydCBjbGFzcyBQcm92aWRlckFzdCBpbXBsZW1lbnRzIFRlbXBsYXRlQXN0IHtcbiAgY29uc3RydWN0b3IoXG4gICAgICBwdWJsaWMgdG9rZW46IENvbXBpbGVUb2tlbk1ldGFkYXRhLCBwdWJsaWMgbXVsdGlQcm92aWRlcjogYm9vbGVhbiwgcHVibGljIGVhZ2VyOiBib29sZWFuLFxuICAgICAgcHVibGljIHByb3ZpZGVyczogQ29tcGlsZVByb3ZpZGVyTWV0YWRhdGFbXSwgcHVibGljIHByb3ZpZGVyVHlwZTogUHJvdmlkZXJBc3RUeXBlLFxuICAgICAgcHVibGljIGxpZmVjeWNsZUhvb2tzOiBMaWZlY3ljbGVIb29rc1tdLCBwdWJsaWMgc291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFuLFxuICAgICAgcmVhZG9ubHkgaXNNb2R1bGU6IGJvb2xlYW4pIHt9XG5cbiAgdmlzaXQodmlzaXRvcjogVGVtcGxhdGVBc3RWaXNpdG9yLCBjb250ZXh0OiBhbnkpOiBhbnkge1xuICAgIC8vIE5vIHZpc2l0IG1ldGhvZCBpbiB0aGUgdmlzaXRvciBmb3Igbm93Li4uXG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbn1cblxuZXhwb3J0IGVudW0gUHJvdmlkZXJBc3RUeXBlIHtcbiAgUHVibGljU2VydmljZSxcbiAgUHJpdmF0ZVNlcnZpY2UsXG4gIENvbXBvbmVudCxcbiAgRGlyZWN0aXZlLFxuICBCdWlsdGluXG59XG5cbi8qKlxuICogUG9zaXRpb24gd2hlcmUgY29udGVudCBpcyB0byBiZSBwcm9qZWN0ZWQgKGluc3RhbmNlIG9mIGA8bmctY29udGVudD5gIGluIGEgdGVtcGxhdGUpLlxuICovXG5leHBvcnQgY2xhc3MgTmdDb250ZW50QXN0IGltcGxlbWVudHMgVGVtcGxhdGVBc3Qge1xuICBjb25zdHJ1Y3RvcihcbiAgICAgIHB1YmxpYyBpbmRleDogbnVtYmVyLCBwdWJsaWMgbmdDb250ZW50SW5kZXg6IG51bWJlciwgcHVibGljIHNvdXJjZVNwYW46IFBhcnNlU291cmNlU3Bhbikge31cbiAgdmlzaXQodmlzaXRvcjogVGVtcGxhdGVBc3RWaXNpdG9yLCBjb250ZXh0OiBhbnkpOiBhbnkge1xuICAgIHJldHVybiB2aXNpdG9yLnZpc2l0TmdDb250ZW50KHRoaXMsIGNvbnRleHQpO1xuICB9XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgUXVlcnlNYXRjaCB7XG4gIHF1ZXJ5SWQ6IG51bWJlcjtcbiAgdmFsdWU6IENvbXBpbGVUb2tlbk1ldGFkYXRhO1xufVxuXG4vKipcbiAqIEEgdmlzaXRvciBmb3Ige0BsaW5rIFRlbXBsYXRlQXN0fSB0cmVlcyB0aGF0IHdpbGwgcHJvY2VzcyBlYWNoIG5vZGUuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgVGVtcGxhdGVBc3RWaXNpdG9yIHtcbiAgLy8gUmV0dXJuaW5nIGEgdHJ1dGh5IHZhbHVlIGZyb20gYHZpc2l0KClgIHdpbGwgcHJldmVudCBgdGVtcGxhdGVWaXNpdEFsbCgpYCBmcm9tIHRoZSBjYWxsIHRvXG4gIC8vIHRoZSB0eXBlZCBtZXRob2QgYW5kIHJlc3VsdCByZXR1cm5lZCB3aWxsIGJlY29tZSB0aGUgcmVzdWx0IGluY2x1ZGVkIGluIGB2aXNpdEFsbCgpYHNcbiAgLy8gcmVzdWx0IGFycmF5LlxuICB2aXNpdD8oYXN0OiBUZW1wbGF0ZUFzdCwgY29udGV4dDogYW55KTogYW55O1xuXG4gIHZpc2l0TmdDb250ZW50KGFzdDogTmdDb250ZW50QXN0LCBjb250ZXh0OiBhbnkpOiBhbnk7XG4gIHZpc2l0RW1iZWRkZWRUZW1wbGF0ZShhc3Q6IEVtYmVkZGVkVGVtcGxhdGVBc3QsIGNvbnRleHQ6IGFueSk6IGFueTtcbiAgdmlzaXRFbGVtZW50KGFzdDogRWxlbWVudEFzdCwgY29udGV4dDogYW55KTogYW55O1xuICB2aXNpdFJlZmVyZW5jZShhc3Q6IFJlZmVyZW5jZUFzdCwgY29udGV4dDogYW55KTogYW55O1xuICB2aXNpdFZhcmlhYmxlKGFzdDogVmFyaWFibGVBc3QsIGNvbnRleHQ6IGFueSk6IGFueTtcbiAgdmlzaXRFdmVudChhc3Q6IEJvdW5kRXZlbnRBc3QsIGNvbnRleHQ6IGFueSk6IGFueTtcbiAgdmlzaXRFbGVtZW50UHJvcGVydHkoYXN0OiBCb3VuZEVsZW1lbnRQcm9wZXJ0eUFzdCwgY29udGV4dDogYW55KTogYW55O1xuICB2aXNpdEF0dHIoYXN0OiBBdHRyQXN0LCBjb250ZXh0OiBhbnkpOiBhbnk7XG4gIHZpc2l0Qm91bmRUZXh0KGFzdDogQm91bmRUZXh0QXN0LCBjb250ZXh0OiBhbnkpOiBhbnk7XG4gIHZpc2l0VGV4dChhc3Q6IFRleHRBc3QsIGNvbnRleHQ6IGFueSk6IGFueTtcbiAgdmlzaXREaXJlY3RpdmUoYXN0OiBEaXJlY3RpdmVBc3QsIGNvbnRleHQ6IGFueSk6IGFueTtcbiAgdmlzaXREaXJlY3RpdmVQcm9wZXJ0eShhc3Q6IEJvdW5kRGlyZWN0aXZlUHJvcGVydHlBc3QsIGNvbnRleHQ6IGFueSk6IGFueTtcbn1cblxuLyoqXG4gKiBBIHZpc2l0b3IgdGhhdCBhY2NlcHRzIGVhY2ggbm9kZSBidXQgZG9lc24ndCBkbyBhbnl0aGluZy4gSXQgaXMgaW50ZW5kZWQgdG8gYmUgdXNlZFxuICogYXMgdGhlIGJhc2UgY2xhc3MgZm9yIGEgdmlzaXRvciB0aGF0IGlzIG9ubHkgaW50ZXJlc3RlZCBpbiBhIHN1YnNldCBvZiB0aGUgbm9kZSB0eXBlcy5cbiAqL1xuZXhwb3J0IGNsYXNzIE51bGxUZW1wbGF0ZVZpc2l0b3IgaW1wbGVtZW50cyBUZW1wbGF0ZUFzdFZpc2l0b3Ige1xuICB2aXNpdE5nQ29udGVudChhc3Q6IE5nQ29udGVudEFzdCwgY29udGV4dDogYW55KTogdm9pZCB7fVxuICB2aXNpdEVtYmVkZGVkVGVtcGxhdGUoYXN0OiBFbWJlZGRlZFRlbXBsYXRlQXN0LCBjb250ZXh0OiBhbnkpOiB2b2lkIHt9XG4gIHZpc2l0RWxlbWVudChhc3Q6IEVsZW1lbnRBc3QsIGNvbnRleHQ6IGFueSk6IHZvaWQge31cbiAgdmlzaXRSZWZlcmVuY2UoYXN0OiBSZWZlcmVuY2VBc3QsIGNvbnRleHQ6IGFueSk6IHZvaWQge31cbiAgdmlzaXRWYXJpYWJsZShhc3Q6IFZhcmlhYmxlQXN0LCBjb250ZXh0OiBhbnkpOiB2b2lkIHt9XG4gIHZpc2l0RXZlbnQoYXN0OiBCb3VuZEV2ZW50QXN0LCBjb250ZXh0OiBhbnkpOiB2b2lkIHt9XG4gIHZpc2l0RWxlbWVudFByb3BlcnR5KGFzdDogQm91bmRFbGVtZW50UHJvcGVydHlBc3QsIGNvbnRleHQ6IGFueSk6IHZvaWQge31cbiAgdmlzaXRBdHRyKGFzdDogQXR0ckFzdCwgY29udGV4dDogYW55KTogdm9pZCB7fVxuICB2aXNpdEJvdW5kVGV4dChhc3Q6IEJvdW5kVGV4dEFzdCwgY29udGV4dDogYW55KTogdm9pZCB7fVxuICB2aXNpdFRleHQoYXN0OiBUZXh0QXN0LCBjb250ZXh0OiBhbnkpOiB2b2lkIHt9XG4gIHZpc2l0RGlyZWN0aXZlKGFzdDogRGlyZWN0aXZlQXN0LCBjb250ZXh0OiBhbnkpOiB2b2lkIHt9XG4gIHZpc2l0RGlyZWN0aXZlUHJvcGVydHkoYXN0OiBCb3VuZERpcmVjdGl2ZVByb3BlcnR5QXN0LCBjb250ZXh0OiBhbnkpOiB2b2lkIHt9XG59XG5cbi8qKlxuICogQmFzZSBjbGFzcyB0aGF0IGNhbiBiZSB1c2VkIHRvIGJ1aWxkIGEgdmlzaXRvciB0aGF0IHZpc2l0cyBlYWNoIG5vZGVcbiAqIGluIGFuIHRlbXBsYXRlIGFzdCByZWN1cnNpdmVseS5cbiAqL1xuZXhwb3J0IGNsYXNzIFJlY3Vyc2l2ZVRlbXBsYXRlQXN0VmlzaXRvciBleHRlbmRzIE51bGxUZW1wbGF0ZVZpc2l0b3IgaW1wbGVtZW50cyBUZW1wbGF0ZUFzdFZpc2l0b3Ige1xuICBjb25zdHJ1Y3RvcigpIHsgc3VwZXIoKTsgfVxuXG4gIC8vIE5vZGVzIHdpdGggY2hpbGRyZW5cbiAgdmlzaXRFbWJlZGRlZFRlbXBsYXRlKGFzdDogRW1iZWRkZWRUZW1wbGF0ZUFzdCwgY29udGV4dDogYW55KTogYW55IHtcbiAgICByZXR1cm4gdGhpcy52aXNpdENoaWxkcmVuKGNvbnRleHQsIHZpc2l0ID0+IHtcbiAgICAgIHZpc2l0KGFzdC5hdHRycyk7XG4gICAgICB2aXNpdChhc3QucmVmZXJlbmNlcyk7XG4gICAgICB2aXNpdChhc3QudmFyaWFibGVzKTtcbiAgICAgIHZpc2l0KGFzdC5kaXJlY3RpdmVzKTtcbiAgICAgIHZpc2l0KGFzdC5wcm92aWRlcnMpO1xuICAgICAgdmlzaXQoYXN0LmNoaWxkcmVuKTtcbiAgICB9KTtcbiAgfVxuXG4gIHZpc2l0RWxlbWVudChhc3Q6IEVsZW1lbnRBc3QsIGNvbnRleHQ6IGFueSk6IGFueSB7XG4gICAgcmV0dXJuIHRoaXMudmlzaXRDaGlsZHJlbihjb250ZXh0LCB2aXNpdCA9PiB7XG4gICAgICB2aXNpdChhc3QuYXR0cnMpO1xuICAgICAgdmlzaXQoYXN0LmlucHV0cyk7XG4gICAgICB2aXNpdChhc3Qub3V0cHV0cyk7XG4gICAgICB2aXNpdChhc3QucmVmZXJlbmNlcyk7XG4gICAgICB2aXNpdChhc3QuZGlyZWN0aXZlcyk7XG4gICAgICB2aXNpdChhc3QucHJvdmlkZXJzKTtcbiAgICAgIHZpc2l0KGFzdC5jaGlsZHJlbik7XG4gICAgfSk7XG4gIH1cblxuICB2aXNpdERpcmVjdGl2ZShhc3Q6IERpcmVjdGl2ZUFzdCwgY29udGV4dDogYW55KTogYW55IHtcbiAgICByZXR1cm4gdGhpcy52aXNpdENoaWxkcmVuKGNvbnRleHQsIHZpc2l0ID0+IHtcbiAgICAgIHZpc2l0KGFzdC5pbnB1dHMpO1xuICAgICAgdmlzaXQoYXN0Lmhvc3RQcm9wZXJ0aWVzKTtcbiAgICAgIHZpc2l0KGFzdC5ob3N0RXZlbnRzKTtcbiAgICB9KTtcbiAgfVxuXG4gIHByb3RlY3RlZCB2aXNpdENoaWxkcmVuPFQgZXh0ZW5kcyBUZW1wbGF0ZUFzdD4oXG4gICAgICBjb250ZXh0OiBhbnksXG4gICAgICBjYjogKHZpc2l0OiAoPFYgZXh0ZW5kcyBUZW1wbGF0ZUFzdD4oY2hpbGRyZW46IFZbXXx1bmRlZmluZWQpID0+IHZvaWQpKSA9PiB2b2lkKSB7XG4gICAgbGV0IHJlc3VsdHM6IGFueVtdW10gPSBbXTtcbiAgICBsZXQgdCA9IHRoaXM7XG4gICAgZnVuY3Rpb24gdmlzaXQ8VCBleHRlbmRzIFRlbXBsYXRlQXN0PihjaGlsZHJlbjogVFtdIHwgdW5kZWZpbmVkKSB7XG4gICAgICBpZiAoY2hpbGRyZW4gJiYgY2hpbGRyZW4ubGVuZ3RoKSByZXN1bHRzLnB1c2godGVtcGxhdGVWaXNpdEFsbCh0LCBjaGlsZHJlbiwgY29udGV4dCkpO1xuICAgIH1cbiAgICBjYih2aXNpdCk7XG4gICAgcmV0dXJuIFtdLmNvbmNhdC5hcHBseShbXSwgcmVzdWx0cyk7XG4gIH1cbn1cblxuLyoqXG4gKiBWaXNpdCBldmVyeSBub2RlIGluIGEgbGlzdCBvZiB7QGxpbmsgVGVtcGxhdGVBc3R9cyB3aXRoIHRoZSBnaXZlbiB7QGxpbmsgVGVtcGxhdGVBc3RWaXNpdG9yfS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHRlbXBsYXRlVmlzaXRBbGwoXG4gICAgdmlzaXRvcjogVGVtcGxhdGVBc3RWaXNpdG9yLCBhc3RzOiBUZW1wbGF0ZUFzdFtdLCBjb250ZXh0OiBhbnkgPSBudWxsKTogYW55W10ge1xuICBjb25zdCByZXN1bHQ6IGFueVtdID0gW107XG4gIGNvbnN0IHZpc2l0ID0gdmlzaXRvci52aXNpdCA/XG4gICAgICAoYXN0OiBUZW1wbGF0ZUFzdCkgPT4gdmlzaXRvci52aXNpdCAhKGFzdCwgY29udGV4dCkgfHwgYXN0LnZpc2l0KHZpc2l0b3IsIGNvbnRleHQpIDpcbiAgICAgIChhc3Q6IFRlbXBsYXRlQXN0KSA9PiBhc3QudmlzaXQodmlzaXRvciwgY29udGV4dCk7XG4gIGFzdHMuZm9yRWFjaChhc3QgPT4ge1xuICAgIGNvbnN0IGFzdFJlc3VsdCA9IHZpc2l0KGFzdCk7XG4gICAgaWYgKGFzdFJlc3VsdCkge1xuICAgICAgcmVzdWx0LnB1c2goYXN0UmVzdWx0KTtcbiAgICB9XG4gIH0pO1xuICByZXR1cm4gcmVzdWx0O1xufVxuXG5leHBvcnQgdHlwZSBUZW1wbGF0ZUFzdFBhdGggPSBBc3RQYXRoPFRlbXBsYXRlQXN0PjtcbiJdfQ==