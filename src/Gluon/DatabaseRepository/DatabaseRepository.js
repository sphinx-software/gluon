import lodash from "lodash";

/**
 * @implements RepositoryInterface
 */
export default class DatabaseRepository {

    queryScope  = null;

    usingScopes = [];

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
        // todo
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
    }

    // -----------------------------------------------------------------------------------------------------------------
    // query scope methods
    // -----------------------------------------------------------------------------------------------------------------
    setQueryScope(queryScope) {
        this.queryScope = queryScope;
        return this;
    }

    withScope(scopeName, ...scopeParameters) {
        this.usingScopes.push({scope: scopeName, parameters: scopeParameters});
        return this;
    }

    bootstrap() {
        this.bootstrapQueryScope();
        return this;
    }

    bootstrapQueryScope() {
        this.queryScope.getScopes()
            .map(scopeName => {
                let willBeMethodName = 'with' + lodash.upperFirst(lodash.camelCase(scopeName));

                // Check for property existence.
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

    makeQueryContext() {
        let context = this.queryScope.context(this.usingScopes);
        this.usingScopes = [];
        return context;
    }
}
