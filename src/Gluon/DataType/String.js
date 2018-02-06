import Value from "./Value";

/**
 * @implements DataTypeInterface
 */
export default class String extends Value {

    static async fromStorage(storageValue) {
        return storageValue.toString();
    }

    static async toStorage(modelValue) {
        return modelValue.toString();
    }
}
