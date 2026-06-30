import BaseComponent from 'components/base-component';
import $ from 'jquery';
import globalEmitter from 'modules/global-emitter';

class ResponsiveTableComponent extends BaseComponent {
    constructor() {
        super();

        this.defaultOptions = {
            tableSelector: 'table',
            defaultColumnHeading: '',
            fixedTableAttr: 'data-table-fixed',
            cellHeaderAttr: 'data-cell-header',
            tableHeaderCellsSelector: 'thead > tr > th, thead > tr > td',
            tableWrapperMarkup: '<div class="e-responsive-table"></div>',
            tableWrapperMarkupFixed: '<div class="e-responsive-table e-responsive-table--fixed"></div>',
            wrapperClass: 'e-responsive-table',
        };
    }

    initChildren() {
        this.$responsiveTable = this.$el.find(this.options.tableSelector);
    }

    addListeners() {
        this._tableWrap();

        globalEmitter.on('dynamictable:updated', this._reInit.bind(this));
    }

    _reInit() {
        this.$responsiveTable = this.$el.find(this.options.tableSelector);

        this._tableWrap();
    }

    _tableWrap() {
        const self = this;

        this.$responsiveTable.each(function() {
            /* eslint-disable-next-line no-invalid-this */
            const $table = $(this);

            if ($table.parent(`.${self.options.wrapperClass}`).length > 0) {
                return;
            }

            if ($table[0].hasAttribute(self.options.fixedTableAttr)) {
                $table.wrap(self.options.tableWrapperMarkupFixed);
            } else {
                $table.wrap(self.options.tableWrapperMarkup);
            }

            const ths = $($table).find(self.options.tableHeaderCellsSelector).map((i, th) => {
                return $(th).text();
            });

            for (let r = 0; r < $table[0].rows.length; r++) {
                const row = $table[0].rows[r];

                for (let c = 0; c < row.cells.length; c++) {
                    const col = row.cells[c];

                    if (col.tagName === 'TD') {
                        const th = ths[c];
                        const cellHeader = typeof th !== 'undefined' ? `${th}:` : self.options.defaultColumnHeading;

                        $(col).attr(self.options.cellHeaderAttr, `${cellHeader}`);
                    }
                }
            }
        });
    }
}

export default () => {
    return new ResponsiveTableComponent();
};
