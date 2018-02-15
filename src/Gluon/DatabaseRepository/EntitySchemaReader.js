import lodash from "lodash";
import PrimitiveType from "../DataType/PrimitiveType";
import PrimaryKey from "../DataType/PrimaryKey";

/**
 * Reader for building SQL
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
     * @return {{tables, fields, relationShips}}
     */
    read(Entity) {

        let table  = this.getTable(Entity);
        let fields = this.getFields(Entity, table);

        let foundPkFieldName = lodash.findKey(
            Reflect.getMetadata('gluon.entity.fields', Entity),
            metadata => metadata.type === PrimaryKey
        );

        if (!foundPkFieldName) {
            throw new Error(`E_SCHEMA_READER: Could not make aggregation for entity [${Entity.name}], ` +
                'no [PrimaryKey] field type defined')
        }

        let primaryKeyFieldWithoutTableName = Reflect.getMetadata('gluon.entity.fields', Entity)[foundPkFieldName].name ||
            this.namingConvention.columnNameFromFieldName(foundPkFieldName);

        let aggregations = this.getAggregations(Entity, table, primaryKeyFieldWithoutTableName);
        let eagerKeys    = Reflect.getMetadata('gluon.entity.eager', Entity) || [];

        return {
            table  : table,
            fields : fields,
            primaryKey        : table + '.' + primaryKeyFieldWithoutTableName,
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
        let fields = {};

        lodash.forIn(
            Reflect.getMetadata('gluon.entity.fields', Entity),
            (metaDescription, fieldName) => {
                if (!(metaDescription.type.prototype instanceof PrimitiveType)) {
                    fields = {...fields, ...this.getFields(metaDescription.type, tableName)};
                } else if (!metaDescription.name) {
                    fields[tableName + '.' + this.namingConvention.columnNameFromFieldName(fieldName)] = metaDescription;
                } else {
                    fields[tableName + '.' + lodash.snakeCase(metaDescription.name)] = metaDescription;
                }
            }
        );

        return fields;
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
            if (metadata.name) {
                return {
                    ...metadata,
                    foreignKey: metadata.name,
                    schema: this.read(metadata.entity)
                }
            }

            return {
                ...metadata,
                foreignKey: this.namingConvention.fkNameFromTableAndIdColumn(tableName, primaryKey),
                schema: this.read(metadata.entity)
            }
        })
    }
}
