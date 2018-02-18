import lodash from "lodash";
import {PrimitiveType, PrimaryKey} from "Gluon";

export default class ModelQueryBuilder {

    makeSelect(modelSchema, query) {
        this.makeSelectWithoutFrom(modelSchema, query);

        query.from(modelSchema.table);
    }

    resolveFieldsFromSchema(fieldSchema) {
        let fields = [];
        lodash.forIn(fieldSchema, fieldReceipt => {
            fields = fields.concat(
                lodash.isString(fieldReceipt.name) ?
                    [fieldReceipt.name] :
                    this.resolveFieldsFromSchema(fieldReceipt.name)
            )
        });

        return fields;
    }

    makeSelectWithoutFrom(modelSchema, query) {
        query.select(this.resolveFieldsFromSchema(modelSchema.fields));

        lodash.forIn(modelSchema.eagerAggregations, (aggregation) => {
            let aggregatedModelSchema = aggregation.schema;
            this.makeSelectWithoutFrom(aggregatedModelSchema, query);
            query.leftJoin(aggregatedModelSchema.table, function () {
                this.on(modelSchema.primaryKey, '=', aggregatedModelSchema.table + '.' + aggregation.foreignKey);
            });
        });
    }
}
