import EntityNotFoundError from "../Entity/EntityNotFoundError";
import lodash from "lodash";

/**
 * @implements RepositoryInterface
 */
export default class DatabaseRepository {

    macroBuilder    = null;

    readConnection  = null;

    writeConnection = null;

    schemaReader    = null;

    Model           = null;

    modelSchema     = {};

    dataMapper        = null;

    modelQueryBuilder = null;

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

    all() {
        // todo
    }

    /**
     * Get a model by its identifier
     *
     * @param identifier
     * @return {Promise<*>}
     */
    async get(identifier) {

        let entity = await this.getOrNull(identifier);

        return entity || this.returnWhenGetNull();
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

        let query = this.modelQueryBuilder
            .makeSelect(this.modelSchema, this.readConnection.query())
            .where(this.modelSchema.primaryKey, '=', identifier)
        ;

        // Apply the query scope
        let macros = this.macroBuilder.context();

        macros.modifyQuery(query);

        // Execute the query
        let rowSet = await query;

        let entity = rowSet.length ?
            await this.dataMapper.mapModel(rowSet, this.Model, this.modelSchema) : null
        ;

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

        if (!entity) {
            this.throwsEntityNotFound();
        }

        return entity;
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
     * @param {ModelQueryBuilder} modelQueryBuilder
     * @return {DatabaseRepository}
     */
    setModelQueryBuilder(modelQueryBuilder) {
        this.modelQueryBuilder = modelQueryBuilder;

        return this;
    }

    /**
     *
     * @param {EntitySchemaReader} reader
     * @return {DatabaseRepository}
     */
    setSchemaReader(reader) {
        this.schemaReader = reader;

        return this;
    }

    /**
     *
     * @param {DataMapper} mapper
     * @return {DatabaseRepository}
     */
    setDataMapper(mapper) {
        this.dataMapper = mapper;

        return this;
    }

    /**
     *
     * @param Model
     */
    setModel(Model) {
        this.Model       = Model;
        this.modelSchema = this.schemaReader.read(Model);

        return this;
    }


    // -----------------------------------------------------------------------------------------------------------------
    // Database connections methods
    // -----------------------------------------------------------------------------------------------------------------

    /**
     *
     * @param {DatabaseConnectionInterface} read
     * @param {DatabaseConnectionInterface} write
     * @return {DatabaseRepository}
     */
    setConnection(read, write) {
        this.readConnection  = read;
        this.writeConnection = write;

        return this;
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
