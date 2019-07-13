import Event, {EventType} from "./Event";

const {EventEmitter} = require('events');

const ref = require("ref");
const ffi = require('ffi');

const assistant = ref.types.void;
const assistantPtr = ref.refType(assistant);

const lib = ffi.Library('lib/libassistant_embedder', {
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

export default class Assistant extends EventEmitter {

    private instance;

    constructor(deviceModelId) {
        super();
        const callback = ffi.Callback('void', ['int', 'string'], function (event: number, eventBodyJson: string) {
            this.emit('event', new Event(EventType[EventType[event]], JSON.parse(eventBodyJson)));
        }.bind(this));

        process.on('exit', function () {
            // keep reference to callback to avoid it being GCed
            callback
        });

        this.instance = lib.assistant_new(callback, deviceModelId);
    }

    setAccessToken(accessToken) {
        lib.assistant_set_access_token(this.instance, accessToken, accessToken.length);
    }

    start() {
        lib.assistant_start(this.instance);
    }

    stop() {
        lib.assistant_free(this.instance);
    }

    setMicMute(mute) {
        lib.assistant_set_mic_mute(this.instance, mute);
    }

    sendTextQuery(query) {
        lib.assistant_send_text_query(this.instance, query);
    }

    startConversation() {
        lib.assistant_start_conversation(this.instance);
    }

    stopConversation() {
        lib.assistant_stop_conversation(this.instance);
    }

};