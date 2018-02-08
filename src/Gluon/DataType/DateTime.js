import PrimitiveType from "./PrimitiveType";

/**
 * @implements PrimitiveDataTypeInterface
 */
export default class DateTime extends PrimitiveType {
    static async fromStorage(storageValue) {
        return new Date(storageValue);
    }

    static async toStorage(modelValue) {
        return modelValue.toISOString();
    }
}
