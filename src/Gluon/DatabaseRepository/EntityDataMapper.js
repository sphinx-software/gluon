import NamingConvention from "./NamingConvention";
import Promise from "bluebird";
import lodash from "lodash";

export default class EntityDataMapper {

    /**
     * Map a row record into the entity form
     *
     * @param {{}} row
     * @param {{}} fieldsSchema
     * @param {{Container}} container
     * @return {Promise<Entity>}
     */
    static toEntity(row, fieldsSchema, container) {

        return Promise.props(lodash.mapValues(fieldsSchema, (fieldSchema, fieldName) => {

            let storageValue = null;

            if (fieldSchema.name.length === 0) {
                storageValue = row[NamingConvention.columnName(fieldName)];
            } else if (fieldSchema.name.length === 1) {
                // Field alias only
                storageValue = row[NamingConvention.columnName(fieldSchema.name[0])];
            } else {
                storageValue = fieldSchema.name.map(name => row[name]);
            }

            if (storageValue === null) {
                return null;
            }

            return fieldSchema.type.fromStorage(storageValue, container);
        }));
    }

    /**
     * Map an entity into a row record
     *
     * @param {{}} entityProperties
     * @param {{}} fieldsSchema
     * @param {{Container}} container
     * @return {*}
     */
    static toDatabaseStorage(entityProperties, fieldsSchema, container) {

        let storageData = {};

        lodash.forIn(fieldsSchema, (fieldSchema, fieldName) => {
            let fieldValue = entityProperties[fieldName];

            if (!fieldValue) {
                return null;
            }

            let storageValue = fieldSchema.type.toStorage(fieldValue, container);

            /// If the field is not a composite one.
            if (!fieldsSchema[fieldName].name.length) {
                /// We'll map once
                storageData[NamingConvention.columnName(fieldName)] = storageValue;
            } else if (fieldsSchema[fieldName].name.length === 1) {
                // If only one field name, then the field configuration should be about the field alias
                storageData[NamingConvention.columnName(fieldsSchema[fieldName].name[0])] = storageValue;
            } else {
                fieldSchema.name.forEach((fieldName, index) => {
                    storageData[NamingConvention.columnName(fieldName)] = storageValue.then(resultSet => resultSet[index]);
                })
            }
        });

        return Promise.props(storageData);
    }
}
