/**
 * @interface PrimitiveDataTypeInterface
 */
export class PrimitiveDataTypeInterface {

    /**
     * Convert data from storage
     *
     * @param storageForm
     * @return {*}
     */
    static fromStorage(storageForm) { }

    /**
     * Convert data to storage
     *
     * @param modelForm
     * @return {*}
     */
    static toStorage(modelForm) { }
}

/**
 * @interface QueryableInterface
 */
export class QueryableInterface {

    /**
     *
     * @param query
     */
    apply(query) { }
}


/**
 * @interface RepositoryInterface
 */
export class RepositoryInterface {

    /**
     * Find models by a given condition
     *
     * @param {QueryableInterface|function} condition
     * @return {Promise<[]>}
     */
    async find(condition) { }

    /**
     * Find a model by a given condition
     *
     * @param {QueryableInterface|function} condition
     * @return {Promise<{}>}
     */
    async first(condition) { }

    /**
     *
     * @param {QueryableInterface|function} condition
     * @return {Promise<{}>}
     */
    async firstOrFail(condition) { }

    /**
     * Get a model by its identifier
     *
     * @param identifier
     * @return {Promise<{}>}
     */
    async get(identifier) { }

    /**
     *
     * @param identifier
     * @return {Promise<{}>}
     */
    async getOrFail(identifier) { }

    /**
     * Get all models from this repository
     * @return {Promise<[]>}
     */
    async all() { }

    /**
     * Create a new model in this repository and
     * returns its instance
     *
     * @param {*} modelProperties
     * @return {Promise<{}>}
     */
    async create(modelProperties) { }

    /**
     * Create a new model in this repository, but does
     * not returns any model
     *
     * @param modelProperties
     * @return {Promise<void>}
     */
    async createBlindly(modelProperties) { }

    /**
     * Save a model into this repository (perform update)
     *
     * @param {{}} model
     */
    async save(model) { }

    /**
     * Remove a model by its identifier.
     * And return the removed model
     *
     * @param identifier
     * @return {Promise<{}>}
     */
    async remove(identifier) { }

    /**
     * Remove a model by its identifier.
     * And return the removed model
     *
     * @param identifier
     * @return {Promise<{}>}
     */
    async removeBlindly(identifier) { }
}
