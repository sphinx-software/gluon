import Value from "./Value";

/**
 * @implements DataTypeInterface
 */
export default class Timestamps extends Value {

    /**
     *
     * @param {Date|null} createdAt
     * @param {Date|null} updatedAt
     */
    constructor(createdAt, updatedAt) {
        super();
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    /**
     *
     * @return {Date|null}
     */
    getCreatedAt() {
        return this.createdAt;
    }

    /**
     *
     * @return {Date|null}
     */
    getUpdatedAt() {
        return this.updatedAt;
    }

    /**
     *
     * @return {{createdAt: Date|null, updatedAt: Date|null}}
     */
    toJson() {
        return {
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        }
    }

    /**
     *
     * @param {Array} value
     * @return {Timestamps}
     */
    static fromStorage(value) {
        return new Timestamps(
            value[0] ? new Date(value[0]) : null,
            value[1] ? new Date(value[1]) : null
        );
    }

    /**
     *
     * @param {Timestamps} modelValue
     * @return {Array}
     */
    static toStorage(modelValue) {
        return [
            modelValue.getCreatedAt() ? modelValue.getCreatedAt().getTime() : null,
            modelValue.getUpdatedAt() ? modelValue.getUpdatedAt().getTime() : null
        ]
    }
}
