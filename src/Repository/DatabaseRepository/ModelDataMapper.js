import NamingConvention from "./NamingConvention";
import Promise from "bluebird";
import lodash from "lodash";

export default class ModelDataMapper {

    static async map(row, fieldsSchema, container) {

        return Promise.props(lodash.mapValues(fieldsSchema, (fieldSchema, fieldName) => {

            let storageValue =
                fieldSchema.name.length ?
                    fieldSchema.name.map(name => row[name]) :
                    row[NamingConvention.columnName(fieldName)]
            ;

            if (storageValue === null) {
                return null;
            }

            return fieldSchema.type.fromStorage(storageValue, container);
        }));
    }
}
