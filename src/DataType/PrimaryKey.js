import Value from "./Value";

/**
 * @implements DataTypeInterface
 */
export default class PrimaryKey extends Value {

    static async fromStorage(storageValue) {
        return parseInt(storageValue);
    }

    static async toStorage(modelValue) {
        return modelValue;
    }
}
