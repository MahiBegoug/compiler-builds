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
        define("@angular/compiler/src/i18n/serializers/placeholder", ["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.PlaceholderRegistry = void 0;
    var TAG_TO_PLACEHOLDER_NAMES = {
        'A': 'LINK',
        'B': 'BOLD_TEXT',
        'BR': 'LINE_BREAK',
        'EM': 'EMPHASISED_TEXT',
        'H1': 'HEADING_LEVEL1',
        'H2': 'HEADING_LEVEL2',
        'H3': 'HEADING_LEVEL3',
        'H4': 'HEADING_LEVEL4',
        'H5': 'HEADING_LEVEL5',
        'H6': 'HEADING_LEVEL6',
        'HR': 'HORIZONTAL_RULE',
        'I': 'ITALIC_TEXT',
        'LI': 'LIST_ITEM',
        'LINK': 'MEDIA_LINK',
        'OL': 'ORDERED_LIST',
        'P': 'PARAGRAPH',
        'Q': 'QUOTATION',
        'S': 'STRIKETHROUGH_TEXT',
        'SMALL': 'SMALL_TEXT',
        'SUB': 'SUBSTRIPT',
        'SUP': 'SUPERSCRIPT',
        'TBODY': 'TABLE_BODY',
        'TD': 'TABLE_CELL',
        'TFOOT': 'TABLE_FOOTER',
        'TH': 'TABLE_HEADER_CELL',
        'THEAD': 'TABLE_HEADER',
        'TR': 'TABLE_ROW',
        'TT': 'MONOSPACED_TEXT',
        'U': 'UNDERLINED_TEXT',
        'UL': 'UNORDERED_LIST',
    };
    /**
     * Creates unique names for placeholder with different content.
     *
     * Returns the same placeholder name when the content is identical.
     */
    var PlaceholderRegistry = /** @class */ (function () {
        function PlaceholderRegistry() {
            // Count the occurrence of the base name top generate a unique name
            this._placeHolderNameCounts = {};
            // Maps signature to placeholder names
            this._signatureToName = {};
        }
        PlaceholderRegistry.prototype.getStartTagPlaceholderName = function (tag, attrs, isVoid) {
            var signature = this._hashTag(tag, attrs, isVoid);
            if (this._signatureToName[signature]) {
                return this._signatureToName[signature];
            }
            var upperTag = tag.toUpperCase();
            var baseName = TAG_TO_PLACEHOLDER_NAMES[upperTag] || "TAG_" + upperTag;
            var name = this._generateUniqueName(isVoid ? baseName : "START_" + baseName);
            this._signatureToName[signature] = name;
            return name;
        };
        PlaceholderRegistry.prototype.getCloseTagPlaceholderName = function (tag) {
            var signature = this._hashClosingTag(tag);
            if (this._signatureToName[signature]) {
                return this._signatureToName[signature];
            }
            var upperTag = tag.toUpperCase();
            var baseName = TAG_TO_PLACEHOLDER_NAMES[upperTag] || "TAG_" + upperTag;
            var name = this._generateUniqueName("CLOSE_" + baseName);
            this._signatureToName[signature] = name;
            return name;
        };
        PlaceholderRegistry.prototype.getPlaceholderName = function (name, content) {
            var upperName = name.toUpperCase();
            var signature = "PH: " + upperName + "=" + content;
            if (this._signatureToName[signature]) {
                return this._signatureToName[signature];
            }
            var uniqueName = this._generateUniqueName(upperName);
            this._signatureToName[signature] = uniqueName;
            return uniqueName;
        };
        PlaceholderRegistry.prototype.getUniquePlaceholder = function (name) {
            return this._generateUniqueName(name.toUpperCase());
        };
        // Generate a hash for a tag - does not take attribute order into account
        PlaceholderRegistry.prototype._hashTag = function (tag, attrs, isVoid) {
            var start = "<" + tag;
            var strAttrs = Object.keys(attrs).sort().map(function (name) { return " " + name + "=" + attrs[name]; }).join('');
            var end = isVoid ? '/>' : "></" + tag + ">";
            return start + strAttrs + end;
        };
        PlaceholderRegistry.prototype._hashClosingTag = function (tag) {
            return this._hashTag("/" + tag, {}, false);
        };
        PlaceholderRegistry.prototype._generateUniqueName = function (base) {
            var seen = this._placeHolderNameCounts.hasOwnProperty(base);
            if (!seen) {
                this._placeHolderNameCounts[base] = 1;
                return base;
            }
            var id = this._placeHolderNameCounts[base];
            this._placeHolderNameCounts[base] = id + 1;
            return base + "_" + id;
        };
        return PlaceholderRegistry;
    }());
    exports.PlaceholderRegistry = PlaceholderRegistry;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGxhY2Vob2xkZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci9zcmMvaTE4bi9zZXJpYWxpemVycy9wbGFjZWhvbGRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7SUFFSCxJQUFNLHdCQUF3QixHQUEwQjtRQUN0RCxHQUFHLEVBQUUsTUFBTTtRQUNYLEdBQUcsRUFBRSxXQUFXO1FBQ2hCLElBQUksRUFBRSxZQUFZO1FBQ2xCLElBQUksRUFBRSxpQkFBaUI7UUFDdkIsSUFBSSxFQUFFLGdCQUFnQjtRQUN0QixJQUFJLEVBQUUsZ0JBQWdCO1FBQ3RCLElBQUksRUFBRSxnQkFBZ0I7UUFDdEIsSUFBSSxFQUFFLGdCQUFnQjtRQUN0QixJQUFJLEVBQUUsZ0JBQWdCO1FBQ3RCLElBQUksRUFBRSxnQkFBZ0I7UUFDdEIsSUFBSSxFQUFFLGlCQUFpQjtRQUN2QixHQUFHLEVBQUUsYUFBYTtRQUNsQixJQUFJLEVBQUUsV0FBVztRQUNqQixNQUFNLEVBQUUsWUFBWTtRQUNwQixJQUFJLEVBQUUsY0FBYztRQUNwQixHQUFHLEVBQUUsV0FBVztRQUNoQixHQUFHLEVBQUUsV0FBVztRQUNoQixHQUFHLEVBQUUsb0JBQW9CO1FBQ3pCLE9BQU8sRUFBRSxZQUFZO1FBQ3JCLEtBQUssRUFBRSxXQUFXO1FBQ2xCLEtBQUssRUFBRSxhQUFhO1FBQ3BCLE9BQU8sRUFBRSxZQUFZO1FBQ3JCLElBQUksRUFBRSxZQUFZO1FBQ2xCLE9BQU8sRUFBRSxjQUFjO1FBQ3ZCLElBQUksRUFBRSxtQkFBbUI7UUFDekIsT0FBTyxFQUFFLGNBQWM7UUFDdkIsSUFBSSxFQUFFLFdBQVc7UUFDakIsSUFBSSxFQUFFLGlCQUFpQjtRQUN2QixHQUFHLEVBQUUsaUJBQWlCO1FBQ3RCLElBQUksRUFBRSxnQkFBZ0I7S0FDdkIsQ0FBQztJQUVGOzs7O09BSUc7SUFD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Q0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDN0YsSUFBTSxHQUFHLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLFFBQU0sR0FBRyxNQUFHLENBQUM7WUFFekMsT0FBTyxLQUFLLEdBQUcsUUFBUSxHQUFHLEdBQUcsQ0FBQztRQUNoQyxDQUFDO1FBRU8sNkNBQWUsR0FBdkIsVUFBd0IsR0FBVztZQUNqQyxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBSSxHQUFLLEVBQUUsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQzdDLENBQUM7UUFFTyxpREFBbUIsR0FBM0IsVUFBNEIsSUFBWTtZQUN0QyxJQUFNLElBQUksR0FBRyxJQUFJLENBQUMsc0JBQXNCLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQzlELElBQUksQ0FBQyxJQUFJLEVBQUU7Z0JBQ1QsSUFBSSxDQUFDLHNCQUFzQixDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFDdEMsT0FBTyxJQUFJLENBQUM7YUFDYjtZQUVELElBQU0sRUFBRSxHQUFHLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUM3QyxJQUFJLENBQUMsc0JBQXNCLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQztZQUMzQyxPQUFVLElBQUksU0FBSSxFQUFJLENBQUM7UUFDekIsQ0FBQztRQUNILDBCQUFDO0lBQUQsQ0FBQyxBQTdFRCxJQTZFQztJQTdFWSxrREFBbUIiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmNvbnN0IFRBR19UT19QTEFDRUhPTERFUl9OQU1FUzoge1trOiBzdHJpbmddOiBzdHJpbmd9ID0ge1xuICAnQSc6ICdMSU5LJyxcbiAgJ0InOiAnQk9MRF9URVhUJyxcbiAgJ0JSJzogJ0xJTkVfQlJFQUsnLFxuICAnRU0nOiAnRU1QSEFTSVNFRF9URVhUJyxcbiAgJ0gxJzogJ0hFQURJTkdfTEVWRUwxJyxcbiAgJ0gyJzogJ0hFQURJTkdfTEVWRUwyJyxcbiAgJ0gzJzogJ0hFQURJTkdfTEVWRUwzJyxcbiAgJ0g0JzogJ0hFQURJTkdfTEVWRUw0JyxcbiAgJ0g1JzogJ0hFQURJTkdfTEVWRUw1JyxcbiAgJ0g2JzogJ0hFQURJTkdfTEVWRUw2JyxcbiAgJ0hSJzogJ0hPUklaT05UQUxfUlVMRScsXG4gICdJJzogJ0lUQUxJQ19URVhUJyxcbiAgJ0xJJzogJ0xJU1RfSVRFTScsXG4gICdMSU5LJzogJ01FRElBX0xJTksnLFxuICAnT0wnOiAnT1JERVJFRF9MSVNUJyxcbiAgJ1AnOiAnUEFSQUdSQVBIJyxcbiAgJ1EnOiAnUVVPVEFUSU9OJyxcbiAgJ1MnOiAnU1RSSUtFVEhST1VHSF9URVhUJyxcbiAgJ1NNQUxMJzogJ1NNQUxMX1RFWFQnLFxuICAnU1VCJzogJ1NVQlNUUklQVCcsXG4gICdTVVAnOiAnU1VQRVJTQ1JJUFQnLFxuICAnVEJPRFknOiAnVEFCTEVfQk9EWScsXG4gICdURCc6ICdUQUJMRV9DRUxMJyxcbiAgJ1RGT09UJzogJ1RBQkxFX0ZPT1RFUicsXG4gICdUSCc6ICdUQUJMRV9IRUFERVJfQ0VMTCcsXG4gICdUSEVBRCc6ICdUQUJMRV9IRUFERVInLFxuICAnVFInOiAnVEFCTEVfUk9XJyxcbiAgJ1RUJzogJ01PTk9TUEFDRURfVEVYVCcsXG4gICdVJzogJ1VOREVSTElORURfVEVYVCcsXG4gICdVTCc6ICdVTk9SREVSRURfTElTVCcsXG59O1xuXG4vKipcbiAqIENyZWF0ZXMgdW5pcXVlIG5hbWVzIGZvciBwbGFjZWhvbGRlciB3aXRoIGRpZmZlcmVudCBjb250ZW50LlxuICpcbiAqIFJldHVybnMgdGhlIHNhbWUgcGxhY2Vob2xkZXIgbmFtZSB3aGVuIHRoZSBjb250ZW50IGlzIGlkZW50aWNhbC5cbiAqL1xuZXhwb3J0IGNsYXNzIFBsYWNlaG9sZGVyUmVnaXN0cnkge1xuICAvLyBDb3VudCB0aGUgb2NjdXJyZW5jZSBvZiB0aGUgYmFzZSBuYW1lIHRvcCBnZW5lcmF0ZSBhIHVuaXF1ZSBuYW1lXG4gIHByaXZhdGUgX3BsYWNlSG9sZGVyTmFtZUNvdW50czoge1trOiBzdHJpbmddOiBudW1iZXJ9ID0ge307XG4gIC8vIE1hcHMgc2lnbmF0dXJlIHRvIHBsYWNlaG9sZGVyIG5hbWVzXG4gIHByaXZhdGUgX3NpZ25hdHVyZVRvTmFtZToge1trOiBzdHJpbmddOiBzdHJpbmd9ID0ge307XG5cbiAgZ2V0U3RhcnRUYWdQbGFjZWhvbGRlck5hbWUodGFnOiBzdHJpbmcsIGF0dHJzOiB7W2s6IHN0cmluZ106IHN0cmluZ30sIGlzVm9pZDogYm9vbGVhbik6IHN0cmluZyB7XG4gICAgY29uc3Qgc2lnbmF0dXJlID0gdGhpcy5faGFzaFRhZyh0YWcsIGF0dHJzLCBpc1ZvaWQpO1xuICAgIGlmICh0aGlzLl9zaWduYXR1cmVUb05hbWVbc2lnbmF0dXJlXSkge1xuICAgICAgcmV0dXJuIHRoaXMuX3NpZ25hdHVyZVRvTmFtZVtzaWduYXR1cmVdO1xuICAgIH1cblxuICAgIGNvbnN0IHVwcGVyVGFnID0gdGFnLnRvVXBwZXJDYXNlKCk7XG4gICAgY29uc3QgYmFzZU5hbWUgPSBUQUdfVE9fUExBQ0VIT0xERVJfTkFNRVNbdXBwZXJUYWddIHx8IGBUQUdfJHt1cHBlclRhZ31gO1xuICAgIGNvbnN0IG5hbWUgPSB0aGlzLl9nZW5lcmF0ZVVuaXF1ZU5hbWUoaXNWb2lkID8gYmFzZU5hbWUgOiBgU1RBUlRfJHtiYXNlTmFtZX1gKTtcblxuICAgIHRoaXMuX3NpZ25hdHVyZVRvTmFtZVtzaWduYXR1cmVdID0gbmFtZTtcblxuICAgIHJldHVybiBuYW1lO1xuICB9XG5cbiAgZ2V0Q2xvc2VUYWdQbGFjZWhvbGRlck5hbWUodGFnOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIGNvbnN0IHNpZ25hdHVyZSA9IHRoaXMuX2hhc2hDbG9zaW5nVGFnKHRhZyk7XG4gICAgaWYgKHRoaXMuX3NpZ25hdHVyZVRvTmFtZVtzaWduYXR1cmVdKSB7XG4gICAgICByZXR1cm4gdGhpcy5fc2lnbmF0dXJlVG9OYW1lW3NpZ25hdHVyZV07XG4gICAgfVxuXG4gICAgY29uc3QgdXBwZXJUYWcgPSB0YWcudG9VcHBlckNhc2UoKTtcbiAgICBjb25zdCBiYXNlTmFtZSA9IFRBR19UT19QTEFDRUhPTERFUl9OQU1FU1t1cHBlclRhZ10gfHwgYFRBR18ke3VwcGVyVGFnfWA7XG4gICAgY29uc3QgbmFtZSA9IHRoaXMuX2dlbmVyYXRlVW5pcXVlTmFtZShgQ0xPU0VfJHtiYXNlTmFtZX1gKTtcblxuICAgIHRoaXMuX3NpZ25hdHVyZVRvTmFtZVtzaWduYXR1cmVdID0gbmFtZTtcblxuICAgIHJldHVybiBuYW1lO1xuICB9XG5cbiAgZ2V0UGxhY2Vob2xkZXJOYW1lKG5hbWU6IHN0cmluZywgY29udGVudDogc3RyaW5nKTogc3RyaW5nIHtcbiAgICBjb25zdCB1cHBlck5hbWUgPSBuYW1lLnRvVXBwZXJDYXNlKCk7XG4gICAgY29uc3Qgc2lnbmF0dXJlID0gYFBIOiAke3VwcGVyTmFtZX09JHtjb250ZW50fWA7XG4gICAgaWYgKHRoaXMuX3NpZ25hdHVyZVRvTmFtZVtzaWduYXR1cmVdKSB7XG4gICAgICByZXR1cm4gdGhpcy5fc2lnbmF0dXJlVG9OYW1lW3NpZ25hdHVyZV07XG4gICAgfVxuXG4gICAgY29uc3QgdW5pcXVlTmFtZSA9IHRoaXMuX2dlbmVyYXRlVW5pcXVlTmFtZSh1cHBlck5hbWUpO1xuICAgIHRoaXMuX3NpZ25hdHVyZVRvTmFtZVtzaWduYXR1cmVdID0gdW5pcXVlTmFtZTtcblxuICAgIHJldHVybiB1bmlxdWVOYW1lO1xuICB9XG5cbiAgZ2V0VW5pcXVlUGxhY2Vob2xkZXIobmFtZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5fZ2VuZXJhdGVVbmlxdWVOYW1lKG5hbWUudG9VcHBlckNhc2UoKSk7XG4gIH1cblxuICAvLyBHZW5lcmF0ZSBhIGhhc2ggZm9yIGEgdGFnIC0gZG9lcyBub3QgdGFrZSBhdHRyaWJ1dGUgb3JkZXIgaW50byBhY2NvdW50XG4gIHByaXZhdGUgX2hhc2hUYWcodGFnOiBzdHJpbmcsIGF0dHJzOiB7W2s6IHN0cmluZ106IHN0cmluZ30sIGlzVm9pZDogYm9vbGVhbik6IHN0cmluZyB7XG4gICAgY29uc3Qgc3RhcnQgPSBgPCR7dGFnfWA7XG4gICAgY29uc3Qgc3RyQXR0cnMgPSBPYmplY3Qua2V5cyhhdHRycykuc29ydCgpLm1hcCgobmFtZSkgPT4gYCAke25hbWV9PSR7YXR0cnNbbmFtZV19YCkuam9pbignJyk7XG4gICAgY29uc3QgZW5kID0gaXNWb2lkID8gJy8+JyA6IGA+PC8ke3RhZ30+YDtcblxuICAgIHJldHVybiBzdGFydCArIHN0ckF0dHJzICsgZW5kO1xuICB9XG5cbiAgcHJpdmF0ZSBfaGFzaENsb3NpbmdUYWcodGFnOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLl9oYXNoVGFnKGAvJHt0YWd9YCwge30sIGZhbHNlKTtcbiAgfVxuXG4gIHByaXZhdGUgX2dlbmVyYXRlVW5pcXVlTmFtZShiYXNlOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIGNvbnN0IHNlZW4gPSB0aGlzLl9wbGFjZUhvbGRlck5hbWVDb3VudHMuaGFzT3duUHJvcGVydHkoYmFzZSk7XG4gICAgaWYgKCFzZWVuKSB7XG4gICAgICB0aGlzLl9wbGFjZUhvbGRlck5hbWVDb3VudHNbYmFzZV0gPSAxO1xuICAgICAgcmV0dXJuIGJhc2U7XG4gICAgfVxuXG4gICAgY29uc3QgaWQgPSB0aGlzLl9wbGFjZUhvbGRlck5hbWVDb3VudHNbYmFzZV07XG4gICAgdGhpcy5fcGxhY2VIb2xkZXJOYW1lQ291bnRzW2Jhc2VdID0gaWQgKyAxO1xuICAgIHJldHVybiBgJHtiYXNlfV8ke2lkfWA7XG4gIH1cbn1cbiJdfQ==