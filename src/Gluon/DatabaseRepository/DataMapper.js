import NamingConvention from "./NamingConvention";
import Promise from "bluebird";
import lodash from "lodash";
import {EntitySchema, PrimitiveType} from "Gluon";

export default class DataMapper {

    /**
     *
     * @param {NamingConvention} namingConvention
     * @param {Container} container
     */
    constructor(namingConvention, container) {
        this.namingConvention = namingConvention;
        this.container        = container;
    }

    async mapPrimitiveValues(columnName, databaseRow, Type) {
        if(lodash.isUndefined(databaseRow[columnName])) {
            throw new Error(`E_DATA_MAPPER: Invalid row result passed to data mapper. ` +
                `Could not map field [${fieldName}] of model [${EntitySchema.name}], ` +
                `row result from database does not have field [${columnName}]`
            );

        }
        return Type.fromStorage(databaseRow[columnName]);
    }

    async mapModel(databaseRow, Model) {
        let model = await this.container.make(Model);

        let schemaInspection = EntitySchema.inspect(Model);

        let modelProperties = await Promise.props(lodash.mapValues(schemaInspection[0], (fieldDescription, fieldName) =>
            fieldDescription.type.prototype instanceof PrimitiveType ?
                // If the type of the field is an inheritance of PrimitiveType
                this.mapPrimitiveValues(
                    fieldDescription.name ||
                    this.namingConvention.columnNameFromFieldName(fieldName), databaseRow,fieldDescription.type

                    // otherwise, we'll remap the type as an model
                ) : this.mapModel(databaseRow, fieldDescription.type)
        ));

        let proxiedModel = EntitySchema.applyFor(model);

        proxiedModel.schema.unguard();
        proxiedModel.setFields(modelProperties);
        proxiedModel.schema.guard();

        return proxiedModel;
    }

    async mapDatabase(model) {

    }
}