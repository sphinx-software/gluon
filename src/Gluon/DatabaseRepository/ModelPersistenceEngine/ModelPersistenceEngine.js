export default class ModelPersistenceEngine {

    connection   = null;

    container    = null;

    constructor(connection, mapper) {
        this.connection   = connection;
        this.mapper       = mapper;
    }

    async insert(json, schema) {
        /// todo
    }
}
