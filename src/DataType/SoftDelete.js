import Value from "./Value";

/**
 * @implements DataTypeInterface
 */
export default class SoftDelete extends Value {
    static fromStorage(storageValue) {
        return new Date(parseInt(storageValue));
    }

    static toStorage(modelValue) {
        return modelValue.getTime();
    }
}
