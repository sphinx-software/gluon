import Value from "./Value";

/**
 * @implements DataTypeInterface
 */
export default class Json extends Value {
    static fromStorage(storageValue) {
        return JSON.parse(storageValue);
    }

    static toStorage(modelValue) {
        return JSON.stringify(modelValue);
    }
}
