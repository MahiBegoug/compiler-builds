/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as tslib_1 from "tslib";
import * as i18n from '../../../i18n/i18n_ast';
import { toPublicName } from '../../../i18n/serializers/xmb';
import { mapLiteral } from '../../../output/map_util';
import * as o from '../../../output/output_ast';
import { Identifiers as R3 } from '../../r3_identifiers';
/* Closure variables holding messages must be named `MSG_[A-Z0-9]+` */
var CLOSURE_TRANSLATION_PREFIX = 'MSG_';
/* Prefix for non-`goog.getMsg` i18n-related vars */
export var TRANSLATION_PREFIX = 'I18N_';
/** Closure uses `goog.getMsg(message)` to lookup translations */
var GOOG_GET_MSG = 'goog.getMsg';
/** Name of the global variable that is used to determine if we use Closure translations or not */
var NG_I18N_CLOSURE_MODE = 'ngI18nClosureMode';
/** I18n separators for metadata **/
var I18N_MEANING_SEPARATOR = '|';
var I18N_ID_SEPARATOR = '@@';
/** Name of the i18n attributes **/
export var I18N_ATTR = 'i18n';
export var I18N_ATTR_PREFIX = 'i18n-';
/** Prefix of var expressions used in ICUs */
export var I18N_ICU_VAR_PREFIX = 'VAR_';
/** Prefix of ICU expressions for post processing */
export var I18N_ICU_MAPPING_PREFIX = 'I18N_EXP_';
/** Placeholder wrapper for i18n expressions **/
export var I18N_PLACEHOLDER_SYMBOL = '�';
function i18nTranslationToDeclStmt(variable, closureVar, message, meta, params) {
    var statements = [];
    // var I18N_X;
    statements.push(new o.DeclareVarStmt(variable.name, undefined, o.INFERRED_TYPE, null, variable.sourceSpan));
    var args = [o.literal(message)];
    if (params && Object.keys(params).length) {
        args.push(mapLiteral(params, true));
    }
    // Closure JSDoc comments
    var docStatements = i18nMetaToDocStmt(meta);
    var thenStatements = docStatements ? [docStatements] : [];
    var googFnCall = o.variable(GOOG_GET_MSG).callFn(args);
    // const MSG_... = goog.getMsg(..);
    thenStatements.push(closureVar.set(googFnCall).toConstDecl());
    // I18N_X = MSG_...;
    thenStatements.push(new o.ExpressionStatement(variable.set(closureVar)));
    var localizeFnCall = o.importExpr(R3.i18nLocalize).callFn(args);
    // I18N_X = i18nLocalize(...);
    var elseStatements = [new o.ExpressionStatement(variable.set(localizeFnCall))];
    // if(ngI18nClosureMode) { ... } else { ... }
    statements.push(o.ifStmt(o.variable(NG_I18N_CLOSURE_MODE), thenStatements, elseStatements));
    return statements;
}
// Converts i18n meta information for a message (id, description, meaning)
// to a JsDoc statement formatted as expected by the Closure compiler.
function i18nMetaToDocStmt(meta) {
    var tags = [];
    if (meta.description) {
        tags.push({ tagName: "desc" /* Desc */, text: meta.description });
    }
    if (meta.meaning) {
        tags.push({ tagName: "meaning" /* Meaning */, text: meta.meaning });
    }
    return tags.length == 0 ? null : new o.JSDocCommentStmt(tags);
}
export function isI18nAttribute(name) {
    return name === I18N_ATTR || name.startsWith(I18N_ATTR_PREFIX);
}
export function isI18nRootNode(meta) {
    return meta instanceof i18n.Message;
}
export function isSingleI18nIcu(meta) {
    return isI18nRootNode(meta) && meta.nodes.length === 1 && meta.nodes[0] instanceof i18n.Icu;
}
export function hasI18nAttrs(element) {
    return element.attrs.some(function (attr) { return isI18nAttribute(attr.name); });
}
export function metaFromI18nMessage(message, id) {
    if (id === void 0) { id = null; }
    return {
        id: typeof id === 'string' ? id : message.id || '',
        meaning: message.meaning || '',
        description: message.description || ''
    };
}
export function icuFromI18nMessage(message) {
    return message.nodes[0];
}
export function wrapI18nPlaceholder(content, contextId) {
    if (contextId === void 0) { contextId = 0; }
    var blockId = contextId > 0 ? ":" + contextId : '';
    return "" + I18N_PLACEHOLDER_SYMBOL + content + blockId + I18N_PLACEHOLDER_SYMBOL;
}
export function assembleI18nBoundString(strings, bindingStartIndex, contextId) {
    if (bindingStartIndex === void 0) { bindingStartIndex = 0; }
    if (contextId === void 0) { contextId = 0; }
    if (!strings.length)
        return '';
    var acc = '';
    var lastIdx = strings.length - 1;
    for (var i = 0; i < lastIdx; i++) {
        acc += "" + strings[i] + wrapI18nPlaceholder(bindingStartIndex + i, contextId);
    }
    acc += strings[lastIdx];
    return acc;
}
export function getSeqNumberGenerator(startsAt) {
    if (startsAt === void 0) { startsAt = 0; }
    var current = startsAt;
    return function () { return current++; };
}
export function placeholdersToParams(placeholders) {
    var params = {};
    placeholders.forEach(function (values, key) {
        params[key] = o.literal(values.length > 1 ? "[" + values.join('|') + "]" : values[0]);
    });
    return params;
}
export function updatePlaceholderMap(map, name) {
    var values = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        values[_i - 2] = arguments[_i];
    }
    var current = map.get(name) || [];
    current.push.apply(current, tslib_1.__spread(values));
    map.set(name, current);
}
export function assembleBoundTextPlaceholders(meta, bindingStartIndex, contextId) {
    if (bindingStartIndex === void 0) { bindingStartIndex = 0; }
    if (contextId === void 0) { contextId = 0; }
    var startIdx = bindingStartIndex;
    var placeholders = new Map();
    var node = meta instanceof i18n.Message ? meta.nodes.find(function (node) { return node instanceof i18n.Container; }) : meta;
    if (node) {
        node
            .children.filter(function (child) { return child instanceof i18n.Placeholder; })
            .forEach(function (child, idx) {
            var content = wrapI18nPlaceholder(startIdx + idx, contextId);
            updatePlaceholderMap(placeholders, child.name, content);
        });
    }
    return placeholders;
}
export function findIndex(items, callback) {
    for (var i = 0; i < items.length; i++) {
        if (callback(items[i])) {
            return i;
        }
    }
    return -1;
}
/**
 * Parses i18n metas like:
 *  - "@@id",
 *  - "description[@@id]",
 *  - "meaning|description[@@id]"
 * and returns an object with parsed output.
 *
 * @param meta String that represents i18n meta
 * @returns Object with id, meaning and description fields
 */
