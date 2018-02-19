import PrimitiveType from "./PrimitiveType";

/**
 * @implements PrimitiveDataTypeInterface
 */
export default class String extends PrimitiveType {

    static async fromStorage(storageValue) {
        if (null === storageValue) {
            return '';
        }
        return storageValue.toString();
    }

    static async toStorage(modelValue) {
        if (null === modelValue) {
            return '';
        }
        return modelValue.toString();
    }
}
