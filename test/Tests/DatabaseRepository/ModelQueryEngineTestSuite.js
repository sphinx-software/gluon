import {testCase} from "WaveFunction";
import {assert} from "chai";
import { ModelQueryBuilder, EntitySchemaReader, NamingConvention, DataMapper, ModelQueryEngine} from "Gluon/DatabaseRepository";
import {default as RepositoryTestSuite, Credential, Post, Comment} from "../../RepositoryTestSuite";

export default class ModelQueryEngineTestSuite extends RepositoryTestSuite {

    async fusionActivated(context) {

        await super.fusionActivated(context);

        this.engine = new ModelQueryEngine(new DataMapper(this.container), new ModelQueryBuilder(), this.dbm.connection());
        this.schema = new EntitySchemaReader(new NamingConvention()).read(Credential);
    }

    fixtures() {
        return {
            credentials: [
                { username: 'rikky', created_at: new Date().getTime(), updated_at: new Date().getTime() },
                { username: 'lucy' , created_at: new Date().getTime(), updated_at: new Date().getTime() },
                { username: 'rocky', created_at: new Date().getTime(), updated_at: new Date().getTime() },
            ],

            posts: [
                { credentials_id: 1, title: 'Fusion', content: 'The cute framework' },
                { credentials_id: 1, title: 'Gluon', content: 'The cute data modeler' },
                { credentials_id: 1, title: 'WaveFunction', content: 'The cute testing tool' }
            ],

            comments: [
                { commenter_id: 2, post_id: 1, content: 'Is it cute?' },
                { commenter_id: 1, post_id: 1, content: 'Yes, sure!' },
                { commenter_id: 3, post_id: 1, content: 'But it needs to be more cute.' },
                { commenter_id: 1, post_id: 1, content: 'Okay, We\'ll try our best.' },
            ]
        }
    }

    @testCase()
    async testGetOneMethodShouldReturnModelProperly() {

        let rikky    = await this.engine.getOne(this.schema, query => query);
        let posts    = await rikky.posts();
        let comments = await rikky.comments();

        assert.instanceOf(rikky, Credential);
        assert.instanceOf(posts[0], Post);
        assert.instanceOf(comments[0], Comment);

        assert.deepEqual(rikky.toJson(), {
            id: 1,
            username: 'rikky',

            // Since posts was in eager aggregation
            // they was shown here, but comments wasn't
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
    async testGetOneMethodShouldReturnModelProperlyWithGivenAggregations() {
        let rikky = await this.engine.getOne(
            this.schema,
            query => query,
            ['comments']
        );

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
            ],

            comments: [
                {
                    content: 'Yes, sure!'
                },
                {
                    content: 'Okay, We\'ll try our best.'
                }
            ]
        })
    }
}
