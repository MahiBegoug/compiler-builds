/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
export var TagContentType;
(function (TagContentType) {
    TagContentType[TagContentType["RAW_TEXT"] = 0] = "RAW_TEXT";
    TagContentType[TagContentType["ESCAPABLE_RAW_TEXT"] = 1] = "ESCAPABLE_RAW_TEXT";
    TagContentType[TagContentType["PARSABLE_DATA"] = 2] = "PARSABLE_DATA";
})(TagContentType || (TagContentType = {}));
export function splitNsName(elementName) {
    if (elementName[0] != ':') {
        return [null, elementName];
    }
    var colonIndex = elementName.indexOf(':', 1);
    if (colonIndex == -1) {
        throw new Error("Unsupported format \"" + elementName + "\" expecting \":namespace:name\"");
    }
    return [elementName.slice(1, colonIndex), elementName.slice(colonIndex + 1)];
}
// `<ng-container>` tags work the same regardless the namespace
export function isNgContainer(tagName) {
    return splitNsName(tagName)[1] === 'ng-container';
}
// `<ng-content>` tags work the same regardless the namespace
export function isNgContent(tagName) {
    return splitNsName(tagName)[1] === 'ng-content';
}
// `<ng-template>` tags work the same regardless the namespace
export function isNgTemplate(tagName) {
    return splitNsName(tagName)[1] === 'ng-template';
}
export function getNsPrefix(fullName) {
    return fullName === null ? null : splitNsName(fullName)[0];
}
export function mergeNsAndName(prefix, localName) {
    return prefix ? ":" + prefix + ":" + localName : localName;
}
// see http://www.w3.org/TR/html51/syntax.html#named-character-references
// see https://html.spec.whatwg.org/multipage/entities.json
// This list is not exhaustive to keep the compiler footprint low.
// The `&#123;` / `&#x1ab;` syntax should be used when the named character reference does not
// exist.
export var NAMED_ENTITIES = {
    'Aacute': '\u00C1',
    'aacute': '\u00E1',
    'Acirc': '\u00C2',
    'acirc': '\u00E2',
    'acute': '\u00B4',
    'AElig': '\u00C6',
    'aelig': '\u00E6',
    'Agrave': '\u00C0',
    'agrave': '\u00E0',
    'alefsym': '\u2135',
    'Alpha': '\u0391',
    'alpha': '\u03B1',
    'amp': '&',
    'and': '\u2227',
    'ang': '\u2220',
    'apos': '\u0027',
    'Aring': '\u00C5',
    'aring': '\u00E5',
    'asymp': '\u2248',
    'Atilde': '\u00C3',
    'atilde': '\u00E3',
    'Auml': '\u00C4',
    'auml': '\u00E4',
    'bdquo': '\u201E',
    'Beta': '\u0392',
    'beta': '\u03B2',
    'brvbar': '\u00A6',
    'bull': '\u2022',
    'cap': '\u2229',
    'Ccedil': '\u00C7',
    'ccedil': '\u00E7',
    'cedil': '\u00B8',
    'cent': '\u00A2',
    'Chi': '\u03A7',
    'chi': '\u03C7',
    'circ': '\u02C6',
    'clubs': '\u2663',
    'cong': '\u2245',
    'copy': '\u00A9',
    'crarr': '\u21B5',
    'cup': '\u222A',
    'curren': '\u00A4',
    'dagger': '\u2020',
    'Dagger': '\u2021',
    'darr': '\u2193',
    'dArr': '\u21D3',
    'deg': '\u00B0',
    'Delta': '\u0394',
    'delta': '\u03B4',
    'diams': '\u2666',
    'divide': '\u00F7',
    'Eacute': '\u00C9',
    'eacute': '\u00E9',
    'Ecirc': '\u00CA',
    'ecirc': '\u00EA',
    'Egrave': '\u00C8',
    'egrave': '\u00E8',
    'empty': '\u2205',
    'emsp': '\u2003',
    'ensp': '\u2002',
    'Epsilon': '\u0395',
    'epsilon': '\u03B5',
    'equiv': '\u2261',
    'Eta': '\u0397',
    'eta': '\u03B7',
    'ETH': '\u00D0',
    'eth': '\u00F0',
    'Euml': '\u00CB',
    'euml': '\u00EB',
    'euro': '\u20AC',
    'exist': '\u2203',
    'fnof': '\u0192',
    'forall': '\u2200',
    'frac12': '\u00BD',
    'frac14': '\u00BC',
    'frac34': '\u00BE',
    'frasl': '\u2044',
    'Gamma': '\u0393',
    'gamma': '\u03B3',
    'ge': '\u2265',
    'gt': '>',
    'harr': '\u2194',
    'hArr': '\u21D4',
    'hearts': '\u2665',
    'hellip': '\u2026',
    'Iacute': '\u00CD',
    'iacute': '\u00ED',
    'Icirc': '\u00CE',
    'icirc': '\u00EE',
    'iexcl': '\u00A1',
    'Igrave': '\u00CC',
    'igrave': '\u00EC',
    'image': '\u2111',
    'infin': '\u221E',
    'int': '\u222B',
    'Iota': '\u0399',
    'iota': '\u03B9',
    'iquest': '\u00BF',
    'isin': '\u2208',
    'Iuml': '\u00CF',
    'iuml': '\u00EF',
    'Kappa': '\u039A',
    'kappa': '\u03BA',
    'Lambda': '\u039B',
    'lambda': '\u03BB',
    'lang': '\u27E8',
    'laquo': '\u00AB',
    'larr': '\u2190',
    'lArr': '\u21D0',
    'lceil': '\u2308',
    'ldquo': '\u201C',
    'le': '\u2264',
    'lfloor': '\u230A',
    'lowast': '\u2217',
    'loz': '\u25CA',
    'lrm': '\u200E',
    'lsaquo': '\u2039',
    'lsquo': '\u2018',
    'lt': '<',
    'macr': '\u00AF',
    'mdash': '\u2014',
    'micro': '\u00B5',
    'middot': '\u00B7',
    'minus': '\u2212',
    'Mu': '\u039C',
    'mu': '\u03BC',
    'nabla': '\u2207',
    'nbsp': '\u00A0',
    'ndash': '\u2013',
    'ne': '\u2260',
    'ni': '\u220B',
    'not': '\u00AC',
    'notin': '\u2209',
    'nsub': '\u2284',
    'Ntilde': '\u00D1',
    'ntilde': '\u00F1',
    'Nu': '\u039D',
    'nu': '\u03BD',
    'Oacute': '\u00D3',
    'oacute': '\u00F3',
    'Ocirc': '\u00D4',
    'ocirc': '\u00F4',
    'OElig': '\u0152',
    'oelig': '\u0153',
    'Ograve': '\u00D2',
    'ograve': '\u00F2',
    'oline': '\u203E',
    'Omega': '\u03A9',
    'omega': '\u03C9',
    'Omicron': '\u039F',
    'omicron': '\u03BF',
    'oplus': '\u2295',
    'or': '\u2228',
    'ordf': '\u00AA',
    'ordm': '\u00BA',
    'Oslash': '\u00D8',
    'oslash': '\u00F8',
    'Otilde': '\u00D5',
    'otilde': '\u00F5',
    'otimes': '\u2297',
    'Ouml': '\u00D6',
    'ouml': '\u00F6',
    'para': '\u00B6',
    'permil': '\u2030',
    'perp': '\u22A5',
    'Phi': '\u03A6',
    'phi': '\u03C6',
    'Pi': '\u03A0',
    'pi': '\u03C0',
    'piv': '\u03D6',
    'plusmn': '\u00B1',
    'pound': '\u00A3',
    'prime': '\u2032',
    'Prime': '\u2033',
    'prod': '\u220F',
    'prop': '\u221D',
    'Psi': '\u03A8',
    'psi': '\u03C8',
    'quot': '\u0022',
    'radic': '\u221A',
    'rang': '\u27E9',
    'raquo': '\u00BB',
    'rarr': '\u2192',
    'rArr': '\u21D2',
    'rceil': '\u2309',
    'rdquo': '\u201D',
    'real': '\u211C',
    'reg': '\u00AE',
    'rfloor': '\u230B',
    'Rho': '\u03A1',
    'rho': '\u03C1',
    'rlm': '\u200F',
    'rsaquo': '\u203A',
    'rsquo': '\u2019',
    'sbquo': '\u201A',
    'Scaron': '\u0160',
    'scaron': '\u0161',
    'sdot': '\u22C5',
    'sect': '\u00A7',
    'shy': '\u00AD',
    'Sigma': '\u03A3',
    'sigma': '\u03C3',
    'sigmaf': '\u03C2',
    'sim': '\u223C',
    'spades': '\u2660',
    'sub': '\u2282',
    'sube': '\u2286',
    'sum': '\u2211',
    'sup': '\u2283',
    'sup1': '\u00B9',
    'sup2': '\u00B2',
    'sup3': '\u00B3',
    'supe': '\u2287',
    'szlig': '\u00DF',
    'Tau': '\u03A4',
    'tau': '\u03C4',
    'there4': '\u2234',
    'Theta': '\u0398',
    'theta': '\u03B8',
    'thetasym': '\u03D1',
    'thinsp': '\u2009',
    'THORN': '\u00DE',
    'thorn': '\u00FE',
    'tilde': '\u02DC',
    'times': '\u00D7',
    'trade': '\u2122',
    'Uacute': '\u00DA',
    'uacute': '\u00FA',
    'uarr': '\u2191',
    'uArr': '\u21D1',
    'Ucirc': '\u00DB',
    'ucirc': '\u00FB',
    'Ugrave': '\u00D9',
    'ugrave': '\u00F9',
    'uml': '\u00A8',
    'upsih': '\u03D2',
    'Upsilon': '\u03A5',
    'upsilon': '\u03C5',
    'Uuml': '\u00DC',
    'uuml': '\u00FC',
    'weierp': '\u2118',
    'Xi': '\u039E',
    'xi': '\u03BE',
    'Yacute': '\u00DD',
    'yacute': '\u00FD',
    'yen': '\u00A5',
    'yuml': '\u00FF',
    'Yuml': '\u0178',
    'Zeta': '\u0396',
    'zeta': '\u03B6',
    'zwj': '\u200D',
    'zwnj': '\u200C',
};
// The &ngsp; pseudo-entity is denoting a space. see:
// https://github.com/dart-lang/angular/blob/0bb611387d29d65b5af7f9d2515ab571fd3fbee4/_tests/test/compiler/preserve_whitespace_test.dart
export var NGSP_UNICODE = '\uE500';
NAMED_ENTITIES['ngsp'] = NGSP_UNICODE;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFncy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyL3NyYy9tbF9wYXJzZXIvdGFncy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxNQUFNLENBQU4sSUFBWSxjQUlYO0FBSkQsV0FBWSxjQUFjO0lBQ3hCLDJEQUFRLENBQUE7SUFDUiwrRUFBa0IsQ0FBQTtJQUNsQixxRUFBYSxDQUFBO0FBQ2YsQ0FBQyxFQUpXLGNBQWMsS0FBZCxjQUFjLFFBSXpCO0FBaUJELE1BQU0sVUFBVSxXQUFXLENBQUMsV0FBbUI7SUFDN0MsSUFBSSxXQUFXLENBQUMsQ0FBQyxDQUFDLElBQUksR0FBRyxFQUFFO1FBQ3pCLE9BQU8sQ0FBQyxJQUFJLEVBQUUsV0FBVyxDQUFDLENBQUM7S0FDNUI7SUFFRCxJQUFNLFVBQVUsR0FBRyxXQUFXLENBQUMsT0FBTyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUUvQyxJQUFJLFVBQVUsSUFBSSxDQUFDLENBQUMsRUFBRTtRQUNwQixNQUFNLElBQUksS0FBSyxDQUFDLDBCQUF1QixXQUFXLHFDQUErQixDQUFDLENBQUM7S0FDcEY7SUFFRCxPQUFPLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsVUFBVSxDQUFDLEVBQUUsV0FBVyxDQUFDLEtBQUssQ0FBQyxVQUFVLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUMvRSxDQUFDO0FBRUQsK0RBQStEO0FBQy9ELE1BQU0sVUFBVSxhQUFhLENBQUMsT0FBZTtJQUMzQyxPQUFPLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxjQUFjLENBQUM7QUFDcEQsQ0FBQztBQUVELDZEQUE2RDtBQUM3RCxNQUFNLFVBQVUsV0FBVyxDQUFDLE9BQWU7SUFDekMsT0FBTyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssWUFBWSxDQUFDO0FBQ2xELENBQUM7QUFFRCw4REFBOEQ7QUFDOUQsTUFBTSxVQUFVLFlBQVksQ0FBQyxPQUFlO0lBQzFDLE9BQU8sV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLGFBQWEsQ0FBQztBQUNuRCxDQUFDO0FBSUQsTUFBTSxVQUFVLFdBQVcsQ0FBQyxRQUF1QjtJQUNqRCxPQUFPLFFBQVEsS0FBSyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzdELENBQUM7QUFFRCxNQUFNLFVBQVUsY0FBYyxDQUFDLE1BQWMsRUFBRSxTQUFpQjtJQUM5RCxPQUFPLE1BQU0sQ0FBQyxDQUFDLENBQUMsTUFBSSxNQUFNLFNBQUksU0FBVyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUM7QUFDeEQsQ0FBQztBQUVELHlFQUF5RTtBQUN6RSwyREFBMkQ7QUFDM0Qsa0VBQWtFO0FBQ2xFLDZGQUE2RjtBQUM3RixTQUFTO0FBQ1QsTUFBTSxDQUFDLElBQU0sY0FBYyxHQUEwQjtJQUNuRCxRQUFRLEVBQUUsUUFBUTtJQUNsQixRQUFRLEVBQUUsUUFBUTtJQUNsQixPQUFPLEVBQUUsUUFBUTtJQUNqQixPQUFPLEVBQUUsUUFBUTtJQUNqQixPQUFPLEVBQUUsUUFBUTtJQUNqQixPQUFPLEVBQUUsUUFBUTtJQUNqQixPQUFPLEVBQUUsUUFBUTtJQUNqQixRQUFRLEVBQUUsUUFBUTtJQUNsQixRQUFRLEVBQUUsUUFBUTtJQUNsQixTQUFTLEVBQUUsUUFBUTtJQUNuQixPQUFPLEVBQUUsUUFBUTtJQUNqQixPQUFPLEVBQUUsUUFBUTtJQUNqQixLQUFLLEVBQUUsR0FBRztJQUNWLEtBQUssRUFBRSxRQUFRO0lBQ2YsS0FBSyxFQUFFLFFBQVE7SUFDZixNQUFNLEVBQUUsUUFBUTtJQUNoQixPQUFPLEVBQUUsUUFBUTtJQUNqQixPQUFPLEVBQUUsUUFBUTtJQUNqQixPQUFPLEVBQUUsUUFBUTtJQUNqQixRQUFRLEVBQUUsUUFBUTtJQUNsQixRQUFRLEVBQUUsUUFBUTtJQUNsQixNQUFNLEVBQUUsUUFBUTtJQUNoQixNQUFNLEVBQUUsUUFBUTtJQUNoQixPQUFPLEVBQUUsUUFBUTtJQUNqQixNQUFNLEVBQUUsUUFBUTtJQUNoQixNQUFNLEVBQUUsUUFBUTtJQUNoQixRQUFRLEVBQUUsUUFBUTtJQUNsQixNQUFNLEVBQUUsUUFBUTtJQUNoQixLQUFLLEVBQUUsUUFBUTtJQUNmLFFBQVEsRUFBRSxRQUFRO0lBQ2xCLFFBQVEsRUFBRSxRQUFRO0lBQ2xCLE9BQU8sRUFBRSxRQUFRO0lBQ2pCLE1BQU0sRUFBRSxRQUFRO0lBQ2hCLEtBQUssRUFBRSxRQUFRO0lBQ2YsS0FBSyxFQUFFLFFBQVE7SUFDZixNQUFNLEVBQUUsUUFBUTtJQUNoQixPQUFPLEVBQUUsUUFBUTtJQUNqQixNQUFNLEVBQUUsUUFBUTtJQUNoQixNQUFNLEVBQUUsUUFBUTtJQUNoQixPQUFPLEVBQUUsUUFBUTtJQUNqQixLQUFLLEVBQUUsUUFBUTtJQUNmLFFBQVEsRUFBRSxRQUFRO0lBQ2xCLFFBQVEsRUFBRSxRQUFRO0lBQ2xCLFFBQVEsRUFBRSxRQUFRO0lBQ2xCLE1BQU0sRUFBRSxRQUFRO0lBQ2hCLE1BQU0sRUFBRSxRQUFRO0lBQ2hCLEtBQUssRUFBRSxRQUFRO0lBQ2YsT0FBTyxFQUFFLFFBQVE7SUFDakIsT0FBTyxFQUFFLFFBQVE7SUFDakIsT0FBTyxFQUFFLFFBQVE7SUFDakIsUUFBUSxFQUFFLFFBQVE7SUFDbEIsUUFBUSxFQUFFLFFBQVE7SUFDbEIsUUFBUSxFQUFFLFFBQVE7SUFDbEIsT0FBTyxFQUFFLFFBQVE7SUFDakIsT0FBTyxFQUFFLFFBQVE7SUFDakIsUUFBUSxFQUFFLFFBQVE7SUFDbEIsUUFBUSxFQUFFLFFBQVE7SUFDbEIsT0FBTyxFQUFFLFFBQVE7SUFDakIsTUFBTSxFQUFFLFFBQVE7SUFDaEIsTUFBTSxFQUFFLFFBQVE7SUFDaEIsU0FBUyxFQUFFLFFBQVE7SUFDbkIsU0FBUyxFQUFFLFFBQVE7SUFDbkIsT0FBTyxFQUFFLFFBQVE7SUFDakIsS0FBSyxFQUFFLFFBQVE7SUFDZixLQUFLLEVBQUUsUUFBUTtJQUNmLEtBQUssRUFBRSxRQUFRO0lBQ2YsS0FBSyxFQUFFLFFBQVE7SUFDZixNQUFNLEVBQUUsUUFBUTtJQUNoQixNQUFNLEVBQUUsUUFBUTtJQUNoQixNQUFNLEVBQUUsUUFBUTtJQUNoQixPQUFPLEVBQUUsUUFBUTtJQUNqQixNQUFNLEVBQUUsUUFBUTtJQUNoQixRQUFRLEVBQUUsUUFBUTtJQUNsQixRQUFRLEVBQUUsUUFBUTtJQUNsQixRQUFRLEVBQUUsUUFBUTtJQUNsQixRQUFRLEVBQUUsUUFBUTtJQUNsQixPQUFPLEVBQUUsUUFBUTtJQUNqQixPQUFPLEVBQUUsUUFBUTtJQUNqQixPQUFPLEVBQUUsUUFBUTtJQUNqQixJQUFJLEVBQUUsUUFBUTtJQUNkLElBQUksRUFBRSxHQUFHO0lBQ1QsTUFBTSxFQUFFLFFBQVE7SUFDaEIsTUFBTSxFQUFFLFFBQVE7SUFDaEIsUUFBUSxFQUFFLFFBQVE7SUFDbEIsUUFBUSxFQUFFLFFBQVE7SUFDbEIsUUFBUSxFQUFFLFFBQVE7SUFDbEIsUUFBUSxFQUFFLFFBQVE7SUFDbEIsT0FBTyxFQUFFLFFBQVE7SUFDakIsT0FBTyxFQUFFLFFBQVE7SUFDakIsT0FBTyxFQUFFLFFBQVE7SUFDakIsUUFBUSxFQUFFLFFBQVE7SUFDbEIsUUFBUSxFQUFFLFFBQVE7SUFDbEIsT0FBTyxFQUFFLFFBQVE7SUFDakIsT0FBTyxFQUFFLFFBQVE7SUFDakIsS0FBSyxFQUFFLFFBQVE7SUFDZixNQUFNLEVBQUUsUUFBUTtJQUNoQixNQUFNLEVBQUUsUUFBUTtJQUNoQixRQUFRLEVBQUUsUUFBUTtJQUNsQixNQUFNLEVBQUUsUUFBUTtJQUNoQixNQUFNLEVBQUUsUUFBUTtJQUNoQixNQUFNLEVBQUUsUUFBUTtJQUNoQixPQUFPLEVBQUUsUUFBUTtJQUNqQixPQUFPLEVBQUUsUUFBUTtJQUNqQixRQUFRLEVBQUUsUUFBUTtJQUNsQixRQUFRLEVBQUUsUUFBUTtJQUNsQixNQUFNLEVBQUUsUUFBUTtJQUNoQixPQUFPLEVBQUUsUUFBUTtJQUNqQixNQUFNLEVBQUUsUUFBUTtJQUNoQixNQUFNLEVBQUUsUUFBUTtJQUNoQixPQUFPLEVBQUUsUUFBUTtJQUNqQixPQUFPLEVBQUUsUUFBUTtJQUNqQixJQUFJLEVBQUUsUUFBUTtJQUNkLFFBQVEsRUFBRSxRQUFRO0lBQ2xCLFFBQVEsRUFBRSxRQUFRO0lBQ2xCLEtBQUssRUFBRSxRQUFRO0lBQ2YsS0FBSyxFQUFFLFFBQVE7SUFDZixRQUFRLEVBQUUsUUFBUTtJQUNsQixPQUFPLEVBQUUsUUFBUTtJQUNqQixJQUFJLEVBQUUsR0FBRztJQUNULE1BQU0sRUFBRSxRQUFRO0lBQ2hCLE9BQU8sRUFBRSxRQUFRO0lBQ2pCLE9BQU8sRUFBRSxRQUFRO0lBQ2pCLFFBQVEsRUFBRSxRQUFRO0lBQ2xCLE9BQU8sRUFBRSxRQUFRO0lBQ2pCLElBQUksRUFBRSxRQUFRO0lBQ2QsSUFBSSxFQUFFLFFBQVE7SUFDZCxPQUFPLEVBQUUsUUFBUTtJQUNqQixNQUFNLEVBQUUsUUFBUTtJQUNoQixPQUFPLEVBQUUsUUFBUTtJQUNqQixJQUFJLEVBQUUsUUFBUTtJQUNkLElBQUksRUFBRSxRQUFRO0lBQ2QsS0FBSyxFQUFFLFFBQVE7SUFDZixPQUFPLEVBQUUsUUFBUTtJQUNqQixNQUFNLEVBQUUsUUFBUTtJQUNoQixRQUFRLEVBQUUsUUFBUTtJQUNsQixRQUFRLEVBQUUsUUFBUTtJQUNsQixJQUFJLEVBQUUsUUFBUTtJQUNkLElBQUksRUFBRSxRQUFRO0lBQ2QsUUFBUSxFQUFFLFFBQVE7SUFDbEIsUUFBUSxFQUFFLFFBQVE7SUFDbEIsT0FBTyxFQUFFLFFBQVE7SUFDakIsT0FBTyxFQUFFLFFBQVE7SUFDakIsT0FBTyxFQUFFLFFBQVE7SUFDakIsT0FBTyxFQUFFLFFBQVE7SUFDakIsUUFBUSxFQUFFLFFBQVE7SUFDbEIsUUFBUSxFQUFFLFFBQVE7SUFDbEIsT0FBTyxFQUFFLFFBQVE7SUFDakIsT0FBTyxFQUFFLFFBQVE7SUFDakIsT0FBTyxFQUFFLFFBQVE7SUFDakIsU0FBUyxFQUFFLFFBQVE7SUFDbkIsU0FBUyxFQUFFLFFBQVE7SUFDbkIsT0FBTyxFQUFFLFFBQVE7SUFDakIsSUFBSSxFQUFFLFFBQVE7SUFDZCxNQUFNLEVBQUUsUUFBUTtJQUNoQixNQUFNLEVBQUUsUUFBUTtJQUNoQixRQUFRLEVBQUUsUUFBUTtJQUNsQixRQUFRLEVBQUUsUUFBUTtJQUNsQixRQUFRLEVBQUUsUUFBUTtJQUNsQixRQUFRLEVBQUUsUUFBUTtJQUNsQixRQUFRLEVBQUUsUUFBUTtJQUNsQixNQUFNLEVBQUUsUUFBUTtJQUNoQixNQUFNLEVBQUUsUUFBUTtJQUNoQixNQUFNLEVBQUUsUUFBUTtJQUNoQixRQUFRLEVBQUUsUUFBUTtJQUNsQixNQUFNLEVBQUUsUUFBUTtJQUNoQixLQUFLLEVBQUUsUUFBUTtJQUNmLEtBQUssRUFBRSxRQUFRO0lBQ2YsSUFBSSxFQUFFLFFBQVE7SUFDZCxJQUFJLEVBQUUsUUFBUTtJQUNkLEtBQUssRUFBRSxRQUFRO0lBQ2YsUUFBUSxFQUFFLFFBQVE7SUFDbEIsT0FBTyxFQUFFLFFBQVE7SUFDakIsT0FBTyxFQUFFLFFBQVE7SUFDakIsT0FBTyxFQUFFLFFBQVE7SUFDakIsTUFBTSxFQUFFLFFBQVE7SUFDaEIsTUFBTSxFQUFFLFFBQVE7SUFDaEIsS0FBSyxFQUFFLFFBQVE7SUFDZixLQUFLLEVBQUUsUUFBUTtJQUNmLE1BQU0sRUFBRSxRQUFRO0lBQ2hCLE9BQU8sRUFBRSxRQUFRO0lBQ2pCLE1BQU0sRUFBRSxRQUFRO0lBQ2hCLE9BQU8sRUFBRSxRQUFRO0lBQ2pCLE1BQU0sRUFBRSxRQUFRO0lBQ2hCLE1BQU0sRUFBRSxRQUFRO0lBQ2hCLE9BQU8sRUFBRSxRQUFRO0lBQ2pCLE9BQU8sRUFBRSxRQUFRO0lBQ2pCLE1BQU0sRUFBRSxRQUFRO0lBQ2hCLEtBQUssRUFBRSxRQUFRO0lBQ2YsUUFBUSxFQUFFLFFBQVE7SUFDbEIsS0FBSyxFQUFFLFFBQVE7SUFDZixLQUFLLEVBQUUsUUFBUTtJQUNmLEtBQUssRUFBRSxRQUFRO0lBQ2YsUUFBUSxFQUFFLFFBQVE7SUFDbEIsT0FBTyxFQUFFLFFBQVE7SUFDakIsT0FBTyxFQUFFLFFBQVE7SUFDakIsUUFBUSxFQUFFLFFBQVE7SUFDbEIsUUFBUSxFQUFFLFFBQVE7SUFDbEIsTUFBTSxFQUFFLFFBQVE7SUFDaEIsTUFBTSxFQUFFLFFBQVE7SUFDaEIsS0FBSyxFQUFFLFFBQVE7SUFDZixPQUFPLEVBQUUsUUFBUTtJQUNqQixPQUFPLEVBQUUsUUFBUTtJQUNqQixRQUFRLEVBQUUsUUFBUTtJQUNsQixLQUFLLEVBQUUsUUFBUTtJQUNmLFFBQVEsRUFBRSxRQUFRO0lBQ2xCLEtBQUssRUFBRSxRQUFRO0lBQ2YsTUFBTSxFQUFFLFFBQVE7SUFDaEIsS0FBSyxFQUFFLFFBQVE7SUFDZixLQUFLLEVBQUUsUUFBUTtJQUNmLE1BQU0sRUFBRSxRQUFRO0lBQ2hCLE1BQU0sRUFBRSxRQUFRO0lBQ2hCLE1BQU0sRUFBRSxRQUFRO0lBQ2hCLE1BQU0sRUFBRSxRQUFRO0lBQ2hCLE9BQU8sRUFBRSxRQUFRO0lBQ2pCLEtBQUssRUFBRSxRQUFRO0lBQ2YsS0FBSyxFQUFFLFFBQVE7SUFDZixRQUFRLEVBQUUsUUFBUTtJQUNsQixPQUFPLEVBQUUsUUFBUTtJQUNqQixPQUFPLEVBQUUsUUFBUTtJQUNqQixVQUFVLEVBQUUsUUFBUTtJQUNwQixRQUFRLEVBQUUsUUFBUTtJQUNsQixPQUFPLEVBQUUsUUFBUTtJQUNqQixPQUFPLEVBQUUsUUFBUTtJQUNqQixPQUFPLEVBQUUsUUFBUTtJQUNqQixPQUFPLEVBQUUsUUFBUTtJQUNqQixPQUFPLEVBQUUsUUFBUTtJQUNqQixRQUFRLEVBQUUsUUFBUTtJQUNsQixRQUFRLEVBQUUsUUFBUTtJQUNsQixNQUFNLEVBQUUsUUFBUTtJQUNoQixNQUFNLEVBQUUsUUFBUTtJQUNoQixPQUFPLEVBQUUsUUFBUTtJQUNqQixPQUFPLEVBQUUsUUFBUTtJQUNqQixRQUFRLEVBQUUsUUFBUTtJQUNsQixRQUFRLEVBQUUsUUFBUTtJQUNsQixLQUFLLEVBQUUsUUFBUTtJQUNmLE9BQU8sRUFBRSxRQUFRO0lBQ2pCLFNBQVMsRUFBRSxRQUFRO0lBQ25CLFNBQVMsRUFBRSxRQUFRO0lBQ25CLE1BQU0sRUFBRSxRQUFRO0lBQ2hCLE1BQU0sRUFBRSxRQUFRO0lBQ2hCLFFBQVEsRUFBRSxRQUFRO0lBQ2xCLElBQUksRUFBRSxRQUFRO0lBQ2QsSUFBSSxFQUFFLFFBQVE7SUFDZCxRQUFRLEVBQUUsUUFBUTtJQUNsQixRQUFRLEVBQUUsUUFBUTtJQUNsQixLQUFLLEVBQUUsUUFBUTtJQUNmLE1BQU0sRUFBRSxRQUFRO0lBQ2hCLE1BQU0sRUFBRSxRQUFRO0lBQ2hCLE1BQU0sRUFBRSxRQUFRO0lBQ2hCLE1BQU0sRUFBRSxRQUFRO0lBQ2hCLEtBQUssRUFBRSxRQUFRO0lBQ2YsTUFBTSxFQUFFLFFBQVE7Q0FDakIsQ0FBQztBQUVGLHFEQUFxRDtBQUNyRCx3SUFBd0k7QUFDeEksTUFBTSxDQUFDLElBQU0sWUFBWSxHQUFHLFFBQVEsQ0FBQztBQUVyQyxjQUFjLENBQUMsTUFBTSxDQUFDLEdBQUcsWUFBWSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5leHBvcnQgZW51bSBUYWdDb250ZW50VHlwZSB7XG4gIFJBV19URVhULFxuICBFU0NBUEFCTEVfUkFXX1RFWFQsXG4gIFBBUlNBQkxFX0RBVEFcbn1cblxuZXhwb3J0IGludGVyZmFjZSBUYWdEZWZpbml0aW9uIHtcbiAgY2xvc2VkQnlQYXJlbnQ6IGJvb2xlYW47XG4gIHJlcXVpcmVkUGFyZW50czoge1trZXk6IHN0cmluZ106IGJvb2xlYW59O1xuICBwYXJlbnRUb0FkZDogc3RyaW5nO1xuICBpbXBsaWNpdE5hbWVzcGFjZVByZWZpeDogc3RyaW5nfG51bGw7XG4gIGNvbnRlbnRUeXBlOiBUYWdDb250ZW50VHlwZTtcbiAgaXNWb2lkOiBib29sZWFuO1xuICBpZ25vcmVGaXJzdExmOiBib29sZWFuO1xuICBjYW5TZWxmQ2xvc2U6IGJvb2xlYW47XG5cbiAgcmVxdWlyZUV4dHJhUGFyZW50KGN1cnJlbnRQYXJlbnQ6IHN0cmluZyk6IGJvb2xlYW47XG5cbiAgaXNDbG9zZWRCeUNoaWxkKG5hbWU6IHN0cmluZyk6IGJvb2xlYW47XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzcGxpdE5zTmFtZShlbGVtZW50TmFtZTogc3RyaW5nKTogW3N0cmluZyB8IG51bGwsIHN0cmluZ10ge1xuICBpZiAoZWxlbWVudE5hbWVbMF0gIT0gJzonKSB7XG4gICAgcmV0dXJuIFtudWxsLCBlbGVtZW50TmFtZV07XG4gIH1cblxuICBjb25zdCBjb2xvbkluZGV4ID0gZWxlbWVudE5hbWUuaW5kZXhPZignOicsIDEpO1xuXG4gIGlmIChjb2xvbkluZGV4ID09IC0xKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBVbnN1cHBvcnRlZCBmb3JtYXQgXCIke2VsZW1lbnROYW1lfVwiIGV4cGVjdGluZyBcIjpuYW1lc3BhY2U6bmFtZVwiYCk7XG4gIH1cblxuICByZXR1cm4gW2VsZW1lbnROYW1lLnNsaWNlKDEsIGNvbG9uSW5kZXgpLCBlbGVtZW50TmFtZS5zbGljZShjb2xvbkluZGV4ICsgMSldO1xufVxuXG4vLyBgPG5nLWNvbnRhaW5lcj5gIHRhZ3Mgd29yayB0aGUgc2FtZSByZWdhcmRsZXNzIHRoZSBuYW1lc3BhY2VcbmV4cG9ydCBmdW5jdGlvbiBpc05nQ29udGFpbmVyKHRhZ05hbWU6IHN0cmluZyk6IGJvb2xlYW4ge1xuICByZXR1cm4gc3BsaXROc05hbWUodGFnTmFtZSlbMV0gPT09ICduZy1jb250YWluZXInO1xufVxuXG4vLyBgPG5nLWNvbnRlbnQ+YCB0YWdzIHdvcmsgdGhlIHNhbWUgcmVnYXJkbGVzcyB0aGUgbmFtZXNwYWNlXG5leHBvcnQgZnVuY3Rpb24gaXNOZ0NvbnRlbnQodGFnTmFtZTogc3RyaW5nKTogYm9vbGVhbiB7XG4gIHJldHVybiBzcGxpdE5zTmFtZSh0YWdOYW1lKVsxXSA9PT0gJ25nLWNvbnRlbnQnO1xufVxuXG4vLyBgPG5nLXRlbXBsYXRlPmAgdGFncyB3b3JrIHRoZSBzYW1lIHJlZ2FyZGxlc3MgdGhlIG5hbWVzcGFjZVxuZXhwb3J0IGZ1bmN0aW9uIGlzTmdUZW1wbGF0ZSh0YWdOYW1lOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgcmV0dXJuIHNwbGl0TnNOYW1lKHRhZ05hbWUpWzFdID09PSAnbmctdGVtcGxhdGUnO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0TnNQcmVmaXgoZnVsbE5hbWU6IHN0cmluZyk6IHN0cmluZztcbmV4cG9ydCBmdW5jdGlvbiBnZXROc1ByZWZpeChmdWxsTmFtZTogbnVsbCk6IG51bGw7XG5leHBvcnQgZnVuY3Rpb24gZ2V0TnNQcmVmaXgoZnVsbE5hbWU6IHN0cmluZyB8IG51bGwpOiBzdHJpbmd8bnVsbCB7XG4gIHJldHVybiBmdWxsTmFtZSA9PT0gbnVsbCA/IG51bGwgOiBzcGxpdE5zTmFtZShmdWxsTmFtZSlbMF07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtZXJnZU5zQW5kTmFtZShwcmVmaXg6IHN0cmluZywgbG9jYWxOYW1lOiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gcHJlZml4ID8gYDoke3ByZWZpeH06JHtsb2NhbE5hbWV9YCA6IGxvY2FsTmFtZTtcbn1cblxuLy8gc2VlIGh0dHA6Ly93d3cudzMub3JnL1RSL2h0bWw1MS9zeW50YXguaHRtbCNuYW1lZC1jaGFyYWN0ZXItcmVmZXJlbmNlc1xuLy8gc2VlIGh0dHBzOi8vaHRtbC5zcGVjLndoYXR3Zy5vcmcvbXVsdGlwYWdlL2VudGl0aWVzLmpzb25cbi8vIFRoaXMgbGlzdCBpcyBub3QgZXhoYXVzdGl2ZSB0byBrZWVwIHRoZSBjb21waWxlciBmb290cHJpbnQgbG93LlxuLy8gVGhlIGAmIzEyMztgIC8gYCYjeDFhYjtgIHN5bnRheCBzaG91bGQgYmUgdXNlZCB3aGVuIHRoZSBuYW1lZCBjaGFyYWN0ZXIgcmVmZXJlbmNlIGRvZXMgbm90XG4vLyBleGlzdC5cbmV4cG9ydCBjb25zdCBOQU1FRF9FTlRJVElFUzoge1trOiBzdHJpbmddOiBzdHJpbmd9ID0ge1xuICAnQWFjdXRlJzogJ1xcdTAwQzEnLFxuICAnYWFjdXRlJzogJ1xcdTAwRTEnLFxuICAnQWNpcmMnOiAnXFx1MDBDMicsXG4gICdhY2lyYyc6ICdcXHUwMEUyJyxcbiAgJ2FjdXRlJzogJ1xcdTAwQjQnLFxuICAnQUVsaWcnOiAnXFx1MDBDNicsXG4gICdhZWxpZyc6ICdcXHUwMEU2JyxcbiAgJ0FncmF2ZSc6ICdcXHUwMEMwJyxcbiAgJ2FncmF2ZSc6ICdcXHUwMEUwJyxcbiAgJ2FsZWZzeW0nOiAnXFx1MjEzNScsXG4gICdBbHBoYSc6ICdcXHUwMzkxJyxcbiAgJ2FscGhhJzogJ1xcdTAzQjEnLFxuICAnYW1wJzogJyYnLFxuICAnYW5kJzogJ1xcdTIyMjcnLFxuICAnYW5nJzogJ1xcdTIyMjAnLFxuICAnYXBvcyc6ICdcXHUwMDI3JyxcbiAgJ0FyaW5nJzogJ1xcdTAwQzUnLFxuICAnYXJpbmcnOiAnXFx1MDBFNScsXG4gICdhc3ltcCc6ICdcXHUyMjQ4JyxcbiAgJ0F0aWxkZSc6ICdcXHUwMEMzJyxcbiAgJ2F0aWxkZSc6ICdcXHUwMEUzJyxcbiAgJ0F1bWwnOiAnXFx1MDBDNCcsXG4gICdhdW1sJzogJ1xcdTAwRTQnLFxuICAnYmRxdW8nOiAnXFx1MjAxRScsXG4gICdCZXRhJzogJ1xcdTAzOTInLFxuICAnYmV0YSc6ICdcXHUwM0IyJyxcbiAgJ2JydmJhcic6ICdcXHUwMEE2JyxcbiAgJ2J1bGwnOiAnXFx1MjAyMicsXG4gICdjYXAnOiAnXFx1MjIyOScsXG4gICdDY2VkaWwnOiAnXFx1MDBDNycsXG4gICdjY2VkaWwnOiAnXFx1MDBFNycsXG4gICdjZWRpbCc6ICdcXHUwMEI4JyxcbiAgJ2NlbnQnOiAnXFx1MDBBMicsXG4gICdDaGknOiAnXFx1MDNBNycsXG4gICdjaGknOiAnXFx1MDNDNycsXG4gICdjaXJjJzogJ1xcdTAyQzYnLFxuICAnY2x1YnMnOiAnXFx1MjY2MycsXG4gICdjb25nJzogJ1xcdTIyNDUnLFxuICAnY29weSc6ICdcXHUwMEE5JyxcbiAgJ2NyYXJyJzogJ1xcdTIxQjUnLFxuICAnY3VwJzogJ1xcdTIyMkEnLFxuICAnY3VycmVuJzogJ1xcdTAwQTQnLFxuICAnZGFnZ2VyJzogJ1xcdTIwMjAnLFxuICAnRGFnZ2VyJzogJ1xcdTIwMjEnLFxuICAnZGFycic6ICdcXHUyMTkzJyxcbiAgJ2RBcnInOiAnXFx1MjFEMycsXG4gICdkZWcnOiAnXFx1MDBCMCcsXG4gICdEZWx0YSc6ICdcXHUwMzk0JyxcbiAgJ2RlbHRhJzogJ1xcdTAzQjQnLFxuICAnZGlhbXMnOiAnXFx1MjY2NicsXG4gICdkaXZpZGUnOiAnXFx1MDBGNycsXG4gICdFYWN1dGUnOiAnXFx1MDBDOScsXG4gICdlYWN1dGUnOiAnXFx1MDBFOScsXG4gICdFY2lyYyc6ICdcXHUwMENBJyxcbiAgJ2VjaXJjJzogJ1xcdTAwRUEnLFxuICAnRWdyYXZlJzogJ1xcdTAwQzgnLFxuICAnZWdyYXZlJzogJ1xcdTAwRTgnLFxuICAnZW1wdHknOiAnXFx1MjIwNScsXG4gICdlbXNwJzogJ1xcdTIwMDMnLFxuICAnZW5zcCc6ICdcXHUyMDAyJyxcbiAgJ0Vwc2lsb24nOiAnXFx1MDM5NScsXG4gICdlcHNpbG9uJzogJ1xcdTAzQjUnLFxuICAnZXF1aXYnOiAnXFx1MjI2MScsXG4gICdFdGEnOiAnXFx1MDM5NycsXG4gICdldGEnOiAnXFx1MDNCNycsXG4gICdFVEgnOiAnXFx1MDBEMCcsXG4gICdldGgnOiAnXFx1MDBGMCcsXG4gICdFdW1sJzogJ1xcdTAwQ0InLFxuICAnZXVtbCc6ICdcXHUwMEVCJyxcbiAgJ2V1cm8nOiAnXFx1MjBBQycsXG4gICdleGlzdCc6ICdcXHUyMjAzJyxcbiAgJ2Zub2YnOiAnXFx1MDE5MicsXG4gICdmb3JhbGwnOiAnXFx1MjIwMCcsXG4gICdmcmFjMTInOiAnXFx1MDBCRCcsXG4gICdmcmFjMTQnOiAnXFx1MDBCQycsXG4gICdmcmFjMzQnOiAnXFx1MDBCRScsXG4gICdmcmFzbCc6ICdcXHUyMDQ0JyxcbiAgJ0dhbW1hJzogJ1xcdTAzOTMnLFxuICAnZ2FtbWEnOiAnXFx1MDNCMycsXG4gICdnZSc6ICdcXHUyMjY1JyxcbiAgJ2d0JzogJz4nLFxuICAnaGFycic6ICdcXHUyMTk0JyxcbiAgJ2hBcnInOiAnXFx1MjFENCcsXG4gICdoZWFydHMnOiAnXFx1MjY2NScsXG4gICdoZWxsaXAnOiAnXFx1MjAyNicsXG4gICdJYWN1dGUnOiAnXFx1MDBDRCcsXG4gICdpYWN1dGUnOiAnXFx1MDBFRCcsXG4gICdJY2lyYyc6ICdcXHUwMENFJyxcbiAgJ2ljaXJjJzogJ1xcdTAwRUUnLFxuICAnaWV4Y2wnOiAnXFx1MDBBMScsXG4gICdJZ3JhdmUnOiAnXFx1MDBDQycsXG4gICdpZ3JhdmUnOiAnXFx1MDBFQycsXG4gICdpbWFnZSc6ICdcXHUyMTExJyxcbiAgJ2luZmluJzogJ1xcdTIyMUUnLFxuICAnaW50JzogJ1xcdTIyMkInLFxuICAnSW90YSc6ICdcXHUwMzk5JyxcbiAgJ2lvdGEnOiAnXFx1MDNCOScsXG4gICdpcXVlc3QnOiAnXFx1MDBCRicsXG4gICdpc2luJzogJ1xcdTIyMDgnLFxuICAnSXVtbCc6ICdcXHUwMENGJyxcbiAgJ2l1bWwnOiAnXFx1MDBFRicsXG4gICdLYXBwYSc6ICdcXHUwMzlBJyxcbiAgJ2thcHBhJzogJ1xcdTAzQkEnLFxuICAnTGFtYmRhJzogJ1xcdTAzOUInLFxuICAnbGFtYmRhJzogJ1xcdTAzQkInLFxuICAnbGFuZyc6ICdcXHUyN0U4JyxcbiAgJ2xhcXVvJzogJ1xcdTAwQUInLFxuICAnbGFycic6ICdcXHUyMTkwJyxcbiAgJ2xBcnInOiAnXFx1MjFEMCcsXG4gICdsY2VpbCc6ICdcXHUyMzA4JyxcbiAgJ2xkcXVvJzogJ1xcdTIwMUMnLFxuICAnbGUnOiAnXFx1MjI2NCcsXG4gICdsZmxvb3InOiAnXFx1MjMwQScsXG4gICdsb3dhc3QnOiAnXFx1MjIxNycsXG4gICdsb3onOiAnXFx1MjVDQScsXG4gICdscm0nOiAnXFx1MjAwRScsXG4gICdsc2FxdW8nOiAnXFx1MjAzOScsXG4gICdsc3F1byc6ICdcXHUyMDE4JyxcbiAgJ2x0JzogJzwnLFxuICAnbWFjcic6ICdcXHUwMEFGJyxcbiAgJ21kYXNoJzogJ1xcdTIwMTQnLFxuICAnbWljcm8nOiAnXFx1MDBCNScsXG4gICdtaWRkb3QnOiAnXFx1MDBCNycsXG4gICdtaW51cyc6ICdcXHUyMjEyJyxcbiAgJ011JzogJ1xcdTAzOUMnLFxuICAnbXUnOiAnXFx1MDNCQycsXG4gICduYWJsYSc6ICdcXHUyMjA3JyxcbiAgJ25ic3AnOiAnXFx1MDBBMCcsXG4gICduZGFzaCc6ICdcXHUyMDEzJyxcbiAgJ25lJzogJ1xcdTIyNjAnLFxuICAnbmknOiAnXFx1MjIwQicsXG4gICdub3QnOiAnXFx1MDBBQycsXG4gICdub3Rpbic6ICdcXHUyMjA5JyxcbiAgJ25zdWInOiAnXFx1MjI4NCcsXG4gICdOdGlsZGUnOiAnXFx1MDBEMScsXG4gICdudGlsZGUnOiAnXFx1MDBGMScsXG4gICdOdSc6ICdcXHUwMzlEJyxcbiAgJ251JzogJ1xcdTAzQkQnLFxuICAnT2FjdXRlJzogJ1xcdTAwRDMnLFxuICAnb2FjdXRlJzogJ1xcdTAwRjMnLFxuICAnT2NpcmMnOiAnXFx1MDBENCcsXG4gICdvY2lyYyc6ICdcXHUwMEY0JyxcbiAgJ09FbGlnJzogJ1xcdTAxNTInLFxuICAnb2VsaWcnOiAnXFx1MDE1MycsXG4gICdPZ3JhdmUnOiAnXFx1MDBEMicsXG4gICdvZ3JhdmUnOiAnXFx1MDBGMicsXG4gICdvbGluZSc6ICdcXHUyMDNFJyxcbiAgJ09tZWdhJzogJ1xcdTAzQTknLFxuICAnb21lZ2EnOiAnXFx1MDNDOScsXG4gICdPbWljcm9uJzogJ1xcdTAzOUYnLFxuICAnb21pY3Jvbic6ICdcXHUwM0JGJyxcbiAgJ29wbHVzJzogJ1xcdTIyOTUnLFxuICAnb3InOiAnXFx1MjIyOCcsXG4gICdvcmRmJzogJ1xcdTAwQUEnLFxuICAnb3JkbSc6ICdcXHUwMEJBJyxcbiAgJ09zbGFzaCc6ICdcXHUwMEQ4JyxcbiAgJ29zbGFzaCc6ICdcXHUwMEY4JyxcbiAgJ090aWxkZSc6ICdcXHUwMEQ1JyxcbiAgJ290aWxkZSc6ICdcXHUwMEY1JyxcbiAgJ290aW1lcyc6ICdcXHUyMjk3JyxcbiAgJ091bWwnOiAnXFx1MDBENicsXG4gICdvdW1sJzogJ1xcdTAwRjYnLFxuICAncGFyYSc6ICdcXHUwMEI2JyxcbiAgJ3Blcm1pbCc6ICdcXHUyMDMwJyxcbiAgJ3BlcnAnOiAnXFx1MjJBNScsXG4gICdQaGknOiAnXFx1MDNBNicsXG4gICdwaGknOiAnXFx1MDNDNicsXG4gICdQaSc6ICdcXHUwM0EwJyxcbiAgJ3BpJzogJ1xcdTAzQzAnLFxuICAncGl2JzogJ1xcdTAzRDYnLFxuICAncGx1c21uJzogJ1xcdTAwQjEnLFxuICAncG91bmQnOiAnXFx1MDBBMycsXG4gICdwcmltZSc6ICdcXHUyMDMyJyxcbiAgJ1ByaW1lJzogJ1xcdTIwMzMnLFxuICAncHJvZCc6ICdcXHUyMjBGJyxcbiAgJ3Byb3AnOiAnXFx1MjIxRCcsXG4gICdQc2knOiAnXFx1MDNBOCcsXG4gICdwc2knOiAnXFx1MDNDOCcsXG4gICdxdW90JzogJ1xcdTAwMjInLFxuICAncmFkaWMnOiAnXFx1MjIxQScsXG4gICdyYW5nJzogJ1xcdTI3RTknLFxuICAncmFxdW8nOiAnXFx1MDBCQicsXG4gICdyYXJyJzogJ1xcdTIxOTInLFxuICAnckFycic6ICdcXHUyMUQyJyxcbiAgJ3JjZWlsJzogJ1xcdTIzMDknLFxuICAncmRxdW8nOiAnXFx1MjAxRCcsXG4gICdyZWFsJzogJ1xcdTIxMUMnLFxuICAncmVnJzogJ1xcdTAwQUUnLFxuICAncmZsb29yJzogJ1xcdTIzMEInLFxuICAnUmhvJzogJ1xcdTAzQTEnLFxuICAncmhvJzogJ1xcdTAzQzEnLFxuICAncmxtJzogJ1xcdTIwMEYnLFxuICAncnNhcXVvJzogJ1xcdTIwM0EnLFxuICAncnNxdW8nOiAnXFx1MjAxOScsXG4gICdzYnF1byc6ICdcXHUyMDFBJyxcbiAgJ1NjYXJvbic6ICdcXHUwMTYwJyxcbiAgJ3NjYXJvbic6ICdcXHUwMTYxJyxcbiAgJ3Nkb3QnOiAnXFx1MjJDNScsXG4gICdzZWN0JzogJ1xcdTAwQTcnLFxuICAnc2h5JzogJ1xcdTAwQUQnLFxuICAnU2lnbWEnOiAnXFx1MDNBMycsXG4gICdzaWdtYSc6ICdcXHUwM0MzJyxcbiAgJ3NpZ21hZic6ICdcXHUwM0MyJyxcbiAgJ3NpbSc6ICdcXHUyMjNDJyxcbiAgJ3NwYWRlcyc6ICdcXHUyNjYwJyxcbiAgJ3N1Yic6ICdcXHUyMjgyJyxcbiAgJ3N1YmUnOiAnXFx1MjI4NicsXG4gICdzdW0nOiAnXFx1MjIxMScsXG4gICdzdXAnOiAnXFx1MjI4MycsXG4gICdzdXAxJzogJ1xcdTAwQjknLFxuICAnc3VwMic6ICdcXHUwMEIyJyxcbiAgJ3N1cDMnOiAnXFx1MDBCMycsXG4gICdzdXBlJzogJ1xcdTIyODcnLFxuICAnc3psaWcnOiAnXFx1MDBERicsXG4gICdUYXUnOiAnXFx1MDNBNCcsXG4gICd0YXUnOiAnXFx1MDNDNCcsXG4gICd0aGVyZTQnOiAnXFx1MjIzNCcsXG4gICdUaGV0YSc6ICdcXHUwMzk4JyxcbiAgJ3RoZXRhJzogJ1xcdTAzQjgnLFxuICAndGhldGFzeW0nOiAnXFx1MDNEMScsXG4gICd0aGluc3AnOiAnXFx1MjAwOScsXG4gICdUSE9STic6ICdcXHUwMERFJyxcbiAgJ3Rob3JuJzogJ1xcdTAwRkUnLFxuICAndGlsZGUnOiAnXFx1MDJEQycsXG4gICd0aW1lcyc6ICdcXHUwMEQ3JyxcbiAgJ3RyYWRlJzogJ1xcdTIxMjInLFxuICAnVWFjdXRlJzogJ1xcdTAwREEnLFxuICAndWFjdXRlJzogJ1xcdTAwRkEnLFxuICAndWFycic6ICdcXHUyMTkxJyxcbiAgJ3VBcnInOiAnXFx1MjFEMScsXG4gICdVY2lyYyc6ICdcXHUwMERCJyxcbiAgJ3VjaXJjJzogJ1xcdTAwRkInLFxuICAnVWdyYXZlJzogJ1xcdTAwRDknLFxuICAndWdyYXZlJzogJ1xcdTAwRjknLFxuICAndW1sJzogJ1xcdTAwQTgnLFxuICAndXBzaWgnOiAnXFx1MDNEMicsXG4gICdVcHNpbG9uJzogJ1xcdTAzQTUnLFxuICAndXBzaWxvbic6ICdcXHUwM0M1JyxcbiAgJ1V1bWwnOiAnXFx1MDBEQycsXG4gICd1dW1sJzogJ1xcdTAwRkMnLFxuICAnd2VpZXJwJzogJ1xcdTIxMTgnLFxuICAnWGknOiAnXFx1MDM5RScsXG4gICd4aSc6ICdcXHUwM0JFJyxcbiAgJ1lhY3V0ZSc6ICdcXHUwMEREJyxcbiAgJ3lhY3V0ZSc6ICdcXHUwMEZEJyxcbiAgJ3llbic6ICdcXHUwMEE1JyxcbiAgJ3l1bWwnOiAnXFx1MDBGRicsXG4gICdZdW1sJzogJ1xcdTAxNzgnLFxuICAnWmV0YSc6ICdcXHUwMzk2JyxcbiAgJ3pldGEnOiAnXFx1MDNCNicsXG4gICd6d2onOiAnXFx1MjAwRCcsXG4gICd6d25qJzogJ1xcdTIwMEMnLFxufTtcblxuLy8gVGhlICZuZ3NwOyBwc2V1ZG8tZW50aXR5IGlzIGRlbm90aW5nIGEgc3BhY2UuIHNlZTpcbi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9kYXJ0LWxhbmcvYW5ndWxhci9ibG9iLzBiYjYxMTM4N2QyOWQ2NWI1YWY3ZjlkMjUxNWFiNTcxZmQzZmJlZTQvX3Rlc3RzL3Rlc3QvY29tcGlsZXIvcHJlc2VydmVfd2hpdGVzcGFjZV90ZXN0LmRhcnRcbmV4cG9ydCBjb25zdCBOR1NQX1VOSUNPREUgPSAnXFx1RTUwMCc7XG5cbk5BTUVEX0VOVElUSUVTWyduZ3NwJ10gPSBOR1NQX1VOSUNPREU7XG4iXX0=