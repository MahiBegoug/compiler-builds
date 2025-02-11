/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as o from '../../output/output_ast';
/**
 * This interface describes the shape of the object that partial directive declarations are compiled
 * into. This serves only as documentation, as conformance of this interface is not enforced during
 * the generation of the partial declaration, nor when the linker applies full compilation from the
 * partial declaration.
 */
export interface R3DeclareDirectiveMetadata {
    /**
     * Version number of the metadata format. This is used to evolve the metadata
     * interface later - the linker will be able to detect which version a library
     * is using and interpret its metadata accordingly.
     */
    version: 1;
    /**
     * Unparsed selector of the directive.
     */
    selector?: string;
    /**
     * Reference to the directive class itself.
     */
    type: o.Expression;
    /**
     * A mapping of inputs from class property names to binding property names, or to a tuple of
     * binding property name and class property name if the names are different.
     */
    inputs?: {
        [classPropertyName: string]: string | [string, string];
    };
    /**
     * A mapping of outputs from class property names to binding property names, or to a tuple of
     * binding property name and class property name if the names are different.
     */
    outputs?: {
        [classPropertyName: string]: string;
    };
    /**
     * Information about host bindings present on the component.
     */
    host?: {
        /**
         * A mapping of attribute names to their value expression.
         */
        attributes?: {
            [key: string]: o.Expression;
        };
        /**
         * A mapping of event names to their unparsed event handler expression.
         */
        listeners: {
            [key: string]: string;
        };
        /**
         * A mapping of bound properties to their unparsed binding expression.
         */
        properties?: {
            [key: string]: string;
        };
        /**
         * The value of the class attribute, if present. This is stored outside of `attributes` as its
         * string value must be known statically.
         */
        classAttribute?: string;
        /**
         * The value of the style attribute, if present. This is stored outside of `attributes` as its
         * string value must be known statically.
         */
        styleAttribute?: string;
    };
    /**
     * Information about the content queries made by the directive.
     */
    queries?: R3DeclareQueryMetadata[];
    /**
     * Information about the view queries made by the directive.
     */
    viewQueries?: R3DeclareQueryMetadata[];
    /**
     * The list of providers provided by the directive.
     */
    providers?: o.Expression;
    /**
     * The names by which the directive is exported.
     */
    exportAs?: string[];
    /**
     * Whether the directive has an inheritance clause. Defaults to false.
     */
    usesInheritance?: boolean;
    /**
     * Whether the directive implements the `ngOnChanges` hook. Defaults to false.
     */
    usesOnChanges?: boolean;
    /**
     * A reference to the `@angular/core` ES module, which allows access
     * to all Angular exports, including Ivy instructions.
     */
    ngImport: o.Expression;
}
export interface R3DeclareQueryMetadata {
    /**
     * Name of the property on the class to update with query results.
     */
    propertyName: string;
    /**
     * Whether to read only the first matching result, or an array of results. Defaults to false.
     */
    first?: boolean;
    /**
     * Either an expression representing a type or `InjectionToken` for the query
     * predicate, or a set of string selectors.
     */
    predicate: o.Expression | string[];
    /**
     * Whether to include only direct children or all descendants. Defaults to false.
     */
    descendants?: boolean;
    /**
     * An expression representing a type to read from each matched node, or null if the default value
     * for a given node is to be returned.
     */
    read?: o.Expression;
    /**
     * Whether or not this query should collect only static results. Defaults to false.
     *
     * If static is true, the query's results will be set on the component after nodes are created,
     * but before change detection runs. This means that any results that relied upon change detection
     * to run (e.g. results inside *ngIf or *ngFor views) will not be collected. Query results are
     * available in the ngOnInit hook.
     *
     * If static is false, the query's results will be set on the component after change detection
     * runs. This means that the query results can contain nodes inside *ngIf or *ngFor views, but
     * the results will not be available in the ngOnInit hook (only in the ngAfterContentInit for
     * content hooks and ngAfterViewInit for view hooks).
     */
    static?: boolean;
}
