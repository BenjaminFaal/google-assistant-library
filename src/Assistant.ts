import Event, {EventType} from "./Event";
import createLibrary, {createCallback} from "./library";
import {EventEmitter} from 'events';

export default class Assistant extends EventEmitter {

    private instance: Buffer;
    private lib: any;

    constructor(libraryFile: string, deviceModelId: string) {
        super();

        this.lib = createLibrary(libraryFile);
        var callback = createCallback(function (event: number, eventBodyJson: string) {
            this.emit('event', new Event(EventType[EventType[event]], JSON.parse(eventBodyJson)));
        }.bind(this));

        process.on('exit', function () {
            // keep reference to callback to avoid it being GCed
            callback
        });

        this.instance = this.lib.assistant_new(callback, deviceModelId);
    }

    setAccessToken(accessToken) {
        this.lib.assistant_set_access_token(this.instance, accessToken, accessToken.length);
    }

    start() {
        this.lib.assistant_start(this.instance);
    }

    stop() {
        this.lib.assistant_free(this.instance);
    }

    setMicMute(mute) {
        this.lib.assistant_set_mic_mute(this.instance, mute);
    }

    sendTextQuery(query) {
        this.lib.assistant_send_text_query(this.instance, query);
    }

    startConversation() {
        this.lib.assistant_start_conversation(this.instance);
    }

    stopConversation() {
        this.lib.assistant_stop_conversation(this.instance);
    }

};