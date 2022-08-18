const url = '/cyoa';

$('#myform').submit(
  const files = document.querySelector('[type=file]').files;
  const formData = new FormData();

  for(let i = 0; i < files.length; i++) {
    let file = files[i];
    formData.append('files[]', file);
  }

  fetch(url, {
    method: 'POST',
    body: formData,
  });
);