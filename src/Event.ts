export default class Event {
    type: EventType;
    args: object;

    constructor(type: EventType, args: object) {
        this.type = type;
        this.args = args;
    }
}

export enum EventType {
    ON_START_FINISHED = 0,
    ON_CONVERSATION_TURN_STARTED = 1,
    ON_CONVERSATION_TURN_TIMEOUT = 2,
    ON_END_OF_UTTERANCE = 3,
    ON_RECOGNIZING_SPEECH_FINISHED = 5,
    ON_RESPONDING_STARTED = 6,
    ON_RESPONDING_FINISHED = 7,
    ON_NO_RESPONSE = 8,
    ON_CONVERSATION_TURN_FINISHED = 9,
    ON_ALERT_STARTED = 10,
    ON_ALERT_FINISHED = 11,
    ON_ASSISTANT_ERROR = 12,
    ON_MUTED_CHANGED = 13,
    ON_DEVICE_ACTION = 14,
    ON_RENDER_RESPONSE = 15,
    ON_MEDIA_STATE_IDLE = 16,
    ON_MEDIA_TRACK_LOAD = 17,
    ON_MEDIA_TRACK_PLAY = 18,
    ON_MEDIA_TRACK_STOP = 19,
    ON_MEDIA_STATE_ERROR = 20
}