import {DatabaseManagerInterface} from "Fusion";
import {testCase} from "WaveFunction";
import {assert} from "chai";

import { DatabaseRepository, ModelQueryBuilder, MacroBuilder, EntitySchemaReader, NamingConvention, DataMapper } from "Gluon/DatabaseRepository";
import { PrimaryKey, String, Hashed, Integer, Timestamps } from "Gluon/DataType";
import { hidden, readonly, eager, aggregations, type, EntityNotFoundError } from "Gluon/Entity";

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

    @hidden()
    @type(Timestamps)
    timestamps = null;
}

class NoOne extends Credential {
    username = 'I am no one ༼˵⊙︿⊙˵༽';
}

class CredentialRepository extends DatabaseRepository {

    async returnWhenGetNull() {
        return new NoOne();
    }
}

export default class DatabaseRepositoryQueryMethodsTestSuite extends RepositoryTestSuite {

    async fusionActivated(context) {

        await super.fusionActivated(context);

        await this.makeTables();

        await this.prepareRepository(context);
    }


    async makeTables() {
        let schema = this.dbm.connection().knexConnection.schema;

        await schema.dropTableIfExists('credentials');
        await schema.dropTableIfExists('posts');
        await schema.dropTableIfExists('comments');

        await schema.createTable('credentials', table => {
            table.increments();
            table.string('username');
            table.string('password');
            table.integer('created_at');
            table.integer('updated_at');
        });

        await schema.createTable('posts', table => {
            table.increments();
            table.string('title');
            table.string('content');
            table.string('credentials_id');
        });

        await schema.createTable('comments', table => {
            table.increments();
            table.integer('post_id');
            table.integer('commenter_id');
            table.string('content');
        });
    }

    async prepareRepository() {
        this.container
            .bind(Credential, async () => new Credential())
            .bind(Post, async () => new Post())
            .bind(Comment, async () => new Comment())
        ;

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
        await this.dbm.from('credentials').insert([
            { username: 'rikky', created_at: new Date().getTime(), updated_at: new Date().getTime() },
            { username: 'lucy' , created_at: new Date().getTime(), updated_at: new Date().getTime() },
            { username: 'rocky', created_at: new Date().getTime(), updated_at: new Date().getTime() },
        ]);
    }

    async seedPosts() {
        await this.dbm.from('posts').insert([
            { credentials_id: 1, title: 'Fusion', content: 'The cute framework' },
            { credentials_id: 1, title: 'Gluon', content: 'The cute data modeler' },
            { credentials_id: 1, title: 'WaveFunction', content: 'The cute testing tool' },
        ]);
    }

    async seedComments() {
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
    async testGetMethodShouldReturnModelProperly() {
        let rikky = await this.repository.get(1);

        assert.instanceOf(rikky, Credential);

        let rikkyPosts = await rikky.posts();
        let firstPostComments = await rikkyPosts[0].comments();

        assert.lengthOf(firstPostComments, 3);

        assert.equal(firstPostComments[0].content, 'Is it cute?');

        assert.deepEqual(rikky.toJson(), {
            id: 1,
            username: 'rikky',
            posts: [
                {
                    title: 'Fusion',
                    content: 'The cute framework'
                },
                {
                    title: 'Gluon',
                    content: 'The cute data modeler'
                },
                {
                    title: 'WaveFunction',
                    content: 'The cute testing tool'
                }
            ]
        });
    }

    @testCase()
    async testGetMethodShouldReturnDefaultModelWhenNoModelFound() {
        let shouldBeNoOne = await this.repository.get(25121990);

        assert.instanceOf(shouldBeNoOne, NoOne);
        assert.equal(shouldBeNoOne.username, 'I am no one ༼˵⊙︿⊙˵༽');
    }

    @testCase('Test getOrDefault method should return the given default value when no model found')
    async testGetOrDefaultMethod() {
        let shouldBeEqualDefault = await this.repository.getOrDefault(25121990, 'default');

        assert(shouldBeEqualDefault, 'default');
    }

    @testCase('Test getOrFail method show throw the E_ENTITY_NOT_FOUND error when no model found')
    async testGetOrFail() {
        try {
            await this.repository.getOrFail(25121990);
        } catch (error) {
            return assert.instanceOf(error, EntityNotFoundError);
        }

        throw new Error('Jeez! It\'s not throwing!!!');
    }
}
