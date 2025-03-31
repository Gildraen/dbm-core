import type ModuleInterface from "domain/interface/ModuleInterface.js";
import Migrator from "infrastructure/cli/Migrator.js";

export default class RegisterModuleUseCase {

    private module: ModuleInterface;

    constructor(module: ModuleInterface) {
        this.module = module;
    }

    async execute() {
        console.log(`Registering module: ${this.module.name}`);
        await Migrator.registerModule(this.module);
    }
}