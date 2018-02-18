import {testCase, TestSuite} from "WaveFunction";
import {assert} from "chai";


import {
    type, aggregation, aggregations, eager,
    EntitySchemaReader, NamingConvention,
    String, PrimaryKey, Timestamps, Hashed, Json, Timestamp
} from "Gluon";

export class BarModel {
    @type(Json)
    jsonField;

    @type(Hashed)
    hashedField;
}

export class HelloModel {
    @type(PrimaryKey)
    idField;

    @type(String)
    otherField;
}

export class WorldModel {
    @type(PrimaryKey)
    idField;

    @type(String)
    otherField;
}

export class FooModel {

    @type(PrimaryKey)
    idField;

    @type(BarModel)
    modelField;

    @type(String)
    stringField;

    @type(Timestamps)
    timestampField;

    @eager()
    @aggregation(HelloModel)
    helloModel;

    @aggregations(WorldModel)
    worldModels;
}



export default class EntitySchemaReaderTestSuite extends TestSuite {


    @testCase()
    testSchemaReaderReadsAnEntityWithoutAggregation() {

        let schemaReader = new EntitySchemaReader(new NamingConvention());

        let results = schemaReader.read(FooModel);

        assert.deepEqual(results, {
            primaryKey: 'foo_models.id_field',
            table: "foo_models",
            fields: {
                "idField": {
                    type: PrimaryKey,
                    name: "foo_models.id_field"
                },
                "modelField": {
                    type: BarModel,
                    name: {
                        jsonField: {
                            type: Json,
                            name: "foo_models.json_field",
                        },
                        hashedField: {
                            type: Hashed,
                            name: "foo_models.hashed_field"
                        }
                    }
                },
                "stringField": {
                    type: String,
                    name: "foo_models.string_field"
                },
                "timestampField": {
                    type: Timestamps,
                    name: {
                        "createdAt": {
                            type: Timestamp,
                            name: "foo_models.created_at"
                        },
                        "updatedAt": {
                            type: Timestamp,
                            name: "foo_models.updated_at"
                        }
                    }
                }
            },

            eagerAggregations: {
                helloModel: {
                    entity: HelloModel,
                    many: false,
                    name: undefined,
                    foreignKey: "foo_models_id_field",
                    schema: {
                        primaryKey: "hello_models.id_field",
                        table: "hello_models",
                        fields: {
                            "idField": {
                                name: "hello_models.id_field",
                                type: PrimaryKey
                            },
                            "otherField": {
                                name: "hello_models.other_field",
                                type: String
                            }
                        },
                        eagerAggregations: {

                        },
                        lazyAggregations: {

                        }
                    }
                }
            },

            lazyAggregations: {
                worldModels: {
                    entity: WorldModel,
                    many: true,
                    name: undefined,
                    foreignKey: "foo_models_id_field",
                    schema: {
                        primaryKey: "world_models.id_field",
                        table: "world_models",
                        fields: {
                            idField: {
                                type: PrimaryKey,
                                name: "world_models.id_field"
                            },
                            otherField: {
                                type: String,
                                name: "world_models.other_field"
                            }
                        },
                        eagerAggregations: {

                        },
                        lazyAggregations: {

                        }
                    }
                }
            }
        })
    }
}
