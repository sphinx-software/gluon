import Value from "./Value";

/**
 * @implements DataTypeInterface
 */
export default class String extends Value {

    static fromStorage(storageValue) {
        return storageValue.toString();
    }

    static toStorage(modelValue) {
        return modelValue.toString();
    }
}
