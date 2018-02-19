import {DatabaseManagerInterface} from "Fusion";
import {testCase} from "WaveFunction";
import {assert} from "chai";

import { DatabaseRepository, ModelQueryBuilder, MacroBuilder, EntitySchemaReader, NamingConvention, DataMapper } from "Gluon/DatabaseRepository";
import { PrimaryKey, String, Hashed, Integer, Timestamps } from "Gluon/DataType";
import { hidden, readonly, eager, aggregations, type } from "Gluon/Entity";

import RepositoryTestSuite from "../../RepositoryTestSuite";

class Comment {
    @hidden()
    @type(PrimaryKey)
    id = null;

    @type(String)
    content = null;
}

class Post {

    @hidden()
    @type(PrimaryKey)
    id = null;

    @type(String)
    title = null;

    @type(String)
    content = null;

    @eager()
    @aggregations(Comment, 'post_id')
    comments = null;

    @hidden()
    @readonly()
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
            .bind(Comment, async () => new Comment())
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
        ]);
    }

    async seedComments() {
        await this.dbm.from('comments').truncate();
        await this.dbm.from('comments').insert([
            { commenter_id: 2, post_id: 1, content: 'Is it cute?' },
            { commenter_id: 1, post_id: 1, content: 'Yes, sure!' },
            { commenter_id: 3, post_id: 1, content: 'But it needs to be more cute.' },
        ]);
    }

    async beforeEach(context) {
        await this.seedCredentials();
        await this.seedPosts();
        await this.seedComments();
    }

    async afterEach(context) {
        await this.dbm.from('credentials').truncate();
        await this.dbm.from('posts').truncate();
        await this.dbm.from('comments').truncate();
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