export function parseI18nMeta(meta) {
    var _a, _b;
    var id;
    var meaning;
    var description;
    if (meta) {
        var idIndex = meta.indexOf(I18N_ID_SEPARATOR);
        var descIndex = meta.indexOf(I18N_MEANING_SEPARATOR);
        var meaningAndDesc = void 0;
        _a = tslib_1.__read((idIndex > -1) ? [meta.slice(0, idIndex), meta.slice(idIndex + 2)] : [meta, ''], 2), meaningAndDesc = _a[0], id = _a[1];
        _b = tslib_1.__read((descIndex > -1) ?
            [meaningAndDesc.slice(0, descIndex), meaningAndDesc.slice(descIndex + 1)] :
            ['', meaningAndDesc], 2), meaning = _b[0], description = _b[1];
    }
    return { id: id, meaning: meaning, description: description };
}
/**
 * Converts internal placeholder names to public-facing format
 * (for example to use in goog.getMsg call).
 * Example: `START_TAG_DIV_1` is converted to `startTagDiv_1`.
 *
 * @param name The placeholder name that should be formatted
 * @returns Formatted placeholder name
 */
export function formatI18nPlaceholderName(name, useCamelCase) {
    if (useCamelCase === void 0) { useCamelCase = true; }
    var publicName = toPublicName(name);
    if (!useCamelCase) {
        return publicName;
    }
    var chunks = publicName.split('_');
    if (chunks.length === 1) {
        // if no "_" found - just lowercase the value
        return name.toLowerCase();
    }
    var postfix;
    // eject last element if it's a number
    if (/^\d+$/.test(chunks[chunks.length - 1])) {
        postfix = chunks.pop();
    }
    var raw = chunks.shift().toLowerCase();
    if (chunks.length) {
        raw += chunks.map(function (c) { return c.charAt(0).toUpperCase() + c.slice(1).toLowerCase(); }).join('');
    }
    return postfix ? raw + "_" + postfix : raw;
}
/**
 * Generates a prefix for translation const name.
 *
 * @param extra Additional local prefix that should be injected into translation var name
 * @returns Complete translation const prefix
 */
export function getTranslationConstPrefix(extra) {
    return ("" + CLOSURE_TRANSLATION_PREFIX + extra).toUpperCase();
}
/**
 * Generates translation declaration statements.
 *
 * @param variable Translation value reference
 * @param closureVar Variable for Closure `goog.getMsg` calls
 * @param message Text message to be translated
 * @param meta Object that contains meta information (id, meaning and description)
 * @param params Object with placeholders key-value pairs
 * @param transformFn Optional transformation (post processing) function reference
 * @returns Array of Statements that represent a given translation
 */
