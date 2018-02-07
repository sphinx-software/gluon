import PrimitiveType from "./PrimitiveType";

/**
 * @implements PrimitiveDataTypeInterface
 */
export default class Float extends PrimitiveType {
    static async fromStorage(storageValue) {
        return parseFloat(storageValue);
    }

    static async toStorage(modelValue) {
        return modelValue;
    }
}
