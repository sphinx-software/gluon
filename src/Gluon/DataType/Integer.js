import PrimitiveType from "./PrimitiveType";

/**
 * @implements PrimitiveDataTypeInterface
 */
export default class Integer extends PrimitiveType {
    static async fromStorage(storageValue) {
        return parseInt(storageValue);
    }

    static async toStorage(modelValue) {
        return modelValue;
    }
}
