import {provider} from "@sphinx-software/fusion/Fusion/Fusion";
import {DatabaseManagerInterface} from "@sphinx-software/fusion/Fusion/ServiceContracts";

@provider()
export default class DatabaseRepositoryServiceProvider {

    constructor(container, fusion) {
        this.container = container;
        this.fusion    = fusion;
    }

    register() { }

    async boot() {
        let repositories    = this.fusion.getByManifest('gluon.repository.database');
        let databaseManager = await this.container.make(DatabaseManagerInterface);

        for (let index = 0; index < repositories.length; index++) {
            let Repository = repositories[index];
            let repository = await this.container.make(Repository);

            repository
                .setContainer(this.container)
                .setConnection(
                    databaseManager.connection(Reflect.getMetadata('gluon.repository.database.connection', Repository))
                )
                .setEntity(Reflect.getMetadata('gluon.repository.database', Repository))
            ;
        }
    }
}
