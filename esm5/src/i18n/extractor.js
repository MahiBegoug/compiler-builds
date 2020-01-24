/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { __read, __spread } from "tslib";
/**
 * Extract i18n messages from source code
 */
import { analyzeAndValidateNgModules } from '../aot/compiler';
import { createAotUrlResolver } from '../aot/compiler_factory';
import { StaticReflector } from '../aot/static_reflector';
import { StaticSymbolCache } from '../aot/static_symbol';
import { StaticSymbolResolver } from '../aot/static_symbol_resolver';
import { AotSummaryResolver } from '../aot/summary_resolver';
import { CompilerConfig } from '../config';
import { ViewEncapsulation } from '../core';
import { DirectiveNormalizer } from '../directive_normalizer';
import { DirectiveResolver } from '../directive_resolver';
import { CompileMetadataResolver } from '../metadata_resolver';
import { HtmlParser } from '../ml_parser/html_parser';
import { InterpolationConfig } from '../ml_parser/interpolation_config';
import { NgModuleResolver } from '../ng_module_resolver';
import { PipeResolver } from '../pipe_resolver';
import { DomElementSchemaRegistry } from '../schema/dom_element_schema_registry';
import { MessageBundle } from './message_bundle';
var Extractor = /** @class */ (function () {
    function Extractor(host, staticSymbolResolver, messageBundle, metadataResolver) {
        this.host = host;
        this.staticSymbolResolver = staticSymbolResolver;
        this.messageBundle = messageBundle;
        this.metadataResolver = metadataResolver;
    }
    Extractor.prototype.extract = function (rootFiles) {
        var _this = this;
        var _a = analyzeAndValidateNgModules(rootFiles, this.host, this.staticSymbolResolver, this.metadataResolver), files = _a.files, ngModules = _a.ngModules;
        return Promise
            .all(ngModules.map(function (ngModule) { return _this.metadataResolver.loadNgModuleDirectiveAndPipeMetadata(ngModule.type.reference, false); }))
            .then(function () {
            var errors = [];
            files.forEach(function (file) {
                var compMetas = [];
                file.directives.forEach(function (directiveType) {
                    var dirMeta = _this.metadataResolver.getDirectiveMetadata(directiveType);
                    if (dirMeta && dirMeta.isComponent) {
                        compMetas.push(dirMeta);
                    }
                });
                compMetas.forEach(function (compMeta) {
                    var html = compMeta.template.template;
                    // Template URL points to either an HTML or TS file depending on
                    // whether the file is used with `templateUrl:` or `template:`,
                    // respectively.
                    var templateUrl = compMeta.template.templateUrl;
                    var interpolationConfig = InterpolationConfig.fromArray(compMeta.template.interpolation);
                    errors.push.apply(errors, __spread(_this.messageBundle.updateFromTemplate(html, templateUrl, interpolationConfig)));
                });
            });
            if (errors.length) {
                throw new Error(errors.map(function (e) { return e.toString(); }).join('\n'));
            }
            return _this.messageBundle;
        });
    };
    Extractor.create = function (host, locale) {
        var htmlParser = new HtmlParser();
        var urlResolver = createAotUrlResolver(host);
        var symbolCache = new StaticSymbolCache();
        var summaryResolver = new AotSummaryResolver(host, symbolCache);
        var staticSymbolResolver = new StaticSymbolResolver(host, symbolCache, summaryResolver);
        var staticReflector = new StaticReflector(summaryResolver, staticSymbolResolver);
        var config = new CompilerConfig({ defaultEncapsulation: ViewEncapsulation.Emulated, useJit: false });
        var normalizer = new DirectiveNormalizer({ get: function (url) { return host.loadResource(url); } }, urlResolver, htmlParser, config);
        var elementSchemaRegistry = new DomElementSchemaRegistry();
        var resolver = new CompileMetadataResolver(config, htmlParser, new NgModuleResolver(staticReflector), new DirectiveResolver(staticReflector), new PipeResolver(staticReflector), summaryResolver, elementSchemaRegistry, normalizer, console, symbolCache, staticReflector);
        // TODO(vicb): implicit tags & attributes
        var messageBundle = new MessageBundle(htmlParser, [], {}, locale);
        var extractor = new Extractor(host, staticSymbolResolver, messageBundle, resolver);
        return { extractor: extractor, staticReflector: staticReflector };
    };
    return Extractor;
}());
export { Extractor };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0cmFjdG9yLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXIvc3JjL2kxOG4vZXh0cmFjdG9yLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7QUFHSDs7R0FFRztBQUNILE9BQU8sRUFBQywyQkFBMkIsRUFBQyxNQUFNLGlCQUFpQixDQUFDO0FBQzVELE9BQU8sRUFBQyxvQkFBb0IsRUFBQyxNQUFNLHlCQUF5QixDQUFDO0FBQzdELE9BQU8sRUFBQyxlQUFlLEVBQUMsTUFBTSx5QkFBeUIsQ0FBQztBQUN4RCxPQUFPLEVBQUMsaUJBQWlCLEVBQUMsTUFBTSxzQkFBc0IsQ0FBQztBQUN2RCxPQUFPLEVBQUMsb0JBQW9CLEVBQTJCLE1BQU0sK0JBQStCLENBQUM7QUFDN0YsT0FBTyxFQUFDLGtCQUFrQixFQUF5QixNQUFNLHlCQUF5QixDQUFDO0FBRW5GLE9BQU8sRUFBQyxjQUFjLEVBQUMsTUFBTSxXQUFXLENBQUM7QUFDekMsT0FBTyxFQUFDLGlCQUFpQixFQUFDLE1BQU0sU0FBUyxDQUFDO0FBQzFDLE9BQU8sRUFBQyxtQkFBbUIsRUFBQyxNQUFNLHlCQUF5QixDQUFDO0FBQzVELE9BQU8sRUFBQyxpQkFBaUIsRUFBQyxNQUFNLHVCQUF1QixDQUFDO0FBQ3hELE9BQU8sRUFBQyx1QkFBdUIsRUFBQyxNQUFNLHNCQUFzQixDQUFDO0FBQzdELE9BQU8sRUFBQyxVQUFVLEVBQUMsTUFBTSwwQkFBMEIsQ0FBQztBQUNwRCxPQUFPLEVBQUMsbUJBQW1CLEVBQUMsTUFBTSxtQ0FBbUMsQ0FBQztBQUN0RSxPQUFPLEVBQUMsZ0JBQWdCLEVBQUMsTUFBTSx1QkFBdUIsQ0FBQztBQUV2RCxPQUFPLEVBQUMsWUFBWSxFQUFDLE1BQU0sa0JBQWtCLENBQUM7QUFDOUMsT0FBTyxFQUFDLHdCQUF3QixFQUFDLE1BQU0sdUNBQXVDLENBQUM7QUFHL0Us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b29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuXG4vKipcbiAqIEV4dHJhY3QgaTE4biBtZXNzYWdlcyBmcm9tIHNvdXJjZSBjb2RlXG4gKi9cbmltcG9ydCB7YW5hbHl6ZUFuZFZhbGlkYXRlTmdNb2R1bGVzfSBmcm9tICcuLi9hb3QvY29tcGlsZXInO1xuaW1wb3J0IHtjcmVhdGVBb3RVcmxSZXNvbHZlcn0gZnJvbSAnLi4vYW90L2NvbXBpbGVyX2ZhY3RvcnknO1xuaW1wb3J0IHtTdGF0aWNSZWZsZWN0b3J9IGZyb20gJy4uL2FvdC9zdGF0aWNfcmVmbGVjdG9yJztcbmltcG9ydCB7U3RhdGljU3ltYm9sQ2FjaGV9IGZyb20gJy4uL2FvdC9zdGF0aWNfc3ltYm9sJztcbmltcG9ydCB7U3RhdGljU3ltYm9sUmVzb2x2ZXIsIFN0YXRpY1N5bWJvbFJlc29sdmVySG9zdH0gZnJvbSAnLi4vYW90L3N0YXRpY19zeW1ib2xfcmVzb2x2ZXInO1xuaW1wb3J0IHtBb3RTdW1tYXJ5UmVzb2x2ZXIsIEFvdFN1bW1hcnlSZXNvbHZlckhvc3R9IGZyb20gJy4uL2FvdC9zdW1tYXJ5X3Jlc29sdmVyJztcbmltcG9ydCB7Q29tcGlsZURpcmVjdGl2ZU1ldGFkYXRhfSBmcm9tICcuLi9jb21waWxlX21ldGFkYXRhJztcbmltcG9ydCB7Q29tcGlsZXJDb25maWd9IGZyb20gJy4uL2NvbmZpZyc7XG5pbXBvcnQge1ZpZXdFbmNhcHN1bGF0aW9ufSBmcm9tICcuLi9jb3JlJztcbmltcG9ydCB7RGlyZWN0aXZlTm9ybWFsaXplcn0gZnJvbSAnLi4vZGlyZWN0aXZlX25vcm1hbGl6ZXInO1xuaW1wb3J0IHtEaXJlY3RpdmVSZXNvbHZlcn0gZnJvbSAnLi4vZGlyZWN0aXZlX3Jlc29sdmVyJztcbmltcG9ydCB7Q29tcGlsZU1ldGFkYXRhUmVzb2x2ZXJ9IGZyb20gJy4uL21ldGFkYXRhX3Jlc29sdmVyJztcbmltcG9ydCB7SHRtbFBhcnNlcn0gZnJvbSAnLi4vbWxfcGFyc2VyL2h0bWxfcGFyc2VyJztcbmltcG9ydCB7SW50ZXJwb2xhdGlvbkNvbmZpZ30gZnJvbSAnLi4vbWxfcGFyc2VyL2ludGVycG9sYXRpb25fY29uZmlnJztcbmltcG9ydCB7TmdNb2R1bGVSZXNvbHZlcn0gZnJvbSAnLi4vbmdfbW9kdWxlX3Jlc29sdmVyJztcbmltcG9ydCB7UGFyc2VFcnJvcn0gZnJvbSAnLi4vcGFyc2VfdXRpbCc7XG5pbXBvcnQge1BpcGVSZXNvbHZlcn0gZnJvbSAnLi4vcGlwZV9yZXNvbHZlcic7XG5pbXBvcnQge0RvbUVsZW1lbnRTY2hlbWFSZWdpc3RyeX0gZnJvbSAnLi4vc2NoZW1hL2RvbV9lbGVtZW50X3NjaGVtYV9yZWdpc3RyeSc7XG5pbXBvcnQge3N5bnRheEVycm9yfSBmcm9tICcuLi91dGlsJztcblxuaW1wb3J0IHtNZXNzYWdlQnVuZGxlfSBmcm9tICcuL21lc3NhZ2VfYnVuZGxlJztcblxuXG5cbi8qKlxuICogVGhlIGhvc3Qgb2YgdGhlIEV4dHJhY3RvciBkaXNjb25uZWN0cyB0aGUgaW1wbGVtZW50YXRpb24gZnJvbSBUeXBlU2NyaXB0IC8gb3RoZXIgbGFuZ3VhZ2VcbiAqIHNlcnZpY2VzIGFuZCBmcm9tIHVuZGVybHlpbmcgZmlsZSBzeXN0ZW1zLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIEV4dHJhY3Rvckhvc3QgZXh0ZW5kcyBTdGF0aWNTeW1ib2xSZXNvbHZlckhvc3QsIEFvdFN1bW1hcnlSZXNvbHZlckhvc3Qge1xuICAvKipcbiAgICogQ29udmVydHMgYSBwYXRoIHRoYXQgcmVmZXJzIHRvIGEgcmVzb3VyY2UgaW50byBhbiBhYnNvbHV0ZSBmaWxlUGF0aFxuICAgKiB0aGF0IGNhbiBiZSBsYXRlcm9uIHVzZWQgZm9yIGxvYWRpbmcgdGhlIHJlc291cmNlIHZpYSBgbG9hZFJlc291cmNlLlxuICAgKi9cbiAgcmVzb3VyY2VOYW1lVG9GaWxlTmFtZShwYXRoOiBzdHJpbmcsIGNvbnRhaW5pbmdGaWxlOiBzdHJpbmcpOiBzdHJpbmd8bnVsbDtcbiAgLyoqXG4gICAqIExvYWRzIGEgcmVzb3VyY2UgKGUuZy4gaHRtbCAvIGNzcylcbiAgICovXG4gIGxvYWRSZXNvdXJjZShwYXRoOiBzdHJpbmcpOiBQcm9taXNlPHN0cmluZz58c3RyaW5nO1xufVxuXG5leHBvcnQgY2xhc3MgRXh0cmFjdG9yIHtcbiAgY29uc3RydWN0b3IoXG4gICAgICBwdWJsaWMgaG9zdDogRXh0cmFjdG9ySG9zdCwgcHJpdmF0ZSBzdGF0aWNTeW1ib2xSZXNvbHZlcjogU3RhdGljU3ltYm9sUmVzb2x2ZXIsXG4gICAgICBwcml2YXRlIG1lc3NhZ2VCdW5kbGU6IE1lc3NhZ2VCdW5kbGUsIHByaXZhdGUgbWV0YWRhdGFSZXNvbHZlcjogQ29tcGlsZU1ldGFkYXRhUmVzb2x2ZXIpIHt9XG5cbiAgZXh0cmFjdChyb290RmlsZXM6IHN0cmluZ1tdKTogUHJvbWlzZTxNZXNzYWdlQnVuZGxlPiB7XG4gICAgY29uc3Qge2ZpbGVzLCBuZ01vZHVsZXN9ID0gYW5hbHl6ZUFuZFZhbGlkYXRlTmdNb2R1bGVzKFxuICAgICAgICByb290RmlsZXMsIHRoaXMuaG9zdCwgdGhpcy5zdGF0aWNTeW1ib2xSZXNvbHZlciwgdGhpcy5tZXRhZGF0YVJlc29sdmVyKTtcbiAgICByZXR1cm4gUHJvbWlzZVxuICAgICAgICAuYWxsKG5nTW9kdWxlcy5tYXAoXG4gICAgICAgICAgICBuZ01vZHVsZSA9PiB0aGlzLm1ldGFkYXRhUmVzb2x2ZXIubG9hZE5nTW9kdWxlRGlyZWN0aXZlQW5kUGlwZU1ldGFkYXRhKFxuICAgICAgICAgICAgICAgIG5nTW9kdWxlLnR5cGUucmVmZXJlbmNlLCBmYWxzZSkpKVxuICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgY29uc3QgZXJyb3JzOiBQYXJzZUVycm9yW10gPSBbXTtcblxuICAgICAgICAgIGZpbGVzLmZvckVhY2goZmlsZSA9PiB7XG4gICAgICAgICAgICBjb25zdCBjb21wTWV0YXM6IENvbXBpbGVEaXJlY3RpdmVNZXRhZGF0YVtdID0gW107XG4gICAgICAgICAgICBmaWxlLmRpcmVjdGl2ZXMuZm9yRWFjaChkaXJlY3RpdmVUeXBlID0+IHtcbiAgICAgICAgICAgICAgY29uc3QgZGlyTWV0YSA9IHRoaXMubWV0YWRhdGFSZXNvbHZlci5nZXREaXJlY3RpdmVNZXRhZGF0YShkaXJlY3RpdmVUeXBlKTtcbiAgICAgICAgICAgICAgaWYgKGRpck1ldGEgJiYgZGlyTWV0YS5pc0NvbXBvbmVudCkge1xuICAgICAgICAgICAgICAgIGNvbXBNZXRhcy5wdXNoKGRpck1ldGEpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGNvbXBNZXRhcy5mb3JFYWNoKGNvbXBNZXRhID0+IHtcbiAgICAgICAgICAgICAgY29uc3QgaHRtbCA9IGNvbXBNZXRhLnRlbXBsYXRlICEudGVtcGxhdGUgITtcbiAgICAgICAgICAgICAgLy8gVGVtcGxhdGUgVVJMIHBvaW50cyB0byBlaXRoZXIgYW4gSFRNTCBvciBUUyBmaWxlIGRlcGVuZGluZyBvblxuICAgICAgICAgICAgICAvLyB3aGV0aGVyIHRoZSBmaWxlIGlzIHVzZWQgd2l0aCBgdGVtcGxhdGVVcmw6YCBvciBgdGVtcGxhdGU6YCxcbiAgICAgICAgICAgICAgLy8gcmVzcGVjdGl2ZWx5LlxuICAgICAgICAgICAgICBjb25zdCB0ZW1wbGF0ZVVybCA9IGNvbXBNZXRhLnRlbXBsYXRlICEudGVtcGxhdGVVcmwgITtcbiAgICAgICAgICAgICAgY29uc3QgaW50ZXJwb2xhdGlvbkNvbmZpZyA9XG4gICAgICAgICAgICAgICAgICBJbnRlcnBvbGF0aW9uQ29uZmlnLmZyb21BcnJheShjb21wTWV0YS50ZW1wbGF0ZSAhLmludGVycG9sYXRpb24pO1xuICAgICAgICAgICAgICBlcnJvcnMucHVzaCguLi50aGlzLm1lc3NhZ2VCdW5kbGUudXBkYXRlRnJvbVRlbXBsYXRlKFxuICAgICAgICAgICAgICAgICAgaHRtbCwgdGVtcGxhdGVVcmwsIGludGVycG9sYXRpb25Db25maWcpICEpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgICBpZiAoZXJyb3JzLmxlbmd0aCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGVycm9ycy5tYXAoZSA9PiBlLnRvU3RyaW5nKCkpLmpvaW4oJ1xcbicpKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICByZXR1cm4gdGhpcy5tZXNzYWdlQnVuZGxlO1xuICAgICAgICB9KTtcbiAgfVxuXG4gIHN0YXRpYyBjcmVhdGUoaG9zdDogRXh0cmFjdG9ySG9zdCwgbG9jYWxlOiBzdHJpbmd8bnVsbCk6XG4gICAgICB7ZXh0cmFjdG9yOiBFeHRyYWN0b3IsIHN0YXRpY1JlZmxlY3RvcjogU3RhdGljUmVmbGVjdG9yfSB7XG4gICAgY29uc3QgaHRtbFBhcnNlciA9IG5ldyBIdG1sUGFyc2VyKCk7XG5cbiAgICBjb25zdCB1cmxSZXNvbHZlciA9IGNyZWF0ZUFvdFVybFJlc29sdmVyKGhvc3QpO1xuICAgIGNvbnN0IHN5bWJvbENhY2hlID0gbmV3IFN0YXRpY1N5bWJvbENhY2hlKCk7XG4gICAgY29uc3Qgc3VtbWFyeVJlc29sdmVyID0gbmV3IEFvdFN1bW1hcnlSZXNvbHZlcihob3N0LCBzeW1ib2xDYWNoZSk7XG4gICAgY29uc3Qgc3RhdGljU3ltYm9sUmVzb2x2ZXIgPSBuZXcgU3RhdGljU3ltYm9sUmVzb2x2ZXIoaG9zdCwgc3ltYm9sQ2FjaGUsIHN1bW1hcnlSZXNvbHZlcik7XG4gICAgY29uc3Qgc3RhdGljUmVmbGVjdG9yID0gbmV3IFN0YXRpY1JlZmxlY3RvcihzdW1tYXJ5UmVzb2x2ZXIsIHN0YXRpY1N5bWJvbFJlc29sdmVyKTtcblxuICAgIGNvbnN0IGNvbmZpZyA9XG4gICAgICAgIG5ldyBDb21waWxlckNvbmZpZyh7ZGVmYXVsdEVuY2Fwc3VsYXRpb246IFZpZXdFbmNhcHN1bGF0aW9uLkVtdWxhdGVkLCB1c2VKaXQ6IGZhbHNlfSk7XG5cbiAgICBjb25zdCBub3JtYWxpemVyID0gbmV3IERpcmVjdGl2ZU5vcm1hbGl6ZXIoXG4gICAgICAgIHtnZXQ6ICh1cmw6IHN0cmluZykgPT4gaG9zdC5sb2FkUmVzb3VyY2UodXJsKX0sIHVybFJlc29sdmVyLCBodG1sUGFyc2VyLCBjb25maWcpO1xuICAgIGNvbnN0IGVsZW1lbnRTY2hlbWFSZWdpc3RyeSA9IG5ldyBEb21FbGVtZW50U2NoZW1hUmVnaXN0cnkoKTtcbiAgICBjb25zdCByZXNvbHZlciA9IG5ldyBDb21waWxlTWV0YWRhdGFSZXNvbHZlcihcbiAgICAgICAgY29uZmlnLCBodG1sUGFyc2VyLCBuZXcgTmdNb2R1bGVSZXNvbHZlcihzdGF0aWNSZWZsZWN0b3IpLFxuICAgICAgICBuZXcgRGlyZWN0aXZlUmVzb2x2ZXIoc3RhdGljUmVmbGVjdG9yKSwgbmV3IFBpcGVSZXNvbHZlcihzdGF0aWNSZWZsZWN0b3IpLCBzdW1tYXJ5UmVzb2x2ZXIsXG4gICAgICAgIGVsZW1lbnRTY2hlbWFSZWdpc3RyeSwgbm9ybWFsaXplciwgY29uc29sZSwgc3ltYm9sQ2FjaGUsIHN0YXRpY1JlZmxlY3Rvcik7XG5cbiAgICAvLyBUT0RPKHZpY2IpOiBpbXBsaWNpdCB0YWdzICYgYXR0cmlidXRlc1xuICAgIGNvbnN0IG1lc3NhZ2VCdW5kbGUgPSBuZXcgTWVzc2FnZUJ1bmRsZShodG1sUGFyc2VyLCBbXSwge30sIGxvY2FsZSk7XG5cbiAgICBjb25zdCBleHRyYWN0b3IgPSBuZXcgRXh0cmFjdG9yKGhvc3QsIHN0YXRpY1N5bWJvbFJlc29sdmVyLCBtZXNzYWdlQnVuZGxlLCByZXNvbHZlcik7XG4gICAgcmV0dXJuIHtleHRyYWN0b3IsIHN0YXRpY1JlZmxlY3Rvcn07XG4gIH1cbn1cbiJdfQ==