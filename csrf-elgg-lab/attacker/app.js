import { assertLocalTarget, buildBody, requestOptions } from './request.mjs';
const $ = id => document.getElementById(id);
const log = message => { $('status').textContent = message; };
function config() {
  if (!$('observed').checked) throw new Error('Cần xác nhận đã bắt request thực tế trong Network.');
  const url = assertLocalTarget($('endpoint').value.trim());
  const body = buildBody({ studentId: $('studentId').value.trim(), fields: JSON.parse($('fields').value) });
  return { url, body };
}
function preview({ url, body }) {
  $('previewText').textContent = `POST ${url.href}\nmode: ${$('mode').value}\ncredentials: include\nContent-Type: do URLSearchParams tạo\n\n${body.toString()}\n\nCookie do trình duyệt quyết định; token không được nhập.`;
}
$('preview').addEventListener('click', () => { try { preview(config()); } catch (error) { log(error.message); } });
$('echo').addEventListener('click', async () => {
  try {
    const body = buildBody({ studentId: $('studentId').value.trim(), fields: [['description', '']] });
    $('previewText').textContent = `POST ${location.origin}/echo\n${body}`;
    const response = await fetch('/echo', { method: 'POST', body, credentials: 'omit' });
    if (!response.ok) throw new Error(`Echo HTTP ${response.status}`);
    log(`TC-02: endpoint thử nghiệm trả lời:\n${JSON.stringify(await response.json(), null, 2)}\nĐây chưa phải kết quả Elgg.`);
  } catch (error) { log(`Echo không hoàn tất: ${error.message}`); }
});
$('send').addEventListener('click', async () => {
  const button = $('send');
  try {
    const request = config(); preview(request); button.disabled = true;
    log('Đang gửi request từ origin hiện tại. Mở Network để quan sát.');
    const response = await fetch(request.url, requestOptions(request.body, $('mode').value));
    log(response.type === 'opaque'
      ? 'Response opaque: JavaScript không đọc được status/body. Chưa biết Elgg có thay đổi hay không; kiểm tra lại profile Alice.'
      : `Đọc được response: HTTP ${response.status}; type=${response.type}; redirected=${response.redirected}. Chưa xác nhận thay đổi profile; mở Elgg để đối chiếu.`);
  } catch (error) {
    log(`Không đọc được phản hồi: ${error.message}\nCó thể do CORS, mạng, CSP hoặc chính sách trình duyệt. Request có thể đã tới server. Kiểm tra Network: POST/OPTIONS, cookie gửi hay bị chặn; mở Elgg để xem thông báo token và About me.`);
  } finally { button.disabled = false; }
});
fetch('/config.json', { credentials: 'omit' }).then(r => r.json()).then(c => { $('studentId').value = c.studentId; }).catch(() => {});
