/**
 * @interface DataTypeInterface
 */
export class DataTypeInterface {

    /**
     * Convert data from storage
     *
     * @param storageForm
     * @return {*}
     */
    static sfromStorage(storageForm) { }

    /**
     * Convert data to storage
     *
     * @param modelForm
     * @return {*}
     */
    static toStorage(modelForm) { }
}

/**
 * @interface
 */
export class QueryableInterface {

    /**
     *
     * @param query
     */
    decorate(query) { }
}


/**
 * @interface
 */
export class RepositoryInterface {

    /**
     * Find models by a given condition
     *
     * @param condition
     * @return {Promise<Entity[]>}
     */
    async find(condition) { }

    /**
     * Get a model by its identifier
     *
     * @param identifier
     * @return {Promise<Entity>}
     */
    async get(identifier) { }

    /**
     * Get all models from this repository
     * @return {Promise<Entity[]>}
     */
    async all() { }

    /**
     * Create a new model in this repository and
     * returns its instance
     *
     * @param {*} modelProperties
     * @return {Promise<Entity>}
     */
    async create(modelProperties) { }

    /**
     * Save a model into this repository (perform update)
     *
     * @param {Entity} model
     */
    async save(model) { }

    /**
     * Remove a model by its identifier.
     * And return the removed model
     *
     * @param identifier
     * @return {Promise<Entity>}
     */
    async remove(identifier) { }
}
