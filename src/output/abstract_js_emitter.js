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
        define("@angular/compiler/src/output/abstract_js_emitter", ["require", "exports", "tslib", "@angular/compiler/src/output/abstract_emitter", "@angular/compiler/src/output/output_ast"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require("tslib");
    var abstract_emitter_1 = require("@angular/compiler/src/output/abstract_emitter");
    var o = require("@angular/compiler/src/output/output_ast");
    var AbstractJsEmitterVisitor = /** @class */ (function (_super) {
        tslib_1.__extends(AbstractJsEmitterVisitor, _super);
        function AbstractJsEmitterVisitor() {
            return _super.call(this, false) || this;
        }
        AbstractJsEmitterVisitor.prototype.visitDeclareClassStmt = function (stmt, ctx) {
            var _this = this;
            ctx.pushClass(stmt);
            this._visitClassConstructor(stmt, ctx);
            if (stmt.parent != null) {
                ctx.print(stmt, stmt.name + ".prototype = Object.create(");
                stmt.parent.visitExpression(this, ctx);
                ctx.println(stmt, ".prototype);");
            }
            stmt.getters.forEach(function (getter) { return _this._visitClassGetter(stmt, getter, ctx); });
            stmt.methods.forEach(function (method) { return _this._visitClassMethod(stmt, method, ctx); });
            ctx.popClass();
            return null;
        };
        AbstractJsEmitterVisitor.prototype._visitClassConstructor = function (stmt, ctx) {
            ctx.print(stmt, "function " + stmt.name + "(");
            if (stmt.constructorMethod != null) {
                this._visitParams(stmt.constructorMethod.params, ctx);
            }
            ctx.println(stmt, ") {");
            ctx.incIndent();
            if (stmt.constructorMethod != null) {
                if (stmt.constructorMethod.body.length > 0) {
                    ctx.println(stmt, "var self = this;");
                    this.visitAllStatements(stmt.constructorMethod.body, ctx);
                }
            }
            ctx.decIndent();
            ctx.println(stmt, "}");
        };
        AbstractJsEmitterVisitor.prototype._visitClassGetter = function (stmt, getter, ctx) {
            ctx.println(stmt, "Object.defineProperty(" + stmt.name + ".prototype, '" + getter.name + "', { get: function() {");
            ctx.incIndent();
            if (getter.body.length > 0) {
                ctx.println(stmt, "var self = this;");
                this.visitAllStatements(getter.body, ctx);
            }
            ctx.decIndent();
            ctx.println(stmt, "}});");
        };
        AbstractJsEmitterVisitor.prototype._visitClassMethod = function (stmt, method, ctx) {
            ctx.print(stmt, stmt.name + ".prototype." + method.name + " = function(");
            this._visitParams(method.params, ctx);
            ctx.println(stmt, ") {");
            ctx.incIndent();
            if (method.body.length > 0) {
                ctx.println(stmt, "var self = this;");
                this.visitAllStatements(method.body, ctx);
            }
            ctx.decIndent();
            ctx.println(stmt, "};");
        };
        AbstractJsEmitterVisitor.prototype.visitWrappedNodeExpr = function (ast, ctx) {
            throw new Error('Cannot emit a WrappedNodeExpr in Javascript.');
        };
        AbstractJsEmitterVisitor.prototype.visitReadVarExpr = function (ast, ctx) {
            if (ast.builtin === o.BuiltinVar.This) {
                ctx.print(ast, 'self');
            }
            else if (ast.builtin === o.BuiltinVar.Super) {
                throw new Error("'super' needs to be handled at a parent ast node, not at the variable level!");
            }
            else {
                _super.prototype.visitReadVarExpr.call(this, ast, ctx);
            }
            return null;
        };
        AbstractJsEmitterVisitor.prototype.visitDeclareVarStmt = function (stmt, ctx) {
            ctx.print(stmt, "var " + stmt.name);
            if (stmt.value) {
                ctx.print(stmt, ' = ');
                stmt.value.visitExpression(this, ctx);
            }
            ctx.println(stmt, ";");
            return null;
        };
        AbstractJsEmitterVisitor.prototype.visitCastExpr = function (ast, ctx) {
            ast.value.visitExpression(this, ctx);
            return null;
        };
        AbstractJsEmitterVisitor.prototype.visitInvokeFunctionExpr = function (expr, ctx) {
            var fnExpr = expr.fn;
            if (fnExpr instanceof o.ReadVarExpr && fnExpr.builtin === o.BuiltinVar.Super) {
                ctx.currentClass.parent.visitExpression(this, ctx);
                ctx.print(expr, ".call(this");
                if (expr.args.length > 0) {
                    ctx.print(expr, ", ");
                    this.visitAllExpressions(expr.args, ctx, ',');
                }
                ctx.print(expr, ")");
            }
            else {
                _super.prototype.visitInvokeFunctionExpr.call(this, expr, ctx);
            }
            return null;
        };
        AbstractJsEmitterVisitor.prototype.visitFunctionExpr = function (ast, ctx) {
            ctx.print(ast, "function" + (ast.name ? ' ' + ast.name : '') + "(");
            this._visitParams(ast.params, ctx);
            ctx.println(ast, ") {");
            ctx.incIndent();
            this.visitAllStatements(ast.statements, ctx);
            ctx.decIndent();
            ctx.print(ast, "}");
            return null;
        };
        AbstractJsEmitterVisitor.prototype.visitDeclareFunctionStmt = function (stmt, ctx) {
            ctx.print(stmt, "function " + stmt.name + "(");
            this._visitParams(stmt.params, ctx);
            ctx.println(stmt, ") {");
            ctx.incIndent();
            this.visitAllStatements(stmt.statements, ctx);
            ctx.decIndent();
            ctx.println(stmt, "}");
            return null;
        };
        AbstractJsEmitterVisitor.prototype.visitTryCatchStmt = function (stmt, ctx) {
            ctx.println(stmt, "try {");
            ctx.incIndent();
            this.visitAllStatements(stmt.bodyStmts, ctx);
            ctx.decIndent();
            ctx.println(stmt, "} catch (" + abstract_emitter_1.CATCH_ERROR_VAR.name + ") {");
            ctx.incIndent();
            var catchStmts = [abstract_emitter_1.CATCH_STACK_VAR.set(abstract_emitter_1.CATCH_ERROR_VAR.prop('stack')).toDeclStmt(null, [
                    o.StmtModifier.Final
                ])].concat(stmt.catchStmts);
            this.visitAllStatements(catchStmts, ctx);
            ctx.decIndent();
            ctx.println(stmt, "}");
            return null;
        };
        AbstractJsEmitterVisitor.prototype.visitLocalizedString = function (ast, ctx) {
            var _this = this;
            // The following convoluted piece of code is effectively the downlevelled equivalent of
            // ```
            // $localize `...`
            // ```
            // which is effectively like:
            // ```
            // $localize(__makeTemplateObject(cooked, raw), expression1, expression2, ...);
            // ```
            //
            // The `$localize` function expects a "template object", which is an array of "cooked" strings
            // plus a `raw` property that contains an array of "raw" strings.
            //
            // In some environments a helper function called `__makeTemplateObject(cooked, raw)` might be
            // available, in which case we use that. Otherwise we must create our own helper function
            // inline.
            //
            // In the inline function, if `Object.defineProperty` is available we use that to attach the
            // `raw` array.
            ctx.print(ast, '$localize((this&&this.__makeTemplateObject||function(e,t){return Object.defineProperty?Object.defineProperty(e,"raw",{value:t}):e.raw=t,e})(');
            var parts = [ast.serializeI18nHead()];
            for (var i = 1; i < ast.messageParts.length; i++) {
                parts.push(ast.serializeI18nTemplatePart(i));
            }
            ctx.print(ast, "[" + parts.map(function (part) { return abstract_emitter_1.escapeIdentifier(part.cooked, false); }).join(', ') + "], ");
            ctx.print(ast, "[" + parts.map(function (part) { return abstract_emitter_1.escapeIdentifier(part.raw, false); }).join(', ') + "])");
            ast.expressions.forEach(function (expression) {
                ctx.print(ast, ', ');
                expression.visitExpression(_this, ctx);
            });
            ctx.print(ast, ')');
            return null;
        };
        AbstractJsEmitterVisitor.prototype._visitParams = function (params, ctx) {
            this.visitAllObjects(function (param) { return ctx.print(null, param.name); }, params, ctx, ',');
        };
        AbstractJsEmitterVisitor.prototype.getBuiltinMethodName = function (method) {
            var name;
            switch (method) {
                case o.BuiltinMethod.ConcatArray:
                    name = 'concat';
                    break;
                case o.BuiltinMethod.SubscribeObservable:
                    name = 'subscribe';
                    break;
                case o.BuiltinMethod.Bind:
                    name = 'bind';
                    break;
                default:
                    throw new Error("Unknown builtin method: " + method);
            }
            return name;
        };
        return AbstractJsEmitterVisitor;
    }(abstract_emitter_1.AbstractEmitterVisitor));
    exports.AbstractJsEmitterVisitor = AbstractJsEmitterVisitor;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWJzdHJhY3RfanNfZW1pdHRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyL3NyYy9vdXRwdXQvYWJzdHJhY3RfanNfZW1pdHRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7SUFHSCxrRkFBcUk7SUFDckksMkRBQWtDO0lBRWxDO1FBQXVELG9EQUFzQjtRQUMzRTttQkFBZ0Isa0JBQU0sS0FBSyxDQUFDO1FBQUUsQ0FBQztRQUMvQix3REFBcUIsR0FBckIsVUFBc0IsSUFBaUIsRUFBRSxHQUEwQjtZQUFuRSxpQkFhQztZQVpDLEdBQUcsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDcEIsSUFBSSxDQUFDLHNCQUFzQixDQUFDLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQztZQUV2QyxJQUFJLElBQUksQ0FBQyxNQUFNLElBQUksSUFBSSxFQUFFO2dCQUN2QixHQUFHLENBQUMsS0FBSyxDQUFDLElBQUksRUFBSyxJQUFJLENBQUMsSUFBSSxnQ0FBNkIsQ0FBQyxDQUFDO2dCQUMzRCxJQUFJLENBQUMsTUFBTSxDQUFDLGVBQWUsQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUM7Z0JBQ3ZDLEdBQUcsQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLGNBQWMsQ0FBQyxDQUFDO2FBQ25DO1lBQ0QsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsVUFBQyxNQUFNLElBQUssT0FBQSxLQUFJLENBQUMsaUJBQWlCLENBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxHQUFHLENBQUMsRUFBekMsQ0FBeUMsQ0FBQyxDQUFDO1lBQzVFLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLFVBQUMsTUFBTSxJQUFLLE9BQUEsS0FBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsR0FBRyxDQUFDLEVBQXpD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LE1BQU0sRUFBRTtnQkFDZCxLQUFLLENBQUMsQ0FBQyxhQUFhLENBQUMsV0FBVztvQkFDOUIsSUFBSSxHQUFHLFFBQVEsQ0FBQztvQkFDaEIsTUFBTTtnQkFDUixLQUFLLENBQUMsQ0FBQyxhQUFhLENBQUMsbUJBQW1CO29CQUN0QyxJQUFJLEdBQUcsV0FBVyxDQUFDO29CQUNuQixNQUFNO2dCQUNSLEtBQUssQ0FBQyxDQUFDLGFBQWEsQ0FBQyxJQUFJO29CQUN2QixJQUFJLEdBQUcsTUFBTSxDQUFDO29CQUNkLE1BQU07Z0JBQ1I7b0JBQ0UsTUFBTSxJQUFJLEtBQUssQ0FBQyw2QkFBMkIsTUFBUSxDQUFDLENBQUM7YUFDeEQ7WUFDRCxPQUFPLElBQUksQ0FBQztRQUNkLENBQUM7UUFDSCwrQkFBQztJQUFELENBQUMsQUFyTUQsQ0FBdUQseUNBQXNCLEdBcU01RTtJQXJNcUIsNERBQXdCIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5cbmltcG9ydCB7QWJzdHJhY3RFbWl0dGVyVmlzaXRvciwgQ0FUQ0hfRVJST1JfVkFSLCBDQVRDSF9TVEFDS19WQVIsIEVtaXR0ZXJWaXNpdG9yQ29udGV4dCwgZXNjYXBlSWRlbnRpZmllcn0gZnJvbSAnLi9hYnN0cmFjdF9lbWl0dGVyJztcbmltcG9ydCAqIGFzIG8gZnJvbSAnLi9vdXRwdXRfYXN0JztcblxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIEFic3RyYWN0SnNFbWl0dGVyVmlzaXRvciBleHRlbmRzIEFic3RyYWN0RW1pdHRlclZpc2l0b3Ige1xuICBjb25zdHJ1Y3RvcigpIHsgc3VwZXIoZmFsc2UpOyB9XG4gIHZpc2l0RGVjbGFyZUNsYXNzU3RtdChzdG10OiBvLkNsYXNzU3RtdCwgY3R4OiBFbWl0dGVyVmlzaXRvckNvbnRleHQpOiBhbnkge1xuICAgIGN0eC5wdXNoQ2xhc3Moc3RtdCk7XG4gICAgdGhpcy5fdmlzaXRDbGFzc0NvbnN0cnVjdG9yKHN0bXQsIGN0eCk7XG5cbiAgICBpZiAoc3RtdC5wYXJlbnQgIT0gbnVsbCkge1xuICAgICAgY3R4LnByaW50KHN0bXQsIGAke3N0bXQubmFtZX0ucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShgKTtcbiAgICAgIHN0bXQucGFyZW50LnZpc2l0RXhwcmVzc2lvbih0aGlzLCBjdHgpO1xuICAgICAgY3R4LnByaW50bG4oc3RtdCwgYC5wcm90b3R5cGUpO2ApO1xuICAgIH1cbiAgICBzdG10LmdldHRlcnMuZm9yRWFjaCgoZ2V0dGVyKSA9PiB0aGlzLl92aXNpdENsYXNzR2V0dGVyKHN0bXQsIGdldHRlciwgY3R4KSk7XG4gICAgc3RtdC5tZXRob2RzLmZvckVhY2goKG1ldGhvZCkgPT4gdGhpcy5fdmlzaXRDbGFzc01ldGhvZChzdG10LCBtZXRob2QsIGN0eCkpO1xuICAgIGN0eC5wb3BDbGFzcygpO1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgcHJpdmF0ZSBfdmlzaXRDbGFzc0NvbnN0cnVjdG9yKHN0bXQ6IG8uQ2xhc3NTdG10LCBjdHg6IEVtaXR0ZXJWaXNpdG9yQ29udGV4dCkge1xuICAgIGN0eC5wcmludChzdG10LCBgZnVuY3Rpb24gJHtzdG10Lm5hbWV9KGApO1xuICAgIGlmIChzdG10LmNvbnN0cnVjdG9yTWV0aG9kICE9IG51bGwpIHtcbiAgICAgIHRoaXMuX3Zpc2l0UGFyYW1zKHN0bXQuY29uc3RydWN0b3JNZXRob2QucGFyYW1zLCBjdHgpO1xuICAgIH1cbiAgICBjdHgucHJpbnRsbihzdG10LCBgKSB7YCk7XG4gICAgY3R4LmluY0luZGVudCgpO1xuICAgIGlmIChzdG10LmNvbnN0cnVjdG9yTWV0aG9kICE9IG51bGwpIHtcbiAgICAgIGlmIChzdG10LmNvbnN0cnVjdG9yTWV0aG9kLmJvZHkubGVuZ3RoID4gMCkge1xuICAgICAgICBjdHgucHJpbnRsbihzdG10LCBgdmFyIHNlbGYgPSB0aGlzO2ApO1xuICAgICAgICB0aGlzLnZpc2l0QWxsU3RhdGVtZW50cyhzdG10LmNvbnN0cnVjdG9yTWV0aG9kLmJvZHksIGN0eCk7XG4gICAgICB9XG4gICAgfVxuICAgIGN0eC5kZWNJbmRlbnQoKTtcbiAgICBjdHgucHJpbnRsbihzdG10LCBgfWApO1xuICB9XG5cbiAgcHJpdmF0ZSBfdmlzaXRDbGFzc0dldHRlcihzdG10OiBvLkNsYXNzU3RtdCwgZ2V0dGVyOiBvLkNsYXNzR2V0dGVyLCBjdHg6IEVtaXR0ZXJWaXNpdG9yQ29udGV4dCkge1xuICAgIGN0eC5wcmludGxuKFxuICAgICAgICBzdG10LFxuICAgICAgICBgT2JqZWN0LmRlZmluZVByb3BlcnR5KCR7c3RtdC5uYW1lfS5wcm90b3R5cGUsICcke2dldHRlci5uYW1lfScsIHsgZ2V0OiBmdW5jdGlvbigpIHtgKTtcbiAgICBjdHguaW5jSW5kZW50KCk7XG4gICAgaWYgKGdldHRlci5ib2R5Lmxlbmd0aCA+IDApIHtcbiAgICAgIGN0eC5wcmludGxuKHN0bXQsIGB2YXIgc2VsZiA9IHRoaXM7YCk7XG4gICAgICB0aGlzLnZpc2l0QWxsU3RhdGVtZW50cyhnZXR0ZXIuYm9keSwgY3R4KTtcbiAgICB9XG4gICAgY3R4LmRlY0luZGVudCgpO1xuICAgIGN0eC5wcmludGxuKHN0bXQsIGB9fSk7YCk7XG4gIH1cblxuICBwcml2YXRlIF92aXNpdENsYXNzTWV0aG9kKHN0bXQ6IG8uQ2xhc3NTdG10LCBtZXRob2Q6IG8uQ2xhc3NNZXRob2QsIGN0eDogRW1pdHRlclZpc2l0b3JDb250ZXh0KSB7XG4gICAgY3R4LnByaW50KHN0bXQsIGAke3N0bXQubmFtZX0ucHJvdG90eXBlLiR7bWV0aG9kLm5hbWV9ID0gZnVuY3Rpb24oYCk7XG4gICAgdGhpcy5fdmlzaXRQYXJhbXMobWV0aG9kLnBhcmFtcywgY3R4KTtcbiAgICBjdHgucHJpbnRsbihzdG10LCBgKSB7YCk7XG4gICAgY3R4LmluY0luZGVudCgpO1xuICAgIGlmIChtZXRob2QuYm9keS5sZW5ndGggPiAwKSB7XG4gICAgICBjdHgucHJpbnRsbihzdG10LCBgdmFyIHNlbGYgPSB0aGlzO2ApO1xuICAgICAgdGhpcy52aXNpdEFsbFN0YXRlbWVudHMobWV0aG9kLmJvZHksIGN0eCk7XG4gICAgfVxuICAgIGN0eC5kZWNJbmRlbnQoKTtcbiAgICBjdHgucHJpbnRsbihzdG10LCBgfTtgKTtcbiAgfVxuXG4gIHZpc2l0V3JhcHBlZE5vZGVFeHByKGFzdDogby5XcmFwcGVkTm9kZUV4cHI8YW55PiwgY3R4OiBFbWl0dGVyVmlzaXRvckNvbnRleHQpOiBhbnkge1xuICAgIHRocm93IG5ldyBFcnJvcignQ2Fubm90IGVtaXQgYSBXcmFwcGVkTm9kZUV4cHIgaW4gSmF2YXNjcmlwdC4nKTtcbiAgfVxuXG4gIHZpc2l0UmVhZFZhckV4cHIoYXN0OiBvLlJlYWRWYXJFeHByLCBjdHg6IEVtaXR0ZXJWaXNpdG9yQ29udGV4dCk6IHN0cmluZ3xudWxsIHtcbiAgICBpZiAoYXN0LmJ1aWx0aW4gPT09IG8uQnVpbHRpblZhci5UaGlzKSB7XG4gICAgICBjdHgucHJpbnQoYXN0LCAnc2VsZicpO1xuICAgIH0gZWxzZSBpZiAoYXN0LmJ1aWx0aW4gPT09IG8uQnVpbHRpblZhci5TdXBlcikge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgIGAnc3VwZXInIG5lZWRzIHRvIGJlIGhhbmRsZWQgYXQgYSBwYXJlbnQgYXN0IG5vZGUsIG5vdCBhdCB0aGUgdmFyaWFibGUgbGV2ZWwhYCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHN1cGVyLnZpc2l0UmVhZFZhckV4cHIoYXN0LCBjdHgpO1xuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICB2aXNpdERlY2xhcmVWYXJTdG10KHN0bXQ6IG8uRGVjbGFyZVZhclN0bXQsIGN0eDogRW1pdHRlclZpc2l0b3JDb250ZXh0KTogYW55IHtcbiAgICBjdHgucHJpbnQoc3RtdCwgYHZhciAke3N0bXQubmFtZX1gKTtcbiAgICBpZiAoc3RtdC52YWx1ZSkge1xuICAgICAgY3R4LnByaW50KHN0bXQsICcgPSAnKTtcbiAgICAgIHN0bXQudmFsdWUudmlzaXRFeHByZXNzaW9uKHRoaXMsIGN0eCk7XG4gICAgfVxuICAgIGN0eC5wcmludGxuKHN0bXQsIGA7YCk7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgdmlzaXRDYXN0RXhwcihhc3Q6IG8uQ2FzdEV4cHIsIGN0eDogRW1pdHRlclZpc2l0b3JDb250ZXh0KTogYW55IHtcbiAgICBhc3QudmFsdWUudmlzaXRFeHByZXNzaW9uKHRoaXMsIGN0eCk7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgdmlzaXRJbnZva2VGdW5jdGlvbkV4cHIoZXhwcjogby5JbnZva2VGdW5jdGlvbkV4cHIsIGN0eDogRW1pdHRlclZpc2l0b3JDb250ZXh0KTogc3RyaW5nfG51bGwge1xuICAgIGNvbnN0IGZuRXhwciA9IGV4cHIuZm47XG4gICAgaWYgKGZuRXhwciBpbnN0YW5jZW9mIG8uUmVhZFZhckV4cHIgJiYgZm5FeHByLmJ1aWx0aW4gPT09IG8uQnVpbHRpblZhci5TdXBlcikge1xuICAgICAgY3R4LmN1cnJlbnRDbGFzcyAhLnBhcmVudCAhLnZpc2l0RXhwcmVzc2lvbih0aGlzLCBjdHgpO1xuICAgICAgY3R4LnByaW50KGV4cHIsIGAuY2FsbCh0aGlzYCk7XG4gICAgICBpZiAoZXhwci5hcmdzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgY3R4LnByaW50KGV4cHIsIGAsIGApO1xuICAgICAgICB0aGlzLnZpc2l0QWxsRXhwcmVzc2lvbnMoZXhwci5hcmdzLCBjdHgsICcsJyk7XG4gICAgICB9XG4gICAgICBjdHgucHJpbnQoZXhwciwgYClgKTtcbiAgICB9IGVsc2Uge1xuICAgICAgc3VwZXIudmlzaXRJbnZva2VGdW5jdGlvbkV4cHIoZXhwciwgY3R4KTtcbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgdmlzaXRGdW5jdGlvbkV4cHIoYXN0OiBvLkZ1bmN0aW9uRXhwciwgY3R4OiBFbWl0dGVyVmlzaXRvckNvbnRleHQpOiBhbnkge1xuICAgIGN0eC5wcmludChhc3QsIGBmdW5jdGlvbiR7YXN0Lm5hbWUgPyAnICcgKyBhc3QubmFtZSA6ICcnfShgKTtcbiAgICB0aGlzLl92aXNpdFBhcmFtcyhhc3QucGFyYW1zLCBjdHgpO1xuICAgIGN0eC5wcmludGxuKGFzdCwgYCkge2ApO1xuICAgIGN0eC5pbmNJbmRlbnQoKTtcbiAgICB0aGlzLnZpc2l0QWxsU3RhdGVtZW50cyhhc3Quc3RhdGVtZW50cywgY3R4KTtcbiAgICBjdHguZGVjSW5kZW50KCk7XG4gICAgY3R4LnByaW50KGFzdCwgYH1gKTtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICB2aXNpdERlY2xhcmVGdW5jdGlvblN0bXQoc3RtdDogby5EZWNsYXJlRnVuY3Rpb25TdG10LCBjdHg6IEVtaXR0ZXJWaXNpdG9yQ29udGV4dCk6IGFueSB7XG4gICAgY3R4LnByaW50KHN0bXQsIGBmdW5jdGlvbiAke3N0bXQubmFtZX0oYCk7XG4gICAgdGhpcy5fdmlzaXRQYXJhbXMoc3RtdC5wYXJhbXMsIGN0eCk7XG4gICAgY3R4LnByaW50bG4oc3RtdCwgYCkge2ApO1xuICAgIGN0eC5pbmNJbmRlbnQoKTtcbiAgICB0aGlzLnZpc2l0QWxsU3RhdGVtZW50cyhzdG10LnN0YXRlbWVudHMsIGN0eCk7XG4gICAgY3R4LmRlY0luZGVudCgpO1xuICAgIGN0eC5wcmludGxuKHN0bXQsIGB9YCk7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgdmlzaXRUcnlDYXRjaFN0bXQoc3RtdDogby5UcnlDYXRjaFN0bXQsIGN0eDogRW1pdHRlclZpc2l0b3JDb250ZXh0KTogYW55IHtcbiAgICBjdHgucHJpbnRsbihzdG10LCBgdHJ5IHtgKTtcbiAgICBjdHguaW5jSW5kZW50KCk7XG4gICAgdGhpcy52aXNpdEFsbFN0YXRlbWVudHMoc3RtdC5ib2R5U3RtdHMsIGN0eCk7XG4gICAgY3R4LmRlY0luZGVudCgpO1xuICAgIGN0eC5wcmludGxuKHN0bXQsIGB9IGNhdGNoICgke0NBVENIX0VSUk9SX1ZBUi5uYW1lfSkge2ApO1xuICAgIGN0eC5pbmNJbmRlbnQoKTtcbiAgICBjb25zdCBjYXRjaFN0bXRzID1cbiAgICAgICAgWzxvLlN0YXRlbWVudD5DQVRDSF9TVEFDS19WQVIuc2V0KENBVENIX0VSUk9SX1ZBUi5wcm9wKCdzdGFjaycpKS50b0RlY2xTdG10KG51bGwsIFtcbiAgICAgICAgICBvLlN0bXRNb2RpZmllci5GaW5hbFxuICAgICAgICBdKV0uY29uY2F0KHN0bXQuY2F0Y2hTdG10cyk7XG4gICAgdGhpcy52aXNpdEFsbFN0YXRlbWVudHMoY2F0Y2hTdG10cywgY3R4KTtcbiAgICBjdHguZGVjSW5kZW50KCk7XG4gICAgY3R4LnByaW50bG4oc3RtdCwgYH1gKTtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIHZpc2l0TG9jYWxpemVkU3RyaW5nKGFzdDogby5Mb2NhbGl6ZWRTdHJpbmcsIGN0eDogRW1pdHRlclZpc2l0b3JDb250ZXh0KTogYW55IHtcbiAgICAvLyBUaGUgZm9sbG93aW5nIGNvbnZvbHV0ZWQgcGllY2Ugb2YgY29kZSBpcyBlZmZlY3RpdmVseSB0aGUgZG93bmxldmVsbGVkIGVxdWl2YWxlbnQgb2ZcbiAgICAvLyBgYGBcbiAgICAvLyAkbG9jYWxpemUgYC4uLmBcbiAgICAvLyBgYGBcbiAgICAvLyB3aGljaCBpcyBlZmZlY3RpdmVseSBsaWtlOlxuICAgIC8vIGBgYFxuICAgIC8vICRsb2NhbGl6ZShfX21ha2VUZW1wbGF0ZU9iamVjdChjb29rZWQsIHJhdyksIGV4cHJlc3Npb24xLCBleHByZXNzaW9uMiwgLi4uKTtcbiAgICAvLyBgYGBcbiAgICAvL1xuICAgIC8vIFRoZSBgJGxvY2FsaXplYCBmdW5jdGlvbiBleHBlY3RzIGEgXCJ0ZW1wbGF0ZSBvYmplY3RcIiwgd2hpY2ggaXMgYW4gYXJyYXkgb2YgXCJjb29rZWRcIiBzdHJpbmdzXG4gICAgLy8gcGx1cyBhIGByYXdgIHByb3BlcnR5IHRoYXQgY29udGFpbnMgYW4gYXJyYXkgb2YgXCJyYXdcIiBzdHJpbmdzLlxuICAgIC8vXG4gICAgLy8gSW4gc29tZSBlbnZpcm9ubWVudHMgYSBoZWxwZXIgZnVuY3Rpb24gY2FsbGVkIGBfX21ha2VUZW1wbGF0ZU9iamVjdChjb29rZWQsIHJhdylgIG1pZ2h0IGJlXG4gICAgLy8gYXZhaWxhYmxlLCBpbiB3aGljaCBjYXNlIHdlIHVzZSB0aGF0LiBPdGhlcndpc2Ugd2UgbXVzdCBjcmVhdGUgb3VyIG93biBoZWxwZXIgZnVuY3Rpb25cbiAgICAvLyBpbmxpbmUuXG4gICAgLy9cbiAgICAvLyBJbiB0aGUgaW5saW5lIGZ1bmN0aW9uLCBpZiBgT2JqZWN0LmRlZmluZVByb3BlcnR5YCBpcyBhdmFpbGFibGUgd2UgdXNlIHRoYXQgdG8gYXR0YWNoIHRoZVxuICAgIC8vIGByYXdgIGFycmF5LlxuICAgIGN0eC5wcmludChcbiAgICAgICAgYXN0LFxuICAgICAgICAnJGxvY2FsaXplKCh0aGlzJiZ0aGlzLl9fbWFrZVRlbXBsYXRlT2JqZWN0fHxmdW5jdGlvbihlLHQpe3JldHVybiBPYmplY3QuZGVmaW5lUHJvcGVydHk/T2JqZWN0LmRlZmluZVByb3BlcnR5KGUsXCJyYXdcIix7dmFsdWU6dH0pOmUucmF3PXQsZX0pKCcpO1xuICAgIGNvbnN0IHBhcnRzID0gW2FzdC5zZXJpYWxpemVJMThuSGVhZCgpXTtcbiAgICBmb3IgKGxldCBpID0gMTsgaSA8IGFzdC5tZXNzYWdlUGFydHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHBhcnRzLnB1c2goYXN0LnNlcmlhbGl6ZUkxOG5UZW1wbGF0ZVBhcnQoaSkpO1xuICAgIH1cbiAgICBjdHgucHJpbnQoYXN0LCBgWyR7cGFydHMubWFwKHBhcnQgPT4gZXNjYXBlSWRlbnRpZmllcihwYXJ0LmNvb2tlZCwgZmFsc2UpKS5qb2luKCcsICcpfV0sIGApO1xuICAgIGN0eC5wcmludChhc3QsIGBbJHtwYXJ0cy5tYXAocGFydCA9PiBlc2NhcGVJZGVudGlmaWVyKHBhcnQucmF3LCBmYWxzZSkpLmpvaW4oJywgJyl9XSlgKTtcbiAgICBhc3QuZXhwcmVzc2lvbnMuZm9yRWFjaChleHByZXNzaW9uID0+IHtcbiAgICAgIGN0eC5wcmludChhc3QsICcsICcpO1xuICAgICAgZXhwcmVzc2lvbi52aXNpdEV4cHJlc3Npb24odGhpcywgY3R4KTtcbiAgICB9KTtcbiAgICBjdHgucHJpbnQoYXN0LCAnKScpO1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgcHJpdmF0ZSBfdmlzaXRQYXJhbXMocGFyYW1zOiBvLkZuUGFyYW1bXSwgY3R4OiBFbWl0dGVyVmlzaXRvckNvbnRleHQpOiB2b2lkIHtcbiAgICB0aGlzLnZpc2l0QWxsT2JqZWN0cyhwYXJhbSA9PiBjdHgucHJpbnQobnVsbCwgcGFyYW0ubmFtZSksIHBhcmFtcywgY3R4LCAnLCcpO1xuICB9XG5cbiAgZ2V0QnVpbHRpbk1ldGhvZE5hbWUobWV0aG9kOiBvLkJ1aWx0aW5NZXRob2QpOiBzdHJpbmcge1xuICAgIGxldCBuYW1lOiBzdHJpbmc7XG4gICAgc3dpdGNoIChtZXRob2QpIHtcbiAgICAgIGNhc2Ugby5CdWlsdGluTWV0aG9kLkNvbmNhdEFycmF5OlxuICAgICAgICBuYW1lID0gJ2NvbmNhdCc7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBvLkJ1aWx0aW5NZXRob2QuU3Vic2NyaWJlT2JzZXJ2YWJsZTpcbiAgICAgICAgbmFtZSA9ICdzdWJzY3JpYmUnO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2Ugby5CdWlsdGluTWV0aG9kLkJpbmQ6XG4gICAgICAgIG5hbWUgPSAnYmluZCc7XG4gICAgICAgIGJyZWFrO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBVbmtub3duIGJ1aWx0aW4gbWV0aG9kOiAke21ldGhvZH1gKTtcbiAgICB9XG4gICAgcmV0dXJuIG5hbWU7XG4gIH1cbn1cbiJdfQ==