/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
export function digest(message) {
    return sha1(serializeNodes(message.nodes).join('') + ("[" + message.meaning + "]"));
}
export function decimalDigest(message) {
    var visitor = new _SerializerIgnoreIcuExpVisitor();
    var parts = message.nodes.map(function (a) { return a.visit(visitor, null); });
    return computeMsgId(parts.join(''), message.meaning);
}
/**
 * Serialize the i18n ast to something xml-like in order to generate an UID.
 *
 * The visitor is also used in the i18n parser tests
 *
 * @internal
 */
var _SerializerVisitor = (function () {
    function _SerializerVisitor() {
    }
    _SerializerVisitor.prototype.visitText = function (text, context) { return text.value; };
    _SerializerVisitor.prototype.visitContainer = function (container, context) {
        var _this = this;
        return "[" + container.children.map(function (child) { return child.visit(_this); }).join(', ') + "]";
    };
    _SerializerVisitor.prototype.visitIcu = function (icu, context) {
        var _this = this;
        var strCases = Object.keys(icu.cases).map(function (k) { return (k + " {" + icu.cases[k].visit(_this) + "}"); });
        return "{" + icu.expression + ", " + icu.type + ", " + strCases.join(', ') + "}";
    };
    _SerializerVisitor.prototype.visitTagPlaceholder = function (ph, context) {
        var _this = this;
        return ph.isVoid ?
            "<ph tag name=\"" + ph.startName + "\"/>" :
            "<ph tag name=\"" + ph.startName + "\">" + ph.children.map(function (child) { return child.visit(_this); }).join(', ') + "</ph name=\"" + ph.closeName + "\">";
    };
    _SerializerVisitor.prototype.visitPlaceholder = function (ph, context) {
        return ph.value ? "<ph name=\"" + ph.name + "\">" + ph.value + "</ph>" : "<ph name=\"" + ph.name + "\"/>";
    };
    _SerializerVisitor.prototype.visitIcuPlaceholder = function (ph, context) {
        return "<ph icu name=\"" + ph.name + "\">" + ph.value.visit(this) + "</ph>";
    };
    return _SerializerVisitor;
}());
var serializerVisitor = new _SerializerVisitor();
export function serializeNodes(nodes) {
    return nodes.map(function (a) { return a.visit(serializerVisitor, null); });
}
/**
 * Serialize the i18n ast to something xml-like in order to generate an UID.
 *
 * Ignore the ICU expressions so that message IDs stays identical if only the expression changes.
 *
 * @internal
 */
var _SerializerIgnoreIcuExpVisitor = (function (_super) {
    __extends(_SerializerIgnoreIcuExpVisitor, _super);
    function _SerializerIgnoreIcuExpVisitor() {
        _super.apply(this, arguments);
    }
    _SerializerIgnoreIcuExpVisitor.prototype.visitIcu = function (icu, context) {
        var _this = this;
        var strCases = Object.keys(icu.cases).map(function (k) { return (k + " {" + icu.cases[k].visit(_this) + "}"); });
        // Do not take the expression into account
        return "{" + icu.type + ", " + strCases.join(', ') + "}";
    };
    return _SerializerIgnoreIcuExpVisitor;
}(_SerializerVisitor));
/**
 * Compute the SHA1 of the given string
 *
 * see http://csrc.nist.gov/publications/fips/fips180-4/fips-180-4.pdf
 *
 * WARNING: this function has not been designed not tested with security in mind.
 *          DO NOT USE IT IN A SECURITY SENSITIVE CONTEXT.
 */
