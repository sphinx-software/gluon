import lodash from "lodash";
import PrimitiveType from "../DataType/PrimitiveType";
import PrimaryKey from "../DataType/PrimaryKey";
import {reference} from "../Entity";

/**
 * This class reads the decorated model's schema and gives instruction
 * for other services (ModelQueryBuilder & DataMapper) know how to interact with the model
 */
export default class EntitySchemaReader {

    /**
     *
     * @param namingConvention
     */
    constructor(namingConvention) {
        this.namingConvention = namingConvention;
    }

    /**
     *
     * @param Entity
     * @return {{entity: *, table: *[], fields: {}, primaryKey: null, eagerAggregations: *, lazyAggregations: *}}
     */
    read(Entity) {

        let table  = this.getTable(Entity);
        let fields = this.getFields(Entity, table);

        let foundPkFieldName = lodash.findKey(fields, metadata => metadata.type === PrimaryKey);

        let primaryKeyFieldWithoutTableName = null;

        if (foundPkFieldName) {
            primaryKeyFieldWithoutTableName =
                Reflect.getMetadata('gluon.entity.fields', Entity)[foundPkFieldName].name ||
                this.namingConvention.columnNameFromFieldName(foundPkFieldName);
        }

        let aggregations = this.getAggregations(Entity, table, primaryKeyFieldWithoutTableName);
        let eagerKeys    = Reflect.getMetadata('gluon.entity.eager', Entity) || [];

        return {
            entity : Entity,
            table  : table,
            fields : fields,
            primaryKey        : foundPkFieldName ? fields[foundPkFieldName].name : null,
            eagerAggregations : lodash.pick(aggregations, eagerKeys),
            lazyAggregations  : lodash.omit(aggregations, eagerKeys)
        };
    }

    /**
     *
     * @param Entity
     * @return {*[]}
     */
    getTable(Entity) {
        let entityTable = Reflect.getMetadata('gluon.entity', Entity);

        if (!entityTable) {
            entityTable = this.namingConvention.tableNameFromEntityName(Entity.name);
        }

        return entityTable;
    }

    /**
     *
     * @param Entity
     * @param tableName
     * @return {{}}
     */
    getFields(Entity, tableName) {
        return lodash.mapValues(
            Reflect.getMetadata('gluon.entity.fields', Entity),
            (metaDescription, fieldName) => {
                let name = null;
                if (!(metaDescription.type.prototype instanceof PrimitiveType)) {
                    name = this.getFields(metaDescription.type, tableName)
                } else if (!metaDescription.name) {
                    name = tableName + '.' + this.namingConvention.columnNameFromFieldName(fieldName)
                } else {
                    name = tableName + '.' + lodash.snakeCase(metaDescription.name);
                }

                return {...metaDescription, name: name};
            }
        );
    }

    /**
     *
     *
     * @param Entity
     * @param tableName
     * @param primaryKey
     * @return {{}}
     */
    getAggregations(Entity, tableName, primaryKey) {
        let aggregations = Reflect.getMetadata('gluon.entity.aggregation', Entity) || {};

        return lodash.mapValues(aggregations, metadata => {
            return {
                ...metadata,
                foreignKey: metadata.name || this.namingConvention.fkNameFromTableAndIdColumn(tableName, primaryKey),
                schema: this.read(metadata.entity)
            }
        })
    }
}
