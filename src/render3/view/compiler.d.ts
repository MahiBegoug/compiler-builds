import { CompileDirectiveMetadata } from '../../compile_metadata';
import { CompileReflector } from '../../compile_reflector';
import { ConstantPool } from '../../constant_pool';
import { BindingParser } from '../../template_parser/binding_parser';
import { OutputContext } from '../../util';
import { Render3ParseResult } from '../r3_template_transform';
import { R3ComponentDef, R3ComponentMetadata, R3DirectiveDef, R3DirectiveMetadata } from './api';
/**
 * Compile a directive for the render3 runtime as defined by the `R3DirectiveMetadata`.
 */
export declare function compileDirectiveFromMetadata(meta: R3DirectiveMetadata, constantPool: ConstantPool, bindingParser: BindingParser): R3DirectiveDef;
/**
 * Compile a component for the render3 runtime as defined by the `R3ComponentMetadata`.
 */
export declare function compileComponentFromMetadata(meta: R3ComponentMetadata, constantPool: ConstantPool, bindingParser: BindingParser): R3ComponentDef;
/**
 * A wrapper around `compileDirective` which depends on render2 global analysis data as its input
 * instead of the `R3DirectiveMetadata`.
 *
 * `R3DirectiveMetadata` is computed from `CompileDirectiveMetadata` and other statically reflected
 * information.
 */
export declare function compileDirectiveFromRender2(outputCtx: OutputContext, directive: CompileDirectiveMetadata, reflector: CompileReflector, bindingParser: BindingParser): void;
/**
 * A wrapper around `compileComponent` which depends on render2 global analysis data as its input
 * instead of the `R3DirectiveMetadata`.
 *
 * `R3ComponentMetadata` is computed from `CompileDirectiveMetadata` and other statically reflected
 * information.
 */
export declare function compileComponentFromRender2(outputCtx: OutputContext, component: CompileDirectiveMetadata, render3Ast: Render3ParseResult, reflector: CompileReflector, bindingParser: BindingParser, directiveTypeBySel: Map<string, any>, pipeTypeByName: Map<string, any>): void;
