import Promise from "bluebird";
import lodash from "lodash";
import {PrimitiveType} from "Gluon";
import {EntitySchema} from "../Entity";

/**
 * This Mapper can maps a database rowSet into a collection of models & it's aggregation recursively
 */
export default class DataMapper {

    /**
     * We'll use the container as the basic model factory, so we can empower the DI feature for
     * the model.
     *
     * @param {Container} container
     */
    constructor(container) {
        this.container = container;
    }

    /**
     * Map the primitive values
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
     * Creates a model by its properties
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
     * Map a model without any aggregation
     *
     * @param {{}} databaseRow
     * @param {Function | constructor} Model
     * @param {{}} modelCreationReceipt
     * @return {Promise<{}>}
     */
    async mapModelWithoutAggregation(databaseRow, Model, modelCreationReceipt) {

        let modelProperties = await Promise.props(
            lodash.mapValues(modelCreationReceipt, (fieldDescription, fieldName) =>
                fieldDescription.type.prototype instanceof PrimitiveType ?
                    // If the type of the field is an inheritance of PrimitiveType
                    this.mapPrimitiveValues(databaseRow, fieldDescription, Model, fieldName) :
                    // otherwise, we'll re-map the type as an model recursively
                    this.mapModelWithoutAggregation(databaseRow, fieldDescription.type, fieldDescription.name)
            ));

        return await this.factoryModel(modelProperties, Model)
    }

    /**
     * Map models with its related databaseRowSet.
     *
     * @param databaseRowSet
     * @param Model
     * @param schema
     * @return {Promise<*>}
     */
    mapModels(databaseRowSet, Model, schema) {

        // Distinct the rowSet by the aggregated model id:
        let primaryKeyColumn = schema.primaryKey;

        if (!primaryKeyColumn) {
            throw new Error(`E_DATA_MAPPER: Could not map data of non-primary key entity.` +
                ` Entity [${Model.name}] does not have [PrimaryKey] field type`
            );
        }

        // We'll use the chunking strategy for solving deep aggregated models
        // First, we'll group the current databaseRowSet by the models identifier
        let groupedRecordsByPk = lodash.groupBy(databaseRowSet, row => row[primaryKeyColumn]);

        // Then we'll try to build each one of them, and repeat the steps recursively with aggregations
        let mappingPromises = lodash.values(groupedRecordsByPk)
            .map(groupedRowSet => this.mapModel(groupedRowSet, Model, schema))
        ;


        return Promise.all(mappingPromises);
    }

    /**
     * Recursively map a single model with aggregation.
     * Every single row in the databaseRowSet must refer to one unique Model.
     *
     * @param databaseRowSet
     * @param Model
     * @param schema
     * @return {Promise<{}>}
     */
    async mapModel(databaseRowSet, Model, schema) {

        // In this situation, every rowSet is referring to one unique model.
        // So for mapping itself without aggregation, we can blindly pick the first row
        let databaseRow = databaseRowSet[0];

        let model = await this.mapModelWithoutAggregation(databaseRow, Model, schema.fields);

        model.schema.unguard();

        await Promise.props(lodash.mapValues(schema.eagerAggregations, async(aggregationSchema, modelPropertyName) => {

            let aggregatedResult = await this.mapModels(
                databaseRowSet, aggregationSchema.entity, aggregationSchema.schema
            );

            let aggregatedModelValue = aggregationSchema.many ? aggregatedResult : (aggregatedResult[0] || null);

            model[modelPropertyName] = () => Promise.resolve(aggregatedModelValue);

            // Treat the toJson behavior of the entity,
            // since the aggregated model is built, we'll tell the schema to displays
            // the aggregated values too.
            model.schema.setVirtual(modelPropertyName, aggregatedModelValue);
        }));

        model.schema.guard();

        return model;
    }
}
