import Value from "./Value";

/**
 * @implements DataTypeInterface
 */
export default class Float extends Value {
    static async fromStorage(storageValue) {
        return parseFloat(storageValue);
    }

    static async toStorage(modelValue) {
        return modelValue;
    }
}
