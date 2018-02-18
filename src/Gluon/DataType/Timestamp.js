import PrimitiveType from "./PrimitiveType";

/**
 * @implements DataTypeInterface
 */
export default class Timestamp extends Value {
    static async fromStorage(storageValue) {
        return new Date(parseInt(storageValue));
    }

    static async toStorage(modelValue) {
        return modelValue.getTime();
    }
}
