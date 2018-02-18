import lodash from "lodash";

/**
 * @implements RepositoryInterface
 */
export default class DatabaseRepository {

    queryScope  = null;

    usingScopes = [];

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
     * @param defaultEntityIfNotExisted
     * @return {Promise<*>}
     */
    async get(identifier, defaultEntityIfNotExisted = null) {

        let query = this.modelQueryBuilder
            .makeSelect(this.modelSchema, this.readConnection.query())
            .where(this.modelSchema.primaryKey, '=', identifier)
        ;

        // Apply the query scope
        this.makeQueryScopeContext().dispatch(query);

        // Execute the query
        let rowSet = await query;

        return rowSet.length ?
            await this.dataMapper.mapModel(rowSet, this.Model, this.modelSchema) :
            defaultEntityIfNotExisted
        ;
    }

    async getOrFail(identifier) {
        let entity = await this.get(identifier);

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
    // query scope methods
    // -----------------------------------------------------------------------------------------------------------------

    /**
     *
     * @param queryScope
     * @return {DatabaseRepository}
     */
    setQueryScope(queryScope) {
        this.queryScope = queryScope;
        return this;
    }

    /**
     *
     * @param scopeName
     * @param scopeParameters
     * @return {DatabaseRepository}
     */
    withScope(scopeName, ...scopeParameters) {
        this.usingScopes.push({scope: scopeName, parameters: scopeParameters});
        return this;
    }

    /**
     * Decorates new method for this repository
     */
    bootstrapQueryScope() {
        this.queryScope.getScopes()
            .map(scopeName => {
                let willBeMethodName = 'with' + lodash.upperFirst(lodash.camelCase(scopeName));

                // Check for property existence for avoiding
                // property name collision.
                if (Reflect.has(this, willBeMethodName)) {
                    throw new Error(
                        `E_QUERY_SCOPE_METHOD: Could not make new alias function for the query scope [${scopeName}]. `
                        + `Property [${willBeMethodName}] is already defined`
                    );
                }

                return {
                    scopeName  : scopeName,
                    methodName : willBeMethodName
                }
            })
            .forEach(willBeDecoratedMethods => {

                Reflect.defineProperty(this, willBeDecoratedMethods.methodName, {
                    value: (...parameter) => this.withScope(willBeDecoratedMethods.scopeName, ...parameter)
                })
            })
        ;
    }

    /**
     * Gets a query context with given query scopes
     * @return {QueryContext}
     */
    makeQueryScopeContext() {
        let context = this.queryScope.context(this.usingScopes);

        // Resets the scopes when get the context
        this.usingScopes = [];
        return context;
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
     *
     * @return {DatabaseRepository}
     */
    bootstrap() {
        this.bootstrapQueryScope();

        return this;
    }

    throwsEntityNotFound() {
        throw new Error(`E_ENTITY_NOT_FOUND: Entity not found`);
    }
}
