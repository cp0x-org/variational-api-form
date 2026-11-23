/** @OnlyCurrentDoc */

function getAddressesSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('addresses') || ss.insertSheet('addresses');
  const header = sheet.getRange('A1');
  if (header.getValue() === '') {
    header.setValue('address');
  }
  sheet.getRange('A:A').setNumberFormat('@');
  return sheet;
}

function jsonResponse_(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function setup() {
  getAddressesSheet_();
}

function doGet() {
  return jsonResponse_({ ok: true });
}

function doPost(e) {
  let data;
  try {
    const body = e && e.postData && e.postData.contents;
    data = JSON.parse(body);
  } catch {
    return jsonResponse_({ ok: false, error: 'bad_address' });
  }

  const address = typeof data?.address === 'string' ? data.address.trim().toLowerCase() : '';
  if (!/^0x[0-9a-f]{40}$/.test(address)) {
    return jsonResponse_({ ok: false, error: 'bad_address' });
  }

  try {
    const lock = LockService.getScriptLock();
    if (!lock.tryLock(10000)) {
      return jsonResponse_({ ok: false, error: 'busy' });
    }

    try {
      const sheet = getAddressesSheet_();
      const last = sheet.getLastRow();
      const exists = last >= 2 && sheet.getRange(2, 1, last - 1, 1).getValues()
        .some(([cell]) => String(cell).trim().toLowerCase() === address);
      if (!exists) {
        sheet.appendRow([address]);
      }
      // Commit pending sheet writes before letting another request check for duplicates.
      SpreadsheetApp.flush?.();
    } finally {
      lock.releaseLock();
    }

    return jsonResponse_({ ok: true });
  } catch {
    return jsonResponse_({ ok: false, error: 'server' });
  }
}
