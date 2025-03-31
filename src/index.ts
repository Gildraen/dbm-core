import type ModuleInterface from "domain/interface/ModuleInterface.js";
// import Module from "infrastructure/module/module.js";
import RegisterModuleUseCase from "@application/useCase/RegisterModule.js";

// const baseModule = new Module();
// const registerUseCase = new RegisterModuleUseCase(baseModule);
// await registerUseCase.execute();

// console.log("✅ BaseModule registered with core-lib!");

export { RegisterModuleUseCase, type ModuleInterface };
