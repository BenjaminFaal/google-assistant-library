import ActionPackage from "../ActionPackage";

export default class YouTube extends ActionPackage {

    constructor() {
        super('YouTube', 'com.youtube', 'MEDIA');

        this.addCommand(
            'Play',
            ['play $SchemaOrg_Text:query on youtube'],
            [{name: 'query', type: 'SchemaOrg_Text'}],
            ['Playing $query on YouTube'],
            params => {
                console.log('Playing ' + params.query + ' on YouTube!!!');
            });
    }

}