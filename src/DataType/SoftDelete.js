import Value from "./Value";

/**
 * @implements DataTypeInterface
 */
export default class SoftDelete extends Value {
    static async fromStorage(storageValue) {
        return new Date(parseInt(storageValue));
    }

    static async toStorage(modelValue) {
        return modelValue.getTime();
    }
}
