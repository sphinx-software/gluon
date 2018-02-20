import {FusionTestSuite} from "WaveFunction";

import * as GluonPackage from "Gluon";
import * as DatabasePackage from "Fusion/Database";
import * as MetaInjectorPackage from "Fusion/MetaInjector";

import {DatabaseManagerInterface} from "Fusion";
import {aggregation, aggregations, eager, hidden, readonly, type} from "Gluon/Entity";
import {Hashed, Integer, PrimaryKey, String, Timestamps} from "Gluon/DataType";


// Test Helpers
export class Comment {
    @hidden()
    @type(PrimaryKey)
    id = null;

    @type(String)
    content = null;
}

export class Post {

    @hidden()
    @type(PrimaryKey)
    id = null;

    @type(String)
    title = null;

    @type(String)
    content = null;

    @aggregation(Comment, 'post_id')
    comments = null;

    @hidden()
    @readonly()
    @type(Integer)
    credentialsId = null;
}

export class Credential {

    @type(PrimaryKey)
    id = null;

    @type(String)
    username = null;

    @eager()
    @aggregations(Post)
    posts = [];

    @aggregations(Comment, 'commenter_id')
    comments = [];

    @hidden()
    @type(Hashed)
    password = null;

    @hidden()
    @type(Timestamps)
    timestamps = null;
}

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

        await this.makeTables();
        await this.prepareModels();
    }

    /**
     *
     * @return {Promise<void>}
     */
    async prepareModels() {
        this.container
            .bind(Credential, async () => new Credential())
            .bind(Post, async () => new Post())
            .bind(Comment, async () => new Comment())
        ;
    }

    /**
     *
     * @return {Promise<void>}
     */
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

    /**
     * The 3 models fixtures
     *
     * @return {{credentials: Array, posts: Array, comments: Array}}
     */
    fixtures() {
        return {
            credentials: [],
            posts: [],
            comments: []
        }
    }

    async beforeEach(context) {

        await this.dbm.from('credentials').truncate();
        await this.dbm.from('posts').truncate();
        await this.dbm.from('comments').truncate();

        await this.dbm.from('credentials').insert(this.fixtures().credentials);
        await this.dbm.from('posts').insert(this.fixtures().posts);
        await this.dbm.from('comments').insert(this.fixtures().comments);
    }

    async afterEach(context) {
        await this.dbm.from('credentials').truncate();
        await this.dbm.from('posts').truncate();
        await this.dbm.from('comments').truncate();
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
