import {testCase} from "WaveFunction";
import RepositoryTestSuite from "../../RepositoryTestSuite";
import {
    DatabaseRepository,
    QueryScope,
    ModelQueryBuilder,
    PrimaryKey,
    String,
    EntitySchemaReader,
    NamingConvention,
    Timestamps,
    DataMapper,
    type
} from "Gluon";

import {DatabaseManagerInterface} from "Fusion";

import {assert} from "chai";

class Credential {

    @type(PrimaryKey)
    id = null;

    @type(String)
    username = null;

    @type(Timestamps)
    timestamps = null;
}

export default class DatabaseRepositoryQueryMethodsTestSuite extends RepositoryTestSuite {

    async fusionActivated(context) {

        this.container.bind(Credential, async () => new Credential());

        this.dbm = await this.container.make(DatabaseManagerInterface);

        this.repository = new DatabaseRepository()
            .setSchemaReader(new EntitySchemaReader(new NamingConvention()))
            .setModelQueryBuilder(new ModelQueryBuilder())
            .setQueryScope(new QueryScope())
            .setDataMapper(new DataMapper(this.container))

            .setModel(Credential)
            .setConnection(this.dbm.connection(), this.dbm.connection())
            .bootstrap()
        ;
    }

    async beforeEach(context) {
        await this.dbm.from('credentials').truncate();

        await this.dbm.from('credentials').insert([
            { username: 'rikky', created_at: new Date().getTime(), updated_at: new Date().getTime() },
            { username: 'lucy' , created_at: new Date().getTime(), updated_at: new Date().getTime() },
            { username: 'rocky', created_at: new Date().getTime(), updated_at: new Date().getTime() },
        ])
    }

    async afterEach(context) {
        await this.dbm.from('credentials').truncate();
    }

    @testCase()
    async testGetMethod() {
        let rikkyCredential = await this.repository.get(1);

        assert.instanceOf(rikkyCredential, Credential);
        assert.equal(rikkyCredential.username, 'rikky');
    }
}
