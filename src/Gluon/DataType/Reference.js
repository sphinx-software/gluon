import PrimitiveType from "./PrimitiveType";

/**
 * @implements PrimitiveDataTypeInterface
 */
export default class Reference extends PrimitiveType {

    /**
     * @private
     *
     * @type {*}
     */
    identity = null;

    /**
     *
     * @param {*} identity
     */
    constructor(identity) {
        super();
        this.identity = identity;
    }

    /**
     *
     * @param {RepositoryInterface} repository
     * @return {Promise<{}>}
     */
    load(repository) {
        return repository.get(this.identity);
    }

    /**
     *
     * @param {RepositoryInterface} repository
     * @return {Promise<{}>}
     */
    loadOrFail(repository) {
        return repository.getOrFail(this.identity);
    }

    /**
     *
     * @return {*}
     */
    getIdentity() {
        return this.identity;
    }

    /**
     *
     * @return {{}}
     */
    toJson() {
        return {
            _         : 'GLUON_REFERENCE',
            reference : this.constructor.name,
            identity  : this.getIdentity()
        };
    }

    /**
     *
     * @param json
     * @return {Reference}
     */
    static fromJson(json) {
        return new this(json.identity);
    }

    /**
     * @abstract
     * @param storageValue
     * @return {Promise<Reference>}
     */
    static async fromStorage(storageValue) {
        return new this(parseInt(storageValue) || storageValue);
    }

    /**
     * @abstract
     * @param {Reference} modelValue
     * @return {Promise<*>}
     */
    static async toStorage(modelValue) {
        return modelValue.getIdentity();
    }
}
