import Assistant from "../src/Assistant";
import getAccessToken from "./credentials";
import Event, {EventType} from "../src/Event";
import playSound from 'play-sound';
import path from 'path';
import Actions from './actions';

const player = playSound({});

const config = require('./config.json');

var gactionsCliFile = path.resolve('resources', 'gactions');
var actionPackages = Actions.loadActionPackages('actions');
actionPackages.forEach(actionPackage => {
    Actions.updateActionPackage(actionPackage, config.projectId, gactionsCliFile);
});

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

        if (event.type === EventType.ON_DEVICE_ACTION) {
            event.args.inputs.forEach(input => {
                input.payload.commands.forEach(command => {
                    command.execution.forEach(execution => {
                        actionPackages.forEach(actionPackage => {
                            if (actionPackage.hasCommand(execution.command)) {
                                actionPackage.handleCommand(execution.command, execution.params);
                            }
                        });
                    });
                });
            });
        }
    });

    assistant.start();

    process.openStdin().on('data', (data) => assistant.sendTextQuery(data.toString().trim()));
});
