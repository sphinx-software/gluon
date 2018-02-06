import Value from "./Value";

/**
 * @implements DataTypeInterface
 */
export default class Integer extends Value {
    static async fromStorage(storageValue) {
        return parseInt(storageValue);
    }

    static async toStorage(modelValue) {
        return modelValue;
    }
}
