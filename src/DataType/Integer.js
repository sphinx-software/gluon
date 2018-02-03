import Value from "./Value";

/**
 * @implements DataTypeInterface
 */
export default class Integer extends Value {
    static fromStorage(storageValue) {
        return parseInt(storageValue);
    }

    static toStorage(modelValue) {
        return modelValue;
    }
}
