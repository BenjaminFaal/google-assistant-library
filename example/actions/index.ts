import ActionPackage from "./ActionPackage";
import fs from "fs";
import path from "path";
import {tmpdir} from 'tmp';
import {execSync} from 'child_process';
import md5 from "md5";

const actionsDir = path.join(tmpdir, 'actions');
if (!fs.existsSync(actionsDir)) {
    fs.mkdirSync(actionsDir);
}

const actionsConfig = require('../config.json')['actions'];

export default class Actions {

    static loadActionPackages(dir: string): ActionPackage[] {
        return fs.readdirSync(dir, {withFileTypes: true}).filter(file => file.isDirectory()).map(actionDir => {
            var name = actionDir.name;
            console.log('Loading ActionPackage: ' + name);
            var actionPackageClass = require(path.resolve(dir, name));

            var actionPackage: ActionPackage = new actionPackageClass.default();
            actionPackage.initialize(actionsConfig[name] || {});
            console.log('Loaded ActionPackage: ' + name);
            return actionPackage;
        });
    }

    private static getFile(actionPackage: ActionPackage): string {
        return path.join(actionsDir, actionPackage.getName() + '.json');
    }

    static isUpToDate(actionPackage: ActionPackage) {
        var jsonFile = this.getFile(actionPackage);
        if (!fs.existsSync(jsonFile)) {
            return false;
        }
        return md5(actionPackage.toJSON()) === md5(fs.readFileSync(jsonFile));
    }

    static updateActionPackage(actionPackage: ActionPackage, projectId: string, gactionsCliFile: string) {
        if (!fs.existsSync(gactionsCliFile)) {
            throw new Error(gactionsCliFile + ' does not exist, please download the gactions-cli from https://developers.google.com/actions/tools/gactions-cli#downloads first');
        }
        fs.chmodSync(gactionsCliFile, '775');

        var actionPackageJsonFile = this.getFile(actionPackage);
        fs.writeFileSync(actionPackageJsonFile, actionPackage.toJSON());

        var command = gactionsCliFile + ' test --action_package ' + actionPackageJsonFile + ' --project ' + projectId;
        execSync(command, {stdio: 'inherit'});
    }

}