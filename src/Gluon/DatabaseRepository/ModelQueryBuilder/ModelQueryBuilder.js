import lodash from "lodash";
import {PrimitiveType, PrimaryKey} from "Gluon";

export default class ModelQueryBuilder {

    makeSelect(modelSchema, query) {

        // if (!modelSchema.primaryKey) {
        //     throw new Error(`E_SCHEMA_READER: Could not make aggregation for entity [${Model.name}], ` +
        //         'no [PrimaryKey] field type defined')
        // }

        this.makeSelectWithoutFrom(modelSchema, query);

        query.from(modelSchema.table);
    }

    makeSelectWithoutFrom(modelSchema, query) {
        query.select(lodash.keys(modelSchema.fields));

        lodash.forIn(modelSchema.eagerAggregations, (aggregation) => {
            let aggregatedModelSchema = aggregation.schema;
            this.makeSelectWithoutFrom(aggregatedModelSchema, query);
            query.join(aggregatedModelSchema.table, function () {
                this.on(modelSchema.primaryKey, '=', aggregatedModelSchema.table + '.' + aggregation.foreignKey);
            });
        });
    }
}
