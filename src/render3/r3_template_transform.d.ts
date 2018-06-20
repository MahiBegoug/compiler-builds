import * as html from '../ml_parser/ast';
import { ParseError } from '../parse_util';
import { BindingParser } from '../template_parser/binding_parser';
import * as t from './r3_ast';
export declare type Render3ParseResult = {
    nodes: t.Node[];
    errors: ParseError[];
    ngContentSelectors: string[];
    hasNgContent: boolean;
};
export declare function htmlAstToRender3Ast(htmlNodes: html.Node[], bindingParser: BindingParser): Render3ParseResult;
