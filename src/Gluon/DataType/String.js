import PrimitiveType from "./PrimitiveType";

/**
 * @implements PrimitiveDataTypeInterface
 */
export default class String extends PrimitiveType {

    static async fromStorage(storageValue) {
        return storageValue.toString();
    }

    static async toStorage(modelValue) {
        return modelValue.toString();
    }
}
