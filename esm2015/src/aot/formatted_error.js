/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { syntaxError } from '../util';
const FORMATTED_MESSAGE = 'ngFormattedMessage';
function indentStr(level) {
    if (level <= 0)
        return '';
    if (level < 6)
        return ['', ' ', '  ', '   ', '    ', '     '][level];
    const half = indentStr(Math.floor(level / 2));
    return half + half + (level % 2 === 1 ? ' ' : '');
}
function formatChain(chain, indent = 0) {
    if (!chain)
        return '';
    const position = chain.position ?
        `${chain.position.fileName}(${chain.position.line + 1},${chain.position.column + 1})` :
        '';
    const prefix = position && indent === 0 ? `${position}: ` : '';
    const postfix = position && indent !== 0 ? ` at ${position}` : '';
    let message = `${prefix}${chain.message}${postfix}`;
    if (chain.next) {
        for (const kid of chain.next) {
            message += '\n' + formatChain(kid, indent + 2);
        }
    }
    return `${indentStr(indent)}${message}`;
}
export function formattedError(chain) {
    const message = formatChain(chain) + '.';
    const error = syntaxError(message);
    error[FORMATTED_MESSAGE] = true;
    error.chain = chain;
    error.position = chain.position;
    return error;
}
export function isFormattedError(error) {
    return !!error[FORMATTED_MESSAGE];
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm9ybWF0dGVkX2Vycm9yLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXIvc3JjL2FvdC9mb3JtYXR0ZWRfZXJyb3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLFdBQVcsRUFBQyxNQUFNLFNBQVMsQ0FBQztBQW1CcEMsTUFBTSxpQkFBaUIsR0FBRyxvQkFBb0IsQ0FBQztBQUUvQyxTQUFTLFNBQVMsQ0FBQyxLQUFhO0lBQzlCLElBQUksS0FBSyxJQUFJLENBQUM7UUFBRSxPQUFPLEVBQUUsQ0FBQztJQUMxQixJQUFJLEtBQUssR0FBRyxDQUFDO1FBQUUsT0FBTyxDQUFDLEVBQUUsRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsT0FBTyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDckUsTUFBTSxJQUFJLEdBQUcsU0FBUyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDOUMsT0FBTyxJQUFJLEdBQUcsSUFBSSxHQUFHLENBQUMsS0FBSyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDcEQsQ0FBQztBQUVELFNBQVMsV0FBVyxDQUFDLEtBQXdDLEVBQUUsU0FBaUIsQ0FBQztJQUMvRSxJQUFJLENBQUMsS0FBSztRQUFFLE9BQU8sRUFBRSxDQUFDO0lBQ3RCLE1BQU0sUUFBUSxHQUFHLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUM3QixHQUFHLEtBQUssQ0FBQyxRQUFRLENBQUMsUUFBUSxJQUFJLEtBQUssQ0FBQyxRQUFRLENBQUMsSUFBSSxHQUFDLENBQUMsSUFBSSxLQUFLLENBQUMsUUFBUSxDQUFDLE1BQU0sR0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ25GLEVBQUUsQ0FBQztJQUNQLE1BQU0sTUFBTSxHQUFHLFFBQVEsSUFBSSxNQUFNLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLFFBQVEsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7SUFDL0QsTUFBTSxPQUFPLEdBQUcsUUFBUSxJQUFJLE1BQU0sS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sUUFBUSxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztJQUNsRSxJQUFJLE9BQU8sR0FBRyxHQUFHLE1BQU0sR0FBRyxLQUFLLENBQUMsT0FBTyxHQUFHLE9BQU8sRUFBRSxDQUFDO0lBRXBELElBQUksS0FBSyxDQUFDLElBQUksRUFBRTtRQUNkLEtBQUssTUFBTSxHQUFHLElBQUksS0FBSyxDQUFDLElBQUksRUFBRTtZQUM1QixPQUFPLElBQUksSUFBSSxHQUFHLFdBQVcsQ0FBQyxHQUFHLEVBQUUsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDO1NBQ2hEO0tBQ0Y7SUFFRCxPQUFPLEdBQUcsU0FBUyxDQUFDLE1BQU0sQ0FBQyxHQUFHLE9BQU8sRUFBRSxDQUFDO0FBQzFDLENBQUM7QUFFRCxNQUFNLFVBQVUsY0FBYyxDQUFDLEtBQTRCO0lBQ3pELE1BQU0sT0FBTyxHQUFHLFdBQVcsQ0FBQyxLQUFLLENBQUMsR0FBRyxHQUFHLENBQUM7SUFDekMsTUFBTSxLQUFLLEdBQUcsV0FBVyxDQUFDLE9BQU8sQ0FBbUIsQ0FBQztJQUNwRCxLQUFhLENBQUMsaUJBQWlCLENBQUMsR0FBRyxJQUFJLENBQUM7SUFDekMsS0FBSyxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7SUFDcEIsS0FBSyxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUMsUUFBUSxDQUFDO0lBQ2hDLE9BQU8sS0FBSyxDQUFDO0FBQ2YsQ0FBQztBQUVELE1BQU0sVUFBVSxnQkFBZ0IsQ0FBQyxLQUFZO0lBQzNDLE9BQU8sQ0FBQyxDQUFFLEtBQWEsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0FBQzdDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7c3ludGF4RXJyb3J9IGZyb20gJy4uL3V0aWwnO1xuXG5leHBvcnQgaW50ZXJmYWNlIFBvc2l0aW9uIHtcbiAgZmlsZU5hbWU6IHN0cmluZztcbiAgbGluZTogbnVtYmVyO1xuICBjb2x1bW46IG51bWJlcjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBGb3JtYXR0ZWRNZXNzYWdlQ2hhaW4ge1xuICBtZXNzYWdlOiBzdHJpbmc7XG4gIHBvc2l0aW9uPzogUG9zaXRpb247XG4gIG5leHQ/OiBGb3JtYXR0ZWRNZXNzYWdlQ2hhaW5bXTtcbn1cblxuZXhwb3J0IHR5cGUgRm9ybWF0dGVkRXJyb3IgPSBFcnJvciAmIHtcbiAgY2hhaW46IEZvcm1hdHRlZE1lc3NhZ2VDaGFpbjtcbiAgcG9zaXRpb24/OiBQb3NpdGlvbjtcbn07XG5cbmNvbnN0IEZPUk1BVFRFRF9NRVNTQUdFID0gJ25nRm9ybWF0dGVkTWVzc2FnZSc7XG5cbmZ1bmN0aW9uIGluZGVudFN0cihsZXZlbDogbnVtYmVyKTogc3RyaW5nIHtcbiAgaWYgKGxldmVsIDw9IDApIHJldHVybiAnJztcbiAgaWYgKGxldmVsIDwgNikgcmV0dXJuIFsnJywgJyAnLCAnICAnLCAnICAgJywgJyAgICAnLCAnICAgICAnXVtsZXZlbF07XG4gIGNvbnN0IGhhbGYgPSBpbmRlbnRTdHIoTWF0aC5mbG9vcihsZXZlbCAvIDIpKTtcbiAgcmV0dXJuIGhhbGYgKyBoYWxmICsgKGxldmVsICUgMiA9PT0gMSA/ICcgJyA6ICcnKTtcbn1cblxuZnVuY3Rpb24gZm9ybWF0Q2hhaW4oY2hhaW46IEZvcm1hdHRlZE1lc3NhZ2VDaGFpbiB8IHVuZGVmaW5lZCwgaW5kZW50OiBudW1iZXIgPSAwKTogc3RyaW5nIHtcbiAgaWYgKCFjaGFpbikgcmV0dXJuICcnO1xuICBjb25zdCBwb3NpdGlvbiA9IGNoYWluLnBvc2l0aW9uID9cbiAgICAgIGAke2NoYWluLnBvc2l0aW9uLmZpbGVOYW1lfSgke2NoYWluLnBvc2l0aW9uLmxpbmUrMX0sJHtjaGFpbi5wb3NpdGlvbi5jb2x1bW4rMX0pYCA6XG4gICAgICAnJztcbiAgY29uc3QgcHJlZml4ID0gcG9zaXRpb24gJiYgaW5kZW50ID09PSAwID8gYCR7cG9zaXRpb259OiBgIDogJyc7XG4gIGNvbnN0IHBvc3RmaXggPSBwb3NpdGlvbiAmJiBpbmRlbnQgIT09IDAgPyBgIGF0ICR7cG9zaXRpb259YCA6ICcnO1xuICBsZXQgbWVzc2FnZSA9IGAke3ByZWZpeH0ke2NoYWluLm1lc3NhZ2V9JHtwb3N0Zml4fWA7XG5cbiAgaWYgKGNoYWluLm5leHQpIHtcbiAgICBmb3IgKGNvbnN0IGtpZCBvZiBjaGFpbi5uZXh0KSB7XG4gICAgICBtZXNzYWdlICs9ICdcXG4nICsgZm9ybWF0Q2hhaW4oa2lkLCBpbmRlbnQgKyAyKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gYCR7aW5kZW50U3RyKGluZGVudCl9JHttZXNzYWdlfWA7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBmb3JtYXR0ZWRFcnJvcihjaGFpbjogRm9ybWF0dGVkTWVzc2FnZUNoYWluKTogRm9ybWF0dGVkRXJyb3Ige1xuICBjb25zdCBtZXNzYWdlID0gZm9ybWF0Q2hhaW4oY2hhaW4pICsgJy4nO1xuICBjb25zdCBlcnJvciA9IHN5bnRheEVycm9yKG1lc3NhZ2UpIGFzIEZvcm1hdHRlZEVycm9yO1xuICAoZXJyb3IgYXMgYW55KVtGT1JNQVRURURfTUVTU0FHRV0gPSB0cnVlO1xuICBlcnJvci5jaGFpbiA9IGNoYWluO1xuICBlcnJvci5wb3NpdGlvbiA9IGNoYWluLnBvc2l0aW9uO1xuICByZXR1cm4gZXJyb3I7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0Zvcm1hdHRlZEVycm9yKGVycm9yOiBFcnJvcik6IGVycm9yIGlzIEZvcm1hdHRlZEVycm9yIHtcbiAgcmV0dXJuICEhKGVycm9yIGFzIGFueSlbRk9STUFUVEVEX01FU1NBR0VdO1xufVxuIl19