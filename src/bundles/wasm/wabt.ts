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
