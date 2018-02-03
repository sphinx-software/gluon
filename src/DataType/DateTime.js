import Value from "./Value";

/**
 * @implements DataTypeInterface
 */
export default class DateTime extends Value {
    static fromStorage(storageValue) {
        return new Date(storageValue);
    }

    static toStorage(modelValue) {
        return modelValue.toISOString();
    }
}
