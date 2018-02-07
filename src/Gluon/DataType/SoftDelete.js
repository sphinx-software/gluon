import PrimitiveType from "./PrimitiveType";

/**
 * @implements PrimitiveDataTypeInterface
 */
export default class SoftDelete extends PrimitiveType {
    static async fromStorage(storageValue) {
        return new Date(parseInt(storageValue));
    }

    static async toStorage(modelValue) {
        return modelValue.getTime();
    }
}
