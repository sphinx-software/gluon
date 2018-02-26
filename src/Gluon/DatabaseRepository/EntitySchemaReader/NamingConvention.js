import lodash from 'lodash';
import pluralize from 'pluralize';

/**
 * Utility for converting the model metadata to the database related items
 */
export default class NamingConvention {

    tableNameFromEntityName(entityName) {
        return lodash.snakeCase(pluralize(entityName));
    }

    columnNameFromFieldName(fieldName) {
        return lodash.snakeCase(fieldName);
    }

    fkNameFromTableAndIdColumn(table, idColumn) {
        return table + '_' + idColumn;
    }
}
