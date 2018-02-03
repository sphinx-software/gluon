import Value from "./Value";

/**
 * @implements DataTypeInterface
 */
export default class Timestamps extends Value {

    constructor(createdAt, updatedAt) {
        super();
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    toJson() {

    }

    static fromStorage(storageValue) {
        return new Date(parseInt(storageValue));
    }

    static toStorage(modelValue) {
        return modelValue.getTime();
    }
}
