import {FusionTestSuite} from "WaveFunction";

import * as GluonPackage from "Gluon";
import * as DatabasePackage from "Fusion/Database";
import * as MetaInjectorPackage from "Fusion/MetaInjector";

export default class RepositoryTestSuite extends FusionTestSuite {


    manifest() {

        return {...MetaInjectorPackage, ...DatabasePackage, ...GluonPackage};
    }

    config() {
        return {
            database: {
                default: "mysql",
                connections: {
                    mysql: {
                        client: 'mysql',
                        connection: {
                            host : '127.0.0.1',
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
