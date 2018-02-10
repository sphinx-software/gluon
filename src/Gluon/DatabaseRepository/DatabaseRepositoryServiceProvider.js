import {provider} from "Fusion";
import {DatabaseManagerInterface} from "Fusion";

@provider()
export default class DatabaseRepositoryServiceProvider {

    constructor(container, fusion) {
        this.container = container;
        this.fusion    = fusion;
    }

    register() { }

    async boot() {

    }
}
