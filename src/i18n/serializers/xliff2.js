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
        define("@angular/compiler/src/i18n/serializers/xliff2", ["require", "exports", "tslib", "@angular/compiler/src/ml_parser/ast", "@angular/compiler/src/ml_parser/xml_parser", "@angular/compiler/src/i18n/digest", "@angular/compiler/src/i18n/i18n_ast", "@angular/compiler/src/i18n/parse_util", "@angular/compiler/src/i18n/serializers/serializer", "@angular/compiler/src/i18n/serializers/xml_helper"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Xliff2 = void 0;
    var tslib_1 = require("tslib");
    var ml = require("@angular/compiler/src/ml_parser/ast");
    var xml_parser_1 = require("@angular/compiler/src/ml_parser/xml_parser");
    var digest_1 = require("@angular/compiler/src/i18n/digest");
    var i18n = require("@angular/compiler/src/i18n/i18n_ast");
    var parse_util_1 = require("@angular/compiler/src/i18n/parse_util");
    var serializer_1 = require("@angular/compiler/src/i18n/serializers/serializer");
    var xml = require("@angular/compiler/src/i18n/serializers/xml_helper");
    var _VERSION = '2.0';
    var _XMLNS = 'urn:oasis:names:tc:xliff:document:2.0';
    // TODO(vicb): make this a param (s/_/-/)
    var _DEFAULT_SOURCE_LANG = 'en';
    var _PLACEHOLDER_TAG = 'ph';
    var _PLACEHOLDER_SPANNING_TAG = 'pc';
    var _MARKER_TAG = 'mrk';
    var _XLIFF_TAG = 'xliff';
    var _SOURCE_TAG = 'source';
    var _TARGET_TAG = 'target';
    var _UNIT_TAG = 'unit';
    // http://docs.oasis-open.org/xliff/xliff-core/v2.0/os/xliff-core-v2.0-os.html
    var Xliff2 = /** @class */ (function (_super) {
        tslib_1.__extends(Xliff2, _super);
        function Xliff2() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        Xliff2.prototype.write = function (messages, locale) {
            var visitor = new _WriteVisitor();
            var units = [];
            messages.forEach(function (message) {
                var unit = new xml.Tag(_UNIT_TAG, { id: message.id });
                var notes = new xml.Tag('notes');
                if (message.description || message.meaning) {
                    if (message.description) {
                        notes.children.push(new xml.CR(8), new xml.Tag('note', { category: 'description' }, [new xml.Text(message.description)]));
                    }
                    if (message.meaning) {
                        notes.children.push(new xml.CR(8), new xml.Tag('note', { category: 'meaning' }, [new xml.Text(message.meaning)]));
                    }
                }
                message.sources.forEach(function (source) {
                    notes.children.push(new xml.CR(8), new xml.Tag('note', { category: 'location' }, [
                        new xml.Text(source.filePath + ":" + source.startLine + (source.endLine !== source.startLine ? ',' + source.endLine : ''))
                    ]));
                });
                notes.children.push(new xml.CR(6));
                unit.children.push(new xml.CR(6), notes);
                var segment = new xml.Tag('segment');
                segment.children.push(new xml.CR(8), new xml.Tag(_SOURCE_TAG, {}, visitor.serialize(message.nodes)), new xml.CR(6));
                unit.children.push(new xml.CR(6), segment, new xml.CR(4));
                units.push(new xml.CR(4), unit);
            });
            var file = new xml.Tag('file', { 'original': 'ng.template', id: 'ngi18n' }, tslib_1.__spread(units, [new xml.CR(2)]));
            var xliff = new xml.Tag(_XLIFF_TAG, { version: _VERSION, xmlns: _XMLNS, srcLang: locale || _DEFAULT_SOURCE_LANG }, [new xml.CR(2), file, new xml.CR()]);
            return xml.serialize([
                new xml.Declaration({ version: '1.0', encoding: 'UTF-8' }), new xml.CR(), xliff, new xml.CR()
            ]);
        };
        Xliff2.prototype.load = function (content, url) {
            // xliff to xml nodes
            var xliff2Parser = new Xliff2Parser();
            var _a = xliff2Parser.parse(content, url), locale = _a.locale, msgIdToHtml = _a.msgIdToHtml, errors = _a.errors;
            // xml nodes to i18n nodes
            var i18nNodesByMsgId = {};
            var converter = new XmlToI18n();
            Object.keys(msgIdToHtml).forEach(function (msgId) {
                var _a = converter.convert(msgIdToHtml[msgId], url), i18nNodes = _a.i18nNodes, e = _a.errors;
                errors.push.apply(errors, tslib_1.__spread(e));
                i18nNodesByMsgId[msgId] = i18nNodes;
            });
            if (errors.length) {
                throw new Error("xliff2 parse errors:\n" + errors.join('\n'));
            }
            return { locale: locale, i18nNodesByMsgId: i18nNodesByMsgId };
        };
        Xliff2.prototype.digest = function (message) {
            return digest_1.decimalDigest(message);
        };
        return Xliff2;
    }(serializer_1.Serializer));
    exports.Xliff2 = Xliff2;
    var _WriteVisitor = /** @class */ (function () {
        function _WriteVisitor() {
        }
        _WriteVisitor.prototype.visitText = function (text, context) {
            return [new xml.Text(text.value)];
        };
        _WriteVisitor.prototype.visitContainer = function (container, context) {
            var _this = this;
            var nodes = [];
            container.children.forEach(function (node) { return nodes.push.apply(nodes, tslib_1.__spread(node.visit(_this))); });
            return nodes;
        };
        _WriteVisitor.prototype.visitIcu = function (icu, context) {
            var _this = this;
            var nodes = [new xml.Text("{" + icu.expressionPlaceholder + ", " + icu.type + ", ")];
            Object.keys(icu.cases).forEach(function (c) {
                nodes.push.apply(nodes, tslib_1.__spread([new xml.Text(c + " {")], icu.cases[c].visit(_this), [new xml.Text("} ")]));
            });
            nodes.push(new xml.Text("}"));
            return nodes;
        };
        _WriteVisitor.prototype.visitTagPlaceholder = function (ph, context) {
            var _this = this;
            var type = getTypeForTag(ph.tag);
            if (ph.isVoid) {
                var tagPh = new xml.Tag(_PLACEHOLDER_TAG, {
                    id: (this._nextPlaceholderId++).toString(),
                    equiv: ph.startName,
                    type: type,
                    disp: "<" + ph.tag + "/>",
                });
                return [tagPh];
            }
            var tagPc = new xml.Tag(_PLACEHOLDER_SPANNING_TAG, {
                id: (this._nextPlaceholderId++).toString(),
                equivStart: ph.startName,
                equivEnd: ph.closeName,
                type: type,
                dispStart: "<" + ph.tag + ">",
                dispEnd: "</" + ph.tag + ">",
            });
            var nodes = [].concat.apply([], tslib_1.__spread(ph.children.map(function (node) { return node.visit(_this); })));
            if (nodes.length) {
                nodes.forEach(function (node) { return tagPc.children.push(node); });
            }
            else {
                tagPc.children.push(new xml.Text(''));
            }
            return [tagPc];
        };
        _WriteVisitor.prototype.visitPlaceholder = function (ph, context) {
            var idStr = (this._nextPlaceholderId++).toString();
            return [new xml.Tag(_PLACEHOLDER_TAG, {
                    id: idStr,
                    equiv: ph.name,
                    disp: "{{" + ph.value + "}}",
                })];
        };
        _WriteVisitor.prototype.visitIcuPlaceholder = function (ph, context) {
            var cases = Object.keys(ph.value.cases).map(function (value) { return value + ' {...}'; }).join(' ');
            var idStr = (this._nextPlaceholderId++).toString();
            return [new xml.Tag(_PLACEHOLDER_TAG, { id: idStr, equiv: ph.name, disp: "{" + ph.value.expression + ", " + ph.value.type + ", " + cases + "}" })];
        };
        _WriteVisitor.prototype.serialize = function (nodes) {
            var _this = this;
            this._nextPlaceholderId = 0;
            return [].concat.apply([], tslib_1.__spread(nodes.map(function (node) { return node.visit(_this); })));
        };
        return _WriteVisitor;
    }());
    // Extract messages as xml nodes from the xliff file
    var Xliff2Parser = /** @class */ (function () {
        function Xliff2Parser() {
            this._locale = null;
        }
        Xliff2Parser.prototype.parse = function (xliff, url) {
            this._unitMlString = null;
            this._msgIdToHtml = {};
            var xml = new xml_parser_1.XmlParser().parse(xliff, url);
            this._errors = xml.errors;
            ml.visitAll(this, xml.rootNodes, null);
            return {
                msgIdToHtml: this._msgIdToHtml,
                errors: this._errors,
                locale: this._locale,
            };
        };
        Xliff2Parser.prototype.visitElement = function (element, context) {
            switch (element.name) {
                case _UNIT_TAG:
                    this._unitMlString = null;
                    var idAttr = element.attrs.find(function (attr) { return attr.name === 'id'; });
                    if (!idAttr) {
                        this._addError(element, "<" + _UNIT_TAG + "> misses the \"id\" attribute");
                    }
                    else {
                        var id = idAttr.value;
                        if (this._msgIdToHtml.hasOwnProperty(id)) {
                            this._addError(element, "Duplicated translations for msg " + id);
                        }
                        else {
                            ml.visitAll(this, element.children, null);
                            if (typeof this._unitMlString === 'string') {
                                this._msgIdToHtml[id] = this._unitMlString;
                            }
                            else {
                                this._addError(element, "Message " + id + " misses a translation");
                            }
                        }
                    }
                    break;
                case _SOURCE_TAG:
                    // ignore source message
                    break;
                case _TARGET_TAG:
                    var innerTextStart = element.startSourceSpan.end.offset;
                    var innerTextEnd = element.endSourceSpan.start.offset;
                    var content = element.startSourceSpan.start.file.content;
                    var innerText = content.slice(innerTextStart, innerTextEnd);
                    this._unitMlString = innerText;
                    break;
                case _XLIFF_TAG:
                    var localeAttr = element.attrs.find(function (attr) { return attr.name === 'trgLang'; });
                    if (localeAttr) {
                        this._locale = localeAttr.value;
                    }
                    var versionAttr = element.attrs.find(function (attr) { return attr.name === 'version'; });
                    if (versionAttr) {
                        var version = versionAttr.value;
                        if (version !== '2.0') {
                            this._addError(element, "The XLIFF file version " + version + " is not compatible with XLIFF 2.0 serializer");
                        }
                        else {
                            ml.visitAll(this, element.children, null);
                        }
                    }
                    break;
                default:
                    ml.visitAll(this, element.children, null);
            }
        };
        Xliff2Parser.prototype.visitAttribute = function (attribute, context) { };
        Xliff2Parser.prototype.visitText = function (text, context) { };
        Xliff2Parser.prototype.visitComment = function (comment, context) { };
        Xliff2Parser.prototype.visitExpansion = function (expansion, context) { };
        Xliff2Parser.prototype.visitExpansionCase = function (expansionCase, context) { };
        Xliff2Parser.prototype._addError = function (node, message) {
            this._errors.push(new parse_util_1.I18nError(node.sourceSpan, message));
        };
        return Xliff2Parser;
    }());
    // Convert ml nodes (xliff syntax) to i18n nodes
    var XmlToI18n = /** @class */ (function () {
        function XmlToI18n() {
        }
        XmlToI18n.prototype.convert = function (message, url) {
            var xmlIcu = new xml_parser_1.XmlParser().parse(message, url, { tokenizeExpansionForms: true });
            this._errors = xmlIcu.errors;
            var i18nNodes = this._errors.length > 0 || xmlIcu.rootNodes.length == 0 ?
                [] : [].concat.apply([], tslib_1.__spread(ml.visitAll(this, xmlIcu.rootNodes)));
            return {
                i18nNodes: i18nNodes,
                errors: this._errors,
            };
        };
        XmlToI18n.prototype.visitText = function (text, context) {
            return new i18n.Text(text.value, text.sourceSpan);
        };
        XmlToI18n.prototype.visitElement = function (el, context) {
            var _this = this;
            switch (el.name) {
                case _PLACEHOLDER_TAG:
                    var nameAttr = el.attrs.find(function (attr) { return attr.name === 'equiv'; });
                    if (nameAttr) {
                        return [new i18n.Placeholder('', nameAttr.value, el.sourceSpan)];
                    }
                    this._addError(el, "<" + _PLACEHOLDER_TAG + "> misses the \"equiv\" attribute");
                    break;
                case _PLACEHOLDER_SPANNING_TAG:
                    var startAttr = el.attrs.find(function (attr) { return attr.name === 'equivStart'; });
                    var endAttr = el.attrs.find(function (attr) { return attr.name === 'equivEnd'; });
                    if (!startAttr) {
                        this._addError(el, "<" + _PLACEHOLDER_TAG + "> misses the \"equivStart\" attribute");
                    }
                    else if (!endAttr) {
                        this._addError(el, "<" + _PLACEHOLDER_TAG + "> misses the \"equivEnd\" attribute");
                    }
                    else {
                        var startId = startAttr.value;
                        var endId = endAttr.value;
                        var nodes = [];
                        return nodes.concat.apply(nodes, tslib_1.__spread([new i18n.Placeholder('', startId, el.sourceSpan)], el.children.map(function (node) { return node.visit(_this, null); }), [new i18n.Placeholder('', endId, el.sourceSpan)]));
                    }
                    break;
                case _MARKER_TAG:
                    return [].concat.apply([], tslib_1.__spread(ml.visitAll(this, el.children)));
                default:
                    this._addError(el, "Unexpected tag");
            }
            return null;
        };
        XmlToI18n.prototype.visitExpansion = function (icu, context) {
            var caseMap = {};
            ml.visitAll(this, icu.cases).forEach(function (c) {
                caseMap[c.value] = new i18n.Container(c.nodes, icu.sourceSpan);
            });
            return new i18n.Icu(icu.switchValue, icu.type, caseMap, icu.sourceSpan);
        };
        XmlToI18n.prototype.visitExpansionCase = function (icuCase, context) {
            return {
                value: icuCase.value,
                nodes: [].concat.apply([], tslib_1.__spread(ml.visitAll(this, icuCase.expression))),
            };
        };
        XmlToI18n.prototype.visitComment = function (comment, context) { };
        XmlToI18n.prototype.visitAttribute = function (attribute, context) { };
        XmlToI18n.prototype._addError = function (node, message) {
            this._errors.push(new parse_util_1.I18nError(node.sourceSpan, message));
        };
        return XmlToI18n;
    }());
    function getTypeForTag(tag) {
        switch (tag.toLowerCase()) {
            case 'br':
            case 'b':
            case 'i':
            case 'u':
                return 'fmt';
            case 'img':
                return 'image';
            case 'a':
                return 'link';
            default:
                return 'other';
        }
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoieGxpZmYyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXIvc3JjL2kxOG4vc2VyaWFsaXplcnMveGxpZmYyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7SUFFSCx3REFBMEM7SUFDMUMseUVBQXFEO0lBQ3JELDREQUF3QztJQUN4QywwREFBb0M7SUFDcEMsb0VBQXdDO0lBRXhDLGdGQUF3QztJQUN4Qyx1RUFBb0M7SUFFcEMsSUFBTSxRQUFRLEdBQUcsS0FBSyxDQUFDO0lBQ3ZCLElBQU0sTUFBTSxHQUFHLHVDQUF1QyxDQUFDO0lBQ3ZELHlDQUF5QztJQUN6QyxJQUFNLG9CQUFvQixHQUFHLElBQUksQ0FBQztJQUNsQyxJQUFNLGdCQUFnQixHQUFHLElBQUksQ0FBQztJQUM5QixJQUFNLHlCQUF5QixHQUFHLElBQUksQ0FBQztJQUN2QyxJQUFNLFdBQVcsR0FBRyxLQUFLLENBQUM7SUFFMUIsSUFBTSxVQUFVLEdBQUcsT0FBTyxDQUFDO0lBQzNCLElBQU0sV0FBVyxHQUFHLFFBQVEsQ0FBQztJQUM3QixJQUFNLFdBQVcsR0FBRyxRQUFRLENBQUM7SUFDN0IsSUFBTSxTQUFTLEdBQUcsTUFBTSxDQUFDO0lBRXpCLDhFQUE4RTtJQUM5RTtRQUE0QixrQ0FBVTtRQUF0Qzs7UUFrRkEsQ0FBQztRQWpGQyxzQkFBSyxHQUFMLFVBQU0sUUFBd0IsRUFBRSxNQUFtQjtZQUNqRCxJQUFNLE9BQU8sR0FBRyxJQUFJLGFBQWEsRUFBRSxDQUFDO1lBQ3BDLElBQU0sS0FBSyxHQUFlLEVBQUUsQ0FBQztZQUU3QixRQUFRLENBQUMsT0FBTyxDQUFDLFVBQUEsT0FBTztnQkFDdEIsSUFBTSxJQUFJLEdBQUcsSUFBSSxHQUFHLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSxFQUFDLEVBQUUsRUFBRSxPQUFPLENBQUMsRUFBRSxFQUFDLENBQUMs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RCxzQ0FBa0IsR0FBbEIsVUFBbUIsT0FBeUIsRUFBRSxPQUFZO1lBQ3hELE9BQU87Z0JBQ0wsS0FBSyxFQUFFLE9BQU8sQ0FBQyxLQUFLO2dCQUNwQixLQUFLLEVBQUUsRUFBRSxDQUFDLE1BQU0sT0FBVCxFQUFFLG1CQUFXLEVBQUUsQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxVQUFVLENBQUMsRUFBQzthQUMzRCxDQUFDO1FBQ0osQ0FBQztRQUVELGdDQUFZLEdBQVosVUFBYSxPQUFtQixFQUFFLE9BQVksSUFBRyxDQUFDO1FBRWxELGtDQUFjLEdBQWQsVUFBZSxTQUF1QixFQUFFLE9BQVksSUFBRyxDQUFDO1FBRWhELDZCQUFTLEdBQWpCLFVBQWtCLElBQWEsRUFBRSxPQUFlO1lBQzlDLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksc0JBQVMsQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUM7UUFDN0QsQ0FBQztRQUNILGdCQUFDO0lBQUQsQ0FBQyxBQXJGRCxJQXFGQztJQUVELFNBQVMsYUFBYSxDQUFDLEdBQVc7UUFDaEMsUUFBUSxHQUFHLENBQUMsV0FBVyxFQUFFLEVBQUU7WUFDekIsS0FBSyxJQUFJLENBQUM7WUFDVixLQUFLLEdBQUcsQ0FBQztZQUNULEtBQUssR0FBRyxDQUFDO1lBQ1QsS0FBSyxHQUFHO2dCQUNOLE9BQU8sS0FBSyxDQUFDO1lBQ2YsS0FBSyxLQUFLO2dCQUNSLE9BQU8sT0FBTyxDQUFDO1lBQ2pCLEtBQUssR0FBRztnQkFDTixPQUFPLE1BQU0sQ0FBQztZQUNoQjtnQkFDRSxPQUFPLE9BQU8sQ0FBQztTQUNsQjtJQUNILENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCAqIGFzIG1sIGZyb20gJy4uLy4uL21sX3BhcnNlci9hc3QnO1xuaW1wb3J0IHtYbWxQYXJzZXJ9IGZyb20gJy4uLy4uL21sX3BhcnNlci94bWxfcGFyc2VyJztcbmltcG9ydCB7ZGVjaW1hbERpZ2VzdH0gZnJvbSAnLi4vZGlnZXN0JztcbmltcG9ydCAqIGFzIGkxOG4gZnJvbSAnLi4vaTE4bl9hc3QnO1xuaW1wb3J0IHtJMThuRXJyb3J9IGZyb20gJy4uL3BhcnNlX3V0aWwnO1xuXG5pbXBvcnQge1NlcmlhbGl6ZXJ9IGZyb20gJy4vc2VyaWFsaXplcic7XG5pbXBvcnQgKiBhcyB4bWwgZnJvbSAnLi94bWxfaGVscGVyJztcblxuY29uc3QgX1ZFUlNJT04gPSAnMi4wJztcbmNvbnN0IF9YTUxOUyA9ICd1cm46b2FzaXM6bmFtZXM6dGM6eGxpZmY6ZG9jdW1lbnQ6Mi4wJztcbi8vIFRPRE8odmljYik6IG1ha2UgdGhpcyBhIHBhcmFtIChzL18vLS8pXG5jb25zdCBfREVGQVVMVF9TT1VSQ0VfTEFORyA9ICdlbic7XG5jb25zdCBfUExBQ0VIT0xERVJfVEFHID0gJ3BoJztcbmNvbnN0IF9QTEFDRUhPTERFUl9TUEFOTklOR19UQUcgPSAncGMnO1xuY29uc3QgX01BUktFUl9UQUcgPSAnbXJrJztcblxuY29uc3QgX1hMSUZGX1RBRyA9ICd4bGlmZic7XG5jb25zdCBfU09VUkNFX1RBRyA9ICdzb3VyY2UnO1xuY29uc3QgX1RBUkdFVF9UQUcgPSAndGFyZ2V0JztcbmNvbnN0IF9VTklUX1RBRyA9ICd1bml0JztcblxuLy8gaHR0cDovL2RvY3Mub2FzaXMtb3Blbi5vcmcveGxpZmYveGxpZmYtY29yZS92Mi4wL29zL3hsaWZmLWNvcmUtdjIuMC1vcy5odG1sXG5leHBvcnQgY2xhc3MgWGxpZmYyIGV4dGVuZHMgU2VyaWFsaXplciB7XG4gIHdyaXRlKG1lc3NhZ2VzOiBpMThuLk1lc3NhZ2VbXSwgbG9jYWxlOiBzdHJpbmd8bnVsbCk6IHN0cmluZyB7XG4gICAgY29uc3QgdmlzaXRvciA9IG5ldyBfV3JpdGVWaXNpdG9yKCk7XG4gICAgY29uc3QgdW5pdHM6IHhtbC5Ob2RlW10gPSBbXTtcblxuICAgIG1lc3NhZ2VzLmZvckVhY2gobWVzc2FnZSA9PiB7XG4gICAgICBjb25zdCB1bml0ID0gbmV3IHhtbC5UYWcoX1VOSVRfVEFHLCB7aWQ6IG1lc3NhZ2UuaWR9KTtcbiAgICAgIGNvbnN0IG5vdGVzID0gbmV3IHhtbC5UYWcoJ25vdGVzJyk7XG5cbiAgICAgIGlmIChtZXNzYWdlLmRlc2NyaXB0aW9uIHx8IG1lc3NhZ2UubWVhbmluZykge1xuICAgICAgICBpZiAobWVzc2FnZS5kZXNjcmlwdGlvbikge1xuICAgICAgICAgIG5vdGVzLmNoaWxkcmVuLnB1c2goXG4gICAgICAgICAgICAgIG5ldyB4bWwuQ1IoOCksXG4gICAgICAgICAgICAgIG5ldyB4bWwuVGFnKCdub3RlJywge2NhdGVnb3J5OiAnZGVzY3JpcHRpb24nfSwgW25ldyB4bWwuVGV4dChtZXNzYWdlLmRlc2NyaXB0aW9uKV0pKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChtZXNzYWdlLm1lYW5pbmcpIHtcbiAgICAgICAgICBub3Rlcy5jaGlsZHJlbi5wdXNoKFxuICAgICAgICAgICAgICBuZXcgeG1sLkNSKDgpLFxuICAgICAgICAgICAgICBuZXcgeG1sLlRhZygnbm90ZScsIHtjYXRlZ29yeTogJ21lYW5pbmcnfSwgW25ldyB4bWwuVGV4dChtZXNzYWdlLm1lYW5pbmcpXSkpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIG1lc3NhZ2Uuc291cmNlcy5mb3JFYWNoKChzb3VyY2U6IGkxOG4uTWVzc2FnZVNwYW4pID0+IHtcbiAgICAgICAgbm90ZXMuY2hpbGRyZW4ucHVzaChuZXcgeG1sLkNSKDgpLCBuZXcgeG1sLlRhZygnbm90ZScsIHtjYXRlZ29yeTogJ2xvY2F0aW9uJ30sIFtcbiAgICAgICAgICBuZXcgeG1sLlRleHQoYCR7c291cmNlLmZpbGVQYXRofToke3NvdXJjZS5zdGFydExpbmV9JHtcbiAgICAgICAgICAgICAgc291cmNlLmVuZExpbmUgIT09IHNvdXJjZS5zdGFydExpbmUgPyAnLCcgKyBzb3VyY2UuZW5kTGluZSA6ICcnfWApXG4gICAgICAgIF0pKTtcbiAgICAgIH0pO1xuXG4gICAgICBub3Rlcy5jaGlsZHJlbi5wdXNoKG5ldyB4bWwuQ1IoNikpO1xuICAgICAgdW5pdC5jaGlsZHJlbi5wdXNoKG5ldyB4bWwuQ1IoNiksIG5vdGVzKTtcblxuICAgICAgY29uc3Qgc2VnbWVudCA9IG5ldyB4bWwuVGFnKCdzZWdtZW50Jyk7XG5cbiAgICAgIHNlZ21lbnQuY2hpbGRyZW4ucHVzaChcbiAgICAgICAgICBuZXcgeG1sLkNSKDgpLCBuZXcgeG1sLlRhZyhfU09VUkNFX1RBRywge30sIHZpc2l0b3Iuc2VyaWFsaXplKG1lc3NhZ2Uubm9kZXMpKSxcbiAgICAgICAgICBuZXcgeG1sLkNSKDYpKTtcblxuICAgICAgdW5pdC5jaGlsZHJlbi5wdXNoKG5ldyB4bWwuQ1IoNiksIHNlZ21lbnQsIG5ldyB4bWwuQ1IoNCkpO1xuXG4gICAgICB1bml0cy5wdXNoKG5ldyB4bWwuQ1IoNCksIHVuaXQpO1xuICAgIH0pO1xuXG4gICAgY29uc3QgZmlsZSA9XG4gICAgICAgIG5ldyB4bWwuVGFnKCdmaWxlJywgeydvcmlnaW5hbCc6ICduZy50ZW1wbGF0ZScsIGlkOiAnbmdpMThuJ30sIFsuLi51bml0cywgbmV3IHhtbC5DUigyKV0pO1xuXG4gICAgY29uc3QgeGxpZmYgPSBuZXcgeG1sLlRhZyhcbiAgICAgICAgX1hMSUZGX1RBRywge3ZlcnNpb246IF9WRVJTSU9OLCB4bWxuczogX1hNTE5TLCBzcmNMYW5nOiBsb2NhbGUgfHwgX0RFRkFVTFRfU09VUkNFX0xBTkd9LFxuICAgICAgICBbbmV3IHhtbC5DUigyKSwgZmlsZSwgbmV3IHhtbC5DUigpXSk7XG5cbiAgICByZXR1cm4geG1sLnNlcmlhbGl6ZShbXG4gICAgICBuZXcgeG1sLkRlY2xhcmF0aW9uKHt2ZXJzaW9uOiAnMS4wJywgZW5jb2Rpbmc6ICdVVEYtOCd9KSwgbmV3IHhtbC5DUigpLCB4bGlmZiwgbmV3IHhtbC5DUigpXG4gICAgXSk7XG4gIH1cblxuICBsb2FkKGNvbnRlbnQ6IHN0cmluZywgdXJsOiBzdHJpbmcpOlxuICAgICAge2xvY2FsZTogc3RyaW5nLCBpMThuTm9kZXNCeU1zZ0lkOiB7W21zZ0lkOiBzdHJpbmddOiBpMThuLk5vZGVbXX19IHtcbiAgICAvLyB4bGlmZiB0byB4bWwgbm9kZXNcbiAgICBjb25zdCB4bGlmZjJQYXJzZXIgPSBuZXcgWGxpZmYyUGFyc2VyKCk7XG4gICAgY29uc3Qge2xvY2FsZSwgbXNnSWRUb0h0bWwsIGVycm9yc30gPSB4bGlmZjJQYXJzZXIucGFyc2UoY29udGVudCwgdXJsKTtcblxuICAgIC8vIHhtbCBub2RlcyB0byBpMThuIG5vZGVzXG4gICAgY29uc3QgaTE4bk5vZGVzQnlNc2dJZDoge1ttc2dJZDogc3RyaW5nXTogaTE4bi5Ob2RlW119ID0ge307XG4gICAgY29uc3QgY29udmVydGVyID0gbmV3IFhtbFRvSTE4bigpO1xuXG4gICAgT2JqZWN0LmtleXMobXNnSWRUb0h0bWwpLmZvckVhY2gobXNnSWQgPT4ge1xuICAgICAgY29uc3Qge2kxOG5Ob2RlcywgZXJyb3JzOiBlfSA9IGNvbnZlcnRlci5jb252ZXJ0KG1zZ0lkVG9IdG1sW21zZ0lkXSwgdXJsKTtcbiAgICAgIGVycm9ycy5wdXNoKC4uLmUpO1xuICAgICAgaTE4bk5vZGVzQnlNc2dJZFttc2dJZF0gPSBpMThuTm9kZXM7XG4gICAgfSk7XG5cbiAgICBpZiAoZXJyb3JzLmxlbmd0aCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGB4bGlmZjIgcGFyc2UgZXJyb3JzOlxcbiR7ZXJyb3JzLmpvaW4oJ1xcbicpfWApO1xuICAgIH1cblxuICAgIHJldHVybiB7bG9jYWxlOiBsb2NhbGUhLCBpMThuTm9kZXNCeU1zZ0lkfTtcbiAgfVxuXG4gIGRpZ2VzdChtZXNzYWdlOiBpMThuLk1lc3NhZ2UpOiBzdHJpbmcge1xuICAgIHJldHVybiBkZWNpbWFsRGlnZXN0KG1lc3NhZ2UpO1xuICB9XG59XG5cbmNsYXNzIF9Xcml0ZVZpc2l0b3IgaW1wbGVtZW50cyBpMThuLlZpc2l0b3Ige1xuICAvLyBUT0RPKGlzc3VlLzI0NTcxKTogcmVtb3ZlICchJy5cbiAgcHJpdmF0ZSBfbmV4dFBsYWNlaG9sZGVySWQhOiBudW1iZXI7XG5cbiAgdmlzaXRUZXh0KHRleHQ6IGkxOG4uVGV4dCwgY29udGV4dD86IGFueSk6IHhtbC5Ob2RlW10ge1xuICAgIHJldHVybiBbbmV3IHhtbC5UZXh0KHRleHQudmFsdWUpXTtcbiAgfVxuXG4gIHZpc2l0Q29udGFpbmVyKGNvbnRhaW5lcjogaTE4bi5Db250YWluZXIsIGNvbnRleHQ/OiBhbnkpOiB4bWwuTm9kZVtdIHtcbiAgICBjb25zdCBub2RlczogeG1sLk5vZGVbXSA9IFtdO1xuICAgIGNvbnRhaW5lci5jaGlsZHJlbi5mb3JFYWNoKChub2RlOiBpMThuLk5vZGUpID0+IG5vZGVzLnB1c2goLi4ubm9kZS52aXNpdCh0aGlzKSkpO1xuICAgIHJldHVybiBub2RlcztcbiAgfVxuXG4gIHZpc2l0SWN1KGljdTogaTE4bi5JY3UsIGNvbnRleHQ/OiBhbnkpOiB4bWwuTm9kZVtdIHtcbiAgICBjb25zdCBub2RlcyA9IFtuZXcgeG1sLlRleHQoYHske2ljdS5leHByZXNzaW9uUGxhY2Vob2xkZXJ9LCAke2ljdS50eXBlfSwgYCldO1xuXG4gICAgT2JqZWN0LmtleXMoaWN1LmNhc2VzKS5mb3JFYWNoKChjOiBzdHJpbmcpID0+IHtcbiAgICAgIG5vZGVzLnB1c2gobmV3IHhtbC5UZXh0KGAke2N9IHtgKSwgLi4uaWN1LmNhc2VzW2NdLnZpc2l0KHRoaXMpLCBuZXcgeG1sLlRleHQoYH0gYCkpO1xuICAgIH0pO1xuXG4gICAgbm9kZXMucHVzaChuZXcgeG1sLlRleHQoYH1gKSk7XG5cbiAgICByZXR1cm4gbm9kZXM7XG4gIH1cblxuICB2aXNpdFRhZ1BsYWNlaG9sZGVyKHBoOiBpMThuLlRhZ1BsYWNlaG9sZGVyLCBjb250ZXh0PzogYW55KTogeG1sLk5vZGVbXSB7XG4gICAgY29uc3QgdHlwZSA9IGdldFR5cGVGb3JUYWcocGgudGFnKTtcblxuICAgIGlmIChwaC5pc1ZvaWQpIHtcbiAgICAgIGNvbnN0IHRhZ1BoID0gbmV3IHhtbC5UYWcoX1BMQUNFSE9MREVSX1RBRywge1xuICAgICAgICBpZDogKHRoaXMuX25leHRQbGFjZWhvbGRlcklkKyspLnRvU3RyaW5nKCksXG4gICAgICAgIGVxdWl2OiBwaC5zdGFydE5hbWUsXG4gICAgICAgIHR5cGU6IHR5cGUsXG4gICAgICAgIGRpc3A6IGA8JHtwaC50YWd9Lz5gLFxuICAgICAgfSk7XG4gICAgICByZXR1cm4gW3RhZ1BoXTtcbiAgICB9XG5cbiAgICBjb25zdCB0YWdQYyA9IG5ldyB4bWwuVGFnKF9QTEFDRUhPTERFUl9TUEFOTklOR19UQUcsIHtcbiAgICAgIGlkOiAodGhpcy5fbmV4dFBsYWNlaG9sZGVySWQrKykudG9TdHJpbmcoKSxcbiAgICAgIGVxdWl2U3RhcnQ6IHBoLnN0YXJ0TmFtZSxcbiAgICAgIGVxdWl2RW5kOiBwaC5jbG9zZU5hbWUsXG4gICAgICB0eXBlOiB0eXBlLFxuICAgICAgZGlzcFN0YXJ0OiBgPCR7cGgudGFnfT5gLFxuICAgICAgZGlzcEVuZDogYDwvJHtwaC50YWd9PmAsXG4gICAgfSk7XG4gICAgY29uc3Qgbm9kZXM6IHhtbC5Ob2RlW10gPSBbXS5jb25jYXQoLi4ucGguY2hpbGRyZW4ubWFwKG5vZGUgPT4gbm9kZS52aXNpdCh0aGlzKSkpO1xuICAgIGlmIChub2Rlcy5sZW5ndGgpIHtcbiAgICAgIG5vZGVzLmZvckVhY2goKG5vZGU6IHhtbC5Ob2RlKSA9PiB0YWdQYy5jaGlsZHJlbi5wdXNoKG5vZGUpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGFnUGMuY2hpbGRyZW4ucHVzaChuZXcgeG1sLlRleHQoJycpKTtcbiAgICB9XG5cbiAgICByZXR1cm4gW3RhZ1BjXTtcbiAgfVxuXG4gIHZpc2l0UGxhY2Vob2xkZXIocGg6IGkxOG4uUGxhY2Vob2xkZXIsIGNvbnRleHQ/OiBhbnkpOiB4bWwuTm9kZVtdIHtcbiAgICBjb25zdCBpZFN0ciA9ICh0aGlzLl9uZXh0UGxhY2Vob2xkZXJJZCsrKS50b1N0cmluZygpO1xuICAgIHJldHVybiBbbmV3IHhtbC5UYWcoX1BMQUNFSE9MREVSX1RBRywge1xuICAgICAgaWQ6IGlkU3RyLFxuICAgICAgZXF1aXY6IHBoLm5hbWUsXG4gICAgICBkaXNwOiBge3ske3BoLnZhbHVlfX19YCxcbiAgICB9KV07XG4gIH1cblxuICB2aXNpdEljdVBsYWNlaG9sZGVyKHBoOiBpMThuLkljdVBsYWNlaG9sZGVyLCBjb250ZXh0PzogYW55KTogeG1sLk5vZGVbXSB7XG4gICAgY29uc3QgY2FzZXMgPSBPYmplY3Qua2V5cyhwaC52YWx1ZS5jYXNlcykubWFwKCh2YWx1ZTogc3RyaW5nKSA9PiB2YWx1ZSArICcgey4uLn0nKS5qb2luKCcgJyk7XG4gICAgY29uc3QgaWRTdHIgPSAodGhpcy5fbmV4dFBsYWNlaG9sZGVySWQrKykudG9TdHJpbmcoKTtcbiAgICByZXR1cm4gW25ldyB4bWwuVGFnKFxuICAgICAgICBfUExBQ0VIT0xERVJfVEFHLFxuICAgICAgICB7aWQ6IGlkU3RyLCBlcXVpdjogcGgubmFtZSwgZGlzcDogYHske3BoLnZhbHVlLmV4cHJlc3Npb259LCAke3BoLnZhbHVlLnR5cGV9LCAke2Nhc2VzfX1gfSldO1xuICB9XG5cbiAgc2VyaWFsaXplKG5vZGVzOiBpMThuLk5vZGVbXSk6IHhtbC5Ob2RlW10ge1xuICAgIHRoaXMuX25leHRQbGFjZWhvbGRlcklkID0gMDtcbiAgICByZXR1cm4gW10uY29uY2F0KC4uLm5vZGVzLm1hcChub2RlID0+IG5vZGUudmlzaXQodGhpcykpKTtcbiAgfVxufVxuXG4vLyBFeHRyYWN0IG1lc3NhZ2VzIGFzIHhtbCBub2RlcyBmcm9tIHRoZSB4bGlmZiBmaWxlXG5jbGFzcyBYbGlmZjJQYXJzZXIgaW1wbGVtZW50cyBtbC5WaXNpdG9yIHtcbiAgLy8gVE9ETyhpc3N1ZS8yNDU3MSk6IHJlbW92ZSAnIScuXG4gIHByaXZhdGUgX3VuaXRNbFN0cmluZyE6IHN0cmluZ3xudWxsO1xuICAvLyBUT0RPKGlzc3VlLzI0NTcxKTogcmVtb3ZlICchJy5cbiAgcHJpdmF0ZSBfZXJyb3JzITogSTE4bkVycm9yW107XG4gIC8vIFRPRE8oaXNzdWUvMjQ1NzEpOiByZW1vdmUgJyEnLlxuICBwcml2YXRlIF9tc2dJZFRvSHRtbCE6IHtbbXNnSWQ6IHN0cmluZ106IHN0cmluZ307XG4gIHByaXZhdGUgX2xvY2FsZTogc3RyaW5nfG51bGwgPSBudWxsO1xuXG4gIHBhcnNlKHhsaWZmOiBzdHJpbmcsIHVybDogc3RyaW5nKSB7XG4gICAgdGhpcy5fdW5pdE1sU3RyaW5nID0gbnVsbDtcbiAgICB0aGlzLl9tc2dJZFRvSHRtbCA9IHt9O1xuXG4gICAgY29uc3QgeG1sID0gbmV3IFhtbFBhcnNlcigpLnBhcnNlKHhsaWZmLCB1cmwpO1xuXG4gICAgdGhpcy5fZXJyb3JzID0geG1sLmVycm9ycztcbiAgICBtbC52aXNpdEFsbCh0aGlzLCB4bWwucm9vdE5vZGVzLCBudWxsKTtcblxuICAgIHJldHVybiB7XG4gICAgICBtc2dJZFRvSHRtbDogdGhpcy5fbXNnSWRUb0h0bWwsXG4gICAgICBlcnJvcnM6IHRoaXMuX2Vycm9ycyxcbiAgICAgIGxvY2FsZTogdGhpcy5fbG9jYWxlLFxuICAgIH07XG4gIH1cblxuICB2aXNpdEVsZW1lbnQoZWxlbWVudDogbWwuRWxlbWVudCwgY29udGV4dDogYW55KTogYW55IHtcbiAgICBzd2l0Y2ggKGVsZW1lbnQubmFtZSkge1xuICAgICAgY2FzZSBfVU5JVF9UQUc6XG4gICAgICAgIHRoaXMuX3VuaXRNbFN0cmluZyA9IG51bGw7XG4gICAgICAgIGNvbnN0IGlkQXR0ciA9IGVsZW1lbnQuYXR0cnMuZmluZCgoYXR0cikgPT4gYXR0ci5uYW1lID09PSAnaWQnKTtcbiAgICAgICAgaWYgKCFpZEF0dHIpIHtcbiAgICAgICAgICB0aGlzLl9hZGRFcnJvcihlbGVtZW50LCBgPCR7X1VOSVRfVEFHfT4gbWlzc2VzIHRoZSBcImlkXCIgYXR0cmlidXRlYCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY29uc3QgaWQgPSBpZEF0dHIudmFsdWU7XG4gICAgICAgICAgaWYgKHRoaXMuX21zZ0lkVG9IdG1sLmhhc093blByb3BlcnR5KGlkKSkge1xuICAgICAgICAgICAgdGhpcy5fYWRkRXJyb3IoZWxlbWVudCwgYER1cGxpY2F0ZWQgdHJhbnNsYXRpb25zIGZvciBtc2cgJHtpZH1gKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbWwudmlzaXRBbGwodGhpcywgZWxlbWVudC5jaGlsZHJlbiwgbnVsbCk7XG4gICAgICAgICAgICBpZiAodHlwZW9mIHRoaXMuX3VuaXRNbFN0cmluZyA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgICAgdGhpcy5fbXNnSWRUb0h0bWxbaWRdID0gdGhpcy5fdW5pdE1sU3RyaW5nO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgdGhpcy5fYWRkRXJyb3IoZWxlbWVudCwgYE1lc3NhZ2UgJHtpZH0gbWlzc2VzIGEgdHJhbnNsYXRpb25gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgX1NPVVJDRV9UQUc6XG4gICAgICAgIC8vIGlnbm9yZSBzb3VyY2UgbWVzc2FnZVxuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSBfVEFSR0VUX1RBRzpcbiAgICAgICAgY29uc3QgaW5uZXJUZXh0U3RhcnQgPSBlbGVtZW50LnN0YXJ0U291cmNlU3BhbiEuZW5kLm9mZnNldDtcbiAgICAgICAgY29uc3QgaW5uZXJUZXh0RW5kID0gZWxlbWVudC5lbmRTb3VyY2VTcGFuIS5zdGFydC5vZmZzZXQ7XG4gICAgICAgIGNvbnN0IGNvbnRlbnQgPSBlbGVtZW50LnN0YXJ0U291cmNlU3BhbiEuc3RhcnQuZmlsZS5jb250ZW50O1xuICAgICAgICBjb25zdCBpbm5lclRleHQgPSBjb250ZW50LnNsaWNlKGlubmVyVGV4dFN0YXJ0LCBpbm5lclRleHRFbmQpO1xuICAgICAgICB0aGlzLl91bml0TWxTdHJpbmcgPSBpbm5lclRleHQ7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIF9YTElGRl9UQUc6XG4gICAgICAgIGNvbnN0IGxvY2FsZUF0dHIgPSBlbGVtZW50LmF0dHJzLmZpbmQoKGF0dHIpID0+IGF0dHIubmFtZSA9PT0gJ3RyZ0xhbmcnKTtcbiAgICAgICAgaWYgKGxvY2FsZUF0dHIpIHtcbiAgICAgICAgICB0aGlzLl9sb2NhbGUgPSBsb2NhbGVBdHRyLnZhbHVlO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgdmVyc2lvbkF0dHIgPSBlbGVtZW50LmF0dHJzLmZpbmQoKGF0dHIpID0+IGF0dHIubmFtZSA9PT0gJ3ZlcnNpb24nKTtcbiAgICAgICAgaWYgKHZlcnNpb25BdHRyKSB7XG4gICAgICAgICAgY29uc3QgdmVyc2lvbiA9IHZlcnNpb25BdHRyLnZhbHVlO1xuICAgICAgICAgIGlmICh2ZXJzaW9uICE9PSAnMi4wJykge1xuICAgICAgICAgICAgdGhpcy5fYWRkRXJyb3IoXG4gICAgICAgICAgICAgICAgZWxlbWVudCxcbiAgICAgICAgICAgICAgICBgVGhlIFhMSUZGIGZpbGUgdmVyc2lvbiAke3ZlcnNpb259IGlzIG5vdCBjb21wYXRpYmxlIHdpdGggWExJRkYgMi4wIHNlcmlhbGl6ZXJgKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbWwudmlzaXRBbGwodGhpcywgZWxlbWVudC5jaGlsZHJlbiwgbnVsbCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgbWwudmlzaXRBbGwodGhpcywgZWxlbWVudC5jaGlsZHJlbiwgbnVsbCk7XG4gICAgfVxuICB9XG5cbiAgdmlzaXRBdHRyaWJ1dGUoYXR0cmlidXRlOiBtbC5BdHRyaWJ1dGUsIGNvbnRleHQ6IGFueSk6IGFueSB7fVxuXG4gIHZpc2l0VGV4dCh0ZXh0OiBtbC5UZXh0LCBjb250ZXh0OiBhbnkpOiBhbnkge31cblxuICB2aXNpdENvbW1lbnQoY29tbWVudDogbWwuQ29tbWVudCwgY29udGV4dDogYW55KTogYW55IHt9XG5cbiAgdmlzaXRFeHBhbnNpb24oZXhwYW5zaW9uOiBtbC5FeHBhbnNpb24sIGNvbnRleHQ6IGFueSk6IGFueSB7fVxuXG4gIHZpc2l0RXhwYW5zaW9uQ2FzZShleHBhbnNpb25DYXNlOiBtbC5FeHBhbnNpb25DYXNlLCBjb250ZXh0OiBhbnkpOiBhbnkge31cblxuICBwcml2YXRlIF9hZGRFcnJvcihub2RlOiBtbC5Ob2RlLCBtZXNzYWdlOiBzdHJpbmcpOiB2b2lkIHtcbiAgICB0aGlzLl9lcnJvcnMucHVzaChuZXcgSTE4bkVycm9yKG5vZGUuc291cmNlU3BhbiwgbWVzc2FnZSkpO1xuICB9XG59XG5cbi8vIENvbnZlcnQgbWwgbm9kZXMgKHhsaWZmIHN5bnRheCkgdG8gaTE4biBub2Rlc1xuY2xhc3MgWG1sVG9JMThuIGltcGxlbWVudHMgbWwuVmlzaXRvciB7XG4gIC8vIFRPRE8oaXNzdWUvMjQ1NzEpOiByZW1vdmUgJyEnLlxuICBwcml2YXRlIF9lcnJvcnMhOiBJMThuRXJyb3JbXTtcblxuICBjb252ZXJ0KG1lc3NhZ2U6IHN0cmluZywgdXJsOiBzdHJpbmcpIHtcbiAgICBjb25zdCB4bWxJY3UgPSBuZXcgWG1sUGFyc2VyKCkucGFyc2UobWVzc2FnZSwgdXJsLCB7dG9rZW5pemVFeHBhbnNpb25Gb3JtczogdHJ1ZX0pO1xuICAgIHRoaXMuX2Vycm9ycyA9IHhtbEljdS5lcnJvcnM7XG5cbiAgICBjb25zdCBpMThuTm9kZXMgPSB0aGlzLl9lcnJvcnMubGVuZ3RoID4gMCB8fCB4bWxJY3Uucm9vdE5vZGVzLmxlbmd0aCA9PSAwID9cbiAgICAgICAgW10gOlxuICAgICAgICBbXS5jb25jYXQoLi4ubWwudmlzaXRBbGwodGhpcywgeG1sSWN1LnJvb3ROb2RlcykpO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIGkxOG5Ob2RlcyxcbiAgICAgIGVycm9yczogdGhpcy5fZXJyb3JzLFxuICAgIH07XG4gIH1cblxuICB2aXNpdFRleHQodGV4dDogbWwuVGV4dCwgY29udGV4dDogYW55KSB7XG4gICAgcmV0dXJuIG5ldyBpMThuLlRleHQodGV4dC52YWx1ZSwgdGV4dC5zb3VyY2VTcGFuKTtcbiAgfVxuXG4gIHZpc2l0RWxlbWVudChlbDogbWwuRWxlbWVudCwgY29udGV4dDogYW55KTogaTE4bi5Ob2RlW118bnVsbCB7XG4gICAgc3dpdGNoIChlbC5uYW1lKSB7XG4gICAgICBjYXNlIF9QTEFDRUhPTERFUl9UQUc6XG4gICAgICAgIGNvbnN0IG5hbWVBdHRyID0gZWwuYXR0cnMuZmluZCgoYXR0cikgPT4gYXR0ci5uYW1lID09PSAnZXF1aXYnKTtcbiAgICAgICAgaWYgKG5hbWVBdHRyKSB7XG4gICAgICAgICAgcmV0dXJuIFtuZXcgaTE4bi5QbGFjZWhvbGRlcignJywgbmFtZUF0dHIudmFsdWUsIGVsLnNvdXJjZVNwYW4pXTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuX2FkZEVycm9yKGVsLCBgPCR7X1BMQUNFSE9MREVSX1RBR30+IG1pc3NlcyB0aGUgXCJlcXVpdlwiIGF0dHJpYnV0ZWApO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgX1BMQUNFSE9MREVSX1NQQU5OSU5HX1RBRzpcbiAgICAgICAgY29uc3Qgc3RhcnRBdHRyID0gZWwuYXR0cnMuZmluZCgoYXR0cikgPT4gYXR0ci5uYW1lID09PSAnZXF1aXZTdGFydCcpO1xuICAgICAgICBjb25zdCBlbmRBdHRyID0gZWwuYXR0cnMuZmluZCgoYXR0cikgPT4gYXR0ci5uYW1lID09PSAnZXF1aXZFbmQnKTtcblxuICAgICAgICBpZiAoIXN0YXJ0QXR0cikge1xuICAgICAgICAgIHRoaXMuX2FkZEVycm9yKGVsLCBgPCR7X1BMQUNFSE9MREVSX1RBR30+IG1pc3NlcyB0aGUgXCJlcXVpdlN0YXJ0XCIgYXR0cmlidXRlYCk7XG4gICAgICAgIH0gZWxzZSBpZiAoIWVuZEF0dHIpIHtcbiAgICAgICAgICB0aGlzLl9hZGRFcnJvcihlbCwgYDwke19QTEFDRUhPTERFUl9UQUd9PiBtaXNzZXMgdGhlIFwiZXF1aXZFbmRcIiBhdHRyaWJ1dGVgKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjb25zdCBzdGFydElkID0gc3RhcnRBdHRyLnZhbHVlO1xuICAgICAgICAgIGNvbnN0IGVuZElkID0gZW5kQXR0ci52YWx1ZTtcblxuICAgICAgICAgIGNvbnN0IG5vZGVzOiBpMThuLk5vZGVbXSA9IFtdO1xuXG4gICAgICAgICAgcmV0dXJuIG5vZGVzLmNvbmNhdChcbiAgICAgICAgICAgICAgbmV3IGkxOG4uUGxhY2Vob2xkZXIoJycsIHN0YXJ0SWQsIGVsLnNvdXJjZVNwYW4pLFxuICAgICAgICAgICAgICAuLi5lbC5jaGlsZHJlbi5tYXAobm9kZSA9PiBub2RlLnZpc2l0KHRoaXMsIG51bGwpKSxcbiAgICAgICAgICAgICAgbmV3IGkxOG4uUGxhY2Vob2xkZXIoJycsIGVuZElkLCBlbC5zb3VyY2VTcGFuKSk7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIF9NQVJLRVJfVEFHOlxuICAgICAgICByZXR1cm4gW10uY29uY2F0KC4uLm1sLnZpc2l0QWxsKHRoaXMsIGVsLmNoaWxkcmVuKSk7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICB0aGlzLl9hZGRFcnJvcihlbCwgYFVuZXhwZWN0ZWQgdGFnYCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICB2aXNpdEV4cGFuc2lvbihpY3U6IG1sLkV4cGFuc2lvbiwgY29udGV4dDogYW55KSB7XG4gICAgY29uc3QgY2FzZU1hcDoge1t2YWx1ZTogc3RyaW5nXTogaTE4bi5Ob2RlfSA9IHt9O1xuXG4gICAgbWwudmlzaXRBbGwodGhpcywgaWN1LmNhc2VzKS5mb3JFYWNoKChjOiBhbnkpID0+IHtcbiAgICAgIGNhc2VNYXBbYy52YWx1ZV0gPSBuZXcgaTE4bi5Db250YWluZXIoYy5ub2RlcywgaWN1LnNvdXJjZVNwYW4pO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIG5ldyBpMThuLkljdShpY3Uuc3dpdGNoVmFsdWUsIGljdS50eXBlLCBjYXNlTWFwLCBpY3Uuc291cmNlU3Bhbik7XG4gIH1cblxuICB2aXNpdEV4cGFuc2lvbkNhc2UoaWN1Q2FzZTogbWwuRXhwYW5zaW9uQ2FzZSwgY29udGV4dDogYW55KTogYW55IHtcbiAgICByZXR1cm4ge1xuICAgICAgdmFsdWU6IGljdUNhc2UudmFsdWUsXG4gICAgICBub2RlczogW10uY29uY2F0KC4uLm1sLnZpc2l0QWxsKHRoaXMsIGljdUNhc2UuZXhwcmVzc2lvbikpLFxuICAgIH07XG4gIH1cblxuICB2aXNpdENvbW1lbnQoY29tbWVudDogbWwuQ29tbWVudCwgY29udGV4dDogYW55KSB7fVxuXG4gIHZpc2l0QXR0cmlidXRlKGF0dHJpYnV0ZTogbWwuQXR0cmlidXRlLCBjb250ZXh0OiBhbnkpIHt9XG5cbiAgcHJpdmF0ZSBfYWRkRXJyb3Iobm9kZTogbWwuTm9kZSwgbWVzc2FnZTogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy5fZXJyb3JzLnB1c2gobmV3IEkxOG5FcnJvcihub2RlLnNvdXJjZVNwYW4sIG1lc3NhZ2UpKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBnZXRUeXBlRm9yVGFnKHRhZzogc3RyaW5nKTogc3RyaW5nIHtcbiAgc3dpdGNoICh0YWcudG9Mb3dlckNhc2UoKSkge1xuICAgIGNhc2UgJ2JyJzpcbiAgICBjYXNlICdiJzpcbiAgICBjYXNlICdpJzpcbiAgICBjYXNlICd1JzpcbiAgICAgIHJldHVybiAnZm10JztcbiAgICBjYXNlICdpbWcnOlxuICAgICAgcmV0dXJuICdpbWFnZSc7XG4gICAgY2FzZSAnYSc6XG4gICAgICByZXR1cm4gJ2xpbmsnO1xuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gJ290aGVyJztcbiAgfVxufVxuIl19