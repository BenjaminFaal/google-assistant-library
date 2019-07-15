import ActionPackage from "./ActionPackage";
import fs from "fs";
import path from "path";
import tmp from 'tmp';
import {execSync} from 'child_process';

export default class Actions {

    static loadActionPackages(dir: string): ActionPackage[] {
        return fs.readdirSync(dir, {withFileTypes: true}).filter(file => file.isDirectory()).map(actionDir => {
            console.log('Loading ActionPackage: ' + actionDir.name);
            var actionPackageClass = require(path.resolve(dir, actionDir.name));

            var actionPackage: ActionPackage = new actionPackageClass.default();
            console.log('Loaded ActionPackage: ' + actionPackage.getName());
            return actionPackage;
        });
    }

    static updateActionPackage(actionPackage: ActionPackage, projectId: string, gactionsCliFile: string) {
        if (!fs.existsSync(gactionsCliFile)) {
            throw new Error(gactionsCliFile + ' does not exist, please download the gactions-cli from https://developers.google.com/actions/tools/gactions-cli#downloads first');
        }
        fs.chmodSync(gactionsCliFile, '775');

        var actionPackageJsonFile = tmp.fileSync({prefix: 'google-assistant-library-example-action-' + actionPackage.getName()});
        var actionPackageJson = JSON.stringify(actionPackage.toObject());
        fs.writeFileSync(actionPackageJsonFile.name, actionPackageJson);

        var command = gactionsCliFile + ' test --action_package ' + actionPackageJsonFile.name + ' --project ' + projectId;
        execSync(command, {stdio: 'inherit'});
    }

}