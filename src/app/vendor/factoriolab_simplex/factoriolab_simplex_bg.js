import * as wasm from './factoriolab_simplex_bg.wasm';

const lTextDecoder = typeof TextDecoder === 'undefined' ? (0, module.require)('util').TextDecoder : TextDecoder;

let cachedTextDecoder = new lTextDecoder('utf-8', { ignoreBOM: true, fatal: true });

cachedTextDecoder.decode();

let cachedUint8Memory0;
function getUint8Memory0() {
    if (cachedUint8Memory0.byteLength === 0) {
        cachedUint8Memory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachedUint8Memory0;
}

function getStringFromWasm0(ptr, len) {
    return cachedTextDecoder.decode(getUint8Memory0().subarray(ptr, ptr + len));
}

let cachedInt32Memory0;
function getInt32Memory0() {
    if (cachedInt32Memory0.byteLength === 0) {
        cachedInt32Memory0 = new Int32Array(wasm.memory.buffer);
    }
    return cachedInt32Memory0;
}

let cachedFloat64Memory0;
function getFloat64Memory0() {
    if (cachedFloat64Memory0.byteLength === 0) {
        cachedFloat64Memory0 = new Float64Array(wasm.memory.buffer);
    }
    return cachedFloat64Memory0;
}

function getArrayF64FromWasm0(ptr, len) {
    return getFloat64Memory0().subarray(ptr / 8, ptr / 8 + len);
}

let WASM_VECTOR_LEN = 0;

function passArrayF64ToWasm0(arg, malloc) {
    const ptr = malloc(arg.length * 8);
    getFloat64Memory0().set(arg, ptr / 8);
    WASM_VECTOR_LEN = arg.length;
    return ptr;
}
/**
* @param {Float64Array} tableau
* @param {number} rows
* @returns {SimplexResult}
*/
export function simplex(tableau, rows) {
    const ptr0 = passArrayF64ToWasm0(tableau, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.simplex(ptr0, len0, rows);
    return SimplexResult.__wrap(ret);
}

/**
*/
export class SimplexResult {

    static __wrap(ptr) {
        const obj = Object.create(SimplexResult.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_simplexresult_free(ptr);
    }
    /**
    */
    get result_type() {
        const ret = wasm.__wbg_get_simplexresult_result_type(this.ptr);
        return ret >>> 0;
    }
    /**
    */
    set result_type(arg0) {
        wasm.__wbg_set_simplexresult_result_type(this.ptr, arg0);
    }
    /**
    */
    get pivots() {
        const ret = wasm.__wbg_get_simplexresult_pivots(this.ptr);
        return ret >>> 0;
    }
    /**
    */
    set pivots(arg0) {
        wasm.__wbg_set_simplexresult_pivots(this.ptr, arg0);
    }
    /**
    */
    get time() {
        const ret = wasm.__wbg_get_simplexresult_time(this.ptr);
        return ret;
    }
    /**
    */
    set time(arg0) {
        wasm.__wbg_set_simplexresult_time(this.ptr, arg0);
    }
    /**
    */
    get tableau() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.__wbg_get_simplexresult_tableau(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v0 = getArrayF64FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 8);
            return v0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    */
    set tableau(arg0) {
        const ptr0 = passArrayF64ToWasm0(arg0, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_simplexresult_tableau(this.ptr, ptr0, len0);
    }
}

export function __wbg_now_513c8208bd94c09b() {
    const ret = Date.now();
    return ret;
};

export function __wbindgen_throw(arg0, arg1) {
    throw new Error(getStringFromWasm0(arg0, arg1));
};

cachedFloat64Memory0 = new Float64Array(wasm.memory.buffer);
cachedInt32Memory0 = new Int32Array(wasm.memory.buffer);
cachedUint8Memory0 = new Uint8Array(wasm.memory.buffer);