export function sha1(str) {
    var utf8 = utf8Encode(str);
    var words32 = stringToWords32(utf8, Endian.Big);
    var len = utf8.length * 8;
    var w = new Array(80);
    var _a = [0x67452301, 0xefcdab89, 0x98badcfe, 0x10325476, 0xc3d2e1f0], a = _a[0], b = _a[1], c = _a[2], d = _a[3], e = _a[4];
    words32[len >> 5] |= 0x80 << (24 - len % 32);
    words32[((len + 64 >> 9) << 4) + 15] = len;
    for (var i = 0; i < words32.length; i += 16) {
        var _b = [a, b, c, d, e], h0 = _b[0], h1 = _b[1], h2 = _b[2], h3 = _b[3], h4 = _b[4];
        for (var j = 0; j < 80; j++) {
            if (j < 16) {
                w[j] = words32[i + j];
            }
            else {
                w[j] = rol32(w[j - 3] ^ w[j - 8] ^ w[j - 14] ^ w[j - 16], 1);
            }
            var _c = fk(j, b, c, d), f = _c[0], k = _c[1];
            var temp = [rol32(a, 5), f, e, k, w[j]].reduce(add32);
            _d = [d, c, rol32(b, 30), a, temp], e = _d[0], d = _d[1], c = _d[2], b = _d[3], a = _d[4];
        }
        _e = [add32(a, h0), add32(b, h1), add32(c, h2), add32(d, h3), add32(e, h4)], a = _e[0], b = _e[1], c = _e[2], d = _e[3], e = _e[4];
    }
    return byteStringToHexString(words32ToByteString([a, b, c, d, e]));
    var _d, _e;
}
function fk(index, b, c, d) {
    if (index < 20) {
        return [(b & c) | (~b & d), 0x5a827999];
    }
    if (index < 40) {
        return [b ^ c ^ d, 0x6ed9eba1];
    }
    if (index < 60) {
        return [(b & c) | (b & d) | (c & d), 0x8f1bbcdc];
    }
    return [b ^ c ^ d, 0xca62c1d6];
}
/**
 * Compute the fingerprint of the given string
 *
 * The output is 64 bit number encoded as a decimal string
 *
 * based on:
 * https://github.com/google/closure-compiler/blob/master/src/com/google/javascript/jscomp/GoogleJsMessageIdGenerator.java
 */
