import {FusionTestSuite} from "WaveFunction";

import * as GluonPackage from "Gluon";
import * as DatabasePackage from "Fusion/Database";
import * as MetaInjectorPackage from "Fusion/MetaInjector";

import {DatabaseManagerInterface} from "Fusion";

export default class RepositoryTestSuite extends FusionTestSuite {


    manifest() {

        return {...MetaInjectorPackage, ...DatabasePackage, ...GluonPackage};
    }


    async fusionActivated(context) {
        await super.fusionActivated(context);

        this.dbm = await this.container.make(DatabaseManagerInterface);

        // If the database is not connected properly,
        // then we'll skip the test
        if (!await this.connected(this.dbm.connection())) {
            context.skip();
        }
    }

    /**
     * Check if the database is connected
     *
     * @param connection
     * @return {Promise<boolean>}
     */
    async connected(connection) {
        try {
            await connection.knexConnection.raw('select 1 + 1 as result');
        } catch (error) {
            return false;
        }

        return true;
    }

    config() {
        return {
            database: {
                default: "mysql",
                connections: {
                    mysql: {
                        client: 'mysql',
                        connection: {
                            host : 'mysql',
                            user : 'gluon',
                            password : 'gluon',
                            database : 'gluon'
                        }
                    }
                }
            }
        }
    }
}