export function getTranslationDeclStmts(variable, closureVar, message, meta, params, transformFn) {
    if (params === void 0) { params = {}; }
    var statements = [];
    statements.push.apply(statements, tslib_1.__spread(i18nTranslationToDeclStmt(variable, closureVar, message, meta, params)));
    if (transformFn) {
        statements.push(new o.ExpressionStatement(variable.set(transformFn(variable))));
    }
    return statements;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyL3NyYy9yZW5kZXIzL3ZpZXcvaTE4bi91dGlsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7QUFFSCxPQUFPLEtBQUssSUFBSSxNQUFNLHdCQUF3QixDQUFDO0FBQy9DLE9BQU8sRUFBQyxZQUFZLEVBQUMsTUFBTSwrQkFBK0IsQ0FBQztBQUUzRCxPQUFPLEVBQUMsVUFBVSxFQUFDLE1BQU0sMEJBQTBCLENBQUM7QUFDcEQsT0FBTyxLQUFLLENBQUMsTUFBTSw0QkFBNEIsQ0FBQztBQUNoRCxPQUFPLEVBQUMsV0FBVyxJQUFJLEVBQUUsRUFBQyxNQUFNLHNCQUFzQixDQUFDO0FBR3ZELHNFQUFzRTtBQUN0RSxJQUFNLDBCQUEwQixHQUFHLE1BQU0sQ0FBQztBQUUxQyxvREFBb0Q7QUFDcEQsTUFBTSxDQUFDLElBQU0sa0JBQWtCLEdBQUcsT0FBTyxDQUFDO0FBRTFDLGlFQUFpRTtBQUNqRSxJQUFNLFlBQVksR0FBRyxhQUFhLENBQUM7QUFFbkMsa0dBQWtHO0FBQ2xHLElBQU0sb0JBQW9CLEdBQUcsbUJBQW1CLENBQUM7QUFFakQsb0NBQW9DO0FBQ3BDLElBQU0sc0JBQXNCLEdBQUcsR0FBRyxDQUFDO0FBQ25DLElBQU0saUJBQWlCLEdBQUcsSUFBSSxDQUFDO0FBRS9CLG1DQUFtQztBQUNuQyxNQUFNLENBQUMsSUFBTSxTQUFTLEdBQUcsTUFBTSxDQUFDO0FBQ2hDLE1BQU0sQ0FBQyxJQUFNLGdCQUFnQixHQUFHLE9BQU8sQ0FBQztBQUV4Qyw2Q0FBNkM7QUFDN0MsTUFBTSxDQUFDLElBQU0sbUJBQW1CLEdBQUcsTUFBTSxDQUFDO0FBRTFDLG9EQUFvRDtBQUNwRCxNQUFNLENBQUMsSUFBTSx1QkFBdUIsR0FBRyxXQUFXLENBQUM7QUFFbkQsZ0RBQWdEO0FBQ2hELE1B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SSxPQUFTLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQztBQUM3QyxDQUFDO0FBRUQ7Ozs7O0dBS0c7QUFDSCxNQUFNLFVBQVUseUJBQXlCLENBQUMsS0FBYTtJQUNyRCxPQUFPLENBQUEsS0FBRywwQkFBMEIsR0FBRyxLQUFPLENBQUEsQ0FBQyxXQUFXLEVBQUUsQ0FBQztBQUMvRCxDQUFDO0FBRUQ7Ozs7Ozs7Ozs7R0FVRztBQUNILE1BQU0sVUFBVSx1QkFBdUIsQ0FDbkMsUUFBdUIsRUFBRSxVQUF5QixFQUFFLE9BQWUsRUFBRSxJQUFjLEVBQ25GLE1BQTJDLEVBQzNDLFdBQWtEO0lBRGxELHVCQUFBLEVBQUEsV0FBMkM7SUFFN0MsSUFBTSxVQUFVLEdBQWtCLEVBQUUsQ0FBQztJQUVyQyxVQUFVLENBQUMsSUFBSSxPQUFmLFVBQVUsbUJBQVMseUJBQXlCLENBQUMsUUFBUSxFQUFFLFVBQVUsRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sQ0FBQyxHQUFFO0lBRTNGLElBQUksV0FBVyxFQUFFO1FBQ2YsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxtQkFBbUIsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUNqRjtJQUVELE9BQU8sVUFBVSxDQUFDO0FBQ3BCLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCAqIGFzIGkxOG4gZnJvbSAnLi4vLi4vLi4vaTE4bi9pMThuX2FzdCc7XG5pbXBvcnQge3RvUHVibGljTmFtZX0gZnJvbSAnLi4vLi4vLi4vaTE4bi9zZXJpYWxpemVycy94bWInO1xuaW1wb3J0ICogYXMgaHRtbCBmcm9tICcuLi8uLi8uLi9tbF9wYXJzZXIvYXN0JztcbmltcG9ydCB7bWFwTGl0ZXJhbH0gZnJvbSAnLi4vLi4vLi4vb3V0cHV0L21hcF91dGlsJztcbmltcG9ydCAqIGFzIG8gZnJvbSAnLi4vLi4vLi4vb3V0cHV0L291dHB1dF9hc3QnO1xuaW1wb3J0IHtJZGVudGlmaWVycyBhcyBSM30gZnJvbSAnLi4vLi4vcjNfaWRlbnRpZmllcnMnO1xuXG5cbi8qIENsb3N1cmUgdmFyaWFibGVzIGhvbGRpbmcgbWVzc2FnZXMgbXVzdCBiZSBuYW1lZCBgTVNHX1tBLVowLTldK2AgKi9cbmNvbnN0IENMT1NVUkVfVFJBTlNMQVRJT05fUFJFRklYID0gJ01TR18nO1xuXG4vKiBQcmVmaXggZm9yIG5vbi1gZ29vZy5nZXRNc2dgIGkxOG4tcmVsYXRlZCB2YXJzICovXG5leHBvcnQgY29uc3QgVFJBTlNMQVRJT05fUFJFRklYID0gJ0kxOE5fJztcblxuLyoqIENsb3N1cmUgdXNlcyBgZ29vZy5nZXRNc2cobWVzc2FnZSlgIHRvIGxvb2t1cCB0cmFuc2xhdGlvbnMgKi9cbmNvbnN0IEdPT0dfR0VUX01TRyA9ICdnb29nLmdldE1zZyc7XG5cbi8qKiBOYW1lIG9mIHRoZSBnbG9iYWwgdmFyaWFibGUgdGhhdCBpcyB1c2VkIHRvIGRldGVybWluZSBpZiB3ZSB1c2UgQ2xvc3VyZSB0cmFuc2xhdGlvbnMgb3Igbm90ICovXG5jb25zdCBOR19JMThOX0NMT1NVUkVfTU9ERSA9ICduZ0kxOG5DbG9zdXJlTW9kZSc7XG5cbi8qKiBJMThuIHNlcGFyYXRvcnMgZm9yIG1ldGFkYXRhICoqL1xuY29uc3QgSTE4Tl9NRUFOSU5HX1NFUEFSQVRPUiA9ICd8JztcbmNvbnN0IEkxOE5fSURfU0VQQVJBVE9SID0gJ0BAJztcblxuLyoqIE5hbWUgb2YgdGhlIGkxOG4gYXR0cmlidXRlcyAqKi9cbmV4cG9ydCBjb25zdCBJMThOX0FUVFIgPSAnaTE4bic7XG5leHBvcnQgY29uc3QgSTE4Tl9BVFRSX1BSRUZJWCA9ICdpMThuLSc7XG5cbi8qKiBQcmVmaXggb2YgdmFyIGV4cHJlc3Npb25zIHVzZWQgaW4gSUNVcyAqL1xuZXhwb3J0IGNvbnN0IEkxOE5fSUNVX1ZBUl9QUkVGSVggPSAnVkFSXyc7XG5cbi8qKiBQcmVmaXggb2YgSUNVIGV4cHJlc3Npb25zIGZvciBwb3N0IHByb2Nlc3NpbmcgKi9cbmV4cG9ydCBjb25zdCBJMThOX0lDVV9NQVBQSU5HX1BSRUZJWCA9ICdJMThOX0VYUF8nO1xuXG4vKiogUGxhY2Vob2xkZXIgd3JhcHBlciBmb3IgaTE4biBleHByZXNzaW9ucyAqKi9cbmV4cG9ydCBjb25zdCBJMThOX1BMQUNFSE9MREVSX1NZTUJPTCA9ICfvv70nO1xuXG5leHBvcnQgdHlwZSBJMThuTWV0YSA9IHtcbiAgaWQ/OiBzdHJpbmcsXG4gIGRlc2NyaXB0aW9uPzogc3RyaW5nLFxuICBtZWFuaW5nPzogc3RyaW5nXG59O1xuXG5mdW5jdGlvbiBpMThuVHJhbnNsYXRpb25Ub0RlY2xTdG10KFxuICAgIHZhcmlhYmxlOiBvLlJlYWRWYXJFeHByLCBjbG9zdXJlVmFyOiBvLlJlYWRWYXJFeHByLCBtZXNzYWdlOiBzdHJpbmcsIG1ldGE6IEkxOG5NZXRhLFxuICAgIHBhcmFtcz86IHtbbmFtZTogc3RyaW5nXTogby5FeHByZXNzaW9ufSk6IG8uU3RhdGVtZW50W10ge1xuICBjb25zdCBzdGF0ZW1lbnRzOiBvLlN0YXRlbWVudFtdID0gW107XG4gIC8vIHZhciBJMThOX1g7XG4gIHN0YXRlbWVudHMucHVzaChcbiAgICAgIG5ldyBvLkRlY2xhcmVWYXJTdG10KHZhcmlhYmxlLm5hbWUgISwgdW5kZWZpbmVkLCBvLklORkVSUkVEX1RZUEUsIG51bGwsIHZhcmlhYmxlLnNvdXJjZVNwYW4pKTtcblxuICBjb25zdCBhcmdzID0gW28ubGl0ZXJhbChtZXNzYWdlKSBhcyBvLkV4cHJlc3Npb25dO1xuICBpZiAocGFyYW1zICYmIE9iamVjdC5rZXlzKHBhcmFtcykubGVuZ3RoKSB7XG4gICAgYXJncy5wdXNoKG1hcExpdGVyYWwocGFyYW1zLCB0cnVlKSk7XG4gIH1cblxuICAvLyBDbG9zdXJlIEpTRG9jIGNvbW1lbnRzXG4gIGNvbnN0IGRvY1N0YXRlbWVudHMgPSBpMThuTWV0YVRvRG9jU3RtdChtZXRhKTtcbiAgY29uc3QgdGhlblN0YXRlbWVudHM6IG8uU3RhdGVtZW50W10gPSBkb2NTdGF0ZW1lbnRzID8gW2RvY1N0YXRlbWVudHNdIDogW107XG4gIGNvbnN0IGdvb2dGbkNhbGwgPSBvLnZhcmlhYmxlKEdPT0dfR0VUX01TRykuY2FsbEZuKGFyZ3MpO1xuICAvLyBjb25zdCBNU0dfLi4uID0gZ29vZy5nZXRNc2coLi4pO1xuICB0aGVuU3RhdGVtZW50cy5wdXNoKGNsb3N1cmVWYXIuc2V0KGdvb2dGbkNhbGwpLnRvQ29uc3REZWNsKCkpO1xuICAvLyBJMThOX1ggPSBNU0dfLi4uO1xuICB0aGVuU3RhdGVtZW50cy5wdXNoKG5ldyBvLkV4cHJlc3Npb25TdGF0ZW1lbnQodmFyaWFibGUuc2V0KGNsb3N1cmVWYXIpKSk7XG4gIGNvbnN0IGxvY2FsaXplRm5DYWxsID0gby5pbXBvcnRFeHByKFIzLmkxOG5Mb2NhbGl6ZSkuY2FsbEZuKGFyZ3MpO1xuICAvLyBJMThOX1ggPSBpMThuTG9jYWxpemUoLi4uKTtcbiAgY29uc3QgZWxzZVN0YXRlbWVudHMgPSBbbmV3IG8uRXhwcmVzc2lvblN0YXRlbWVudCh2YXJpYWJsZS5zZXQobG9jYWxpemVGbkNhbGwpKV07XG4gIC8vIGlmKG5nSTE4bkNsb3N1cmVNb2RlKSB7IC4uLiB9IGVsc2UgeyAuLi4gfVxuICBzdGF0ZW1lbnRzLnB1c2goby5pZlN0bXQoby52YXJpYWJsZShOR19JMThOX0NMT1NVUkVfTU9ERSksIHRoZW5TdGF0ZW1lbnRzLCBlbHNlU3RhdGVtZW50cykpO1xuXG4gIHJldHVybiBzdGF0ZW1lbnRzO1xufVxuXG4vLyBDb252ZXJ0cyBpMThuIG1ldGEgaW5mb3JtYXRpb24gZm9yIGEgbWVzc2FnZSAoaWQsIGRlc2NyaXB0aW9uLCBtZWFuaW5nKVxuLy8gdG8gYSBKc0RvYyBzdGF0ZW1lbnQgZm9ybWF0dGVkIGFzIGV4cGVjdGVkIGJ5IHRoZSBDbG9zdXJlIGNvbXBpbGVyLlxuZnVuY3Rpb24gaTE4bk1ldGFUb0RvY1N0bXQobWV0YTogSTE4bk1ldGEpOiBvLkpTRG9jQ29tbWVudFN0bXR8bnVsbCB7XG4gIGNvbnN0IHRhZ3M6IG8uSlNEb2NUYWdbXSA9IFtdO1xuICBpZiAobWV0YS5kZXNjcmlwdGlvbikge1xuICAgIHRhZ3MucHVzaCh7dGFnTmFtZTogby5KU0RvY1RhZ05hbWUuRGVzYywgdGV4dDogbWV0YS5kZXNjcmlwdGlvbn0pO1xuICB9XG4gIGlmIChtZXRhLm1lYW5pbmcpIHtcbiAgICB0YWdzLnB1c2goe3RhZ05hbWU6IG8uSlNEb2NUYWdOYW1lLk1lYW5pbmcsIHRleHQ6IG1ldGEubWVhbmluZ30pO1xuICB9XG4gIHJldHVybiB0YWdzLmxlbmd0aCA9PSAwID8gbnVsbCA6IG5ldyBvLkpTRG9jQ29tbWVudFN0bXQodGFncyk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0kxOG5BdHRyaWJ1dGUobmFtZTogc3RyaW5nKTogYm9vbGVhbiB7XG4gIHJldHVybiBuYW1lID09PSBJMThOX0FUVFIgfHwgbmFtZS5zdGFydHNXaXRoKEkxOE5fQVRUUl9QUkVGSVgpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNJMThuUm9vdE5vZGUobWV0YT86IGkxOG4uQVNUKTogbWV0YSBpcyBpMThuLk1lc3NhZ2Uge1xuICByZXR1cm4gbWV0YSBpbnN0YW5jZW9mIGkxOG4uTWVzc2FnZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzU2luZ2xlSTE4bkljdShtZXRhPzogaTE4bi5BU1QpOiBib29sZWFuIHtcbiAgcmV0dXJuIGlzSTE4blJvb3ROb2RlKG1ldGEpICYmIG1ldGEubm9kZXMubGVuZ3RoID09PSAxICYmIG1ldGEubm9kZXNbMF0gaW5zdGFuY2VvZiBpMThuLkljdTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGhhc0kxOG5BdHRycyhlbGVtZW50OiBodG1sLkVsZW1lbnQpOiBib29sZWFuIHtcbiAgcmV0dXJuIGVsZW1lbnQuYXR0cnMuc29tZSgoYXR0cjogaHRtbC5BdHRyaWJ1dGUpID0+IGlzSTE4bkF0dHJpYnV0ZShhdHRyLm5hbWUpKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1ldGFGcm9tSTE4bk1lc3NhZ2UobWVzc2FnZTogaTE4bi5NZXNzYWdlLCBpZDogc3RyaW5nIHwgbnVsbCA9IG51bGwpOiBJMThuTWV0YSB7XG4gIHJldHVybiB7XG4gICAgaWQ6IHR5cGVvZiBpZCA9PT0gJ3N0cmluZycgPyBpZCA6IG1lc3NhZ2UuaWQgfHwgJycsXG4gICAgbWVhbmluZzogbWVzc2FnZS5tZWFuaW5nIHx8ICcnLFxuICAgIGRlc2NyaXB0aW9uOiBtZXNzYWdlLmRlc2NyaXB0aW9uIHx8ICcnXG4gIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpY3VGcm9tSTE4bk1lc3NhZ2UobWVzc2FnZTogaTE4bi5NZXNzYWdlKSB7XG4gIHJldHVybiBtZXNzYWdlLm5vZGVzWzBdIGFzIGkxOG4uSWN1UGxhY2Vob2xkZXI7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB3cmFwSTE4blBsYWNlaG9sZGVyKGNvbnRlbnQ6IHN0cmluZyB8IG51bWJlciwgY29udGV4dElkOiBudW1iZXIgPSAwKTogc3RyaW5nIHtcbiAgY29uc3QgYmxvY2tJZCA9IGNvbnRleHRJZCA+IDAgPyBgOiR7Y29udGV4dElkfWAgOiAnJztcbiAgcmV0dXJuIGAke0kxOE5fUExBQ0VIT0xERVJfU1lNQk9MfSR7Y29udGVudH0ke2Jsb2NrSWR9JHtJMThOX1BMQUNFSE9MREVSX1NZTUJPTH1gO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYXNzZW1ibGVJMThuQm91bmRTdHJpbmcoXG4gICAgc3RyaW5nczogc3RyaW5nW10sIGJpbmRpbmdTdGFydEluZGV4OiBudW1iZXIgPSAwLCBjb250ZXh0SWQ6IG51bWJlciA9IDApOiBzdHJpbmcge1xuICBpZiAoIXN0cmluZ3MubGVuZ3RoKSByZXR1cm4gJyc7XG4gIGxldCBhY2MgPSAnJztcbiAgY29uc3QgbGFzdElkeCA9IHN0cmluZ3MubGVuZ3RoIC0gMTtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBsYXN0SWR4OyBpKyspIHtcbiAgICBhY2MgKz0gYCR7c3RyaW5nc1tpXX0ke3dyYXBJMThuUGxhY2Vob2xkZXIoYmluZGluZ1N0YXJ0SW5kZXggKyBpLCBjb250ZXh0SWQpfWA7XG4gIH1cbiAgYWNjICs9IHN0cmluZ3NbbGFzdElkeF07XG4gIHJldHVybiBhY2M7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRTZXFOdW1iZXJHZW5lcmF0b3Ioc3RhcnRzQXQ6IG51bWJlciA9IDApOiAoKSA9PiBudW1iZXIge1xuICBsZXQgY3VycmVudCA9IHN0YXJ0c0F0O1xuICByZXR1cm4gKCkgPT4gY3VycmVudCsrO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcGxhY2Vob2xkZXJzVG9QYXJhbXMocGxhY2Vob2xkZXJzOiBNYXA8c3RyaW5nLCBzdHJpbmdbXT4pOlxuICAgIHtbbmFtZTogc3RyaW5nXTogby5FeHByZXNzaW9ufSB7XG4gIGNvbnN0IHBhcmFtczoge1tuYW1lOiBzdHJpbmddOiBvLkV4cHJlc3Npb259ID0ge307XG4gIHBsYWNlaG9sZGVycy5mb3JFYWNoKCh2YWx1ZXM6IHN0cmluZ1tdLCBrZXk6IHN0cmluZykgPT4ge1xuICAgIHBhcmFtc1trZXldID0gby5saXRlcmFsKHZhbHVlcy5sZW5ndGggPiAxID8gYFske3ZhbHVlcy5qb2luKCd8Jyl9XWAgOiB2YWx1ZXNbMF0pO1xuICB9KTtcbiAgcmV0dXJuIHBhcmFtcztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHVwZGF0ZVBsYWNlaG9sZGVyTWFwKG1hcDogTWFwPHN0cmluZywgYW55W10+LCBuYW1lOiBzdHJpbmcsIC4uLnZhbHVlczogYW55W10pIHtcbiAgY29uc3QgY3VycmVudCA9IG1hcC5nZXQobmFtZSkgfHwgW107XG4gIGN1cnJlbnQucHVzaCguLi52YWx1ZXMpO1xuICBtYXAuc2V0KG5hbWUsIGN1cnJlbnQpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYXNzZW1ibGVCb3VuZFRleHRQbGFjZWhvbGRlcnMoXG4gICAgbWV0YTogaTE4bi5BU1QsIGJpbmRpbmdTdGFydEluZGV4OiBudW1iZXIgPSAwLCBjb250ZXh0SWQ6IG51bWJlciA9IDApOiBNYXA8c3RyaW5nLCBhbnlbXT4ge1xuICBjb25zdCBzdGFydElkeCA9IGJpbmRpbmdTdGFydEluZGV4O1xuICBjb25zdCBwbGFjZWhvbGRlcnMgPSBuZXcgTWFwPHN0cmluZywgYW55PigpO1xuICBjb25zdCBub2RlID1cbiAgICAgIG1ldGEgaW5zdGFuY2VvZiBpMThuLk1lc3NhZ2UgPyBtZXRhLm5vZGVzLmZpbmQobm9kZSA9PiBub2RlIGluc3RhbmNlb2YgaTE4bi5Db250YWluZXIpIDogbWV0YTtcbiAgaWYgKG5vZGUpIHtcbiAgICAobm9kZSBhcyBpMThuLkNvbnRhaW5lcilcbiAgICAgICAgLmNoaWxkcmVuLmZpbHRlcigoY2hpbGQ6IGkxOG4uTm9kZSkgPT4gY2hpbGQgaW5zdGFuY2VvZiBpMThuLlBsYWNlaG9sZGVyKVxuICAgICAgICAuZm9yRWFjaCgoY2hpbGQ6IGkxOG4uUGxhY2Vob2xkZXIsIGlkeDogbnVtYmVyKSA9PiB7XG4gICAgICAgICAgY29uc3QgY29udGVudCA9IHdyYXBJMThuUGxhY2Vob2xkZXIoc3RhcnRJZHggKyBpZHgsIGNvbnRleHRJZCk7XG4gICAgICAgICAgdXBkYXRlUGxhY2Vob2xkZXJNYXAocGxhY2Vob2xkZXJzLCBjaGlsZC5uYW1lLCBjb250ZW50KTtcbiAgICAgICAgfSk7XG4gIH1cbiAgcmV0dXJuIHBsYWNlaG9sZGVycztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGZpbmRJbmRleChpdGVtczogYW55W10sIGNhbGxiYWNrOiAoaXRlbTogYW55KSA9PiBib29sZWFuKTogbnVtYmVyIHtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBpdGVtcy5sZW5ndGg7IGkrKykge1xuICAgIGlmIChjYWxsYmFjayhpdGVtc1tpXSkpIHtcbiAgICAgIHJldHVybiBpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gLTE7XG59XG5cbi8qKlxuICogUGFyc2VzIGkxOG4gbWV0YXMgbGlrZTpcbiAqICAtIFwiQEBpZFwiLFxuICogIC0gXCJkZXNjcmlwdGlvbltAQGlkXVwiLFxuICogIC0gXCJtZWFuaW5nfGRlc2NyaXB0aW9uW0BAaWRdXCJcbiAqIGFuZCByZXR1cm5zIGFuIG9iamVjdCB3aXRoIHBhcnNlZCBvdXRwdXQuXG4gKlxuICogQHBhcmFtIG1ldGEgU3RyaW5nIHRoYXQgcmVwcmVzZW50cyBpMThuIG1ldGFcbiAqIEByZXR1cm5zIE9iamVjdCB3aXRoIGlkLCBtZWFuaW5nIGFuZCBkZXNjcmlwdGlvbiBmaWVsZHNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlSTE4bk1ldGEobWV0YT86IHN0cmluZyk6IEkxOG5NZXRhIHtcbiAgbGV0IGlkOiBzdHJpbmd8dW5kZWZpbmVkO1xuICBsZXQgbWVhbmluZzogc3RyaW5nfHVuZGVmaW5lZDtcbiAgbGV0IGRlc2NyaXB0aW9uOiBzdHJpbmd8dW5kZWZpbmVkO1xuXG4gIGlmIChtZXRhKSB7XG4gICAgY29uc3QgaWRJbmRleCA9IG1ldGEuaW5kZXhPZihJMThOX0lEX1NFUEFSQVRPUik7XG4gICAgY29uc3QgZGVzY0luZGV4ID0gbWV0YS5pbmRleE9mKEkxOE5fTUVBTklOR19TRVBBUkFUT1IpO1xuICAgIGxldCBtZWFuaW5nQW5kRGVzYzogc3RyaW5nO1xuICAgIFttZWFuaW5nQW5kRGVzYywgaWRdID1cbiAgICAgICAgKGlkSW5kZXggPiAtMSkgPyBbbWV0YS5zbGljZSgwLCBpZEluZGV4KSwgbWV0YS5zbGljZShpZEluZGV4ICsgMildIDogW21ldGEsICcnXTtcbiAgICBbbWVhbmluZywgZGVzY3JpcHRpb25dID0gKGRlc2NJbmRleCA+IC0xKSA/XG4gICAgICAgIFttZWFuaW5nQW5kRGVzYy5zbGljZSgwLCBkZXNjSW5kZXgpLCBtZWFuaW5nQW5kRGVzYy5zbGljZShkZXNjSW5kZXggKyAxKV0gOlxuICAgICAgICBbJycsIG1lYW5pbmdBbmREZXNjXTtcbiAgfVxuXG4gIHJldHVybiB7aWQsIG1lYW5pbmcsIGRlc2NyaXB0aW9ufTtcbn1cblxuLyoqXG4gKiBDb252ZXJ0cyBpbnRlcm5hbCBwbGFjZWhvbGRlciBuYW1lcyB0byBwdWJsaWMtZmFjaW5nIGZvcm1hdFxuICogKGZvciBleGFtcGxlIHRvIHVzZSBpbiBnb29nLmdldE1zZyBjYWxsKS5cbiAqIEV4YW1wbGU6IGBTVEFSVF9UQUdfRElWXzFgIGlzIGNvbnZlcnRlZCB0byBgc3RhcnRUYWdEaXZfMWAuXG4gKlxuICogQHBhcmFtIG5hbWUgVGhlIHBsYWNlaG9sZGVyIG5hbWUgdGhhdCBzaG91bGQgYmUgZm9ybWF0dGVkXG4gKiBAcmV0dXJucyBGb3JtYXR0ZWQgcGxhY2Vob2xkZXIgbmFtZVxuICovXG5leHBvcnQgZnVuY3Rpb24gZm9ybWF0STE4blBsYWNlaG9sZGVyTmFtZShuYW1lOiBzdHJpbmcsIHVzZUNhbWVsQ2FzZTogYm9vbGVhbiA9IHRydWUpOiBzdHJpbmcge1xuICBjb25zdCBwdWJsaWNOYW1lID0gdG9QdWJsaWNOYW1lKG5hbWUpO1xuICBpZiAoIXVzZUNhbWVsQ2FzZSkge1xuICAgIHJldHVybiBwdWJsaWNOYW1lO1xuICB9XG4gIGNvbnN0IGNodW5rcyA9IHB1YmxpY05hbWUuc3BsaXQoJ18nKTtcbiAgaWYgKGNodW5rcy5sZW5ndGggPT09IDEpIHtcbiAgICAvLyBpZiBubyBcIl9cIiBmb3VuZCAtIGp1c3QgbG93ZXJjYXNlIHRoZSB2YWx1ZVxuICAgIHJldHVybiBuYW1lLnRvTG93ZXJDYXNlKCk7XG4gIH1cbiAgbGV0IHBvc3RmaXg7XG4gIC8vIGVqZWN0IGxhc3QgZWxlbWVudCBpZiBpdCdzIGEgbnVtYmVyXG4gIGlmICgvXlxcZCskLy50ZXN0KGNodW5rc1tjaHVua3MubGVuZ3RoIC0gMV0pKSB7XG4gICAgcG9zdGZpeCA9IGNodW5rcy5wb3AoKTtcbiAgfVxuICBsZXQgcmF3ID0gY2h1bmtzLnNoaWZ0KCkgIS50b0xvd2VyQ2FzZSgpO1xuICBpZiAoY2h1bmtzLmxlbmd0aCkge1xuICAgIHJhdyArPSBjaHVua3MubWFwKGMgPT4gYy5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIGMuc2xpY2UoMSkudG9Mb3dlckNhc2UoKSkuam9pbignJyk7XG4gIH1cbiAgcmV0dXJuIHBvc3RmaXggPyBgJHtyYXd9XyR7cG9zdGZpeH1gIDogcmF3O1xufVxuXG4vKipcbiAqIEdlbmVyYXRlcyBhIHByZWZpeCBmb3IgdHJhbnNsYXRpb24gY29uc3QgbmFtZS5cbiAqXG4gKiBAcGFyYW0gZXh0cmEgQWRkaXRpb25hbCBsb2NhbCBwcmVmaXggdGhhdCBzaG91bGQgYmUgaW5qZWN0ZWQgaW50byB0cmFuc2xhdGlvbiB2YXIgbmFtZVxuICogQHJldHVybnMgQ29tcGxldGUgdHJhbnNsYXRpb24gY29uc3QgcHJlZml4XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRUcmFuc2xhdGlvbkNvbnN0UHJlZml4KGV4dHJhOiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gYCR7Q0xPU1VSRV9UUkFOU0xBVElPTl9QUkVGSVh9JHtleHRyYX1gLnRvVXBwZXJDYXNlKCk7XG59XG5cbi8qKlxuICogR2VuZXJhdGVzIHRyYW5zbGF0aW9uIGRlY2xhcmF0aW9uIHN0YXRlbWVudHMuXG4gKlxuICogQHBhcmFtIHZhcmlhYmxlIFRyYW5zbGF0aW9uIHZhbHVlIHJlZmVyZW5jZVxuICogQHBhcmFtIGNsb3N1cmVWYXIgVmFyaWFibGUgZm9yIENsb3N1cmUgYGdvb2cuZ2V0TXNnYCBjYWxsc1xuICogQHBhcmFtIG1lc3NhZ2UgVGV4dCBtZXNzYWdlIHRvIGJlIHRyYW5zbGF0ZWRcbiAqIEBwYXJhbSBtZXRhIE9iamVjdCB0aGF0IGNvbnRhaW5zIG1ldGEgaW5mb3JtYXRpb24gKGlkLCBtZWFuaW5nIGFuZCBkZXNjcmlwdGlvbilcbiAqIEBwYXJhbSBwYXJhbXMgT2JqZWN0IHdpdGggcGxhY2Vob2xkZXJzIGtleS12YWx1ZSBwYWlyc1xuICogQHBhcmFtIHRyYW5zZm9ybUZuIE9wdGlvbmFsIHRyYW5zZm9ybWF0aW9uIChwb3N0IHByb2Nlc3NpbmcpIGZ1bmN0aW9uIHJlZmVyZW5jZVxuICogQHJldHVybnMgQXJyYXkgb2YgU3RhdGVtZW50cyB0aGF0IHJlcHJlc2VudCBhIGdpdmVuIHRyYW5zbGF0aW9uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRUcmFuc2xhdGlvbkRlY2xTdG10cyhcbiAgICB2YXJpYWJsZTogby5SZWFkVmFyRXhwciwgY2xvc3VyZVZhcjogby5SZWFkVmFyRXhwciwgbWVzc2FnZTogc3RyaW5nLCBtZXRhOiBJMThuTWV0YSxcbiAgICBwYXJhbXM6IHtbbmFtZTogc3RyaW5nXTogby5FeHByZXNzaW9ufSA9IHt9LFxuICAgIHRyYW5zZm9ybUZuPzogKHJhdzogby5SZWFkVmFyRXhwcikgPT4gby5FeHByZXNzaW9uKTogby5TdGF0ZW1lbnRbXSB7XG4gIGNvbnN0IHN0YXRlbWVudHM6IG8uU3RhdGVtZW50W10gPSBbXTtcblxuICBzdGF0ZW1lbnRzLnB1c2goLi4uaTE4blRyYW5zbGF0aW9uVG9EZWNsU3RtdCh2YXJpYWJsZSwgY2xvc3VyZVZhciwgbWVzc2FnZSwgbWV0YSwgcGFyYW1zKSk7XG5cbiAgaWYgKHRyYW5zZm9ybUZuKSB7XG4gICAgc3RhdGVtZW50cy5wdXNoKG5ldyBvLkV4cHJlc3Npb25TdGF0ZW1lbnQodmFyaWFibGUuc2V0KHRyYW5zZm9ybUZuKHZhcmlhYmxlKSkpKTtcbiAgfVxuXG4gIHJldHVybiBzdGF0ZW1lbnRzO1xufVxuIl19