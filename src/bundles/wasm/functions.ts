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

const display_promise = Promise.resolve(1);
export async function display_wasm(value: any) {
  // we use a chain of promises to guarantee order.
  display_promise.finally(() => Promise.resolve(value).then(display));
}
