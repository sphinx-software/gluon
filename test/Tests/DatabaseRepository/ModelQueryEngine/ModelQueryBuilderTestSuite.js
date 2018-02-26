import {
    ModelQueryBuilder,
    NamingConvention, type,
    String, eager, aggregation, aggregations, model,
    Hashed, Json, PrimaryKey, Timestamps,
    EntitySchemaReader
} from "Gluon/index";

import {testCase} from "WaveFunction";
import sinon from "sinon";
import {assert} from "chai";
import RepositoryTestSuite from "../../../RepositoryTestSuite";

class Bar {
    @type(Json)
    jsonField;

    @type(Hashed)
    hashedField;
}

class Foo {

    @type(String)
    stringField;
}

class Model {

    @type(PrimaryKey)
    idField;

    @type(Timestamps)
    timestampField;

    @type(Foo)
    foo;

    @type(Bar)
    bar;
}


class DeepAggregatedModel {

    @type(PrimaryKey)
    someIdField;

    @type(Timestamps)
    timestamps;
}

class OtherModel {

    @type(PrimaryKey, 'my_pk_field')
    idField;

    @type(Timestamps)
    timestampField;

    @eager()
    @aggregations(DeepAggregatedModel)
    deepAggregatedModel;
}

@model('customized_aggregated_models')
class AggregatedModel {

    @type(PrimaryKey)
    idField;

    @eager()
    @aggregation(Model, 'my_fk_field')
    model;

    @eager()
    @aggregations(OtherModel)
    aggregatedModel;

    @type(String)
    someField;
}

export default class ModelQueryBuilderTestSuite extends RepositoryTestSuite {

    async fusionActivated(context) {
        await super.fusionActivated(context);
        this.reader            = new EntitySchemaReader(new NamingConvention());
        this.modelQueryBuilder = new ModelQueryBuilder();
    }

    @testCase()
    testQueryBuilderMakeSelectQueryWithoutAggregation() {

        let query     = this.dbm.connection().query();

        let selectSpy = sinon.stub(query, 'select').returns(query);
        let fromSpy   = sinon.stub(query, 'from').returns(query);

        this.modelQueryBuilder.makeSelect(this.reader.read(Model), query);

        assert(selectSpy.calledWith({
            'models.id_field': 'models.id_field',
            'models.created_at': 'models.created_at',
            'models.updated_at': 'models.updated_at',
            'models.string_field': 'models.string_field',
            'models.json_field': 'models.json_field',
            'models.hashed_field': 'models.hashed_field'
        }));

        assert(fromSpy.calledWith('models'));
    }

    @testCase()
    testQueryBuilderMakeSelectQueryWithAggregation() {

        let query = this.dbm.connection().query();

        this.modelQueryBuilder.makeSelect(this.reader.read(AggregatedModel), query);

        let sql = query.toSQL();

        // It's too complicated to make assertions on stubs
        // So we'll make the raw SQL here and test if
        // the query is built properly.
        let expectedSql =
            "select " +
                "`customized_aggregated_models`.`id_field` as `customized_aggregated_models.id_field`, " +
                "`customized_aggregated_models`.`some_field` as `customized_aggregated_models.some_field`, " +
                "`models`.`id_field` as `models.id_field`, `models`.`created_at` as `models.created_at`, " +
                "`models`.`updated_at` as `models.updated_at`, `models`.`string_field` as `models.string_field`, " +
                "`models`.`json_field` as `models.json_field`, `models`.`hashed_field` as `models.hashed_field`, " +
                "`other_models`.`my_pk_field` as `other_models.my_pk_field`, " +
                "`other_models`.`created_at` as `other_models.created_at`, " +
                "`other_models`.`updated_at` as `other_models.updated_at`, " +
                "`deep_aggregated_models`.`some_id_field` as `deep_aggregated_models.some_id_field`, " +
                "`deep_aggregated_models`.`created_at` as `deep_aggregated_models.created_at`, " +
                "`deep_aggregated_models`.`updated_at` as `deep_aggregated_models.updated_at` " +
            "from " +
                "`customized_aggregated_models` left join `models` " +
                    "on `customized_aggregated_models`.`id_field` = `models`.`my_fk_field` " +
                "left join `other_models` " +
                    "on `customized_aggregated_models`.`id_field` = `other_models`.`customized_aggregated_models_id_field` " +
                "left join `deep_aggregated_models` " +
                    "on `other_models`.`my_pk_field` = `deep_aggregated_models`.`other_models_my_pk_field`"
        ;

        assert.equal(sql.sql, expectedSql);
    }
}
