import Value from "./Value";

/**
 * @implements DataTypeInterface
 */
export default class DateTime extends Value {
    static async fromStorage(storageValue) {
        return new Date(storageValue);
    }

    static async toStorage(modelValue) {
        return modelValue.toISOString();
    }
}
