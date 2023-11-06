import {
  parse,
  getIR,
  compile,
} from 'source-academy-wabt';

import { objectToLinkedList } from 'source-academy-utils';

/**
 * Compile a (hopefully valid) WebAssembly Text module to a WebAssembly binary.
 * @param program program to compile
 * @returns a WebAssembly binary.
 */
type LinkedList<T> = [T, LinkedList<T>] | null;

type AlternatingLinkedList<T, S> = [T, AlternatingLinkedList<S, T>] | null;

export const wcompile = (program: string) => {
  const ir = getIR(parse(program));
  const binary = compile(ir);
  return Array.from(binary);
};

const linked_list_to_array = <T>(list: LinkedList<T>): T[] => {
  const array = [];
  while (list !== null) {
    array.push(list[0]);
    list = list[1];
  }
  return array;
};

const import_list_to_import_object = (imports: [string, [string, [Function, null]]][]): Map<string, Map<string, Function>> => {
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
export const wrun = (buffer: number[] | Uint8Array, imports: LinkedList<[string, [string, [Function, null]]]>) => {
  if (buffer instanceof Array) {
    buffer = new Uint8Array(buffer);
  }

  console.log(imports);

  // this is a valid import object, but WebAssembly ImportObjects typing just sucks.
  //@ts-ignore
  const exps = new WebAssembly.Instance(new WebAssembly.Module(buffer), import_list_to_import_object(linked_list_to_array(imports))).exports;
  return objectToLinkedList(exps);
};

/**
 * Get a webassembly function export by name.
 * @param exportList export list gotten from the wrun() function
 * @param name name of function to get
 * @returns relevant function, or null if not found.
 */
export const get_export_by_name = (exportList: AlternatingLinkedList<string, Function>, name: string): Function | null =>{
  while (exportList !== null) {
    if (exportList[0] === name) {
      return exportList[1][0];
    }
    exportList = exportList[1][1];
  }
  return null;
}

/**
 * REPL evaluator to be used with the repl module. Initialise this with a list of imports and the name of a main function.
 * 
 * Example:
 * ```js
 * import { set_evaluator, repl_display } from "repl";
 * import { repl_evaluator_with_main } from 'wasm';
 * 
 * const imports = list(
 *     list("console", "log", display)
 *     );
 *         
 * set_evaluator(
 *     repl_evaluator_with_main(
 *         imports,
 *         "main"
 *     )
 * );
 * ```
 * 
 * You can try the program:
 * 
 * ```wasm
 * (module
 *   (import "console" "log" (func $log (param f64)))
 *   (func (export "main") (result f64)
 *     f64.const 500
 *     call $log
 *     f64.const 25
 *   )
 * )
 * ```
 * 
 * @param imports a linked list of imports for the webassembly program.
 * @param main_function_name name of exported main function. Note that this function must not have any parameters.
 * @returns a function for the set_evaluator function in the repl.
 */
export const repl_evaluator_with_main = (imports: LinkedList<[string, [string, [Function, null]]]>, main_function_name: string) => (program: string) => {
  const exports = wrun(wcompile(program), imports);
  const main_fn = get_export_by_name(exports, main_function_name);
  if (main_fn === null) throw new Error(`Main function ${main_function_name} not found in exports.`);
  return main_fn();
}