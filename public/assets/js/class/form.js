(function() {
  'use strict';

  const Util = NS.Util;

  const Main = {
    preventSubmitByEnterKey() {
      const formList = document.querySelectorAll('form:not([data-enable-enter="true"])');

      formList.forEach(form => {
        const button = Util.createElement('button', { type: 'submit', disabled: '', style: 'display: none', textContent: 'Prevent-Submit-by-Enter-key' });
        form.prepend(button);
      });
    },
    dataExtBirthdayDate() {
      const inputList = document.querySelectorAll('input[data-ext="birthday-date"]');

      inputList.forEach(input => {
        const nativeInput = input;
        input.hidden = true;
        const dateInput = Util.createElement('input', { id: input.id, type: 'text' });
        input.parentNode.prepend(dateInput);

        dateInput.value = nativeInput.value;

        const pattern = Util.RegExp.pattern.date;
        dateInput.setAttribute('pattern', pattern);

        const di = input.closest('.mod-FieldDi');
        if (di != null) {
          const message = '例：19800101 または 1980-01-01';
          const descriptionBlock = di.querySelector('dd.descriptionBlock');
          const ul = descriptionBlock.querySelector('ul') ?? Util.createElement('ul', { class: 'descriptionMessages' }, descriptionBlock);
          const li = Util.createElement('li', { textContent: message }, ul);
        }

        Util.addEvent(dateInput, 'blur', () => {
          const date = dateInput.value.match(pattern)?.groups;
          if (dateInput.value === '') nativeInput.value = '';
          if (date == null) return;
          const clampedDate = Util.dateTime.clampMap(date);
          dateInput.value = Util.sprintf('%s-%s-%s', clampedDate.year, clampedDate.month, clampedDate.day);
          nativeInput.value = dateInput.value;
        });
      });
    },
    dataPatternRef() {
      const inputList = document.querySelectorAll('input[data-pattern-ref]');

      inputList.forEach(input => {
        const refId = input.getAttribute('data-pattern-ref');
        const refInput = document.getElementById(refId);
        if (refInput == null) return;

        Util.addEvent(refInput, 'input', () => {
          input.setAttribute('pattern', Util.RegExp.escape(refInput.value));
        });

        Util.triggerEvent(refInput, 'input');
      });
    },
    validateMessage() {
      const inputList = document.querySelectorAll('input[pattern]');

      inputList.forEach(input => {
        const validityState = input.validity;
        const di = input.closest('.mod-FieldDi');
        if (di == null) return;
        const errorBlock = di.querySelector('dd.errorBlock');
        let errorMessage = null;
        const pattern = input.pattern;

        function setMessage(message) {
          input.setCustomValidity(message);
          errorMessage = message;
        }

        function hideMessage() {
          if (Util.dateTime.isElapsed({ second: 3 })) {
            errorBlock.innerHTML = '';
          }
        }

        function showMessage() {
          hideMessage();
          if (Util.empty(errorMessage)) return;
          Util.createElement('p', { textContent: errorMessage }, errorBlock);
        }

        Util.addEvent(input, 'input', () => {
          if (validityState.patternMismatch) {
            if (pattern === Util.RegExp.pattern.mailAddress) {
              setMessage('「ローカルパート（@の左側）」「@」「ドメイン名」が必要です。');
            }
            if (pattern === Util.RegExp.pattern.date) {
              setMessage('年月日は8桁の数字で入力してください。');
            }
            if (pattern === Util.RegExp.pattern.numberWithHyphen) {
              setMessage('数字とハイフン(-)のみが記入できます。');
            }
            if (pattern === '.{8,}') {
              setMessage('このフィールドは、8文字以上でなければなりません。');
            }
            if (input.getAttribute('data-pattern-ref')) {
              const refLabel = input.getAttribute('data-pattern-ref-label') ?? input.getAttribute('data-pattern-ref');
              setMessage(`${refLabel}フィールドと値が一致していません。`);
            }
          }
          else {
            setMessage('');
          }
        });

        Util.addEvent(input, 'focus', () => {
          hideMessage();
        });
        Util.addEvent(input, 'blur', () => {
          showMessage();
        });
      });
    },
  };

  Util.addEvent(document, 'DOMContentLoaded', () => {
    Util.execObjectRoutine(Main);
  });
}());
