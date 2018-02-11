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

    /**
     *
     *
     * @param fieldName
     * @param columnName
     * @param databaseRow
     * @param Type
     * @return {Promise<*>}
     */
    async mapPrimitiveValues(fieldName, columnName, databaseRow, Type) {
        if(lodash.isUndefined(databaseRow[columnName])) {
            throw new Error(`E_DATA_MAPPER: Invalid row result passed to data mapper. ` +
                `Could not map field [${fieldName}] of model [${EntitySchema.name}], ` +
                `row result from database does not have column [${columnName}]`
            );

        }
        return Type.fromStorage(databaseRow[columnName]);
    }

    /**
     *
     *
     * @param modelProperties
     * @param Model
     * @return {Promise<*>}
     */
    async factoryModel(modelProperties, Model) {
        let model = await this.container.make(Model);
        let proxiedModel = EntitySchema.applyFor(model);

        proxiedModel.schema.unguard();
        proxiedModel.setFields(modelProperties);
        proxiedModel.schema.guard();

        return proxiedModel;
    }

    /**
     *
     * @param databaseRow
     * @param Model
     * @return {Promise<*>}
     */
    async mapModel(databaseRow, Model) {

        let schemaInspection = EntitySchema.inspect(Model);
        let modelProperties  = await Promise.props(
            lodash.mapValues(schemaInspection[0], (fieldDescription, fieldName) => {

                let columnName = fieldDescription.name ||
                    this.namingConvention.columnNameFromFieldName(fieldName);

                return fieldDescription.type.prototype instanceof PrimitiveType ?
                    // If the type of the field is an inheritance of PrimitiveType
                    this.mapPrimitiveValues(fieldName, columnName, databaseRow, fieldDescription.type) :
                    // otherwise, we'll remap the type as an model
                    this.mapModel(databaseRow, fieldDescription.type);
            }
        ));

        return await this.factoryModel(modelProperties, Model);
    }
}
