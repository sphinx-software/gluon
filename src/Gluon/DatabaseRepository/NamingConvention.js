import lodash from 'lodash';
import pluralize from 'pluralize';

/**
 * Utility for convert the model metadata to the database
 * Using naming convention
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
