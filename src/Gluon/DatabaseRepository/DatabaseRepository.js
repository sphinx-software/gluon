/**
 * @implements RepositoryInterface
 */
export default class DatabaseRepository {

    writeConnection = null;

    readConnection  = null;

    responseProcessors = [];

    async remove(identifier) {
    }

    async create(modelProperties) {

    }

    removeBlindly(identifier) {

    }

    createBlindly(modelProperties) {

    }

    save(model) {

    }

    find(condition) {

    }

    get(identifier) {

    }

    all() {

    }

    first(condition) {

    }

    firstOrFail(condition, errorWhenFail) {

    }

    findOrFail(condition, errorWhenFail) {

    }

    getOrFail(identifier, errorWhenFail) {

    }

    registerQueryScope(name, queryScope, useAsDefaultScope = false) {
        this.queryScopes[name] = queryScope;
        return this;
    }

    registerResponseProcessor(processor) {
        this.responseProcessors.push(processor);
        return this;
    }

    setWriteConnection(connection) {
        this.writeConnection = connection;
        return this;
    }

    setReadConnection(connection) {
        this.readConnection = connection;
        return this;
    }

    /**
     *
     * @param {QueryScopeSyntax} queryScopeSyntax
     */
    scope(queryScopeSyntax) {

    }

    static read(connectionName) {

    }

    static write(connectionName) {

    }

    static connection() {

    }

    static databaseRepository(Model) {

    }

    static table() {

    }
}
