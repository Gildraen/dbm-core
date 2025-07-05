import { type ModuleInterface } from "domain/interface/ModuleInterface.js";

export default class Module implements ModuleInterface {

    public name: string = "Core";

    public async migrate(): Promise<void> {
        throw new Error("Method not implemented.");
    }
}
