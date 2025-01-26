(function() {
  'use strict';

  const Util = NS.Util;

  const Main = {
    contactForm() {
      const form = document.getElementById('form-contact');
      const submit = document.querySelector('#form-contact-submit button');
      let prevent = false;

      Util.addEvent(form, 'submit', async (evt) => {
        evt.preventDefault();
        if (prevent) return;
        prevent = true;

        submit.textContent = '送信中...';
        submit.disabled = true;

        const url = 'https://script.google.com/macros/s/AKfycbzgqTYLZYqcVLYZvqJndtL7BEx6aXRuimDTjhFEvhlUnepnEq5N61_6owKy2CTbDwd7bw/exec';
        const response = await Util.fetchPost(url, form, {mode: 'no-cors'});

        const fields = form.querySelectorAll('input, textarea');
        fields.forEach(field => field.readOnly = true);

        const submitParent = submit.parentNode;
        submit.remove();
        const text = 'お問い合わせを送信しました。';
        Util.createElement('p', { textContent: text }, submitParent);
      });
    },
  };

  Util.addEvent(document, 'DOMContentLoaded', () => {
    Util.execObjectRoutine(Main);
  });
}());
