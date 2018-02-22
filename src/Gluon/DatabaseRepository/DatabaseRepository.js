import EntityNotFoundError from "../Entity/EntityNotFoundError";
import lodash from "lodash";

/**
 * @implements RepositoryInterface
 */
export default class DatabaseRepository {

    macroBuilder    = null;

    Model           = null;

    modelSchema     = {};

    aggregations    = [];

    // -----------------------------------------------------------------------------------------------------------------
    // implementation methods
    // -----------------------------------------------------------------------------------------------------------------

    create(modelProperties) {
        // todo
    }

    createBlindly(modelProperties) {
        // todo
    }

    save(model) {
        // todo
    }

    remove(identifier) {
        // todo
    }

    /**
     * Get all models
     *
     * @return {Promise<void>}
     */
    async all() {
        let macros   = this.macroBuilder.context();
        let entities = await this.engine.getMany(
            this.Model,
            this.modelSchema,
            query => macros.modifyQuery(query),
            this.getSpecifiedAggregations()
        );

        return macros.morphList(entities);
    }

    /**
     * Get a model by its identifier
     *
     * @param identifier
     * @return {Promise<*>}
     */
    async get(identifier) {

        let entity = await this.getOrNull(identifier);

        return entity || await this.returnWhenGetNull();
    }

    /**
     * Get a model by its identifier
     * If no models found, return a default value
     *
     * @param identifier
     * @param defaultWhenNull
     * @return {Promise<*>}
     */
    async getOrDefault(identifier, defaultWhenNull = null) {
        let entity = await this.getOrNull(identifier);

        return entity || defaultWhenNull;
    }

    /**
     * Get a model by its identifier
     * If no models found, return null
     *
     * @param identifier
     * @return {Promise<*>}
     */
    async getOrNull(identifier) {

        let macros = this.macroBuilder.context();
        let entity = await this.engine.getOne(
            this.Model,
            this.modelSchema,
            query => macros.modifyQuery(query.where(this.modelSchema.primaryKey, identifier)),
            this.getSpecifiedAggregations()
        );

        if (!entity) {
            return null;
        }

        return macros.morphOne(entity);
    }

    /**
     * Get a model by its identifier
     * If no models found, throw the entity not found error
     *
     * @param identifier
     * @return {Promise<*>}
     */
    async getOrFail(identifier) {
        let entity = await this.getOrNull(identifier);

        return entity || this.throwsEntityNotFound();
    }

    find(condition) {
        // todo
    }

    findOrFail(condition, errorWhenFail) {
        // todo
    }

    first(condition) {

    }

    firstOrFail(condition, errorWhenFail) {
        // todo
    }

    removeBlindly(identifier) {
        // todo
    }

    restore(identifier) {

    }

    restoreBlindly() {

    }


    // -----------------------------------------------------------------------------------------------------------------
    // Query macros
    // -----------------------------------------------------------------------------------------------------------------

    /**
     *
     * @param {MacroBuilder} macroBuilder
     * @return {DatabaseRepository}
     */
    setMacroBuilder(macroBuilder) {
        this.macroBuilder = macroBuilder;
        return this;
    }

    /**
     * Utility for initialize timestamps related macros
     */
    macroTimestamp() {
        this.macroBuilder
            .when('latest')
            .modifyQuery(query => query.orderBy(`${this.modelSchema.table}.updated_at`, 'desc'))
        ;

        this.macroBuilder
            .when('newest')
            .modifyQuery(query => query.orderBy(`${this.modelSchema.table}.created_at`, 'desc'))
        ;

        this.macroBuilder
            .when('earliest')
            .modifyQuery(query => query.orderBy(`${this.modelSchema.table}.updated_at`))
        ;

        this.macroBuilder
            .when('oldest')
            .modifyQuery(query => query.orderBy(`${this.modelSchema.table}.created_at`))
        ;

        return this;
    }

    /**
     * Utility for initialize soft delete behavior
     */
    macroSoftDelete() {
        this.macroBuilder
            .when('trashed')
            .modifyQuery(query => query.whereNotNull(`${this.modelSchema.table}.deleted_at`))
        ;

        this.macroBuilder
            .unless('trashed')
            .modifyQuery(query => query.whereNull(`${this.modelSchema.table}.deleted_at`))
        ;

        return this;
    }

    // -----------------------------------------------------------------------------------------------------------------
    // Model methods
    // -----------------------------------------------------------------------------------------------------------------

    /**
     *
     * @param Model
     * @param modelSchema
     */
    setModel(Model, modelSchema) {
        this.Model       = Model;
        this.modelSchema = modelSchema;

        return this;
    }

    /**
     *
     * @param engine
     * @return {DatabaseRepository}
     */
    setModelQueryEngine(engine) {
        this.engine = engine;

        return this;
    }


    // -----------------------------------------------------------------------------------------------------------------
    // Aggregation Methods
    // -----------------------------------------------------------------------------------------------------------------

    /**
     * Specify an aggregation that should be cast as eager
     *
     * @param aggregation
     * @return {DatabaseRepository}
     */
    with(aggregation) {
        this.aggregations.push(aggregation);
        return this;
    }

    /**
     * Get the specified aggregations given by the user
     *
     * @return {Array}
     */
    getSpecifiedAggregations() {
        let aggregations = this.aggregations;
        this.aggregations = [];
        return aggregations;
    }


    // -----------------------------------------------------------------------------------------------------------------
    // bootstrap methods
    // -----------------------------------------------------------------------------------------------------------------

    /**
     * Template method for bootstrapping a repository
     *
     */
    bootstrap() {
        this.macroBuilder.decorateRepositoryMethods(this);
    }

    /**
     * Template method for specifying the null response from
     * the get() method
     *
     * @return {Promise<*>}
     */
    async returnWhenGetNull() {
        return null;
    }

    /**
     * Throws the Entity not found error
     */
    throwsEntityNotFound() {
        throw new EntityNotFoundError(`E_ENTITY_NOT_FOUND: Entity not found`);
    }
}
