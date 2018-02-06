import fusion from 'Fusion/Fusion';
import Container from '@sphinx-software/container';
import {EventEmitter} from "events";

import * as Database from "Fusion/Database";
import * as MetaInjector from "Fusion/MetaInjector";
import * as Gluon from "Gluon";
import * as Credential from "./Credential";

import chai  from "chai";

chai.container = new Container(new EventEmitter());
chai.fusion    = fusion;

describe('Gluon Test Suite', () => {

    before(async function bootstrap () {
        fusion
            .use(Database)
            .use(MetaInjector)
            .use(Gluon)
            .use(Credential)
        ;

        await fusion.activate({
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
        }, chai.container);
    });

    require('./specs');
});
