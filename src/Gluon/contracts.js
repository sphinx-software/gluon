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
 * @interface QueryableInterface
 */
export class QueryableInterface {

    /**
     *
     * @param query
     */
    decorate(query) { }
}


/**
 * @interface RepositoryInterface
 */
export class RepositoryInterface {

    /**
     * Find models by a given condition
     *
     * @param {QueryableInterface} condition
     * @return {Promise<[]>}
     */
    async find(condition) { }

    /**
     *
     * @param {QueryableInterface} condition
     * @param errorWhenFail
     * @return {Promise<void>}
     */
    async findOrFail(condition, errorWhenFail = null) { }

    /**
     * Find a model by a given condition
     *
     * @param {QueryableInterface} condition
     * @return {Promise<{}>}
     */
    async first(condition) { }

    /**
     *
     * @param {QueryableInterface} condition
     * @param errorWhenFail
     * @return {Promise<void>}
     */
    async firstOrFail(condition, errorWhenFail = null) { }

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
     * @param errorWhenFail
     * @return {Promise<{}>}
     */
    async getOrFail(identifier, errorWhenFail = null) { }

    /**
     * Get all models from this repository
     * @return {Promise<{}[]>}
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
