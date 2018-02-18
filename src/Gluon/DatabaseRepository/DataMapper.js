import Promise from "bluebird";
import lodash from "lodash";
import {PrimitiveType} from "Gluon";
import {model, EntitySchema} from "../Entity";

export default class DataMapper {

    /**
     *
     * @param {Container} container
     */
    constructor(container) {
        this.container = container;
    }

    /**
     *
     *
     * @param databaseRow
     * @param fieldDescription
     * @param EntitySchema
     * @param fieldName
     * @return {Promise<*>}
     */
    async mapPrimitiveValues(databaseRow, fieldDescription, EntitySchema, fieldName) {
        if(lodash.isUndefined(databaseRow[fieldDescription.name])) {
            throw new Error(`E_DATA_MAPPER: Invalid row result passed to data mapper. ` +
                `Could not map field [${fieldName}] of model [${EntitySchema.name}], ` +
                `row result from database does not have column [${fieldDescription.name}]`
            );

        }
        return fieldDescription.type.fromStorage(databaseRow[fieldDescription.name]);
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
     * @param databaseRowSet
     * @param Model
     * @param modelCreationReceipt
     * @return {Promise<*>}
     */
    async mapModel(databaseRowSet, Model, modelCreationReceipt) {

        // We don't care if the databaseRowSet has more than 1 length, since that case should be handled by
        // aggregation. We'll assuming that every "main" model's field should be the same in each row, so
        // we'll pick the first one is enough.
        let databaseRow = databaseRowSet[0];


        let modelProperties = await Promise.props(
            lodash.mapValues(modelCreationReceipt, (fieldDescription, fieldName) => {
                return fieldDescription.type.prototype instanceof PrimitiveType ?
                    // If the type of the field is an inheritance of PrimitiveType
                    this.mapPrimitiveValues(databaseRow, fieldDescription, Model, fieldName) :
                    // otherwise, we'll remap the type as an model
                    this.mapModel(databaseRowSet, fieldDescription.type, fieldDescription.name);
            }
        ));

        return await this.factoryModel(modelProperties, Model);
    }
}
