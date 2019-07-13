import {Library} from "ffi";

const ref = require("ref");
const ffi = require('ffi');

const assistant = ref.types.void;
const assistantPtr = ref.refType(assistant);

export function createCallback(callback: (event: number, json: string) => void) {
    return ffi.Callback('void', ['int', 'string'], callback);
}

export default function createLibrary(libraryFile: string): Library {
    const lib = ffi.Library(libraryFile, {
        assistant_new: [assistantPtr, ['pointer', 'string']],
        assistant_start: ['void', [assistantPtr]],
        assistant_free: ['void', [assistantPtr]],
        assistant_set_access_token: ['void', [assistantPtr, 'string', 'uint']],
        assistant_set_mic_mute: ['void', [assistantPtr, 'bool']],
        assistant_start_conversation: ['void', [assistantPtr]],
        assistant_stop_conversation: ['void', [assistantPtr]],
        assistant_send_text_query: ['void', [assistantPtr, 'string']],
        assistant_device_id: ['string', []],
        assistant_version: ['string', []]
    });
    return lib;
}