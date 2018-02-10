/**
 * @implements RepositoryInterface
 */
export default class DatabaseRepository {

    writeConnection = null;

    readConnection  = null;

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

    async all() {
        let table = 'table';
        let query = this.scoper.decorate(this.readConnection.from(table));

        let rawResult  = await query;
        let entities   = await this.mapper.makeEntities(rawResult);

        return this.processors.process(entities);
    }

    first(condition) {

    }

    firstOrFail(condition, errorWhenFail) {

    }

    findOrFail(condition, errorWhenFail) {

    }

    getOrFail(identifier, errorWhenFail) {

    }

    setWriteConnection(connection) {
        this.writeConnection = connection;
        return this;
    }

    setReadConnection(connection) {
        this.readConnection = connection;
        return this;
    }
}
