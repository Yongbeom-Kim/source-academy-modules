import { parse } from 'path';
import wabt from 'wabt';

let display: (x: any) => any;

export function init(display_fn: (x: any) => any) {
  display = display_fn;
}

const importObject = {};
/**
 * Parses a given Webassembly Text (wat) expression and outputs a corresponding representation
 * @param wasm_text wasm text representation
 * @returns an object of buffer and importObject
 */
export async function parse_wat_expression(wasm_text: string): Promise<Uint8Array> {
  const wasm_module = `
    (module
        (func (export "main")
            ${wasm_text}
        )
    )
  `;
  return parse_wat(wasm_module);
}

export async function parse_wat(wasm_text: string): Promise<Uint8Array> {
  return wabt().then(wabt => wabt.parseWat('', wasm_text).toBinary({}).buffer);
}

export async function execute_wasm(wasm_buffer: Uint8Array | Promise<Uint8Array>) {
  const resolved_buffer = await Promise.resolve(wasm_buffer);
  const webInstance = await WebAssembly.instantiate(resolved_buffer, importObject);
  // @ts-ignore, we explicitly export a main function (and therefore is callable).
  return webInstance.instance.exports.main();
}

export async function display_wasm(any: any) {
  const resolved = await Promise.resolve(any);
  display(resolved);
}
