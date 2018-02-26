import lodash from "lodash";

/**
 * This class helps to build SQL queries against a model schema
 */
export default class ModelQueryBuilder {

    /**
     * Build Select SQL
     *
     * @param modelSchema
     * @param query
     * @param aggregations
     */
    makeSelect(modelSchema, query, aggregations = []) {
        this.makeSelectWithoutFrom(modelSchema, query, aggregations);
        return query.from(modelSchema.table);
    }

    /**
     *
     * @param modelSchema
     * @param query
     * @param aggregations
     */
    makeSelectWithoutFrom(modelSchema, query, aggregations = []) {
        let resolvedFields  = this.resolveFieldsFromSchema(modelSchema.fields);
        let fieldsWithAlias = lodash.zipObject(resolvedFields, resolvedFields);

        query.select(fieldsWithAlias);

        lodash.forIn(modelSchema.eagerAggregations, aggregation => {
            this.makeJoinWithAggregation(aggregation, modelSchema, query);
        });

        lodash.forIn(lodash.pick(modelSchema.lazyAggregations, aggregations), aggregation => {
            this.makeJoinWithAggregation(aggregation, modelSchema, query);
        });
    }

    /**
     *
     * @param aggregation
     * @param modelSchema
     * @param query
     */
    makeJoinWithAggregation(aggregation, modelSchema, query) {
        let aggregatedModelSchema = aggregation.schema;

        query.leftJoin(aggregatedModelSchema.table, function () {
            this.on(modelSchema.primaryKey, '=', aggregatedModelSchema.table + '.' + aggregation.foreignKey);
        });

        this.makeSelectWithoutFrom(aggregatedModelSchema, query);
    }

    /**
     *
     * @param fieldSchema
     * @return {Array}
     */
    resolveFieldsFromSchema(fieldSchema) {
        let fields = [];
        lodash.forIn(fieldSchema, fieldReceipt => {
            fields = fields.concat(
                lodash.isString(fieldReceipt.name) ? [fieldReceipt.name] : this.resolveFieldsFromSchema(fieldReceipt.name)
            )
        });

        return fields;
    }
}
