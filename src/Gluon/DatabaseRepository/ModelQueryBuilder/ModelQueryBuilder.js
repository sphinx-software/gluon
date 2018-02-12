import lodash from "lodash";
import {PrimitiveType, PrimaryKey} from "Gluon";

export default class ModelQueryBuilder {
    constructor(namingConvention) {
        this.namingConvention = namingConvention;
    }

    makeSelect(Model, query) {
        let tableName = this.guessTableName(Model);


        let eagers = lodash.pick(
            Reflect.getMetadata('gluon.entity.aggregation', Model) || {},
            Reflect.getMetadata('gluon.entity.eager', Model) || []
        );

        let thisbuilder = this;

        lodash.forIn(eagers, (eagerLoadAggregation) => {
            let pk = this.getPk(Model);
            let fk = this.guessTableName(eagerLoadAggregation.entity) + '.' +
                (eagerLoadAggregation.name || this.namingConvention.fkNameFromTableAndIdColumn(tableName, pk));

            this.makeSelect(eagerLoadAggregation.entity, query);

            query.join(this.guessTableName(eagerLoadAggregation.entity), function () {
                this.on(tableName + '.' + thisbuilder.getPk(Model), '=', fk);
            });
        });


        query.select(this.getFields(Model).map(fieldName => tableName + '.' + fieldName));

        return query;
    }

    /**
     * Get the primary key column name
     *
     * @param Model
     * @return {*}
     */
    getPk(Model) {
        let pkFieldKey =
            lodash.findKey(
                Reflect.getMetadata('gluon.entity.fields', Model),
                metadata => metadata.type === PrimaryKey
            );

        if (!pkFieldKey) {
            throw new Error(`E_SCHEMA_READER: Could not make aggregation for entity [${Model.name}], ` +
                'no [PrimaryKey] field type defined')
        }

        let pkMetadata = Reflect.getMetadata('gluon.entity.fields', Model)[pkFieldKey];

        return pkMetadata.name || this.namingConvention.columnNameFromFieldName(pkFieldKey);
    }

    getFields(Model) {
        let fields = [];

        lodash.forIn(
            Reflect.getMetadata('gluon.entity.fields', Model),
            (metaDescription, fieldName) => {
                if (!(metaDescription.type.prototype instanceof PrimitiveType)) {
                    fields = fields.concat(this.getFields(metaDescription.type));
                } else if (!metaDescription.name) {
                    fields.push(this.namingConvention.columnNameFromFieldName(fieldName));
                } else {
                    fields.push(lodash.snakeCase(metaDescription.name));
                }
            }
        );

        return fields;
    }

    guessTableName(Model) {
        return Reflect.getMetadata('gluon.entity', Model) ||
            this.namingConvention.tableNameFromEntityName(Model.name)
        ;
    }
}
