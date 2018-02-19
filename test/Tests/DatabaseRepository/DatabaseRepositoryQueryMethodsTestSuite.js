import {testCase} from "WaveFunction";
import RepositoryTestSuite from "../../RepositoryTestSuite";
import {DatabaseManagerInterface} from "Fusion";
import {assert} from "chai";

import {
    DatabaseRepository,
    ModelQueryBuilder,
    MacroBuilder,
    PrimaryKey,
    String,
    Hashed,
    Integer,
    EntitySchemaReader,
    NamingConvention,
    Timestamps,
    DataMapper,
    hidden,
    eager,
    aggregations,
    type
} from "Gluon";

class Post {

    @hidden()
    @type(PrimaryKey)
    id = null;

    @type(String)
    title = null;

    @type(String)
    content = null;

    @hidden()
    @type(Integer)
    credentialsId = null;
}

class Credential {

    @type(PrimaryKey)
    id = null;

    @type(String)
    username = null;

    @eager()
    @aggregations(Post)
    posts = null;

    @hidden()
    @type(Hashed)
    password = null;

    @type(Timestamps)
    timestamps = null;
}

class CredentialRepository extends DatabaseRepository {

}

export default class DatabaseRepositoryQueryMethodsTestSuite extends RepositoryTestSuite {

    async fusionActivated(context) {

        this.container
            .bind(Credential, async () => new Credential())
            .bind(Post, async () => new Post())
        ;

        this.dbm = await this.container.make(DatabaseManagerInterface);

        this.repository = new CredentialRepository()
            .setSchemaReader(new EntitySchemaReader(new NamingConvention()))
            .setModelQueryBuilder(new ModelQueryBuilder())
            .setDataMapper(new DataMapper(this.container))
            .setMacroBuilder(new MacroBuilder())

            .setModel(Credential)
            .setConnection(this.dbm.connection(), this.dbm.connection())
        ;

        this.repository.bootstrap();
    }

    async seedCredentials() {
        await this.dbm.from('credentials').truncate();
        await this.dbm.from('credentials').insert([
            { username: 'rikky', created_at: new Date().getTime(), updated_at: new Date().getTime() },
            { username: 'lucy' , created_at: new Date().getTime(), updated_at: new Date().getTime() },
            { username: 'rocky', created_at: new Date().getTime(), updated_at: new Date().getTime() },
        ]);
    }

    async seedPosts() {
        await this.dbm.from('posts').truncate();
        await this.dbm.from('posts').insert([
            { credentials_id: 1, title: 'Fusion', content: 'The cute framework' },
            { credentials_id: 1, title: 'Gluon', content: 'The cute data modeller' },
            { credentials_id: 1, title: 'WaveFunction', content: 'The cute testing tool' },
        ])
    }

    async beforeEach(context) {
        await this.seedCredentials();
        await this.seedPosts();
    }

    async afterEach(context) {
        await this.dbm.from('credentials').truncate();
        await this.dbm.from('posts').truncate();
    }

    @testCase()
    async testGetMethod() {
        let rikky = await this.repository.get(1);

        assert.instanceOf(rikky, Credential);
        assert.equal(rikky.username, 'rikky');

        let rikkyPosts = await rikky.posts();
        assert.lengthOf(rikkyPosts, 3);
    }
}
