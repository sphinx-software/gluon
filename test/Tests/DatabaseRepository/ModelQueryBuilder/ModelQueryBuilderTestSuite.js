
import {
    ModelQueryBuilder,
    NamingConvention, type,
    String, eager, aggregation, aggregations, model,
    Hashed, Json, PrimaryKey, SoftDelete, Timestamps
} from "Gluon";

import {testCase} from "WaveFunction";
import sinon from "sinon";
import {assert} from "chai";
import RepositoryTestSuite from "../../../RepositoryTestSuite";
import {DatabaseManagerInterface} from "Fusion";

export class Bar {
    @type(Json)
    jsonField;

    @type(Hashed)
    hashedField;
}

export class Foo {

    @type(String)
    stringField;
}

export class Model {

    @type(PrimaryKey)
    idField;

    @type(Timestamps)
    timestampField;

    @type(Foo)
    foo;

    @type(Bar)
    bar;
}


export class DeepAggregatedModel {

    @type(PrimaryKey)
    someIdField;

    @type(Timestamps)
    timestamps;
}

export class OtherModel {

    @type(PrimaryKey, 'my_pk_field')
    idField;

    @type(Timestamps)
    timestampField;

    @eager()
    @aggregations(DeepAggregatedModel)
    deepAggregatedModel;
}

@model('customized_aggregated_models')
export class AggregatedModel {

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

const expectedSql = 'select `models`.`id_field`, `models`.`created_at`, `models`.`updated_at`, `models`.`string_field`, `models`.`json_field`, `models`.`hashed_field`, `deep_aggregated_models`.`some_id_field`, `deep_aggregated_models`.`created_at`, `deep_aggregated_models`.`updated_at`, `other_models`.`my_pk_field`, `other_models`.`created_at`, `other_models`.`updated_at`, `customized_aggregated_models`.`id_field`, `customized_aggregated_models`.`some_field` from `customized_aggregated_models` inner join `models` on `customized_aggregated_models`.`id_field` = `models`.`my_fk_field` inner join `deep_aggregated_models` on `other_models`.`my_pk_field` = `deep_aggregated_models`.`other_models_my_pk_field` inner join `other_models` on `customized_aggregated_models`.`id_field` = `other_models`.`customized_aggregated_models_id_field`'

export default class ModelQueryBuilderTestSuite extends RepositoryTestSuite {

    async fusionActivated() {
        this.modelQueryBuilder = new ModelQueryBuilder(new NamingConvention());
        this.connection        = (await this.container.make(DatabaseManagerInterface)).connection();
    }

    @testCase()
    testQueryBuilderMakeSelectQueryWithoutAggregation() {

        let query = this.connection.query().from(this.modelQueryBuilder.guessTableName(Model));

        let selectSpy = sinon.stub(query, 'select').returns(query);

        this.modelQueryBuilder.makeSelect(Model, query);

        assert(selectSpy.calledWith([
            'models.id_field', 'models.created_at', 'models.updated_at',
            'models.string_field', 'models.json_field', 'models.hashed_field'
        ]))
    }

    @testCase()
    testQueryBuilderMakeSelectQueryWithAggregation() {

        let query = this.connection.query().from(this.modelQueryBuilder.guessTableName(AggregatedModel));

        this.modelQueryBuilder.makeSelect(AggregatedModel, query);

        let sql = query.toSQL();

        assert.equal(sql.sql, expectedSql);
    }
}
