import {testCase} from "WaveFunction";
import {assert} from "chai";
import { ModelQueryBuilder, EntitySchemaReader, NamingConvention, DataMapper, ModelQueryEngine} from "Gluon/DatabaseRepository/index";
import RepositoryTestSuite from "../../../RepositoryTestSuite";

import {Credential, Post} from "../../../TheCuteSocialNetwork";

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

        assert.instanceOf(rikky, Credential);
        assert.instanceOf(posts[0], Post);

        assert.deepEqual(rikky.toJson(), {
            id: 1,
            username: 'rikky'
        });
    }

    @testCase()
    async testGetOneMethodShouldReturnModelProperlyWithGivenAggregations() {
        let rikky = await this.engine.getOne(
            this.schema,
            query => query,
            ['posts']
        );

        assert.deepEqual(rikky.toJson(), {
            id: 1,
            username: 'rikky',
            posts: [
                {
                    id: 1,
                    title: 'Fusion',
                    content: 'The cute framework',
                    author: {
                        _: "GLUON_REFERENCE",
                        reference: "Reference",
                        identity: 1
                    },
                    comments: [
                        {
                            content: "Is it cute?",
                            commenter: {
                                _: "GLUON_REFERENCE",
                                identity: 2,
                                reference: "Reference"
                            },
                            post: {
                                _: "GLUON_REFERENCE",
                                identity: 1,
                                reference: "Reference"
                            }
                        },
                        {
                            content: "Yes, sure!",
                            commenter: {
                                _: "GLUON_REFERENCE",
                                identity: 1,
                                reference: "Reference"
                            },
                            post: {
                                _: "GLUON_REFERENCE",
                                identity: 1,
                                reference: "Reference"
                            }
                        },
                        {
                            content: "But it needs to be more cute.",
                            commenter: {
                                _: "GLUON_REFERENCE",
                                identity: 3,
                                reference: "Reference"
                            },
                            post: {
                                _: "GLUON_REFERENCE",
                                identity: 1,
                                reference: "Reference"
                            }
                        },
                        {
                            content: "Okay, We'll try our best.",
                            commenter: {
                                _: "GLUON_REFERENCE",
                                identity: 1,
                                reference: "Reference"
                            },
                            post: {
                                _: "GLUON_REFERENCE",
                                identity: 1,
                                reference: "Reference"
                            }
                        },

                    ]
                },
                {
                    id: 2,
                    title: 'Gluon',
                    content: 'The cute data modeler',
                    author: {
                        _: "GLUON_REFERENCE",
                        reference: "Reference",
                        identity: 1
                    },
                    comments: []
                },
                {
                    id: 3,
                    title: 'WaveFunction',
                    content: 'The cute testing tool',
                    author: {
                        _: "GLUON_REFERENCE",
                        reference: "Reference",
                        identity: 1
                    },
                    comments: []
                }
            ]
        });
    }
}
