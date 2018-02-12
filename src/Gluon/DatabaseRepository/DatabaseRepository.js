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

    get(identifier) {

    }

    findOrFail(condition, errorWhenFail) {
        // todo
    }

    first(condition) {
        // todo
    }

    firstOrFail(condition, errorWhenFail) {
        // todo
    }

    removeBlindly(identifier) {
        // todo
    }

    find(condition) {
        // todo
    }

    getOrFail(identifier, errorWhenFail) {
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
     * @param schemaReader
     * @return {DatabaseRepository}
     */
    setSchemaReader(schemaReader) {
        this.schemaReader = schemaReader;

        return this;
    }

    /**
     *
     * @param Model
     */
    setModel(Model) {
        this.Model = model;

        return this;
    }


    // -----------------------------------------------------------------------------------------------------------------
    // Database connections methods
    // -----------------------------------------------------------------------------------------------------------------

    /**
     *
     * @param read
     * @param write
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
}
