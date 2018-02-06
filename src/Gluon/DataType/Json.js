import Value from "./Value";

/**
 * @implements DataTypeInterface
 */
export default class Json extends Value {
    static async fromStorage(storageValue) {
        return JSON.parse(storageValue);
    }

    static async toStorage(modelValue) {
        return JSON.stringify(modelValue);
    }
}
