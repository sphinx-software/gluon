import Value from "./Value";

/**
 * @implements DataTypeInterface
 */
export default class Float extends Value {
    static fromStorage(storageValue) {
        return parseFloat(storageValue);
    }

    static toStorage(modelValue) {
        return modelValue;
    }
}
