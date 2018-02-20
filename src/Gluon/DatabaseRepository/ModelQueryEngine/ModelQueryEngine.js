import lodash from 'lodash';
import PrimaryKey from "../../DataType/PrimaryKey";

/**
 * Stateless engine for querying model by its schema
 */
export default class ModelQueryEngine {

    /**
     *
     * @param {DataMapper} mapper
     * @param {ModelQueryBuilder} builder
     * @param {DatabaseConnectionInterface} connection
     */
    constructor(mapper, builder, connection) {
        this.mapper     = mapper;
        this.builder    = builder;
        this.connection = connection;
    }

    /**
     * Query for a model
     *
     * @param {Function|constructor} Model
     * @param {*} schema
     * @param queryHook
     * @return {Promise<*>}
     */
    async getOne(Model, schema, queryHook) {
        let rowSet = await this.builder.makeSelect(schema, queryHook(this.connection.query()));

        if (!rowSet.length) {
            return null;
        }

        let model = await this.mapper.mapModel(rowSet, Model, schema);

        this.resolveLazyAggregations(model, schema);

        return model;
    }

    /**
     * Query for models
     *
     * @param {Function|constructor} Model
     * @param {*} schema
     * @param queryHook
     * @return {Promise<*>}
     */
    async getMany(Model, schema, queryHook) {
        let rowSet = await this.builder.makeSelect(schema, queryHook(this.connection.query()));

        if (!rowSet.length) {
            return [];
        }

        let models = await this.mapper.mapModels(rowSet, Model, schema);

        models.forEach(model => this.resolveLazyAggregations(model, schema));

        return models;
    }

    /**
     * Decorate the lazy aggregation methods for the model
     *
     * @param model
     * @param schema
     */
    resolveLazyAggregations(model, schema) {
        model.schema.unguard();
        lodash.forIn(schema.lazyAggregations, (aggregation, name) => {

            let primaryKeyField = lodash.findKey(schema.fields, field => field.type === PrimaryKey);
            let parameters      = [
                aggregation.entity, aggregation.schema,
                query => query.where(aggregation.foreignKey, model[primaryKeyField])
            ];

            model[name] = aggregation.many ?
                () => this.getMany(...parameters) :
                () => this.getOne(...parameters)
            ;
        });
        model.schema.guard();
    }
}
