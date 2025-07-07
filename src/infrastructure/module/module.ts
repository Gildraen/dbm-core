import { type ModuleInterface } from "app/domain/interface/ModuleInterface.js";

export default class Module implements ModuleInterface {

    public name: string = "Core";

    public migrate(): Promise<unknown> {
        throw new Error("Method not implemented.");
    }
}
