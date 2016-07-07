/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { AnimationEntryMetadata, AnimationMetadata, AnimationStateMetadata, AnimationStyleMetadata, AppModuleMetadata, Provider, QueryMetadata } from '@angular/core';
import { ReflectorReader } from '../core_private';
import { Type } from '../src/facade/lang';
import * as cpl from './compile_metadata';
import { CompilerConfig } from './config';
import { DirectiveResolver } from './directive_resolver';
import { PipeResolver } from './pipe_resolver';
import { ViewResolver } from './view_resolver';
export declare class CompileMetadataResolver {
    private _directiveResolver;
    private _pipeResolver;
    private _viewResolver;
    private _config;
    private _reflector;
    private _directiveCache;
    private _pipeCache;
    private _appModuleCache;
    private _anonymousTypes;
    private _anonymousTypeIndex;
    constructor(_directiveResolver: DirectiveResolver, _pipeResolver: PipeResolver, _viewResolver: ViewResolver, _config: CompilerConfig, _reflector?: ReflectorReader);
    private sanitizeTokenName(token);
    clearCacheFor(type: Type): void;
    clearCache(): void;
    getAnimationEntryMetadata(entry: AnimationEntryMetadata): cpl.CompileAnimationEntryMetadata;
    getAnimationStateMetadata(value: AnimationStateMetadata): cpl.CompileAnimationStateMetadata;
    getAnimationStyleMetadata(value: AnimationStyleMetadata): cpl.CompileAnimationStyleMetadata;
    getAnimationMetadata(value: AnimationMetadata): cpl.CompileAnimationMetadata;
    getDirectiveMetadata(directiveType: Type): cpl.CompileDirectiveMetadata;
    getAppModuleMetadata(moduleType: any, meta?: AppModuleMetadata): cpl.CompileAppModuleMetadata;
    /**
     * @param someType a symbol which may or may not be a directive type
     * @returns {cpl.CompileDirectiveMetadata} if possible, otherwise null.
     */
    maybeGetDirectiveMetadata(someType: Type): cpl.CompileDirectiveMetadata;
    getTypeMetadata(type: Type, moduleUrl: string, dependencies?: any[]): cpl.CompileTypeMetadata;
    getFactoryMetadata(factory: Function, moduleUrl: string, dependencies?: any[]): cpl.CompileFactoryMetadata;
    getPipeMetadata(pipeType: Type): cpl.CompilePipeMetadata;
    getViewDirectivesMetadata(component: Type): cpl.CompileDirectiveMetadata[];
    getViewPipesMetadata(component: Type): cpl.CompilePipeMetadata[];
    getDependenciesMetadata(typeOrFunc: Type | Function, dependencies: any[]): cpl.CompileDiDependencyMetadata[];
    getTokenMetadata(token: any): cpl.CompileTokenMetadata;
    getProvidersMetadata(providers: any[], targetPrecompileComponents: cpl.CompileTypeMetadata[]): Array<cpl.CompileProviderMetadata | cpl.CompileTypeMetadata | any[]>;
    getPrecompileComponentsFromProvider(provider: Provider): cpl.CompileTypeMetadata[];
    getProviderMetadata(provider: Provider): cpl.CompileProviderMetadata;
    getQueriesMetadata(queries: {
        [key: string]: QueryMetadata;
    }, isViewQuery: boolean, directiveType: Type): cpl.CompileQueryMetadata[];
    getQueryMetadata(q: QueryMetadata, propertyName: string, typeOrFunc: Type | Function): cpl.CompileQueryMetadata;
}
