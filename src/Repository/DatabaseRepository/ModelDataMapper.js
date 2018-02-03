import NamingConvention from "./NamingConvention";
import lodash from "lodash";

export default class ModelDataMapper {

    static map(row, fieldsSchema) {

        return lodash.mapValues(fieldsSchema, (fieldSchema, fieldName) => {

            let storageValue =
                fieldSchema.name.length ?
                    lodash.pick(row, fieldSchema.name) :
                    row[NamingConvention.columnName(fieldName)]
            ;

            if (storageValue === null) {
                return null;
            }

            return fieldSchema.type.fromStorage(storageValue);
        });
    }
}
