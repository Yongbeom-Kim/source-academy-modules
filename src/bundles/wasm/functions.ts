import { parse } from 'path';
import wabt from 'wabt';
// let wabtModule;
// const wabtModule = await wabt();

/**
 * Parses a given Webassembly Text (wat) expression and outputs a corresponding representation
 * @param wasm_text wasm text representation
 * @returns an object of buffer and importObject
 */
export async function parse_wat_expression(wasm_text: string): Promise<{ buffer: Uint8Array; importObject: WebAssembly.Imports; }> {
  const importObject = {};
  const wasm_module = `
    (module
        (func (export "main")
            ${wasm_text}
        )
    )
  `;
  return parse_wat(wasm_module, importObject);
}

export async function parse_wat(wasm_text: string, importObject: WebAssembly.Imports = {}): Promise<{ buffer: Uint8Array; importObject: WebAssembly.Imports; }> {
  return wabt().then(wabt => ({
    buffer: wabt.parseWat('', wasm_text)
      .toBinary({}).buffer,
    importObject,
  }));
}

export async function execute_wasm(wasm_buffer: Uint8Array, importObject: WebAssembly.Imports = {}) {
  const webInstance = await WebAssembly.instantiate(wasm_buffer, importObject);
  // @ts-ignore, we explicitly export a main function (and therefore is callable).
  return webInstance.instance.exports.main();
}