export function fingerprint(str) {
    var utf8 = utf8Encode(str);
    var _a = [hash32(utf8, 0), hash32(utf8, 102072)], hi = _a[0], lo = _a[1];
    if (hi == 0 && (lo == 0 || lo == 1)) {
        hi = hi ^ 0x130f9bef;
        lo = lo ^ -0x6b5f56d8;
    }
    return [hi, lo];
}
export function computeMsgId(msg, meaning) {
    var _a = fingerprint(msg), hi = _a[0], lo = _a[1];
    if (meaning) {
        var _b = fingerprint(meaning), him = _b[0], lom = _b[1];
        _c = add64(rol64([hi, lo], 1), [him, lom]), hi = _c[0], lo = _c[1];
    }
    return byteStringToDecString(words32ToByteString([hi & 0x7fffffff, lo]));
    var _c;
}
function hash32(str, c) {
    var _a = [0x9e3779b9, 0x9e3779b9], a = _a[0], b = _a[1];
    var i;
    var len = str.length;
    for (i = 0; i + 12 <= len; i += 12) {
        a = add32(a, wordAt(str, i, Endian.Little));
        b = add32(b, wordAt(str, i + 4, Endian.Little));
        c = add32(c, wordAt(str, i + 8, Endian.Little));
        _b = mix([a, b, c]), a = _b[0], b = _b[1], c = _b[2];
    }
    a = add32(a, wordAt(str, i, Endian.Little));
    b = add32(b, wordAt(str, i + 4, Endian.Little));
    // the first byte of c is reserved for the length
    c = add32(c, len);
    c = add32(c, wordAt(str, i + 8, Endian.Little) << 8);
    return mix([a, b, c])[2];
    var _b;
}
// clang-format off
function mix(_a) {
    var a = _a[0], b = _a[1], c = _a[2];
    a = sub32(a, b);
    a = sub32(a, c);
    a ^= c >>> 13;
    b = sub32(b, c);
    b = sub32(b, a);
    b ^= a << 8;
    c = sub32(c, a);
    c = sub32(c, b);
    c ^= b >>> 13;
    a = sub32(a, b);
    a = sub32(a, c);
    a ^= c >>> 12;
    b = sub32(b, c);
    b = sub32(b, a);
    b ^= a << 16;
    c = sub32(c, a);
    c = sub32(c, b);
    c ^= b >>> 5;
    a = sub32(a, b);
    a = sub32(a, c);
    a ^= c >>> 3;
    b = sub32(b, c);
    b = sub32(b, a);
    b ^= a << 10;
    c = sub32(c, a);
    c = sub32(c, b);
    c ^= b >>> 15;
    return [a, b, c];
}
// clang-format on
// Utils
var Endian;
(function (Endian) {
    Endian[Endian["Little"] = 0] = "Little";
    Endian[Endian["Big"] = 1] = "Big";
})(Endian || (Endian = {}));
function utf8Encode(str) {
    var encoded = '';
    for (var index = 0; index < str.length; index++) {
        var codePoint = decodeSurrogatePairs(str, index);
        if (codePoint <= 0x7f) {
            encoded += String.fromCharCode(codePoint);
        }
        else if (codePoint <= 0x7ff) {
            encoded += String.fromCharCode(0xc0 | codePoint >>> 6, 0x80 | codePoint & 0x3f);
        }
        else if (codePoint <= 0xffff) {
            encoded += String.fromCharCode(0xe0 | codePoint >>> 12, 0x80 | codePoint >>> 6 & 0x3f, 0x80 | codePoint & 0x3f);
        }
        else if (codePoint <= 0x1fffff) {
            encoded += String.fromCharCode(0xf0 | codePoint >>> 18, 0x80 | codePoint >>> 12 & 0x3f, 0x80 | codePoint >>> 6 & 0x3f, 0x80 | codePoint & 0x3f);
        }
    }
    return encoded;
}
// see https://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
function decodeSurrogatePairs(str, index) {
    if (index < 0 || index >= str.length) {
        throw new Error("index=" + index + " is out of range in \"" + str + "\"");
    }
    var high = str.charCodeAt(index);
    if (high >= 0xd800 && high <= 0xdfff && str.length > index + 1) {
        var low = byteAt(str, index + 1);
        if (low >= 0xdc00 && low <= 0xdfff) {
            return (high - 0xd800) * 0x400 + low - 0xdc00 + 0x10000;
        }
    }
    return high;
}
function add32(a, b) {
    return add32to64(a, b)[1];
}
function add32to64(a, b) {
    var low = (a & 0xffff) + (b & 0xffff);
    var high = (a >>> 16) + (b >>> 16) + (low >>> 16);
    return [high >>> 16, (high << 16) | (low & 0xffff)];
}
function add64(_a, _b) {
    var ah = _a[0], al = _a[1];
    var bh = _b[0], bl = _b[1];
    var _c = add32to64(al, bl), carry = _c[0], l = _c[1];
    var h = add32(add32(ah, bh), carry);
    return [h, l];
}
function sub32(a, b) {
    var low = (a & 0xffff) - (b & 0xffff);
    var high = (a >> 16) - (b >> 16) + (low >> 16);
    return (high << 16) | (low & 0xffff);
}
// Rotate a 32b number left `count` position
function rol32(a, count) {
    return (a << count) | (a >>> (32 - count));
}
// Rotate a 64b number left `count` position
function rol64(_a, count) {
    var hi = _a[0], lo = _a[1];
    var h = (hi << count) | (lo >>> (32 - count));
    var l = (lo << count) | (hi >>> (32 - count));
    return [h, l];
}
function stringToWords32(str, endian) {
    var words32 = Array((str.length + 3) >>> 2);
    for (var i = 0; i < words32.length; i++) {
        words32[i] = wordAt(str, i * 4, endian);
    }
    return words32;
}
function byteAt(str, index) {
    return index >= str.length ? 0 : str.charCodeAt(index) & 0xff;
}
function wordAt(str, index, endian) {
    var word = 0;
    if (endian === Endian.Big) {
        for (var i = 0; i < 4; i++) {
            word += byteAt(str, index + i) << (24 - 8 * i);
        }
    }
    else {
        for (var i = 0; i < 4; i++) {
            word += byteAt(str, index + i) << 8 * i;
        }
    }
    return word;
}
function words32ToByteString(words32) {
    return words32.reduce(function (str, word) { return str + word32ToByteString(word); }, '');
}
function word32ToByteString(word) {
    var str = '';
    for (var i = 0; i < 4; i++) {
        str += String.fromCharCode((word >>> 8 * (3 - i)) & 0xff);
    }
    return str;
}
function byteStringToHexString(str) {
    var hex = '';
    for (var i = 0; i < str.length; i++) {
        var b = byteAt(str, i);
        hex += (b >>> 4).toString(16) + (b & 0x0f).toString(16);
    }
    return hex.toLowerCase();
}
// based on http://www.danvk.org/hex2dec.html (JS can not handle more than 56b)
function byteStringToDecString(str) {
    var decimal = '';
    var toThePower = '1';
    for (var i = str.length - 1; i >= 0; i--) {
        decimal = addBigInt(decimal, numberTimesBigInt(byteAt(str, i), toThePower));
        toThePower = numberTimesBigInt(256, toThePower);
    }
    return decimal.split('').reverse().join('');
}
// x and y decimal, lowest significant digit first
function addBigInt(x, y) {
    var sum = '';
    var len = Math.max(x.length, y.length);
    for (var i = 0, carry = 0; i < len || carry; i++) {
        var tmpSum = carry + +(x[i] || 0) + +(y[i] || 0);
        if (tmpSum >= 10) {
            carry = 1;
            sum += tmpSum - 10;
        }
        else {
            carry = 0;
            sum += tmpSum;
        }
    }
    return sum;
}
function numberTimesBigInt(num, b) {
    var product = '';
    var bToThePower = b;
    for (; num !== 0; num = num >>> 1) {
        if (num & 1)
            product = addBigInt(product, bToThePower);
        bToThePower = addBigInt(bToThePower, bToThePower);
    }
    return product;
}
//# sourceMappingURL=digest.js.map