import {
  parse,
  getIR,
  compile,
} from 'source-academy-wabt';

import { type ModuleExpression } from 'source-academy-wabt/types/wat_compiler/ir_types';
import { objectToLinkedList } from 'source-academy-utils';

/**
 * Compile a (hopefully valid) WebAssembly Text module to an intermediate representation.
 * @param program program to compile
 * @returns an intermediate representation.
 */
export const get_wat_module = (program: string) => {
  const ir = getIR(parse(program));

  return ir;
};

// export const add_function_import = (
//   moduleObject: ModuleExpression,
//   importFunction: Function,
//   importModule: string,
//   importName: string,
//   functionName: string,
//   paramTypes: ValueType[],
//   returnTypes: ValueType[],
// ) => {
//   const [, imports] = moduleObject;
//   const functionImport = createFunctionImport(importModule, importName, functionName, paramTypes, returnTypes);
//   wabt_module.addImportExpression(functionImport);
//   if (imports[importModule] === undefined) {
//     imports[importModule] = {};
//   }
//   imports[importModule][importName] = importFunction;
//   return [wabt_module, imports];
// };

export const compile_wat_module = (wasm_module: ModuleExpression) => {
  const binary = compile(wasm_module);
  return Array.from(binary);
};

const convert_import_list_to_import_object = (imports: [string, [string, [Function, null]]][]): Map<string, Map<string, Function>> => {
  const importObject = {};
  for (const imp of imports) {
    importObject[imp[0]] = {};
    importObject[imp[0]][imp[1][0]] = imp[1][1][0];
  }
  return importObject;
};

/**
 * Run a compiled WebAssembly Binary Buffer.
 * @param buffer an array of 8-bit unsigned integers to run
 * @param imports function imports
 * @returns a linked list of exports that the relevant WebAssembly Module exports
 */
export const run_wat_module = (buffer: number[] | Uint8Array, ...imports: [string, [string, [Function, null]]]) => {
  if (buffer instanceof Array) {
    buffer = new Uint8Array(buffer);
  }

  console.log(imports);

  // this is a valid import object, but WebAssembly ImportObjects typing just sucks.
  //@ts-ignore
  const exps = new WebAssembly.Instance(new WebAssembly.Module(buffer), convert_import_list_to_import_object(imports)).exports;
  return objectToLinkedList(exps);
};
