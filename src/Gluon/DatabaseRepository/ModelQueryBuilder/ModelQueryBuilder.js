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
     */
    makeSelect(modelSchema, query) {
        this.makeSelectWithoutFrom(modelSchema, query);
        return query.from(modelSchema.table);
    }

    /**
     *
     * @param modelSchema
     * @param query
     */
    makeSelectWithoutFrom(modelSchema, query) {
        let resolvedFields  = this.resolveFieldsFromSchema(modelSchema.fields);
        let fieldsWithAlias = lodash.zipObject(resolvedFields, resolvedFields);

        query.select(fieldsWithAlias);

        lodash.forIn(modelSchema.eagerAggregations, (aggregation) => {
            let aggregatedModelSchema = aggregation.schema;

            query.leftJoin(aggregatedModelSchema.table, function () {
                this.on(modelSchema.primaryKey, '=', aggregatedModelSchema.table + '.' + aggregation.foreignKey);
            });

            this.makeSelectWithoutFrom(aggregatedModelSchema, query);
        });
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
