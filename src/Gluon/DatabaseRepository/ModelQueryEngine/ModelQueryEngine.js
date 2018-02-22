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
     * @param {function} queryHook
     * @param {array} aggregations
     * @return {Promise<*>}
     */
    async getOne(Model, schema, queryHook, aggregations = []) {
        let query = this.builder.makeSelect(schema, queryHook(this.connection.query()));

        // Query against lazy aggregations selection
        aggregations.forEach(aggregationName => {
            let aggregation = schema.lazyAggregations[aggregationName];

            if (!aggregationName) {
                throw new Error(`E_QUERY_ENGINE: Lazy aggregation [${aggregationName}] is not specified`);
            }
            this.builder.makeJoinWithAggregation(aggregation, schema, query);
        });

        let rowSet = await query;

        if (!rowSet.length) {
            return null;
        }

        let model = await this.mapper.mapModel(rowSet, Model, schema);

        // Map model against lazy aggregations selections
        await this.mapper.mapModelWithAggregation(rowSet, model, lodash.pick(schema.lazyAggregations, aggregations));

        this.resolveLazyAggregations(model, schema, aggregations);

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
     * @param ignored
     */
    resolveLazyAggregations(model, schema, ignored = []) {
        model.schema.unguard();
        lodash.forIn(lodash.omit(schema.lazyAggregations, ignored), (aggregation, name) => {

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
