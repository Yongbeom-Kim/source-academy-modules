import wabt from 'wabt';

let wabtModule;
wabt()
  .then((wabt_resolved) => (wabtModule = wabt_resolved));

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

export function parse_wat(wasm_text: string): Uint8Array {
  return wabtModule.parseWat('', wasm_text)
    .toBinary({}).buffer;
}

export function execute_wasm(buffer: Uint8Array) {
  // const webInstance = await WebAssembly.instantiate(buffer, importObject);
  const webInstance = new WebAssembly.Instance(new WebAssembly.Module(buffer), importObject);
  // @ts-ignore, we explicitly export a main function (and therefore is callable).
  return webInstance.instance.exports.main();
}

export async function display_wasm(value: any) {
  display(await Promise.resolve(value));
}
