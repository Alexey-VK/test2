(function () {
  // Create the connector object
  const myConnector = tableau.makeConnector();

  // Define the schema
  myConnector.getSchema = function (schemaCallback) {
    const cols = [{
      id: 'id',
      dataType: tableau.dataTypeEnum.int,
    },
    {
      id: 'login',
      dataType: tableau.dataTypeEnum.string,
    },
    {
      id: 'name',
      dataType: tableau.dataTypeEnum.string,
    },
    {
      id: 'surname',
      dataType: tableau.dataTypeEnum.string,
    },
    {
      id: 'date',
      alias: 'Year and month',
      dataType: tableau.dataTypeEnum.string,
    },
    {
      id: 'currency',
      alias: 'Salary currency of employee',
      dataType: tableau.dataTypeEnum.string,
    },
    {
      id: 'efforts',
      alias: 'efforts',
      dataType: tableau.dataTypeEnum.int,
    },
    {
      id: 'overpaid',
      alias: 'overpaid',
      dataType: tableau.dataTypeEnum.int,
    },
    {
      id: 'salary',
      alias: 'salary',
      dataType: tableau.dataTypeEnum.string,
    },
    {
      id: 'vacation_pays',
      alias: 'vacation_pays',
      dataType: tableau.dataTypeEnum.string,
    },
    {
      id: 'bonus',
      alias: 'bonus',
      dataType: tableau.dataTypeEnum.string,
    },
    {
      id: 'sick_pay',
      alias: 'sick_pay',
      dataType: tableau.dataTypeEnum.string,
    },
    {
      id: 'medical_pay',
      alias: 'medical_pay',
      dataType: tableau.dataTypeEnum.string,
    },
    {
      id: 'benefit',
      alias: 'benefit',
      dataType: tableau.dataTypeEnum.string,
    },
    {
      id: 'extra',
      alias: 'extra',
      dataType: tableau.dataTypeEnum.string,
    },
    {
      id: 'total',
      alias: 'total',
      dataType: tableau.dataTypeEnum.string,
    },
    {
      id: 'credit',
      alias: 'credit',
      dataType: tableau.dataTypeEnum.string,
    },
    {
      id: 'prepayment',
      alias: 'prepayment',
      dataType: tableau.dataTypeEnum.string,
    },
    {
      id: 'inc_1',
      alias: 'inc_1',
      dataType: tableau.dataTypeEnum.string,
    },
    {
      id: 'inc_2',
      alias: 'inc_2',
      dataType: tableau.dataTypeEnum.string,
    },
    {
      id: 'inc_overpaid',
      alias: 'inc_overpaid',
      dataType: tableau.dataTypeEnum.string,
    },
    {
      id: 'cards_1',
      alias: 'cards_1',
      dataType: tableau.dataTypeEnum.string,
    },
    {
      id: 'cards_2',
      alias: 'cards_2',
      dataType: tableau.dataTypeEnum.string,
    },
    {
      id: 'cards_3',
      alias: 'cards_3',
      dataType: tableau.dataTypeEnum.string,
    },
    {
      id: 'cards_4',
      alias: 'cards_4',
      dataType: tableau.dataTypeEnum.string,
    },
    ];

    const tableSchema = {
      id: 'Salary_Viewer',
      alias: 'Salary viewer',
      columns: cols,
    };

    schemaCallback([tableSchema]);
  };

  const API_KEY = '123';
  const BASE_URL = `https://sv-dev.noveogroup.com/api/getPayments?token=${API_KEY}&`;
  // var BASE_URL ='../json/SalaryViewerConnectionData.json';

  const MONTH_MAP = [
    'jan',
    'feb',
    'mar',
    'apr',
    'may',
    'jun',
    'jul',
    'aug',
    'sep',
    'oct',
    'nov',
    'dec',
  ];

  /**
   * Создает URL адрес для получения статистики за текущий промежуток.
   * @param {string} startDate
   * @param {string} endDate
   */
  const createURL = (startDate, endDate) => `${BASE_URL}startDate=${startDate}&endDate=${endDate}`;
  // const createURL = () => `${BASE_URL}`;

  /**
   * Возвращает строковый вариант месяца по его порядковому номеру
   * @param {number} number
   */
  // const getMonthIdByNumber = (number) => MONTH_MAP[number - 1];
  const getNumberByMonth = (month) => MONTH_MAP.indexOf(month) + 1;

  /**
   *
   * @param {object} row - Объект проекта, полученный из JSON.
   * @param {{
   *  year: number,
   *  month: number,
   *  yearIndex: number,
   * }} dateObject
   */
  const transformToTableRows = (row, targetArray) => {
    const {
      id, login, name, surname, payments,
    } = row;

    if (payments) {
      for (const year in payments) {
        for (const month in payments[year]) {
          const {
            currency, efforts, overpaid, credit, accrued, paid_llc, paid_inc,
          } = payments[year][month];
          const {
            benefit, bonus, extra, medical_pay, salary, sick_pay, total, vacation_pays,
          } = accrued;
          const {
            cards_1, cards_2, cards_3, cards_4,
          } = paid_llc;
          const {
            inc_1, inc_2, inc_overpaid, prepayment,
          } = paid_inc;
          const monthNum = getNumberByMonth(month);
          const date = `${year}-${monthNum < 10 ? `0${monthNum}` : monthNum}-01`;

          const tRow = {
            id,
            login,
            name,
            surname,
            date,
            currency,
            efforts,
            overpaid,
            benefit,
            bonus,
            extra,
            medical_pay,
            salary,
            sick_pay,
            total,
            vacation_pays,
            cards_1,
            cards_2,
            cards_3,
            cards_4,
            credit,
            inc_1,
            inc_2,
            inc_overpaid,
            prepayment,
          };
          targetArray.push(tRow);
        }
      }
    } else {
      return false;
    }
  };

  // Download the data
  myConnector.getData = function (table, doneCallback) {
    const {
      startDate,
      endDate,
    } = JSON.parse(tableau.connectionData);

    let tableData = [];

    $.getJSON(createURL(startDate, endDate), (jsonData) => {
      const { employees } = jsonData;

      employees.forEach((row) => {
        transformToTableRows(row, tableData);
      });

      tableData = tableData.sort((a, b) => (Date.parse(a.date) - Date.parse(b.date)));

      table.appendRows(tableData);
      doneCallback();
    });
  };

  tableau.registerConnector(myConnector);

  // Create event listeners for when the user submits the form
  $(document).ready(() => {
    $('.month-picker__input').datepicker();
    $('#submitButton').click(() => {
      const errorAlert = $('body #errorMsg');
      if (errorAlert.length > 0) {
        errorAlert.remove();
      }
      const dateObj = {
        startDate: $('#startDate').val().trim(),
        endDate: $('#endDate').val().trim(),
      };

      function isValidDate(dateStr) {
        const d = new Date(dateStr);
        return !isNaN(d.getDate());
      }

      if (isValidDate(dateObj.startDate) && isValidDate(dateObj.endDate)) {
        tableau.connectionData = JSON.stringify(dateObj);
        tableau.connectionName = 'Salary viewer';
        tableau.submit();
      } else {
        const errorMsg = `
          <div id="errorMsg" class="alert alert-danger" role="alert">
            Enter valid dates. For example, 2016-05-08.
          </div>
        `;
        $('#detailed-group').append(errorMsg);
      }
    });
  });
}());
