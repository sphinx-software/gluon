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

        let entityTable = Reflect.getMetadata('gluon.repository.database.table', Entity);

        if (!entityTable) {
            entityTable = this.namingConvention.tableNameFromEntityName(Entity.name);
        }

        return {
            tables: this.getTables(Entity),
            fields: this.getFields(Entity, entityTable),
            relationShips: this.getRelationShips(Entity)
        };
    }

    /**
     *
     * @param Entity
     * @return {*[]}
     */
    getTables(Entity) {
        let entityTable = Reflect.getMetadata('gluon.repository.database.table', Entity);

        if (!entityTable) {
            entityTable = this.namingConvention.tableNameFromEntityName(Entity.name);
        }

        let result = [entityTable];

        let aggregations = Reflect.getMetadata('gluon.entity.aggregation', Entity) || {};

        lodash.forIn(aggregations, metadata => {
            result = result.concat(this.getTables(metadata.entity));
        });

        return result;
    }

    /**
     *
     * @param Entity
     * @param tableName
     * @return {Array}
     */
    getFields(Entity, tableName) {
        let fields = [];

        lodash.forIn(
            Reflect.getMetadata('gluon.entity.fields', Entity),
            (metaDescription, fieldName) => {
                if (!(metaDescription.type.prototype instanceof PrimitiveType)) {
                    fields = fields.concat(this.getFields(metaDescription.type, tableName));
                } else if (!metaDescription.name) {
                    fields.push(tableName + '.' + this.namingConvention.columnNameFromFieldName(fieldName));
                } else {
                    fields.push(tableName + '.' + lodash.snakeCase(metaDescription.name));
                }
            }
        );

        let aggregations = Reflect.getMetadata('gluon.entity.aggregation', Entity) || {};

        lodash.forIn(aggregations, metadata => {

            let entityTable = Reflect.getMetadata('gluon.repository.database.table', metadata.entity);

            if (!entityTable) {
                entityTable = this.namingConvention.tableNameFromEntityName(metadata.entity.name);
            }

            fields = fields.concat(this.getFields(metadata.entity, entityTable));
        });

        return fields;
    }

    /**
     *
     * @param Entity
     */
    getRelationShips(Entity) {
        let aggregations = Reflect.getMetadata('gluon.entity.aggregation', Entity) || {};

        let directRelationShips = lodash.values(aggregations).map(metadata => {
            let thisEntityTable = Reflect.getMetadata('gluon.repository.database.table', Entity);

            if (!thisEntityTable) {
                thisEntityTable = this.namingConvention.tableNameFromEntityName(Entity.name);
            }

            let aggregatedEntityTable = Reflect.getMetadata('gluon.repository.database.table', metadata.entity);

            if (!aggregatedEntityTable) {
                aggregatedEntityTable = this.namingConvention.tableNameFromEntityName(metadata.entity.name)
            }

            let thisPK = this.getPk(Entity);
            let thatFK = metadata.name || this.namingConvention.fkNameFromTableAndIdColumn(thisEntityTable, thisPK);

            return {
                many  : metadata.many,
                pk    : thisEntityTable       + '.' + thisPK,
                fk    : aggregatedEntityTable + '.' + thatFK
            }
        });

        lodash.forIn(aggregations, metadata => {
           directRelationShips = directRelationShips.concat(this.getRelationShips(metadata.entity));
        });

        return directRelationShips;
    }

    /**
     * Get the primary key column name
     *
     * @param Entity
     * @return {*}
     */
    getPk(Entity) {
        let pkFieldKey =
            lodash.findKey(
                Reflect.getMetadata('gluon.entity.fields', Entity),
                metadata => metadata.type === PrimaryKey
            );

        if (!pkFieldKey) {
            throw new Error(`E_SCHEMA_READER: Could not make aggregation for entity [${Entity.name}], ` +
            'no [PrimaryKey] field type defined')
        }

        let pkMetadata = Reflect.getMetadata('gluon.entity.fields', Entity)[pkFieldKey];

        return pkMetadata.name || this.namingConvention.columnNameFromFieldName(pkFieldKey);
    }
}
