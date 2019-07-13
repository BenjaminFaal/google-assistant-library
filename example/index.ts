import Assistant from "../src/Assistant";
import getAccessToken from "./credentials";
import Event, {EventType} from "../src/Event";
import playSound from 'play-sound';

const player = playSound({});

const config = require('./config.json');

getAccessToken().then(response => {
    var assistant = new Assistant('lib/libassistant_embedder.so', config.deviceModelId);
    assistant.setAccessToken(response.token);
    return assistant;
}).then(assistant => {
    assistant.on('event', (event: Event) => {
        console.log('Assistant event:', EventType[event.type], event.args);

        if (event.type === EventType.ON_START_FINISHED) {
            assistant.sendTextQuery('what time is it');
        }

        if (event.type === EventType.ON_RECOGNIZING_SPEECH_FINISHED) {
            var text = event.args.text;
            if (text === 'stop' || text === 'exit') {
                process.exit(0);
            }
        }

        if (event.type === EventType.ON_CONVERSATION_TURN_STARTED) {
            player.play('resources/start.wav');
        } else if (event.type === EventType.ON_CONVERSATION_TURN_FINISHED) {
            player.play('resources/stop.wav');
        }
    });

    assistant.start();

    assistant.startConversation();

    process.openStdin().on('data', (data) => assistant.sendTextQuery(data.toString().trim()));
});
