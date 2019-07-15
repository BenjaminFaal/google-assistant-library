interface Manifest {
    displayName: string,
    invocationName: string,
    category: string
}

interface Action {
    name: string,
    intent: Intent,
    fulfillment: Fulfillment,
    availability?: {
        deviceClasses: [object]
    }
}

interface Intent {
    name: string,
    parameters: Parameter[],
    trigger: Trigger
}

interface Parameter {
    name: string,
    type: string
}

interface Trigger {
    queryPatterns: string[]
}

interface Fulfillment {
    staticFulfillment: {
        templatedResponse: {
            items: Response[]
        }
    }
}

type Response = SimpleResponse | DeviceExecution;

interface SimpleResponse {
    simpleResponse: {
        textToSpeech: string
    }
}

interface DeviceExecution {
    deviceExecution: {
        command: string,
        params: object
    }
}

interface Type {
    name: string,
    entities: Entity[],
    isUserDefined?: boolean
}

interface Entity {
    key: string,
    synonyms: string[]
}

// https://developers.google.com/actions/reference/rest/Shared.Types/ActionPackage
export default abstract class ActionPackage {

    private name: string;
    private namespace: string;
    private category: string;

    private actions: Action[];
    private commands: { name: string, handler: (params: any) => void }[];
    private types: Type[];

    constructor(name: string, namespace: string, category: string) {
        this.name = name;
        this.namespace = namespace;
        this.category = category;

        this.actions = [];
        this.commands = [];
        this.types = [];
    }

    public getName(): string {
        return this.name;
    }

    public getNamespace(): string {
        return this.namespace;
    }

    public hasCommand(command: string) {
        return this.commands.map(value => value.name).includes(command);
    }

    public handleCommand(command: string, params: any) {
        this.commands.filter(value => value.name === command).forEach(value => {
            value.handler(params);
        });
    }

    protected addCommand(name: string, queryPatterns: string[], parameters: Parameter[], simpleResponseTTS: string[], handler: (params: any) => void) {
        var params = {};
        parameters.forEach(param => {
            params[param.name] = '$' + param.name;
        });

        const commandName = this.namespace + '.commands.' + name;
        this.commands.push({name: commandName, handler: handler});

        var responseItems: Response[] = [
            ...simpleResponseTTS.map(value => {
                return {simpleResponse: {textToSpeech: value}}
            }),
            {
                deviceExecution: {
                    command: commandName,
                    params: params
                }
            }
        ];

        this.actions.push({
            name: this.namespace + '.actions.' + name,
            intent: {
                name: this.namespace + '.intents.' + name,
                parameters: parameters,
                trigger: {
                    queryPatterns: queryPatterns
                }
            },
            fulfillment: {
                staticFulfillment: {
                    templatedResponse: {
                        items: responseItems
                    }
                }
            }
        });
    }

    protected addType(name: string, entities: Entity[], isUserDefined: boolean = false) {
        this.types.push({name: name, entities: entities, isUserDefined: isUserDefined});
    }

    toObject(): object {
        return {
            manifest: {displayName: this.name, invocationName: this.name, category: this.category},
            actions: this.actions.map(action => {
                if (!action.availability) {
                    action.availability = {
                        deviceClasses: [
                            {
                                assistantSdkDevice: {}
                            }
                        ]
                    };
                }
                return action;
            }),
            types: this.types
        };
    }

}