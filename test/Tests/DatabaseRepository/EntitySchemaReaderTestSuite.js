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
                "foo_models.id_field": {
                    type: PrimaryKey,
                    name: undefined
                },
                "foo_models.json_field": {
                    type: Json,
                    name: undefined
                },
                "foo_models.hashed_field": {
                    type: Hashed,
                    name: undefined
                },
                "foo_models.string_field": {
                    type: String,
                    name: undefined
                },
                "foo_models.created_at": {
                    type: Timestamp,
                    name: undefined
                },
                "foo_models.updated_at": {
                    type: Timestamp,
                    name: undefined
                }
            },
            eagerAggregations: {
                helloModel: {
                    entity: HelloModel,
                    many: false,
                    name: undefined,
                    foreignKey: "foo_models_id_field"
                }
            },
            lazyAggregations: {
                worldModels: {
                    entity: WorldModel,
                    many: true,
                    name: undefined,
                    foreignKey: "foo_models_id_field"
                }
            }
        })
    }
}
