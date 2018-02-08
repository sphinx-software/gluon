import {testCase, TestSuite} from "WaveFunction";
import EntitySchemaReader from "Gluon/DatabaseRepository/EntitySchemaReader";
import NamingConvention from "Gluon/DatabaseRepository/NamingConvention";

import {FooModel, FarModel, NoPKModel} from "./entities";
import {assert} from "chai";

export default class EntitySchemaReaderTestSuite extends TestSuite {


    @testCase()
    testSchemaReaderReadsAnEntityWithoutAggregation() {

        let schemaReader = new EntitySchemaReader(new NamingConvention());

        let results = schemaReader.read(FooModel);

        assert.deepEqual(results, {
            tables: ["foo_models"],
            fields: [
                "foo_models.id_field",
                "foo_models.json_field",
                "foo_models.hashed_field",
                "foo_models.string_field",
                "foo_models.created_at",
                "foo_models.updated_at"
            ],
            relationShips: []
        })
    }

    @testCase()
    testSchemaReaderReadsAnEntityWithAggregation() {
        let schemaReader = new EntitySchemaReader(new NamingConvention());

        let results = schemaReader.read(FarModel);

        assert.deepEqual(results, {
            tables: [
                "far_models",
                "foo_models",
                "boo_models",
                "hello_world_models"
            ],
            fields: [

                "far_models.id_field",
                "far_models.created_at",
                "far_models.updated_at",
                "far_models.other_field",

                "foo_models.id_field",
                "foo_models.json_field",
                "foo_models.hashed_field",
                "foo_models.string_field",
                "foo_models.created_at",
                "foo_models.updated_at",

                "boo_models.id",
                "boo_models.deleted_at",

                "hello_world_models.id_field"
            ],
            relationShips: [
                { pk: "far_models.id_field", fk: "foo_models.far_models_id_field",   many: true  },
                { pk: "far_models.id_field", fk: "boo_models.some_fk_field",         many: false },
                { pk: "boo_models.id"      , fk: "hello_world_models.boo_models_id", many: false }
            ]
        })
    }

    @testCase()
    testSchemaReaderShouldThrowErrorWhenAggregationOnNoPKEntity() {
        let schemaReader = new EntitySchemaReader(new NamingConvention());

        assert.throws(() => {
            schemaReader.read(NoPKModel)
        }, 'Could not make aggregation for entity [NoPKModel], no [PrimaryKey] field type defined')
    }
}
