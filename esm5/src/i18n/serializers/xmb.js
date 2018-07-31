/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as tslib_1 from "tslib";
import { decimalDigest } from '../digest';
import { Serializer, SimplePlaceholderMapper } from './serializer';
import * as xml from './xml_helper';
var _MESSAGES_TAG = 'messagebundle';
var _MESSAGE_TAG = 'msg';
var _PLACEHOLDER_TAG = 'ph';
var _EXAMPLE_TAG = 'ex';
var _SOURCE_TAG = 'source';
var _DOCTYPE = "<!ELEMENT messagebundle (msg)*>\n<!ATTLIST messagebundle class CDATA #IMPLIED>\n\n<!ELEMENT msg (#PCDATA|ph|source)*>\n<!ATTLIST msg id CDATA #IMPLIED>\n<!ATTLIST msg seq CDATA #IMPLIED>\n<!ATTLIST msg name CDATA #IMPLIED>\n<!ATTLIST msg desc CDATA #IMPLIED>\n<!ATTLIST msg meaning CDATA #IMPLIED>\n<!ATTLIST msg obsolete (obsolete) #IMPLIED>\n<!ATTLIST msg xml:space (default|preserve) \"default\">\n<!ATTLIST msg is_hidden CDATA #IMPLIED>\n\n<!ELEMENT source (#PCDATA)>\n\n<!ELEMENT ph (#PCDATA|ex)*>\n<!ATTLIST ph name CDATA #REQUIRED>\n\n<!ELEMENT ex (#PCDATA)>";
var Xmb = /** @class */ (function (_super) {
    tslib_1.__extends(Xmb, _super);
    function Xmb() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Xmb.prototype.write = function (messages, locale) {
        var exampleVisitor = new ExampleVisitor();
        var visitor = new _Visitor();
        var rootNode = new xml.Tag(_MESSAGES_TAG);
        messages.forEach(function (message) {
            var attrs = { id: message.id };
            if (message.description) {
                attrs['desc'] = message.description;
            }
            if (message.meaning) {
                attrs['meaning'] = message.meaning;
            }
            var sourceTags = [];
            message.sources.forEach(function (source) {
                sourceTags.push(new xml.Tag(_SOURCE_TAG, {}, [
                    new xml.Text(source.filePath + ":" + source.startLine + (source.endLine !== source.startLine ? ',' + source.endLine : ''))
                ]));
            });
            rootNode.children.push(new xml.CR(2), new xml.Tag(_MESSAGE_TAG, attrs, tslib_1.__spread(sourceTags, visitor.serialize(message.nodes))));
        });
        rootNode.children.push(new xml.CR());
        return xml.serialize([
            new xml.Declaration({ version: '1.0', encoding: 'UTF-8' }),
            new xml.CR(),
            new xml.Doctype(_MESSAGES_TAG, _DOCTYPE),
            new xml.CR(),
            exampleVisitor.addDefaultExamples(rootNode),
            new xml.CR(),
        ]);
    };
    Xmb.prototype.load = function (content, url) {
        throw new Error('Unsupported');
    };
    Xmb.prototype.digest = function (message) { return digest(message); };
    Xmb.prototype.createNameMapper = function (message) {
        return new SimplePlaceholderMapper(message, toPublicName);
    };
    return Xmb;
}(Serializer));
export { Xmb };
var _Visitor = /** @class */ (function () {
    function _Visitor() {
    }
    _Visitor.prototype.visitText = function (text, context) { return [new xml.Text(text.value)]; };
    _Visitor.prototype.visitContainer = function (container, context) {
        var _this = this;
        var nodes = [];
        container.children.forEach(function (node) { return nodes.push.apply(nodes, tslib_1.__spread(node.visit(_this))); });
        return nodes;
    };
    _Visitor.prototype.visitIcu = function (icu, context) {
        var _this = this;
        var nodes = [new xml.Text("{" + icu.expressionPlaceholder + ", " + icu.type + ", ")];
        Object.keys(icu.cases).forEach(function (c) {
            nodes.push.apply(nodes, tslib_1.__spread([new xml.Text(c + " {")], icu.cases[c].visit(_this), [new xml.Text("} ")]));
        });
        nodes.push(new xml.Text("}"));
        return nodes;
    };
    _Visitor.prototype.visitTagPlaceholder = function (ph, context) {
        var startTagAsText = new xml.Text("<" + ph.tag + ">");
        var startEx = new xml.Tag(_EXAMPLE_TAG, {}, [startTagAsText]);
        // TC requires PH to have a non empty EX, and uses the text node to show the "original" value.
        var startTagPh = new xml.Tag(_PLACEHOLDER_TAG, { name: ph.startName }, [startEx, startTagAsText]);
        if (ph.isVoid) {
            // void tags have no children nor closing tags
            return [startTagPh];
        }
        var closeTagAsText = new xml.Text("</" + ph.tag + ">");
        var closeEx = new xml.Tag(_EXAMPLE_TAG, {}, [closeTagAsText]);
        // TC requires PH to have a non empty EX, and uses the text node to show the "original" value.
        var closeTagPh = new xml.Tag(_PLACEHOLDER_TAG, { name: ph.closeName }, [closeEx, closeTagAsText]);
        return tslib_1.__spread([startTagPh], this.serialize(ph.children), [closeTagPh]);
    };
    _Visitor.prototype.visitPlaceholder = function (ph, context) {
        var interpolationAsText = new xml.Text("{{" + ph.value + "}}");
        // Example tag needs to be not-empty for TC.
        var exTag = new xml.Tag(_EXAMPLE_TAG, {}, [interpolationAsText]);
        return [
            // TC requires PH to have a non empty EX, and uses the text node to show the "original" value.
            new xml.Tag(_PLACEHOLDER_TAG, { name: ph.name }, [exTag, interpolationAsText])
        ];
    };
    _Visitor.prototype.visitIcuPlaceholder = function (ph, context) {
        var icuExpression = ph.value.expression;
        var icuType = ph.value.type;
        var icuCases = Object.keys(ph.value.cases).map(function (value) { return value + ' {...}'; }).join(' ');
        var icuAsText = new xml.Text("{" + icuExpression + ", " + icuType + ", " + icuCases + "}");
        var exTag = new xml.Tag(_EXAMPLE_TAG, {}, [icuAsText]);
        return [
            // TC requires PH to have a non empty EX, and uses the text node to show the "original" value.
            new xml.Tag(_PLACEHOLDER_TAG, { name: ph.name }, [exTag, icuAsText])
        ];
    };
    _Visitor.prototype.serialize = function (nodes) {
        var _this = this;
        return [].concat.apply([], tslib_1.__spread(nodes.map(function (node) { return node.visit(_this); })));
    };
    return _Visitor;
}());
export function digest(message) {
    return decimalDigest(message);
}
// TC requires at least one non-empty example on placeholders
var ExampleVisitor = /** @class */ (function () {
    function ExampleVisitor() {
    }
    ExampleVisitor.prototype.addDefaultExamples = function (node) {
        node.visit(this);
        return node;
    };
    ExampleVisitor.prototype.visitTag = function (tag) {
        var _this = this;
        if (tag.name === _PLACEHOLDER_TAG) {
            if (!tag.children || tag.children.length == 0) {
                var exText = new xml.Text(tag.attrs['name'] || '...');
                tag.children = [new xml.Tag(_EXAMPLE_TAG, {}, [exText])];
            }
        }
        else if (tag.children) {
            tag.children.forEach(function (node) { return node.visit(_this); });
        }
    };
    ExampleVisitor.prototype.visitText = function (text) { };
    ExampleVisitor.prototype.visitDeclaration = function (decl) { };
    ExampleVisitor.prototype.visitDoctype = function (doctype) { };
    return ExampleVisitor;
}());
// XMB/XTB placeholders can only contain A-Z, 0-9 and _
export function toPublicName(internalName) {
    return internalName.toUpperCase().replace(/[^A-Z0-9_]/g, '_');
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoieG1iLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXIvc3JjL2kxOG4vc2VyaWFsaXplcnMveG1iLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7QUFFSCxPQUFPLEVBQUMsYUFBYSxFQUFDLE1BQU0sV0FBVyxDQUFDO0FBR3hDLE9BQU8sRUFBb0IsVUFBVSxFQUFFLHVCQUF1QixFQUFDLE1BQU0sY0FBYyxDQUFDO0FBQ3BGLE9BQU8sS0FBSyxHQUFHLE1BQU0sY0FBYyxDQUFDO0FBRXBDLElBQU0sYUFBYSxHQUFHLGVBQWUsQ0FBQztBQUN0QyxJQUFNLFlBQVksR0FBRyxLQUFLLENBQUM7QUFDM0IsSUFBTSxnQkFBZ0IsR0FBRyxJQUFJLENBQUM7QUFDOUIsSUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDO0FBQzFCLElBQU0sV0FBVyxHQUFHLFFBQVEsQ0FBQztBQUU3QixJQUFNLFFBQVEsR0FBRyx1akJBa0JPLENBQUM7QUFFekI7SUFBeUIsK0JBQVU7SUFBbkM7O0lBcURBLENBQUM7SUFwREMsbUJBQUssR0FBTCxVQUFNLFFBQXdCLEVBQUUsTUFBbUI7UUFDakQsSUFBTSxjQUFjLEdBQUcsSUFBSSxjQUFjLEVBQUUsQ0FBQztRQUM1QyxJQUFNLE9BQU8sR0FBRyxJQUFJLFFBQVEsRUFBRSxDQUFDO1FBQy9CLElBQUksUUFBUSxHQUFHLElBQUksR0FBRyxDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUUxQyxRQUFRLENBQUMsT0FBTyxDQUFDLFVBQUEsT0FBTztZQUN0QixJQUFNLEtBQUssR0FBMEIsRUFBQyxFQUFFLEVBQUUsT0FBTyxDQUFDLEVBQUUsRUFBQyxDQUFDO1lBRXRELEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDO2dCQUN4QixLQUFLLENBQUMsTUFBTSxDQUFDLEdBQUcsT0FB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LENBQUM7SUFDaEQscUNBQVksR0FBWixVQUFhLE9BQW9CLElBQVMsQ0FBQztJQUM3QyxxQkFBQztBQUFELENBQUMsQUFwQkQsSUFvQkM7QUFFRCx1REFBdUQ7QUFDdkQsTUFBTSx1QkFBdUIsWUFBb0I7SUFDL0MsTUFBTSxDQUFDLFlBQVksQ0FBQyxXQUFXLEVBQUUsQ0FBQyxPQUFPLENBQUMsYUFBYSxFQUFFLEdBQUcsQ0FBQyxDQUFDO0FBQ2hFLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7ZGVjaW1hbERpZ2VzdH0gZnJvbSAnLi4vZGlnZXN0JztcbmltcG9ydCAqIGFzIGkxOG4gZnJvbSAnLi4vaTE4bl9hc3QnO1xuXG5pbXBvcnQge1BsYWNlaG9sZGVyTWFwcGVyLCBTZXJpYWxpemVyLCBTaW1wbGVQbGFjZWhvbGRlck1hcHBlcn0gZnJvbSAnLi9zZXJpYWxpemVyJztcbmltcG9ydCAqIGFzIHhtbCBmcm9tICcuL3htbF9oZWxwZXInO1xuXG5jb25zdCBfTUVTU0FHRVNfVEFHID0gJ21lc3NhZ2VidW5kbGUnO1xuY29uc3QgX01FU1NBR0VfVEFHID0gJ21zZyc7XG5jb25zdCBfUExBQ0VIT0xERVJfVEFHID0gJ3BoJztcbmNvbnN0IF9FWEFNUExFX1RBRyA9ICdleCc7XG5jb25zdCBfU09VUkNFX1RBRyA9ICdzb3VyY2UnO1xuXG5jb25zdCBfRE9DVFlQRSA9IGA8IUVMRU1FTlQgbWVzc2FnZWJ1bmRsZSAobXNnKSo+XG48IUFUVExJU1QgbWVzc2FnZWJ1bmRsZSBjbGFzcyBDREFUQSAjSU1QTElFRD5cblxuPCFFTEVNRU5UIG1zZyAoI1BDREFUQXxwaHxzb3VyY2UpKj5cbjwhQVRUTElTVCBtc2cgaWQgQ0RBVEEgI0lNUExJRUQ+XG48IUFUVExJU1QgbXNnIHNlcSBDREFUQSAjSU1QTElFRD5cbjwhQVRUTElTVCBtc2cgbmFtZSBDREFUQSAjSU1QTElFRD5cbjwhQVRUTElTVCBtc2cgZGVzYyBDREFUQSAjSU1QTElFRD5cbjwhQVRUTElTVCBtc2cgbWVhbmluZyBDREFUQSAjSU1QTElFRD5cbjwhQVRUTElTVCBtc2cgb2Jzb2xldGUgKG9ic29sZXRlKSAjSU1QTElFRD5cbjwhQVRUTElTVCBtc2cgeG1sOnNwYWNlIChkZWZhdWx0fHByZXNlcnZlKSBcImRlZmF1bHRcIj5cbjwhQVRUTElTVCBtc2cgaXNfaGlkZGVuIENEQVRBICNJTVBMSUVEPlxuXG48IUVMRU1FTlQgc291cmNlICgjUENEQVRBKT5cblxuPCFFTEVNRU5UIHBoICgjUENEQVRBfGV4KSo+XG48IUFUVExJU1QgcGggbmFtZSBDREFUQSAjUkVRVUlSRUQ+XG5cbjwhRUxFTUVOVCBleCAoI1BDREFUQSk+YDtcblxuZXhwb3J0IGNsYXNzIFhtYiBleHRlbmRzIFNlcmlhbGl6ZXIge1xuICB3cml0ZShtZXNzYWdlczogaTE4bi5NZXNzYWdlW10sIGxvY2FsZTogc3RyaW5nfG51bGwpOiBzdHJpbmcge1xuICAgIGNvbnN0IGV4YW1wbGVWaXNpdG9yID0gbmV3IEV4YW1wbGVWaXNpdG9yKCk7XG4gICAgY29uc3QgdmlzaXRvciA9IG5ldyBfVmlzaXRvcigpO1xuICAgIGxldCByb290Tm9kZSA9IG5ldyB4bWwuVGFnKF9NRVNTQUdFU19UQUcpO1xuXG4gICAgbWVzc2FnZXMuZm9yRWFjaChtZXNzYWdlID0+IHtcbiAgICAgIGNvbnN0IGF0dHJzOiB7W2s6IHN0cmluZ106IHN0cmluZ30gPSB7aWQ6IG1lc3NhZ2UuaWR9O1xuXG4gICAgICBpZiAobWVzc2FnZS5kZXNjcmlwdGlvbikge1xuICAgICAgICBhdHRyc1snZGVzYyddID0gbWVzc2FnZS5kZXNjcmlwdGlvbjtcbiAgICAgIH1cblxuICAgICAgaWYgKG1lc3NhZ2UubWVhbmluZykge1xuICAgICAgICBhdHRyc1snbWVhbmluZyddID0gbWVzc2FnZS5tZWFuaW5nO1xuICAgICAgfVxuXG4gICAgICBsZXQgc291cmNlVGFnczogeG1sLlRhZ1tdID0gW107XG4gICAgICBtZXNzYWdlLnNvdXJjZXMuZm9yRWFjaCgoc291cmNlOiBpMThuLk1lc3NhZ2VTcGFuKSA9PiB7XG4gICAgICAgIHNvdXJjZVRhZ3MucHVzaChuZXcgeG1sLlRhZyhfU09VUkNFX1RBRywge30sIFtcbiAgICAgICAgICBuZXcgeG1sLlRleHQoXG4gICAgICAgICAgICAgIGAke3NvdXJjZS5maWxlUGF0aH06JHtzb3VyY2Uuc3RhcnRMaW5lfSR7c291cmNlLmVuZExpbmUgIT09IHNvdXJjZS5zdGFydExpbmUgPyAnLCcgKyBzb3VyY2UuZW5kTGluZSA6ICcnfWApXG4gICAgICAgIF0pKTtcbiAgICAgIH0pO1xuXG4gICAgICByb290Tm9kZS5jaGlsZHJlbi5wdXNoKFxuICAgICAgICAgIG5ldyB4bWwuQ1IoMiksXG4gICAgICAgICAgbmV3IHhtbC5UYWcoX01FU1NBR0VfVEFHLCBhdHRycywgWy4uLnNvdXJjZVRhZ3MsIC4uLnZpc2l0b3Iuc2VyaWFsaXplKG1lc3NhZ2Uubm9kZXMpXSkpO1xuICAgIH0pO1xuXG4gICAgcm9vdE5vZGUuY2hpbGRyZW4ucHVzaChuZXcgeG1sLkNSKCkpO1xuXG4gICAgcmV0dXJuIHhtbC5zZXJpYWxpemUoW1xuICAgICAgbmV3IHhtbC5EZWNsYXJhdGlvbih7dmVyc2lvbjogJzEuMCcsIGVuY29kaW5nOiAnVVRGLTgnfSksXG4gICAgICBuZXcgeG1sLkNSKCksXG4gICAgICBuZXcgeG1sLkRvY3R5cGUoX01FU1NBR0VTX1RBRywgX0RPQ1RZUEUpLFxuICAgICAgbmV3IHhtbC5DUigpLFxuICAgICAgZXhhbXBsZVZpc2l0b3IuYWRkRGVmYXVsdEV4YW1wbGVzKHJvb3ROb2RlKSxcbiAgICAgIG5ldyB4bWwuQ1IoKSxcbiAgICBdKTtcbiAgfVxuXG4gIGxvYWQoY29udGVudDogc3RyaW5nLCB1cmw6IHN0cmluZyk6XG4gICAgICB7bG9jYWxlOiBzdHJpbmcsIGkxOG5Ob2Rlc0J5TXNnSWQ6IHtbbXNnSWQ6IHN0cmluZ106IGkxOG4uTm9kZVtdfX0ge1xuICAgIHRocm93IG5ldyBFcnJvcignVW5zdXBwb3J0ZWQnKTtcbiAgfVxuXG4gIGRpZ2VzdChtZXNzYWdlOiBpMThuLk1lc3NhZ2UpOiBzdHJpbmcgeyByZXR1cm4gZGlnZXN0KG1lc3NhZ2UpOyB9XG5cblxuICBjcmVhdGVOYW1lTWFwcGVyKG1lc3NhZ2U6IGkxOG4uTWVzc2FnZSk6IFBsYWNlaG9sZGVyTWFwcGVyIHtcbiAgICByZXR1cm4gbmV3IFNpbXBsZVBsYWNlaG9sZGVyTWFwcGVyKG1lc3NhZ2UsIHRvUHVibGljTmFtZSk7XG4gIH1cbn1cblxuY2xhc3MgX1Zpc2l0b3IgaW1wbGVtZW50cyBpMThuLlZpc2l0b3Ige1xuICB2aXNpdFRleHQodGV4dDogaTE4bi5UZXh0LCBjb250ZXh0PzogYW55KTogeG1sLk5vZGVbXSB7IHJldHVybiBbbmV3IHhtbC5UZXh0KHRleHQudmFsdWUpXTsgfVxuXG4gIHZpc2l0Q29udGFpbmVyKGNvbnRhaW5lcjogaTE4bi5Db250YWluZXIsIGNvbnRleHQ6IGFueSk6IHhtbC5Ob2RlW10ge1xuICAgIGNvbnN0IG5vZGVzOiB4bWwuTm9kZVtdID0gW107XG4gICAgY29udGFpbmVyLmNoaWxkcmVuLmZvckVhY2goKG5vZGU6IGkxOG4uTm9kZSkgPT4gbm9kZXMucHVzaCguLi5ub2RlLnZpc2l0KHRoaXMpKSk7XG4gICAgcmV0dXJuIG5vZGVzO1xuICB9XG5cbiAgdmlzaXRJY3UoaWN1OiBpMThuLkljdSwgY29udGV4dD86IGFueSk6IHhtbC5Ob2RlW10ge1xuICAgIGNvbnN0IG5vZGVzID0gW25ldyB4bWwuVGV4dChgeyR7aWN1LmV4cHJlc3Npb25QbGFjZWhvbGRlcn0sICR7aWN1LnR5cGV9LCBgKV07XG5cbiAgICBPYmplY3Qua2V5cyhpY3UuY2FzZXMpLmZvckVhY2goKGM6IHN0cmluZykgPT4ge1xuICAgICAgbm9kZXMucHVzaChuZXcgeG1sLlRleHQoYCR7Y30ge2ApLCAuLi5pY3UuY2FzZXNbY10udmlzaXQodGhpcyksIG5ldyB4bWwuVGV4dChgfSBgKSk7XG4gICAgfSk7XG5cbiAgICBub2Rlcy5wdXNoKG5ldyB4bWwuVGV4dChgfWApKTtcblxuICAgIHJldHVybiBub2RlcztcbiAgfVxuXG4gIHZpc2l0VGFnUGxhY2Vob2xkZXIocGg6IGkxOG4uVGFnUGxhY2Vob2xkZXIsIGNvbnRleHQ/OiBhbnkpOiB4bWwuTm9kZVtdIHtcbiAgICBjb25zdCBzdGFydFRhZ0FzVGV4dCA9IG5ldyB4bWwuVGV4dChgPCR7cGgudGFnfT5gKTtcbiAgICBjb25zdCBzdGFydEV4ID0gbmV3IHhtbC5UYWcoX0VYQU1QTEVfVEFHLCB7fSwgW3N0YXJ0VGFnQXNUZXh0XSk7XG4gICAgLy8gVEMgcmVxdWlyZXMgUEggdG8gaGF2ZSBhIG5vbiBlbXB0eSBFWCwgYW5kIHVzZXMgdGhlIHRleHQgbm9kZSB0byBzaG93IHRoZSBcIm9yaWdpbmFsXCIgdmFsdWUuXG4gICAgY29uc3Qgc3RhcnRUYWdQaCA9XG4gICAgICAgIG5ldyB4bWwuVGFnKF9QTEFDRUhPTERFUl9UQUcsIHtuYW1lOiBwaC5zdGFydE5hbWV9LCBbc3RhcnRFeCwgc3RhcnRUYWdBc1RleHRdKTtcbiAgICBpZiAocGguaXNWb2lkKSB7XG4gICAgICAvLyB2b2lkIHRhZ3MgaGF2ZSBubyBjaGlsZHJlbiBub3IgY2xvc2luZyB0YWdzXG4gICAgICByZXR1cm4gW3N0YXJ0VGFnUGhdO1xuICAgIH1cblxuICAgIGNvbnN0IGNsb3NlVGFnQXNUZXh0ID0gbmV3IHhtbC5UZXh0KGA8LyR7cGgudGFnfT5gKTtcbiAgICBjb25zdCBjbG9zZUV4ID0gbmV3IHhtbC5UYWcoX0VYQU1QTEVfVEFHLCB7fSwgW2Nsb3NlVGFnQXNUZXh0XSk7XG4gICAgLy8gVEMgcmVxdWlyZXMgUEggdG8gaGF2ZSBhIG5vbiBlbXB0eSBFWCwgYW5kIHVzZXMgdGhlIHRleHQgbm9kZSB0byBzaG93IHRoZSBcIm9yaWdpbmFsXCIgdmFsdWUuXG4gICAgY29uc3QgY2xvc2VUYWdQaCA9XG4gICAgICAgIG5ldyB4bWwuVGFnKF9QTEFDRUhPTERFUl9UQUcsIHtuYW1lOiBwaC5jbG9zZU5hbWV9LCBbY2xvc2VFeCwgY2xvc2VUYWdBc1RleHRdKTtcblxuICAgIHJldHVybiBbc3RhcnRUYWdQaCwgLi4udGhpcy5zZXJpYWxpemUocGguY2hpbGRyZW4pLCBjbG9zZVRhZ1BoXTtcbiAgfVxuXG4gIHZpc2l0UGxhY2Vob2xkZXIocGg6IGkxOG4uUGxhY2Vob2xkZXIsIGNvbnRleHQ/OiBhbnkpOiB4bWwuTm9kZVtdIHtcbiAgICBjb25zdCBpbnRlcnBvbGF0aW9uQXNUZXh0ID0gbmV3IHhtbC5UZXh0KGB7eyR7cGgudmFsdWV9fX1gKTtcbiAgICAvLyBFeGFtcGxlIHRhZyBuZWVkcyB0byBiZSBub3QtZW1wdHkgZm9yIFRDLlxuICAgIGNvbnN0IGV4VGFnID0gbmV3IHhtbC5UYWcoX0VYQU1QTEVfVEFHLCB7fSwgW2ludGVycG9sYXRpb25Bc1RleHRdKTtcbiAgICByZXR1cm4gW1xuICAgICAgLy8gVEMgcmVxdWlyZXMgUEggdG8gaGF2ZSBhIG5vbiBlbXB0eSBFWCwgYW5kIHVzZXMgdGhlIHRleHQgbm9kZSB0byBzaG93IHRoZSBcIm9yaWdpbmFsXCIgdmFsdWUuXG4gICAgICBuZXcgeG1sLlRhZyhfUExBQ0VIT0xERVJfVEFHLCB7bmFtZTogcGgubmFtZX0sIFtleFRhZywgaW50ZXJwb2xhdGlvbkFzVGV4dF0pXG4gICAgXTtcbiAgfVxuXG4gIHZpc2l0SWN1UGxhY2Vob2xkZXIocGg6IGkxOG4uSWN1UGxhY2Vob2xkZXIsIGNvbnRleHQ/OiBhbnkpOiB4bWwuTm9kZVtdIHtcbiAgICBjb25zdCBpY3VFeHByZXNzaW9uID0gcGgudmFsdWUuZXhwcmVzc2lvbjtcbiAgICBjb25zdCBpY3VUeXBlID0gcGgudmFsdWUudHlwZTtcbiAgICBjb25zdCBpY3VDYXNlcyA9IE9iamVjdC5rZXlzKHBoLnZhbHVlLmNhc2VzKS5tYXAoKHZhbHVlOiBzdHJpbmcpID0+IHZhbHVlICsgJyB7Li4ufScpLmpvaW4oJyAnKTtcbiAgICBjb25zdCBpY3VBc1RleHQgPSBuZXcgeG1sLlRleHQoYHske2ljdUV4cHJlc3Npb259LCAke2ljdVR5cGV9LCAke2ljdUNhc2VzfX1gKTtcbiAgICBjb25zdCBleFRhZyA9IG5ldyB4bWwuVGFnKF9FWEFNUExFX1RBRywge30sIFtpY3VBc1RleHRdKTtcbiAgICByZXR1cm4gW1xuICAgICAgLy8gVEMgcmVxdWlyZXMgUEggdG8gaGF2ZSBhIG5vbiBlbXB0eSBFWCwgYW5kIHVzZXMgdGhlIHRleHQgbm9kZSB0byBzaG93IHRoZSBcIm9yaWdpbmFsXCIgdmFsdWUuXG4gICAgICBuZXcgeG1sLlRhZyhfUExBQ0VIT0xERVJfVEFHLCB7bmFtZTogcGgubmFtZX0sIFtleFRhZywgaWN1QXNUZXh0XSlcbiAgICBdO1xuICB9XG5cbiAgc2VyaWFsaXplKG5vZGVzOiBpMThuLk5vZGVbXSk6IHhtbC5Ob2RlW10ge1xuICAgIHJldHVybiBbXS5jb25jYXQoLi4ubm9kZXMubWFwKG5vZGUgPT4gbm9kZS52aXNpdCh0aGlzKSkpO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkaWdlc3QobWVzc2FnZTogaTE4bi5NZXNzYWdlKTogc3RyaW5nIHtcbiAgcmV0dXJuIGRlY2ltYWxEaWdlc3QobWVzc2FnZSk7XG59XG5cbi8vIFRDIHJlcXVpcmVzIGF0IGxlYXN0IG9uZSBub24tZW1wdHkgZXhhbXBsZSBvbiBwbGFjZWhvbGRlcnNcbmNsYXNzIEV4YW1wbGVWaXNpdG9yIGltcGxlbWVudHMgeG1sLklWaXNpdG9yIHtcbiAgYWRkRGVmYXVsdEV4YW1wbGVzKG5vZGU6IHhtbC5Ob2RlKTogeG1sLk5vZGUge1xuICAgIG5vZGUudmlzaXQodGhpcyk7XG4gICAgcmV0dXJuIG5vZGU7XG4gIH1cblxuICB2aXNpdFRhZyh0YWc6IHhtbC5UYWcpOiB2b2lkIHtcbiAgICBpZiAodGFnLm5hbWUgPT09IF9QTEFDRUhPTERFUl9UQUcpIHtcbiAgICAgIGlmICghdGFnLmNoaWxkcmVuIHx8IHRhZy5jaGlsZHJlbi5sZW5ndGggPT0gMCkge1xuICAgICAgICBjb25zdCBleFRleHQgPSBuZXcgeG1sLlRleHQodGFnLmF0dHJzWyduYW1lJ10gfHwgJy4uLicpO1xuICAgICAgICB0YWcuY2hpbGRyZW4gPSBbbmV3IHhtbC5UYWcoX0VYQU1QTEVfVEFHLCB7fSwgW2V4VGV4dF0pXTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKHRhZy5jaGlsZHJlbikge1xuICAgICAgdGFnLmNoaWxkcmVuLmZvckVhY2gobm9kZSA9PiBub2RlLnZpc2l0KHRoaXMpKTtcbiAgICB9XG4gIH1cblxuICB2aXNpdFRleHQodGV4dDogeG1sLlRleHQpOiB2b2lkIHt9XG4gIHZpc2l0RGVjbGFyYXRpb24oZGVjbDogeG1sLkRlY2xhcmF0aW9uKTogdm9pZCB7fVxuICB2aXNpdERvY3R5cGUoZG9jdHlwZTogeG1sLkRvY3R5cGUpOiB2b2lkIHt9XG59XG5cbi8vIFhNQi9YVEIgcGxhY2Vob2xkZXJzIGNhbiBvbmx5IGNvbnRhaW4gQS1aLCAwLTkgYW5kIF9cbmV4cG9ydCBmdW5jdGlvbiB0b1B1YmxpY05hbWUoaW50ZXJuYWxOYW1lOiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gaW50ZXJuYWxOYW1lLnRvVXBwZXJDYXNlKCkucmVwbGFjZSgvW15BLVowLTlfXS9nLCAnXycpO1xufVxuIl19