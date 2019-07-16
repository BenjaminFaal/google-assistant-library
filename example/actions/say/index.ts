import ActionPackage from "../ActionPackage";

export default class Say extends ActionPackage {

    constructor() {
        super('Say', 'com.google.say', 'PRODUCTIVITY');
    }

    initialize(config: any) {
        this.addCommand(
            'Say',
            ['say $SchemaOrg_Text:text'],
            [{name: 'text', type: 'SchemaOrg_Text'}],
            ['$text'],
            params => {
            });
    }

}