import {FusionTestSuite} from "WaveFunction";

import * as CredentialPackage from "Tests/Credential";
import * as GluonPackage from "Gluon";
import * as DatabasePackage from "Fusion/Database";
import * as MetaInjectorPackage from "Fusion/MetaInjector";

export default class RepositoryTestSuite extends FusionTestSuite {


    manifest() {

        return {...MetaInjectorPackage, ...CredentialPackage, ...DatabasePackage, ...GluonPackage};
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
